import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import ProfileHeader from './components/ProfileHeader';
import ProfileBio from './components/ProfileBio';
import ProfileTabs from './components/ProfileTabs';
import PostsGrid from './components/PostsGrid';
import ConnectionsList from './components/ConnectionsList';
import MyNetwork from './components/MyNetwork';
import { accountsEnabled, useAuth } from '../../services/auth';
import { getMyProfile, myProfileStats, saveMyProfile } from '../../services/network';
import { deletePost, loadFeed } from '../../services/posts';
import PostCard from '../dashboard-feed/components/PostCard';
import Button from '../../components/ui/Button';
import { openSignIn } from '../../components/SignInModal';
import ProfileSettings from './components/ProfileSettings';
import AIInsights from './components/AIInsights';
import DocumentsTab from './components/DocumentsTab';

const joined = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '');

// The signed-in member's profile row and counts, in the shape the profile components expect.
const toProfile = (row, stats, email) => ({
  name: row?.display_name || email?.split('@')[0] || 'CXentric member',
  title: row?.headline || '',
  bio: row?.bio || '',
  location: row?.location || '',
  industry: row?.industry || '',
  website: row?.website || '',
  skills: row?.skills || [],
  niches: [],
  socialLinks: [],
  avatar: row?.avatar_url || null,
  coverImage: null,
  isVerified: false,
  joinedDate: joined(row?.created_at),
  stats: { posts: stats?.posts ?? 0, connections: stats?.connections ?? 0 },
});

const toCard = (post) => ({
  id: post.id,
  type: 'text',
  content: post.body,
  niche: post.niche,
  timestamp: post.createdAt,
  mine: post.mine,
  author: { name: post.author.name, title: post.author.headline || '', avatar: post.author.avatar, isFounder: post.author.isFounder },
});

const ProfileManagement = () => {
  const auth = useAuth();
  const signedIn = auth.status === 'signed-in';
  const [me, setMe] = useState(null);
  const [myPosts, setMyPosts] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    id: 1,
    name: "Sarah Johnson",
    title: "Senior UX Designer & Product Strategist",
    location: "San Francisco, CA",
    industry: "Technology",
    joinedDate: "March 2021",
    isVerified: true,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop",
    bio: `Passionate UX designer with 8+ years of experience creating user-centered digital experiences. I specialize in design systems, user research, and product strategy for B2B SaaS platforms.\n\nCurrently leading design initiatives at a fast-growing fintech startup, where I've helped increase user engagement by 40% through data-driven design decisions.`,
    website: "https://sarahjohnson.design",
    stats: {
      posts: 127,
      followers: 2847,
      following: 892,
      connections: 1456
    },
    niches: ["UX Design", "Product Strategy", "Design Systems", "User Research", "Fintech"],
    skills: ["Figma", "Sketch", "Prototyping", "User Testing", "Design Thinking", "Agile", "JavaScript", "React"],
    socialLinks: [
      { platform: "LinkedIn", icon: "Linkedin", url: "https://linkedin.com/in/sarahjohnson" },
      { platform: "Dribbble", icon: "Dribbble", url: "https://dribbble.com/sarahjohnson" },
      { platform: "GitHub", icon: "Github", url: "https://github.com/sarahjohnson" },
      { platform: "Twitter", icon: "Twitter", url: "https://twitter.com/sarahjohnson" }
    ]
  });

  // Listen for external tab change events (from sidebar connections click)
  useEffect(() => {
    const handleSetProfileTab = (event) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('setProfileTab', handleSetProfileTab);
    return () => {
      window.removeEventListener('setProfileTab', handleSetProfileTab);
    };
  }, []);

  const [posts] = useState([
    {
      id: 1,
      type: "article",
      title: "The Future of Design Systems in 2024",
      excerpt: "Exploring how design systems are evolving to meet the needs of modern product teams and the challenges they face.",
      thumbnail: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop",
      createdAt: "2024-01-15",
      likes: 234,
      comments: 45,
      shares: 23
    },
    {
      id: 2,
      type: "poll",
      title: "What's your biggest UX challenge in 2024?",
      excerpt: "Help me understand the current pain points in the UX community.",
      thumbnail: null,
      createdAt: "2024-01-12",
      likes: 156,
      comments: 78,
      shares: 12
    },
    {
      id: 3,
      type: "image",
      title: "Design System Component Library",
      excerpt: "A sneak peek at our new component library built for scalability.",
      thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=300&fit=crop",
      createdAt: "2024-01-10",
      likes: 189,
      comments: 34,
      shares: 45
    },
    {
      id: 4,
      type: "article",
      title: "User Research Methods That Actually Work",
      excerpt: "A comprehensive guide to conducting effective user research in fast-paced environments.",
      thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      createdAt: "2024-01-08",
      likes: 312,
      comments: 67,
      shares: 89
    },
    {
      id: 5,
      type: "image",
      title: "Mobile App Wireframes",
      excerpt: "Early stage wireframes for a fintech mobile application.",
      thumbnail: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=400&h=300&fit=crop",
      createdAt: "2024-01-05",
      likes: 145,
      comments: 23,
      shares: 34
    },
    {
      id: 6,
      type: "article",
      title: "Building Inclusive Design Practices",
      excerpt: "How to integrate accessibility and inclusion into your design workflow from day one.",
      thumbnail: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop",
      createdAt: "2024-01-03",
      likes: 278,
      comments: 56,
      shares: 67
    }
  ]);

  const [connections] = useState([
    {
      id: 1,
      name: "Michael Chen",
      title: "Product Manager at Google",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      mutualConnections: 23,
      isOnline: true,
      isVerified: true
    },
    {
      id: 2,
      name: "Emily Rodriguez",
      title: "Senior Developer at Microsoft",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      mutualConnections: 45,
      isOnline: false,
      isVerified: false
    },
    {
      id: 3,
      name: "David Kim",
      title: "Design Director at Airbnb",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      mutualConnections: 67,
      isOnline: true,
      isVerified: true
    },
    {
      id: 4,
      name: "Lisa Thompson",
      title: "UX Researcher at Spotify",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      mutualConnections: 34,
      isOnline: false,
      isVerified: false
    },
    {
      id: 5,
      name: "James Wilson",
      title: "Frontend Engineer at Netflix",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      mutualConnections: 56,
      isOnline: true,
      isVerified: true
    },
    {
      id: 6,
      name: "Anna Martinez",
      title: "Product Designer at Uber",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
      mutualConnections: 78,
      isOnline: false,
      isVerified: false
    }
  ]);

  const [followers] = useState([
    {
      id: 7,
      name: "Robert Taylor",
      title: "Startup Founder",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
      mutualConnections: 12,
      isOnline: true,
      isVerified: false
    },
    {
      id: 8,
      name: "Jennifer Lee",
      title: "Marketing Director",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
      mutualConnections: 89,
      isOnline: false,
      isVerified: true
    }
  ]);

  const [following] = useState([
    {
      id: 9,
      name: "Alex Johnson",
      title: "Tech Blogger",
      avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100&h=100&fit=crop&crop=face",
      mutualConnections: 234,
      isOnline: true,
      isVerified: true
    },
    {
      id: 10,
      name: "Maria Garcia",
      title: "Design Consultant",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
      mutualConnections: 156,
      isOnline: false,
      isVerified: false
    }
  ]);

  const [settings] = useState({
    privacy: {
      publicProfile: true,
      showEmail: false,
      showConnections: true
    },
    notifications: {
      newConnections: true,
      messages: true,
      postInteractions: false
    },
    account: {
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      language: "en"
    }
  });

  const [aiInsights] = useState([
    {
      id: 1,
      type: "profile",
      priority: "high",
      title: "Optimize Your Profile Headline",
      description: "Your profile headline could be more specific to attract the right connections.",
      impact: "High",
      effort: "Low",
      suggestions: [
        {
          id: "s1",
          action: "Add specific technologies you work with",
          description: "Include tools like Figma, Sketch, or specific frameworks"
        },
        {
          id: "s2",
          action: "Mention your industry focus",
          description: "Specify fintech, healthcare, or other verticals"
        }
      ],
      metrics: [
        { label: "Profile Views", value: "+35%" },
        { label: "Connection Requests", value: "+28%" }
      ]
    },
    {
      id: 2,
      type: "content",
      priority: "medium",
      title: "Increase Content Engagement",
      description: "Your posts are getting good reach but could use more engagement.",
      impact: "Medium",
      effort: "Medium",
      suggestions: [
        {
          id: "s3",
          action: "Ask questions in your posts",
          description: "End posts with thought-provoking questions"
        },
        {
          id: "s4",
          action: "Share more behind-the-scenes content",
          description: "Show your design process and decision-making"
        }
      ],
      metrics: [
        { label: "Comments", value: "+45%" },
        { label: "Shares", value: "+22%" }
      ]
    },
    {
      id: 3,
      type: "networking",
      priority: "low",
      title: "Expand Your Network",
      description: "You have great connections but could benefit from more diversity.",
      impact: "Medium",
      effort: "High",
      suggestions: [
        {
          id: "s5",
          action: "Connect with professionals in adjacent fields",
          description: "Reach out to product managers, developers, and researchers"
        },
        {
          id: "s6",
          action: "Join industry-specific groups",
          description: "Participate in UX and design communities"
        }
      ],
      metrics: [
        { label: "Network Growth", value: "+15%" },
        { label: "Opportunities", value: "+30%" }
      ]
    }
  ]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const loadMe = useCallback(async () => {
    try {
      const [row, stats] = await Promise.all([getMyProfile(auth.user.id), myProfileStats()]);
      setMe(toProfile(row, stats, auth.user.email));
    } catch (err) {
      setLoadError(err.message);
    }
  }, [auth.user?.id, auth.user?.email]);

  useEffect(() => {
    if (signedIn) loadMe();
    else setMe(null);
  }, [signedIn, loadMe]);

  useEffect(() => {
    if (!signedIn || activeTab !== 'posts') return;
    loadFeed({ scope: 'mine', limit: 50 }).then((rows) => setMyPosts(rows.map(toCard)), (err) => setLoadError(err.message));
  }, [signedIn, activeTab]);

  const handleDeletePost = async (post) => {
    if (!window.confirm('Delete this post?')) return;
    await deletePost(post.id);
    setMyPosts((prev) => prev.filter((p) => p.id !== post.id));
    loadMe();
  };

  const handleProfileUpdate = async (updatedData) => {
    if (!signedIn) {
      setProfile(prev => ({ ...prev, ...updatedData }));
      setIsEditing(false);
      return;
    }
    await saveMyProfile(auth.user.id, {
      display_name: updatedData.name,
      headline: updatedData.title,
      bio: updatedData.bio,
      location: updatedData.location,
      website: updatedData.website,
      industry: updatedData.industry,
      skills: updatedData.skills,
    });
    await loadMe();
    setIsEditing(false);
  };

  const shown = signedIn ? me : profile;

  const handleSettingsUpdate = (updatedSettings) => {
    console.log('Settings updated:', updatedSettings);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <ProfileBio
              profile={shown}
              isEditing={isEditing}
              onSave={handleProfileUpdate}
            />
            {!signedIn && <AIInsights insights={aiInsights} />}
          </div>
        );
      case 'posts':
        if (!signedIn) return <PostsGrid posts={posts} />;
        if (!myPosts) return <p className="text-text-muted">Loading your posts…</p>;
        if (!myPosts.length) return <p className="text-text-muted">You haven’t posted yet. Share something from the home feed.</p>;
        return (
          <div className="space-y-6 max-w-2xl">
            {myPosts.map((post) => <PostCard key={post.id} post={post} showActions={false} onDelete={handleDeletePost} />)}
          </div>
        );
      case 'connections':
        // Real connections when accounts are on; the sample list otherwise.
        if (accountsEnabled) return <MyNetwork />;
        return (
          <ConnectionsList
            connections={connections}
            followers={followers}
            following={following}
          />
        );
      case 'documents':
        return <DocumentsTab />;
      case 'settings':
        return (
          <ProfileSettings
            settings={settings}
            onSettingsUpdate={handleSettingsUpdate}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    document.title = "Your profile - CXentric";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      <main className="lg:pl-64 pt-16">
        {auth.status === 'signed-out' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="font-medium text-text-primary">This is a sample profile</p>
                <p className="text-sm text-text-secondary">Sign in with Google or your email to create your own.</p>
              </div>
              <Button onClick={() => openSignIn('Sign in to create your profile.')} iconName="LogIn" iconPosition="left">Sign in</Button>
            </div>
          </div>
        )}
        {!shown ? (
          <p className="p-8 text-text-muted">{loadError || 'Loading your profile…'}</p>
        ) : (
        <div className="max-w-6xl mx-auto">
          <ProfileHeader
            profile={shown}
            isOwnProfile={true}
            onEditToggle={handleEditToggle}
            isEditing={isEditing}
          />
          
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            stats={shown.stats}
          />
          
          <div className="p-4 sm:p-6 lg:p-8">
            {renderTabContent()}
          </div>
        </div>
        )}
      </main>
      
      {/* Mobile bottom padding for navigation */}
      <div className="h-16 lg:hidden" />
    </div>
  );
};

export default ProfileManagement;