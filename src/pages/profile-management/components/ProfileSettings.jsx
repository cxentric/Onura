import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useWidget } from '../../../contexts/WidgetContext';

const ProfileSettings = ({ settings, onSettingsUpdate }) => {
  const [activeSection, setActiveSection] = useState('privacy');
  const [localSettings, setLocalSettings] = useState(settings);
  const { widgetSettings, switchPosition } = useWidget();

  const sections = [
    { id: 'privacy', label: 'Privacy', icon: 'Shield' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'widget', label: 'AI Widget', icon: 'Bot' },
    { id: 'account', label: 'Account', icon: 'User' },
    { id: 'verification', label: 'Verification', icon: 'CheckCircle' }
  ];

  const handleToggle = (section, key) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }));
  };

  const handleWidgetPositionChange = (position) => {
    switchPosition(position);
  };

  const handleSave = () => {
    onSettingsUpdate(localSettings);
  };

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-text-primary mb-4">
          Profile Visibility
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-primary">
                Public Profile
              </label>
              <p className="text-xs text-text-muted">
                Make your profile visible to everyone
              </p>
            </div>
            <button
              onClick={() => handleToggle('privacy', 'publicProfile')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.privacy.publicProfile ? 'bg-primary' : 'bg-secondary-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.privacy.publicProfile ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-primary">
                Show Email
              </label>
              <p className="text-xs text-text-muted">
                Display email address on profile
              </p>
            </div>
            <button
              onClick={() => handleToggle('privacy', 'showEmail')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.privacy.showEmail ? 'bg-primary' : 'bg-secondary-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.privacy.showEmail ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-primary">
                Show Connections
              </label>
              <p className="text-xs text-text-muted">
                Allow others to see your connections
              </p>
            </div>
            <button
              onClick={() => handleToggle('privacy', 'showConnections')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.privacy.showConnections ? 'bg-primary' : 'bg-secondary-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.privacy.showConnections ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-text-primary mb-4">
          Email Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-primary">
                New Connections
              </label>
              <p className="text-xs text-text-muted">
                Get notified when someone connects with you
              </p>
            </div>
            <button
              onClick={() => handleToggle('notifications', 'newConnections')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.notifications.newConnections ? 'bg-primary' : 'bg-secondary-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.notifications.newConnections ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-primary">
                Messages
              </label>
              <p className="text-xs text-text-muted">
                Get notified about new messages
              </p>
            </div>
            <button
              onClick={() => handleToggle('notifications', 'messages')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.notifications.messages ? 'bg-primary' : 'bg-secondary-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.notifications.messages ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-primary">
                Post Interactions
              </label>
              <p className="text-xs text-text-muted">
                Get notified about likes and comments
              </p>
            </div>
            <button
              onClick={() => handleToggle('notifications', 'postInteractions')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.notifications.postInteractions ? 'bg-primary' : 'bg-secondary-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.notifications.postInteractions ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-text-primary mb-4">
          Account Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={localSettings.account.email}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                account: { ...prev.account, email: e.target.value }
              }))}
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              value={localSettings.account.phone}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                account: { ...prev.account, phone: e.target.value }
              }))}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Language
            </label>
            <select
              value={localSettings.account.language}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                account: { ...prev.account, language: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-border">
        <h3 className="text-lg font-medium text-error mb-4">
          Danger Zone
        </h3>
        <div className="space-y-4">
          <Button variant="danger" iconName="Trash2" iconPosition="left">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );

  const renderVerificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-text-primary mb-4">
          Profile Verification
        </h3>
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Icon name="CheckCircle" size={20} className="text-primary" />
            <div>
              <h4 className="font-medium text-primary">Verified Professional</h4>
              <p className="text-sm text-primary-600">
                Your profile has been verified
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Mail" size={20} className="text-success" />
              <div>
                <h4 className="font-medium text-text-primary">Email Verified</h4>
                <p className="text-sm text-text-muted">
                  Your email address has been confirmed
                </p>
              </div>
            </div>
            <Icon name="CheckCircle" size={20} className="text-success" />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Phone" size={20} className="text-warning" />
              <div>
                <h4 className="font-medium text-text-primary">Phone Verification</h4>
                <p className="text-sm text-text-muted">
                  Verify your phone number for added security
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm">
              Verify
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Building" size={20} className="text-text-muted" />
              <div>
                <h4 className="font-medium text-text-primary">Company Verification</h4>
                <p className="text-sm text-text-muted">
                  Verify your current employment
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Start
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWidgetSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-text-primary mb-4">
          AI Widget Preferences
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Widget Position
            </label>
            <p className="text-xs text-text-muted mb-3">
              Choose your preferred hand position for the AI widget
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleWidgetPositionChange('left')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                  widgetSettings.position === 'left' ?'border-primary bg-primary-50 text-primary' :'border-border text-text-secondary hover:border-text-muted'
                }`}
              >
                <Icon name="ArrowLeft" size={20} />
                <span>Left Hand</span>
              </button>
              <button
                onClick={() => handleWidgetPositionChange('right')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                  widgetSettings.position === 'right' ?'border-primary bg-primary-50 text-primary' :'border-border text-text-secondary hover:border-text-muted'
                }`}
              >
                <span>Right Hand</span>
                <Icon name="ArrowRight" size={20} />
              </button>
            </div>
          </div>

          <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={16} className="text-secondary-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-secondary-800 text-sm">About Widget Position</h4>
                <p className="text-xs text-secondary-600 mt-1">
                  Choose "Left Hand" if you're left-handed to position the widget on the left side of your screen, 
                  or "Right Hand" for right-handed users to position it on the right side.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="flex">
        {/* Settings Navigation */}
        <div className="w-64 bg-secondary-50 border-r border-border">
          <div className="p-4">
            <h2 className="font-semibold text-text-primary mb-4">Settings</h2>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors micro-interaction ${
                    activeSection === section.id
                      ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                  }`}
                >
                  <Icon name={section.icon} size={18} />
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6">
          {activeSection === 'privacy' && renderPrivacySettings()}
          {activeSection === 'notifications' && renderNotificationSettings()}
          {activeSection === 'widget' && renderWidgetSettings()}
          {activeSection === 'account' && renderAccountSettings()}
          {activeSection === 'verification' && renderVerificationSettings()}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-border mt-6">
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;