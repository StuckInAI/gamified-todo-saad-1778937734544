import { useReducer, useContext, createContext, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { GameState, Notification, NotificationType } from '@/types';
import type { Task, Project } from '@/types';
import { initialCharacter, shopItemsData } from '@/lib/gameData';
import { loadState, saveState } from '@/lib/storage';
import { calcXpToNextLevel } from '@/lib/gameUtils';

type Action =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt'> }
  | { type: 'COMPLETE_TASK'; payload: { id: string } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'ADD_PROJECT'; payload: Omit<Project, 'id' | 'createdAt'> }
  | { type: 'DELETE_PROJECT'; payload: { id: string } }
  | { type: 'BUY_ITEM'; payload: { id: string } }
  | { type: 'EQUIP_ITEM'; payload: { id: string } }
  | { type: 'UNEQUIP_ITEM'; payload: { category: string } }
  | { type: 'RENAME_CHARACTER'; payload: { name: string } };

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getInitialState(): GameState {
  const saved = loadState();
  if (saved) return saved;
  return {
    character: initialCharacter,
    tasks: [],
    projects: [],
    shopItems: shopItemsData,
    streak: 0,
    lastActiveDate: null,
  };
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
      let xpToNextLevel = state.character.xpToNextLevel;
      let remainingXp = newXp;
      while (remainingXp >= xpToNextLevel) {
        remainingXp -= xpToNextLevel;
        level += 1;
        xpToNextLevel = calcXpToNextLevel(level);
      }
      const newMood = Math.min(5, state.character.mood + 1) as 1 | 2 | 3 | 4 | 5;
      return {
        ...state,
        character: {
          ...state.character,
          xp: remainingXp,
          coins: newCoins,
          level,
          xpToNextLevel,
          mood: newMood,
        },
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
        id: generateId(),
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
      if (!item || state.character.coins < item.price || state.character.ownedItems.includes(item.id))
        return state;
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
      const item = state.shopItems.find((i) => i.id === action.payload.id);
      if (!item || !state.character.ownedItems.includes(item.id)) return state;
      return {
        ...state,
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
      return {
        ...state,
        character: {
          ...state.character,
          equipment: {
            ...state.character.equipment,
            [action.payload.category]: null,
          },
        },
      };
    }
    case 'RENAME_CHARACTER':
      return {
        ...state,
        character: { ...state.character, name: action.payload.name },
      };
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
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);
  const notificationsRef = useRef<Notification[]>([]);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const id = generateId();
    notificationsRef.current = [...notificationsRef.current, { id, message, type }];
    forceUpdate();
    setTimeout(() => {
      notificationsRef.current = notificationsRef.current.filter((n) => n.id !== id);
      forceUpdate();
    }, 3000);
  }, []);

  // Persist state
  saveState(state);

  return (
    <GameContext.Provider value={{ state, dispatch, notifications: notificationsRef.current, addNotification }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
