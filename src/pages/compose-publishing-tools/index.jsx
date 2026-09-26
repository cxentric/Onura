import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import ContentTypeSelector from './components/ContentTypeSelector';

import AIAssistantPanel from './components/AIAssistantPanel';
import ArticleComposer from './components/ArticleComposer';
import PollComposer from './components/PollComposer';
import NewsletterComposer from './components/NewsletterComposer';
import ImagePostComposer from './components/ImagePostComposer';
import PublishingControls from './components/PublishingControls';
import PreviewModal from './components/PreviewModal';

const ComposePublishingTools = () => {
  const navigate = useNavigate();
  const [selectedContentType, setSelectedContentType] = useState('article');
  const [content, setContent] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    if (content && hasUnsavedChanges) {
      const timer = setTimeout(() => {
        // Simulate auto-save
        console.log('Auto-saving content:', content);
        setHasUnsavedChanges(false);
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(timer);
    }
  }, [content, hasUnsavedChanges]);

  // Handle content changes
  const handleContentChange = (newContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  // Handle content type change
  const handleContentTypeChange = (type) => {
    if (hasUnsavedChanges) {
      const confirmChange = window.confirm('You have unsaved changes. Are you sure you want to switch content types?');
      if (!confirmChange) return;
    }
    
    setSelectedContentType(type);
    setContent(null);
    setHasUnsavedChanges(false);
  };

  // Handle AI suggestion application
  const handleAISuggestionApply = (suggestion) => {
    console.log('Applying AI suggestion:', suggestion);
    // This would integrate with the specific composer components
    setHasUnsavedChanges(true);
  };

  // Handle save
  const handleSave = async (contentData) => {
    try {
      console.log('Saving content:', contentData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content. Please try again.');
    }
  };

  // Handle publish
  const handlePublish = async (contentData) => {
    try {
      console.log('Publishing content:', contentData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHasUnsavedChanges(false);
      alert('Content published successfully!');
      navigate('/dashboard-feed');
    } catch (error) {
      console.error('Error publishing content:', error);
      alert('Failed to publish content. Please try again.');
    }
  };

  // Handle preview
  const handlePreview = () => {
    setShowPreview(true);
  };

  // Handle exit
  const handleExit = () => {
    if (hasUnsavedChanges) {
      const confirmExit = window.confirm('You have unsaved changes. Are you sure you want to exit?');
      if (!confirmExit) return;
    }
    navigate('/dashboard-feed');
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Render content composer based on selected type
  const renderContentComposer = () => {
    switch (selectedContentType) {
      case 'article':
        return <ArticleComposer onContentChange={handleContentChange} />;
      case 'poll':
        return <PollComposer onContentChange={handleContentChange} />;
      case 'newsletter':
        return <NewsletterComposer onContentChange={handleContentChange} />;
      case 'image':
        return <ImagePostComposer onContentChange={handleContentChange} />;
      default:
        return <ArticleComposer onContentChange={handleContentChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />

      {/* Main Content */}
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'lg:ml-64'} pt-16`}>
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExit}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Back to Feed
              </Button>
              <div className="hidden sm:block w-px h-6 bg-border" />
              <h1 className="hidden sm:block text-xl font-semibold text-text-primary">
                Create Content
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                <Icon name={isFullscreen ? 'Minimize2' : 'Maximize2'} size={18} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className={showAIAssistant ? 'bg-accent-50 text-accent' : ''}
              >
                <Icon name="Zap" size={18} />
                <span className="hidden sm:inline ml-2">AI Assistant</span>
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)]">
            {/* Main Editor */}
            <div className="flex-1 flex flex-col">
              {/* Content Type Selector */}
              <div className="p-4 border-b border-border bg-surface">
                <ContentTypeSelector
                  selectedType={selectedContentType}
                  onTypeChange={handleContentTypeChange}
                />
              </div>

              {/* Editor Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                {renderContentComposer()}
              </div>
            </div>

            {/* Publishing Controls Sidebar */}
            <div className="w-full lg:w-80 border-l border-border bg-surface">
              <div className="sticky top-0 h-full overflow-y-auto">
                <div className="p-4">
                  <PublishingControls
                    content={content}
                    onSave={handleSave}
                    onPublish={handlePublish}
                    onPreview={handlePreview}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-warning text-white px-4 py-2 rounded-lg shadow-lg z-40">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} />
              <span className="text-sm">You have unsaved changes</span>
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        contentType={selectedContentType}
        onSuggestionApply={handleAISuggestionApply}
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        content={content}
        device={previewDevice}
      />

      {/* Mobile Bottom Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 z-30">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            iconName="Eye"
            className="flex-1"
          >
            Preview
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSave(content)}
            iconName="Save"
            className="flex-1"
          >
            Save
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handlePublish(content)}
            iconName="Send"
            className="flex-1"
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComposePublishingTools;