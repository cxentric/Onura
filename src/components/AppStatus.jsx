import React, { useState } from 'react';
import Icon from './AppIcon';
import { useSettings } from '../services/appSettings';

const DISMISSED_KEY = 'cxentric.dismissedAnnouncement';
const LEVELS = {
  info: { bar: 'bg-primary text-white', icon: 'Megaphone' },
  success: { bar: 'bg-success text-white', icon: 'CheckCircle' },
  warning: { bar: 'bg-amber-500 text-white', icon: 'AlertCircle' },
};

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY);
  } catch {
    return null;
  }
};

/** The announcement set in the admin console, under the header. Dismissing hides that message only. */
export const AnnouncementBanner = () => {
  const { announcement_text: text, announcement_level: level } = useSettings();
  const [dismissed, setDismissed] = useState(readDismissed);
  if (!text || dismissed === text) return null;

  const style = LEVELS[level] || LEVELS.info;
  const dismiss = () => {
    setDismissed(text);
    try {
      localStorage.setItem(DISMISSED_KEY, text);
    } catch {
      // Hidden for this visit only.
    }
  };

  return (
    <div className={`fixed top-16 inset-x-0 z-40 ${style.bar} shadow`} role="status">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center space-x-2 text-sm">
        <Icon name={style.icon} size={16} className="flex-shrink-0" />
        <p className="flex-1">{text}</p>
        <button onClick={dismiss} aria-label="Dismiss announcement" className="p-1 rounded hover:bg-white/20">
          <Icon name="X" size={16} />
        </button>
      </div>
    </div>
  );
};

/** Full-screen notice while maintenance mode is on in the admin console. */
export const MaintenanceScreen = ({ children }) => {
  const { maintenance_mode: on, maintenance_message: message } = useSettings();
  if (!on) return children;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <img src="/assets/images/logo.webp" alt="CXentric" className="w-16 h-16 mb-4" />
      <h1 className="text-xl font-semibold text-text-primary">We’ll be right back</h1>
      <p className="mt-2 max-w-md text-text-secondary">{message}</p>
    </div>
  );
};
