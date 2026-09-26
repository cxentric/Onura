import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import CloudPickerDropdown from '../../../components/ui/CloudPickerDropdown';

const RichTextEditor = ({ content, onChange, placeholder = "Start writing your content..." }) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const editorRef = useRef(null);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      formatText('insertHTML', `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleCloudFilesSelected = (files) => {
    if (files?.length > 0) {
      files.forEach(file => {
        let insertHTML = '';
        if (file.type?.startsWith('image/')) {
          insertHTML = `<img src="${file.url || file.thumbnail}" alt="${file.name}" style="max-width: 100%; height: auto;" />`;
        } else {
          insertHTML = `<a href="${file.url}" target="_blank" rel="noopener noreferrer">${file.name}</a>`;
        }
        formatText('insertHTML', insertHTML);
      });
    }
  };

  const toolbarButtons = [
    { command: 'bold', icon: 'Bold', title: 'Bold' },
    { command: 'italic', icon: 'Italic', title: 'Italic' },
    { command: 'underline', icon: 'Underline', title: 'Underline' },
    { command: 'formatBlock', value: 'h1', icon: 'Heading1', title: 'Heading 1' },
    { command: 'formatBlock', value: 'h2', icon: 'Heading2', title: 'Heading 2' },
    { command: 'insertUnorderedList', icon: 'List', title: 'Bullet List' },
    { command: 'insertOrderedList', icon: 'ListOrdered', title: 'Numbered List' },
    { command: 'justifyLeft', icon: 'AlignLeft', title: 'Align Left' },
    { command: 'justifyCenter', icon: 'AlignCenter', title: 'Align Center' },
    { command: 'justifyRight', icon: 'AlignRight', title: 'Align Right' }
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-secondary-50">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => formatText(button.command, button.value)}
            title={button.title}
            className="micro-interaction"
          >
            <Icon name={button.icon} size={16} />
          </Button>
        ))}
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLinkDialog(true)}
          title="Insert Link"
          className="micro-interaction"
        >
          <Icon name="Link" size={16} />
        </Button>
        
        <CloudPickerDropdown
          variant="icon"
          size="sm"
          onFilesSelected={handleCloudFilesSelected}
          allowMultiple={true}
          acceptedTypes={['image/*', 'document/*']}
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('insertHTML', '<hr>')}
          title="Insert Divider"
          className="micro-interaction"
        >
          <Icon name="Minus" size={16} />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 focus:outline-none text-text-primary"
        onInput={handleContentChange}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{ minHeight: '300px' }}
        data-placeholder={placeholder}
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Link Text</label>
                <Input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <Input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowLinkDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={insertLink}
                  disabled={!linkUrl || !linkText}
                >
                  Insert Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;