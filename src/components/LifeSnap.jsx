import { useState } from 'react';

export default function LifeSnap() {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('life-os-snapshots');
    return saved ? JSON.parse(saved) : [];
  });
  const [text, setText] = useState('This week I pushed my limits and stayed consistent.');

  const addEntry = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      note: text.trim()
    };
    const updated = [entry, ...entries].slice(0, 12);
    setEntries(updated);
    localStorage.setItem('life-os-snapshots', JSON.stringify(updated));
    setText('');
  };

  return (
    <section id="life-snap" className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold text-white">Weekly Life Snap</h2>
      <p className="text-sm text-base-400">Capture a snapshot of your glow-up.</p>
      <form onSubmit={addEntry} className="mt-4 space-y-3">
        <textarea
          className="w-full rounded-2xl border border-white/10 bg-base-900/80 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          rows={3}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write a quick reflection or wins..."
        />
        <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
          Save Snapshot
        </button>
      </form>
      <div className="mt-5 space-y-3 max-h-56 overflow-y-auto pr-2">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-wide text-base-500">{new Date(entry.timestamp).toLocaleDateString()}</p>
            <p className="mt-2 text-sm text-white">{entry.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
