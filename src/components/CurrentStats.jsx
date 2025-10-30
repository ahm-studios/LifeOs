import { useContext, useMemo } from 'react';
import AppContext from '../context/AppContext.jsx';
import dayjs from 'dayjs';
import { calculateStreak } from '../lib/levels.js';

export default function CurrentStats() {
  const { state } = useContext(AppContext);

  const todayLogs = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    return state.taskLogs.filter((log) => log.date === today && log.completed);
  }, [state.taskLogs]);

  const streak = useMemo(() => calculateStreak(state.taskLogs), [state.taskLogs]);

  const progressToNextLevel = useMemo(() => {
    const nextXp = state.levels.nextLevelXp ?? state.levels.thresholds?.[state.levels.level + 1] ?? 9999;
    const currentLevelXp = state.levels.thresholds?.[state.levels.level] ?? 0;
    const xpIntoLevel = state.levels.xp - currentLevelXp;
    const xpRange = nextXp - currentLevelXp;
    return Math.min(100, Math.floor((xpIntoLevel / xpRange) * 100));
  }, [state.levels]);

  return (
    <section id="dashboard-stats" className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Current Momentum</h2>
          <p className="text-sm text-base-400">Gamified overview of today&apos;s grind</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-base-400">Level</p>
            <p className="text-3xl font-bold text-white">{state.levels.level}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-base-400">Total XP</p>
            <p className="text-3xl font-bold text-white">{state.levels.xp}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
        <StatCard label="Streak" value={`${streak} days`} />
        <StatCard label="Tasks Today" value={todayLogs.length} />
        <StatCard label="XP to Next Level" value={`${progressToNextLevel}%`} />
        <StatCard label="Habits" value={state.habits.length} />
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-base-400">
          <span>Progress to next level</span>
          <span>{progressToNextLevel}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-base-800">
          <div className="h-full rounded-full bg-white" style={{ width: `${progressToNextLevel}%` }} />
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <p className="text-xs uppercase tracking-wide text-base-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
