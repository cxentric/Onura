import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ChatArea = ({ conversation, messages, onSendMessage, onShowAISuggestions }) => {
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = ['😊', '👍', '❤️', '😂', '🎉', '👏', '🔥', '💯', '🚀', '💡'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage({
        text: messageText,
        type: 'text',
        timestamp: new Date()
      });
      setMessageText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onSendMessage({
        text: `Shared ${file.name}`,
        type: 'file',
        file: file,
        timestamp: new Date()
      });
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <Icon name="MessageCircle" size={64} className="text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Select a conversation
          </h3>
          <p className="text-text-muted">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-surface">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image
                src={conversation.avatar}
                alt={conversation.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {conversation.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-text-primary">{conversation.name}</h3>
              <p className="text-sm text-text-muted">
                {conversation.isOnline ? 'Online' : `Last seen ${formatMessageTime(conversation.lastSeen)}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Icon name="Phone" size={18} />
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="Video" size={18} />
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="MoreVertical" size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(messageGroups).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-secondary-100 text-text-muted text-xs px-3 py-1 rounded-full">
                {new Date(date).toLocaleDateString([], { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {/* Messages for this date */}
            {dayMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${message.sender === 'You' ? 'order-2' : 'order-1'}`}>
                  {message.sender !== 'You' && (
                    <div className="flex items-center space-x-2 mb-1">
                      <Image
                        src={conversation.avatar}
                        alt={conversation.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs text-text-muted">{conversation.name}</span>
                    </div>
                  )}
                  
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.sender === 'You' ?'bg-primary text-white' :'bg-secondary-100 text-text-primary'
                    }`}
                  >
                    {message.type === 'file' ? (
                      <div className="flex items-center space-x-2">
                        <Icon name="Paperclip" size={16} />
                        <span className="text-sm">{message.text}</span>
                      </div>
                    ) : (
                      <p className="text-sm">{message.text}</p>
                    )}
                  </div>
                  
                  <div className={`flex items-center mt-1 space-x-1 ${
                    message.sender === 'You' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="text-xs text-text-muted">
                      {formatMessageTime(message.timestamp)}
                    </span>
                    {message.sender === 'You' && (
                      <Icon 
                        name={message.read ? "CheckCheck" : "Check"} 
                        size={12} 
                        className={message.read ? "text-primary" : "text-text-muted"} 
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <Image
                src={conversation.avatar}
                alt={conversation.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <div className="bg-secondary-100 px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-surface">
        <div className="flex items-end space-x-2">
          {/* AI Suggestions Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowAISuggestions}
            className="flex-shrink-0"
            title="AI Suggestions"
          >
            <Icon name="Sparkles" size={18} className="text-accent" />
          </Button>

          {/* File Upload */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
          >
            <Icon name="Paperclip" size={18} />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />

          {/* Message Input */}
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-12 resize-none"
            />
            
            {/* Emoji Picker Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Icon name="Smile" size={18} />
            </Button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 bg-surface border border-border rounded-lg shadow-lg p-3 content-reveal">
                <div className="grid grid-cols-5 gap-2">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setMessageText(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-lg hover:bg-secondary-50 rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Send Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="flex-shrink-0"
          >
            <Icon name="Send" size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;