export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface CardData {
  id: string;
  name: string;
  image: string;
  specialties: string[];
  description: string;
  theme: string;
}

export interface Theme {
  id: string;
  name: string;
  rarity: Rarity;
  from: string;
  to: string;
}
