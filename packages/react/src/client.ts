import { useContext } from 'react'
import { TradingcardsContext } from './context'
import type { TradingcardsContextValue } from './context'

export function useTradingcardsContext(): TradingcardsContextValue {
  const ctx = useContext(TradingcardsContext)
  if (!ctx) {
    throw new Error('useTradingcardsContext must be used within a <TradingcardsProvider>')
  }
  return ctx
}

export function useSupabase() {
  return useTradingcardsContext().supabase
}
