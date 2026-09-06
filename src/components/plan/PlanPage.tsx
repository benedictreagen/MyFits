import React, { useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronRight,
  Copy,
  Download,
  Flame,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Utensils,
  Zap,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { FoodItem, MealPlanItem, MealType } from '../../types';
import { AddFoodModal } from '../AddFoodModal';
import { AIMealRecommendations } from './AIMealRecommendations';
import { getTranslation } from '../../utils/translations';

export const PlanPage: React.FC = () => {
  const {
    mealPlan,
    nutritionTargets,
    addMealPlanItem,
    removeMealPlanItem,
    copyPlanDayToLog,
    foodDatabase,
    language,
  } = useHealth();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalMealType, setAddModalMealType] = useState<MealType>('breakfast');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const activeDayPlan = mealPlan.find((d) => d.dayOfWeek === selectedDay) || {
    dayOfWeek: selectedDay,
    items: [],
  };

  // Calculate planned day totals
  const plannedTotals = activeDayPlan.items.reduce(
    (acc, item) => {
      const mult = item.portionMultiplier || 1;
      acc.calories += Math.round(item.food.calories * mult);
      acc.protein += Number((item.food.protein * mult).toFixed(1));
      acc.carbohydrates += Number((item.food.carbohydrates * mult).toFixed(1));
      acc.fat += Number((item.food.fat * mult).toFixed(1));
      acc.fiber += Number((item.food.fiber * mult).toFixed(1));
      return acc;
    },
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 }
  );

  const remainingCals = Math.max(0, nutritionTargets.dailyCalorieBudget - plannedTotals.calories);
  const remainingProtein = Math.max(0, nutritionTargets.protein.ideal - plannedTotals.protein);

  const handleCopyDayToToday = () => {
    copyPlanDayToLog(selectedDay);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const mealTypes: { type: MealType; label: string }[] = [
    { type: 'breakfast', label: getTranslation('breakfast', language) },
    { type: 'lunch', label: getTranslation('lunch', language) },
    { type: 'dinner', label: getTranslation('dinner', language) },
    { type: 'snack', label: getTranslation('snack', language) },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1E2520] p-6 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F4EF] dark:bg-[#2A332B] text-[#7D8C6F] flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif italic text-[#4A5D4E] dark:text-[#C5D1BC]">
              {getTranslation('weekly_meal_plan', language)}
            </h1>
          </div>
          <p className="text-xs text-[#8C8980] dark:text-[#A3A096] mt-1">
            Design balanced weekly meals and compare planned nutrition against your personalized targets
          </p>
        </div>

        <button
          onClick={handleCopyDayToToday}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          {copiedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied to Today's Food Log!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Log {selectedDay} Plan to Today</span>
            </>
          )}
        </button>
      </div>

      {/* Days of week selector pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {daysOfWeek.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#7D8C6F] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1E2520] text-[#3D3D3D] dark:text-[#E8EAE6] border border-[#EBE9E1] dark:border-[#2C332D] hover:bg-[#F9F8F4]'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* AI-POWERED MEAL RECOMMENDATIONS */}
      <AIMealRecommendations selectedDay={selectedDay} />

      {/* Planned Day Macro Summary */}
      <div className="bg-white dark:bg-[#1E2520] p-6 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#8C8980] dark:text-[#A3A096]">
            {selectedDay} Planned Macro Totals
          </h2>
          <span className="text-xs font-semibold text-[#8C8980] dark:text-[#A3A096]">
            Goal: {nutritionTargets.dailyCalorieBudget} kcal
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
            <span className="text-[10px] uppercase font-bold text-[#8C8980] dark:text-[#A3A096]">
              Calories
            </span>
            <p className="text-xl font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6] mt-0.5">
              {plannedTotals.calories}
            </p>
            <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096]">
              {plannedTotals.calories <= nutritionTargets.dailyCalorieBudget ? 'Within budget' : 'Over budget'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
            <span className="text-[10px] uppercase font-bold text-[#7D8C6F]">Protein</span>
            <p className="text-xl font-serif font-bold text-[#7D8C6F] mt-0.5">
              {Math.round(plannedTotals.protein)}g
            </p>
            <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096]">
              Target: {nutritionTargets.protein.ideal}g
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
            <span className="text-[10px] uppercase font-bold text-[#D4A373]">Carbs</span>
            <p className="text-xl font-serif font-bold text-[#D4A373] mt-0.5">
              {Math.round(plannedTotals.carbohydrates)}g
            </p>
            <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096]">
              Target: {nutritionTargets.carbohydrates.ideal}g
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
            <span className="text-[10px] uppercase font-bold text-[#A3B18A]">Fat</span>
            <p className="text-xl font-serif font-bold text-[#A3B18A] mt-0.5">
              {Math.round(plannedTotals.fat)}g
            </p>
            <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096]">
              Target: {nutritionTargets.fat.ideal}g
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34] col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-[#7D8C6F]">Fiber</span>
            <p className="text-xl font-serif font-bold text-[#7D8C6F] mt-0.5">
              {Math.round(plannedTotals.fiber)}g
            </p>
            <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096]">
              Target: {nutritionTargets.fiberTarget}g
            </span>
          </div>
        </div>
      </div>

      {/* Planned Meals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mealTypes.map((mt) => {
          const items = activeDayPlan.items.filter((it) => it.mealType === mt.type);
          const mealCals = items.reduce(
            (sum, it) => sum + Math.round(it.food.calories * (it.portionMultiplier || 1)),
            0
          );

          return (
            <div
              key={mt.type}
              className="bg-white dark:bg-[#1E2520] rounded-[28px] p-5 border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs flex flex-col justify-between space-y-4 transition-colors"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EEE6] dark:border-[#2C332D]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">{mt.label}</h3>
                  <span className="text-xs font-bold text-[#4A5D4E] dark:text-[#C5D1BC] bg-[#F5F4EF] dark:bg-[#2A332B] px-2.5 py-0.5 rounded-full border border-[#EBE9E1] dark:border-[#384439]">
                    {mealCals} kcal
                  </span>
                </div>

                <button
                  onClick={() => {
                    setAddModalMealType(mt.type);
                    setIsAddModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F5F4EF] dark:bg-[#2A332B] hover:bg-[#EBE9E1] text-[#4A5D4E] dark:text-[#C5D1BC] text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#7D8C6F]" />
                  <span>Add Item</span>
                </button>
              </div>

              {/* Items in Meal Plan */}
              <div className="space-y-2.5 min-h-[90px]">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#F0EEE6] dark:border-[#323E34] flex items-center gap-3"
                    >
                      <img
                        src={item.food.image}
                        alt={item.food.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#EBE9E1] dark:border-[#384439]"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6] truncate">
                          {item.food.name}
                        </h4>
                        <span className="text-[11px] text-[#8C8980] dark:text-[#A3A096] block truncate">
                          {item.food.servingUnit} ({item.portionMultiplier}x)
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-[#8C8980] dark:text-[#A3A096] mt-1 font-semibold">
                          <strong className="text-[#4A5D4E] dark:text-[#C5D1BC]">
                            {Math.round(item.food.calories * (item.portionMultiplier || 1))} kcal
                          </strong>
                          <span>• P: {Math.round(item.food.protein * (item.portionMultiplier || 1))}g</span>
                          <span>• C: {Math.round(item.food.carbohydrates * (item.portionMultiplier || 1))}g</span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeMealPlanItem(selectedDay, item.id)}
                        className="p-1.5 text-[#8C8980] hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Remove from plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-[#8C8980] dark:text-[#A3A096] text-xs border border-dashed border-[#EBE9E1] dark:border-[#323E34] rounded-2xl bg-[#F9F8F4]/50 dark:bg-[#252E27]/30">
                    No {mt.label.toLowerCase()} planned yet
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Food to Plan Modal */}
      {isAddModalOpen && (
        <AddFoodModal
          mealType={addModalMealType}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};
