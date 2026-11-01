import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, AlertTriangle, Clock, Target, Calendar } from 'lucide-react';
import { UserProfile, FitnessGoal, ShiftType, Gender, ProficiencyLevel } from '../types';
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

  // Form state - String based to prevent backspace/deletion bugs, empty by default
  const [gender, setGender] = useState<Gender>(profile.gender || 'male');
  const [proficiency, setProficiency] = useState<ProficiencyLevel>(profile.proficiencyLevel || 'intermediate');
  const [heightStr, setHeightStr] = useState<string>('');
  const [currentWeightStr, setCurrentWeightStr] = useState<string>('');
  const [desiredWeightStr, setDesiredWeightStr] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal>(profile.fitnessGoal || 'body_recomposition');
  const [twoWeekTemplate, setTwoWeekTemplate] = useState<ShiftType[]>(
    profile.twoWeekTemplate || ROTA_PRESETS.fourOnThreeOff
  );

  if (!isOpen) return null;

  // Numerical values for physics engine
  const parsedHeight = parseFloat(heightStr) || 178;
  const parsedCurrentWeight = parseFloat(currentWeightStr) || 76.4;
  const parsedDesiredWeight = parseFloat(desiredWeightStr) || 76.5;

  // Live BMI Engine & Timeline Projection
  const bmiReport = PhysicsEngine.getBmiReport(parsedCurrentWeight, parsedHeight, gender);
  const timeline = PhysicsEngine.getTimelineProjection(parsedCurrentWeight, parsedDesiredWeight, gender);
  const goalParams = PhysicsEngine.getGoalParameters(selectedGoal);

  const handleFinish = () => {
    const updated: UserProfile = {
      ...profile,
      gender,
      proficiencyLevel: proficiency,
      heightCm: parsedHeight,
      currentWeightKg: parsedCurrentWeight,
      desiredWeightKg: parsedDesiredWeight,
      targetWeightMinKg: Math.min(parsedDesiredWeight - 1.5, parsedDesiredWeight),
      targetWeightMaxKg: Math.max(parsedDesiredWeight + 1.5, parsedDesiredWeight),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/95 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl bg-black border border-neutral-700 p-4 text-left relative shadow-2xl max-h-[92vh] flex flex-col font-mono">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-black bg-white px-1.5 py-0.2 rounded-2xl">
              USER PROFILING
            </span>
            <span className="text-[11px] text-neutral-400">
              STEP {step + 1} OF 4
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-stone-900 p-1 transition-colors"
            aria-label="Close Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="grid grid-cols-4 gap-1.5 mt-2.5 shrink-0">
          {[0, 1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-2xl transition-all ${
                s === step ? 'bg-white' : s < step ? 'bg-neutral-500' : 'bg-neutral-850'
              }`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="mt-3.5 overflow-y-auto pr-1 flex-1 space-y-3">
          {/* STEP 0: Metrics & Gender */}
          {step === 0 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-tight">
                  1. Metrics & Biological Profile
                </h3>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  Input your biometric measurements. All input fields are standard and fully editable.
                </p>
              </div>

              {/* Gender Selector */}
              <div>
                <label className="text-[10px] text-stone-600 uppercase font-bold block mb-1">
                  Biological Gender:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      gender === 'male' 
                        ? 'bg-stone-900 text-white border-stone-900' 
                        : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    MALE
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      gender === 'female' 
                        ? 'bg-stone-900 text-white border-stone-900' 
                        : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    FEMALE
                  </button>
                </div>
              </div>

              {/* Gym Experience / Proficiency Level Selector */}
              <div>
                <label className="text-[10px] text-stone-600 uppercase font-bold block mb-1">
                  Gym Experience Level:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setProficiency('absolute_beginner')}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      proficiency === 'absolute_beginner'
                        ? 'bg-orange-50 border-orange-300 text-terracotta ring-1 ring-orange-200'
                        : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Beginner</div>
                    <div className="text-[9px] text-stone-500 font-sans leading-tight mt-0.5">Day 1 / Machines</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProficiency('intermediate')}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      proficiency === 'intermediate'
                        ? 'bg-orange-50 border-orange-300 text-terracotta ring-1 ring-orange-200'
                        : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Intermediate</div>
                    <div className="text-[9px] text-stone-500 font-sans leading-tight mt-0.5">6m - 2y Lifter</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProficiency('advanced')}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      proficiency === 'advanced'
                        ? 'bg-orange-50 border-orange-300 text-terracotta ring-1 ring-orange-200'
                        : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Advanced</div>
                    <div className="text-[9px] text-stone-500 font-sans leading-tight mt-0.5">2y+ High Axial</div>
                  </button>
                </div>
              </div>

              {/* Height & Current Weight */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                    Height (cm):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={heightStr}
                    onChange={(e) => setHeightStr(e.target.value)}
                    placeholder="e.g. 178"
                    className="w-full bg-neutral-900 border border-neutral-750 rounded-2xl px-2.5 py-1.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                    Current Weight (kg):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={currentWeightStr}
                    onChange={(e) => setCurrentWeightStr(e.target.value)}
                    placeholder="e.g. 76.4"
                    className="w-full bg-neutral-900 border border-neutral-750 rounded-2xl px-2.5 py-1.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              {/* Desired / Target Weight */}
              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                  Desired Target Weight (kg):
                </label>
                <input
                  type="number"
                  step="any"
                  value={desiredWeightStr}
                  onChange={(e) => setDesiredWeightStr(e.target.value)}
                  placeholder="e.g. 76.5"
                  className="w-full bg-neutral-900 border border-neutral-750 rounded-2xl px-2.5 py-1.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* BMI Engine Output Card */}
              <div className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Current BMI:</span>
                  <span className="text-stone-900 font-bold">{bmiReport.currentBmi} kg/m²</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Status:</span>
                  <span className="px-1.5 py-0.2 rounded-2xl border border-neutral-700 bg-black text-stone-900 font-bold text-[10px]">
                    {bmiReport.classification}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-neutral-800 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Optimal Athletic BMI ({gender}):</span>
                    <span className="text-stone-900 font-bold">{bmiReport.optimalBmiMin} – {bmiReport.optimalBmiMax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Optimal Weight Range:</span>
                    <span className="text-stone-900 font-bold">{bmiReport.optimalWeightMinKg} – {bmiReport.optimalWeightMaxKg} kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Timeline Projection & Discipline Warning */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-tight">
                  2. Timeline Projection
                </h3>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  Calculated based on {parsedCurrentWeight}kg &rarr; {parsedDesiredWeight}kg using biological rate thresholds (0.5kg to 1.0kg/week).
                </p>
              </div>

              {/* Timeline Cards */}
              <div className="grid grid-cols-2 gap-2">
                {/* Average Timeline */}
                <div className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-left">
                  <div className="text-[9px] text-neutral-400 uppercase font-bold">
                    Average Timeline
                  </div>
                  <div className="text-sm font-black text-stone-900 mt-1">
                    {timeline.mode === 'maintenance' ? '0 Weeks' : `~${timeline.averageWeeks} Weeks`}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {timeline.averageRateKgPerWeek} kg / week
                  </div>
                  <div className="text-[9px] text-neutral-500 mt-1 pt-1 border-t border-neutral-800">
                    Est: {timeline.averageTargetDate}
                  </div>
                </div>

                {/* Optimal Timeline */}
                <div className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-700 text-left">
                  <div className="text-[9px] text-stone-900 uppercase font-bold flex items-center justify-between">
                    <span>Optimal Timeline</span>
                    <span className="text-[8px] bg-white text-black px-1 rounded-2xl">FAST</span>
                  </div>
                  <div className="text-sm font-black text-stone-900 mt-1">
                    {timeline.mode === 'maintenance' ? '0 Weeks' : `~${timeline.optimalWeeks} Weeks`}
                  </div>
                  <div className="text-[10px] text-neutral-300 mt-0.5">
                    {timeline.optimalRateKgPerWeek} kg / week
                  </div>
                  <div className="text-[9px] text-neutral-400 mt-1 pt-1 border-t border-neutral-800">
                    Est: {timeline.optimalTargetDate}
                  </div>
                </div>
              </div>

              {/* CRITICAL DISCIPLINE WARNING BOX */}
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-700 space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs uppercase tracking-tight">
                  <AlertTriangle className="w-3.5 h-3.5 text-stone-900 shrink-0" />
                  <span>DISCIPLINE PROTOCOL</span>
                </div>
                <p className="text-[11px] text-neutral-300 font-sans leading-relaxed pt-1">
                  WARNING: The optimal timeline is strictly theoretical and is only achievable with absolute discipline, zero missed sessions, and perfect macro adherence.
                </p>
              </div>

              {/* Goal Selection Cards */}
              <div className="pt-1 space-y-1">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Select Workout Focus:</div>
                {[
                  {
                    id: 'body_recomposition' as FitnessGoal,
                    name: 'Body Recomposition',
                    desc: 'Maintain 75–78kg. Strength compound topsets (6–8 reps) with hypertrophy backoffs (10–12 reps).'
                  },
                  {
                    id: 'muscle_mass' as FitnessGoal,
                    name: 'Building Muscle Mass',
                    desc: 'Hypertrophy volume priority. 8–10 compound reps, 4 working sets, 120s rest.'
                  },
                  {
                    id: 'lean_muscle' as FitnessGoal,
                    name: 'Lean Muscle & Density',
                    desc: 'High-density fatigue. 10–15 reps, 60–75s short rest periods.'
                  }
                ].map((g) => {
                  const isSelected = selectedGoal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGoal(g.id)}
                      className={`w-full p-2 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-white text-black border-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{g.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <p className={`text-[10px] font-sans mt-0.5 leading-relaxed ${isSelected ? 'text-neutral-800' : 'text-neutral-400'}`}>
                        {g.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: 2-Week Rolling Rota Template */}
          {step === 2 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-tight">
                  3. 2-Week Rolling Rota (14-Day Loop)
                </h3>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  Set your repeating 14-day shift pattern. Loops infinitely with calendar overrides.
                </p>
              </div>

              {/* Presets */}
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold">Presets:</span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setTwoWeekTemplate([...ROTA_PRESETS.fourOnThreeOff])}
                    className="py-1 px-1 rounded-2xl text-[10px] border border-neutral-750 bg-neutral-900 hover:text-stone-900"
                  >
                    4-on / 3-off
                  </button>
                  <button
                    type="button"
                    onClick={() => setTwoWeekTemplate([...ROTA_PRESETS.alternatingFourThree])}
                    className="py-1 px-1 rounded-2xl text-[10px] border border-neutral-750 bg-neutral-900 hover:text-stone-900"
                  >
                    4-3 / 3-4
                  </button>
                  <button
                    type="button"
                    onClick={() => setTwoWeekTemplate([...ROTA_PRESETS.panama223])}
                    className="py-1 px-1 rounded-2xl text-[10px] border border-neutral-750 bg-neutral-900 hover:text-stone-900"
                  >
                    2-2-3 Panama
                  </button>
                </div>
              </div>

              {/* 14-Day Strip */}
              <div className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div>
                  <div className="text-[9px] text-neutral-500 uppercase mb-1">Week 1 (Days 1–7):</div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {twoWeekTemplate.slice(0, 7).map((shift, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleToggleDay(i)}
                        className={`p-1 rounded-2xl text-[9px] font-bold border transition-all ${
                          shift === 'off'
                            ? 'bg-black text-neutral-500 border-neutral-800'
                            : shift === 'night_12h'
                            ? 'bg-neutral-800 text-stone-900 border-neutral-600'
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
                        className={`p-1 rounded-2xl text-[9px] font-bold border transition-all ${
                          shift === 'off'
                            ? 'bg-black text-neutral-500 border-neutral-800'
                            : shift === 'night_12h'
                            ? 'bg-neutral-800 text-stone-900 border-neutral-600'
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

          {/* STEP 3: Execution Overview */}
          {step === 3 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-tight">
                  4. Setup Complete
                </h3>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  Your physics profile, BMI corridors, and 14-day shift loop are locked.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Gender / Height:</span>
                  <span className="text-stone-900 font-bold uppercase">{gender} / {parsedHeight} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Weight &rarr; Desired:</span>
                  <span className="text-stone-900 font-bold">{parsedCurrentWeight} kg &rarr; {parsedDesiredWeight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Current BMI:</span>
                  <span className="text-stone-900 font-bold">{bmiReport.currentBmi} ({bmiReport.classification})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Optimal Timeline:</span>
                  <span className="text-stone-900 font-bold">{timeline.optimalWeeks} Weeks ({timeline.optimalTargetDate})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Training Focus:</span>
                  <span className="text-stone-900 font-bold">{goalParams.label}</span>
                </div>
              </div>

              {/* Warning reminder */}
              <div className="p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-400 leading-relaxed font-sans">
                <span className="text-stone-900 font-bold font-mono">DISCIPLINE NOTE:</span> Optimal rates require 100% adherence to daily protein and volume prescriptions.
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-3.5 pt-2.5 border-t border-neutral-850 flex items-center justify-between gap-2 shrink-0">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="py-1.5 px-3 rounded-2xl border border-neutral-800 text-neutral-400 hover:text-stone-900 text-xs font-semibold flex items-center gap-1 active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-300 text-xs px-2"
            >
              Skip
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="py-1.5 px-4 rounded-2xl bg-white text-black hover:bg-neutral-200 text-xs font-bold tracking-tight flex items-center gap-1 active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="py-1.5 px-4 rounded-2xl bg-white text-black hover:bg-neutral-200 text-xs font-bold tracking-tight flex items-center gap-1 active:scale-95"
            >
              <span>Save & Launch</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
