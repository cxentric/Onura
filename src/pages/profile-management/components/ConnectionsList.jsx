import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ConnectionsList = ({ connections, followers, following }) => {
  const [activeView, setActiveView] = useState('connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const viewOptions = [
    { value: 'connections', label: 'Connections', count: connections.length },
    { value: 'followers', label: 'Followers', count: followers.length },
    { value: 'following', label: 'Following', count: following.length }
  ];

  const getCurrentList = () => {
    switch (activeView) {
      case 'followers':
        return followers;
      case 'following':
        return following;
      default:
        return connections;
    }
  };

  const filteredList = getCurrentList().filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = (personId) => {
    console.log('Connect with:', personId);
  };

  const handleMessage = (personId) => {
    console.log('Message:', personId);
  };

  const handleUnfollow = (personId) => {
    console.log('Unfollow:', personId);
  };

  return (
    <div className="space-y-6">
      {/* View Tabs */}
      <div className="flex items-center space-x-1 bg-secondary-50 rounded-lg p-1">
        {viewOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setActiveView(option.value)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === option.value
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <span>{option.label}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              activeView === option.value
                ? 'bg-primary-100 text-primary' :'bg-secondary-200 text-text-muted'
            }`}>
              {option.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"
            />
            <Input
              type="search"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Icon name="ArrowUpDown" size={16} className="text-text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="recent">Recently Connected</option>
            <option value="name">Name (A-Z)</option>
            <option value="mutual">Mutual Connections</option>
          </select>
        </div>
      </div>

      {/* Connections List */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((person) => (
            <div
              key={person.id}
              className="bg-surface border border-border rounded-lg p-4 hover:shadow-md transition-shadow micro-interaction"
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <Image
                    src={person.avatar}
                    alt={person.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {person.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-text-primary truncate">
                      {person.name}
                    </h3>
                    {person.isVerified && (
                      <Icon name="CheckCircle" size={14} className="text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-text-secondary truncate">
                    {person.title}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {person.mutualConnections} mutual connections
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 mt-4">
                {activeView === 'connections' ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleMessage(person.id)}
                      iconName="MessageCircle"
                      className="flex-1"
                    >
                      Message
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleConnect(person.id)}
                    >
                      <Icon name="MoreHorizontal" size={16} />
                    </Button>
                  </>
                ) : activeView === 'followers' ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleConnect(person.id)}
                      iconName="UserPlus"
                      className="flex-1"
                    >
                      Follow Back
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMessage(person.id)}
                    >
                      <Icon name="MessageCircle" size={16} />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUnfollow(person.id)}
                      iconName="UserMinus"
                      className="flex-1"
                    >
                      Unfollow
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMessage(person.id)}
                    >
                      <Icon name="MessageCircle" size={16} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="Users" size={48} className="text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No {activeView} found
          </h3>
          <p className="text-text-muted mb-4">
            {searchQuery
              ? `No results found for "${searchQuery}"`
              : `Start building your professional network.`
            }
          </p>
          <Button variant="primary" iconName="UserPlus" iconPosition="left">
            Find Connections
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConnectionsList;