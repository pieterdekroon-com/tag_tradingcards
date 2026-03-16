import type { CardData, Theme } from '../types';
import { ImageUpload } from './ImageUpload';
import { ThemePicker } from './ThemePicker';
import styles from './CardForm.module.css';

interface CardFormProps {
  card: CardData;
  onChange: (card: CardData) => void;
  themes: Theme[];
  specialties: { id: string; name: string }[];
  descriptions: { id: string; text: string }[];
}

export function CardForm({ card, onChange, themes, specialties, descriptions }: CardFormProps) {
  function update(fields: Partial<CardData>) {
    onChange({ ...card, ...fields });
  }

  function toggleSpecialty(spec: string) {
    const next = card.specialties.includes(spec)
      ? card.specialties.filter((s) => s !== spec)
      : card.specialties.length >= 3 ? card.specialties : [...card.specialties, spec];
    update({ specialties: next });
  }

  return (
    <div className={styles.form}>
      <h1 className={styles.title}>TAG CARDS</h1>
      <p className={styles.subtitle}>Card Generator</p>

      <label className={styles.label} htmlFor="card-name">NAME</label>
      <input
        id="card-name"
        type="text"
        value={card.name}
        onChange={(e) => update({ name: e.target.value })}
        placeholder="Enter player name"
        className={styles.input}
      />

      <label className={styles.label} id="card-image-label">IMAGE</label>
      <ImageUpload image={card.image} onChange={(image) => update({ image })} />

      <label className={styles.label} id="card-specialties-label">SPECIALTIES</label>
      <div className={styles.chipGrid} role="group" aria-labelledby="card-specialties-label">
        {specialties.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={card.specialties.includes(s.name)}
            className={`${styles.chip} ${card.specialties.includes(s.name) ? styles.chipSelected : ''}`}
            onClick={() => toggleSpecialty(s.name)}
          >
            {s.name}
          </button>
        ))}
      </div>

      <label className={styles.label} htmlFor="card-description">DESCRIPTION</label>
      <select
        id="card-description"
        value={card.description}
        onChange={(e) => update({ description: e.target.value })}
        className={styles.select}
      >
        <option value="">Kies een beschrijving...</option>
        {descriptions.map((d) => (
          <option key={d.id} value={d.text}>{d.text}</option>
        ))}
      </select>

      <label className={styles.label} id="card-theme-label">THEME</label>
      <ThemePicker
        selected={card.theme}
        onChange={(theme) => update({ theme })}
        themes={themes}
      />
    </div>
  );
}
