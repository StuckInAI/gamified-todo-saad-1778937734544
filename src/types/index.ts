export type TaskPriority = 'low' | 'medium' | 'high';
export type CharacterMood = 1 | 2 | 3 | 4 | 5;
export type EquipmentCategory = 'hat' | 'accessory' | 'background' | 'outfit';

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
  price: number;
  category: EquipmentCategory;
  rarity: 'common' | 'rare' | 'epic';
  unlockLevel: number;
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
    background: string | null;
    outfit: string | null;
  };
  ownedItems: string[];
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

export type NotificationType = 'xp' | 'coins' | 'levelup' | 'info';

export interface GameState {
  character: Character;
  tasks: Task[];
  projects: Project[];
  shopItems: ShopItem[];
  streak: number;
  lastActiveDate: string | null;
}
