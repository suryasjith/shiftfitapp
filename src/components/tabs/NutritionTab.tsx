import React from 'react';
import { 
  UserProfile, 
  NutritionLog, 
  HydrationLog, 
  ShiftDay 
} from '../../types';
import { RotaEngine } from '../../services/rotaEngine';
import { 
  RotateCcw,
  Clock
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';
import { ContextualHelp } from '../ContextualHelp';

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

  const currentProtein = nutrition?.proteinGrams || 0;
  const currentFats = nutrition?.fatsGrams || 0;
  const currentCarbs = nutrition?.carbsGrams || 0;
  const currentCalories = nutrition?.calories || (currentProtein * 4 + currentFats * 9 + currentCarbs * 4);

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

  const getMacroStatus = (current: number, target: number) => {
    const ratio = current / target;
    if (ratio >= 0.95 && ratio <= 1.08) {
      return { label: 'TARGET MET', isMet: true };
    }
    if (ratio < 0.95) {
      return { label: `${target - current}g REMAINING`, isMet: false };
    }
    return { label: `+${current - target}g EXCEEDED`, isMet: false };
  };

  const protStatus = getMacroStatus(currentProtein, targetMacros.proteinGrams);
  const fatsStatus = getMacroStatus(currentFats, targetMacros.fatsGrams);
  const carbsStatus = getMacroStatus(currentCarbs, targetMacros.carbsGrams);

  const waterPercent = Math.min(100, Math.round((currentWater / targetWater) * 100));

  return (
    <div className="space-y-3.5 pb-28 text-left animate-fadeIn">
      {/* Header Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
                {dayInfo.isShiftDay ? '12H SHIFT TARGETS' : 'OFF-DAY TARGETS'}
              </span>
              <ContextualHelp
                title="Macro Cycling"
                content="Off-days feature higher carbohydrate intake to fuel heavy lifting sessions and glycogen replenishment. Shift days drop carbohydrates slightly while keeping protein steady at ~185g to prevent fat accumulation during sedentary rounds."
              />
            </div>
            <h2 className="text-sm font-bold text-white mt-1 font-mono uppercase tracking-tight">
              Macro & Calorie Fuel
            </h2>
          </div>

          <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-right font-mono">
            <span className="text-[9px] text-neutral-500 uppercase font-semibold">Calories</span>
            <div className="text-sm font-bold text-white">
              {currentCalories} <span className="text-[10px] text-neutral-500 font-normal">/ {targetMacros.calories}</span>
            </div>
          </div>
        </div>

        {/* Total Calories Bar */}
        <div className="mt-3">
          <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-850">
            <div 
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((currentCalories / targetMacros.calories) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Granular Macro Cards */}
      <div className="space-y-2.5">
        {/* Protein */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                <span>Protein</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
                  {protStatus.label}
                </span>
                <ContextualHelp
                  title="Protein Goal (~2.3g/kg)"
                  content="Ensures muscle protein synthesis remains continuous during 12h shifts and grueling training cycles to maintain 75-78kg lean body mass."
                />
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-base font-bold text-white">{currentProtein}</span>
              <span className="text-[10px] text-neutral-500"> / {targetMacros.proteinGrams}g</span>
            </div>
          </div>

          <div className="mt-2.5 w-full bg-neutral-900 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentProtein / targetMacros.proteinGrams) * 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-end gap-1 font-mono">
            <button
              onClick={() => handleAdjustMacro('proteinGrams', -10)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white text-[10px] border border-neutral-800"
            >
              -10g
            </button>
            <button
              onClick={() => handleAdjustMacro('proteinGrams', 10)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-white text-[10px] border border-neutral-750 font-bold"
            >
              +10g
            </button>
            <button
              onClick={() => handleAdjustMacro('proteinGrams', 30)}
              className="px-2 py-0.5 rounded bg-neutral-850 hover:bg-neutral-800 text-white text-[10px] border border-neutral-700 font-bold"
            >
              +30g Shake
            </button>
          </div>
        </div>

        {/* Carbohydrates */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                <span>Carbohydrates</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
                  {carbsStatus.label}
                </span>
                <ContextualHelp
                  title="Carbohydrate Fuel"
                  content="Higher on off-days to maximize glycogen stores for heavy lifts; reduced on shift days to prevent spillover."
                />
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-base font-bold text-white">{currentCarbs}</span>
              <span className="text-[10px] text-neutral-500"> / {targetMacros.carbsGrams}g</span>
            </div>
          </div>

          <div className="mt-2.5 w-full bg-neutral-900 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentCarbs / targetMacros.carbsGrams) * 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-end gap-1 font-mono">
            <button
              onClick={() => handleAdjustMacro('carbsGrams', -20)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white text-[10px] border border-neutral-800"
            >
              -20g
            </button>
            <button
              onClick={() => handleAdjustMacro('carbsGrams', 25)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-white text-[10px] border border-neutral-750 font-bold"
            >
              +25g
            </button>
            <button
              onClick={() => handleAdjustMacro('carbsGrams', 50)}
              className="px-2 py-0.5 rounded bg-neutral-850 hover:bg-neutral-800 text-white text-[10px] border border-neutral-700 font-bold"
            >
              +50g Meal
            </button>
          </div>
        </div>

        {/* Fats */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                <span>Dietary Fats</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
                  {fatsStatus.label}
                </span>
                <ContextualHelp
                  title="Dietary Fats"
                  content="Essential fatty acids support natural hormonal balance and joint health under heavy axial load."
                />
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-base font-bold text-white">{currentFats}</span>
              <span className="text-[10px] text-neutral-500"> / {targetMacros.fatsGrams}g</span>
            </div>
          </div>

          <div className="mt-2.5 w-full bg-neutral-900 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentFats / targetMacros.fatsGrams) * 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-end gap-1 font-mono">
            <button
              onClick={() => handleAdjustMacro('fatsGrams', -10)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white text-[10px] border border-neutral-800"
            >
              -10g
            </button>
            <button
              onClick={() => handleAdjustMacro('fatsGrams', 10)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-white text-[10px] border border-neutral-750 font-bold"
            >
              +10g
            </button>
          </div>
        </div>
      </div>

      {/* Hydration Checklist */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold text-white font-mono uppercase">Hydration Checklist</h3>
            <ContextualHelp
              title="12-Hour Hydration Strategy"
              content="Air-conditioned ward/plant environments cause silent dehydration. Reaching your 3.8L checkpoint goals prevents afternoon cognitive fatigue and muscle cramping."
            />
          </div>

          <button
            onClick={handleResetWater}
            className="p-1 text-neutral-500 hover:text-white"
            title="Reset Water Log"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 font-mono">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-black text-white">{currentWater}</span>
              <span className="text-xs text-neutral-500"> / {targetWater} ml</span>
            </div>
            <span className="text-xs font-bold text-white bg-black px-2 py-0.5 rounded border border-neutral-700">
              {waterPercent}%
            </span>
          </div>

          <div className="mt-2 w-full bg-black h-1.5 rounded-full overflow-hidden border border-neutral-800">
            <div 
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${waterPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-1.5 mt-3 font-mono">
            {[
              { label: '+250ml', ml: 250 },
              { label: '+500ml', ml: 500 },
              { label: '+750ml', ml: 750 },
              { label: '+1000ml', ml: 1000 },
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={() => handleAddWater(btn.ml)}
                className="py-1.5 rounded bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-white text-[10px] font-bold active:scale-95 transition-all text-center"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timed Reminders */}
        <div className="mt-3 space-y-1.5 font-mono">
          <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
            Shift Hydration Targets
          </div>
          {[
            { time: '07:00', title: 'Pre-Shift Hydration (750ml)' },
            { time: '12:00', title: 'Mid-Shift Anchor (1,000ml)' },
            { time: '16:00', title: 'Shift Endurance (750ml)' },
            { time: '19:30', title: 'Post-Shift Rehydration (1,000ml)' },
          ].map((cp, idx) => (
            <div key={idx} className="p-2 rounded bg-neutral-900 border border-neutral-850 flex items-center justify-between text-[11px]">
              <span className="text-neutral-300">{cp.title}</span>
              <span className="text-neutral-500 text-[10px]">[{cp.time}]</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
