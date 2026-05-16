import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { xpToNextLevel } from '@/lib/gameUtils';
import { loadState, saveState } from '@/lib/storage';
import { getInitialState } from '@/lib/gameData';
import type { GameState, Task, Project, ShopItem, Notification } from '@/types';

type Action =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt'> }
  | { type: 'COMPLETE_TASK'; payload: { id: string } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'ADD_PROJECT'; payload: Omit<Project, 'id' | 'createdAt'> }
  | { type: 'DELETE_PROJECT'; payload: { id: string } }
  | { type: 'BUY_ITEM'; payload: { id: string } }
  | { type: 'EQUIP_ITEM'; payload: { id: string } }
  | { type: 'UNEQUIP_ITEM'; payload: { id: string } }
  | { type: 'SET_STATE'; payload: GameState };

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadInitialState(): GameState {
  const saved = loadState<GameState | null>(null);
  if (saved) return saved;
  return getInitialState();
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_TASK': {
      const task: Task = {
        ...action.payload,
        id: generateId(),
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
      let level = state.character.level;
      let xp = newXp;
      let xpToNext = state.character.xpToNextLevel;
      while (xp >= xpToNext) {
        xp -= xpToNext;
        level += 1;
        xpToNext = xpToNextLevel(level);
      }
      const tasksCompleted = state.tasks.filter((t) => t.completed).length + 1;
      const mood =
        tasksCompleted >= 10 ? 'ecstatic'
        : tasksCompleted >= 6 ? 'happy'
        : tasksCompleted >= 3 ? 'content'
        : 'neutral';
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? { ...t, completed: true, completedAt: new Date().toISOString() }
            : t
        ),
        character: {
          ...state.character,
          xp,
          coins: newCoins,
          level,
          xpToNextLevel: xpToNext,
          mood,
        },
      };
    }
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload.id) };
    case 'ADD_PROJECT': {
      const project: Project = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      return { ...state, projects: [project, ...state.projects] };
    }
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload.id),
        tasks: state.tasks.map((t) =>
          t.projectId === action.payload.id ? { ...t, projectId: null } : t
        ),
      };
    case 'BUY_ITEM': {
      const item = state.shopItems.find((i) => i.id === action.payload.id);
      if (!item || item.owned || state.character.coins < item.cost) return state;
      return {
        ...state,
        character: { ...state.character, coins: state.character.coins - item.cost },
        shopItems: state.shopItems.map((i) =>
          i.id === action.payload.id ? { ...i, owned: true } : i
        ),
      };
    }
    case 'EQUIP_ITEM': {
      const item = state.shopItems.find((i) => i.id === action.payload.id);
      if (!item || !item.owned) return state;
      const category = item.category;
      const currentEquipped = state.shopItems.find(
        (i) => i.category === category && i.equipped
      );
      const isAlreadyEquipped = currentEquipped?.id === item.id;
      return {
        ...state,
        shopItems: state.shopItems.map((i) => {
          if (i.category === category) {
            return { ...i, equipped: !isAlreadyEquipped && i.id === item.id };
          }
          return i;
        }),
        character: {
          ...state.character,
          equipment: {
            ...state.character.equipment,
            [category]: isAlreadyEquipped ? null : item.id,
          },
        },
      };
    }
    case 'UNEQUIP_ITEM': {
      const item = state.shopItems.find((i) => i.id === action.payload.id);
      if (!item) return state;
      return {
        ...state,
        shopItems: state.shopItems.map((i) =>
          i.id === action.payload.id ? { ...i, equipped: false } : i
        ),
        character: {
          ...state.character,
          equipment: { ...state.character.equipment, [item.category]: null },
        },
      };
    }
    case 'SET_STATE':
      return action.payload;
    default:
      return state;
  }
}

type NotificationEntry = { id: string; message: string; type: Notification['type'] };

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  notifications: NotificationEntry[];
  addNotification: (message: string, type: Notification['type']) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);
  const [notifications, setNotifications] = React.useState<NotificationEntry[]>([]);
  const notifId = useRef(0);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addNotification = useCallback((message: string, type: Notification['type']) => {
    const id = String(++notifId.current);
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 2500);
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
