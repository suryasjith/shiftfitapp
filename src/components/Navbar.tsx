import React from 'react';
import { 
  Home, 
  Dumbbell, 
  UtensilsCrossed, 
  TrendingUp 
} from 'lucide-react';

export type NavTab = 'today' | 'workout' | 'fuel' | 'progress';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const tabs = [
    { 
      id: 'today' as NavTab, 
      label: 'Today', 
      icon: Home, 
      hint: 'Daily dashboard and energy check-in',
      activeText: 'text-[#00FF87]',
      activeBg: 'bg-[#00FF87]/15 border-[#00FF87]/40',
      activeIcon: 'text-[#00FF87]',
      indicator: 'bg-[#00FF87]'
    },
    { 
      id: 'workout' as NavTab, 
      label: 'Workout', 
      icon: Dumbbell, 
      hint: 'Active training session and shift rota',
      activeText: 'text-[#00FF87]',
      activeBg: 'bg-[#00FF87]/15 border-[#00FF87]/40',
      activeIcon: 'text-[#00FF87]',
      indicator: 'bg-[#00FF87]'
    },
    { 
      id: 'fuel' as NavTab, 
      label: 'Fuel', 
      icon: UtensilsCrossed, 
      hint: 'Macro targets and hydration tracking',
      activeText: 'text-[#00FF87]',
      activeBg: 'bg-[#00FF87]/15 border-[#00FF87]/40',
      activeIcon: 'text-[#00FF87]',
      indicator: 'bg-[#00FF87]'
    },
    { 
      id: 'progress' as NavTab, 
      label: 'Progress', 
      icon: TrendingUp, 
      hint: 'Analytics, cardio activities and steps',
      activeText: 'text-[#A354F5]',
      activeBg: 'bg-[#8A2BE2]/20 border-[#8A2BE2]/40',
      activeIcon: 'text-[#A354F5]',
      indicator: 'bg-[#8A2BE2]'
    },
  ];

  return (
    <nav 
      role="navigation"
      aria-label="Main Application Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B132B]/85 backdrop-blur-xl border-t border-white/10 pb-[max(env(safe-area-inset-bottom,16px),16px)] pt-2 px-4 shadow-2xl"
    >
      <div 
        role="tablist" 
        aria-orientation="horizontal"
        className="max-w-md mx-auto grid grid-cols-4 gap-2"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              aria-label={`${tab.label}: ${tab.hint}`}
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center py-2 px-1 rounded-[4px] transition-all duration-150 relative select-none active:translate-y-[2px] focus:outline-none focus:ring-1 focus:ring-[#00FF87] ${
                isActive
                  ? tab.activeText
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span 
                  aria-hidden="true" 
                  className={`absolute -top-2 w-8 h-[2px] rounded-none transition-all ${tab.indicator}`} 
                />
              )}
              <div 
                aria-hidden="true"
                className={`p-1.5 rounded-[4px] border transition-colors ${
                  isActive ? tab.activeBg : 'bg-transparent border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? `stroke-[2.2px] ${tab.activeIcon}` : 'stroke-[1.6px] text-slate-400'}`} />
              </div>
              <span className={`text-[10px] mt-1 tracking-wider font-heading uppercase truncate max-w-full ${
                isActive ? `font-black ${tab.activeText}` : 'font-semibold text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
