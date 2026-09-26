import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ProfileTabs = ({ activeTab, onTabChange, stats }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const primaryTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'User',
      count: null
    },
    {
      id: 'posts',
      label: 'Posts',
      icon: 'FileText',
      count: stats?.posts
    }
  ];

  const secondaryTabs = [
    {
      id: 'connections',
      label: 'Connections',
      icon: 'Users',
      count: stats?.connections
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: 'FolderOpen',
      count: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
      count: null
    }
  ];

  const allTabs = [...primaryTabs, ...secondaryTabs];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTabChange = (tabId) => {
    onTabChange(tabId);
    setIsDropdownOpen(false);
  };

  const getActiveTabFromSecondary = () => {
    return secondaryTabs.find(tab => tab.id === activeTab);
  };

  return (
    <div className="bg-surface border-b border-border">
      <div className="px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          {/* Desktop Navigation - All tabs visible */}
          <div className="hidden md:flex space-x-8 overflow-x-auto">
            {allTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors micro-interaction ${
                  activeTab === tab.id
                    ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary hover:border-secondary-300'
                }`}
              >
                <Icon name={tab.icon} size={18} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary' : 'bg-secondary-100 text-text-muted'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Navigation - Only Overview and Posts visible with dropdown */}
          <div className="md:hidden flex items-center w-full">
            <div className="flex space-x-6 flex-1">
              {primaryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors micro-interaction ${
                    activeTab === tab.id
                      ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary hover:border-secondary-300'
                  }`}
                >
                  <Icon name={tab.icon} size={18} />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary' : 'bg-secondary-100 text-text-muted'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Three dots dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center space-x-2 py-4 px-3 border-b-2 font-medium text-sm transition-colors micro-interaction ${
                  getActiveTabFromSecondary()
                    ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary hover:border-secondary-300'
                }`}
              >
                <Icon name="MoreHorizontal" size={18} />
                {getActiveTabFromSecondary() && (
                  <span className="px-2 py-1 rounded-full text-xs bg-primary-100 text-primary">
                    {getActiveTabFromSecondary().count || ''}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {secondaryTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors hover:bg-secondary-50 ${
                          activeTab === tab.id
                            ? 'text-primary bg-primary-50' : 'text-text-secondary'
                        }`}
                      >
                        <Icon name={tab.icon} size={16} />
                        <span className="flex-1 text-left">{tab.label}</span>
                        {tab.count !== null && (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            activeTab === tab.id
                              ? 'bg-primary-100 text-primary' : 'bg-secondary-100 text-text-muted'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default ProfileTabs;