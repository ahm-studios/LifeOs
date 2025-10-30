import { useContext, useEffect, useState } from 'react';
import AppContext from './context/AppContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import CurrentStats from './components/CurrentStats.jsx';
import GoalCountdown from './components/GoalCountdown.jsx';
import ProgressCharts from './components/ProgressCharts.jsx';
import AvatarPanel from './components/AvatarPanel.jsx';
import HabitManager from './components/HabitManager.jsx';
import TimeBlockPlanner from './components/TimeBlockPlanner.jsx';
import ChatbotPanel from './components/ChatbotPanel.jsx';
import TrajectoryPanel from './components/TrajectoryPanel.jsx';
import AchievementsPanel from './components/AchievementsPanel.jsx';
import WeeklyReviewModal from './components/WeeklyReviewModal.jsx';
import LifeSnap from './components/LifeSnap.jsx';
import GoogleCalendarPanel from './components/GoogleCalendarPanel.jsx';
import NotificationTray from './components/NotificationTray.jsx';
import MobileNav from './components/MobileNav.jsx';
import { shouldTriggerWeeklyReview } from './lib/weeklyReview.js';
import dayjs from 'dayjs';
import ProfilePanel from './components/ProfilePanel.jsx';
import DailyFocus from './components/DailyFocus.jsx';

function App() {
  const { state, notifications } = useContext(AppContext);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [lastReview, setLastReview] = useState(() => localStorage.getItem('life-os-weekly-review'));

  useEffect(() => {
    if (shouldTriggerWeeklyReview(lastReview)) {
      setShowWeeklyReview(true);
    }
  }, [lastReview, state.taskLogs]);

  const closeWeeklyReview = () => {
    setShowWeeklyReview(false);
    const timestamp = dayjs().toISOString();
    setLastReview(timestamp);
    localStorage.setItem('life-os-weekly-review', timestamp);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-base-950 text-base-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.14), transparent 45%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.08), transparent 40%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.1), transparent 45%)'
        }}
      />
      <div className="relative z-10 flex min-h-screen">
        <div className="relative z-20 hidden flex-shrink-0 lg:block">
          <Sidebar />
        </div>
        <div className="relative z-10 flex w-full flex-col lg:ml-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                  <CurrentStats />
                  <DailyFocus />
                  <GoalCountdown />
                  <ProgressCharts />
                  <TrajectoryPanel />
                  <TimeBlockPlanner />
                  <ChatbotPanel />
                </div>
                <div className="space-y-6">
                  <ProfilePanel />
                  <AvatarPanel />
                  <HabitManager />
                  <GoogleCalendarPanel />
                  <AchievementsPanel />
                  <LifeSnap />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <NotificationTray notifications={notifications} />
      <WeeklyReviewModal open={showWeeklyReview} onClose={closeWeeklyReview} />
      <MobileNav />
    </div>
  );
}

export default App;
