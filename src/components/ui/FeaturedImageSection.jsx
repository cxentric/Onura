import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import Image from '../AppImage';
import CloudPickerDropdown from './CloudPickerDropdown';

const FeaturedImageSection = ({ 
  image, 
  onImageChange, 
  onImageRemove,
  className = '',
  required = false 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = {
          id: Date.now(),
          src: event.target.result,
          file: file,
          alt: file.name,
          name: file.name,
          size: file.size
        };
        onImageChange?.(imageData);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = {
          id: Date.now(),
          src: event.target.result,
          file: file,
          alt: file.name,
          name: file.name,
          size: file.size
        };
        onImageChange?.(imageData);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloudFilesSelected = (files) => {
    // Handle files selected from cloud picker
    if (files?.length > 0) {
      const imageData = {
        id: Date.now(),
        src: files[0].url || files[0].thumbnail,
        cloudFile: files[0],
        alt: files[0].name,
        name: files[0].name,
        size: files[0].size
      };
      onImageChange?.(imageData);
    }
  };

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-text-primary mb-2">
        Featured Image {required && <span className="text-danger">*</span>}
      </label>
      
      {!image ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary-50' :'border-border hover:border-primary'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-text-muted">Uploading...</span>
            </div>
          ) : (
            <>
              <Icon name="ImagePlus" size={48} className="mx-auto text-text-muted mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Add Featured Image
              </h3>
              <p className="text-text-muted mb-4">
                Drag and drop an image here, or choose from your device or cloud storage
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="featured-image-upload"
                />
                <Button
                  variant="primary"
                  onClick={() => document.getElementById('featured-image-upload').click()}
                  iconName="Upload"
                  iconPosition="left"
                  size="sm"
                >
                  Choose Image
                </Button>
                <CloudPickerDropdown
                  variant="button"
                  size="sm"
                  buttonText="Cloud Picker"
                  onFilesSelected={handleCloudFilesSelected}
                  allowMultiple={false}
                  acceptedTypes={['image/*']}
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="relative group">
          <Image
            src={image.src}
            alt={image.alt || 'Featured image'}
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="danger"
                size="sm"
                onClick={() => onImageRemove?.()}
                className="shadow-lg"
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          </div>
          <div className="mt-2 text-sm text-text-muted">
            {image.name} {image.size && `(${(image.size / 1024 / 1024).toFixed(1)} MB)`}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedImageSection;