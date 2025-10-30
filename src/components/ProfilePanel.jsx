import { useContext, useEffect, useMemo, useState } from 'react';
import { CalendarDaysIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import AppContext from '../context/AppContext.jsx';

const fields = [
  { name: 'name', label: 'Name / Alias', type: 'text', placeholder: 'Legend in Progress' },
  { name: 'currentAge', label: 'Current Age', type: 'number', min: 0 },
  { name: 'targetAge', label: 'Target Age', type: 'number', min: 1 },
  { name: 'targetGoal', label: 'North Star Goal', type: 'text', placeholder: '$100M Net Worth' },
  { name: 'targetGoalProgress', label: 'Current Goal Progress', type: 'number', min: 0 },
  { name: 'targetGoalTotal', label: 'Target Goal Value', type: 'number', min: 1 },
  { name: 'startDate', label: 'Tracking Start Date', type: 'date' }
];

export default function ProfilePanel() {
  const { state, dispatch, addNotification } = useContext(AppContext);
  const [formState, setFormState] = useState(state.userProfile);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFormState(state.userProfile);
    setIsDirty(false);
  }, [state.userProfile]);

  const goalCompletion = useMemo(() => {
    const current = Number(formState.targetGoalProgress ?? 0);
    const total = Number(formState.targetGoalTotal ?? 1);
    if (!total) return 0;
    return Math.min(100, Math.round((current / total) * 100));
  }, [formState.targetGoalProgress, formState.targetGoalTotal]);

  const pace = useMemo(() => {
    const start = formState.startDate ? dayjs(formState.startDate) : dayjs().startOf('year');
    const elapsed = Math.max(dayjs().diff(start, 'day'), 1);
    const progress = Number(formState.targetGoalProgress ?? 0);
    return Math.round((progress / elapsed) * 7);
  }, [formState.startDate, formState.targetGoalProgress]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const submit = (event) => {
    event.preventDefault();
    dispatch({ type: 'UPDATE_PROFILE', payload: {
      ...formState,
      currentAge: Number(formState.currentAge ?? 0),
      targetAge: Number(formState.targetAge ?? 0),
      targetGoalProgress: Number(formState.targetGoalProgress ?? 0),
      targetGoalTotal: Number(formState.targetGoalTotal ?? 0)
    } });
    addNotification('Profile updated and synced across the dashboard.', 'success');
    setIsDirty(false);
  };

  return (
    <section id="profile" className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-2">
            <IdentificationIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Identity Blueprint</h2>
            <p className="text-sm text-base-400">Dial in who you are and where you&apos;re headed.</p>
          </div>
        </div>
        <div className="hidden text-right md:block">
          <p className="text-xs uppercase tracking-wide text-base-500">Goal completion</p>
          <p className="text-lg font-semibold text-white">{goalCompletion}%</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-4 space-y-3">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-base-500">{field.label}</label>
            <input
              className="rounded-xl border border-white/10 bg-base-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              type={field.type}
              min={field.min}
              value={formState[field.name] ?? ''}
              placeholder={field.placeholder}
              onChange={(event) => handleChange(field.name, event.target.value)}
            />
          </div>
        ))}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-base-500">Weekly Pace (avg)</label>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-base-900 px-3 py-2 text-sm text-white">
            <span className="flex items-center gap-2">
              <CalendarDaysIcon className="h-4 w-4" />
              {pace.toLocaleString()} units / week
            </span>
            <span className="text-xs text-base-400">Based on progress vs. start date</span>
          </div>
        </div>
        <button
          className="w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!isDirty}
        >
          Save profile
        </button>
      </form>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-base-500">
          <span>Goal progress</span>
          <span>{goalCompletion}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-base-800">
          <div className="h-full rounded-full bg-white" style={{ width: `${goalCompletion}%` }} />
        </div>
      </div>
    </section>
  );
}
