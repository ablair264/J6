# Export System Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the export panel from a confusing debug-output dump into a clean, production-ready code export that developers actually want to copy-paste.

**Architecture:** Two-tab UI (Code + Theme) replacing four tabs. CSS mode generates real CSS classes with proper pseudo-selectors for hover/active/disabled states. Tailwind mode generates self-contained className strings with arbitrary values. State CSS vars are stripped from all snippet output. Studio Bundle moves to a dedicated save/load action.

**Tech Stack:** React, TypeScript, Zustand store, Tailwind CSS v4

---

## Overview of Changes

### What changes:
1. **ExportPanel.tsx** — New 2-tab layout (Code / Theme), snippet toggle (Inline vs Component), Studio Bundle becomes action button
2. **code-generators.ts** — New `buildCleanCSSExport()` function that outputs real CSS; state var filtering; proper `:hover`/`:active`/`:disabled` pseudo-selectors in CSS mode
3. **utilities.tsx** — New `filterInternalVarsFromStyle()` to strip `--ui-btn-*` vars from exported styles; new `buildStateCSS()` for proper pseudo-selector output
4. **store.ts** — Updated `CodePanelTab` type, new state for snippet sub-mode toggle

### What stays the same:
- `componentSnippet()` in render-preview.tsx (generates per-component JSX — this is solid)
- `buildTailwindThemeStyles()` (theme token export — moves to "Theme" tab unchanged)
- `buildMultiVariantBundle()` (studio bundle JSON — becomes action button output)
- `buildMotionComponentSnippet()` in motion.tsx (motion constants — keep)
- All import resolution logic in `buildNamedSnippetImports()`

---

## Task 1: Strip Internal State Vars from Export Style

**Files:**
- Modify: `src/components/ui/ui-studio/utilities.tsx` (after line 2236)

**Why:** The root cause of the messy export. `buildPreviewPresentation(instance, true)` generates a `CSSProperties` object that includes `--ui-btn-hover-bg`, `--ui-btn-hover-fg`, `--ui-btn-active-*`, `--ui-btn-disabled-*`, `--ui-dropdown-hover-*`, and `--ui-btn-hover-border-width` etc. These are internal runtime vars for the inspector preview system and have zero value in exported code.

**Step 1: Add the filter function**

Add after `buildSnippetStyleBindings()` (after line 2236):

```typescript
/** Strip internal CSS custom properties from exported styles.
 *  These vars power the live inspector preview but are meaningless in production code. */
export function filterInternalVarsFromStyle(style: CSSProperties): CSSProperties {
    const internalPrefixes = [
        '--ui-btn-hover',
        '--ui-btn-active',
        '--ui-btn-disabled',
        '--ui-dropdown-hover',
        '--ui-animated-border-fill',
    ];
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(style)) {
        if (internalPrefixes.some((prefix) => key.startsWith(prefix))) continue;
        filtered[key] = value;
    }
    return filtered as CSSProperties;
}
```

**Step 2: Apply the filter in `buildPreviewPresentation`**

In `buildPreviewPresentation()`, the `forExport` flag already exists but doesn't filter state vars. Modify the section around line 2273-2296 to skip state var generation when `forExport === true`:

Find in `buildPreviewPresentation` (around line 2274):
```typescript
    const hasStateStyles = !forExport || supportsStateStyles(instance.kind);
```
Change to:
```typescript
    const hasStateStyles = !forExport && supportsStateStyles(instance.kind);
```

This single character change (`||` to `&&`) means: when `forExport` is true, skip generating state CSS vars entirely. The `!forExport` condition was already there but the logic was inverted — it was INCLUDING state vars for export instead of EXCLUDING them.

Also find the dropdown vars section (around line 2265):
```typescript
    const hasDropdownVars = !forExport || supportsDropdownHoverStyle(instance.kind);
```
Change to:
```typescript
    const hasDropdownVars = !forExport && supportsDropdownHoverStyle(instance.kind);
```

Same fix — dropdown hover vars were also leaking into export.

**Step 3: Verify the fix**

Build with `pnpm build`. The Tailwind and CSS snippet output should no longer contain any `--ui-btn-hover-*` or `--ui-dropdown-hover-*` properties.

**Step 4: Commit**

```bash
git add src/components/ui/ui-studio/utilities.tsx
git commit -m "fix(export): strip internal state CSS vars from exported code"
```

---

## Task 2: Generate Proper CSS with Pseudo-Selectors for State Overrides

**Files:**
- Modify: `src/components/ui/ui-studio/export/code-generators.ts` (new function)
- Modify: `src/components/ui/ui-studio/utilities.tsx` (new helper)

**Why:** Instead of dumping state vars, we should generate real CSS pseudo-selectors (`:hover`, `:active`, `:disabled`) that developers can use directly.

**Step 1: Add state CSS builder in utilities.tsx**

Add a new exported function (after `filterInternalVarsFromStyle`):

```typescript
/** Build CSS rule blocks for hover/active/disabled state overrides.
 *  Returns an array of { selector: string, properties: Record<string, string> } entries.
 *  Only includes properties that DIFFER from the base style. */
export function buildStateOverrideCSS(
    instance: ComponentInstance,
    className: string,
): Array<{ selector: string; properties: Record<string, string> }> {
    if (!instance.stateOverrides) return [];
    const base = instance.style;
    const rules: Array<{ selector: string; properties: Record<string, string> }> = [];

    const stateMap: Array<{ state: keyof NonNullable<typeof instance.stateOverrides>; pseudo: string }> = [
        { state: 'hover', pseudo: ':hover' },
        { state: 'active', pseudo: ':active' },
        { state: 'disabled', pseudo: ':disabled' },
    ];

    for (const { state, pseudo } of stateMap) {
        const overrides = instance.stateOverrides[state];
        if (!overrides || Object.keys(overrides).length === 0) continue;

        const s = { ...base, ...overrides };
        const props: Record<string, string> = {};

        if (overrides.fillColor !== undefined || overrides.fillOpacity !== undefined || overrides.fillMode !== undefined || overrides.fillColorTo !== undefined || overrides.fillWeight !== undefined) {
            props.background = buildStateFill(s.fillMode, s.fillColor, s.fillColorTo, s.fillWeight, s.fillOpacity);
        }
        if (overrides.fontColor !== undefined || overrides.fontOpacity !== undefined) {
            props.color = hexToRgba(s.fontColor, s.fontOpacity / 100);
        }
        if (overrides.strokeColor !== undefined || overrides.strokeOpacity !== undefined) {
            props['border-color'] = hexToRgba(s.strokeColor, s.strokeOpacity / 100);
        }
        if (overrides.strokeWeight !== undefined) {
            props['border-width'] = `${s.strokeWeight}px`;
        }
        if (overrides.fontSize !== undefined) {
            props['font-size'] = `${Math.round(s.fontSize * SIZE_SCALE[s.size])}px`;
        }
        if (overrides.fontWeight !== undefined || overrides.fontBold !== undefined) {
            props['font-weight'] = s.fontBold ? '700' : `${s.fontWeight}`;
        }
        if (overrides.fontItalic !== undefined) {
            props['font-style'] = s.fontItalic ? 'italic' : 'normal';
        }
        if (overrides.fontUnderline !== undefined) {
            props['text-decoration'] = s.fontUnderline ? 'underline' : 'none';
        }

        if (Object.keys(props).length > 0) {
            rules.push({ selector: `.${className}${pseudo}`, properties: props });
        }
    }

    return rules;
}
```

Note: `buildStateFill` and `hexToRgba` are already available in utilities.tsx scope. `SIZE_SCALE` is already imported from constants.

**Step 2: Create the CSS export builder in code-generators.ts**

Add a new exported function after `buildNamedSnippetForInstance`:

```typescript
/** Build a clean CSS class export for a component instance.
 *  Generates a named CSS class + pseudo-selector rules for state overrides. */
export function buildCSSExport(
    instance: ComponentInstance,
    activeTokenSet: StudioTokenSet,
): string {
    const presentation = buildPreviewPresentation(instance, true);
    const style = presentation.style;
    const className = `studio-${sanitizeFileSegment(instance.name || instance.kind)}`;

    // Convert CSSProperties to CSS declaration block
    const cssProps = cssPropertiesToCSS(style);
    const lines: string[] = [];
    lines.push(`.${className} {`);
    for (const [prop, value] of Object.entries(cssProps)) {
        if (value !== undefined && value !== '') {
            lines.push(`  ${prop}: ${value};`);
        }
    }
    lines.push('}');

    // State pseudo-selectors (only properties that differ from base)
    const stateRules = buildStateOverrideCSS(instance, className);
    for (const rule of stateRules) {
        lines.push('');
        lines.push(`${rule.selector} {`);
        for (const [prop, value] of Object.entries(rule.properties)) {
            lines.push(`  ${prop}: ${value};`);
        }
        lines.push('}');
    }

    return lines.join('\n');
}
```

**Step 3: Add the `cssPropertiesToCSS` helper in code-generators.ts**

This converts React's camelCase CSSProperties to kebab-case CSS:

```typescript
function cssPropertiesToCSS(style: CSSProperties): Record<string, string> {
    const result: Record<string, string> = {};
    const camelToKebab = (s: string) =>
        s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`).replace(/^webkit-/, '-webkit-').replace(/^moz-/, '-moz-');

    for (const [key, value] of Object.entries(style)) {
        if (value === undefined || value === null || value === '') continue;
        // Skip internal CSS custom properties
        if (key.startsWith('--ui-')) continue;
        // Handle vendor prefixes
        const cssKey = key.startsWith('--') ? key : camelToKebab(key);
        result[cssKey] = String(value);
    }
    return result;
}
```

**Step 4: Commit**

```bash
git add src/components/ui/ui-studio/utilities.tsx src/components/ui/ui-studio/export/code-generators.ts
git commit -m "feat(export): generate proper CSS classes with pseudo-selectors for state overrides"
```

---

## Task 3: Update Store Types for New Tab Structure

**Files:**
- Modify: `src/components/ui/ui-studio/store.ts`

**Step 1: Update the CodePanelTab type**

Change:
```typescript
export type CodePanelTab = 'snippet' | 'named' | 'exports' | 'theme';
```
To:
```typescript
export type CodePanelTab = 'code' | 'theme';
```

**Step 2: Add snippet sub-mode state**

Add to the store interface (near the other export state around line 340):
```typescript
    codeExportMode: 'snippet' | 'component';
```

Add the setter:
```typescript
    setCodeExportMode: (mode: 'snippet' | 'component') => void;
```

**Step 3: Update the store defaults**

In the store initializer, change:
```typescript
    codePanelTab: 'snippet',
```
To:
```typescript
    codePanelTab: 'code',
    codeExportMode: 'snippet',
```

Add the action:
```typescript
    setCodeExportMode: (mode) => set({ codeExportMode: mode }),
```

**Step 4: Fix any references to old tab values**

Search for `'snippet'` and `'named'` and `'exports'` references in the store file and update accordingly. The `codePanelTab` default changes from `'snippet'` to `'code'`.

**Step 5: Commit**

```bash
git add src/components/ui/ui-studio/store.ts
git commit -m "refactor(store): update CodePanelTab type for new 2-tab export layout"
```

---

## Task 4: Redesign ExportPanel UI

**Files:**
- Rewrite: `src/components/ui/ui-studio/export/ExportPanel.tsx`

**Why:** The panel goes from 4 confusing tabs to a clean 2-tab layout. "Code" tab has an inline toggle for Snippet vs Component mode. "Theme" tab shows the Tailwind theme CSS. Studio Bundle export moves to a dedicated download button in the header.

**Step 1: Rewrite ExportPanel.tsx**

The new layout:

```
EXPORT
────────────────────────────
[CSS] [Tailwind]    [Copy] [Download]
────────────────────────────
  Code  |  Theme
────────────────────────────
  [Snippet ▪ Component]  ← inline toggle (only in Code tab)
────────────────────────────
  <generated code>
```

Key changes:
- Import new `buildCSSExport` from code-generators
- `codePanelTab` is now `'code' | 'theme'`
- Inside the Code tab, `codeExportMode` toggles between snippet and component
- CSS mode → Code tab shows real CSS class (from `buildCSSExport`) with JSX usage example below
- Tailwind mode → Code tab shows the existing Tailwind snippet
- Theme tab → same as current Theme Tokens tab (only visible for Tailwind mode)
- "Save Bundle" becomes a small icon button in the header that downloads the JSON

For **CSS mode, Code tab**, the output should be structured as:

```
/* CSS */
.studio-button {
  background: rgba(15, 105, 209, 0.52);
  border-radius: 5px;
  color: rgba(219, 231, 248, 1);
  ...
}

.studio-button:hover {
  background: rgba(15, 105, 209, 0.88);
}

/* Usage */
<Button className="studio-button">
  Primary action
</Button>
```

For **CSS mode, Component tab**:
```tsx
import { Button } from '@/components/ui/button';

const styles = `
.studio-button { ... }
.studio-button:hover { ... }
`;

export function StudioButton({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{styles}</style>
      <Button className="studio-button">{children}</Button>
    </>
  );
}
```

For **Tailwind mode** — keep the existing snippet/named output but with state vars stripped (Task 1 handles this). The Tailwind output should also convert hover state overrides to Tailwind `hover:` prefixed arbitrary values.

**Step 2: Update the `buildSnippetForInstance` to accept CSS mode and produce the new format**

Modify `buildSnippetForInstance` in code-generators.ts to call `buildCSSExport` when `exportStyleMode === 'inline'`:

```typescript
export function buildSnippetForInstance(
    instance: ComponentInstance,
    exportStyleMode: ExportStyleMode,
    activeTokenSet: StudioTokenSet,
): string {
    if (exportStyleMode === 'inline') {
        return buildCSSExport(instance, activeTokenSet);
    }
    // Existing Tailwind path (with state vars now filtered by Task 1)
    const preview = buildPreviewPresentation(instance, true);
    const baseSnippet = componentSnippet(instance, preview.style, preview.motionClassName, exportStyleMode, activeTokenSet);
    const motionSnippet = buildMotionComponentSnippet(getStyleForMotionOutput(instance));
    return motionSnippet ? `${baseSnippet}\n\n${motionSnippet}` : baseSnippet;
}
```

**Step 3: Build and verify**

```bash
pnpm build
```

**Step 4: Commit**

```bash
git add src/components/ui/ui-studio/export/ExportPanel.tsx src/components/ui/ui-studio/export/code-generators.ts
git commit -m "feat(export): redesign export panel with 2-tab layout and clean CSS output"
```

---

## Task 5: Add Tailwind Hover State Classes

**Files:**
- Modify: `src/components/ui/ui-studio/utilities.tsx` — `buildTailwindStylePayload`

**Why:** Tailwind mode should convert hover/active/disabled state overrides to proper Tailwind prefixed classes (`hover:bg-[...]`, `active:text-[...]`) instead of dumping CSS vars.

**Step 1: Add state-to-tailwind conversion**

Add a new function in utilities.tsx:

```typescript
/** Convert state overrides to Tailwind prefixed arbitrary value classes. */
export function buildTailwindStateClasses(instance: ComponentInstance): string[] {
    if (!instance.stateOverrides) return [];
    const classes: string[] = [];
    const base = instance.style;

    const stateMap: Array<{ state: keyof NonNullable<typeof instance.stateOverrides>; prefix: string }> = [
        { state: 'hover', prefix: 'hover' },
        { state: 'active', prefix: 'active' },
        { state: 'disabled', prefix: 'disabled' },
    ];

    for (const { state, prefix } of stateMap) {
        const overrides = instance.stateOverrides[state];
        if (!overrides || Object.keys(overrides).length === 0) continue;
        const s = { ...base, ...overrides };

        if (overrides.fillColor !== undefined || overrides.fillOpacity !== undefined) {
            const bg = buildStateFill(s.fillMode, s.fillColor, s.fillColorTo, s.fillWeight, s.fillOpacity);
            // For simple solid fills, use bg-[] arbitrary value
            if (s.fillMode !== 'gradient') {
                classes.push(`${prefix}:bg-[${hexToRgba(s.fillColor, s.fillOpacity / 100)}]`);
            }
        }
        if (overrides.fontColor !== undefined || overrides.fontOpacity !== undefined) {
            classes.push(`${prefix}:text-[${hexToRgba(s.fontColor, s.fontOpacity / 100)}]`);
        }
        if (overrides.strokeColor !== undefined || overrides.strokeOpacity !== undefined) {
            classes.push(`${prefix}:border-[${hexToRgba(s.strokeColor, s.strokeOpacity / 100)}]`);
        }
        if (overrides.strokeWeight !== undefined) {
            classes.push(`${prefix}:border-[${s.strokeWeight}px]`);
        }
        if (overrides.fontWeight !== undefined || overrides.fontBold !== undefined) {
            const weight = s.fontBold ? '700' : `${s.fontWeight}`;
            classes.push(`${prefix}:font-[${weight}]`);
        }
    }

    return classes;
}
```

**Step 2: Integrate into Tailwind snippet export path**

In `buildSnippetForInstance`, when the Tailwind path generates classTokens, append the state classes:

```typescript
// After the existing baseSnippet generation for tailwind mode:
const stateClasses = buildTailwindStateClasses(instance);
// These need to be spliced into the className array in the snippet output
```

The exact integration point is in `componentSnippet()` → `buildSnippetStyleBindings()`. The cleanest approach: modify `buildSnippetStyleBindings` to accept an optional `extraClasses` parameter and append them.

**Step 3: Commit**

```bash
git add src/components/ui/ui-studio/utilities.tsx
git commit -m "feat(export): convert state overrides to Tailwind hover:/active:/disabled: classes"
```

---

## Task 6: Clean Up — Remove Preview-Only Classes from Export

**Files:**
- Modify: `src/components/ui/ui-studio/export/code-generators.ts`

**Why:** The theme CSS export currently includes `.ui-studio-button-preview-hover`, `.ui-studio-button-preview-active`, `.ui-studio-button-preview-disabled` classes. These are only used by the inspector preview system and should never appear in exported code.

**Step 1: Remove preview classes from `buildTailwindThemeStyles`**

In `buildTailwindThemeStyles`, remove the entire blocks for:
- `.ui-studio-button-preview-hover` (lines ~826-838)
- `.ui-studio-button-preview-active` (lines ~840-852)
- `.ui-studio-button-preview-disabled` (lines ~854-867)

Keep the real pseudo-selector rules (`.ui-studio-button-state:hover`, `:active`, `:disabled`) since those are useful if the consumer uses the `ui-studio-button-state` class.

**Step 2: Also strip `BUTTON_STATE_CLASS_NAME` from exported class bindings**

In `componentSnippet()` (render-preview.tsx), the export includes `BUTTON_STATE_CLASS_NAME` ('ui-studio-button-state') in the className. This is fine to keep — it's the hook for the real `:hover`/`:active` rules in the theme CSS.

**Step 3: Commit**

```bash
git add src/components/ui/ui-studio/export/code-generators.ts
git commit -m "fix(export): remove inspector preview classes from theme CSS output"
```

---

## Task 7: Filter Unnecessary Properties from CSS Output

**Files:**
- Modify: `src/components/ui/ui-studio/utilities.tsx`

**Why:** The generated style object includes properties that aren't useful or are default values: `transition` (internal animation smoothing), `justifyContent: 'center'` (default for buttons), `textAlign: 'center'` (same), unused `borderStyle: 'solid'` when border width is 0.

**Step 1: Add property filtering for export**

Create a function that removes noise properties:

```typescript
/** Remove default/unnecessary CSS properties from export output. */
export function filterDefaultProperties(style: CSSProperties): CSSProperties {
    const filtered = { ...style };

    // Remove internal transition (inspector smoothing, not user-configured)
    if (filtered.transition && String(filtered.transition).includes('180ms')) {
        delete filtered.transition;
    }

    // Remove border-style when border width is 0
    if (filtered.borderWidth === '0px' || filtered.borderWidth === '0') {
        delete filtered.borderStyle;
        delete filtered.borderColor;
        delete filtered.borderWidth;
    }

    // Remove undefined/null values
    for (const [key, value] of Object.entries(filtered)) {
        if (value === undefined || value === null || value === '') {
            delete (filtered as Record<string, unknown>)[key];
        }
    }

    return filtered;
}
```

**Step 2: Apply in `buildPreviewPresentation` when `forExport` is true**

After generating the `baseStyle` object (around line 2298), add:

```typescript
    const exportStyle = forExport ? filterDefaultProperties(baseStyle) : baseStyle;
```

And return `exportStyle` instead of `baseStyle`.

**Step 3: Commit**

```bash
git add src/components/ui/ui-studio/utilities.tsx
git commit -m "fix(export): filter default/unnecessary properties from export output"
```

---

## Execution Order

Tasks 1, 2, 3 can be done in parallel (independent changes).
Task 4 depends on Tasks 1-3.
Task 5 depends on Task 1.
Task 6 is independent.
Task 7 is independent.

**Recommended order:** 1 → 2 → 3 → 7 → 6 → 4 → 5

---

## Expected Final Output

### CSS Mode — Snippet:
```css
.studio-primary-action {
  background: rgba(15, 105, 209, 0.52);
  border-radius: 5px;
  color: rgba(219, 231, 248, 1);
  font-family: 'Space Grotesk';
  font-size: 12px;
  font-weight: 500;
  min-height: 34px;
  padding-inline: 12px;
}

.studio-primary-action:hover {
  background: rgba(15, 105, 209, 0.88);
}

/* Usage */
<Button className="studio-primary-action">
  Primary action
</Button>
```

### Tailwind Mode — Snippet:
```tsx
<Button className="rounded-sm text-xs font-medium min-h-[34px] px-[12px] bg-[rgba(15,105,209,0.52)] text-[rgba(219,231,248,1)] hover:bg-[rgba(15,105,209,0.88)]">
  Primary action
</Button>
```

### Tailwind Mode — Theme:
```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --primary: #4daebc;
  ...
}

@theme inline {
  --color-background: var(--background);
  ...
}

@layer utilities {
  /* Motion/effect utilities (only if used) */
}
```
