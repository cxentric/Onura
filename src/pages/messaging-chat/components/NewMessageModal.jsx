import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const NewMessageModal = ({ onClose, onStartConversation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);

  const contacts = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Product Manager at TechCorp',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      isOnline: true,
      mutualConnections: 12
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Senior Developer at StartupXYZ',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isOnline: false,
      mutualConnections: 8
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      title: 'UX Designer at DesignStudio',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      isOnline: true,
      mutualConnections: 15
    },
    {
      id: 4,
      name: 'David Kim',
      title: 'Marketing Director at GrowthCo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isOnline: false,
      mutualConnections: 6
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      title: 'Data Scientist at Analytics Inc',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      isOnline: true,
      mutualConnections: 20
    }
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSelect = (contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.find(c => c.id === contact.id);
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleStartConversation = () => {
    if (selectedContacts.length > 0) {
      onStartConversation(selectedContacts);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-semibold text-text-primary">
              New Message
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border-muted">
          <div className="relative">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"
            />
            <Input
              type="search"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Selected Contacts */}
        {selectedContacts.length > 0 && (
          <div className="p-4 border-b border-border-muted">
            <div className="text-sm text-text-muted mb-2">Selected ({selectedContacts.length}):</div>
            <div className="flex flex-wrap gap-2">
              {selectedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center space-x-2 bg-primary-50 text-primary px-3 py-1 rounded-full text-sm"
                >
                  <span>{contact.name}</span>
                  <button
                    onClick={() => handleContactSelect(contact)}
                    className="hover:bg-primary-100 rounded-full p-0.5"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center">
              <Icon name="Users" size={48} className="text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">No contacts found</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredContacts.map((contact) => {
                const isSelected = selectedContacts.find(c => c.id === contact.id);
                return (
                  <div
                    key={contact.id}
                    onClick={() => handleContactSelect(contact)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all micro-interaction ${
                      isSelected
                        ? 'bg-primary-50 border border-primary-200' :'hover:bg-secondary-50'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-primary border-primary' :'border-secondary-300'
                    }`}>
                      {isSelected && (
                        <Icon name="Check" size={12} className="text-white" />
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="relative">
                      <Image
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {contact.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface" />
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary truncate">
                        {contact.name}
                      </h3>
                      <p className="text-sm text-text-muted truncate">
                        {contact.title}
                      </p>
                      <div className="flex items-center mt-1">
                        <Icon name="Users" size={12} className="text-text-muted mr-1" />
                        <span className="text-xs text-text-muted">
                          {contact.mutualConnections} mutual connections
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-muted">
              {selectedContacts.length > 0 && (
                <span>{selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected</span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStartConversation}
                disabled={selectedContacts.length === 0}
              >
                Start Conversation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;