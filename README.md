# Tradingcards

Monorepo for **Tradingcards** — a trading card system with an admin Generator and a reusable React component published on npm.

## Structure

```
Tradingcards/
├── apps/generator/     ← Admin webapp (create & manage card options)
├── packages/react/     ← npm package "tradingcards"
└── supabase/           ← Database migrations & seed data
```

## Generator

Admin dashboard to manage themes, specialties, and descriptions. Protected by Supabase Auth.

```bash
npm run dev --workspace=apps/generator
```

## npm Package (`tradingcards`)

[![npm](https://img.shields.io/npm/v/tradingcards)](https://www.npmjs.com/package/tradingcards)

Reusable React component for rendering trading cards in any project. Fetches theme data from Supabase.

### Install

```bash
npm install tradingcards @supabase/supabase-js react react-dom
```

### Setup

Wrap your app with the provider:

```tsx
import { TradingcardsProvider } from 'tradingcards'
import 'tradingcards/style.css'

function App() {
  return (
    <TradingcardsProvider
      supabaseUrl="https://your-project.supabase.co"
      supabaseAnonKey="your-anon-key"
    >
      <MyApp />
    </TradingcardsProvider>
  )
}
```

### Render a card

```tsx
import { Tradingcards } from 'tradingcards'

<Tradingcards
  name="Pieter"
  image="/assets/pieter.jpg"
  theme="ocean-blue"
  specialties={["Frontend", "Design"]}
  description="Breekt prod op vrijdagmiddag"
/>
```

### Fetch available options

Use the hooks to get the options managed in the Generator:

```tsx
import { useThemes, useSpecialties, useDescriptions } from 'tradingcards'

function CardBuilder() {
  const { themes, loading: tLoading } = useThemes()
  const { specialties, loading: sLoading } = useSpecialties()
  const { descriptions, loading: dLoading } = useDescriptions()

  if (tLoading || sLoading || dLoading) return <p>Loading...</p>

  // themes: [{ slug, name, rarity, from, to }, ...]
  // specialties: [{ id, name }, ...]
  // descriptions: [{ id, text }, ...]
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `string` | yes | Player name |
| `image` | `string` | yes | Image URL |
| `theme` | `string` | yes | Theme slug (e.g. `"ocean-blue"`) |
| `specialties` | `string[]` | yes | Specialty labels |
| `description` | `string` | yes | Card description |
| `className` | `string` | no | Additional CSS class |

## Tech Stack

- React 19, TypeScript, Vite 8
- Supabase (Postgres + Auth)
- npm workspaces
- CSS Modules (Generator) / Global CSS with `tc-` prefix (package)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev --workspace=apps/generator` | Start Generator dev server |
| `npm run build --workspace=apps/generator` | Build Generator for production |
| `npm run build --workspace=packages/react` | Build npm package |
