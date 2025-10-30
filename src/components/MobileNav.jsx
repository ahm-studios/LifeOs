import { CalendarIcon, ChartBarIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const items = [
  { label: 'Dashboard', icon: ChartBarIcon },
  { label: 'Planner', icon: CalendarIcon },
  { label: 'Chat', icon: ChatBubbleLeftRightIcon },
  { label: 'Settings', icon: Cog6ToothIcon }
];

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-around rounded-3xl border border-white/10 bg-base-900/90 px-4 py-3 backdrop-blur md:hidden">
      {items.map((item) => (
        <button key={item.label} className="flex flex-col items-center text-xs font-medium text-base-300">
          <item.icon className="h-5 w-5 text-white" />
          <span className="mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
