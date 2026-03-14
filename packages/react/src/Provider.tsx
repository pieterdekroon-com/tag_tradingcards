import { useMemo, type ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'
import { TradingcardsContext } from './context'

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

  return (
    <TradingcardsContext.Provider value={client}>
      {children}
    </TradingcardsContext.Provider>
  )
}
