import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const WidgetContext = createContext();

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return context;
};

export const WidgetProvider = ({ children }) => {
  const [widgetSettings, setWidgetSettings] = useState(() => {
    const saved = localStorage.getItem('widgetSettings');
    return saved ? JSON.parse(saved) : {
      position: 'right', // 'left' or 'right'
      isMinimized: true, // Keep minimized by default
      isMaximized: false, // New maximized state
      isVisible: true,
      activeTab: 'chat', // 'chat', 'image', 'hashtags'
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
    localStorage.setItem('widgetSettings', JSON.stringify(widgetSettings));
  }, [widgetSettings]);

  const updateWidgetSettings = (newSettings) => {
    setWidgetSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleWidget = () => {
    setWidgetSettings(prev => ({ 
      ...prev, 
      isVisible: !prev.isVisible,
      // When opening from sidebar, ensure it opens in chat mode and not minimized
      isMinimized: prev.isVisible ? true : false,
      activeTab: prev.isVisible ? prev.activeTab : 'chat',
      lastInteraction: Date.now()
    }));
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