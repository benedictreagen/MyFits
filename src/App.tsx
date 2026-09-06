import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HealthProvider, useHealth } from './context/HealthContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { SheetsSyncModal } from './components/SheetsSyncModal';
import { HomeDashboard } from './components/home/HomeDashboard';
import { FoodPage } from './components/food/FoodPage';
import { PlanPage } from './components/plan/PlanPage';
import { ActivityPage } from './components/activity/ActivityPage';
import { ProgressPage } from './components/progress/ProgressPage';
import { GoalsPage } from './components/goals/GoalsPage';
import { ProfileSection } from './components/profile/ProfileSection';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, typography } = useHealth();

  const typoClass =
    typography === 'serif'
      ? 'font-serif-luxury'
      : typography === 'rounded'
      ? 'font-rounded'
      : 'font-sans';

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#F9F8F4] dark:bg-[#151A17] text-[#3D3D3D] dark:text-[#E8EAE6] ${typoClass} antialiased selection:bg-[#7D8C6F]/20 selection:text-[#4A5D4E] transition-colors duration-200`}
    >
      {/* Top Header */}
      <Header />

      {/* Desktop Navigation Tabs */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Page Content Area */}
      <main className="flex-1 px-3 sm:px-6 lg:px-8 py-5 max-w-7xl w-full mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeTab === 'home' && <HomeDashboard />}
            {activeTab === 'food' && <FoodPage />}
            {activeTab === 'plan' && <PlanPage />}
            {activeTab === 'activity' && <ActivityPage />}
            {activeTab === 'progress' && <ProgressPage />}
            {activeTab === 'goals' && <GoalsPage />}
            {activeTab === 'profile' && <ProfileSection />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Google Sheets Sync & Data Modal */}
      <SheetsSyncModal />
    </div>
  );
};

export default function App() {
  return (
    <HealthProvider>
      <AppContent />
    </HealthProvider>
  );
}
