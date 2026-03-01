# UI Studio Design System

Extracted from codebase. Last updated: 2026-02-27.

---

## Spacing

Base unit: **4px**

| Token | Value | Tailwind |
|-------|-------|---------|
| 1 | 4px | `p-1`, `gap-1` |
| 2 | 8px | `p-2`, `gap-2` ← **default gap** |
| 3 | 12px | `px-3` ← **default input/button h-pad** |
| 4 | 16px | `px-4` ← **default button h-pad (lg)** |
| 6 | 24px | `px-6`, `py-6` ← **section/card padding** |
| 8 | 32px | `p-8` |

Off-grid values to eliminate: `p-[3px]`, `p-1.5`, `0.8rem`, `0.5rem 0 0.8rem`, `pl-[110px]`

---

## Border Radius

Base: **7px** (`--radius: 0.4375rem`)
All other radii derived from base.

| Name | Value | Calc | Tailwind | Use |
|------|-------|------|---------|-----|
| `--radius-sm` | 4px | `calc(var(--radius) - 3px)` | `rounded-sm` | Badges, chips, inner elements |
| `--radius` | **7px** | — | `rounded-md` | **Default — buttons, inputs, cards, dropdowns** |
| `--radius-lg` | 10px | `calc(var(--radius) + 3px)` | `rounded-lg` | Tooltips, popovers |
| `--radius-xl` | 12px | `calc(var(--radius) + 5px)` | `rounded-xl` | Cards, modals, large surfaces |
| `--radius-2xl` | 16px | `calc(var(--radius) + 9px)` | `rounded-2xl` | Panels, bottom sheets |
| `--radius-full` | 9999px | — | `rounded-full` | Avatars, pill badges only |

> Rule: No `rounded-3xl`, `rounded-4xl`, or arbitrary radius values. Off-grid values to eliminate: `rounded-2xl` on toolbars.

---

## Typography

Scale — Tailwind only, no arbitrary `text-[Xpx]`:

| Token | Size | Tailwind | Use |
|-------|------|---------|-----|
| xs | 12px | `text-xs` | Metadata, labels, captions |
| sm | 14px | `text-sm` | **Default body, inputs, items** |
| base | 16px | `text-base` | Readable body copy |
| lg | 18px | `text-lg` | Section headings |
| xl | 20px | `text-xl` | Page titles |

Off-grid values to eliminate: `text-[10px]`, `text-[11px]`, `text-[12px]` → use `text-xs` (12px).

**Weight:**
- `font-medium` — buttons, labels, interactive elements
- `font-semibold` — card titles, dialog headings
- Default (400) — body text

**Tracking:** Use only `tracking-tight`, `tracking-normal`, `tracking-wide`. No arbitrary `tracking-[0.12em]`.

---

## Color Tokens

Semantic CSS variables only. No hardcoded hex or arbitrary opacity.

| Role | Token | Use |
|------|-------|-----|
| Page background | `bg-background` | Root surface |
| Card surface | `bg-card` | Elevated panels |
| Popover/dropdown | `bg-popover` | Floating surfaces |
| Primary action | `bg-primary` / `text-primary-foreground` | CTA buttons |
| Secondary | `bg-secondary` / `text-secondary-foreground` | Supporting actions |
| Muted | `bg-muted` / `text-muted-foreground` | Disabled, metadata |
| Accent hover | `bg-accent` / `text-accent-foreground` | Hover states |
| Destructive | `bg-destructive` / `text-white` | Delete, error |
| Border | `border-border` | Default borders |
| Input border | `border-input` | Form fields |
| Focus ring | `ring-ring/50` | Focus state |

Off-grid values to eliminate: `text-[#d9e5f7]`, `bg-white/10`, `border-white/15`, `text-fg`, `text-muted-fg`.

---

## Depth / Shadow System

Mixed approach: borders for structure, shadows for elevation.

| Level | Shadow | Use |
|-------|--------|-----|
| Flat | `border` only | Inline elements, inputs |
| Raised | `shadow-xs` | Outline buttons, toggles |
| Elevated | `shadow-sm` | Cards, action bars |
| Floating | `shadow-md` | Dropdowns, popovers |
| Overlay | `shadow-lg` | Dialogs, full overlays |

> Rule: Dropdown and dropdown-submenu both use `shadow-md` (no escalation to `shadow-lg`).

---

## Component Patterns

### Button

```
Height:   h-9 (36px default), h-8 (sm), h-10 (lg), h-6 (xs)
H-Pad:    px-4 (default), px-3 (sm), px-6 (lg), px-2 (xs)
Radius:   rounded-md (7px) — all variants
Gap:      gap-2 (default), gap-1.5 (sm), gap-1 (xs)
Focus:    focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
```

### Card

```
Radius:   rounded-xl (12px)
Border:   border
Shadow:   shadow-sm
Padding:  py-6 px-6 (outer), gap-6 between sections
Header gap: gap-2
```

### Input / Select

```
Height:   h-9 (36px)
Padding:  px-3 py-1
Radius:   rounded-md (7px)
Border:   border-input
Focus:    focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
Invalid:  aria-invalid:ring-destructive/20 aria-invalid:border-destructive
```

### Dropdown / Popover

```
Radius:   rounded-md (7px) for items, rounded-lg (10px) for container
Shadow:   shadow-md
Padding:  p-1 container, px-2 py-1.5 items
```

### Badge

```
Radius:   rounded-sm (4px) or rounded-full (pill variant only)
Padding:  px-2 py-0.5
Font:     text-xs font-medium
```

### Tooltip

```
Radius:   rounded-lg (10px)
Padding:  px-2.5 py-1
Font:     text-sm/6
```

---

## Focus State

Universal pattern — apply to ALL interactive elements:

```
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
```

Variants:
- Destructive context: `focus-visible:ring-destructive/20`
- Use `focus-visible:` always (never bare `focus:` — accessibility)

Off-grid to fix: `dialog.tsx` close button using `focus-visible:ring-1 focus-visible:ring-primary`.

---

## Heights (Interactive Elements)

| Size | Height | Tailwind |
|------|--------|---------|
| xs | 24px | `h-6` / `size-6` |
| sm | 32px | `h-8` / `size-8` |
| **default** | **36px** | **`h-9` / `size-9`** |
| lg | 40px | `h-10` / `size-10` |

---

## Token Priority

When styling, resolve in this order:
1. Component pattern (above)
2. Spacing scale (4px grid)
3. Semantic color token
4. Tailwind default scale

Never use: arbitrary pixel values (`[Xpx]`), hardcoded hex, bare `focus:` pseudo-class.
