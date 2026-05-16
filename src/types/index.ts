export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'active' | 'completed' | 'overdue';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  projectId: string | null;
  deadline: string | null;
  extensionDays: number;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  xpReward: number;
  coinReward: number;
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

export type ItemCategory = 'hat' | 'outfit' | 'accessory' | 'background' | 'pet';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  price: number;
  emoji: string;
  color: string;
  owned: boolean;
  equipped: boolean;
}

export interface CharacterEquipment {
  hat: string | null;
  outfit: string | null;
  accessory: string | null;
  background: string | null;
  pet: string | null;
}

export interface Character {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  equipment: CharacterEquipment;
  mood: 'happy' | 'neutral' | 'tired';
}

export interface GameState {
  character: Character;
  tasks: Task[];
  projects: Project[];
  shopItems: ShopItem[];
  totalTasksCompleted: number;
  streak: number;
  lastCompletedDate: string | null;
}

export interface Notification {
  id: string;
  message: string;
  type: 'xp' | 'coins' | 'levelup' | 'info';
}
