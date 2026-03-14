# Tradingcards — Reusable Package & Supabase Backend Design

## Overview

Transform the Tradecade project into **Tradingcards** — a monorepo containing an admin webapp (Generator) and a public npm package (`tradingcards`). The package exposes a `<Tradingcards />` React component and data hooks, backed by a Supabase database. Other projects install the package, fetch available card options (themes, specialties, descriptions), and render trading cards with their own unlock logic and images.

## Rename

The project is renamed from Tradecade to Tradingcards across all surfaces:

- Project directory: `~/Tradecade` → `~/Tradingcards`
- UI branding: "TRADECADE" → "TRADINGCARDS"
- Package name: `tradingcards`
- HTML title: "Tradingcards Generator"
- Export filenames: `tradingcards-*.json`
- All docs and references

## Architecture

### Monorepo structure (npm workspaces)

```
Tradingcards/
├── package.json              ← Workspace root
├── apps/
│   └── generator/            ← Vite + React admin webapp
│       └── src/
│           ├── components/   ← CardForm, CardPreview, ThemePicker, etc.
│           ├── pages/        ← Dashboard (CRUD) + Preview
│           └── lib/
│               └── supabase.ts  ← Authenticated Supabase client
│
├── packages/
│   └── react/                ← npm package "tradingcards"
│       └── src/
│           ├── Tradingcards.tsx  ← <Tradingcards /> component
│           ├── Provider.tsx      ← <TradingcardsProvider />
│           ├── hooks.ts          ← useThemes, useSpecialties, useDescriptions
│           ├── client.ts         ← Supabase read-only client (anon key)
│           └── types.ts          ← Shared types
│
└── supabase/                 ← Database migrations & seed data
```

### Data flow

1. Admin logs into Generator, manages themes/specialties/descriptions (CRUD)
2. Data is stored in Supabase (Postgres)
3. Consuming projects install `tradingcards` from npm
4. `<Tradingcards />` fetches theme data via Supabase anon key and renders the card
5. Consuming projects control which options are unlocked and provide their own images and names

## Supabase

### Account & project

A new Supabase project is created (free tier). Auth is configured with email/password. A single admin account is created manually via the Supabase dashboard (no signup flow in the Generator).

### Database schema

**themes**

| Column     | Type         | Constraints      | Notes                              |
|------------|--------------|------------------|------------------------------------|
| id         | uuid (PK)    | auto-generated   |                                    |
| slug       | text         | unique, not null | URL-safe identifier, e.g. "ocean-blue" |
| name       | text         | not null         | Display name, e.g. "Ocean Blue"    |
| rarity     | text         | not null         | Common / Rare / Epic / Legendary   |
| from_color | text         | not null         | Gradient start hex, e.g. "#0f3460" |
| to_color   | text         | not null         | Gradient end hex, e.g. "#16213e"   |
| created_at | timestamptz  | auto             |                                    |
| updated_at | timestamptz  | auto             |                                    |

**specialties**

| Column     | Type         | Constraints      | Notes                    |
|------------|--------------|------------------|--------------------------|
| id         | uuid (PK)    | auto-generated   |                          |
| name       | text         | unique, not null | e.g. "Frontend"          |
| created_at | timestamptz  | auto             |                          |
| updated_at | timestamptz  | auto             |                          |

**descriptions**

| Column     | Type         | Constraints      | Notes                              |
|------------|--------------|------------------|------------------------------------|
| id         | uuid (PK)    | auto-generated   |                                    |
| text       | text         | unique, not null | e.g. "Breekt prod op vrijdagmiddag"|
| created_at | timestamptz  | auto             |                                    |
| updated_at | timestamptz  | auto             |                                    |

### Column naming

The database uses `from_color` / `to_color` (since `from` is a reserved word in SQL). The npm package types map these to `from` / `to` for a cleaner consumer API.

### Row Level Security

- `SELECT` on all tables → public (anon key, for the npm package)
- `INSERT / UPDATE / DELETE` on all tables → authenticated users only (the Generator)

## npm Package (`tradingcards`)

### Installation & usage

```tsx
import { Tradingcards, TradingcardsProvider } from 'tradingcards'

// Once in app root — configures Supabase connection
<TradingcardsProvider supabaseUrl="..." supabaseAnonKey="...">
  <App />
</TradingcardsProvider>

// Render a card — theme is a slug, not a UUID
<Tradingcards
  name="Pieter"
  image="/assets/pieter.jpg"
  theme="ocean-blue"
  specialties={["Frontend", "Design"]}
  description="Breekt prod op vrijdagmiddag"
/>
```

### Exports

| Export                      | Purpose                                          |
|-----------------------------|--------------------------------------------------|
| `<Tradingcards />`          | Card renderer component                          |
| `<TradingcardsProvider />`  | Context provider with Supabase config             |
| `useThemes()`               | Hook: fetches available themes from Supabase      |
| `useSpecialties()`          | Hook: fetches available specialties from Supabase |
| `useDescriptions()`         | Hook: fetches available descriptions from Supabase|
| `Theme`                     | TypeScript type                                   |
| `Specialty`                 | TypeScript type                                   |
| `Description`               | TypeScript type                                   |

### Props for `<Tradingcards />`

| Prop         | Type       | Required | Notes                                  |
|--------------|------------|----------|----------------------------------------|
| name         | string     | yes      | Player name                            |
| image        | string     | yes      | Image URL (provided by consumer)       |
| theme        | string     | yes      | Theme slug, e.g. "ocean-blue"          |
| specialties  | string[]   | yes      | Free-form strings displayed as badges  |
| description  | string     | yes      | Free-form string displayed on card     |
| className    | string     | no       | Additional CSS class for outer wrapper |

The component fetches the theme's visual properties (gradient colors, rarity) from Supabase based on the theme **slug**. Rarity determines the card's visual tier (border style, effects).

**Note on specialties and descriptions:** The props accept free-form strings — the component does not validate them against Supabase data. The hooks (`useSpecialties()`, `useDescriptions()`) exist so consumers can fetch the predefined options and build their own selection UI, but the `<Tradingcards />` component renders whatever strings are passed. This keeps the component simple and gives consumers full control.

### Loading & error states

- While fetching theme data: the component renders a skeleton card (gradient placeholder, no content)
- If the theme slug is not found: the component falls back to a default neutral gradient
- If Supabase is unreachable: the component renders with the default fallback gradient and logs a warning to console

### Supabase dependency

`@supabase/supabase-js` is bundled within the package (not a peer dependency). This avoids version conflicts and simplifies installation for consumers who don't otherwise use Supabase.

### Styling

CSS is bundled within the package. No external stylesheet required by the consumer.

### Build

The package is built with Vite in library mode, outputting ESM. TypeScript declarations are included.

## Generator Webapp

### Views

**Login**
- Email + password form
- Authenticates via Supabase Auth
- Single admin account (created manually in Supabase dashboard)

**Dashboard (new)**
- Three sections: Themes, Specialties, Descriptions
- Each section shows a list of existing items
- Per item: edit / delete actions
- "Add new" button per section
- All CRUD operations go directly to Supabase

**Preview (refactored from current editor)**
- The existing CardForm + CardPreview, repurposed as a preview tool
- Fetches themes/specialties/descriptions from Supabase instead of local arrays
- Allows combining options to preview how a card looks
- No save/export — purely visual testing (the JSON export feature is removed)

**Navigation**
- Simple tab navigation at the top (Dashboard / Preview)
- No router library — useState is sufficient for two views

## Out of Scope

- User accounts / multi-user access in the Generator
- Image hosting or storage (consumers provide their own images)
- Locked/unlocked card states in the package (consumers handle this)
- Card animations in the npm package (may be added later)
- Non-React consumers (future consideration)
- Signup flow in the Generator
