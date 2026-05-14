# EngajaAI Design System — MASTER

Single source of truth for all pages. Page-specific files in `pages/` override individual tokens only.

## Brand

- Name: EngajaAI (placeholder — owner will update)
- Tagline: "Sua agência de mídia paga, completa." (placeholder)
- Tone: confident, technical, BR-Portuguese, no exclamation spam

## Theme

Single dark theme. Light mode optional later.

## Tokens

### Color (HSL space, CSS variables)

| Token | Value | Use |
|-------|-------|-----|
| `--background` | `240 6% 4%` | Page bg (~`#09090b`) |
| `--foreground` | `0 0% 98%` | Primary text |
| `--card` | `var(--background)` | Card surface (border-only separation) |
| `--card-foreground` | `var(--foreground)` | Card text |
| `--primary` | `40 100% 47%` | CTAs, accents (`#f0a000`) |
| `--primary-foreground` | `0 0% 0%` | Text on primary |
| `--secondary` | `40 100% 30%` | Primary hover/active |
| `--muted` | `0 0% 100% / 0.03` | Subtle surfaces, input bg |
| `--muted-foreground` | `0 0% 67%` | Secondary text (`#ababab`) |
| `--accent` | `0 0% 100% / 0.04` | Hover overlay |
| `--accent-foreground` | `var(--foreground)` | Text on accent |
| `--border` | `0 0% 100% / 0.05` | All borders/dividers |
| `--input` | `var(--border)` | Input borders |
| `--ring` | `var(--primary)` | Focus ring |
| `--destructive` | `0 84% 60%` | Errors, delete |
| `--destructive-foreground` | `0 0% 98%` | Text on destructive |
| `--success` | `142 71% 45%` | Success states (PIX paid) |
| `--radius` | `0.6rem` | All rounded corners |

### Typography

- Font: Geist Sans (body, headings), Geist Mono (prices, codes)
- Base size: 16px / line-height 1.5
- Scale: `text-xs`(12) `text-sm`(14) `text-base`(16) `text-lg`(18) `text-xl`(20) `text-2xl`(24) `text-3xl`(30) `text-4xl`(36) `text-5xl`(48) `text-6xl`(60)
- H1 hero: `text-4xl md:text-5xl lg:text-6xl`, `font-bold`, `tracking-tight`
- H2 section: `text-2xl md:text-3xl`, `font-bold`, `tracking-tight`
- H3 card: `text-base md:text-lg`, `font-semibold`
- Body: `text-sm md:text-base`, `text-muted-foreground` for support copy
- Numerals in prices: `font-mono tabular-nums`

### Spacing & Layout

- Container max-width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Section vertical padding: `py-10 md:py-16`
- Card padding: `p-4 md:p-6`
- Form field gap: `space-y-4`
- Button height: `h-9` (sm), `h-10` (default), `h-11` (lg)
- Grid gaps: products `gap-4 md:gap-6`, categories `gap-3 md:gap-4`

### Radii

- Buttons, inputs, cards, badges: `rounded-[var(--radius)]` (~9.6px)
- Pills (category badges in nav): `rounded-full`
- Icon backgrounds (round avatars): `rounded-full`

### Borders & Effects

- Borders: 1px solid `var(--border)`
- No box-shadows on cards (flat aesthetic)
- Hover lift via overlay: `hover:bg-accent transition-colors duration-150`
- Active scale: `active:scale-[0.98] transition-transform`
- Focus: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none`

### Motion

- Default duration: 150ms
- Hover/state: `transition-colors duration-150`
- Modal/drawer enter: 200ms ease-out, exit 150ms ease-in
- Respect `prefers-reduced-motion` (disable transforms, keep colors)

## Components

### Button variants
- `primary` — amber bg, black text (CTAs)
- `secondary` — `bg-muted` border, foreground text
- `outline` — transparent + border
- `ghost` — no bg, hover bg-accent
- `destructive` — red bg

### Product Card
- Aspect-square image area (placeholder bg-muted for now)
- Title 2-line clamp
- Price block: large `font-mono`, small "À vista no Pix" label, payment icon
- CTA button full-width, `primary` variant

### Header
- Sticky top-0, `backdrop-blur` `bg-background/80` `border-b`
- Left: logo placeholder (text only until owner provides)
- Center: search input (md+), full-width on mobile in a row below
- Right: Support, Login (or account avatar), Cart count badge

### Footer
- `border-t`, 3-column on desktop (brand+legal, links, socials), stacked on mobile
- Smaller text, `text-muted-foreground`

### Checkout (split-screen)
- Left col (60%): payment method selector cards, contact form, terms checkbox, pay CTA
- Right col (40%): order summary, line items, coupon, totals
- Stacks vertically on mobile, summary collapses to expandable section

## Page-specific overrides

See `design-system/pages/` for any deviations. If empty, page uses MASTER as-is.

## Anti-patterns (NEVER do)

- Emojis as icons (use lucide-react)
- Mixing radius values within the same component family
- `text-gray-X on bg-gray-Y` pairs with <4.5:1 contrast
- Decorative animations without meaning
- Inline `style={{ color: '#xxx' }}` — always use tokens
- Hardcoded `bg-black` / `bg-white` — use `bg-background` / `bg-foreground`
- Lifting copy from the source site
