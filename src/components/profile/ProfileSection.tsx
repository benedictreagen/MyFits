import React, { useState } from 'react';
import {
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Database,
  Globe,
  Lock,
  Moon,
  Palette,
  RefreshCw,
  Sliders,
  Sun,
  Type,
  Upload,
  User,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useHealth } from '../../context/HealthContext';
import {
  LanguageType,
  ThemeType,
  TypographyType,
  UnitSystem,
} from '../../types';
import { getTranslation } from '../../utils/translations';
import { ImageUploadInput } from '../common/ImageUploadInput';

export const ProfileSection: React.FC = () => {
  const {
    language,
    setLanguage,
    darkMode,
    setDarkMode,
    theme,
    setTheme,
    typography,
    setTypography,
    unitSystem,
    setUnitSystem,
    personalInfo,
    updatePersonalInfo,
    achievements,
    sheetsConfig,
    updateSheetsConfig,
    triggerSheetsSync,
    pullSheetsSync,
    calendarConfig,
    updateCalendarConfig,
    tasksConfig,
    updateTasksConfig,
    lastSheetsSync,
  } = useHealth();

  const [badgeFilter, setBadgeFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Editable profile state
  const [name, setName] = useState(personalInfo.name || '');
  const [photo, setPhoto] = useState(personalInfo.profilePhoto || '');
  const [age, setAge] = useState(personalInfo.age);
  const [heightCm, setHeightCm] = useState(personalInfo.heightCm);
  const [sex, setSex] = useState(personalInfo.sex);
  const [activityLevel, setActivityLevel] = useState(personalInfo.activityLevel);

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    updatePersonalInfo({
      name: name.trim(),
      profilePhoto: photo,
      age: Number(age),
      heightCm: Number(heightCm),
      sex,
      activityLevel,
    });
    setTimeout(() => {
      setIsSavingProfile(false);
      setProfileSuccessMsg('Profile details saved successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    }, 400);
  };

  const filteredBadges = achievements.filter((b) => {
    if (badgeFilter === 'unlocked') return b.unlocked;
    if (badgeFilter === 'locked') return !b.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter((b) => b.unlocked).length;

  const THEMES: { id: ThemeType; name: string; color: string }[] = [
    { id: 'sage', name: 'Botanical Sage', color: '#7D8C6F' },
    { id: 'ocean', name: 'Calm Ocean', color: '#5B84B1' },
    { id: 'blush', name: 'Terracotta Blush', color: '#C07D67' },
    { id: 'lavender', name: 'Alpine Lavender', color: '#8A7B9D' },
    { id: 'sand', name: 'Warm Desert Sand', color: '#B39268' },
    { id: 'midnight', name: 'Deep Slate Forest', color: '#405B4D' },
  ];

  const TYPOGRAPHIES: { id: TypographyType; name: string; sample: string }[] = [
    { id: 'modern', name: 'Modern Geometric', sample: 'Plus Jakarta Sans' },
    { id: 'serif', name: 'Editorial Serif', sample: 'Newsreader / Playfair' },
    { id: 'rounded', name: 'Friendly Rounded', sample: 'Nunito Sans' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* 1. PROFILE OVERVIEW HEADER */}
      <section className="bg-white dark:bg-[#1E2520] p-6 sm:p-8 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs flex flex-col md:flex-row items-center gap-6 transition-colors">
        <div className="relative">
          {photo ? (
            <img
              src={photo}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-[#7D8C6F] shadow-md"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#FAF9F5] dark:bg-[#2A332B] border-4 border-[#7D8C6F] flex items-center justify-center text-[#7D8C6F] text-3xl font-bold">
              {name ? name[0].toUpperCase() : 'F'}
            </div>
          )}
          <span className="absolute bottom-0 right-0 bg-[#7D8C6F] text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-xs">
            PRO
          </span>
        </div>

        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
            <h1 className="text-2xl font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              {name || 'FitTrack Member'}
            </h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F5F4EF] dark:bg-[#2A332B] text-[#7D8C6F] dark:text-[#9FB191] border border-[#EBE9E1] dark:border-[#384439] w-fit mx-auto md:mx-0">
              {unlockedCount} / {achievements.length} Badges Earned
            </span>
          </div>
          <p className="text-xs text-[#8C8980] dark:text-[#A3A096]">
            {personalInfo.currentWeightKg} kg current • {personalInfo.heightCm} cm • {personalInfo.age} yrs •{' '}
            <span className="capitalize">{personalInfo.activityLevel.replace('_', ' ')}</span>
          </p>
        </div>
      </section>

      {/* 2. PROFILE BIOMETRICS & PHOTO CUSTOMIZATION */}
      <section className="bg-white dark:bg-[#1E2520] p-6 sm:p-8 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs space-y-6 transition-colors">
        <div>
          <h2 className="text-xl font-serif italic text-[#4A5D4E] dark:text-[#C5D1BC]">
            {getTranslation('profile_settings', language)}
          </h2>
          <p className="text-xs text-[#8C8980] dark:text-[#A3A096] mt-0.5">
            Update your profile picture, personal biometrics, and activity baseline
          </p>
        </div>

        {profileSuccessMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{profileSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSavePersonalInfo} className="space-y-5">
          {/* Profile Photo Upload via Device / Gallery or URL */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#252E27] border border-[#ECEAE2] dark:border-[#323E34]">
            <ImageUploadInput
              value={photo}
              onChange={setPhoto}
              label={getTranslation('profile_photo', language)}
              aspectRatio="square"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6] block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Elena Rostova"
                className="w-full p-2.5 rounded-xl border border-[#EBE9E1] dark:border-[#384439] bg-white dark:bg-[#1E2520] text-xs font-semibold text-[#3D3D3D] dark:text-[#E8EAE6]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6] block mb-1.5">
                Biological Sex
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#EBE9E1] dark:border-[#384439] bg-white dark:bg-[#1E2520] text-xs font-semibold text-[#3D3D3D] dark:text-[#E8EAE6]"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6] block mb-1.5">
                Age (years)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#EBE9E1] dark:border-[#384439] bg-white dark:bg-[#1E2520] text-xs font-semibold text-[#3D3D3D] dark:text-[#E8EAE6]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6] block mb-1.5">
                Height ({unitSystem === 'metric' ? 'cm' : 'inches'})
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#EBE9E1] dark:border-[#384439] bg-white dark:bg-[#1E2520] text-xs font-semibold text-[#3D3D3D] dark:text-[#E8EAE6]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6] block mb-1.5">
                Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#EBE9E1] dark:border-[#384439] bg-white dark:bg-[#1E2520] text-xs font-semibold text-[#3D3D3D] dark:text-[#E8EAE6]"
              >
                <option value="sedentary">Sedentary (Desk work, little intentional exercise)</option>
                <option value="lightly_active">Lightly Active (1–3 days/wk light movement)</option>
                <option value="moderately_active">Moderately Active (3–5 days/wk training)</option>
                <option value="very_active">Very Active (6–7 days/wk hard workouts)</option>
                <option value="extremely_active">Extremely Active (Athletic labor / 2x/day)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="px-6 py-2.5 rounded-full bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </section>

      {/* 3. ACHIEVEMENTS & MILESTONE BADGES */}
      <section className="bg-white dark:bg-[#1E2520] p-6 sm:p-8 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#7D8C6F]" />
              <h2 className="text-xl font-serif italic text-[#4A5D4E] dark:text-[#C5D1BC]">
                {getTranslation('achievements_title', language)}
              </h2>
            </div>
            <p className="text-xs text-[#8C8980] dark:text-[#A3A096] mt-0.5">
              {getTranslation('achievements_subtitle', language)}
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center bg-[#F5F4EF] dark:bg-[#2A332B] p-1 rounded-xl border border-[#EBE9E1] dark:border-[#384439] w-fit">
            <button
              onClick={() => setBadgeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                badgeFilter === 'all'
                  ? 'bg-white dark:bg-[#1E2520] text-[#3D3D3D] dark:text-white shadow-xs'
                  : 'text-[#8C8980]'
              }`}
            >
              All ({achievements.length})
            </button>
            <button
              onClick={() => setBadgeFilter('unlocked')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                badgeFilter === 'unlocked'
                  ? 'bg-white dark:bg-[#1E2520] text-[#7D8C6F] dark:text-[#9FB191] shadow-xs'
                  : 'text-[#8C8980]'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => setBadgeFilter('locked')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                badgeFilter === 'locked'
                  ? 'bg-white dark:bg-[#1E2520] text-[#3D3D3D] dark:text-white shadow-xs'
                  : 'text-[#8C8980]'
              }`}
            >
              In Progress ({achievements.length - unlockedCount})
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                badge.unlocked
                  ? 'bg-[#FAF9F5] dark:bg-[#252E27] border-[#7D8C6F]/30 shadow-xs'
                  : 'bg-[#FDFDFD] dark:bg-[#1A201C] border-[#ECEAE2] dark:border-[#2C332D] opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{badge.icon}</span>
                  {badge.unlocked ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Unlocked ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      Locked
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-serif font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                  {badge.title}
                </h3>
                <p className="text-[11px] text-[#8C8980] dark:text-[#A3A096] mt-1 line-clamp-2">
                  {badge.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#ECEAE2] dark:border-[#323E34]">
                <div className="flex justify-between text-[10px] font-semibold text-[#8C8980] dark:text-[#A3A096] mb-1">
                  <span>Progress</span>
                  <span>{badge.progressPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#EBE9E1] dark:bg-[#323E34] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${badge.progressPct}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      badge.unlocked ? 'bg-[#7D8C6F]' : 'bg-[#A6826D]'
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. THEME, DARK MODE & TYPOGRAPHY SETTINGS */}
      <section className="bg-white dark:bg-[#1E2520] p-6 sm:p-8 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs space-y-6 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#7D8C6F]" />
            <h2 className="text-xl font-serif italic text-[#4A5D4E] dark:text-[#C5D1BC]">
              {getTranslation('appearance_settings', language)}
            </h2>
          </div>
          <p className="text-xs text-[#8C8980] dark:text-[#A3A096] mt-0.5">
            Personalize light/dark display, organic palette tones, and typography scale
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dark Mode Toggle */}
          <div className="p-4 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#ECEAE2] dark:border-[#323E34] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E2520] flex items-center justify-center text-[#7D8C6F] shadow-xs">
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                  {getTranslation('dark_mode', language)}
                </p>
                <p className="text-[11px] text-[#8C8980] dark:text-[#A3A096]">
                  {darkMode ? 'Comfortable eye-safe night mode' : 'Crisp natural daylight mode'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                darkMode ? 'bg-[#7D8C6F] justify-end' : 'bg-[#DCD9D0] justify-start'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Language Switcher */}
          <div className="p-4 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#ECEAE2] dark:border-[#323E34] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E2520] flex items-center justify-center text-[#7D8C6F] shadow-xs">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                  {getTranslation('language', language)}
                </p>
                <p className="text-[11px] text-[#8C8980] dark:text-[#A3A096]">
                  English or Bahasa Indonesia
                </p>
              </div>
            </div>

            <div className="flex bg-white dark:bg-[#1E2520] p-1 rounded-xl border border-[#ECEAE2] dark:border-[#384439]">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  language === 'en'
                    ? 'bg-[#7D8C6F] text-white'
                    : 'text-[#8C8980]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  language === 'id'
                    ? 'bg-[#7D8C6F] text-white'
                    : 'text-[#8C8980]'
                }`}
              >
                ID
              </button>
            </div>
          </div>
        </div>

        {/* Theme Palette Options */}
        <div>
          <label className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6] block mb-2">
            Natural Palette Themes
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {THEMES.map((th) => (
              <button
                key={th.id}
                onClick={() => setTheme(th.id)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                  theme === th.id
                    ? 'border-[#7D8C6F] bg-[#FAF9F5] dark:bg-[#2A332B] shadow-xs'
                    : 'border-[#ECEAE2] dark:border-[#323E34] hover:bg-[#F9F8F4]'
                }`}
              >
                <span
                  className="w-7 h-7 rounded-full shadow-inner border border-white"
                  style={{ backgroundColor: th.color }}
                />
                <span className="text-xs font-semibold text-[#3D3D3D] dark:text-[#E8EAE6]">
                  {th.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Typography Selector */}
        <div>
          <label className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6] block mb-2">
            Typography Style
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TYPOGRAPHIES.map((ty) => (
              <button
                key={ty.id}
                onClick={() => setTypography(ty.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  typography === ty.id
                    ? 'border-[#7D8C6F] bg-[#FAF9F5] dark:bg-[#2A332B] shadow-xs'
                    : 'border-[#ECEAE2] dark:border-[#323E34] hover:bg-[#F9F8F4]'
                }`}
              >
                <p className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">{ty.name}</p>
                <p className="text-[11px] text-[#8C8980] dark:text-[#A3A096] mt-0.5">{ty.sample}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GOOGLE WORKSPACE: SHEETS, CALENDAR & TASKS */}
      <section className="bg-white dark:bg-[#1E2520] p-6 sm:p-8 rounded-[32px] border border-[#F2F1EC] dark:border-[#2C332D] shadow-xs space-y-6 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#7D8C6F]" />
            <h2 className="text-xl font-serif italic text-[#4A5D4E] dark:text-[#C5D1BC]">
              Google Workspace Cloud Integrations
            </h2>
          </div>
          <p className="text-xs text-[#8C8980] dark:text-[#A3A096] mt-0.5">
            Seamlessly synchronize your 14-table database with Google Sheets, Google Calendar, and Google Tasks
          </p>
        </div>

        {/* Google Sheets Sync Panel */}
        <div className="p-5 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#ECEAE2] dark:border-[#323E34] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
                Google Sheets Database Backend
              </h3>
              <p className="text-xs text-[#8C8980] dark:text-[#A3A096]">
                Status:{' '}
                <span className="text-[#7D8C6F] font-bold">
                  {sheetsConfig.syncStatus === 'syncing' ? 'Syncing...' : 'Connected (14 Sheets)'}
                </span>{' '}
                • Last synced: {lastSheetsSync || 'Just now'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={triggerSheetsSync}
                className="px-3.5 py-1.5 rounded-xl bg-[#7D8C6F] hover:bg-[#68765c] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Push Sync</span>
              </button>
              <button
                onClick={pullSheetsSync}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1E2520] border border-[#DCD9D0] dark:border-[#384439] text-[#3D3D3D] dark:text-[#E8EAE6] text-xs font-bold hover:bg-[#F9F8F4] cursor-pointer"
              >
                Pull Latest
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#8C8980] block mb-1">
              Google Apps Script Webhook URL
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={sheetsConfig.webhookUrl || ''}
              onChange={(e) => updateSheetsConfig({ webhookUrl: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[#EBE9E1] dark:border-[#384439] bg-white dark:bg-[#1E2520] text-xs text-[#3D3D3D] dark:text-[#E8EAE6]"
            />
          </div>
        </div>

        {/* Google Calendar & Google Tasks Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Calendar Sync Options */}
          <div className="p-4 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#ECEAE2] dark:border-[#323E34] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              <Calendar className="w-4 h-4 text-[#7D8C6F]" />
              <span>Google Calendar Sync</span>
            </div>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={calendarConfig.syncWorkouts}
                  onChange={(e) => updateCalendarConfig({ syncWorkouts: e.target.checked })}
                  className="accent-[#7D8C6F]"
                />
                <span>Workout & training schedule</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={calendarConfig.syncMealPrep}
                  onChange={(e) => updateCalendarConfig({ syncMealPrep: e.target.checked })}
                  className="accent-[#7D8C6F]"
                />
                <span>Meal prep & grocery planning blocks</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={calendarConfig.syncFastingWindow}
                  onChange={(e) => updateCalendarConfig({ syncFastingWindow: e.target.checked })}
                  className="accent-[#7D8C6F]"
                />
                <span>Intermittent fasting eating windows</span>
              </label>
            </div>
          </div>

          {/* Tasks Sync Options */}
          <div className="p-4 rounded-2xl bg-[#F9F8F4] dark:bg-[#252E27] border border-[#ECEAE2] dark:border-[#323E34] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              <CheckCircle2 className="w-4 h-4 text-[#7D8C6F]" />
              <span>Google Tasks Sync</span>
            </div>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tasksConfig.syncMealPrep}
                  onChange={(e) => updateTasksConfig({ syncMealPrep: e.target.checked })}
                  className="accent-[#7D8C6F]"
                />
                <span>Daily nutrition checklist</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tasksConfig.syncGroceryList}
                  onChange={(e) => updateTasksConfig({ syncGroceryList: e.target.checked })}
                  className="accent-[#7D8C6F]"
                />
                <span>Weekly meal plan grocery list</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tasksConfig.syncWaterReminder}
                  onChange={(e) => updateTasksConfig({ syncWaterReminder: e.target.checked })}
                  className="accent-[#7D8C6F]"
                />
                <span>Hydration milestone reminders</span>
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
