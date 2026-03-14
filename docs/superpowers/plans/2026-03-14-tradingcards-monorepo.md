# Tradingcards Monorepo Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Tradecade single-app project into a Tradingcards monorepo with an admin Generator webapp and a public npm package, backed by Supabase.

**Architecture:** npm workspaces monorepo with `apps/generator/` (Vite + React admin tool) and `packages/react/` (the `tradingcards` npm package). Supabase provides Postgres database with three catalog tables (themes, specialties, descriptions) and email/password auth for the Generator.

**Tech Stack:** React 19, TypeScript, Vite 8 (app + library mode), Supabase (Postgres + Auth), npm workspaces, CSS Modules

**Spec:** `docs/superpowers/specs/2026-03-14-tradingcards-package-design.md`

---

## Chunk 1: Rename & Monorepo Scaffolding

### Task 1: Rename Tradecade → Tradingcards

**Files:**
- Modify: `index.html` (title)
- Modify: `src/utils/export.ts` (filename prefix)
- Modify: `README.md`

- [ ] **Step 1: Rename project directory**

```bash
cd ~
mv Tradecade Tradingcards
cd ~/Tradingcards
```

- [ ] **Step 2: Find all "Tradecade" / "tradecade" references**

```bash
grep -ri "tradecade\|TRADECADE" src/ index.html README.md package.json
```

Update every occurrence to "Tradingcards" / "tradingcards" / "TRADINGCARDS" as appropriate. Known locations:
- `index.html`: title tag
- `src/utils/export.ts`: download filename prefix (`tradecade-` → `tradingcards-`)
- `README.md`: project name references
- Any component containing the brand text "TRADECADE" → "TRADINGCARDS"

- [ ] **Step 3: Verify app still works**

```bash
npm run dev
```

Expected: App runs, UI shows updated branding.

- [ ] **Step 4: Verify no stale references remain**

```bash
grep -ri "tradecade" src/ index.html README.md package.json
```

Expected: No results.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: rename Tradecade to Tradingcards"
```

---

### Task 2: Restructure into monorepo

This task moves the existing app into `apps/generator/` and sets up npm workspaces.

**Files:**
- Create: `package.json` (workspace root — new)
- Move: all current src/, config, index.html → `apps/generator/`
- Create: `apps/generator/package.json` (from current package.json)
- Create: `packages/react/package.json` (empty placeholder)

- [ ] **Step 1: Create the directory structure**

```bash
cd ~/Tradingcards
mkdir -p apps/generator
mkdir -p packages/react
```

- [ ] **Step 2: Move the existing app into apps/generator/**

```bash
mv src apps/generator/
mv index.html apps/generator/
mv vite.config.ts apps/generator/
mv tsconfig.json apps/generator/
mv tsconfig.app.json apps/generator/
mv tsconfig.node.json apps/generator/
mv eslint.config.js apps/generator/
mv public apps/generator/ 2>/dev/null; true
```

- [ ] **Step 3: Move current package.json and clean up lock file**

```bash
mv package.json apps/generator/package.json
rm -f package-lock.json
```

Then edit `apps/generator/package.json`: change `"name"` to `"@tradingcards/generator"` and add `"private": true`.

- [ ] **Step 4: Create workspace root package.json**

Create `~/Tradingcards/package.json`:

```json
{
  "name": "tradingcards-root",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

- [ ] **Step 5: Create placeholder package for packages/react/**

Create `packages/react/package.json`:

```json
{
  "name": "tradingcards",
  "version": "0.1.0",
  "description": "Trading card React component and Supabase hooks",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "devDependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  }
}
```

- [ ] **Step 6: Move node_modules and reinstall**

```bash
cd ~/Tradingcards
rm -rf node_modules apps/generator/node_modules
npm install
```

This installs all workspace dependencies and hoists shared ones to root.

- [ ] **Step 7: Verify generator still works**

```bash
cd ~/Tradingcards
npm run dev --workspace=apps/generator
```

Expected: Generator runs as before.

- [ ] **Step 8: Update .gitignore at root**

The `.gitignore` should already be at root (it was not moved in Step 2). Open it and ensure it includes:

```
node_modules
dist
.superpowers
.env
.env.local
```

If `.env` is missing, add it.

- [ ] **Step 9: Commit**

```bash
cd ~/Tradingcards
git add -A
git commit -m "chore: restructure into npm workspaces monorepo"
```

---

## Chunk 2: Supabase Setup & Database

### Task 3: Create Supabase project and configure locally

**Files:**
- Create: `apps/generator/.env.local`

- [ ] **Step 1: Create Supabase project**

Go to [supabase.com/dashboard](https://supabase.com/dashboard):
1. Click "New Project"
2. Name: "tradingcards"
3. Generate a database password (save it)
4. Region: closest to you (eu-west)
5. Wait for project to provision

- [ ] **Step 2: Get API credentials**

In Supabase dashboard → Settings → API:
- Copy **Project URL** (e.g. `https://xxxxx.supabase.co`)
- Copy **anon public** key

(The service_role key is not needed — the Generator uses the anon key with Supabase Auth for write access via RLS policies.)

- [ ] **Step 3: Create .env.local for the Generator**

Create `apps/generator/.env.local`:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 4: Verify .env.local is gitignored**

```bash
cat .gitignore | grep env
```

Expected: `.env` or `.env.local` is listed. If not, add it.

- [ ] **Step 5: Commit**

No files to commit (env files are gitignored). Commit the .gitignore update if changed.

---

### Task 4: Create database tables

**Files:**
- Create: `supabase/migrations/001_create_tables.sql`

- [ ] **Step 1: Create migration directory**

```bash
mkdir -p ~/Tradingcards/supabase/migrations
```

- [ ] **Step 2: Write the migration SQL**

Create `supabase/migrations/001_create_tables.sql`:

```sql
-- Themes catalog
create table themes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  rarity text not null check (rarity in ('Common', 'Rare', 'Epic', 'Legendary')),
  from_color text not null,
  to_color text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Specialties catalog
create table specialties (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Descriptions catalog
create table descriptions (
  id uuid primary key default gen_random_uuid(),
  text text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger themes_updated_at before update on themes
  for each row execute function update_updated_at();

create trigger specialties_updated_at before update on specialties
  for each row execute function update_updated_at();

create trigger descriptions_updated_at before update on descriptions
  for each row execute function update_updated_at();

-- Row Level Security
alter table themes enable row level security;
alter table specialties enable row level security;
alter table descriptions enable row level security;

-- Public read access (anon key)
create policy "Public read themes" on themes for select using (true);
create policy "Public read specialties" on specialties for select using (true);
create policy "Public read descriptions" on descriptions for select using (true);

-- Authenticated write access (Generator)
create policy "Auth insert themes" on themes for insert to authenticated with check (true);
create policy "Auth update themes" on themes for update to authenticated using (true);
create policy "Auth delete themes" on themes for delete to authenticated using (true);

create policy "Auth insert specialties" on specialties for insert to authenticated with check (true);
create policy "Auth update specialties" on specialties for update to authenticated using (true);
create policy "Auth delete specialties" on specialties for delete to authenticated using (true);

create policy "Auth insert descriptions" on descriptions for insert to authenticated with check (true);
create policy "Auth update descriptions" on descriptions for update to authenticated using (true);
create policy "Auth delete descriptions" on descriptions for delete to authenticated using (true);
```

- [ ] **Step 3: Run migration in Supabase**

Go to Supabase dashboard → SQL Editor. Paste and run the migration SQL.

Expected: All tables created, RLS policies active.

- [ ] **Step 4: Verify tables exist**

In Supabase dashboard → Table Editor: you should see `themes`, `specialties`, `descriptions` tables.

- [ ] **Step 5: Commit migration file**

```bash
git add supabase/
git commit -m "feat: add database migration with themes, specialties, descriptions tables"
```

---

### Task 5: Seed database with existing presets

**Files:**
- Create: `supabase/seed.sql`

- [ ] **Step 1: Write seed data from existing themes.ts and presets.ts**

Create `supabase/seed.sql`:

```sql
-- Seed themes (from existing themes.ts)
insert into themes (slug, name, rarity, from_color, to_color) values
  ('ocean-blue', 'Ocean Blue', 'Common', '#0f3460', '#16213e'),
  ('forest-green', 'Forest Green', 'Common', '#2d6a4f', '#1b4332'),
  ('midnight-black', 'Midnight Black', 'Common', '#2d3436', '#000000'),
  ('arctic-frost', 'Arctic Frost', 'Common', '#74b9ff', '#0984e3'),
  ('crimson-fire', 'Crimson Fire', 'Rare', '#e94560', '#c23152'),
  ('sunset-gold', 'Sunset Gold', 'Rare', '#f77f00', '#e36414'),
  ('neon-pink', 'Neon Pink', 'Rare', '#fd79a8', '#e84393'),
  ('royal-purple', 'Royal Purple', 'Epic', '#7b2cbf', '#5a189a'),
  ('aurora', 'Aurora', 'Epic', '#00b4d8', '#0077b6'),
  ('deep-ocean', 'Deep Ocean', 'Epic', '#023e8a', '#03045e'),
  ('solar-flare', 'Solar Flare', 'Legendary', '#ff6b35', '#f7c59f'),
  ('void-walker', 'Void Walker', 'Legendary', '#6c63ff', '#3d348b'),
  ('abyssal-tide', 'Abyssal Tide', 'Legendary', '#2ec4b6', '#011627');

-- Seed specialties (from existing presets.ts)
insert into specialties (name) values
  ('Frontend'), ('Backend'), ('Design'), ('DevOps'),
  ('Mobile'), ('Data'), ('Security'), ('AI/ML'),
  ('Product'), ('Leadership'), ('QA'), ('Fullstack');

-- Seed descriptions (from existing presets.ts)
insert into descriptions (text) values
  ('Breekt prod op vrijdagmiddag'),
  ('Merged zonder review'),
  ('Het werkt op mijn machine'),
  ('Schrijft tests na deployment'),
  ('Refactort alles behalve eigen code'),
  ('LGTM zonder te lezen'),
  ('Commitbericht: fix'),
  ('Vergeet altijd de .env'),
  ('Stack Overflow copy-paste kampioen'),
  ('Deployt met YOLO-energie'),
  ('Noemt alles temp maar het blijft'),
  ('Documentatie is voor losers');
```

- [ ] **Step 2: Run seed in Supabase**

Go to Supabase dashboard → SQL Editor. Paste and run the seed SQL.

Expected: 13 themes, 12 specialties, 12 descriptions inserted.

- [ ] **Step 3: Verify data in Table Editor**

Check each table in the Supabase Table Editor to confirm the data is correct.

- [ ] **Step 4: Create admin user**

Go to Supabase dashboard → Authentication → Users → "Add User":
- Email: your email
- Password: a strong password
- Auto confirm: yes

This is the only user — used to log into the Generator.

- [ ] **Step 5: Commit seed file**

```bash
git add supabase/seed.sql
git commit -m "feat: add seed data for themes, specialties, descriptions"
```

---

## Chunk 3: Supabase Client & Generator Auth

### Task 6: Install Supabase and create client for Generator

**Files:**
- Create: `apps/generator/src/lib/supabase.ts`

- [ ] **Step 1: Install Supabase client in generator**

```bash
cd ~/Tradingcards
npm install @supabase/supabase-js --workspace=apps/generator
```

- [ ] **Step 2: Write the Supabase client**

Create `apps/generator/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 3: Add Vite env type declarations**

Replace the contents of `apps/generator/src/vite-env.d.ts` (this file already exists from Vite scaffolding) with:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd ~/Tradingcards/apps/generator
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
cd ~/Tradingcards
git add apps/generator/src/lib/supabase.ts apps/generator/src/vite-env.d.ts
git commit -m "feat: add Supabase client for Generator"
```

---

### Task 7: Add Login page

**Files:**
- Create: `apps/generator/src/pages/Login.tsx`
- Create: `apps/generator/src/pages/Login.module.css`

- [ ] **Step 1: Write Login component**

Create `apps/generator/src/pages/Login.tsx`:

```tsx
import { useState, FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Login.module.css'

interface LoginProps {
  onLogin: () => void
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      onLogin()
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>TRADINGCARDS</h1>
        <p className={styles.subtitle}>Generator Login</p>

        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label}>EMAIL</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
        />

        <label className={styles.label}>PASSWORD</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
        />

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Write Login styles**

Create `apps/generator/src/pages/Login.module.css`:

```css
.container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-deep);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 320px;
}

.title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 32px;
  letter-spacing: 4px;
  text-align: center;
}

.subtitle {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
  margin-bottom: 16px;
}

.label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 2px;
  margin-top: 4px;
}

.input {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 12px;
  outline: none;
  transition: border-color 0.15s ease;
}

.input:focus {
  border-color: var(--text-dim);
}

.error {
  background: rgba(233, 69, 96, 0.1);
  border: 1px solid rgba(233, 69, 96, 0.3);
  border-radius: 6px;
  color: #e94560;
  font-size: 13px;
  padding: 8px 12px;
}

.button {
  margin-top: 12px;
  background: var(--text-primary);
  color: var(--bg-deep);
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.button:hover {
  opacity: 0.85;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/generator/src/pages/
git commit -m "feat: add Login page with Supabase auth"
```

---

### Task 8: Wire auth into App

**Files:**
- Modify: `apps/generator/src/App.tsx`

- [ ] **Step 1: Add auth state to App**

Rewrite `apps/generator/src/App.tsx` to add authentication gating:

```tsx
import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import type { CardData, Theme } from './types'
import { CardForm } from './components/CardForm'
import { CardPreview } from './components/CardPreview'
import { Login } from './pages/Login'
import styles from './App.module.css'

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
  const [loading, setLoading] = useState(true)
  const [card, setCard] = useState<CardData>(initialCard)
  const [themes, setThemes] = useState<Theme[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null

  if (!session) {
    return <Login onLogin={() => {}} />
  }

  return (
    <div className={styles.layout}>
      <div className={styles.formPanel}>
        <CardForm
          card={card}
          onChange={setCard}
          themes={themes}
          onAddTheme={(theme) => setThemes((prev) => [...prev, theme])}
          onUpdateTheme={(updated) =>
            setThemes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
          }
          onRemoveTheme={(id) => setThemes((prev) => prev.filter((t) => t.id !== id))}
        />
      </div>
      <div className={styles.previewPanel}>
        <CardPreview card={card} themes={themes} />
      </div>
    </div>
  )
}

export default App
```

Note: This preserves the existing CardForm/CardPreview interface for now. The theme list will be empty after login — this is expected and will be fixed in Chunk 4 when we wire up Supabase data fetching and add the Dashboard view.

- [ ] **Step 2: Verify auth flow works**

```bash
npm run dev --workspace=apps/generator
```

Expected: Opens to login page. After entering valid credentials, shows the card editor.

- [ ] **Step 3: Commit**

```bash
git add apps/generator/src/App.tsx
git commit -m "feat: gate Generator behind Supabase auth"
```

---

## Chunk 4: Generator Dashboard (CRUD)

### Task 9: Fetch catalog data from Supabase

**Files:**
- Create: `apps/generator/src/lib/api.ts`

- [ ] **Step 1: Write API functions for all three catalogs**

Create `apps/generator/src/lib/api.ts`:

```typescript
import { supabase } from './supabase'
import type { Theme } from '../types'

// --- Themes ---

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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd ~/Tradingcards/apps/generator
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/generator/src/lib/api.ts
git commit -m "feat: add Supabase CRUD API functions for all catalogs"
```

---

### Task 10: Dashboard page — Themes section

**Files:**
- Create: `apps/generator/src/pages/Dashboard.tsx`
- Create: `apps/generator/src/pages/Dashboard.module.css`

- [ ] **Step 1: Write Dashboard component**

Create `apps/generator/src/pages/Dashboard.tsx`:

```tsx
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
    const [t, s, d] = await Promise.all([
      fetchThemes(),
      fetchSpecialties(),
      fetchDescriptions(),
    ])
    setThemes(t)
    setSpecialties(s)
    setDescriptions(d)
    setLoading(false)
  }

  // --- Theme handlers ---
  function openNewTheme() {
    setEditingTheme(null)
    setThemeForm({ slug: '', name: '', rarity: 'Common', from: '#000000', to: '#000000' })
    setShowThemeForm(true)
  }

  function openEditTheme(theme: Theme) {
    setEditingTheme(theme)
    setThemeForm({ slug: theme.id, name: theme.name, rarity: theme.rarity, from: theme.from, to: theme.to })
    setShowThemeForm(true)
  }

  async function handleSaveTheme() {
    if (editingTheme) {
      const updated = await updateTheme(editingTheme.id, {
        name: themeForm.name,
        rarity: themeForm.rarity,
        from_color: themeForm.from,
        to_color: themeForm.to,
      })
      setThemes((prev) => prev.map((t) => (t.id === editingTheme.id ? updated : t)))
    } else {
      const slug = themeForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const created = await createTheme({
        slug,
        name: themeForm.name,
        rarity: themeForm.rarity,
        from_color: themeForm.from,
        to_color: themeForm.to,
      })
      setThemes((prev) => [...prev, created])
    }
    setShowThemeForm(false)
  }

  async function handleDeleteTheme(slug: string) {
    await deleteTheme(slug)
    setThemes((prev) => prev.filter((t) => t.id !== slug))
  }

  // --- Specialty handlers ---
  async function handleAddSpecialty() {
    if (!newSpecName.trim()) return
    const created = await createSpecialty(newSpecName.trim())
    setSpecialties((prev) => [...prev, created])
    setNewSpecName('')
  }

  async function handleUpdateSpecialty(id: string) {
    if (!editingSpecName.trim()) return
    const updated = await updateSpecialty(id, editingSpecName.trim())
    setSpecialties((prev) => prev.map((s) => (s.id === id ? updated : s)))
    setEditingSpecId(null)
  }

  async function handleDeleteSpecialty(id: string) {
    await deleteSpecialty(id)
    setSpecialties((prev) => prev.filter((s) => s.id !== id))
  }

  // --- Description handlers ---
  async function handleAddDescription() {
    if (!newDescText.trim()) return
    const created = await createDescription(newDescText.trim())
    setDescriptions((prev) => [...prev, created])
    setNewDescText('')
  }

  async function handleUpdateDescription(id: string) {
    if (!editingDescText.trim()) return
    const updated = await updateDescription(id, editingDescText.trim())
    setDescriptions((prev) => prev.map((d) => (d.id === id ? updated : d)))
    setEditingDescId(null)
  }

  async function handleDeleteDescription(id: string) {
    await deleteDescription(id)
    setDescriptions((prev) => prev.filter((d) => d.id !== id))
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

              <label className={styles.label}>NAME</label>
              <input
                type="text"
                value={themeForm.name}
                onChange={(e) => setThemeForm({ ...themeForm, name: e.target.value })}
                className={styles.input}
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
```

- [ ] **Step 2: Write Dashboard styles**

Create `apps/generator/src/pages/Dashboard.module.css`:

```css
.dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 32px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
}

.title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 32px;
  letter-spacing: 4px;
  margin: 0;
}

.subtitle {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.logoutBtn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 8px 16px;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.logoutBtn:hover {
  border-color: var(--text-dim);
  color: var(--text-primary);
}

.section {
  margin-bottom: 40px;
}

.sectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.sectionTitle {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 1px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.listItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.themeSwatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.itemName {
  flex: 1;
  font-size: 14px;
}

.badge {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.editBtn,
.deleteBtn {
  background: none;
  border: none;
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.15s ease;
}

.editBtn {
  color: var(--text-muted);
}

.editBtn:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.deleteBtn {
  color: #e94560;
}

.deleteBtn:hover {
  background: rgba(233, 69, 96, 0.1);
}

.addBtn {
  background: none;
  border: 1px dashed var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 8px 16px;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.addBtn:hover {
  border-color: var(--text-dim);
  color: var(--text-primary);
}

.inlineAdd {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.inlineAdd .input {
  flex: 1;
}

.input {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 12px;
  outline: none;
  transition: border-color 0.15s ease;
}

.input:focus {
  border-color: var(--text-dim);
}

.input::placeholder {
  color: var(--text-dim);
}

.inlineInput {
  flex: 1;
  background: var(--bg-deep);
  border: 1px solid var(--text-dim);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 8px 10px;
  outline: none;
}

.saveBtn {
  background: var(--text-primary);
  color: var(--bg-deep);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.saveBtn:hover {
  opacity: 0.85;
}

.cancelBtn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 8px 16px;
  cursor: pointer;
}

.cancelBtn:hover {
  border-color: var(--text-dim);
}

.loading {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

/* Theme form modal */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modalContent {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modalTitle {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
}

.label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 2px;
  margin-top: 4px;
}

.rarityRow {
  display: flex;
  gap: 8px;
}

.rarityChip {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 6px 12px;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.rarityChip:hover {
  border-color: var(--text-dim);
}

.rarityActive {
  border-color: var(--text-primary);
  color: var(--text-primary);
}

.colorRow {
  display: flex;
  align-items: center;
  gap: 12px;
}

.colorPreview {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  flex-shrink: 0;
}

.modalActions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/generator/src/pages/Dashboard.tsx apps/generator/src/pages/Dashboard.module.css
git commit -m "feat: add Dashboard page with CRUD for themes, specialties, descriptions"
```

---

### Task 11: Wire Dashboard and Preview into App with tab navigation

**Files:**
- Modify: `apps/generator/src/App.tsx`
- Modify: `apps/generator/src/App.module.css`

- [ ] **Step 1: Rewrite App with tab navigation**

Rewrite `apps/generator/src/App.tsx`:

```tsx
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

  // Load data when switching to preview
  useEffect(() => {
    if (view === 'preview' && session) {
      Promise.all([fetchThemes(), fetchSpecialties(), fetchDescriptions()]).then(
        ([t, s, d]) => {
          setThemes(t)
          setSpecialties(s)
          setDescriptions(d)
        }
      )
    }
  }, [view, session])

  if (authLoading) return null

  if (!session) {
    return <Login onLogin={() => {}} />
  }

  return (
    <div className={styles.app}>
      <nav className={styles.nav}>
        <button
          className={`${styles.tab} ${view === 'dashboard' ? styles.tabActive : ''}`}
          onClick={() => setView('dashboard')}
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
        <div className={styles.layout}>
          <div className={styles.formPanel}>
            <CardForm
              card={card}
              onChange={setCard}
              themes={themes}
              specialties={specialties}
              descriptions={descriptions}
            />
          </div>
          <div className={styles.previewPanel}>
            <CardPreview card={card} themes={themes} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
```

Note: The CardForm props interface needs to be updated in a later step to accept `specialties` and `descriptions` from Supabase instead of local arrays. For now this sets up the navigation structure.

- [ ] **Step 2: Update App.module.css with nav styles**

Add to `apps/generator/src/App.module.css`:

```css
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  background: var(--bg-surface);
  padding: 0 32px;
  flex-shrink: 0;
}

.tab {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 14px 20px;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.tab:hover {
  color: var(--text-primary);
}

.tabActive {
  color: var(--text-primary);
  border-bottom-color: var(--text-primary);
}

.layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.formPanel {
  width: 420px;
  min-width: 420px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  overflow-y: auto;
}

.previewPanel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-deep);
}
```

- [ ] **Step 3: Update CardForm to accept Supabase data**

Modify `apps/generator/src/components/CardForm.tsx`:

1. Remove these imports:
   - `import { specialtyOptions, descriptionOptions } from '../presets'`
   - `import { exportCardAsJson } from '../utils/export'`

2. Change the props interface to:

```tsx
interface CardFormProps {
  card: CardData
  onChange: (card: CardData) => void
  themes: Theme[]
  specialties: { id: string; name: string }[]
  descriptions: { id: string; text: string }[]
}
```

3. Replace `specialtyOptions.map(...)` with `specialties.map((s) => ...)` where `s.name` is used for display and matching (destructure `specialties` from props).

4. Replace `descriptionOptions.map(...)` with `descriptions.map((d) => ...)` where `d.text` is used for the option value and display.

5. Remove the `onAddTheme`, `onUpdateTheme`, `onRemoveTheme` props and the export button JSX + its handler.

- [ ] **Step 4: Remove local data files and export utility**

These files are no longer needed — all data comes from Supabase:

```bash
rm apps/generator/src/presets.ts apps/generator/src/themes.ts apps/generator/src/utils/export.ts
```

After deletion, check for stale imports:

```bash
grep -r "from.*presets\|from.*themes\|from.*export" apps/generator/src/
```

Remove any remaining imports found. Files to check: `CardForm.tsx`, `App.tsx`, `ThemePicker.tsx`.

- [ ] **Step 6: Verify app compiles and runs**

```bash
cd ~/Tradingcards
npm run dev --workspace=apps/generator
```

Expected: Login → Dashboard (CRUD for themes/specialties/descriptions) and Preview tab (card editor with Supabase data).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add tab navigation with Dashboard and Preview views, remove local data"
```

---

## Chunk 5: npm Package (`tradingcards`)

### Task 12: Package scaffolding and build config

**Files:**
- Create: `packages/react/tsconfig.json`
- Create: `packages/react/vite.config.ts`
- Create: `packages/react/src/index.ts`

- [ ] **Step 1: Install dependencies for the package**

The `packages/react/package.json` was already created in Task 2 Step 5. Now add the remaining dependencies:

```bash
cd ~/Tradingcards
npm install @supabase/supabase-js --workspace=packages/react
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom --workspace=packages/react
```

Note: `@supabase/supabase-js` is a runtime dependency (it will be bundled by Vite into the output). React is a peer dependency (already in devDependencies from Task 2).

- [ ] **Step 2: Create tsconfig.json**

Create `packages/react/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "declarationDir": "dist",
    "outDir": "dist",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create vite.config.ts for library mode**

Create `packages/react/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', '@supabase/supabase-js'],
    },
    cssCodeSplit: false,
  },
})
```

- [ ] **Step 4: Add build script to package.json**

In `packages/react/package.json`, add to scripts:

```json
{
  "scripts": {
    "build": "tsc --emitDeclarationOnly && vite build"
  }
}
```

- [ ] **Step 5: Create entry point placeholder**

Create `packages/react/src/index.ts`:

```typescript
export { Tradingcards } from './Tradingcards'
export { TradingcardsProvider } from './Provider'
export { useThemes, useSpecialties, useDescriptions } from './hooks'
export type { Theme, Specialty, Description, TradingcardsProps } from './types'
```

- [ ] **Step 6: Commit**

```bash
git add packages/react/
git commit -m "feat: scaffold tradingcards package with Vite library build config"
```

---

### Task 13: Package types

**Files:**
- Create: `packages/react/src/types.ts`

- [ ] **Step 1: Write shared types**

Create `packages/react/src/types.ts`:

```typescript
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'

export interface Theme {
  slug: string
  name: string
  rarity: Rarity
  from: string
  to: string
}

export interface Specialty {
  id: string
  name: string
}

export interface Description {
  id: string
  text: string
}

export interface TradingcardsProps {
  name: string
  image: string
  theme: string
  specialties: string[]
  description: string
  className?: string
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/react/src/types.ts
git commit -m "feat: add package types for Theme, Specialty, Description"
```

---

### Task 14: Provider and Supabase client

**Files:**
- Create: `packages/react/src/client.ts`
- Create: `packages/react/src/Provider.tsx`
- Create: `packages/react/src/context.ts`

- [ ] **Step 1: Write the context**

Create `packages/react/src/context.ts`:

```typescript
import { createContext } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

export const TradingcardsContext = createContext<SupabaseClient | null>(null)
```

- [ ] **Step 2: Write the provider**

Create `packages/react/src/Provider.tsx`:

```tsx
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
```

- [ ] **Step 3: Write the client hook**

Create `packages/react/src/client.ts`:

```typescript
import { useContext } from 'react'
import { TradingcardsContext } from './context'

export function useSupabase() {
  const client = useContext(TradingcardsContext)
  if (!client) {
    throw new Error('useSupabase must be used within a <TradingcardsProvider>')
  }
  return client
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/context.ts packages/react/src/Provider.tsx packages/react/src/client.ts
git commit -m "feat: add TradingcardsProvider and Supabase context"
```

---

### Task 15: Data hooks

**Files:**
- Create: `packages/react/src/hooks.ts`

- [ ] **Step 1: Write the hooks**

Create `packages/react/src/hooks.ts`:

```typescript
import { useState, useEffect } from 'react'
import { useSupabase } from './client'
import type { Theme, Specialty, Description } from './types'

export function useThemes() {
  const supabase = useSupabase()
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('themes')
      .select('slug, name, rarity, from_color, to_color')
      .order('created_at')
      .then(({ data, error }) => {
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
  }, [supabase])

  return { themes, loading, error }
}

export function useSpecialties() {
  const supabase = useSupabase()
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('specialties')
      .select('id, name')
      .order('created_at')
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
          console.warn('[tradingcards] Failed to fetch specialties:', error.message)
        } else if (data) {
          setSpecialties(data)
        }
        setLoading(false)
      })
  }, [supabase])

  return { specialties, loading, error }
}

export function useDescriptions() {
  const supabase = useSupabase()
  const [descriptions, setDescriptions] = useState<Description[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('descriptions')
      .select('id, text')
      .order('created_at')
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
          console.warn('[tradingcards] Failed to fetch descriptions:', error.message)
        } else if (data) {
          setDescriptions(data)
        }
        setLoading(false)
      })
  }, [supabase])

  return { descriptions, loading, error }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/react/src/hooks.ts
git commit -m "feat: add useThemes, useSpecialties, useDescriptions hooks"
```

---

### Task 16: Tradingcards component

**Files:**
- Create: `packages/react/src/Tradingcards.tsx`
- Create: `packages/react/src/Tradingcards.css`

- [ ] **Step 1: Write the Tradingcards component**

Create `packages/react/src/Tradingcards.tsx`:

This is a simplified version of the existing CardPreview component, adapted for the package API. It fetches the theme by slug from Supabase and renders the card.

```tsx
import { useState, useEffect } from 'react'
import { useSupabase } from './client'
import type { TradingcardsProps, Rarity } from './types'
import './Tradingcards.css'

interface ThemeData {
  name: string
  rarity: Rarity
  from: string
  to: string
}

const FALLBACK_THEME: ThemeData = {
  name: 'Default',
  rarity: 'Common',
  from: '#2d3436',
  to: '#000000',
}

export function Tradingcards({ name, image, theme, specialties, description, className }: TradingcardsProps) {
  const supabase = useSupabase()
  const [themeData, setThemeData] = useState<ThemeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('themes')
      .select('name, rarity, from_color, to_color')
      .eq('slug', theme)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          console.warn(`[tradingcards] Theme "${theme}" not found, using fallback`)
          setThemeData(FALLBACK_THEME)
        } else {
          setThemeData({
            name: data.name,
            rarity: data.rarity,
            from: data.from_color,
            to: data.to_color,
          })
        }
        setLoading(false)
      })
  }, [supabase, theme])

  const t = themeData ?? FALLBACK_THEME
  const rarity = t.rarity.toLowerCase()
  const gradient = `linear-gradient(135deg, ${t.from}, ${t.to})`

  if (loading) {
    return (
      <div className={`tc-card tc-skeleton ${className ?? ''}`}>
        <div className="tc-card-inner" />
      </div>
    )
  }

  return (
    <div className={`tc-card tc-${rarity} ${className ?? ''}`}>
      <div className="tc-card-border" style={{ background: gradient }}>
        <div className="tc-card-inner">
          <div className="tc-brand">TRADINGCARDS</div>

          <div className="tc-image-frame">
            {image ? (
              <img src={image} alt={name} className="tc-image" />
            ) : (
              <div className="tc-image-placeholder" />
            )}
          </div>

          <div className="tc-name">{name}</div>

          <div className="tc-rarity-badge">
            <span className={`tc-rarity-dot tc-dot-${rarity}`} />
            {t.rarity}
          </div>

          {specialties.length > 0 && (
            <div className="tc-specialties">
              {specialties.map((spec) => (
                <span key={spec} className="tc-badge">{spec}</span>
              ))}
            </div>
          )}

          {description && (
            <div className="tc-description">{description}</div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write the CSS**

Create `packages/react/src/Tradingcards.css`:

```css
/* Tradingcards component styles — prefixed with tc- to avoid collisions */

.tc-card {
  width: 300px;
  font-family: 'Syne', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.tc-card-border {
  border-radius: 16px;
  padding: 3px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
}

.tc-card-inner {
  background: rgba(10, 10, 10, 0.85);
  border-radius: 14px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.tc-skeleton .tc-card-inner {
  min-height: 440px;
  background: linear-gradient(135deg, #1e1e1e, #141414);
}

.tc-brand {
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 4px;
  color: #f0ece2;
  opacity: 0.6;
}

.tc-image-frame {
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: 8px;
  overflow: hidden;
  background: #0a0a0a;
}

.tc-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tc-image-placeholder {
  width: 100%;
  height: 100%;
  background: #141414;
}

.tc-name {
  font-weight: 700;
  font-size: 20px;
  text-align: center;
  letter-spacing: 1px;
  color: #f0ece2;
}

.tc-rarity-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #8a8575;
}

.tc-rarity-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.tc-dot-common { background: #8a8575; }
.tc-dot-rare { background: #4ea8de; }
.tc-dot-epic { background: #9b5de5; }
.tc-dot-legendary { background: #f4a261; }

.tc-specialties {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.tc-badge {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(240, 236, 226, 0.1);
  color: #f0ece2;
}

.tc-description {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 12px;
  color: #8a8575;
  text-align: center;
  line-height: 1.5;
  max-width: 240px;
}

/* Rarity-specific styles */
.tc-rare .tc-card-border {
  box-shadow: 0 0 40px rgba(78, 168, 222, 0.15);
}

.tc-epic .tc-card-border {
  box-shadow: 0 0 40px rgba(155, 93, 229, 0.2);
}

.tc-legendary .tc-card-border {
  box-shadow: 0 0 50px rgba(244, 162, 97, 0.25);
  animation: tc-pulse 3s ease-in-out infinite;
}

@keyframes tc-pulse {
  0%, 100% { box-shadow: 0 0 50px rgba(244, 162, 97, 0.25); }
  50% { box-shadow: 0 0 70px rgba(244, 162, 97, 0.4); }
}
```

- [ ] **Step 3: Verify package builds**

```bash
cd ~/Tradingcards
npm run build --workspace=packages/react
```

Expected: `packages/react/dist/` contains `index.js`, `index.d.ts`, and `style.css`.

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/Tradingcards.tsx packages/react/src/Tradingcards.css
git commit -m "feat: add Tradingcards component with theme fetching and rarity styles"
```

---

### Task 17: Verify full package build and exports

- [ ] **Step 1: Run full package build**

```bash
cd ~/Tradingcards
npm run build --workspace=packages/react
```

Expected: Clean build, `dist/` contains `index.js`, `index.d.ts`, and `style.css`.

- [ ] **Step 2: Verify exports resolve**

```bash
ls packages/react/dist/
```

Expected: `index.js`, `index.d.ts` (and possibly other .d.ts files), `style.css`.

- [ ] **Step 3: Test type checking**

```bash
cd ~/Tradingcards/packages/react
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: verify package build and exports"
```

---

## Chunk 6: npm Publishing & Final Verification

### Task 18: Prepare for npm publishing

**Files:**
- Modify: `packages/react/package.json`

- [ ] **Step 1: Finalize package.json**

Update `packages/react/package.json` to include all necessary fields:

```json
{
  "name": "tradingcards",
  "version": "0.1.0",
  "description": "Trading card React component with Supabase-backed themes and data hooks",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./style.css": "./dist/style.css"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc --emitDeclarationOnly && vite build"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "@supabase/supabase-js": ">=2.0.0"
  },
  "devDependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "@supabase/supabase-js": "^2.0.0",
    "vite": "^8.0.0",
    "@vitejs/plugin-react": "^6.0.0",
    "typescript": "~5.9.3"
  },
  "keywords": ["react", "trading-cards", "component", "supabase"],
  "license": "MIT"
}
```

Note: `@supabase/supabase-js` is a peer dependency (externalized by Vite, not bundled). Consumers who use the `<TradingcardsProvider>` will already have it installed. React is also a peer dependency.

**CSS import requirement:** Consumers must import the stylesheet separately:
```tsx
import 'tradingcards/style.css'
```

- [ ] **Step 2: Build the package**

```bash
cd ~/Tradingcards
npm run build --workspace=packages/react
```

- [ ] **Step 3: Dry-run publish to verify**

```bash
cd ~/Tradingcards/packages/react
npm pack --dry-run
```

Expected: Shows the files that would be included. Should only contain `dist/` files and `package.json`. No `src/` files.

- [ ] **Step 4: Commit**

```bash
cd ~/Tradingcards
git add -A
git commit -m "chore: finalize package.json for npm publishing"
```

- [ ] **Step 5: Login to npm**

```bash
npm login
```

Follow the prompts to authenticate.

- [ ] **Step 6: Publish**

```bash
cd ~/Tradingcards/packages/react
npm publish --access public
```

Expected: Package published to npm as `tradingcards@0.1.0`.

- [ ] **Step 7: Verify on npm**

```bash
npm view tradingcards
```

Expected: Shows the published package info.

---

### Task 19: Final verification — full build check

- [ ] **Step 1: Run Generator build**

```bash
cd ~/Tradingcards
npm run build --workspace=apps/generator
```

Expected: Build succeeds.

- [ ] **Step 2: Run package build**

```bash
npm run build --workspace=packages/react
```

Expected: Build succeeds.

- [ ] **Step 3: Type check everything**

```bash
cd ~/Tradingcards/apps/generator && npx tsc --noEmit
cd ~/Tradingcards/packages/react && npx tsc --noEmit
```

Expected: No errors in either workspace.

- [ ] **Step 4: Commit any remaining changes (if any)**

```bash
cd ~/Tradingcards
git status
```

If there are uncommitted changes:

```bash
git add -A
git commit -m "chore: final verification — all builds pass"
```
