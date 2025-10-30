import { useContext, useState } from 'react';
import { Bars3Icon, CalendarIcon, ChartBarIcon, Cog6ToothIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import AppContext from '../context/AppContext.jsx';

const navItems = [
  { name: 'Dashboard', icon: ChartBarIcon, href: '#dashboard-stats' },
  { name: 'Focus', icon: FireIcon, href: '#daily-focus' },
  { name: 'Planner', icon: CalendarIcon, href: '#time-blocking' },
  { name: 'Chatbot', icon: SparklesIcon, href: '#chatbot' },
  { name: 'Profile', icon: Cog6ToothIcon, href: '#profile' }
];

export default function Sidebar() {
  const { state } = useContext(AppContext);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        'flex h-screen flex-col border-r border-base-800 bg-base-950/80 backdrop-blur',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-6 w-6 text-white" />
          {!collapsed && (
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-base-400">Life OS</p>
              <p className="text-lg font-semibold text-white">{state.userProfile.name}</p>
            </div>
          )}
        </div>
        <button
          className="rounded-full border border-base-700 p-2 text-base-100 transition hover:bg-base-900"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
      </div>
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <a
            key={item.name}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-base-300 transition hover:bg-white/5 hover:text-white"
            href={item.href}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span>{item.name}</span>}
          </a>
        ))}
      </nav>
      <div className="border-t border-base-900 px-4 py-6 text-xs text-base-500">
        {!collapsed && (
          <p className="leading-5">
            Crafting the best version of yourself. Stay locked in and protect the mission.
          </p>
        )}
      </div>
    </aside>
  );
}
