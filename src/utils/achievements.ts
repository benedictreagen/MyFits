import { AppSyncState } from './googleSheetsSync';

export interface AchievementBadge {
  id: string;
  titleEn: string;
  titleId: string;
  descriptionEn: string;
  descriptionId: string;
  iconName: string;
  category: 'streak' | 'weight' | 'nutrition' | 'activity' | 'lifestyle';
  tier: 'bronze' | 'silver' | 'gold' | 'emerald';
  isUnlocked: boolean;
  unlockedAt?: string;
  currentValue: number;
  targetValue: number;
  unit: string;
}

export const INITIAL_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'streak_7_day',
    titleEn: '7-Day Logging Streak',
    titleId: 'Konsistensi Catat 7 Hari',
    descriptionEn: 'Logged daily meals for 7 consecutive days without missing a single entry.',
    descriptionId: 'Mencatat makanan harian selama 7 hari berturut-turut.',
    iconName: 'Flame',
    category: 'streak',
    tier: 'gold',
    isUnlocked: true,
    unlockedAt: '2026-08-30',
    currentValue: 12,
    targetValue: 7,
    unit: 'days',
  },
  {
    id: 'first_10_lbs',
    titleEn: 'First 10 lbs Lost',
    titleId: '10 Pon Pertama Berkurang',
    descriptionEn: 'Lost 4.5+ kg (10 lbs) sustainably through steady nutrition habits.',
    descriptionId: 'Mengurangi 4.5+ kg secara berkelanjutan melalui kebiasaan nutrisi yang seimbang.',
    iconName: 'Scale',
    category: 'weight',
    tier: 'gold',
    isUnlocked: true,
    unlockedAt: '2026-08-28',
    currentValue: 4.8,
    targetValue: 4.5,
    unit: 'kg',
  },
  {
    id: 'macro_master',
    titleEn: 'Consistent Macro Tracking',
    titleId: 'Ketepatan Makronutrien',
    descriptionEn: 'Met your daily protein target on 5 or more days this week.',
    descriptionId: 'Mencapai target protein harian selama 5 hari atau lebih dalam seminggu.',
    iconName: 'Target',
    category: 'nutrition',
    tier: 'emerald',
    isUnlocked: true,
    unlockedAt: '2026-09-02',
    currentValue: 5,
    targetValue: 5,
    unit: 'days',
  },
  {
    id: 'hydration_hero',
    titleEn: 'Hydration Hero',
    titleId: 'Pahlawan Hidrasi',
    descriptionEn: 'Reached your daily water target of 2.0L+ on 7 different days.',
    descriptionId: 'Mencapai target asupan air harian 2.0L+ sebanyak 7 hari berbeda.',
    iconName: 'Droplet',
    category: 'lifestyle',
    tier: 'silver',
    isUnlocked: true,
    unlockedAt: '2026-09-01',
    currentValue: 8,
    targetValue: 7,
    unit: 'days',
  },
  {
    id: 'step_champion',
    titleEn: 'Step Champion',
    titleId: 'Juara Langkah 10K',
    descriptionEn: 'Achieved 10,000+ steps in a single day of purposeful movement.',
    descriptionId: 'Mencapai 10.000+ langkah dalam satu hari aktivitas aktif.',
    iconName: 'Footprints',
    category: 'activity',
    tier: 'gold',
    isUnlocked: true,
    unlockedAt: '2026-08-31',
    currentValue: 10420,
    targetValue: 10000,
    unit: 'steps',
  },
  {
    id: 'fasting_flow',
    titleEn: 'Fasting Master',
    titleId: 'Konsistensi Puasa Intermiten',
    descriptionEn: 'Completed 5 clean intermittent fasting windows aligned with your schedule.',
    descriptionId: 'Menyelesaikan 5 jendela puasa intermiten sesuai jadwal pilihan Anda.',
    iconName: 'Clock',
    category: 'lifestyle',
    tier: 'silver',
    isUnlocked: true,
    unlockedAt: '2026-09-03',
    currentValue: 7,
    targetValue: 5,
    unit: 'fasts',
  },
  {
    id: 'whole_foods',
    titleEn: 'Whole Foods Pioneer',
    titleId: 'Pelopor Makanan Utuh',
    descriptionEn: 'Incorporated at least 15 fresh produce and plant foods into your weekly log.',
    descriptionId: 'Memasukkan minimal 15 jenis buah dan sayur segar dalam catatan mingguan Anda.',
    iconName: 'Sparkles',
    category: 'nutrition',
    tier: 'emerald',
    isUnlocked: false,
    currentValue: 12,
    targetValue: 15,
    unit: 'foods',
  },
  {
    id: 'century_logger',
    titleEn: 'Century Logger',
    titleId: 'Pencatat 100 Makanan',
    descriptionEn: 'Logged over 100 individual meals and snacks into FitTrack.',
    descriptionId: 'Telah mencatat lebih dari 100 makanan dan camilan di FitTrack.',
    iconName: 'Utensils',
    category: 'streak',
    tier: 'emerald',
    isUnlocked: false,
    currentValue: 64,
    targetValue: 100,
    unit: 'meals',
  },
];

export function evaluateAchievements(
  currentBadges: AchievementBadge[],
  state: AppSyncState
): { badges: AchievementBadge[]; newlyUnlocked: AchievementBadge[] } {
  const loggingStreak =
    (state as any).streaks?.find((s: any) => s.key === 'foodLogging')?.currentStreak || 0;
  
  // Calculate weight lost from highest weight in history vs current
  const weights = state.weightHistory.map((w) => w.weightKg);
  const highestWeight = weights.length > 0 ? Math.max(...weights) : state.personalInfo.currentWeightKg;
  const weightLost = Math.max(0, highestWeight - state.personalInfo.currentWeightKg);

  const totalMealsLogged = state.loggedFoods.length;

  const hydrationDaysMet = Object.values(state.waterLogs).filter(
    (ml) => ml >= state.nutritionTargets.waterGoalMl
  ).length;

  const maxSteps = state.activityDaily.length > 0
    ? Math.max(...state.activityDaily.map((a) => a.steps))
    : 0;

  const fastingStreaks = state.fastingSchedule?.streakDays || 0;

  const newlyUnlocked: AchievementBadge[] = [];

  const updatedBadges = currentBadges.map((badge) => {
    let curr = badge.currentValue;
    let unlocked = badge.isUnlocked;

    switch (badge.id) {
      case 'streak_7_day':
        curr = loggingStreak;
        break;
      case 'first_10_lbs':
        curr = Number(weightLost.toFixed(1));
        break;
      case 'hydration_hero':
        curr = hydrationDaysMet;
        break;
      case 'step_champion':
        curr = maxSteps;
        break;
      case 'fasting_flow':
        curr = fastingStreaks;
        break;
      case 'century_logger':
        curr = totalMealsLogged;
        break;
      default:
        break;
    }

    if (!unlocked && curr >= badge.targetValue) {
      unlocked = true;
      const updated = {
        ...badge,
        currentValue: curr,
        isUnlocked: true,
        unlockedAt: new Date().toISOString().split('T')[0],
      };
      newlyUnlocked.push(updated);
      return updated;
    }

    return {
      ...badge,
      currentValue: curr,
      isUnlocked: unlocked,
    };
  });

  return { badges: updatedBadges, newlyUnlocked };
}
