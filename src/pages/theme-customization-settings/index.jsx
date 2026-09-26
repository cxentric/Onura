import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Icon from '../../components/AppIcon';
import ThemeSelector from './components/ThemeSelector';
import ColorCustomizer from './components/ColorCustomizer';
import AvatarCreator from './components/AvatarCreator';
import AccessibilitySettings from './components/AccessibilitySettings';
import PreviewPanel from './components/PreviewPanel';

const ThemeCustomizationSettings = () => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('theme');

  const sections = [
    { id: 'theme', label: 'Theme Mode', icon: 'Palette' },
    { id: 'colors', label: 'Color Themes', icon: 'Paintbrush' },
    { id: 'avatar', label: 'Avatar Creator', icon: 'User' },
    { id: 'accessibility', label: 'Accessibility', icon: 'Eye' },
    { id: 'preview', label: 'Preview', icon: 'Monitor' },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'theme':
        return <ThemeSelector />;
      case 'colors':
        return <ColorCustomizer />;
      case 'avatar':
        return <AvatarCreator />;
      case 'accessibility':
        return <AccessibilitySettings />;
      case 'preview':
        return <PreviewPanel />;
      default:
        return <ThemeSelector />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Theme & Customization - cxentric</title>
        <meta name="description" content="Customize your cxentric experience with themes, colors, and personalization options" />
      </Helmet>

      <div className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {/* Header */}
        <div className={`border-b ${
          theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.history.back()}
                  className={`p-2 rounded-lg hover:bg-gray-100 ${
                    theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'text-gray-600'
                  }`}
                >
                  <Icon name="ArrowLeft" size={20} />
                </button>
                <div>
                  <h1 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Theme & Customization
                  </h1>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Personalize your cxentric experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? theme === 'dark' ?'bg-blue-900 text-blue-200' :'bg-blue-50 text-blue-700'
                        : theme === 'dark' ?'text-gray-300 hover:bg-gray-800' :'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon name={section.icon} size={20} />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-lg border p-6 ${
                  theme === 'dark' ?'bg-gray-800 border-gray-700' :'bg-white border-gray-200'
                }`}
              >
                {renderActiveSection()}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThemeCustomizationSettings;