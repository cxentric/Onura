import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Predefined color themes
const colorThemes = {
  default: {
    name: 'Default Blue',
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#8b5cf6',
  },
  corporate: {
    name: 'Corporate Blue',
    primary: '#1e40af',
    secondary: '#374151',
    accent: '#0ea5e9',
  },
  creative: {
    name: 'Creative Purple',
    primary: '#7c3aed',
    secondary: '#6b7280',
    accent: '#ec4899',
  },
  entrepreneur: {
    name: 'Entrepreneur Green',
    primary: '#059669',
    secondary: '#4b5563',
    accent: '#f59e0b',
  },
  custom: {
    name: 'Custom',
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#8b5cf6',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  const [colorTheme, setColorTheme] = useState(() => {
    const savedColorTheme = localStorage.getItem('colorTheme');
    return savedColorTheme || 'default';
  });

  const [customColors, setCustomColors] = useState(() => {
    const savedCustomColors = localStorage.getItem('customColors');
    return savedCustomColors ? JSON.parse(savedCustomColors) : colorThemes.custom;
  });

  const [accessibility, setAccessibility] = useState(() => {
    const savedAccessibility = localStorage.getItem('accessibility');
    return savedAccessibility ? JSON.parse(savedAccessibility) : {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium', // small, medium, large
    };
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('colorTheme', colorTheme);
    localStorage.setItem('customColors', JSON.stringify(customColors));
    localStorage.setItem('accessibility', JSON.stringify(accessibility));
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply color theme CSS variables
    const currentColors = colorTheme === 'custom' ? customColors : colorThemes[colorTheme];
    const root = document.documentElement;
    
    if (currentColors) {
      root.style.setProperty('--color-primary', currentColors.primary);
      root.style.setProperty('--color-secondary', currentColors.secondary);
      root.style.setProperty('--color-accent', currentColors.accent);
    }

    // Apply accessibility settings
    if (accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (accessibility.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    root.setAttribute('data-font-size', accessibility.fontSize);

  }, [theme, colorTheme, customColors, accessibility]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setThemeMode = (mode) => {
    if (mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } else {
      setTheme(mode);
    }
  };

  const updateColorTheme = (themeName) => {
    setColorTheme(themeName);
  };

  const updateCustomColors = (colors) => {
    setCustomColors(prev => ({ ...prev, ...colors }));
  };

  const updateAccessibility = (settings) => {
    setAccessibility(prev => ({ ...prev, ...settings }));
  };

  const getCurrentColors = () => {
    return colorTheme === 'custom' ? customColors : colorThemes[colorTheme];
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setThemeMode,
      colorTheme,
      updateColorTheme,
      customColors,
      updateCustomColors,
      accessibility,
      updateAccessibility,
      colorThemes,
      getCurrentColors,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};