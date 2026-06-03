# Skill: Frontend Design — Nido PWA

This skill guides creation of distinctive, production-grade frontend interfaces
that avoid generic "AI slop" aesthetics. Apply it when building or refining any
screen in the Nido app.

---

## Design Thinking

Before making any changes, commit to a BOLD aesthetic direction for Nido:

- **Purpose:** Personal daily companion app for one woman. Warm, intimate, trustworthy.
- **Tone:** Soft/organic meets refined minimalism. Think a cozy journal, not a dashboard.
- **Differentiation:** When she opens it, it should feel like HER space, not another app.

---

## Design System

### Typography
- **Headings / page titles:** `font-display` → Playfair Display (serif). Use for `h1` and
  major section labels. Loaded via `next/font` in `layout.tsx` as `--font-heading`.
- **Body / UI:** DM Sans. Loaded via `next/font` as `--font-body`. Applied on `html {}` in
  `globals.css`.
- **Labels:** `text-[9.5px] font-bold uppercase tracking-widest text-nido-mist` — consistent
  micro-label style for all section headers, card labels, and stat captions.

### Color Palette — CSS Variables
All tokens defined in `globals.css` under `@theme {}`. Dark mode overrides in `.dark {}`.

| Token                    | Light           | Dark            | Usage                          |
|--------------------------|-----------------|-----------------|--------------------------------|
| `--color-nido-rose`      | `#dc6b84`       | —               | Primary accent, buttons        |
| `--color-nido-rose-deep` | `#c24f6a`       | —               | Hover states, dark text        |
| `--color-nido-rose-pale` | `#f9dde4`       | `#3a2530`       | Card borders, chip bg, nav pill|
| `--color-nido-blush`     | `#fdf0f3`       | `#1a1015`       | Page background                |
| `--color-nido-lavender`  | `#b8a9d9`       | —               | Agenda accent                  |
| `--color-nido-lavender-deep` | `#9a8cbf`  | —               | Lavender text                  |
| `--color-nido-lavender-pale` | `#ede9f5`  | `#2d2540`       | Lavender chip bg               |
| `--color-nido-sage`      | `#6bab7e`       | —               | Habits/health accent           |
| `--color-nido-sage-deep` | `#4e8a5f`       | —               | Sage text, balance positive    |
| `--color-nido-sage-pale` | `#dff0e5`       | `#1e3028`       | Sage chip bg                   |
| `--color-nido-amber`     | `#d4945a`       | —               | Notes/ideas accent             |
| `--color-nido-amber-pale`| `#fdebd4`       | `#3a2518`       | Amber chip bg                  |
| `--color-nido-ink`       | `#2c1a22`       | `#f0e8ec`       | Primary text                   |
| `--color-nido-mauve`     | `#8a6a75`       | `#c4a8b2`       | Secondary text                 |
| `--color-nido-mist`      | `#c4a8b2`       | `#7a6a72`       | Muted text, placeholders, nav  |
| `--color-nido-cream`     | `#fefafb`       | `#251820`       | Card background                |
| `--color-nido-linen`     | `#f5ecef`       | `#1f1318`       | Hover bg, light fills          |

### Module Color Assignments
- **Finanzas:** rose (expenses), sage (income/positive balance), lavender (wallet/balance)
- **Agenda:** rose (today tasks), lavender (pending), sage (events)
- **Hábitos:** sage (completed), amber (streak flame)
- **Notas:** rose (personal), lavender (trabajo), amber (ideas), sage (salud)
- **Humor:** sage (bien), lavender (regular), mist (neutro), amber (bajo), rose (difícil)

---

## Motion

### Animations defined in `globals.css`
```css
.animate-fade-up  /* nido-fade-up: opacity 0→1 + translateY 10px→0, 0.35s ease-out */
.animate-scale-in /* nido-scale-in: opacity 0→1 + scale 0.95→1, 0.22s ease-out */
```

### Usage patterns
- **Page entry:** wrap the root `<div>` in `className="animate-fade-up"`
- **List items:** add `animate-fade-up` + `style={{ animationDelay: `${i * 50}ms` }}`
  for staggered entrance. Use 40–60ms steps.
- **Modals / forms:** use `animate-scale-in` on the form/overlay container
- **All interactive elements:** `transition-all duration-200` minimum;
  cards use `hover:scale-[1.02] active:scale-[0.98]`
- **Buttons:** `hover:scale` NOT needed — they have shadow lift on hover via `.btn-primary`

---

## Spatial Composition

### Cards
`.card` = cream bg + rose-tinted shadow + 1.25rem radius + `border-nido-rose-pale`

**Left accent strip pattern** — for list items (transactions, tasks, habits, history):
```tsx
<div className="card flex items-stretch overflow-hidden">
  <span className="w-1.5 shrink-0 bg-nido-rose" />   {/* colored strip */}
  <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
    {/* content */}
  </div>
</div>
```
This is the standard list-item pattern. DO NOT use colored dot indicators.

### Section headers
Consistent micro-label style across all modules:
```tsx
<div className="flex items-center gap-2 mb-2.5">
  <span className="block w-0.5 h-4 rounded-full bg-nido-rose" />
  <h2 className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mauve">
    Sección
  </h2>
</div>
```

### Bottom nav
- Active item: `bg-nido-rose-pale` pill behind the icon+label
- Active icon: `text-nido-rose`, slightly larger, heavier stroke
- Inactive: `text-nido-mist`, lighter stroke
- Nav bg: `rgba(254,250,251,0.93)` + `backdrop-blur-xl`

### Page background
Body has a dual radial gradient (rose at top-left, lavender at bottom-right) over the
`nido-blush` base. This is defined in `globals.css` on `body` — do not override it per-page.

---

## Hard Rules

- **NEVER** use Inter, Roboto, Arial or `system-ui` as the primary font
- **NEVER** use default Tailwind blue as an accent color anywhere
- **NEVER** use `text-rose-500` or other raw Tailwind color names — always use nido tokens
- **NEVER** use a colored dot as a list item indicator — use the left strip pattern
- Every list renders items with **staggered `animate-fade-up`** — never a static list
- Cards always use `overflow-hidden` when containing a left strip
- Mobile-first always: design at 390px width, never assume wide viewport
- Every screen must feel cohesive: same palette, same radius, same motion language
- Emoji sizes in pickers: `text-[1.75rem]` minimum — never small emojis in UI
- Form entries (modals/overlays): always use `animate-scale-in`
- Stat labels: always `text-[9px] font-bold uppercase tracking-widest text-nido-mist`
- Page `h1`: always `font-display text-2xl text-nido-ink` (Playfair Display)

---

## File Locations

| File | Purpose |
|------|---------|
| `app/globals.css` | Design tokens, base styles, animations, card/input/button |
| `app/layout.tsx` | Font loading (DM Sans + Playfair Display via next/font) |
| `components/BottomNav.tsx` | Navigation — pill active state |
| `app/(protected)/layout.tsx` | Protected layout wrapper |
