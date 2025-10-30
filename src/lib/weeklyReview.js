import dayjs from 'dayjs';

export function summarizeWeek(taskLogs) {
  const now = dayjs();
  const startOfWeek = now.startOf('week');
  const logsThisWeek = taskLogs.filter((log) => dayjs(log.date).isAfter(startOfWeek.subtract(1, 'day')));
  const completed = logsThisWeek.filter((log) => log.completed);
  const missed = logsThisWeek.filter((log) => !log.completed);
  const byCategory = completed.reduce((acc, log) => {
    if (!acc[log.category]) acc[log.category] = 0;
    acc[log.category] += 1;
    return acc;
  }, {});
  return {
    completed: completed.length,
    missed: missed.length,
    byCategory,
    reflections: completed.length
      ? `You completed ${completed.length} sessions this week. Keep leaning into ${Object.keys(byCategory).join(', ') || 'your focus areas'}.`
      : 'No completions logged yet. Set a small goal to get momentum.'
  };
}

export function shouldTriggerWeeklyReview(lastShown) {
  if (!lastShown) return true;
  const diff = dayjs().diff(dayjs(lastShown), 'day');
  return diff >= 7;
}
