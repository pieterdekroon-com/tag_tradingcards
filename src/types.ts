export interface CardData {
  id: string;
  name: string;
  image: string;
  specialties: string[];
  level: number;
  description: string;
  background: string;
}

export interface Background {
  id: string;
  name: string;
  from: string;
  to: string;
}
