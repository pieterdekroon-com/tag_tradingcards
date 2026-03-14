import type { CardData } from '../types';

export function exportCardAsJson(card: CardData) {
  const slug = card.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'card';
  const json = JSON.stringify(card, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `tradingcards-${slug}.json`;
  a.click();

  URL.revokeObjectURL(url);
}
