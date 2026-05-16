import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { GameState, Task, Project, ShopItem, Notification } from '@/types';
import { INITIAL_STATE, SHOP_ITEMS } from '@/lib/gameData';
import { calculateLevel, getXpForLevel } from '@/lib/gameUtils';

type GameAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedAt'> }
  | { type: 'COMPLETE_TASK'; payload: { id: string } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'ADD_PROJECT'; payload: Omit<Project, 'id' | 'createdAt'> }
  | { type: 'DELETE_PROJECT'; payload: { id: string } }
  | { type: 'BUY_ITEM'; payload: { id: string } }
  | { type: 'EQUIP_ITEM'; payload: { id: string } }
  | { type: 'UNEQUIP_ITEM'; payload: { category: string } }
  | { type: 'SET_CHARACTER_NAME'; payload: { name: string } }
  | { type: 'LOAD_STATE'; payload: GameState };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        completed: false,
        completedAt: null,
      };
      return { ...state, tasks: [newTask, ...state.tasks] };
    }

    case 'COMPLETE_TASK': {
      const task = state.tasks.find((t) => t.id === action.payload.id);
      if (!task || task.completed) return state;

      const updatedTasks = state.tasks.map((t) =>
        t.id === action.payload.id
          ? { ...t, completed: true, completedAt: new Date().toISOString() }
          : t
      );

      const newXp = state.character.xp + task.xpReward;
      const newCoins = state.character.coins + task.coinReward;
      const newLevel = calculateLevel(newXp);
      const xpToNext = getXpForLevel(newLevel + 1) - getXpForLevel(newLevel);
      const xpInLevel = newXp - getXpForLevel(newLevel);

      const today = new Date().toDateString();
      const lastDate = state.lastCompletedDate;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak =
        lastDate === today
          ? state.streak
          : lastDate === yesterday
          ? state.streak + 1
          : 1;

      const tasksCompleted = state.totalTasksCompleted + 1;
      const mood = tasksCompleted % 5 === 0 ? 'happy' : state.character.mood;

      return {
        ...state,
        tasks: updatedTasks,
        totalTasksCompleted: tasksCompleted,
        streak: newStreak,
        lastCompletedDate: today,
        character: {
          ...state.character,
          xp: newXp,
          coins: newCoins,
          level: newLevel,
          xpToNextLevel: xpToNext,
          xp: xpInLevel,
          mood,
        },
      };
    }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload.id) };

    case 'ADD_PROJECT': {
      const newProject: Project = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      return { ...state, projects: [newProject, ...state.projects] };
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
      const item = state.shopItems.find((i) => i.id === action.payload.id);
      if (!item || !item.owned) return state;
      const updatedItems = state.shopItems.map((i) => ({
        ...i,
        equipped: i.category === item.category ? i.id === item.id : i.equipped,
      }));
      return {
        ...state,
        shopItems: updatedItems,
        character: {
          ...state.character,
          equipment: {
            ...state.character.equipment,
            [item.category]: item.id,
          },
        },
      };
    }

    case 'UNEQUIP_ITEM': {
      const cat = action.payload.category as keyof typeof state.character.equipment;
      const updatedItems = state.shopItems.map((i) => ({
        ...i,
        equipped: i.category === cat ? false : i.equipped,
      }));
      return {
        ...state,
        shopItems: updatedItems,
        character: {
          ...state.character,
          equipment: { ...state.character.equipment, [cat]: null },
        },
      };
    }

    case 'SET_CHARACTER_NAME':
      return {
        ...state,
        character: { ...state.character, name: action.payload.name },
      };

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  notifications: Notification[];
  addNotification: (msg: string, type: Notification['type']) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, {
    ...INITIAL_STATE,
    shopItems: SHOP_ITEMS,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cozyquest_state');
      if (saved) {
        const parsed: GameState = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('cozyquest_state', JSON.stringify(state));
    }
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
