import React from 'react';
import {
  Activity,
  CalendarDays,
  Home,
  Target,
  TrendingUp,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import { NavigationTab, useHealth } from '../context/HealthContext';
import { getTranslation } from '../utils/translations';

interface NavigationProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

interface NavItem {
  id: NavigationTab;
  labelKey: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', labelKey: 'nav_home', defaultLabel: 'Home', icon: Home },
  { id: 'food', labelKey: 'nav_food', defaultLabel: 'Food', icon: UtensilsCrossed },
  { id: 'plan', labelKey: 'nav_plan', defaultLabel: 'Plan', icon: CalendarDays },
  { id: 'activity', labelKey: 'nav_activity', defaultLabel: 'Activity', icon: Activity },
  { id: 'progress', labelKey: 'nav_progress', defaultLabel: 'Progress', icon: TrendingUp },
  { id: 'goals', labelKey: 'nav_goals', defaultLabel: 'Goals', icon: Target },
  { id: 'profile', labelKey: 'nav_profile', defaultLabel: 'Profile', icon: User },
];

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { language } = useHealth();

  return (
    <>
      {/* Desktop Navigation Bar */}
      <nav className="hidden lg:flex items-center justify-center gap-1.5 py-3 bg-white dark:bg-[#1E2520] border-b border-[#EBE9E1] dark:border-[#2C332D] transition-colors">
        <div className="flex items-center bg-[#F9F8F4] dark:bg-[#252E27] p-1 rounded-2xl gap-1 border border-[#EBE9E1] dark:border-[#323E34]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const label = getTranslation(item.labelKey, language) || item.defaultLabel;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#1E2520] text-[#3D3D3D] dark:text-white shadow-xs font-bold border border-[#EBE9E1] dark:border-[#384439]'
                    : 'text-[#8C8980] dark:text-[#A3A096] hover:text-[#3D3D3D] dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#2A342C]'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    isActive ? 'bg-[#7D8C6F]' : 'bg-transparent'
                  }`}
                />
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#7D8C6F]' : 'text-[#8C8980] dark:text-[#A3A096]'
                  }`}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile & Tablet Bottom Sticky Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1E2520]/95 backdrop-blur-lg border-t border-[#EBE9E1] dark:border-[#2C332D] px-2 py-2 safe-bottom shadow-md transition-colors">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const label = getTranslation(item.labelKey, language) || item.defaultLabel;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1.5 rounded-xl transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-[#3D3D3D] dark:text-white'
                    : 'text-[#8C8980] dark:text-[#A3A096] hover:text-[#3D3D3D]'
                }`}
                style={{ minWidth: '46px', minHeight: '48px' }}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-[#F5F4EF] dark:bg-[#2A332B] text-[#7D8C6F]' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[9px] tracking-wider uppercase mt-0.5 truncate max-w-[54px] ${
                    isActive ? 'font-bold' : 'font-medium'
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7D8C6F] absolute -bottom-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
