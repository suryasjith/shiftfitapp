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
  activeWorkoutCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Today', icon: Home },
    { id: 'schedule' as NavTab, label: '4-3 Rota', icon: Calendar },
    { id: 'workout' as NavTab, label: 'Train', icon: Dumbbell },
    { id: 'nutrition' as NavTab, label: 'Macros', icon: UtensilsCrossed },
    { id: 'analytics' as NavTab, label: 'Review', icon: TrendingUp },
    { id: 'vault' as NavTab, label: 'Vault', icon: Camera },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dark-950/95 backdrop-blur-xl border-t border-dark-800 pb-[env(safe-area-inset-bottom,12px)] pt-2 px-2">
      <div className="max-w-md mx-auto grid grid-cols-6 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? 'text-cyan-400 font-semibold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
              )}
              <div className={`p-1 rounded-lg ${isActive ? 'bg-cyan-500/10' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
