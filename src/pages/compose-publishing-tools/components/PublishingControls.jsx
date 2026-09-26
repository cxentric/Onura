import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PublishingControls = ({ content, onSave, onPublish, onPreview }) => {
  const [audience, setAudience] = useState('public');
  const [crossPost, setCrossPost] = useState({
    linkedin: false,
    twitter: false,
    facebook: false
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const audienceOptions = [
    { value: 'public', label: 'Public', icon: 'Globe', description: 'Anyone can see this post' },
    { value: 'connections', label: 'Connections', icon: 'Users', description: 'Only your connections' },
    { value: 'followers', label: 'Followers', icon: 'UserCheck', description: 'Your followers only' },
    { value: 'private', label: 'Private', icon: 'Lock', description: 'Only you can see this' }
  ];

  const socialPlatforms = [
    { key: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', color: 'text-blue-600' },
    { key: 'twitter', name: 'Twitter', icon: 'Twitter', color: 'text-blue-400' },
    { key: 'facebook', name: 'Facebook', icon: 'Facebook', color: 'text-blue-700' }
  ];

  const getWordCount = () => {
    if (!content) return 0;
    
    let text = '';
    if (content.type === 'article') {
      text = content.content?.replace(/<[^>]*>/g, '') || '';
    } else if (content.type === 'newsletter') {
      text = content.content?.replace(/<[^>]*>/g, '') || '';
    } else if (content.type === 'image') {
      text = content.caption || '';
    } else if (content.type === 'poll') {
      text = content.question || '';
    }
    
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getReadabilityScore = () => {
    const wordCount = getWordCount();
    if (wordCount < 50) return { score: 85, level: 'Easy' };
    if (wordCount < 200) return { score: 75, level: 'Good' };
    if (wordCount < 500) return { score: 65, level: 'Fair' };
    return { score: 55, level: 'Complex' };
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ ...content, audience, crossPost });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish({ ...content, audience, crossPost });
    } finally {
      setIsPublishing(false);
    }
  };

  const readability = getReadabilityScore();
  const wordCount = getWordCount();

  return (
    <div className="space-y-6">
      {/* Content Stats */}
      <div className="bg-secondary-50 rounded-lg p-4">
        <h3 className="font-medium text-text-primary mb-3">Content Analytics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{wordCount}</div>
            <div className="text-sm text-text-muted">Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{readability.score}</div>
            <div className="text-sm text-text-muted">Readability</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-text-muted">
          Readability: {readability.level}
        </div>
      </div>

      {/* Audience Selection */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Who can see this?
        </label>
        <div className="space-y-2">
          {audienceOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all micro-interaction ${
                audience === option.value
                  ? 'border-primary bg-primary-50' :'border-border hover:border-primary-300'
              }`}
            >
              <input
                type="radio"
                name="audience"
                value={option.value}
                checked={audience === option.value}
                onChange={(e) => setAudience(e.target.value)}
                className="sr-only"
              />
              <Icon name={option.icon} size={20} className={
                audience === option.value ? 'text-primary' : 'text-text-muted'
              } />
              <div className="flex-1">
                <div className="font-medium text-text-primary">{option.label}</div>
                <div className="text-sm text-text-muted">{option.description}</div>
              </div>
              {audience === option.value && (
                <Icon name="Check" size={20} className="text-primary" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Cross-posting */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Also share on
        </label>
        <div className="space-y-2">
          {socialPlatforms.map((platform) => (
            <label
              key={platform.key}
              className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary-300 cursor-pointer transition-all micro-interaction"
            >
              <input
                type="checkbox"
                checked={crossPost[platform.key]}
                onChange={(e) => setCrossPost(prev => ({
                  ...prev,
                  [platform.key]: e.target.checked
                }))}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <Icon name={platform.icon} size={20} className={platform.color} />
              <span className="font-medium text-text-primary">{platform.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SEO Optimization */}
      <div className="bg-warning-50 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Icon name="Lightbulb" size={20} className="text-warning-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-text-primary mb-2">SEO Tips</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Use relevant keywords in your title</li>
              <li>• Add descriptive alt text to images</li>
              <li>• Include 3-5 relevant hashtags</li>
              <li>• Keep paragraphs short for better readability</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onPreview}
          iconName="Eye"
          iconPosition="left"
          className="flex-1"
        >
          Preview
        </Button>
        
        <Button
          variant="secondary"
          onClick={handleSave}
          disabled={isSaving}
          iconName={isSaving ? "Loader2" : "Save"}
          iconPosition="left"
          className={`flex-1 ${isSaving ? 'ai-indicator' : ''}`}
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        
        <Button
          variant="primary"
          onClick={handlePublish}
          disabled={isPublishing || !content}
          iconName={isPublishing ? "Loader2" : "Send"}
          iconPosition="left"
          className={`flex-1 floating-action ${isPublishing ? 'ai-indicator' : ''}`}
        >
          {isPublishing ? 'Publishing...' : 'Publish'}
        </Button>
      </div>

      {/* Auto-save Status */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 text-xs text-text-muted">
          <Icon name="Cloud" size={14} />
          <span>Auto-saved 2 minutes ago</span>
        </div>
      </div>
    </div>
  );
};

export default PublishingControls;