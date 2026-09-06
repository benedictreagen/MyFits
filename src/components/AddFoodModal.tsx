import React, { useState } from 'react';
import { Check, Plus, Search, Sparkles, X } from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { FoodItem, MealType } from '../types';
import { ImageUploadInput } from './common/ImageUploadInput';

interface AddFoodModalProps {
  mealType: MealType | null;
  onClose: () => void;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({ mealType, onClose }) => {
  const { foodDatabase, addFoodToMeal, addCustomFood } = useHealth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.0);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // New Custom Food Form
  const [customName, setCustomName] = useState('');
  const [customServingUnit, setCustomServingUnit] = useState('serving');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customFiber, setCustomFiber] = useState('');
  const [customCategory, setCustomCategory] = useState<FoodItem['category']>('meals');
  const [customFoodType, setCustomFoodType] = useState<FoodItem['foodType']>('homemade');
  const [customImage, setCustomImage] = useState(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
  );

  if (!mealType) return null;

  const categories = [
    { id: 'all', label: 'All Foods' },
    { id: 'favorites', label: '★ Favorites' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'meals', label: 'Main Meals' },
    { id: 'protein', label: 'High Protein' },
    { id: 'produce', label: 'Fruits & Veg' },
    { id: 'dairy', label: 'Dairy & Plant Milk' },
    { id: 'snacks', label: 'Healthy Snacks' },
  ];

  const filteredFoods = foodDatabase.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'favorites') return f.isFavorite;
    return f.category === selectedCategory;
  });

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setPortionMultiplier(1.0);
  };

  const handleConfirmAdd = () => {
    if (!selectedFood || !mealType) return;
    addFoodToMeal(selectedFood, mealType, portionMultiplier);
    onClose();
  };

  const handleSaveAndAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customCalories) return;

    const newFood = addCustomFood({
      name: customName.trim(),
      category: customCategory,
      servingSize: 1,
      servingUnit: customServingUnit.trim() || 'serving',
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbohydrates: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      fiber: Number(customFiber) || 0,
      sugar: 0,
      sodium: 120,
      image: customImage,
      foodType: customFoodType,
    });

    addFoodToMeal(newFood, mealType, 1.0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-[32px] shadow-2xl border border-[#F2F1EC] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#F0EEE6] flex items-center justify-between bg-[#F9F8F4]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#4A5D4E] capitalize">
                Log Nourishing Food to {mealType}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F4EF] text-[#4A5D4E] uppercase tracking-wide border border-[#EBE9E1]">
                Visual Library
              </span>
            </div>
            <p className="text-xs text-[#8C8980]">
              Select or search a nutritious food item with instant calorie & macro preview
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8C8980] hover:text-[#3D3D3D] hover:bg-[#F5F4EF] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom vs Library toggle */}
        <div className="px-6 py-2.5 border-b border-[#F0EEE6] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomMode(false)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                !isCustomMode
                  ? 'bg-[#7D8C6F] text-white'
                  : 'text-[#8C8980] hover:bg-[#F5F4EF]'
              }`}
            >
              Food Database ({foodDatabase.length})
            </button>
            <button
              onClick={() => setIsCustomMode(true)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                isCustomMode
                  ? 'bg-[#7D8C6F] text-white'
                  : 'text-[#8C8980] hover:bg-[#F5F4EF]'
              }`}
            >
              + Create Custom Food
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isCustomMode ? (
            <div className="space-y-4">
              {/* Search & Filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#8C8980] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search oats, salmon, eggs, berries, greens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F9F8F4] border border-[#EBE9E1] text-xs text-[#3D3D3D] focus:bg-white focus:outline-hidden focus:border-[#7D8C6F] transition-colors"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#7D8C6F] text-white'
                        : 'bg-[#F9F8F4] text-[#8C8980] hover:bg-[#F5F4EF] border border-[#EBE9E1]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Food Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                {filteredFoods.map((food) => {
                  const isChosen = selectedFood?.id === food.id;
                  return (
                    <div
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className={`p-2.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                        isChosen
                          ? 'border-[#7D8C6F] bg-[#F5F4EF] shadow-xs'
                          : 'border-[#F0EEE6] bg-white hover:border-[#EBE9E1]'
                      }`}
                    >
                      <img
                        src={food.image}
                        alt={food.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-2xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#3D3D3D] truncate">
                            {food.name}
                          </span>
                          {isChosen && (
                            <span className="w-5 h-5 rounded-full bg-[#7D8C6F] text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#8C8980] block truncate">
                          {food.servingUnit}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-[#4A5D4E]">
                            {food.calories} kcal
                          </span>
                          <span className="text-[10px] text-[#8C8980] font-medium">
                            P: {food.protein}g • C: {food.carbohydrates}g • F: {food.fat}g
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Food Portion Adjuster */}
              {selectedFood && (
                <div className="p-4 rounded-2xl bg-[#F9F8F4] border border-[#EBE9E1] space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#3D3D3D]">
                        Adjust Portion for {selectedFood.name}
                      </span>
                      <span className="text-[11px] text-[#8C8980] block">
                        Base: {selectedFood.servingUnit}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-[#EBE9E1] rounded-full p-0.5">
                      {[0.5, 1.0, 1.5, 2.0].map((mult) => (
                        <button
                          key={mult}
                          onClick={() => setPortionMultiplier(mult)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                            portionMultiplier === mult
                              ? 'bg-[#7D8C6F] text-white'
                              : 'text-[#8C8980] hover:bg-[#F5F4EF]'
                          }`}
                        >
                          {mult}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculated Macros Preview */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-white p-2.5 rounded-xl border border-[#F0EEE6]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8C8980]">Calories</span>
                      <p className="text-sm font-bold text-[#3D3D3D]">
                        {Math.round(selectedFood.calories * portionMultiplier)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#4A5D4E]">Protein</span>
                      <p className="text-sm font-bold text-[#4A5D4E]">
                        {Number((selectedFood.protein * portionMultiplier).toFixed(1))}g
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#A6826D]">Carbs</span>
                      <p className="text-sm font-bold text-[#A6826D]">
                        {Number((selectedFood.carbohydrates * portionMultiplier).toFixed(1))}g
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#BC9B6A]">Fat</span>
                      <p className="text-sm font-bold text-[#BC9B6A]">
                        {Number((selectedFood.fat * portionMultiplier).toFixed(1))}g
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Custom Food Form */
            <form onSubmit={handleSaveAndAddCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3D3D3D] mb-1">
                  Food Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Homemade Lentil Soup"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs text-[#3D3D3D] bg-[#F9F8F4] focus:outline-hidden focus:border-[#7D8C6F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#3D3D3D] mb-1">
                    Serving Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 1 bowl (300g)"
                    value={customServingUnit}
                    onChange={(e) => setCustomServingUnit(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs text-[#3D3D3D] bg-[#F9F8F4] focus:outline-hidden focus:border-[#7D8C6F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D3D3D] mb-1">
                    Food Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-2xl border border-[#EBE9E1] text-xs bg-[#F9F8F4] text-[#3D3D3D] font-bold focus:outline-hidden focus:border-[#7D8C6F]"
                  >
                    <option value="meals">Main Meals</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="protein">High Protein</option>
                    <option value="produce">Fruits & Vegetables</option>
                    <option value="dairy">Dairy & Alternatives</option>
                    <option value="snacks">Healthy Snacks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#3D3D3D] mb-1">
                    Calories *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="350"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#EBE9E1] text-xs text-center font-bold text-[#4A5D4E] bg-[#F9F8F4]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5D4E] mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="25"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#EBE9E1] text-xs text-center text-[#4A5D4E] bg-[#F9F8F4]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#A6826D] mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#EBE9E1] text-xs text-center text-[#A6826D] bg-[#F9F8F4]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#BC9B6A] mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="10"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#EBE9E1] text-xs text-center text-[#BC9B6A] bg-[#F9F8F4]"
                  />
                </div>
              </div>

              <ImageUploadInput
                value={customImage}
                onChange={setCustomImage}
                label="Food Photography / Image"
                aspectRatio="wide"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Save Food & Add to {mealType}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        {!isCustomMode && (
          <div className="px-6 py-3.5 border-t border-[#F0EEE6] bg-[#F9F8F4] flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-[#EBE9E1] text-[#8C8980] hover:bg-[#F5F4EF] text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              disabled={!selectedFood}
              onClick={handleConfirmAdd}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                selectedFood
                  ? 'bg-[#7D8C6F] hover:bg-[#68765c] text-white cursor-pointer'
                  : 'bg-[#EBE9E1] text-[#8C8980] cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Log {selectedFood ? `“${selectedFood.name}”` : 'Food'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
