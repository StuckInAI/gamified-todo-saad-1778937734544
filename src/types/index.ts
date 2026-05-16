export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed' | 'overdue' | 'warning';
export type EquipmentSlot = 'hat' | 'outfit' | 'accessory' | 'weapon' | 'armor';
export type CharacterMood = 'happy' | 'neutral' | 'tired';

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
  description: string;
  emoji: string;
  price: number;
  category: EquipmentSlot;
  owned: boolean;
}

export interface Character {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  mood: CharacterMood;
  equipment: Record<EquipmentSlot, string | null>;
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
