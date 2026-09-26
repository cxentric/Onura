import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProfileHeader = ({ profile, isOwnProfile, onEditToggle, isEditing }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="relative bg-surface border-b border-border">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary-500 to-accent-500 overflow-hidden">
        <Image
          src={profile.coverImage}
          alt="Profile cover"
          className="w-full h-full object-cover"
        />
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 bg-black/20 text-white hover:bg-black/40"
            iconName="Camera"
          >
            <span className="hidden sm:inline ml-2">Edit Cover</span>
          </Button>
        )}
      </div>

      {/* Profile Content */}
      <div className="relative px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
          {/* Profile Photo */}
          <div className="relative -mt-16 sm:-mt-20">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-surface bg-surface overflow-hidden">
              <Image
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
              {isOwnProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/20 text-white hover:bg-black/40 p-0"
                >
                  <Icon name="Camera" size={16} />
                </Button>
              )}
            </div>
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full border-2 border-surface flex items-center justify-center">
                <Icon name="CheckCircle" size={16} color="white" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 mt-4 sm:mt-0 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
                  {profile.name}
                </h1>
                <p className="text-lg text-text-secondary mt-1">
                  {profile.title}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-text-muted">
                  <div className="flex items-center space-x-1">
                    <Icon name="MapPin" size={16} />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Calendar" size={16} />
                    <span>Joined {profile.joinedDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                {isOwnProfile ? (
                  <Button
                    variant={isEditing ? "secondary" : "primary"}
                    onClick={onEditToggle}
                    iconName={isEditing ? "X" : "Edit3"}
                    iconPosition="left"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={isFollowing ? "secondary" : "primary"}
                      onClick={handleFollowToggle}
                      iconName={isFollowing ? "UserMinus" : "UserPlus"}
                      iconPosition="left"
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    <Button
                      variant="outline"
                      iconName="MessageCircle"
                      iconPosition="left"
                    >
                      Message
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm">
                  <Icon name="MoreHorizontal" size={20} />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-border-muted">
              <div className="text-center">
                <div className="text-xl font-semibold text-text-primary">
                  {profile.stats.posts}
                </div>
                <div className="text-sm text-text-muted">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-text-primary">
                  {profile.stats.followers}
                </div>
                <div className="text-sm text-text-muted">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-text-primary">
                  {profile.stats.following}
                </div>
                <div className="text-sm text-text-muted">Following</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-text-primary">
                  {profile.stats.connections}
                </div>
                <div className="text-sm text-text-muted">Connections</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;