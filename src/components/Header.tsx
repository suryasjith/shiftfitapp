import React, { useState, useEffect } from 'react';
import { UserProfile, ShiftDay } from '../types';
import { NavTab } from './Navbar';
import { Info, Database, ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw, Moon, Sun } from 'lucide-react';
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    soundManager.playTap();
    const newDark = !isDarkMode;
    setIsDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('shiftfit_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('shiftfit_theme', 'light');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('shiftfit_theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

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
      <header className="sticky top-0 z-30 bg-[#FBF9F5]/85 dark:bg-black/90 backdrop-blur-2xl border-b border-stone-200/70 dark:border-white/10 px-4 pt-[max(env(safe-area-inset-top,44px),44px)] pb-3 select-none space-y-3">
        {/* Top Bar: Brand, Weight Corridor & Utility Actions */}
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-stone-900 border border-orange-200/80 dark:border-orange-500/30 flex items-center justify-center font-bold font-heading text-xs text-terracotta shadow-xs">
              SF
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-stone-900 dark:text-white font-heading">SHIFTFIT</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full border border-stone-200 dark:border-white/15 bg-white/70 dark:bg-stone-900 text-stone-600 dark:text-stone-300 font-mono font-medium shadow-xs">
                  {profile.targetWeightMinKg}–{profile.targetWeightMaxKg}kg
                </span>
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                {isToday ? 'Daily Wellness & Recomp' : 'Historical Archive Mode'}
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="min-h-[44px] min-w-[44px] w-9 h-9 rounded-xl border border-stone-200/80 dark:border-white/15 bg-white/70 dark:bg-stone-900/90 backdrop-blur-md hover:bg-white dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 flex items-center justify-center transition-all active:scale-95 shadow-xs focus:outline-none focus:ring-2 focus:ring-orange-200"
              title={isDarkMode ? 'Active: Dark Mode (Tap for Light)' : 'Active: Light Mode (Tap for Dark)'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 stroke-[2.2px]" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700 stroke-[2.2px]" aria-hidden="true" />
              )}
            </button>

            {/* Offline IndexedDB Status */}
            <button
              onClick={onExportBackup}
              aria-label="Export Offline Database Backup (JSON)"
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200/80 dark:border-white/15 bg-white/70 dark:bg-stone-900/90 backdrop-blur-md text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white hover:bg-white dark:hover:bg-stone-800 text-[11px] font-sans font-semibold transition-all active:scale-95 shadow-xs focus:outline-none focus:ring-2 focus:ring-orange-200"
              title="100% Offline IndexedDB Engine Active. Tap to Export Local Backup."
            >
              <Database className="w-3.5 h-3.5 text-terracotta" aria-hidden="true" />
              <span>Offline DB</span>
            </button>

            {/* Contextual Tab Guide ('i' Icon) */}
            <button
              onClick={() => setIsTabGuideOpen(true)}
              className="min-h-[44px] min-w-[44px] w-9 h-9 rounded-xl border border-stone-200/80 dark:border-white/15 bg-white/70 dark:bg-stone-900/90 backdrop-blur-md hover:bg-white dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 flex items-center justify-center transition-all active:scale-95 shadow-xs focus:outline-none focus:ring-2 focus:ring-orange-200"
              title="Tab Guide & Instructions"
              aria-label="Open Tab Instructions"
            >
              <Info className="w-4 h-4 stroke-[2.2px] text-stone-700 dark:text-stone-200" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Universal Date Switcher: Browse Past, Present, and Future Days */}
        <div 
          role="region"
          aria-label="Date Navigation"
          className="flex items-center justify-between bg-white/75 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/80 dark:border-white/15 p-1.5 rounded-2xl shadow-xs"
        >
          {/* Previous Day Button */}
          <button
            onClick={handlePrevDay}
            aria-label="Go to previous day"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-stone-100/60 dark:bg-stone-800/80 hover:bg-stone-200/60 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-200 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Center Date Display + Native Picker Trigger */}
          <div className="relative flex-1 px-2 text-center">
            <label htmlFor="universal-date-picker" className="cursor-pointer block">
              <div className="flex items-center justify-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-terracotta shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold text-stone-900 dark:text-white font-heading tracking-tight">
                  {dateLabel.main}
                </span>
                {dateLabel.sub && (
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-sans">
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
          <div className="flex items-center gap-1.5">
            {!isToday && (
              <button
                onClick={handleReturnToday}
                aria-label="Jump back to today"
                className="min-h-[44px] px-3 rounded-xl bg-orange-100 dark:bg-orange-950/80 hover:bg-orange-200 dark:hover:bg-orange-900 text-terracotta font-heading font-bold text-[11px] flex items-center gap-1 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-orange-200 border border-orange-200/50 dark:border-orange-500/30"
              >
                <RotateCcw className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
                <span>Today</span>
              </button>
            )}

            <button
              onClick={handleNextDay}
              aria-label="Go to next day"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-stone-100/60 dark:bg-stone-800/80 hover:bg-stone-200/60 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-200 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-orange-200"
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
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-orange-50/80 backdrop-blur-md border border-orange-200/60 text-[11px] font-sans text-stone-700 animate-fadeIn"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-terracotta" aria-hidden="true" />
              <span>Viewing Past Day: <strong className="text-stone-900">{selectedDate}</strong></span>
            </span>
            <span className="text-stone-500 font-sans text-[10px]">
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
