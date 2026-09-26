import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const NicheSelection = ({ onBack }) => {
  const navigate = useNavigate();
  const [selectedNiches, setSelectedNiches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const niches = [
    {
      id: 'technology',
      name: 'Technology',
      description: 'Software, AI, Hardware, Startups',
      icon: 'Code',
      color: 'bg-blue-500',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      description: 'Medical, Biotech, Wellness',
      icon: 'Heart',
      color: 'bg-red-500',
      image: 'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?w=400&h=300&fit=crop'
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Banking, Investment, Fintech',
      icon: 'DollarSign',
      color: 'bg-green-500',
      image: 'https://images.pixabay.com/photo/2016/11/27/21/42/stock-1863880_960_720.jpg'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Digital, Content, Brand Strategy',
      icon: 'Megaphone',
      color: 'bg-purple-500',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
    },
    {
      id: 'design',
      name: 'Design',
      description: 'UX/UI, Graphic, Product Design',
      icon: 'Palette',
      color: 'bg-pink-500',
      image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=400&h=300&fit=crop'
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Teaching, EdTech, Training',
      icon: 'GraduationCap',
      color: 'bg-yellow-500',
      image: 'https://images.pixabay.com/photo/2015/07/17/22/43/student-849825_960_720.jpg'
    },
    {
      id: 'consulting',
      name: 'Consulting',
      description: 'Strategy, Management, Advisory',
      icon: 'Users',
      color: 'bg-indigo-500',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      description: 'Production, Supply Chain, Quality',
      icon: 'Settings',
      color: 'bg-gray-500',
      image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?w=400&h=300&fit=crop'
    },
    {
      id: 'retail',
      name: 'Retail',
      description: 'E-commerce, Sales, Customer Service',
      icon: 'ShoppingBag',
      color: 'bg-orange-500',
      image: 'https://images.pixabay.com/photo/2017/03/13/17/26/ecommerce-2140603_960_720.jpg'
    },
    {
      id: 'media',
      name: 'Media',
      description: 'Journalism, Entertainment, Publishing',
      icon: 'Camera',
      color: 'bg-teal-500',
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop'
    },
    {
      id: 'legal',
      name: 'Legal',
      description: 'Law, Compliance, Intellectual Property',
      icon: 'Scale',
      color: 'bg-slate-600',
      image: 'https://images.pexels.com/photos/5668882/pexels-photo-5668882.jpeg?w=400&h=300&fit=crop'
    },
    {
      id: 'nonprofit',
      name: 'Non-Profit',
      description: 'Social Impact, Fundraising, Advocacy',
      icon: 'Heart',
      color: 'bg-emerald-500',
      image: 'https://images.pixabay.com/photo/2017/05/15/23/40/charity-2316715_960_720.jpg'
    }
  ];

  const handleNicheToggle = (nicheId) => {
    setSelectedNiches(prev => 
      prev.includes(nicheId)
        ? prev.filter(id => id !== nicheId)
        : [...prev, nicheId]
    );
  };

  const handleComplete = async () => {
    if (selectedNiches.length === 0) return;
    
    setIsLoading(true);
    
    // Simulate API call to save preferences
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard-feed');
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
          Choose Your Professional Niches
        </h2>
        <p className="text-text-secondary">
          Select the industries and areas that match your professional interests. 
          This helps us personalize your networking experience.
        </p>
        <div className="mt-4 flex items-center justify-center space-x-2">
          <Icon name="Sparkles" size={16} className="text-accent" />
          <span className="text-sm text-accent font-medium">
            AI-powered recommendations based on your selections
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {niches.map((niche) => {
          const isSelected = selectedNiches.includes(niche.id);
          return (
            <button
              key={niche.id}
              onClick={() => handleNicheToggle(niche.id)}
              className={`relative group overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary-50 shadow-lg scale-105'
                  : 'border-secondary-200 hover:border-secondary-300 hover:shadow-md'
              }`}
            >
              <div className="aspect-square relative">
                <img
                  src={niche.image}
                  alt={niche.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/images/no_image.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Icon */}
                <div className={`absolute top-3 right-3 w-8 h-8 ${niche.color} rounded-lg flex items-center justify-center`}>
                  <Icon name={niche.icon} size={16} color="white" />
                </div>
                
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 left-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Icon name="Check" size={14} color="white" />
                  </div>
                )}
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-medium text-white text-sm mb-1">
                    {niche.name}
                  </h3>
                  <p className="text-xs text-white/80 leading-tight">
                    {niche.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-secondary-200">
        <Button
          variant="ghost"
          onClick={onBack}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Registration
        </Button>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-text-muted">
            {selectedNiches.length} selected
          </span>
          <Button
            variant="primary"
            size="lg"
            onClick={handleComplete}
            loading={isLoading}
            disabled={selectedNiches.length === 0 || isLoading}
            iconName="ArrowRight"
            iconPosition="right"
          >
            {isLoading ? 'Setting up your profile...' : 'Complete Setup'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NicheSelection;