import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import LocationPicker from '../../../components/ui/LocationPicker';

const QuickCompose = ({ onQuickPost }) => {
  const [quickPostText, setQuickPostText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleQuickPost = () => {
    if (quickPostText.trim()) {
      const postData = {
        text: quickPostText,
        location: selectedLocation
      };
      onQuickPost?.(postData);
      setQuickPostText('');
      setSelectedLocation(null);
      setIsExpanded(false);
    }
  };

  const composeOptions = [
  {
    type: 'article',
    label: 'Write Article',
    icon: 'FileText',
    description: 'Share your expertise with detailed content'
  },
  {
    type: 'poll',
    label: 'Create Poll',
    icon: 'BarChart3',
    description: 'Engage your network with questions'
  },
  {
    type: 'image',
    label: 'Share Image',
    icon: 'Image',
    description: 'Post visual content with captions'
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    icon: 'Mail',
    description: 'Send updates to your subscribers'
  }];


  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4 hidden">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-secondary-200 rounded-full flex items-center justify-center">
          <Icon name="User" size={18} className="text-text-muted" />
        </div>
        <div className="flex-1">
          <textarea
            value={quickPostText}
            onChange={(e) => setQuickPostText(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Share your thoughts with your network..."
            className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            rows={isExpanded ? 3 : 1} />

        </div>
      </div>

      {isExpanded &&
      <div className="space-y-4 content-reveal">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-text-muted hover:text-text-primary">
                <Icon name="Image" size={16} />
              </Button>
              <Button variant="ghost" size="sm" className="text-text-muted hover:text-text-primary">
                <Icon name="Link" size={16} />
              </Button>
              <Button variant="ghost" size="sm" className="text-text-muted hover:text-text-primary">
                <Icon name="Hash" size={16} />
              </Button>
              <Button variant="ghost" size="sm" className="text-text-muted hover:text-text-primary">
                <Icon name="AtSign" size={16} />
              </Button>
              <LocationPicker
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation} />

            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${quickPostText.length > 280 ? 'text-error' : 'text-text-muted'}`}>
                {quickPostText.length}/280
              </span>
              <Button
              variant="primary"
              size="sm"
              onClick={handleQuickPost}
              disabled={!quickPostText.trim() || quickPostText.length > 280}>

                Post
              </Button>
            </div>
          </div>
        </div>
      }

      <div className="pt-4 border-t border-border-muted">
        <div className="grid grid-cols-2 gap-3">
          {composeOptions.map((option) =>
          <Link
            key={option.type}
            to="/compose-publishing-tools"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors micro-interaction group">

              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                <Icon name={option.icon} size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-text-primary text-sm group-hover:text-primary transition-colors">
                  {option.label}
                </div>
                <div className="text-xs text-text-muted line-clamp-1">
                  {option.description}
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>);

};

export default QuickCompose;