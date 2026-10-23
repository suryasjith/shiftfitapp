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
    { id: 'today' as NavTab, label: 'Today', icon: Home, hint: 'Dashboard' },
    { id: 'workout' as NavTab, label: 'Workout', icon: Dumbbell, hint: 'Train & Rota' },
    { id: 'fuel' as NavTab, label: 'Fuel', icon: UtensilsCrossed, hint: 'Macros & Water' },
    { id: 'progress' as NavTab, label: 'Progress', icon: TrendingUp, hint: 'Analytics & Steps' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-neutral-800 pb-[max(env(safe-area-inset-bottom,16px),16px)] pt-2 px-4 shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 relative select-none active:scale-95 ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {isActive && (
                <span className="absolute -top-2 w-6 h-[2px] bg-white rounded-full transition-all" />
              )}
              <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-neutral-900 border border-neutral-750' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2px] text-white' : 'stroke-[1.6px] text-neutral-400'}`} />
              </div>
              <span className={`text-[11px] mt-1 tracking-tight font-sans truncate max-w-full ${isActive ? 'font-bold text-white' : 'font-medium text-neutral-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
