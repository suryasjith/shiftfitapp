import React from 'react';
import { 
  Home, 
  Calendar, 
  Dumbbell, 
  UtensilsCrossed, 
  TrendingUp, 
  Camera 
} from 'lucide-react';

export type NavTab = 'dashboard' | 'schedule' | 'workout' | 'nutrition' | 'analytics' | 'vault';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Today', icon: Home },
    { id: 'schedule' as NavTab, label: 'Rota', icon: Calendar },
    { id: 'workout' as NavTab, label: 'Train', icon: Dumbbell },
    { id: 'nutrition' as NavTab, label: 'Macros', icon: UtensilsCrossed },
    { id: 'analytics' as NavTab, label: 'Review', icon: TrendingUp },
    { id: 'vault' as NavTab, label: 'Vault', icon: Camera },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-neutral-800 pb-[env(safe-area-inset-bottom,12px)] pt-2 px-2">
      <div className="max-w-md mx-auto grid grid-cols-6 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all duration-150 relative ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {isActive && (
                <span className="absolute -top-2 w-5 h-[2px] bg-white rounded-full" />
              )}
              <div className={`p-1 rounded ${isActive ? 'bg-neutral-850' : ''}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.2px]' : 'stroke-[1.6px]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-mono truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
