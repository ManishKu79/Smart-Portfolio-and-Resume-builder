import React, { useState, useEffect } from 'react';
import { Check, X, Sparkles, CreditCard } from 'lucide-react';
import api from '../../services/api';
import Button from '../ui/Button';
import Card, { CardContent } from '../ui/Card';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';

const PricingPage = () => {
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscription/plans');
      setPlans(response.data.data);
    } catch (error) {
      toast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe');
      return;
    }

    try {
      const priceId = billingCycle === 'monthly' 
        ? plan.stripePriceId?.monthly 
        : plan.stripePriceId?.yearly;
      
      const response = await api.post('/subscription/create-checkout-session', {
        priceId,
        successUrl: `${window.location.origin}/dashboard?subscription=success`,
        cancelUrl: `${window.location.origin}/pricing`
      });

      // Redirect to Stripe checkout
      window.location.href = response.data.data.url;
    } catch (error) {
      toast.error('Failed to start checkout process');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. All plans include core features.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-gray-900 shadow-sm text-primary-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-gray-900 shadow-sm text-primary-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
            const isPopular = plan.name === 'pro';
            const isCurrentPlan = user?.subscriptionTier === plan.name;

            return (
              <div key={plan.name} className="relative">
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <Card className={`h-full ${isPopular ? 'border-2 border-primary-500 shadow-xl' : ''}`}>
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">{plan.displayName}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
                    </div>
                    
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold">
                        ${price}
                        <span className="text-lg font-normal text-gray-500">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && plan.price.monthly > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          Save ${(plan.price.monthly * 12 - price).toFixed(2)} annually
                        </p>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleSubscribe(plan)}
                      variant={isPopular ? 'primary' : 'outline'}
                      className="w-full mb-8"
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? 'Current Plan' : price === 0 ? 'Get Started' : 'Subscribe Now'}
                    </Button>
                    
                    <div className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className={feature.included ? '' : 'text-gray-500'}>
                              {feature.name}
                            </span>
                            {feature.limit > 0 && (
                              <span className="text-sm text-gray-500 ml-1">
                                ({feature.limit === -1 ? 'Unlimited' : feature.limit})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-8">Compare Features</h2>
          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Feature</th>
                  {plans.map(plan => (
                    <th key={plan.name} className="text-center p-4">{plan.displayName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(plans[0]?.limits || {}).map(feature => (
                  <tr key={feature} className="border-b">
                    <td className="p-4 font-medium">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </td>
                    {plans.map(plan => (
                      <td key={plan.name} className="text-center p-4">
                        {plan.limits[feature] === -1 ? (
                          <span className="text-green-600">✓ Unlimited</span>
                        ) : plan.limits[feature] ? (
                          plan.limits[feature]
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Have questions? Contact our support team for assistance.
          </p>
          <Button variant="outline" className="mt-4">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;