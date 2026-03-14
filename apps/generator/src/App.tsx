import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import type { CardData, Theme } from './types';
import { themes as defaultThemes } from './themes';
import { CardForm } from './components/CardForm';
import { CardPreview } from './components/CardPreview';
import { Login } from './pages/Login';
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<CardData>(initialCard);
  const [themes, setThemes] = useState<Theme[]>(defaultThemes);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  if (loading) return null;

  if (!session) {
    return <Login onLogin={() => {}} />;
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
