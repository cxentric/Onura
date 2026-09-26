import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';

const FileExplorer = ({ 
  activeService, 
  currentPath, 
  onPathChange, 
  selectedFiles, 
  onFileSelect, 
  onFilePreview, 
  searchQuery, 
  viewMode 
}) => {
  const { theme } = useTheme();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock file data - in a real implementation, this would come from cloud service APIs
  const mockFiles = [
    {
      id: '1',
      name: 'Project Proposal.docx',
      type: 'document',
      size: 2.5,
      modified: '2024-01-15',
      thumbnail: null,
      isFolder: false,
      path: 'Documents',
    },
    {
      id: '2',
      name: 'Team Photo.jpg',
      type: 'image',
      size: 1.2,
      modified: '2024-01-14',
      thumbnail: '/assets/images/no_image.png',
      isFolder: false,
      path: 'Images',
    },
    {
      id: '3',
      name: 'Presentation.pptx',
      type: 'presentation',
      size: 5.8,
      modified: '2024-01-13',
      thumbnail: null,
      isFolder: false,
      path: 'Documents',
    },
    {
      id: '4',
      name: 'Budget Analysis.xlsx',
      type: 'spreadsheet',
      size: 0.8,
      modified: '2024-01-12',
      thumbnail: null,
      isFolder: false,
      path: 'Documents',
    },
    {
      id: '5',
      name: 'Documents',
      type: 'folder',
      size: 0,
      modified: '2024-01-10',
      thumbnail: null,
      isFolder: true,
      path: '',
    },
    {
      id: '6',
      name: 'Images',
      type: 'folder',
      size: 0,
      modified: '2024-01-09',
      thumbnail: null,
      isFolder: true,
      path: '',
    },
    {
      id: '7',
      name: 'Marketing Video.mp4',
      type: 'video',
      size: 25.4,
      modified: '2024-01-08',
      thumbnail: null,
      isFolder: false,
      path: 'Videos',
    },
    {
      id: '8',
      name: 'Meeting Notes.pdf',
      type: 'pdf',
      size: 0.5,
      modified: '2024-01-07',
      thumbnail: null,
      isFolder: false,
      path: 'Documents',
    },
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let filteredFiles = mockFiles;
      
      // Filter by current path
      if (currentPath.length === 0) {
        filteredFiles = mockFiles.filter(file => file.path === '' || file.isFolder);
      } else {
        const currentFolder = currentPath[currentPath.length - 1];
        filteredFiles = mockFiles.filter(file => file.path === currentFolder);
      }
      
      // Filter by search query
      if (searchQuery) {
        filteredFiles = filteredFiles.filter(file =>
          file.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setFiles(filteredFiles);
      setLoading(false);
    }, 500);
  }, [activeService, currentPath, searchQuery]);

  const getFileIcon = (file) => {
    if (file.isFolder) return 'Folder';
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

  const handleFileClick = (file) => {
    if (file.isFolder) {
      onPathChange([...currentPath, file.name]);
    } else {
      onFilePreview(file);
    }
  };

  const handleFileSelect = (e, file) => {
    e.stopPropagation();
    if (!file.isFolder) {
      onFileSelect(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="FolderOpen" size={48} className={`mx-auto mb-4 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <p className={`text-lg font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          No files found
        </p>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {searchQuery ? 'Try adjusting your search query' : 'This folder is empty'}
        </p>
      </div>
    );
  }

  return (
    <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}`}>
      {files.map((file) => (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative group cursor-pointer ${
            viewMode === 'grid' 
              ? `p-4 rounded-lg border hover:shadow-md transition-all ${
                  theme === 'dark' ?'border-gray-700 hover:border-gray-600 bg-gray-800' :'border-gray-200 hover:border-gray-300 bg-white'
                }`
              : `flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`
          }`}
          onClick={() => handleFileClick(file)}
        >
          {/* Selection Checkbox */}
          {!file.isFolder && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleFileSelect(e, file)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  selectedFiles.some(f => f.id === file.id)
                    ? 'bg-blue-500 border-blue-500'
                    : theme === 'dark' ?'border-gray-600 hover:border-gray-500' :'border-gray-300 hover:border-gray-400'
                }`}
              >
                {selectedFiles.some(f => f.id === file.id) && (
                  <Icon name="Check" size={12} className="text-white" />
                )}
              </button>
            </div>
          )}

          {viewMode === 'grid' ? (
            <div className="text-center">
              {/* File Icon/Thumbnail */}
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                {file.thumbnail ? (
                  <img
                    src={file.thumbnail}
                    alt={file.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <Icon 
                    name={getFileIcon(file)} 
                    size={32} 
                    className={`${
                      file.isFolder 
                        ? 'text-blue-500' 
                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  />
                )}
              </div>
              
              {/* File Info */}
              <div className="space-y-1">
                <p className={`text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {file.name}
                </p>
                {!file.isFolder && (
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {formatFileSize(file.size)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* File Icon */}
              <div className="flex-shrink-0">
                {file.thumbnail ? (
                  <img
                    src={file.thumbnail}
                    alt={file.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                ) : (
                  <Icon 
                    name={getFileIcon(file)} 
                    size={20} 
                    className={`${
                      file.isFolder 
                        ? 'text-blue-500' 
                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  />
                )}
              </div>
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {file.name}
                </p>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {file.isFolder ? 'Folder' : `${formatFileSize(file.size)} • ${file.modified}`}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilePreview(file);
                  }}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <Icon name="Eye" size={16} />
                </button>
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default FileExplorer;