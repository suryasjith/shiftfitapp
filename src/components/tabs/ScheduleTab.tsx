import React, { useState } from 'react';
import { UserProfile, ShiftDay, ShiftType } from '../../types';
import { RotaEngine, RotaDayInfo, ROTA_PRESETS } from '../../services/rotaEngine';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  Dumbbell, 
  Edit3, 
  Clock,
  Layers,
  Check
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';
import { ContextualHelp } from '../ContextualHelp';

interface ScheduleTabProps {
  todayStr: string;
  profile: UserProfile;
  customShifts: Record<string, ShiftDay>;
  onSaveShift: (shift: ShiftDay) => void;
  onUpdateTemplate: (template: ShiftType[]) => void;
  onNavigateTab: (tab: any) => void;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  todayStr,
  profile,
  customShifts,
  onSaveShift,
  onUpdateTemplate,
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

  const [showTemplateEditor, setShowTemplateEditor] = useState<boolean>(false);

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

  const handleToggleTemplateDay = (idx: number) => {
    soundManager.playTap();
    const currentTemplate = [...(profile.twoWeekTemplate || ROTA_PRESETS.fourOnThreeOff)];
    const cur = currentTemplate[idx];
    if (cur === 'day_12h') currentTemplate[idx] = 'night_12h';
    else if (cur === 'night_12h') currentTemplate[idx] = 'off';
    else currentTemplate[idx] = 'day_12h';
    onUpdateTemplate(currentTemplate);
  };

  const handleSelectPreset = (preset: ShiftType[]) => {
    soundManager.playTap();
    onUpdateTemplate([...preset]);
  };

  return (
    <div className="space-y-3.5 pb-24 text-left animate-fadeIn">
      {/* Calendar Header Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-neutral-900 border border-neutral-750 text-white">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold text-white uppercase tracking-tight">2-Week Rolling Rota</h2>
                <ContextualHelp
                  title="2-Week Rolling Rota"
                  content="Loops your 14-day shift pattern infinitely. Tap 'Template' to customize your 2-week cycle, or tap any day on the calendar to add overtime or shift swaps."
                />
              </div>
              <p className="text-[10px] text-neutral-400">14-Day Infinite Loop Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowTemplateEditor(!showTemplateEditor)}
              className="px-2 py-1 rounded border border-neutral-750 bg-neutral-900 text-white text-[10px] hover:border-neutral-500"
            >
              {showTemplateEditor ? 'Close' : 'Template'}
            </button>

            <div className="flex items-center bg-neutral-900 p-0.5 rounded border border-neutral-800">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-neutral-400 hover:text-white"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-bold text-white px-1">
                {monthNames[currentMonth].slice(0, 3)} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 text-neutral-400 hover:text-white"
                aria-label="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2-Week Template Drawer */}
        {showTemplateEditor && (
          <div className="mt-3.5 p-3 rounded-lg bg-neutral-900 border border-neutral-750 space-y-2.5 animate-slideUp">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-white">14-Day Loop Template</span>
              <ContextualHelp
                title="14-Day Loop Template"
                content="This is the underlying pattern that repeats infinitely. Editing this updates the whole schedule loop. Specific overtime shifts added to individual dates will remain intact."
              />
            </div>

            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => handleSelectPreset(ROTA_PRESETS.fourOnThreeOff)}
                className="py-1 rounded bg-black text-[9px] border border-neutral-800 text-neutral-300 hover:text-white"
              >
                4-on / 3-off
              </button>
              <button
                onClick={() => handleSelectPreset(ROTA_PRESETS.alternatingFourThree)}
                className="py-1 rounded bg-black text-[9px] border border-neutral-800 text-neutral-300 hover:text-white"
              >
                4-3 / 3-4
              </button>
              <button
                onClick={() => handleSelectPreset(ROTA_PRESETS.panama223)}
                className="py-1 rounded bg-black text-[9px] border border-neutral-800 text-neutral-300 hover:text-white"
              >
                2-2-3 Panama
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="text-[8px] text-neutral-400 uppercase">Tap any day to toggle (12h &rarr; Night &rarr; Off):</div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {(profile.twoWeekTemplate || ROTA_PRESETS.fourOnThreeOff).slice(0, 7).map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleToggleTemplateDay(idx)}
                    className={`p-1 rounded text-[9px] font-bold border transition-all ${
                      s === 'off' ? 'bg-black text-neutral-500 border-neutral-800' : 'bg-white text-black border-white'
                    }`}
                  >
                    <div>D{idx + 1}</div>
                    <div className="text-[8px] font-normal">{s === 'off' ? 'OFF' : s === 'night_12h' ? 'NGT' : '12H'}</div>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {(profile.twoWeekTemplate || ROTA_PRESETS.fourOnThreeOff).slice(7, 14).map((s, idx) => (
                  <button
                    key={idx + 7}
                    onClick={() => handleToggleTemplateDay(idx + 7)}
                    className={`p-1 rounded text-[9px] font-bold border transition-all ${
                      s === 'off' ? 'bg-black text-neutral-500 border-neutral-800' : 'bg-white text-black border-white'
                    }`}
                  >
                    <div>D{idx + 8}</div>
                    <div className="text-[8px] font-normal">{s === 'off' ? 'OFF' : s === 'night_12h' ? 'NGT' : '12H'}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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
                      Shift
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
        <div className="flex items-start justify-between font-mono">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400">
                {new Date(selectedDateStr).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
              {selectedDateStr === todayStr && (
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-white text-black">
                  TODAY
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              {selectedDayInfo.shiftLabel}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-750 bg-neutral-900 hover:border-neutral-600 text-white text-xs font-mono font-medium transition-all active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
              <span>Override / OT</span>
            </button>
            <ContextualHelp
              title="Shift Override"
              content="Tap Override to pick up an extra overtime shift or swap this day without breaking the rest of your 2-week rolling rota."
            />
          </div>
        </div>

        {/* Dynamic Algorithm Workout Routing Box */}
        <div className="mt-3.5 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between mb-1.5 font-mono">
            <span className="text-[10px] font-bold uppercase text-neutral-400">
              Prescribed Workout Routing
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border border-neutral-700 bg-black text-neutral-300">
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
              '12-Hour Shift Day: Central nervous system prioritized. Focus on spinal decompression, hip mobility, and hydration.'
            ) : (
              'Scheduled Off-Day: Fresh CNS state. Prescribed heavy hypertrophy targeting clavicular chest, delts, or lower body.'
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
      </div>

      {/* Edit Shift Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-xl bg-black border border-neutral-700 shadow-2xl p-5 text-left font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase">Override Specific Day</h3>
                <p className="text-[11px] text-neutral-400">{selectedDateStr}</p>
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
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Select Shift for this Date:
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'day_12h', label: '12-Hour Day Shift (07:00 – 19:00)', isOt: false },
                    { id: 'night_12h', label: '12-Hour Night Shift (19:00 – 07:00)', isOt: false },
                    { id: 'overtime_day', label: '[!] Extra Overtime 12h Day Shift', isOt: true },
                    { id: 'overtime_night', label: '[!] Extra Overtime 12h Night Shift', isOt: true },
                    { id: 'off', label: 'Off-Day (Lifting Day)', isOt: false },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setModalShiftType(option.id as ShiftType);
                        setModalIsOvertime(option.isOt);
                      }}
                      className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all ${
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
                <label className="text-xs text-neutral-400 block mb-1">
                  Optional Notes:
                </label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="e.g. Extra overtime shift"
                  className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2 rounded-lg border border-neutral-800 text-neutral-400 text-xs hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="flex-1 py-2 rounded-lg bg-white text-black text-xs font-bold tracking-tight hover:bg-neutral-200"
              >
                Save Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
