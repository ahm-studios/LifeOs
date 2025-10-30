export function generateLevelThresholds(maxLevel = 100) {
  const thresholds = [0];
  for (let level = 1; level <= maxLevel; level += 1) {
    const xp = Math.floor(100 * Math.pow(level, 1.6));
    thresholds.push(thresholds[level - 1] + xp);
  }
  return thresholds;
}

export function computeLevelFromXp(xp, thresholds = generateLevelThresholds()) {
  let level = 1;
  let nextLevelXp = thresholds[2] || 500;
  for (let i = 1; i < thresholds.length; i += 1) {
    if (xp >= thresholds[i]) {
      level = i;
      nextLevelXp = thresholds[i + 1] ?? thresholds[i] + 1000;
    } else {
      nextLevelXp = thresholds[i];
      break;
    }
  }
  return { level, nextLevelXp };
}

export function calculateStreak(taskLogs) {
  const sorted = [...taskLogs]
    .filter((log) => log.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!sorted.length) return 0;
  let streak = 0;
  let currentDate = sorted[0].date;
  for (const log of sorted) {
    if (log.date === currentDate) {
      streak += 1;
      currentDate = new Date(new Date(currentDate).getTime() - 86400000)
        .toISOString()
        .slice(0, 10);
    } else if (log.date > currentDate) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}
