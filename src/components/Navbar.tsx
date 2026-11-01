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
      activeText: 'text-terracotta dark:text-orange-400',
      activeBg: 'bg-orange-50 dark:bg-orange-950/80 border-orange-200/80 dark:border-orange-500/40',
      activeIcon: 'text-terracotta dark:text-orange-400',
      indicator: 'bg-[#EA580C] dark:bg-orange-500'
    },
    { 
      id: 'workout' as NavTab, 
      label: 'Workout', 
      icon: Dumbbell, 
      hint: 'Active training session and shift rota',
      activeText: 'text-terracotta dark:text-orange-400',
      activeBg: 'bg-orange-50 dark:bg-orange-950/80 border-orange-200/80 dark:border-orange-500/40',
      activeIcon: 'text-terracotta dark:text-orange-400',
      indicator: 'bg-[#EA580C] dark:bg-orange-500'
    },
    { 
      id: 'fuel' as NavTab, 
      label: 'Fuel', 
      icon: UtensilsCrossed, 
      hint: 'Macro targets and hydration tracking',
      activeText: 'text-emerald-700 dark:text-emerald-400',
      activeBg: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200/80 dark:border-emerald-500/40',
      activeIcon: 'text-emerald-700 dark:text-emerald-400',
      indicator: 'bg-emerald-600 dark:bg-emerald-500'
    },
    { 
      id: 'progress' as NavTab, 
      label: 'Progress', 
      icon: TrendingUp, 
      hint: 'Analytics, cardio activities and steps',
      activeText: 'text-purple-700 dark:text-purple-300',
      activeBg: 'bg-purple-50 dark:bg-purple-950/80 border-purple-200/80 dark:border-purple-500/40',
      activeIcon: 'text-purple-700 dark:text-purple-300',
      indicator: 'bg-purple-600 dark:bg-purple-500'
    },
  ];

  return (
    <nav 
      role="navigation"
      aria-label="Main Application Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FBF9F5]/85 dark:bg-black/90 backdrop-blur-2xl border-t border-stone-200/80 dark:border-white/10 pb-[max(env(safe-area-inset-bottom,16px),16px)] pt-2 px-4 shadow-lg"
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
                  : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
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
                  isActive ? `${tab.activeBg} dark:bg-stone-900/90 dark:border-white/15` : 'bg-transparent border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? `stroke-[2.4px] ${tab.activeIcon}` : 'stroke-[1.8px] text-stone-400 dark:text-stone-500'}`} />
              </div>
              <span className={`text-[10px] mt-1 tracking-tight font-heading truncate max-w-full ${
                isActive ? `font-bold ${tab.activeText}` : 'font-medium text-stone-500 dark:text-stone-400'
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
