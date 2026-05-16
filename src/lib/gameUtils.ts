import type { Task, Character } from '@/types';

export function calculateLevel(xp: number): { level: number; xpInLevel: number; xpForLevel: number } {
  let level = 1;
  let xpRequired = 100;
  let totalXp = xp;

  while (totalXp >= xpRequired) {
    totalXp -= xpRequired;
    level++;
    xpRequired = Math.floor(xpRequired * 1.25);
  }

  return {
    level,
    xpInLevel: totalXp,
    xpForLevel: xpRequired,
  };
}

export function getMoodEmoji(mood: Character['mood']): string {
  switch (mood) {
    case 'happy': return '😊';
    case 'ecstatic': return '🤩';
    case 'content': return '😌';
    case 'neutral': return '😐';
    case 'tired': return '😴';
    default: return '😊';
  }
}

export function getTaskStatus(task: Task): 'completed' | 'overdue' | 'warning' | 'active' {
  if (task.completed) return 'completed';
  if (!task.deadline) return 'active';

  const now = new Date();
  const officialDeadline = new Date(task.deadline);
  const extendedDeadline = new Date(task.deadline);
  extendedDeadline.setDate(extendedDeadline.getDate() + task.extensionDays);

  if (now > extendedDeadline) return 'overdue';

  const warningMs = 2 * 24 * 60 * 60 * 1000;
  if (extendedDeadline.getTime() - now.getTime() < warningMs) return 'warning';

  return 'active';
}

export function formatDeadline(deadline: string, extensionDays: number): string {
  const base = new Date(deadline);
  const extended = new Date(deadline);
  extended.setDate(extended.getDate() + extensionDays);

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

  if (extensionDays > 0) {
    return `${base.toLocaleDateString('en-US', options)} (+${extensionDays}d)`;
  }
  return base.toLocaleDateString('en-US', options);
}
