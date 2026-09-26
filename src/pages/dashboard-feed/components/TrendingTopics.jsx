import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TrendingTopics = ({ onTopicClick }) => {
  const trendingTopics = [
    {
      id: 1,
      hashtag: '#AIInnovation',
      posts: 1247,
      growth: '+23%',
      category: 'Technology'
    },
    {
      id: 2,
      hashtag: '#RemoteWork',
      posts: 892,
      growth: '+15%',
      category: 'Workplace'
    },
    {
      id: 3,
      hashtag: '#SustainableBusiness',
      posts: 634,
      growth: '+31%',
      category: 'Business'
    },
    {
      id: 4,
      hashtag: '#DigitalTransformation',
      posts: 567,
      growth: '+18%',
      category: 'Technology'
    },
    {
      id: 5,
      hashtag: '#StartupLife',
      posts: 423,
      growth: '+27%',
      category: 'Entrepreneurship'
    },
    {
      id: 6,
      hashtag: '#DataScience',
      posts: 389,
      growth: '+12%',
      category: 'Technology'
    }
  ];

  const handleTopicClick = (topic) => {
    onTopicClick?.(topic);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text-primary flex items-center space-x-2">
          <Icon name="TrendingUp" size={18} />
          <span>Trending Topics</span>
        </h3>
        <Button variant="ghost" size="sm" className="text-text-muted hover:text-text-primary">
          <Icon name="MoreHorizontal" size={16} />
        </Button>
      </div>

      <div className="space-y-3">
        {trendingTopics.map((topic, index) => (
          <div
            key={topic.id}
            onClick={() => handleTopicClick(topic)}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary-50 cursor-pointer transition-colors micro-interaction group"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-50 rounded-full">
                <span className="text-sm font-medium text-primary">#{index + 1}</span>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-text-primary group-hover:text-primary transition-colors">
                  {topic.hashtag}
                </div>
                <div className="flex items-center space-x-2 text-xs text-text-muted">
                  <span>{topic.posts.toLocaleString()} posts</span>
                  <span>•</span>
                  <span className="text-success">{topic.growth}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-text-muted">{topic.category}</div>
              <Icon name="ChevronRight" size={14} className="text-text-muted mt-1" />
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full text-text-muted hover:text-text-primary"
      >
        View All Trending Topics
      </Button>
    </div>
  );
};

export default TrendingTopics;