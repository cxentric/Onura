import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';

const FilePreview = ({ file, onClose, onSelect, isSelected }) => {
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

  const renderPreview = () => {
    switch (file.type) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            {file.thumbnail ? (
              <img
                src={file.thumbnail}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded"
              />
            ) : (
              <Icon name="Image" size={64} className="text-gray-400" />
            )}
          </div>
        );
      
      case 'video':
        return (
          <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
            <div className="text-center">
              <Icon name="Play" size={64} className="text-white mb-4 mx-auto" />
              <p className="text-white text-sm">Video Preview</p>
            </div>
          </div>
        );
      
      case 'pdf': case'document':
        return (
          <div className={`h-64 rounded-lg border-2 border-dashed flex items-center justify-center ${
            theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="text-center">
              <Icon name={getFileIcon(file)} size={64} className={`mb-4 mx-auto ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Document Preview
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={`h-64 rounded-lg border-2 border-dashed flex items-center justify-center ${
            theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="text-center">
              <Icon name={getFileIcon(file)} size={64} className={`mb-4 mx-auto ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Preview not available
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-2xl rounded-lg shadow-xl overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <Icon name={getFileIcon(file)} size={24} className={`${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`} />
            <div>
              <h3 className={`font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {file.name}
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formatFileSize(file.size)} • Modified {file.modified}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 ${
              theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
            }`}
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-4">
          {renderPreview()}
        </div>

        {/* File Details */}
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className={`font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Type:
              </span>
              <span className={`ml-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {file.type.charAt(0).toUpperCase() + file.type.slice(1)}
              </span>
            </div>
            <div>
              <span className={`font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Size:
              </span>
              <span className={`ml-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formatFileSize(file.size)}
              </span>
            </div>
            <div>
              <span className={`font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Modified:
              </span>
              <span className={`ml-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {file.modified}
              </span>
            </div>
            <div>
              <span className={`font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Location:
              </span>
              <span className={`ml-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {file.path || 'Root'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`p-4 border-t flex justify-end space-x-3 ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark' ?'border-gray-600 text-gray-300 hover:bg-gray-700' :'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSelect();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-white ${
              isSelected
                ? 'bg-green-500 hover:bg-green-600' :'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isSelected ? 'Selected' : 'Select File'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FilePreview;