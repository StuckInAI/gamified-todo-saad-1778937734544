import type { Task } from '@/types';

export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.5));
}

export function calculateLevel(totalXp: number): number {
  let level = 1;
  while (getXpForLevel(level + 1) <= totalXp) {
    level++;
    if (level > 999) break;
  }
  return level;
}

export function getXpProgress(totalXp: number): { level: number; current: number; needed: number; percent: number } {
  const level = calculateLevel(totalXp);
  const xpForThisLevel = getXpForLevel(level);
  const xpForNextLevel = getXpForLevel(level + 1);
  const current = totalXp - xpForThisLevel;
  const needed = xpForNextLevel - xpForThisLevel;
  const percent = Math.min(100, Math.floor((current / needed) * 100));
  return { level, current, needed, percent };
}

export function getEffectiveDeadline(deadline: string | null, extensionDays: number): Date | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  d.setDate(d.getDate() + extensionDays);
  return d;
}

export function getTaskStatus(task: Task): 'completed' | 'overdue' | 'warning' | 'active' {
  if (task.completed) return 'completed';
  const effective = getEffectiveDeadline(task.deadline, task.extensionDays);
  if (!effective) return 'active';
  const now = new Date();
  const msLeft = effective.getTime() - now.getTime();
  const daysLeft = msLeft / (1000 * 60 * 60 * 24);
  if (daysLeft < 0) return 'overdue';
  if (daysLeft < 2) return 'warning';
  return 'active';
}

export function formatDeadline(deadline: string | null, extensionDays: number): string {
  if (!deadline) return 'No deadline';
  const official = new Date(deadline);
  const effective = getEffectiveDeadline(deadline, extensionDays);
  if (!effective) return 'No deadline';
  const officialStr = official.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (extensionDays === 0) return officialStr;
  const effectiveStr = effective.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${officialStr} (+${extensionDays}d → ${effectiveStr})`;
}

export function getPriorityXp(priority: string, baseXp: number): number {
  if (priority === 'high') return Math.floor(baseXp * 1.5);
  if (priority === 'medium') return baseXp;
  return Math.floor(baseXp * 0.7);
}

export function getMoodEmoji(mood: string): string {
  if (mood === 'happy') return '😊';
  if (mood === 'tired') return '😴';
  return '🙂';
}
