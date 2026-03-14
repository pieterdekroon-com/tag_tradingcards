import type { Theme } from './types';

export const themes: Theme[] = [
  // Common
  { id: 'ocean-blue', name: 'Ocean Blue', rarity: 'Common', from: '#0f3460', to: '#16213e' },
  { id: 'forest-green', name: 'Forest Green', rarity: 'Common', from: '#2d6a4f', to: '#1b4332' },
  { id: 'midnight-black', name: 'Midnight Black', rarity: 'Common', from: '#2d3436', to: '#000000' },
  { id: 'arctic-frost', name: 'Arctic Frost', rarity: 'Common', from: '#74b9ff', to: '#0984e3' },

  // Rare
  { id: 'crimson-fire', name: 'Crimson Fire', rarity: 'Rare', from: '#e94560', to: '#c23152' },
  { id: 'sunset-gold', name: 'Sunset Gold', rarity: 'Rare', from: '#f77f00', to: '#e36414' },
  { id: 'neon-pink', name: 'Neon Pink', rarity: 'Rare', from: '#fd79a8', to: '#e84393' },

  // Epic
  { id: 'royal-purple', name: 'Royal Purple', rarity: 'Epic', from: '#7b2cbf', to: '#5a189a' },
  { id: 'aurora', name: 'Aurora', rarity: 'Epic', from: '#00b4d8', to: '#6a0dad' },
  { id: 'deep-ocean', name: 'Deep Ocean', rarity: 'Epic', from: '#0a1628', to: '#1a3a5c' },

  // Legendary
  { id: 'solar-flare', name: 'Solar Flare', rarity: 'Legendary', from: '#ff6b35', to: '#ffd700' },
  { id: 'void-walker', name: 'Void Walker', rarity: 'Legendary', from: '#0d0221', to: '#cc00ff' },
  { id: 'abyssal-tide', name: 'Abyssal Tide', rarity: 'Legendary', from: '#020b1a', to: '#0f3460' },
];
