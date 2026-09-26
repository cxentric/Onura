import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useWidget } from '../../contexts/WidgetContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { widgetSettings, toggleWidget } = useWidget();

  const navigationItems = [
  {
    label: 'Compose',
    path: '/compose-publishing-tools',
    icon: 'Edit3',
    description: 'Create and publish content'
  }];

  const handleConnectionsClick = () => {
    navigate('/profile-management');
    // Set the active tab to connections after navigation
    setTimeout(() => {
      const event = new CustomEvent('setProfileTab', { detail: 'connections' });
      window.dispatchEvent(event);
    }, 100);
  };

  const quickActions = [
  {
    label: 'Career Assistant',
    icon: 'GraduationCap',
    action: () => toggleWidget(),
    badge: widgetSettings.isVisible ? null : 'New',
    description: 'Career Q&A and quizzes by industry',
    isAI: true
  },
  {
    label: 'AI Insights',
    icon: 'Zap',
    action: () => console.log('AI Insights clicked'),
    badge: '3',
    description: 'View AI-powered recommendations'
  },
  {
    label: 'Connections',
    icon: 'Users',
    action: handleConnectionsClick,
    description: 'Manage your professional network'
  },
  {
    label: 'Analytics',
    icon: 'BarChart3',
    action: () => console.log('Analytics clicked'),
    description: 'Track your content performance'
  }];


  const isAuthPage = location.pathname === '/login-register';

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div className="lg:hidden">
        {/* Mobile navigation is handled by Header component */}
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-100 lg:block lg:bg-surface lg:border-r lg:border-border lg:pt-16 ${
      isCollapsed ? 'lg:w-16' : 'lg:w-64'} transition-all duration-200 ease-out`
      }>
        <div className="flex flex-col h-full">
          {/* Collapse Toggle */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-border-muted`}>
            {!isCollapsed &&
            <h2 className="text-sm font-medium text-text-secondary">Navigation</h2>
            }
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="micro-interaction flex items-center justify-center">

              <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={16} />
            </Button>
          </div>

          {/* Theme Toggle */}
          <div className="p-4 border-b border-border-muted">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!isCollapsed &&
              <span className="text-sm font-medium text-text-secondary">Theme</span>
              }
              <div className="flex items-center space-x-2">
                {!isCollapsed &&
                <Icon name="Sun" size={16} className="text-text-muted" />
                }
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`
                  }
                  title={isCollapsed ? `Switch to ${theme === 'light' ? 'dark' : 'light'} mode` : ''}>

                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`
                    } />

                </button>
                {!isCollapsed &&
                <Icon name="Moon" size={16} className="text-text-muted" />
                }
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-3 py-3'} rounded-lg text-sm font-medium transition-all micro-interaction group ${
                  isActive ?
                  'text-primary bg-primary-50 border border-primary-100' : 'text-text-secondary hover:text-text-primary hover:bg-secondary-50'}`
                  }
                  title={isCollapsed ? item.label : ''}>

                  <div className="flex items-center justify-center min-w-[20px]">
                    <Icon
                      name={item.icon}
                      size={20}
                      className={isActive ? 'text-primary' : 'text-current'} />

                  </div>
                  {!isCollapsed &&
                  <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.label}</div>
                      <div className="text-xs text-text-muted mt-0.5 group-hover:text-text-secondary transition-colors truncate">
                        {item.description}
                      </div>
                    </div>
                  }
                  {isActive && !isCollapsed &&
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  }
                </Link>);

            })}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t border-border-muted">
            {!isCollapsed &&
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
            }
            <div className="space-y-2">
              {quickActions.map((action, index) =>
              <button
                key={index}
                onClick={action.action}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-3 py-2' : 'space-x-3 px-3 py-2'} rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-secondary-50 transition-all micro-interaction group ${
                action.isAI ? 'border-2 border-primary-200 bg-primary-50 hover:bg-primary-100' : ''}`
                }
                title={isCollapsed ? action.label : ''}>

                  <div className="relative flex items-center justify-center min-w-[18px]">
                    {action.isAI ?
                  <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 via-blue-500 via-purple-500 via-pink-500 via-orange-400 to-yellow-400 p-0.5">
                        <div className={`w-full h-full rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`
                    }>
                          <Icon name={action.icon} size={14} className="text-primary" />
                        </div>
                      </div> :

                  <Icon name={action.icon} size={18} />
                  }
                    {action.badge &&
                  <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full flex items-center justify-center ${
                  action.isAI ? 'bg-primary text-white' : 'bg-accent text-white'} ai-indicator`
                  }>
                        {action.badge}
                      </span>
                  }
                  </div>
                  {!isCollapsed &&
                <div className="flex-1 text-left min-w-0">
                      <div className={`font-medium truncate ${action.isAI ? 'text-primary' : ''}`}>
                        {action.label}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5 group-hover:text-text-secondary transition-colors truncate">
                        {action.description}
                      </div>
                    </div>
                }
                </button>
              )}
            </div>
          </div>

          {/* User Status */}
          <div className="p-4 border-t border-border-muted">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} className="text-text-muted" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface" />
              </div>
              {!isCollapsed &&
              <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">
                    Professional User
                  </div>
                  <div className="text-xs text-text-muted">Online</div>
                </div>
              }
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-100 bg-surface border-t border-border">
        <div className="flex items-center justify-around py-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors micro-interaction ${
                action.isAI ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <div className="flex items-center justify-center relative">
                {action.isAI ? (
                  <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 via-blue-500 via-purple-500 via-pink-500 via-orange-400 to-yellow-400 p-0.5">
                    <div className={`w-full h-full rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                    }`}>
                      <Icon name={action.icon} size={14} className="text-primary" />
                    </div>
                  </div>
                ) : (
                  <Icon
                    name={action.icon}
                    size={20}
                    className={action.isAI ? 'text-primary' : 'text-current'}
                  />
                )}
                {action.badge && (
                  <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full flex items-center justify-center ${
                    action.isAI ? 'bg-primary text-white' : 'bg-accent text-white'
                  } ai-indicator`}>
                    {action.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>);

};

export default Sidebar;