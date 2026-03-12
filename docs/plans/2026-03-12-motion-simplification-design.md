# Motion System Simplification

**Date:** 2026-03-12
**Approach:** Surgical Prune (keep runtime, rewrite inspector and types)

## Problem

The motion inspector has become overwhelming. 55+ motion fields on `ComponentStyleConfig`, three parallel motion architectures (flat fields, timeline schema, overlay presets), and an inspector panel that leads with abstract concepts (Purpose, Affects, Authoring Mode) that have no visible effect in preview. The primary authoring surface ("Simple Controls") is buried and labeled as "Compatibility controls."

## Goals

- Inspector layout: Entry / Hover / Tap tabs as top-level navigation
- Remove all abstract/metadata sections (Purpose, Affects, Authoring Mode, Timeline)
- Shared transition with per-trigger override toggle
- Consolidate overlay presets (body+text -> single preset per overlay)
- Stagger controls only for list-kind components, nested in Entry tab
- Add real scroll scrubber to stage toolbar
- Animated checkboxes instead of toggle switches for boolean controls

## Design Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Transition per trigger | Shared default + per-trigger override toggle | Covers 90% simply, 10% with one extra click |
| Overlay presets | Consolidate body+text to single preset | Reduce 11 fields to 6, simpler mental model |
| Stagger visibility | Only for list-kind components, in Entry tab | No visible effect for solo components |
| Scroll preview | Real scrubber with continuous interpolation | Current "lock to end state" is misleading |
| Boolean controls | Animated checkbox | Cleaner than generic toggle for on/off options |
| Approach | Surgical prune | Runtime works fine; types and inspector are the problem |

## Inspector Layout

```
MotionInspectorSection (root)
+-- TriggerTabBar           Entry | Hover | Tap
+-- EntryTabContent          presets, enable toggles, transforms, shared transition, stagger (conditional)
+-- HoverTabContent          presets, enable toggle, transforms, transition (shared or override), Advanced Hover
+-- TapTabContent            presets, enable toggle, transforms, transition (shared or override)
+-- ScrollSection            collapsible, below tabs, independent of active trigger tab
+-- OverlayPresetSection     only for overlay component kinds, single preset dropdown
```

### Per-Tab Contents

| Tab | Presets | Enable toggles | Transforms | Transition | Extra |
|-----|---------|---------------|------------|------------|-------|
| Entry | Entry presets (fade-in, scale-in, slide-up, etc.) | Entry on/off, Exit on/off | From/To opacity, X, Y, scale, rotate, filter | Shared (always) | Stagger (list-kind only) |
| Hover | Interaction presets (hover-lift, hover-nudge, etc.) | Hover on/off | Scale, X, Y, rotate, opacity | Shared or Override | Advanced Hover (tilt/glare/spotlight) |
| Tap | Interaction presets (tap-scale, button-press, etc.) | Tap on/off | Scale, X, Y, rotate, opacity | Shared or Override | -- |

### Sections Removed

- Authoring Mode (Simple vs Timeline)
- Purpose (feedback/transition/attention/hierarchy/ambient)
- Affects (this element/children/siblings/whole group)
- Advanced Timeline (toggle, add-trigger buttons, step list, step editor)
- Global Easing shortcut section
- "Simple Controls" / "Compatibility controls" wrapper

## Type Changes

### Fields Removed (11)

```
// Timeline/schema -- DELETE
motionAuthoringMode
motionCategory
motionRelationshipScope
motionTimelineEnabled
motionTimelineSteps
motionGroupScope

// Overlay preset consolidation -- DELETE (replaced by single field each)
tooltipTextMotionPresetId
dialogTextMotionPresetId
popoverTextMotionPresetId
tabsTextMotionPresetId     (keep tabsBodyMotionPresetId, rename to tabsMotionPresetId)
tabsTextMotionPresetId
```

### Fields Added (2)

```
motionHoverTransitionOverride: boolean   // false = use shared transition
motionTapTransitionOverride: boolean     // false = use shared transition
```

### Overlay Preset Rename (no net change, just cleaner names)

```
tooltipBodyMotionPresetId  -> tooltipMotionPresetId
dialogBodyMotionPresetId   -> dialogMotionPresetId
popoverBodyMotionPresetId  -> popoverMotionPresetId
dropdownBodyMotionPresetId -> dropdownMotionPresetId
drawerBodyMotionPresetId   -> drawerMotionPresetId
inputAutocompleteBodyMotionPresetId -> inputAutocompleteMotionPresetId
tabsBodyMotionPresetId     -> tabsMotionPresetId
```

### Types Removed

```
MotionAuthoringMode
MotionCategory
MotionRelationshipScope
MotionSchemaFields (from motion-schema.ts)
```

**Net: -9 fields on ComponentStyleConfig**

## Runtime Changes (motion.tsx)

- Delete import of `buildLegacyMotionTimeline` from `motion-schema.ts`
- Move the 5 step builder functions (entry/hover/tap/exit/scroll) into `motion.tsx` as private helpers
- `getMotionTimeline()` calls the builders directly instead of going through the schema bridge
- `buildHoverStep` / `buildTapStep` check `motionHoverTransitionOverride` / `motionTapTransitionOverride` to decide whether to read from per-trigger or shared transition fields
- Delete `resolveRelationshipScope()` -- stagger works via `motionStaggerEnabled` + `motionGroupStrategy` directly
- Everything else untouched: `compileMotionStep`, `buildTriggerTimeline`, `compileMotionConfig`, `buildPreviewMotionProps`, `renderWithMotionControls`, `renderStaggeredChildren`, `AdvancedHoverWrapper`

## Scroll Scrubber

### Store State

- `motionScrollProgress: number` (0-1) added to UI chrome state (alongside `motionPreviewKey`)
- `setScrollProgress(value: number)` action

### UI

When `motionPreviewMode === 'scrub'`, a horizontal slider appears below the stage toolbar chips spanning the stage width. Left = `motionScrollStart`, right = `motionScrollEnd`.

### Runtime

In `buildPreviewMotionProps`, when mode is `'scrub'`:
- Create a `MotionValue` from `motionScrollProgress`
- Use `useTransform` to interpolate scroll-triggered properties between `from` and `to` values
- Component animates continuously as the scrubber is dragged

Replaces current behavior of locking to end state with duration 0.

## Constants & Defaults Cleanup

### normalizeStyleConfig

- Delete ~14 lines of transition mirroring (hover/tap fields from shared)
- Add migration pass:
  1. If `motionTimelineSteps` has entries, extract first entry/hover/tap step values back to flat fields, then clear steps
  2. If hover/tap transition fields differ from shared, set `motionHoverTransitionOverride: true` / `motionTapTransitionOverride: true`
  3. Copy old `*BodyMotionPresetId` to new `*MotionPresetId` fields

### DEFAULT_STYLE

- Remove defaults for deleted fields
- Add: `motionHoverTransitionOverride: false`, `motionTapTransitionOverride: false`
- Rename overlay preset defaults to consolidated names

## Files Deleted

- `src/components/ui/ui-studio/motion-schema.ts` (entire file, ~290 lines)

## Files Modified

- `src/components/ui/ui-studio.types.ts` -- type removals, field removals/additions, overlay renames
- `src/components/ui/motion/MotionInspectorSection.tsx` -- full rewrite (~2100 -> ~800 lines)
- `src/components/ui/ui-studio/motion.tsx` -- absorb step builders, override logic, scroll scrubber support
- `src/components/ui/ui-studio/constants.ts` -- migration logic, default cleanup
- `src/components/ui/ui-studio/store.ts` -- add `motionScrollProgress`, `setScrollProgress`
- `src/components/ui/UIStudioPage.tsx` -- scroll scrubber slider in stage toolbar

## Files Untouched

- All 21 component preview renderers
- `src/components/ui/ui-studio/export/code-generators.ts` (reads same flat fields)
- `src/components/ui/ui-studio/inspector/inspector-registry.ts`
- `src/components/ui/ui-studio/utilities.tsx`
- `MOTION_COMPONENT_PRESETS` array in constants.ts

## Migration & Backward Compatibility

Old saved configs load through `normalizeStyleConfig` which silently migrates:
- Timeline steps extracted to flat fields
- Per-trigger transition differences detected and override flags set
- Overlay presets consolidated
- Dead fields ignored (persist in JSON harmlessly, never read)

No breaking changes to saved data.
