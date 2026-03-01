# UI Studio OSS

UI Studio OSS is a self-hostable component playground that feels closer to a lightweight Figma-style inspector than a typical docs demo page.

It lets you spin up real component instances, tune visual and motion properties in a side inspector, and export working code snippets immediately.

## Why this exists

Most component galleries are static examples. UI Studio OSS focuses on:

- Fast style experimentation on live components
- Interaction and motion tuning in context
- Copy/export workflows for implementation handoff

## Included components

- Badge
- Button
- Checkbox
- Dialog
- Dropdown
- Popover
- Label
- Input
- Tabs
- Tooltip
- Slider

## Core capabilities

- Per-component playground pages via an accordion index
- Multiple instances per component
- Right-side live inspector (fill, stroke, radius, typography, effects, states)
- Motion presets and custom hover/tap/entry motion controls
- Generated snippet output per instance + export all
- Local persistence with `localStorage` per component page

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS v4
- React Aria Components + Radix primitives
- Motion (Framer Motion runtime package)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3011](http://localhost:3011).

## Build

```bash
npm run build
npm run preview
```

## Netlify + Neon Token Sets

This repo now supports per-user token-set storage in Neon via Netlify Functions.

### 1. Run the Neon migration

Execute:

- `db/neon/001_user_token_sets.sql`
- `db/neon/002_user_token_set_sizes.sql` (for existing installs)

You can run it in the Neon SQL editor for project `misty-mountain-32290731`.

### 2. Set Netlify environment variables

- `NEON_DATABASE_URL` (required)
- `NEON_PROJECT_ID` (optional, defaults to `misty-mountain-32290731`)

### 3. Deploy with Netlify

- `netlify.toml` is configured for:
  - Functions directory: `netlify/functions`
  - API rewrite: `/api/*` -> `/.netlify/functions/:splat`
  - SPA fallback: `/*` -> `/index.html`

### 4. User identity behavior

- Preferred: Netlify Identity (function uses `clientContext.user.sub`)
- Fallback: `x-ui-studio-user-id` header, exposed in the UI as a `User key` field for local/dev and non-Identity setups.

### 5. Designer token workflow

- Select token set from toolbar.
- Create `New Set` (clones active set).
- Edit color + size tokens in `Manage Tokens` panel.
- Size tokens (`sm/md/lg`) apply to inspector size presets (height required, width optional).
- Save/Delete user sets to/from Neon.
- Session JSON export/import now includes token sets and active token set.

## Project structure

- `src/components/ui/UIStudioPage.tsx`: page shell, inspector, preview rendering
- `src/components/ui/ui-studio.types.ts`: shared studio types
- `src/components/ui/*`: component primitives used by the playground

## Next OSS-ready improvements

- Split large inspector sections into independent components
- Move presets/constants into dedicated modules
- Add import/export for full studio sessions (JSON)
# J6
