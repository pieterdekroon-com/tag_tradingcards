# Tradecade Generator Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vite + React webapp that lets users configure and export digital TAG trading cards as JSON.

**Architecture:** Single-page app with side-by-side layout — form on the left, live card preview on the right. All state managed via React useState in App. No backend, no routing. tag.space-inspired dark theme with Syne font and grain texture.

**Tech Stack:** Vite, React 18, TypeScript, CSS Modules, Google Fonts (Syne)

**Spec:** `docs/superpowers/specs/2026-03-13-tradecade-generator-design.md`

---

## Chunk 1: Project Scaffolding & Global Styles

### Task 1: Scaffold Vite + React project

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`

- [ ] **Step 1: Create Vite project**

```bash
cd ~/Tradecade
npm create vite@latest . -- --template react-ts
```

Select: Overwrite existing files if prompted (only `docs/` exists).

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

- [ ] **Step 3: Verify it runs**

```bash
npm run dev
```

Expected: Dev server starts on localhost, default Vite React page loads.

- [ ] **Step 4: Clean up boilerplate**

Remove default Vite content:
- Delete `src/App.css`, `src/assets/` folder
- Clear `src/App.tsx` to just export an empty `<div>App</div>`
- Clear `src/index.css` to empty

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React TypeScript project"
```

---

### Task 2: Global styles & theme

**Files:**
- Create: `src/index.css`
- Modify: `index.html` (add Syne font link)

- [ ] **Step 1: Add Syne font to index.html**

Add to `<head>` in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet">
```

Also set `<title>Tradecade Generator</title>`.

- [ ] **Step 2: Write global CSS with tag.space theme**

Write `src/index.css`:

```css
:root {
  --bg-deep: #0a0a0a;
  --bg-surface: #141414;
  --bg-elevated: #1e1e1e;
  --text-primary: #f0ece2;
  --text-muted: #8a8575;
  --text-dim: #4a4740;
  --border: #2a2a2a;
  --accent: #f0ece2;
  --font-display: 'Syne', sans-serif;
  --font-body: system-ui, -apple-system, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', monospace;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  height: 100%;
  background: var(--bg-deep);
  color: var(--text-primary);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

/* Grain texture overlay */
#root::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}
```

- [ ] **Step 3: Verify theme loads**

```bash
npm run dev
```

Expected: Dark background, grain overlay barely visible, no default Vite styles.

- [ ] **Step 4: Commit**

```bash
git add src/index.css index.html
git commit -m "feat: add global dark theme with Syne font and grain texture"
```

---

### Task 3: Types and background data

**Files:**
- Create: `src/types.ts`, `src/backgrounds.ts`

- [ ] **Step 1: Write the CardData type**

Write `src/types.ts`:

```typescript
export interface CardData {
  id: string;
  name: string;
  image: string;
  specialties: string[];
  level: number;
  description: string;
  background: string;
}

export interface Background {
  id: string;
  name: string;
  from: string;
  to: string;
}
```

- [ ] **Step 2: Write background presets**

Write `src/backgrounds.ts`:

```typescript
import { Background } from './types';

export const backgrounds: Background[] = [
  { id: 'ocean-blue', name: 'Ocean Blue', from: '#0f3460', to: '#16213e' },
  { id: 'crimson-fire', name: 'Crimson Fire', from: '#e94560', to: '#c23152' },
  { id: 'forest-green', name: 'Forest Green', from: '#2d6a4f', to: '#1b4332' },
  { id: 'royal-purple', name: 'Royal Purple', from: '#7b2cbf', to: '#5a189a' },
  { id: 'sunset-gold', name: 'Sunset Gold', from: '#f77f00', to: '#e36414' },
  { id: 'midnight-black', name: 'Midnight Black', from: '#2d3436', to: '#000000' },
  { id: 'arctic-frost', name: 'Arctic Frost', from: '#74b9ff', to: '#0984e3' },
  { id: 'neon-pink', name: 'Neon Pink', from: '#fd79a8', to: '#e84393' },
];
```

- [ ] **Step 3: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/backgrounds.ts
git commit -m "feat: add CardData types and background presets"
```

---

## Chunk 2: Sub-Components

### Task 4: StarRating component

**Files:**
- Create: `src/components/StarRating.tsx`, `src/components/StarRating.module.css`

- [ ] **Step 1: Write StarRating component**

Write `src/components/StarRating.tsx`:

```tsx
import styles from './StarRating.module.css';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.star} ${star <= value ? styles.filled : ''}`}
          onClick={() => onChange(star)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write StarRating styles**

Write `src/components/StarRating.module.css`:

```css
.stars {
  display: flex;
  gap: 4px;
}

.star {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-dim);
  transition: color 0.15s ease;
  padding: 2px;
}

.star:hover {
  color: var(--text-muted);
}

.filled {
  color: var(--text-primary);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/StarRating.tsx src/components/StarRating.module.css
git commit -m "feat: add StarRating component"
```

---

### Task 5: TagInput component

**Files:**
- Create: `src/components/TagInput.tsx`, `src/components/TagInput.module.css`

- [ ] **Step 1: Write TagInput component**

Write `src/components/TagInput.tsx`:

```tsx
import { useState, KeyboardEvent } from 'react';
import styles from './TagInput.module.css';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ tags, onChange, placeholder = 'Type and press Enter' }: TagInputProps) {
  const [input, setInput] = useState('');

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = input.trim();
      if (value && !tags.includes(value)) {
        onChange([...tags, value]);
      }
      setInput('');
    }
    if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <div className={styles.container}>
      <div className={styles.tags}>
        {tags.map((tag, i) => (
          <span key={tag} className={styles.tag}>
            {tag}
            <button type="button" className={styles.remove} onClick={() => removeTag(i)}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className={styles.input}
      />
    </div>
  );
}
```

- [ ] **Step 2: Write TagInput styles**

Write `src/components/TagInput.module.css`:

```css
.container {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  transition: border-color 0.15s ease;
}

.container:focus-within {
  border-color: var(--text-dim);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.remove {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  line-height: 1;
}

.remove:hover {
  color: var(--text-primary);
}

.input {
  background: none;
  border: none;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  outline: none;
  flex: 1;
  min-width: 100px;
}

.input::placeholder {
  color: var(--text-dim);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TagInput.tsx src/components/TagInput.module.css
git commit -m "feat: add TagInput component for specialties"
```

---

### Task 6: ImageUpload component

**Files:**
- Create: `src/components/ImageUpload.tsx`, `src/components/ImageUpload.module.css`

- [ ] **Step 1: Write ImageUpload component**

Write `src/components/ImageUpload.tsx`:

```tsx
import { useRef, DragEvent, useState } from 'react';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  image: string;
  onChange: (dataUrl: string) => void;
}

export function ImageUpload({ image, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  return (
    <div
      className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${image ? styles.hasImage : ''}`}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
    >
      {image ? (
        <img src={image} alt="Card" className={styles.preview} />
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.icon}>↑</span>
          <span className={styles.text}>Drop image or click to upload</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className={styles.fileInput}
      />
    </div>
  );
}
```

- [ ] **Step 2: Write ImageUpload styles**

Write `src/components/ImageUpload.module.css`:

```css
.dropzone {
  background: var(--bg-deep);
  border: 2px dashed var(--border);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  transition: border-color 0.15s ease, background 0.15s ease;
  overflow: hidden;
}

.dropzone:hover,
.dragging {
  border-color: var(--text-dim);
  background: var(--bg-elevated);
}

.hasImage {
  border-style: solid;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-dim);
}

.icon {
  font-size: 24px;
}

.text {
  font-family: var(--font-mono);
  font-size: 12px;
}

.preview {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.fileInput {
  display: none;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ImageUpload.tsx src/components/ImageUpload.module.css
git commit -m "feat: add ImageUpload component with drag and drop"
```

---

### Task 7: BackgroundPicker component

**Files:**
- Create: `src/components/BackgroundPicker.tsx`, `src/components/BackgroundPicker.module.css`

- [ ] **Step 1: Write BackgroundPicker component**

Write `src/components/BackgroundPicker.tsx`:

```tsx
import { backgrounds } from '../backgrounds';
import styles from './BackgroundPicker.module.css';

interface BackgroundPickerProps {
  selected: string;
  onChange: (id: string) => void;
}

export function BackgroundPicker({ selected, onChange }: BackgroundPickerProps) {
  return (
    <div className={styles.grid}>
      {backgrounds.map((bg) => (
        <button
          key={bg.id}
          type="button"
          className={`${styles.swatch} ${selected === bg.id ? styles.selected : ''}`}
          style={{ background: `linear-gradient(135deg, ${bg.from}, ${bg.to})` }}
          onClick={() => onChange(bg.id)}
          title={bg.name}
          aria-label={bg.name}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write BackgroundPicker styles**

Write `src/components/BackgroundPicker.module.css`:

```css
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.swatch:hover {
  transform: scale(1.1);
  border-color: var(--text-dim);
}

.selected {
  border-color: var(--text-primary);
  transform: scale(1.1);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/BackgroundPicker.tsx src/components/BackgroundPicker.module.css
git commit -m "feat: add BackgroundPicker component"
```

---

## Chunk 3: Main Components & Export

### Task 8: CardPreview component

**Files:**
- Create: `src/components/CardPreview.tsx`, `src/components/CardPreview.module.css`

- [ ] **Step 1: Write CardPreview component**

Write `src/components/CardPreview.tsx`:

```tsx
import { CardData } from '../types';
import { backgrounds } from '../backgrounds';
import styles from './CardPreview.module.css';

interface CardPreviewProps {
  card: CardData;
}

export function CardPreview({ card }: CardPreviewProps) {
  const bg = backgrounds.find((b) => b.id === card.background) ?? backgrounds[0];
  const gradient = `linear-gradient(135deg, ${bg.from}, ${bg.to})`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card} style={{ background: gradient }}>
        <div className={styles.inner}>
          <div className={styles.brand}>TAG</div>

          <div className={styles.imageFrame}>
            {card.image ? (
              <img src={card.image} alt={card.name} className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>📷</span>
              </div>
            )}
          </div>

          <div className={styles.name}>{card.name || 'PLAYER NAME'}</div>

          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={s <= card.level ? styles.starFilled : styles.starEmpty}>
                ★
              </span>
            ))}
          </div>

          {card.specialties.length > 0 && (
            <div className={styles.specialties}>
              {card.specialties.map((spec) => (
                <span key={spec} className={styles.badge}>{spec}</span>
              ))}
            </div>
          )}

          {card.description && (
            <div className={styles.description}>{card.description}</div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write CardPreview styles**

Write `src/components/CardPreview.module.css`:

```css
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.card {
  width: 300px;
  border-radius: 16px;
  padding: 3px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
}

.inner {
  background: rgba(10, 10, 10, 0.85);
  border-radius: 14px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.brand {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 6px;
  color: var(--text-primary);
}

.imageFrame {
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-deep);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.imagePlaceholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  opacity: 0.3;
}

.name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  text-align: center;
  letter-spacing: 1px;
}

.stars {
  display: flex;
  gap: 2px;
  font-size: 16px;
}

.starFilled {
  color: var(--text-primary);
}

.starEmpty {
  color: var(--text-dim);
}

.specialties {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.badge {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(240, 236, 226, 0.1);
  color: var(--text-primary);
}

.description {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.5;
  max-width: 240px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CardPreview.tsx src/components/CardPreview.module.css
git commit -m "feat: add CardPreview component with tag.space styling"
```

---

### Task 9: Export utility

**Files:**
- Create: `src/utils/export.ts`

- [ ] **Step 1: Write export utility**

Write `src/utils/export.ts`:

```typescript
import { CardData } from '../types';

export function exportCardAsJson(card: CardData) {
  const slug = card.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'card';
  const json = JSON.stringify(card, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `tradecade-${slug}.json`;
  a.click();

  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/export.ts
git commit -m "feat: add JSON export utility"
```

---

### Task 10: CardForm component

**Files:**
- Create: `src/components/CardForm.tsx`, `src/components/CardForm.module.css`

- [ ] **Step 1: Write CardForm component**

Write `src/components/CardForm.tsx`:

```tsx
import { CardData } from '../types';
import { ImageUpload } from './ImageUpload';
import { TagInput } from './TagInput';
import { StarRating } from './StarRating';
import { BackgroundPicker } from './BackgroundPicker';
import { exportCardAsJson } from '../utils/export';
import styles from './CardForm.module.css';

interface CardFormProps {
  card: CardData;
  onChange: (card: CardData) => void;
}

export function CardForm({ card, onChange }: CardFormProps) {
  function update(fields: Partial<CardData>) {
    onChange({ ...card, ...fields });
  }

  return (
    <div className={styles.form}>
      <h1 className={styles.title}>TRADECADE</h1>
      <p className={styles.subtitle}>Card Generator</p>

      <label className={styles.label}>NAME</label>
      <input
        type="text"
        value={card.name}
        onChange={(e) => update({ name: e.target.value })}
        placeholder="Enter player name"
        className={styles.input}
      />

      <label className={styles.label}>IMAGE</label>
      <ImageUpload image={card.image} onChange={(image) => update({ image })} />

      <label className={styles.label}>SPECIALTIES</label>
      <TagInput tags={card.specialties} onChange={(specialties) => update({ specialties })} />

      <label className={styles.label}>LEVEL</label>
      <StarRating value={card.level} onChange={(level) => update({ level })} />

      <label className={styles.label}>DESCRIPTION</label>
      <textarea
        value={card.description}
        onChange={(e) => update({ description: e.target.value })}
        placeholder="Short bio..."
        rows={3}
        className={styles.textarea}
      />

      <label className={styles.label}>BACKGROUND</label>
      <BackgroundPicker selected={card.background} onChange={(background) => update({ background })} />

      <button
        type="button"
        className={styles.exportBtn}
        onClick={() => exportCardAsJson(card)}
      >
        ↓ EXPORT JSON
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Write CardForm styles**

Write `src/components/CardForm.module.css`:

```css
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 40px 32px;
  overflow-y: auto;
  height: 100%;
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
  margin-bottom: 16px;
}

.label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 2px;
  margin-top: 8px;
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

.textarea {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 12px;
  outline: none;
  resize: vertical;
  transition: border-color 0.15s ease;
}

.textarea:focus {
  border-color: var(--text-dim);
}

.textarea::placeholder {
  color: var(--text-dim);
}

.exportBtn {
  margin-top: 20px;
  background: var(--text-primary);
  color: var(--bg-deep);
  border: none;
  border-radius: 6px;
  padding: 14px;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.exportBtn:hover {
  opacity: 0.85;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CardForm.tsx src/components/CardForm.module.css
git commit -m "feat: add CardForm component with all inputs"
```

---

### Task 11: Wire up App with state

**Files:**
- Modify: `src/App.tsx`
- Create: `src/App.module.css`

- [ ] **Step 1: Write App component with state**

Write `src/App.tsx`:

```tsx
import { useState } from 'react';
import { CardData } from './types';
import { CardForm } from './components/CardForm';
import { CardPreview } from './components/CardPreview';
import styles from './App.module.css';

const initialCard: CardData = {
  id: crypto.randomUUID(),
  name: '',
  image: '',
  specialties: [],
  level: 0,
  description: '',
  background: 'ocean-blue',
};

function App() {
  const [card, setCard] = useState<CardData>(initialCard);

  return (
    <div className={styles.layout}>
      <div className={styles.formPanel}>
        <CardForm card={card} onChange={setCard} />
      </div>
      <div className={styles.previewPanel}>
        <CardPreview card={card} />
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Write App layout styles**

Write `src/App.module.css`:

```css
.layout {
  display: flex;
  height: 100vh;
}

.formPanel {
  width: 420px;
  min-width: 420px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
}

.previewPanel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-deep);
}
```

- [ ] **Step 3: Verify the full app works**

```bash
npm run dev
```

Expected: Side-by-side layout. Form on the left with all inputs. Live card preview on the right. Typing in name updates card. Uploading image shows it. Tags can be added/removed. Stars are clickable. Background swatches change the card gradient. Export downloads JSON.

- [ ] **Step 4: Run type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.module.css
git commit -m "feat: wire up App with state and side-by-side layout"
```

---

### Task 12: Final verification & build

- [ ] **Step 1: Test production build**

```bash
npm run build
```

Expected: Build succeeds, output in `dist/`.

- [ ] **Step 2: Preview production build**

```bash
npm run preview
```

Expected: App works identically to dev mode.

- [ ] **Step 3: Add .gitignore entries**

Ensure `.gitignore` includes:
```
node_modules
dist
.superpowers
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: add gitignore and verify production build"
```
