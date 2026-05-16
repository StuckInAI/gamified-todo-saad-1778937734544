import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { GameState, Notification, NotificationType } from '@/types';
import { shopItems, initialCharacter } from '@/lib/gameData';
import { loadState, saveState } from '@/lib/storage';

const defaultState: GameState = {
  character: initialCharacter,
  tasks: [],
  projects: [],
  shopItems,
  streak: 0,
  lastActiveDate: null,
};

type Action =
  | { type: 'ADD_TASK'; payload: Omit<import('@/types').Task, 'id' | 'completed' | 'completedAt' | 'createdAt'> }
  | { type: 'COMPLETE_TASK'; payload: { id: string } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'ADD_PROJECT'; payload: Omit<import('@/types').Project, 'id' | 'createdAt'> }
  | { type: 'DELETE_PROJECT'; payload: { id: string } }
  | { type: 'BUY_ITEM'; payload: { itemId: string } }
  | { type: 'EQUIP_ITEM'; payload: { itemId: string } }
  | { type: 'UNEQUIP_ITEM'; payload: { slot: 'hat' | 'accessory' | 'outfit' } };

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function calcXpToNext(level: number) {
  return Math.floor(100 * Math.pow(1.3, level - 1));
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_TASK': {
      const task: import('@/types').Task = {
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

      let xp = state.character.xp + task.xpReward;
      let level = state.character.level;
      let xpToNextLevel = state.character.xpToNextLevel;
      let coins = state.character.coins + task.coinReward;
      let mood = Math.min(5, state.character.mood + 0.5);

      while (xp >= xpToNextLevel) {
        xp -= xpToNextLevel;
        level += 1;
        xpToNextLevel = calcXpToNext(level);
      }

      return {
        ...state,
        character: { ...state.character, xp, level, xpToNextLevel, coins, mood },
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? { ...t, completed: true, completedAt: new Date().toISOString() }
            : t
        ),
      };
    }

    case 'DELETE_TASK': {
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload.id) };
    }

    case 'ADD_PROJECT': {
      const project: import('@/types').Project = {
        ...action.payload,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      return { ...state, projects: [project, ...state.projects] };
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
      if (state.character.ownedItems.includes(item.id)) return state;
      return {
        ...state,
        character: {
          ...state.character,
          coins: state.character.coins - item.price,
          ownedItems: [...state.character.ownedItems, item.id],
        },
      };
    }

    case 'EQUIP_ITEM': {
      const item = state.shopItems.find((i) => i.id === action.payload.itemId);
      if (!item) return state;
      if (!state.character.ownedItems.includes(item.id)) return state;
      return {
        ...state,
        character: {
          ...state.character,
          equipment: { ...state.character.equipment, [item.type]: item.id },
        },
      };
    }

    case 'UNEQUIP_ITEM': {
      return {
        ...state,
        character: {
          ...state.character,
          equipment: { ...state.character.equipment, [action.payload.slot]: null },
        },
      };
    }

    default:
      return state;
  }
}

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  notifications: Notification[];
  addNotification: (message: string, type: NotificationType) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState, () =>
    loadState<GameState>(defaultState)
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const id = uid();
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

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
