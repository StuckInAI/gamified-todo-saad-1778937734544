import type { Character, ShopItem } from '@/types';

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'hat-wizard',
    name: 'Wizard Hat',
    description: 'A pointy hat for the wise adventurer.',
    emoji: '🧙',
    price: 50,
    category: 'hat',
    owned: false,
  },
  {
    id: 'hat-crown',
    name: 'Crown',
    description: 'For the royalty among questers.',
    emoji: '👑',
    price: 120,
    category: 'hat',
    owned: false,
  },
  {
    id: 'hat-party',
    name: 'Party Hat',
    description: 'Celebrate every quest!',
    emoji: '🎉',
    price: 30,
    category: 'hat',
    owned: false,
  },
  {
    id: 'weapon-sword',
    name: 'Shiny Sword',
    description: 'A gleaming blade for your adventures.',
    emoji: '⚔️',
    price: 80,
    category: 'weapon',
    owned: false,
  },
  {
    id: 'weapon-wand',
    name: 'Magic Wand',
    description: 'Cast spells on your to-do list.',
    emoji: '🪄',
    price: 90,
    category: 'weapon',
    owned: false,
  },
  {
    id: 'armor-robe',
    name: 'Cozy Robe',
    description: 'Comfort and style for the homebody hero.',
    emoji: '🥻',
    price: 70,
    category: 'armor',
    owned: false,
  },
];

export const INITIAL_CHARACTER: Character = {
  name: 'Hero',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  coins: 50,
  mood: 'happy',
  equipment: {
    hat: null,
    outfit: null,
    accessory: null,
    weapon: null,
    armor: null,
  },
};
