import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Rarity, Theme } from '../types';
import styles from './ThemePicker.module.css';

interface ThemePickerProps {
  selected: string;
  onChange: (id: string) => void;
  themes: Theme[];
  defaultIds: Set<string>;
  onAddTheme: (theme: Theme) => void;
  onUpdateTheme: (theme: Theme) => void;
  onRemoveTheme: (id: string) => void;
}

const rarityOrder: Rarity[] = ['Common', 'Rare', 'Epic', 'Legendary'];

export function ThemePicker({ selected, onChange, themes, defaultIds, onAddTheme, onUpdateTheme, onRemoveTheme }: ThemePickerProps) {
  const [editing, setEditing] = useState<Theme | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [from, setFrom] = useState('#1a1a2e');
  const [to, setTo] = useState('#16213e');
  const [rarity, setRarity] = useState<Rarity>('Common');

  function startEdit(theme: Theme) {
    setEditing(theme);
    setName(theme.name);
    setFrom(theme.from);
    setTo(theme.to);
    setRarity(theme.rarity);
    setCreating(false);
  }

  function startCreate() {
    setEditing(null);
    setName('');
    setFrom('#1a1a2e');
    setTo('#16213e');
    setRarity('Common');
    setCreating(true);
  }

  function handleSave() {
    if (!name.trim()) return;
    if (editing) {
      onUpdateTheme({ ...editing, name: name.trim(), rarity, from, to });
      setEditing(null);
    } else {
      const id = `custom-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      onAddTheme({ id, name: name.trim(), rarity, from, to });
      setCreating(false);
    }
  }

  function handleCancel() {
    setEditing(null);
    setCreating(false);
  }

  const showModal = creating || editing !== null;

  const modal = showModal
    ? createPortal(
        <div className={styles.overlay} onClick={handleCancel}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <span className={styles.modalTitle}>{editing ? 'Edit Theme' : 'New Theme'}</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Theme name"
              className={styles.creatorInput}
              autoFocus
            />
            <div className={styles.colorRow}>
              <label className={styles.colorLabel}>
                From
                <input type="color" value={from} onChange={(e) => setFrom(e.target.value)} className={styles.colorPicker} />
              </label>
              <div className={styles.colorPreview} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} />
              <label className={styles.colorLabel}>
                To
                <input type="color" value={to} onChange={(e) => setTo(e.target.value)} className={styles.colorPicker} />
              </label>
            </div>
            <div className={styles.rarityRow}>
              {rarityOrder.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`${styles.rarityChip} ${styles[r.toLowerCase()]} ${rarity === r ? styles.rarityChipSelected : ''}`}
                  onClick={() => setRarity(r)}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className={styles.creatorActions}>
              <button type="button" className={styles.createBtn} onClick={handleSave}>
                {editing ? 'Save' : 'Create'}
              </button>
              <button type="button" className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

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
              {group.map((theme) => {
                const isCustom = !defaultIds.has(theme.id);
                const isEditing = editing?.id === theme.id;
                return (
                  <div key={theme.id} className={styles.tileWrapper}>
                    <button
                      type="button"
                      className={`${styles.tile} ${styles[theme.rarity.toLowerCase()]} ${selected === theme.id ? styles.selected : ''} ${isEditing ? styles.editing : ''}`}
                      onClick={() => onChange(theme.id)}
                      aria-label={`${theme.name} (${theme.rarity})`}
                    >
                      <div
                        className={styles.tileGradient}
                        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                      />
                      <span className={styles.tileName}>{theme.name}</span>
                    </button>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={(e) => { e.stopPropagation(); startEdit(theme); }}
                      aria-label={`Edit ${theme.name}`}
                    >
                      ✎
                    </button>
                    {isCustom && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => onRemoveTheme(theme.id)}
                        aria-label={`Remove ${theme.name}`}
                      >
                        x
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <button type="button" className={styles.addBtn} onClick={startCreate}>
        + Custom Theme
      </button>

      {modal}
    </div>
  );
}
