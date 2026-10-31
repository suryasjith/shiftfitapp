import React, { useState } from 'react';
import { UserProfile, ShiftDay } from '../types';
import { NavTab } from './Navbar';
import { Info, Database, ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { TabGuideModal } from './TabGuideModal';
import { RotaEngine } from '../services/rotaEngine';
import { soundManager } from '../services/audioTimer';

interface HeaderProps {
  todayStr: string;
  selectedDate: string;
  profile: UserProfile;
  customShifts: Record<string, ShiftDay>;
  currentTab: NavTab;
  onSelectDate: (dateStr: string) => void;
  onExportBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  todayStr,
  selectedDate,
  profile,
  currentTab,
  onSelectDate,
  onExportBackup,
}) => {
  const [isTabGuideOpen, setIsTabGuideOpen] = useState<boolean>(false);

  const changeDateByDays = (baseDateStr: string, deltaDays: number): string => {
    const d = RotaEngine.parseDate(baseDateStr);
    d.setDate(d.getDate() + deltaDays);
    return RotaEngine.formatDate(d);
  };

  const handlePrevDay = () => {
    soundManager.playTap();
    onSelectDate(changeDateByDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    soundManager.playTap();
    onSelectDate(changeDateByDays(selectedDate, 1));
  };

  const handleReturnToday = () => {
    soundManager.playTap();
    onSelectDate(todayStr);
  };

  const isToday = selectedDate === todayStr;

  const getRelativeDateLabel = (dateStr: string): { main: string; sub?: string } => {
    const d = RotaEngine.parseDate(dateStr);
    const dateFormatted = d.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });

    if (dateStr === todayStr) {
      return { main: 'Today', sub: dateFormatted };
    }
    const yesterday = changeDateByDays(todayStr, -1);
    if (dateStr === yesterday) {
      return { main: 'Yesterday', sub: dateFormatted };
    }
    const tomorrow = changeDateByDays(todayStr, 1);
    if (dateStr === tomorrow) {
      return { main: 'Tomorrow', sub: dateFormatted };
    }
    return { 
      main: dateFormatted, 
      sub: d.getFullYear().toString() 
    };
  };

  const dateLabel = getRelativeDateLabel(selectedDate);

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 pt-[max(env(safe-area-inset-top,44px),44px)] pb-2.5 select-none space-y-2.5">
        {/* Top Bar: Brand, Weight Corridor & Utility Actions */}
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-black font-mono text-xs text-amber-400">
              SF
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-slate-100 font-mono">SHIFTFIT</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full border border-slate-700 bg-slate-800 text-slate-300 font-mono font-medium">
                  {profile.targetWeightMinKg}–{profile.targetWeightMaxKg}kg
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {isToday ? 'Live Daily Tracker' : 'Historical Archive Mode'}
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Offline IndexedDB Status */}
            <button
              onClick={onExportBackup}
              aria-label="Export Offline Database Backup (JSON)"
              className="min-h-[44px] flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-750 bg-slate-800/80 text-slate-300 hover:text-white hover:border-slate-600 text-[10px] font-mono transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400"
              title="100% Offline IndexedDB Engine Active. Tap to Export Local Backup."
            >
              <Database className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Offline DB</span>
            </button>

            {/* Contextual Tab Guide ('i' Icon) */}
            <button
              onClick={() => setIsTabGuideOpen(true)}
              className="min-h-[44px] min-w-[44px] w-9 h-9 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center justify-center transition-all active:scale-90 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              title="Tab Guide & Instructions"
              aria-label="Open Tab Instructions"
            >
              <Info className="w-4 h-4 stroke-[2.2px] text-slate-200" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Universal Date Switcher: Browse Past, Present, and Future Days */}
        <div 
          role="region"
          aria-label="Date Navigation"
          className="flex items-center justify-between bg-slate-950 border border-slate-800 p-1 rounded-2xl shadow-inner"
        >
          {/* Previous Day Button */}
          <button
            onClick={handlePrevDay}
            aria-label="Go to previous day"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Center Date Display + Native Picker Trigger */}
          <div className="relative flex-1 px-2 text-center">
            <label htmlFor="universal-date-picker" className="cursor-pointer block">
              <div className="flex items-center justify-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold text-white font-mono tracking-tight">
                  {dateLabel.main}
                </span>
                {dateLabel.sub && (
                  <span className="text-[10px] text-neutral-400 font-mono">
                    ({dateLabel.sub})
                  </span>
                )}
              </div>
            </label>
            <input
              id="universal-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  soundManager.playTap();
                  onSelectDate(e.target.value);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label="Select specific date from calendar"
            />
          </div>

          {/* Right Action: Next Day Button or Return to Today Button */}
          <div className="flex items-center gap-1">
            {!isToday && (
              <button
                onClick={handleReturnToday}
                aria-label="Jump back to today"
                className="min-h-[44px] px-2.5 rounded-xl bg-white text-black font-mono font-bold text-[10px] uppercase flex items-center gap-1 active:scale-95 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-white"
              >
                <RotateCcw className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
                <span>Today</span>
              </button>
            )}

            <button
              onClick={handleNextDay}
              aria-label="Go to next day"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-800 active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-white"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Historical Context Notice Banner if viewing past date */}
        {!isToday && (
          <div 
            role="status" 
            aria-live="polite"
            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[10px] font-mono text-neutral-300 animate-fadeIn"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" aria-hidden="true" />
              <span>Viewing Past Day: <strong className="text-white">{selectedDate}</strong></span>
            </span>
            <span className="text-neutral-400 font-sans">
              All logs reflect this date
            </span>
          </div>
        )}
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
