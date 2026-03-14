export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'

export interface Theme {
  slug: string
  name: string
  rarity: Rarity
  from: string
  to: string
}

export interface Specialty {
  id: string
  name: string
}

export interface Description {
  id: string
  text: string
}

export interface TradingcardsProps {
  name: string
  image: string
  theme: string
  specialties: string[]
  description: string
  className?: string
}
