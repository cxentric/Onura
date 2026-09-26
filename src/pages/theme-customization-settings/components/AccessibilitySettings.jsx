import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Icon from '../../../components/AppIcon';

const AccessibilitySettings = () => {
  const { theme, accessibility, updateAccessibility } = useTheme();

  const fontSizes = [
    { id: 'small', label: 'Small', size: '14px' },
    { id: 'medium', label: 'Medium', size: '16px' },
    { id: 'large', label: 'Large', size: '18px' },
  ];

  const toggleSetting = (setting) => {
    updateAccessibility({ [setting]: !accessibility[setting] });
  };

  const handleFontSizeChange = (size) => {
    updateAccessibility({ fontSize: size });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-lg font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Accessibility Settings
        </h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Customize the interface for better accessibility
        </p>
      </div>

      {/* High Contrast */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            High Contrast
          </h3>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Increase contrast for better visibility
          </p>
        </div>
        <button
          onClick={() => toggleSetting('highContrast')}
          className={`w-12 h-6 rounded-full relative transition-colors ${
            accessibility.highContrast
              ? 'bg-blue-500'
              : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
              accessibility.highContrast ? 'transform translate-x-7' : 'transform translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Reduced Motion */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Reduced Motion
          </h3>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Minimize animations and transitions
          </p>
        </div>
        <button
          onClick={() => toggleSetting('reducedMotion')}
          className={`w-12 h-6 rounded-full relative transition-colors ${
            accessibility.reducedMotion
              ? 'bg-blue-500'
              : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
              accessibility.reducedMotion ? 'transform translate-x-7' : 'transform translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Font Size */}
      <div>
        <h3 className={`font-medium mb-3 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Font Size
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {fontSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => handleFontSizeChange(size.id)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                accessibility.fontSize === size.id
                  ? 'border-blue-500 bg-blue-50'
                  : theme === 'dark' ?'border-gray-700 hover:border-gray-600' :'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`} style={{ fontSize: size.size }}>
                Aa
              </div>
              <div className={`text-xs mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {size.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className={`border-t pt-6 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`font-medium mb-3 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Preview
        </h3>
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ?'bg-gray-700 border-gray-600' :'bg-gray-50 border-gray-200'
        }`}>
          <div className={`font-medium mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Sample Text
          </div>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            This is how your text will appear with the current accessibility settings. 
            You can adjust the font size and contrast to improve readability.
          </p>
        </div>
      </div>

      {/* Additional Options */}
      <div className={`border-t pt-6 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`font-medium mb-3 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Additional Options
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Icon name="Volume2" size={16} className={
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            } />
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Screen reader compatible
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Icon name="Keyboard" size={16} className={
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            } />
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Keyboard navigation support
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Icon name="Focus" size={16} className={
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            } />
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Enhanced focus indicators
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;