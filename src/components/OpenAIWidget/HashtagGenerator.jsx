import React, { useState } from 'react';
import Icon from '../AppIcon';
import { useTheme } from '../../contexts/ThemeContext';
import { generateHashtags, generateContentIdeas } from '../../services/knowledgeBase';

const HashtagGenerator = ({ setIsLoading }) => {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMode, setActiveMode] = useState('hashtags'); // 'hashtags' or 'content'

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsGenerating(true);
    setIsLoading(true);

    try {
      let generatedResult;
      if (activeMode === 'hashtags') {
        generatedResult = await generateHashtags(content);
      } else {
        generatedResult = await generateContentIdeas(content, 'post');
      }
      setResult(generatedResult);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllHashtags = () => {
    if (result?.hashtags) {
      const hashtagText = result.hashtags.join(' ');
      copyToClipboard(hashtagText);
    }
  };

  const renderHashtagResult = () => {
    if (!result) return null;

    return (
      <div className="space-y-4">
        {/* Regular Hashtags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`text-sm font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Hashtags
            </h4>
            <button
              onClick={copyAllHashtags}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                theme === 'dark' ?'bg-gray-700 text-gray-300 hover:bg-gray-600' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Copy All
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {result.hashtags?.map((hashtag, index) => (
              <button
                key={index}
                onClick={() => copyToClipboard(hashtag)}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${
                  theme === 'dark' ?'bg-blue-900 text-blue-300 hover:bg-blue-800' :'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                {hashtag}
              </button>
            ))}
          </div>
        </div>

        {/* Trending Hashtags */}
        {result.trending && (
          <div>
            <h4 className={`text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Trending
            </h4>
            <div className="flex flex-wrap gap-1">
              {result.trending.map((hashtag, index) => (
                <button
                  key={index}
                  onClick={() => copyToClipboard(hashtag)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    theme === 'dark' ?'bg-red-900 text-red-300 hover:bg-red-800' :'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {hashtag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {result.suggestions && (
          <div>
            <h4 className={`text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Suggestions
            </h4>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {result.suggestions}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderContentResult = () => {
    if (!result) return null;

    return (
      <div className="space-y-4">
        {/* Title */}
        {result.title && (
          <div>
            <h4 className={`text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Title
            </h4>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {result.title}
            </p>
          </div>
        )}

        {/* Content */}
        {result.content && (
          <div>
            <h4 className={`text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Content
            </h4>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {result.content}
            </p>
          </div>
        )}

        {/* Ideas */}
        {result.ideas && (
          <div>
            <h4 className={`text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Ideas
            </h4>
            <ul className="space-y-1">
              {result.ideas.map((idea, index) => (
                <li key={index} className={`text-xs ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  • {idea}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Mode Toggle */}
      <div className={`p-2 border-b ${
        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveMode('hashtags')}
            className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeMode === 'hashtags' ?'bg-primary text-white'
                : theme === 'dark' ?'text-gray-400 hover:text-gray-200' :'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hashtags
          </button>
          <button
            onClick={() => setActiveMode('content')}
            className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeMode === 'content' ?'bg-primary text-white'
                : theme === 'dark' ?'text-gray-400 hover:text-gray-200' :'text-gray-600 hover:text-gray-900'
            }`}
          >
            Content Ideas
          </button>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 p-3 overflow-y-auto">
        {result ? (
          activeMode === 'hashtags' ? renderHashtagResult() : renderContentResult()
        ) : (
          <div className={`h-full flex items-center justify-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <div className="text-center">
              <Icon name="Hash" size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {activeMode === 'hashtags' ?'Generate hashtags from your content' :'Get content ideas for your posts'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleGenerate} className={`p-3 border-t ${
        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={activeMode === 'hashtags' ?'Enter your content to generate hashtags...' :'Enter a topic to get content ideas...'
            }
            rows={3}
            className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
              theme === 'dark' ?'bg-gray-700 border-gray-600 text-white placeholder-gray-400' :'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            type="submit"
            disabled={!content.trim() || isGenerating}
            className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Icon name={activeMode === 'hashtags' ? 'Hash' : 'Lightbulb'} size={16} />
                <span>
                  {activeMode === 'hashtags' ? 'Generate Hashtags' : 'Get Ideas'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HashtagGenerator;