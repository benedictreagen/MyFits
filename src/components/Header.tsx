import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Database,
  Flame,
  Globe,
  Moon,
  RotateCcw,
  Sun,
  User,
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { getTodayDateStr } from '../data/initialData';
import { getTranslation } from '../utils/translations';

export const Header: React.FC = () => {
  const {
    selectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    setSelectedDate,
    streaks,
    lastSheetsSync,
    setIsSheetsModalOpen,
    resetAllData,
    darkMode,
    setDarkMode,
    language,
    setLanguage,
    setActiveTab,
    personalInfo,
  } = useHealth();

  const todayStr = getTodayDateStr();
  const isToday = selectedDate === todayStr;

  const formattedDate = React.useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayName = dateObj.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        weekday: 'short',
      });
      const monthName = dateObj.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        month: 'short',
      });
      return `${dayName}, ${monthName} ${d}`;
    } catch {
      return selectedDate;
    }
  }, [selectedDate, language]);

  const loggingStreak = streaks.find((s) => s.key === 'foodLogging')?.currentStreak || 12;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1E2520]/95 backdrop-blur-md border-b border-[#EBE9E1] dark:border-[#2C332D] px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-[#7D8C6F] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs group-hover:scale-105 transition-transform">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif italic text-[#4A5D4E] dark:text-[#C5D1BC] tracking-tight">
                FitTrack
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#F5F4EF] dark:bg-[#2A332B] text-[#7D8C6F] dark:text-[#9FB191] border border-[#EBE9E1] dark:border-[#384439]">
                Sheets Backend
              </span>
            </div>
            <p className="hidden md:block text-xs text-[#8C8980] dark:text-[#A3A096]">
              Natural Wellness & Daily Nutrition
            </p>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center bg-[#F9F8F4] dark:bg-[#252E27] border border-[#EBE9E1] dark:border-[#323E34] rounded-2xl p-1 shadow-xs">
          <button
            onClick={goToPreviousDay}
            className="p-1.5 hover:bg-[#EBE9E1] dark:hover:bg-[#344035] rounded-xl text-[#8C8980] dark:text-[#A3A096] hover:text-[#3D3D3D] transition-colors cursor-pointer"
            title="Previous Day"
            aria-label="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-3">
            <Calendar className="w-3.5 h-3.5 text-[#7D8C6F]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="text-xs font-semibold text-[#3D3D3D] dark:text-[#E8EAE6] bg-transparent border-none cursor-pointer focus:outline-hidden"
              aria-label="Select Date"
            />
            <span className="text-xs font-medium text-[#8C8980] dark:text-[#A3A096] hidden sm:inline">
              ({isToday ? 'Today' : formattedDate})
            </span>
          </div>

          <button
            onClick={goToNextDay}
            className="p-1.5 hover:bg-[#EBE9E1] dark:hover:bg-[#344035] rounded-xl text-[#8C8980] dark:text-[#A3A096] hover:text-[#3D3D3D] transition-colors cursor-pointer"
            title="Next Day"
            aria-label="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={goToToday}
              className="ml-1 text-[11px] font-bold px-2.5 py-1 bg-[#7D8C6F] text-white hover:bg-[#68765c] rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Today
            </button>
          )}
        </div>

        {/* Right Actions: Dark Mode, Language, Sheets Sync, Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Dark Mode Quick Switch */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-[#F5F4EF] dark:bg-[#2A332B] hover:bg-[#EBE9E1] dark:hover:bg-[#354336] text-[#3D3D3D] dark:text-[#E8EAE6] border border-[#EBE9E1] dark:border-[#384439] transition-colors cursor-pointer"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#7D8C6F]" />}
          </button>

          {/* Multi-language Quick Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F5F4EF] dark:bg-[#2A332B] hover:bg-[#EBE9E1] dark:hover:bg-[#354336] text-[#3D3D3D] dark:text-[#E8EAE6] border border-[#EBE9E1] dark:border-[#384439] text-xs font-bold cursor-pointer"
            title="Toggle Language (EN / ID)"
          >
            <Globe className="w-3.5 h-3.5 text-[#7D8C6F]" />
            <span className="uppercase">{language}</span>
          </button>

          {/* Google Sheets Sync Pill */}
          <button
            onClick={() => setIsSheetsModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F4EF] dark:bg-[#2A332B] hover:bg-[#E9EAE3] dark:hover:bg-[#354336] text-[#4A5D4E] dark:text-[#C5D1BC] border border-[#EBE9E1] dark:border-[#384439] rounded-xl text-xs font-bold transition-all hover:shadow-xs group cursor-pointer"
            title="Google Sheets Database connection & sync"
          >
            <span className="w-2 h-2 rounded-full bg-[#7D8C6F] group-hover:scale-125 transition-transform" />
            <Database className="w-3.5 h-3.5 text-[#7D8C6F]" />
            <span className="hidden md:inline">Sheets</span>
            <span className="text-[10px] text-[#8C8980] dark:text-[#A3A096] font-normal">
              {lastSheetsSync ? lastSheetsSync : 'Ready'}
            </span>
          </button>

          {/* Profile Photo Avatar Button */}
          <button
            onClick={() => setActiveTab('profile')}
            className="w-9 h-9 rounded-xl overflow-hidden border border-[#EBE9E1] dark:border-[#384439] hover:border-[#7D8C6F] transition-all cursor-pointer shrink-0"
            title="Open Profile & Settings"
          >
            {personalInfo.profilePhoto ? (
              <img
                src={personalInfo.profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-[#7D8C6F] text-white flex items-center justify-center font-bold text-xs">
                {personalInfo.name ? personalInfo.name[0].toUpperCase() : 'U'}
              </div>
            )}
          </button>

          {/* Reset Demo Data button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo data and history to fresh sample values?')) {
                resetAllData();
              }
            }}
            className="p-1.5 text-[#8C8980] dark:text-[#A3A096] hover:text-[#3D3D3D] dark:hover:text-white hover:bg-[#F5F4EF] dark:hover:bg-[#2A332B] rounded-xl transition-colors"
            title="Reset Sample Data"
            aria-label="Reset Sample Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
