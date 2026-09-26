import React, { useState } from 'react';
import Icon from '../AppIcon';
import { useTheme } from '../../contexts/ThemeContext';
import { generateImage } from '../../services/openaiService';

const ImageGenerator = ({ setIsLoading }) => {
  const { theme } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setIsLoading(true);

    try {
      const imageUrl = await generateImage(prompt);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const promptSuggestions = [
    'A futuristic cityscape at sunset',
    'Abstract geometric patterns',
    'Minimalist nature scene',
    'Professional headshot style'
  ];

  return (
    <div className={`flex flex-col h-full ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Image Display Area */}
      <div className="flex-1 p-3">
        {generatedImage ? (
          <div className="relative h-full">
            <img
              src={generatedImage}
              alt="Generated"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2 flex space-x-1">
              <button
                onClick={downloadImage}
                className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
              >
                <Icon name="Download" size={16} />
              </button>
              <button
                onClick={() => setGeneratedImage(null)}
                className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className={`h-full flex items-center justify-center border-2 border-dashed rounded-lg ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <div className="text-center">
              <Icon name="Image" size={48} className={`mx-auto mb-2 ${
                theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Generate an image from text
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Prompt Suggestions */}
      <div className={`p-2 border-t ${
        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="flex flex-wrap gap-1">
          {promptSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setPrompt(suggestion)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                theme === 'dark' ?'bg-gray-700 text-gray-300 hover:bg-gray-600' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleGenerateImage} className={`p-3 border-t ${
        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="space-y-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            rows={3}
            className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
              theme === 'dark' ?'bg-gray-700 border-gray-600 text-white placeholder-gray-400' :'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Icon name="Sparkles" size={16} />
                <span>Generate Image</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImageGenerator;