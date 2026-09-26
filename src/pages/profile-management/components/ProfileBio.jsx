import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ProfileBio = ({ profile, isEditing, onSave }) => {
  const [editedBio, setEditedBio] = useState(profile.bio);
  const [editedLocation, setEditedLocation] = useState(profile.location);
  const [editedWebsite, setEditedWebsite] = useState(profile.website);

  const handleSave = () => {
    onSave({
      bio: editedBio,
      location: editedLocation,
      website: editedWebsite
    });
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">About</h2>
        {isEditing && (
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        )}
      </div>

      {/* Bio */}
      <div className="mb-6">
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Bio
            </label>
            <textarea
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              className="w-full p-3 border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>
        ) : (
          <p className="text-text-primary leading-relaxed">{profile.bio}</p>
        )}
      </div>

      {/* Professional Info */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="MapPin" size={18} className="text-text-muted" />
          {isEditing ? (
            <Input
              type="text"
              value={editedLocation}
              onChange={(e) => setEditedLocation(e.target.value)}
              placeholder="Location"
              className="flex-1"
            />
          ) : (
            <span className="text-text-secondary">{profile.location}</span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Icon name="Link" size={18} className="text-text-muted" />
          {isEditing ? (
            <Input
              type="url"
              value={editedWebsite}
              onChange={(e) => setEditedWebsite(e.target.value)}
              placeholder="Website URL"
              className="flex-1"
            />
          ) : (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {profile.website}
            </a>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Icon name="Briefcase" size={18} className="text-text-muted" />
          <span className="text-text-secondary">{profile.industry}</span>
        </div>
      </div>

      {/* Niche Specializations */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-text-secondary mb-3">
          Niche Specializations
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.niches.map((niche, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-50 text-primary border border-primary-100"
            >
              {niche}
            </span>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-text-secondary mb-3">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-700 border border-secondary-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-3">
          Professional Links
        </h3>
        <div className="flex flex-wrap gap-3">
          {profile.socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-secondary-50 hover:bg-secondary-100 transition-colors micro-interaction"
            >
              <Icon name={link.icon} size={16} className="text-text-muted" />
              <span className="text-sm text-text-secondary">{link.platform}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileBio;