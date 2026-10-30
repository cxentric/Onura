import React from 'react';
import Icon from '../AppIcon';
import { useWidget } from '../../contexts/WidgetContext';
import { isPro, useAuth } from '../../services/auth';

/** Whether Pro features are unlocked (always, when accounts aren't switched on). */
export const usePro = () => isPro(useAuth());

/** Shown where a Free user reaches a Pro feature; leads to the plans on the account screen. */
export const UpgradeCard = ({ title, text }) => {
  const { setActiveTab } = useWidget();
  return (
    <div className="rounded-lg p-3 bg-gradient-to-br from-amber-400 to-orange-500 text-white">
      <div className="flex items-center space-x-2">
        <Icon name="Crown" size={16} />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="text-xs mt-1 text-orange-50">{text}</p>
      <button
        onClick={() => setActiveTab('account')}
        className="mt-2 w-full py-2 rounded-md bg-white text-orange-600 text-xs font-semibold hover:bg-orange-50"
      >
        See Pro plans · from ₹149
      </button>
    </div>
  );
};
