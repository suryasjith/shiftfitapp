import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  ShiftDay, 
  WorkoutSession, 
  NutritionLog, 
  HydrationLog, 
  BodyweightEntry, 
  PhysiquePhoto 
} from './types';
import { storage, DEFAULT_PROFILE } from './services/storage';
import { initializeSeedDataIfEmpty } from './services/seedData';
import { RotaEngine } from './services/rotaEngine';
import { Header } from './components/Header';
import { Navbar, NavTab } from './components/Navbar';
import { FatigueModal } from './components/FatigueModal';
import { FloatingRestTimer } from './components/FloatingRestTimer';
import { InstallBanner } from './components/InstallBanner';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { DashboardTab } from './components/tabs/DashboardTab';
import { ScheduleTab } from './components/tabs/ScheduleTab';
import { WorkoutTab } from './components/tabs/WorkoutTab';
import { NutritionTab } from './components/tabs/NutritionTab';
import { AnalyticsTab } from './components/tabs/AnalyticsTab';
import { PhysiqueTab } from './components/tabs/PhysiqueTab';

export const App: React.FC = () => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  
  const todayStr = RotaEngine.formatDate(new Date());

  // Core App State
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [customShifts, setCustomShifts] = useState<Record<string, ShiftDay>>({});
  const [workouts, setWorkouts] = useState<Record<string, WorkoutSession>>({});
  const [nutritions, setNutritions] = useState<Record<string, NutritionLog>>({});
  const [hydration, setHydration] = useState<HydrationLog | null>(null);
  const [weights, setWeights] = useState<Record<string, BodyweightEntry>>({});
  const [photos, setPhotos] = useState<Record<string, PhysiquePhoto>>({});
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
      const loadedPhotos = await storage.getPhysiquePhotos();
      const loadedFatigueAll = await storage.getAll<number>('dailyFatigue');

      setProfile(loadedProfile);
      setCustomShifts(loadedShifts);
      setWorkouts(loadedWorkouts);
      setNutritions(loadedNutrition);
      setWeights(loadedWeight);
      setPhotos(loadedPhotos);
      setDailyFatigueLogs(loadedFatigueAll);

      // Check today's fatigue
      const todayFatigue = loadedFatigueAll[todayStr];
      if (todayFatigue !== undefined) {
        setCurrentFatigue(todayFatigue);
      }

      // Check today's hydration
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

      // First-time onboarding overlay for new sessions (non-nagging)
      const hasOnboarded = localStorage.getItem('shiftfit_onboarded_v1');
      if (!hasOnboarded) {
        setIsOnboardingOpen(true);
      }

      setIsReady(true);
    }

    loadData();
  }, [todayStr]);

  const handleDismissOnboarding = () => {
    setIsOnboardingOpen(false);
    localStorage.setItem('shiftfit_onboarded_v1', 'true');
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

  const handleSaveFatigue = async (score: number) => {
    setCurrentFatigue(score);
    setDailyFatigueLogs((prev) => ({ ...prev, [todayStr]: score }));
    await storage.saveDailyFatigue(todayStr, score);

    const regenerated = RotaEngine.generateWorkoutForDate(todayStr, profile, customShifts, score);
    setWorkouts((prev) => ({ ...prev, [todayStr]: regenerated }));
    await storage.saveWorkout(regenerated);
  };

  const handleSavePhoto = async (photo: PhysiquePhoto) => {
    setPhotos((prev) => ({ ...prev, [photo.id]: photo }));
    await storage.savePhysiquePhoto(photo);
  };

  const handleUpdateProfile = async (p: UserProfile) => {
    setProfile(p);
    await storage.saveProfile(p);
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
    a.download = `ShiftFit_Backup_${todayStr}.json`;
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
        <p className="text-[10px] text-neutral-600 mt-0.5">Initializing OLED Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col max-w-lg mx-auto relative select-none">
      {/* Top Header */}
      <Header
        todayStr={todayStr}
        profile={profile}
        customShifts={customShifts}
        currentFatigue={currentFatigue}
        onOpenFatigueModal={() => setIsFatigueModalOpen(true)}
        onOpenSettings={() => setCurrentTab('vault')}
        onOpenGuide={() => setIsOnboardingOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-3 pt-3 pb-8">
        {/* iOS PWA Add to Home Screen Banner */}
        <InstallBanner />

        {currentTab === 'dashboard' && (
          <DashboardTab
            todayStr={todayStr}
            profile={profile}
            customShifts={customShifts}
            todayWorkout={todayWorkout}
            todayNutrition={todayNutrition}
            todayHydration={hydration}
            todayWeight={todayWeight}
            currentFatigue={currentFatigue}
            onOpenFatigueModal={() => setIsFatigueModalOpen(true)}
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

        {currentTab === 'schedule' && (
          <ScheduleTab
            todayStr={todayStr}
            profile={profile}
            customShifts={customShifts}
            onSaveShift={handleSaveShift}
            onNavigateTab={setCurrentTab}
          />
        )}

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
          />
        )}

        {currentTab === 'nutrition' && (
          <NutritionTab
            todayStr={todayStr}
            profile={profile}
            customShifts={customShifts}
            nutrition={todayNutrition}
            hydration={hydration}
            onSaveNutrition={handleSaveNutrition}
            onSaveHydration={handleSaveHydration}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsTab
            todayStr={todayStr}
            profile={profile}
            weights={weights}
            nutritions={nutritions}
            workouts={workouts}
            shifts={customShifts}
            fatigueLogs={dailyFatigueLogs}
            onSaveWeight={handleSaveWeight}
          />
        )}

        {currentTab === 'vault' && (
          <PhysiqueTab
            todayStr={todayStr}
            profile={profile}
            photos={photos}
            todayWeight={todayWeight}
            onSavePhoto={handleSavePhoto}
            onUpdateProfile={handleUpdateProfile}
            onExportAllData={handleExportBackup}
          />
        )}
      </main>

      {/* Floating Rest Timer */}
      <FloatingRestTimer
        initialSeconds={restTimerState.seconds}
        isRunning={restTimerState.isRunning}
        exerciseName={restTimerState.exerciseName}
        onFinish={() => setRestTimerState((prev) => ({ ...prev, isRunning: false }))}
        onCancel={() => setRestTimerState((prev) => ({ ...prev, isRunning: false }))}
      />

      {/* Daily 1-10 Fatigue Modal */}
      <FatigueModal
        initialScore={currentFatigue}
        isOpen={isFatigueModalOpen}
        onClose={() => setIsFatigueModalOpen(false)}
        onSave={handleSaveFatigue}
      />

      {/* First-Time Onboarding Overlay */}
      <OnboardingOverlay
        isOpen={isOnboardingOpen}
        onClose={handleDismissOnboarding}
      />

      {/* Bottom iOS Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />
    </div>
  );
};
