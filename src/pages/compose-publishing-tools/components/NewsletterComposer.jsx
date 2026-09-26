import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import RichTextEditor from './RichTextEditor';

const NewsletterComposer = ({ onContentChange }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState('professional');
  const [sendDate, setSendDate] = useState('');
  const [sendTime, setSendTime] = useState('');
  const [subscriberCount] = useState(1247);

  const templates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean, business-focused layout',
      preview: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary design with bold elements',
      preview: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple, text-focused design',
      preview: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop'
    }
  ];

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    updateContent({ subject: e.target.value });
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    updateContent({ content: newContent });
  };

  const updateContent = (updates) => {
    onContentChange({
      type: 'newsletter',
      subject,
      content,
      template,
      sendDate,
      sendTime,
      subscriberCount,
      ...updates
    });
  };

  return (
    <div className="space-y-6">
      {/* Newsletter Subject */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Subject Line
        </label>
        <Input
          type="text"
          value={subject}
          onChange={handleSubjectChange}
          placeholder="Enter your newsletter subject..."
          className="text-lg"
        />
        <p className="text-xs text-text-muted mt-1">
          Keep it under 50 characters for better open rates
        </p>
      </div>

      {/* Template Selection */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Newsletter Template
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => {
                setTemplate(tmpl.id);
                updateContent({ template: tmpl.id });
              }}
              className={`cursor-pointer rounded-lg border-2 p-3 transition-all micro-interaction ${
                template === tmpl.id
                  ? 'border-primary bg-primary-50' :'border-border hover:border-primary-300'
              }`}
            >
              <div className="aspect-video bg-secondary-100 rounded mb-2 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <Icon name="Layout" size={24} className="text-text-muted" />
                </div>
              </div>
              <h3 className="font-medium text-text-primary">{tmpl.name}</h3>
              <p className="text-xs text-text-muted">{tmpl.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Content */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Newsletter Content
        </label>
        <RichTextEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Write your newsletter content here..."
        />
      </div>

      {/* Subscriber Management */}
      <div className="bg-secondary-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-text-primary">Subscriber Management</h3>
          <Button variant="outline" size="sm">
            Manage List
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-surface rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{subscriberCount.toLocaleString()}</div>
            <div className="text-sm text-text-muted">Total Subscribers</div>
          </div>
          <div className="bg-surface rounded-lg p-3">
            <div className="text-2xl font-bold text-success">94%</div>
            <div className="text-sm text-text-muted">Delivery Rate</div>
          </div>
        </div>
      </div>

      {/* Send Schedule */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Send Schedule
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1">Send Date</label>
            <Input
              type="date"
              value={sendDate}
              onChange={(e) => {
                setSendDate(e.target.value);
                updateContent({ sendDate: e.target.value });
              }}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Send Time</label>
            <Input
              type="time"
              value={sendTime}
              onChange={(e) => {
                setSendTime(e.target.value);
                updateContent({ sendTime: e.target.value });
              }}
            />
          </div>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Leave empty to send immediately upon publishing
        </p>
      </div>

      {/* Newsletter Preview */}
      <div className="bg-secondary-50 rounded-lg p-4">
        <h3 className="font-medium text-text-primary mb-3">Newsletter Preview</h3>
        <div className="bg-surface rounded-lg p-4 border border-border max-h-64 overflow-y-auto">
          <div className="border-b border-border-muted pb-3 mb-3">
            <div className="text-sm text-text-muted">Subject:</div>
            <div className="font-medium text-text-primary">
              {subject || 'Your newsletter subject will appear here'}
            </div>
          </div>
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content || '<p>Your newsletter content will appear here...</p>' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterComposer;