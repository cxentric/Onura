import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const SuggestedConnections = ({ onConnect, onDismiss }) => {
  const [connections, setConnections] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      title: 'Senior UX Designer at Google',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      mutualConnections: 12,
      niche: 'Design',
      isConnected: false,
      reason: 'Works in Design'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      title: 'AI Research Scientist at OpenAI',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      mutualConnections: 8,
      niche: 'Technology',
      isConnected: false,
      reason: 'Similar interests'
    },
    {
      id: 3,
      name: 'Emily Johnson',
      title: 'Marketing Director at Stripe',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      mutualConnections: 15,
      niche: 'Marketing',
      isConnected: false,
      reason: 'Trending in your network'
    },
    {
      id: 4,
      name: 'David Kim',
      title: 'Startup Founder & CEO',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      mutualConnections: 6,
      niche: 'Entrepreneurship',
      isConnected: false,
      reason: 'AI suggested'
    }
  ]);

  const handleConnect = (connectionId) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, isConnected: true }
          : conn
      )
    );
    onConnect?.(connectionId);
  };

  const handleDismiss = (connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    onDismiss?.(connectionId);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text-primary flex items-center space-x-2">
          <Icon name="Users" size={18} />
          <span>Suggested Connections</span>
        </h3>
        <div className="flex items-center space-x-1">
          <Icon name="Zap" size={14} className="text-accent ai-indicator" />
          <span className="text-xs text-accent font-medium">AI Powered</span>
        </div>
      </div>

      <div className="space-y-4">
        {connections.map((connection) => (
          <div key={connection.id} className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={connection.avatar}
                  alt={connection.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-text-primary truncate">{connection.name}</h4>
                <p className="text-sm text-text-secondary line-clamp-2">{connection.title}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Icon name="Users" size={12} className="text-text-muted" />
                  <span className="text-xs text-text-muted">
                    {connection.mutualConnections} mutual connections
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Icon name="Tag" size={12} className="text-primary" />
                  <span className="text-xs text-primary font-medium">{connection.niche}</span>
                  <span className="text-xs text-text-muted">• {connection.reason}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(connection.id)}
                className="text-text-muted hover:text-text-primary"
              >
                <Icon name="X" size={14} />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={connection.isConnected ? "success" : "primary"}
                size="sm"
                onClick={() => handleConnect(connection.id)}
                disabled={connection.isConnected}
                className="flex-1"
                iconName={connection.isConnected ? "Check" : "UserPlus"}
                iconPosition="left"
              >
                {connection.isConnected ? 'Connected' : 'Connect'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-text-muted hover:text-text-primary"
              >
                <Icon name="MessageCircle" size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full text-text-muted hover:text-text-primary"
      >
        View All Suggestions
      </Button>
    </div>
  );
};

export default SuggestedConnections;