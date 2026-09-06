export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active';

export type NutritionFocus =
  | 'calorie-deficit'
  | 'high-protein'
  | 'fiber-focus'
  | 'lower-sugar'
  | 'lower-sodium'
  | 'balanced-macros'
  | 'hydration-focus';

export type FoodType = 'homemade' | 'packaged' | 'restaurant';

export type WorkoutType =
  | 'Strength'
  | 'Cardio'
  | 'HIIT'
  | 'Walking'
  | 'Running'
  | 'Other';

export interface FoodItem {
  id: string;
  name: string;
  category: 'protein' | 'produce' | 'grains' | 'dairy' | 'breakfast' | 'snacks' | 'meals';
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number; // in mg
  image: string;
  isFavorite?: boolean;
  foodType: FoodType;
  usageCount?: number;
}

export interface LoggedFood {
  id: string;
  foodItemId: string;
  mealType: MealType;
  date: string; // YYYY-MM-DD
  timestamp: number;
  name: string;
  portionMultiplier: number;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  image: string;
  foodItem?: FoodItem;
  loggedAt?: string;
}

export type GoalMode =
  | 'cutting'
  | 'maintenance'
  | 'bulking'
  | 'recomposition'
  | 'custom';

export type ThemeType =
  | 'sage'
  | 'ocean'
  | 'blush'
  | 'lavender'
  | 'sand'
  | 'midnight';

export type TypographyType = 'modern' | 'serif' | 'rounded';

export type LanguageType = 'en' | 'id';

export type UnitSystem = 'metric' | 'imperial';

export interface PersonalInfo {
  name?: string;
  profilePhoto?: string;
  age: number;
  sex: 'female' | 'male';
  heightCm: number;
  currentWeightKg: number;
  activityLevel: ActivityLevel;
}

export interface WeightGoal {
  goalWeightKg: number;
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  desiredWeeklyRateKg: number; // e.g. 0.4
  startingWeightKg?: number; // derived or historical baseline
}

export interface MacroTarget {
  min: number;
  ideal: number;
  max: number;
}

export interface MacroDistribution {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  isCustom?: boolean;
}

export interface NutritionTargets {
  dailyCalorieBudget: number;
  goalMode: GoalMode;
  isCustomCalories: boolean;
  macroDistribution: MacroDistribution;
  protein: MacroTarget;
  carbohydrates: MacroTarget;
  fat: MacroTarget;
  fiberTarget: number; // g
  sugarLimit: number; // g
  sodiumLimit: number; // mg
  waterGoalMl: number; // ml
  stepGoal: number;
  customFlags?: {
    calories?: boolean;
    protein?: boolean;
    carbs?: boolean;
    fat?: boolean;
    fiber?: boolean;
    sugar?: boolean;
    sodium?: boolean;
    water?: boolean;
    steps?: boolean;
  };
}

export interface Calculations {
  bmr: number;
  tdee: number;
  recommendedCalorieBudget: number;
  customCalorieBudget: number;
  deficitOrSurplus: number;
  recommendedProteinGrams: number;
}

export interface WeightLog {
  id: string;
  date: string;
  weightKg: number;
  notes?: string;
  createdAt: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  workoutType: WorkoutType;
  durationMinutes: number;
  activeCalories: number;
  notes?: string;
  createdAt: string;
}

export interface ActivityDaily {
  date: string;
  steps: number;
  stepGoal: number;
  activeCalories: number;
}

export interface WaterLog {
  date: string;
  totalMl: number;
  targetMl: number;
}

export interface FastingSchedule {
  type: '12:12' | '14:10' | '16:8' | '18:6' | '20:4' | 'omad' | 'custom';
  fastingHours: number;
  eatingHours: number;
  isFasting: boolean;
  fastStartIso?: string;
  eatingWindowStart?: string;
  eatingWindowEnd?: string;
  streakDays: number;
}

export interface HabitStreak {
  name: string;
  key:
    | 'foodLogging'
    | 'waterGoal'
    | 'stepGoal'
    | 'proteinGoal'
    | 'workout'
    | 'fasting'
    | 'calorieBudget'
    | 'weightLogging';
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate?: string;
}

export interface MealPlanItem {
  id: string;
  mealType: MealType;
  food: FoodItem;
  portionMultiplier: number;
}

export interface DayPlan {
  dayOfWeek: string;
  date?: string;
  items: MealPlanItem[];
}

export interface WeeklyReview {
  wins: string[];
  needsAttention: string[];
  nextWeekFocus: string[];
  summary: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  webhookUrl: string;
  isConnected: boolean;
  autoSync: boolean;
  lastSyncedAt?: string;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  errorMessage?: string;
  sheetNameList: string[];
}

export interface GoogleCalendarConfig {
  syncWorkouts: boolean;
  syncMealPrep: boolean;
  syncFastingWindow: boolean;
  syncHealthCheckin: boolean;
}

export interface GoogleTasksConfig {
  syncMealPrep: boolean;
  syncGroceryList: boolean;
  syncWorkouts: boolean;
  syncWaterReminder: boolean;
  syncWeeklyWeighIn: boolean;
}

export interface MealRecommendation {
  id: string;
  type: 'complete_meal' | 'individual_item';
  name: string;
  description: string;
  mealType: MealType;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  image: string;
  whyItFits: string;
  focusTags: string[];
  ingredients?: string[];
  fitsBudget?: boolean;
}

export interface FoodSearchResult {
  identifiedFood: {
    name: string;
    description: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    category: FoodItem['category'];
    foodType: FoodType;
    image: string;
    confidence?: string;
    healthHighlights?: string[];
  };
  similarDatabaseItems?: {
    food: FoodItem;
    matchScore: number;
    reason: string;
  }[];
  alternativeSuggestions?: {
    name: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    image: string;
  }[];
}

