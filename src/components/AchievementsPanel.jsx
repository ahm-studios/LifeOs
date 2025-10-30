import { useContext } from 'react';
import AppContext from '../context/AppContext.jsx';

export default function AchievementsPanel() {
  const { state } = useContext(AppContext);

  return (
    <section id="achievements" className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold text-white">Achievements</h2>
      <p className="text-sm text-base-400">Unlock badges as you stack wins.</p>
      <div className="mt-4 grid gap-3">
        {state.achievements.length === 0 && (
          <p className="text-sm text-base-400">Complete habits to unlock your first badge.</p>
        )}
        {state.achievements.map((achievement) => (
          <div key={achievement.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-2xl">{achievement.icon}</div>
            <div>
              <p className="text-sm font-semibold text-white">{achievement.title}</p>
              <p className="text-xs text-base-500">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
