import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';

const ColorCustomizer = () => {
  const { theme, colorTheme, updateColorTheme, colorThemes, customColors, updateCustomColors } = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColorType, setActiveColorType] = useState('primary');

  const handleColorChange = (colorType, color) => {
    updateCustomColors({ [colorType]: color });
    if (colorTheme !== 'custom') {
      updateColorTheme('custom');
    }
  };

  const colorTypes = [
    { key: 'primary', label: 'Primary', description: 'Main brand color' },
    { key: 'secondary', label: 'Secondary', description: 'Supporting color' },
    { key: 'accent', label: 'Accent', description: 'Highlight color' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-lg font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Color Themes
        </h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Choose from predefined themes or create your own custom color palette
        </p>
      </div>

      {/* Predefined Themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(colorThemes).map(([key, colors]) => (
          <motion.div
            key={key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
              colorTheme === key
                ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
                : theme === 'dark' ?'border-gray-700 hover:border-gray-600' :'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => updateColorTheme(key)}
          >
            {/* Selected indicator */}
            {colorTheme === key && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Icon name="Check" size={12} className="text-white" />
              </div>
            )}

            {/* Color Preview */}
            <div className="flex space-x-2 mb-3">
              <div 
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: colors.primary }}
              />
              <div 
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: colors.secondary }}
              />
              <div 
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: colors.accent }}
              />
            </div>

            {/* Theme Name */}
            <h3 className={`font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {colors.name}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* Custom Color Editor */}
      <div className={`border-t pt-6 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`font-medium mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Custom Colors
        </h3>

        <div className="space-y-4">
          {colorTypes.map((colorType) => (
            <div key={colorType.key} className="flex items-center justify-between">
              <div>
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {colorType.label}
                </label>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {colorType.description}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                  style={{ backgroundColor: customColors[colorType.key] }}
                  onClick={() => {
                    setActiveColorType(colorType.key);
                    setShowColorPicker(true);
                  }}
                />
                <input
                  type="color"
                  value={customColors[colorType.key]}
                  onChange={(e) => handleColorChange(colorType.key, e.target.value)}
                  className="w-8 h-8 rounded border-none cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Color Picker Modal */}
        {showColorPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-lg max-w-md w-full mx-4 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Choose {activeColorType} Color
                </h3>
                <button
                  onClick={() => setShowColorPicker(false)}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="color"
                  value={customColors[activeColorType]}
                  onChange={(e) => handleColorChange(activeColorType, e.target.value)}
                  className="w-full h-32 rounded border-none cursor-pointer"
                />
                <input
                  type="text"
                  value={customColors[activeColorType]}
                  onChange={(e) => handleColorChange(activeColorType, e.target.value)}
                  placeholder="#000000"
                  className={`w-full px-3 py-2 rounded border ${
                    theme === 'dark' ?'bg-gray-700 border-gray-600 text-white' :'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorCustomizer;