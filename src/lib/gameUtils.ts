import type { Task, CharacterMood } from '@/types';

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function xpToNextLevel(xp: number): number {
  const level = calculateLevel(xp);
  return level * 100 - xp;
}

export function getXpForLevel(level: number): number {
  return level * 100;
}

export function getMoodEmoji(mood: CharacterMood): string {
  switch (mood) {
    case 'happy': return '😊';
    case 'ecstatic': return '🤩';
    case 'content': return '😌';
    case 'neutral': return '😐';
    case 'tired': return '😴';
    default: return '😊';
  }
}

export function getMoodText(mood: CharacterMood): string {
  switch (mood) {
    case 'happy': return 'Happy';
    case 'ecstatic': return 'Ecstatic';
    case 'content': return 'Content';
    case 'neutral': return 'Neutral';
    case 'tired': return 'Tired';
    default: return 'Happy';
  }
}

export function getTaskStatus(task: Task): 'active' | 'completed' | 'overdue' | 'warning' {
  if (task.completed) return 'completed';
  if (!task.deadline) return 'active';

  const now = new Date();
  const officialDeadline = new Date(task.deadline);
  const finalDeadline = new Date(task.deadline);
  finalDeadline.setDate(finalDeadline.getDate() + (task.extensionDays || 0));

  if (now > finalDeadline) return 'overdue';

  const warningMs = 24 * 60 * 60 * 1000 * 2; // 2 days
  if (now > officialDeadline || finalDeadline.getTime() - now.getTime() < warningMs) {
    return 'warning';
  }

  return 'active';
}

export function formatDeadline(deadline: string, extensionDays?: number): string {
  const date = new Date(deadline);
  if (extensionDays && extensionDays > 0) {
    const extended = new Date(deadline);
    extended.setDate(extended.getDate() + extensionDays);
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (+${extensionDays}d)`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
