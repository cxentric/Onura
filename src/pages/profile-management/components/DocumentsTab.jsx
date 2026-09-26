import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import CloudPickerDropdown from '../../../components/ui/CloudPickerDropdown';

const DocumentsTab = () => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Resume_2024.pdf',
      type: 'pdf',
      size: '2.3 MB',
      uploadedAt: '2024-01-15',
      source: 'local',
      url: '#',
      thumbnail: null
    },
    {
      id: 2,
      name: 'Portfolio_Presentation.pptx',
      type: 'pptx',
      size: '15.7 MB',
      uploadedAt: '2024-01-12',
      source: 'google-drive',
      url: '#',
      thumbnail: null
    },
    {
      id: 3,
      name: 'Project_Requirements.docx',
      type: 'docx',
      size: '1.2 MB',
      uploadedAt: '2024-01-10',
      source: 'dropbox',
      url: '#',
      thumbnail: null
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'size'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'
  const [isUploading, setIsUploading] = useState(false);

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      case 'size':
        return parseFloat(b.size) - parseFloat(a.size);
      default:
        return 0;
    }
  });

  const handleLocalUpload = (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    
    files.forEach(file => {
      const newDoc = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type.split('/')[1] || 'unknown',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        source: 'local',
        url: URL.createObjectURL(file),
        thumbnail: null
      };
      setDocuments(prev => [...prev, newDoc]);
    });
    
    setTimeout(() => setIsUploading(false), 1000);
  };

  const handleCloudFilesSelected = (files) => {
    if (files?.length > 0) {
      const newDocs = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type?.split('/')[1] || 'unknown',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        source: file.source || 'cloud',
        url: file.url,
        thumbnail: file.thumbnail
      }));
      setDocuments(prev => [...prev, ...newDocs]);
    }
  };

  const handleDeleteDocument = (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    }
  };

  const handleDownloadDocument = (doc) => {
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    link.click();
  };

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'FileText';
      case 'doc': case'docx':
        return 'FileText';
      case 'ppt': case'pptx':
        return 'Presentation';
      case 'xls': case'xlsx':
        return 'Sheet';
      case 'jpg': case'jpeg': case'png': case'gif':
        return 'Image';
      case 'mp4': case'avi': case'mov':
        return 'Video';
      case 'mp3': case'wav':
        return 'Music';
      default:
        return 'File';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'google-drive':
        return 'HardDrive';
      case 'dropbox':
        return 'Cloud';
      case 'onedrive':
        return 'Database';
      case 'local':
        return 'Upload';
      default:
        return 'File';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Documents</h2>
          <p className="text-text-muted">
            Manage your documents and files from local storage and cloud services
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            type="file"
            multiple
            onChange={handleLocalUpload}
            className="hidden"
            id="local-upload"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('local-upload').click()}
            iconName="Upload"
            iconPosition="left"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Local'}
          </Button>
          
          <CloudPickerDropdown
            variant="button"
            size="sm"
            buttonText="Cloud Upload"
            onFilesSelected={handleCloudFilesSelected}
            allowMultiple={true}
            acceptedTypes={['*/*']}
            showConnectedOnly={false}
          />
        </div>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Search documents and content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            <option value="size">Sort by Size</option>
          </select>
          
          <div className="flex items-center border border-border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Icon name="Grid3x3" size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <Icon name="List" size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Documents Grid/List */}
      {sortedDocuments.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="FolderOpen" size={48} className="mx-auto text-text-muted mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {searchQuery ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="text-text-muted mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms' :'Upload your first document to get started'
            }
          </p>
          {!searchQuery && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById('local-upload').click()}
                iconName="Upload"
                iconPosition="left"
              >
                Upload Local File
              </Button>
              <CloudPickerDropdown
                variant="button"
                buttonText="Add from Cloud"
                onFilesSelected={handleCloudFilesSelected}
                allowMultiple={true}
                acceptedTypes={['*/*']}
              />
            </div>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ?'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' :'space-y-2'
        }>
          {sortedDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`border border-border rounded-lg p-4 hover:shadow-md transition-shadow ${
                viewMode === 'list' ? 'flex items-center space-x-4' : ''
              }`}
            >
              {viewMode === 'grid' ? (
                <div className="text-center">
                  <div className="mb-3">
                    <Icon name={getFileIcon(doc.type)} size={40} className="mx-auto text-text-muted" />
                  </div>
                  <h3 className="font-medium text-text-primary mb-1 truncate" title={doc.name}>
                    {doc.name}
                  </h3>
                  <p className="text-sm text-text-muted mb-2">{doc.size}</p>
                  <div className="flex items-center justify-center space-x-1 mb-3">
                    <Icon name={getSourceIcon(doc.source)} size={14} className="text-text-muted" />
                    <span className="text-xs text-text-muted capitalize">{doc.source}</span>
                  </div>
                  <div className="flex justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadDocument(doc)}
                      title="Download"
                    >
                      <Icon name="Download" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      title="Delete"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 flex-1">
                    <Icon name={getFileIcon(doc.type)} size={32} className="text-text-muted" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary truncate">{doc.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-text-muted">
                        <span>{doc.size}</span>
                        <span>{doc.uploadedAt}</span>
                        <div className="flex items-center space-x-1">
                          <Icon name={getSourceIcon(doc.source)} size={12} />
                          <span className="capitalize">{doc.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadDocument(doc)}
                      title="Download"
                    >
                      <Icon name="Download" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      title="Delete"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;