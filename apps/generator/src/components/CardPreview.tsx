import { useState } from 'react';
import type { CardData, Theme } from '../types';
import styles from './CardPreview.module.css';

interface CardPreviewProps {
  card: CardData;
  themes: Theme[];
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export function CardPreview({ card, themes }: CardPreviewProps) {
  const [flipped, setFlipped] = useState(false);
  const theme = themes.find((t) => t.id === card.theme) ?? themes[0];
  const gradient = `linear-gradient(135deg, ${theme.from}, ${theme.to})`;
  const rarityClass = styles[theme.rarity.toLowerCase()];

  const accentRgb = hexToRgb(theme.to);
  const cardStyle = {
    background: gradient,
    '--accent': accentRgb,
    '--accent-hex': theme.to,
  } as React.CSSProperties;

  return (
    <div
      className={styles.wrapper}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped((f) => !f) } }}
      role="button"
      tabIndex={0}
      aria-label={`Trading card for ${card.name || 'unnamed player'}. Press to flip.`}
    >
      <div className={`${styles.cardContainer} ${flipped ? styles.flipped : ''}`}>
        {/* ── Front ── */}
        <article className={`${styles.card} ${styles.front} ${rarityClass}`} style={cardStyle}>
          <div className={styles.texture} />
          <div className={styles.sheen} />

          <div className={styles.inner}>
            <div className={styles.topRow}>
              <div className={styles.name}>{card.name || 'PLAYER NAME'}</div>
              <div className={`${styles.rarityBadge} ${rarityClass}`}>
                <span className={styles.rarityDot} />
                {theme.rarity}
              </div>
            </div>

            <div className={styles.imageFrame}>
              {card.image ? (
                <img src={card.image} alt={card.name} className={styles.image} />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span>📷</span>
                </div>
              )}
              {theme.rarity === 'Legendary' && (
                <>
                  <div className={styles.glitterSweep} />
                  <div className={styles.imageBorder} />
                </>
              )}
            </div>

            <div className={`${styles.divider} ${rarityClass}`} />

            {card.specialties.length > 0 && (
              <div className={styles.specialties}>
                {card.specialties.map((spec) => (
                  <span key={spec} className={`${styles.badge} ${rarityClass}`}>
                    <span className={styles.badgeCorner} />
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {card.description && (
              <div className={`${styles.descBlock} ${rarityClass}`}>
                <div className={styles.description}>{card.description}</div>
              </div>
            )}

            <div
              className={`${styles.brand} ${rarityClass}`}
              style={{
                backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
              }}
            >
              TAG
            </div>
          </div>
        </article>

        {/* ── Back ── */}
        <div className={`${styles.card} ${styles.back} ${rarityClass}`} style={cardStyle} aria-hidden="true">
          <div className={styles.texture} />
          <div className={styles.sheen} />

          <div className={styles.backInner}>
            <div
              className={styles.backLogo}
              style={{
                backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
              }}
            >
              TAG
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
