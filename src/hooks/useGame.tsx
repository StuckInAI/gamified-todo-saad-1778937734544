import React, { createContext, useContext, useReducer, useCallback, useState, useEffect } from 'react';
import type { GameState, Task, Project, ShopItem } from '@/types';
import { loadState, saveState } from '@/lib/storage';
import { INITIAL_SHOP_ITEMS, INITIAL_CHARACTER } from '@/lib/gameData';
import { calculateLevel } from '@/lib/gameUtils';

type NotificationType = 'xp' | 'coins' | 'levelup' | 'info';
export type Notification = { id: string; message: string; type: NotificationType };

const initialState: GameState = {
  character: INITIAL_CHARACTER,
  tasks: [],
  projects: [],
  shopItems: INITIAL_SHOP_ITEMS,
  streak: 0,
  lastActiveDate: null,
};

function loadInitialState(): GameState {
  const saved = loadState();
  if (saved) return { ...initialState, ...saved };
  return initialState;
}

type Action =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedAt'> }
  | { type: 'COMPLETE_TASK'; payload: { id: string } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'ADD_PROJECT'; payload: Omit<Project, 'id' | 'createdAt' | 'taskCount' | 'completedCount'> }
  | { type: 'DELETE_PROJECT'; payload: { id: string } }
  | { type: 'BUY_ITEM'; payload: { itemId: string } }
  | { type: 'EQUIP_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_STREAK' };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        completed: false,
        completedAt: null,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case 'COMPLETE_TASK': {
      const task = state.tasks.find((t) => t.id === action.payload.id);
      if (!task || task.completed) return state;

      const newXp = state.character.xp + task.xpReward;
      const newCoins = state.character.coins + task.coinReward;
      const { level, xpInLevel, xpForLevel } = calculateLevel(newXp);

      const updatedTasks = state.tasks.map((t) =>
        t.id === action.payload.id
          ? { ...t, completed: true, completedAt: new Date().toISOString() }
          : t
      );

      const projectId = task.projectId;
      const updatedProjects = state.projects.map((p) =>
        p.id === projectId
          ? { ...p, completedCount: p.completedCount + 1 }
          : p
      );

      return {
        ...state,
        tasks: updatedTasks,
        projects: updatedProjects,
        character: {
          ...state.character,
          xp: xpInLevel,
          xpToNextLevel: xpForLevel,
          level,
          coins: newCoins,
          mood:
            level > state.character.level
              ? 'ecstatic'
              : newCoins > 50
              ? 'happy'
              : 'content',
        },
      };
    }

    case 'DELETE_TASK': {
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload.id) };
    }

    case 'ADD_PROJECT': {
      const newProject: Project = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        taskCount: 0,
        completedCount: 0,
      };
      return { ...state, projects: [...state.projects, newProject] };
    }

    case 'DELETE_PROJECT': {
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload.id),
        tasks: state.tasks.filter((t) => t.projectId !== action.payload.id),
      };
    }

    case 'BUY_ITEM': {
      const item = state.shopItems.find((i) => i.id === action.payload.itemId);
      if (!item) return state;
      if (state.character.coins < item.price) return state;
      if (state.character.inventory.includes(item.id)) return state;

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
      const item = state.shopItems.find((i) => i.id === action.payload.itemId);
      if (!item) return state;
      if (!state.character.inventory.includes(item.id)) return state;

      const slot = item.slot as 'hat' | 'accessory';
      const currentlyEquipped = state.character.equipment[slot];
      const newEquipment = {
        ...state.character.equipment,
        [slot]: currentlyEquipped === item.id ? null : item.id,
      };

      return {
        ...state,
        character: { ...state.character, equipment: newEquipment },
      };
    }

    case 'UPDATE_STREAK': {
      const today = new Date().toDateString();
      const last = state.lastActiveDate;
      if (last === today) return state;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newStreak =
        last === yesterday.toDateString() ? state.streak + 1 : 1;
      return { ...state, streak: newStreak, lastActiveDate: today };
    }

    default:
      return state;
  }
}

type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  notifications: Notification[];
  addNotification: (message: string, type: NotificationType) => void;
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadInitialState);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    dispatch({ type: 'UPDATE_STREAK' });
  }, []);

  const addNotification = useCallback((message: string, type: NotificationType) => {
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
