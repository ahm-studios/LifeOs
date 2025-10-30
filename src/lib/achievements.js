import dayjs from 'dayjs';

const ACHIEVEMENTS = [
  {
    id: 'streak-7',
    title: 'First 7-Day Streak',
    description: 'Complete a habit for 7 days in a row.',
    icon: '🔥',
    check: ({ streak }) => streak >= 7
  },
  {
    id: 'xp-1000',
    title: '1000 XP Club',
    description: 'Accumulate 1000 experience points.',
    icon: '💎',
    check: ({ xp }) => xp >= 1000
  },
  {
    id: 'deep-work-master',
    title: 'Deep Work Master',
    description: 'Log 20 deep work sessions.',
    icon: '🧠',
    check: ({ taskLogs }) => taskLogs.filter((log) => log.category === 'Deep Work').length >= 20
  },
  {
    id: 'gym-50-hours',
    title: '50 Hours of Gym',
    description: 'Spend 50 hours in the gym.',
    icon: '🏋️',
    check: ({ timeBlocks }) => {
      const totalGymMinutes = timeBlocks
        .flatMap((day) => day.blocks)
        .filter((block) => block.category?.toLowerCase() === 'gym')
        .reduce((acc, block) => acc + (block.durationMinutes ?? 60), 0);
      return totalGymMinutes >= 50 * 60;
    }
  },
  {
    id: 'consistent-month',
    title: 'Consistent Month',
    description: 'Complete at least one habit every day for 30 days.',
    icon: '📅',
    check: ({ taskLogs }) => {
      const logs = taskLogs
        .filter((log) => log.completed)
        .map((log) => log.date)
        .map((date) => dayjs(date).format('YYYY-MM-DD'));
      const uniqueDays = new Set(logs);
      return uniqueDays.size >= 30;
    }
  }
];

export function evaluateAchievements(taskLogs, levels, timeBlocks) {
  const streak = calculateStreakQuick(taskLogs);
  const context = { streak, xp: levels.xp, taskLogs, timeBlocks };
  return ACHIEVEMENTS.filter((achievement) => achievement.check(context));
}

function calculateStreakQuick(taskLogs) {
  const sorted = [...taskLogs]
    .filter((log) => log.completed)
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  if (!sorted.length) return 0;
  let streak = 0;
  let current = dayjs(sorted[0].date);
  for (const log of sorted) {
    const logDate = dayjs(log.date);
    if (logDate.isSame(current, 'day')) {
      streak += 1;
      current = current.subtract(1, 'day');
    } else if (logDate.isAfter(current, 'day')) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}
