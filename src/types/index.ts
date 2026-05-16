export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
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
};

export type Project = {
  id: string;
  name: string;
  description: string;
  deadline: string | null;
  extensionDays: number;
  color: string;
  emoji: string;
  createdAt: string;
};

export type EquipmentSlot = 'hat' | 'outfit' | 'accessory';

export type ShopItem = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  effect?: string;
  price: number;
  category: EquipmentSlot;
  rarity: 'common' | 'rare' | 'epic';
};

export type Character = {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  mood: 'happy' | 'neutral' | 'tired';
  equipment: Record<EquipmentSlot, string | null>;
  purchasedItems: string[];
};

export type GameState = {
  character: Character;
  tasks: Task[];
  projects: Project[];
  shopItems: ShopItem[];
  streak: number;
  lastActiveDate: string | null;
};
