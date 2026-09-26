import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PollComposer = ({ onContentChange }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState('7');
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [showResults, setShowResults] = useState('after');

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    updateContent({ question: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    updateContent({ options: newOptions });
  };

  const addOption = () => {
    if (options.length < 6) {
      const newOptions = [...options, ''];
      setOptions(newOptions);
      updateContent({ options: newOptions });
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      updateContent({ options: newOptions });
    }
  };

  const updateContent = (updates) => {
    onContentChange({
      type: 'poll',
      question,
      options,
      duration,
      allowMultiple,
      showResults,
      ...updates
    });
  };

  const durationOptions = [
    { value: '1', label: '1 day' },
    { value: '3', label: '3 days' },
    { value: '7', label: '1 week' },
    { value: '14', label: '2 weeks' },
    { value: '30', label: '1 month' }
  ];

  return (
    <div className="space-y-6">
      {/* Poll Question */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Poll Question
        </label>
        <Input
          type="text"
          value={question}
          onChange={handleQuestionChange}
          placeholder="What would you like to ask your network?"
          className="text-lg"
        />
      </div>

      {/* Poll Options */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Answer Options
        </label>
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="flex-1 flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-border rounded-full flex items-center justify-center text-xs font-medium text-text-muted">
                  {String.fromCharCode(65 + index)}
                </div>
                <Input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
              </div>
              {options.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="text-error hover:text-error-600"
                >
                  <Icon name="X" size={16} />
                </Button>
              )}
            </div>
          ))}
          
          {options.length < 6 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addOption}
              iconName="Plus"
              iconPosition="left"
            >
              Add Option
            </Button>
          )}
        </div>
      </div>

      {/* Poll Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Poll Duration
          </label>
          <select
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value);
              updateContent({ duration: e.target.value });
            }}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results Display */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Show Results
          </label>
          <select
            value={showResults}
            onChange={(e) => {
              setShowResults(e.target.value);
              updateContent({ showResults: e.target.value });
            }}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="after">After voting</option>
            <option value="live">Live results</option>
            <option value="end">Only when poll ends</option>
          </select>
        </div>
      </div>

      {/* Multiple Choice Option */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="allowMultiple"
          checked={allowMultiple}
          onChange={(e) => {
            setAllowMultiple(e.target.checked);
            updateContent({ allowMultiple: e.target.checked });
          }}
          className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
        />
        <label htmlFor="allowMultiple" className="text-sm text-text-primary">
          Allow multiple selections
        </label>
      </div>

      {/* Poll Preview */}
      <div className="bg-secondary-50 rounded-lg p-4">
        <h3 className="font-medium text-text-primary mb-3">Poll Preview</h3>
        <div className="bg-surface rounded-lg p-4 border border-border">
          <h4 className="font-medium text-text-primary mb-3">
            {question || 'Your poll question will appear here'}
          </h4>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 hover:bg-secondary-50 rounded">
                <div className={`w-4 h-4 border-2 border-border ${allowMultiple ? 'rounded' : 'rounded-full'}`} />
                <span className="text-sm text-text-primary">
                  {option || `Option ${index + 1}`}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-text-muted">
            Poll ends in {durationOptions.find(d => d.value === duration)?.label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollComposer;