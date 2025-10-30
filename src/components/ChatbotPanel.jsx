import { useContext, useState } from 'react';
import AppContext from '../context/AppContext.jsx';

export default function ChatbotPanel() {
  const { chatbot } = useContext(AppContext);
  const [input, setInput] = useState('Today I want to do deep work, hit the gym, and meditate for focus.');

  const submit = (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    chatbot.processSummary(input.trim());
    setInput('');
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Trajectory Chatbot</h2>
          <p className="text-sm text-base-400">Share your focus – the bot auto time-blocks and nudges you.</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <textarea
          className="w-full rounded-2xl border border-white/10 bg-base-900/80 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          rows={3}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Describe how you want to show up today..."
        />
        <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
          Generate Plan
        </button>
      </form>
      <div className="mt-5 space-y-3 max-h-64 overflow-y-auto pr-2">
        {chatbot.history.map((entry) => (
          <div key={entry.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-wide text-base-500">{new Date(entry.timestamp).toLocaleString()}</p>
            <p className="mt-2 text-sm text-white">{entry.message}</p>
            {entry.generatedBlocks.length > 0 && (
              <div className="mt-3">
                <p className="text-xs uppercase tracking-wide text-base-500">Created Blocks</p>
                <ul className="mt-2 space-y-1 text-sm text-base-300">
                  {entry.generatedBlocks.map((block) => (
                    <li key={block.id}>
                      {block.task} · {block.start}-{block.end} · {block.category}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
