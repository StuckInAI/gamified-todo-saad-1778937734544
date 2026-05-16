export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'active' | 'completed' | 'overdue' | 'warning';

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
  completedCount: number;
  createdAt: string;
};

export type ShopItem = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  slot: 'hat' | 'accessory';
  category: string;
};

export type Character = {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  xpInLevel: number;
  coins: number;
  mood: 'happy' | 'neutral' | 'tired' | 'ecstatic' | 'content';
  equipment: {
    hat: string | null;
    accessory: string | null;
  };
  inventory: string[];
};

export type GameState = {
  character: Character;
  tasks: Task[];
  projects: Project[];
  shopItems: ShopItem[];
  streak: number;
  lastActiveDate: string | null;
  notifications: Notification[];
};

export type Notification = {
  id: string;
  message: string;
  type: 'xp' | 'coins' | 'levelup' | 'info';
};
