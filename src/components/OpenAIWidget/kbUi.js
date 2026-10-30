// Shared styles and helpers for the Career Assistant panels.
import { useTheme } from '../../contexts/ThemeContext';
import { industryById, roleById } from '../../data/kb';

export const useKbStyles = () => {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  return {
    dark,
    text: dark ? 'text-white' : 'text-gray-800',
    muted: dark ? 'text-gray-400' : 'text-gray-500',
    select: `w-full min-w-0 text-xs rounded-md border px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary ${
      dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
    }`,
    card: `rounded-lg border ${dark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`,
    rowButton: `w-full text-left text-xs px-3 py-2 rounded-md transition-colors ${
      dark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
    }`,
    badge: `inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full ${
      dark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
    }`,
  };
};

export const itemBadges = (item) =>
  [
    item.industry ? industryById[item.industry].name : 'All industries',
    item.role ? roleById[item.role].shortName : null,
    item.company,
  ].filter(Boolean);
