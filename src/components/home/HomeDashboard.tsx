import React, { useState } from 'react';
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplet,
  Flame,
  Footprints,
  Info,
  Minus,
  Pencil,
  Plus,
  Scale,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  User,
  Utensils,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHealth } from '../../context/HealthContext';
import { LoggedFood, MealType, NutritionFocus } from '../../types';
import { AddFoodModal } from '../AddFoodModal';
import { formatNum } from '../../utils/calculations';
import { getTranslation } from '../../utils/translations';
import { PlateVisualization } from '../common/PlateVisualization';
import { MacroDistributionBar } from '../common/MacroDistributionBar';

export const HomeDashboard: React.FC = () => {
  const {
    selectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    personalInfo,
    weightGoal,
    nutritionTargets,
    todaysLoggedFoods,
    dayTotals,
    nutritionFocus,
    toggleNutritionFocus,
    removeLoggedFood,
    currentWaterMl,
    addWater,
    setWater,
    fastingSchedule,
    toggleFastingState,
    setActiveTab,
    quickAddModalMeal,
    setQuickAddModalMeal,
    aiInsights,
    streaks,
    currentSteps,
    addSteps,
    workouts,
    language,
  } = useHealth();

  // Weight summary calculation
  const totalWeightToLoseOrGain = Math.abs(weightGoal.startingWeightKg - weightGoal.goalWeightKg);
  const weightProgressMade = Math.abs(weightGoal.startingWeightKg - personalInfo.currentWeightKg);
  const weightProgressPct = Math.min(
    100,
    Math.max(0, Math.round((weightProgressMade / (totalWeightToLoseOrGain || 1)) * 100))
  );
  const remainingWeightKg = Math.abs(personalInfo.currentWeightKg - weightGoal.goalWeightKg).toFixed(1);
  const weightLostSoFar = (weightGoal.startingWeightKg - personalInfo.currentWeightKg).toFixed(1);

  // Calorie calculations
  const calorieBudget = nutritionTargets.dailyCalorieBudget;
  const consumedCal = dayTotals.calories;
  const remainingCal = Math.max(0, calorieBudget - consumedCal);
  const pctConsumed = Math.min(100, Math.round((consumedCal / (calorieBudget || 1)) * 100));

  // Activity calories burned today
  const activeCaloriesBurned = workouts
    .filter((w) => w.date === selectedDate)
    .reduce((sum, w) => sum + w.activeCalories, 0) + Math.round(currentSteps * 0.04);

  // Active workout minutes
  const activeMinutesToday = workouts
    .filter((w) => w.date === selectedDate)
    .reduce((sum, w) => sum + w.durationMinutes, 0);

  // Meal groupings
  const mealSections: { type: MealType; label: string; timeHint: string; cals: number }[] = [
    {
      type: 'breakfast',
      label: getTranslation('breakfast', language),
      timeHint: 'Morning nourishment',
      cals: dayTotals.breakfastCal,
    },
    {
      type: 'lunch',
      label: getTranslation('lunch', language),
      timeHint: 'Midday sustained energy',
      cals: dayTotals.lunchCal,
    },
    {
      type: 'dinner',
      label: getTranslation('dinner', language),
      timeHint: 'Evening recovery',
      cals: dayTotals.dinnerCal,
    },
    {
      type: 'snack',
      label: getTranslation('snack', language),
      timeHint: 'Smart fuel & bites',
      cals: dayTotals.snackCal,
    },
  ];

  // Nutrition focus options
  const FOCUS_OPTIONS: { id: NutritionFocus; label: string }[] = [
    { id: 'calorie-deficit', label: 'Calorie Deficit' },
    { id: 'high-protein', label: 'High Protein' },
    { id: 'fiber-focus', label: 'Fiber Focus' },
    { id: 'lower-sugar', label: 'Lower Sugar' },
    { id: 'lower-sodium', label: 'Lower Sodium' },
    { id: 'balanced-macros', label: 'Balanced Macros' },
    { id: 'hydration-focus', label: 'Hydration Focus' },
  ];

  const primaryStreak = streaks.find((s) => s.key === 'foodLogging')?.currentStreak || 12;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* 1. USER PROFILE & STATUS HEADER */}
      <section className="bg-white dark:bg-[#1E2520] p-5 sm:p-6 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          {/* Profile Photo */}
          <div
            onClick={() => setActiveTab('profile')}
            className="relative cursor-pointer group shrink-0"
            title="View Profile"
          >
            {personalInfo.profilePhoto ? (
              <img
                src={personalInfo.profilePhoto}
                alt={personalInfo.name || 'User Profile'}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 border-[#7D8C6F] shadow-sm group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#FAF9F5] dark:bg-[#2A332B] border-2 border-[#7D8C6F] flex items-center justify-center text-[#7D8C6F] font-bold text-xl shadow-sm">
                <User className="w-7 h-7" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#7D8C6F] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
              ★
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                {personalInfo.name || 'FitTrack Member'}
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5F4EF] dark:bg-[#2A332B] text-[#7D8C6F] dark:text-[#9FB191] border border-[#EBE9E1] dark:border-[#384439] capitalize">
                {nutritionTargets.goalMode || 'cutting'} mode
              </span>
            </div>

            <p className="text-xs text-[#8C8980] dark:text-[#A3A096] mt-0.5">
              Goal: {weightGoal.goalWeightKg} kg • {personalInfo.currentWeightKg} kg current •{' '}
              <span className="text-[#7D8C6F] dark:text-[#9FB191] font-semibold">
                {primaryStreak} Day Streak 🔥
              </span>
            </p>
          </div>
        </div>

        {/* Date Navigator Bar */}
        <div className="flex items-center gap-2 bg-[#F9F8F4] dark:bg-[#252E27] p-1.5 rounded-2xl border border-[#ECEAE2] dark:border-[#323E34] self-start md:self-auto">
          <button
            onClick={goToPreviousDay}
            className="p-1.5 rounded-xl hover:bg-[#EBE9E1] dark:hover:bg-[#344035] text-[#3D3D3D] dark:text-[#E8EAE6] transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            <Calendar className="w-3.5 h-3.5 text-[#7D8C6F]" />
            <span className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {selectedDate}
            </span>
          </div>
          <button
            onClick={goToNextDay}
            className="p-1.5 rounded-xl hover:bg-[#EBE9E1] dark:hover:bg-[#344035] text-[#3D3D3D] dark:text-[#E8EAE6] transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-[10px] font-bold rounded-xl bg-white dark:bg-[#1E2520] text-[#7D8C6F] dark:text-[#9FB191] border border-[#EBE9E1] dark:border-[#384439] shadow-xs cursor-pointer hover:bg-[#FAF9F5]"
          >
            Today
          </button>
        </div>
      </section>

      {/* 2. TODAY'S HEALTH SNAPSHOT */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Calories Snapshot */}
        <div className="bg-white dark:bg-[#1E2520] p-4 rounded-[28px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-[#8C8980] dark:text-[#A3A096] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {getTranslation('calories', language)}
            </span>
            <Flame className="w-4 h-4 text-[#D4A373]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {formatNum(consumedCal)}
            </div>
            <p className="text-[11px] text-[#8C8980] dark:text-[#A3A096]">
              of {formatNum(calorieBudget)} kcal ({pctConsumed}%)
            </p>
          </div>
          <div className="h-1.5 w-full bg-[#F0EEE6] dark:bg-[#2B352E] rounded-full overflow-hidden mt-3">
            <div
              style={{ width: `${pctConsumed}%` }}
              className="h-full bg-[#D4A373] rounded-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Protein Snapshot */}
        <div className="bg-white dark:bg-[#1E2520] p-4 rounded-[28px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-[#8C8980] dark:text-[#A3A096] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {getTranslation('protein', language)}
            </span>
            <Zap className="w-4 h-4 text-[#7D8C6F]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {dayTotals.protein}g
            </div>
            <p className="text-[11px] text-[#8C8980] dark:text-[#A3A096]">
              of {nutritionTargets.protein.ideal}g target
            </p>
          </div>
          <div className="h-1.5 w-full bg-[#F0EEE6] dark:bg-[#2B352E] rounded-full overflow-hidden mt-3">
            <div
              style={{
                width: `${Math.min(100, Math.round((dayTotals.protein / (nutritionTargets.protein.ideal || 1)) * 100))}%`,
              }}
              className="h-full bg-[#7D8C6F] rounded-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Hydration Snapshot */}
        <div className="bg-white dark:bg-[#1E2520] p-4 rounded-[28px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-[#8C8980] dark:text-[#A3A096] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {getTranslation('water', language)}
            </span>
            <Droplet className="w-4 h-4 text-[#79A7D3]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {(currentWaterMl / 1000).toFixed(1)}L
            </div>
            <p className="text-[11px] text-[#8C8980] dark:text-[#A3A096]">
              of {(nutritionTargets.waterGoalMl / 1000).toFixed(1)}L goal
            </p>
          </div>
          <div className="h-1.5 w-full bg-[#F0EEE6] dark:bg-[#2B352E] rounded-full overflow-hidden mt-3">
            <div
              style={{
                width: `${Math.min(100, Math.round((currentWaterMl / (nutritionTargets.waterGoalMl || 1)) * 100))}%`,
              }}
              className="h-full bg-[#79A7D3] rounded-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Steps Snapshot */}
        <div className="bg-white dark:bg-[#1E2520] p-4 rounded-[28px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-[#8C8980] dark:text-[#A3A096] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {getTranslation('steps', language)}
            </span>
            <Footprints className="w-4 h-4 text-[#A3B18A]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {formatNum(currentSteps)}
            </div>
            <p className="text-[11px] text-[#8C8980] dark:text-[#A3A096]">
              of {formatNum(nutritionTargets.stepGoal)} steps
            </p>
          </div>
          <div className="h-1.5 w-full bg-[#F0EEE6] dark:bg-[#2B352E] rounded-full overflow-hidden mt-3">
            <div
              style={{
                width: `${Math.min(100, Math.round((currentSteps / (nutritionTargets.stepGoal || 1)) * 100))}%`,
              }}
              className="h-full bg-[#A3B18A] rounded-full transition-all duration-300"
            />
          </div>
        </div>
      </section>

      {/* 3. AI HEALTH COACH */}
      <section className="bg-linear-to-r from-[#4A5D4E] to-[#3B4C3F] dark:from-[#253328] dark:to-[#1B261D] p-6 rounded-[32px] text-white shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D8E2DC]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#D8E2DC]">
                {getTranslation('ai_health_coach', language)}
              </h3>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-[#E9EAE3] border border-white/10">
              Live Adaptive Feedback
            </span>
          </div>
          <p className="text-sm leading-relaxed italic text-[#F9F8F4]/90 pt-1 font-serif">
            "{aiInsights && aiInsights.length > 0 ? aiInsights[0] : 'Great nutritional rhythm today! Keep hydration high and prioritize wholesome protein for recovery.'}"
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-[#D8E2DC] pt-2 border-t border-white/10">
          <span>Based on daily logs & metabolic energy targets</span>
          <button
            onClick={() => setActiveTab('progress')}
            className="text-white font-bold hover:underline cursor-pointer"
          >
            Weekly Review & Insights →
          </button>
        </div>
      </section>

      {/* 4. WEIGHT & GOAL PROGRESS */}
      <section className="bg-white dark:bg-[#1E2520] p-6 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#7D8C6F]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C8980] dark:text-[#A3A096]">
              {getTranslation('weight_journey', language)}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('progress')}
            className="text-xs font-bold text-[#7D8C6F] dark:text-[#9FB191] hover:underline cursor-pointer"
          >
            Log Weight & History →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="p-3.5 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
            <span className="text-[11px] text-[#8C8980] dark:text-[#A3A096] block">
              {getTranslation('starting_weight', language)}
            </span>
            <span className="text-xl font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {weightGoal.startingWeightKg} kg
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#273229] border border-[#7D8C6F]/30 shadow-xs">
            <span className="text-[11px] text-[#7D8C6F] dark:text-[#9FB191] font-semibold block">
              {getTranslation('current_weight', language)}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                {personalInfo.currentWeightKg} kg
              </span>
              <span className="text-xs font-bold text-[#7D8C6F]">
                -{weightLostSoFar} kg
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
            <span className="text-[11px] text-[#8C8980] dark:text-[#A3A096] block">
              {getTranslation('goal_weight', language)}
            </span>
            <span className="text-xl font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {weightGoal.goalWeightKg} kg
            </span>
          </div>
        </div>

        {/* Milestone Indicator & Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#8C8980] dark:text-[#A3A096]">
            <span>{weightProgressPct}% of journey completed</span>
            <span className="font-semibold text-[#4A5D4E] dark:text-[#C5D1BC]">
              {remainingWeightKg} kg left to reach goal
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#F0EEE6] dark:bg-[#2B352E] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weightProgressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-[#7D8C6F] rounded-full"
            />
          </div>
        </div>
      </section>

      {/* 5. CALORIE BUDGET & NOURISHMENT PLATE METAPHOR */}
      <section>
        <PlateVisualization
          calorieBudget={calorieBudget}
          consumedCalories={consumedCal}
          breakfastCal={dayTotals.breakfastCal}
          lunchCal={dayTotals.lunchCal}
          dinnerCal={dayTotals.dinnerCal}
          snackCal={dayTotals.snackCal}
        />
      </section>

      {/* 6. MACRONUTRIENT BREAKDOWN & SEGMENTED DISTRIBUTION BAR */}
      <section>
        <MacroDistributionBar interactive={true} />
      </section>

      {/* 7. TODAY'S MEALS: VISUAL FOOD CARDS & QUICK ADD */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-serif italic text-[#4A5D4E] dark:text-[#C5D1BC]">
              {getTranslation('todays_meals_title', language)}
            </h2>
            <p className="text-xs text-[#8C8980] dark:text-[#A3A096] mt-0.5">
              {getTranslation('todays_meals_subtitle', language)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('food')}
              className="px-4 py-2 bg-white dark:bg-[#1E2520] border border-[#EBE9E1] dark:border-[#384439] rounded-full text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6] hover:bg-[#F9F8F4] dark:hover:bg-[#273129] transition-colors cursor-pointer"
            >
              Food Database
            </button>
            <button
              onClick={() => setQuickAddModalMeal('breakfast')}
              className="px-4 py-2 bg-[#7D8C6F] hover:bg-[#68765c] text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{getTranslation('quick_add_meal', language)}</span>
            </button>
          </div>
        </div>

        {/* Meal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mealSections.map((sec) => {
            const foodsInMeal = todaysLoggedFoods.filter((f) => f.mealType === sec.type);

            return (
              <div
                key={sec.type}
                className="bg-white dark:bg-[#1E2520] p-5 rounded-[28px] border border-[#F2F1EC] dark:border-[#2C332D] flex flex-col justify-between gap-3 shadow-xs hover:border-[#EBE9E1] dark:hover:border-[#384439] transition-all"
              >
                {/* Header */}
                <div className="flex justify-between items-start pb-2 border-b border-[#F0EEE6] dark:border-[#2C332D]">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8C8980] dark:text-[#A3A096] block">
                      {sec.label}
                    </span>
                    <span className="text-[11px] text-[#8C8980] dark:text-[#A3A096]">
                      {foodsInMeal.length} logged
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#4A5D4E] dark:text-[#C5D1BC] bg-[#F5F4EF] dark:bg-[#2A332B] px-2 py-0.5 rounded-full border border-[#EBE9E1] dark:border-[#384439]">
                    {sec.cals} kcal
                  </span>
                </div>

                {/* Meal Items List */}
                <div className="space-y-2.5 min-h-[140px] flex-1 flex flex-col justify-start">
                  <AnimatePresence mode="popLayout">
                    {foodsInMeal.length > 0 ? (
                      foodsInMeal.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="p-2.5 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#F0EEE6] dark:border-[#323E34] flex items-center gap-2.5 group"
                        >
                          <img
                            src={item.image || item.foodItem?.image || ''}
                            alt={item.name || item.foodItem?.name || ''}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#EBE9E1] dark:border-[#384439]"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6] truncate">
                                {item.name || item.foodItem?.name || ''}
                              </h4>
                              <span className="text-xs font-bold text-[#4A5D4E] dark:text-[#C5D1BC] shrink-0 ml-1">
                                {item.calories}k
                              </span>
                            </div>
                            <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096] block truncate">
                              {item.servingSize || item.foodItem?.servingSize || ''} {item.servingUnit || item.foodItem?.servingUnit || ''} ({item.portionMultiplier}x)
                            </span>
                            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold">
                              <span className="text-[#7D8C6F] dark:text-[#9FB191]">P:{item.protein}g</span>
                              <span className="text-[#D4A373]">C:{item.carbohydrates}g</span>
                              <span className="text-[#A3B18A]">F:{item.fat}g</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              onClick={() => removeLoggedFood(item.id)}
                              className="text-[#8C8980] hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                              title="Delete food"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div
                        onClick={() => setQuickAddModalMeal(sec.type)}
                        className="h-32 bg-[#F5F4EF] dark:bg-[#252E27]/50 rounded-2xl border-2 border-dashed border-[#D6D2C4] dark:border-[#384439] flex flex-col items-center justify-center gap-2 opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-center p-3"
                      >
                        <div className="w-8 h-8 rounded-full border border-[#D6D2C4] dark:border-[#384439] flex items-center justify-center text-[#8C8980] dark:text-[#A3A096]">
                          +
                        </div>
                        <span className="text-[11px] font-bold uppercase text-[#8C8980] dark:text-[#A3A096]">
                          Add {sec.label}
                        </span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Add button inside card */}
                {foodsInMeal.length > 0 && (
                  <button
                    onClick={() => setQuickAddModalMeal(sec.type)}
                    className="w-full py-2 bg-[#F5F4EF] dark:bg-[#2A332B] hover:bg-[#EBE9E1] dark:hover:bg-[#354237] text-[#4A5D4E] dark:text-[#C5D1BC] text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                  >
                    + Add Item
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. HYDRATION TRACKER */}
      <section className="bg-[#E9EAE3] dark:bg-[#202923] p-6 rounded-[32px] border border-[#E0E2D8] dark:border-[#2F3C33] shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 bg-white dark:bg-[#29362D] rounded-2xl flex items-center justify-center text-[#79A7D3] shadow-xs">
              <Droplet className="w-6 h-6 fill-[#79A7D3]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#4A5D4E] dark:text-[#C5D1BC] uppercase tracking-wider">
                {getTranslation('water', language)} Tracker
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                  {(currentWaterMl / 1000).toFixed(1)} L
                </span>
                <span className="text-xs text-[#8C8980] dark:text-[#A3A096]">
                  of {(nutritionTargets.waterGoalMl / 1000).toFixed(1)} L goal
                </span>
              </div>
              <span className="text-[11px] text-[#8C8980] dark:text-[#A3A096]">
                {Math.min(100, Math.round((currentWaterMl / (nutritionTargets.waterGoalMl || 1)) * 100))}% reached today
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => addWater(250)}
              className="px-3.5 py-2 bg-white dark:bg-[#29362D] text-[#3D3D3D] dark:text-[#E8EAE6] border border-[#DCD9D0] dark:border-[#384439] rounded-xl text-xs font-bold hover:bg-[#F9F8F4] dark:hover:bg-[#344439] transition-colors cursor-pointer shadow-xs"
            >
              +250 ml (Cup)
            </button>
            <button
              onClick={() => addWater(500)}
              className="px-3.5 py-2 bg-[#7D8C6F] hover:bg-[#68765c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              +500 ml (Bottle)
            </button>
            <button
              onClick={() => {
                const custom = prompt('Enter water in ml (e.g. 350):');
                if (custom && Number(custom) > 0) addWater(Number(custom));
              }}
              className="px-3.5 py-2 bg-white dark:bg-[#29362D] text-[#4A5D4E] dark:text-[#C5D1BC] border border-[#DCD9D0] dark:border-[#384439] rounded-xl text-xs font-bold hover:bg-[#F9F8F4] dark:hover:bg-[#344439] transition-colors cursor-pointer shadow-xs"
            >
              Custom Amount
            </button>
          </div>
        </div>

        {/* Water visual progress fill */}
        <div className="h-3 w-full bg-[#DBDCD3] dark:bg-[#18211A] rounded-full overflow-hidden mt-4 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(100, Math.round((currentWaterMl / (nutritionTargets.waterGoalMl || 1)) * 100))}%`,
            }}
            transition={{ duration: 0.6 }}
            className="h-full bg-[#79A7D3] rounded-full"
          />
        </div>
      </section>

      {/* 9. STEPS & ACTIVITY */}
      <section className="bg-white dark:bg-[#1E2520] p-6 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Footprints className="w-5 h-5 text-[#A3B18A]" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C8980] dark:text-[#A3A096]">
                {getTranslation('steps', language)} & Activity
              </h3>
              <p className="text-xs text-[#8C8980] dark:text-[#A3A096]">
                Daily movement, active workout minutes, and energy burn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addSteps(1000)}
              className="px-3 py-1.5 rounded-xl bg-[#F5F4EF] dark:bg-[#2A332B] hover:bg-[#EBE9E1] text-[#3D3D3D] dark:text-[#E8EAE6] text-xs font-bold border border-[#EBE9E1] dark:border-[#384439] cursor-pointer"
            >
              +1,000 Steps
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className="px-3.5 py-1.5 bg-[#7D8C6F] hover:bg-[#6B7A5D] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Log Workout →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
            <span className="text-[11px] text-[#8C8980] dark:text-[#A3A096] block">Steps Today</span>
            <span className="text-2xl font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {formatNum(currentSteps)}
            </span>
            <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096] block mt-0.5">
              Goal: {formatNum(nutritionTargets.stepGoal)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
            <span className="text-[11px] text-[#8C8980] dark:text-[#A3A096] block">Active Burn</span>
            <span className="text-2xl font-serif font-bold text-[#D4A373]">
              {activeCaloriesBurned} kcal
            </span>
            <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096] block mt-0.5">
              Steps + Logged Workouts
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
            <span className="text-[11px] text-[#8C8980] dark:text-[#A3A096] block">Workout Time</span>
            <span className="text-2xl font-serif font-bold text-[#7D8C6F] dark:text-[#9FB191]">
              {activeMinutesToday} min
            </span>
            <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096] block mt-0.5">
              {workouts.filter((w) => w.date === selectedDate).length} session(s)
            </span>
          </div>
        </div>
      </section>

      {/* 10. FASTING TRACKER */}
      <section className="bg-white dark:bg-[#1E2520] p-6 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F4EF] dark:bg-[#2A332B] flex items-center justify-center text-[#7D8C6F] shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C8980] dark:text-[#A3A096]">
                  {getTranslation('fasting_tracker', language)}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF9F5] dark:bg-[#283229] text-[#7D8C6F] border border-[#EBE9E1] dark:border-[#384439]">
                  {fastingSchedule.type} Protocol
                </span>
              </div>
              <p className="text-base font-bold text-[#3D3D3D] dark:text-[#E8EAE6] mt-0.5">
                {fastingSchedule.isFasting ? 'Active Fasting Window' : 'Open Eating Window'}
              </p>
              <p className="text-xs text-[#8C8980] dark:text-[#A3A096]">
                Eating window: {fastingSchedule.eatingWindowStart} – {fastingSchedule.eatingWindowEnd} • {fastingSchedule.streakDays} Day Fasting Streak
              </p>
            </div>
          </div>

          <button
            onClick={toggleFastingState}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
              fastingSchedule.isFasting
                ? 'bg-[#7D8C6F] hover:bg-[#68765c] text-white'
                : 'bg-[#A6826D] hover:bg-[#91715e] text-white'
            }`}
          >
            {fastingSchedule.isFasting ? 'End Fast & Open Window' : 'Start Fasting Period'}
          </button>
        </div>
      </section>

      {/* 11. DAILY FOCUS & NUTRITION PRIORITIES */}
      <section className="bg-white dark:bg-[#1E2520] p-6 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#7D8C6F]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C8980] dark:text-[#A3A096]">
              {getTranslation('daily_focus_title', language)}
            </h3>
          </div>
          <span className="text-[11px] text-[#8C8980] dark:text-[#A3A096]">
            Tap tags to activate priorities
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {FOCUS_OPTIONS.map((f) => {
            const isActive = nutritionFocus.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => toggleNutritionFocus(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#7D8C6F] text-white shadow-xs'
                    : 'bg-[#F5F4EF] dark:bg-[#2A332B] text-[#4A5D4E] dark:text-[#C5D1BC] hover:bg-[#EBE9E1] dark:hover:bg-[#354336]'
                }`}
              >
                {isActive ? '✓ ' : '+ '}
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 12. STREAKS & CONSISTENCY */}
      <section className="bg-white dark:bg-[#1E2520] p-6 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#7D8C6F]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C8980] dark:text-[#A3A096]">
              {getTranslation('streaks_title', language)}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('profile')}
            className="text-xs font-bold text-[#7D8C6F] dark:text-[#9FB191] hover:underline cursor-pointer"
          >
            All Achievements & Badges →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {streaks.slice(0, 4).map((st) => (
            <div
              key={st.key}
              className="p-3.5 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]"
            >
              <span className="text-[11px] font-bold text-[#8C8980] dark:text-[#A3A096] block truncate">
                {st.name}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                  {st.currentStreak}
                </span>
                <span className="text-xs text-[#7D8C6F] dark:text-[#9FB191] font-semibold">days 🔥</span>
              </div>
              <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096] block mt-0.5">
                Best: {st.bestStreak} days
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Global Quick Add Food Modal */}
      {quickAddModalMeal && (
        <AddFoodModal
          mealType={quickAddModalMeal}
          onClose={() => setQuickAddModalMeal(null)}
        />
      )}
    </div>
  );
};
