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
import { RotaEngine } from '../../services/rotaEngine';
import { 
  TrendingUp, 
  Scale, 
  Flame, 
  Dumbbell, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';

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
  const [newWeightInput, setNewWeightInput] = useState<string>('76.4');
  const [newDateInput, setNewDateInput] = useState<string>(todayStr);

  // Compute 7-day moving averages
  const computedWeights = AnalyticsEngine.compute7DayMovingAverages(weights);

  // Generate weekly statistical report correlating weight, macros, and volume progression
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
    if (!isNaN(val) && val > 40 && val < 160) {
      soundManager.playCompleteChime();
      onSaveWeight({
        date: newDateInput,
        weightKg: val,
      });
    }
  };

  // Prepare chart coordinates for past 14 days
  const sortedDates = Object.keys(computedWeights).sort().slice(-14);
  const minCorridor = profile.targetWeightMinKg; // 75
  const maxCorridor = profile.targetWeightMaxKg; // 78

  // Chart min/max scaling
  const allChartWeights = sortedDates.map(d => computedWeights[d]?.weightKg).filter(Boolean);
  const chartMin = Math.min(74.0, ...allChartWeights);
  const chartMax = Math.max(79.0, ...allChartWeights);

  const getYCoord = (val: number, height: number) => {
    return height - ((val - chartMin) / (chartMax - chartMin)) * height;
  };

  const chartWidth = 340;
  const chartHeight = 160;

  // Generate SVG path for daily weight line and 7-day moving avg line
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
    <div className="space-y-4 pb-28 text-left animate-fadeIn">
      {/* Dashboard Title Card */}
      <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Weekly Review & Analytics</h2>
            <p className="text-xs text-slate-400">Correlation Engine: Weight, Macros & Tonnage</p>
          </div>
        </div>

        {/* 4 Statistical Breakdown Metric Tiles */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          {/* Average Weight */}
          <div className="p-3 rounded-xl bg-dark-850 border border-dark-750">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">7-Day Avg Weight</span>
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-xl font-black text-white">{report.averageWeightKg}</span>
              <span className="text-xs text-slate-400 font-mono">kg</span>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <span>{report.weightDeltaKg >= 0 ? `+${report.weightDeltaKg}` : report.weightDeltaKg} kg</span>
              <span className="text-slate-400 font-normal text-[10px]">vs prev week</span>
            </div>
          </div>

          {/* Macro Adherence */}
          <div className="p-3 rounded-xl bg-dark-850 border border-dark-750">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Macro Adherence</span>
              <Flame className="w-3.5 h-3.5 text-brand-orange" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-xl font-black text-white">{report.macroAdherenceRatePercent}%</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                {report.macroAdherenceRatePercent >= 85 ? 'ELITE' : 'STABLE'}
              </span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">
              Target: ±15g Protein / ±200 kcal
            </div>
          </div>

          {/* Workout Volume Progression */}
          <div className="p-3 rounded-xl bg-dark-850 border border-dark-750">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Tonnage</span>
              <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-lg font-black text-white">{report.totalVolumeTonnageKg.toLocaleString()}</span>
              <span className="text-xs text-slate-400 font-mono">kg</span>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-cyan-400 flex items-center gap-1">
              <span>+{report.tonnageProgressionPercent}%</span>
              <span className="text-slate-400 font-normal text-[10px]">volume progression</span>
            </div>
          </div>

          {/* CNS Strain / Fatigue */}
          <div className="p-3 rounded-xl bg-dark-850 border border-dark-750">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Shift CNS Fatigue</span>
              <Activity className="w-3.5 h-3.5 text-brand-violet" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-xl font-black text-white">{report.avgFatigueScore}</span>
              <span className="text-xs text-slate-400 font-mono">/ 10</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">
              {report.shiftsWorkedCount} Shifts Worked ({report.overtimeHoursWorked}h OT)
            </div>
          </div>
        </div>
      </div>

      {/* Bodyweight & 7-Day Moving Average Target Corridor Chart */}
      <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-lg text-left">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-white">Weight Trend vs 75-78kg Target Corridor</h3>
            <p className="text-[11px] text-slate-400">7-Day moving average filters daily fluid & shift fluctuations</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              75.0 - 78.0 KG
            </span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="mt-3 relative w-full overflow-hidden bg-dark-850 rounded-xl p-2 border border-dark-750">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
            {/* Target Corridor Highlight (75kg to 78kg) */}
            <rect
              x="0"
              y={corridorTopY}
              width={chartWidth}
              height={Math.max(2, corridorBottomY - corridorTopY)}
              fill="rgba(16, 185, 129, 0.08)"
              stroke="rgba(16, 185, 129, 0.25)"
              strokeDasharray="4 4"
            />
            {/* Upper & Lower Corridor Labels */}
            <text x="12" y={corridorTopY - 4} fill="#10b981" fontSize="9" fontWeight="bold">
              78.0 kg (Upper Cap)
            </text>
            <text x="12" y={corridorBottomY + 12} fill="#10b981" fontSize="9" fontWeight="bold">
              75.0 kg (Lower Recomp Floor)
            </text>

            {/* Daily Weight Line (subtle) */}
            {dailyPoints && (
              <path
                d={dailyPoints}
                fill="none"
                stroke="rgba(148, 163, 184, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            )}

            {/* 7-Day Moving Average Line (bold Cyan glow) */}
            {movingAvgPoints && (
              <path
                d={movingAvgPoints}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeLinecap="round"
                filter="drop-shadow(0 0 6px rgba(6, 182, 212, 0.4))"
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
                  r="3"
                  fill="#f1f5f9"
                  stroke="#0c1017"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>

          {/* Chart Legend */}
          <div className="mt-2 pt-2 border-t border-dark-800 flex justify-between items-center text-[10px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-cyan-400 inline-block rounded" />
                <strong className="text-white">7-Day Moving Avg</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                <span>Daily Weigh-In</span>
              </span>
            </div>
            <span className="text-emerald-400 font-semibold">Green zone = Recomp corridor</span>
          </div>
        </div>

        {/* Quick Weigh-In Adder */}
        <form onSubmit={handleAddWeight} className="mt-3.5 flex items-center gap-2">
          <input
            type="date"
            value={newDateInput}
            onChange={(e) => setNewDateInput(e.target.value)}
            className="bg-dark-800 border border-dark-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
          />
          <div className="relative flex-1">
            <input
              type="number"
              step="0.1"
              value={newWeightInput}
              onChange={(e) => setNewWeightInput(e.target.value)}
              placeholder="76.4"
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
            />
            <span className="absolute right-2.5 top-2 text-[10px] text-slate-400">kg</span>
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold active:scale-95 transition-all"
          >
            Log
          </button>
        </form>
      </div>

      {/* Bulleted List of Actionable Improvements for Next Week */}
      <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-xl text-left">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Actionable Next-Week Improvements</h3>
        </div>

        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          The algorithmic review engine calculated the correlation between your 7-day average bodyweight ({report.averageWeightKg}kg), macro adherence ({report.macroAdherenceRatePercent}%), and workout volume progression (+{report.tonnageProgressionPercent}%):
        </p>

        <div className="space-y-2.5">
          {report.actionableInsights.map((insight, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-xl bg-dark-850/80 border border-dark-750 flex items-start gap-2.5 text-xs leading-relaxed text-slate-200"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <div>{insight}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
