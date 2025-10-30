import { CalendarIcon, ChartBarIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const items = [
  { label: 'Dashboard', icon: ChartBarIcon, target: '#dashboard-stats' },
  { label: 'Planner', icon: CalendarIcon, target: '#time-blocking' },
  { label: 'Chat', icon: ChatBubbleLeftRightIcon, target: '#chatbot' },
  { label: 'Profile', icon: Cog6ToothIcon, target: '#profile' }
];

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-around rounded-3xl border border-white/10 bg-base-900/90 px-4 py-3 backdrop-blur md:hidden">
      {items.map((item) => (
        <button
          type="button"
          key={item.label}
          onClick={() => {
            const element = document.querySelector(item.target);
            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="flex flex-col items-center text-xs font-medium text-base-300"
        >
          <item.icon className="h-5 w-5 text-white" />
          <span className="mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
