import React, { useState, useEffect } from 'react';
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
  PieChart,
  Info
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
  const dayInfo = RotaEngine.getDayInfo(todayStr, profile, customShifts);
  const baseMacros = dayInfo.isShiftDay ? profile.shiftDayMacros : profile.offDayMacros;

  // Dynamic Macro Target Calculation
  const dynamicMacros = ActivityEngine.calculateDynamicMacros(baseMacros, activeExpenditureCalories);
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

  // Debounced search
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

  const handleSelectFoodResult = (food: FoodSearchResult) => {
    soundManager.playTap();
    setSelectedFood(food);
    setServingGramsStr(''); // empty by default
    setSearchResults([]);
  };

  const handleAddCalculatedFood = () => {
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
  };

  const handleAddFixedShiftMeal = (meal: typeof FIXED_SHIFT_MEALS[0]) => {
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
  };

  const handleRemoveLoggedFood = (id: string) => {
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
  };

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
      targetProtein: effectiveTargetProtein,
      targetFats: effectiveTargetFats,
      targetCarbs: effectiveTargetCarbs,
      targetCalories: effectiveTargetCalories,
      foods: loggedFoods,
    };
    onSaveNutrition(updated);
  };

  const handleStartFreshNutrition = () => {
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
  };

  // Water handlers
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

  const remainingCalories = Math.max(0, effectiveTargetCalories - currentCalories);
  const caloriesPercent = Math.min(100, Math.round((currentCalories / effectiveTargetCalories) * 100));
  const waterPercent = Math.min(100, Math.round((currentWater / targetWater) * 100));

  return (
    <div className="space-y-4 pb-28 text-left animate-fadeIn font-sans">
      {/* 1. Primary Header Card: Calories & Fuel Overview */}
      <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-300">
                {dayInfo.isShiftDay ? '12H SHIFT MACROS' : 'OFF-DAY MACROS'}
              </span>
              {activeExpenditureCalories > 0 && (
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white text-black flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-black" />
                  +{activeExpenditureCalories} KCAL EXPENDED
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Daily Fuel & Calories
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Target: <strong className="text-white font-mono">{effectiveTargetCalories} kcal</strong> • Consumed: <strong className="text-white font-mono">{currentCalories} kcal</strong>
            </p>
          </div>

          {/* Start Fresh Button */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white text-xs font-medium transition-all active:scale-95 shrink-0"
            title="Clear all logged meals for today"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
            <span>Start Fresh</span>
          </button>
        </div>

        {/* Start Fresh Confirmation Dialog */}
        {showClearConfirm && (
          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-700 space-y-2 animate-fadeIn font-sans">
            <div className="flex items-center gap-2 text-xs text-white font-bold">
              <AlertCircle className="w-4 h-4 text-neutral-300" />
              <span>Clear today's logged meals and reset macros?</span>
            </div>
            <p className="text-xs text-neutral-400">
              This will remove all logged foods and reset calorie intake to zero.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-neutral-750 text-neutral-300 text-xs hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartFreshNutrition}
                className="px-3 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-neutral-200"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        )}

        {/* Big Calories Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-neutral-400 font-medium">
              {remainingCalories > 0 ? (
                <><strong>{remainingCalories} kcal</strong> remaining to reach goal</>
              ) : (
                <strong className="text-white">Daily Calorie Target Met ✓</strong>
              )}
            </span>
            <span className="text-white font-mono font-bold">{caloriesPercent}%</span>
          </div>
          <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-neutral-850">
            <div 
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{ width: `${caloriesPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Hydration Checklist Card */}
      <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white shrink-0">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-bold">
                Hydration Tracker
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">
                {(currentWater / 1000).toFixed(1)}L <span className="text-xs text-neutral-500 font-normal">/ {(targetWater / 1000).toFixed(1)}L</span>
              </h3>
            </div>
          </div>

          <button
            onClick={handleResetWater}
            className="text-xs text-neutral-500 hover:text-neutral-300 flex items-center gap-1 font-mono p-1"
            title="Reset today's water"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Water Progress Bar */}
        <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-850">
          <div 
            className="bg-white h-full rounded-full transition-all duration-300"
            style={{ width: `${waterPercent}%` }}
          />
        </div>

        {/* 1-Tap Quick Addition Buttons */}
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
              className="py-2 px-1 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-750 text-white font-bold text-xs active:scale-95 transition-all text-center"
            >
              <div>{btn.label}</div>
              <span className="text-[9px] text-neutral-500 font-normal block">{btn.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. OpenFoodFacts Search & Quick Food Logger */}
      <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white shrink-0">
            <Utensils className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-bold">
              Database Search
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Log Meal or Food
            </h3>
          </div>
        </div>

        {/* Search Input Field (Novice-Proof Placeholder) */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food (e.g. Chicken breast, Oats, Greek yogurt...)"
              className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
            {isSearching && <span className="text-[10px] text-neutral-500 font-mono">Searching...</span>}
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-black border border-neutral-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-neutral-850">
              {searchResults.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => handleSelectFoodResult(food)}
                  className="w-full text-left p-3 hover:bg-neutral-900 transition-colors flex items-center justify-between"
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
                className="text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-300">Portion Size:</label>
              <input
                type="number"
                step="5"
                min="1"
                max="2000"
                value={servingGramsStr}
                onChange={(e) => setServingGramsStr(e.target.value)}
                placeholder="Grams (e.g. 150)"
                className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white placeholder-neutral-600 focus:outline-none focus:border-white text-center"
              />
              <span className="text-xs text-neutral-400 font-mono">grams</span>
            </div>

            {/* Calculated Macros Preview */}
            {(() => {
              const g = parseFloat(servingGramsStr) || selectedFood.defaultServingG || 100;
              const preview = FoodApiService.calculateServingMacros(selectedFood, g);
              return (
                <div className="grid grid-cols-4 gap-1 p-2.5 bg-neutral-950 rounded-lg border border-neutral-800 text-center text-xs font-mono">
                  <div>
                    <span className="text-neutral-500 text-[9px] block">CALS</span>
                    <strong className="text-white">{preview.calories}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[9px] block">PROTEIN</span>
                    <strong className="text-white">{preview.proteinGrams}g</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[9px] block">CARBS</span>
                    <strong className="text-white">{preview.carbsGrams}g</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[9px] block">FATS</span>
                    <strong className="text-white">{preview.fatsGrams}g</strong>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={handleAddCalculatedFood}
              className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Food to Today's Diary</span>
            </button>
          </div>
        )}

        {/* Collapsible Quick 12h Shift Meals (Progressive Disclosure) */}
        <div className="pt-2 border-t border-neutral-850">
          <button
            type="button"
            onClick={() => setShowFixedMeals(!showFixedMeals)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-neutral-300 hover:text-white"
          >
            <span>Quick 12h Shift Meals (1-Tap Presets)</span>
            {showFixedMeals ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFixedMeals && (
            <div className="mt-3 space-y-2 animate-fadeIn">
              {FIXED_SHIFT_MEALS.map((meal, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddFixedShiftMeal(meal)}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-left transition-all active:scale-[0.99] flex items-center justify-between"
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
      </div>

      {/* 4. PROGRESSIVE DISCLOSURE: Detailed Macro Breakdown (Collapsed by Default) */}
      <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-4">
        <button
          type="button"
          onClick={() => setShowMacroBreakdown(!showMacroBreakdown)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white shrink-0">
              <PieChart className="w-4 h-4 text-white" />
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
            {showMacroBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showMacroBreakdown && (
          <div className="space-y-3.5 pt-3 border-t border-neutral-850 animate-fadeIn font-mono">
            {/* Protein Card */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white uppercase block">Protein</span>
                  <span className="text-[10px] text-neutral-400">Preserves muscle during shift stress</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{currentProtein}</span>
                  <span className="text-[10px] text-neutral-500"> / {effectiveTargetProtein}g</span>
                </div>
              </div>
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (currentProtein / effectiveTargetProtein) * 100)}%` }}
                />
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  onClick={() => handleAdjustMacro('proteinGrams', 5)}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-750 text-white text-[10px] font-bold"
                >
                  +5g
                </button>
                <button
                  onClick={() => handleAdjustMacro('proteinGrams', 25)}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-750 text-white text-[10px] font-bold"
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
                  <span className="text-[10px] text-neutral-500"> / {effectiveTargetCarbs}g</span>
                </div>
              </div>
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (currentCarbs / effectiveTargetCarbs) * 100)}%` }}
                />
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  onClick={() => handleAdjustMacro('carbsGrams', 10)}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-750 text-white text-[10px] font-bold"
                >
                  +10g
                </button>
                <button
                  onClick={() => handleAdjustMacro('carbsGrams', 30)}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-750 text-white text-[10px] font-bold"
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
                  <span className="text-[10px] text-neutral-500"> / {effectiveTargetFats}g</span>
                </div>
              </div>
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (currentFats / effectiveTargetFats) * 100)}%` }}
                />
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  onClick={() => handleAdjustMacro('fatsGrams', 5)}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-750 text-white text-[10px] font-bold"
                >
                  +5g
                </button>
                <button
                  onClick={() => handleAdjustMacro('fatsGrams', 15)}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-750 text-white text-[10px] font-bold"
                >
                  +15g Nuts
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Today's Logged Items List & Empty State */}
      <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Today's Food Diary
        </h3>

        {loggedFoods.length === 0 ? (
          /* Friendly Novice-Proof Empty State */
          <div className="p-6 text-center text-neutral-500 font-sans border border-dashed border-neutral-800 rounded-xl space-y-2">
            <Utensils className="w-8 h-8 mx-auto text-neutral-700" />
            <p className="text-xs font-bold text-neutral-300">No Meals Logged Today</p>
            <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
              Use the <strong className="text-white">Database Search</strong> above or tap <strong className="text-white">Quick 12h Shift Meals</strong> to add what you ate.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-850">
            {loggedFoods.map((f) => (
              <div key={f.id} className="py-2.5 flex items-center justify-between text-xs">
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
                    className="p-1 rounded text-neutral-600 hover:text-white transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
