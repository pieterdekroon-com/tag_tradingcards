import type { Rarity, Theme } from '../types';
import styles from './ThemePicker.module.css';

interface ThemePickerProps {
  selected: string;
  onChange: (id: string) => void;
  themes: Theme[];
}

const rarityOrder: Rarity[] = ['Common', 'Rare', 'Epic', 'Legendary'];

export function ThemePicker({ selected, onChange, themes }: ThemePickerProps) {
  return (
    <div className={styles.container}>
      {rarityOrder.map((r) => {
        const group = themes.filter((t) => t.rarity === r);
        if (group.length === 0) return null;
        return (
          <div key={r} className={styles.group}>
            <span className={`${styles.rarityLabel} ${styles[r.toLowerCase()]}`}>
              {r}
            </span>
            <div className={styles.grid}>
              {group.map((theme) => (
                <div key={theme.id} className={styles.tileWrapper}>
                  <button
                    type="button"
                    className={`${styles.tile} ${styles[theme.rarity.toLowerCase()]} ${selected === theme.id ? styles.selected : ''}`}
                    onClick={() => onChange(theme.id)}
                    aria-label={`${theme.name} (${theme.rarity})`}
                  >
                    <div
                      className={styles.tileGradient}
                      style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                    />
                    <span className={styles.tileName}>{theme.name}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
