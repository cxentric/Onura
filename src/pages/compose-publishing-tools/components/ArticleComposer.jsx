import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';
import RichTextEditor from './RichTextEditor';

const ArticleComposer = ({ onContentChange }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const suggestedTags = [
    'Professional Development', 'Leadership', 'Technology', 'Innovation',
    'Career Growth', 'Industry Insights', 'Best Practices', 'Networking'
  ];

  const handleContentUpdate = (newContent) => {
    setContent(newContent);
    onContentChange({
      type: 'article',
      title,
      content: newContent,
      featuredImage,
      tags,
      scheduleDate,
      scheduleTime
    });
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    onContentChange({
      type: 'article',
      title: e.target.value,
      content,
      featuredImage,
      tags,
      scheduleDate,
      scheduleTime
    });
  };

  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      const updatedTags = [...tags, tag];
      setTags(updatedTags);
      setNewTag('');
      onContentChange({
        type: 'article',
        title,
        content,
        featuredImage,
        tags: updatedTags,
        scheduleDate,
        scheduleTime
      });
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    onContentChange({
      type: 'article',
      title,
      content,
      featuredImage,
      tags: updatedTags,
      scheduleDate,
      scheduleTime
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFeaturedImage(e.target.result);
        onContentChange({
          type: 'article',
          title,
          content,
          featuredImage: e.target.result,
          tags,
          scheduleDate,
          scheduleTime
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Article Title
        </label>
        <Input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter your article title..."
          className="text-lg font-semibold"
        />
      </div>

      {/* Featured Image */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Featured Image
        </label>
        <div className="space-y-3">
          {featuredImage ? (
            <div className="relative">
              <Image
                src={featuredImage}
                alt="Featured image"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="danger"
                size="sm"
                onClick={() => setFeaturedImage('')}
                className="absolute top-2 right-2"
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Icon name="Upload" size={32} className="mx-auto text-text-muted mb-2" />
              <p className="text-text-muted mb-4">Upload a featured image for your article</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="featured-image"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('featured-image').click()}
              >
                Choose Image
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content Editor */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Article Content
        </label>
        <RichTextEditor
          content={content}
          onChange={handleContentUpdate}
          placeholder="Start writing your article..."
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Tags
        </label>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-primary-500 hover:text-primary-700"
                >
                  <Icon name="X" size={14} />
                </button>
              </span>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && addTag(newTag)}
            />
            <Button
              variant="outline"
              onClick={() => addTag(newTag)}
              disabled={!newTag}
            >
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-text-muted">Suggested:</span>
            {suggestedTags.filter(tag => !tags.includes(tag)).slice(0, 4).map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="text-sm text-primary hover:text-primary-700 underline"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Publishing Schedule */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Schedule Publication (Optional)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
          <Input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleComposer;