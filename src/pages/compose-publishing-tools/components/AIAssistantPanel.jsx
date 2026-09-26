import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AIAssistantPanel = ({ isOpen, onClose, contentType, onSuggestionApply }) => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [isGenerating, setIsGenerating] = useState(false);

  const suggestions = {
    article: [
      {
        id: 1,
        type: 'title',
        content: "5 Essential Skills Every Professional Needs in 2024",
        category: 'Title Suggestion'
      },
      {
        id: 2,
        type: 'outline',
        content: `1. Introduction to modern workplace demands\n2. Digital literacy and AI collaboration\n3. Emotional intelligence in remote work\n4. Continuous learning mindset\n5. Cross-functional communication\n6. Conclusion and action steps`,
        category: 'Content Outline'
      },
      {
        id: 3,
        type: 'hook',
        content: "The workplace has evolved dramatically in the past few years. Are you equipped with the skills that matter most?",
        category: 'Opening Hook'
      }
    ],
    poll: [
      {
        id: 1,
        type: 'question',
        content: "What\'s the biggest challenge in your professional development?",
        category: 'Poll Question'
      },
      {
        id: 2,
        type: 'options',
        content: "• Finding time for learning\n• Keeping up with technology\n• Building meaningful connections\n• Balancing work-life priorities",
        category: 'Poll Options'
      }
    ],
    newsletter: [
      {
        id: 1,
        type: 'subject',
        content: "Weekly Insights: Industry Trends You Can\'t Miss",
        category: 'Subject Line'
      },
      {
        id: 2,
        type: 'intro',
        content: "Hello [Name],\n\nThis week brought exciting developments in our industry. Here's what caught my attention and why it matters for your professional growth.",
        category: 'Newsletter Intro'
      }
    ],
    image: [
      {
        id: 1,
        type: 'caption',
        content: "Behind every successful project is a team that believes in the vision. Grateful for these amazing collaborators! 🚀",
        category: 'Caption Suggestion'
      },
      {
        id: 2,
        type: 'hashtags',
        content: "#TeamWork #ProfessionalGrowth #Innovation #Leadership #Success",
        category: 'Hashtag Suggestions'
      }
    ]
  };

  const improvements = [
    {
      id: 1,
      type: 'tone',
      suggestion: 'Consider making your tone more conversational to increase engagement',
      example: 'Instead of "One must consider..." try "You might want to think about..."'
    },
    {
      id: 2,
      type: 'structure',
      suggestion: 'Break up long paragraphs for better readability',
      example: 'Split paragraphs longer than 4 sentences into smaller chunks'
    },
    {
      id: 3,
      type: 'engagement',
      suggestion: 'Add a question at the end to encourage comments',
      example: 'What has been your experience with this? Share your thoughts below!'
    }
  ];

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const applySuggestion = (suggestion) => {
    onSuggestionApply(suggestion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-surface border-l border-border shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Zap" size={20} className="text-accent" />
          <h2 className="text-lg font-semibold">AI Assistant</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <Icon name="X" size={20} />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'suggestions' ?'text-primary border-b-2 border-primary bg-primary-50' :'text-text-secondary hover:text-text-primary'
          }`}
        >
          Suggestions
        </button>
        <button
          onClick={() => setActiveTab('improvements')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'improvements' ?'text-primary border-b-2 border-primary bg-primary-50' :'text-text-secondary hover:text-text-primary'
          }`}
        >
          Improvements
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-text-primary">Content Suggestions</h3>
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateContent}
                disabled={isGenerating}
                iconName={isGenerating ? "Loader2" : "Sparkles"}
                className={isGenerating ? "ai-indicator" : ""}
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </div>

            <div className="space-y-3">
              {suggestions[contentType]?.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-3 bg-secondary-50 rounded-lg border border-border-muted"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-accent uppercase tracking-wider">
                      {suggestion.category}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applySuggestion(suggestion)}
                      className="text-xs"
                    >
                      Apply
                    </Button>
                  </div>
                  <p className="text-sm text-text-primary whitespace-pre-line">
                    {suggestion.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'improvements' && (
          <div className="space-y-4">
            <h3 className="font-medium text-text-primary">Writing Improvements</h3>
            <div className="space-y-3">
              {improvements.map((improvement) => (
                <div
                  key={improvement.id}
                  className="p-3 bg-warning-50 rounded-lg border border-warning-100"
                >
                  <div className="flex items-start space-x-2 mb-2">
                    <Icon name="Lightbulb" size={16} className="text-warning-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary font-medium">
                        {improvement.suggestion}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {improvement.example}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-secondary-50">
        <div className="flex items-center space-x-2 text-xs text-text-muted">
          <Icon name="Info" size={14} />
          <span>AI suggestions are based on your niche and engagement patterns</span>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;