import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NicheFilter = ({ selectedNiches, onNicheChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const niches = [
    { id: 'all', name: 'All Posts', icon: 'Globe', count: 1247 },
    { id: 'tech', name: 'Technology', icon: 'Code', count: 324 },
    { id: 'design', name: 'Design', icon: 'Palette', count: 189 },
    { id: 'marketing', name: 'Marketing', icon: 'TrendingUp', count: 267 },
    { id: 'finance', name: 'Finance', icon: 'DollarSign', count: 156 },
    { id: 'healthcare', name: 'Healthcare', icon: 'Heart', count: 98 },
    { id: 'education', name: 'Education', icon: 'BookOpen', count: 134 },
    { id: 'consulting', name: 'Consulting', icon: 'Users', count: 87 },
    { id: 'startup', name: 'Startups', icon: 'Rocket', count: 203 }
  ];

  const visibleNiches = isExpanded ? niches : niches.slice(0, 6);

  const handleNicheSelect = (nicheId) => {
    if (nicheId === 'all') {
      onNicheChange(['all']);
    } else {
      const newSelection = selectedNiches.includes(nicheId)
        ? selectedNiches.filter(id => id !== nicheId)
        : [...selectedNiches.filter(id => id !== 'all'), nicheId];
      
      onNicheChange(newSelection.length === 0 ? ['all'] : newSelection);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text-primary flex items-center space-x-2">
          <Icon name="Filter" size={18} />
          <span>Filter by Niche</span>
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-text-muted hover:text-text-primary"
        >
          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
        </Button>
      </div>

      <div className="space-y-2">
        {visibleNiches.map((niche) => {
          const isSelected = selectedNiches.includes(niche.id);
          const isAll = niche.id === 'all';
          
          return (
            <button
              key={niche.id}
              onClick={() => handleNicheSelect(niche.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all micro-interaction ${
                isSelected
                  ? 'bg-primary-50 border border-primary-200 text-primary' :'hover:bg-secondary-50 text-text-secondary'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon 
                  name={niche.icon} 
                  size={16} 
                  className={isSelected ? 'text-primary' : 'text-text-muted'} 
                />
                <span className={`font-medium ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                  {niche.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${isSelected ? 'text-primary' : 'text-text-muted'}`}>
                  {niche.count}
                </span>
                {isSelected && !isAll && (
                  <Icon name="Check" size={14} className="text-primary" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {niches.length > 6 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-text-muted hover:text-text-primary"
        >
          {isExpanded ? 'Show Less' : `Show ${niches.length - 6} More`}
        </Button>
      )}
    </div>
  );
};

export default NicheFilter;