import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

import Icon from '../../../components/AppIcon';

const AvatarCreator = () => {
  const { theme } = useTheme();
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [customizationStep, setCustomizationStep] = useState('style');
  const [avatarConfig, setAvatarConfig] = useState({
    style: 'professional',
    skinTone: 'light',
    hair: 'short',
    hairColor: 'brown',
    clothing: 'business',
    accessories: 'none',
    background: 'solid',
  });

  const avatarStyles = [
    { id: 'professional', label: 'Professional', icon: 'Briefcase' },
    { id: 'casual', label: 'Casual', icon: 'Shirt' },
    { id: 'creative', label: 'Creative', icon: 'Palette' },
    { id: 'minimal', label: 'Minimal', icon: 'Circle' },
  ];

  const skinTones = [
    { id: 'light', color: '#FDBCB4' },
    { id: 'medium-light', color: '#F1C27D' },
    { id: 'medium', color: '#E0AC69' },
    { id: 'medium-dark', color: '#C68642' },
    { id: 'dark', color: '#8D5524' },
  ];

  const hairStyles = [
    { id: 'short', label: 'Short' },
    { id: 'medium', label: 'Medium' },
    { id: 'long', label: 'Long' },
    { id: 'curly', label: 'Curly' },
    { id: 'bald', label: 'Bald' },
  ];

  const hairColors = [
    { id: 'black', color: '#1C1C1C' },
    { id: 'brown', color: '#6B4423' },
    { id: 'blonde', color: '#FAD5A5' },
    { id: 'red', color: '#CB4154' },
    { id: 'gray', color: '#9CA3AF' },
  ];

  const clothingOptions = [
    { id: 'business', label: 'Business Suit' },
    { id: 'casual', label: 'Casual Shirt' },
    { id: 'creative', label: 'Creative Wear' },
    { id: 'hoodie', label: 'Hoodie' },
  ];

  const accessoryOptions = [
    { id: 'none', label: 'None' },
    { id: 'glasses', label: 'Glasses' },
    { id: 'sunglasses', label: 'Sunglasses' },
    { id: 'hat', label: 'Hat' },
  ];

  const steps = [
    { id: 'style', label: 'Style', icon: 'Palette' },
    { id: 'appearance', label: 'Appearance', icon: 'User' },
    { id: 'clothing', label: 'Clothing', icon: 'Shirt' },
    { id: 'finish', label: 'Finish', icon: 'Check' },
  ];

  const generateAvatar = () => {
    // In a real implementation, this would generate an avatar based on the configuration
    // For now, we'll create a simple placeholder
    const avatarSvg = `
      <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="60" fill="${skinTones.find(t => t.id === avatarConfig.skinTone)?.color || '#FDBCB4'}"/>
        <circle cx="60" cy="45" r="35" fill="${skinTones.find(t => t.id === avatarConfig.skinTone)?.color || '#FDBCB4'}"/>
        <circle cx="50" cy="40" r="3" fill="#000"/>
        <circle cx="70" cy="40" r="3" fill="#000"/>
        <path d="M55 50 Q60 55 65 50" stroke="#000" stroke-width="2" fill="none"/>
        <rect x="40" y="70" width="40" height="50" fill="#4A90E2" rx="5"/>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(avatarSvg)}`;
  };

  const renderStep = () => {
    switch (customizationStep) {
      case 'style':
        return (
          <div className="space-y-4">
            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Choose Avatar Style
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {avatarStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setAvatarConfig(prev => ({ ...prev, style: style.id }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    avatarConfig.style === style.id
                      ? 'border-blue-500 bg-blue-50'
                      : theme === 'dark' ?'border-gray-700 hover:border-gray-600' :'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon name={style.icon} size={24} className="mx-auto mb-2" />
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {style.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Skin Tone
              </h3>
              <div className="flex space-x-3">
                {skinTones.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setAvatarConfig(prev => ({ ...prev, skinTone: tone.id }))}
                    className={`w-8 h-8 rounded-full border-2 ${
                      avatarConfig.skinTone === tone.id ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: tone.color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Hair Style
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {hairStyles.map((hair) => (
                  <button
                    key={hair.id}
                    onClick={() => setAvatarConfig(prev => ({ ...prev, hair: hair.id }))}
                    className={`p-2 rounded border text-sm ${
                      avatarConfig.hair === hair.id
                        ? 'border-blue-500 bg-blue-50'
                        : theme === 'dark' ?'border-gray-700 hover:border-gray-600' :'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {hair.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Hair Color
              </h3>
              <div className="flex space-x-3">
                {hairColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setAvatarConfig(prev => ({ ...prev, hairColor: color.id }))}
                    className={`w-8 h-8 rounded-full border-2 ${
                      avatarConfig.hairColor === color.id ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.color }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'clothing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Clothing
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {clothingOptions.map((clothing) => (
                  <button
                    key={clothing.id}
                    onClick={() => setAvatarConfig(prev => ({ ...prev, clothing: clothing.id }))}
                    className={`p-3 rounded-lg border-2 text-sm ${
                      avatarConfig.clothing === clothing.id
                        ? 'border-blue-500 bg-blue-50'
                        : theme === 'dark' ?'border-gray-700 hover:border-gray-600' :'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {clothing.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Accessories
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {accessoryOptions.map((accessory) => (
                  <button
                    key={accessory.id}
                    onClick={() => setAvatarConfig(prev => ({ ...prev, accessories: accessory.id }))}
                    className={`p-3 rounded-lg border-2 text-sm ${
                      avatarConfig.accessories === accessory.id
                        ? 'border-blue-500 bg-blue-50'
                        : theme === 'dark' ?'border-gray-700 hover:border-gray-600' :'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {accessory.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'finish':
        return (
          <div className="text-center space-y-4">
            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Your Avatar is Ready!
            </h3>
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-blue-500">
              <img src={generateAvatar()} alt="Generated Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => setCustomizationStep('style')}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' ?'border-gray-700 hover:border-gray-600 text-gray-300' :'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                Edit Avatar
              </button>
              <button
                onClick={() => {
                  // Save avatar logic here
                  alert('Avatar saved successfully!');
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Avatar
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-lg font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Avatar Creator
        </h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Create a personalized avatar for your profile
        </p>
      </div>

      {/* Step Navigation */}
      <div className="flex space-x-2 mb-6">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => setCustomizationStep(step.id)}
            className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
              customizationStep === step.id
                ? theme === 'dark' ?'bg-blue-900 text-blue-200' :'bg-blue-50 text-blue-700'
                : theme === 'dark' ?'text-gray-400 hover:bg-gray-700' :'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon name={step.icon} size={16} />
            <span className="text-sm font-medium">{step.label}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      {customizationStep !== 'finish' && (
        <div className="flex justify-between">
          <button
            onClick={() => {
              const currentIndex = steps.findIndex(s => s.id === customizationStep);
              if (currentIndex > 0) {
                setCustomizationStep(steps[currentIndex - 1].id);
              }
            }}
            disabled={customizationStep === 'style'}
            className={`px-4 py-2 rounded-lg border ${
              customizationStep === 'style' ?'opacity-50 cursor-not-allowed'
                : theme === 'dark' ?'border-gray-700 hover:border-gray-600 text-gray-300' :'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => {
              const currentIndex = steps.findIndex(s => s.id === customizationStep);
              if (currentIndex < steps.length - 1) {
                setCustomizationStep(steps[currentIndex + 1].id);
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AvatarCreator;