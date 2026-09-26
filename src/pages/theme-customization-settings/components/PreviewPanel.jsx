import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Icon from '../../../components/AppIcon';

const PreviewPanel = () => {
  const { theme, getCurrentColors } = useTheme();
  const currentColors = getCurrentColors();

  const mockComponents = [
    {
      type: 'header',
      content: 'cxentric Dashboard',
    },
    {
      type: 'card',
      title: 'Recent Activity',
      content: 'Your latest networking updates and connections',
    },
    {
      type: 'button',
      variant: 'primary',
      content: 'Connect',
    },
    {
      type: 'button',
      variant: 'secondary',
      content: 'Message',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-lg font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Preview
        </h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          See how your customizations look across different screen sizes
        </p>
      </div>

      {/* Device Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desktop Preview */}
        <div className="space-y-4">
          <h3 className={`font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Desktop View
          </h3>
          <div className={`w-full h-64 rounded-lg border-2 p-4 overflow-hidden ${
            theme === 'dark' ?'bg-gray-800 border-gray-700' :'bg-white border-gray-200'
          }`}>
            {/* Mock Desktop Interface */}
            <div className={`h-8 rounded mb-4 flex items-center px-3 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`} style={{ backgroundColor: currentColors?.primary }}>
              <div className="text-white text-sm font-medium">cxentric</div>
            </div>
            
            <div className="space-y-3">
              <div className={`h-16 rounded border p-3 ${
                theme === 'dark' ?'bg-gray-700 border-gray-600' :'bg-gray-50 border-gray-200'
              }`}>
                <div className={`text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Professional Update
                </div>
                <div className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Latest networking activity
                </div>
              </div>
              
              <div className="flex space-x-2">
                <div 
                  className="h-6 px-3 rounded text-xs text-white flex items-center"
                  style={{ backgroundColor: currentColors?.primary }}
                >
                  Connect
                </div>
                <div 
                  className="h-6 px-3 rounded text-xs border flex items-center"
                  style={{ 
                    borderColor: currentColors?.secondary,
                    color: currentColors?.secondary
                  }}
                >
                  Message
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Preview */}
        <div className="space-y-4">
          <h3 className={`font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Mobile View
          </h3>
          <div className={`w-48 h-64 rounded-lg border-2 p-2 overflow-hidden mx-auto ${
            theme === 'dark' ?'bg-gray-800 border-gray-700' :'bg-white border-gray-200'
          }`}>
            {/* Mock Mobile Interface */}
            <div className={`h-6 rounded mb-2 flex items-center px-2 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`} style={{ backgroundColor: currentColors?.primary }}>
              <div className="text-white text-xs font-medium">cxentric</div>
            </div>
            
            <div className="space-y-2">
              <div className={`h-12 rounded border p-2 ${
                theme === 'dark' ?'bg-gray-700 border-gray-600' :'bg-gray-50 border-gray-200'
              }`}>
                <div className={`text-xs font-medium mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Update
                </div>
                <div className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Activity
                </div>
              </div>
              
              <div className="flex space-x-1">
                <div 
                  className="h-4 px-2 rounded text-xs text-white flex items-center"
                  style={{ backgroundColor: currentColors?.primary }}
                >
                  Connect
                </div>
                <div 
                  className="h-4 px-2 rounded text-xs border flex items-center"
                  style={{ 
                    borderColor: currentColors?.secondary,
                    color: currentColors?.secondary
                  }}
                >
                  Message
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Palette Display */}
      <div className={`border-t pt-6 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`font-medium mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Current Color Palette
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-white shadow-lg"
              style={{ backgroundColor: currentColors?.primary }}
            />
            <div className={`text-xs font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Primary
            </div>
            <div className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {currentColors?.primary}
            </div>
          </div>
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-white shadow-lg"
              style={{ backgroundColor: currentColors?.secondary }}
            />
            <div className={`text-xs font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Secondary
            </div>
            <div className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {currentColors?.secondary}
            </div>
          </div>
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-white shadow-lg"
              style={{ backgroundColor: currentColors?.accent }}
            />
            <div className={`text-xs font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Accent
            </div>
            <div className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {currentColors?.accent}
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className={`border-t pt-6 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`font-medium mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Export Settings
        </h3>
        <div className="flex space-x-3">
          <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
            theme === 'dark' ?'border-gray-700 hover:border-gray-600 text-gray-300' :'border-gray-200 hover:border-gray-300 text-gray-700'
          }`}>
            <Icon name="Download" size={16} />
            <span>Export Theme</span>
          </button>
          <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
            theme === 'dark' ?'border-gray-700 hover:border-gray-600 text-gray-300' :'border-gray-200 hover:border-gray-300 text-gray-700'
          }`}>
            <Icon name="Share" size={16} />
            <span>Share Theme</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;