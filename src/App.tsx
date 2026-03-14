import { useState } from 'react';
import type { CardData, Theme } from './types';
import { themes as defaultThemes } from './themes';
import { CardForm } from './components/CardForm';
import { CardPreview } from './components/CardPreview';
import styles from './App.module.css';

const defaultIds = new Set(defaultThemes.map((t) => t.id));

const initialCard: CardData = {
  id: crypto.randomUUID(),
  name: '',
  image: '',
  specialties: [],
  description: '',
  theme: 'ocean-blue',
};

function App() {
  const [card, setCard] = useState<CardData>(initialCard);
  const [themes, setThemes] = useState<Theme[]>(defaultThemes);

  function addTheme(theme: Theme) {
    setThemes((prev) => [...prev, theme]);
  }

  function updateTheme(updated: Theme) {
    setThemes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function removeTheme(id: string) {
    if (defaultIds.has(id)) return;
    setThemes((prev) => prev.filter((t) => t.id !== id));
    if (card.theme === id) {
      setCard((c) => ({ ...c, theme: 'ocean-blue' }));
    }
  }

  return (
    <div className={styles.layout}>
      <div className={styles.formPanel}>
        <CardForm
          card={card}
          onChange={setCard}
          themes={themes}
          defaultIds={defaultIds}
          onAddTheme={addTheme}
          onUpdateTheme={updateTheme}
          onRemoveTheme={removeTheme}
        />
      </div>
      <div className={styles.previewPanel}>
        <CardPreview card={card} themes={themes} />
      </div>
    </div>
  );
}

export default App;
