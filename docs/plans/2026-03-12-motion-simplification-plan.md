# Motion System Simplification — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplify the motion inspector from an overwhelming wall of abstract concepts to a clean Entry/Hover/Tap tab model, remove the timeline schema layer, deduplicate transition fields, consolidate overlay presets, and add a real scroll scrubber.

**Architecture:** Surgical prune — keep the runtime core (`compileMotionConfig`, `buildPreviewMotionProps`, `renderWithMotionControls`) intact. Rewrite the inspector panel and clean up the types. The timeline schema bridge (`motion-schema.ts`) is deleted entirely, with its step-builder functions absorbed into `motion.tsx`.

**Tech Stack:** React, TypeScript, Zustand (store), Framer Motion (`motion/react`), Radix primitives, Tailwind CSS

**Design doc:** `docs/plans/2026-03-12-motion-simplification-design.md`

---

## Task 1: Type Cleanup — Remove Dead Fields and Types

This is the foundation — everything else depends on clean types.

**Files:**
- Modify: `src/components/ui/ui-studio.types.ts`

**Step 1: Remove dead type aliases**

Delete these type definitions (lines 66-68, 72):

```ts
// DELETE these lines:
export type MotionAuthoringMode = 'simple' | 'timeline';
export type MotionCategory = 'feedback' | 'transition' | 'attention' | 'hierarchy' | 'ambient';
export type MotionRelationshipScope = 'self' | 'children' | 'siblings' | 'group';
```

Also delete `MotionKeyframeValue` (line 74) and `MotionStepValues` (lines 76-84) and `MotionTimelineStep` (lines 86-103) — these are the timeline schema types.

**Step 2: Remove dead fields from `ComponentStyleConfig`**

Delete these fields:

```ts
// Timeline/schema fields — lines ~783-792
motionAuthoringMode: MotionAuthoringMode;
motionCategory: MotionCategory;
motionRelationshipScope: MotionRelationshipScope;
motionPreviewMode: MotionPreviewMode;       // KEEP this one — stage toolbar uses it
motionTimelineEnabled: boolean;
motionTimelineSteps: MotionTimelineStep[];
motionGroupScope: MotionRelationshipScope;
```

To be clear: DELETE `motionAuthoringMode`, `motionCategory`, `motionRelationshipScope`, `motionTimelineEnabled`, `motionTimelineSteps`, `motionGroupScope`. KEEP `motionPreviewMode` — the stage toolbar reads it.

**Step 3: Rename overlay preset fields**

In `ComponentStyleConfig`, rename:

```
tooltipBodyMotionPresetId: string   ->  tooltipMotionPresetId: string
tooltipTextMotionPresetId: string   ->  DELETE
dialogBodyMotionPresetId: string    ->  dialogMotionPresetId: string
dialogTextMotionPresetId: string    ->  DELETE
popoverBodyMotionPresetId: string   ->  popoverMotionPresetId: string
popoverTextMotionPresetId: string   ->  DELETE
dropdownBodyMotionPresetId: string  ->  dropdownMotionPresetId: string
drawerBodyMotionPresetId: string    ->  drawerMotionPresetId: string
inputAutocompleteBodyMotionPresetId: string -> inputAutocompleteMotionPresetId: string
tabsBodyMotionPresetId: string      ->  tabsMotionPresetId: string
tabsTextMotionPresetId: string      ->  DELETE
```

**Step 4: Add override flags**

Add these two new fields to `ComponentStyleConfig`:

```ts
motionHoverTransitionOverride: boolean;
motionTapTransitionOverride: boolean;
```

**Step 5: Run TypeScript check (expect errors)**

Run: `./node_modules/.bin/tsc --noEmit 2>&1 | head -80`

Expected: Many errors — every file that references the removed fields/types will fail. This is expected; we fix them in subsequent tasks. Note the error count for tracking.

**Step 6: Commit**

```bash
git add src/components/ui/ui-studio.types.ts
git commit -m "refactor: remove timeline/schema types and dead motion fields from ComponentStyleConfig"
```

---

## Task 2: Constants & Defaults Cleanup

Update `DEFAULT_STYLE` and `normalizeStyleConfig` to match the new type.

**Files:**
- Modify: `src/components/ui/ui-studio/constants.ts`

**Step 1: Update DEFAULT_STYLE — remove dead defaults**

In `DEFAULT_STYLE` (around lines 951-960), delete:

```ts
motionAuthoringMode: 'simple',
motionCategory: 'transition',
motionRelationshipScope: 'self',
motionTimelineEnabled: false,
motionTimelineSteps: [],
motionGroupScope: 'self',
```

Add in their place:

```ts
motionHoverTransitionOverride: false,
motionTapTransitionOverride: false,
```

**Step 2: Rename overlay preset defaults**

Around lines 599-627 and 760, rename:

```ts
// OLD                                    -> NEW
tooltipBodyMotionPresetId: 'fade-in',     -> tooltipMotionPresetId: 'fade-in',
tooltipTextMotionPresetId: 'fade-in',     -> DELETE
dialogBodyMotionPresetId: 'fade-scale',   -> dialogMotionPresetId: 'fade-scale',
dialogTextMotionPresetId: 'fade-in',      -> DELETE
popoverBodyMotionPresetId: 'fade-scale',  -> popoverMotionPresetId: 'fade-scale',
popoverTextMotionPresetId: 'fade-in',     -> DELETE
dropdownBodyMotionPresetId: 'dropdown-down', -> dropdownMotionPresetId: 'dropdown-down',
inputAutocompleteBodyMotionPresetId: 'dropdown-down', -> inputAutocompleteMotionPresetId: 'dropdown-down',
tabsBodyMotionPresetId: 'fade-in',        -> tabsMotionPresetId: 'fade-in',
tabsTextMotionPresetId: 'fade-in',        -> DELETE
drawerBodyMotionPresetId: 'fade-scale',   -> drawerMotionPresetId: 'fade-scale',
```

(Check exact default values — I listed what the current code has.)

**Step 3: Delete transition mirroring in normalizeStyleConfig**

Delete the entire block at lines 990-1031 that mirrors shared transition fields to hover/tap:

```ts
// DELETE all of this (lines 990-1031):
if (style.motionHoverTransitionType === undefined) { ... }
if (style.motionHoverEase === undefined) { ... }
// ... all 14 lines
if (style.motionTapMass === undefined) { ... }
```

Keep lines 1032-1037 (the `motionHoverEnabled`/`motionTapEnabled` mirroring from `motionComponentEnabled`) — those are still useful.

**Step 4: Add migration logic in normalizeStyleConfig**

After the `const merged = { ...DEFAULT_STYLE, ...(style ?? {}) }` line (~970), add migration logic:

```ts
// ─── Migration: timeline steps → flat fields ─────────────────────
const rawSteps = (style as any)?.motionTimelineSteps as any[] | undefined;
if (rawSteps?.length) {
    for (const step of rawSteps) {
        if (!step?.trigger) continue;
        if (step.trigger === 'entry' && step.to) {
            if (step.to.opacity !== undefined) merged.motionAnimateOpacity = step.to.opacity * 100;
            if (step.from?.opacity !== undefined) merged.motionInitialOpacity = step.from.opacity * 100;
            if (step.from?.x !== undefined) merged.motionInitialX = step.from.x;
            if (step.from?.y !== undefined) merged.motionInitialY = step.from.y;
            if (step.duration !== undefined) merged.motionDuration = step.duration;
            if (step.delay !== undefined) merged.motionDelay = step.delay;
            if (step.transitionType) merged.motionTransitionType = step.transitionType;
            if (step.ease) merged.motionEase = step.ease;
            merged.motionEntryEnabled = true;
        }
        if (step.trigger === 'hover' && step.to) {
            if (step.to.scale !== undefined) merged.motionHoverScale = step.to.scale * 100;
            if (step.to.x !== undefined) merged.motionHoverX = step.to.x;
            if (step.to.y !== undefined) merged.motionHoverY = step.to.y;
            if (step.to.rotate !== undefined) merged.motionHoverRotate = step.to.rotate;
            if (step.to.opacity !== undefined) merged.motionHoverOpacity = step.to.opacity * 100;
            if (step.duration !== undefined) merged.motionHoverDuration = step.duration;
            if (step.transitionType) merged.motionHoverTransitionType = step.transitionType;
            if (step.ease) merged.motionHoverEase = step.ease;
            merged.motionHoverEnabled = true;
        }
        if (step.trigger === 'tap' && step.to) {
            if (step.to.scale !== undefined) merged.motionTapScale = step.to.scale * 100;
            if (step.to.x !== undefined) merged.motionTapX = step.to.x;
            if (step.to.y !== undefined) merged.motionTapY = step.to.y;
            if (step.to.rotate !== undefined) merged.motionTapRotate = step.to.rotate;
            if (step.to.opacity !== undefined) merged.motionTapOpacity = step.to.opacity * 100;
            if (step.duration !== undefined) merged.motionTapDuration = step.duration;
            if (step.transitionType) merged.motionTapTransitionType = step.transitionType;
            if (step.ease) merged.motionTapEase = step.ease;
            merged.motionTapEnabled = true;
        }
    }
}

// ─── Migration: detect per-trigger transition overrides ──────────
if (style) {
    const hasHoverOverride =
        (style.motionHoverTransitionType !== undefined && style.motionHoverTransitionType !== merged.motionTransitionType) ||
        (style.motionHoverEase !== undefined && style.motionHoverEase !== merged.motionEase) ||
        (style.motionHoverDuration !== undefined && style.motionHoverDuration !== merged.motionDuration);
    if (hasHoverOverride) {
        merged.motionHoverTransitionOverride = true;
    }
    const hasTapOverride =
        (style.motionTapTransitionType !== undefined && style.motionTapTransitionType !== merged.motionTransitionType) ||
        (style.motionTapEase !== undefined && style.motionTapEase !== merged.motionEase) ||
        (style.motionTapDuration !== undefined && style.motionTapDuration !== merged.motionDuration);
    if (hasTapOverride) {
        merged.motionTapTransitionOverride = true;
    }
}

// ─── Migration: overlay preset consolidation ─────────────────────
const raw = style as any;
if (raw?.tooltipBodyMotionPresetId && !style?.tooltipMotionPresetId) {
    merged.tooltipMotionPresetId = raw.tooltipBodyMotionPresetId;
}
if (raw?.dialogBodyMotionPresetId && !style?.dialogMotionPresetId) {
    merged.dialogMotionPresetId = raw.dialogBodyMotionPresetId;
}
if (raw?.popoverBodyMotionPresetId && !style?.popoverMotionPresetId) {
    merged.popoverMotionPresetId = raw.popoverBodyMotionPresetId;
}
if (raw?.dropdownBodyMotionPresetId && !style?.dropdownMotionPresetId) {
    merged.dropdownMotionPresetId = raw.dropdownBodyMotionPresetId;
}
if (raw?.drawerBodyMotionPresetId && !style?.drawerMotionPresetId) {
    merged.drawerMotionPresetId = raw.drawerBodyMotionPresetId;
}
if (raw?.inputAutocompleteBodyMotionPresetId && !style?.inputAutocompleteMotionPresetId) {
    merged.inputAutocompleteMotionPresetId = raw.inputAutocompleteBodyMotionPresetId;
}
if (raw?.tabsBodyMotionPresetId && !style?.tabsMotionPresetId) {
    merged.tabsMotionPresetId = raw.tabsBodyMotionPresetId;
}
```

**Step 5: Run TypeScript check**

Run: `./node_modules/.bin/tsc --noEmit 2>&1 | head -80`

Expected: Error count should drop from Task 1. Remaining errors will be in motion.tsx, MotionInspectorSection.tsx, render-preview.tsx, etc.

**Step 6: Commit**

```bash
git add src/components/ui/ui-studio/constants.ts
git commit -m "refactor: clean up motion defaults, remove transition mirroring, add migration logic"
```

---

## Task 3: Delete motion-schema.ts and Absorb Builders into motion.tsx

**Files:**
- Delete: `src/components/ui/ui-studio/motion-schema.ts`
- Modify: `src/components/ui/ui-studio/motion.tsx`

**Step 1: Copy step builders into motion.tsx**

Move the 5 builder functions from `motion-schema.ts` into `motion.tsx` as private helpers, placed above `getMotionTimeline` (before line 155). These are: `buildEntryStep`, `buildHoverStep`, `buildTapStep`, `buildExitStep`, `buildScrollStep`.

Important modifications while moving:
- Remove imports of deleted types (`MotionCategory`, `MotionRelationshipScope`, `MotionSchemaFields`, `MotionTimelineStep` — but keep `MotionTimelineStep` if still needed internally, or inline its shape)
- Since `MotionTimelineStep` is being deleted from the public types, define a local `MotionTimelineStep` interface inside `motion.tsx` (it's only needed internally now):

```ts
// Internal-only timeline step shape (not exported)
interface MotionTimelineStep {
    id: string;
    trigger: MotionTrigger;
    label: string;
    from?: MotionStepValues;
    to?: MotionStepValues;
    duration: number;
    delay: number;
    transitionType: MotionTransitionType;
    ease: MotionEaseOption;
    customBezier?: [number, number, number, number];
    stiffness?: number;
    damping?: number;
    mass?: number;
    repeat?: number;
    repeatDelay?: number;
    at?: number;
}
```

Similarly keep `MotionStepValues` and `MotionKeyframeValue` as internal types in motion.tsx:

```ts
type MotionKeyframeValue = number | string | Array<number | string>;

interface MotionStepValues {
    opacity?: MotionKeyframeValue;
    x?: MotionKeyframeValue;
    y?: MotionKeyframeValue;
    scale?: MotionKeyframeValue;
    rotate?: MotionKeyframeValue;
    filter?: MotionKeyframeValue;
    transformOrigin?: string;
}
```

**Step 2: Add transition override logic to builders**

In `buildHoverStep`, change transition resolution:

```ts
function buildHoverStep(config: ComponentStyleConfig): MotionTimelineStep | null {
    if (!config.motionHoverEnabled) return null;
    // Use shared transition unless override is enabled
    const useOverride = config.motionHoverTransitionOverride;
    return {
        id: 'hover',
        trigger: 'hover',
        label: 'Hover',
        to: {
            scale: config.motionHoverScale / 100,
            x: config.motionHoverX,
            y: config.motionHoverY,
            rotate: config.motionHoverRotate,
            opacity: config.motionHoverOpacity / 100,
        },
        duration: useOverride ? config.motionHoverDuration : config.motionDuration,
        delay: useOverride ? config.motionHoverDelay : config.motionDelay,
        transitionType: useOverride ? config.motionHoverTransitionType : config.motionTransitionType,
        ease: useOverride ? config.motionHoverEase : config.motionEase,
        ...(config.motionCustomBezier ? { customBezier: config.motionCustomBezier } : {}),
        ...((useOverride ? config.motionHoverTransitionType : config.motionTransitionType) === 'spring'
            ? {
                stiffness: useOverride ? config.motionHoverStiffness : config.motionStiffness,
                damping: useOverride ? config.motionHoverDamping : config.motionDamping,
                mass: useOverride ? config.motionHoverMass : config.motionMass,
            }
            : {}),
    };
}
```

Apply same pattern to `buildTapStep` using `config.motionTapTransitionOverride`.

**Step 3: Simplify getMotionTimeline**

Replace the current `getMotionTimeline` (lines 155-161) with:

```ts
function getMotionTimeline(config: ComponentStyleConfig): MotionTimelineStep[] {
    return [
        buildEntryStep(config),
        buildHoverStep(config),
        buildTapStep(config),
        buildExitStep(config),
        buildScrollStep(config),
    ].filter((step): step is MotionTimelineStep => Boolean(step));
}
```

Delete the import of `buildLegacyMotionTimeline` from line 4.

**Step 4: Delete resolveRelationshipScope**

Delete the function at lines 86-88. Find its two call sites (lines ~448 and ~884) and replace:
- If the call was used to gate stagger behavior, replace with `config.motionStaggerEnabled`
- If it was used for group scope, replace with `config.motionGroupStrategy !== 'none'`

Read those call sites carefully before replacing — the exact replacement depends on what the surrounding code does.

**Step 5: Delete motion-schema.ts**

```bash
rm src/components/ui/ui-studio/motion-schema.ts
```

**Step 6: Run TypeScript check**

Run: `./node_modules/.bin/tsc --noEmit 2>&1 | head -80`

Expected: Errors from motion-schema imports disappear. Remaining errors should be in MotionInspectorSection.tsx and preview files.

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor: delete motion-schema.ts, absorb step builders into motion.tsx with override logic"
```

---

## Task 4: Update Overlay Preset References in Preview Files

Every preview file that reads the old `*BodyMotionPresetId` or `*TextMotionPresetId` fields needs updating.

**Files:**
- Modify: `src/components/ui/ui-studio/preview/render-preview.tsx` (lines ~512-513, ~1677-1678, ~1846-1847, ~1918, ~1991-1992)
- Modify: `src/components/ui/ui-studio/preview/dropdown-preview.tsx` (line ~52)
- Modify: `src/components/ui/ui-studio/preview/drawer-preview.tsx` (line ~30)

**Step 1: Update render-preview.tsx**

For each overlay component section, find the old field reads and rename:

```
tooltipBodyMotionPresetId  -> tooltipMotionPresetId      (line ~1991)
tooltipTextMotionPresetId  -> tooltipMotionPresetId       (line ~1992, use same value)
dialogBodyMotionPresetId   -> dialogMotionPresetId        (line ~1677)
dialogTextMotionPresetId   -> dialogMotionPresetId        (line ~1678, use same value)
popoverBodyMotionPresetId  -> popoverMotionPresetId       (line ~1846)
popoverTextMotionPresetId  -> popoverMotionPresetId       (line ~1847, use same value)
tabsBodyMotionPresetId     -> tabsMotionPresetId          (line ~512)
tabsTextMotionPresetId     -> tabsMotionPresetId          (line ~513, use same value)
inputAutocompleteBodyMotionPresetId -> inputAutocompleteMotionPresetId (line ~1918)
```

Where both body and text previously used different presets, now both use the single consolidated field. The text animation gets the same preset as the body — this is the simplification.

**Step 2: Update dropdown-preview.tsx**

```
dropdownBodyMotionPresetId -> dropdownMotionPresetId     (line ~52)
```

**Step 3: Update drawer-preview.tsx**

```
drawerBodyMotionPresetId   -> drawerMotionPresetId       (line ~30)
```

**Step 4: Run TypeScript check**

Run: `./node_modules/.bin/tsc --noEmit 2>&1 | head -80`

Expected: Preview file errors resolve. Remaining errors should be primarily in MotionInspectorSection.tsx.

**Step 5: Commit**

```bash
git add src/components/ui/ui-studio/preview/
git commit -m "refactor: rename overlay motion preset fields to consolidated names in preview files"
```

---

## Task 5: Store Changes — Add Scroll Scrubber State

**Files:**
- Modify: `src/components/ui/ui-studio/store.ts`

**Step 1: Add state field**

In the store state interface (around line 359, near `motionPreviewKey`), add:

```ts
motionScrollProgress: number;
```

**Step 2: Add action**

In the actions section (around line 407, near `replayMotion`), add:

```ts
setMotionScrollProgress: (v: number) => void;
```

**Step 3: Add initial value**

In the state initialization (around line 536, near `motionPreviewKey: 0`), add:

```ts
motionScrollProgress: 0,
```

**Step 4: Add setter implementation**

Near line 612 (near `replayMotion`), add:

```ts
setMotionScrollProgress: (v) => set({ motionScrollProgress: v }),
```

**Step 5: Run TypeScript check**

Run: `./node_modules/.bin/tsc --noEmit 2>&1 | head -80`

**Step 6: Commit**

```bash
git add src/components/ui/ui-studio/store.ts
git commit -m "feat: add motionScrollProgress state for scroll scrubber"
```

---

## Task 6: Animated Checkbox Component

Create a small, reusable animated checkbox for the motion inspector.

**Files:**
- Create: `src/components/ui/motion/AnimatedCheckbox.tsx`

**Step 1: Build the component**

```tsx
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface AnimatedCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
    disabled?: boolean;
    className?: string;
}

export function AnimatedCheckbox({ checked, onChange, label, description, disabled, className }: AnimatedCheckboxProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'flex w-full items-center gap-2.5 py-1 text-left transition-opacity',
                disabled && 'cursor-not-allowed opacity-40',
                className,
            )}
        >
            <div
                className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                    checked
                        ? 'border-[#2dd4bf] bg-[#2dd4bf]/20'
                        : 'border-white/20 bg-white/[0.04]',
                )}
            >
                <AnimatePresence>
                    {checked && (
                        <motion.svg
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                        >
                            <motion.path
                                d="M2 5L4.5 7.5L8 3"
                                stroke="#2dd4bf"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.2, delay: 0.05 }}
                            />
                        </motion.svg>
                    )}
                </AnimatePresence>
            </div>
            <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium text-[#dbe7f8]">{label}</span>
                {description && <p className="text-[10px] leading-relaxed text-[#64748b]">{description}</p>}
            </div>
        </button>
    );
}
```

**Step 2: Verify it compiles**

Run: `./node_modules/.bin/tsc --noEmit 2>&1 | grep AnimatedCheckbox`

Expected: No errors from this file.

**Step 3: Commit**

```bash
git add src/components/ui/motion/AnimatedCheckbox.tsx
git commit -m "feat: add AnimatedCheckbox component for motion inspector"
```

---

## Task 7: Inspector Rewrite

This is the largest task. Rewrite `MotionInspectorSection.tsx` from ~2100 lines to ~800 lines.

**Files:**
- Modify: `src/components/ui/motion/MotionInspectorSection.tsx`

**IMPORTANT:** Read the current file carefully before rewriting. The current file has useful sub-components and patterns worth preserving (slider styling, card styling, color pickers). The goal is NOT to rewrite from scratch — it's to reorganize and remove dead sections.

**Step 1: Remove dead imports and constants**

Delete imports for removed types:
```ts
// DELETE these from the import:
MotionAuthoringMode,
MotionCategory,
MotionRelationshipScope,
MotionTimelineStep,
MotionTrigger,
StaggerDirection,
```

Delete these constant arrays:
```ts
MOTION_AUTHORING_OPTIONS     // (lines ~29-32)
MOTION_CATEGORY_OPTIONS      // (lines ~34-40)
MOTION_RELATIONSHIP_OPTIONS  // (lines ~42-47)
MOTION_GROUP_STRATEGY_OPTIONS // keep if stagger section uses it
MOTION_GROUP_ORIGIN_OPTIONS   // keep if stagger section uses it
TIMELINE_TRIGGER_OPTIONS     // (lines ~67-74)
```

Delete `createTimelineStep` function (lines ~91-100).

**Step 2: Restructure tabs**

Change the tab type from `MotionTriggerTab = 'hover' | 'tap' | 'overlay'` to:

```ts
type MotionTriggerTab = 'entry' | 'hover' | 'tap';
```

Update the tab array construction. For overlay components, the "Entry" tab is labeled "Overlay" (same as current) but the ID is `'entry'` not `'overlay'`. Simplify the nested ternary:

```ts
const tabs: Array<{ id: MotionTriggerTab; icon: string; label: string }> = [];
if (supportsEntryMotion || isOverlayComponent) {
    tabs.push({ id: 'entry', icon: '\u25A3', label: isOverlayComponent ? 'Overlay' : 'Entry' });
}
if (showTriggerTabs) {
    tabs.push({ id: 'hover', icon: '\u2726', label: 'Hover' });
    tabs.push({ id: 'tap', icon: '\u25C9', label: 'Tap' });
}
```

**Step 3: Remove dead sections**

Delete entire rendered sections for:
- **Motion Setup** section (Authoring Mode card, Purpose card, Affects card)
- **Advanced Timeline** section (timeline toggle, add-trigger buttons, step pills, step editor)
- **Global Easing** section
- The "Simple Controls" wrapper/label — its contents become the main content

**Step 4: Add TransitionControls sub-component**

Extract a shared component for transition controls:

```tsx
function TransitionControls({
    selectedStyle,
    updateSelectedStyle,
    scope,
}: {
    selectedStyle: ComponentStyleConfig;
    updateSelectedStyle: <K extends keyof ComponentStyleConfig>(key: K, value: ComponentStyleConfig[K]) => void;
    scope: 'shared' | 'hover' | 'tap';
}) {
    const isOverride = scope === 'hover'
        ? selectedStyle.motionHoverTransitionOverride
        : scope === 'tap'
            ? selectedStyle.motionTapTransitionOverride
            : false;

    // For hover/tap: show override checkbox
    // When not overriding, show "Using shared transition" label
    // When overriding (or scope === 'shared'), show full controls

    const typeKey = scope === 'hover' && isOverride ? 'motionHoverTransitionType'
        : scope === 'tap' && isOverride ? 'motionTapTransitionType'
        : 'motionTransitionType';
    const easeKey = scope === 'hover' && isOverride ? 'motionHoverEase'
        : scope === 'tap' && isOverride ? 'motionTapEase'
        : 'motionEase';
    // ... same pattern for duration, delay, stiffness, damping, mass

    return (
        <div>
            {scope !== 'shared' && (
                <AnimatedCheckbox
                    checked={isOverride}
                    onChange={(v) => updateSelectedStyle(
                        scope === 'hover' ? 'motionHoverTransitionOverride' : 'motionTapTransitionOverride',
                        v,
                    )}
                    label="Override timing"
                    description={isOverride ? undefined : 'Using shared transition from Entry tab'}
                />
            )}
            {(scope === 'shared' || isOverride) && (
                <>
                    {/* Type toggle: Tween / Spring */}
                    {/* Easing selector */}
                    {/* Duration / Delay sliders */}
                    {/* Spring params (when type === spring) */}
                </>
            )}
        </div>
    );
}
```

Reuse the existing `MotionTransitionCard` rendering logic from the current file — just wire it to the correct field keys based on scope.

**Step 5: Add stagger section to Entry tab**

Use the inspector registry to determine visibility:

```tsx
import { supportsStaggerMotion } from '@/components/ui/ui-studio/utilities';

// Inside Entry tab content, after transition controls:
{supportsStaggerMotion(componentKind) && (
    <StaggerSection selectedStyle={selectedStyle} updateSelectedStyle={updateSelectedStyle} />
)}
```

The `StaggerSection` renders: Group Strategy (None/Stagger/Queue), Group Origin (First/Last/Center), Group Interval slider. This is the existing Group section content, just moved here.

**Step 6: Overlay preset section**

For overlay components, add a section below tabs:

```tsx
{isOverlayComponent && (
    <OverlayPresetSection
        componentKind={componentKind}
        selectedStyle={selectedStyle}
        surfaceMotionPresets={surfaceMotionPresets}
        updateSelectedStyle={updateSelectedStyle}
    />
)}
```

This renders a single dropdown per overlay component using the consolidated `*MotionPresetId` field. Map `componentKind` to the correct field key:

```ts
const overlayPresetKey: keyof ComponentStyleConfig | null =
    componentKind === 'tooltip' ? 'tooltipMotionPresetId'
    : componentKind === 'dialog' ? 'dialogMotionPresetId'
    : componentKind === 'popover' ? 'popoverMotionPresetId'
    : componentKind === 'dropdown' ? 'dropdownMotionPresetId'
    : componentKind === 'drawer' ? 'drawerMotionPresetId'
    : componentKind === 'input' ? 'inputAutocompleteMotionPresetId'
    : componentKind === 'tabs' ? 'tabsMotionPresetId'
    : null;
```

**Step 7: Replace all Switch/toggle components with AnimatedCheckbox**

Find every `<Switch.Root>` in the motion inspector and replace with `<AnimatedCheckbox>`. These include:
- Enable entry motion
- Enable exit motion
- Enable hover motion
- Enable tap motion
- Enable scroll motion
- Override timing (hover/tap)
- Tilt 3D enabled
- Glare enabled
- Spotlight enabled

**Step 8: Update the export signature**

The `MotionInspectorSection` props should be simplified. The `supportsStaggerMotion` check happens inside now. Props to keep:

```ts
export function MotionInspectorSection({
    selectedStyle,
    componentKind,
    isOverlayComponent,
    supportsEntryMotion,
    supportsAdvancedHover,
    visualMotionPresets,
    interactionMotionPresets,
    surfaceMotionPresets,
    updateSelectedStyle,
    applyMotionComponentPreset,
    applyVisualMotionPreset,
    clearVisualMotionPreset,
}: { ... })
```

This is the same signature — no changes needed in `UIStudioPage.tsx` for the props.

**Step 9: Run TypeScript check**

Run: `./node_modules/.bin/tsc --noEmit 2>&1 | head -80`

Expected: Should be clean or very close to clean.

**Step 10: Commit**

```bash
git add src/components/ui/motion/MotionInspectorSection.tsx
git commit -m "refactor: rewrite motion inspector with Entry/Hover/Tap tabs, remove timeline and metadata sections"
```

---

## Task 8: Scroll Scrubber in Stage Toolbar

**Files:**
- Modify: `src/components/ui/UIStudioPage.tsx`
- Modify: `src/components/ui/ui-studio/motion.tsx` (scrub mode interpolation)

**Step 1: Add scrubber UI to UIStudioPage.tsx**

After the preview mode chips (around line 587), add the scroll scrubber:

```tsx
{/* Scroll scrubber — visible when scrub mode is active */}
{activeMotionPreviewMode === 'scrub' && hasScrollPreview && (
    <div className="flex w-full items-center gap-3 px-2 pt-2">
        <span className="text-[10px] font-medium text-[#64748b]">
            {selectedStyle?.motionScrollStart ?? 0}%
        </span>
        <input
            type="range"
            min={0}
            max={1}
            step={0.005}
            value={motionScrollProgress}
            onChange={(e) => setMotionScrollProgress(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-[#2dd4bf] [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2dd4bf]"
        />
        <span className="text-[10px] font-medium text-[#64748b]">
            {selectedStyle?.motionScrollEnd ?? 100}%
        </span>
    </div>
)}
```

Add the store selectors at the top of the component where other store values are destructured:

```ts
const motionScrollProgress = useStudioStore((s) => s.motionScrollProgress);
const setMotionScrollProgress = useStudioStore((s) => s.setMotionScrollProgress);
```

**Step 2: Update buildPreviewMotionProps in motion.tsx for scrub interpolation**

In `buildPreviewMotionProps` (lines 305-443), find the `scrub` mode case. Currently it locks to end state. Replace with interpolation logic:

The current scrub case probably does something like forcing `initial` and `animate` to the scroll target with duration 0. Replace it with a function that interpolates between `from` and `to` based on the progress value:

```ts
if (options?.previewMode === 'scrub' && compiled.scroll) {
    const progress = options.scrollProgress ?? 1;
    const { initial: scrollFrom, target: scrollTo } = compiled.scroll;
    const interpolated: Record<string, number> = {};

    if (scrollFrom && scrollTo) {
        for (const key of Object.keys(scrollTo) as Array<keyof MotionRuntimeValues>) {
            const fromVal = typeof scrollFrom[key] === 'number' ? scrollFrom[key] : 0;
            const toVal = typeof scrollTo[key] === 'number' ? scrollTo[key] : (key === 'opacity' || key === 'scale' ? 1 : 0);
            interpolated[key] = fromVal + (toVal - fromVal) * progress;
        }
    }

    return {
        initial: false,
        animate: interpolated,
        transition: { duration: 0 },
        style: compiled.scroll.transformOrigin ? { transformOrigin: compiled.scroll.transformOrigin } : undefined,
    };
}
```

Add `scrollProgress?: number` to the options parameter of `buildPreviewMotionProps`.

**Step 3: Wire scroll progress through the preview**

In `UIStudioPage.tsx`, wherever `motionPreviewMode` is passed to the preview rendering, also pass `motionScrollProgress`. Check how `buildPreviewMotionProps` is called — it may be called inside `renderWithMotionControls` or directly. The options object needs to include `scrollProgress` when in scrub mode.

Search for where `buildPreviewMotionProps` is called and ensure the call site passes `scrollProgress` from the store.

**Step 4: Run TypeScript check and test manually**

Run: `./node_modules/.bin/tsc --noEmit`

Then: `./node_modules/.bin/vite build`

Expected: Both pass.

**Step 5: Commit**

```bash
git add src/components/ui/UIStudioPage.tsx src/components/ui/ui-studio/motion.tsx
git commit -m "feat: add scroll scrubber to stage toolbar with continuous interpolation"
```

---

## Task 9: Fix Any Remaining TypeScript Errors

After all the above tasks, do a final TypeScript sweep.

**Step 1: Full TypeScript check**

Run: `./node_modules/.bin/tsc --noEmit 2>&1`

**Step 2: Fix any remaining references**

Common places that may still reference deleted types/fields:
- `src/components/ui/ui-studio/inspector/InspectorPanel.tsx` — if it imports `MotionTimelineStep` or schema types
- `src/components/ui/ui-studio/utilities.tsx` — if `supportsStaggerMotion` references `motionGroupScope`
- `src/components/ui/ui-studio/export/code-generators.ts` — shouldn't have issues but verify

For each error, the fix is straightforward: delete the reference, update the field name, or remove the import.

**Step 3: Production build**

Run: `./node_modules/.bin/vite build`

Expected: Build succeeds (may still have the pre-existing large-chunk warning — that's fine).

**Step 4: Commit**

```bash
git add -A
git commit -m "fix: resolve remaining TypeScript errors from motion simplification"
```

---

## Task 10: Final Verification

**Step 1: TypeScript check**

Run: `./node_modules/.bin/tsc --noEmit`

Expected: 0 errors.

**Step 2: Production build**

Run: `./node_modules/.bin/vite build`

Expected: Build succeeds.

**Step 3: Manual smoke test**

Start dev server: `pnpm dev`

Test these flows:
1. Select a Button — open Motion FX tab — verify Entry/Hover/Tap tabs appear at top
2. Pick a preset on Entry tab — verify preview animates
3. Switch to Hover tab — enable hover — verify "Override timing" checkbox appears
4. Check "Override timing" — verify separate transition controls appear
5. Select an Accordion — verify Stagger section appears in Entry tab
6. Select a Dialog — verify Overlay preset dropdown appears
7. Enable scroll — click Scroll chip in stage toolbar — verify scrubber slider appears
8. Drag the scrubber — verify the component interpolates smoothly
9. All boolean controls use animated checkboxes, not toggle switches

**Step 4: Final commit if any manual fixes needed**

```bash
git add -A
git commit -m "fix: final polish from manual smoke testing"
```
