import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Icon from '../../../components/AppIcon';

const SearchBar = ({ searchQuery, onSearchChange }) => {
  const { theme } = useTheme();

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon name="Search" size={16} className={`${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`} />
      </div>
      <input
        type="text"
        placeholder="Search files and folders..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          theme === 'dark' ?'bg-gray-700 border-gray-600 text-white placeholder-gray-400' :'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
        }`}
      />
      {searchQuery && (
        <button
          onClick={() => onSearchChange('')}
          className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
            theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Icon name="X" size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;