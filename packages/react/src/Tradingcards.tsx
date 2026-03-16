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
    <div className={`tc-card tc-${rarity} ${className ?? ''}`}>
      <div className="tc-card-border" style={{ background: gradient }}>
        <div className="tc-card-inner">
          <div className="tc-brand">TRADINGCARDS</div>

          <div className="tc-image-frame">
            {image ? (
              <img src={image} alt={name} className="tc-image" />
            ) : (
              <div className="tc-image-placeholder" />
            )}
          </div>

          <div className="tc-name">{name}</div>

          <div className="tc-rarity-badge">
            <span className={`tc-rarity-dot tc-dot-${rarity}`} />
            {t.rarity}
          </div>

          {specialties.length > 0 && (
            <div className="tc-specialties">
              {specialties.map((spec) => (
                <span key={spec} className="tc-badge">{spec}</span>
              ))}
            </div>
          )}

          {description && (
            <div className="tc-description">{description}</div>
          )}
        </div>
      </div>
    </div>
  )
}
