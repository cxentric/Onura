import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import AuthTabs from './components/AuthTabs';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SocialLogin from './components/SocialLogin';
import NicheSelection from './components/NicheSelection';

const LoginRegister = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showNicheSelection, setShowNicheSelection] = useState(false);

  const handleShowNicheSelection = () => {
    setShowNicheSelection(true);
  };

  const handleBackToRegister = () => {
    setShowNicheSelection(false);
  };

  if (showNicheSelection) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NicheSelection onBack={handleBackToRegister} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Logo */}
      <header className="flex-shrink-0 pt-8 pb-4">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-3">
              <div className="relative">
                <img 
                  src="/assets/images/cxentric-1751655797090.png" 
                  alt="cxentric Logo" 
                  className="w-12 h-12 rounded-xl object-cover shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-12 h-12 bg-primary rounded-xl items-center justify-center shadow-lg hidden">
                  <Icon name="Network" size={24} color="white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-text-primary">
                  cxentric
                </h1>
                <p className="text-sm text-text-muted">
                  Professional Networking Reimagined
                </p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Message */}
          <div className="text-center">
            <h2 className="text-xl font-heading font-semibold text-text-primary mb-2">
              {activeTab === 'login' ? 'Welcome back!' : 'Join cxentric'}
            </h2>
            <p className="text-text-secondary">
              {activeTab === 'login' ?'Sign in to your professional network' :'Create your account and connect with industry professionals'
              }
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-surface rounded-2xl shadow-lg border border-border p-8">
            {/* Social Login */}
            <SocialLogin />

            {/* Tab Navigation */}
            <div className="mt-8">
              <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Forms */}
            <div className="mt-6">
              {activeTab === 'login' ? (
                <LoginForm />
              ) : (
                <RegisterForm onShowNicheSelection={handleShowNicheSelection} />
              )}
            </div>
          </div>

          {/* Additional Links */}
          <div className="text-center space-y-4">
            {activeTab === 'login' ? (
              <p className="text-sm text-text-muted">
                Don't have an account?{' '}
                <button
                  onClick={() => setActiveTab('register')}
                  className="text-primary hover:text-primary-700 font-medium"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-sm text-text-muted">
                Already have an account?{' '}
                <button
                  onClick={() => setActiveTab('login')}
                  className="text-primary hover:text-primary-700 font-medium"
                >
                  Sign in instead
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 py-6">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-6 text-sm text-text-muted">
            <button className="hover:text-text-secondary transition-colors">
              Privacy Policy
            </button>
            <span>•</span>
            <button className="hover:text-text-secondary transition-colors">
              Terms of Service
            </button>
            <span>•</span>
            <button className="hover:text-text-secondary transition-colors">
              Help
            </button>
          </div>
          <div className="text-center mt-4">
            <p className="text-xs text-text-muted">
              © {new Date().getFullYear()} cxentric. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginRegister;