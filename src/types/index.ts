export type TaskPriority = 'low' | 'medium' | 'high';

export type EquipmentCategory = 'hat' | 'accessory' | 'weapon';

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
  color: string;
  emoji: string;
  deadline: string | null;
  extensionDays: number;
  createdAt: string;
};

export type ShopItem = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  category: EquipmentCategory;
  effect?: string;
};

export type Equipment = {
  hat: string | null;
  accessory: string | null;
  weapon: string | null;
};

export type CharacterMood = 'happy' | 'neutral' | 'sad';

export type Character = {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  mood: CharacterMood;
  equipment: Equipment;
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

export type NotificationType = 'xp' | 'coins' | 'levelup' | 'info';

export type Notification = {
  id: string;
  message: string;
  type: NotificationType;
};
