import React, { useState } from 'react';
import { UserProfile, ShiftDay, ShiftType } from '../../types';
import { RotaEngine, RotaDayInfo } from '../../services/rotaEngine';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  Dumbbell, 
  Edit3, 
  Clock
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';
import { ContextualHelp } from '../ContextualHelp';

interface ScheduleTabProps {
  todayStr: string;
  profile: UserProfile;
  customShifts: Record<string, ShiftDay>;
  onSaveShift: (shift: ShiftDay) => void;
  onNavigateTab: (tab: any) => void;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  todayStr,
  profile,
  customShifts,
  onSaveShift,
  onNavigateTab,
}) => {
  const today = RotaEngine.parseDate(todayStr);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [modalShiftType, setModalShiftType] = useState<ShiftType>('day_12h');
  const [modalIsOvertime, setModalIsOvertime] = useState<boolean>(false);
  const [modalNotes, setModalNotes] = useState<string>('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    soundManager.playTap();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    soundManager.playTap();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const days = RotaEngine.getMonthDays(currentYear, currentMonth, profile, customShifts);
  const selectedDayInfo = RotaEngine.getDayInfo(selectedDateStr, profile, customShifts, todayStr);

  const handleSelectDay = (day: RotaDayInfo) => {
    soundManager.playTap();
    setSelectedDateStr(day.date);
  };

  const handleOpenEditModal = () => {
    soundManager.playTap();
    setModalShiftType(selectedDayInfo.shiftType);
    setModalIsOvertime(selectedDayInfo.isOvertime);
    const existing = customShifts[selectedDateStr];
    setModalNotes(existing?.notes || '');
    setIsEditModalOpen(true);
  };

  const handleSaveModal = () => {
    soundManager.playCompleteChime();
    const newShift: ShiftDay = {
      date: selectedDateStr,
      shiftType: modalShiftType,
      isOvertime: modalIsOvertime || modalShiftType.startsWith('overtime'),
      notes: modalNotes,
      hoursWorked: modalShiftType === 'off' ? 0 : 12,
    };
    onSaveShift(newShift);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-3.5 pb-24 text-left animate-fadeIn">
      {/* Calendar Header Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-750 text-white">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-tight">Rota Calendar</h2>
                <ContextualHelp
                  title="Shift Rota Engine"
                  content="This view projects your 4-on/3-off rota. Tap any day to inspect its auto-routed workout. If you pick up overtime or swap a shift, tap 'Amend Shift / OT' to recalculate the training volume."
                />
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">Base 4-on / 3-off 12h Cycle</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800 font-mono">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-neutral-400 hover:text-white transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-white px-1">
              {monthNames[currentMonth].slice(0, 3)} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-neutral-400 hover:text-white transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mt-3.5 text-center text-[10px] font-mono font-bold text-neutral-500 uppercase">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mt-1.5">
          {days.map((d, idx) => {
            const isSelected = d.date === selectedDateStr;
            const isToday = d.date === todayStr;

            return (
              <button
                key={idx}
                onClick={() => handleSelectDay(d)}
                className={`min-h-[54px] p-1 rounded-lg flex flex-col justify-between items-center transition-all border ${
                  isSelected
                    ? 'border-white bg-white text-black font-bold z-10'
                    : isToday
                    ? 'border-neutral-600 bg-neutral-900 text-white'
                    : 'border-neutral-850 bg-neutral-950 text-neutral-300 hover:border-neutral-750'
                }`}
              >
                <div className="w-full flex items-center justify-between px-1">
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-black font-bold' : isToday ? 'text-white font-bold' : 'text-neutral-400'}`}>
                    {d.dayNumber}
                  </span>
                  {d.isOvertime ? (
                    <span className="text-[9px] font-mono font-black">[!]</span>
                  ) : d.isShiftDay ? (
                    <Sun className={`w-2.5 h-2.5 ${isSelected ? 'text-black' : 'text-neutral-400'}`} />
                  ) : (
                    <Moon className={`w-2.5 h-2.5 ${isSelected ? 'text-black' : 'text-neutral-300'}`} />
                  )}
                </div>

                <div className="w-full mt-1">
                  {d.isOvertime ? (
                    <div className={`text-[8px] font-mono font-bold px-0.5 py-0.2 rounded truncate text-center ${
                      isSelected ? 'bg-black text-white' : 'bg-neutral-800 text-white'
                    }`}>
                      OT 12h
                    </div>
                  ) : d.isShiftDay ? (
                    <div className={`text-[8px] font-mono px-0.5 py-0.2 rounded truncate text-center ${
                      isSelected ? 'bg-neutral-200 text-black' : 'text-neutral-500'
                    }`}>
                      S{d.shiftIndex + 1}
                    </div>
                  ) : (
                    <div className={`text-[8px] font-mono font-bold px-0.5 py-0.2 rounded truncate text-center ${
                      isSelected ? 'bg-black text-white' : 'bg-neutral-900 border border-neutral-800 text-neutral-200'
                    }`}>
                      {d.recommendedWorkoutCategory}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspector Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm text-left">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400 font-mono">
                {new Date(selectedDateStr).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
              {selectedDateStr === todayStr && (
                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-white text-black">
                  TODAY
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white mt-0.5 font-mono">
              {selectedDayInfo.shiftLabel}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-750 bg-neutral-900 hover:border-neutral-600 text-white text-xs font-mono font-medium transition-all active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
              <span>Amend</span>
            </button>
            <ContextualHelp
              title="Amend Shift / OT"
              content="Tap Amend to switch this date between 12h Day Shift, 12h Night Shift, Overtime Shift, or an Off-Day. The algorithm immediately adjusts workout volumes for the week."
            />
          </div>
        </div>

        {/* Dynamic Algorithm Workout Routing Box */}
        <div className="mt-3.5 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">
              Prescribed Workout Routing
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-neutral-700 bg-black text-neutral-300">
              {selectedDayInfo.isShiftDay ? 'CNS RECOVERY' : 'HEAVY LIFTING'}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Dumbbell className="w-3.5 h-3.5 text-white shrink-0" />
            <h4 className="text-xs font-bold text-white font-mono">
              {selectedDayInfo.workoutTitle}
            </h4>
          </div>

          <p className="mt-1 text-xs text-neutral-300 leading-relaxed font-sans">
            {selectedDayInfo.isOvertime ? (
              'Overtime shift detected: Algorithm auto-converted heavy session to a 25-minute express workout to preserve nervous system reserve.'
            ) : selectedDayInfo.isShiftDay ? (
              `12-Hour Shift ${selectedDayInfo.shiftIndex + 1} of 4: Central nervous system prioritized. Focus on spinal decompression, hip mobility, and hydration.`
            ) : (
              `Scheduled Off-Day ${selectedDayInfo.offIndex + 1} of 3: Fresh CNS state. Prescribed heavy hypertrophy targeting clavicular chest, delts, or lower body.`
            )}
          </p>

          <div className="mt-3 pt-2 border-t border-neutral-850 flex justify-between items-center text-xs font-mono">
            <span className="text-neutral-500">Category: <strong className="text-white">{selectedDayInfo.recommendedWorkoutCategory}</strong></span>
            <button
              onClick={() => onNavigateTab('workout')}
              className="text-white hover:underline font-semibold"
            >
              Train &rarr;
            </button>
          </div>
        </div>

        <div className="mt-3 text-[10px] text-neutral-500 flex items-center gap-1.5 font-mono">
          <Clock className="w-3 h-3 text-neutral-500 shrink-0" />
          <span>Anchor date: {profile.rotaStartDate} (4 On / 3 Off 12h shifts).</span>
        </div>
      </div>

      {/* Edit Shift Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-xl bg-black border border-neutral-700 shadow-2xl p-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase">Amend Shift / Overtime</h3>
                <p className="text-[11px] text-neutral-400 font-mono">{selectedDateStr}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-mono font-semibold text-neutral-300 block mb-1.5">
                  Select Shift Type:
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'day_12h', label: '12-Hour Day Shift (07:00 – 19:00)', isOt: false },
                    { id: 'night_12h', label: '12-Hour Night Shift (19:00 – 07:00)', isOt: false },
                    { id: 'overtime_day', label: '[!] Overtime 12h Day Shift', isOt: true },
                    { id: 'overtime_night', label: '[!] Overtime 12h Night Shift', isOt: true },
                    { id: 'off', label: 'Off-Day (Lifting Day)', isOt: false },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setModalShiftType(option.id as ShiftType);
                        setModalIsOvertime(option.isOt);
                      }}
                      className={`w-full p-2.5 rounded-lg border text-left text-xs font-mono transition-all ${
                        modalShiftType === option.id
                          ? 'bg-white text-black font-bold border-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">
                  Optional Notes:
                </label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="e.g. Ward cover overtime"
                  className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2 rounded-lg border border-neutral-800 text-neutral-400 text-xs font-mono hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="flex-1 py-2 rounded-lg bg-white text-black text-xs font-bold font-mono tracking-tight hover:bg-neutral-200"
              >
                Save & Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
