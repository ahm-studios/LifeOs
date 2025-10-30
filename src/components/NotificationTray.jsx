export default function NotificationTray({ notifications }) {
  return (
    <div className="pointer-events-none fixed inset-y-6 right-6 z-50 flex flex-col gap-2">
      {notifications.map((note) => (
        <div
          key={note.id}
          className="pointer-events-auto w-64 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm text-white shadow-soft"
        >
          <p className="font-semibold">{note.type === 'success' ? 'Victory' : note.type === 'info' ? 'Heads up' : 'Alert'}</p>
          <p className="text-xs text-white/80">{note.message}</p>
        </div>
      ))}
    </div>
  );
}
