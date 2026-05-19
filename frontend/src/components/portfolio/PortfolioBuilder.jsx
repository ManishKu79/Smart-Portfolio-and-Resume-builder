import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePortfolioStore } from '../../stores/portfolioStore';
import api from '../../services/api';
import { toast } from 'sonner';

const PublicPortfolio = () => {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  
  useEffect(() => {
    fetchPortfolio();
  }, [slug]);
  
  const fetchPortfolio = async () => {
    try {
      const response = await api.get(`/portfolios/public/${slug}`);
      if (response.data.requiresPassword) {
        setRequiresPassword(true);
        setPortfolio(response.data.data);
      } else {
        setPortfolio(response.data.data.portfolio);
        setUser(response.data.data.user);
      }
    } catch (error) {
      toast.error('Portfolio not found');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/portfolios/public/${portfolio._id}/verify-password`, { password });
      setAccessToken(response.data.data.accessToken);
      // Fetch protected content
      const protectedResponse = await api.get(`/portfolios/public/${portfolio._id}/protected/${response.data.data.accessToken}`);
      setPortfolio(protectedResponse.data.data.portfolio);
      setUser(protectedResponse.data.data.user);
      setRequiresPassword(false);
    } catch (error) {
      toast.error('Invalid password');
    }
  };
  
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.post(`/portfolios/public/${slug}/contact`, {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
      });
      toast.success('Message sent successfully!');
      e.target.reset();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6">Password Protected</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            This portfolio is password protected. Please enter the password to continue.
          </p>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 border rounded-lg mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
            >
              Access Portfolio
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-600">Portfolio not found</p>
        </div>
      </div>
    );
  }
  
  // Render portfolio based on theme
  const styles = {
    '--primary-color': portfolio.customization?.primaryColor || '#3B82F6',
    '--secondary-color': portfolio.customization?.secondaryColor || '#10B981'
  };
  
  const renderSection = (section) => {
    switch (section.type) {
      case 'about':
        return (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
            <div className="prose max-w-none">
              <p>{section.content?.description}</p>
            </div>
          </div>
        );
      
      case 'skills':
        return (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
            <div className="flex flex-wrap gap-3">
              {(section.content?.skills || []).map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        );
      
      case 'projects':
        return (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {(section.content?.projects || []).map((project, index) => (
                <div key={index} className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      View Project →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'contact':
        return (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
            {section.content?.formEnabled !== false && (
              <form onSubmit={handleContactSubmit} className="max-w-md">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  className="w-full px-4 py-2 border rounded-lg mb-4"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-2 border rounded-lg mb-4"
                  required
                />
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg mb-4"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                >
                  Send Message
                </button>
              </form>
            )}
            {section.content?.email && (
              <p className="mt-4">
                Email: <a href={`mailto:${section.content.email}`} className="text-primary-600">{section.content.email}</a>
              </p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div style={styles} className="min-h-screen">
      {/* Header */}
      <header className={`bg-white dark:bg-gray-900 shadow-sm ${portfolio.customization?.navbarStyle === 'sticky' ? 'sticky top-0' : ''}`}>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">{portfolio.title}</h1>
          {portfolio.description && (
            <p className="text-center text-gray-600 mt-2">{portfolio.description}</p>
          )}
        </div>
      </header>
      
      {/* Hero Section */}
      {user && (
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">{user.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <h2 className="text-2xl font-semibold">{user.name}</h2>
          {user.bio && <p className="text-gray-600 mt-2">{user.bio}</p>}
        </div>
      )}
      
      {/* Sections */}
      <main className="container mx-auto px-4 py-12">
        {portfolio.sections
          .filter(s => s.isEnabled)
          .sort((a, b) => a.order - b.order)
          .map(section => (
            <div key={section._id}>
              {renderSection(section)}
            </div>
          ))}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} {user?.name || portfolio.title}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortfolio;