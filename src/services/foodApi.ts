// OpenFoodFacts API & Shift Nutrition Database Service
import { LoggedFoodItem } from '../types';

export interface FoodSearchResult {
  id: string;
  name: string;
  brand: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  fatsPer100g: number;
  carbsPer100g: number;
  defaultServingG: number;
}

// Curated high-recomp sports nutrition items available offline or instant lookup
export const CURATED_SPORTS_FOODS: FoodSearchResult[] = [
  { id: 'curated_chicken', name: 'Cooked Chicken Breast (Skinless)', brand: 'Whole Food', caloriesPer100g: 165, proteinPer100g: 31, fatsPer100g: 3.6, carbsPer100g: 0, defaultServingG: 150 },
  { id: 'curated_whey', name: 'Whey Protein Isolate (1 Scoop)', brand: 'Optimum / Generic', caloriesPer100g: 375, proteinPer100g: 82, fatsPer100g: 1.5, carbsPer100g: 4.0, defaultServingG: 30 },
  { id: 'curated_rice', name: 'Cooked Jasmine / Basmati White Rice', brand: 'Generic', caloriesPer100g: 130, proteinPer100g: 2.7, fatsPer100g: 0.3, carbsPer100g: 28.2, defaultServingG: 200 },
  { id: 'curated_eggs', name: 'Whole Eggs (2 Large)', brand: 'Farm Fresh', caloriesPer100g: 143, proteinPer100g: 12.6, fatsPer100g: 9.5, carbsPer100g: 0.7, defaultServingG: 120 },
  { id: 'curated_yogurt', name: '0% Fat Greek Yogurt', brand: 'Fage / Generic', caloriesPer100g: 57, proteinPer100g: 10.3, fatsPer100g: 0.2, carbsPer100g: 3.6, defaultServingG: 200 },
  { id: 'curated_oats', name: 'Rolled Oats / Oatmeal', brand: 'Quaker / Generic', caloriesPer100g: 389, proteinPer100g: 16.9, fatsPer100g: 6.9, carbsPer100g: 66.3, defaultServingG: 75 },
  { id: 'curated_salmon', name: 'Atlantic Salmon Fillet', brand: 'Fresh Fish', caloriesPer100g: 208, proteinPer100g: 20.4, fatsPer100g: 13.4, carbsPer100g: 0, defaultServingG: 150 },
  { id: 'curated_beef', name: 'Extra Lean Minced Beef (5% Fat)', brand: 'Butcher / Generic', caloriesPer100g: 137, proteinPer100g: 21.4, fatsPer100g: 5.0, carbsPer100g: 0, defaultServingG: 150 },
  { id: 'curated_banana', name: 'Fresh Banana (Medium)', brand: 'Fresh Fruit', caloriesPer100g: 89, proteinPer100g: 1.1, fatsPer100g: 0.3, carbsPer100g: 22.8, defaultServingG: 120 },
  { id: 'curated_biltong', name: 'Beef Biltong / Jerky (Shift Snack)', brand: 'Generic', caloriesPer100g: 260, proteinPer100g: 50.0, fatsPer100g: 5.0, carbsPer100g: 2.0, defaultServingG: 50 },
];

// Fixed 12h Shift Meal Presets for quick 1-tap logging
export const FIXED_SHIFT_MEALS = [
  {
    title: '12h Shift Shaker: Whey Isolate + Banana',
    calories: 230,
    proteinGrams: 35,
    fatsGrams: 2,
    carbsGrams: 28,
    desc: 'Quick 30-second meal during busy ward/site shift rounds.',
  },
  {
    title: 'Shift Lunch: Chicken Breast (180g) + Jasmine Rice (200g)',
    calories: 550,
    proteinGrams: 58,
    fatsGrams: 7,
    carbsGrams: 58,
    desc: 'Pre-portioned shift container. Sustained low-GI carb delivery.',
  },
  {
    title: 'Post-Shift Recovery: 3 Eggs + Sourdough Toast',
    calories: 410,
    proteinGrams: 28,
    fatsGrams: 18,
    carbsGrams: 34,
    desc: 'Quick bioavailable protein before shift sleep.',
  },
];

export class FoodApiService {
  /**
   * Search OpenFoodFacts API with fallback to local curated sports nutrition database
   */
  static async searchFoods(query: string): Promise<FoodSearchResult[]> {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    // Filter curated list first for instant responsiveness
    const curatedMatches = CURATED_SPORTS_FOODS.filter(f => 
      f.name.toLowerCase().includes(trimmed) || f.brand.toLowerCase().includes(trimmed)
    );

    // Call OpenFoodFacts API
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(trimmed)}&search_simple=1&action=process&json=1&page_size=8`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const apiResults: FoodSearchResult[] = [];

        if (Array.isArray(data.products)) {
          data.products.forEach((p: any) => {
            const name = p.product_name || p.product_name_en;
            if (!name) return;

            const nutriments = p.nutriments || {};
            const kcal = Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0);
            const protein = Math.round((nutriments.proteins_100g || 0) * 10) / 10;
            const fat = Math.round((nutriments.fat_100g || 0) * 10) / 10;
            const carbs = Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10;

            if (kcal > 0 || protein > 0) {
              apiResults.push({
                id: `off_${p.code || Math.random().toString(36).slice(2)}`,
                name: name.slice(0, 45),
                brand: p.brands ? p.brands.split(',')[0].slice(0, 25) : 'OpenFoodFacts',
                caloriesPer100g: kcal,
                proteinPer100g: protein,
                fatsPer100g: fat,
                carbsPer100g: carbs,
                defaultServingG: 100,
              });
            }
          });
        }

        // Merge curated matches on top, then API results, removing duplicates
        const combined = [...curatedMatches];
        apiResults.forEach(ar => {
          if (!combined.some(c => c.name.toLowerCase() === ar.name.toLowerCase())) {
            combined.push(ar);
          }
        });
        return combined.slice(0, 10);
      }
    } catch (e) {
      // Offline fallback: returns curated matches
    }

    return curatedMatches;
  }

  /**
   * Calculate exact macros given food and portion size in grams
   */
  static calculateServingMacros(food: FoodSearchResult, grams: number): LoggedFoodItem {
    const multiplier = grams / 100;
    return {
      id: `food_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: food.name,
      brand: food.brand,
      servingGrams: grams,
      calories: Math.round(food.caloriesPer100g * multiplier),
      proteinGrams: Math.round(food.proteinPer100g * multiplier * 10) / 10,
      fatsGrams: Math.round(food.fatsPer100g * multiplier * 10) / 10,
      carbsGrams: Math.round(food.carbsPer100g * multiplier * 10) / 10,
      timeLogged: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
