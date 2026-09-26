import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContentTypeSelector = ({ selectedType, onTypeChange }) => {
  const contentTypes = [
    {
      id: 'article',
      name: 'Article',
      icon: 'FileText',
      description: 'Write detailed professional articles'
    },
    {
      id: 'poll',
      name: 'Poll',
      icon: 'BarChart3',
      description: 'Create engaging polls for your network'
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      icon: 'Mail',
      description: 'Send updates to your subscribers'
    },
    {
      id: 'image',
      name: 'Image Post',
      icon: 'Image',
      description: 'Share visual content with captions'
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-secondary-50 rounded-lg">
      {contentTypes.map((type) => (
        <Button
          key={type.id}
          variant={selectedType === type.id ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onTypeChange(type.id)}
          className="flex items-center space-x-2 micro-interaction"
        >
          <Icon name={type.icon} size={16} />
          <span className="hidden sm:inline">{type.name}</span>
        </Button>
      ))}
    </div>
  );
};

export default ContentTypeSelector;