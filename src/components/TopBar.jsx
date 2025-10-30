import { useContext, useEffect, useState } from 'react';
import { BellAlertIcon, CloudArrowDownIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import AppContext from '../context/AppContext.jsx';

export default function TopBar() {
  const { state, google } = useContext(AppContext);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('life-os-theme') !== 'light');
  const [sound, setSound] = useState(() => localStorage.getItem('life-os-sound') !== 'muted');

  useEffect(() => {
    const classList = document.documentElement.classList;
    if (darkMode) {
      classList.add('dark');
    } else {
      classList.remove('dark');
    }
    localStorage.setItem('life-os-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('life-os-sound', sound ? 'on' : 'muted');
  }, [sound]);

  return (
    <header className="flex flex-col gap-4 border-b border-base-900/80 bg-base-950/70 px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Mission Control</h1>
        <p className="text-sm text-base-400">Age {state.userProfile.currentAge} → {state.userProfile.targetAge} | {state.userProfile.targetGoal}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="flex items-center gap-2 rounded-full border border-base-700 px-3 py-2 text-sm text-base-200 transition hover:bg-white/5"
        >
          {darkMode ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
          <span>{darkMode ? 'Dark' : 'Light'}</span>
        </button>
        <button
          onClick={() => setSound((prev) => !prev)}
          className="flex items-center gap-2 rounded-full border border-base-700 px-3 py-2 text-sm text-base-200 transition hover:bg-white/5"
        >
          <BellAlertIcon className="h-4 w-4" />
          <span>{sound ? 'Sound On' : 'Muted'}</span>
        </button>
        <button
          className="flex items-center gap-2 rounded-full border border-base-700 px-3 py-2 text-sm text-base-200 transition hover:bg-white/5"
          onClick={() => {
            const data = localStorage.getItem('life-os-data-v1');
            const blob = new Blob([data ?? '{}'], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'life-os-backup.json';
            link.click();
            URL.revokeObjectURL(url);
          }}
        >
          <CloudArrowDownIcon className="h-4 w-4" />
          <span>Export</span>
        </button>
        {google.ready ? (
          google.signedIn ? (
            <button
              className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wide text-white"
              onClick={google.signOut}
            >
              Sign out Google
            </button>
          ) : (
            <button
              className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wide text-white"
              onClick={google.signIn}
            >
              Connect Google
            </button>
          )
        ) : (
          <button
            className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wide text-white"
            onClick={() => {
              const clientId = prompt('Enter your Google OAuth Client ID');
              const apiKey = prompt('Enter your Google API key');
              if (clientId && apiKey) {
                google.init(clientId, apiKey);
              }
            }}
          >
            Init Google
          </button>
        )}
      </div>
    </header>
  );
}
