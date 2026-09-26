import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation, onNewMessage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnline = !showOnlineOnly || conv.isOnline;
    return matchesSearch && matchesOnline;
  });

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  return (
    <div className="h-full bg-surface border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-muted">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-text-primary">Messages</h2>
          <Button
            variant="primary"
            size="sm"
            iconName="Plus"
            onClick={onNewMessage}
            className="floating-action"
          >
            New
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <Icon
            name="Search"
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"
          />
          <Input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary-50 border-0"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant={showOnlineOnly ? "primary" : "ghost"}
            size="xs"
            onClick={() => setShowOnlineOnly(!showOnlineOnly)}
            className="text-xs"
          >
            <Icon name="Circle" size={12} className="text-success mr-1" />
            Online only
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="MessageCircle" size={48} className="text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">No conversations found</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all micro-interaction ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-primary-50 border border-primary-100' :'hover:bg-secondary-50'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Image
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conversation.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-surface" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-text-primary truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-text-muted flex-shrink-0">
                      {formatTime(conversation.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text-muted truncate flex-1">
                      {conversation.isTyping ? (
                        <span className="text-primary ai-indicator">typing...</span>
                      ) : (
                        conversation.lastMessage
                      )}
                    </p>
                    
                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Professional Context */}
                  {conversation.context && (
                    <div className="flex items-center mt-1">
                      <Icon name="Briefcase" size={12} className="text-text-muted mr-1" />
                      <span className="text-xs text-text-muted truncate">
                        {conversation.context}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;