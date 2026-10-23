import React, { useState } from 'react';
import { UserProfile, ShiftDay } from '../types';
import { NavTab } from './Navbar';
import { Info, Database } from 'lucide-react';
import { TabGuideModal } from './TabGuideModal';

interface HeaderProps {
  todayStr: string;
  profile: UserProfile;
  customShifts: Record<string, ShiftDay>;
  currentTab: NavTab;
  onExportBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  todayStr,
  profile,
  currentTab,
  onExportBackup,
}) => {
  const [isTabGuideOpen, setIsTabGuideOpen] = useState<boolean>(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-neutral-850 px-4 pt-[max(env(safe-area-inset-top,48px),48px)] pb-3 select-none">
        <div className="flex items-center justify-between">
          {/* Brand & Date */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-750 flex items-center justify-center font-black font-mono text-xs text-white">
              SF
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white font-mono">SHIFTFIT</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded border border-neutral-750 bg-neutral-900 text-neutral-300 font-mono font-medium">
                  {profile.targetWeightMinKg}–{profile.targetWeightMaxKg}kg
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">
                {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Offline IndexedDB Engine Status & Backup */}
            <button
              onClick={onExportBackup}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700 text-[10px] font-mono transition-all active:scale-95"
              title="100% Offline IndexedDB Engine Active. Tap to Export Local Backup."
            >
              <Database className="w-3.5 h-3.5 text-neutral-300" />
              <span>Offline DB</span>
            </button>

            {/* Contextual Tab Guide ('i' Icon) - Minimalist Circular */}
            <button
              onClick={() => setIsTabGuideOpen(true)}
              className="w-8 h-8 rounded-full border border-neutral-750 bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center transition-all active:scale-90 shadow-sm"
              title="Tab Guide & Instructions"
              aria-label="Open Tab Instructions"
            >
              <Info className="w-4 h-4 stroke-[2.2px] text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Contextual Tab Guide Modal */}
      <TabGuideModal
        isOpen={isTabGuideOpen}
        currentTab={currentTab}
        onClose={() => setIsTabGuideOpen(false)}
      />
    </>
  );
};
