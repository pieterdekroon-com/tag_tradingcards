import { useContext } from 'react'
import { TradingcardsContext } from './context'

export function useSupabase() {
  const client = useContext(TradingcardsContext)
  if (!client) {
    throw new Error('useSupabase must be used within a <TradingcardsProvider>')
  }
  return client
}
