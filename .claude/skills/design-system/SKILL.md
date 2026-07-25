---
name: design-system
description: Use when writing any UI component, adding styles, or picking colors — enforces semantic design tokens from the prototype and shadcn component patterns. Triggers on: "component", "style", "color", "UI", "button", "card", "badge", "shadcn", "tokens", "design system".
---

All UI in this project must use **semantic CSS custom properties** (defined in `app/globals.css`) instead of raw hex values, and **shadcn/ui components** instead of raw HTML elements styled inline.

Paths are relative to the project root (`/Users/contractor5/Desktop/Lot_Agent/`).

---

## Semantic Token Reference

These are extracted directly from the prototype (`Prototype.html`) and the existing components. Every hex value used in the codebase maps to exactly one token below.

### Brand (Primary Blue)

| Token | Value | Role |
|---|---|---|
| `--brand` | `#1e3a8a` | Interactive elements: buttons, links, active states, icons |
| `--brand-surface` | `#eef3fb` | Brand-tinted backgrounds: badges, callout panels |
| `--brand-border` | `#d8e2f4` | Borders on brand-surface containers |
| `--brand-mid` | `#c9d6ef` | Slightly stronger brand border |
| `--brand-light` | `#dbe4f5` | Very light brand fill |
| `--brand-muted` | `#c9d1da` | Desaturated brand (inactive tabs, faded states) |

### Foreground / Text

| Token | Value | Role |
|---|---|---|
| `--fg` | `#18181b` | Default body text |
| `--fg-2` | `#27272a` | Slightly softer body text (data values, labels) |
| `--fg-3` | `#3f3f46` | Section headers, secondary labels |
| `--fg-muted` | `#52525b` | Supporting / descriptive text |
| `--fg-subtle` | `#71717a` | Meta text, timestamps, helper text |
| `--fg-faint` | `#a1a1aa` | Caps labels, icons at rest, placeholder |
| `--fg-mid` | `#8a8a94` | Dimmer secondary text (e.g. hint text inside dark bars) |
| `--fg-disabled` | `#c4c4cc` | Disabled controls, dismiss icons |

### Borders & Dividers

| Token | Value | Role |
|---|---|---|
| `--border` | `#e4e4e7` | Default card/input borders |
| `--border-light` | `#f0f0f1` | Inner dividers inside panels |
| `--divider` | `#d4d4d8` | Thin separators, dot bullets |

### Surfaces / Backgrounds

| Token | Value | Role |
|---|---|---|
| `--bg` | `#ffffff` | Page/modal white |
| `--surface-card` | `#fafafa` | Card backgrounds |
| `--surface` | `#f4f4f5` | App shell background |
| `--surface-2` | `#f6f6f7` | Alternate row / hover fill |

### Semantic States

| Token | Value | Role |
|---|---|---|
| `--success` | `#1e8a5b` | Success text, icons |
| `--success-surface` | `#eaf6ef` | Success badge / panel bg |
| `--success-border` | `#bfe3cf` | Success border |
| `--warning` | `#d4a72c` | Warning text, icons |
| `--warning-dark` | `#a8801a` | Warning dark text (on light bg) |
| `--warning-surface` | `#fffbeb` | Warning badge / panel bg |
| `--warning-border` | `#f3e3a3` | Warning border |
| `--destructive` | `#e21d15` | Error text, destructive actions |
| `--destructive-surface` | `#fbedea` | Error badge / panel bg |
| `--destructive-border` | `#f0c8bd` | Error border |
| `--destructive-dark` | `#b4533a` | Error dark text |

### Shadows

| Token | Value | Role |
|---|---|---|
| `--shadow-sm` | `0 1px 4px rgba(0,0,0,.12)` | Subtle card lift |
| `--shadow-md` | `0 4px 18px rgba(0,0,0,.18)` | Dropdowns, popovers |
| `--shadow-lg` | `0 10px 34px rgba(0,0,0,.25)` | Modals, floating bars |
| `--shadow-brand` | `0 2px 10px rgba(30,58,138,.25)` | Primary CTA buttons |

---

## globals.css Token Block

Add this block to `app/globals.css` (after the existing rules):

```css
:root {
  /* brand */
  --brand:           #1e3a8a;
  --brand-surface:   #eef3fb;
  --brand-border:    #d8e2f4;
  --brand-mid:       #c9d6ef;
  --brand-light:     #dbe4f5;
  --brand-muted:     #c9d1da;

  /* foreground */
  --fg:              #18181b;
  --fg-2:            #27272a;
  --fg-3:            #3f3f46;
  --fg-muted:        #52525b;
  --fg-subtle:       #71717a;
  --fg-faint:        #a1a1aa;
  --fg-mid:          #8a8a94;
  --fg-disabled:     #c4c4cc;

  /* borders */
  --border:          #e4e4e7;
  --border-light:    #f0f0f1;
  --divider:         #d4d4d8;

  /* surfaces */
  --bg:              #ffffff;
  --surface-card:    #fafafa;
  --surface:         #f4f4f5;
  --surface-2:       #f6f6f7;

  /* states */
  --success:         #1e8a5b;
  --success-surface: #eaf6ef;
  --success-border:  #bfe3cf;

  --warning:         #d4a72c;
  --warning-dark:    #a8801a;
  --warning-surface: #fffbeb;
  --warning-border:  #f3e3a3;

  --destructive:     #e21d15;
  --destructive-surface: #fbedea;
  --destructive-border:  #f0c8bd;
  --destructive-dark:    #b4533a;

  /* shadows */
  --shadow-sm:    0 1px 4px rgba(0,0,0,.12);
  --shadow-md:    0 4px 18px rgba(0,0,0,.18);
  --shadow-lg:    0 10px 34px rgba(0,0,0,.25);
  --shadow-brand: 0 2px 10px rgba(30,58,138,.25);
}
```

---

## shadcn Setup

shadcn is not yet installed. Run this once from the project root to bootstrap it:

```bash
pnpm dlx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Slate** (we override everything via CSS variables anyway)
- CSS variables: **Yes**

After init, replace the generated `--primary` / `--background` / etc. variables in `app/globals.css` with references to our tokens:

```css
/* shadcn variable bridge — maps shadcn internals to our tokens */
:root {
  --background: var(--bg);
  --foreground: var(--fg);
  --card: var(--surface-card);
  --card-foreground: var(--fg);
  --primary: var(--brand);
  --primary-foreground: #ffffff;
  --secondary: var(--surface);
  --secondary-foreground: var(--fg-muted);
  --muted: var(--surface);
  --muted-foreground: var(--fg-subtle);
  --accent: var(--brand-surface);
  --accent-foreground: var(--brand);
  --destructive: var(--destructive);
  --destructive-foreground: #ffffff;
  --border: var(--border);
  --input: var(--border);
  --ring: var(--brand);
  --radius: 0.625rem;
}
```

Add shadcn components as needed:

```bash
pnpm dlx shadcn@latest add button card badge input label select
```

---

## Component Authoring Rules

### Rule 1 — No raw hex values in components

Every color must come from a CSS custom property. The only exception is `#ffffff` / `#000000` when a token doesn't exist for a specific use.

```tsx
// WRONG
<button style={{ background: '#1e3a8a', color: '#fff' }}>

// RIGHT — use CSS token
<button style={{ background: 'var(--brand)', color: '#fff' }}>
```

### Rule 2 — Use shadcn components for interactive elements

Prefer `<Button>`, `<Card>`, `<Badge>`, `<Input>`, `<Select>` from `@/components/ui/*` over raw `<button>`, `<div>`, `<input>`.

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Primary CTA
<Button>Get Started</Button>

// Ghost/secondary
<Button variant="ghost" size="sm">Edit</Button>

// State badge
<Badge className="bg-[var(--success-surface)] text-[var(--success)] border-[var(--success-border)]">
  Active
</Badge>
```

### Rule 3 — Use Tailwind arbitrary values for one-off token usage

When a shadcn component doesn't exist for a layout element, use Tailwind with arbitrary CSS variable values:

```tsx
// Card panel
<div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-[14px] p-6">

// Muted label
<span className="text-[var(--fg-faint)] text-xs font-bold uppercase tracking-wide">
  YOUR BRIEF
</span>
```

### Rule 4 — Replace parseInlineStyle gradually

Existing components use `parseInlineStyle(...)`. When editing a component, convert the styles you touch to Tailwind/token classes. Do not convert entire files in one PR — only the lines you're already changing.

### Rule 5 — Shadow tokens over raw rgba

```tsx
// WRONG
style={{ boxShadow: '0 18px 50px rgba(0,0,0,.18)' }}

// RIGHT
style={{ boxShadow: 'var(--shadow-md)' }}
```

---

## Token Validation

Run this to find components still using raw hex values:

```bash
grep -rn '#[0-9a-fA-F]\{6\}\|#[0-9a-fA-F]\{3\}' app/_components/ app/page.tsx | grep -v '\.png\|\.svg\|fill=\|stroke=' | head -30
```

The goal is zero results. When you add a new token value, add it to the `:root` block in `globals.css` first, then reference it.
