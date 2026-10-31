import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  UserProfile, 
  NutritionLog, 
  HydrationLog, 
  ShiftDay, 
  LoggedFoodItem 
} from '../../types';
import { RotaEngine } from '../../services/rotaEngine';
import { FoodApiService, FoodSearchResult, FIXED_SHIFT_MEALS } from '../../services/foodApi';
import { ActivityEngine } from '../../services/activityEngine';
import { 
  RotateCcw,
  Search,
  Plus,
  Trash2,
  Utensils,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  TrendingUp,
  Droplets,
  PieChart
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';

interface NutritionTabProps {
  todayStr: string;
  profile: UserProfile;
  customShifts: Record<string, ShiftDay>;
  nutrition: NutritionLog | null;
  hydration: HydrationLog | null;
  activeExpenditureCalories?: number;
  onSaveNutrition: (log: NutritionLog) => void;
  onSaveHydration: (log: HydrationLog) => void;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({
  todayStr,
  profile,
  customShifts,
  nutrition,
  hydration,
  activeExpenditureCalories = 0,
  onSaveNutrition,
  onSaveHydration,
}) => {
  const dayInfo = useMemo(() => {
    return RotaEngine.getDayInfo(todayStr, profile, customShifts);
  }, [todayStr, profile, customShifts]);

  const baseMacros = useMemo(() => {
    return dayInfo.isShiftDay ? profile.shiftDayMacros : profile.offDayMacros;
  }, [dayInfo.isShiftDay, profile.shiftDayMacros, profile.offDayMacros]);

  // Dynamic Macro Target Calculation
  const dynamicMacros = useMemo(() => {
    return ActivityEngine.calculateDynamicMacros(baseMacros, activeExpenditureCalories);
  }, [baseMacros, activeExpenditureCalories]);

  const effectiveTargetCalories = dynamicMacros.dynamicCalories;
  const effectiveTargetProtein = dynamicMacros.dynamicProtein;
  const effectiveTargetCarbs = dynamicMacros.dynamicCarbs;
  const effectiveTargetFats = dynamicMacros.dynamicFats;

  // Active values
  const currentProtein = nutrition?.proteinGrams || 0;
  const currentFats = nutrition?.fatsGrams || 0;
  const currentCarbs = nutrition?.carbsGrams || 0;
  const currentCalories = nutrition?.calories || (currentProtein * 4 + currentFats * 9 + currentCarbs * 4);
  const loggedFoods = nutrition?.foods || [];

  // Search & Form states (All inputs completely empty by default)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [servingGramsStr, setServingGramsStr] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  
  // Progressive disclosure: detailed macros collapsed by default
  const [showMacroBreakdown, setShowMacroBreakdown] = useState<boolean>(false);
  const [showFixedMeals, setShowFixedMeals] = useState<boolean>(false);

  // Debounced search (Vercel React Best Practices)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await FoodApiService.searchFoods(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectFoodResult = useCallback((food: FoodSearchResult) => {
    soundManager.playTap();
    setSelectedFood(food);
    setServingGramsStr('');
    setSearchResults([]);
  }, []);

  const handleAddCalculatedFood = useCallback(() => {
    if (!selectedFood) return;
    soundManager.playTap();

    const g = parseFloat(servingGramsStr) || selectedFood.defaultServingG || 100;
    const loggedItem = FoodApiService.calculateServingMacros(selectedFood, g);
    const updatedFoods = [...loggedFoods, loggedItem];
    const newProt = Math.round((currentProtein + loggedItem.proteinGrams) * 10) / 10;
    const newFats = Math.round((currentFats + loggedItem.fatsGrams) * 10) / 10;
    const newCarbs = Math.round((currentCarbs + loggedItem.carbsGrams) * 10) / 10;
    const newCals = currentCalories + loggedItem.calories;

    const updated: NutritionLog = {
      date: todayStr,
      proteinGrams: newProt,
      fatsGrams: newFats,
      carbsGrams: newCarbs,
      calories: newCals,
      targetProtein: effectiveTargetProtein,
      targetFats: effectiveTargetFats,
      targetCarbs: effectiveTargetCarbs,
      targetCalories: effectiveTargetCalories,
      foods: updatedFoods,
    };
    onSaveNutrition(updated);
    setSelectedFood(null);
    setSearchQuery('');
    setServingGramsStr('');
  }, [selectedFood, servingGramsStr, loggedFoods, currentProtein, currentFats, currentCarbs, currentCalories, todayStr, effectiveTargetProtein, effectiveTargetFats, effectiveTargetCarbs, effectiveTargetCalories, onSaveNutrition]);

  const handleAddFixedShiftMeal = useCallback((meal: typeof FIXED_SHIFT_MEALS[0]) => {
    soundManager.playTap();
    const loggedItem: LoggedFoodItem = {
      id: `shiftmeal_${Date.now()}`,
      name: meal.title,
      servingGrams: 1,
      calories: meal.calories,
      proteinGrams: meal.proteinGrams,
      fatsGrams: meal.fatsGrams,
      carbsGrams: meal.carbsGrams,
      timeLogged: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedFoods = [...loggedFoods, loggedItem];
    const updated: NutritionLog = {
      date: todayStr,
      proteinGrams: Math.round((currentProtein + meal.proteinGrams) * 10) / 10,
      fatsGrams: Math.round((currentFats + meal.fatsGrams) * 10) / 10,
      carbsGrams: Math.round((currentCarbs + meal.carbsGrams) * 10) / 10,
      calories: currentCalories + meal.calories,
      targetProtein: effectiveTargetProtein,
      targetFats: effectiveTargetFats,
      targetCarbs: effectiveTargetCarbs,
      targetCalories: effectiveTargetCalories,
      foods: updatedFoods,
    };
    onSaveNutrition(updated);
  }, [loggedFoods, todayStr, currentProtein, currentFats, currentCarbs, currentCalories, effectiveTargetProtein, effectiveTargetFats, effectiveTargetCarbs, effectiveTargetCalories, onSaveNutrition]);

  const handleRemoveLoggedFood = useCallback((id: string) => {
    soundManager.playTap();
    const item = loggedFoods.find(f => f.id === id);
    if (!item) return;

    const updatedFoods = loggedFoods.filter(f => f.id !== id);
    const updated: NutritionLog = {
      date: todayStr,
      proteinGrams: Math.max(0, Math.round((currentProtein - item.proteinGrams) * 10) / 10),
      fatsGrams: Math.max(0, Math.round((currentFats - item.fatsGrams) * 10) / 10),
      carbsGrams: Math.max(0, Math.round((currentCarbs - item.carbsGrams) * 10) / 10),
      calories: Math.max(0, currentCalories - item.calories),
      targetProtein: effectiveTargetProtein,
      targetFats: effectiveTargetFats,
      targetCarbs: effectiveTargetCarbs,
      targetCalories: effectiveTargetCalories,
      foods: updatedFoods,
    };
    onSaveNutrition(updated);
  }, [loggedFoods, todayStr, currentProtein, currentFats, currentCarbs, currentCalories, effectiveTargetProtein, effectiveTargetFats, effectiveTargetCarbs, effectiveTargetCalories, onSaveNutrition]);

  const handleAdjustMacro = useCallback((field: 'proteinGrams' | 'fatsGrams' | 'carbsGrams', delta: number) => {
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
      targetProtein: effectiveTargetProtein,
      targetFats: effectiveTargetFats,
      targetCarbs: effectiveTargetCarbs,
      targetCalories: effectiveTargetCalories,
      foods: loggedFoods,
    };
    onSaveNutrition(updated);
  }, [currentProtein, currentFats, currentCarbs, todayStr, effectiveTargetProtein, effectiveTargetFats, effectiveTargetCarbs, effectiveTargetCalories, loggedFoods, onSaveNutrition]);

  const handleStartFreshNutrition = useCallback(() => {
    soundManager.playTap();
    const resetLog: NutritionLog = {
      date: todayStr,
      proteinGrams: 0,
      fatsGrams: 0,
      carbsGrams: 0,
      calories: 0,
      targetProtein: effectiveTargetProtein,
      targetFats: effectiveTargetFats,
      targetCarbs: effectiveTargetCarbs,
      targetCalories: effectiveTargetCalories,
      foods: [],
    };
    onSaveNutrition(resetLog);
    setShowClearConfirm(false);
  }, [todayStr, effectiveTargetProtein, effectiveTargetFats, effectiveTargetCarbs, effectiveTargetCalories, onSaveNutrition]);

  // Water handlers
  const currentWater = hydration?.currentMl || 0;
  const targetWater = hydration?.targetMl || profile.dailyWaterTargetMl || 3800;

  const handleAddWater = useCallback((ml: number) => {
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
  }, [currentWater, hydration?.drinks, todayStr, targetWater, onSaveHydration]);

  const handleResetWater = useCallback(() => {
    soundManager.playTap();
    const updated: HydrationLog = {
      date: todayStr,
      targetMl: targetWater,
      currentMl: 0,
      drinks: [],
    };
    onSaveHydration(updated);
  }, [todayStr, targetWater, onSaveHydration]);

  const remainingCalories = Math.max(0, effectiveTargetCalories - currentCalories);
  const caloriesPercent = Math.min(100, Math.round((currentCalories / effectiveTargetCalories) * 100));
  const waterPercent = Math.min(100, Math.round((currentWater / targetWater) * 100));

  return (
    <div className="space-y-4 pb-28 text-left animate-fadeIn font-sans">
      {/* 1. Primary Header Card: Calories & Fuel Overview */}
      <section 
        aria-labelledby="fuel-header-title"
        className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-200">
                {dayInfo.isShiftDay ? '12H SHIFT MACROS' : 'OFF-DAY MACROS'}
              </span>
              {activeExpenditureCalories > 0 && (
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white text-black flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-black" aria-hidden="true" />
                  +{activeExpenditureCalories} KCAL EXPENDED
                </span>
              )}
            </div>
            <h2 id="fuel-header-title" className="text-xl font-bold text-white tracking-tight mt-1">
              Daily Fuel & Calories
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Target: <strong className="text-white font-mono">{effectiveTargetCalories} kcal</strong> • Consumed: <strong className="text-white font-mono">{currentCalories} kcal</strong>
            </p>
          </div>

          {/* Start Fresh Button (min 44px touch target) */}
          <button
            onClick={() => setShowClearConfirm(true)}
            aria-label="Clear all logged meals for today and start fresh"
            className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white text-xs font-medium transition-all active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
            <span>Start Fresh</span>
          </button>
        </div>

        {/* Start Fresh Confirmation Dialog */}
        {showClearConfirm && (
          <div 
            role="alertdialog"
            aria-labelledby="clear-meals-title"
            aria-describedby="clear-meals-desc"
            className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 space-y-2 animate-fadeIn font-sans"
          >
            <div className="flex items-center gap-2 text-xs text-white font-bold">
              <AlertCircle className="w-4 h-4 text-neutral-300" aria-hidden="true" />
              <span id="clear-meals-title">Clear today's logged meals and reset macros?</span>
            </div>
            <p id="clear-meals-desc" className="text-xs text-neutral-300">
              This will remove all logged foods and reset calorie intake to zero.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="min-h-[44px] px-3.5 py-2 rounded-lg border border-neutral-750 text-neutral-200 text-xs hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartFreshNutrition}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-white text-black font-bold text-xs hover:bg-neutral-200"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        )}

        {/* Big Calories Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-neutral-300 font-medium">
              {remainingCalories > 0 ? (
                <><strong>{remainingCalories} kcal</strong> remaining to reach goal</>
              ) : (
                <strong className="text-white">Daily Calorie Target Met ✓</strong>
              )}
            </span>
            <span className="text-white font-mono font-bold">{caloriesPercent}%</span>
          </div>
          <div 
            role="progressbar"
            aria-valuenow={caloriesPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Calories consumed percentage"
            className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-neutral-850"
          >
            <div 
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{ width: `${caloriesPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* 2. Hydration Checklist Card */}
      <section 
        aria-labelledby="hydration-card-title"
        className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white shrink-0">
              <Droplets className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-bold">
                Hydration Tracker
              </span>
              <h3 id="hydration-card-title" className="text-base font-bold text-white tracking-tight">
                {(currentWater / 1000).toFixed(1)}L <span className="text-xs text-neutral-400 font-normal">/ {(targetWater / 1000).toFixed(1)}L</span>
              </h3>
            </div>
          </div>

          <button
            onClick={handleResetWater}
            aria-label="Reset today's logged water intake"
            className="min-h-[44px] text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-mono p-2 focus:outline-none focus:ring-2 focus:ring-white rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>

        {/* Water Progress Bar */}
        <div 
          role="progressbar"
          aria-valuenow={waterPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Water target percentage logged"
          className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-850"
        >
          <div 
            className="bg-white h-full rounded-full transition-all duration-300"
            style={{ width: `${waterPercent}%` }}
          />
        </div>

        {/* 1-Tap Quick Addition Buttons (min 44px touch target) */}
        <div className="grid grid-cols-4 gap-2 pt-1 font-sans">
          {[
            { label: '+250ml', ml: 250, desc: 'Glass' },
            { label: '+500ml', ml: 500, desc: 'Bottle' },
            { label: '+750ml', ml: 750, desc: 'Shaker' },
            { label: '+1000ml', ml: 1000, desc: '1 Litre' },
          ].map((btn, idx) => (
            <button
              key={idx}
              onClick={() => handleAddWater(btn.ml)}
              aria-label={`Log ${btn.label} (${btn.desc})`}
              className="min-h-[48px] py-2 px-1 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-750 text-white font-bold text-xs active:scale-95 transition-all text-center focus:outline-none focus:ring-2 focus:ring-white"
            >
              <div>{btn.label}</div>
              <span className="text-[9px] text-neutral-400 font-normal block">{btn.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. OpenFoodFacts Search & Quick Food Logger */}
      <section 
        aria-labelledby="database-search-title"
        className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white shrink-0">
            <Utensils className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-bold">
              Database Search
            </span>
            <h3 id="database-search-title" className="text-base font-bold text-white tracking-tight">
              Log Meal or Food
            </h3>
          </div>
        </div>

        {/* Search Input Field with Accessible Label */}
        <div className="relative">
          <label htmlFor="food-database-search" className="sr-only">
            Search food or drink in database
          </label>
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-neutral-400 shrink-0" aria-hidden="true" />
            <input
              id="food-database-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food (e.g. Chicken breast, Oats, Greek yogurt...)"
              className="w-full min-h-[32px] bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
            {isSearching && <span className="text-[10px] text-neutral-400 font-mono">Searching...</span>}
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div 
              role="listbox" 
              aria-label="Food search results"
              className="absolute top-full left-0 right-0 z-30 mt-1 bg-black border border-neutral-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-neutral-850"
            >
              {searchResults.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => handleSelectFoodResult(food)}
                  className="w-full text-left p-3 hover:bg-neutral-900 transition-colors flex items-center justify-between focus:outline-none focus:bg-neutral-900"
                >
                  <div>
                    <div className="text-xs font-bold text-white truncate max-w-[200px]">
                      {food.name}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {food.brand ? `${food.brand} • ` : ''}100g: {food.caloriesPer100g} kcal
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-neutral-300 text-right">
                    {food.proteinPer100g}g P • {food.carbsPer100g}g C • {food.fatsPer100g}g F
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Portion Selector Card if Food Selected */}
        {selectedFood && (
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-750 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">{selectedFood.name}</span>
                <span className="text-[10px] text-neutral-400 block">{selectedFood.brand || 'Standard item'}</span>
              </div>
              <button 
                onClick={() => setSelectedFood(null)}
                aria-label="Cancel food selection"
                className="min-h-[44px] text-xs text-neutral-400 hover:text-white p-2"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="food-portion-size" className="text-xs text-neutral-300">Portion Size:</label>
              <input
                id="food-portion-size"
                type="number"
                step="5"
                min="1"
                max="2000"
                value={servingGramsStr}
                onChange={(e) => setServingGramsStr(e.target.value)}
                placeholder="Grams (e.g. 150)"
                className="flex-1 min-h-[44px] bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-white text-center"
              />
              <span className="text-xs text-neutral-400 font-mono" aria-hidden="true">grams</span>
            </div>

            {/* Calculated Macros Preview */}
            {(() => {
              const g = parseFloat(servingGramsStr) || selectedFood.defaultServingG || 100;
              const preview = FoodApiService.calculateServingMacros(selectedFood, g);
              return (
                <div className="grid grid-cols-4 gap-1 p-2.5 bg-neutral-950 rounded-lg border border-neutral-800 text-center text-xs font-mono">
                  <div>
                    <span className="text-neutral-400 text-[9px] block">CALS</span>
                    <strong className="text-white">{preview.calories}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[9px] block">PROTEIN</span>
                    <strong className="text-white">{preview.proteinGrams}g</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[9px] block">CARBS</span>
                    <strong className="text-white">{preview.carbsGrams}g</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[9px] block">FATS</span>
                    <strong className="text-white">{preview.fatsGrams}g</strong>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={handleAddCalculatedFood}
              aria-label={`Log ${selectedFood.name} to today's food diary`}
              className="min-h-[48px] w-full py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Log Food to Today's Diary</span>
            </button>
          </div>
        )}

        {/* Collapsible Quick 12h Shift Meals (Progressive Disclosure) */}
        <div className="pt-2 border-t border-neutral-850">
          <button
            type="button"
            onClick={() => setShowFixedMeals(!showFixedMeals)}
            aria-expanded={showFixedMeals}
            aria-controls="fixed-shift-meals-panel"
            className="min-h-[44px] w-full flex items-center justify-between text-left text-xs font-bold text-neutral-200 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
          >
            <span>Quick 12h Shift Meals (1-Tap Presets)</span>
            {showFixedMeals ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
          </button>

          {showFixedMeals && (
            <div id="fixed-shift-meals-panel" className="mt-3 space-y-2 animate-fadeIn">
              {FIXED_SHIFT_MEALS.map((meal, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddFixedShiftMeal(meal)}
                  aria-label={`Quick add ${meal.title}: ${meal.proteinGrams}g Protein, ${meal.calories} kcal`}
                  className="min-h-[48px] w-full p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-left transition-all active:scale-[0.99] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{meal.title}</div>
                    <div className="text-[10px] text-neutral-400">{meal.desc}</div>
                  </div>
                  <div className="text-xs text-right text-neutral-300 shrink-0 font-mono">
                    +{meal.proteinGrams}g P • {meal.calories} kcal
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. PROGRESSIVE DISCLOSURE: Detailed Macro Breakdown */}
      <section 
        aria-label="Macronutrient Distribution"
        className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-4"
      >
        <button
          type="button"
          onClick={() => setShowMacroBreakdown(!showMacroBreakdown)}
          aria-expanded={showMacroBreakdown}
          aria-controls="detailed-macro-panel"
          className="min-h-[44px] w-full flex items-center justify-between text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white shrink-0">
              <PieChart className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Detailed Macro Breakdown
              </span>
              <span className="text-[11px] text-neutral-400 font-normal">
                Protein, Carbohydrates, and Dietary Fats
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
            <span>{showMacroBreakdown ? 'Hide' : 'Expand'}</span>
            {showMacroBreakdown ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
          </div>
        </button>

        {showMacroBreakdown && (
          <div id="detailed-macro-panel" className="space-y-3.5 pt-3 border-t border-neutral-850 animate-fadeIn font-mono">
            {/* Protein Card */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white uppercase block">Protein</span>
                  <span className="text-[10px] text-neutral-400">Preserves muscle during shift stress</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{currentProtein}</span>
                  <span className="text-[10px] text-neutral-400"> / {effectiveTargetProtein}g</span>
                </div>
              </div>
              <div 
                role="progressbar"
                aria-valuenow={Math.min(100, Math.round((currentProtein / effectiveTargetProtein) * 100))}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Protein consumed percentage"
                className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden"
              >
                <div 
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (currentProtein / effectiveTargetProtein) * 100)}%` }}
                />
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  onClick={() => handleAdjustMacro('proteinGrams', 5)}
                  aria-label="Quick adjust plus 5 grams of protein"
                  className="min-h-[36px] px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-750 text-white text-[10px] font-bold"
                >
                  +5g
                </button>
                <button
                  onClick={() => handleAdjustMacro('proteinGrams', 25)}
                  aria-label="Quick adjust plus 25 grams protein shake"
                  className="min-h-[36px] px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-750 text-white text-[10px] font-bold"
                >
                  +25g Shake
                </button>
              </div>
            </div>

            {/* Carbohydrates Card */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white uppercase block">Carbohydrates</span>
                  <span className="text-[10px] text-neutral-400">Replenishes muscle glycogen</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{currentCarbs}</span>
                  <span className="text-[10px] text-neutral-400"> / {effectiveTargetCarbs}g</span>
                </div>
              </div>
              <div 
                role="progressbar"
                aria-valuenow={Math.min(100, Math.round((currentCarbs / effectiveTargetCarbs) * 100))}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Carbohydrates consumed percentage"
                className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden"
              >
                <div 
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (currentCarbs / effectiveTargetCarbs) * 100)}%` }}
                />
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  onClick={() => handleAdjustMacro('carbsGrams', 10)}
                  aria-label="Quick adjust plus 10 grams of carbs"
                  className="min-h-[36px] px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-750 text-white text-[10px] font-bold"
                >
                  +10g
                </button>
                <button
                  onClick={() => handleAdjustMacro('carbsGrams', 30)}
                  aria-label="Quick adjust plus 30 grams oats"
                  className="min-h-[36px] px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-750 text-white text-[10px] font-bold"
                >
                  +30g Oats
                </button>
              </div>
            </div>

            {/* Fats Card */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white uppercase block">Fats</span>
                  <span className="text-[10px] text-neutral-400">Hormonal balance and satiety</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{currentFats}</span>
                  <span className="text-[10px] text-neutral-400"> / {effectiveTargetFats}g</span>
                </div>
              </div>
              <div 
                role="progressbar"
                aria-valuenow={Math.min(100, Math.round((currentFats / effectiveTargetFats) * 100))}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Fats consumed percentage"
                className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden"
              >
                <div 
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (currentFats / effectiveTargetFats) * 100)}%` }}
                />
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  onClick={() => handleAdjustMacro('fatsGrams', 5)}
                  aria-label="Quick adjust plus 5 grams of fats"
                  className="min-h-[36px] px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-750 text-white text-[10px] font-bold"
                >
                  +5g
                </button>
                <button
                  onClick={() => handleAdjustMacro('fatsGrams', 15)}
                  aria-label="Quick adjust plus 15 grams nuts"
                  className="min-h-[36px] px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-750 text-white text-[10px] font-bold"
                >
                  +15g Nuts
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. Today's Logged Items List & Empty State */}
      <section 
        aria-labelledby="food-diary-title"
        className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-3"
      >
        <h3 id="food-diary-title" className="text-xs font-bold text-white uppercase tracking-wider">
          Today's Food Diary
        </h3>

        {loggedFoods.length === 0 ? (
          /* Friendly Novice-Proof Empty State */
          <div className="p-6 text-center text-neutral-400 font-sans border border-dashed border-neutral-800 rounded-xl space-y-2">
            <Utensils className="w-8 h-8 mx-auto text-neutral-600" aria-hidden="true" />
            <p className="text-xs font-bold text-neutral-200">No Meals Logged Today</p>
            <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
              Use the <strong className="text-white">Database Search</strong> above or tap <strong className="text-white">Quick 12h Shift Meals</strong> to add what you ate.
            </p>
          </div>
        ) : (
          <div 
            role="list"
            aria-label="Logged Food Items"
            className="divide-y divide-neutral-850"
          >
            {loggedFoods.map((f) => (
              <div key={f.id} role="listitem" className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-bold block">{f.name}</span>
                  <span className="text-[10px] text-neutral-400">
                    {f.servingGrams > 1 ? `${f.servingGrams}g • ` : ''}{f.timeLogged}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-neutral-300">
                    {f.proteinGrams}g P • {f.calories} kcal
                  </span>
                  <button
                    onClick={() => handleRemoveLoggedFood(f.id)}
                    aria-label={`Remove ${f.name} from food diary`}
                    className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-neutral-400 hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
