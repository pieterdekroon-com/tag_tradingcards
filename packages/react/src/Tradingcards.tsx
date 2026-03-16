import { useState, useEffect } from 'react'
import { useSupabase } from './client'
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
  const supabase = useSupabase()
  const [themeData, setThemeData] = useState<ThemeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('themes')
      .select('name, rarity, from_color, to_color')
      .eq('slug', theme)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          console.warn(`[tradingcards] Theme "${theme}" not found, using fallback`)
          setThemeData(FALLBACK_THEME)
        } else {
          setThemeData({
            name: data.name,
            rarity: data.rarity,
            from: data.from_color,
            to: data.to_color,
          })
        }
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [supabase, theme])

  const t = themeData ?? FALLBACK_THEME
  const rarity = t.rarity.toLowerCase()
  const gradient = `linear-gradient(135deg, ${t.from}, ${t.to})`

  if (loading) {
    return (
      <div className={`tc-card tc-skeleton ${className ?? ''}`}>
        <div className="tc-card-inner" />
      </div>
    )
  }

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
