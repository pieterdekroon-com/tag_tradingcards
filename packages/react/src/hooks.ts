import { useState, useEffect } from 'react'
import { useSupabase } from './client'
import type { Theme, Specialty, Description } from './types'

export function useThemes() {
  const supabase = useSupabase()
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('themes')
      .select('slug, name, rarity, from_color, to_color')
      .order('created_at')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
          console.warn('[tradingcards] Failed to fetch themes:', error.message)
        } else if (data) {
          setThemes(
            data.map((d) => ({
              slug: d.slug,
              name: d.name,
              rarity: d.rarity,
              from: d.from_color,
              to: d.to_color,
            }))
          )
        }
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [supabase])

  return { themes, loading, error }
}

export function useSpecialties() {
  const supabase = useSupabase()
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('specialties')
      .select('id, name')
      .order('created_at')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
          console.warn('[tradingcards] Failed to fetch specialties:', error.message)
        } else if (data) {
          setSpecialties(data)
        }
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [supabase])

  return { specialties, loading, error }
}

export function useDescriptions() {
  const supabase = useSupabase()
  const [descriptions, setDescriptions] = useState<Description[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('descriptions')
      .select('id, text')
      .order('created_at')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
          console.warn('[tradingcards] Failed to fetch descriptions:', error.message)
        } else if (data) {
          setDescriptions(data)
        }
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [supabase])

  return { descriptions, loading, error }
}
