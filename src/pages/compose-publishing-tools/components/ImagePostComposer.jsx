import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';
import CloudPickerDropdown from '../../../components/ui/CloudPickerDropdown';

const ImagePostComposer = ({ onContentChange }) => {
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [newHashtag, setNewHashtag] = useState('');
  const [altText, setAltText] = useState('');

  const suggestedHashtags = [
    '#ProfessionalLife', '#WorkLife', '#TeamWork', '#Innovation',
    '#Leadership', '#Success', '#Motivation', '#Growth',
    '#Industry', '#Networking', '#Achievement', '#Inspiration'
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          src: e.target.result,
          file: file,
          alt: altText || file.name
        };
        setImages(prev => [...prev, newImage]);
        updateContent({ images: [...images, newImage] });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCloudFilesSelected = (files) => {
    if (files?.length > 0) {
      const newImages = files.map(file => ({
        id: Date.now() + Math.random(),
        src: file.url || file.thumbnail,
        cloudFile: file,
        alt: altText || file.name
      }));
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      updateContent({ images: updatedImages });
    }
  };

  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    updateContent({ images: updatedImages });
  };

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
    updateContent({ caption: e.target.value });
  };

  const addHashtag = (tag) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (cleanTag.length > 1 && !hashtags.includes(cleanTag)) {
      const updatedHashtags = [...hashtags, cleanTag];
      setHashtags(updatedHashtags);
      setNewHashtag('');
      updateContent({ hashtags: updatedHashtags });
    }
  };

  const removeHashtag = (tagToRemove) => {
    const updatedHashtags = hashtags.filter(tag => tag !== tagToRemove);
    setHashtags(updatedHashtags);
    updateContent({ hashtags: updatedHashtags });
  };

  const updateContent = (updates) => {
    onContentChange({
      type: 'image',
      images,
      caption,
      hashtags,
      altText,
      ...updates
    });
  };

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Upload Images
        </label>
        
        {images.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Icon name="ImagePlus" size={48} className="mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              Add photos to your post
            </h3>
            <p className="text-text-muted mb-4">
              Drag and drop images here, or click to select files
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                variant="primary"
                onClick={() => document.getElementById('image-upload').click()}
                iconName="Upload"
                iconPosition="left"
              >
                Choose Images
              </Button>
              <CloudPickerDropdown
                variant="button"
                buttonText="Cloud Picker"
                onFilesSelected={handleCloudFilesSelected}
                allowMultiple={true}
                acceptedTypes={['image/*']}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Add More Images */}
            <div className="flex justify-center gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="add-more-images"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('add-more-images').click()}
                iconName="Plus"
                iconPosition="left"
              >
                Add More Images
              </Button>
              <CloudPickerDropdown
                variant="button"
                size="sm"
                buttonText="Cloud Picker"
                onFilesSelected={handleCloudFilesSelected}
                allowMultiple={true}
                acceptedTypes={['image/*']}
              />
            </div>
          </div>
        )}
      </div>

      {/* Alt Text */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Alt Text (Accessibility)
        </label>
        <Input
          type="text"
          value={altText}
          onChange={(e) => {
            setAltText(e.target.value);
            updateContent({ altText: e.target.value });
          }}
          placeholder="Describe your images for screen readers..."
        />
        <p className="text-xs text-text-muted mt-1">
          Help make your content accessible to everyone
        </p>
      </div>

      {/* Caption */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Caption
        </label>
        <textarea
          value={caption}
          onChange={handleCaptionChange}
          placeholder="Write a caption for your post..."
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-text-muted">
            {caption.length}/2200 characters
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCaption(caption + ' 🚀')}
            className="text-xs"
          >
            Add emoji
          </Button>
        </div>
      </div>

      {/* Hashtags */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Hashtags
        </label>
        <div className="space-y-3">
          {/* Current Hashtags */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeHashtag(tag)}
                    className="ml-2 text-primary-500 hover:text-primary-700"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Add Hashtag */}
          <div className="flex space-x-2">
            <Input
              type="text"
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value)}
              placeholder="Add hashtag..."
              onKeyPress={(e) => e.key === 'Enter' && addHashtag(newHashtag)}
            />
            <Button
              variant="outline"
              onClick={() => addHashtag(newHashtag)}
              disabled={!newHashtag}
            >
              Add
            </Button>
          </div>
          
          {/* Suggested Hashtags */}
          <div className="space-y-2">
            <span className="text-sm text-text-muted">Suggested hashtags:</span>
            <div className="flex flex-wrap gap-2">
              {suggestedHashtags
                .filter(tag => !hashtags.includes(tag))
                .slice(0, 6)
                .map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addHashtag(tag)}
                    className="text-sm text-primary hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2 py-1 rounded transition-colors"
                  >
                    {tag}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Post Preview */}
      {images.length > 0 && (
        <div className="bg-secondary-50 rounded-lg p-4">
          <h3 className="font-medium text-text-primary mb-3">Post Preview</h3>
          <div className="bg-surface rounded-lg p-4 border border-border">
            {/* Images */}
            <div className={`mb-3 ${
              images.length === 1 ? 'aspect-square' : 
              images.length === 2 ? 'grid grid-cols-2 gap-1': 'grid grid-cols-2 gap-1'
            }`}>
              {images.slice(0, 4).map((image, index) => (
                <div key={image.id} className="relative">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover rounded"
                  />
                  {index === 3 && images.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                      <span className="text-white font-semibold">
                        +{images.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Caption */}
            {caption && (
              <p className="text-text-primary mb-2">
                {caption}
              </p>
            )}
            
            {/* Hashtags */}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {hashtags.map((tag, index) => (
                  <span key={index} className="text-primary text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePostComposer;