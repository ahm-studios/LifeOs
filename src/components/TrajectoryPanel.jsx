import { useContext, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import AppContext from '../context/AppContext.jsx';
import { computeLevelFromXp } from '../lib/levels.js';
import '../lib/registerCharts.js';

dayjs.extend(isoWeek);

export default function TrajectoryPanel() {
  const { state } = useContext(AppContext);

  const trajectory = useMemo(() => {
    const thresholds = state.levels.thresholds;
    const now = dayjs();
    const start = dayjs(state.userProfile.startDate ?? now.startOf('year'));
    const weeksElapsed = Math.max(1, now.diff(start, 'week'));
    const yearsRemaining = Math.max(0, state.userProfile.targetAge - state.userProfile.currentAge);
    const weeksRemaining = Math.max(0, Math.round(yearsRemaining * 52));
    const totalWeeks = weeksElapsed + weeksRemaining;
    const xpByWeek = aggregateXpByWeek(state.taskLogs, start, totalWeeks);
    const xpPerWeek = weeksElapsed ? state.levels.xp / weeksElapsed : 0;
    const projectedXp = state.levels.xp + xpPerWeek * weeksRemaining;
    const { level: projectedLevel } = computeLevelFromXp(projectedXp, thresholds);

    const currentGoal = state.userProfile.targetGoalProgress ?? 0;
    const goalTotal = state.userProfile.targetGoalTotal ?? 1;
    const goalRate = weeksElapsed ? currentGoal / weeksElapsed : 0;
    const projectedGoal = currentGoal + goalRate * weeksRemaining;
    const goalPercent = Math.min(100, Math.round((projectedGoal / goalTotal) * 100));

    const paceMessage = projectedGoal >= goalTotal
      ? 'You are on pace to crush your target.'
      : 'Current momentum is below target. Increase XP to accelerate growth.';

    const labels = xpByWeek.map((entry) => `W${entry.week}`);
    const idealPerWeek = weeksElapsed ? state.levels.xp / weeksElapsed : 0;
    const idealLine = xpByWeek.map((_, index) => idealPerWeek * (index + 1));
    const actualLine = xpByWeek.map((entry) => entry.cumulativeXp);

    return {
      projectedLevel,
      projectedGoal: projectedGoal.toLocaleString(),
      goalPercent,
      paceMessage,
      chartData: {
        labels,
        datasets: [
          {
            label: 'Actual XP',
            data: actualLine,
            borderColor: 'rgba(255,255,255,0.9)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Ideal Pace',
            data: idealLine,
            borderColor: 'rgba(255,255,255,0.3)',
            borderDash: [6, 6],
            tension: 0.4,
            fill: false
          }
        ]
      }
    };
  }, [state.levels, state.taskLogs, state.userProfile]);

  return (
    <section id="trajectory" className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">AI Trajectory Predictor</h2>
          <p className="text-sm text-base-400">Projects your level and goal outcome at current velocity.</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-base-400">Projected Level</p>
          <p className="text-2xl font-semibold text-white">{trajectory.projectedLevel}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-base-300">
        Projected goal: <span className="text-white">{trajectory.projectedGoal}</span> ({trajectory.goalPercent}% of target). {trajectory.paceMessage}
      </p>
      <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <Line
          data={trajectory.chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                labels: { color: 'rgba(255,255,255,0.7)', boxWidth: 12 }
              },
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
          }}
        />
      </div>
    </section>
  );
}

function aggregateXpByWeek(taskLogs, start, totalWeeks) {
  const weekBuckets = new Array(totalWeeks).fill(0);
  taskLogs.forEach((log) => {
    const logWeekIndex = Math.floor(Math.max(0, dayjs(log.date).diff(start, 'week')));
    if (logWeekIndex < totalWeeks) {
      weekBuckets[logWeekIndex] += log.xpEarned ?? 0;
    }
  });
  const weeks = [];
  let cumulative = 0;
  for (let index = 0; index < totalWeeks; index += 1) {
    const weeklyXp = weekBuckets[index];
    cumulative += weeklyXp;
    weeks.push({ week: index + 1, weeklyXp, cumulativeXp: cumulative });
  }
  return weeks;
}
