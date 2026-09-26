import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const CloudPickerDropdown = ({ 
  variant = 'button', // 'button' or 'icon'
  size = 'md',
  className = '',
  onFilesSelected,
  allowMultiple = true,
  acceptedTypes = ['image/*', 'document/*'],
  buttonText = 'Cloud Picker',
  showConnectedOnly = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const cloudServices = [
    { id: 'drive', name: 'Google Drive', icon: 'HardDrive', connected: true },
    { id: 'dropbox', name: 'Dropbox', icon: 'Cloud', connected: true },
    { id: 'onedrive', name: 'OneDrive', icon: 'Database', connected: false },
    { id: 'icloud', name: 'iCloud', icon: 'CloudSnow', connected: false },
    { id: 'box', name: 'Box', icon: 'Archive', connected: true },
  ];

  const connectedServices = showConnectedOnly 
    ? cloudServices.filter(service => service.connected)
    : cloudServices;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleServiceClick = (service) => {
    if (service.connected) {
      // Navigate to cloud file picker with service pre-selected
      navigate(`/cloud-file-picker?service=${service.id}&return=true`);
    } else {
      // Handle connection flow
      console.log(`Connecting to ${service.name}...`);
      alert(`Please connect to ${service.name} first`);
    }
    setIsOpen(false);
  };

  const handleOpenFullPicker = () => {
    navigate('/cloud-file-picker?return=true');
    setIsOpen(false);
  };

  const renderTrigger = () => {
    if (variant === 'icon') {
      return (
        <Button
          variant="ghost"
          size={size}
          onClick={() => setIsOpen(!isOpen)}
          className={`${className} micro-interaction`}
          title="Cloud Picker"
        >
          <Icon name="Cloud" size={size === 'sm' ? 16 : 18} />
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} micro-interaction`}
        iconName="Cloud"
        iconPosition="left"
      >
        {buttonText}
      </Button>
    );
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {renderTrigger()}

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 bg-surface border border-border rounded-lg shadow-lg">
          <div className="p-2">
            <div className="px-3 py-2 text-sm font-medium text-text-primary border-b border-border">
              Choose Cloud Service
            </div>
            
            <div className="py-2">
              {connectedServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    service.connected
                      ? 'text-text-primary hover:bg-secondary-50' :'text-text-muted cursor-not-allowed opacity-50'
                  }`}
                  disabled={!service.connected}
                >
                  <Icon name={service.icon} size={18} />
                  <div className="flex-1">
                    <div className="font-medium">{service.name}</div>
                    {!service.connected && (
                      <div className="text-xs text-text-muted">Not connected</div>
                    )}
                  </div>
                  {service.connected && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="border-t border-border pt-2">
              <button
                onClick={handleOpenFullPicker}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-primary hover:bg-primary-50"
              >
                <Icon name="ExternalLink" size={18} />
                <span className="font-medium">Open Full Picker</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudPickerDropdown;