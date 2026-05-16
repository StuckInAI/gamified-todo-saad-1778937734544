import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { GameState, Task, Project, ShopItem } from '@/types';
import { SHOP_ITEMS, INITIAL_CHARACTER } from '@/lib/gameData';
import { calculateLevel } from '@/lib/gameUtils';
import { saveState, loadState } from '@/lib/storage';

type Action =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt'> }
  | { type: 'COMPLETE_TASK'; payload: { id: string } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'ADD_PROJECT'; payload: Omit<Project, 'id' | 'createdAt'> }
  | { type: 'DELETE_PROJECT'; payload: { id: string } }
  | { type: 'BUY_ITEM'; payload: { id: string } }
  | { type: 'EQUIP_ITEM'; payload: { id: string } }
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'UPDATE_STREAK' };

const initialState: GameState = {
  character: INITIAL_CHARACTER,
  tasks: [],
  projects: [],
  shopItems: SHOP_ITEMS,
  streak: 0,
  lastActiveDate: null,
  notifications: [],
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_TASK': {
      const task: Task = {
        ...action.payload,
        id: crypto.randomUUID(),
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
      const { level, xp, xpToNextLevel } = calculateLevel(newXp);

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
          level,
          xpToNextLevel,
          coins: state.character.coins + task.coinReward,
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
        createdAt: new Date().toISOString(),
      };
      return { ...state, projects: [project, ...state.projects] };
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
      const item = state.shopItems.find((i) => i.id === action.payload.id);
      if (!item || !item.owned) return state;
      const slot = item.category;
      const currentEquipped = state.character.equipment[slot];
      const newEquipped = currentEquipped === item.id ? null : item.id;
      return {
        ...state,
        character: {
          ...state.character,
          equipment: { ...state.character.equipment, [slot]: newEquipped },
        },
      };
    }

    case 'UPDATE_STREAK': {
      const today = new Date().toDateString();
      if (state.lastActiveDate === today) return state;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = state.lastActiveDate === yesterday.toDateString();
      return {
        ...state,
        streak: isConsecutive ? state.streak + 1 : 1,
        lastActiveDate: today,
      };
    }

    case 'LOAD_STATE': {
      return action.payload;
    }

    default:
      return state;
  }
}

type NotificationEntry = { id: string; message: string; type: 'xp' | 'coins' | 'levelup' | 'info' };

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  notifications: NotificationEntry[];
  addNotification: (message: string, type: NotificationEntry['type']) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [notifications, setNotifications] = React.useState<NotificationEntry[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = loadState();
    if (saved && typeof saved === 'object') {
      dispatch({ type: 'LOAD_STATE', payload: saved as GameState });
    } else {
      dispatch({ type: 'UPDATE_STREAK' });
    }
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addNotification = useCallback((message: string, type: NotificationEntry['type']) => {
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
