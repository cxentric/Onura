import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const draftFrom = (profile) => ({
  name: profile.name || '',
  title: profile.title || '',
  bio: profile.bio || '',
  location: profile.location || '',
  website: profile.website || '',
  industry: profile.industry || '',
  skills: (profile.skills || []).join(', '),
});

const Field = ({ label, children }) => (
  <label className="block space-y-1">
    <span className="block text-sm font-medium text-text-secondary">{label}</span>
    {children}
  </label>
);

/** `onSave` may return a promise; the editor stays open with the error if it fails. */
const ProfileBio = ({ profile, isEditing, onSave }) => {
  const [draft, setDraft] = useState(() => draftFrom(profile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  useEffect(() => {
    if (isEditing) {
      setDraft(draftFrom(profile));
      setError(null);
    }
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...draft,
        skills: draft.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      });
    } catch (err) {
      setError(err.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Edit profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name">
            <Input value={draft.name} maxLength={80} required onChange={set('name')} />
          </Field>
          <Field label="Headline">
            <Input value={draft.title} maxLength={140} placeholder="e.g. QA Engineer preparing for SDET roles" onChange={set('title')} />
          </Field>
          <Field label="Location">
            <Input value={draft.location} maxLength={80} placeholder="e.g. Chennai" onChange={set('location')} />
          </Field>
          <Field label="Industry">
            <Input value={draft.industry} maxLength={60} placeholder="e.g. IT" onChange={set('industry')} />
          </Field>
          <Field label="Website">
            <Input type="url" value={draft.website} maxLength={200} placeholder="https://" onChange={set('website')} />
          </Field>
          <Field label="Skills (separated by commas)">
            <Input value={draft.skills} placeholder="e.g. Selenium, Java, SQL" onChange={set('skills')} />
          </Field>
        </div>
        <Field label="Bio">
          <textarea
            value={draft.bio}
            onChange={set('bio')}
            maxLength={2000}
            className="w-full p-3 border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={4}
            placeholder="Tell us about yourself..."
          />
        </Field>
        {error && <p className="text-sm text-error">{error}</p>}
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave} disabled={saving || !draft.name.trim()}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    );
  }

  const niches = profile.niches || [];
  const skills = profile.skills || [];
  const links = profile.socialLinks || [];

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">About</h2>
      </div>

      {/* Bio */}
      <div className="mb-6">
        {profile.bio ? (
          <p className="text-text-primary leading-relaxed whitespace-pre-line">{profile.bio}</p>
        ) : (
          <p className="text-text-muted">No bio yet. Use Edit Profile to tell members about yourself.</p>
        )}
      </div>

      {/* Professional Info */}
      {(profile.location || profile.website || profile.industry) && (
        <div className="space-y-4 mb-6">
          {profile.location && (
            <div className="flex items-center space-x-3">
              <Icon name="MapPin" size={18} className="text-text-muted" />
              <span className="text-text-secondary">{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center space-x-3">
              <Icon name="Link" size={18} className="text-text-muted" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                {profile.website}
              </a>
            </div>
          )}
          {profile.industry && (
            <div className="flex items-center space-x-3">
              <Icon name="Briefcase" size={18} className="text-text-muted" />
              <span className="text-text-secondary">{profile.industry}</span>
            </div>
          )}
        </div>
      )}

      {/* Niche Specializations */}
      {niches.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-text-secondary mb-3">Niche Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {niches.map((niche, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-50 text-primary border border-primary-100">
                {niche}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-text-secondary mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-700 border border-secondary-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {links.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-3">Professional Links</h3>
          <div className="flex flex-wrap gap-3">
            {links.map((link, index) => (
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
      )}
    </div>
  );
};

export default ProfileBio;
