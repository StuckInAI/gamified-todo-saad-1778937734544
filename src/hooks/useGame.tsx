import { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { GameState, Task, Project, ShopItem, Notification } from '@/types';
import { SHOP_ITEMS } from '@/lib/gameData';
import { calculateLevel } from '@/lib/gameUtils';
import { loadState, saveState } from '@/lib/storage';

type Action =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt'> }
  | { type: 'COMPLETE_TASK'; payload: { id: string } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'ADD_PROJECT'; payload: Omit<Project, 'id' | 'completedCount' | 'createdAt'> }
  | { type: 'DELETE_PROJECT'; payload: { id: string } }
  | { type: 'BUY_ITEM'; payload: { item: ShopItem } }
  | { type: 'EQUIP_ITEM'; payload: { item: ShopItem } }
  | { type: 'CHECK_STREAK' };

const defaultState: GameState = {
  character: {
    name: 'Adventurer',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    xpInLevel: 0,
    coins: 50,
    mood: 'happy',
    equipment: { hat: null, accessory: null },
    inventory: [],
  },
  tasks: [],
  projects: [],
  shopItems: SHOP_ITEMS,
  streak: 0,
  lastActiveDate: null,
  notifications: [],
};

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_TASK': {
      const task: Task = {
        ...action.payload,
        id: crypto.randomUUID(),
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      };
      return { ...state, tasks: [...state.tasks, task] };
    }

    case 'COMPLETE_TASK': {
      const newXp = state.character.xp + (state.tasks.find(t => t.id === action.payload.id)?.xpReward ?? 0);
      const newCoins = state.character.coins + (state.tasks.find(t => t.id === action.payload.id)?.coinReward ?? 0);
      const { level, xpInLevel, xpForLevel } = calculateLevel(newXp);

      const completedTask = state.tasks.find(t => t.id === action.payload.id);
      const updatedProjects = state.projects.map((p) =>
        completedTask?.projectId === p.id
          ? { ...p, completedCount: p.completedCount + 1 }
          : p
      );

      const completedCount = state.tasks.filter(t => t.completed).length + 1;
      const mood =
        completedCount >= 10
          ? 'ecstatic'
          : completedCount >= 5
          ? 'happy'
          : completedCount >= 2
          ? 'content'
          : 'neutral';

      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? { ...t, completed: true, completedAt: new Date().toISOString() }
            : t
        ),
        projects: updatedProjects,
        character: {
          ...state.character,
          xp: newXp,
          xpToNextLevel: xpForLevel,
          xpInLevel,
          level,
          coins: newCoins,
          mood,
        },
      };
    }

    case 'DELETE_TASK': {
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload.id) };
    }

    case 'ADD_PROJECT': {
      const project: Project = {
        ...action.payload,
        id: crypto.randomUUID(),
        completedCount: 0,
        createdAt: new Date().toISOString(),
      };
      return { ...state, projects: [...state.projects, project] };
    }

    case 'DELETE_PROJECT': {
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload.id),
        tasks: state.tasks.map((t) =>
          t.projectId === action.payload.id ? { ...t, projectId: null } : t
        ),
      };
    }

    case 'BUY_ITEM': {
      const item = action.payload.item;
      if (state.character.inventory.includes(item.id)) return state;
      if (state.character.coins < item.price) return state;
      return {
        ...state,
        character: {
          ...state.character,
          coins: state.character.coins - item.price,
          inventory: [...state.character.inventory, item.id],
        },
      };
    }

    case 'EQUIP_ITEM': {
      const item = action.payload.item;
      if (!state.character.inventory.includes(item.id)) return state;
      const slot = item.slot as 'hat' | 'accessory';
      return {
        ...state,
        character: {
          ...state.character,
          equipment: {
            ...state.character.equipment,
            [slot]: state.character.equipment[slot] === item.id ? null : item.id,
          },
        },
      };
    }

    case 'CHECK_STREAK': {
      const today = new Date().toISOString().split('T')[0];
      const last = state.lastActiveDate;
      if (last === today) return state;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = last === yesterday ? state.streak + 1 : 1;
      return { ...state, streak: newStreak, lastActiveDate: today };
    }

    default:
      return state;
  }
}

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  notifications: Notification[];
  addNotification: (message: string, type: Notification['type']) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, defaultState, (init) => {
    const saved = loadState();
    return saved ?? init;
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    dispatch({ type: 'CHECK_STREAK' });
  }, []);

  const addNotification = useCallback((message: string, type: Notification['type']) => {
    const id = crypto.randomUUID();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, notifications, addNotification }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
