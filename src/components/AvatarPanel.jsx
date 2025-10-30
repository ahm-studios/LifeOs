import { useContext, useMemo } from 'react';
import AppContext from '../context/AppContext.jsx';

export default function AvatarPanel() {
  const { state } = useContext(AppContext);

  const glow = useMemo(() => {
    const intensity = Math.min(1, state.levels.level / 50);
    return `0 0 ${30 + intensity * 70}px rgba(255,255,255,${0.25 + intensity * 0.5})`;
  }, [state.levels.level]);

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 text-center">
      <h2 className="text-lg font-semibold text-white">Avatar</h2>
      <p className="text-sm text-base-400">Level-based glow evolves with your progress</p>
      <div className="mt-6 flex justify-center">
        <div
          className="flex h-36 w-36 items-center justify-center rounded-3xl border border-white/20 bg-white/10"
          style={{ boxShadow: glow }}
        >
          <span className="text-4xl">⚡️</span>
        </div>
      </div>
      <p className="mt-6 text-sm text-base-300">
        Level {state.levels.level} • XP {state.levels.xp} • Glow +{Math.round((state.levels.level / 50) * 100)}%
      </p>
    </section>
  );
}
