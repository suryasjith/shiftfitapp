import React, { useState } from 'react';
import { 
  UserProfile, 
  NutritionLog, 
  HydrationLog, 
  ShiftDay 
} from '../../types';
import { RotaEngine } from '../../services/rotaEngine';
import { 
  UtensilsCrossed, 
  Flame, 
  Droplet, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RotateCcw,
  Clock,
  Heart
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';

interface NutritionTabProps {
  todayStr: string;
  profile: UserProfile;
  customShifts: Record<string, ShiftDay>;
  nutrition: NutritionLog | null;
  hydration: HydrationLog | null;
  onSaveNutrition: (log: NutritionLog) => void;
  onSaveHydration: (log: HydrationLog) => void;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({
  todayStr,
  profile,
  customShifts,
  nutrition,
  hydration,
  onSaveNutrition,
  onSaveHydration,
}) => {
  const dayInfo = RotaEngine.getDayInfo(todayStr, profile, customShifts);
  const targetMacros = dayInfo.isShiftDay ? profile.shiftDayMacros : profile.offDayMacros;

  // Active nutrition values
  const currentProtein = nutrition?.proteinGrams || 0;
  const currentFats = nutrition?.fatsGrams || 0;
  const currentCarbs = nutrition?.carbsGrams || 0;
  const currentCalories = nutrition?.calories || (currentProtein * 4 + currentFats * 9 + currentCarbs * 4);

  // Quick Macro Adjustment handler
  const handleAdjustMacro = (field: 'proteinGrams' | 'fatsGrams' | 'carbsGrams', delta: number) => {
    soundManager.playTap();
    const newProt = field === 'proteinGrams' ? Math.max(0, currentProtein + delta) : currentProtein;
    const newFats = field === 'fatsGrams' ? Math.max(0, currentFats + delta) : currentFats;
    const newCarbs = field === 'carbsGrams' ? Math.max(0, currentCarbs + delta) : currentCarbs;
    const newCals = newProt * 4 + newFats * 9 + newCarbs * 4;

    const updated: NutritionLog = {
      date: todayStr,
      proteinGrams: newProt,
      fatsGrams: newFats,
      carbsGrams: newCarbs,
      calories: newCals,
      targetProtein: targetMacros.proteinGrams,
      targetFats: targetMacros.fatsGrams,
      targetCarbs: targetMacros.carbsGrams,
      targetCalories: targetMacros.calories,
    };
    onSaveNutrition(updated);
  };

  // Hydration handlers
  const currentWater = hydration?.currentMl || 0;
  const targetWater = hydration?.targetMl || profile.dailyWaterTargetMl || 3800;

  const handleAddWater = (ml: number) => {
    soundManager.playTap();
    const newCurrent = Math.max(0, currentWater + ml);
    const timeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const existingDrinks = hydration?.drinks || [];
    
    const updated: HydrationLog = {
      date: todayStr,
      targetMl: targetWater,
      currentMl: newCurrent,
      drinks: [...existingDrinks, { time: timeStr, amountMl: ml }],
    };
    onSaveHydration(updated);
  };

  const handleResetWater = () => {
    soundManager.playTap();
    const updated: HydrationLog = {
      date: todayStr,
      targetMl: targetWater,
      currentMl: 0,
      drinks: [],
    };
    onSaveHydration(updated);
  };

  // Helper for macro status
  const getMacroStatus = (current: number, target: number) => {
    const ratio = current / target;
    if (ratio >= 0.95 && ratio <= 1.08) {
      return { label: 'TARGET MET', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' };
    }
    if (ratio < 0.95) {
      return { label: `${target - current}g REMAINING`, color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' };
    }
    return { label: `+${current - target}g EXCEEDED`, color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30' };
  };

  const protStatus = getMacroStatus(currentProtein, targetMacros.proteinGrams);
  const fatsStatus = getMacroStatus(currentFats, targetMacros.fatsGrams);
  const carbsStatus = getMacroStatus(currentCarbs, targetMacros.carbsGrams);

  const waterPercent = Math.min(100, Math.round((currentWater / targetWater) * 100));

  return (
    <div className="space-y-4 pb-28 text-left animate-fadeIn">
      {/* Nutrition Header Card */}
      <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                dayInfo.isShiftDay 
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                  : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
              }`}>
                {dayInfo.isShiftDay ? '12h SHIFT MACRO TARGETS' : 'OFF-DAY HYPERTROPHY MACROS'}
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              Body Recomposition Fuel
            </h2>
            <p className="text-xs text-slate-300">
              Calorie cycling automatically adjusts for {dayInfo.isShiftDay ? '12h work shifts' : 'off-day lifting'}.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-dark-850 border border-dark-750 text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Calories</span>
            <div className="text-base font-black text-white font-mono">
              {currentCalories} <span className="text-xs text-slate-400 font-normal">/ {targetMacros.calories}</span>
            </div>
          </div>
        </div>

        {/* Total Calories Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-dark-800 h-2.5 rounded-full overflow-hidden p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                currentCalories > targetMacros.calories * 1.1 
                  ? 'bg-rose-500' 
                  : 'bg-gradient-to-r from-cyan-400 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.round((currentCalories / targetMacros.calories) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Granular Macro Cards with Visual Status Bars (Met / Missed / Exceeded) */}
      <div className="space-y-3">
        {/* Protein Card */}
        <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-orange/15 text-brand-orange flex items-center justify-center font-black text-xs">
                PRO
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Protein</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${protStatus.bg} ${protStatus.color}`}>
                    {protStatus.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Target: ~2.3g/kg lean mass preservation</p>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-xl font-black text-white">{currentProtein}</span>
              <span className="text-xs text-slate-400"> / {targetMacros.proteinGrams}g</span>
            </div>
          </div>

          {/* Visual Progress Bar with met/missed indicator */}
          <div className="mt-3 w-full bg-dark-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-brand-orange h-full rounded-full transition-all duration-500 shadow-glow-amber"
              style={{ width: `${Math.min(100, (currentProtein / targetMacros.proteinGrams) * 100)}%` }}
            />
          </div>

          {/* Quick Adjust Buttons */}
          <div className="mt-3 flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleAdjustMacro('proteinGrams', -10)}
              className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 text-xs font-bold active:scale-95 border border-dark-700"
            >
              -10g
            </button>
            <button
              onClick={() => handleAdjustMacro('proteinGrams', 10)}
              className="px-2.5 py-1 rounded-lg bg-brand-orange/15 hover:bg-brand-orange/25 text-brand-orange text-xs font-bold active:scale-95 border border-brand-orange/30"
            >
              +10g
            </button>
            <button
              onClick={() => handleAdjustMacro('proteinGrams', 30)}
              className="px-2.5 py-1 rounded-lg bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange text-xs font-bold active:scale-95 border border-brand-orange/40"
            >
              +30g Shake
            </button>
          </div>
        </div>

        {/* Carbohydrates Card */}
        <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-black text-xs">
                CHO
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Carbohydrates</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${carbsStatus.bg} ${carbsStatus.color}`}>
                    {carbsStatus.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {dayInfo.isShiftDay ? 'Sustained energy release' : 'Glycogen loading for heavy training'}
                </p>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-xl font-black text-white">{currentCarbs}</span>
              <span className="text-xs text-slate-400"> / {targetMacros.carbsGrams}g</span>
            </div>
          </div>

          <div className="mt-3 w-full bg-dark-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-500 shadow-glow-cyan"
              style={{ width: `${Math.min(100, (currentCarbs / targetMacros.carbsGrams) * 100)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleAdjustMacro('carbsGrams', -20)}
              className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 text-xs font-bold active:scale-95 border border-dark-700"
            >
              -20g
            </button>
            <button
              onClick={() => handleAdjustMacro('carbsGrams', 25)}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold active:scale-95 border border-cyan-500/30"
            >
              +25g Rice/Oats
            </button>
            <button
              onClick={() => handleAdjustMacro('carbsGrams', 50)}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold active:scale-95 border border-cyan-500/40"
            >
              +50g Meal
            </button>
          </div>
        </div>

        {/* Fats Card */}
        <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-black text-xs">
                FAT
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Healthy Fats</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${fatsStatus.bg} ${fatsStatus.color}`}>
                    {fatsStatus.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Hormone balance & joint lubrication</p>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-xl font-black text-white">{currentFats}</span>
              <span className="text-xs text-slate-400"> / {targetMacros.fatsGrams}g</span>
            </div>
          </div>

          <div className="mt-3 w-full bg-dark-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (currentFats / targetMacros.fatsGrams) * 100)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleAdjustMacro('fatsGrams', -10)}
              className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 text-xs font-bold active:scale-95 border border-dark-700"
            >
              -10g
            </button>
            <button
              onClick={() => handleAdjustMacro('fatsGrams', 10)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold active:scale-95 border border-amber-500/30"
            >
              +10g Oil/Nuts
            </button>
          </div>
        </div>
      </div>

      {/* Hydration Checklist & 12h Shift Schedule */}
      <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-lg text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Hydration Checklist</h3>
              <p className="text-[11px] text-slate-400">Combat dry hospital / site air on 12h shifts</p>
            </div>
          </div>

          <button
            onClick={handleResetWater}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300"
            title="Reset Water Log"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Big Water Progress Bar */}
        <div className="mt-3 p-3.5 rounded-xl bg-dark-850 border border-dark-750">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-mono text-2xl font-black text-cyan-400">{currentWater}</span>
              <span className="font-mono text-xs text-slate-400"> / {targetWater} ml</span>
            </div>
            <span className="text-xs font-bold font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              {waterPercent}% Reached
            </span>
          </div>

          <div className="mt-2 w-full bg-dark-800 h-3 rounded-full overflow-hidden p-0.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-glow-cyan"
              style={{ width: `${waterPercent}%` }}
            />
          </div>

          {/* Quick Water Add Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { label: '+250ml', ml: 250, sub: 'Glass' },
              { label: '+500ml', ml: 500, sub: 'Bottle' },
              { label: '+750ml', ml: 750, sub: 'Shaker' },
              { label: '+1000ml', ml: 1000, sub: '1 Litre' },
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={() => handleAddWater(btn.ml)}
                className="py-2 px-1 rounded-xl bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-cyan-500/50 text-cyan-300 active:scale-95 transition-all text-center"
              >
                <div className="text-xs font-bold">{btn.label}</div>
                <div className="text-[9px] text-slate-400 font-medium">{btn.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 12h Shift Hydration Checkpoints */}
        <div className="mt-3.5 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            12-Hour Shift Hydration Reminders
          </div>
          {[
            { time: '07:00', title: 'Pre-Shift Hydration Flush (750ml)', desc: 'Electrolytes + water to frontload hydration before rounding.' },
            { time: '12:00', title: 'Mid-Shift Anchor (1,000ml)', desc: 'Hydrate before peak cognitive afternoon fatigue.' },
            { time: '16:00', title: 'Shift Endurance Hydration (750ml)', desc: 'Prevents dehydration headaches in air-conditioned environments.' },
            { time: '19:30', title: 'Post-Shift Rehydration (1,000ml)', desc: 'Prepares muscle glycogen and CNS for sleep recovery.' },
          ].map((cp, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-dark-850/60 border border-dark-800 flex items-start gap-2.5 text-xs">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>{cp.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">[{cp.time}]</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{cp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
