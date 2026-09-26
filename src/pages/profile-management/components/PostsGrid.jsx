import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PostsGrid = ({ posts }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filterOptions = [
    { value: 'all', label: 'All Posts', icon: 'Grid3X3' },
    { value: 'articles', label: 'Articles', icon: 'FileText' },
    { value: 'polls', label: 'Polls', icon: 'BarChart3' },
    { value: 'images', label: 'Images', icon: 'Image' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'engagement', label: 'Most Engaged' }
  ];

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.type === filter.slice(0, -1); // Remove 's' from filter
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatEngagement = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-6">
      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "primary" : "ghost"}
              size="sm"
              onClick={() => setFilter(option.value)}
              iconName={option.icon}
              iconPosition="left"
              className="whitespace-nowrap"
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Icon name="ArrowUpDown" size={16} className="text-text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow micro-interaction cursor-pointer"
            >
              {/* Post Image/Thumbnail */}
              {post.thumbnail && (
                <div className="aspect-video bg-secondary-100 overflow-hidden">
                  <Image
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Post Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name={
                        post.type === 'article' ? 'FileText' :
                        post.type === 'poll' ? 'BarChart3' :
                        post.type === 'image' ? 'Image' : 'FileText'
                      }
                      size={16}
                      className="text-text-muted"
                    />
                    <span className="text-xs text-text-muted capitalize">
                      {post.type}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">
                    {formatDate(post.createdAt)}
                  </span>
                </div>

                <h3 className="font-medium text-text-primary mb-2 line-clamp-2">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-border-muted">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Icon name="Heart" size={14} className="text-text-muted" />
                      <span className="text-xs text-text-muted">
                        {formatEngagement(post.likes)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="MessageCircle" size={14} className="text-text-muted" />
                      <span className="text-xs text-text-muted">
                        {formatEngagement(post.comments)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Share" size={14} className="text-text-muted" />
                      <span className="text-xs text-text-muted">
                        {formatEngagement(post.shares)}
                      </span>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm">
                    <Icon name="MoreHorizontal" size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="FileText" size={48} className="text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No posts found
          </h3>
          <p className="text-text-muted mb-4">
            {filter === 'all' 
              ? "Start sharing your professional insights with your network."
              : `No ${filter} found. Try a different filter.`
            }
          </p>
          <Button variant="primary" iconName="Plus" iconPosition="left">
            Create Post
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostsGrid;