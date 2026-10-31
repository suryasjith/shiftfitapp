import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  UserProfile, 
  ShiftDay, 
  WorkoutSession, 
  NutritionLog, 
  HydrationLog, 
  BodyweightEntry, 
  ActivityEntry,
  DailyStepsEntry,
  ShiftType 
} from './types';
import { storage, DEFAULT_PROFILE } from './services/storage';
import { initializeSeedDataIfEmpty } from './services/seedData';
import { RotaEngine } from './services/rotaEngine';
import { ActivityEngine } from './services/activityEngine';
import { Header } from './components/Header';
import { Navbar, NavTab } from './components/Navbar';
import { FatigueModal } from './components/FatigueModal';
import { FloatingRestTimer } from './components/FloatingRestTimer';
import { InstallBanner } from './components/InstallBanner';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { DashboardTab } from './components/tabs/DashboardTab';
import { WorkoutTab } from './components/tabs/WorkoutTab';
import { NutritionTab } from './components/tabs/NutritionTab';
import { ProgressTab } from './components/tabs/ProgressTab';

export const App: React.FC = () => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<NavTab>('today');
  
  // Real calendar anchor for today
  const todayStr = useMemo(() => RotaEngine.formatDate(new Date()), []);
  // Universal Date State: allows browsing yesterday, past days, or future shifts
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Core App State (All IndexedDB Historical Data)
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [customShifts, setCustomShifts] = useState<Record<string, ShiftDay>>({});
  const [workouts, setWorkouts] = useState<Record<string, WorkoutSession>>({});
  const [nutritions, setNutritions] = useState<Record<string, NutritionLog>>({});
  const [allHydration, setAllHydration] = useState<Record<string, HydrationLog>>({});
  const [weights, setWeights] = useState<Record<string, BodyweightEntry>>({});
  const [allActivities, setAllActivities] = useState<Record<string, ActivityEntry[]>>({});
  const [allSteps, setAllSteps] = useState<Record<string, DailyStepsEntry>>({});
  const [dailyFatigueLogs, setDailyFatigueLogs] = useState<Record<string, number>>({});

  // Modals & Contextual Overlays
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isFatigueModalOpen, setIsFatigueModalOpen] = useState<boolean>(false);
  const [fatigueModalSuccessCallback, setFatigueModalSuccessCallback] = useState<(() => void) | null>(null);
  const [restTimerState, setRestTimerState] = useState<{
    isRunning: boolean;
    seconds: number;
    exerciseName: string;
  }>({
    isRunning: false,
    seconds: 0,
    exerciseName: '',
  });

  // Initial Data & Onboarding Check
  useEffect(() => {
    async function loadData() {
      await storage.init();
      await initializeSeedDataIfEmpty();

      const loadedProfile = await storage.getProfile();
      const loadedShifts = await storage.getShifts();
      const loadedWorkouts = await storage.getWorkouts();
      const loadedNutrition = await storage.getNutrition();
      const loadedWeight = await storage.getWeightHistory();
      const loadedActivitiesMap = await storage.getAllActivities();
      const loadedStepsMap = await storage.getAllSteps();
      const loadedHydrationMap = await storage.getAll<HydrationLog>('hydration');
      const loadedFatigueAll = await storage.getAll<number>('dailyFatigue');

      setProfile(loadedProfile);
      setCustomShifts(loadedShifts);
      setWorkouts(loadedWorkouts);
      setNutritions(loadedNutrition);
      setWeights(loadedWeight);
      setAllActivities(loadedActivitiesMap);
      setAllSteps(loadedStepsMap);
      setAllHydration(loadedHydrationMap);
      setDailyFatigueLogs(loadedFatigueAll);

      // First-time onboarding overlay check
      const hasOnboarded = localStorage.getItem('shiftfit_onboarded_v2');
      if (!hasOnboarded) {
        setIsOnboardingOpen(true);
      }

      setIsReady(true);
    }

    loadData();
  }, []);

  const handleDismissOnboarding = useCallback(() => {
    setIsOnboardingOpen(false);
    localStorage.setItem('shiftfit_onboarded_v2', 'true');
  }, []);

  // Selected Date Lookups (Vercel React Best Practices - Memoized Date Switching)
  const currentDateFatigue = dailyFatigueLogs[selectedDate] ?? 3;

  const currentDateWorkout = useMemo(() => {
    if (!isReady) return null;
    const existing = workouts[selectedDate];
    if (existing) {
      return existing;
    }
    return RotaEngine.generateWorkoutForDate(selectedDate, profile, customShifts, currentDateFatigue);
  }, [isReady, workouts, selectedDate, profile, customShifts, currentDateFatigue]);

  const currentDateNutrition = nutritions[selectedDate] || null;
  const currentDateWeight = weights[selectedDate] || null;
  const currentDateHydration = allHydration[selectedDate] || null;
  const currentDateActivities = allActivities[selectedDate] || [];
  const currentDateSteps = allSteps[selectedDate] || null;

  // Active Burn Calculation Memoized (Steps + Cardio Activities for Selected Date)
  const currentEffectiveWeightKg = currentDateWeight?.weightKg || profile.currentWeightKg || 76.4;
  const stepBurn = useMemo(() => {
    return ActivityEngine.calculateStepCalories(currentDateSteps?.stepCount || 0, currentEffectiveWeightKg).activeStepCalories;
  }, [currentDateSteps?.stepCount, currentEffectiveWeightKg]);

  const cardioBurn = useMemo(() => {
    return currentDateActivities.reduce((acc, a) => acc + (a.caloriesBurned || 0), 0);
  }, [currentDateActivities]);

  const totalActiveBurn = stepBurn + cardioBurn;

  // Stable Handlers
  const handleSaveWorkout = useCallback(async (w: WorkoutSession) => {
    setWorkouts((prev) => ({ ...prev, [w.date]: w }));
    await storage.saveWorkout(w);
  }, []);

  const handleSaveWeight = useCallback(async (entry: BodyweightEntry) => {
    setWeights((prev) => ({ ...prev, [entry.date]: entry }));
    await storage.saveWeightEntry(entry);
    if (entry.date === todayStr) {
      setProfile((prev) => {
        const updatedProfile = { ...prev, currentWeightKg: entry.weightKg };
        storage.saveProfile(updatedProfile);
        return updatedProfile;
      });
    }
  }, [todayStr]);

  const handleSaveNutrition = useCallback(async (log: NutritionLog) => {
    setNutritions((prev) => ({ ...prev, [log.date]: log }));
    await storage.saveNutrition(log);
  }, []);

  const handleSaveHydration = useCallback(async (log: HydrationLog) => {
    setAllHydration((prev) => ({ ...prev, [log.date]: log }));
    await storage.saveHydration(log);
  }, []);

  const handleSaveShift = useCallback(async (shift: ShiftDay) => {
    setCustomShifts((prev) => {
      const updated = { ...prev, [shift.date]: shift };
      storage.saveShift(shift);
      const fatigue = dailyFatigueLogs[shift.date] ?? 3;
      const recalculated = RotaEngine.generateWorkoutForDate(shift.date, profile, updated, fatigue);
      setWorkouts((wPrev) => ({ ...wPrev, [shift.date]: recalculated }));
      storage.saveWorkout(recalculated);
      return updated;
    });
  }, [profile, dailyFatigueLogs]);

  const handleUpdateTemplate = useCallback(async (newTemplate: ShiftType[]) => {
    const updatedProfile = { ...profile, twoWeekTemplate: newTemplate };
    setProfile(updatedProfile);
    await storage.saveProfile(updatedProfile);

    // Only recalculate workout if session is unstarted or empty
    const existingSession = workouts[selectedDate];
    const hasLoggedSets = existingSession && (
      existingSession.completed || 
      existingSession.exercises.some(e => e.sets.some(s => s.completed || s.weightKg > 0 || s.reps > 0))
    );

    if (!hasLoggedSets) {
      const recalculated = RotaEngine.generateWorkoutForDate(selectedDate, updatedProfile, customShifts, currentDateFatigue);
      setWorkouts((prev) => ({ ...prev, [selectedDate]: recalculated }));
      await storage.saveWorkout(recalculated);
    }
  }, [profile, selectedDate, customShifts, currentDateFatigue, workouts]);

  const handleSaveFatigue = useCallback(async (score: number) => {
    setDailyFatigueLogs((prev) => ({ ...prev, [selectedDate]: score }));
    await storage.saveDailyFatigue(selectedDate, score);

    // Only regenerate workout if session is unstarted or empty to prevent clobbering in-progress sets
    const existingSession = workouts[selectedDate];
    const hasLoggedSets = existingSession && (
      existingSession.completed || 
      existingSession.exercises.some(e => e.sets.some(s => s.completed || s.weightKg > 0 || s.reps > 0))
    );

    if (!hasLoggedSets) {
      const regenerated = RotaEngine.generateWorkoutForDate(selectedDate, profile, customShifts, score);
      setWorkouts((prev) => ({ ...prev, [selectedDate]: regenerated }));
      await storage.saveWorkout(regenerated);
    }
  }, [selectedDate, profile, customShifts, workouts]);

  // Trigger Pre-Workout Fatigue Check & Route to Workout
  const handleOpenPreWorkoutFatigue = useCallback(() => {
    setFatigueModalSuccessCallback(() => () => {
      setCurrentTab('workout');
    });
    setIsFatigueModalOpen(true);
  }, []);

  const handleSaveActivity = useCallback(async (activity: ActivityEntry) => {
    const updated = await storage.saveActivity(activity);
    setAllActivities((prev) => ({ ...prev, [activity.date]: updated }));
  }, []);

  const handleDeleteActivity = useCallback(async (id: string) => {
    const updated = await storage.deleteActivity(id, selectedDate);
    setAllActivities((prev) => ({ ...prev, [selectedDate]: updated }));
  }, [selectedDate]);

  const handleClearActivities = useCallback(async () => {
    await storage.clearActivitiesForDate(selectedDate);
    setAllActivities((prev) => ({ ...prev, [selectedDate]: [] }));
  }, [selectedDate]);

  const handleSaveSteps = useCallback(async (entry: DailyStepsEntry) => {
    await storage.saveSteps(entry);
    setAllSteps((prev) => ({ ...prev, [entry.date]: entry }));
  }, []);

  const handleUpdateProfile = useCallback(async (p: UserProfile) => {
    setProfile(p);
    await storage.saveProfile(p);

    // Only recalculate workout if session is unstarted or empty
    const existingSession = workouts[selectedDate];
    const hasLoggedSets = existingSession && (
      existingSession.completed || 
      existingSession.exercises.some(e => e.sets.some(s => s.completed || s.weightKg > 0 || s.reps > 0))
    );

    if (!hasLoggedSets) {
      const recalculated = RotaEngine.generateWorkoutForDate(selectedDate, p, customShifts, currentDateFatigue);
      setWorkouts((prev) => ({ ...prev, [selectedDate]: recalculated }));
      await storage.saveWorkout(recalculated);
    }
  }, [selectedDate, customShifts, currentDateFatigue, workouts]);

  const handleStartRestTimer = useCallback((seconds: number, exerciseName: string) => {
    setRestTimerState({
      isRunning: true,
      seconds,
      exerciseName,
    });
  }, []);

  const handleExportBackup = useCallback(async () => {
    const jsonStr = await storage.exportFullData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ShiftFit_Offline_Backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [todayStr]);

  if (!isReady) {
    return (
      <div 
        role="alert" 
        aria-busy="true"
        aria-label="Loading ShiftFit application"
        className="min-h-screen bg-black flex flex-col items-center justify-center text-neutral-400 font-mono"
      >
        <div className="w-10 h-10 rounded border border-neutral-700 bg-neutral-900 flex items-center justify-center font-bold text-white mb-2">
          SF
        </div>
        <p className="font-bold text-white text-xs">SHIFTFIT</p>
        <p className="text-[10px] text-neutral-400 mt-0.5">Initializing Offline IndexedDB Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col max-w-lg mx-auto relative select-none">
      {/* Top Header - Spacious with Dynamic Island Clearance, Date Switcher & 'i' Contextual Tab Guide */}
      <Header
        todayStr={todayStr}
        selectedDate={selectedDate}
        profile={profile}
        customShifts={customShifts}
        currentTab={currentTab}
        onSelectDate={setSelectedDate}
        onExportBackup={handleExportBackup}
      />

      {/* Main Content Area: 4 Distinct Accessible Tabs for Selected Date */}
      <main className="flex-1 px-4 pt-3 pb-8">
        <InstallBanner />

        {/* Tab 1: Today / Selected Day Dashboard (Minimalist Focus) */}
        {currentTab === 'today' && (
          <div 
            role="tabpanel" 
            id="tabpanel-today" 
            aria-labelledby="nav-tab-today"
            tabIndex={0}
            className="outline-none"
          >
            <DashboardTab
              todayStr={selectedDate}
              profile={profile}
              customShifts={customShifts}
              todayWorkout={currentDateWorkout}
              todayNutrition={currentDateNutrition}
              todayHydration={currentDateHydration}
              todayWeight={currentDateWeight}
              currentFatigue={currentDateFatigue}
              onUpdateFatigue={handleSaveFatigue}
              onNavigateTab={setCurrentTab}
              onSaveWeight={(val) => handleSaveWeight({ date: selectedDate, weightKg: val })}
              onOpenFatigueModal={handleOpenPreWorkoutFatigue}
              onAddWater={(ml) => {
                const current = currentDateHydration?.currentMl || 0;
                handleSaveHydration({
                  date: selectedDate,
                  targetMl: profile.dailyWaterTargetMl || 3800,
                  currentMl: current + ml,
                  drinks: [...(currentDateHydration?.drinks || []), { time: 'Now', amountMl: ml }],
                });
              }}
            />
          </div>
        )}

        {/* Tab 2: Workout (Active Session & Collapsible 2-Week Rota) */}
        {currentTab === 'workout' && (
          <div 
            role="tabpanel" 
            id="tabpanel-workout" 
            aria-labelledby="nav-tab-workout"
            tabIndex={0}
            className="outline-none"
          >
            <WorkoutTab
              todayStr={selectedDate}
              workout={currentDateWorkout}
              profile={profile}
              customShifts={customShifts}
              currentFatigue={currentDateFatigue}
              onSaveWorkout={handleSaveWorkout}
              onStartRestTimer={handleStartRestTimer}
              onOpenFatigueModal={() => setIsFatigueModalOpen(true)}
              onSaveShift={handleSaveShift}
              onUpdateTemplate={handleUpdateTemplate}
            />
          </div>
        )}

        {/* Tab 3: Fuel (Macros, Food Diary & Hydration) */}
        {currentTab === 'fuel' && (
          <div 
            role="tabpanel" 
            id="tabpanel-fuel" 
            aria-labelledby="nav-tab-fuel"
            tabIndex={0}
            className="outline-none"
          >
            <NutritionTab
              todayStr={selectedDate}
              profile={profile}
              customShifts={customShifts}
              nutrition={currentDateNutrition}
              hydration={currentDateHydration}
              activeExpenditureCalories={totalActiveBurn}
              onSaveNutrition={handleSaveNutrition}
              onSaveHydration={handleSaveHydration}
            />
          </div>
        )}

        {/* Tab 4: Progress (Trends, Past Days Archive, Cardio, Steps & Backup) */}
        {currentTab === 'progress' && (
          <div 
            role="tabpanel" 
            id="tabpanel-progress" 
            aria-labelledby="nav-tab-progress"
            tabIndex={0}
            className="outline-none"
          >
            <ProgressTab
              todayStr={todayStr}
              selectedDate={selectedDate}
              profile={profile}
              weights={weights}
              nutritions={nutritions}
              workouts={workouts}
              shifts={customShifts}
              fatigueLogs={dailyFatigueLogs}
              activities={currentDateActivities}
              dailySteps={currentDateSteps}
              todayWeight={currentDateWeight}
              allActivities={allActivities}
              allSteps={allSteps}
              allHydration={allHydration}
              onSelectDate={setSelectedDate}
              onNavigateTab={setCurrentTab}
              onSaveWeight={handleSaveWeight}
              onSaveActivity={handleSaveActivity}
              onDeleteActivity={handleDeleteActivity}
              onClearActivities={handleClearActivities}
              onSaveSteps={handleSaveSteps}
              onExportBackup={handleExportBackup}
              onOpenGuide={() => setIsOnboardingOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Full-Screen Focus Takeover Rest Timer */}
      <FloatingRestTimer
        initialSeconds={restTimerState.seconds}
        isRunning={restTimerState.isRunning}
        exerciseName={restTimerState.exerciseName}
        onFinish={() => setRestTimerState((prev) => ({ ...prev, isRunning: false }))}
        onCancel={() => setRestTimerState((prev) => ({ ...prev, isRunning: false }))}
      />

      {/* Daily 1-10 Fatigue Modal (Alternative Trigger & Pre-Workout Check) */}
      <FatigueModal
        initialScore={currentDateFatigue}
        isOpen={isFatigueModalOpen}
        onClose={() => {
          setIsFatigueModalOpen(false);
          setFatigueModalSuccessCallback(null);
        }}
        onSave={handleSaveFatigue}
        onConfirmSuccess={() => {
          if (fatigueModalSuccessCallback) {
            fatigueModalSuccessCallback();
            setFatigueModalSuccessCallback(null);
          }
        }}
      />

      {/* First-Time Onboarding & Profile Setup Overlay */}
      <OnboardingOverlay
        isOpen={isOnboardingOpen}
        profile={profile}
        onSaveProfile={handleUpdateProfile}
        onClose={handleDismissOnboarding}
      />

      {/* iOS-Style 4-Tab Bottom Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />
    </div>
  );
};
