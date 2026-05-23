import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Download, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader } from '../ui/Card';
import { toast } from 'sonner';

const BillingPage = () => {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchInvoices();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/subscription/current');
      setSubscription(response.data.data);
    } catch (error) {
      toast.error('Failed to load subscription details');
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/subscription/invoices');
      setInvoices(response.data.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await api.post('/subscription/create-portal-session');
      window.location.href = response.data.data.url;
    } catch (error) {
      toast.error('Failed to open billing portal');
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    setCanceling(true);
    try {
      await api.post('/subscription/cancel', { cancelImmediately: false });
      toast.success('Subscription will be canceled at the end of the period');
      fetchSubscription();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Billing & Subscription</h1>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Current Plan</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription?.plan === 'pro' 
                    ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700'
                    : subscription?.plan === 'enterprise'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {subscription?.plan?.charAt(0).toUpperCase() + subscription?.plan?.slice(1)} Plan
                </span>
                {subscription?.subscription?.status === 'active' && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    Active
                  </span>
                )}
              </div>
              
              {subscription?.subscription?.currentPeriodEnd && (
                <p className="text-gray-600 dark:text-gray-400">
                  Next billing date: {formatDate(subscription.subscription.currentPeriodEnd)}
                </p>
              )}
              
              {subscription?.subscription?.cancelAtPeriodEnd && (
                <p className="text-yellow-600 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Your subscription will end on {formatDate(subscription.subscription.currentPeriodEnd)}
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleManageBilling}>
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
              
              {subscription?.plan !== 'free' && !subscription?.subscription?.cancelAtPeriodEnd && (
                <Button variant="danger" onClick={handleCancelSubscription} isLoading={canceling}>
                  Cancel Subscription
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Usage Statistics</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{subscription?.usage?.resumes || 0}</p>
              <p className="text-gray-600 dark:text-gray-400">Resumes Used</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{subscription?.usage?.portfolios || 0}</p>
              <p className="text-gray-600 dark:text-gray-400">Portfolios Used</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {subscription?.usage?.aiCreditsUsed || 0}/{subscription?.usage?.aiCreditsTotal || 0}
              </p>
              <p className="text-gray-600 dark:text-gray-400">AI Credits Used</p>
              {subscription?.usage?.aiCreditsTotal > 0 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${(subscription.usage.aiCreditsUsed / subscription.usage.aiCreditsTotal) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      {subscription?.subscription?.paymentMethod && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Payment Method</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                {subscription.subscription.paymentMethod.brand === 'visa' && '💳'}
                {subscription.subscription.paymentMethod.brand === 'mastercard' && '💳'}
                {subscription.subscription.paymentMethod.brand === 'amex' && '💳'}
              </div>
              <div>
                <p className="font-medium">
                  •••• •••• •••• {subscription.subscription.paymentMethod.last4}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expires {subscription.subscription.paymentMethod.expiryMonth}/{subscription.subscription.paymentMethod.expiryYear}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice History */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Invoice History</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {formatDate(invoice.created * 1000)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {invoice.number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">
                      {formatCurrency(invoice.amount_paid, invoice.currency)}
                    </p>
                    {invoice.invoice_pdf && (
                      <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BillingPage;