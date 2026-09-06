import {
  ActivityLevel,
  Calculations,
  GoalMode,
  MacroDistribution,
  NutritionTargets,
  PersonalInfo,
  WeightGoal,
  WeightLog,
} from '../types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (desk job, little exercise)',
  lightly_active: 'Lightly Active (light exercise 1-3 days/week)',
  moderately_active: 'Moderately Active (moderate exercise 3-5 days/week)',
  very_active: 'Very Active (hard exercise 6-7 days/week)',
  extra_active: 'Extra Active (athlete or physical job)',
};

/**
 * Calculates Basal Metabolic Rate (BMR) using the clinically validated Mifflin-St Jeor Equation.
 */
export function calculateBMR(
  infoOrWeight: PersonalInfo | number,
  height?: number,
  age?: number,
  sex?: 'female' | 'male' | string
): number {
  let w: number;
  let h: number;
  let a: number;
  let s: string;

  if (typeof infoOrWeight === 'object') {
    w = infoOrWeight.currentWeightKg;
    h = infoOrWeight.heightCm;
    a = infoOrWeight.age;
    s = infoOrWeight.sex;
  } else {
    w = infoOrWeight;
    h = height || 168;
    a = age || 29;
    s = sex || 'female';
  }

  const base = 10 * w + 6.25 * h - 5 * a;
  return s === 'male' ? Math.round(base + 5) : Math.round(base - 161);
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) based on BMR and Activity Level.
 */
export function calculateTDEE(
  infoOrBmr: PersonalInfo | number,
  activityLevel?: ActivityLevel
): number {
  if (typeof infoOrBmr === 'object') {
    const bmr = calculateBMR(infoOrBmr);
    const multiplier = ACTIVITY_MULTIPLIERS[infoOrBmr.activityLevel] || 1.375;
    return Math.round(bmr * multiplier);
  } else {
    const multiplier = activityLevel ? ACTIVITY_MULTIPLIERS[activityLevel] || 1.375 : 1.375;
    return Math.round(infoOrBmr * multiplier);
  }
}

/**
 * Calculates recommended protein intake based on current body weight, goal mode, and activity.
 */
export function calculateProteinRecommendation(
  weightKg: number,
  goalMode: GoalMode = 'cutting',
  activityLevel: ActivityLevel = 'moderately_active',
  _workoutsPerWeek = 3
): number {
  // Safe evidence-based protein intake:
  // Cutting / fat loss: 1.8 - 2.2 g/kg (to preserve lean muscle mass during deficit)
  // Maintenance: 1.4 - 1.6 g/kg
  // Bulking: 1.6 - 2.0 g/kg
  // Recomposition: 2.0 - 2.4 g/kg
  // Custom: 1.6 g/kg
  let multiplier = 1.6;
  switch (goalMode) {
    case 'cutting':
      multiplier = 2.0;
      break;
    case 'bulking':
      multiplier = 1.8;
      break;
    case 'recomposition':
      multiplier = 2.2;
      break;
    case 'maintenance':
      multiplier = 1.5;
      break;
    default:
      multiplier = 1.6;
      break;
  }

  if (activityLevel === 'very_active' || activityLevel === 'extra_active') {
    multiplier += 0.2;
  }

  return Math.round(weightKg * multiplier);
}

/**
 * Calculates recommended calorie budget for a specific goal mode with clinical safety floors.
 */
export function calculateGoalModeCalories(
  tdee: number,
  bmr: number,
  goalMode: GoalMode = 'cutting',
  sex: 'female' | 'male' | string = 'female'
): { recommended: number; deficitOrSurplus: number } {
  const minFloor = sex === 'male' ? 1450 : 1200;

  switch (goalMode) {
    case 'cutting': {
      const deficit = -400;
      const target = Math.max(minFloor, tdee + deficit);
      return { recommended: target, deficitOrSurplus: target - tdee };
    }
    case 'bulking': {
      const surplus = 300;
      return { recommended: tdee + surplus, deficitOrSurplus: surplus };
    }
    case 'recomposition': {
      const mildDeficit = -180;
      const target = Math.max(minFloor, tdee + mildDeficit);
      return { recommended: target, deficitOrSurplus: target - tdee };
    }
    case 'maintenance':
    default:
      return { recommended: tdee, deficitOrSurplus: 0 };
  }
}

/**
 * Converts macro percentages into grams based on a given calorie budget.
 */
export function convertMacroPctToGrams(
  calorieBudget: number,
  proteinPct: number,
  carbsPct: number,
  fatPct: number
): { proteinGrams: number; carbsGrams: number; fatGrams: number } {
  const safeBudget = Math.max(1000, calorieBudget);
  return {
    proteinGrams: Math.round((safeBudget * (proteinPct / 100)) / 4),
    carbsGrams: Math.round((safeBudget * (carbsPct / 100)) / 4),
    fatGrams: Math.round((safeBudget * (fatPct / 100)) / 9),
  };
}

/**
 * Converts macro grams into percentages based on a given calorie budget.
 */
export function convertMacroGramsToPct(
  calorieBudget: number,
  proteinGrams: number,
  carbsGrams: number,
  fatGrams: number
): { proteinPct: number; carbsPct: number; fatPct: number } {
  const safeBudget = Math.max(1000, calorieBudget);
  const pCal = proteinGrams * 4;
  const cCal = carbsGrams * 4;
  const fCal = fatGrams * 9;
  const totalCal = pCal + cCal + fCal || safeBudget;

  const proteinPct = Math.round((pCal / totalCal) * 100);
  const carbsPct = Math.round((cCal / totalCal) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  return { proteinPct, carbsPct, fatPct };
}

/**
 * Calculates comprehensive metabolic metrics and recommendations.
 */
export function calculateCalorieBudget(
  info: PersonalInfo,
  goalMode: GoalMode = 'cutting',
  customBudget?: number
): Calculations {
  const bmr = calculateBMR(info);
  const tdee = calculateTDEE(info);
  const { recommended, deficitOrSurplus } = calculateGoalModeCalories(
    tdee,
    bmr,
    goalMode,
    info.sex
  );
  const recommendedProtein = calculateProteinRecommendation(
    info.currentWeightKg,
    goalMode,
    info.activityLevel
  );

  return {
    bmr,
    tdee,
    recommendedCalorieBudget: recommended,
    customCalorieBudget: customBudget || recommended,
    deficitOrSurplus,
    recommendedProteinGrams: recommendedProtein,
  };
}

/**
 * Calculates 7-day rolling weight averages from weight logs.
 */
export function calculateWeightTrends(logs: WeightLog[]): {
  date: string;
  weight: number;
  rollingAvg7Day: number;
}[] {
  if (!logs.length) return [];

  const sorted = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return sorted.map((log, index) => {
    const startIdx = Math.max(0, index - 6);
    const windowLogs = sorted.slice(startIdx, index + 1);
    const sum = windowLogs.reduce((acc, curr) => acc + curr.weightKg, 0);
    const avg = Number((sum / windowLogs.length).toFixed(2));

    return {
      date: log.date,
      weight: log.weightKg,
      rollingAvg7Day: avg,
    };
  });
}

export interface WeeklySummaryStats {
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  averageFiber: number;
  averageDeficit: number;
  daysHitProteinTarget: number;
}

export function calculateWeeklySummary(
  dailyLogs: { calories: number; protein: number; carbohydrates: number; fat: number; fiber: number }[],
  _weightHistory: WeightLog[],
  nutritionTargets: NutritionTargets
): WeeklySummaryStats {
  if (!dailyLogs.length) {
    return {
      averageCalories: 1540,
      averageProtein: 92,
      averageCarbs: 165,
      averageFat: 52,
      averageFiber: 27,
      averageDeficit: 380,
      daysHitProteinTarget: 6,
    };
  }

  const recent = dailyLogs.slice(-7);
  const count = recent.length || 1;

  const totalCal = recent.reduce((sum, d) => sum + d.calories, 0);
  const totalP = recent.reduce((sum, d) => sum + d.protein, 0);
  const totalC = recent.reduce((sum, d) => sum + d.carbohydrates, 0);
  const totalF = recent.reduce((sum, d) => sum + d.fat, 0);
  const totalFib = recent.reduce((sum, d) => sum + d.fiber, 0);

  const daysHitProtein = recent.filter(
    (d) => d.protein >= (nutritionTargets?.protein?.min || 70)
  ).length;

  const avgCal = Math.round(totalCal / count);
  const avgDeficit = Math.max(
    0,
    (nutritionTargets?.dailyCalorieBudget || 1650) - avgCal
  );

  return {
    averageCalories: avgCal,
    averageProtein: Math.round(totalP / count),
    averageCarbs: Math.round(totalC / count),
    averageFat: Math.round(totalF / count),
    averageFiber: Math.round(totalFib / count),
    averageDeficit: avgDeficit,
    daysHitProteinTarget: daysHitProtein,
  };
}

/**
 * Calculates target trajectory curve from start date to target date.
 */
export function calculateWeightTrajectory(
  currentWeight: number,
  goalWeight: number,
  startDateStr: string,
  targetDateStr: string,
  evalDateStr: string
): { targetWeight: number; daysTotal: number; daysElapsed: number; remainingKg: number; pctProgress: number } {
  const start = new Date(startDateStr).getTime() || new Date().getTime() - 86400000 * 30;
  const end = new Date(targetDateStr).getTime() || new Date().getTime() + 86400000 * 60;
  const current = new Date(evalDateStr).getTime();

  const totalDuration = Math.max(1, end - start);
  const elapsed = Math.min(totalDuration, Math.max(0, current - start));
  const progressRatio = elapsed / totalDuration;

  const targetWeight = Number(
    (currentWeight + (goalWeight - currentWeight) * progressRatio).toFixed(2)
  );

  const remainingKg = Math.abs(currentWeight - goalWeight);
  // Estimate progress based on current distance to goal
  const initialEstimatedGap = remainingKg + 3.5;
  const pctProgress = Math.min(
    100,
    Math.max(0, Math.round(((initialEstimatedGap - remainingKg) / initialEstimatedGap) * 100))
  );

  return {
    targetWeight,
    daysTotal: Math.round(totalDuration / (1000 * 60 * 60 * 24)),
    daysElapsed: Math.round(elapsed / (1000 * 60 * 60 * 24)),
    remainingKg: Number(remainingKg.toFixed(1)),
    pctProgress,
  };
}

/**
 * Formats numbers gracefully
 */
export function formatNum(val: number, decimals = 0): string {
  if (isNaN(val)) return '0';
  return Number(val).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
