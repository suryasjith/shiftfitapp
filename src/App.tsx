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
  
  const todayStr = useMemo(() => RotaEngine.formatDate(new Date()), []);

  // Core App State
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [customShifts, setCustomShifts] = useState<Record<string, ShiftDay>>({});
  const [workouts, setWorkouts] = useState<Record<string, WorkoutSession>>({});
  const [nutritions, setNutritions] = useState<Record<string, NutritionLog>>({});
  const [hydration, setHydration] = useState<HydrationLog | null>(null);
  const [weights, setWeights] = useState<Record<string, BodyweightEntry>>({});
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [dailySteps, setDailySteps] = useState<DailyStepsEntry | null>(null);
  const [dailyFatigueLogs, setDailyFatigueLogs] = useState<Record<string, number>>({});
  const [currentFatigue, setCurrentFatigue] = useState<number>(3);

  // Modals & Contextual Overlays
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isFatigueModalOpen, setIsFatigueModalOpen] = useState<boolean>(false);
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
      const loadedActivities = await storage.getActivitiesByDate(todayStr);
      const loadedSteps = await storage.getStepsByDate(todayStr);
      const loadedFatigueAll = await storage.getAll<number>('dailyFatigue');

      setProfile(loadedProfile);
      setCustomShifts(loadedShifts);
      setWorkouts(loadedWorkouts);
      setNutritions(loadedNutrition);
      setWeights(loadedWeight);
      setActivities(loadedActivities);
      setDailySteps(loadedSteps);
      setDailyFatigueLogs(loadedFatigueAll);

      const todayFatigue = loadedFatigueAll[todayStr];
      if (todayFatigue !== undefined) {
        setCurrentFatigue(todayFatigue);
      }

      const todayHydro = await storage.getHydrationByDate(todayStr);
      if (todayHydro) {
        setHydration(todayHydro);
      } else {
        const initialHydro: HydrationLog = {
          date: todayStr,
          targetMl: loadedProfile.dailyWaterTargetMl || 3800,
          currentMl: 0,
          drinks: [],
        };
        setHydration(initialHydro);
        await storage.saveHydration(initialHydro);
      }

      // First-time onboarding overlay check
      const hasOnboarded = localStorage.getItem('shiftfit_onboarded_v2');
      if (!hasOnboarded) {
        setIsOnboardingOpen(true);
      }

      setIsReady(true);
    }

    loadData();
  }, [todayStr]);

  const handleDismissOnboarding = useCallback(() => {
    setIsOnboardingOpen(false);
    localStorage.setItem('shiftfit_onboarded_v2', 'true');
  }, []);

  // Memoized Workout Generation (Vercel React Best Practices)
  const todayWorkout = useMemo(() => {
    if (!isReady) return null;
    const existing = workouts[todayStr];
    if (existing) {
      return existing;
    }
    return RotaEngine.generateWorkoutForDate(todayStr, profile, customShifts, currentFatigue);
  }, [isReady, workouts, todayStr, profile, customShifts, currentFatigue]);

  const todayNutrition = nutritions[todayStr] || null;
  const todayWeight = weights[todayStr] || null;

  // Active Burn Calculation Memoized (Steps + Cardio Activities)
  const currentEffectiveWeightKg = todayWeight?.weightKg || profile.currentWeightKg || 76.4;
  const stepBurn = useMemo(() => {
    return ActivityEngine.calculateStepCalories(dailySteps?.stepCount || 0, currentEffectiveWeightKg).activeStepCalories;
  }, [dailySteps?.stepCount, currentEffectiveWeightKg]);

  const cardioBurn = useMemo(() => {
    return activities.reduce((acc, a) => acc + (a.caloriesBurned || 0), 0);
  }, [activities]);

  const totalActiveBurn = stepBurn + cardioBurn;

  // Stable Handlers (Vercel React Best Practices)
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
    setHydration(log);
    await storage.saveHydration(log);
  }, []);

  const handleSaveShift = useCallback(async (shift: ShiftDay) => {
    setCustomShifts((prev) => {
      const updated = { ...prev, [shift.date]: shift };
      storage.saveShift(shift);
      const recalculated = RotaEngine.generateWorkoutForDate(shift.date, profile, updated, currentFatigue);
      setWorkouts((wPrev) => ({ ...wPrev, [shift.date]: recalculated }));
      storage.saveWorkout(recalculated);
      return updated;
    });
  }, [profile, currentFatigue]);

  const handleUpdateTemplate = useCallback(async (newTemplate: ShiftType[]) => {
    const updatedProfile = { ...profile, twoWeekTemplate: newTemplate };
    setProfile(updatedProfile);
    await storage.saveProfile(updatedProfile);

    // Recalculate today's workout
    const recalculated = RotaEngine.generateWorkoutForDate(todayStr, updatedProfile, customShifts, currentFatigue);
    setWorkouts((prev) => ({ ...prev, [todayStr]: recalculated }));
    await storage.saveWorkout(recalculated);
  }, [profile, todayStr, customShifts, currentFatigue]);

  const handleSaveFatigue = useCallback(async (score: number) => {
    setCurrentFatigue(score);
    setDailyFatigueLogs((prev) => ({ ...prev, [todayStr]: score }));
    await storage.saveDailyFatigue(todayStr, score);

    const regenerated = RotaEngine.generateWorkoutForDate(todayStr, profile, customShifts, score);
    setWorkouts((prev) => ({ ...prev, [todayStr]: regenerated }));
    await storage.saveWorkout(regenerated);
  }, [todayStr, profile, customShifts]);

  const handleSaveActivity = useCallback(async (activity: ActivityEntry) => {
    const updated = await storage.saveActivity(activity);
    setActivities(updated);
  }, []);

  const handleDeleteActivity = useCallback(async (id: string) => {
    const updated = await storage.deleteActivity(id, todayStr);
    setActivities(updated);
  }, [todayStr]);

  const handleClearActivities = useCallback(async () => {
    await storage.clearActivitiesForDate(todayStr);
    setActivities([]);
  }, [todayStr]);

  const handleSaveSteps = useCallback(async (entry: DailyStepsEntry) => {
    await storage.saveSteps(entry);
    setDailySteps(entry);
  }, []);

  const handleUpdateProfile = useCallback(async (p: UserProfile) => {
    setProfile(p);
    await storage.saveProfile(p);

    // Recalculate today's workout with new profile / goal
    const recalculated = RotaEngine.generateWorkoutForDate(todayStr, p, customShifts, currentFatigue);
    setWorkouts((prev) => ({ ...prev, [todayStr]: recalculated }));
    await storage.saveWorkout(recalculated);
  }, [todayStr, customShifts, currentFatigue]);

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
      {/* Top Header - Spacious with Dynamic Island Clearance & 'i' Contextual Tab Guide */}
      <Header
        todayStr={todayStr}
        profile={profile}
        customShifts={customShifts}
        currentTab={currentTab}
        onExportBackup={handleExportBackup}
      />

      {/* Main Content Area: 4 Distinct Accessible Tabs */}
      <main className="flex-1 px-4 pt-3 pb-8">
        <InstallBanner />

        {/* Tab 1: Today Dashboard (Minimalist Focus) */}
        {currentTab === 'today' && (
          <div 
            role="tabpanel" 
            id="tabpanel-today" 
            aria-labelledby="nav-tab-today"
            tabIndex={0}
            className="outline-none"
          >
            <DashboardTab
              todayStr={todayStr}
              profile={profile}
              customShifts={customShifts}
              todayWorkout={todayWorkout}
              todayNutrition={todayNutrition}
              todayHydration={hydration}
              todayWeight={todayWeight}
              currentFatigue={currentFatigue}
              onUpdateFatigue={handleSaveFatigue}
              onNavigateTab={setCurrentTab}
              onSaveWeight={(val) => handleSaveWeight({ date: todayStr, weightKg: val })}
              onAddWater={(ml) => {
                const current = hydration?.currentMl || 0;
                handleSaveHydration({
                  date: todayStr,
                  targetMl: profile.dailyWaterTargetMl || 3800,
                  currentMl: current + ml,
                  drinks: [...(hydration?.drinks || []), { time: 'Now', amountMl: ml }],
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
              todayStr={todayStr}
              workout={todayWorkout}
              profile={profile}
              customShifts={customShifts}
              currentFatigue={currentFatigue}
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
              todayStr={todayStr}
              profile={profile}
              customShifts={customShifts}
              nutrition={todayNutrition}
              hydration={hydration}
              activeExpenditureCalories={totalActiveBurn}
              onSaveNutrition={handleSaveNutrition}
              onSaveHydration={handleSaveHydration}
            />
          </div>
        )}

        {/* Tab 4: Progress (Trends, Analytics, Cardio, Steps & Backup) */}
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
              profile={profile}
              weights={weights}
              nutritions={nutritions}
              workouts={workouts}
              shifts={customShifts}
              fatigueLogs={dailyFatigueLogs}
              activities={activities}
              dailySteps={dailySteps}
              todayWeight={todayWeight}
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

      {/* Daily 1-10 Fatigue Modal (Alternative Trigger) */}
      <FatigueModal
        initialScore={currentFatigue}
        isOpen={isFatigueModalOpen}
        onClose={() => setIsFatigueModalOpen(false)}
        onSave={handleSaveFatigue}
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
