import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const AuthTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex bg-secondary-50 rounded-lg p-1 mb-8">
      <Button
        variant={activeTab === 'login' ? 'primary' : 'ghost'}
        onClick={() => onTabChange('login')}
        className="flex-1 py-3 text-sm font-medium transition-all"
        fullWidth
      >
        Sign In
      </Button>
      <Button
        variant={activeTab === 'register' ? 'primary' : 'ghost'}
        onClick={() => onTabChange('register')}
        className="flex-1 py-3 text-sm font-medium transition-all"
        fullWidth
      >
        Create Account
      </Button>
    </div>
  );
};

export default AuthTabs;