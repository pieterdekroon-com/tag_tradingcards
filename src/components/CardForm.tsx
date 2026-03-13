import type { CardData } from '../types';
import { ImageUpload } from './ImageUpload';
import { TagInput } from './TagInput';
import { StarRating } from './StarRating';
import { BackgroundPicker } from './BackgroundPicker';
import { exportCardAsJson } from '../utils/export';
import styles from './CardForm.module.css';

interface CardFormProps {
  card: CardData;
  onChange: (card: CardData) => void;
}

export function CardForm({ card, onChange }: CardFormProps) {
  function update(fields: Partial<CardData>) {
    onChange({ ...card, ...fields });
  }

  return (
    <div className={styles.form}>
      <h1 className={styles.title}>TRADECADE</h1>
      <p className={styles.subtitle}>Card Generator</p>

      <label className={styles.label}>NAME</label>
      <input
        type="text"
        value={card.name}
        onChange={(e) => update({ name: e.target.value })}
        placeholder="Enter player name"
        className={styles.input}
      />

      <label className={styles.label}>IMAGE</label>
      <ImageUpload image={card.image} onChange={(image) => update({ image })} />

      <label className={styles.label}>SPECIALTIES</label>
      <TagInput tags={card.specialties} onChange={(specialties) => update({ specialties })} />

      <label className={styles.label}>LEVEL</label>
      <StarRating value={card.level} onChange={(level) => update({ level })} />

      <label className={styles.label}>DESCRIPTION</label>
      <textarea
        value={card.description}
        onChange={(e) => update({ description: e.target.value })}
        placeholder="Short bio..."
        rows={3}
        className={styles.textarea}
      />

      <label className={styles.label}>BACKGROUND</label>
      <BackgroundPicker selected={card.background} onChange={(background) => update({ background })} />

      <button
        type="button"
        className={styles.exportBtn}
        onClick={() => exportCardAsJson(card)}
      >
        ↓ EXPORT JSON
      </button>
    </div>
  );
}
