import type { CharacterMood } from '@/types';

export function xpToNextLevel(level: number): number {
  return level * 100;
}

export { xpToNextLevel as calcXpToNextLevel };

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

export function getTaskStatus(task: import('@/types').Task): 'normal' | 'warning' | 'overdue' | 'completed' {
  if (task.completed) return 'completed';
  if (!task.deadline) return 'normal';
  const now = new Date();
  const deadline = new Date(task.deadline);
  const finalDeadline = new Date(deadline);
  finalDeadline.setDate(finalDeadline.getDate() + (task.extensionDays || 0));
  if (now > finalDeadline) return 'overdue';
  const warningMs = 2 * 24 * 60 * 60 * 1000;
  if (finalDeadline.getTime() - now.getTime() < warningMs) return 'warning';
  return 'normal';
}

export function formatDeadline(deadline: string, extensionDays: number): string {
  const base = new Date(deadline);
  const final = new Date(base);
  final.setDate(final.getDate() + (extensionDays || 0));
  return final.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
