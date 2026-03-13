import { backgrounds } from '../backgrounds';
import styles from './BackgroundPicker.module.css';

interface BackgroundPickerProps {
  selected: string;
  onChange: (id: string) => void;
}

export function BackgroundPicker({ selected, onChange }: BackgroundPickerProps) {
  return (
    <div className={styles.grid}>
      {backgrounds.map((bg) => (
        <button
          key={bg.id}
          type="button"
          className={`${styles.swatch} ${selected === bg.id ? styles.selected : ''}`}
          style={{ background: `linear-gradient(135deg, ${bg.from}, ${bg.to})` }}
          onClick={() => onChange(bg.id)}
          title={bg.name}
          aria-label={bg.name}
        />
      ))}
    </div>
  );
}
