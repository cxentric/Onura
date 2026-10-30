import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const initials = (name) =>
  (name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

/**
 * `onLocked`: for visitors, every action calls this (to ask them to sign in) instead.
 * `showActions`: false for members' posts, which don't have likes or comments yet.
 * `onDelete`: shows a Delete option (your own posts, or any post for the super admin).
 */
const PostCard = ({ post, onLike, onComment, onShare, onLocked, showActions = true, onDelete }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    if (onLocked) return onLocked('Sign in to like posts.');
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    onLike?.(post.id, newLikedState);
  };

  const handleComment = () => {
    if (onLocked) return onLocked('Sign in to comment.');
    setShowComments(!showComments);
    onComment?.(post.id);
  };

  const handleShare = () => {
    if (onLocked) return onLocked('Sign in to share posts.');
    onShare?.(post.id);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderPostContent = () => {
    switch (post.type) {
      case 'article':
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-text-primary line-clamp-2">
              {post.title}
            </h3>
            <p className="text-text-secondary line-clamp-3">{post.content}</p>
            {post.image && (
              <div className="rounded-lg overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>
        );
      
      case 'poll':
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-text-primary">{post.question}</h3>
            <div className="space-y-2">
              {post.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg cursor-pointer hover:bg-secondary-100 transition-colors"
                >
                  <span className="text-text-primary">{option.text}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-secondary-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-text-muted">{option.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-3">
            <p className="text-text-primary">{post.caption}</p>
            <div className="rounded-lg overflow-hidden">
              <Image
                src={post.image}
                alt={post.caption}
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-3">
            <p className="text-text-primary whitespace-pre-line">{post.content}</p>
            {post.image && (
              <div className="rounded-lg overflow-hidden">
                <Image
                  src={post.image}
                  alt="Post image"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {post.author.avatar ? (
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary-100 text-primary flex items-center justify-center text-sm font-semibold">
              {initials(post.author.name)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-text-primary truncate">{post.author.name}</h4>
            {post.author.verified && (
              <Icon name="CheckCircle" size={16} className="text-primary flex-shrink-0" />
            )}
            {post.author.isFounder && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium flex-shrink-0">
                <Icon name="Crown" size={12} />
                <span>Founder</span>
              </span>
            )}
            <span className="text-text-muted">•</span>
            <span className="text-sm text-text-muted">{formatTimeAgo(post.timestamp)}</span>
          </div>
          <p className="text-sm text-text-secondary">{post.author.title}</p>
          <div className="flex items-center space-x-3 mt-1">
            {post.niche && (
              <div className="flex items-center space-x-1">
                <Icon name="Tag" size={12} className="text-text-muted" />
                <span className="text-xs text-primary font-medium">{post.niche}</span>
              </div>
            )}
            {post.location && (
              <div className="flex items-center space-x-1">
                <Icon name="MapPin" size={12} className="text-text-muted" />
                <span className="text-xs text-text-muted">{post.location.name}</span>
              </div>
            )}
          </div>
        </div>
        {onDelete ? (
          <Button variant="ghost" size="sm" onClick={() => onDelete(post)} aria-label="Delete post" className="text-text-muted hover:text-error">
            <Icon name="Trash2" size={16} />
          </Button>
        ) : (
          showActions && (
            <Button variant="ghost" size="sm" onClick={() => onLocked?.()}>
              <Icon name="MoreHorizontal" size={16} />
            </Button>
          )
        )}
      </div>

      {/* Post Content */}
      <div className="space-y-3">
        {renderPostContent()}
      </div>

      {/* Post Actions */}
      {showActions && (
      <div className="flex items-center justify-between pt-3 border-t border-border-muted">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 ${isLiked ? 'text-error' : 'text-text-muted'}`}
          >
            <Icon name={isLiked ? "Heart" : "Heart"} size={18} className={isLiked ? 'fill-current' : ''} />
            <span className="text-sm">{likeCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className="flex items-center space-x-2 text-text-muted hover:text-text-primary"
          >
            <Icon name="MessageCircle" size={18} />
            <span className="text-sm">{post.comments || 0}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-2 text-text-muted hover:text-text-primary"
          >
            <Icon name="Share2" size={18} />
            <span className="text-sm">Share</span>
          </Button>
        </div>
        
        <Button variant="ghost" size="sm" onClick={() => onLocked?.('Sign in to save posts.')} className="text-text-muted hover:text-text-primary">
          <Icon name="Bookmark" size={18} />
        </Button>
      </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="pt-4 border-t border-border-muted space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="User" size={14} className="text-text-muted" />
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Write a comment..."
                className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows="2"
              />
              <div className="flex justify-end mt-2">
                <Button variant="primary" size="sm">
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;