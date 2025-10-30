import dayjs from 'dayjs';

export const defaultProfile = {
  name: 'Legend in Progress',
  currentAge: 21,
  targetAge: 25,
  targetGoal: '$100M Net Worth',
  targetGoalProgress: 3_500_000,
  targetGoalTotal: 100_000_000,
  startDate: dayjs().startOf('year').format('YYYY-MM-DD')
};

export const defaultHabits = [
  {
    id: 'habit-deep-work',
    name: 'Deep Work Sprint',
    type: 'daily',
    xp: 120,
    category: 'Deep Work'
  },
  {
    id: 'habit-gym',
    name: 'Strength Training',
    type: 'daily',
    xp: 80,
    category: 'Gym'
  },
  {
    id: 'habit-writing',
    name: 'Vision Journal',
    type: 'weekly',
    xp: 150,
    category: 'Writing'
  }
];

export const defaultTaskLogs = [
  {
    id: 'log-1',
    habitId: 'habit-deep-work',
    habitName: 'Deep Work Sprint',
    date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    completed: true,
    xpEarned: 120,
    category: 'Deep Work'
  },
  {
    id: 'log-2',
    habitId: 'habit-gym',
    habitName: 'Strength Training',
    date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
    completed: true,
    xpEarned: 80,
    category: 'Gym'
  }
];

export const defaultTimeBlocks = [
  {
    day: 'Monday',
    blocks: [
      {
        id: 'block-1',
        start: '07:00',
        end: '08:15',
        task: 'Strength Training',
        category: 'Gym',
        durationMinutes: 75,
        source: 'manual'
      },
      {
        id: 'block-2',
        start: '09:00',
        end: '11:00',
        task: 'Deep Work Sprint',
        category: 'Deep Work',
        durationMinutes: 120,
        source: 'manual'
      }
    ]
  },
  {
    day: 'Tuesday',
    blocks: [
      {
        id: 'block-3',
        start: '07:30',
        end: '08:45',
        task: 'Strength Training',
        category: 'Gym',
        durationMinutes: 75,
        source: 'manual'
      }
    ]
  }
];
