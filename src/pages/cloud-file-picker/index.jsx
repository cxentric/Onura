import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Helmet } from 'react-helmet';
import { AnimatePresence } from 'framer-motion';
import Icon from '../../components/AppIcon';
import CloudServiceTabs from './components/CloudServiceTabs';
import FileExplorer from './components/FileExplorer';
import FilePreview from './components/FilePreview';
import SelectedFilesPanel from './components/SelectedFilesPanel';
import SearchBar from './components/SearchBar';
import RecentFiles from './components/RecentFiles';

const CloudFilePicker = () => {
  const { theme } = useTheme();
  const [activeService, setActiveService] = useState('drive');
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const services = [
    { id: 'drive', name: 'Google Drive', icon: 'HardDrive', connected: true },
    { id: 'dropbox', name: 'Dropbox', icon: 'Cloud', connected: true },
    { id: 'onedrive', name: 'OneDrive', icon: 'Database', connected: false },
    { id: 'icloud', name: 'iCloud', icon: 'CloudSnow', connected: false },
    { id: 'box', name: 'Box', icon: 'Archive', connected: true },
  ];

  const handleFileSelect = (file) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.id === file.id);
      if (isSelected) {
        return prev.filter(f => f.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  const handleFilePreview = (file) => {
    setPreviewFile(file);
  };

  const handleAttachFiles = () => {
    // In a real implementation, this would return the selected files to the parent component
    console.log('Attaching files:', selectedFiles);
    alert(`${selectedFiles.length} files selected for attachment`);
  };

  return (
    <>
      <Helmet>
        <title>Cloud File Picker - cxentric</title>
        <meta name="description" content="Select files from your cloud storage services" />
      </Helmet>

      <div className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {/* Header */}
        <div className={`border-b ${
          theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.history.back()}
                  className={`p-2 rounded-lg hover:bg-gray-100 ${
                    theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'text-gray-600'
                  }`}
                >
                  <Icon name="ArrowLeft" size={20} />
                </button>
                <div>
                  <h1 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Cloud File Picker
                  </h1>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Select files from your cloud storage services
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid' ?'bg-blue-500 text-white'
                        : theme === 'dark' ?'text-gray-400 hover:text-gray-200' :'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon name="Grid3x3" size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list' ?'bg-blue-500 text-white'
                        : theme === 'dark' ?'text-gray-400 hover:text-gray-200' :'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon name="List" size={16} />
                  </button>
                </div>

                {/* Selected Files Counter */}
                {selectedFiles.length > 0 && (
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    theme === 'dark' ?'bg-blue-900 text-blue-200' :'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedFiles.length} selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Cloud Services */}
              <CloudServiceTabs 
                services={services}
                activeService={activeService}
                onServiceChange={setActiveService}
              />

              {/* Recent Files */}
              <RecentFiles onFileSelect={handleFileSelect} />

              {/* Selected Files Panel */}
              {selectedFiles.length > 0 && (
                <SelectedFilesPanel 
                  selectedFiles={selectedFiles}
                  onRemoveFile={(file) => setSelectedFiles(prev => prev.filter(f => f.id !== file.id))}
                  onAttachFiles={handleAttachFiles}
                />
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className={`rounded-lg border ${
                theme === 'dark' ?'bg-gray-800 border-gray-700' :'bg-white border-gray-200'
              }`}>
                {/* Search and Navigation */}
                <div className={`p-4 border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <SearchBar 
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                  
                  {/* Breadcrumb */}
                  {currentPath.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3">
                      <button
                        onClick={() => setCurrentPath([])}
                        className={`text-sm hover:underline ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`}
                      >
                        Home
                      </button>
                      {currentPath.map((folder, index) => (
                        <React.Fragment key={folder}>
                          <Icon name="ChevronRight" size={14} className={
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          } />
                          <button
                            onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                            className={`text-sm hover:underline ${
                              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            }`}
                          >
                            {folder}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>

                {/* File Explorer */}
                <div className="p-4">
                  <FileExplorer
                    activeService={activeService}
                    currentPath={currentPath}
                    onPathChange={setCurrentPath}
                    selectedFiles={selectedFiles}
                    onFileSelect={handleFileSelect}
                    onFilePreview={handleFilePreview}
                    searchQuery={searchQuery}
                    viewMode={viewMode}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File Preview Modal */}
        <AnimatePresence>
          {previewFile && (
            <FilePreview
              file={previewFile}
              onClose={() => setPreviewFile(null)}
              onSelect={() => handleFileSelect(previewFile)}
              isSelected={selectedFiles.some(f => f.id === previewFile.id)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default CloudFilePicker;