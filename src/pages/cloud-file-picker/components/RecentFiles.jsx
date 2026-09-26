import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Icon from '../../../components/AppIcon';

const RecentFiles = ({ onFileSelect }) => {
  const { theme } = useTheme();

  // Mock recent files data
  const recentFiles = [
    {
      id: 'r1',
      name: 'Project Brief.pdf',
      type: 'pdf',
      size: 1.2,
      modified: '2024-01-15',
      service: 'Google Drive',
    },
    {
      id: 'r2',
      name: 'Team Meeting.mp4',
      type: 'video',
      size: 15.8,
      modified: '2024-01-14',
      service: 'Dropbox',
    },
    {
      id: 'r3',
      name: 'Logo Design.png',
      type: 'image',
      size: 0.8,
      modified: '2024-01-13',
      service: 'Google Drive',
    },
  ];

  const getFileIcon = (file) => {
    switch (file.type) {
      case 'document': return 'FileText';
      case 'image': return 'Image';
      case 'video': return 'Video';
      case 'audio': return 'Music';
      case 'pdf': return 'FileText';
      case 'spreadsheet': return 'FileSpreadsheet';
      case 'presentation': return 'Presentation';
      default: return 'File';
    }
  };

  const formatFileSize = (sizeInMB) => {
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)} KB`;
    return `${sizeInMB.toFixed(1)} MB`;
  };

  return (
    <div className={`rounded-lg border ${
      theme === 'dark' ?'bg-gray-800 border-gray-700' :'bg-white border-gray-200'
    }`}>
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`font-medium ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Recent Files
        </h3>
      </div>
      
      <div className="p-2">
        {recentFiles.map((file) => (
          <button
            key={file.id}
            onClick={() => onFileSelect(file)}
            className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left hover:bg-gray-50 ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
          >
            <Icon
              name={getFileIcon(file)}
              size={16}
              className={`flex-shrink-0 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                {file.name}
              </p>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formatFileSize(file.size)} • {file.service}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentFiles;