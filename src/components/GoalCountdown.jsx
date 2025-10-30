import { useContext, useMemo } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import AppContext from '../context/AppContext.jsx';

dayjs.extend(duration);

export default function GoalCountdown() {
  const { state } = useContext(AppContext);

  const countdown = useMemo(() => {
    const currentAge = Number(state.userProfile.currentAge);
    const targetAge = Number(state.userProfile.targetAge);
    const yearsRemaining = Math.max(targetAge - currentAge, 0);
    const birthYear = dayjs().year() - currentAge;
    const targetDate = dayjs().year(birthYear + targetAge).endOf('year');
    const diff = dayjs.duration(targetDate.diff(dayjs()));
    return {
      years: diff.years(),
      months: diff.months(),
      days: diff.days(),
      hours: diff.hours(),
      percentComplete: Math.min(100, Math.round(((targetAge - yearsRemaining) / targetAge) * 100))
    };
  }, [state.userProfile]);

  const goalPercent = useMemo(() => {
    const current = state.userProfile.targetGoalProgress ?? 0;
    const total = state.userProfile.targetGoalTotal ?? 1;
    return Math.min(100, Math.round((current / total) * 100));
  }, [state.userProfile]);

  return (
    <section id="goal-countdown" className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Countdown to Destiny</h2>
          <p className="text-sm text-base-400">Time horizon to your target age & goal</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-base-400">Target Goal</p>
          <p className="text-lg font-semibold text-white">{state.userProfile.targetGoal}</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <CountdownChip label="Years" value={countdown.years} />
        <CountdownChip label="Months" value={countdown.months} />
        <CountdownChip label="Days" value={countdown.days} />
        <CountdownChip label="Hours" value={countdown.hours} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ProgressBar label="Life timeline completed" value={countdown.percentComplete} />
        <ProgressBar label="Goal progress" value={goalPercent} />
      </div>
    </section>
  );
}

function CountdownChip({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
      <p className="text-xs uppercase tracking-wide text-base-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ProgressBar({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-base-500">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-base-800">
        <div className="h-full rounded-full bg-white" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
