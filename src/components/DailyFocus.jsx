import { useContext, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import AppContext from '../context/AppContext.jsx';

const sourceLabels = {
  manual: 'Manual',
  google: 'Google',
  suggested: 'Suggested',
  chatbot: 'AI Planner'
};

export default function DailyFocus() {
  const { state } = useContext(AppContext);
  const [now, setNow] = useState(() => dayjs());
  const todayName = now.format('dddd');
  const todayDate = now.format('YYYY-MM-DD');

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const { upcomingBlock, ongoingBlock, todayBlocks } = useMemo(() => {
    const blocks = (state.timeBlocks.find((entry) => entry.day === todayName)?.blocks ?? []).slice().sort((a, b) => {
      return a.start.localeCompare(b.start);
    });
    const ongoing = blocks.find((block) => {
      const [startHour, startMinute] = block.start.split(':').map(Number);
      const [endHour, endMinute] = block.end.split(':').map(Number);
      const start = dayjs().hour(startHour).minute(startMinute);
      const end = dayjs().hour(endHour).minute(endMinute);
      return !now.isBefore(start) && now.isBefore(end);
    });
    const upcoming = blocks.find((block) => {
      const [startHour, startMinute] = block.start.split(':').map(Number);
      const start = dayjs().hour(startHour).minute(startMinute);
      return start.isAfter(now);
    });
    return { ongoingBlock: ongoing ?? null, upcomingBlock: upcoming ?? null, todayBlocks: blocks };
  }, [state.timeBlocks, todayName, now]);

  const todayLogs = useMemo(() => state.taskLogs.filter((log) => log.date === todayDate), [state.taskLogs, todayDate]);
  const completedHabitIds = useMemo(() => new Set(todayLogs.filter((log) => log.completed).map((log) => log.habitId)), [todayLogs]);

  const totalHabits = state.habits.length;
  const completedHabits = state.habits.filter((habit) => completedHabitIds.has(habit.id)).length;
  const focusScore = totalHabits ? Math.round((completedHabits / totalHabits) * 100) : 0;
  const totalMinutesScheduled = todayBlocks.reduce((acc, block) => acc + (block.durationMinutes ?? 0), 0);
  const totalHours = Math.round((totalMinutesScheduled / 60) * 10) / 10;

  const nextLabel = useMemo(() => {
    if (ongoingBlock) {
      return 'In progress';
    }
    if (!upcomingBlock) {
      return 'All clear';
    }
    const [hour, minute] = upcomingBlock.start.split(':').map(Number);
    const start = dayjs().hour(hour).minute(minute);
    const diffMinutes = start.diff(now, 'minute');
    if (diffMinutes <= 0) {
      return 'Starting now';
    }
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    if (hours === 0) {
      return `Starts in ${minutes} min`;
    }
    return `Starts in ${hours}h ${minutes}m`;
  }, [ongoingBlock, upcomingBlock, now]);

  return (
    <section id="daily-focus" className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Daily Focus</h2>
          <p className="text-sm text-base-400">Lock in on today&apos;s plan, timelines, and habit score.</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-base-500">Focus score</p>
          <p className="text-2xl font-semibold text-white">{focusScore}%</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-base-500">{ongoingBlock ? 'Now' : 'Next up'}</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {ongoingBlock?.task ?? upcomingBlock?.task ?? 'No sessions scheduled'}
          </p>
          <p className="mt-1 text-sm text-base-400">
            {ongoingBlock
              ? `${ongoingBlock.start} - ${ongoingBlock.end} • ${ongoingBlock.category}`
              : upcomingBlock
                ? `${upcomingBlock.start} - ${upcomingBlock.end} • ${upcomingBlock.category}`
                : 'Add a block or let the chatbot auto-plan your day.'}
          </p>
          <p className="mt-3 text-xs uppercase tracking-wide text-base-500">{nextLabel}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-wide text-base-500">Today&apos;s load</p>
          <p className="mt-2 text-3xl font-semibold text-white">{Number.isFinite(totalHours) ? totalHours : 0}h</p>
          <p className="mt-1 text-sm text-base-400">{totalMinutesScheduled} minutes scheduled</p>
          <div className="mt-4">
            <div className="h-2 rounded-full bg-base-800">
              <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(focusScore, 100)}%` }} />
            </div>
            <p className="mt-2 text-xs text-base-400">{completedHabits} / {totalHabits} habits logged</p>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-base-500">Timeline</p>
            <span className="text-xs text-base-400">{todayBlocks.length} blocks</span>
          </div>
          <ul className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
            {todayBlocks.length === 0 && (
              <li className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-base-400">
                No blocks planned yet. Use the form below or the chatbot to build momentum.
              </li>
            )}
            {todayBlocks.map((block) => {
              const label = sourceLabels[block.source] ?? 'Planner';
              return (
                <li key={block.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{block.task}</p>
                    <p className="text-xs uppercase tracking-wide text-base-500">
                      {block.start} – {block.end} • {block.category}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-wide text-base-400">
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-base-500">Habit checklist</p>
            <span className="text-xs text-base-400">{completedHabits} done</span>
          </div>
          <ul className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
            {state.habits.length === 0 && (
              <li className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-base-400">
                Add habits to start tracking your streaks.
              </li>
            )}
            {state.habits.map((habit) => {
              const completed = completedHabitIds.has(habit.id);
              return (
                <li
                  key={habit.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{habit.name}</p>
                    <p className="text-xs uppercase tracking-wide text-base-500">{habit.category} • {habit.type}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-wide ${
                      completed
                        ? 'border border-white/10 bg-white/20 text-white'
                        : 'border border-white/10 text-base-400'
                    }`}
                  >
                    {completed ? 'Completed' : 'Pending'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
