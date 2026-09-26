import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';

const Header = () => {
  const location = useLocation();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
  { id: 1, type: 'connection', message: 'Sarah Johnson wants to connect', time: '2m ago', unread: true },
  { id: 2, type: 'message', message: 'New message from Alex Chen', time: '5m ago', unread: true },
  { id: 3, type: 'ai', message: 'AI found 3 relevant connections for you', time: '1h ago', unread: false }]
  );
  const searchRef = useRef(null);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    setShowNotifications(false);
  };

  const isAuthPage = location.pathname === '/login-register';

  if (isAuthPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-100 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/assets/images/cxentric-1751655797090.png" 
                alt="CXentric Logo" 
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-8 h-8 bg-primary rounded-lg items-center justify-center hidden">
                <Icon name="Network" size={20} color="white" />
              </div>
              <span className="text-xl font-heading font-semibold text-text-primary">
                CXentric
              </span>
            </Link>
          </div>
        </div>
      </header>);

  }

  return (
    <header className="fixed top-0 left-0 right-0 z-100 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard-feed" className="flex items-center space-x-2 flex-shrink-0">
            <img 
              src="/assets/images/cxentric-1751655797090.png" 
              alt="CXentric Logo" 
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-8 h-8 bg-primary rounded-lg items-center justify-center hidden">
              <Icon name="Network" size={20} color="white" className="block" />
            </div>
            <span className="hidden sm:block text-xl font-heading font-semibold text-text-primary">CXentric
            </span>
          </Link>

          {/* Desktop Navigation - Remove Feed, Profile, Messages */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Navigation items removed as requested */}
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Icon
                  name="Search"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />

                <Input
                  type="search"
                  placeholder="Search professionals, content, or companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchExpanded(true)}
                  className="pl-10 pr-4 py-2 w-full bg-secondary-50 border-0 rounded-lg focus:bg-surface focus:ring-2 focus:ring-primary transition-all" />

              </div>
              {isSearchExpanded && searchQuery &&
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg p-4 content-reveal">
                  <div className="text-sm text-text-muted mb-2">Search suggestions</div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-2 hover:bg-secondary-50 rounded-lg cursor-pointer">
                      <Icon name="User" size={16} className="text-text-muted" />
                      <span className="text-sm">People named "{searchQuery}"</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 hover:bg-secondary-50 rounded-lg cursor-pointer">
                      <Icon name="FileText" size={16} className="text-text-muted" />
                      <span className="text-sm">Posts about "{searchQuery}"</span>
                    </div>
                  </div>
                </div>
              }
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}>

              <Icon name="Search" size={20} />
            </Button>

            {/* Messaging Icon */}
            <Link to="/messaging-chat">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex items-center space-x-2 hover:bg-secondary-50 transition-colors"
                title="Messages">
                <Icon name="MessageCircle" size={20} className="text-text-secondary" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden"
                title="Messages">
                <Icon name="MessageCircle" size={18} className="text-text-secondary" />
              </Button>
            </Link>

            {/* Compose Button */}
            <Link to="/compose-publishing-tools">
              <Button
                variant="primary"
                size="sm"
                iconName="Plus"
                iconPosition="left"
                className="hidden sm:flex floating-action">

                Compose
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="sm:hidden floating-action">

                <Icon name="Plus" size={18} />
              </Button>
            </Link>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative">

                <Icon name="Bell" size={20} />
                {unreadCount > 0 &&
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center ai-indicator">
                    {unreadCount}
                  </span>
                }
              </Button>

              {showNotifications &&
              <div className="absolute top-full right-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg content-reveal">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-medium text-text-primary">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) =>
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-border-muted cursor-pointer hover:bg-secondary-50 transition-colors ${
                    notification.unread ? 'bg-primary-50' : ''}`
                    }>

                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.unread ? 'bg-primary' : 'bg-transparent'}`
                      } />
                          <div className="flex-1">
                            <p className="text-sm text-text-primary">{notification.message}</p>
                            <p className="text-xs text-text-muted mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                  )}
                  </div>
                  <div className="p-4 border-t border-border">
                    <Button variant="ghost" size="sm" fullWidth>
                      View all notifications
                    </Button>
                  </div>
                </div>
              }
            </div>

            {/* Profile Menu */}
            <Link to="/profile-management">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} className="text-text-muted" />
                </div>
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Search Expanded */}
        {isSearchExpanded &&
        <div className="md:hidden border-t border-border p-4">
            <form onSubmit={handleSearchSubmit}>
              <Input
              type="search"
              placeholder="Search professionals, content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              autoFocus />

            </form>
          </div>
        }
      </div>
    </header>);

};

export default Header;