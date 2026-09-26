import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';

const SelectedFilesPanel = ({ selectedFiles, onRemoveFile, onAttachFiles }) => {
  const { theme } = useTheme();

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

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border ${
        theme === 'dark' ?'bg-gray-800 border-gray-700' :'bg-white border-gray-200'
      }`}
    >
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Selected Files
          </h3>
          <span className={`text-sm px-2 py-1 rounded ${
            theme === 'dark' ?'bg-blue-900 text-blue-200' :'bg-blue-100 text-blue-800'
          }`}>
            {selectedFiles.length}
          </span>
        </div>
        <p className={`text-sm mt-1 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Total size: {formatFileSize(totalSize)}
        </p>
      </div>

      <div className="p-2 max-h-64 overflow-y-auto">
        {selectedFiles.map((file) => (
          <div
            key={file.id}
            className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 ${
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
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              onClick={() => onRemoveFile(file)}
              className={`p-1 rounded hover:bg-gray-100 ${
                theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'text-gray-500'
              }`}
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className={`p-4 border-t ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <button
          onClick={onAttachFiles}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Attach {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
        </button>
      </div>
    </motion.div>
  );
};

export default SelectedFilesPanel;