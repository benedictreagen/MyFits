import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import confetti from 'canvas-confetti';
import {
  ActivityDaily,
  Calculations,
  DayPlan,
  FastingSchedule,
  FoodItem,
  GoalMode,
  GoogleCalendarConfig,
  GoogleSheetsConfig,
  GoogleTasksConfig,
  HabitStreak,
  LanguageType,
  LoggedFood,
  MacroDistribution,
  MealType,
  NutritionFocus,
  NutritionTargets,
  PersonalInfo,
  ThemeType,
  TypographyType,
  UnitSystem,
  WeeklyReview,
  WeightGoal,
  WeightLog,
  WorkoutLog,
  WorkoutType,
} from '../types';
import {
  INITIAL_FASTING_SCHEDULE,
  INITIAL_FOOD_DATABASE,
  INITIAL_HABIT_STREAKS,
  INITIAL_MEAL_PLAN,
  INITIAL_NUTRITION_FOCUS,
  INITIAL_NUTRITION_TARGETS,
  INITIAL_PERSONAL_INFO,
  INITIAL_WEIGHT_GOAL,
  generateInitialActivity,
  generateInitialLoggedFoods,
  generateInitialWeightHistory,
  generateInitialWorkouts,
  getTodayDateStr,
} from '../data/initialData';
import {
  calculateBMR,
  calculateCalorieBudget,
  calculateGoalModeCalories,
  calculateProteinRecommendation,
  calculateTDEE,
  convertMacroGramsToPct,
  convertMacroPctToGrams,
} from '../utils/calculations';
import {
  AppSyncState,
  pullFromGoogleSheets,
  pushToGoogleSheets,
} from '../utils/googleSheetsSync';
import {
  AchievementBadge,
  INITIAL_ACHIEVEMENTS,
  evaluateAchievements,
} from '../utils/achievements';

export type NavigationTab =
  | 'home'
  | 'food'
  | 'plan'
  | 'activity'
  | 'progress'
  | 'goals'
  | 'profile';

interface HealthContextValue {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;

  // Preferences & Customization
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  typography: TypographyType;
  setTypography: (t: TypographyType) => void;
  unitSystem: UnitSystem;
  setUnitSystem: (u: UnitSystem) => void;

  // Personal Info & Biometrics
  personalInfo: PersonalInfo;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  weightGoal: WeightGoal;
  updateWeightGoal: (goal: Partial<WeightGoal>) => void;
  nutritionTargets: NutritionTargets;
  updateNutritionTargets: (targets: Partial<NutritionTargets>) => void;
  calculations: Calculations;
  nutritionFocus: NutritionFocus[];
  toggleNutritionFocus: (focus: NutritionFocus) => void;

  // Macro adjustments
  updateMacroPercentages: (p: number, c: number, f: number) => void;
  updateMacroGrams: (p: number, c: number, f: number) => void;
  setGoalMode: (mode: GoalMode) => void;

  // Food Database & Logging
  foodDatabase: FoodItem[];
  addCustomFood: (food: Omit<FoodItem, 'id'>) => FoodItem;
  toggleFavoriteFood: (id: string) => void;
  loggedFoods: LoggedFood[];
  todaysLoggedFoods: LoggedFood[];
  addFoodToMeal: (food: FoodItem, mealType: MealType, portionMultiplier?: number) => void;
  updateFoodPortion: (logId: string, newMultiplier: number) => void;
  duplicateLoggedFood: (logId: string) => void;
  removeLoggedFood: (logId: string) => void;

  // Meal Totals for selected date
  dayTotals: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    breakfastCal: number;
    lunchCal: number;
    dinnerCal: number;
    snackCal: number;
  };

  // Hydration
  currentWaterMl: number;
  addWater: (ml: number) => void;
  setWater: (ml: number) => void;
  resetWater: () => void;

  // Weight & Workouts
  weightHistory: WeightLog[];
  logWeight: (weightKg: number, notes?: string) => void;
  workouts: WorkoutLog[];
  logWorkout: (workout: {
    workoutType: WorkoutType;
    durationMinutes: number;
    activeCalories: number;
    notes?: string;
  }) => void;
  activityDaily: ActivityDaily[];
  currentSteps: number;
  addSteps: (steps: number) => void;

  // Fasting
  fastingSchedule: FastingSchedule;
  updateFastingSchedule: (sched: Partial<FastingSchedule>) => void;
  toggleFastingState: () => void;

  // Meal Plan
  mealPlan: DayPlan[];
  addMealPlanItem: (dayOfWeek: string, mealType: MealType, food: FoodItem, portionMultiplier?: number) => void;
  removeMealPlanItem: (dayOfWeek: string, itemId: string) => void;
  copyPlanDayToLog: (dayOfWeek: string) => void;

  // Streaks, AI & Achievements
  streaks: HabitStreak[];
  aiInsights: string[];
  weeklyReview: WeeklyReview;
  isLoadingAi: boolean;
  refreshAiInsights: () => Promise<void>;
  achievements: AchievementBadge[];

  // Google Sheets integration state
  isSheetsModalOpen: boolean;
  setIsSheetsModalOpen: (open: boolean) => void;
  sheetsConfig: GoogleSheetsConfig;
  updateSheetsConfig: (cfg: Partial<GoogleSheetsConfig>) => void;
  lastSheetsSync: string | null;
  triggerSheetsSync: () => Promise<void>;
  pullSheetsSync: () => Promise<void>;
  getAppSyncState: () => AppSyncState;

  // Google Calendar & Tasks
  calendarConfig: GoogleCalendarConfig;
  updateCalendarConfig: (cfg: Partial<GoogleCalendarConfig>) => void;
  tasksConfig: GoogleTasksConfig;
  updateTasksConfig: (cfg: Partial<GoogleTasksConfig>) => void;

  // Quick Add Food Modal
  quickAddModalMeal: MealType | null;
  setQuickAddModalMeal: (meal: MealType | null) => void;

  // Reset demo data
  resetAllData: () => void;
}

const HealthContext = createContext<HealthContextValue | null>(null);

const STORAGE_KEY = 'fittrack_health_state_v2';

function safeJsonParse<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Failed to parse localStorage key ${key}:`, e);
    return fallback;
  }
}

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayStr = useMemo(() => getTodayDateStr(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  // Preferences
  const [language, setLanguage] = useState<LanguageType>(() => {
    return (localStorage.getItem(`${STORAGE_KEY}_lang`) as LanguageType) || 'en';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return safeJsonParse(`${STORAGE_KEY}_dark`, false);
  });

  const [theme, setTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem(`${STORAGE_KEY}_theme`) as ThemeType) || 'sage';
  });

  const [typography, setTypography] = useState<TypographyType>(() => {
    return (localStorage.getItem(`${STORAGE_KEY}_typo`) as TypographyType) || 'modern';
  });

  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => {
    return (localStorage.getItem(`${STORAGE_KEY}_unit`) as UnitSystem) || 'metric';
  });

  // Dark Mode effect on HTML root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(`${STORAGE_KEY}_dark`, JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_lang`, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_theme`, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_typo`, typography);
  }, [typography]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_unit`, unitSystem);
  }, [unitSystem]);

  // Personal Info & Biometrics
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(() => {
    return safeJsonParse(`${STORAGE_KEY}_profile`, INITIAL_PERSONAL_INFO);
  });

  const [weightGoal, setWeightGoal] = useState<WeightGoal>(() => {
    return safeJsonParse(`${STORAGE_KEY}_goal`, INITIAL_WEIGHT_GOAL);
  });

  const [nutritionTargets, setNutritionTargets] = useState<NutritionTargets>(() => {
    return safeJsonParse(`${STORAGE_KEY}_targets`, INITIAL_NUTRITION_TARGETS);
  });

  const [nutritionFocus, setNutritionFocus] = useState<NutritionFocus[]>(() => {
    return safeJsonParse(`${STORAGE_KEY}_focus`, INITIAL_NUTRITION_FOCUS);
  });

  const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>(() => {
    return safeJsonParse(`${STORAGE_KEY}_foods`, INITIAL_FOOD_DATABASE);
  });

  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>(() => {
    return safeJsonParse(`${STORAGE_KEY}_logs`, generateInitialLoggedFoods(todayStr));
  });

  const [weightHistory, setWeightHistory] = useState<WeightLog[]>(() => {
    return safeJsonParse(`${STORAGE_KEY}_weights`, generateInitialWeightHistory());
  });

  const [workouts, setWorkouts] = useState<WorkoutLog[]>(() => {
    return safeJsonParse(`${STORAGE_KEY}_workouts`, generateInitialWorkouts());
  });

  const [activityDaily, setActivityDaily] = useState<ActivityDaily[]>(() => {
    return safeJsonParse(`${STORAGE_KEY}_activity`, generateInitialActivity());
  });

  const [waterLogs, setWaterLogs] = useState<Record<string, number>>(() => {
    return safeJsonParse(`${STORAGE_KEY}_water`, { [todayStr]: 1750 });
  });

  const [fastingSchedule, setFastingSchedule] = useState<FastingSchedule>(() => {
    return safeJsonParse(`${STORAGE_KEY}_fasting`, INITIAL_FASTING_SCHEDULE);
  });

  const [mealPlan, setMealPlan] = useState<DayPlan[]>(() => {
    return safeJsonParse(`${STORAGE_KEY}_plan`, INITIAL_MEAL_PLAN);
  });

  const [streaks, setStreaks] = useState<HabitStreak[]>(() => {
    return safeJsonParse(`${STORAGE_KEY}_streaks`, INITIAL_HABIT_STREAKS);
  });

  const [achievements, setAchievements] = useState<AchievementBadge[]>(() => {
    return safeJsonParse(`${STORAGE_KEY}_achievements`, INITIAL_ACHIEVEMENTS);
  });

  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => {
    return safeJsonParse(`${STORAGE_KEY}_sheets_config`, {
      spreadsheetId: '1FitTrack_Sync_Sheet_2026',
      webhookUrl: '',
      isConnected: false,
      autoSync: true,
      syncStatus: 'idle',
      sheetNameList: [
        'PERSONAL_INFO',
        'GOALS',
        'NUTRITION_TARGETS',
        'FOOD_DATABASE',
        'DAILY_MEALS',
        'WEIGHT_LOG',
        'ACTIVITY_LOG',
        'WORKOUT_LOG',
        'WATER_LOG',
        'FASTING_LOG',
        'MEAL_PLAN',
        'DAILY_LOG',
        'WEEKLY_SUMMARY',
        'AI_INSIGHTS',
      ],
    });
  });

  const [calendarConfig, setCalendarConfig] = useState<GoogleCalendarConfig>(() => {
    return safeJsonParse(`${STORAGE_KEY}_calendar`, {
      syncWorkouts: true,
      syncMealPrep: true,
      syncFastingWindow: true,
      syncHealthCheckin: true,
    });
  });

  const [tasksConfig, setTasksConfig] = useState<GoogleTasksConfig>(() => {
    return safeJsonParse(`${STORAGE_KEY}_tasks`, {
      syncMealPrep: true,
      syncGroceryList: true,
      syncWorkouts: true,
      syncWaterReminder: true,
      syncWeeklyWeighIn: true,
    });
  });

  const [aiInsights, setAiInsights] = useState<string[]>([
    "You're currently at 68% of your calorie budget and 76% of your daily protein target with optimal balance.",
    'Add a protein-rich whole food at dinner to sustain overnight muscle recovery.',
    'Your 7-day rolling weight average is steadily trending downward toward your desired 61.5 kg goal.',
    'Hydration is consistently above 2.0 L, supporting cellular energy and focus.',
  ]);

  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview>({
    wins: [
      'Maintained consistent daily protein distribution across all four meals',
      'Completed 5 quality workout sessions with steady energy levels',
      'Hit daily hydration threshold on 6 out of 7 days',
    ],
    needsAttention: [
      'Evening snack calories slightly elevated on Friday',
      'Fasting eating window occasionally extended past 19:30',
    ],
    nextWeekFocus: [
      'Pre-portion evening snacks with fiber-rich raw fruits',
      'Aim for a brisk 20-minute morning walk on non-workout days',
    ],
    summary:
      'Outstanding overall consistency! Your 7-day rolling weight average is smoothly decreasing with zero extreme restriction.',
  });

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [lastSheetsSync, setLastSheetsSync] = useState<string | null>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [quickAddModalMeal, setQuickAddModalMeal] = useState<MealType | null>(null);

  // Derive latest weight from weightHistory to ensure perfect synchronization
  useEffect(() => {
    if (weightHistory.length > 0) {
      const sorted = [...weightHistory].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const latestWeight = sorted[0].weightKg;
      if (latestWeight !== personalInfo.currentWeightKg) {
        setPersonalInfo((p) => ({ ...p, currentWeightKg: latestWeight }));
      }
    }
  }, [weightHistory]);

  // Recalculate BMR, TDEE, Recommended calories & protein dynamically
  const calculations = useMemo<Calculations>(() => {
    const bmr = calculateBMR(personalInfo);
    const tdee = calculateTDEE(personalInfo);
    const { recommended, deficitOrSurplus } = calculateGoalModeCalories(
      tdee,
      bmr,
      nutritionTargets.goalMode || 'cutting',
      personalInfo.sex
    );
    const recommendedProtein = calculateProteinRecommendation(
      personalInfo.currentWeightKg,
      nutritionTargets.goalMode || 'cutting',
      personalInfo.activityLevel
    );

    return {
      bmr,
      tdee,
      recommendedCalorieBudget: recommended,
      customCalorieBudget: nutritionTargets.dailyCalorieBudget,
      deficitOrSurplus,
      recommendedProteinGrams: recommendedProtein,
    };
  }, [personalInfo, nutritionTargets.goalMode, nutritionTargets.dailyCalorieBudget]);

  // When goalMode changes or biometrics change, update budget if not custom
  const setGoalMode = (mode: GoalMode) => {
    const { recommended } = calculateGoalModeCalories(
      calculations.tdee,
      calculations.bmr,
      mode,
      personalInfo.sex
    );
    const recommendedProtein = calculateProteinRecommendation(
      personalInfo.currentWeightKg,
      mode,
      personalInfo.activityLevel
    );

    const dist = nutritionTargets.macroDistribution || {
      proteinPct: 25,
      carbsPct: 50,
      fatPct: 25,
    };

    const newGrams = convertMacroPctToGrams(
      recommended,
      dist.proteinPct,
      dist.carbsPct,
      dist.fatPct
    );

    setNutritionTargets((prev) => ({
      ...prev,
      goalMode: mode,
      dailyCalorieBudget: recommended,
      isCustomCalories: false,
      macroDistribution: {
        ...dist,
        ...newGrams,
        proteinGrams: recommendedProtein,
      },
      protein: {
        ...prev.protein,
        ideal: recommendedProtein,
      },
    }));
  };

  const updateMacroPercentages = (pPct: number, cPct: number, fPct: number) => {
    const grams = convertMacroPctToGrams(
      nutritionTargets.dailyCalorieBudget,
      pPct,
      cPct,
      fPct
    );
    setNutritionTargets((prev) => ({
      ...prev,
      macroDistribution: {
        proteinPct: pPct,
        carbsPct: cPct,
        fatPct: fPct,
        ...grams,
        isCustom: true,
      },
      protein: { ...prev.protein, ideal: grams.proteinGrams },
      carbohydrates: { ...prev.carbohydrates, ideal: grams.carbsGrams },
      fat: { ...prev.fat, ideal: grams.fatGrams },
    }));
  };

  const updateMacroGrams = (pGrams: number, cGrams: number, fGrams: number) => {
    const pct = convertMacroGramsToPct(
      nutritionTargets.dailyCalorieBudget,
      pGrams,
      cGrams,
      fGrams
    );
    setNutritionTargets((prev) => ({
      ...prev,
      macroDistribution: {
        ...pct,
        proteinGrams: pGrams,
        carbsGrams: cGrams,
        fatGrams: fGrams,
        isCustom: true,
      },
      protein: { ...prev.protein, ideal: pGrams },
      carbohydrates: { ...prev.carbohydrates, ideal: cGrams },
      fat: { ...prev.fat, ideal: fGrams },
    }));
  };

  // Achievements evaluation engine
  const runAchievementsCheck = () => {
    const state = getAppSyncState();
    const { badges, newlyUnlocked } = evaluateAchievements(achievements, state);
    setAchievements(badges);
    localStorage.setItem(`${STORAGE_KEY}_achievements`, JSON.stringify(badges));

    if (newlyUnlocked.length > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  // Auto-persist state
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(personalInfo));
    localStorage.setItem(`${STORAGE_KEY}_goal`, JSON.stringify(weightGoal));
    localStorage.setItem(`${STORAGE_KEY}_targets`, JSON.stringify(nutritionTargets));
    localStorage.setItem(`${STORAGE_KEY}_focus`, JSON.stringify(nutritionFocus));
    localStorage.setItem(`${STORAGE_KEY}_foods`, JSON.stringify(foodDatabase));
    localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(loggedFoods));
    localStorage.setItem(`${STORAGE_KEY}_weights`, JSON.stringify(weightHistory));
    localStorage.setItem(`${STORAGE_KEY}_workouts`, JSON.stringify(workouts));
    localStorage.setItem(`${STORAGE_KEY}_activity`, JSON.stringify(activityDaily));
    localStorage.setItem(`${STORAGE_KEY}_water`, JSON.stringify(waterLogs));
    localStorage.setItem(`${STORAGE_KEY}_fasting`, JSON.stringify(fastingSchedule));
    localStorage.setItem(`${STORAGE_KEY}_plan`, JSON.stringify(mealPlan));
    localStorage.setItem(`${STORAGE_KEY}_streaks`, JSON.stringify(streaks));
    localStorage.setItem(`${STORAGE_KEY}_sheets_config`, JSON.stringify(sheetsConfig));
    localStorage.setItem(`${STORAGE_KEY}_calendar`, JSON.stringify(calendarConfig));
    localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasksConfig));

    runAchievementsCheck();
  }, [
    personalInfo,
    weightGoal,
    nutritionTargets,
    nutritionFocus,
    foodDatabase,
    loggedFoods,
    weightHistory,
    workouts,
    activityDaily,
    waterLogs,
    fastingSchedule,
    mealPlan,
    streaks,
    sheetsConfig,
    calendarConfig,
    tasksConfig,
  ]);

  // Date Navigators
  const goToPreviousDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const prev = new Date(y, m - 1, d - 1);
    const newY = prev.getFullYear();
    const newM = String(prev.getMonth() + 1).padStart(2, '0');
    const newD = String(prev.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const goToNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + 1);
    const newY = next.getFullYear();
    const newM = String(next.getMonth() + 1).padStart(2, '0');
    const newD = String(next.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const goToToday = () => {
    setSelectedDate(todayStr);
  };

  // Foods for selected day
  const todaysLoggedFoods = useMemo(() => {
    return loggedFoods.filter((f) => f.date === selectedDate);
  }, [loggedFoods, selectedDate]);

  // Day Totals
  const dayTotals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbohydrates = 0;
    let fat = 0;
    let fiber = 0;
    let sugar = 0;
    let sodium = 0;
    let breakfastCal = 0;
    let lunchCal = 0;
    let dinnerCal = 0;
    let snackCal = 0;

    todaysLoggedFoods.forEach((item) => {
      calories += item.calories;
      protein += item.protein;
      carbohydrates += item.carbohydrates;
      fat += item.fat;
      fiber += item.fiber;
      sugar += item.sugar;
      sodium += item.sodium;

      if (item.mealType === 'breakfast') breakfastCal += item.calories;
      else if (item.mealType === 'lunch') lunchCal += item.calories;
      else if (item.mealType === 'dinner') dinnerCal += item.calories;
      else if (item.mealType === 'snack') snackCal += item.calories;
    });

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbohydrates: Math.round(carbohydrates),
      fat: Math.round(fat),
      fiber: Math.round(fiber),
      sugar: Math.round(sugar),
      sodium: Math.round(sodium),
      breakfastCal: Math.round(breakfastCal),
      lunchCal: Math.round(lunchCal),
      dinnerCal: Math.round(dinnerCal),
      snackCal: Math.round(snackCal),
    };
  }, [todaysLoggedFoods]);

  // Food handlers
  const addCustomFood = (foodData: Omit<FoodItem, 'id'>): FoodItem => {
    const newFood: FoodItem = {
      ...foodData,
      id: `food_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      usageCount: 1,
    };
    setFoodDatabase((prev) => [newFood, ...prev]);
    return newFood;
  };

  const toggleFavoriteFood = (id: string) => {
    setFoodDatabase((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isFavorite: !f.isFavorite } : f))
    );
  };

  const addFoodToMeal = (food: FoodItem, mealType: MealType, portionMultiplier = 1) => {
    const newLog: LoggedFood = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      foodItemId: food.id,
      date: selectedDate,
      timestamp: Date.now(),
      mealType,
      name: food.name,
      image: food.image,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      foodItem: food,
      portionMultiplier,
      calories: Math.round(food.calories * portionMultiplier),
      protein: Math.round(food.protein * portionMultiplier * 10) / 10,
      carbohydrates: Math.round(food.carbohydrates * portionMultiplier * 10) / 10,
      fat: Math.round(food.fat * portionMultiplier * 10) / 10,
      fiber: Math.round(food.fiber * portionMultiplier * 10) / 10,
      sugar: Math.round(food.sugar * portionMultiplier * 10) / 10,
      sodium: Math.round(food.sodium * portionMultiplier),
      loggedAt: new Date().toISOString(),
    };

    setLoggedFoods((prev) => [newLog, ...prev]);

    setFoodDatabase((prev) =>
      prev.map((f) => (f.id === food.id ? { ...f, usageCount: (f.usageCount || 0) + 1 } : f))
    );
  };

  const updateFoodPortion = (logId: string, newMultiplier: number) => {
    setLoggedFoods((prev) =>
      prev.map((item) => {
        if (item.id !== logId) return item;
        const food = item.foodItem;
        return {
          ...item,
          portionMultiplier: newMultiplier,
          calories: Math.round(food.calories * newMultiplier),
          protein: Math.round(food.protein * newMultiplier * 10) / 10,
          carbohydrates: Math.round(food.carbohydrates * newMultiplier * 10) / 10,
          fat: Math.round(food.fat * newMultiplier * 10) / 10,
          fiber: Math.round(food.fiber * newMultiplier * 10) / 10,
          sugar: Math.round(food.sugar * newMultiplier * 10) / 10,
          sodium: Math.round(food.sodium * newMultiplier),
        };
      })
    );
  };

  const duplicateLoggedFood = (logId: string) => {
    const existing = loggedFoods.find((f) => f.id === logId);
    if (!existing) return;
    const dup: LoggedFood = {
      ...existing,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      loggedAt: new Date().toISOString(),
    };
    setLoggedFoods((prev) => [dup, ...prev]);
  };

  const removeLoggedFood = (logId: string) => {
    setLoggedFoods((prev) => prev.filter((f) => f.id !== logId));
  };

  // Water handlers
  const currentWaterMl = waterLogs[selectedDate] ?? (selectedDate === todayStr ? 1750 : 0);

  const addWater = (ml: number) => {
    setWaterLogs((prev) => {
      const current = prev[selectedDate] || 0;
      return { ...prev, [selectedDate]: Math.max(0, current + ml) };
    });
  };

  const setWater = (ml: number) => {
    setWaterLogs((prev) => ({ ...prev, [selectedDate]: Math.max(0, ml) }));
  };

  const resetWater = () => {
    setWaterLogs((prev) => ({ ...prev, [selectedDate]: 0 }));
  };

  // Weight & Workouts handlers
  const logWeight = (weightKg: number, notes?: string) => {
    const newLog: WeightLog = {
      id: `weight_${Date.now()}`,
      date: selectedDate,
      weightKg,
      notes,
      createdAt: new Date().toISOString(),
    };

    setWeightHistory((prev) => {
      const filtered = prev.filter((w) => w.date !== selectedDate);
      return [...filtered, newLog].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });

    setPersonalInfo((prev) => ({
      ...prev,
      currentWeightKg: weightKg,
    }));
  };

  const logWorkout = (workoutData: {
    workoutType: WorkoutType;
    durationMinutes: number;
    activeCalories: number;
    notes?: string;
  }) => {
    const newWorkout: WorkoutLog = {
      id: `workout_${Date.now()}`,
      date: selectedDate,
      ...workoutData,
      createdAt: new Date().toISOString(),
    };
    setWorkouts((prev) => [newWorkout, ...prev]);

    setActivityDaily((prev) => {
      const existing = prev.find((a) => a.date === selectedDate);
      if (existing) {
        return prev.map((a) =>
          a.date === selectedDate
            ? { ...a, activeCalories: a.activeCalories + workoutData.activeCalories }
            : a
        );
      } else {
        return [
          ...prev,
          {
            date: selectedDate,
            steps: 4000,
            stepGoal: nutritionTargets.stepGoal,
            activeCalories: workoutData.activeCalories,
          },
        ];
      }
    });
  };

  const currentSteps = useMemo(() => {
    const act = activityDaily.find((a) => a.date === selectedDate);
    return act ? act.steps : selectedDate === todayStr ? 7340 : 0;
  }, [activityDaily, selectedDate, todayStr]);

  const addSteps = (stepIncrement: number) => {
    setActivityDaily((prev) => {
      const existing = prev.find((a) => a.date === selectedDate);
      if (existing) {
        return prev.map((a) =>
          a.date === selectedDate ? { ...a, steps: Math.max(0, a.steps + stepIncrement) } : a
        );
      } else {
        return [
          ...prev,
          {
            date: selectedDate,
            steps: Math.max(0, stepIncrement),
            stepGoal: nutritionTargets.stepGoal,
            activeCalories: Math.round(stepIncrement * 0.04),
          },
        ];
      }
    });
  };

  // Fasting handlers
  const updateFastingSchedule = (sched: Partial<FastingSchedule>) => {
    setFastingSchedule((prev) => ({ ...prev, ...sched }));
  };

  const toggleFastingState = () => {
    setFastingSchedule((prev) => {
      const nextIsFasting = !prev.isFasting;
      return {
        ...prev,
        isFasting: nextIsFasting,
        fastStartIso: nextIsFasting ? new Date().toISOString() : undefined,
        streakDays: nextIsFasting ? prev.streakDays : prev.streakDays + 1,
      };
    });
  };

  // Meal Plan handlers
  const addMealPlanItem = (
    dayOfWeek: string,
    mealType: MealType,
    food: FoodItem,
    portionMultiplier = 1
  ) => {
    setMealPlan((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        const newItem = {
          id: `plan_${Date.now()}`,
          mealType,
          food,
          portionMultiplier,
        };
        // Replace if already exists for this meal, or append
        const filtered = day.items.filter((i) => i.mealType !== mealType);
        return {
          ...day,
          items: [...filtered, newItem],
        };
      })
    );
  };

  const removeMealPlanItem = (dayOfWeek: string, itemId: string) => {
    setMealPlan((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, items: day.items.filter((i) => i.id !== itemId) }
          : day
      )
    );
  };

  const copyPlanDayToLog = (dayOfWeek: string) => {
    const day = mealPlan.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;

    const newLogs: LoggedFood[] = day.items.map((item) => ({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: selectedDate,
      mealType: item.mealType,
      foodItem: item.food,
      portionMultiplier: item.portionMultiplier,
      calories: Math.round(item.food.calories * item.portionMultiplier),
      protein: Math.round(item.food.protein * item.portionMultiplier * 10) / 10,
      carbohydrates: Math.round(item.food.carbohydrates * item.portionMultiplier * 10) / 10,
      fat: Math.round(item.food.fat * item.portionMultiplier * 10) / 10,
      fiber: Math.round(item.food.fiber * item.portionMultiplier * 10) / 10,
      sugar: Math.round(item.food.sugar * item.portionMultiplier * 10) / 10,
      sodium: Math.round(item.food.sodium * item.portionMultiplier),
      loggedAt: new Date().toISOString(),
    }));

    setLoggedFoods((prev) => [...newLogs, ...prev]);
  };

  const toggleNutritionFocus = (focus: NutritionFocus) => {
    setNutritionFocus((prev) =>
      prev.includes(focus) ? prev.filter((f) => f !== focus) : [...prev, focus]
    );
  };

  // Google Sheets Live Sync
  const getAppSyncState = (): AppSyncState => {
    return {
      personalInfo,
      weightGoal,
      nutritionTargets,
      calculations,
      foodDatabase,
      loggedFoods,
      weightHistory,
      workouts,
      activityDaily,
      waterLogs,
      fastingSchedule,
      mealPlan,
      weeklyReview,
      aiInsights,
    };
  };

  const updateSheetsConfig = (cfg: Partial<GoogleSheetsConfig>) => {
    setSheetsConfig((prev) => ({ ...prev, ...cfg }));
  };

  const triggerSheetsSync = async () => {
    setSheetsConfig((prev) => ({ ...prev, syncStatus: 'syncing' }));
    try {
      const state = getAppSyncState();
      if (sheetsConfig.webhookUrl) {
        await pushToGoogleSheets(sheetsConfig.webhookUrl, state);
      }
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSheetsSync(nowStr);
      setSheetsConfig((prev) => ({
        ...prev,
        syncStatus: 'synced',
        lastSyncedAt: nowStr,
        isConnected: true,
      }));
    } catch (e: any) {
      setSheetsConfig((prev) => ({
        ...prev,
        syncStatus: 'error',
        errorMessage: e.message,
      }));
    }
  };

  const pullSheetsSync = async () => {
    if (!sheetsConfig.webhookUrl) return;
    setSheetsConfig((prev) => ({ ...prev, syncStatus: 'syncing' }));
    try {
      const res = await pullFromGoogleSheets(sheetsConfig.webhookUrl);
      if (res.success && res.data) {
        // If data pulled successfully, update sync status
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSheetsSync(nowStr);
        setSheetsConfig((prev) => ({
          ...prev,
          syncStatus: 'synced',
          lastSyncedAt: nowStr,
        }));
      }
    } catch (e: any) {
      setSheetsConfig((prev) => ({ ...prev, syncStatus: 'error', errorMessage: e.message }));
    }
  };

  // AI Insights fetch
  const refreshAiInsights = async () => {
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: personalInfo,
          weeklyData: {
            avgWeight: personalInfo.currentWeightKg,
            avgProtein: dayTotals.protein || 92,
            avgCalories: dayTotals.calories || 1620,
            avgWater: (currentWaterMl / 1000).toFixed(1),
            proteinAdherenceDays: 6,
            calorieAdherenceDays: 6,
          },
          goals: {
            weightGoal,
            nutritionTargets,
            nutritionFocus,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.insights && Array.isArray(data.insights)) {
          setAiInsights(data.insights);
        }
        if (data.weeklyReview) {
          setWeeklyReview(data.weeklyReview);
        }
      }
    } catch (e) {
      console.warn('AI insight fetch fallback to internal insights engine', e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const resetAllData = () => {
    setPersonalInfo(INITIAL_PERSONAL_INFO);
    setWeightGoal(INITIAL_WEIGHT_GOAL);
    setNutritionTargets(INITIAL_NUTRITION_TARGETS);
    setNutritionFocus(INITIAL_NUTRITION_FOCUS);
    setFoodDatabase(INITIAL_FOOD_DATABASE);
    setLoggedFoods(generateInitialLoggedFoods(todayStr));
    setWeightHistory(generateInitialWeightHistory());
    setWorkouts(generateInitialWorkouts());
    setActivityDaily(generateInitialActivity());
    setWaterLogs({ [todayStr]: 1750 });
    setFastingSchedule(INITIAL_FASTING_SCHEDULE);
    setMealPlan(INITIAL_MEAL_PLAN);
    setStreaks(INITIAL_HABIT_STREAKS);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setSelectedDate(todayStr);
    localStorage.clear();
  };

  return (
    <HealthContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedDate,
        setSelectedDate,
        goToPreviousDay,
        goToNextDay,
        goToToday,

        language,
        setLanguage,
        darkMode,
        setDarkMode,
        theme,
        setTheme,
        typography,
        setTypography,
        unitSystem,
        setUnitSystem,

        personalInfo,
        updatePersonalInfo: (info) => setPersonalInfo((p) => ({ ...p, ...info })),
        weightGoal,
        updateWeightGoal: (g) => setWeightGoal((prev) => ({ ...prev, ...g })),
        nutritionTargets,
        updateNutritionTargets: (t) => setNutritionTargets((prev) => ({ ...prev, ...t })),
        calculations,
        nutritionFocus,
        toggleNutritionFocus,

        updateMacroPercentages,
        updateMacroGrams,
        setGoalMode,

        foodDatabase,
        addCustomFood,
        toggleFavoriteFood,
        loggedFoods,
        todaysLoggedFoods,
        addFoodToMeal,
        updateFoodPortion,
        duplicateLoggedFood,
        removeLoggedFood,

        dayTotals,

        currentWaterMl,
        addWater,
        setWater,
        resetWater,

        weightHistory,
        logWeight,
        workouts,
        logWorkout,
        activityDaily,
        currentSteps,
        addSteps,

        fastingSchedule,
        updateFastingSchedule,
        toggleFastingState,

        mealPlan,
        addMealPlanItem,
        removeMealPlanItem,
        copyPlanDayToLog,

        streaks,
        aiInsights,
        weeklyReview,
        isLoadingAi,
        refreshAiInsights,
        achievements,

        isSheetsModalOpen,
        setIsSheetsModalOpen,
        sheetsConfig,
        updateSheetsConfig,
        lastSheetsSync,
        triggerSheetsSync,
        pullSheetsSync,
        getAppSyncState,

        calendarConfig,
        updateCalendarConfig: (cfg) => setCalendarConfig((prev) => ({ ...prev, ...cfg })),
        tasksConfig,
        updateTasksConfig: (cfg) => setTasksConfig((prev) => ({ ...prev, ...cfg })),

        quickAddModalMeal,
        setQuickAddModalMeal,

        resetAllData,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error('useHealth must be used within a HealthProvider');
  return ctx;
};
