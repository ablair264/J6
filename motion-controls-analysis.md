# Motion Controls Inspector — UX/UI Analysis & Enhancement Plan

## 1. Current State Analysis

### What exists today

The animation controls live inside the **Design** tab's inspector sidebar as a collapsible `<MotionInspectorSection>` at the very bottom, beneath Dimensions → Appearance → Component Overrides → Effects. It's a nested accordion that most users will never scroll to, let alone discover.

#### Current layout structure
```
Right Sidebar (360–430px)
├── Tab bar:  Design | Export
├── Design tab (ScrollArea)
│   ├── [Component name + rename]
│   ├── ▸ DIMENSIONS  (Ruler icon)
│   ├── ▸ APPEARANCE  (Swatches icon)
│   ├── ▸ COMPONENT OVERRIDES  (Config icon)  — conditional
│   ├── ▸ EFFECTS  (Sparkles icon)  — defaultOpen: false
│   └── ▸ ANIMATION  (Forward icon) — defaultOpen: false ← buried here
└── Export tab (code panels)
```

#### What the Animation section currently provides
- **Trigger tabs** — Hover / Tap / (Overlay for overlay components)
- **Per-trigger controls**: enable toggle, quick presets (text-only chips), transform sliders (Scale, Y offset, X offset), and a `MotionTransitionCard` with Tween/Spring toggle
- **Spring curve visualiser** — an SVG spring simulation (32px tall)
- **Overlay tab** — From/To opacity, X/Y offset sliders, plus the same transition card
- All controls use `MotionParamRow` (label + `<input type="range">` + mono value)

---

### Current UX Problems

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| 1 | **Discoverability** | Critical | Animation is the *last* collapsed section in a long scroll. Users designing motion-first won't find it. |
| 2 | **No visual preview of presets** | High | Quick presets are plain text chips ("Hover Lift", "Card Hover"). Users can't preview what they'll get before committing. |
| 3 | **No inline animation preview** | High | There's no way to see the configured animation play without switching to the main canvas. The loop between "tweak slider → check canvas" is too slow. |
| 4 | **X/Y offsets are separate sliders** | Medium | For spatial motion, two independent sliders don't convey direction intuitively. The mockup's XY pad is significantly better for this. |
| 5 | **Shared transition state across tabs** | Medium–High | Hover, Tap, and Overlay all write to the same `motionTransitionType`, `motionStiffness`, `motionDamping`, etc. Changing the spring on hover also changes it on tap. This makes per-trigger tuning impossible. |
| 6 | **No Entry animation tab for non-overlays** | Medium | Only overlay components get `initial → animate` entry animations. Regular buttons/cards can't have mount-entry animations from this panel. |
| 7 | **No code output** | Medium | The mockup shows live-generated `motion.div` code. The current implementation has no motion code preview — users must go to the Export tab and mentally parse the full component code. |
| 8 | **No rotation control on hover/tap** | Low | The state fields `motionHoverRotate` and `motionTapRotate` exist but no UI controls expose them. |
| 9 | **Range input styling** | Low | Native `<input type="range">` with a class but no visible filled-track indicator. Hard to see current position at a glance compared to the mockup's styled sliders. |
| 10 | **No opacity control for hover/tap** | Low | `motionHoverOpacity` and `motionTapOpacity` exist in state but aren't exposed in the UI. |

---

## 2. Mockup Analysis — What It Gets Right

The HTML mockup (two-panel layout) demonstrates several excellent UX decisions:

### Strong patterns to adopt

1. **Animated preset thumbnails** — Each preset card shows a looping CSS animation of its effect. This is dramatically better than text labels. Users can visually scan and compare presets in ~2 seconds.

2. **XY position pad** — The crosshair widget for setting X/Y offset simultaneously is more spatial and intuitive than two separate sliders. It maps perfectly to how motion designers think about direction.

3. **From → To dual layout** — Opacity and Scale both show "From" and "To" side by side in a 2-column grid. This makes the initial→animate relationship immediately clear rather than hiding it behind cryptic labels.

4. **Trigger-first organisation** — Controls grouped by trigger (Entry / Hover / Tap / Loop) rather than by property type. Matches the mental model: "what happens on hover?" not "where is the scale control?"

5. **Spring curve visualiser** — Already partially implemented in the codebase but the mockup gives it more visual weight (taller, more legible).

6. **Live preview strip** — A small inline preview at the bottom of the controls panel with a "Replay" button. This eliminates the canvas round-trip for quick iteration.

7. **Inline code generation** — Shows the `motion.div` props object updating in real time as you adjust parameters. Developers can copy directly.

### What the mockup gets wrong / can be improved

- **Two-panel layout won't fit the existing sidebar** — The mockup is designed as a full-page layout (left preset library + right controls). The real product has a single 360–430px sidebar. We need to adapt the concepts to fit within the sidebar width.
- **Too many presets visible at once** — The 3-column preset grid works at full width but would be cramped in 360px. Consider 2 columns or a horizontal scroll strip.
- **No overlay/panel presets in trigger tabs** — The mockup only has Entry/Hover/Tap/Loop but the real product also needs Overlay.
- **Static mockup** — The HTML/CSS is purely visual. None of the controls actually update state or produce real output.

---

## 3. Proposed Enhancement: "Motion FX" Tab

### The core idea

Add a dedicated **Motion FX** tab alongside Design and Export in the right sidebar header. When selected, it replaces the entire inspector content with a purpose-built motion editing experience.

```
Right Sidebar (360–430px)
├── Tab bar:  Design | Motion FX | Export     ← NEW tab
├── Design tab    → existing inspector (Dimensions, Appearance, etc.)
├── Motion FX tab → dedicated motion editor   ← NEW content
└── Export tab    → code panels
```

### Why a separate tab instead of improving the collapsible section

1. **Motion needs vertical space** — The XY pad alone needs ~100px, the spring visualiser needs ~40px, the preset strip needs ~70px. Combined with sliders, toggles, and code output, this easily fills 600–800px of scroll. Cramming it below Effects makes the whole Design tab unwieldy.

2. **Different mental mode** — Design (colours, sizing, typography) and motion (timing, easing, triggers) are different tasks. Designers typically focus on one at a time. A dedicated tab signals "this is a first-class workflow" and mirrors tools like Figma's separate Prototype mode.

3. **Keeps Design tab fast** — The existing Design tab stays lean and focused. No performance overhead from rendering spring simulations or animation previews when you're just tweaking border-radius.

4. **Easier to add features** — A dedicated tab gives room for a preset browser, inline preview, code output, and future features (keyframe editor, scroll-triggered animations) without polluting the Design tab.

---

## 4. Detailed Enhancement Specifications

### 4.1 Motion FX Tab — Layout

```
┌─────────────────────────────────────────┐
│  Design  │  Motion FX  │  Export         │  ← tab bar
├─────────────────────────────────────────┤
│  [Component name]           [Reset All] │
│  Entry animation · Button               │
├─────────────────────────────────────────┤
│  ┌─────────┬────────┬────────┬────────┐ │
│  │  ⬆      │  ✦     │  ◉     │  ⟳    │ │
│  │  Entry  │  Hover │  Tap   │  Loop  │ │
│  └─────────┴────────┴────────┴────────┘ │
├─────────────────────────────────────────┤
│                                         │
│  QUICK PRESETS (horizontal scroll)      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ anim │ │ anim │ │ anim │ │ anim │   │
│  │ Fade │ │Slide↑│ │Scale │ │Elstc │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  TRANSFORM                              │
│  ┌─────────────────────────────────┐    │
│  │         XY Pad (crosshair)      │    │
│  │              ●                  │    │
│  └─────────────────────────────────┘    │
│   X: 0px          Y: 18px              │
│                                         │
│  OPACITY            SCALE               │
│  From [0%]          From [85%]          │
│  To   [100%]        To   [100%]         │
│                                         │
│  Rotate  ────────●────────  0°          │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  TRANSITION          [Tween] [Spring]   │
│  ┌─────────────────────────────────┐    │
│  │ ╭──╮ spring curve visualiser    │    │
│  └─────────────────────────────────┘    │
│  Stiffness ─────────●────  260          │
│  Damping   ──●──────────── 22           │
│  Mass      ──●──────────── 0.8          │
│  Delay     ●────────────── 0s           │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  GENERATED CODE                 [Copy]  │
│  ┌─────────────────────────────────┐    │
│  │ const motionProps = {           │    │
│  │   initial: { opacity: 0, ... }, │    │
│  │   animate: { opacity: 1, ... }, │    │
│  │   transition: { type: 'spring'} │    │
│  │ };                              │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│  LIVE PREVIEW                           │
│  ┌───────────────────────────┐ [Replay] │
│  │      [ Primary action ]   │          │
│  └───────────────────────────┘          │
└─────────────────────────────────────────┘
```

### 4.2 Preset Browser — Animated Thumbnails

**Current**: Plain text chips ("Hover Lift", "Card Hover").

**Proposed**: Horizontal scroll strip of small cards (80×70px each) with looping CSS-only animations showing the effect. Tapping selects and applies the preset values.

Implementation approach:
- Each preset card renders a small `<div>` element that loops the corresponding CSS animation
- Use `@keyframes` defined in a `<style>` block or inline styles
- Active preset gets an accent border + checkmark overlay
- Cards are contained in an overflow-x scrollable flex container
- 2-column grid as a fallback for the Entry tab which has many presets

Preset categories per trigger:
- **Entry**: Fade In, Slide Up, Slide Down, From Right, From Left, Scale In, Spin In, Elastic Pop
- **Hover**: Lift, Glow, Float, Grow
- **Tap**: Press, Bounce, Squish
- **Loop**: Pulse, Shimmer, Float

### 4.3 XY Position Pad — Implementation Plan

**Component**: `<XYPad />`

```tsx
interface XYPadProps {
  x: number;           // current X offset (px)
  y: number;           // current Y offset (px)
  xMin?: number;       // default -120
  xMax?: number;       // default 120
  yMin?: number;       // default -120
  yMax?: number;       // default 120
  onXChange: (x: number) => void;
  onYChange: (y: number) => void;
}
```

**Rendering**:
- Container: `w-full h-[100px]` with `bg-[#13161b]`, `border border-white/7`, `rounded-lg`, `cursor-crosshair`, `relative overflow-hidden`
- Crosshair lines: Two `<div>` elements positioned at 50% for X and Y axes (1px, `bg-white/7`)
- Handle: 14×14px circle, `bg-[#2dd4bf]`, `rounded-full`, with a glow ring (`box-shadow: 0 0 0 4px rgba(45,212,191,0.15)`)
- Axis labels: 8px mono text in corners — "X axis →" bottom-right, "↓ Y" top-left
- Value chips below: Two inline chips showing `X: 0px` and `Y: 18px` with mono font

**Interaction**:
- `onPointerDown` on the pad: calculate normalised position, start drag
- `onPointerMove` (document-level): update handle position + emit values
- `onPointerUp`: stop drag
- Clamp handle within 5–95% of pad bounds
- Convert normalised position to pixel offset: `value = (normalised - 0.5) * (max - min)`
- Round to integers for clean output

**Where it appears**:
- **Entry tab**: Controls `motionInitialX` and `motionInitialY` (start position offset)
- **Hover tab**: Controls `motionHoverX` and `motionHoverY`
- **Tap tab**: Controls `motionTapX` and `motionTapY`
- On the Hover/Tap tabs, the pad should be smaller (80px height) since the ranges are smaller (±40px)

### 4.4 Inline Animation Preview

**Component**: `<MotionPreviewStrip />`

- Fixed to the bottom of the Motion FX tab (not scrollable)
- Shows the actual selected component rendered with current motion props
- "Replay" button re-triggers the animation by toggling a key
- For hover/tap triggers: the preview should respond to actual hover/tap on the preview element

Implementation:
```tsx
function MotionPreviewStrip({ motionProps, triggerType }) {
  const [key, setKey] = useState(0);
  
  return (
    <div className="border-t border-white/8 bg-[#0d0f12] px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-[#334155] mb-2">
        Live preview
      </p>
      <div className="flex items-center gap-2.5">
        <div className="flex-1 flex items-center justify-center h-[52px] 
                        bg-[#13161b] border border-white/7 rounded-lg overflow-hidden">
          <motion.div key={key} {...motionProps}>
            <div className="px-3 py-1.5 bg-[#22272f] border border-white/10 
                            rounded-md text-[11px] font-medium text-[#e2e8f0]">
              Primary action
            </div>
          </motion.div>
        </div>
        <button onClick={() => setKey(k => k + 1)} 
                className="shrink-0 px-2.5 py-1.5 rounded border border-white/7 
                           text-[10px] text-[#64748b] hover:text-[#e2e8f0]">
          ↺ Replay
        </button>
      </div>
    </div>
  );
}
```

### 4.5 Per-Trigger Transition State

**Current problem**: All trigger tabs share `motionTransitionType`, `motionStiffness`, `motionDamping`, `motionMass`, `motionEase`, `motionDuration`, `motionDelay`.

**Proposed**: Add separate transition fields for hover and tap:

```ts
// New fields to add to ComponentStyleConfig:
motionHoverTransitionType: MotionTransitionType;  // default 'spring'
motionHoverStiffness: number;                      // default 400
motionHoverDamping: number;                        // default 20
motionHoverDuration: number;                       // default 0.2
motionTapTransitionType: MotionTransitionType;     // default 'spring'
motionTapStiffness: number;                        // default 600
motionTapDamping: number;                          // default 25
motionTapDuration: number;                         // default 0.15
```

The existing fields (`motionTransitionType`, `motionStiffness`, etc.) become the **entry/overlay** transition, and the new fields cover hover and tap independently. This lets designers use a slow spring for entry but a snappy spring for hover.

### 4.6 Entry Animation for All Components

**Current**: Only overlay components see the "Overlay" tab with `initial → animate`.

**Proposed**: Add an "Entry" tab for *all* component types (the first tab position). This controls mount/viewport-entry animations. The existing overlay tab becomes a specialisation of entry for overlay surfaces.

### 4.7 Generated Code Panel

Show a small code block at the bottom of each trigger tab's controls that updates live:

```tsx
// Entry tab
const motionProps = {
  initial: { opacity: 0, y: 18, scale: 0.85 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: 'spring', stiffness: 260, damping: 22 },
};

// Hover tab
const motionProps = {
  whileHover: { scale: 1.04, y: -2 },
  transition: { type: 'spring', stiffness: 400, damping: 20 },
};
```

Include syntax highlighting using the existing colour tokens (`tok-k`, `tok-s`, `tok-n`, `tok-p`).

### 4.8 Visual Slider Enhancements

**Current**: Native `<input type="range">` with a styled thumb but no filled track.

**Proposed**: Add a filled track indicator using a CSS pseudo-element or linear-gradient background that shows the "filled" portion in the accent colour. This is a standard pattern in design tools and makes the current value visually scannable.

```css
input[type=range] {
  background: linear-gradient(
    to right,
    var(--accent) 0%, var(--accent) var(--fill-percent),
    var(--surface-3) var(--fill-percent), var(--surface-3) 100%
  );
}
```

Set `--fill-percent` via inline style from the React component.

### 4.9 Expose Missing Controls

Add UI for already-existing state fields that have no controls:
- **Hover rotate**: `motionHoverRotate` — Add a rotation slider to the Hover tab's Transform section
- **Tap rotate**: `motionTapRotate` — Add to the Tap tab
- **Hover opacity**: `motionHoverOpacity` — Add to the Hover tab
- **Tap opacity**: `motionTapOpacity` — Add to the Tap tab

---

## 5. Implementation Priority & Phases

### Phase 1 — Foundation (High impact, structural)
1. Add "Motion FX" as third tab in sidebar header (`rightSidebarTab: 'inspector' | 'motion' | 'export'`)
2. Move `MotionInspectorSection` content into the new tab body
3. Add Entry trigger tab for all component types
4. Separate transition state per trigger (hover/tap/entry)

### Phase 2 — XY Pad & Preview (High impact, interactive)
5. Build `<XYPad />` component
6. Replace X/Y slider pairs with XY pad on all trigger tabs
7. Build `<MotionPreviewStrip />` pinned to bottom of Motion FX tab
8. Wire preview to current motion props with replay functionality

### Phase 3 — Presets & Polish (Medium impact, delight)
9. Build animated preset thumbnail cards
10. Add horizontal scroll preset strip per trigger tab
11. Add inline code generation panel
12. Style slider tracks with filled indicators
13. Expose hidden controls (rotate, opacity for hover/tap)

### Phase 4 — Future (Lower priority)
14. Keyframe timeline editor
15. Scroll-triggered animation controls
16. Stagger/orchestration for lists
17. Preset sharing/export

---

## 6. Technical Considerations

### Extracting from the monolith

The current `UIStudioPage.tsx` is ~298KB / ~6,200 lines. The motion controls should be extracted into their own module:

```
src/components/ui/motion/
├── MotionFXTab.tsx           — Main tab container
├── XYPad.tsx                 — Position pad widget
├── MotionPreviewStrip.tsx    — Inline preview
├── MotionPresetStrip.tsx     — Animated preset cards
├── MotionTransitionCard.tsx  — Spring/tween controls
├── MotionParamRow.tsx        — Individual slider row
├── SpringCurve.tsx           — SVG spring visualiser
├── MotionCodeOutput.tsx      — Generated code panel
└── motion-presets.ts         — Preset definitions & types
```

### State architecture

The new per-trigger transition fields require updating:
- `ComponentStyleConfig` type definition
- Default values in the initial config
- All preset application functions
- The `buildMotionComponentSnippet()` export function
- Any persistence/serialisation logic

### Performance

- Spring curve SVG recalculation should be throttled/debounced during rapid slider dragging
- XY pad should use `requestAnimationFrame` for smooth drag updates
- Preset thumbnail animations are CSS-only (no JS overhead)
- The code output panel should use `useMemo` keyed on the relevant motion state values

---

## 7. Summary of All Proposed Changes

| Change | Type | Impact |
|--------|------|--------|
| Add "Motion FX" tab to sidebar | Layout | Discoverability ↑↑↑ |
| Entry trigger tab for all components | Feature | Capability ↑↑ |
| XY position pad | Widget | Spatial editing ↑↑ |
| Animated preset thumbnails | UX | Preset discoverability ↑↑ |
| Inline animation preview + replay | UX | Iteration speed ↑↑↑ |
| Per-trigger transition state | Architecture | Flexibility ↑↑ |
| Inline code generation | Feature | Developer UX ↑↑ |
| Filled slider tracks | Visual | Scannability ↑ |
| Expose rotate/opacity for hover/tap | Feature | Completeness ↑ |
| Extract to separate module | Architecture | Maintainability ↑↑ |
