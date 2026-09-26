import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UpcomingEvents = ({ onEventAction }) => {
  const events = [
    {
      id: 1,
      title: 'AI in Healthcare Summit 2024',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '10:00 AM PST',
      type: 'virtual',
      attendees: 1247,
      niche: 'Healthcare',
      isRegistered: false,
      organizer: 'TechMed Conference'
    },
    {
      id: 2,
      title: 'Design Systems Workshop',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '2:00 PM EST',
      type: 'hybrid',
      attendees: 89,
      niche: 'Design',
      isRegistered: true,
      organizer: 'Design Community'
    },
    {
      id: 3,
      title: 'Startup Pitch Night',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      time: '6:00 PM PST',
      type: 'in-person',
      attendees: 156,
      niche: 'Entrepreneurship',
      isRegistered: false,
      organizer: 'Startup Hub'
    }
  ];

  const formatDate = (date) => {
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'virtual': return 'Video';
      case 'hybrid': return 'Globe';
      case 'in-person': return 'MapPin';
      default: return 'Calendar';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'virtual': return 'text-primary';
      case 'hybrid': return 'text-accent';
      case 'in-person': return 'text-success';
      default: return 'text-text-muted';
    }
  };

  const handleEventAction = (event, action) => {
    onEventAction?.(event, action);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text-primary flex items-center space-x-2">
          <Icon name="Calendar" size={18} />
          <span>Upcoming Events</span>
        </h3>
        <Button variant="ghost" size="sm" className="text-text-muted hover:text-text-primary">
          <Icon name="Plus" size={16} />
        </Button>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="space-y-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-text-primary line-clamp-1">{event.title}</h4>
                  <div className="flex items-center space-x-1">
                    <Icon 
                      name={getEventTypeIcon(event.type)} 
                      size={12} 
                      className={getEventTypeColor(event.type)} 
                    />
                    <span className={`text-xs font-medium ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-text-muted">
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={12} />
                    <span>{formatDate(event.date)} • {event.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Users" size={12} />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Icon name="Tag" size={12} className="text-primary" />
                  <span className="text-xs text-primary font-medium">{event.niche}</span>
                  <span className="text-xs text-text-muted">by {event.organizer}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={event.isRegistered ? "success" : "primary"}
                size="sm"
                onClick={() => handleEventAction(event, event.isRegistered ? 'view' : 'register')}
                className="flex-1"
                iconName={event.isRegistered ? "Check" : "Calendar"}
                iconPosition="left"
              >
                {event.isRegistered ? 'Registered' : 'Register'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEventAction(event, 'share')}
                className="text-text-muted hover:text-text-primary"
              >
                <Icon name="Share2" size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full text-text-muted hover:text-text-primary"
      >
        View All Events
      </Button>
    </div>
  );
};

export default UpcomingEvents;