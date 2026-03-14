# Tradecade Generator — Design Spec

## Overview
A Vite + React (TypeScript) webapp for creating and configuring digital TAG trading cards. The generator outputs JSON data for import into a separate internal portal where cards are displayed as unlockable collectibles.

## Tech Stack
- **Vite + React** with TypeScript
- **CSS Modules** for component styling
- **Google Font: Syne** for headings/display text (matches tag.space branding)
- No UI library — custom styling only
- No backend — fully client-side

## Visual Style (tag.space inspired)
- **Dark theme** — deep charcoal background, warm off-white text
- **Font: Syne** — bold, large for headings and card branding
- **Grain texture** — subtle SVG noise overlay for tactile feel
- **Minimal UI** — lots of breathing room, clean lines, muted secondary tones
- **Monospace accents** — for labels, metadata, small UI text
- **Subtle borders** — thin, low-contrast dividers
- **Hover transitions** — smooth state changes on interactive elements

## Layout
Side-by-side split view:
- **Left panel:** Configuration form
- **Right panel:** Live card preview (classic trading card style)

## Card Data Model

```json
{
  "id": "uuid-v4",
  "name": "Player Name",
  "image": "base64 data-url",
  "specialties": ["Frontend", "Design"],
  "level": 3,
  "description": "Short bio text",
  "background": "ocean-blue"
}
```

## Components

### App
Root layout component. Renders the split view with `CardForm` on the left and `CardPreview` on the right.

### CardForm
Configuration form with the following inputs:
- **Name** — text input
- **Image upload** — drag & drop zone or click to browse. Converts to base64 data-url.
- **Specialties** — tag-style input. Type a specialty and press Enter to add. Click to remove.
- **Level** — clickable star rating (1–5 stars)
- **Description** — textarea for a short bio
- **Background picker** — grid of predefined gradient swatches (see Backgrounds section)
- **Export JSON** — button that triggers download of the card data as a `.json` file

### CardPreview
Live-updating preview of the card in classic trading card style:
- "TAG" branding at the top
- Card border with selected background gradient
- Image area (shows uploaded image or placeholder)
- Player name (bold, centered)
- Star rating display
- Specialty tags (pill-shaped badges)
- Description text at the bottom

### BackgroundPicker
Sub-component of CardForm. Displays a grid of circular gradient swatches. Clicking one selects it and updates the card preview. Selected swatch gets a highlight border.

## Predefined Backgrounds

| ID | Name | Gradient |
|----|------|----------|
| `ocean-blue` | Ocean Blue | `#0f3460 → #16213e` |
| `crimson-fire` | Crimson Fire | `#e94560 → #c23152` |
| `forest-green` | Forest Green | `#2d6a4f → #1b4332` |
| `royal-purple` | Royal Purple | `#7b2cbf → #5a189a` |
| `sunset-gold` | Sunset Gold | `#f77f00 → #e36414` |
| `midnight-black` | Midnight Black | `#2d3436 → #000000` |
| `arctic-frost` | Arctic Frost | `#74b9ff → #0984e3` |
| `neon-pink` | Neon Pink | `#fd79a8 → #e84393` |

## Export Format
The "Export JSON" button downloads a `.json` file containing the full card data object. The filename follows the pattern `tradecade-{name}.json` (slugified name). The image is embedded as a base64 data-url string.

## Out of Scope
- Saving/loading multiple cards
- User accounts or authentication
- PNG image export
- Backend or database
- Card animations
- Batch operations
