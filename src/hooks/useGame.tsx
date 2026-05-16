import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { INITIAL_SHOP_ITEMS, INITIAL_CHARACTER } from '@/lib/gameData';
import { calculateLevel } from '@/lib/gameUtils';
import { loadState, saveState } from '@/lib/storage';
import type { GameState, Notification, Task, Project, ShopItem } from '@/types';

type Action =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt'> }
  | { type: 'COMPLETE_TASK'; payload: { id: string } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'ADD_PROJECT'; payload: Omit<Project, 'id' | 'createdAt'> }
  | { type: 'DELETE_PROJECT'; payload: { id: string } }
  | { type: 'BUY_ITEM'; payload: { id: string } }
  | { type: 'EQUIP_ITEM'; payload: { id: string } }
  | { type: 'UNEQUIP_ITEM'; payload: { id: string } }
  | { type: 'LOAD_STATE'; payload: GameState };

const DEFAULT_STATE: GameState = {
  character: INITIAL_CHARACTER,
  tasks: [],
  projects: [],
  shopItems: INITIAL_SHOP_ITEMS,
  streak: 0,
  lastActiveDate: null,
};

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'ADD_TASK': {
      const task: Task = {
        ...action.payload,
        id: uid(),
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      };
      return { ...state, tasks: [task, ...state.tasks] };
    }

    case 'COMPLETE_TASK': {
      const task = state.tasks.find((t) => t.id === action.payload.id);
      if (!task || task.completed) return state;

      const newXp = state.character.xp + task.xpReward;
      const newCoins = state.character.coins + task.coinReward;
      const { level, xpToNextLevel } = calculateLevel(newXp);
      const completedTasksToday = state.tasks.filter(
        (t) => t.completed && t.completedAt && t.completedAt.startsWith(new Date().toISOString().slice(0, 10))
      ).length;
      const mood =
        level > state.character.level
          ? 'ecstatic'
          : completedTasksToday >= 4
          ? 'happy'
          : completedTasksToday >= 2
          ? 'content'
          : state.character.mood;

      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? { ...t, completed: true, completedAt: new Date().toISOString() }
            : t
        ),
        character: {
          ...state.character,
          xp: newXp,
          coins: newCoins,
          level,
          xpToNextLevel,
          mood,
        },
      };
    }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload.id) };

    case 'ADD_PROJECT': {
      const project: Project = {
        ...action.payload,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      return { ...state, projects: [project, ...state.projects] };
    }

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload.id),
        tasks: state.tasks.filter((t) => t.projectId !== action.payload.id),
      };

    case 'BUY_ITEM': {
      const item = state.shopItems.find((i) => i.id === action.payload.id);
      if (!item || item.owned || state.character.coins < item.price) return state;
      return {
        ...state,
        character: { ...state.character, coins: state.character.coins - item.price },
        shopItems: state.shopItems.map((i) =>
          i.id === action.payload.id ? { ...i, owned: true } : i
        ),
      };
    }

    case 'EQUIP_ITEM': {
      const item = state.shopItems.find((i) => i.id === action.payload.id) as ShopItem | undefined;
      if (!item || !item.owned) return state;
      const cat = item.category;
      return {
        ...state,
        shopItems: state.shopItems.map((i) =>
          i.category === cat ? { ...i, equipped: i.id === action.payload.id } : i
        ),
        character: {
          ...state.character,
          equipment: { ...state.character.equipment, [cat]: action.payload.id },
        },
      };
    }

    case 'UNEQUIP_ITEM': {
      const item = state.shopItems.find((i) => i.id === action.payload.id) as ShopItem | undefined;
      if (!item) return state;
      const cat = item.category;
      return {
        ...state,
        shopItems: state.shopItems.map((i) =>
          i.id === action.payload.id ? { ...i, equipped: false } : i
        ),
        character: {
          ...state.character,
          equipment: { ...state.character.equipment, [cat]: null },
        },
      };
    }

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  notifications: Notification[];
  addNotification: (message: string, type: Notification['type']) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadState<GameState>(DEFAULT_STATE);
    dispatch({ type: 'LOAD_STATE', payload: saved });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveState(state);
    }
  }, [state, hydrated]);

  const addNotification = useCallback((message: string, type: Notification['type']) => {
    const id = uid();
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

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
