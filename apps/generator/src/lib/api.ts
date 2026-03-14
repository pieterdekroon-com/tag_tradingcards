import { supabase } from './supabase'
import type { Theme } from '../types'

export interface DbTheme {
  id: string
  slug: string
  name: string
  rarity: string
  from_color: string
  to_color: string
  created_at: string
  updated_at: string
}

export interface DbSpecialty {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface DbDescription {
  id: string
  text: string
  created_at: string
  updated_at: string
}

function dbThemeToTheme(db: DbTheme): Theme {
  return {
    id: db.slug,
    name: db.name,
    rarity: db.rarity as Theme['rarity'],
    from: db.from_color,
    to: db.to_color,
  }
}

// Themes
export async function fetchThemes(): Promise<Theme[]> {
  const { data, error } = await supabase.from('themes').select('*').order('created_at')
  if (error) throw error
  return (data as DbTheme[]).map(dbThemeToTheme)
}

export async function createTheme(theme: { slug: string; name: string; rarity: string; from_color: string; to_color: string }) {
  const { data, error } = await supabase.from('themes').insert(theme).select().single()
  if (error) throw error
  return dbThemeToTheme(data as DbTheme)
}

export async function updateTheme(slug: string, updates: Partial<{ name: string; rarity: string; from_color: string; to_color: string }>) {
  const { data, error } = await supabase.from('themes').update(updates).eq('slug', slug).select().single()
  if (error) throw error
  return dbThemeToTheme(data as DbTheme)
}

export async function deleteTheme(slug: string) {
  const { error } = await supabase.from('themes').delete().eq('slug', slug)
  if (error) throw error
}

// Specialties
export async function fetchSpecialties(): Promise<DbSpecialty[]> {
  const { data, error } = await supabase.from('specialties').select('*').order('created_at')
  if (error) throw error
  return data as DbSpecialty[]
}

export async function createSpecialty(name: string) {
  const { data, error } = await supabase.from('specialties').insert({ name }).select().single()
  if (error) throw error
  return data as DbSpecialty
}

export async function updateSpecialty(id: string, name: string) {
  const { data, error } = await supabase.from('specialties').update({ name }).eq('id', id).select().single()
  if (error) throw error
  return data as DbSpecialty
}

export async function deleteSpecialty(id: string) {
  const { error } = await supabase.from('specialties').delete().eq('id', id)
  if (error) throw error
}

// Descriptions
export async function fetchDescriptions(): Promise<DbDescription[]> {
  const { data, error } = await supabase.from('descriptions').select('*').order('created_at')
  if (error) throw error
  return data as DbDescription[]
}

export async function createDescription(text: string) {
  const { data, error } = await supabase.from('descriptions').insert({ text }).select().single()
  if (error) throw error
  return data as DbDescription
}

export async function updateDescription(id: string, text: string) {
  const { data, error } = await supabase.from('descriptions').update({ text }).eq('id', id).select().single()
  if (error) throw error
  return data as DbDescription
}

export async function deleteDescription(id: string) {
  const { error } = await supabase.from('descriptions').delete().eq('id', id)
  if (error) throw error
}
