/**
 * Utility functions for handling various types of errors
 */

/**
 * Determines if an error is a rate limit error
 * @param {Error} error - The error to check
 * @returns {boolean} True if it's a rate limit error
 */
export const isRateLimitError = (error) => {
  return error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
};

/**
 * Determines if an error is a network error
 * @param {Error} error - The error to check
 * @returns {boolean} True if it's a network error
 */
export const isNetworkError = (error) => {
  return error?.message?.includes('fetch') || error?.message?.includes('network') || error?.code === 'NETWORK_ERROR';
};

/**
 * Determines if an error is an authentication error
 * @param {Error} error - The error to check
 * @returns {boolean} True if it's an authentication error
 */
export const isAuthError = (error) => {
  return error?.status === 401 || error?.message?.includes('401') || error?.message?.includes('authentication');
};

/**
 * Gets a user-friendly error message based on the error type
 * @param {Error} error - The error to get message for
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (isRateLimitError(error)) {
    return 'AI service is temporarily unavailable due to high demand. Please try again in a few minutes or check your subscription plan.';
  }
  
  if (isAuthError(error)) {
    return 'Authentication failed. Please check your API configuration.';
  }
  
  if (isNetworkError(error)) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  if (error?.status === 500) {
    return 'AI service is temporarily unavailable. Please try again later.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Logs error details for debugging purposes
 * @param {Error} error - The error to log
 * @param {string} context - Additional context about where the error occurred
 */
export const logError = (error, context = '') => {
  console.error(`Error in ${context}:`, {
    message: error?.message,
    status: error?.status,
    stack: error?.stack,
    error
  });
};