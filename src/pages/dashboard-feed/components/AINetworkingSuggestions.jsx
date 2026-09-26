import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AINetworkingSuggestions = ({ onSuggestionAction }) => {
  const [suggestions] = useState([
    {
      id: 1,
      type: 'content',
      title: 'Share your expertise',
      description: 'Write about "AI in Healthcare" - trending in your niche with 89% engagement rate',
      action: 'Create Post',
      icon: 'Edit3',
      priority: 'high',
      estimatedReach: '2.3K professionals'
    },
    {
      id: 2,
      type: 'connection',
      title: 'Expand your network',
      description: 'Connect with 3 AI researchers who recently joined your niche community',
      action: 'View Profiles',
      icon: 'Users',
      priority: 'medium',
      estimatedReach: '45 mutual connections'
    },
    {
      id: 3,
      type: 'engagement',
      title: 'Boost visibility',
      description: 'Comment on trending posts about "Machine Learning Ethics" to increase your reach',
      action: 'View Posts',
      icon: 'MessageCircle',
      priority: 'medium',
      estimatedReach: '1.8K views potential'
    },
    {
      id: 4,
      type: 'event',
      title: 'Join conversations',
      description: 'Participate in "Future of Work" discussion happening now in your network',
      action: 'Join Now',
      icon: 'Calendar',
      priority: 'high',
      estimatedReach: '156 active participants'
    }
  ]);

  const handleSuggestionAction = (suggestion) => {
    onSuggestionAction?.(suggestion);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-text-muted';
    }
  };

  const getPriorityBg = (priority) => {
    switch (priority) {
      case 'high': return 'bg-error-50';
      case 'medium': return 'bg-warning-50';
      case 'low': return 'bg-success-50';
      default: return 'bg-secondary-50';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text-primary flex items-center space-x-2">
          <Icon name="Brain" size={18} />
          <span>AI Networking Insights</span>
        </h3>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-accent rounded-full ai-indicator" />
          <span className="text-xs text-accent font-medium">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`p-4 rounded-lg border transition-all micro-interaction hover:shadow-sm ${getPriorityBg(suggestion.priority)} border-opacity-20`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getPriorityBg(suggestion.priority)}`}>
                <Icon 
                  name={suggestion.icon} 
                  size={16} 
                  className={getPriorityColor(suggestion.priority)} 
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-text-primary">{suggestion.title}</h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityBg(suggestion.priority)} ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">{suggestion.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Icon name="Target" size={12} className="text-text-muted" />
                    <span className="text-xs text-text-muted">{suggestion.estimatedReach}</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSuggestionAction(suggestion)}
                    className="micro-interaction"
                  >
                    {suggestion.action}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-border-muted">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Icon name="Zap" size={14} className="text-accent" />
            <span className="text-text-muted">AI analyzed your activity</span>
          </div>
          <Button variant="ghost" size="sm" className="text-text-muted hover:text-text-primary">
            <Icon name="RefreshCw" size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AINetworkingSuggestions;