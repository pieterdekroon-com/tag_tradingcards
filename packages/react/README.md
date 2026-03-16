# tradingcards

[![npm](https://img.shields.io/npm/v/tradingcards)](https://www.npmjs.com/package/tradingcards)

A React component for rendering trading cards with Supabase-backed themes, specialties, and descriptions. Manage your card data with the [Generator](https://github.com/pieterdekroon-com/tag_tradingcards) admin dashboard, then render cards anywhere with this package.

## Install

```bash
npm install tradingcards @supabase/supabase-js react react-dom
```

## Quick start

Wrap your app with the provider and import the stylesheet:

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

Then render a card:

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

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `string` | yes | Player name displayed on the card |
| `image` | `string` | yes | Image URL |
| `theme` | `string` | yes | Theme slug (e.g. `"ocean-blue"`, `"solar-flare"`) |
| `specialties` | `string[]` | yes | Specialty labels shown on the card |
| `description` | `string` | yes | Card description text |
| `className` | `string` | no | Additional CSS class |

## Hooks

Fetch the available options managed through the Generator:

```tsx
import { useThemes, useSpecialties, useDescriptions } from 'tradingcards'

function CardBuilder() {
  const { themes, loading: tLoading } = useThemes()
  const { specialties, loading: sLoading } = useSpecialties()
  const { descriptions, loading: dLoading } = useDescriptions()

  if (tLoading || sLoading || dLoading) return <p>Loading...</p>

  // themes: [{ slug, name, rarity, from_color, to_color }, ...]
  // specialties: [{ id, name }, ...]
  // descriptions: [{ id, text }, ...]
}
```

| Hook | Returns |
|------|---------|
| `useThemes()` | `{ themes, loading, error }` |
| `useSpecialties()` | `{ specialties, loading, error }` |
| `useDescriptions()` | `{ descriptions, loading, error }` |

## Themes

Cards come with 13 built-in themes across four rarity levels, each with its own gradient and glow effect:

| Rarity | Themes |
|--------|--------|
| Common | Ocean Blue, Forest Green, Midnight Black, Arctic Frost |
| Rare | Crimson Fire, Sunset Gold, Neon Pink |
| Epic | Royal Purple, Aurora, Deep Ocean |
| Legendary | Solar Flare, Void Walker, Abyssal Tide |

Legendary cards include a pulsing animation. You can add custom themes through the Generator dashboard.

## Peer dependencies

- `react` >= 18
- `react-dom` >= 18
- `@supabase/supabase-js` >= 2.0.0

## License

MIT
