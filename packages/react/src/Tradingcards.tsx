import { useTradingcardsContext } from './client'
import type { TradingcardsProps, Rarity } from './types'
import './Tradingcards.css'

interface ThemeData {
  name: string
  rarity: Rarity
  from: string
  to: string
}

const FALLBACK_THEME: ThemeData = {
  name: 'Default',
  rarity: 'Common',
  from: '#2d3436',
  to: '#000000',
}

export function Tradingcards({ name, image, theme, specialties, description, className }: TradingcardsProps) {
  const { themeCache } = useTradingcardsContext()

  const cached = themeCache.get(theme)
  const t: ThemeData = cached
    ? { name: cached.name, rarity: cached.rarity, from: cached.from, to: cached.to }
    : FALLBACK_THEME

  const rarity = t.rarity.toLowerCase()
  const gradient = `linear-gradient(135deg, ${t.from}, ${t.to})`

  return (
    <article className={`tc-card tc-${rarity} ${className ?? ''}`}>
      <div className="tc-card-border" style={{ background: gradient }}>
        <div className="tc-card-inner">
          <header className="tc-brand">TRADINGCARDS</header>

          <figure className="tc-figure">
            <div className="tc-image-frame">
              {image ? (
                <img src={image} alt={name} className="tc-image" />
              ) : (
                <div className="tc-image-placeholder" />
              )}
            </div>
            <figcaption className="tc-name">{name}</figcaption>
          </figure>

          <div className="tc-rarity-badge">
            <span className={`tc-rarity-dot tc-dot-${rarity}`} />
            {t.rarity}
          </div>

          {specialties.length > 0 && (
            <ul className="tc-specialties" role="list">
              {specialties.map((spec) => (
                <li key={spec} className="tc-badge">{spec}</li>
              ))}
            </ul>
          )}

          {description && (
            <p className="tc-description">{description}</p>
          )}
        </div>
      </div>
    </article>
  )
}
