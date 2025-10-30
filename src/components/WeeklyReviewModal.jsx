import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useContext, useState } from 'react';
import AppContext from '../context/AppContext.jsx';

export default function WeeklyReviewModal({ open, onClose }) {
  const { state } = useContext(AppContext);
  const [form, setForm] = useState({ wentWell: '', improve: '', focus: '' });

  const submit = (event) => {
    event.preventDefault();
    onClose();
    setForm({ wentWell: '', improve: '', focus: '' });
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl rounded-3xl border border-white/10 bg-base-950 p-6">
                <Dialog.Title className="text-xl font-semibold text-white">Weekly Review</Dialog.Title>
                <p className="mt-1 text-sm text-base-400">Reflect, recalibrate, and set the tone for the next sprint.</p>
                <div className="mt-4 grid gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <ReviewStat label="Sessions Completed" value={state.weeklyReflection.completed} />
                  <ReviewStat label="Sessions Missed" value={state.weeklyReflection.missed} />
                  <p className="text-sm text-base-300">{state.weeklyReflection.reflections}</p>
                </div>
                <form onSubmit={submit} className="mt-4 grid gap-3">
                  <TextArea label="What went well?" value={form.wentWell} onChange={(value) => setForm((prev) => ({ ...prev, wentWell: value }))} />
                  <TextArea label="What could improve?" value={form.improve} onChange={(value) => setForm((prev) => ({ ...prev, improve: value }))} />
                  <TextArea label="Focus for next week" value={form.focus} onChange={(value) => setForm((prev) => ({ ...prev, focus: value }))} />
                  <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                    Save Review
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function ReviewStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <p className="text-xs uppercase tracking-wide text-base-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="text-sm text-base-300">
      <span className="text-xs uppercase tracking-wide text-base-500">{label}</span>
      <textarea
        className="mt-2 w-full rounded-2xl border border-white/10 bg-base-900/80 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
