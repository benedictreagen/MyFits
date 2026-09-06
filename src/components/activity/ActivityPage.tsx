import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  Check,
  Clock,
  Dumbbell,
  Droplet,
  Flame,
  Footprints,
  HeartPulse,
  Plus,
  Timer,
  Zap,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { WorkoutType } from '../../types';
import { formatNum } from '../../utils/calculations';

export const ActivityPage: React.FC = () => {
  const {
    currentSteps,
    addSteps,
    nutritionTargets,
    workouts,
    logWorkout,
    activityDaily,
    currentWaterMl,
    addWater,
    fastingSchedule,
    updateFastingSchedule,
    toggleFastingState,
  } = useHealth();

  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [workoutType, setWorkoutType] = useState<WorkoutType>('Strength');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [activeCalories, setActiveCalories] = useState('320');
  const [workoutNotes, setWorkoutNotes] = useState('');

  const stepPct = Math.min(100, Math.round((currentSteps / nutritionTargets.stepGoal) * 100));

  const handleCreateWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!durationMinutes) return;

    logWorkout({
      workoutType,
      durationMinutes: Number(durationMinutes) || 30,
      activeCalories: Number(activeCalories) || 250,
      notes: workoutNotes.trim() || undefined,
    });

    setIsWorkoutModalOpen(false);
    setWorkoutNotes('');
  };

  const workoutTypes: { type: WorkoutType; label: string; icon: string }[] = [
    { type: 'Strength', label: 'Strength', icon: '🏋️' },
    { type: 'Cardio', label: 'Cardio', icon: '🚴' },
    { type: 'HIIT', label: 'HIIT', icon: '⚡' },
    { type: 'Walking', label: 'Walking', icon: '🚶' },
    { type: 'Running', label: 'Running', icon: '🏃' },
    { type: 'Other', label: 'Other', icon: '🧘' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-[32px] border border-[#F2F1EC] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F4EF] text-[#7D8C6F] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif italic text-[#4A5D4E]">Activity, Movement & Fasting</h1>
          </div>
          <p className="text-xs text-[#8C8980] mt-1">
            Track daily movement, scheduled training sessions, hydration, and intermittent fasting windows
          </p>
        </div>

        <button
          onClick={() => setIsWorkoutModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Workout Session</span>
        </button>
      </div>

      {/* Top Grid: Steps & Workouts Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Steps Card */}
        <div className="lg:col-span-6 bg-white rounded-[28px] p-6 border border-[#F2F1EC] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F5F4EF] text-[#7D8C6F] flex items-center justify-center">
                <Footprints className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C8980]">
                Daily Steps
              </span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F5F4EF] text-[#4A5D4E]">
              {stepPct}% of goal
            </span>
          </div>

          <div className="flex items-baseline justify-between my-2">
            <div>
              <span className="text-3xl sm:text-4xl font-bold text-[#3D3D3D] tracking-tight">
                {formatNum(currentSteps)}
              </span>
              <span className="text-sm font-semibold text-[#8C8980] ml-1">
                / {formatNum(nutritionTargets.stepGoal)}
              </span>
              <span className="block text-xs text-[#8C8980] mt-0.5">steps today</span>
            </div>

            <div className="text-right">
              <span className="text-xl font-bold text-[#4A5D4E]">
                ~{Math.round(currentSteps * 0.04)}
              </span>
              <span className="text-xs font-semibold text-[#8C8980] ml-1">kcal</span>
              <span className="block text-xs text-[#8C8980] mt-0.5">Active burn</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-[#F0EEE6] rounded-full overflow-hidden p-0.5">
            <div
              style={{ width: `${stepPct}%` }}
              className="h-full bg-[#7D8C6F] rounded-full transition-all duration-500"
            />
          </div>

          {/* Quick Steps increment */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#F0EEE6]">
            <span className="text-xs font-semibold text-[#8C8980]">Quick Add:</span>
            {[1000, 2500, 5000].map((num) => (
              <button
                key={num}
                onClick={() => addSteps(num)}
                className="flex-1 py-1.5 px-2 rounded-xl bg-[#F9F8F4] hover:bg-[#F5F4EF] hover:text-[#4A5D4E] text-[#3D3D3D] border border-[#EBE9E1] text-xs font-bold transition-colors cursor-pointer text-center"
              >
                +{formatNum(num)}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Activity Trends */}
        <div className="lg:col-span-6 bg-white rounded-[28px] p-6 border border-[#F2F1EC] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F5F4EF] text-[#A6826D] flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C8980]">
                7-Day Activity Trends
              </span>
            </div>
            <span className="text-xs font-bold text-[#8C8980]">Last 7 Days</span>
          </div>

          {/* Mini Bar Chart */}
          <div className="grid grid-cols-7 gap-2 items-end h-32 pt-2">
            {activityDaily.slice(-7).map((act, i) => {
              const heightPct = Math.min(100, Math.round((act.steps / 11000) * 100));
              const isMet = act.steps >= act.stepGoal;
              const dayLabel = act.date.slice(8, 10);

              return (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-[#3D3D3D]">
                    {(act.steps / 1000).toFixed(1)}k
                  </span>
                  <div className="w-full bg-[#F0EEE6] rounded-t-lg overflow-hidden flex items-end h-20">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all ${
                        isMet ? 'bg-[#7D8C6F]' : 'bg-[#BC9B6A]'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-[#8C8980] font-medium">{dayLabel}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#F0EEE6] flex items-center justify-between text-xs text-[#8C8980]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7D8C6F]" />
              <span>Goal Met (8,500+)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BC9B6A]" />
              <span>Under Target</span>
            </span>
          </div>
        </div>
      </div>

      {/* Hydration Section in Natural Tones #E9EAE3 */}
      <div className="bg-[#E9EAE3] rounded-[32px] p-6 border border-[#E0E2D8] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#7D8C6F] flex items-center justify-center shadow-xs">
              <Droplet className="w-5 h-5 fill-[#7D8C6F]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#4A5D4E]">Daily Hydration Practice</h2>
              <p className="text-xs text-[#8C8980]">
                Maintains metabolic rhythm, cognitive vitality, and mindful digestion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#3D3D3D]">
              {(currentWaterMl / 1000).toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-[#8C8980]">
              / {(nutritionTargets.waterGoalMl / 1000).toFixed(1)} Liters
            </span>
          </div>
        </div>

        {/* Big Water Capacity Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-4 bg-white/70 rounded-full overflow-hidden p-0.5 border border-[#E0E2D8]">
            <div
              style={{
                width: `${Math.min(100, Math.round((currentWaterMl / nutritionTargets.waterGoalMl) * 100))}%`,
              }}
              className="h-full bg-[#7D8C6F] rounded-full transition-all duration-500"
            />
          </div>
          <div className="flex justify-between text-xs text-[#8C8980]">
            <span>{currentWaterMl} mL logged today</span>
            <span>
              {currentWaterMl >= nutritionTargets.waterGoalMl
                ? '✓ Optimal Hydration Target Reached'
                : `${nutritionTargets.waterGoalMl - currentWaterMl} mL left to goal`}
            </span>
          </div>
        </div>

        {/* Quick add buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => addWater(250)}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-white hover:bg-[#F9F8F4] text-[#4A5D4E] text-xs font-bold transition-colors cursor-pointer text-center border border-[#E0E2D8] shadow-xs"
          >
            +250 mL Glass
          </button>
          <button
            onClick={() => addWater(500)}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-white hover:bg-[#F9F8F4] text-[#4A5D4E] text-xs font-bold transition-colors cursor-pointer text-center border border-[#E0E2D8] shadow-xs"
          >
            +500 mL Bottle
          </button>
          <button
            onClick={() => addWater(750)}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold transition-colors cursor-pointer text-center shadow-xs"
          >
            +750 mL Shaker
          </button>
        </div>
      </div>

      {/* Intermittent Fasting (12:12, 14:10, 16:8, Custom) */}
      <div className="bg-white rounded-[32px] p-6 border border-[#F2F1EC] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F4EF] text-[#7D8C6F] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#4A5D4E]">Intermittent Fasting Schedule</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F4EF] text-[#4A5D4E] border border-[#EBE9E1]">
                  Gentle Rhythm
                </span>
              </div>
              <p className="text-xs text-[#8C8980]">
                Flexible circadian feeding window supporting cellular autophagy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#F9F8F4] rounded-2xl border border-[#EBE9E1]">
            {(['12:12', '14:10', '16:8', 'custom'] as const).map((sched) => (
              <button
                key={sched}
                onClick={() => {
                  let fh = 16;
                  let eh = 8;
                  if (sched === '12:12') {
                    fh = 12;
                    eh = 12;
                  } else if (sched === '14:10') {
                    fh = 14;
                    eh = 10;
                  }
                  updateFastingSchedule({ type: sched, fastingHours: fh, eatingHours: eh });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  fastingSchedule.type === sched
                    ? 'bg-white text-[#3D3D3D] shadow-xs'
                    : 'text-[#8C8980] hover:text-[#3D3D3D]'
                }`}
              >
                {sched}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#F9F8F4] border border-[#EBE9E1] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#8C8980]">Eating Window Start</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7D8C6F]" />
              <input
                type="time"
                value={fastingSchedule.eatingWindowStart || '11:00'}
                onChange={(e) => updateFastingSchedule({ eatingWindowStart: e.target.value })}
                className="text-sm font-bold text-[#3D3D3D] bg-transparent border-none focus:outline-hidden cursor-pointer"
              />
            </div>
            <span className="text-[11px] text-[#8C8980]">First meal of the day</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9F8F4] border border-[#EBE9E1] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#8C8980]">Eating Window End</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A6826D]" />
              <input
                type="time"
                value={fastingSchedule.eatingWindowEnd || '19:00'}
                onChange={(e) => updateFastingSchedule({ eatingWindowEnd: e.target.value })}
                className="text-sm font-bold text-[#3D3D3D] bg-transparent border-none focus:outline-hidden cursor-pointer"
              />
            </div>
            <span className="text-[11px] text-[#8C8980]">Kitchen closes / Fast begins</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F4EF] border border-[#EBE9E1] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C8980]">Consistency Streak</span>
              <p className="text-xl font-bold text-[#4A5D4E] mt-0.5">
                {fastingSchedule.streakDays} Days
              </p>
              <span className="text-[11px] text-[#8C8980]">Natural circadian habit</span>
            </div>

            <button
              onClick={toggleFastingState}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
                fastingSchedule.isFasting
                  ? 'bg-[#7D8C6F] hover:bg-[#68765c] text-white'
                  : 'bg-[#A6826D] hover:bg-[#8f6e5b] text-white'
              }`}
            >
              {fastingSchedule.isFasting ? 'End Fast' : 'Start Fast'}
            </button>
          </div>
        </div>
      </div>

      {/* Workouts History List */}
      <div className="bg-white rounded-[32px] p-6 border border-[#F2F1EC] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#4A5D4E]">Logged Workouts & Movement</h2>
            <p className="text-xs text-[#8C8980]">Recorded physical activity and active caloric burn</p>
          </div>
          <span className="text-xs font-bold text-[#4A5D4E] bg-[#F5F4EF] px-3 py-1 rounded-full border border-[#EBE9E1]">
            {workouts.length} workouts logged
          </span>
        </div>

        <div className="space-y-3">
          {workouts.map((w) => (
            <div
              key={w.id}
              className="p-4 rounded-2xl bg-[#F9F8F4] border border-[#F0EEE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#EBE9E1] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F5F4EF] text-[#4A5D4E] flex items-center justify-center font-bold text-base shadow-2xs">
                  {w.workoutType === 'Strength'
                    ? '🏋️'
                    : w.workoutType === 'Cardio'
                    ? '🚴'
                    : w.workoutType === 'HIIT'
                    ? '⚡'
                    : w.workoutType === 'Walking'
                    ? '🚶'
                    : '🏃'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#3D3D3D]">{w.workoutType} Session</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#EBE9E1] text-[#4A5D4E]">
                      {w.date}
                    </span>
                  </div>
                  {w.notes && <p className="text-xs text-[#8C8980] mt-0.5">{w.notes}</p>}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8C8980] block">Duration</span>
                  <span className="font-bold text-[#3D3D3D]">{w.durationMinutes} min</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#A6826D] block">Energy Burn</span>
                  <span className="font-bold text-[#A6826D]">~{w.activeCalories} kcal</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Workout Modal */}
      {isWorkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl border border-[#EBE9E1] space-y-4">
            <h3 className="text-base font-bold text-[#4A5D4E]">Log Workout Session</h3>

            <form onSubmit={handleCreateWorkout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3D3D3D] mb-1.5">
                  Workout Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {workoutTypes.map((wt) => (
                    <button
                      key={wt.type}
                      type="button"
                      onClick={() => setWorkoutType(wt.type)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 justify-center transition-all cursor-pointer ${
                        workoutType === wt.type
                          ? 'border-[#7D8C6F] bg-[#F5F4EF] text-[#4A5D4E]'
                          : 'border-[#EBE9E1] text-[#8C8980] hover:bg-[#F9F8F4]'
                      }`}
                    >
                      <span>{wt.icon}</span>
                      <span>{wt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#3D3D3D] mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#EBE9E1] text-xs font-bold text-[#3D3D3D] bg-[#F9F8F4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D3D3D] mb-1">
                    Estimated Calories
                  </label>
                  <input
                    type="number"
                    required
                    value={activeCalories}
                    onChange={(e) => setActiveCalories(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#EBE9E1] text-xs font-bold text-[#A6826D] bg-[#F9F8F4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3D3D3D] mb-1">Notes / Routine</label>
                <input
                  type="text"
                  placeholder="e.g. Upper body pulls + core"
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#EBE9E1] text-xs text-[#3D3D3D] bg-[#F9F8F4]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWorkoutModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#EBE9E1] text-xs font-bold text-[#8C8980] hover:bg-[#F5F4EF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Save Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
