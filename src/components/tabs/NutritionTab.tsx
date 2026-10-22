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
import { 
  RotateCcw,
  Search,
  Plus,
  Trash2,
  Utensils,
  Check,
  ChevronDown
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';
import { ContextualHelp } from '../ContextualHelp';

interface NutritionTabProps {
  todayStr: string;
  profile: UserProfile;
  customShifts: Record<string, ShiftDay>;
  nutrition: NutritionLog | null;
  hydration: HydrationLog | null;
  onSaveNutrition: (log: NutritionLog) => void;
  onSaveHydration: (log: HydrationLog) => void;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({
  todayStr,
  profile,
  customShifts,
  nutrition,
  hydration,
  onSaveNutrition,
  onSaveHydration,
}) => {
  const dayInfo = RotaEngine.getDayInfo(todayStr, profile, customShifts);
  const targetMacros = dayInfo.isShiftDay ? profile.shiftDayMacros : profile.offDayMacros;

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
      targetProtein: targetMacros.proteinGrams,
      targetFats: targetMacros.fatsGrams,
      targetCarbs: targetMacros.carbsGrams,
      targetCalories: targetMacros.calories,
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
      targetProtein: targetMacros.proteinGrams,
      targetFats: targetMacros.fatsGrams,
      targetCarbs: targetMacros.carbsGrams,
      targetCalories: targetMacros.calories,
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
      targetProtein: targetMacros.proteinGrams,
      targetFats: targetMacros.fatsGrams,
      targetCarbs: targetMacros.carbsGrams,
      targetCalories: targetMacros.calories,
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
      targetProtein: targetMacros.proteinGrams,
      targetFats: targetMacros.fatsGrams,
      targetCarbs: targetMacros.carbsGrams,
      targetCalories: targetMacros.calories,
      foods: loggedFoods,
    };
    onSaveNutrition(updated);
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

  const protStatus = getMacroStatus(currentProtein, targetMacros.proteinGrams);
  const fatsStatus = getMacroStatus(currentFats, targetMacros.fatsGrams);
  const carbsStatus = getMacroStatus(currentCarbs, targetMacros.carbsGrams);

  const waterPercent = Math.min(100, Math.round((currentWater / targetWater) * 100));

  return (
    <div className="space-y-3.5 pb-28 text-left animate-fadeIn">
      {/* Header Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm font-mono">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
                {dayInfo.isShiftDay ? '12H SHIFT MACROS' : 'OFF-DAY MACROS'}
              </span>
              <ContextualHelp
                title="Macro Cycling"
                content="Off-days feature higher carbohydrates to replenish glycogen for heavy lifting sessions. Shift days scale carbs down slightly while maintaining ~185g protein."
              />
            </div>
            <h2 className="text-sm font-bold text-white mt-1 uppercase tracking-tight">
              Macro & Calorie Fuel
            </h2>
          </div>

          <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-right">
            <span className="text-[9px] text-neutral-500 uppercase font-semibold">Calories</span>
            <div className="text-sm font-bold text-white">
              {currentCalories} <span className="text-[10px] text-neutral-500 font-normal">/ {targetMacros.calories}</span>
            </div>
          </div>
        </div>

        {/* Total Calories Bar */}
        <div className="mt-3">
          <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-850">
            <div 
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((currentCalories / targetMacros.calories) * 100))}%` }}
            />
          </div>
        </div>
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
                    className="w-full p-2 text-left hover:bg-neutral-900 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[200px]">{food.name}</div>
                      <div className="text-[10px] text-neutral-400">{food.brand} • {food.caloriesPer100g} kcal / 100g</div>
                    </div>
                    <div className="text-[10px] text-right text-neutral-300">
                      <div>P: {food.proteinPer100g}g</div>
                      <div className="text-neutral-500">C: {food.carbsPer100g}g</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Food Auto-Fill Form */}
        {selectedFood && (
          <div className="mt-3 p-3 rounded-lg bg-neutral-900 border border-neutral-750 space-y-2 animate-slideUp">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold text-white">{selectedFood.name}</div>
                <div className="text-[10px] text-neutral-400">{selectedFood.brand}</div>
              </div>
              <button
                onClick={() => setSelectedFood(null)}
                className="text-neutral-500 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1">
                <label className="text-[9px] text-neutral-400 uppercase block mb-0.5">Portion (Grams):</label>
                <input
                  type="number"
                  step="any"
                  value={servingGramsStr}
                  onChange={(e) => setServingGramsStr(e.target.value)}
                  placeholder="100"
                  className="w-full bg-black border border-neutral-750 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div className="flex gap-1 mt-3">
                {[50, 100, 150, 200].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setServingGramsStr(String(g))}
                    className={`px-1.5 py-1 rounded text-[10px] border ${
                      servingGramsStr === String(g) ? 'bg-white text-black border-white' : 'bg-black text-neutral-400 border-neutral-800'
                    }`}
                  >
                    {g}g
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-filled Macronutrient breakdown */}
            {(() => {
              const g = parseFloat(servingGramsStr) || 0;
              return (
                <div className="grid grid-cols-4 gap-1 p-2 rounded bg-black border border-neutral-800 text-center text-[10px]">
                  <div>
                    <div className="text-neutral-500 uppercase">Kcal</div>
                    <div className="font-bold text-white">{Math.round(selectedFood.caloriesPer100g * (g / 100))}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 uppercase">Prot</div>
                    <div className="font-bold text-white">{Math.round(selectedFood.proteinPer100g * (g / 100) * 10) / 10}g</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 uppercase">Fats</div>
                    <div className="font-bold text-white">{Math.round(selectedFood.fatsPer100g * (g / 100) * 10) / 10}g</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 uppercase">Carbs</div>
                    <div className="font-bold text-white">{Math.round(selectedFood.carbsPer100g * (g / 100) * 10) / 10}g</div>
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
            <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1.5">Today's Logged Items:</div>
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
              <span className="text-[10px] text-neutral-500"> / {targetMacros.proteinGrams}g</span>
            </div>
          </div>

          <div className="mt-2.5 w-full bg-neutral-900 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentProtein / targetMacros.proteinGrams) * 100)}%` }}
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
              onClick={() => handleAdjustMacro('proteinGrams', 10)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-white text-[10px] border border-neutral-750 font-bold"
            >
              +10g
            </button>
          </div>
        </div>

        {/* Carbohydrates */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <span>Carbohydrates</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
                {carbsStatus.label}
              </span>
            </div>

            <div className="text-right">
              <span className="text-base font-bold text-white">{currentCarbs}</span>
              <span className="text-[10px] text-neutral-500"> / {targetMacros.carbsGrams}g</span>
            </div>
          </div>

          <div className="mt-2.5 w-full bg-neutral-900 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentCarbs / targetMacros.carbsGrams) * 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-end gap-1">
            <button
              onClick={() => handleAdjustMacro('carbsGrams', -20)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white text-[10px] border border-neutral-800"
            >
              -20g
            </button>
            <button
              onClick={() => handleAdjustMacro('carbsGrams', 25)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-white text-[10px] border border-neutral-750 font-bold"
            >
              +25g
            </button>
          </div>
        </div>

        {/* Fats */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <span>Dietary Fats</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
                {fatsStatus.label}
              </span>
            </div>

            <div className="text-right">
              <span className="text-base font-bold text-white">{currentFats}</span>
              <span className="text-[10px] text-neutral-500"> / {targetMacros.fatsGrams}g</span>
            </div>
          </div>

          <div className="mt-2.5 w-full bg-neutral-900 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentFats / targetMacros.fatsGrams) * 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-end gap-1">
            <button
              onClick={() => handleAdjustMacro('fatsGrams', -10)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white text-[10px] border border-neutral-800"
            >
              -10g
            </button>
            <button
              onClick={() => handleAdjustMacro('fatsGrams', 10)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-white text-[10px] border border-neutral-750 font-bold"
            >
              +10g
            </button>
          </div>
        </div>
      </div>

      {/* Hydration Checklist */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm text-left font-mono">
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
