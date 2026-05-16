import type { Task, CharacterMood } from '@/types';

export function getTaskStatus(task: Task): 'pending' | 'completed' | 'overdue' | 'warning' {
  if (task.completed) return 'completed';
  if (!task.deadline) return 'pending';

  const now = new Date();
  const officialDeadline = new Date(task.deadline);
  const extendedDeadline = new Date(task.deadline);
  extendedDeadline.setDate(extendedDeadline.getDate() + (task.extensionDays || 0));

  if (now > extendedDeadline) return 'overdue';

  const warningThreshold = new Date(extendedDeadline);
  warningThreshold.setDate(warningThreshold.getDate() - 2);
  if (now >= warningThreshold) return 'warning';

  return 'pending';
}

export function formatDeadline(deadline: string, extensionDays: number): string {
  const base = new Date(deadline);
  const extended = new Date(deadline);
  extended.setDate(extended.getDate() + (extensionDays || 0));

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (extensionDays > 0) {
    return `${fmt(base)} (+${extensionDays}d → ${fmt(extended)})`;
  }
  return fmt(base);
}

export function getMoodEmoji(mood: CharacterMood): string {
  switch (mood) {
    case 'happy': return '😊';
    case 'neutral': return '😐';
    case 'tired': return '😴';
    default: return '😊';
  }
}

export function calculateLevel(currentXp: number): { level: number; xp: number; xpToNextLevel: number } {
  let level = 1;
  let xpToNextLevel = 100;
  let xp = currentXp;

  while (xp >= xpToNextLevel) {
    xp -= xpToNextLevel;
    level++;
    xpToNextLevel = Math.floor(xpToNextLevel * 1.3);
  }

  return { level, xp, xpToNextLevel };
}
