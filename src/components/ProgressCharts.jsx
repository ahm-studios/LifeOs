import { useContext, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import dayjs from 'dayjs';
import AppContext from '../context/AppContext.jsx';
import '../lib/registerCharts.js';

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(10,10,10,0.9)',
      borderColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: 'rgba(255,255,255,0.45)' }
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: 'rgba(255,255,255,0.45)' }
    }
  }
};

export default function ProgressCharts() {
  const { state } = useContext(AppContext);

  const xpByDay = useMemo(() => {
    const grouped = {};
    state.taskLogs.forEach((log) => {
      grouped[log.date] = (grouped[log.date] ?? 0) + (log.xpEarned ?? 0);
    });
    const last7 = Array.from({ length: 7 }).map((_, idx) => dayjs().subtract(6 - idx, 'day').format('YYYY-MM-DD'));
    return last7.map((date) => ({ date, xp: grouped[date] ?? 0 }));
  }, [state.taskLogs]);

  const habitsCompleted = useMemo(() => {
    const completed = {};
    const missed = {};
    state.habits.forEach((habit) => {
      completed[habit.name] = state.taskLogs.filter((log) => log.habitId === habit.id && log.completed).length;
      missed[habit.name] = state.taskLogs.filter((log) => log.habitId === habit.id && !log.completed).length;
    });
    return { completed, missed };
  }, [state.habits, state.taskLogs]);

  const timeByCategory = useMemo(() => {
    const totals = {};
    state.timeBlocks.forEach((day) => {
      day.blocks.forEach((block) => {
        const category = block.category ?? 'Focus';
        totals[category] = (totals[category] ?? 0) + (block.durationMinutes ?? 60);
      });
    });
    return totals;
  }, [state.timeBlocks]);

  return (
    <section id="progress-charts" className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold text-white">Progress Graphs</h2>
      <p className="text-sm text-base-400">Visualize the compounding results of your habits</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <h3 className="text-sm font-semibold text-white">XP Earned (Last 7 Days)</h3>
          <Line
            className="mt-4"
            data={{
              labels: xpByDay.map((entry) => dayjs(entry.date).format('ddd')),
              datasets: [
                {
                  label: 'XP',
                  data: xpByDay.map((entry) => entry.xp),
                  borderColor: 'rgba(255,255,255,0.8)',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  tension: 0.4,
                  fill: true
                }
              ]
            }}
            options={chartOptions}
          />
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <h3 className="text-sm font-semibold text-white">Habits Completed vs Missed</h3>
          <Bar
            className="mt-4"
            data={{
              labels: Object.keys(habitsCompleted.completed),
              datasets: [
                {
                  label: 'Completed',
                  data: Object.values(habitsCompleted.completed),
                  backgroundColor: 'rgba(255,255,255,0.7)'
                },
                {
                  label: 'Missed',
                  data: Object.values(habitsCompleted.missed),
                  backgroundColor: 'rgba(255,255,255,0.3)'
                }
              ]
            }}
            options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: true, labels: { color: 'white' } } } }
          />
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white">Time Spent per Category</h3>
          <Bar
            className="mt-4"
            data={{
              labels: Object.keys(timeByCategory),
              datasets: [
                {
                  label: 'Minutes',
                  data: Object.values(timeByCategory),
                  backgroundColor: 'rgba(255,255,255,0.6)'
                }
              ]
            }}
            options={chartOptions}
          />
        </div>
      </div>
    </section>
  );
}
