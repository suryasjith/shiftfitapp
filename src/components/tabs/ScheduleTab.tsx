import React, { useState } from 'react';
import { UserProfile, ShiftDay, ShiftType } from '../../types';
import { RotaEngine, RotaDayInfo } from '../../services/rotaEngine';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  AlertTriangle, 
  Dumbbell, 
  Plus, 
  Edit3, 
  Check, 
  Info,
  Clock
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';

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
  // Calendar month state
  const today = RotaEngine.parseDate(todayStr);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Shift Edit Modal State
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
    <div className="space-y-4 pb-24 text-left animate-fadeIn">
      {/* Calendar Header Card */}
      <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Rota & Schedule Engine</h2>
              <p className="text-xs text-slate-400">Base 4-on / 3-off 12h Shifts</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-dark-800 p-1 rounded-xl border border-dark-700">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-dark-700 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white px-2 font-mono">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-dark-700 active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mt-4 text-center text-[10px] font-bold text-slate-400 uppercase">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mt-2">
          {days.map((d, idx) => {
            const isSelected = d.date === selectedDateStr;
            const isToday = d.date === todayStr;

            return (
              <button
                key={idx}
                onClick={() => handleSelectDay(d)}
                className={`min-h-[58px] p-1 rounded-xl flex flex-col justify-between items-center transition-all relative border ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/50 shadow-glow-cyan z-10 scale-[1.03]'
                    : isToday
                    ? 'border-dark-600 bg-dark-800/90'
                    : 'border-dark-800/80 bg-dark-850/60 hover:border-dark-700'
                }`}
              >
                <div className="w-full flex items-center justify-between px-1">
                  <span className={`text-[11px] font-bold font-mono ${isToday ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {d.dayNumber}
                  </span>
                  {d.isOvertime ? (
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  ) : d.isShiftDay ? (
                    <Sun className="w-2.5 h-2.5 text-amber-400" />
                  ) : (
                    <Moon className="w-2.5 h-2.5 text-emerald-400" />
                  )}
                </div>

                {/* Badge indicator */}
                <div className="w-full mt-1">
                  {d.isOvertime ? (
                    <div className="text-[8px] font-bold px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 truncate text-center">
                      OT 12h
                    </div>
                  ) : d.isShiftDay ? (
                    <div className="text-[8px] font-bold px-1 py-0.5 rounded bg-dark-750 text-slate-300 truncate text-center">
                      Shift {d.shiftIndex + 1}
                    </div>
                  ) : (
                    <div className="text-[8px] font-bold px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 truncate text-center">
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
      <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-lg text-left">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">
                {new Date(selectedDateStr).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              {selectedDateStr === todayStr && (
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  Today
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              {selectedDayInfo.shiftLabel}
            </h3>
          </div>

          <button
            onClick={handleOpenEditModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 text-cyan-300 text-xs font-semibold active:scale-95 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Amend Shift / OT</span>
          </button>
        </div>

        {/* Dynamic Algorithm Workout Routing Box */}
        <div className="mt-3.5 p-3.5 rounded-xl bg-dark-850 border border-dark-750">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Auto-Adjusted Workout Allocation
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              selectedDayInfo.isShiftDay 
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}>
              {selectedDayInfo.isShiftDay ? 'CNS Recovery Protocol' : 'Heavy Volume Routed'}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Dumbbell className="w-4 h-4 text-cyan-400 shrink-0" />
            <h4 className="text-sm font-bold text-white">
              {selectedDayInfo.workoutTitle}
            </h4>
          </div>

          <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
            {selectedDayInfo.isOvertime ? (
              '⚠️ Overtime detected: The engine throttled the session to an express 25-min low-axial maintenance workout to avoid nervous system crash.'
            ) : selectedDayInfo.isShiftDay ? (
              `12-Hour Shift ${selectedDayInfo.shiftIndex + 1} of 4: Central nervous system protection active. Shift days prioritize spinal decompression, active hip mobility, and recovery.`
            ) : (
              `Scheduled Off-Day ${selectedDayInfo.offIndex + 1} of 3: Fresh nervous system state. Auto-routed high-volume heavy hypertrophy targeting clavicular upper chest, lateral delts, and leg density.`
            )}
          </p>

          <div className="mt-3 pt-2.5 border-t border-dark-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Category: <strong className="text-white">{selectedDayInfo.recommendedWorkoutCategory}</strong></span>
            <button
              onClick={() => onNavigateTab('workout')}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Open Training Tab &rarr;
            </button>
          </div>
        </div>

        {/* Rota Configuration Info */}
        <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Base cycle anchor: {profile.rotaStartDate} (4 On / 3 Off, 12h shifts). Overtime additions auto-recalculate training load.</span>
        </div>
      </div>

      {/* Edit Shift / Add Overtime Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-dark-900 border border-dark-700 shadow-2xl p-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <div>
                <h3 className="text-base font-bold text-white">Amend Rota Shift</h3>
                <p className="text-xs text-slate-400">{selectedDateStr}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select Shift Type for this Date:
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'day_12h', label: '☀️ 12-Hour Day Shift (07:00 - 19:00)', isOt: false },
                    { id: 'night_12h', label: '🌙 12-Hour Night Shift (19:00 - 07:00)', isOt: false },
                    { id: 'overtime_day', label: '⚠️ Overtime 12h Day Shift', isOt: true },
                    { id: 'overtime_night', label: '⚠️ Overtime 12h Night Shift', isOt: true },
                    { id: 'off', label: '🏖️ Off-Day (Gym Training Day)', isOt: false },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setModalShiftType(option.id as ShiftType);
                        setModalIsOvertime(option.isOt);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        modalShiftType === option.id
                          ? 'bg-cyan-500/15 border-cyan-400 text-white font-bold'
                          : 'bg-dark-800/70 border-dark-700 text-slate-300 hover:border-dark-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Optional Notes (Shift handover, overtime details):
                </label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="e.g. Extra weekend OT shift"
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-dark-800/50 border border-dark-700/60 text-[11px] text-slate-400 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>The workout algorithm will dynamically re-route heavy training volume and adjust recovery windows immediately upon saving.</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-dark-800 text-slate-300 text-xs font-semibold hover:bg-dark-750"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-glow-cyan"
              >
                Save & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
