export type CharacterMood = 'ecstatic' | 'happy' | 'content' | 'neutral' | 'tired';

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
  description: string;
  emoji: string;
  price: number;
  category: 'hat' | 'accessory' | 'background' | 'boost';
  unlockLevel: number;
  purchased: boolean;
};

export type Character = {
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
  };
  stats: {
    tasksCompleted: number;
    projectsCompleted: number;
    longestStreak: number;
  };
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  requirement: number;
  progress: number;
  completed: boolean;
  reward: {
    xp: number;
    coins: number;
  };
};

export type NotificationType = 'xp' | 'coins' | 'levelup' | 'info';

export type Notification = {
  id: string;
  message: string;
  type: NotificationType;
};
