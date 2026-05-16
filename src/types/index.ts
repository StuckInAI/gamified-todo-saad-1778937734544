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
  type: 'hat' | 'accessory' | 'outfit';
  color: string;
};

export type Equipment = {
  hat: string | null;
  accessory: string | null;
  outfit: string | null;
};

export type Character = {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  mood: number;
  equipment: Equipment;
  ownedItems: string[];
};

export type NotificationType = 'xp' | 'coins' | 'levelup' | 'info';

export type Notification = {
  id: string;
  message: string;
  type: NotificationType;
};

export type GameState = {
  character: Character;
  tasks: Task[];
  projects: Project[];
  shopItems: ShopItem[];
  streak: number;
  lastActiveDate: string | null;
};
