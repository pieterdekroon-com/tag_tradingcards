import { useState } from 'react';
import { CardData } from './types';
import { CardForm } from './components/CardForm';
import { CardPreview } from './components/CardPreview';
import styles from './App.module.css';

const initialCard: CardData = {
  id: crypto.randomUUID(),
  name: '',
  image: '',
  specialties: [],
  level: 0,
  description: '',
  background: 'ocean-blue',
};

function App() {
  const [card, setCard] = useState<CardData>(initialCard);

  return (
    <div className={styles.layout}>
      <div className={styles.formPanel}>
        <CardForm card={card} onChange={setCard} />
      </div>
      <div className={styles.previewPanel}>
        <CardPreview card={card} />
      </div>
    </div>
  );
}

export default App;
