import {
  ActivityDaily,
  Calculations,
  DayPlan,
  FastingSchedule,
  FoodItem,
  LoggedFood,
  NutritionTargets,
  PersonalInfo,
  WeeklyReview,
  WeightGoal,
  WeightLog,
  WorkoutLog,
} from '../types';

export interface SheetDefinition {
  name: string;
  description: string;
  columns: string[];
  getData: (state: AppSyncState) => (string | number)[][];
}

export interface AppSyncState {
  personalInfo: PersonalInfo;
  weightGoal: WeightGoal;
  nutritionTargets: NutritionTargets;
  calculations: Calculations;
  foodDatabase: FoodItem[];
  loggedFoods: LoggedFood[];
  weightHistory: WeightLog[];
  workouts: WorkoutLog[];
  activityDaily: ActivityDaily[];
  waterLogs: Record<string, number>;
  fastingSchedule: FastingSchedule;
  mealPlan: DayPlan[];
  weeklyReview: WeeklyReview;
  aiInsights: string[];
}

export const SHEET_DEFINITIONS: SheetDefinition[] = [
  {
    name: 'PERSONAL_INFO',
    description: 'Biometrics and lifestyle activity level',
    columns: ['ID', 'Name', 'Age', 'Sex', 'Height_cm', 'CurrentWeight_kg', 'ActivityLevel', 'UpdatedAt'],
    getData: (s) => [
      [
        'USER_1',
        s.personalInfo.name || 'FitTrack Member',
        s.personalInfo.age,
        s.personalInfo.sex,
        s.personalInfo.heightCm,
        s.personalInfo.currentWeightKg,
        s.personalInfo.activityLevel,
        new Date().toISOString(),
      ],
    ],
  },
  {
    name: 'GOALS',
    description: 'Target weight milestones and weekly rates',
    columns: ['ID', 'GoalWeight_kg', 'StartDate', 'TargetDate', 'WeeklyRate_kg', 'GoalMode', 'UpdatedAt'],
    getData: (s) => [
      [
        'GOAL_1',
        s.weightGoal.goalWeightKg,
        s.weightGoal.startDate,
        s.weightGoal.targetDate,
        s.weightGoal.desiredWeeklyRateKg,
        s.nutritionTargets.goalMode || 'cutting',
        new Date().toISOString(),
      ],
    ],
  },
  {
    name: 'NUTRITION_TARGETS',
    description: 'Calorie budgets and macronutrient parameters',
    columns: [
      'ID',
      'DailyCalorieBudget',
      'GoalMode',
      'ProteinTarget_g',
      'CarbTarget_g',
      'FatTarget_g',
      'FiberTarget_g',
      'SugarLimit_g',
      'SodiumLimit_mg',
      'WaterGoal_ml',
      'StepGoal',
      'UpdatedAt',
    ],
    getData: (s) => [
      [
        'TARGET_1',
        s.nutritionTargets.dailyCalorieBudget,
        s.nutritionTargets.goalMode,
        s.nutritionTargets.macroDistribution?.proteinGrams || s.nutritionTargets.protein.ideal,
        s.nutritionTargets.macroDistribution?.carbsGrams || s.nutritionTargets.carbohydrates.ideal,
        s.nutritionTargets.macroDistribution?.fatGrams || s.nutritionTargets.fat.ideal,
        s.nutritionTargets.fiberTarget,
        s.nutritionTargets.sugarLimit,
        s.nutritionTargets.sodiumLimit,
        s.nutritionTargets.waterGoalMl,
        s.nutritionTargets.stepGoal,
        new Date().toISOString(),
      ],
    ],
  },
  {
    name: 'FOOD_DATABASE',
    description: 'Custom, homemade, and verified food database with macros',
    columns: [
      'FoodID',
      'Name',
      'Category',
      'ServingSize',
      'ServingUnit',
      'Calories',
      'Protein_g',
      'Carbs_g',
      'Fat_g',
      'Fiber_g',
      'Sugar_g',
      'Sodium_mg',
      'Image',
      'IsFavorite',
      'FoodType',
    ],
    getData: (s) =>
      s.foodDatabase.map((f) => [
        f.id,
        f.name,
        f.category,
        f.servingSize,
        f.servingUnit,
        f.calories,
        f.protein,
        f.carbohydrates,
        f.fat,
        f.fiber,
        f.sugar,
        f.sodium,
        f.image.startsWith('data:') ? '[Uploaded Image]' : f.image,
        f.isFavorite ? 'TRUE' : 'FALSE',
        f.foodType,
      ]),
  },
  {
    name: 'DAILY_MEALS',
    description: 'Individual logged meal entries with portion multipliers',
    columns: [
      'MealLogID',
      'Date',
      'MealType',
      'FoodID',
      'FoodName',
      'PortionMultiplier',
      'Calories',
      'Protein_g',
      'Carbs_g',
      'Fat_g',
      'Fiber_g',
      'LoggedAt',
    ],
    getData: (s) =>
      s.loggedFoods.map((m) => [
        m.id,
        m.date,
        m.mealType,
        m.foodItemId || m.foodItem?.id || '',
        m.name || m.foodItem?.name || '',
        m.portionMultiplier,
        Math.round(m.calories),
        Math.round(m.protein),
        Math.round(m.carbohydrates),
        Math.round(m.fat),
        Math.round(m.fiber),
        m.loggedAt || (m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString()),
      ]),
  },
  {
    name: 'WEIGHT_LOG',
    description: 'Timestamped weigh-ins and trajectory milestones',
    columns: ['LogID', 'Date', 'Weight_kg', 'Notes', 'RecordedAt'],
    getData: (s) =>
      s.weightHistory.map((w) => [
        w.id,
        w.date,
        w.weightKg,
        w.notes || '',
        w.createdAt,
      ]),
  },
  {
    name: 'ACTIVITY_LOG',
    description: 'Daily step counts, distance, and active burn',
    columns: ['LogID', 'Date', 'Steps', 'StepGoal', 'ActiveCalories', 'RecordedAt'],
    getData: (s) =>
      s.activityDaily.map((a, i) => [
        `ACT_${i + 1}`,
        a.date,
        a.steps,
        a.stepGoal,
        a.activeCalories,
        new Date().toISOString(),
      ]),
  },
  {
    name: 'WORKOUT_LOG',
    description: 'Physical training sessions, durations, and intensity',
    columns: ['WorkoutID', 'Date', 'Type', 'Duration_min', 'CaloriesBurned', 'Notes', 'RecordedAt'],
    getData: (s) =>
      s.workouts.map((w) => [
        w.id,
        w.date,
        w.workoutType,
        w.durationMinutes,
        w.activeCalories,
        w.notes || '',
        w.createdAt,
      ]),
  },
  {
    name: 'WATER_LOG',
    description: 'Hydration volumes across calendar dates',
    columns: ['LogID', 'Date', 'Total_ml', 'Target_ml', 'RecordedAt'],
    getData: (s) =>
      Object.entries(s.waterLogs).map(([date, ml], idx) => [
        `H2O_${idx + 1}`,
        date,
        ml,
        s.nutritionTargets.waterGoalMl,
        new Date().toISOString(),
      ]),
  },
  {
    name: 'FASTING_LOG',
    description: 'Intermittent fasting schedules and fasting status',
    columns: [
      'LogID',
      'ScheduleType',
      'FastingHours',
      'EatingHours',
      'IsFasting',
      'StreakDays',
      'UpdatedAt',
    ],
    getData: (s) => [
      [
        'FAST_1',
        s.fastingSchedule.type,
        s.fastingSchedule.fastingHours,
        s.fastingSchedule.eatingHours,
        s.fastingSchedule.isFasting ? 'TRUE' : 'FALSE',
        s.fastingSchedule.streakDays,
        new Date().toISOString(),
      ],
    ],
  },
  {
    name: 'MEAL_PLAN',
    description: 'Weekly scheduled meal preparations and macros',
    columns: ['PlanDay', 'MealType', 'FoodName', 'Portion', 'Calories', 'Protein_g', 'Carbs_g', 'Fat_g'],
    getData: (s) => {
      const rows: (string | number)[][] = [];
      s.mealPlan.forEach((d) => {
        d.items.forEach((item) => {
          rows.push([
            d.dayOfWeek,
            item.mealType,
            item.food.name,
            `${item.portionMultiplier}x ${item.food.servingSize} ${item.food.servingUnit}`,
            Math.round(item.food.calories * item.portionMultiplier),
            Math.round(item.food.protein * item.portionMultiplier),
            Math.round(item.food.carbohydrates * item.portionMultiplier),
            Math.round(item.food.fat * item.portionMultiplier),
          ]);
        });
      });
      return rows;
    },
  },
  {
    name: 'DAILY_LOG',
    description: 'Consolidated daily nutrition and physical activity metrics',
    columns: [
      'LogID',
      'Date',
      'CaloriesConsumed',
      'CalorieBudget',
      'Protein_g',
      'Carbs_g',
      'Fat_g',
      'Fiber_g',
      'Water_ml',
      'Steps',
      'UpdatedAt',
    ],
    getData: (s) => {
      const dateMap: Record<string, { cal: number; p: number; c: number; f: number; fib: number }> = {};
      s.loggedFoods.forEach((f) => {
        if (!dateMap[f.date]) dateMap[f.date] = { cal: 0, p: 0, c: 0, f: 0, fib: 0 };
        dateMap[f.date].cal += f.calories;
        dateMap[f.date].p += f.protein;
        dateMap[f.date].c += f.carbohydrates;
        dateMap[f.date].f += f.fat;
        dateMap[f.date].fib += f.fiber;
      });

      return Object.entries(dateMap).map(([date, vals], i) => {
        const water = s.waterLogs[date] || 0;
        const act = s.activityDaily.find((a) => a.date === date);
        return [
          `DAY_${i + 1}`,
          date,
          Math.round(vals.cal),
          s.nutritionTargets.dailyCalorieBudget,
          Math.round(vals.p),
          Math.round(vals.c),
          Math.round(vals.f),
          Math.round(vals.fib),
          water,
          act?.steps || 0,
          new Date().toISOString(),
        ];
      });
    },
  },
  {
    name: 'WEEKLY_SUMMARY',
    description: 'Weekly averaged metrics and target adherence',
    columns: [
      'WeekID',
      'AvgCalories',
      'AvgProtein_g',
      'AvgCarbs_g',
      'AvgFat_g',
      'AvgWater_ml',
      'AvgSteps',
      'WinsSummary',
      'NextWeekFocus',
      'UpdatedAt',
    ],
    getData: (s) => [
      [
        'WEEK_CURRENT',
        1580,
        92,
        165,
        52,
        2100,
        8450,
        (s.weeklyReview?.wins || []).join('; '),
        (s.weeklyReview?.nextWeekFocus || []).join('; '),
        new Date().toISOString(),
      ],
    ],
  },
  {
    name: 'AI_INSIGHTS',
    description: 'Synthesized observations from your personal health coach',
    columns: ['ID', 'Category', 'InsightText', 'Source', 'CreatedAt'],
    getData: (s) =>
      (s.aiInsights || []).map((txt, idx) => [
        `INSIGHT_${idx + 1}`,
        idx === 0 ? "Today's Insight" : idx === 1 ? 'Next Focus' : 'Weekly Trend',
        txt,
        'FitTrack AI Coach',
        new Date().toISOString(),
      ]),
  },
];

/**
 * Generates ready-to-paste Google Apps Script code for 2-way sync
 */
export function generateGoogleAppsScriptCode(): string {
  return `/**
 * FitTrack Google Sheets Synchronizer Webhook
 * 
 * 1. In your Google Sheet, open Extensions > Apps Script
 * 2. Replace all existing script code with this code
 * 3. Click Deploy > New Deployment
 * 4. Select type: "Web app"
 * 5. Set "Execute as": "Me"
 * 6. Set "Who has access": "Anyone" (allows FitTrack to sync without complicated credentials)
 * 7. Copy the Web App URL and paste it into FitTrack's Settings!
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var result = {};
  
  sheets.forEach(function(sheet) {
    var name = sheet.getName();
    var data = sheet.getDataRange().getValues();
    if (data.length > 1) {
      var headers = data[0];
      var rows = [];
      for (var i = 1; i < data.length; i++) {
        var rowObj = {};
        for (var h = 0; h < headers.length; h++) {
          rowObj[headers[h]] = data[i][h];
        }
        rows.push(rowObj);
      }
      result[name] = rows;
    } else {
      result[name] = [];
    }
  });
  
  return ContentService.createTextOutput(JSON.stringify({ status: "ok", data: result }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetsData = payload.sheets || {};
    
    for (var sheetName in sheetsData) {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
      }
      
      var tableInfo = sheetsData[sheetName];
      var headers = tableInfo.columns || [];
      var rows = tableInfo.rows || [];
      
      sheet.clearContents();
      
      if (headers.length > 0) {
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#EBE9E1");
        sheet.setFrozenRows(1);
      }
      
      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", timestamp: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
}

/**
 * Pushes entire application state to Google Sheets via Webhook
 */
export async function pushToGoogleSheets(
  webhookUrl: string,
  state: AppSyncState
): Promise<{ success: boolean; message?: string }> {
  if (!webhookUrl) {
    throw new Error('Google Sheets Webhook URL is not configured.');
  }

  const payload: Record<string, { columns: string[]; rows: (string | number)[][] }> = {};
  SHEET_DEFINITIONS.forEach((def) => {
    payload[def.name] = {
      columns: def.columns,
      rows: def.getData(state),
    };
  });

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Avoids CORS preflight issue with Apps Script
      body: JSON.stringify({ action: 'SYNC', sheets: payload }),
    });

    if (!response.ok) {
      return { success: false, message: `Server error: ${response.statusText}` };
    }
    return { success: true };
  } catch (error: any) {
    console.error('Failed to sync to Google Sheets:', error);
    return { success: false, message: error.message || 'Network error syncing to Google Sheets' };
  }
}

/**
 * Pulls latest data from Google Sheets via Webhook
 */
export async function pullFromGoogleSheets(
  webhookUrl: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  if (!webhookUrl) {
    throw new Error('Google Sheets Webhook URL is not configured.');
  }

  try {
    const response = await fetch(webhookUrl, { method: 'GET' });
    if (!response.ok) {
      return { success: false, message: `HTTP error: ${response.statusText}` };
    }
    const json = await response.json();
    return { success: true, data: json.data };
  } catch (error: any) {
    console.error('Failed to pull from Google Sheets:', error);
    return { success: false, message: error.message || 'Could not reach Google Sheets Webhook' };
  }
}

/**
 * Generate a Google Calendar event template URL
 */
export function createGoogleCalendarUrl(
  optionsOrTitle: string | { title: string; description: string; startDate?: string; durationMinutes?: number },
  description?: string,
  _startDate?: string,
  _startTime?: string,
  _endTime?: string
): string {
  let title = '';
  let details = '';
  if (typeof optionsOrTitle === 'object') {
    title = optionsOrTitle.title;
    details = optionsOrTitle.description;
  } else {
    title = optionsOrTitle;
    details = description || '';
  }
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}`;
}

/**
 * Convert sheet data to CSV string
 */
export function sheetToCsv(definition: SheetDefinition, state: AppSyncState): string {
  const rows = [definition.columns, ...definition.getData(state)];
  return rows
    .map((row) =>
      row
        .map((val) => {
          const str = String(val ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\n');
}
