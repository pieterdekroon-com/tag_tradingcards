import { createContext } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

export const TradingcardsContext = createContext<SupabaseClient | null>(null)
