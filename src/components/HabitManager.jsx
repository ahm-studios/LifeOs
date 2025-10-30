import { useContext, useMemo, useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import AppContext from '../context/AppContext.jsx';

const habitTypes = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'One-off', value: 'once' }
];

export default function HabitManager() {
  const { state, dispatch, logTaskCompletion } = useContext(AppContext);
  const [form, setForm] = useState({ name: '', xp: 50, type: 'daily', category: '' });

  const submitHabit = (event) => {
    event.preventDefault();
    if (!form.name) return;
    const habit = {
      id: form.id ?? crypto.randomUUID(),
      name: form.name,
      xp: Number(form.xp),
      type: form.type,
      category: form.category || 'Focus'
    };
    dispatch({ type: 'UPSERT_HABIT', payload: habit });
    setForm({ name: '', xp: 50, type: 'daily', category: '' });
  };

  const removeHabit = (id) => dispatch({ type: 'DELETE_HABIT', payload: id });

  const completionsToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return new Set(state.taskLogs.filter((log) => log.date === today && log.completed).map((log) => log.habitId));
  }, [state.taskLogs]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Habit Engine</h2>
          <p className="text-sm text-base-400">Define the missions you execute daily</p>
        </div>
      </div>
      <form onSubmit={submitHabit} className="mt-4 space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-base-500">Name</label>
          <input
            className="rounded-xl border border-white/10 bg-base-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Habit name"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-base-500">XP</label>
            <input
              type="number"
              className="rounded-xl border border-white/10 bg-base-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              value={form.xp}
              onChange={(event) => setForm((prev) => ({ ...prev, xp: event.target.value }))}
              min={0}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-base-500">Type</label>
            <select
              className="rounded-xl border border-white/10 bg-base-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
            >
              {habitTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-base-500">Category</label>
          <input
            className="rounded-xl border border-white/10 bg-base-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            placeholder="Gym, Deep Work, ..."
          />
        </div>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          <PlusIcon className="h-4 w-4" /> Add Habit
        </button>
      </form>
      <div className="mt-5 space-y-3">
        {state.habits.map((habit) => (
          <div key={habit.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div>
              <p className="text-sm font-semibold text-white">{habit.name}</p>
              <p className="text-xs uppercase tracking-wide text-base-500">
                {habit.type} • {habit.category} • {habit.xp} XP
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-full border border-white/20 px-3 py-2 text-xs uppercase tracking-wide text-white transition hover:bg-white/10"
                onClick={() => logTaskCompletion(habit, new Date())}
                disabled={completionsToday.has(habit.id)}
              >
                {completionsToday.has(habit.id) ? 'Logged' : 'Log XP'}
              </button>
              <button
                className="rounded-full border border-white/20 p-2 text-white transition hover:bg-white/10"
                onClick={() => removeHabit(habit.id)}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
