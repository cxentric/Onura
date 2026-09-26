import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import ConversationList from './components/ConversationList';
import ChatArea from './components/ChatArea';
import AISuggestions from './components/AISuggestions';
import NewMessageModal from './components/NewMessageModal';
import Icon from '../../components/AppIcon';


const MessagingChat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);

  const [conversations] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Thanks for sharing that article! It was really insightful.',
      timestamp: new Date(Date.now() - 300000),
      unreadCount: 2,
      isOnline: true,
      isTyping: false,
      context: 'Product Management',
      lastSeen: new Date(Date.now() - 60000)
    },
    {
      id: 2,
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Let me know when you\'re available for the project discussion.',
      timestamp: new Date(Date.now() - 1800000),
      unreadCount: 0,
      isOnline: false,
      isTyping: false,
      context: 'Software Development',
      lastSeen: new Date(Date.now() - 3600000)
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'The design mockups look great! I have some feedback to share.',
      timestamp: new Date(Date.now() - 3600000),
      unreadCount: 1,
      isOnline: true,
      isTyping: true,
      context: 'UX Design',
      lastSeen: new Date()
    },
    {
      id: 4,
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Great meeting today! Looking forward to our collaboration.',
      timestamp: new Date(Date.now() - 7200000),
      unreadCount: 0,
      isOnline: false,
      isTyping: false,
      context: 'Marketing Strategy',
      lastSeen: new Date(Date.now() - 1800000)
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'I\'ve analyzed the data and have some interesting findings to discuss.',
      timestamp: new Date(Date.now() - 10800000),
      unreadCount: 3,
      isOnline: true,
      isTyping: false,
      context: 'Data Science',
      lastSeen: new Date(Date.now() - 300000)
    }
  ]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Sarah Johnson',
      text: 'Hi! I saw your post about the new product management framework. Really interesting approach!',
      timestamp: new Date(Date.now() - 86400000),
      type: 'text',
      read: true
    },
    {
      id: 2,
      sender: 'You',
      text: 'Thank you! I\'ve been working on refining it based on feedback from various teams.',
      timestamp: new Date(Date.now() - 86340000),
      type: 'text',
      read: true
    },
    {
      id: 3,
      sender: 'Sarah Johnson',
      text: 'I\'d love to learn more about how you handle stakeholder alignment in complex projects.',
      timestamp: new Date(Date.now() - 86280000),
      type: 'text',
      read: true
    },
    {
      id: 4,
      sender: 'You',
      text: 'That\'s a great question! I use a combination of regular check-ins and transparent documentation. Would you like me to share some templates?',
      timestamp: new Date(Date.now() - 86220000),
      type: 'text',
      read: true
    },
    {
      id: 5,
      sender: 'Sarah Johnson',
      text: 'That would be amazing! I\'m always looking for ways to improve communication with stakeholders.',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      read: true
    },
    {
      id: 6,
      sender: 'You',
      text: 'I\'ll send over a few documents that might help. Let me know what you think!',
      timestamp: new Date(Date.now() - 3540000),
      type: 'file',
      read: true
    },
    {
      id: 7,
      sender: 'Sarah Johnson',
      text: 'Thanks for sharing that article! It was really insightful.',
      timestamp: new Date(Date.now() - 300000),
      type: 'text',
      read: false
    }
  ]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && selectedConversation) {
      setShowConversationList(false);
    } else if (isMobile && !selectedConversation) {
      setShowConversationList(true);
    }
  }, [isMobile, selectedConversation]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleSendMessage = (messageData) => {
    const newMessage = {
      id: messages.length + 1,
      sender: 'You',
      text: messageData.text,
      timestamp: messageData.timestamp,
      type: messageData.type,
      file: messageData.file,
      read: false
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleAISuggestionSelect = (suggestion) => {
    const newMessage = {
      id: messages.length + 1,
      sender: 'You',
      text: suggestion,
      timestamp: new Date(),
      type: 'text',
      read: false
    };
    setMessages(prev => [...prev, newMessage]);
    setShowAISuggestions(false);
  };

  const handleStartConversation = (contacts) => {
    console.log('Starting conversation with:', contacts);
    // In a real app, this would create new conversations
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setShowConversationList(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      <div className="lg:ml-64 pt-16 pb-16 lg:pb-0">
        <div className="h-[calc(100vh-4rem)] flex">
          {/* Conversation List */}
          <div className={`${
            isMobile 
              ? (showConversationList ? 'w-full' : 'hidden') 
              : 'w-80 flex-shrink-0'
          }`}>
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              onNewMessage={() => setShowNewMessage(true)}
            />
          </div>

          {/* Chat Area */}
          <div className={`${
            isMobile 
              ? (showConversationList ? 'hidden' : 'w-full') 
              : 'flex-1'
          }`}>
            {/* Mobile Back Button */}
            {isMobile && selectedConversation && (
              <div className="p-4 border-b border-border bg-surface">
                <button
                  onClick={handleBackToConversations}
                  className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <Icon name="ArrowLeft" size={20} />
                  <span>Back to conversations</span>
                </button>
              </div>
            )}
            
            <ChatArea
              conversation={selectedConversation}
              messages={selectedConversation ? messages : []}
              onSendMessage={handleSendMessage}
              onShowAISuggestions={() => setShowAISuggestions(true)}
            />
          </div>
        </div>
      </div>

      {/* AI Suggestions Modal */}
      {showAISuggestions && (
        <AISuggestions
          conversation={selectedConversation}
          onSelectSuggestion={handleAISuggestionSelect}
          onClose={() => setShowAISuggestions(false)}
        />
      )}

      {/* New Message Modal */}
      {showNewMessage && (
        <NewMessageModal
          onClose={() => setShowNewMessage(false)}
          onStartConversation={handleStartConversation}
        />
      )}
    </div>
  );
};

export default MessagingChat;