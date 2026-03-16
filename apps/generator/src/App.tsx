import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import type { CardData, Theme } from './types'
import { fetchThemes, fetchSpecialties, fetchDescriptions } from './lib/api'
import type { DbSpecialty, DbDescription } from './lib/api'
import { CardForm } from './components/CardForm'
import { CardPreview } from './components/CardPreview'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import styles from './App.module.css'

type View = 'dashboard' | 'preview'

const initialCard: CardData = {
  id: crypto.randomUUID(),
  name: '',
  image: '',
  specialties: [],
  description: '',
  theme: 'ocean-blue',
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [view, setView] = useState<View>('dashboard')

  // Preview state
  const [card, setCard] = useState<CardData>(initialCard)
  const [themes, setThemes] = useState<Theme[]>([])
  const [specialties, setSpecialties] = useState<DbSpecialty[]>([])
  const [descriptions, setDescriptions] = useState<DbDescription[]>([])
  const [previewStale, setPreviewStale] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load data when switching to preview (only if stale)
  useEffect(() => {
    if (view === 'preview' && session && previewStale) {
      Promise.all([fetchThemes(), fetchSpecialties(), fetchDescriptions()]).then(
        ([t, s, d]) => {
          setThemes(t)
          setSpecialties(s)
          setDescriptions(d)
          setPreviewStale(false)
        }
      )
    }
  }, [view, session, previewStale])

  if (authLoading) return null

  if (!session) {
    return <Login />
  }

  return (
    <div className={styles.app}>
      <nav className={styles.nav}>
        <button
          className={`${styles.tab} ${view === 'dashboard' ? styles.tabActive : ''}`}
          onClick={() => { setView('dashboard'); setPreviewStale(true) }}
        >
          Dashboard
        </button>
        <button
          className={`${styles.tab} ${view === 'preview' ? styles.tabActive : ''}`}
          onClick={() => setView('preview')}
        >
          Preview
        </button>
      </nav>

      {view === 'dashboard' ? (
        <Dashboard onLogout={() => setSession(null)} />
      ) : (
        <main className={styles.layout}>
          <section className={styles.formPanel}>
            <CardForm
              card={card}
              onChange={setCard}
              themes={themes}
              specialties={specialties}
              descriptions={descriptions}
            />
          </section>
          <section className={styles.previewPanel}>
            <CardPreview card={card} themes={themes} />
          </section>
        </main>
      )}
    </div>
  )
}

export default App
