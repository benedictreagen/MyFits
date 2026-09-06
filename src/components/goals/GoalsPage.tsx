import React, { useState } from 'react';
import {
  Activity,
  Calculator,
  Check,
  Flame,
  Info,
  RotateCcw,
  Save,
  Scale,
  Sparkles,
  Target,
  User,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { ActivityLevel } from '../../types';
import {
  calculateBMR,
  calculateCalorieBudget,
  calculateTDEE,
} from '../../utils/calculations';

export const GoalsPage: React.FC = () => {
  const {
    personalInfo,
    updatePersonalInfo,
    weightGoal,
    updateWeightGoal,
    nutritionTargets,
    updateNutritionTargets,
    resetAllData,
  } = useHealth();

  // Local form state
  const [age, setAge] = useState(String(personalInfo.age));
  const [sex, setSex] = useState<'female' | 'male'>(personalInfo.sex || 'female');
  const [heightCm, setHeightCm] = useState(String(personalInfo.heightCm));
  const [currentWeightKg, setCurrentWeightKg] = useState(String(personalInfo.currentWeightKg));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(personalInfo.activityLevel);

  const [startingWeightKg, setStartingWeightKg] = useState(String(weightGoal.startingWeightKg));
  const [goalWeightKg, setGoalWeightKg] = useState(String(weightGoal.goalWeightKg));
  const [targetDate, setTargetDate] = useState(weightGoal.targetDate);
  const [weeklyRate, setWeeklyRate] = useState(String(weightGoal.desiredWeeklyRateKg));

  // Custom macro values
  const [calorieBudget, setCalorieBudget] = useState(String(nutritionTargets.dailyCalorieBudget));
  const [proteinIdeal, setProteinIdeal] = useState(String(nutritionTargets.protein.ideal));
  const [carbsIdeal, setCarbsIdeal] = useState(String(nutritionTargets.carbohydrates.ideal));
  const [fatIdeal, setFatIdeal] = useState(String(nutritionTargets.fat.ideal));
  const [fiberTarget, setFiberTarget] = useState(String(nutritionTargets.fiberTarget));
  const [waterGoalMl, setWaterGoalMl] = useState(String(nutritionTargets.waterGoalMl));
  const [stepGoal, setStepGoal] = useState(String(nutritionTargets.stepGoal));

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live scientific recalculation
  const liveBMR = calculateBMR(
    Number(currentWeightKg) || 64,
    Number(heightCm) || 168,
    Number(age) || 29,
    sex
  );
  const liveTDEE = calculateTDEE(liveBMR, activityLevel);
  const weeklyRateNum = Number(weeklyRate) || 0.45;
  const deficitOrSurplus = Math.round(weeklyRateNum * 1100);
  const minFloor = sex === 'male' ? 1450 : 1200;
  const isLoss = (Number(startingWeightKg) || 68) >= (Number(goalWeightKg) || 61.5);
  const autoSuggestedCal = isLoss
    ? Math.max(minFloor, liveTDEE - deficitOrSurplus)
    : liveTDEE + deficitOrSurplus;

  const handleRecalculateAuto = () => {
    setCalorieBudget(String(autoSuggestedCal));
    const weight = Number(currentWeightKg) || 64;
    const recProtein = Math.round(weight * 1.6);
    const recFat = Math.round(weight * 0.8);
    const remainingCalsForCarbs = Math.max(0, autoSuggestedCal - (recProtein * 4 + recFat * 9));
    const recCarbs = Math.round(remainingCalsForCarbs / 4);

    setProteinIdeal(String(recProtein));
    setFatIdeal(String(recFat));
    setCarbsIdeal(String(recCarbs));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    updatePersonalInfo({
      age: Number(age) || 29,
      sex,
      heightCm: Number(heightCm) || 168,
      currentWeightKg: Number(currentWeightKg) || 64,
      activityLevel,
    });

    updateWeightGoal({
      startingWeightKg: Number(startingWeightKg) || 68,
      goalWeightKg: Number(goalWeightKg) || 61.5,
      targetDate,
      desiredWeeklyRateKg: Number(weeklyRate) || 0.45,
    });

    updateNutritionTargets({
      dailyCalorieBudget: Number(calorieBudget) || autoSuggestedCal,
      protein: {
        min: Math.round((Number(proteinIdeal) || 90) * 0.8),
        ideal: Number(proteinIdeal) || 90,
        max: Math.round((Number(proteinIdeal) || 90) * 1.3),
      },
      carbohydrates: {
        min: Math.round((Number(carbsIdeal) || 175) * 0.8),
        ideal: Number(carbsIdeal) || 175,
        max: Math.round((Number(carbsIdeal) || 175) * 1.3),
      },
      fat: {
        min: Math.round((Number(fatIdeal) || 55) * 0.75),
        ideal: Number(fatIdeal) || 55,
        max: Math.round((Number(fatIdeal) || 55) * 1.35),
      },
      fiberTarget: Number(fiberTarget) || 28,
      waterGoalMl: Number(waterGoalMl) || 2000,
      stepGoal: Number(stepGoal) || 8500,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-[32px] border border-[#F2F1EC] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F4EF] text-[#7D8C6F] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif italic text-[#4A5D4E]">Personalized Goals & Energy Targets</h1>
          </div>
          <p className="text-xs text-[#8C8980] mt-1">
            Science-backed Mifflin-St Jeor calculations for BMR, TDEE, and sustainable metabolic targets
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Targets Updated & Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Recalculate App</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-[#4A5D4E] text-white text-xs font-bold rounded-2xl shadow-sm flex items-center justify-between animate-in fade-in">
          <span>All health targets, calorie budgets, and macro thresholds have been updated successfully!</span>
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Scientific BMR / TDEE Calculation Output Box in Deep Forest Green #4A5D4E */}
      <div className="bg-[#4A5D4E] text-white rounded-[32px] p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-[#E9EAE3]" />
            <h2 className="text-base font-bold text-white">Scientific Energy Formulation (Mifflin-St Jeor)</h2>
          </div>
          <button
            type="button"
            onClick={handleRecalculateAuto}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-[#E9EAE3] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply Scientific Targets</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
            <span className="text-xs font-medium text-[#D6D2C4] block">
              1. Basal Metabolic Rate (BMR)
            </span>
            <span className="text-2xl font-bold mt-1 block">
              {liveBMR} <span className="text-xs font-normal text-[#D6D2C4]">kcal/day</span>
            </span>
            <p className="text-[11px] text-[#D6D2C4]/80 mt-1">
              Energy burned at complete physical rest to sustain vital bodily functions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
            <span className="text-xs font-medium text-[#D6D2C4] block">
              2. Total Daily Energy (TDEE)
            </span>
            <span className="text-2xl font-bold mt-1 block">
              {liveTDEE} <span className="text-xs font-normal text-[#D6D2C4]">kcal/day</span>
            </span>
            <p className="text-[11px] text-[#D6D2C4]/80 mt-1">
              Maintenance energy requirement considering your daily activity quotient.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
            <span className="text-xs font-medium text-[#D6D2C4] block">
              3. Recommended Daily Calorie Budget
            </span>
            <span className="text-2xl font-bold text-[#E9EAE3] mt-1 block">
              {autoSuggestedCal} <span className="text-xs font-normal text-[#D6D2C4]">kcal/day</span>
            </span>
            <p className="text-[11px] text-[#D6D2C4]/80 mt-1">
              Provides ~{Math.round(Number(weeklyRate) * 7700 / 7)} kcal/day healthy energy deficit.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info Card */}
          <div className="bg-white rounded-[32px] p-6 border border-[#F2F1EC] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#7D8C6F]" />
              <h3 className="text-base font-bold text-[#4A5D4E]">Personal Biometrics</h3>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#3D3D3D] mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs text-center font-bold text-[#3D3D3D] bg-[#F9F8F4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D3D3D] mb-1">Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as 'female' | 'male')}
                    className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs bg-[#F9F8F4] text-[#3D3D3D] font-bold focus:outline-hidden"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D3D3D] mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs text-center font-bold text-[#3D3D3D] bg-[#F9F8F4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#3D3D3D] mb-1">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentWeightKg}
                    onChange={(e) => setCurrentWeightKg(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs text-center font-bold text-[#4A5D4E] bg-[#F9F8F4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D3D3D] mb-1">
                    Activity Level
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                    className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs bg-[#F9F8F4] text-[#3D3D3D] font-bold focus:outline-hidden"
                  >
                    <option value="sedentary">Sedentary (Desk work)</option>
                    <option value="lightly_active">Lightly Active (1-3 days/wk)</option>
                    <option value="moderately_active">Moderately Active (3-5 days/wk)</option>
                    <option value="very_active">Very Active (6-7 days/wk)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Weight Goal Settings */}
          <div className="bg-white rounded-[32px] p-6 border border-[#F2F1EC] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#7D8C6F]" />
              <h3 className="text-base font-bold text-[#4A5D4E]">Target Weight & Pace</h3>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#3D3D3D] mb-1">
                    Starting Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={startingWeightKg}
                    onChange={(e) => setStartingWeightKg(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs text-center font-bold text-[#3D3D3D] bg-[#F9F8F4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D3D3D] mb-1">
                    Goal Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={goalWeightKg}
                    onChange={(e) => setGoalWeightKg(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-[#7D8C6F] text-xs text-center font-bold text-[#4A5D4E] bg-[#F5F4EF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#3D3D3D] mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs font-bold text-[#3D3D3D] bg-[#F9F8F4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D3D3D] mb-1">
                    Desired Rate (kg/wk)
                  </label>
                  <select
                    value={weeklyRate}
                    onChange={(e) => setWeeklyRate(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs bg-[#F9F8F4] text-[#3D3D3D] font-bold"
                  >
                    <option value="0.25">0.25 kg / week (Gentle)</option>
                    <option value="0.45">0.45 kg / week (Optimal/Recommended)</option>
                    <option value="0.75">0.75 kg / week (Moderate)</option>
                    <option value="1.00">1.00 kg / week (Aggressive)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#F9F8F4] rounded-2xl border border-[#EBE9E1] text-xs text-[#8C8980] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#7D8C6F] shrink-0 mt-0.5" />
                <span>
                  Losing at 0.45 kg/week requires an energy deficit of ~500 kcal/day, preserving muscle tissue while burning stored body fat.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nutritional & Macro Target Adjustments */}
        <div className="bg-white rounded-[32px] p-6 border border-[#F2F1EC] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#4A5D4E]">Custom Nutrition & Activity Targets</h3>
              <p className="text-xs text-[#8C8980]">Fine-tune your daily macro splits and hydration goals</p>
            </div>
            <button
              type="button"
              onClick={handleRecalculateAuto}
              className="text-xs font-bold text-[#7D8C6F] hover:text-[#4A5D4E] cursor-pointer self-start sm:self-auto"
            >
              Reset to Recommended Splits
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#3D3D3D] mb-1">
                Calorie Budget
              </label>
              <input
                type="number"
                value={calorieBudget}
                onChange={(e) => setCalorieBudget(e.target.value)}
                className="w-full p-2.5 rounded-2xl border border-[#7D8C6F] text-xs text-center font-bold text-[#4A5D4E] bg-[#F5F4EF]"
              />
              <span className="text-[10px] text-[#8C8980] block text-center mt-1">kcal/day</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#4A5D4E] mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                value={proteinIdeal}
                onChange={(e) => setProteinIdeal(e.target.value)}
                className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs text-center font-bold text-[#4A5D4E] bg-[#F9F8F4]"
              />
              <span className="text-[10px] text-[#8C8980] block text-center mt-1">ideal target</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#A6826D] mb-1">
                Carbohydrates (g)
              </label>
              <input
                type="number"
                value={carbsIdeal}
                onChange={(e) => setCarbsIdeal(e.target.value)}
                className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs text-center font-bold text-[#A6826D] bg-[#F9F8F4]"
              />
              <span className="text-[10px] text-[#8C8980] block text-center mt-1">ideal target</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#BC9B6A] mb-1">
                Fats (g)
              </label>
              <input
                type="number"
                value={fatIdeal}
                onChange={(e) => setFatIdeal(e.target.value)}
                className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs text-center font-bold text-[#BC9B6A] bg-[#F9F8F4]"
              />
              <span className="text-[10px] text-[#8C8980] block text-center mt-1">ideal target</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#7D8C6F] mb-1">
                Fiber (g)
              </label>
              <input
                type="number"
                value={fiberTarget}
                onChange={(e) => setFiberTarget(e.target.value)}
                className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs text-center font-bold text-[#7D8C6F] bg-[#F9F8F4]"
              />
              <span className="text-[10px] text-[#8C8980] block text-center mt-1">min target</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#7D8C6F] mb-1">
                Water (mL)
              </label>
              <input
                type="number"
                step="100"
                value={waterGoalMl}
                onChange={(e) => setWaterGoalMl(e.target.value)}
                className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs text-center font-bold text-[#4A5D4E] bg-[#F9F8F4]"
              />
              <span className="text-[10px] text-[#8C8980] block text-center mt-1">hydration</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#4A5D4E] mb-1">
                Step Goal
              </label>
              <input
                type="number"
                step="500"
                value={stepGoal}
                onChange={(e) => setStepGoal(e.target.value)}
                className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs text-center font-bold text-[#4A5D4E] bg-[#F9F8F4]"
              />
              <span className="text-[10px] text-[#8C8980] block text-center mt-1">daily steps</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all values to default demo initial state?')) {
                resetAllData();
              }
            }}
            className="px-5 py-2.5 rounded-full border border-[#EBE9E1] text-xs font-bold text-[#8C8980] hover:bg-[#F5F4EF] flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Targets</span>
          </button>
        </div>
      </form>
    </div>
  );
};
