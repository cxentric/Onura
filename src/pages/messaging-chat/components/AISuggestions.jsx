import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AISuggestions = ({ conversation, onSelectSuggestion, onClose }) => {
  const [activeTab, setActiveTab] = useState('templates');

  const messageTemplates = [
    {
      id: 1,
      category: 'Professional Introduction',
      title: 'Connect & Introduce',
      content: `Hi ${conversation?.name}, I'd love to connect and learn more about your work in ${conversation?.context || 'your field'}. Looking forward to potential collaboration opportunities.`
    },
    {
      id: 2,
      category: 'Follow-up',title: 'Meeting Follow-up',
      content: `Thanks for the great conversation! I wanted to follow up on our discussion about ${conversation?.context || 'the project'}. When would be a good time to continue?`
    },
    {
      id: 3,
      category: 'Networking',title: 'Industry Insights',
      content: `I noticed your expertise in ${conversation?.context || 'your industry'}. I'd appreciate your insights on current trends and challenges in the field.`
    },
    {
      id: 4,
      category: 'Collaboration',
      title: 'Project Collaboration',
      content: `I have an interesting project that aligns with your background. Would you be open to discussing potential collaboration opportunities?`
    }
  ];

  const conversationStarters = [
    {
      id: 1,
      title: 'Industry Trends',
      content: `What trends are you seeing in ${conversation?.context || 'your industry'} right now?`
    },
    {
      id: 2,
      title: 'Professional Growth',
      content: 'What advice would you give to someone looking to advance in this field?'
    },
    {
      id: 3,
      title: 'Networking',
      content: 'How do you approach building meaningful professional relationships?'
    },
    {
      id: 4,
      title: 'Skills Development',
      content: 'What skills do you think are most important for success in this area?'
    }
  ];

  const toneAdjustments = [
    {
      id: 1,
      tone: 'Professional',
      description: 'Formal and business-appropriate',
      example: 'I would appreciate the opportunity to discuss this matter further at your convenience.'
    },
    {
      id: 2,
      tone: 'Friendly',
      description: 'Warm and approachable',
      example: 'I\'d love to chat more about this when you have a chance!'
    },
    {
      id: 3,
      tone: 'Direct',
      description: 'Clear and to the point',
      example: 'Let me know if you\'re interested in discussing this further.'
    },
    {
      id: 4,
      tone: 'Collaborative',
      description: 'Team-oriented and inclusive',
      example: 'I think we could work together on this - what are your thoughts?'
    }
  ];

  const tabs = [
    { id: 'templates', label: 'Templates', icon: 'FileText' },
    { id: 'starters', label: 'Starters', icon: 'MessageSquare' },
    { id: 'tone', label: 'Tone', icon: 'Volume2' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                <Icon name="Sparkles" size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-semibold text-text-primary">
                  AI Message Assistant
                </h2>
                <p className="text-sm text-text-muted">
                  Get suggestions for your conversation with {conversation?.name}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary-50' :'text-text-muted hover:text-text-primary hover:bg-secondary-50'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="text-sm text-text-muted mb-4">
                Choose a professional message template to get started:
              </div>
              {messageTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border border-border rounded-lg p-4 hover:border-primary-200 hover:bg-primary-50 transition-all cursor-pointer micro-interaction"
                  onClick={() => onSelectSuggestion(template.content)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-text-primary">{template.title}</h4>
                      <span className="text-xs text-text-muted">{template.category}</span>
                    </div>
                    <Icon name="ArrowRight" size={16} className="text-text-muted" />
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {template.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'starters' && (
            <div className="space-y-4">
              <div className="text-sm text-text-muted mb-4">
                Break the ice with these conversation starters:
              </div>
              {conversationStarters.map((starter) => (
                <div
                  key={starter.id}
                  className="border border-border rounded-lg p-4 hover:border-primary-200 hover:bg-primary-50 transition-all cursor-pointer micro-interaction"
                  onClick={() => onSelectSuggestion(starter.content)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-text-primary">{starter.title}</h4>
                    <Icon name="ArrowRight" size={16} className="text-text-muted" />
                  </div>
                  <p className="text-sm text-text-secondary">
                    {starter.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tone' && (
            <div className="space-y-4">
              <div className="text-sm text-text-muted mb-4">
                Adjust your message tone for different contexts:
              </div>
              {toneAdjustments.map((tone) => (
                <div
                  key={tone.id}
                  className="border border-border rounded-lg p-4 hover:border-primary-200 hover:bg-primary-50 transition-all cursor-pointer micro-interaction"
                  onClick={() => onSelectSuggestion(tone.example)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-text-primary">{tone.tone}</h4>
                      <span className="text-xs text-text-muted">{tone.description}</span>
                    </div>
                    <Icon name="ArrowRight" size={16} className="text-text-muted" />
                  </div>
                  <p className="text-sm text-text-secondary italic">
                    "{tone.example}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-secondary-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-text-muted">
              <Icon name="Info" size={16} />
              <span>AI suggestions are based on professional communication best practices</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISuggestions;