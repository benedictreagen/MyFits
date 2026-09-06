import React, { useState } from 'react';
import {
  Check,
  Heart,
  Plus,
  Search,
  Sparkles,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { FoodItem, FoodType, MealType } from '../../types';
import { AddFoodModal } from '../AddFoodModal';
import { AdvancedFoodSearch } from './AdvancedFoodSearch';

export const FoodPage: React.FC = () => {
  const { foodDatabase, toggleFavoriteFood, addFoodToMeal } = useHealth();
  const [activeMainTab, setActiveMainTab] = useState<'ai_search' | 'library'>('ai_search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFoodType, setSelectedFoodType] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'favorites' | 'frequent' | 'recent'>('all');
  const [selectedFoodForQuickLog, setSelectedFoodForQuickLog] = useState<FoodItem | null>(null);
  const [targetMeal, setTargetMeal] = useState<MealType>('breakfast');
  const [portionMult, setPortionMult] = useState<number>(1.0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'meals', label: 'Main Meals' },
    { id: 'protein', label: 'High Protein' },
    { id: 'produce', label: 'Produce & Greens' },
    { id: 'dairy', label: 'Dairy & Alternatives' },
    { id: 'snacks', label: 'Healthy Snacks' },
  ];

  const foodTypes: { id: string; label: string }[] = [
    { id: 'all', label: 'All Origins' },
    { id: 'homemade', label: 'Homemade' },
    { id: 'packaged', label: 'Packaged' },
    { id: 'restaurant', label: 'Restaurant' },
  ];

  // Filtering
  const filteredFoods = foodDatabase.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeSubTab === 'favorites' && !food.isFavorite) return false;
    if (activeSubTab === 'frequent' && (food.usageCount || 0) < 15) return false;

    if (selectedCategory !== 'all' && food.category !== selectedCategory) return false;
    if (selectedFoodType !== 'all' && food.foodType !== selectedFoodType) return false;

    return true;
  });

  const handleQuickAdd = (food: FoodItem) => {
    addFoodToMeal(food, targetMeal, portionMult);
    setAddedToast(`Added ${food.name} (${portionMult}x) to ${targetMeal}!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-[32px] border border-[#F2F1EC] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F4EF] text-[#7D8C6F] flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif italic text-[#4A5D4E]">Food & Nourishment Library</h1>
          </div>
          <p className="text-xs text-[#8C8980] mt-1">
            Search, customize, and log natural whole foods with dynamic portion & macro recalculation
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Food</span>
        </button>
      </div>

      {/* Toast feedback */}
      {addedToast && (
        <div className="p-3 bg-[#4A5D4E] text-white text-xs font-bold rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span>{addedToast}</span>
          <Check className="w-4 h-4 text-[#7D8C6F]" />
        </div>
      )}

      {/* Main Navigation Switcher: AI Smart Search & Vision vs Database Library */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#F2F1EC] shadow-2xs w-fit">
        <button
          onClick={() => setActiveMainTab('ai_search')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMainTab === 'ai_search'
              ? 'bg-[#7D8C6F] text-white shadow-xs'
              : 'text-[#8C8980] hover:text-[#3D3D3D]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Vision & Natural Search</span>
        </button>

        <button
          onClick={() => setActiveMainTab('library')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMainTab === 'library'
              ? 'bg-[#4A5D4E] text-white shadow-xs'
              : 'text-[#8C8980] hover:text-[#3D3D3D]'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Food Database Library ({foodDatabase.length})</span>
        </button>
      </div>

      {/* AI Food Search Component */}
      {activeMainTab === 'ai_search' && (
        <div className="space-y-6">
          <AdvancedFoodSearch onFoodLogged={(msg) => setAddedToast(msg)} />

          {/* Quick toggle to browse full database */}
          <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EBE9E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E]">
              <Utensils className="w-4 h-4 text-[#7D8C6F]" />
              <span>Looking for standard whole foods or your saved favorites?</span>
            </div>
            <button
              onClick={() => setActiveMainTab('library')}
              className="px-4 py-2 rounded-xl bg-white border border-[#EBE9E1] text-xs font-bold text-[#4A5D4E] hover:bg-[#F5F4EF] shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              Browse Full Food Library ({foodDatabase.length} items) →
            </button>
          </div>
        </div>
      )}

      {/* Library Browse Mode */}
      {activeMainTab === 'library' && (
        <>
          {/* Tabs & Search controls */}
          <div className="bg-white rounded-[32px] p-6 border border-[#F2F1EC] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Sub-tab pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F9F8F4] rounded-2xl w-full md:w-auto overflow-x-auto border border-[#EBE9E1]">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'all'
                  ? 'bg-white text-[#3D3D3D] shadow-2xs'
                  : 'text-[#8C8980] hover:text-[#3D3D3D]'
              }`}
            >
              All Foods ({foodDatabase.length})
            </button>
            <button
              onClick={() => setActiveSubTab('favorites')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === 'favorites'
                  ? 'bg-white text-[#3D3D3D] shadow-2xs'
                  : 'text-[#8C8980] hover:text-[#3D3D3D]'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-[#A6826D] fill-[#A6826D]" />
              <span>Favorites</span>
            </button>
            <button
              onClick={() => setActiveSubTab('frequent')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'frequent'
                  ? 'bg-white text-[#3D3D3D] shadow-2xs'
                  : 'text-[#8C8980] hover:text-[#3D3D3D]'
              }`}
            >
              Frequently Eaten
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#8C8980] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search food by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F9F8F4] border border-[#EBE9E1] text-xs text-[#3D3D3D] focus:bg-white focus:outline-hidden focus:border-[#7D8C6F]"
            />
          </div>
        </div>

        {/* Filters: Category & Food Type */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#F0EEE6]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === c.id
                    ? 'bg-[#7D8C6F] text-white'
                    : 'bg-[#F5F4EF] text-[#4A5D4E] hover:bg-[#EBE9E1]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#8C8980] font-medium">Origin:</span>
            {foodTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedFoodType(t.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  selectedFoodType === t.id
                    ? 'bg-[#4A5D4E] text-white'
                    : 'text-[#8C8980] hover:bg-[#F5F4EF]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Food Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFoods.map((food) => {
          const isSelectedForLog = selectedFoodForQuickLog?.id === food.id;

          return (
            <div
              key={food.id}
              className="bg-white rounded-[28px] border border-[#F2F1EC] shadow-xs hover:border-[#EBE9E1] transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Food Image with Category badge and Favorite toggle */}
              <div className="relative h-44 w-full overflow-hidden bg-[#F5F4EF]">
                <img
                  src={food.image}
                  alt={food.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-[#3D3D3D] uppercase tracking-wide">
                    {food.foodType}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#4A5D4E]/80 backdrop-blur-xs text-[10px] font-bold text-[#F9F8F4] capitalize">
                    {food.category}
                  </span>
                </div>

                <button
                  onClick={() => toggleFavoriteFood(food.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs text-[#8C8980] hover:text-[#A6826D] hover:scale-110 transition-all shadow-xs cursor-pointer"
                  title="Toggle Favorite"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      food.isFavorite ? 'text-[#A6826D] fill-[#A6826D]' : ''
                    }`}
                  />
                </button>

                <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                  <span className="text-xl font-bold tracking-tight">
                    {food.calories} <span className="text-xs font-semibold text-[#E9EAE3]">kcal</span>
                  </span>
                  <span className="text-xs font-medium text-[#F0EEE6] truncate">
                    {food.servingUnit}
                  </span>
                </div>
              </div>

              {/* Food Card Content */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#3D3D3D] line-clamp-1">{food.name}</h3>

                  {/* Macros breakdown grid */}
                  <div className="grid grid-cols-4 gap-1.5 mt-2.5 text-center">
                    <div className="p-1.5 rounded-xl bg-[#F5F4EF] border border-[#EBE9E1]">
                      <span className="text-[9px] uppercase font-bold text-[#4A5D4E] block">Protein</span>
                      <span className="text-xs font-bold text-[#3D3D3D]">{food.protein}g</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-[#F5F4EF] border border-[#EBE9E1]">
                      <span className="text-[9px] uppercase font-bold text-[#A6826D] block">Carbs</span>
                      <span className="text-xs font-bold text-[#3D3D3D]">{food.carbohydrates}g</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-[#F5F4EF] border border-[#EBE9E1]">
                      <span className="text-[9px] uppercase font-bold text-[#BC9B6A] block">Fat</span>
                      <span className="text-xs font-bold text-[#3D3D3D]">{food.fat}g</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-[#F5F4EF] border border-[#EBE9E1]">
                      <span className="text-[9px] uppercase font-bold text-[#7D8C6F] block">Fiber</span>
                      <span className="text-xs font-bold text-[#3D3D3D]">{food.fiber}g</span>
                    </div>
                  </div>

                  {/* Micro Nutrients details (Sugar & Sodium) */}
                  <div className="flex items-center justify-between text-[11px] text-[#8C8980] mt-2 px-1">
                    <span>Sugar: {food.sugar}g</span>
                    <span>Sodium: {food.sodium}mg</span>
                    <span>Used: {food.usageCount || 0}x</span>
                  </div>
                </div>

                {/* Quick Log Bar */}
                <div className="pt-3 border-t border-[#F0EEE6] space-y-2">
                  {isSelectedForLog ? (
                    <div className="space-y-2 bg-[#F9F8F4] p-3 rounded-2xl border border-[#EBE9E1]">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#3D3D3D]">Select Meal:</span>
                        <div className="flex items-center gap-1">
                          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => (
                            <button
                              key={m}
                              onClick={() => setTargetMeal(m)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize transition-colors ${
                                targetMeal === m
                                  ? 'bg-[#7D8C6F] text-white'
                                  : 'bg-white text-[#8C8980] border border-[#EBE9E1]'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#3D3D3D]">Portion:</span>
                        <div className="flex items-center gap-1">
                          {[0.5, 1.0, 1.5, 2.0].map((num) => (
                            <button
                              key={num}
                              onClick={() => setPortionMult(num)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                portionMult === num
                                  ? 'bg-[#4A5D4E] text-white'
                                  : 'bg-white text-[#8C8980] border border-[#EBE9E1]'
                              }`}
                            >
                              {num}x
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setSelectedFoodForQuickLog(null)}
                          className="px-3 py-1.5 rounded-full border border-[#EBE9E1] text-[11px] font-bold text-[#8C8980] hover:bg-[#F5F4EF]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleQuickAdd(food);
                            setSelectedFoodForQuickLog(null);
                          }}
                          className="flex-1 py-1.5 rounded-full bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          Log {Math.round(food.calories * portionMult)} kcal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedFoodForQuickLog(food);
                        setPortionMult(1.0);
                      }}
                      className="w-full py-2 px-3 rounded-full bg-[#F5F4EF] hover:bg-[#EBE9E1] text-[#4A5D4E] border border-[#EBE9E1] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#7D8C6F]" />
                      <span>Log to Meal</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}

      {/* Add Custom Food Modal */}
      {isCreateModalOpen && (
        <AddFoodModal
          mealType="breakfast"
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
};
