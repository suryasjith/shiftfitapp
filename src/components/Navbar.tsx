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
      activeText: 'text-terracotta',
      activeBg: 'bg-orange-50 border-orange-200/80',
      activeIcon: 'text-terracotta',
      indicator: 'bg-terracotta'
    },
    { 
      id: 'workout' as NavTab, 
      label: 'Workout', 
      icon: Dumbbell, 
      hint: 'Active training session and shift rota',
      activeText: 'text-terracotta',
      activeBg: 'bg-orange-50 border-orange-200/80',
      activeIcon: 'text-terracotta',
      indicator: 'bg-terracotta'
    },
    { 
      id: 'fuel' as NavTab, 
      label: 'Fuel', 
      icon: UtensilsCrossed, 
      hint: 'Macro targets and hydration tracking',
      activeText: 'text-sage-700',
      activeBg: 'bg-emerald-50 border-emerald-200/80',
      activeIcon: 'text-sage-700',
      indicator: 'bg-sage-700'
    },
    { 
      id: 'progress' as NavTab, 
      label: 'Progress', 
      icon: TrendingUp, 
      hint: 'Analytics, cardio activities and steps',
      activeText: 'text-purple-700',
      activeBg: 'bg-purple-50 border-purple-200/80',
      activeIcon: 'text-purple-700',
      indicator: 'bg-purple-700'
    },
  ];

  return (
    <nav 
      role="navigation"
      aria-label="Main Application Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FBF9F5]/85 backdrop-blur-2xl border-t border-stone-200/80 pb-[max(env(safe-area-inset-bottom,16px),16px)] pt-2 px-4 shadow-lg"
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
              className={`min-h-[48px] flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-150 relative select-none active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-200 ${
                isActive
                  ? tab.activeText
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {isActive && (
                <span 
                  aria-hidden="true" 
                  className={`absolute -top-2 w-8 h-[3px] rounded-full transition-all ${tab.indicator}`} 
                />
              )}
              <div 
                aria-hidden="true"
                className={`p-1.5 rounded-xl border transition-colors ${
                  isActive ? tab.activeBg : 'bg-transparent border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? `stroke-[2.4px] ${tab.activeIcon}` : 'stroke-[1.8px] text-stone-400'}`} />
              </div>
              <span className={`text-[10px] mt-1 tracking-tight font-heading truncate max-w-full ${
                isActive ? `font-bold ${tab.activeText}` : 'font-medium text-stone-500'
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
