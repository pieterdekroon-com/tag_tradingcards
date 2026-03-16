import { createContext } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Theme } from './types'

export interface TradingcardsContextValue {
  supabase: SupabaseClient
  themeCache: Map<string, Theme>
}

export const TradingcardsContext = createContext<TradingcardsContextValue | null>(null)
