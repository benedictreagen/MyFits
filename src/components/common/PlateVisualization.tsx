import React from 'react';
import { motion } from 'motion/react';
import { Utensils, Sparkles, AlertCircle } from 'lucide-react';
import { formatNum } from '../../utils/calculations';
import { useHealth } from '../../context/HealthContext';
import { getTranslation } from '../../utils/translations';

interface PlateVisualizationProps {
  calorieBudget: number;
  consumedCalories: number;
  breakfastCal: number;
  lunchCal: number;
  dinnerCal: number;
  snackCal: number;
}

export const PlateVisualization: React.FC<PlateVisualizationProps> = ({
  calorieBudget,
  consumedCalories,
  breakfastCal,
  lunchCal,
  dinnerCal,
  snackCal,
}) => {
  const { language, theme } = useHealth();

  const remainingCalories = Math.max(0, calorieBudget - consumedCalories);
  const overBudget = consumedCalories > calorieBudget;
  const overAmount = consumedCalories - calorieBudget;
  const pctConsumed = Math.min(100, Math.round((consumedCalories / (calorieBudget || 1)) * 100));

  // Compute proportion angles on the circular plate (360 degrees total)
  const total = calorieBudget || 2000;
  const bPct = Math.min(100, (breakfastCal / total) * 100);
  const lPct = Math.min(100, (lunchCal / total) * 100);
  const dPct = Math.min(100, (dinnerCal / total) * 100);
  const sPct = Math.min(100, (snackCal / total) * 100);

  // SVG perimeter calculations (radius = 70, circumference = 2 * PI * 70 = 439.82)
  const circumference = 2 * Math.PI * 70;
  const bOffset = 0;
  const bStroke = (bPct / 100) * circumference;

  const lOffset = -bStroke;
  const lStroke = (lPct / 100) * circumference;

  const dOffset = -(bStroke + lStroke);
  const dStroke = (dPct / 100) * circumference;

  const sOffset = -(bStroke + lStroke + dStroke);
  const sStroke = (sPct / 100) * circumference;

  return (
    <div className="bg-white dark:bg-[#1E2520] p-6 sm:p-7 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C8980] dark:text-[#A3A096]">
              {getTranslation('daily_plate_title', language)}
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5F4EF] dark:bg-[#2A332B] text-[#7D8C6F] dark:text-[#9FB191] border border-[#EBE9E1] dark:border-[#384439]">
              {pctConsumed}% {getTranslation('used', language)}
            </span>
          </div>
          <p className="text-xs text-[#8C8980] dark:text-[#A3A096] mt-0.5">
            {getTranslation('daily_plate_subtitle', language)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {overBudget ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>+{overAmount} kcal over budget</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F4EF] dark:bg-[#2A332B] text-[#4A5D4E] dark:text-[#C5D1BC] border border-[#EBE9E1] dark:border-[#384439] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#7D8C6F] dark:text-[#9FB191]" />
              <span>{formatNum(remainingCalories)} kcal {getTranslation('remaining', language)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Creative Visual Plate / Bowl with Food Fill Metaphor */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* Outer Ceramic Plate Rim */}
            <div className="absolute inset-0 rounded-full border-12 border-[#F9F8F4] dark:border-[#273029] shadow-inner bg-[#FBFBFA] dark:bg-[#181D1A]" />

            {/* Inner Plate Rim Details */}
            <div className="absolute inset-4 rounded-full border border-[#ECEAE2] dark:border-[#313B33]" />

            {/* Animated Donut / Segmented Fill SVG */}
            <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 160 160">
              {/* Plate baseline track */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                className="text-[#EFECE3] dark:text-[#252E27]"
                strokeWidth="11"
                fill="transparent"
              />

              {/* Breakfast Sector (Warm Apricot / Amber) */}
              {bStroke > 0 && (
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#E8A87C"
                  strokeWidth="11"
                  strokeDasharray={`${bStroke} ${circumference}`}
                  strokeDashoffset={bOffset}
                  strokeLinecap="round"
                  fill="transparent"
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${bStroke} ${circumference}` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}

              {/* Lunch Sector (Botanical Sage / Forest) */}
              {lStroke > 0 && (
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#7D8C6F"
                  strokeWidth="11"
                  strokeDasharray={`${lStroke} ${circumference}`}
                  strokeDashoffset={lOffset}
                  strokeLinecap="round"
                  fill="transparent"
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${lStroke} ${circumference}` }}
                  transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                />
              )}

              {/* Dinner Sector (Deep Olive / Clay) */}
              {dStroke > 0 && (
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#9E8268"
                  strokeWidth="11"
                  strokeDasharray={`${dStroke} ${circumference}`}
                  strokeDashoffset={dOffset}
                  strokeLinecap="round"
                  fill="transparent"
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${dStroke} ${circumference}` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                />
              )}

              {/* Snack Sector (Berry / Soft Rose) */}
              {sStroke > 0 && (
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#C38D9E"
                  strokeWidth="11"
                  strokeDasharray={`${sStroke} ${circumference}`}
                  strokeDashoffset={sOffset}
                  strokeLinecap="round"
                  fill="transparent"
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${sStroke} ${circumference}` }}
                  transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
                />
              )}
            </svg>

            {/* Center Plate Metric Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-20">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C8980] dark:text-[#A3A096]">
                {getTranslation('consumed_calories', language)}
              </span>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6] tracking-tight">
                {formatNum(consumedCalories)}
              </span>
              <span className="text-[11px] font-medium text-[#8C8980] dark:text-[#A3A096]">
                of {formatNum(calorieBudget)} kcal
              </span>
            </div>
          </div>
        </div>

        {/* Meal Breakdown Badges & Visual Proportion Indicators */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Breakfast */}
            <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#252E27] border border-[#ECEAE2] dark:border-[#323E34] flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8A87C]" />
                <span className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                  {getTranslation('breakfast', language)}
                </span>
              </div>
              <span className="text-base font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                {formatNum(breakfastCal)} <span className="text-[10px] font-sans text-[#8C8980] dark:text-[#A3A096]">kcal</span>
              </span>
              <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096]">
                {Math.round((breakfastCal / (calorieBudget || 1)) * 100)}% of plate
              </span>
            </div>

            {/* Lunch */}
            <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#252E27] border border-[#ECEAE2] dark:border-[#323E34] flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7D8C6F]" />
                <span className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                  {getTranslation('lunch', language)}
                </span>
              </div>
              <span className="text-base font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                {formatNum(lunchCal)} <span className="text-[10px] font-sans text-[#8C8980] dark:text-[#A3A096]">kcal</span>
              </span>
              <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096]">
                {Math.round((lunchCal / (calorieBudget || 1)) * 100)}% of plate
              </span>
            </div>

            {/* Dinner */}
            <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#252E27] border border-[#ECEAE2] dark:border-[#323E34] flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9E8268]" />
                <span className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                  {getTranslation('dinner', language)}
                </span>
              </div>
              <span className="text-base font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                {formatNum(dinnerCal)} <span className="text-[10px] font-sans text-[#8C8980] dark:text-[#A3A096]">kcal</span>
              </span>
              <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096]">
                {Math.round((dinnerCal / (calorieBudget || 1)) * 100)}% of plate
              </span>
            </div>

            {/* Snacks */}
            <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#252E27] border border-[#ECEAE2] dark:border-[#323E34] flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C38D9E]" />
                <span className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                  {getTranslation('snack', language)}
                </span>
              </div>
              <span className="text-base font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                {formatNum(snackCal)} <span className="text-[10px] font-sans text-[#8C8980] dark:text-[#A3A096]">kcal</span>
              </span>
              <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096]">
                {Math.round((snackCal / (calorieBudget || 1)) * 100)}% of plate
              </span>
            </div>
          </div>

          {/* Progress fill bar showing cumulative fullness */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#8C8980] dark:text-[#A3A096]">
                {getTranslation('budget_capacity', language)}
              </span>
              <span className="font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                {consumedCalories} / {calorieBudget} kcal
              </span>
            </div>
            <div className="h-3 w-full bg-[#F0EEE6] dark:bg-[#2B352E] rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: `${bPct}%` }} className="h-full bg-[#E8A87C] transition-all duration-300" title="Breakfast" />
              <div style={{ width: `${lPct}%` }} className="h-full bg-[#7D8C6F] transition-all duration-300" title="Lunch" />
              <div style={{ width: `${dPct}%` }} className="h-full bg-[#9E8268] transition-all duration-300" title="Dinner" />
              <div style={{ width: `${sPct}%` }} className="h-full bg-[#C38D9E] transition-all duration-300" title="Snacks" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
