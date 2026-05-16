import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { GameState, Task, Project, ShopItem, EquipmentCategory, Notification, NotificationType } from '@/types';
import { INITIAL_SHOP_ITEMS } from '@/lib/gameData';
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
  | { type: 'UNEQUIP_ITEM'; payload: { category: EquipmentCategory } }
  | { type: 'RENAME_CHARACTER'; payload: { name: string } }
  | { type: 'SET_STATE'; payload: GameState };

function createInitialState(): GameState {
  return {
    character: {
      name: 'Hero',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      coins: 50,
      mood: 'happy',
      equipment: { hat: null, accessory: null, weapon: null },
      purchasedItems: [],
    },
    tasks: [],
    projects: [],
    shopItems: INITIAL_SHOP_ITEMS,
    streak: 0,
    lastActiveDate: null,
  };
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.payload,
        id: crypto.randomUUID(),
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      };
      return { ...state, tasks: [newTask, ...state.tasks] };
    }
    case 'COMPLETE_TASK': {
      const task = state.tasks.find((t) => t.id === action.payload.id);
      if (!task || task.completed) return state;
      const updatedTasks = state.tasks.map((t) =>
        t.id === action.payload.id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
      );
      const newXp = state.character.xp + task.xpReward;
      const newCoins = state.character.coins + task.coinReward;
      const { level, xpToNextLevel, remainingXp } = calculateLevel(newXp, state.character.level);
      return {
        ...state,
        tasks: updatedTasks,
        character: {
          ...state.character,
          xp: remainingXp,
          coins: newCoins,
          level,
          xpToNextLevel,
          mood: 'happy',
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
      };
      return { ...state, projects: [newProject, ...state.projects] };
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
      if (!item || state.character.coins < item.price) return state;
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
      const item = state.shopItems.find((i) => i.id === action.payload.id);
      if (!item) return state;
      if (!state.character.purchasedItems.includes(item.id)) return state;
      return {
        ...state,
        character: {
          ...state.character,
          equipment: { ...state.character.equipment, [item.category]: item.id },
        },
      };
    }
    case 'UNEQUIP_ITEM': {
      return {
        ...state,
        character: {
          ...state.character,
          equipment: { ...state.character.equipment, [action.payload.category]: null },
        },
      };
    }
    case 'RENAME_CHARACTER': {
      return {
        ...state,
        character: { ...state.character, name: action.payload.name },
      };
    }
    case 'SET_STATE': {
      return action.payload;
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
  const [state, dispatch] = useReducer(gameReducer, undefined, () => {
    const saved = loadState();
    if (saved) return saved;
    return createInitialState();
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    saveState(state);
  }, [state]);

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
