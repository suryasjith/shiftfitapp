import React, { useState, useEffect } from 'react';
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
  
  const todayStr = RotaEngine.formatDate(new Date());

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

  const handleDismissOnboarding = () => {
    setIsOnboardingOpen(false);
    localStorage.setItem('shiftfit_onboarded_v2', 'true');
  };

  const getTodayWorkout = (): WorkoutSession => {
    const existing = workouts[todayStr];
    if (existing) {
      return existing;
    }
    return RotaEngine.generateWorkoutForDate(todayStr, profile, customShifts, currentFatigue);
  };

  const todayWorkout = isReady ? getTodayWorkout() : null;
  const todayNutrition = nutritions[todayStr] || null;
  const todayWeight = weights[todayStr] || null;

  // Active Burn Calculation (Steps + Cardio Activities)
  const currentEffectiveWeightKg = todayWeight?.weightKg || profile.currentWeightKg || 76.4;
  const stepBurn = ActivityEngine.calculateStepCalories(dailySteps?.stepCount || 0, currentEffectiveWeightKg).activeStepCalories;
  const cardioBurn = activities.reduce((acc, a) => acc + (a.caloriesBurned || 0), 0);
  const totalActiveBurn = stepBurn + cardioBurn;

  // Handlers
  const handleSaveWorkout = async (w: WorkoutSession) => {
    setWorkouts((prev) => ({ ...prev, [w.date]: w }));
    await storage.saveWorkout(w);
  };

  const handleSaveWeight = async (entry: BodyweightEntry) => {
    const updated = { ...weights, [entry.date]: entry };
    setWeights(updated);
    await storage.saveWeightEntry(entry);
    if (entry.date === todayStr) {
      const updatedProfile = { ...profile, currentWeightKg: entry.weightKg };
      setProfile(updatedProfile);
      await storage.saveProfile(updatedProfile);
    }
  };

  const handleSaveNutrition = async (log: NutritionLog) => {
    setNutritions((prev) => ({ ...prev, [log.date]: log }));
    await storage.saveNutrition(log);
  };

  const handleSaveHydration = async (log: HydrationLog) => {
    setHydration(log);
    await storage.saveHydration(log);
  };

  const handleSaveShift = async (shift: ShiftDay) => {
    const updated = { ...customShifts, [shift.date]: shift };
    setCustomShifts(updated);
    await storage.saveShift(shift);

    const recalculated = RotaEngine.generateWorkoutForDate(shift.date, profile, updated, currentFatigue);
    setWorkouts((prev) => ({ ...prev, [shift.date]: recalculated }));
    await storage.saveWorkout(recalculated);
  };

  const handleUpdateTemplate = async (newTemplate: ShiftType[]) => {
    const updatedProfile = { ...profile, twoWeekTemplate: newTemplate };
    setProfile(updatedProfile);
    await storage.saveProfile(updatedProfile);

    // Recalculate today's workout
    const recalculated = RotaEngine.generateWorkoutForDate(todayStr, updatedProfile, customShifts, currentFatigue);
    setWorkouts((prev) => ({ ...prev, [todayStr]: recalculated }));
    await storage.saveWorkout(recalculated);
  };

  const handleSaveFatigue = async (score: number) => {
    setCurrentFatigue(score);
    setDailyFatigueLogs((prev) => ({ ...prev, [todayStr]: score }));
    await storage.saveDailyFatigue(todayStr, score);

    const regenerated = RotaEngine.generateWorkoutForDate(todayStr, profile, customShifts, score);
    setWorkouts((prev) => ({ ...prev, [todayStr]: regenerated }));
    await storage.saveWorkout(regenerated);
  };

  const handleSaveActivity = async (activity: ActivityEntry) => {
    const updated = await storage.saveActivity(activity);
    setActivities(updated);
  };

  const handleDeleteActivity = async (id: string) => {
    const updated = await storage.deleteActivity(id, todayStr);
    setActivities(updated);
  };

  const handleClearActivities = async () => {
    await storage.clearActivitiesForDate(todayStr);
    setActivities([]);
  };

  const handleSaveSteps = async (entry: DailyStepsEntry) => {
    await storage.saveSteps(entry);
    setDailySteps(entry);
  };

  const handleUpdateProfile = async (p: UserProfile) => {
    setProfile(p);
    await storage.saveProfile(p);

    // Recalculate today's workout with new profile / goal
    const recalculated = RotaEngine.generateWorkoutForDate(todayStr, p, customShifts, currentFatigue);
    setWorkouts((prev) => ({ ...prev, [todayStr]: recalculated }));
    await storage.saveWorkout(recalculated);
  };

  const handleStartRestTimer = (seconds: number, exerciseName: string) => {
    setRestTimerState({
      isRunning: true,
      seconds,
      exerciseName,
    });
  };

  const handleExportBackup = async () => {
    const jsonStr = await storage.exportFullData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ShiftFit_Offline_Backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-neutral-500 font-mono">
        <div className="w-10 h-10 rounded border border-neutral-700 bg-neutral-900 flex items-center justify-center font-bold text-white mb-2">
          SF
        </div>
        <p className="font-bold text-white text-xs">SHIFTFIT</p>
        <p className="text-[10px] text-neutral-600 mt-0.5">Initializing Offline IndexedDB Engine...</p>
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

      {/* Main Content Area: 4 Distinct iOS-Style Tabs */}
      <main className="flex-1 px-4 pt-3 pb-8">
        <InstallBanner />

        {/* Tab 1: Today Dashboard (Minimalist Focus) */}
        {currentTab === 'today' && (
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
        )}

        {/* Tab 2: Workout (Active Session & Collapsible 2-Week Rota) */}
        {currentTab === 'workout' && (
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
        )}

        {/* Tab 3: Fuel (Macros, Food Diary & Hydration) */}
        {currentTab === 'fuel' && (
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
        )}

        {/* Tab 4: Progress (Trends, Analytics, Cardio, Steps & Backup) */}
        {currentTab === 'progress' && (
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
