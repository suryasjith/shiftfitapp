import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Scale, Target, Calendar, Dumbbell, ShieldCheck } from 'lucide-react';
import { UserProfile, FitnessGoal, ShiftType } from '../types';
import { PhysicsEngine } from '../services/physicsEngine';
import { ROTA_PRESETS } from '../services/rotaEngine';

interface OnboardingOverlayProps {
  isOpen: boolean;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onClose: () => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ 
  isOpen, 
  profile, 
  onSaveProfile, 
  onClose 
}) => {
  const [step, setStep] = useState<number>(0);

  // Form state
  const [heightCm, setHeightCm] = useState<number>(profile.heightCm || 178);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(profile.currentWeightKg || 76.4);
  const [targetMinKg, setTargetMinKg] = useState<number>(profile.targetWeightMinKg || 75.0);
  const [targetMaxKg, setTargetMaxKg] = useState<number>(profile.targetWeightMaxKg || 78.0);
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal>(profile.fitnessGoal || 'body_recomposition');
  const [twoWeekTemplate, setTwoWeekTemplate] = useState<ShiftType[]>(
    profile.twoWeekTemplate || ROTA_PRESETS.fourOnThreeOff
  );

  if (!isOpen) return null;

  // Real-time BMI calculation
  const bmiReport = PhysicsEngine.getBmiReport(currentWeightKg, heightCm);
  const goalParams = PhysicsEngine.getGoalParameters(selectedGoal);

  const handleFinish = () => {
    const updated: UserProfile = {
      ...profile,
      heightCm,
      currentWeightKg,
      targetWeightMinKg: targetMinKg,
      targetWeightMaxKg: targetMaxKg,
      fitnessGoal: selectedGoal,
      twoWeekTemplate,
    };
    onSaveProfile(updated);
    onClose();
  };

  const handleToggleDay = (idx: number) => {
    const updated = [...twoWeekTemplate];
    const current = updated[idx];
    if (current === 'day_12h') updated[idx] = 'night_12h';
    else if (current === 'night_12h') updated[idx] = 'off';
    else updated[idx] = 'day_12h';
    setTwoWeekTemplate(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-xl bg-black border border-neutral-700 p-5 text-left relative shadow-2xl max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-black bg-white px-1.5 py-0.2 rounded">
              PROFILE & PHYSICS ENGINE
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              {step + 1} OF 4
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white p-1 transition-colors"
            aria-label="Close Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="grid grid-cols-4 gap-1.5 mt-3 shrink-0">
          {[0, 1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all ${
                s === step ? 'bg-white' : s < step ? 'bg-neutral-500' : 'bg-neutral-850'
              }`}
            />
          ))}
        </div>

        {/* Content Body - Scrollable */}
        <div className="mt-4 overflow-y-auto pr-1 flex-1 space-y-3.5">
          {/* STEP 0: Biometrics & BMI Engine */}
          {step === 0 && (
            <div className="space-y-3 font-mono">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                  1. Biometrics & BMI Engine
                </h3>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  Enter height and current bodyweight to calculate baseline and optimal athletic BMI.
                </p>
              </div>

              {/* Height & Weight inputs */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseFloat(e.target.value) || 178)}
                    className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentWeightKg}
                    onChange={(e) => setCurrentWeightKg(parseFloat(e.target.value) || 76.4)}
                    className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Live BMI Analysis Display */}
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400 uppercase">Current BMI</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-white">{bmiReport.currentBmi}</span>
                    <span className="text-[10px] text-neutral-400">kg/m²</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Classification:</span>
                  <span className="px-1.5 py-0.2 rounded border border-neutral-700 bg-black text-white font-bold text-[10px]">
                    {bmiReport.classification}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-800 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Optimal Athletic BMI:</span>
                    <span className="text-white font-bold">{bmiReport.optimalBmiMin} – {bmiReport.optimalBmiMax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Optimal Weight Range:</span>
                    <span className="text-white font-bold">{bmiReport.optimalWeightMinKg} – {bmiReport.optimalWeightMaxKg} kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Goal Selection & Workout Tailoring */}
          {step === 1 && (
            <div className="space-y-3 font-mono">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                  2. Goal & Workout Tailoring
                </h3>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  The algorithm dictates rep ranges, rest times, and set volume based on your goal.
                </p>
              </div>

              {/* Target Weight Corridor */}
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Target Weight Corridor (kg)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[9px] text-neutral-500 block">Min</span>
                    <input
                      type="number"
                      step="0.5"
                      value={targetMinKg}
                      onChange={(e) => setTargetMinKg(parseFloat(e.target.value) || 75.0)}
                      className="w-full bg-black border border-neutral-750 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <span className="text-neutral-500 font-bold mt-3">–</span>
                  <div className="flex-1">
                    <span className="text-[9px] text-neutral-500 block">Max</span>
                    <input
                      type="number"
                      step="0.5"
                      value={targetMaxKg}
                      onChange={(e) => setTargetMaxKg(parseFloat(e.target.value) || 78.0)}
                      className="w-full bg-black border border-neutral-750 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Goal Selection Cards */}
              <div className="space-y-1.5">
                {[
                  {
                    id: 'body_recomposition' as FitnessGoal,
                    name: 'Body Recomposition',
                    desc: 'Target: Maintain 75–78kg. Heavy compound strength topsets (6-8 reps) + hypertrophy backoffs (10-12 reps).'
                  },
                  {
                    id: 'muscle_mass' as FitnessGoal,
                    name: 'Building Muscle Mass',
                    desc: 'Hypertrophy volume priority. 8–10 compound reps, 4 working sets, 120s rest for progressive tension.'
                  },
                  {
                    id: 'lean_muscle' as FitnessGoal,
                    name: 'Lean Muscle & Density',
                    desc: 'High-density fatigue. 10–15 reps, 60–75s short rest periods to burn glycogen and sharpen aesthetics.'
                  }
                ].map((g) => {
                  const isSelected = selectedGoal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGoal(g.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-white text-black border-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono">{g.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <p className={`text-[11px] font-sans mt-0.5 leading-relaxed ${isSelected ? 'text-neutral-800' : 'text-neutral-400'}`}>
                        {g.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Tailoring Preview */}
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850 text-[10px]">
                <div className="font-bold text-white uppercase mb-1">Tailored Algorithm Prescription:</div>
                <div className="text-neutral-400">
                  • Compounds: <strong className="text-white">{goalParams.repRangeCompound} reps</strong> ({goalParams.restSecsCompound}s rest)
                </div>
                <div className="text-neutral-400">
                  • Accessories: <strong className="text-white">{goalParams.repRangeAccessory} reps</strong> ({goalParams.restSecsAccessory}s rest)
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: 2-Week Rolling Rota Template */}
          {step === 2 && (
            <div className="space-y-3 font-mono">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                  3. 2-Week Rolling Rota (14-Day Loop)
                </h3>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  Set your repeating 14-day shift cycle. It loops infinitely, and you can tap any calendar date to add overtime.
                </p>
              </div>

              {/* Presets */}
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold">Presets:</span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setTwoWeekTemplate([...ROTA_PRESETS.fourOnThreeOff])}
                    className="py-1 px-1 rounded text-[10px] border border-neutral-750 bg-neutral-900 hover:text-white"
                  >
                    4-on / 3-off
                  </button>
                  <button
                    type="button"
                    onClick={() => setTwoWeekTemplate([...ROTA_PRESETS.alternatingFourThree])}
                    className="py-1 px-1 rounded text-[10px] border border-neutral-750 bg-neutral-900 hover:text-white"
                  >
                    4-3 / 3-4
                  </button>
                  <button
                    type="button"
                    onClick={() => setTwoWeekTemplate([...ROTA_PRESETS.panama223])}
                    className="py-1 px-1 rounded text-[10px] border border-neutral-750 bg-neutral-900 hover:text-white"
                  >
                    2-2-3 Panama
                  </button>
                </div>
              </div>

              {/* 14-Day Interactive Strip */}
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="text-[10px] text-neutral-400 uppercase font-bold">
                  Tap any day to toggle (Day &rarr; Night &rarr; Off):
                </div>

                <div>
                  <div className="text-[9px] text-neutral-500 uppercase mb-1">Week 1 (Days 1–7):</div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {twoWeekTemplate.slice(0, 7).map((shift, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleToggleDay(i)}
                        className={`p-1 rounded text-[9px] font-mono font-bold border transition-all ${
                          shift === 'off'
                            ? 'bg-black text-neutral-400 border-neutral-800'
                            : shift === 'night_12h'
                            ? 'bg-neutral-800 text-white border-neutral-600'
                            : 'bg-white text-black border-white'
                        }`}
                      >
                        <div>D{i + 1}</div>
                        <div className="text-[8px] font-normal">{shift === 'off' ? 'OFF' : shift === 'night_12h' ? 'NGT' : '12H'}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] text-neutral-500 uppercase mb-1">Week 2 (Days 8–14):</div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {twoWeekTemplate.slice(7, 14).map((shift, i) => (
                      <button
                        key={i + 7}
                        type="button"
                        onClick={() => handleToggleDay(i + 7)}
                        className={`p-1 rounded text-[9px] font-mono font-bold border transition-all ${
                          shift === 'off'
                            ? 'bg-black text-neutral-400 border-neutral-800'
                            : shift === 'night_12h'
                            ? 'bg-neutral-800 text-white border-neutral-600'
                            : 'bg-white text-black border-white'
                        }`}
                      >
                        <div>D{i + 8}</div>
                        <div className="text-[8px] font-normal">{shift === 'off' ? 'OFF' : shift === 'night_12h' ? 'NGT' : '12H'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Execution & Help Overview */}
          {step === 3 && (
            <div className="space-y-3 font-mono">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                  4. Architecture Ready
                </h3>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  Your profile and infinite rota loop are configured.
                </p>
              </div>

              <div className="space-y-2 text-xs font-sans">
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-start gap-2">
                  <Dumbbell className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white font-mono text-[11px] uppercase block">
                      Equipment Taken Swaps
                    </span>
                    <span className="text-[11px] text-neutral-400 leading-relaxed">
                      Tap "Equipment Taken?" on any exercise for biomechanically matched muscle angle swaps without losing set logs.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-start gap-2">
                  <Scale className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white font-mono text-[11px] uppercase block">
                      OpenFoodFacts Food API
                    </span>
                    <span className="text-[11px] text-neutral-400 leading-relaxed">
                      Search food in the Macros tab for instant calorie and macro lookup with custom gram portions.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white font-mono text-[11px] uppercase block">
                      Contextual '?' Help
                    </span>
                    <span className="text-[11px] text-neutral-400 leading-relaxed">
                      Tap discrete '?' icons across the app for quick, non-intrusive tips on any metric.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-4 pt-3 border-t border-neutral-850 flex items-center justify-between gap-2 shrink-0">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="py-2 px-3 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white text-xs font-mono font-semibold flex items-center gap-1 active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-300 text-xs font-mono px-2"
            >
              Skip
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="py-2 px-4 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-bold font-mono tracking-tight flex items-center gap-1 active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="py-2 px-4 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-bold font-mono tracking-tight flex items-center gap-1 active:scale-95"
            >
              <span>Launch ShiftFit</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
