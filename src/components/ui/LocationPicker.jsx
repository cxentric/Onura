import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';

const LocationPicker = ({ onLocationSelect, selectedLocation, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchLocations(searchQuery);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const searchLocations = async (query) => {
    setIsLoading(true);
    try {
      // Mock location search - in real app, use Google Places API
      const mockResults = [
        { id: 1, name: `${query} - New York, NY`, lat: 40.7128, lng: -74.0060 },
        { id: 2, name: `${query} - Los Angeles, CA`, lat: 34.0522, lng: -118.2437 },
        { id: 3, name: `${query} - Chicago, IL`, lat: 41.8781, lng: -87.6298 },
      ];
      setSuggestions(mockResults);
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            name: 'Current Location',
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          onLocationSelect(location);
          setIsOpen(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please search for a location manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleLocationSelect = (location) => {
    onLocationSelect(location);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleRemoveLocation = () => {
    onLocationSelect(null);
  };

  return (
    <div className={`relative ${className}`}>
      {selectedLocation ? (
        <div className="flex items-center space-x-2 p-2 bg-primary-50 rounded-lg">
          <Icon name="MapPin" size={16} className="text-primary" />
          <span className="text-sm text-primary font-medium truncate">
            {selectedLocation.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveLocation}
            className="ml-auto text-primary hover:text-error"
          >
            <Icon name="X" size={14} />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-text-muted hover:text-text-primary"
        >
          <Icon name="MapPin" size={16} />
        </Button>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-50 content-reveal">
          <div className="p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                className="whitespace-nowrap"
              >
                <Icon name="Crosshair" size={16} className="mr-2" />
                Use Current
              </Button>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {suggestions.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-secondary-50 rounded-lg transition-colors text-left"
                  >
                    <Icon name="MapPin" size={16} className="text-text-muted" />
                    <span className="text-sm text-text-primary">{location.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;