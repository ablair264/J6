# Card Builder — Phase 2: Slot Composer

## Goal
Transform the `card` component kind into a fully composable Card Builder. Users can add arbitrary slots to the card — any existing component kind, image blocks, or text blocks — each with its own independent style, controlled via the inspector. The card itself retains its existing style controls (variant, fill, stroke, effects etc).

## Repository
`/Users/blair/Desktop/Development/ui-studio-oss`

---

## 1. New Types — `ui-studio.types.ts`

Add the following to `src/components/ui/ui-studio.types.ts`:

```ts
// ─── Card Builder ────────────────────────────────────────────────────────────

export type CardSlotType = 'component' | 'image' | 'text' | 'divider' | 'spacer';

export interface CardSlot {
  id: string;                          // nanoid(8)
  type: CardSlotType;
  order: number;

  // type === 'component'
  componentKind?: UIComponentKind;     // which component to render
  componentStyle?: ComponentStyleConfig; // its own independent style config
  componentLabel?: string;             // user-editable display name

  // type === 'image'
  imageSrc?: string;
  imageAlt?: string;
  imageAspectRatio?: '1/1' | '4/3' | '16/9' | '16/10' | '3/2' | 'auto';
  imageFit?: 'cover' | 'contain' | 'fill';

  // type === 'text'
  textContent?: string;
  textTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  textFontSize?: number;
  textFontWeight?: number;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';

  // type === 'divider'
  dividerColor?: string;
  dividerWeight?: number;

  // type === 'spacer'
  spacerHeight?: number;               // px
}
```

Also add to `ComponentStyleConfig`:

```ts
// ─── Card Builder slots ──────────────────────────────────────────────────────
cardSlots: CardSlot[];                 // ordered slot definitions
cardBuilderMode: boolean;              // true = use slot composer, false = legacy fixed-template
cardSlotPadding: number;               // px padding inside CardContent for slots
cardSlotGap: number;                   // gap between slots in px
```

---

## 2. Defaults — `constants.ts`

In `DEFAULT_STYLE`, add:

```ts
cardSlots: [],
cardBuilderMode: false,
cardSlotPadding: 24,
cardSlotGap: 12,
```

---

## 3. Store — `store.ts`

Add the following actions to the Zustand store (alongside existing `updateStyle`, etc.):

```ts
// Card Builder slot actions
addCardSlot: (instanceId: string, slot: CardSlot) => void;
removeCardSlot: (instanceId: string, slotId: string) => void;
updateCardSlot: (instanceId: string, slotId: string, patch: Partial<CardSlot>) => void;
reorderCardSlots: (instanceId: string, orderedIds: string[]) => void;
updateCardSlotComponentStyle: (instanceId: string, slotId: string, patch: Partial<ComponentStyleConfig>) => void;
```

Implementations should:
- Mutate `instance.style.cardSlots` on the matched instance
- Call `normalizeStyleConfig` on new slot component styles
- Trigger Neon sync via `scheduleNeonSync` (same as existing style updates)
- For `reorderCardSlots`: reassign `order` values to match the provided `orderedIds` array index

---

## 4. Inspector — Slot Manager Panel

Create `src/components/ui/ui-studio/inspector/CardSlotManager.tsx`.

This component renders when the selected instance is `kind === 'card'` and `style.cardBuilderMode === true`.

### Layout

```
┌─────────────────────────────────────────┐
│  Card Builder                    [+ Add] │
├─────────────────────────────────────────┤
│  ⠿  [Button]  button         [⚙] [✕]   │
│  ⠿  [Image]   hero-image     [⚙] [✕]   │
│  ⠿  [Text]    body-copy      [⚙] [✕]   │
│  ⠿  ── divider ──                  [✕]  │
└─────────────────────────────────────────┘
│  Slot padding  ───○───  24px            │
│  Slot gap      ───○───  12px            │
```

**Behaviour:**
- Drag handles (⠿) reorder slots — use a simple mouse-down + index swap approach (no external DnD library needed; the store has `reorderCardSlots`)
- `[+ Add]` opens a small dropdown/popover listing slot types: Component, Image, Text, Divider, Spacer
- For Component slots: a secondary picker lets user choose `UIComponentKind` from a grouped list (matching the sidebar's component list)
- `[⚙]` sets the "active slot" — the inspector below the slot manager switches to show that slot's style controls
- `[✕]` removes the slot with confirmation (just a brief visual flash, no modal needed)
- When a component slot is active, render the **full existing inspector panel** for that slot's `componentStyle` config — i.e. reuse `InspectorPanel` with `instanceId` overridden to use the slot's style. This means the slot editing experience is identical to editing any other component in the studio.

**Active slot indicator:** Highlight the active slot row with a subtle accent left-border.

### Add slot: supported types and defaults

| Type | Default values |
|---|---|
| `component` | kind = `button`, style = `normalizeStyleConfig(DEFAULT_STYLE)` |
| `image` | aspectRatio = `16/9`, fit = `cover`, src = `''` |
| `text` | content = `'Text block'`, tag = `p`, size = 14, weight = 400 |
| `divider` | color = current border color, weight = 1 |
| `spacer` | height = 16 |

---

## 5. Inspector Panel Integration — `InspectorPanel.tsx`

At the top of the card's inspector section, add a **mode toggle**:

```
  ● Slot Composer    ○ Classic
```

When `cardBuilderMode === true`:
- Render `<CardSlotManager />` at the top of the card inspector section
- If a slot is active and it's a `component` type: render the full inspector for `slot.componentStyle` below the manager (pass the slot's style as a virtual instance)
- If no slot is active or it's not a component slot: render the card-level style controls (variant, fill, stroke, effects — everything except the legacy content fields)

When `cardBuilderMode === false`:
- Render the existing classic card inspector (no change to current behaviour)

---

## 6. Preview — `render-preview.tsx`

Modify the `case 'card':` branch in `renderPreview`.

When `instance.style.cardBuilderMode === true`, render slots instead of the legacy fixed content:

```tsx
case 'card': {
  if (instance.style.cardBuilderMode) {
    return renderCardBuilder(instance, style, motionClassName);
  }
  // ... existing legacy card render ...
}
```

Create `renderCardBuilder` function in the same file:

```tsx
function renderCardBuilder(
  instance: ComponentInstance,
  style: CSSProperties,
  motionClassName?: string,
): ReactNode {
  const slots = [...(instance.style.cardSlots ?? [])].sort((a, b) => a.order - b.order);
  const cardDirectStyle = buildCardDirectStyle(style, instance.style);
  const gap = instance.style.cardSlotGap ?? 12;
  const padding = instance.style.cardSlotPadding ?? 24;

  const renderedSlots = slots.map((slot) => {
    switch (slot.type) {
      case 'component': {
        if (!slot.componentKind || !slot.componentStyle) return null;
        const slotInstance: ComponentInstance = {
          id: slot.id,
          kind: slot.componentKind,
          name: slot.componentLabel ?? slot.componentKind,
          style: slot.componentStyle,
        };
        const slotPreviewStyle = buildPreviewPresentation(slot.componentKind, slot.componentStyle);
        // Render inside a non-interactive wrapper that prevents click propagation
        return (
          <div key={slot.id} className="w-full pointer-events-none">
            {renderPreview(slotInstance, slotPreviewStyle)}
          </div>
        );
      }
      case 'image': {
        if (!slot.imageSrc) {
          return (
            <div
              key={slot.id}
              className="w-full rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs"
              style={{ aspectRatio: slot.imageAspectRatio ?? '16/9' }}
            >
              No image
            </div>
          );
        }
        return (
          <div key={slot.id} className="w-full overflow-hidden rounded-md" style={{ aspectRatio: slot.imageAspectRatio ?? '16/9' }}>
            <img
              src={slot.imageSrc}
              alt={slot.imageAlt ?? ''}
              className="w-full h-full"
              style={{ objectFit: slot.imageFit ?? 'cover' }}
            />
          </div>
        );
      }
      case 'text': {
        const Tag = slot.textTag ?? 'p';
        return (
          <Tag
            key={slot.id}
            style={{
              fontSize: slot.textFontSize ?? 14,
              fontWeight: slot.textFontWeight ?? 400,
              color: slot.textColor || 'inherit',
              textAlign: slot.textAlign ?? 'left',
              margin: 0,
              width: '100%',
            }}
          >
            {slot.textContent || 'Text block'}
          </Tag>
        );
      }
      case 'divider':
        return (
          <div
            key={slot.id}
            className="w-full rounded-full"
            style={{
              height: `${Math.max(1, slot.dividerWeight ?? 1)}px`,
              backgroundColor: slot.dividerColor || 'rgba(255,255,255,0.1)',
            }}
          />
        );
      case 'spacer':
        return <div key={slot.id} style={{ height: slot.spacerHeight ?? 16 }} />;
      default:
        return null;
    }
  });

  return (
    <div className="w-full" style={{ maxWidth: instance.style.customWidth > 0 ? `${instance.style.customWidth}px` : '24rem' }}>
      <Card
        variant={instance.style.cardVariant}
        className={cn(motionClassName, 'overflow-hidden')}
        style={cardDirectStyle}
      >
        <CardContent
          style={{
            padding,
            display: 'flex',
            flexDirection: 'column',
            gap,
          }}
        >
          {renderedSlots}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Important:** `renderCardBuilder` calls `renderPreview` recursively for component slots. Make sure `renderPreview` is defined above or is a forward-declared function to avoid hoisting issues. The recursive call must not pass `motionClassName` to child slots (they have their own).

---

## 7. Export — `componentSnippet` in `render-preview.tsx`

Add a `cardBuilderMode` branch to the `case 'card':` export snippet:

```ts
case 'card': {
  if (instance.style.cardBuilderMode) {
    return buildCardBuilderSnippet(instance, previewStyle, styleMode, tokenSet);
  }
  // ... existing legacy snippet ...
}
```

`buildCardBuilderSnippet` should:
- Sort slots by `order`
- For each component slot: call `componentSnippet(slotInstance, slotStyle, undefined, styleMode, tokenSet)` recursively and indent the result
- For image/text/divider/spacer slots: generate inline JSX
- Wrap everything in `<Card ...><CardContent ...>{slots}</CardContent></Card>`
- Prepend any style variable declarations from child snippets, deduplicating by variable name

---

## 8. Slot Component Style Inspector (virtual instance approach)

When the user clicks `[⚙]` on a component slot in `CardSlotManager`, the component sets `activeSlotId` in local state. The parent inspector then renders a **virtual instance** for that slot:

```tsx
const virtualInstance: ComponentInstance = {
  id: `${cardInstance.id}::${slot.id}`,
  kind: slot.componentKind!,
  name: slot.componentLabel ?? slot.componentKind!,
  style: slot.componentStyle!,
};
```

Pass this to the existing `InspectorPanel` (or the appropriate sub-section renderer), but wire all `updateStyle` calls to `updateCardSlotComponentStyle(cardInstance.id, slot.id, patch)` instead of the normal `updateStyle`.

The cleanest way to do this: add an optional `onStyleChange` prop to the inspector controls that overrides the default Zustand dispatch. If `onStyleChange` is present, use it; otherwise fall back to the existing store dispatch.

---

## 9. Image slot controls in inspector

When an image slot is active, show:
- URL input (text field, with a placeholder `https://...`)
- Alt text input
- Aspect ratio select: `1/1`, `4/3`, `16/9`, `16/10`, `3/2`, `auto`
- Fit select: `cover`, `contain`, `fill`

---

## 10. Text slot controls in inspector

When a text slot is active, show:
- Content (textarea, single line)
- Tag select: `h1`, `h2`, `h3`, `h4`, `p`, `span`
- Font size (number, 10–96)
- Font weight (select: 300, 400, 500, 600, 700, 800)
- Color (colour picker — reuse `FlatColorControl`)
- Align (left/centre/right toggle)

---

## 11. TypeScript

Run `tsc --noEmit` after all changes. Fix all type errors before considering the task complete. Pay particular attention to:
- `CardSlot` being imported wherever `ComponentStyleConfig` is imported
- `cardSlots` and `cardBuilderMode` being present in `DEFAULT_STYLE` with correct types
- The recursive `renderPreview` call in `renderCardBuilder` — TypeScript may need the function to be hoisted or forward-declared

---

## 12. File change summary

| File | Change |
|---|---|
| `src/components/ui/ui-studio.types.ts` | Add `CardSlot`, `CardSlotType`, new fields on `ComponentStyleConfig` |
| `src/components/ui/ui-studio/constants.ts` | Add `cardSlots`, `cardBuilderMode`, `cardSlotPadding`, `cardSlotGap` to `DEFAULT_STYLE` |
| `src/components/ui/ui-studio/store.ts` | Add slot CRUD actions |
| `src/components/ui/ui-studio/inspector/CardSlotManager.tsx` | **New file** — slot list UI |
| `src/components/ui/ui-studio/inspector/InspectorPanel.tsx` | Mode toggle + conditional slot manager rendering |
| `src/components/ui/ui-studio/preview/render-preview.tsx` | `renderCardBuilder` function + `cardBuilderMode` branch in `case 'card':` |

Do not modify any other component kinds, other inspector sections, or any files outside this list unless strictly required to fix a TypeScript error.
