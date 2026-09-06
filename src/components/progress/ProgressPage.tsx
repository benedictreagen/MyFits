import React, { useState } from 'react';
import {
  Brain,
  Calendar,
  CheckCircle2,
  Flame,
  Info,
  Plus,
  RefreshCw,
  Scale,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useHealth } from '../../context/HealthContext';
import {
  calculateWeightTrends,
  calculateWeeklySummary,
  formatNum,
} from '../../utils/calculations';

export const ProgressPage: React.FC = () => {
  const {
    weightHistory,
    logWeight,
    weightGoal,
    personalInfo,
    loggedFoods,
    nutritionTargets,
    streaks,
    aiInsights,
    weeklyReview,
    isLoadingAi,
    refreshAiInsights,
  } = useHealth();

  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState(String(personalInfo.currentWeightKg));
  const [newWeightNotes, setNewWeightNotes] = useState('');

  // 1. Calculate weight trends with rolling 7-day average
  const weightTrendList = calculateWeightTrends(weightHistory);
  const weightChartData = weightTrendList.map((item) => ({
    date: item.date.slice(5),
    weight: item.weight,
    rollingAvg: item.rollingAvg7Day,
    goal: weightGoal.goalWeightKg,
  }));

  // 2. Aggregate logged foods by day for 14-day history
  const dailyLogsMap = new Map<
    string,
    { date: string; calories: number; protein: number; carbohydrates: number; fat: number; fiber: number }
  >();

  loggedFoods.forEach((lf) => {
    const existing = dailyLogsMap.get(lf.date) || {
      date: lf.date,
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
    };
    existing.calories += lf.calories;
    existing.protein += lf.protein;
    existing.carbohydrates += lf.carbohydrates;
    existing.fat += lf.fat;
    existing.fiber += lf.fiber;
    dailyLogsMap.set(lf.date, existing);
  });

  const dailyLogsList = Array.from(dailyLogsMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weeklySummary = calculateWeeklySummary(dailyLogsList, weightHistory, nutritionTargets);

  const calorieChartData = dailyLogsList.slice(-14).map((log) => ({
    date: log.date.slice(5),
    calories: log.calories,
    budget: nutritionTargets.dailyCalorieBudget,
    protein: log.protein,
    carbs: log.carbohydrates,
    fat: log.fat,
  }));

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    logWeight(Number(newWeight), newWeightNotes.trim() || undefined);
    setIsWeightModalOpen(false);
    setNewWeightNotes('');
  };

  const totalLost = (weightGoal.startingWeightKg - personalInfo.currentWeightKg).toFixed(1);
  const remaining = Math.abs(personalInfo.currentWeightKg - weightGoal.goalWeightKg).toFixed(1);
  const latestRolling = weightTrendList[weightTrendList.length - 1]?.rollingAvg7Day || personalInfo.currentWeightKg;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-[32px] border border-[#F2F1EC] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F4EF] text-[#7D8C6F] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif italic text-[#4A5D4E]">Progress, Trends & Insights</h1>
          </div>
          <p className="text-xs text-[#8C8980] mt-1">
            Analyze weight rolling averages, caloric consistency, macro distribution, and AI health coaching
          </p>
        </div>

        <button
          onClick={() => setIsWeightModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Scale className="w-4 h-4" />
          <span>Log New Weigh-In</span>
        </button>
      </div>

      {/* 1. WEIGHT JOURNEY & 7-DAY ROLLING AVERAGE CARD */}
      <div className="bg-white rounded-[32px] p-6 border border-[#F2F1EC] shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#7D8C6F]" />
              <h2 className="text-base font-bold text-[#4A5D4E]">Weight Trendline & 7-Day Rolling Average</h2>
            </div>
            <p className="text-xs text-[#8C8980] mt-0.5">
              Daily numbers fluctuate with hydration and sodium. The rolling average reveals genuine physiological trend.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F9F8F4] rounded-2xl border border-[#EBE9E1] text-center">
              <span className="text-[10px] uppercase font-bold text-[#8C8980] block">Current</span>
              <span className="text-base font-bold text-[#3D3D3D]">{personalInfo.currentWeightKg} kg</span>
            </div>
            <div className="p-3 bg-[#F5F4EF] rounded-2xl border border-[#EBE9E1] text-center">
              <span className="text-[10px] uppercase font-bold text-[#7D8C6F] block">7-Day Avg</span>
              <span className="text-base font-bold text-[#4A5D4E]">
                {latestRolling} kg
              </span>
            </div>
            <div className="p-3 bg-[#F5F4EF] rounded-2xl border border-[#EBE9E1] text-center">
              <span className="text-[10px] uppercase font-bold text-[#A6826D] block">Total Change</span>
              <span className="text-base font-bold text-[#A6826D]">-{totalLost} kg</span>
            </div>
          </div>
        </div>

        {/* Recharts Weight Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE9E1" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8C8980' }} tickLine={false} />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fontSize: 11, fill: '#8C8980' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1rem',
                  border: '1px solid #EBE9E1',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="weight"
                name="Daily Weigh-In (kg)"
                stroke="#8C8980"
                strokeWidth={1.5}
                dot={{ r: 3, fill: '#8C8980' }}
              />
              <Line
                type="monotone"
                dataKey="rollingAvg"
                name="7-Day Rolling Average"
                stroke="#7D8C6F"
                strokeWidth={3}
                dot={{ r: 4, fill: '#7D8C6F' }}
              />
              <Line
                type="monotone"
                dataKey="goal"
                name="Goal Weight Target"
                stroke="#BC9B6A"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C8980] pt-2 border-t border-[#F0EEE6] gap-2">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#7D8C6F]" />
            <span>Target Pace: ~0.45 kg loss per week aligns with healthy metabolic preservation</span>
          </span>
          <span className="font-bold text-[#4A5D4E]">
            {remaining} kg remaining to goal weight ({weightGoal.goalWeightKg} kg)
          </span>
        </div>
      </div>

      {/* 2. CALORIC INTAKE & HABIT CONSISTENCY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white rounded-[32px] p-6 border border-[#F2F1EC] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#4A5D4E]">Daily Caloric Intake History</h2>
              <p className="text-xs text-[#8C8980]">Recorded days vs daily calorie budget</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F5F4EF] text-[#4A5D4E]">
              Avg: {weeklySummary.averageCalories} kcal/day
            </span>
          </div>

          <div className="h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calorieChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE9E1" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8C8980' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8C8980' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '1rem',
                    border: '1px solid #EBE9E1',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="calories" name="Consumed (kcal)" fill="#7D8C6F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consistency Streaks & Macro Splits */}
        <div className="lg:col-span-4 bg-white rounded-[32px] p-6 border border-[#F2F1EC] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#A6826D] fill-[#A6826D]" />
              <h2 className="text-base font-bold text-[#4A5D4E]">Habit Consistency</h2>
            </div>
            <p className="text-xs text-[#8C8980] mt-0.5">Continuous streaks build long-term lifestyle habits</p>
          </div>

          <div className="space-y-3">
            {streaks.map((s) => (
              <div
                key={s.key}
                className="p-3.5 rounded-2xl bg-[#F9F8F4] border border-[#EBE9E1] flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-[#3D3D3D] block">{s.name}</span>
                  <span className="text-[10px] text-[#8C8980]">Best: {s.bestStreak} days</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F4EF] text-[#A6826D] font-bold text-xs">
                  <Flame className="w-3.5 h-3.5 text-[#A6826D] fill-[#A6826D]" />
                  <span>{s.currentStreak}d</span>
                </div>
              </div>
            ))}
          </div>

          {/* Average Macro Distribution */}
          <div className="pt-3 border-t border-[#F0EEE6]">
            <span className="text-[11px] font-bold text-[#8C8980] uppercase tracking-wider block mb-2">
              Average Macro Intake
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-2xl bg-[#F5F4EF] border border-[#EBE9E1]">
                <span className="text-[10px] text-[#4A5D4E] font-bold block">Protein</span>
                <span className="font-bold text-[#4A5D4E]">{weeklySummary.averageProtein}g</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#F5F4EF] border border-[#EBE9E1]">
                <span className="text-[10px] text-[#A6826D] font-bold block">Carbs</span>
                <span className="font-bold text-[#A6826D]">{weeklySummary.averageCarbs}g</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#F5F4EF] border border-[#EBE9E1]">
                <span className="text-[10px] text-[#BC9B6A] font-bold block">Fat</span>
                <span className="font-bold text-[#BC9B6A]">{weeklySummary.averageFat}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI HEALTH COACH IN DEEP MOSS GREEN #4A5D4E */}
      <div className="bg-[#4A5D4E] rounded-[32px] p-6 sm:p-8 text-white shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-[#E9EAE3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Personal Health Coach Synthesis</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-[#E9EAE3]">
                  Adaptive AI
                </span>
              </div>
              <p className="text-xs text-[#D6D2C4]">
                Synthesis of weekly nutritional intake, energy balance, and physiological metrics
              </p>
            </div>
          </div>

          <button
            onClick={refreshAiInsights}
            disabled={isLoadingAi}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
            <span>{isLoadingAi ? 'Analyzing Trends...' : 'Refresh AI Insights'}</span>
          </button>
        </div>

        {/* Nutrition Quality Score Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#7D8C6F] text-white flex items-center justify-center text-xl font-bold">
              88
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Nutrition Quality Score
              </span>
              <span className="text-[11px] text-[#D6D2C4]">
                High whole-food & micronutrient density
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:border-l md:border-white/10 md:pl-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#D6D2C4] block">Weekly Calorie Deficit</span>
              <span className="text-sm font-bold text-white">
                ~{weeklySummary.averageDeficit} kcal / day
              </span>
              <span className="text-[11px] text-[#D6D2C4] block">
                Pace: ~0.4 kg fat loss / week
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:border-l md:border-white/10 md:pl-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#D6D2C4] block">Protein Adherence</span>
              <span className="text-sm font-bold text-white">
                {weeklySummary.daysHitProteinTarget} of 7 Days On-Target
              </span>
              <span className="text-[11px] text-[#D6D2C4] block">Preserving lean body mass</span>
            </div>
          </div>
        </div>

        {/* AI Recommendations List */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D6D2C4] block">
            Personalized Coaching Feedback
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(aiInsights.length > 0 ? aiInsights : weeklyReview.wins).map((rec, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-start gap-2.5 text-xs text-[#F9F8F4] leading-relaxed"
              >
                <CheckCircle2 className="w-4 h-4 text-[#7D8C6F] shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log Weigh-In Modal */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl border border-[#EBE9E1] space-y-4">
            <h3 className="text-base font-bold text-[#4A5D4E]">Log Morning Weigh-In</h3>
            <p className="text-xs text-[#8C8980]">
              For best accuracy, weigh yourself in the morning after using the bathroom and before breakfast.
            </p>

            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3D3D3D] mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[#EBE9E1] text-base font-bold text-[#4A5D4E] bg-[#F9F8F4] text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3D3D3D] mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Well hydrated, post rest day"
                  value={newWeightNotes}
                  onChange={(e) => setNewWeightNotes(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs text-[#3D3D3D] bg-[#F9F8F4]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWeightModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#EBE9E1] text-xs font-bold text-[#8C8980] hover:bg-[#F5F4EF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Save Weigh-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
