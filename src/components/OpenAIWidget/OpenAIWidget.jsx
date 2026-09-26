import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../AppIcon';
import { useWidget } from '../../contexts/WidgetContext';
import { useTheme } from '../../contexts/ThemeContext';
import ChatInterface from './ChatInterface';
import ImageGenerator from './ImageGenerator';
import HashtagGenerator from './HashtagGenerator';

const OpenAIWidget = () => {
  const { widgetSettings, minimizeWidget, maximizeWidget, closeWidget, setActiveTab, toggleWidget } = useWidget();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const { position, isMinimized, isMaximized, isVisible, activeTab } = widgetSettings;

  // Ensure widget opens in chat mode when clicked from sidebar
  useEffect(() => {
    if (isVisible && !isMinimized && activeTab !== 'chat') {
      setActiveTab('chat');
    }
  }, [isVisible, isMinimized, activeTab, setActiveTab]);

  if (!isVisible) return null;

  // Use the saved position settings from profile with mobile adjustments
  const positionClasses = position === 'left' ? 'left-4 bottom-4' : 'right-4 bottom-4';
  // Updated mobile positioning to ensure proper spacing from bottom navigation (64px + 16px padding)
  const mobilePositionClasses = position === 'left' ? 'left-4 bottom-20' : 'right-4 bottom-20';
  const maximizedClasses = isMaximized ? 'inset-4' : `${positionClasses} lg:${positionClasses}`;
  const responsiveClasses = isMaximized ? 'inset-4' : `${mobilePositionClasses} lg:${positionClasses}`;

  const tabs = [
    { id: 'chat', label: 'Chat', icon: 'MessageCircle' },
    { id: 'image', label: 'Image', icon: 'Image' },
    { id: 'hashtags', label: 'Tags', icon: 'Hash' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatInterface setIsLoading={setIsLoading} />;
      case 'image':
        return <ImageGenerator setIsLoading={setIsLoading} />;
      case 'hashtags':
        return <HashtagGenerator setIsLoading={setIsLoading} />;
      default:
        return <ChatInterface setIsLoading={setIsLoading} />;
    }
  };

  return (
    <div className={`fixed ${responsiveClasses} z-50`}>
      <AnimatePresence>
        {isMinimized ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={`relative w-14 h-14 rounded-full shadow-lg cursor-pointer flex items-center justify-center ${
              theme === 'dark' ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
            }`}
            onClick={minimizeWidget}
          >
            {/* Colorful circular gradient background - Meta AI style */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400 via-blue-500 via-purple-500 via-pink-500 via-orange-400 to-yellow-400 p-0.5">
              <div className={`w-full h-full rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <img 
                  src="/assets/images/Onura-1751651737342.png" 
                  alt="AI Assistant" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
            </div>
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`${
              isMaximized ? 'w-full h-full' : 'w-80 h-96'
            } rounded-lg shadow-xl border overflow-hidden ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`p-3 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center space-x-2">
                {/* Colorful circular gradient icon */}
                <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 via-blue-500 via-purple-500 via-pink-500 via-orange-400 to-yellow-400 p-0.5">
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <img 
                      src="/assets/images/Onura-1751651737342.png" 
                      alt="AI Assistant" 
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  AI Assistant
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={minimizeWidget}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    theme === 'dark' ? 'hover:bg-gray-600 text-gray-300' : 'text-gray-600'
                  }`}
                  title="Minimize"
                >
                  <Icon name="Minus" size={16} />
                </button>
                <button
                  onClick={maximizeWidget}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    theme === 'dark' ? 'hover:bg-gray-600 text-gray-300' : 'text-gray-600'
                  }`}
                  title={isMaximized ? "Restore" : "Maximize"}
                >
                  <Icon name={isMaximized ? "Minimize2" : "Maximize2"} size={16} />
                </button>
                <button
                  onClick={closeWidget}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    theme === 'dark' ? 'hover:bg-gray-600 text-gray-300' : 'text-gray-600'
                  }`}
                  title="Close"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className={`flex border-b ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? theme === 'dark' ? 'bg-gray-700 text-white border-b-2 border-primary' : 'bg-white text-gray-900 border-b-2 border-primary'
                      : theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon name={tab.icon} size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="h-full overflow-hidden">
              {renderActiveTab()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OpenAIWidget;