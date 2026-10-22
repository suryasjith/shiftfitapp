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
  Check,
  ChevronDown,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';
import { ContextualHelp } from '../ContextualHelp';

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

  // Dynamic Macro Target Calculation based on Cardio & Steps Active Burn
  const dynamicMacros = ActivityEngine.calculateDynamicMacros(baseMacros, activeExpenditureCalories);
  const effectiveTargetCalories = dynamicMacros.dynamicCalories;
  const effectiveTargetProtein = dynamicMacros.dynamicProtein;
  const effectiveTargetCarbs = dynamicMacros.dynamicCarbs;
  const effectiveTargetFats = dynamicMacros.dynamicFats;

  // Active nutrition values
  const currentProtein = nutrition?.proteinGrams || 0;
  const currentFats = nutrition?.fatsGrams || 0;
  const currentCarbs = nutrition?.carbsGrams || 0;
  const currentCalories = nutrition?.calories || (currentProtein * 4 + currentFats * 9 + currentCarbs * 4);
  const loggedFoods = nutrition?.foods || [];

  // OpenFoodFacts search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [servingGramsStr, setServingGramsStr] = useState<string>('150');
  const [showFoodSearch, setShowFoodSearch] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

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
    setServingGramsStr(String(food.defaultServingG || 100));
    setSearchResults([]);
  };

  const handleAddCalculatedFood = () => {
    if (!selectedFood) return;
    soundManager.playTap();

    const g = parseFloat(servingGramsStr) || 100;
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

  // Start fresh - reset today's nutrition log
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

  const getMacroStatus = (current: number, target: number) => {
    const ratio = current / target;
    if (ratio >= 0.95 && ratio <= 1.08) {
      return { label: 'TARGET MET', isMet: true };
    }
    if (ratio < 0.95) {
      return { label: `${Math.round(target - current)}g REMAINING`, isMet: false };
    }
    return { label: `+${Math.round(current - target)}g EXCEEDED`, isMet: false };
  };

  const protStatus = getMacroStatus(currentProtein, effectiveTargetProtein);
  const fatsStatus = getMacroStatus(currentFats, effectiveTargetFats);
  const carbsStatus = getMacroStatus(currentCarbs, effectiveTargetCarbs);

  const waterPercent = Math.min(100, Math.round((currentWater / targetWater) * 100));

  return (
    <div className="space-y-3.5 pb-28 text-left animate-fadeIn">
      {/* Header Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm font-mono">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
                {dayInfo.isShiftDay ? '12H SHIFT MACROS' : 'OFF-DAY MACROS'}
              </span>
              {activeExpenditureCalories > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-black flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-black" />
                  +{activeExpenditureCalories} KCAL ACTIVE BURN
                </span>
              )}
              <ContextualHelp
                title="Dynamic Macro Target"
                content="Off-days feature higher carbohydrates to replenish glycogen for heavy lifting sessions. Active burn from steps & cardio dynamically increases your caloric allowance and carbohydrate allocation."
              />
            </div>
            <h2 className="text-sm font-bold text-white mt-1 uppercase tracking-tight">
              Macro & Calorie Fuel
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Start Fresh Button */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white text-xs font-mono transition-all active:scale-95"
              title="Reset all logged nutrition items for today"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
              <span>Start Fresh</span>
            </button>
            <ContextualHelp
              title="Start Fresh Nutrition"
              content="Clears all logged meals, foods, and calculated macros for today so you can restart your intake log."
            />

            <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-right ml-1">
              <span className="text-[9px] text-neutral-500 uppercase font-semibold">Calories</span>
              <div className="text-sm font-bold text-white">
                {currentCalories} <span className="text-[10px] text-neutral-500 font-normal">/ {effectiveTargetCalories}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Start Fresh Confirmation Overlay */}
        {showClearConfirm && (
          <div className="mt-3 p-3 rounded-lg bg-neutral-900 border border-neutral-700 space-y-2 animate-fadeIn font-mono">
            <div className="flex items-center gap-1.5 text-xs text-white font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-neutral-300" />
              <span>Reset today's nutrition log to start fresh?</span>
            </div>
            <p className="text-[10px] text-neutral-400 font-sans">
              This will remove all logged foods and zero out today's macros.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 rounded border border-neutral-750 text-neutral-300 text-xs hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartFreshNutrition}
                className="px-3 py-1 rounded bg-white text-black font-bold text-xs hover:bg-neutral-200"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        )}

        {/* Total Calories Bar */}
        <div className="mt-3">
          <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-850">
            <div 
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((currentCalories / effectiveTargetCalories) * 100))}%` }}
            />
          </div>
        </div>

        {activeExpenditureCalories > 0 && (
          <div className="mt-2 text-[10px] text-neutral-400 flex items-center justify-between">
            <span>Base: {baseMacros.calories} kcal</span>
            <span>+ Cardio/Steps: {activeExpenditureCalories} kcal</span>
            <span className="text-white font-bold">= {effectiveTargetCalories} kcal Dynamic Target</span>
          </div>
        )}
      </div>

      {/* OpenFoodFacts Food Search & Quick Log Section */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 shadow-sm font-mono">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-bold text-white uppercase">Food API Database (OpenFoodFacts)</span>
            <ContextualHelp
              title="OpenFoodFacts API"
              content="Type any food or brand to query live nutritional values. Selecting an item auto-calculates Calories, Protein, Fats, and Carbs for your chosen gram portion."
            />
          </div>
          <button
            onClick={() => setShowFoodSearch(!showFoodSearch)}
            className="text-[10px] text-neutral-400 hover:text-white underline"
          >
            {showFoodSearch ? 'Hide Search' : '+ Search Foods'}
          </button>
        </div>

        {/* Search input with live dropdown */}
        {(showFoodSearch || searchQuery) && (
          <div className="relative mt-2">
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-750 rounded-lg px-2.5 py-1.5">
              <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food (e.g. Chicken breast, Oats, Greek yogurt...)"
                className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
              {isSearching && <span className="text-[9px] text-neutral-500">Searching...</span>}
            </div>

            {/* Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-black border border-neutral-700 rounded-lg shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-neutral-850">
                {searchResults.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => handleSelectFoodResult(food)}
                    className="w-full text-left p-2 hover:bg-neutral-900 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[200px]">
                        {food.name}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {food.brand ? `${food.brand} • ` : ''}100g: {food.caloriesPer100g} kcal
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400 text-right">
                      {food.proteinPer100g}g P • {food.carbsPer100g}g C • {food.fatsPer100g}g F
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Portion Selector for selected food */}
        {selectedFood && (
          <div className="mt-3 p-3 rounded-lg bg-neutral-900 border border-neutral-750 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">{selectedFood.name}</span>
                <span className="text-[10px] text-neutral-400 block">{selectedFood.brand}</span>
              </div>
              <button 
                onClick={() => setSelectedFood(null)}
                className="text-[10px] text-neutral-500 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] text-neutral-400">Portion (grams):</label>
              <input
                type="number"
                step="5"
                value={servingGramsStr}
                onChange={(e) => setServingGramsStr(e.target.value)}
                className="w-24 bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs font-bold text-white text-center focus:outline-none focus:border-white"
              />
              <span className="text-[10px] text-neutral-400">g</span>
            </div>

            {/* Calculated Macros Preview */}
            {(() => {
              const g = parseFloat(servingGramsStr) || 0;
              const preview = FoodApiService.calculateServingMacros(selectedFood, g);
              return (
                <div className="grid grid-cols-4 gap-1 p-2 bg-neutral-950 rounded border border-neutral-800 text-center text-[10px]">
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
              className="w-full py-1.5 rounded bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all active:scale-95 flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log to Today's Macros</span>
            </button>
          </div>
        )}

        {/* Fixed 12h Shift Meals Presets */}
        <div className="mt-3 pt-2.5 border-t border-neutral-850">
          <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1.5 flex items-center justify-between">
            <span>Fixed 12h Shift Meals (1-Tap):</span>
            <ContextualHelp
              title="Fixed Shift Meals"
              content="Pre-configured sports nutrition meals common for 12h shift workers. Tap to add instantly without typing."
            />
          </div>
          <div className="space-y-1">
            {FIXED_SHIFT_MEALS.map((meal, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddFixedShiftMeal(meal)}
                className="w-full p-2 rounded bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-left transition-all active:scale-[0.99] flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] font-bold text-white">{meal.title}</div>
                  <div className="text-[9px] text-neutral-500">{meal.desc}</div>
                </div>
                <div className="text-[10px] text-right text-neutral-300 shrink-0 font-mono">
                  +{meal.proteinGrams}g P • {meal.calories} kcal
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Logged Foods List */}
        {loggedFoods.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-neutral-850">
            <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1.5 flex items-center justify-between">
              <span>Today's Logged Items:</span>
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-[10px] text-neutral-500 hover:text-white underline font-mono"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {loggedFoods.map((f) => (
                <div key={f.id} className="p-1.5 rounded bg-neutral-900 border border-neutral-850 flex items-center justify-between text-[10px]">
                  <div className="truncate max-w-[190px]">
                    <span className="text-white font-bold">{f.name}</span>
                    {f.servingGrams > 1 && <span className="text-neutral-500"> ({f.servingGrams}g)</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-300 font-mono">{f.proteinGrams}g P • {f.calories} kcal</span>
                    <button
                      onClick={() => handleRemoveLoggedFood(f.id)}
                      className="text-neutral-600 hover:text-white p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Granular Macro Cards */}
      <div className="space-y-2.5 font-mono">
        {/* Protein */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <span>Protein</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
                {protStatus.label}
              </span>
              <ContextualHelp
                title="Protein Goal (~2.3g/kg)"
                content="Protects lean contractile tissue and muscle protein synthesis during shift stress."
              />
            </div>

            <div className="text-right">
              <span className="text-base font-bold text-white">{currentProtein}</span>
              <span className="text-[10px] text-neutral-500"> / {effectiveTargetProtein}g</span>
            </div>
          </div>

          <div className="mt-2.5 w-full bg-neutral-900 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentProtein / effectiveTargetProtein) * 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-end gap-1">
            <button
              onClick={() => handleAdjustMacro('proteinGrams', -10)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white text-[10px] border border-neutral-800"
            >
              -10g
            </button>
            <button
              onClick={() => handleAdjustMacro('proteinGrams', -5)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white text-[10px] border border-neutral-800"
            >
              -5g
            </button>
            <button
              onClick={() => handleAdjustMacro('proteinGrams', 5)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-200 hover:text-white text-[10px] border border-neutral-750 font-bold"
            >
              +5g
            </button>
            <button
              onClick={() => handleAdjustMacro('proteinGrams', 25)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-white text-[10px] border border-neutral-750 font-bold"
            >
              +25g Shake
            </button>
          </div>
        </div>

        {/* Carbohydrates (Dynamic Target Allocation) */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
                <span>Carbohydrates</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
                  {carbsStatus.label}
                </span>
                <ContextualHelp
                  title="Dynamic Carbohydrate Cycling"
                  content="Replenishes muscle glycogen for lifting sessions. Excess energy burned during cardio and extra steps dynamically expands this target."
                />
              </div>
              {dynamicMacros.extraCarbsGrams > 0 && (
                <span className="text-[9px] text-neutral-400 block mt-0.5">
                  +{dynamicMacros.extraCarbsGrams}g active fuel from cardio/steps
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-base font-bold text-white">{currentCarbs}</span>
              <span className="text-[10px] text-neutral-500"> / {effectiveTargetCarbs}g</span>
            </div>
          </div>

          <div className="mt-2.5 w-full bg-neutral-900 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentCarbs / effectiveTargetCarbs) * 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-end gap-1">
            <button
              onClick={() => handleAdjustMacro('carbsGrams', -10)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white text-[10px] border border-neutral-800"
            >
              -10g
            </button>
            <button
              onClick={() => handleAdjustMacro('carbsGrams', -5)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white text-[10px] border border-neutral-800"
            >
              -5g
            </button>
            <button
              onClick={() => handleAdjustMacro('carbsGrams', 10)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-200 hover:text-white text-[10px] border border-neutral-750 font-bold"
            >
              +10g
            </button>
            <button
              onClick={() => handleAdjustMacro('carbsGrams', 30)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-white text-[10px] border border-neutral-750 font-bold"
            >
              +30g Oats
            </button>
          </div>
        </div>

        {/* Fats */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <span>Fats</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
                {fatsStatus.label}
              </span>
              <ContextualHelp
                title="Hormonal Balance Fats"
                content="Maintains androgen production and cellular integrity during shift fatigue."
              />
            </div>

            <div className="text-right">
              <span className="text-base font-bold text-white">{currentFats}</span>
              <span className="text-[10px] text-neutral-500"> / {effectiveTargetFats}g</span>
            </div>
          </div>

          <div className="mt-2.5 w-full bg-neutral-900 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentFats / effectiveTargetFats) * 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-end gap-1">
            <button
              onClick={() => handleAdjustMacro('fatsGrams', -5)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white text-[10px] border border-neutral-800"
            >
              -5g
            </button>
            <button
              onClick={() => handleAdjustMacro('fatsGrams', 5)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-200 hover:text-white text-[10px] border border-neutral-750 font-bold"
            >
              +5g
            </button>
            <button
              onClick={() => handleAdjustMacro('fatsGrams', 15)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-white text-[10px] border border-neutral-750 font-bold"
            >
              +15g Nuts
            </button>
          </div>
        </div>
      </div>

      {/* Hydration Checklist Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold text-white uppercase">Hydration Checklist</h3>
            <ContextualHelp
              title="12-Hour Hydration Strategy"
              content="Reaching your 3.8L checkpoint goals prevents afternoon cognitive fatigue and muscle cramping on shifts."
            />
          </div>

          <button
            onClick={handleResetWater}
            className="p-1 text-neutral-500 hover:text-white"
            title="Reset Water Log"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-black text-white">{currentWater}</span>
              <span className="text-xs text-neutral-500"> / {targetWater} ml</span>
            </div>
            <span className="text-xs font-bold text-white bg-black px-2 py-0.5 rounded border border-neutral-700">
              {waterPercent}%
            </span>
          </div>

          <div className="mt-2 w-full bg-black h-1.5 rounded-full overflow-hidden border border-neutral-800">
            <div 
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${waterPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-1.5 mt-3">
            {[
              { label: '+250ml', ml: 250 },
              { label: '+500ml', ml: 500 },
              { label: '+750ml', ml: 750 },
              { label: '+1000ml', ml: 1000 },
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={() => handleAddWater(btn.ml)}
                className="py-1.5 rounded bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-white text-[10px] font-bold active:scale-95 transition-all text-center"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
