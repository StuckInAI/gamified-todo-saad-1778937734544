import type { Task, CharacterMood } from '@/types';

export function getMoodEmoji(mood: CharacterMood): string {
  switch (mood) {
    case 'ecstatic': return '🤩';
    case 'happy': return '😊';
    case 'content': return '😌';
    case 'neutral': return '😐';
    case 'tired': return '😴';
    case 'sad': return '😢';
    default: return '😐';
  }
}

export function getMoodLabel(mood: CharacterMood): string {
  switch (mood) {
    case 'ecstatic': return 'Ecstatic';
    case 'happy': return 'Happy';
    case 'content': return 'Content';
    case 'neutral': return 'Neutral';
    case 'tired': return 'Tired';
    case 'sad': return 'Sad';
    default: return 'Neutral';
  }
}

export function calculateLevel(xp: number): { level: number; xpToNextLevel: number } {
  let level = 1;
  let threshold = 100;
  let totalXp = xp;
  while (totalXp >= threshold) {
    totalXp -= threshold;
    level++;
    threshold = Math.floor(threshold * 1.4);
  }
  return { level, xpToNextLevel: threshold };
}

export function getTaskStatus(task: Task): 'completed' | 'overdue' | 'warning' | 'pending' {
  if (task.completed) return 'completed';
  if (!task.deadline) return 'pending';

  const now = new Date();
  const official = new Date(task.deadline);
  const extended = new Date(task.deadline);
  extended.setDate(extended.getDate() + task.extensionDays);

  if (now > extended) return 'overdue';

  const warningMs = 24 * 60 * 60 * 1000;
  if (extended.getTime() - now.getTime() < warningMs) return 'warning';
  if (now > official) return 'warning';

  return 'pending';
}

export function formatDeadline(deadline: string, extensionDays: number): string {
  const date = new Date(deadline);
  const ext = new Date(deadline);
  ext.setDate(ext.getDate() + extensionDays);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (extensionDays > 0) {
    return `${fmt(date)} (+${extensionDays}d → ${fmt(ext)})`;
  }
  return fmt(date);
}
