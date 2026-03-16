import { useMemo, useState, useEffect, type ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'
import { TradingcardsContext } from './context'
import type { Theme } from './types'

interface TradingcardsProviderProps {
  supabaseUrl: string
  supabaseAnonKey: string
  children: ReactNode
}

export function TradingcardsProvider({ supabaseUrl, supabaseAnonKey, children }: TradingcardsProviderProps) {
  const client = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  )

  const [themeCache, setThemeCache] = useState<Map<string, Theme>>(new Map())

  useEffect(() => {
    let cancelled = false

    client
      .from('themes')
      .select('slug, name, rarity, from_color, to_color')
      .order('created_at')
      .then(({ data }) => {
        if (cancelled || !data) return
        const cache = new Map<string, Theme>()
        for (const d of data) {
          cache.set(d.slug, {
            slug: d.slug,
            name: d.name,
            rarity: d.rarity,
            from: d.from_color,
            to: d.to_color,
          })
        }
        setThemeCache(cache)
      })

    return () => { cancelled = true }
  }, [client])

  const value = useMemo(() => ({ supabase: client, themeCache }), [client, themeCache])

  return (
    <TradingcardsContext.Provider value={value}>
      {children}
    </TradingcardsContext.Provider>
  )
}
