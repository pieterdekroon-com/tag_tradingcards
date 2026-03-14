import type { CardData, Theme } from '../types';
import { specialtyOptions, descriptionOptions } from '../presets';
import { ImageUpload } from './ImageUpload';
import { ThemePicker } from './ThemePicker';
import { exportCardAsJson } from '../utils/export';
import styles from './CardForm.module.css';

interface CardFormProps {
  card: CardData;
  onChange: (card: CardData) => void;
  themes: Theme[];
  defaultIds: Set<string>;
  onAddTheme: (theme: Theme) => void;
  onUpdateTheme: (theme: Theme) => void;
  onRemoveTheme: (id: string) => void;
}

export function CardForm({ card, onChange, themes, defaultIds, onAddTheme, onUpdateTheme, onRemoveTheme }: CardFormProps) {
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
      <div className={styles.chipGrid}>
        {specialtyOptions.map((spec) => (
          <button
            key={spec}
            type="button"
            className={`${styles.chip} ${card.specialties.includes(spec) ? styles.chipSelected : ''}`}
            onClick={() => toggleSpecialty(spec)}
          >
            {spec}
          </button>
        ))}
      </div>

      <label className={styles.label}>DESCRIPTION</label>
      <select
        value={card.description}
        onChange={(e) => update({ description: e.target.value })}
        className={styles.select}
      >
        <option value="">Kies een beschrijving...</option>
        {descriptionOptions.map((desc) => (
          <option key={desc} value={desc}>{desc}</option>
        ))}
      </select>

      <label className={styles.label}>THEME</label>
      <ThemePicker
        selected={card.theme}
        onChange={(theme) => update({ theme })}
        themes={themes}
        defaultIds={defaultIds}
        onAddTheme={onAddTheme}
        onUpdateTheme={onUpdateTheme}
        onRemoveTheme={onRemoveTheme}
      />

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
