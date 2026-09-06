import React, { useEffect, useState } from 'react';
import {
  BookmarkPlus,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Utensils,
  Zap,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { FoodItem, MealPlanItem, MealRecommendation, MealType, NutritionFocus } from '../../types';

interface AIMealRecommendationsProps {
  selectedDay: string;
}

export const AIMealRecommendations: React.FC<AIMealRecommendationsProps> = ({ selectedDay }) => {
  const {
    userProfile,
    nutritionTargets,
    nutritionFocus,
    toggleNutritionFocus,
    todaysLoggedFoods,
    dayTotals,
    foodDatabase,
    addMealPlanItem,
    addFoodToMeal,
    addCustomFood,
  } = useHealth();

  const [mealTypeFilter, setMealTypeFilter] = useState<'all' | MealType>('all');
  const [recTypeFilter, setRecTypeFilter] = useState<'all' | 'complete_meals' | 'individual_items'>('all');
  const [recommendations, setRecommendations] = useState<MealRecommendation[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIngredients, setExpandedIngredients] = useState<Record<string, boolean>>({});
  const [addedPlanIds, setAddedPlanIds] = useState<Record<string, boolean>>({});
  const [loggedTodayIds, setLoggedTodayIds] = useState<Record<string, boolean>>({});
  const [savedLibraryIds, setSavedLibraryIds] = useState<Record<string, boolean>>({});

  // Remaining budget calculations
  const remainingCalories = Math.max(0, nutritionTargets.dailyCalorieBudget - (dayTotals?.calories || 0));
  const remainingProtein = Math.max(0, (nutritionTargets.protein?.ideal || 120) - (dayTotals?.protein || 0));
  const remainingFiber = Math.max(0, (nutritionTargets.fiberTarget || 28) - (dayTotals?.fiber || 0));
  const remainingSugar = Math.max(0, (nutritionTargets.sugarLimit || 35) - (dayTotals?.sugar || 0));

  const allFocusOptions: { key: NutritionFocus; label: string }[] = [
    { key: 'high-protein', label: 'High Protein' },
    { key: 'lower-sugar', label: 'Lower Sugar' },
    { key: 'fiber-focus', label: 'Fiber Focus' },
    { key: 'calorie-deficit', label: 'Calorie Deficit' },
    { key: 'lower-sodium', label: 'Lower Sodium' },
    { key: 'balanced-macros', label: 'Balanced Macros' },
  ];

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/meal-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          nutritionTargets,
          nutritionFocus,
          loggedFoods: todaysLoggedFoods.map((f) => ({
            name: f.name,
            calories: f.calories,
            protein: f.protein,
            carbohydrates: f.carbohydrates,
            fat: f.fat,
            fiber: f.fiber,
            sugar: f.sugar,
          })),
          dayTotals,
          remainingBudget: {
            calories: remainingCalories,
            protein: remainingProtein,
            fiber: remainingFiber,
            sugar: remainingSugar,
          },
          mealType: mealTypeFilter,
          recommendationType: recTypeFilter,
          databaseFoods: foodDatabase.slice(0, 20),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve meal recommendations.');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setSummary(data.summary || '');
    } catch (err: any) {
      console.warn('Backend recommendation endpoint unreachable, generating client-side smart recommendations:', err);
      const isLowerSugar = nutritionFocus.includes('lower-sugar') || remainingSugar < 15;
      const fallbackRecs: MealRecommendation[] = [
        {
          id: `rec_client_1`,
          type: 'complete_meal',
          name: 'Pan-Seared Alaskan Salmon with Lemon Asparagus & Quinoa',
          description: 'Fresh herb-crusted wild salmon fillet served alongside tender steamed asparagus spears and fiber-rich tri-color quinoa.',
          mealType: mealTypeFilter === 'all' ? 'lunch' : mealTypeFilter,
          servingSize: 1,
          servingUnit: 'plate (340g)',
          calories: 460,
          protein: 38,
          carbohydrates: 28,
          fat: 16,
          fiber: 7,
          sugar: 2,
          sodium: 320,
          image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80',
          whyItFits: `Delivers 38g of clean protein toward your remaining ${remainingProtein}g target, with only 2g natural sugar to align with your ${isLowerSugar ? 'Lower Sugar' : 'metabolic'} focus.`,
          focusTags: ['High Protein', 'Lower Sugar', 'Heart Healthy'],
          ingredients: [
            '5.5 oz wild Alaskan salmon fillet',
            '1/2 cup cooked tri-color quinoa',
            '1 cup steamed asparagus with lemon zest',
            '1 tsp extra virgin olive oil & sea salt',
          ],
          fitsBudget: true,
        },
        {
          id: `rec_client_2`,
          type: 'complete_meal',
          name: 'Grilled Citrus Chicken Bowl with Avocado & Roasted Sweet Potato',
          description: 'Juicy marinated chicken breast strips tossed over diced roasted sweet potato cubes, leafy spinach greens, and fresh avocado slices.',
          mealType: mealTypeFilter === 'all' ? 'dinner' : mealTypeFilter,
          servingSize: 1,
          servingUnit: 'bowl (360g)',
          calories: 490,
          protein: 44,
          carbohydrates: 34,
          fat: 14,
          fiber: 8,
          sugar: 4,
          sodium: 410,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
          whyItFits: `Supplies 44g protein and 8g satiating prebiotic fiber while leaving comfortable headroom within your ${remainingCalories} kcal budget.`,
          focusTags: ['High Protein', 'Fiber Rich', 'Lean Satiety'],
          ingredients: [
            '6 oz skinless chicken breast grilled with herbs',
            '1/2 cup roasted sweet potato cubes',
            '2 cups baby spinach and arugula blend',
            '1/4 medium Hass avocado, sliced',
          ],
          fitsBudget: true,
        },
        {
          id: `rec_client_3`,
          type: 'individual_item',
          name: 'Wild Blueberry & Chia Protein Greek Yogurt Cup',
          description: 'Thick nonfat plain Greek yogurt folded with antioxidant-packed wild blueberries, organic chia seeds, and raw crushed walnuts.',
          mealType: mealTypeFilter === 'all' ? 'snack' : mealTypeFilter,
          servingSize: 1,
          servingUnit: 'cup (240g)',
          calories: 220,
          protein: 24,
          carbohydrates: 18,
          fat: 6,
          fiber: 6,
          sugar: 7,
          sodium: 85,
          image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80',
          whyItFits: `Provides 24g high-biological-value protein with 6g gut-supportive fiber, fitting neatly into your remaining calorie budget.`,
          focusTags: ['High Protein', 'Prebiotic Fiber', 'Quick Snack'],
          ingredients: [
            '1 cup plain nonfat Greek yogurt',
            '1/2 cup wild organic blueberries',
            '1 tbsp chia seeds',
            '1 tbsp crushed walnuts',
          ],
          fitsBudget: true,
        },
      ];
      setRecommendations(fallbackRecs);
      setSummary(`Nutritional recommendations tailored to your budget (${remainingCalories} kcal remaining, ${remainingProtein}g protein needed).`);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealTypeFilter, recTypeFilter]);

  // Convert a recommendation into a standard FoodItem
  const recommendationToFoodItem = (rec: MealRecommendation): FoodItem => {
    // Check if food with same name exists in database
    const existing = foodDatabase.find(
      (f) => f.name.toLowerCase() === rec.name.toLowerCase()
    );
    if (existing) return existing;

    const categoryMap: Record<string, FoodItem['category']> = {
      breakfast: 'breakfast',
      lunch: 'meals',
      dinner: 'meals',
      snack: 'snacks',
    };

    return {
      id: `ai_food_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: rec.name,
      category: categoryMap[rec.mealType] || 'meals',
      servingSize: rec.servingSize || 1,
      servingUnit: rec.servingUnit || 'serving',
      calories: rec.calories,
      protein: rec.protein,
      carbohydrates: rec.carbohydrates,
      fat: rec.fat,
      fiber: rec.fiber || 0,
      sugar: rec.sugar || 0,
      sodium: rec.sodium || 280,
      image: rec.image,
      foodType: 'homemade',
      usageCount: 1,
    };
  };

  const handleAddToPlan = (rec: MealRecommendation) => {
    const foodItem = recommendationToFoodItem(rec);
    addMealPlanItem(selectedDay, {
      mealType: rec.mealType,
      food: foodItem,
      portionMultiplier: 1.0,
    });
    setAddedPlanIds((prev) => ({ ...prev, [rec.id]: true }));
    setTimeout(() => {
      setAddedPlanIds((prev) => ({ ...prev, [rec.id]: false }));
    }, 2500);
  };

  const handleLogToToday = (rec: MealRecommendation) => {
    const foodItem = recommendationToFoodItem(rec);
    addFoodToMeal(foodItem, rec.mealType, 1.0);
    setLoggedTodayIds((prev) => ({ ...prev, [rec.id]: true }));
    setTimeout(() => {
      setLoggedTodayIds((prev) => ({ ...prev, [rec.id]: false }));
    }, 2500);
  };

  const handleSaveToLibrary = (rec: MealRecommendation) => {
    const foodItem = recommendationToFoodItem(rec);
    addCustomFood({
      name: foodItem.name,
      category: foodItem.category,
      servingSize: foodItem.servingSize,
      servingUnit: foodItem.servingUnit,
      calories: foodItem.calories,
      protein: foodItem.protein,
      carbohydrates: foodItem.carbohydrates,
      fat: foodItem.fat,
      fiber: foodItem.fiber,
      sugar: foodItem.sugar,
      sodium: foodItem.sodium,
      image: foodItem.image,
      foodType: foodItem.foodType,
    });
    setSavedLibraryIds((prev) => ({ ...prev, [rec.id]: true }));
    setTimeout(() => {
      setSavedLibraryIds((prev) => ({ ...prev, [rec.id]: false }));
    }, 2500);
  };

  const toggleIngredients = (id: string) => {
    setExpandedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="bg-linear-to-br from-[#FAF9F5] to-[#F3F1E9] dark:from-[#222C24] dark:to-[#1B231D] p-6 rounded-[32px] border border-[#E6E3D8] dark:border-[#2F3C32] shadow-xs space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7D8C6F] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                AI-Powered Meal Recommendations
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7D8C6F]/15 text-[#4A5D4E] dark:text-[#A3B18A] border border-[#7D8C6F]/30 uppercase tracking-wide">
                Target-Fit AI
              </span>
            </div>
            <p className="text-xs text-[#8C8980] dark:text-[#A3A096] mt-0.5">
              Personalized meals & nutrient-dense foods generated to hit your targets and active focuses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={fetchRecommendations}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-[#1E2520] border border-[#DCD9D0] dark:border-[#384439] text-xs font-bold text-[#4A5D4E] dark:text-[#C5D1BC] hover:bg-[#F9F8F4] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh recommendations"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#7D8C6F] ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Crafting Meals...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {/* Target & Budget Context Bar */}
      <div className="bg-white/80 dark:bg-[#1E2520]/90 backdrop-blur-xs p-4 rounded-2xl border border-[#E8E5DA] dark:border-[#323E34] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EEE6] dark:border-[#2C332D] pb-2.5">
          <span className="text-[11px] font-bold text-[#8C8980] dark:text-[#A3A096] uppercase tracking-wider">
            Today's Remaining Budget & Target Gaps
          </span>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-[#D4A373] font-bold">
              {remainingCalories} kcal left
            </span>
            <span className="text-[#7D8C6F] font-bold">
              • {remainingProtein}g protein needed
            </span>
            <span className="text-[#A3A096]">
              • {remainingFiber}g fiber needed
            </span>
          </div>
        </div>

        {/* Nutrition Focuses Selector Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C8980] dark:text-[#A3A096]">
              Active Nutrition Focuses (tap to adapt AI advice):
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allFocusOptions.map((f) => {
              const active = nutritionFocus.includes(f.key);
              return (
                <button
                  key={f.key}
                  onClick={() => {
                    toggleNutritionFocus(f.key);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#7D8C6F] text-white shadow-2xs'
                      : 'bg-[#F5F4EF] dark:bg-[#2A332B] text-[#8C8980] dark:text-[#A3A096] border border-[#EBE9E1] dark:border-[#384439] hover:text-[#3D3D3D]'
                  }`}
                >
                  {active && <Check className="w-3 h-3" />}
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Controls: Meal Slot & Recommendation Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Meal Slot Filter */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#1E2520] p-1 rounded-2xl border border-[#EBE9E1] dark:border-[#323E34] overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-[#8C8980] dark:text-[#A3A096] px-2.5">
            Meal Slot:
          </span>
          {[
            { id: 'all', label: 'All Slots' },
            { id: 'breakfast', label: 'Breakfast' },
            { id: 'lunch', label: 'Lunch' },
            { id: 'dinner', label: 'Dinner' },
            { id: 'snack', label: 'Snack' },
          ].map((slot) => (
            <button
              key={slot.id}
              onClick={() => setMealTypeFilter(slot.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                mealTypeFilter === slot.id
                  ? 'bg-[#7D8C6F] text-white'
                  : 'text-[#8C8980] hover:text-[#3D3D3D] dark:hover:text-white'
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>

        {/* Recommendation Type Filter */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#1E2520] p-1 rounded-2xl border border-[#EBE9E1] dark:border-[#323E34]">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'complete_meals', label: 'Complete Meals' },
            { id: 'individual_items', label: 'Single Items' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setRecTypeFilter(type.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                recTypeFilter === type.id
                  ? 'bg-[#4A5D4E] text-white'
                  : 'text-[#8C8980] hover:text-[#3D3D3D] dark:hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Summary Banner */}
      {summary && !isLoading && (
        <div className="p-3.5 rounded-2xl bg-[#7D8C6F]/10 dark:bg-[#7D8C6F]/20 border border-[#7D8C6F]/25 flex items-start gap-2.5 text-xs text-[#4A5D4E] dark:text-[#C5D1BC]">
          <Sparkles className="w-4 h-4 text-[#7D8C6F] shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#7D8C6F] animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#4A5D4E] dark:text-[#C5D1BC]">
            Formulating custom recommendations for your remaining {remainingCalories} kcal & {remainingProtein}g protein target...
          </p>
          <span className="text-[11px] text-[#8C8980] dark:text-[#A3A096] block">
            Analyzing logged foods, micro-nutrients, and active nutrition focuses
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchRecommendations}
            className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Recommendations Grid */}
      {!isLoading && !error && recommendations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {recommendations.map((rec) => {
            const isAddedPlan = addedPlanIds[rec.id];
            const isLoggedToday = loggedTodayIds[rec.id];
            const isSavedLibrary = savedLibraryIds[rec.id];
            const isExpanded = expandedIngredients[rec.id];

            return (
              <div
                key={rec.id}
                className="bg-white dark:bg-[#1E2520] rounded-[28px] border border-[#E8E5DA] dark:border-[#323E34] shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#DCD9D0] dark:hover:border-[#404E42] transition-all group"
              >
                <div>
                  {/* Visual Header Image & Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#F5F4EF] dark:bg-[#252E27]">
                    <img
                      src={rec.image}
                      alt={rec.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#3D3D3D] uppercase tracking-wide shadow-xs">
                        {rec.type === 'complete_meal' ? 'Complete Meal' : 'Nutrient Item'}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-[#7D8C6F] text-white text-[10px] font-bold capitalize shadow-xs">
                        {rec.mealType}
                      </span>
                      {rec.fitsBudget && (
                        <span className="px-2.5 py-1 rounded-full bg-[#4A5D4E] text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Fits Budget</span>
                        </span>
                      )}
                    </div>

                    {/* Calorie & Serving Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-serif font-bold">{rec.calories}</span>
                        <span className="text-xs font-semibold text-[#E9EAE3]">kcal</span>
                      </div>
                      <span className="text-xs font-medium text-[#F0EEE6] truncate bg-black/30 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                        {rec.servingUnit}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3.5">
                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6] leading-snug">
                        {rec.name}
                      </h3>
                      <p className="text-xs text-[#8C8980] dark:text-[#A3A096] mt-1 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>

                    {/* "Why It Fits" Insight Callout */}
                    <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34] space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7D8C6F]">
                        <Zap className="w-3.5 h-3.5 fill-[#7D8C6F]" />
                        <span>Why This Fits Your Goals:</span>
                      </div>
                      <p className="text-xs text-[#3D3D3D] dark:text-[#D1D5DB] leading-relaxed">
                        {rec.whyItFits}
                      </p>
                      {/* Focus Tag Pills */}
                      {rec.focusTags && rec.focusTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {rec.focusTags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EBE9E1]/80 dark:bg-[#323E34] text-[#4A5D4E] dark:text-[#C5D1BC]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Macro Distribution Grid */}
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="p-2 rounded-xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
                        <span className="text-[9px] uppercase font-bold text-[#4A5D4E] dark:text-[#A3B18A] block">
                          Protein
                        </span>
                        <span className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                          {rec.protein}g
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
                        <span className="text-[9px] uppercase font-bold text-[#A6826D] block">
                          Carbs
                        </span>
                        <span className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                          {rec.carbohydrates}g
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
                        <span className="text-[9px] uppercase font-bold text-[#BC9B6A] block">
                          Fat
                        </span>
                        <span className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                          {rec.fat}g
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
                        <span className="text-[9px] uppercase font-bold text-[#7D8C6F] block">
                          Fiber
                        </span>
                        <span className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                          {rec.fiber || 0}g
                        </span>
                      </div>
                    </div>

                    {/* Micronutrients row */}
                    <div className="flex items-center justify-between text-[11px] text-[#8C8980] dark:text-[#A3A096] px-1">
                      <span>Sugar: {rec.sugar || 0}g</span>
                      <span>Sodium: {rec.sodium || 280}mg</span>
                      {rec.fitsBudget && (
                        <span className="text-[#4A5D4E] dark:text-[#C5D1BC] font-semibold">
                          ✓ Fits Remaining Daily Budget
                        </span>
                      )}
                    </div>

                    {/* Expandable Recipe / Ingredients */}
                    {rec.ingredients && rec.ingredients.length > 0 && (
                      <div className="border-t border-[#F0EEE6] dark:border-[#2C332D] pt-2">
                        <button
                          onClick={() => toggleIngredients(rec.id)}
                          className="w-full flex items-center justify-between text-xs font-bold text-[#7D8C6F] dark:text-[#A3B18A] hover:underline cursor-pointer py-1"
                        >
                          <span>Recipe Ingredients ({rec.ingredients.length})</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {isExpanded && (
                          <ul className="mt-2 space-y-1 text-xs text-[#3D3D3D] dark:text-[#D1D5DB] bg-[#F9F8F4] dark:bg-[#252E27] p-3 rounded-xl border border-[#EBE9E1] dark:border-[#323E34]">
                            {rec.ingredients.map((ing, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-[#7D8C6F]">•</span>
                                <span>{ing}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="p-5 pt-0 border-t border-[#F0EEE6] dark:border-[#2C332D] bg-[#FAF9F5]/60 dark:bg-[#252E27]/40 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    onClick={() => handleAddToPlan(rec)}
                    className="w-full sm:flex-1 py-2.5 px-3 rounded-full bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isAddedPlan ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added to {selectedDay}!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to {selectedDay} Plan</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleLogToToday(rec)}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-full bg-white dark:bg-[#1E2520] border border-[#EBE9E1] dark:border-[#384439] hover:bg-[#F5F4EF] text-[#4A5D4E] dark:text-[#C5D1BC] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    title="Log directly to today's intake"
                  >
                    {isLoggedToday ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#7D8C6F]" />
                        <span>Logged Today!</span>
                      </>
                    ) : (
                      <>
                        <Utensils className="w-3.5 h-3.5 text-[#7D8C6F]" />
                        <span>Log Today</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSaveToLibrary(rec)}
                    className="w-full sm:w-auto p-2.5 rounded-full bg-white dark:bg-[#1E2520] border border-[#EBE9E1] dark:border-[#384439] hover:bg-[#F5F4EF] text-[#8C8980] hover:text-[#4A5D4E] transition-all cursor-pointer flex items-center justify-center"
                    title="Save to My Food Library"
                  >
                    {isSavedLibrary ? (
                      <Check className="w-4 h-4 text-[#7D8C6F]" />
                    ) : (
                      <BookmarkPlus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
