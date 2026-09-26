import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const PreviewModal = ({ isOpen, onClose, content, device = 'desktop' }) => {
  if (!isOpen || !content) return null;

  const renderArticlePreview = () => (
    <article className="max-w-4xl mx-auto">
      {content.featuredImage && (
        <div className="mb-6">
          <Image
            src={content.featuredImage}
            alt="Featured image"
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}
      <h1 className="text-3xl font-bold text-text-primary mb-4">
        {content.title || 'Untitled Article'}
      </h1>
      <div className="flex items-center space-x-4 text-sm text-text-muted mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
            <Icon name="User" size={16} />
          </div>
          <span>Professional User</span>
        </div>
        <span>•</span>
        <span>{new Date().toLocaleDateString()}</span>
        <span>•</span>
        <span>5 min read</span>
      </div>
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content.content || '<p>Your article content will appear here...</p>' }}
      />
      {content.tags && content.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-secondary-100 text-text-secondary rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );

  const renderPollPreview = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-secondary-200 rounded-full flex items-center justify-center">
            <Icon name="User" size={20} />
          </div>
          <div>
            <div className="font-medium text-text-primary">Professional User</div>
            <div className="text-sm text-text-muted">Just now</div>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {content.question || 'Your poll question will appear here'}
        </h2>
        
        <div className="space-y-3 mb-4">
          {content.options?.map((option, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-secondary-50 cursor-pointer"
            >
              <div className={`w-4 h-4 border-2 border-border ${
                content.allowMultiple ? 'rounded' : 'rounded-full'
              }`} />
              <span className="text-text-primary">{option || `Option ${index + 1}`}</span>
            </div>
          )) || (
            <div className="text-text-muted">Poll options will appear here...</div>
          )}
        </div>
        
        <div className="text-sm text-text-muted">
          Poll ends in {content.duration || '7'} days
        </div>
      </div>
    </div>
  );

  const renderNewsletterPreview = () => (
    <div className="max-w-2xl mx-auto bg-surface border border-border rounded-lg overflow-hidden">
      <div className="bg-primary text-white p-6 text-center">
        <h1 className="text-2xl font-bold">Professional Newsletter</h1>
        <p className="text-primary-100 mt-2">Stay updated with industry insights</p>
      </div>
      
      <div className="p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {content.subject || 'Newsletter Subject'}
        </h2>
        
        <div 
          className="prose max-w-none mb-6"
          dangerouslySetInnerHTML={{ 
            __html: content.content || '<p>Your newsletter content will appear here...</p>' 
          }}
        />
        
        <div className="border-t border-border pt-4">
          <div className="text-center text-sm text-text-muted">
            <p>You received this newsletter because you subscribed to Professional Updates.</p>
            <p className="mt-2">
              <a href="#" className="text-primary hover:underline">Unsubscribe</a> | 
              <a href="#" className="text-primary hover:underline ml-2">Update preferences</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderImagePostPreview = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary-200 rounded-full flex items-center justify-center">
              <Icon name="User" size={20} />
            </div>
            <div>
              <div className="font-medium text-text-primary">Professional User</div>
              <div className="text-sm text-text-muted">Just now</div>
            </div>
          </div>
        </div>
        
        {content.images && content.images.length > 0 && (
          <div className={`${
            content.images.length === 1 ? 'aspect-square' : 
            content.images.length === 2 ? 'grid grid-cols-2': 'grid grid-cols-2'
          }`}>
            {content.images.slice(0, 4).map((image, index) => (
              <div key={image.id} className="relative">
                <Image
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                {index === 3 && content.images.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold text-xl">
                      +{content.images.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="p-4">
          {content.caption && (
            <p className="text-text-primary mb-3">{content.caption}</p>
          )}
          
          {content.hashtags && content.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {content.hashtags.map((tag, index) => (
                <span key={index} className="text-primary text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-sm text-text-muted">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 hover:text-text-primary">
                <Icon name="Heart" size={16} />
                <span>Like</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-text-primary">
                <Icon name="MessageCircle" size={16} />
                <span>Comment</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-text-primary">
                <Icon name="Share" size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (content.type) {
      case 'article':
        return renderArticlePreview();
      case 'poll':
        return renderPollPreview();
      case 'newsletter':
        return renderNewsletterPreview();
      case 'image':
        return renderImagePostPreview();
      default:
        return <div className="text-center text-text-muted">No preview available</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-surface rounded-lg shadow-xl max-h-[90vh] overflow-hidden ${
        device === 'mobile' ? 'w-full max-w-sm' : 
        device === 'tablet'? 'w-full max-w-2xl' : 'w-full max-w-6xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-text-primary">Preview</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={device === 'desktop' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {}}
              >
                <Icon name="Monitor" size={16} />
              </Button>
              <Button
                variant={device === 'tablet' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {}}
              >
                <Icon name="Tablet" size={16} />
              </Button>
              <Button
                variant={device === 'mobile' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {}}
              >
                <Icon name="Smartphone" size={16} />
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 bg-background">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;