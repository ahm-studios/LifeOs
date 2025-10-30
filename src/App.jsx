import { useContext, useEffect, useMemo, useState } from 'react';
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

  const mainGrid = useMemo(
    () => (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <CurrentStats />
          <GoalCountdown />
          <ProgressCharts />
          <TrajectoryPanel />
          <TimeBlockPlanner />
          <ChatbotPanel />
        </div>
        <div className="space-y-6">
          <AvatarPanel />
          <HabitManager />
          <GoogleCalendarPanel />
          <AchievementsPanel />
          <LifeSnap />
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="flex min-h-screen bg-base-950 text-base-100">
      <Sidebar />
      <div className="flex w-full flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {mainGrid}
        </main>
      </div>
      <NotificationTray notifications={notifications} />
      <WeeklyReviewModal open={showWeeklyReview} onClose={closeWeeklyReview} />
      <MobileNav />
    </div>
  );
}

export default App;
