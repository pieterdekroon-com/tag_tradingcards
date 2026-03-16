import { useState, useEffect } from 'react'
import type { Theme } from '../types'
import type { DbSpecialty, DbDescription } from '../lib/api'
import {
  fetchThemes, createTheme, updateTheme, deleteTheme,
  fetchSpecialties, createSpecialty, updateSpecialty, deleteSpecialty,
  fetchDescriptions, createDescription, updateDescription, deleteDescription,
} from '../lib/api'
import { supabase } from '../lib/supabase'
import styles from './Dashboard.module.css'

interface DashboardProps {
  onLogout: () => void
}

type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'

export function Dashboard({ onLogout }: DashboardProps) {
  const [themes, setThemes] = useState<Theme[]>([])
  const [specialties, setSpecialties] = useState<DbSpecialty[]>([])
  const [descriptions, setDescriptions] = useState<DbDescription[]>([])
  const [loading, setLoading] = useState(true)

  // Theme form state
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null)
  const [themeForm, setThemeForm] = useState({ slug: '', name: '', rarity: 'Common' as Rarity, from: '#000000', to: '#000000' })
  const [showThemeForm, setShowThemeForm] = useState(false)
  const [themeFormError, setThemeFormError] = useState('')

  // Simple inline edit states
  const [editingSpecId, setEditingSpecId] = useState<string | null>(null)
  const [editingSpecName, setEditingSpecName] = useState('')
  const [newSpecName, setNewSpecName] = useState('')

  const [editingDescId, setEditingDescId] = useState<string | null>(null)
  const [editingDescText, setEditingDescText] = useState('')
  const [newDescText, setNewDescText] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [t, s, d] = await Promise.all([
        fetchThemes(),
        fetchSpecialties(),
        fetchDescriptions(),
      ])
      setThemes(t)
      setSpecialties(s)
      setDescriptions(d)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  // --- Theme handlers ---
  function openNewTheme() {
    setEditingTheme(null)
    setThemeForm({ slug: '', name: '', rarity: 'Common', from: '#000000', to: '#000000' })
    setThemeFormError('')
    setShowThemeForm(true)
  }

  function openEditTheme(theme: Theme) {
    setEditingTheme(theme)
    setThemeForm({ slug: theme.id, name: theme.name, rarity: theme.rarity, from: theme.from, to: theme.to })
    setThemeFormError('')
    setShowThemeForm(true)
  }

  async function handleSaveTheme() {
    const name = themeForm.name.trim()
    if (!name || name.length > 100) {
      setThemeFormError(!name ? 'Theme name is required' : 'Theme name must be 100 characters or less')
      return
    }
    try {
      if (editingTheme) {
        const updated = await updateTheme(editingTheme.id, {
          name,
          rarity: themeForm.rarity,
          from_color: themeForm.from,
          to_color: themeForm.to,
        })
        setThemes((prev) => prev.map((t) => (t.id === editingTheme.id ? updated : t)))
      } else {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        if (themes.some((t) => t.id === slug)) {
          setThemeFormError('A theme with this slug already exists')
          return
        }
        const created = await createTheme({
          slug,
          name,
          rarity: themeForm.rarity,
          from_color: themeForm.from,
          to_color: themeForm.to,
        })
        setThemes((prev) => [...prev, created])
      }
      setShowThemeForm(false)
    } catch (err) {
      console.error('Failed to save theme:', err)
    }
  }

  async function handleDeleteTheme(slug: string) {
    try {
      await deleteTheme(slug)
      setThemes((prev) => prev.filter((t) => t.id !== slug))
    } catch (err) {
      console.error('Failed to delete theme:', err)
    }
  }

  // --- Specialty handlers ---
  async function handleAddSpecialty() {
    if (!newSpecName.trim() || newSpecName.trim().length > 50) return
    try {
      const created = await createSpecialty(newSpecName.trim())
      setSpecialties((prev) => [...prev, created])
      setNewSpecName('')
    } catch (err) {
      console.error('Failed to add specialty:', err)
    }
  }

  async function handleUpdateSpecialty(id: string) {
    if (!editingSpecName.trim() || editingSpecName.trim().length > 50) return
    try {
      const updated = await updateSpecialty(id, editingSpecName.trim())
      setSpecialties((prev) => prev.map((s) => (s.id === id ? updated : s)))
      setEditingSpecId(null)
    } catch (err) {
      console.error('Failed to update specialty:', err)
    }
  }

  async function handleDeleteSpecialty(id: string) {
    try {
      await deleteSpecialty(id)
      setSpecialties((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error('Failed to delete specialty:', err)
    }
  }

  // --- Description handlers ---
  async function handleAddDescription() {
    if (!newDescText.trim() || newDescText.trim().length > 500) return
    try {
      const created = await createDescription(newDescText.trim())
      setDescriptions((prev) => [...prev, created])
      setNewDescText('')
    } catch (err) {
      console.error('Failed to add description:', err)
    }
  }

  async function handleUpdateDescription(id: string) {
    if (!editingDescText.trim() || editingDescText.trim().length > 500) return
    try {
      const updated = await updateDescription(id, editingDescText.trim())
      setDescriptions((prev) => prev.map((d) => (d.id === id ? updated : d)))
      setEditingDescId(null)
    } catch (err) {
      console.error('Failed to update description:', err)
    }
  }

  async function handleDeleteDescription(id: string) {
    try {
      await deleteDescription(id)
      setDescriptions((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      console.error('Failed to delete description:', err)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    onLogout()
  }

  if (loading) return <div className={styles.loading}>Loading...</div>

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>TRADINGCARDS</h1>
          <p className={styles.subtitle}>Dashboard</p>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
      </header>

      {/* Themes Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Themes</h2>
          <button className={styles.addBtn} onClick={openNewTheme}>+ Add Theme</button>
        </div>

        {showThemeForm && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3 className={styles.modalTitle}>{editingTheme ? 'Edit Theme' : 'New Theme'}</h3>

              {themeFormError && <div className={styles.error}>{themeFormError}</div>}

              <label className={styles.label}>NAME</label>
              <input
                type="text"
                value={themeForm.name}
                onChange={(e) => setThemeForm({ ...themeForm, name: e.target.value })}
                className={styles.input}
                maxLength={100}
              />

              <label className={styles.label}>RARITY</label>
              <div className={styles.rarityRow}>
                {(['Common', 'Rare', 'Epic', 'Legendary'] as Rarity[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`${styles.rarityChip} ${themeForm.rarity === r ? styles.rarityActive : ''}`}
                    onClick={() => setThemeForm({ ...themeForm, rarity: r })}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className={styles.colorRow}>
                <div>
                  <label className={styles.label}>FROM</label>
                  <input
                    type="color"
                    value={themeForm.from}
                    onChange={(e) => setThemeForm({ ...themeForm, from: e.target.value })}
                  />
                </div>
                <div
                  className={styles.colorPreview}
                  style={{ background: `linear-gradient(135deg, ${themeForm.from}, ${themeForm.to})` }}
                />
                <div>
                  <label className={styles.label}>TO</label>
                  <input
                    type="color"
                    value={themeForm.to}
                    onChange={(e) => setThemeForm({ ...themeForm, to: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setShowThemeForm(false)}>Cancel</button>
                <button className={styles.saveBtn} onClick={handleSaveTheme}>Save</button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.list}>
          {themes.map((theme) => (
            <div key={theme.id} className={styles.listItem}>
              <div
                className={styles.themeSwatch}
                style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
              />
              <span className={styles.itemName}>{theme.name}</span>
              <span className={styles.badge}>{theme.rarity}</span>
              <button className={styles.editBtn} onClick={() => openEditTheme(theme)}>Edit</button>
              <button className={styles.deleteBtn} onClick={() => handleDeleteTheme(theme.id)}>Delete</button>
            </div>
          ))}
        </div>
      </section>

      {/* Specialties Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Specialties</h2>
        </div>

        <div className={styles.inlineAdd}>
          <input
            type="text"
            value={newSpecName}
            onChange={(e) => setNewSpecName(e.target.value)}
            placeholder="New specialty name"
            className={styles.input}
            maxLength={50}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSpecialty()}
          />
          <button className={styles.addBtn} onClick={handleAddSpecialty}>+ Add</button>
        </div>

        <div className={styles.list}>
          {specialties.map((spec) => (
            <div key={spec.id} className={styles.listItem}>
              {editingSpecId === spec.id ? (
                <>
                  <input
                    type="text"
                    value={editingSpecName}
                    onChange={(e) => setEditingSpecName(e.target.value)}
                    className={styles.inlineInput}
                    maxLength={50}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateSpecialty(spec.id)}
                    autoFocus
                  />
                  <button className={styles.saveBtn} onClick={() => handleUpdateSpecialty(spec.id)}>Save</button>
                  <button className={styles.cancelBtn} onClick={() => setEditingSpecId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span className={styles.itemName}>{spec.name}</span>
                  <button className={styles.editBtn} onClick={() => { setEditingSpecId(spec.id); setEditingSpecName(spec.name) }}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDeleteSpecialty(spec.id)}>Delete</button>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Descriptions Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Descriptions</h2>
        </div>

        <div className={styles.inlineAdd}>
          <input
            type="text"
            value={newDescText}
            onChange={(e) => setNewDescText(e.target.value)}
            placeholder="New description text"
            className={styles.input}
            maxLength={500}
            onKeyDown={(e) => e.key === 'Enter' && handleAddDescription()}
          />
          <button className={styles.addBtn} onClick={handleAddDescription}>+ Add</button>
        </div>

        <div className={styles.list}>
          {descriptions.map((desc) => (
            <div key={desc.id} className={styles.listItem}>
              {editingDescId === desc.id ? (
                <>
                  <input
                    type="text"
                    value={editingDescText}
                    onChange={(e) => setEditingDescText(e.target.value)}
                    className={styles.inlineInput}
                    maxLength={500}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateDescription(desc.id)}
                    autoFocus
                  />
                  <button className={styles.saveBtn} onClick={() => handleUpdateDescription(desc.id)}>Save</button>
                  <button className={styles.cancelBtn} onClick={() => setEditingDescId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span className={styles.itemName}>{desc.text}</span>
                  <button className={styles.editBtn} onClick={() => { setEditingDescId(desc.id); setEditingDescText(desc.text) }}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDeleteDescription(desc.id)}>Delete</button>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
