import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';


const RegisterForm = ({ onShowNicheSelection }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    jobTitle: '',
    company: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onShowNicheSelection();
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-2">
            First Name
          </label>
          <Input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full ${errors.firstName ? 'border-error-500 focus:ring-error-500' : ''}`}
            required
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-error-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-2">
            Last Name
          </label>
          <Input
            type="text"
            id="lastName"
            name="lastName"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full ${errors.lastName ? 'border-error-500 focus:ring-error-500' : ''}`}
            required
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-error-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
          Email Address
        </label>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full ${errors.email ? 'border-error-500 focus:ring-error-500' : ''}`}
          required
        />
        {errors.email && (
          <p className="mt-1 text-sm text-error-600">{errors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
            Password
          </label>
          <Input
            type="password"
            id="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full ${errors.password ? 'border-error-500 focus:ring-error-500' : ''}`}
            required
          />
          {errors.password && (
            <p className="mt-1 text-sm text-error-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
            Confirm Password
          </label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full ${errors.confirmPassword ? 'border-error-500 focus:ring-error-500' : ''}`}
            required
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error-600">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="jobTitle" className="block text-sm font-medium text-text-primary mb-2">
          Job Title
        </label>
        <Input
          type="text"
          id="jobTitle"
          name="jobTitle"
          placeholder="e.g., Software Engineer, Marketing Manager"
          value={formData.jobTitle}
          onChange={handleInputChange}
          className={`w-full ${errors.jobTitle ? 'border-error-500 focus:ring-error-500' : ''}`}
          required
        />
        {errors.jobTitle && (
          <p className="mt-1 text-sm text-error-600">{errors.jobTitle}</p>
        )}
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-text-primary mb-2">
          Company <span className="text-text-muted">(Optional)</span>
        </label>
        <Input
          type="text"
          id="company"
          name="company"
          placeholder="Enter your company name"
          value={formData.company}
          onChange={handleInputChange}
          className="w-full"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
        className="mt-8"
      >
        {isLoading ? 'Creating Account...' : 'Continue to Niche Selection'}
      </Button>

      <p className="text-xs text-text-muted text-center mt-4">
        By creating an account, you agree to our{' '}
        <button type="button" className="text-primary hover:underline">
          Terms of Service
        </button>{' '}
        and{' '}
        <button type="button" className="text-primary hover:underline">
          Privacy Policy
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;