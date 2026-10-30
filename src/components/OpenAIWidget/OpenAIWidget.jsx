import React, { Suspense, lazy, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../AppIcon';
import { useWidget } from '../../contexts/WidgetContext';
import { useTheme } from '../../contexts/ThemeContext';
import { activeStreak, dailyDone, useProgress } from '../../services/progressStore';
import { accountsEnabled, isPro, useAuth } from '../../services/auth';
import { useSettings } from '../../services/appSettings';
// Panels (and the knowledge base they use) load only when the assistant is opened.
const TodayPanel = lazy(() => import('./TodayPanel'));
const LearnPanel = lazy(() => import('./LearnPanel'));
const QuizPanel = lazy(() => import('./QuizPanel'));
const HashtagGenerator = lazy(() => import('./HashtagGenerator'));
const CoachPanel = lazy(() => import('./CoachPanel'));
const AccountPanel = lazy(() => import('./AccountPanel'));

const OpenAIWidget = () => {
  const { widgetSettings, minimizeWidget, maximizeWidget, closeWidget, setActiveTab } = useWidget();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const progress = useProgress();
  const auth = useAuth();
  const settings = useSettings();
  const pro = isPro(auth);
  const streak = activeStreak(progress);
  const challengePending = !dailyDone(progress);

  const { position, isMinimized, isMaximized, isVisible, activeTab } = widgetSettings;

  if (!isVisible) return null;

  // Side comes from the profile setting. Below lg there is a bottom nav bar, so sit above it (bottom-20).
  // Maximized: fill the screen below the fixed 64px header.
  const sideClass = position === 'left' ? 'left-4' : 'right-4';
  const responsiveClasses = isMaximized
    ? 'left-4 right-4 top-20 bottom-20 lg:bottom-4'
    : `${sideClass} bottom-20 lg:bottom-4`;

  const tabs = [
    { id: 'today', label: 'Today', icon: 'Flame' },
    { id: 'learn', label: 'Learn', icon: 'BookOpen' },
    { id: 'quiz', label: 'Quiz', icon: 'ListChecks' },
    settings.feature_ai_coach && { id: 'coach', label: 'Coach', icon: 'Bot' },
    settings.feature_hashtags && { id: 'hashtags', label: 'Tags', icon: 'Hash' }
  ].filter(Boolean);
  // A tab switched off in the admin console falls back to Today.
  const currentTab = activeTab === 'account' || tabs.some((t) => t.id === activeTab) ? activeTab : 'today';

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'learn':
        return <LearnPanel />;
      case 'quiz':
        return <QuizPanel />;
      case 'coach':
        return <CoachPanel />;
      case 'account':
        return <AccountPanel />;
      case 'hashtags':
        return <HashtagGenerator setIsLoading={setIsLoading} />;
      default:
        return <TodayPanel />;
    }
  };

  return (
    <div className={`fixed ${responsiveClasses} z-50`}>
      <AnimatePresence>
        {isMinimized ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={`relative w-14 h-14 rounded-full shadow-lg cursor-pointer flex items-center justify-center ${
              theme === 'dark' ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
            }`}
            onClick={minimizeWidget}
          >
            {/* Colorful circular gradient background - Meta AI style */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400 via-blue-500 via-purple-500 via-pink-500 via-orange-400 to-yellow-400 p-0.5">
              <div className={`w-full h-full rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <img 
                  src="/assets/images/logo.webp" 
                  alt="Career Assistant" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
            </div>
            
            {/* Streak badge and a dot while today's challenge is pending: a nudge to come back daily */}
            {streak > 0 && (
              <span className="absolute -top-1 -left-1 flex items-center px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold shadow" aria-label={`${streak}-day streak`}>
                <Icon name="Flame" size={10} className="mr-0.5" />
                {streak}
              </span>
            )}
            {challengePending && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-error border-2 border-white" aria-label="Today's challenge is waiting" />
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`${
              isMaximized ? 'w-full h-full' : 'w-80 h-96'
            } flex flex-col rounded-lg shadow-xl border overflow-hidden ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`p-3 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center space-x-2">
                {/* Colorful circular gradient icon */}
                <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 via-blue-500 via-purple-500 via-pink-500 via-orange-400 to-yellow-400 p-0.5">
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <img 
                      src="/assets/images/logo.webp" 
                      alt="Career Assistant" 
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className={`text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Career Assistant
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {accountsEnabled && (
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`flex items-center space-x-1 px-1.5 py-1 rounded text-[11px] font-semibold ${
                      pro
                        ? 'text-amber-500'
                        : theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-100'
                    } ${activeTab === 'account' ? (theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200') : ''}`}
                    title={auth.status === 'signed-in' ? 'Account and plan' : 'Sign in or go Pro'}
                  >
                    <Icon name={pro ? 'Crown' : auth.status === 'signed-in' ? 'User' : 'LogIn'} size={14} />
                    <span>{pro ? 'Pro' : auth.status === 'signed-in' ? 'Free' : 'Sign in'}</span>
                  </button>
                )}
                <button
                  onClick={minimizeWidget}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    theme === 'dark' ? 'hover:bg-gray-600 text-gray-300' : 'text-gray-600'
                  }`}
                  title="Minimize"
                >
                  <Icon name="Minus" size={16} />
                </button>
                <button
                  onClick={maximizeWidget}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    theme === 'dark' ? 'hover:bg-gray-600 text-gray-300' : 'text-gray-600'
                  }`}
                  title={isMaximized ? "Restore" : "Maximize"}
                >
                  <Icon name={isMaximized ? "Minimize2" : "Maximize2"} size={16} />
                </button>
                <button
                  onClick={closeWidget}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    theme === 'dark' ? 'hover:bg-gray-600 text-gray-300' : 'text-gray-600'
                  }`}
                  title="Close"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className={`flex border-b ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-1 py-2 px-1 text-xs font-medium transition-colors ${
                    currentTab === tab.id
                      ? theme === 'dark' ? 'bg-gray-700 text-white border-b-2 border-primary' : 'bg-white text-gray-900 border-b-2 border-primary'
                      : theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon name={tab.icon} size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <Suspense fallback={<div className="p-4 text-xs text-center text-gray-500">Loading…</div>}>
                {renderActiveTab()}
              </Suspense>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OpenAIWidget;