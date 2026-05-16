export type TaskPriority = 'low' | 'medium' | 'high';

export type CharacterMood = 'ecstatic' | 'happy' | 'content' | 'neutral' | 'tired' | 'sad';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  projectId: string | null;
  deadline: string | null;
  extensionDays: number;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  emoji: string;
  deadline: string | null;
  extensionDays: number;
  createdAt: string;
}

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  category: 'hat' | 'accessory' | 'outfit';
  owned: boolean;
  equipped: boolean;
}

export interface Character {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  mood: CharacterMood;
  equipment: {
    hat: string | null;
    accessory: string | null;
    outfit: string | null;
  };
}

export interface GameState {
  character: Character;
  tasks: Task[];
  projects: Project[];
  shopItems: ShopItem[];
  streak: number;
  lastActiveDate: string | null;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  message: string;
  type: 'xp' | 'coins' | 'levelup' | 'info';
}
