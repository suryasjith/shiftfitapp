import React, { useState } from 'react';
import { 
  UserProfile, 
  BodyweightEntry, 
  NutritionLog, 
  WorkoutSession, 
  ShiftDay, 
  WeeklyAnalyticsReport 
} from '../../types';
import { AnalyticsEngine } from '../../services/analyticsEngine';
import { PhysicsEngine } from '../../services/physicsEngine';
import { 
  Scale, 
  Flame, 
  Dumbbell, 
  Activity, 
  Sparkles,
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';
import { ContextualHelp } from '../ContextualHelp';

interface AnalyticsTabProps {
  todayStr: string;
  profile: UserProfile;
  weights: Record<string, BodyweightEntry>;
  nutritions: Record<string, NutritionLog>;
  workouts: Record<string, WorkoutSession>;
  shifts: Record<string, ShiftDay>;
  fatigueLogs: Record<string, number>;
  onSaveWeight: (entry: BodyweightEntry) => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  todayStr,
  profile,
  weights,
  nutritions,
  workouts,
  shifts,
  fatigueLogs,
  onSaveWeight,
}) => {
  const [newWeightInput, setNewWeightInput] = useState<string>('');
  const [newDateInput, setNewDateInput] = useState<string>(todayStr);

  const computedWeights = AnalyticsEngine.compute7DayMovingAverages(weights);

  const currentWeight = profile.currentWeightKg || 76.4;
  const desiredWeight = profile.desiredWeightKg || profile.targetWeightMinKg || 76.5;
  const gender = profile.gender || 'male';
  const timeline = PhysicsEngine.getTimelineProjection(currentWeight, desiredWeight, gender);

  const report: WeeklyAnalyticsReport = AnalyticsEngine.generateWeeklyReport(
    todayStr,
    profile,
    computedWeights,
    nutritions,
    workouts,
    shifts,
    fatigueLogs
  );

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeightInput);
    if (!isNaN(val) && val > 30 && val < 250) {
      soundManager.playCompleteChime();
      onSaveWeight({
        date: newDateInput,
        weightKg: val,
      });
      setNewWeightInput('');
    }
  };

  const sortedDates = Object.keys(computedWeights).sort().slice(-14);
  const minCorridor = profile.targetWeightMinKg; // 75
  const maxCorridor = profile.targetWeightMaxKg; // 78

  const allChartWeights = sortedDates.map(d => computedWeights[d]?.weightKg).filter(Boolean);
  const chartMin = Math.min(74.0, ...allChartWeights);
  const chartMax = Math.max(79.0, ...allChartWeights);

  const getYCoord = (val: number, height: number) => {
    return height - ((val - chartMin) / (chartMax - chartMin)) * height;
  };

  const chartWidth = 340;
  const chartHeight = 150;

  let dailyPoints = '';
  let movingAvgPoints = '';

  sortedDates.forEach((date, i) => {
    const x = (i / (sortedDates.length - 1 || 1)) * (chartWidth - 20) + 10;
    const entry = computedWeights[date];
    if (entry?.weightKg) {
      const y = getYCoord(entry.weightKg, chartHeight);
      dailyPoints += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
    }
    if (entry?.movingAverage7Day) {
      const yAvg = getYCoord(entry.movingAverage7Day, chartHeight);
      movingAvgPoints += `${i === 0 ? 'M' : 'L'} ${x} ${yAvg} `;
    }
  });

  const corridorTopY = getYCoord(maxCorridor, chartHeight);
  const corridorBottomY = getYCoord(minCorridor, chartHeight);

  return (
    <div className="space-y-3.5 pb-28 text-left animate-fadeIn">
      {/* Title Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-750 text-white">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-tight">Weekly Review</h2>
              <ContextualHelp
                title="Weekly Review"
                content="This dashboard analyzes the intersection of your 7-day average bodyweight delta, macro adherence rate, and progressive overload volume to output specific next-week adjustments."
              />
            </div>
            <p className="text-[10px] text-neutral-400 font-mono">Weight, Macros & Tonnage Correlation</p>
          </div>
        </div>

        {/* 4 Metric Tiles */}
        <div className="grid grid-cols-2 gap-2 mt-3.5 font-mono">
          {/* Average Weight */}
          <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-neutral-500 uppercase font-semibold">7-Day Avg</span>
              <ContextualHelp
                title="7-Day Weight Average"
                content="Filters acute daily water fluctuations caused by 12h shifts, salt intake, or glycogen storage to show your true tissue recomp trend."
              />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-white">{report.averageWeightKg}</span>
              <span className="text-[10px] text-neutral-500">kg</span>
            </div>
            <div className="mt-0.5 text-[10px] text-neutral-300">
              {report.weightDeltaKg >= 0 ? `+${report.weightDeltaKg}` : report.weightDeltaKg} kg <span className="text-neutral-500 text-[9px]">vs prev</span>
            </div>
          </div>

          {/* Macro Adherence */}
          <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-neutral-500 uppercase font-semibold">Adherence</span>
              <ContextualHelp
                title="Macro Adherence"
                content="The percentage of logged days within ±15g of protein and ±200 calories of target."
              />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-white">{report.macroAdherenceRatePercent}%</span>
              <span className="text-[9px] font-bold px-1 rounded border border-neutral-700 bg-black text-white">
                {report.macroAdherenceRatePercent >= 85 ? 'ELITE' : 'STABLE'}
              </span>
            </div>
            <div className="mt-0.5 text-[9px] text-neutral-500">
              Target: ±15g Prot
            </div>
          </div>

          {/* Workout Volume Progression */}
          <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-neutral-500 uppercase font-semibold">Tonnage</span>
              <ContextualHelp
                title="Volume Progression"
                content="Compares total weekly lifting volume (kg) with the previous week to measure hypertrophy progression."
              />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-black text-white">{report.totalVolumeTonnageKg.toLocaleString()}</span>
              <span className="text-[10px] text-neutral-500">kg</span>
            </div>
            <div className="mt-0.5 text-[10px] text-white">
              +{report.tonnageProgressionPercent}% <span className="text-neutral-500 text-[9px]">progression</span>
            </div>
          </div>

          {/* CNS Strain / Fatigue */}
          <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-neutral-500 uppercase font-semibold">Avg Fatigue</span>
              <ContextualHelp
                title="CNS Fatigue Load"
                content="Average daily fatigue logged across your 4-day shift block."
              />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-white">{report.avgFatigueScore}</span>
              <span className="text-[10px] text-neutral-500">/ 10</span>
            </div>
            <div className="mt-0.5 text-[9px] text-neutral-500">
              {report.shiftsWorkedCount} Shifts ({report.overtimeHoursWorked}h OT)
            </div>
          </div>
        </div>
      </div>

      {/* Bodyweight & 7-Day Moving Average Target Corridor Chart */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm text-left">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold text-white font-mono uppercase">75–78kg Target Corridor</h3>
            <ContextualHelp
              title="Target Corridor"
              content="The shaded area represents your target 75.0kg to 78.0kg maintenance corridor. The solid white line plots the 7-day moving average, smoothing daily weigh-in noise."
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-750">
            75.0 – 78.0 KG
          </span>
        </div>

        {/* Monochromatic SVG Chart */}
        <div className="mt-2.5 relative w-full overflow-hidden bg-black rounded-lg p-2 border border-neutral-850">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-40 overflow-visible">
            {/* Target Corridor (75kg to 78kg) */}
            <rect
              x="0"
              y={corridorTopY}
              width={chartWidth}
              height={Math.max(2, corridorBottomY - corridorTopY)}
              fill="rgba(255, 255, 255, 0.05)"
              stroke="#525252"
              strokeDasharray="2 2"
              strokeWidth="0.8"
            />
            <text x="8" y={corridorTopY - 4} fill="#a3a3a3" fontSize="8" fontFamily="monospace" fontWeight="bold">
              78.0 KG CAP
            </text>
            <text x="8" y={corridorBottomY + 10} fill="#a3a3a3" fontSize="8" fontFamily="monospace" fontWeight="bold">
              75.0 KG FLOOR
            </text>

            {/* Daily Weight Line */}
            {dailyPoints && (
              <path
                d={dailyPoints}
                fill="none"
                stroke="#525252"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            )}

            {/* 7-Day Moving Average Line (solid white) */}
            {movingAvgPoints && (
              <path
                d={movingAvgPoints}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            )}

            {/* Data points */}
            {sortedDates.map((date, idx) => {
              const x = (idx / (sortedDates.length - 1 || 1)) * (chartWidth - 20) + 10;
              const entry = computedWeights[date];
              if (!entry?.weightKg) return null;
              const y = getYCoord(entry.weightKg, chartHeight);
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#ffffff"
                />
              );
            })}
          </svg>

          {/* Chart Legend */}
          <div className="mt-1 pt-1.5 border-t border-neutral-900 flex justify-between items-center text-[9px] font-mono text-neutral-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-white inline-block" />
                <strong className="text-white">7-Day Moving Avg</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 inline-block" />
                <span>Daily Weigh-in</span>
              </span>
            </div>
            <span>Corridor: 75-78kg</span>
          </div>
        </div>

        {/* Quick Weigh-In Adder - Standard Fully Editable Number Input */}
        <form onSubmit={handleAddWeight} className="mt-3 flex items-center gap-2 font-mono">
          <input
            type="date"
            value={newDateInput}
            onChange={(e) => setNewDateInput(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-[11px] text-white"
          />
          <div className="relative flex-1">
            <input
              type="number"
              step="any"
              value={newWeightInput}
              onChange={(e) => setNewWeightInput(e.target.value)}
              placeholder="e.g. 76.4"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-white transition-colors"
            />
            <span className="absolute right-2 top-1.5 text-[10px] text-neutral-500">kg</span>
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-white text-black text-[11px] font-bold active:scale-95 transition-all"
          >
            Log
          </button>
        </form>
      </div>

      {/* Timeline Projection & Discipline Warning Section */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm text-left font-mono space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-white" />
            <h3 className="text-xs font-bold text-white uppercase">Recomp Timeline Projections</h3>
            <ContextualHelp
              title="Biological Timeline Projection"
              content="Models two timelines based on standard biological rates: Average (0.5kg/week change) and Very Optimal (1.0kg/week change)."
            />
          </div>
          <span className="text-[10px] text-neutral-400">
            {currentWeight}kg &rarr; {desiredWeight}kg
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
            <div className="text-[9px] text-neutral-500 uppercase font-bold">Average Timeline</div>
            <div className="text-sm font-black text-white mt-0.5">
              {timeline.mode === 'maintenance' ? '0 Weeks' : `~${timeline.averageWeeks} Wks`}
            </div>
            <div className="text-[9px] text-neutral-400 mt-0.5">
              {timeline.averageRateKgPerWeek} kg / wk
            </div>
            <div className="text-[8px] text-neutral-500 mt-1 pt-1 border-t border-neutral-800 truncate">
              Target: {timeline.averageTargetDate}
            </div>
          </div>

          <div className="p-2.5 rounded bg-neutral-900 border border-neutral-750">
            <div className="text-[9px] text-white uppercase font-bold flex items-center justify-between">
              <span>Very Optimal</span>
              <span className="text-[8px] bg-white text-black px-1 rounded">FAST</span>
            </div>
            <div className="text-sm font-black text-white mt-0.5">
              {timeline.mode === 'maintenance' ? '0 Weeks' : `~${timeline.optimalWeeks} Wks`}
            </div>
            <div className="text-[9px] text-neutral-300 mt-0.5">
              {timeline.optimalRateKgPerWeek} kg / wk
            </div>
            <div className="text-[8px] text-neutral-400 mt-1 pt-1 border-t border-neutral-800 truncate">
              Target: {timeline.optimalTargetDate}
            </div>
          </div>
        </div>

        {/* PROMINENT DISCIPLINE WARNING BOX */}
        <div className="p-3 rounded-lg bg-black border border-neutral-700 text-left space-y-1">
          <div className="flex items-center gap-1.5 text-white font-bold text-[10px] uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-white shrink-0" />
            <span>DISCIPLINE WARNING</span>
          </div>
          <p className="text-[11px] text-neutral-200 font-sans leading-relaxed">
            WARNING: The optimal timeline is strictly theoretical and is only achievable with absolute discipline, zero missed sessions, and perfect macro adherence.
          </p>
        </div>
      </div>

      {/* Bulleted List of Actionable Improvements */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm text-left">
        <div className="flex items-center gap-1.5 mb-2.5">
          <h3 className="text-xs font-bold text-white font-mono uppercase">Actionable Next-Week Review</h3>
          <ContextualHelp
            title="Actionable Review Engine"
            content="These bullet points are generated by cross-referencing your weekly tonnage progression, adherence percentage, and 7-day weight trend against body recomp targets."
          />
        </div>

        <div className="space-y-2">
          {report.actionableInsights.map((insight, idx) => (
            <div 
              key={idx}
              className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-850 flex items-start gap-2 text-xs leading-relaxed text-neutral-300 font-sans"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
              <div>{insight}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
