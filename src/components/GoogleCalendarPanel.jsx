import { useContext, useEffect } from 'react';
import AppContext from '../context/AppContext.jsx';

export default function GoogleCalendarPanel() {
  const { google } = useContext(AppContext);

  useEffect(() => {
    if (google.signedIn) {
      google.refreshEvents();
    }
  }, [google.signedIn, google.refreshEvents]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Google Calendar</h2>
          <p className="text-sm text-base-400">Keep your mission synced with your calendar.</p>
        </div>
      </div>
      {!google.ready && (
        <p className="mt-4 text-sm text-base-400">
          Initialize the Google client from the top bar to connect your calendar.
        </p>
      )}
      {google.ready && !google.signedIn && (
        <p className="mt-4 text-sm text-base-400">Click &quot;Connect Google&quot; above to sign in.</p>
      )}
      {google.signedIn && (
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
          {google.events.map((event) => (
            <div key={event.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-sm font-semibold text-white">{event.summary ?? 'Untitled Event'}</p>
              <p className="text-xs uppercase tracking-wide text-base-500">
                {new Date(event.start?.dateTime ?? event.start?.date ?? '').toLocaleString()} –
                {new Date(event.end?.dateTime ?? event.end?.date ?? '').toLocaleString()}
              </p>
            </div>
          ))}
          {google.events.length === 0 && (
            <p className="text-sm text-base-400">No upcoming events detected.</p>
          )}
        </div>
      )}
    </section>
  );
}
