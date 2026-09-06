import React, { useState } from 'react';
import { Sliders, Check } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { getTranslation } from '../../utils/translations';
import { formatNum } from '../../utils/calculations';

interface MacroDistributionBarProps {
  interactive?: boolean;
}

export const MacroDistributionBar: React.FC<MacroDistributionBarProps> = ({
  interactive = true,
}) => {
  const {
    language,
    nutritionTargets,
    updateMacroPercentages,
    updateMacroGrams,
    dayTotals,
  } = useHealth();

  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState<'percent' | 'grams'>('percent');

  const dist = nutritionTargets.macroDistribution || {
    proteinPct: 25,
    carbsPct: 50,
    fatPct: 25,
    proteinGrams: 95,
    carbsGrams: 190,
    fatGrams: 42,
  };

  const [tempPct, setTempPct] = useState({
    protein: dist.proteinPct,
    carbs: dist.carbsPct,
    fat: dist.fatPct,
  });

  const [tempGrams, setTempGrams] = useState({
    protein: dist.proteinGrams,
    carbs: dist.carbsGrams,
    fat: dist.fatGrams,
  });

  const handleSavePct = () => {
    updateMacroPercentages(tempPct.protein, tempPct.carbs, tempPct.fat);
    setIsEditing(false);
  };

  const handleSaveGrams = () => {
    updateMacroGrams(tempGrams.protein, tempGrams.carbs, tempGrams.fat);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-[#1E2520] p-6 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#8C8980] dark:text-[#A3A096]">
            {getTranslation('macro_distribution_title', language)}
          </h3>
          <p className="text-xs text-[#8C8980] dark:text-[#A3A096] mt-0.5">
            {getTranslation('macro_distribution_subtitle', language)}
          </p>
        </div>

        {interactive && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F4EF] dark:bg-[#2A332B] hover:bg-[#EBE9E1] dark:hover:bg-[#344035] text-xs font-semibold text-[#4A5D4E] dark:text-[#C5D1BC] border border-[#EBE9E1] dark:border-[#384439] transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isEditing ? getTranslation('cancel', language) : 'Adjust Split'}</span>
          </button>
        )}
      </div>

      {/* Segmented Stacked Macro Distribution Bar */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-[#F0EEE6] dark:bg-[#2B352E] rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${dist.proteinPct}%` }}
            className="h-full bg-[#7D8C6F] transition-all duration-300 relative group"
            title={`Protein: ${dist.proteinPct}%`}
          />
          <div
            style={{ width: `${dist.carbsPct}%` }}
            className="h-full bg-[#D4A373] transition-all duration-300 relative group"
            title={`Carbs: ${dist.carbsPct}%`}
          />
          <div
            style={{ width: `${dist.fatPct}%` }}
            className="h-full bg-[#A3B18A] transition-all duration-300 relative group"
            title={`Fat: ${dist.fatPct}%`}
          />
        </div>
      </div>

      {/* 3 Macro Cards with Consumed vs Target Grams */}
      <div className="grid grid-cols-3 gap-3">
        {/* Protein */}
        <div className="p-3.5 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7D8C6F]" />
            <span className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {getTranslation('protein', language)}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {formatNum(dayTotals.protein)}
            </span>
            <span className="text-xs text-[#8C8980] dark:text-[#A3A096]">
              / {dist.proteinGrams}g
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8C8980] dark:text-[#A3A096] mt-1">
            <span>{dist.proteinPct}% calories</span>
            <span className="font-semibold text-[#7D8C6F] dark:text-[#9FB191]">
              {Math.min(100, Math.round((dayTotals.protein / (dist.proteinGrams || 1)) * 100))}%
            </span>
          </div>
        </div>

        {/* Carbohydrates */}
        <div className="p-3.5 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4A373]" />
            <span className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {getTranslation('carbs', language)}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {formatNum(dayTotals.carbs)}
            </span>
            <span className="text-xs text-[#8C8980] dark:text-[#A3A096]">
              / {dist.carbsGrams}g
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8C8980] dark:text-[#A3A096] mt-1">
            <span>{dist.carbsPct}% calories</span>
            <span className="font-semibold text-[#D4A373]">
              {Math.min(100, Math.round((dayTotals.carbs / (dist.carbsGrams || 1)) * 100))}%
            </span>
          </div>
        </div>

        {/* Fat */}
        <div className="p-3.5 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A3B18A]" />
            <span className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {getTranslation('fat', language)}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {formatNum(dayTotals.fat)}
            </span>
            <span className="text-xs text-[#8C8980] dark:text-[#A3A096]">
              / {dist.fatGrams}g
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8C8980] dark:text-[#A3A096] mt-1">
            <span>{dist.fatPct}% calories</span>
            <span className="font-semibold text-[#A3B18A]">
              {Math.min(100, Math.round((dayTotals.fat / (dist.fatGrams || 1)) * 100))}%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Adjustment Drawer */}
      {isEditing && (
        <div className="mt-5 pt-4 border-t border-[#EBE9E1] dark:border-[#323E34] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              Adjust by:
            </span>
            <div className="flex items-center bg-[#F5F4EF] dark:bg-[#2A332B] p-0.5 rounded-xl border border-[#EBE9E1] dark:border-[#384439]">
              <button
                onClick={() => setEditMode('percent')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  editMode === 'percent'
                    ? 'bg-white dark:bg-[#1E2520] text-[#3D3D3D] dark:text-white shadow-xs'
                    : 'text-[#8C8980]'
                }`}
              >
                Percentages (%)
              </button>
              <button
                onClick={() => setEditMode('grams')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  editMode === 'grams'
                    ? 'bg-white dark:bg-[#1E2520] text-[#3D3D3D] dark:text-white shadow-xs'
                    : 'text-[#8C8980]'
                }`}
              >
                Daily Grams (g)
              </button>
            </div>
          </div>

          {editMode === 'percent' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="w-20 font-semibold text-[#3D3D3D] dark:text-[#E8EAE6]">Protein:</span>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={tempPct.protein}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    const rem = 100 - p;
                    setTempPct({
                      protein: p,
                      carbs: Math.round(rem * 0.65),
                      fat: Math.max(10, rem - Math.round(rem * 0.65)),
                    });
                  }}
                  className="flex-1 accent-[#7D8C6F]"
                />
                <span className="w-12 text-right font-bold">{tempPct.protein}%</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="w-20 font-semibold text-[#3D3D3D] dark:text-[#E8EAE6]">Carbs:</span>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={tempPct.carbs}
                  onChange={(e) => {
                    const c = Number(e.target.value);
                    const rem = 100 - tempPct.protein;
                    setTempPct({
                      ...tempPct,
                      carbs: c,
                      fat: Math.max(10, 100 - tempPct.protein - c),
                    });
                  }}
                  className="flex-1 accent-[#D4A373]"
                />
                <span className="w-12 text-right font-bold">{tempPct.carbs}%</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="w-20 font-semibold text-[#3D3D3D] dark:text-[#E8EAE6]">Fat:</span>
                <span className="flex-1 text-[#8C8980] dark:text-[#A3A096]">
                  Balanced automatically to equal 100%
                </span>
                <span className="w-12 text-right font-bold">{tempPct.fat}%</span>
              </div>
              <button
                onClick={handleSavePct}
                className="w-full mt-2 py-2 rounded-xl bg-[#7D8C6F] hover:bg-[#6B7A5D] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Percentage Split</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#8C8980] block mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={tempGrams.protein}
                    onChange={(e) =>
                      setTempGrams({ ...tempGrams, protein: Math.max(20, Number(e.target.value)) })
                    }
                    className="w-full p-2 text-xs rounded-xl border border-[#EBE9E1] dark:border-[#323E34] bg-[#F9F8F4] dark:bg-[#252E27] font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#8C8980] block mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={tempGrams.carbs}
                    onChange={(e) =>
                      setTempGrams({ ...tempGrams, carbs: Math.max(20, Number(e.target.value)) })
                    }
                    className="w-full p-2 text-xs rounded-xl border border-[#EBE9E1] dark:border-[#323E34] bg-[#F9F8F4] dark:bg-[#252E27] font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#8C8980] block mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={tempGrams.fat}
                    onChange={(e) =>
                      setTempGrams({ ...tempGrams, fat: Math.max(15, Number(e.target.value)) })
                    }
                    className="w-full p-2 text-xs rounded-xl border border-[#EBE9E1] dark:border-[#323E34] bg-[#F9F8F4] dark:bg-[#252E27] font-bold"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveGrams}
                className="w-full mt-2 py-2 rounded-xl bg-[#7D8C6F] hover:bg-[#6B7A5D] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Gram Targets</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
