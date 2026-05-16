import { createContext, useContext, useReducer, useEffect, useCallback, useState, type ReactNode } from 'react';
import type { GameState, Task, Project, ShopItem, EquipmentSlot } from '@/types';
import { SHOP_ITEMS, INITIAL_CHARACTER } from '@/lib/gameData';
import { loadState, saveState } from '@/lib/storage';
import { calculateLevel } from '@/lib/gameUtils';

type Action =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt'> }
  | { type: 'COMPLETE_TASK'; payload: { id: string } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'ADD_PROJECT'; payload: Omit<Project, 'id' | 'createdAt'> }
  | { type: 'DELETE_PROJECT'; payload: { id: string } }
  | { type: 'BUY_ITEM'; payload: { id: string } }
  | { type: 'EQUIP_ITEM'; payload: { id: string } }
  | { type: 'UNEQUIP_ITEM'; payload: { category: EquipmentSlot } }
  | { type: 'RENAME_CHARACTER'; payload: { name: string } }
  | { type: 'LOAD_STATE'; payload: GameState };

const initialState: GameState = {
  character: INITIAL_CHARACTER,
  tasks: [],
  projects: [],
  shopItems: SHOP_ITEMS,
  streak: 0,
  lastActiveDate: null,
};

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

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
      const newCoins = state.character.coins + task.coinReward;
      const { level, xpToNextLevel, xp } = calculateLevel(newXp, state.character.level, state.character.xpToNextLevel);
      return {
        ...state,
        character: { ...state.character, xp, coins: newCoins, level, xpToNextLevel },
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? { ...t, completed: true, completedAt: new Date().toISOString() }
            : t
        ),
      };
    }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload.id) };

    case 'ADD_PROJECT': {
      const project: Project = {
        ...action.payload,
        id: crypto.randomUUID(),
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
      const item = state.shopItems.find((i) => i.id === action.payload.id) as ShopItem | undefined;
      if (!item) return state;
      if (state.character.coins < item.price) return state;
      if (state.character.purchasedItems.includes(item.id)) return state;
      return {
        ...state,
        character: {
          ...state.character,
          coins: state.character.coins - item.price,
          purchasedItems: [...state.character.purchasedItems, item.id],
        },
      };
    }

    case 'EQUIP_ITEM': {
      const item = state.shopItems.find((i) => i.id === action.payload.id) as ShopItem | undefined;
      if (!item) return state;
      return {
        ...state,
        character: {
          ...state.character,
          equipment: { ...state.character.equipment, [item.category]: item.id },
        },
      };
    }

    case 'UNEQUIP_ITEM':
      return {
        ...state,
        character: {
          ...state.character,
          equipment: { ...state.character.equipment, [action.payload.category]: null },
        },
      };

    case 'RENAME_CHARACTER':
      return {
        ...state,
        character: { ...state.character, name: action.payload.name },
      };

    default:
      return state;
  }
}

type Notification = { id: string; message: string; type: 'xp' | 'coins' | 'levelup' | 'info' };

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  notifications: Notification[];
  addNotification: (message: string, type: Notification['type']) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveState(state);
  }, [state, loaded]);

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
