import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PostCard from './components/PostCard';
import NicheFilter from './components/NicheFilter';
import TrendingTopics from './components/TrendingTopics';
import SuggestedConnections from './components/SuggestedConnections';
import AINetworkingSuggestions from './components/AINetworkingSuggestions';
import QuickCompose from './components/QuickCompose';
import UpcomingEvents from './components/UpcomingEvents';

const DashboardFeed = () => {
  const [posts, setPosts] = useState([]);
  const [selectedNiches, setSelectedNiches] = useState(['all']);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock posts data
  const mockPosts = [
    {
      id: 1,
      type: 'article',
      title: 'The Future of AI in Healthcare: Transforming Patient Care',
      content: `Artificial Intelligence is revolutionizing healthcare delivery, from diagnostic imaging to personalized treatment plans. Recent breakthroughs in machine learning algorithms have enabled more accurate disease detection and prediction.\n\nKey areas of impact include:\n• Diagnostic accuracy improvements\n• Personalized medicine approaches\n• Operational efficiency gains\n• Patient outcome optimization`,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
      author: {
        name: 'Dr. Sarah Mitchell',
        title: 'Chief Medical Officer at HealthTech Solutions',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        verified: true
      },
      niche: 'Healthcare',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 234,
      comments: 45,
      isLiked: false
    },
    {
      id: 2,
      type: 'poll',
      question: 'What\'s the biggest challenge in remote team collaboration?',
      options: [
        { text: 'Communication barriers', percentage: 35 },
        { text: 'Time zone differences', percentage: 28 },
        { text: 'Technology limitations', percentage: 22 },
        { text: 'Building team culture', percentage: 15 }
      ],
      author: {
        name: 'Alex Chen',
        title: 'Remote Work Consultant & Author',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        verified: false
      },
      niche: 'Workplace',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 156,
      comments: 32,
      isLiked: true
    },
    {
      id: 3,
      type: 'image',
      caption: 'Just launched our new sustainable packaging design! 🌱 Excited to share how we reduced plastic usage by 80% while maintaining product protection. #SustainableDesign #EcoFriendly',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      author: {
        name: 'Maria Rodriguez',
        title: 'Sustainable Design Lead at EcoPackaging',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        verified: true
      },
      niche: 'Design',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      likes: 89,
      comments: 23,
      isLiked: false
    },
    {
      id: 4,
      type: 'text',
      content: `Just completed a fascinating analysis of market trends in the fintech space. Here are the key insights:\n\n🔹 Digital payments adoption increased by 67% this quarter\n🔹 AI-powered fraud detection reduced losses by 45%\n🔹 Cryptocurrency integration is becoming mainstream\n🔹 Regulatory compliance tools are in high demand\n\nWhat trends are you seeing in your industry? Would love to hear your thoughts!`,
      author: {
        name: 'James Wilson',
        title: 'Senior Financial Analyst at InvestTech',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        verified: false
      },
      niche: 'Finance',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      likes: 178,
      comments: 67,
      isLiked: true
    },
    {
      id: 5,
      type: 'article',
      title: 'Building Scalable Design Systems: Lessons from 5 Years at Scale',
      content: `After leading design system initiatives at three different companies, I've learned that successful design systems aren't just about components—they're about culture, process, and continuous evolution.\n\nKey principles that made the difference:\n• Start small, think big\n• Documentation is as important as code\n• Community adoption over enforcement\n• Measure impact, not just usage`,
      image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=400&fit=crop',
      author: {
        name: 'Emily Zhang',title: 'Design Systems Lead at TechCorp',avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        verified: true
      },
      niche: 'Design',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      likes: 312,
      comments: 89,
      isLiked: false
    },
    {
      id: 6,
      type: 'text',content: `Exciting news! Our startup just secured Series A funding! 🎉\n\nThis journey has been incredible - from late nights coding in a garage to building a team of 25 amazing people. Here's what I learned:\n\n✨ Product-market fit is everything\n✨ Team chemistry beats individual talent\n✨ Customer feedback is your north star\n✨ Persistence pays off\n\nThank you to everyone who believed in our vision. The real work starts now! 🚀`,
      author: {
        name: 'David Park',
        title: 'Co-founder & CEO at InnovateLab',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        verified: false
      },
      niche: 'Entrepreneurship',
      timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000),
      likes: 445,
      comments: 123,
      isLiked: true
    }
  ];

  // Initialize posts
  useEffect(() => {
    const loadInitialPosts = () => {
      setIsLoading(true);
      setTimeout(() => {
        setPosts(mockPosts);
        setIsLoading(false);
      }, 1000);
    };

    loadInitialPosts();
  }, []);

  // Filter posts based on selected niches
  const filteredPosts = selectedNiches.includes('all') 
    ? posts 
    : posts.filter(post => selectedNiches.some(niche => 
        post.niche.toLowerCase().includes(niche.toLowerCase())
      ));

  // Handle pull to refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      // Simulate new posts
      const newPost = {
        id: Date.now(),
        type: 'text',
        content: `Fresh content from your network! This is a new post that appeared after refresh. Stay connected with the latest updates from your professional community.`,
        author: {
          name: 'New Connection',
          title: 'Professional in Your Network',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          verified: false
        },
        niche: 'Technology',
        timestamp: new Date(),
        likes: 12,
        comments: 3,
        isLiked: false
      };
      setPosts(prev => [newPost, ...prev]);
      setRefreshing(false);
    }, 1500);
  }, []);

  // Handle post interactions
  const handlePostLike = (postId, isLiked) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked, likes: isLiked ? post.likes + 1 : post.likes - 1 }
        : post
    ));
  };

  const handlePostComment = (postId) => {
    console.log('Comment on post:', postId);
  };

  const handlePostShare = (postId) => {
    console.log('Share post:', postId);
  };

  // Handle niche filter changes
  const handleNicheChange = (niches) => {
    setSelectedNiches(niches);
  };

  // Handle quick post
  const handleQuickPost = (postData) => {
    const newPost = {
      id: Date.now(),
      type: 'text',
      content: postData.text,
      location: postData.location,
      author: {
        name: 'You',
        title: 'Professional User',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        verified: false
      },
      niche: 'General',
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      isLiked: false
    };
    setPosts(prev => [newPost, ...prev]);
  };

  // Handle AI suggestions
  const handleAISuggestionAction = (suggestion) => {
    console.log('AI suggestion action:', suggestion);
  };

  // Handle trending topic clicks
  const handleTopicClick = (topic) => {
    console.log('Trending topic clicked:', topic);
  };

  // Handle connection actions
  const handleConnect = (connectionId) => {
    console.log('Connect with:', connectionId);
  };

  const handleDismissConnection = (connectionId) => {
    console.log('Dismiss connection:', connectionId);
  };

  // Handle event actions
  const handleEventAction = (event, action) => {
    console.log('Event action:', action, event);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary-200 rounded-full skeleton" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-secondary-200 rounded skeleton w-1/3" />
              <div className="h-3 bg-secondary-200 rounded skeleton w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-secondary-200 rounded skeleton" />
            <div className="h-4 bg-secondary-200 rounded skeleton w-3/4" />
          </div>
          <div className="h-48 bg-secondary-200 rounded-lg skeleton" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      <main className="lg:pl-64 pt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:col-span-3 space-y-6">
              <NicheFilter 
                selectedNiches={selectedNiches}
                onNicheChange={handleNicheChange}
              />
              <TrendingTopics onTopicClick={handleTopicClick} />
              <SuggestedConnections 
                onConnect={handleConnect}
                onDismiss={handleDismissConnection}
              />
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-6">
              <div className="space-y-6">
                {/* Quick Compose */}
                <QuickCompose onQuickPost={handleQuickPost} />

                {/* Refresh Indicator */}
                {refreshing && (
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center space-x-2 text-primary">
                      <Icon name="RefreshCw" size={16} className="animate-spin" />
                      <span className="text-sm font-medium">Refreshing feed...</span>
                    </div>
                  </div>
                )}

                {/* Posts Feed */}
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="space-y-6">
                    {filteredPosts.length > 0 ? (
                      filteredPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onLike={handlePostLike}
                          onComment={handlePostComment}
                          onShare={handlePostShare}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Icon name="FileText" size={48} className="text-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-text-primary mb-2">
                          No posts found
                        </h3>
                        <p className="text-text-muted mb-4">
                          Try adjusting your niche filters or follow more professionals
                        </p>
                        <Link to="/profile-management">
                          <Button variant="primary">
                            Discover Connections
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Load More */}
                {!isLoading && hasMore && filteredPosts.length > 0 && (
                  <div className="text-center py-6">
                    <Button
                      variant="ghost"
                      onClick={handleRefresh}
                      className="text-text-muted hover:text-text-primary"
                    >
                      Load More Posts
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:col-span-3 space-y-6">
              <AINetworkingSuggestions onSuggestionAction={handleAISuggestionAction} />
              <UpcomingEvents onEventAction={handleEventAction} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardFeed;