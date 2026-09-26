import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AIInsights = ({ insights }) => {
  const [expandedInsight, setExpandedInsight] = useState(null);

  const handleToggleInsight = (insightId) => {
    setExpandedInsight(expandedInsight === insightId ? null : insightId);
  };

  const handleApplySuggestion = (suggestionId) => {
    console.log('Applying suggestion:', suggestionId);
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'profile':
        return 'User';
      case 'content':
        return 'FileText';
      case 'networking':
        return 'Users';
      case 'engagement':
        return 'TrendingUp';
      default:
        return 'Lightbulb';
    }
  };

  const getInsightColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Icon name="Zap" size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              AI Insights
            </h2>
            <p className="text-sm text-text-muted">
              Personalized recommendations to improve your profile
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" iconName="RefreshCw">
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => handleToggleInsight(insight.id)}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  insight.priority === 'high' ? 'bg-error-50' :
                  insight.priority === 'medium'? 'bg-warning-50' : 'bg-success-50'
                }`}>
                  <Icon
                    name={getInsightIcon(insight.type)}
                    size={20}
                    className={getInsightColor(insight.priority)}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-text-primary">
                      {insight.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        insight.priority === 'high' ? 'bg-error-100 text-error' :
                        insight.priority === 'medium'? 'bg-warning-100 text-warning' : 'bg-success-100 text-success'
                      }`}>
                        {insight.priority} priority
                      </span>
                      <Icon
                        name={expandedInsight === insight.id ? "ChevronUp" : "ChevronDown"}
                        size={16}
                        className="text-text-muted"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    {insight.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-text-muted">
                    <span>Impact: {insight.impact}</span>
                    <span>•</span>
                    <span>Effort: {insight.effort}</span>
                  </div>
                </div>
              </div>
            </div>

            {expandedInsight === insight.id && (
              <div className="px-4 pb-4 border-t border-border-muted content-reveal">
                <div className="pt-4">
                  <h4 className="font-medium text-text-primary mb-3">
                    Recommended Actions
                  </h4>
                  <div className="space-y-3">
                    {insight.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 bg-secondary-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-text-primary mb-1">
                            {suggestion.action}
                          </p>
                          <p className="text-xs text-text-muted">
                            {suggestion.description}
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApplySuggestion(suggestion.id)}
                          className="ml-3"
                        >
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>

                  {insight.metrics && (
                    <div className="mt-4 pt-4 border-t border-border-muted">
                      <h4 className="font-medium text-text-primary mb-3">
                        Expected Results
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {insight.metrics.map((metric, index) => (
                          <div key={index} className="text-center">
                            <div className="text-lg font-semibold text-primary">
                              {metric.value}
                            </div>
                            <div className="text-xs text-text-muted">
                              {metric.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Great job!
          </h3>
          <p className="text-text-muted">
            Your profile is optimized. Check back later for new insights.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;