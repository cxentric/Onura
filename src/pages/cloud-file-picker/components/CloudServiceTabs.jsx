import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

import Icon from '../../../components/AppIcon';

const CloudServiceTabs = ({ services, activeService, onServiceChange }) => {
  const { theme } = useTheme();

  const handleConnect = (serviceId) => {
    // In a real implementation, this would handle OAuth authentication
    console.log(`Connecting to ${serviceId}`);
    alert(`Connecting to ${serviceId}...`);
  };

  return (
    <div className={`rounded-lg border ${
      theme === 'dark' ?'bg-gray-800 border-gray-700' :'bg-white border-gray-200'
    }`}>
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`font-medium ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Cloud Services
        </h3>
      </div>
      
      <div className="p-2">
        {services.map((service) => (
          <div key={service.id} className="space-y-2">
            <button
              onClick={() => service.connected && onServiceChange(service.id)}
              disabled={!service.connected}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                service.connected
                  ? activeService === service.id
                    ? theme === 'dark' ?'bg-blue-900 text-blue-200' :'bg-blue-50 text-blue-700'
                    : theme === 'dark' ?'text-gray-300 hover:bg-gray-700' :'text-gray-700 hover:bg-gray-50' :'opacity-50 cursor-not-allowed'
              }`}
            >
              <Icon name={service.icon} size={20} />
              <div className="flex-1">
                <div className="font-medium">{service.name}</div>
                {!service.connected && (
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Not connected
                  </div>
                )}
              </div>
              {service.connected && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </button>
            
            {!service.connected && (
              <button
                onClick={() => handleConnect(service.id)}
                className={`w-full ml-8 text-left text-sm hover:underline ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                Connect to {service.name}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CloudServiceTabs;