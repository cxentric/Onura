import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const WidgetContext = createContext();
const TABS = ['learn', 'quiz', 'hashtags'];

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return context;
};

export const WidgetProvider = ({ children }) => {
  const [widgetSettings, setWidgetSettings] = useState(() => {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem('widgetSettings'));
    } catch {
      saved = null;
    }
    if (saved) {
      // Tabs from the old OpenAI widget ('chat', 'image') no longer exist.
      return TABS.includes(saved.activeTab) ? saved : { ...saved, activeTab: 'learn' };
    }
    return {
      position: 'right', // 'left' or 'right'
      isMinimized: true, // Keep minimized by default
      isMaximized: false, // New maximized state
      isVisible: true,
      activeTab: 'learn', // 'learn', 'quiz', 'hashtags'
      hasAutoOpened: false, // Track if auto-open has occurred
      lastInteraction: Date.now() // Track last user interaction
    };
  });

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Remove auto-open functionality - keep widget minimized by default
  useEffect(() => {
    // Clear any existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('widgetSettings', JSON.stringify(widgetSettings));
    } catch {
      // Storage can be unavailable (private mode); settings just won't persist.
    }
  }, [widgetSettings]);

  const updateWidgetSettings = (newSettings) => {
    setWidgetSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Sidebar button: open the panel (on the Learn tab), or minimize it if it is already open.
  const toggleWidget = () => {
    setWidgetSettings(prev => {
      const isOpen = prev.isVisible && !prev.isMinimized;
      return {
        ...prev,
        isVisible: true,
        isMinimized: isOpen,
        isMaximized: false,
        activeTab: isOpen ? prev.activeTab : 'learn',
        lastInteraction: Date.now()
      };
    });
  };

  const minimizeWidget = () => {
    setWidgetSettings(prev => ({ 
      ...prev, 
      isMinimized: !prev.isMinimized,
      isMaximized: false, // Reset maximized state when minimizing
      lastInteraction: Date.now()
    }));
  };

  const maximizeWidget = () => {
    setWidgetSettings(prev => ({ 
      ...prev, 
      isMaximized: !prev.isMaximized,
      isMinimized: false, // Reset minimized state when maximizing
      lastInteraction: Date.now()
    }));
  };

  const closeWidget = () => {
    setWidgetSettings(prev => ({ 
      ...prev, 
      isMinimized: true,
      isMaximized: false, // Reset maximized state when closing
      lastInteraction: Date.now()
    }));
  };

  const setActiveTab = (tab) => {
    setWidgetSettings(prev => ({ 
      ...prev, 
      activeTab: tab,
      lastInteraction: Date.now()
    }));
  };

  const switchPosition = (position) => {
    setWidgetSettings(prev => ({ ...prev, position }));
  };

  return (
    <WidgetContext.Provider value={{
      widgetSettings,
      updateWidgetSettings,
      toggleWidget,
      minimizeWidget,
      maximizeWidget,
      closeWidget,
      setActiveTab,
      switchPosition
    }}>
      {children}
    </WidgetContext.Provider>
  );
};