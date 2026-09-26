import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';

const ThemeSelector = () => {
  const { theme, setThemeMode } = useTheme();

  const themeOptions = [
    {
      id: 'light',
      label: 'Light Mode',
      description: 'Clean and bright interface',
      icon: 'Sun',
      preview: 'bg-white border-gray-200',
      textColor: 'text-gray-900',
      subtextColor: 'text-gray-500',
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      description: 'Easy on the eyes in low light',
      icon: 'Moon',
      preview: 'bg-gray-900 border-gray-700',
      textColor: 'text-white',
      subtextColor: 'text-gray-400',
    },
    {
      id: 'auto',
      label: 'Auto (System)',
      description: 'Follows your system preference',
      icon: 'Monitor',
      preview: 'bg-gradient-to-br from-white to-gray-900 border-gray-400',
      textColor: 'text-gray-900',
      subtextColor: 'text-gray-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-lg font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Theme Mode
        </h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Choose your preferred theme mode for the Onura interface
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themeOptions.map((option) => (
          <motion.div
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
              theme === option.id
                ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
                : theme === 'dark' ?'border-gray-700 hover:border-gray-600' :'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setThemeMode(option.id)}
          >
            {/* Selected indicator */}
            {theme === option.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Icon name="Check" size={12} className="text-white" />
              </div>
            )}

            {/* Preview */}
            <div className={`w-full h-24 rounded-lg border-2 mb-4 ${option.preview} flex items-center justify-center`}>
              <Icon name={option.icon} size={24} className={option.textColor} />
            </div>

            {/* Content */}
            <div>
              <h3 className={`font-medium mb-1 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {option.label}
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {option.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Settings */}
      <div className={`border-t pt-6 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`font-medium mb-3 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Theme Preferences
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Sync across devices
            </span>
            <button className={`w-10 h-6 rounded-full relative transition-colors ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Apply to mobile app
            </span>
            <button className={`w-10 h-6 rounded-full relative transition-colors ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;