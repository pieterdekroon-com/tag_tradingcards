import { CardData } from '../types';
import { backgrounds } from '../backgrounds';
import styles from './CardPreview.module.css';

interface CardPreviewProps {
  card: CardData;
}

export function CardPreview({ card }: CardPreviewProps) {
  const bg = backgrounds.find((b) => b.id === card.background) ?? backgrounds[0];
  const gradient = `linear-gradient(135deg, ${bg.from}, ${bg.to})`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card} style={{ background: gradient }}>
        <div className={styles.inner}>
          <div className={styles.brand}>TAG</div>

          <div className={styles.imageFrame}>
            {card.image ? (
              <img src={card.image} alt={card.name} className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>📷</span>
              </div>
            )}
          </div>

          <div className={styles.name}>{card.name || 'PLAYER NAME'}</div>

          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={s <= card.level ? styles.starFilled : styles.starEmpty}>
                ★
              </span>
            ))}
          </div>

          {card.specialties.length > 0 && (
            <div className={styles.specialties}>
              {card.specialties.map((spec) => (
                <span key={spec} className={styles.badge}>{spec}</span>
              ))}
            </div>
          )}

          {card.description && (
            <div className={styles.description}>{card.description}</div>
          )}
        </div>
      </div>
    </div>
  );
}
