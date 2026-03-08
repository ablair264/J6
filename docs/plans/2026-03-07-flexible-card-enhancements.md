# Flexible Card Enhancements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the card component (all 3 kinds: `card`, `product-card`, `listing-card`) significantly more customisable — section reordering, icon slot, badge customisation, editable feature items, secondary button, and per-section font family — while keeping exported code clean and idiomatic.

**Architecture:** Extend existing `ComponentStyleConfig` with new card fields. No new component kinds or recursive rendering. The existing `CardSection[]` / `buildCardSectionStack()` pattern already supports reordering — we just need to make the order user-controllable. The icon slot, badge, feature items, and secondary button are new sections that plug into the same pattern.

**Tech Stack:** React, TypeScript, Zustand, Tailwind, Lucide icons (existing icon system via `getIconComponent`)

---

## Task 1: Types — New fields on `ComponentStyleConfig`

**Files:**
- Modify: `src/components/ui/ui-studio.types.ts`

**Step 1: Add new type and fields**

After line 572 (after `cardCtaText: string;`), add these fields to `ComponentStyleConfig`:

```ts
  // Card — icon slot
  cardShowIcon: boolean;
  cardIconName: IconOptionId;
  cardIconColor: string;
  cardIconSize: number;
  cardIconBgColor: string;
  cardIconBgEnabled: boolean;
  cardIconBgRadius: number;
  // Card — badge (all card types)
  cardBadgeColor: string;         // text color
  cardBadgeBgColor: string;       // background color
  cardBadgePosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  // Card — feature items
  cardFeatureItems: CardFeatureItem[];
  cardFeatureItemBgColor: string;
  cardFeatureItemTextColor: string;
  // Card — secondary button
  cardShowSecondaryButton: boolean;
  cardSecondaryButtonText: string;
  cardSecondaryButtonVariant: 'default' | 'outline' | 'ghost' | 'secondary';
  // Card — section ordering
  cardSectionOrder: string[];
  // Card — per-section font family
  cardTitleFontFamily: string;
  cardSubtitleFontFamily: string;
  cardBodyFontFamily: string;
  cardPriceFontFamily: string;
```

Also add this interface near the other card types (before `ComponentStyleConfig`):

```ts
export interface CardFeatureItem {
  id: string;
  label: string;
}
```

**Step 2: Verify types compile**

Run: `cd /Users/blair/Desktop/Development/ui-studio-oss && pnpm tsc --noEmit 2>&1 | head -30`
Expected: Errors about missing defaults in `constants.ts` (this is expected — we fix it in Task 2)

**Step 3: Commit**

```bash
git add src/components/ui/ui-studio.types.ts
git commit -m "feat(card): add types for icon slot, badge, features, secondary button, section order, per-section fonts"
```

---

## Task 2: Defaults — `constants.ts`

**Files:**
- Modify: `src/components/ui/ui-studio/constants.ts`

**Step 1: Add defaults to `DEFAULT_STYLE`**

After the listing card toggles block (after `cardCtaText: 'View Details',` around line 679), add:

```ts
    // Card — icon slot
    cardShowIcon: false,
    cardIconName: 'lightning' as IconOptionId,
    cardIconColor: '#3b82f6',
    cardIconSize: 24,
    cardIconBgColor: '#3b82f6',
    cardIconBgEnabled: true,
    cardIconBgRadius: 12,
    // Card — badge
    cardBadgeColor: '#ffffff',
    cardBadgeBgColor: '#ef4444',
    cardBadgePosition: 'top-right' as const,
    // Card — feature items
    cardFeatureItems: [],
    cardFeatureItemBgColor: '#1e293b',
    cardFeatureItemTextColor: '#94a3b8',
    // Card — secondary button
    cardShowSecondaryButton: false,
    cardSecondaryButtonText: '',
    cardSecondaryButtonVariant: 'outline' as const,
    // Card — section ordering
    cardSectionOrder: ['icon', 'image', 'badge-standalone', 'title', 'subtitle', 'features', 'body', 'price', 'actions'],
    // Card — per-section font family
    cardTitleFontFamily: '',
    cardSubtitleFontFamily: '',
    cardBodyFontFamily: '',
    cardPriceFontFamily: '',
```

Note: `IconOptionId` import may need to be added to the imports at the top of `constants.ts`.

**Step 2: Verify types compile**

Run: `cd /Users/blair/Desktop/Development/ui-studio-oss && pnpm tsc --noEmit 2>&1 | head -30`
Expected: PASS (or unrelated errors only)

**Step 3: Commit**

```bash
git add src/components/ui/ui-studio/constants.ts
git commit -m "feat(card): add defaults for new card enhancement fields"
```

---

## Task 3: Preview — Refactor `case 'card'` to use section ordering

**Files:**
- Modify: `src/components/ui/ui-studio/preview/render-preview.tsx`

This is the largest task. We need to:
1. Add the icon block, badge block (standalone, not on image), feature items block, and secondary button
2. Make `contentSections` order driven by `cardSectionOrder`
3. Add per-section font family to `buildCardTextStyle`
4. Load Google Fonts for per-section font families

**Step 1: Update `buildCardTextStyle` to accept fontFamily**

In the `case 'card':` branch, modify the existing `buildCardTextStyle` helper:

```ts
const buildCardTextStyle = (
    color: string,
    size: number,
    weight: number,
    align: ComponentStyleConfig['fontPosition'],
    fontFamily?: string,
) => ({
    color,
    fontSize: `${size}px`,
    fontWeight: weight,
    textAlign: align,
    width: '100%',
    ...(fontFamily ? { fontFamily } : {}),
} satisfies CSSProperties);
```

Update each call to pass the font family:
```ts
const titleStyle = buildCardTextStyle(s.cardTitleColor, s.cardTitleSize, s.cardTitleWeight, s.cardTitleAlign, s.cardTitleFontFamily);
const subtitleStyle = buildCardTextStyle(s.cardSubtitleColor, s.cardSubtitleSize, s.cardSubtitleWeight, s.cardSubtitleAlign, s.cardSubtitleFontFamily);
const bodyStyle = buildCardTextStyle(s.cardBodyColor, s.cardBodySize, s.cardBodyWeight, s.cardBodyAlign, s.cardBodyFontFamily);
const priceStyle = buildCardTextStyle(s.cardPriceColor, s.cardPriceSize, s.cardPriceWeight, s.cardPriceAlign, s.cardPriceFontFamily);
```

(Use `const s = instance.style;` alias for brevity — already common in this file.)

**Step 2: Load Google Fonts for per-section font families**

Near the top of the card case (or near the existing `loadGoogleFont` calls around line 1008), add:

```ts
if (s.cardTitleFontFamily) loadGoogleFont(s.cardTitleFontFamily);
if (s.cardSubtitleFontFamily) loadGoogleFont(s.cardSubtitleFontFamily);
if (s.cardBodyFontFamily) loadGoogleFont(s.cardBodyFontFamily);
if (s.cardPriceFontFamily) loadGoogleFont(s.cardPriceFontFamily);
```

**Step 3: Add icon block**

```ts
const iconBlock = s.cardShowIcon ? (() => {
    const IconComp = getIconComponent(s.cardIconName, s.iconLibrary);
    if (!IconComp) return null;
    const iconEl = <IconComp style={{ width: s.cardIconSize, height: s.cardIconSize, color: s.cardIconColor }} />;
    if (s.cardIconBgEnabled) {
        return (
            <div
                className="flex items-center justify-center"
                style={{
                    width: s.cardIconSize + 20,
                    height: s.cardIconSize + 20,
                    backgroundColor: hexToRgba(s.cardIconBgColor, 0.1),
                    borderRadius: s.cardIconBgRadius,
                }}
            >
                {iconEl}
            </div>
        );
    }
    return iconEl;
})() : null;
```

**Step 4: Add standalone badge block (for when there's no image)**

```ts
const standaloneBadgeBlock = (s.cardShowBadge || hasCardContent(s.cardBadgeText)) && !showImage ? (
    <span
        className="inline-block self-start rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide"
        style={{ color: s.cardBadgeColor, backgroundColor: s.cardBadgeBgColor }}
    >
        {s.cardBadgeText}
    </span>
) : null;
```

**Step 5: Add feature items block**

```ts
const featureItemsBlock = s.cardFeatureItems.length > 0 ? (
    <div className="flex flex-wrap gap-1.5">
        {s.cardFeatureItems.map((item) => (
            <span
                key={item.id}
                className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                style={{ backgroundColor: s.cardFeatureItemBgColor, color: s.cardFeatureItemTextColor }}
            >
                {item.label}
            </span>
        ))}
    </div>
) : null;
```

**Step 6: Update action block with secondary button**

```ts
const actionBlock = (showToggle || showButton || s.cardShowSecondaryButton) ? (
    <div className={cn('flex w-full flex-col gap-3', actionAlignment)}>
        {showToggle ? (
            <div className="flex w-full items-center justify-between gap-3">
                <span style={bodyStyle}>{s.cardToggleText}</span>
                <Switch defaultChecked />
            </div>
        ) : null}
        {(showButton || s.cardShowSecondaryButton) ? (
            <div className={cn('flex w-full gap-2', showButton && s.cardShowSecondaryButton ? '' : '')}>
                {showButton ? (
                    <Button size="sm" className="flex-1">{s.cardButtonText}</Button>
                ) : null}
                {s.cardShowSecondaryButton && hasCardContent(s.cardSecondaryButtonText) ? (
                    <Button size="sm" variant={s.cardSecondaryButtonVariant} className={showButton ? '' : 'flex-1'}>
                        {s.cardSecondaryButtonText}
                    </Button>
                ) : null}
            </div>
        ) : null}
    </div>
) : null;
```

**Step 7: Update image block with badge overlay (customisable colors + position)**

```ts
const badgePositionClass = {
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    'bottom-right': 'bottom-3 right-3',
}[s.cardBadgePosition];

const imageBlock = showImage ? (
    <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img src={s.cardImageSrc} alt="Card" className="h-full w-full object-cover" />
        {hasCardContent(s.cardBadgeText) && (
            <span
                className={cn('absolute rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide shadow-sm', badgePositionClass)}
                style={{ color: s.cardBadgeColor, backgroundColor: s.cardBadgeBgColor }}
            >
                {s.cardBadgeText}
            </span>
        )}
    </div>
) : null;
```

**Step 8: Build ordered content sections**

Replace the hardcoded `contentSections` array with an order-driven approach:

```ts
const sectionMap: Record<string, CardSection> = {
    'icon': { key: 'icon', node: iconBlock },
    'badge-standalone': { key: 'badge-standalone', node: standaloneBadgeBlock },
    'title': { key: 'title', node: showTitle ? <h3 style={titleStyle}>{s.cardTitleText}</h3> : null },
    'subtitle': { key: 'subtitle', node: showSubtitle ? <p style={subtitleStyle}>{s.cardSubtitleText}</p> : null },
    'features': { key: 'features', node: featureItemsBlock },
    'body': { key: 'body', node: showBody ? <p style={bodyStyle}>{s.cardBodyText}</p> : null },
    'price': { key: 'price', node: priceBlock },
    'actions': { key: 'actions', node: actionBlock },
};

const order = s.cardSectionOrder.length > 0
    ? s.cardSectionOrder
    : ['icon', 'badge-standalone', 'title', 'subtitle', 'features', 'body', 'price', 'actions'];

const contentSections: CardSection[] = order
    .map((key) => sectionMap[key])
    .filter((section): section is CardSection => section !== undefined);
```

Remove the old hardcoded `contentSections` array. Keep the `cardSections` (top-level with image-top/content/image-bottom) as-is — `image` position is still controlled by `cardImagePosition`, not the section order. The section order only controls what goes *inside* `CardContent`.

**Step 9: Verify it renders**

Run: `cd /Users/blair/Desktop/Development/ui-studio-oss && pnpm tsc --noEmit 2>&1 | head -30`
Expected: PASS

**Step 10: Commit**

```bash
git add src/components/ui/ui-studio/preview/render-preview.tsx
git commit -m "feat(card): section ordering, icon slot, badge, features, secondary button, per-section fonts in preview"
```

---

## Task 4: Preview — Apply same enhancements to `product-card` and `listing-card`

**Files:**
- Modify: `src/components/ui/ui-studio/preview/render-preview.tsx`

Apply the same patterns from Task 3 to both `case 'product-card':` and `case 'listing-card':` branches:

1. Update `buildCardTextStyle` in each to accept `fontFamily` parameter
2. Pass per-section font families to each text style
3. Add icon block support
4. Use customisable badge colors/position (listing card already has badge — replace hardcoded `bg-red-500` with `s.cardBadgeBgColor` / `s.cardBadgeColor`)
5. Add feature items block
6. Add secondary button alongside existing primary
7. Apply section ordering using the same `sectionMap` + `cardSectionOrder` pattern
8. Load Google Fonts for per-section font families

For listing card specifically:
- Replace hardcoded specs chips with `cardFeatureItems` (fall back to the existing 3 dummy chips if `cardFeatureItems` is empty AND `cardShowSpecs` is true)
- Replace hardcoded `bg-red-500` badge with `s.cardBadgeBgColor`/`s.cardBadgeColor`

**Step 1: Implement changes**

Follow the same patterns as Task 3 for both card kinds. Use `const s = instance.style;` alias.

**Step 2: Verify**

Run: `cd /Users/blair/Desktop/Development/ui-studio-oss && pnpm tsc --noEmit 2>&1 | head -30`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/ui/ui-studio/preview/render-preview.tsx
git commit -m "feat(card): apply enhancements to product-card and listing-card previews"
```

---

## Task 5: Inspector — Card icon slot controls

**Files:**
- Modify: `src/components/ui/ui-studio/inspector/InspectorPanel.tsx`

**Step 1: Add Icon subsection to all 3 card config sections**

In the `card` config section (around line 2150), add an "Icon" subsection before the existing "Image" subsection:

```tsx
<CardConfigSubsection title="Icon" defaultOpen={selectedStyle.cardShowIcon}>
    <FlatSwitchRow label="Show icon" checked={selectedStyle.cardShowIcon} onCheckedChange={(value) => updateSelectedStyle('cardShowIcon', value)} />
    {selectedStyle.cardShowIcon ? (
        <>
            <FlatField label="Icon Library" stacked>
                <FlatSelect
                    value={selectedStyle.iconLibrary}
                    onValueChange={(value) => {
                        const nextLibrary = value as IconLibrary;
                        updateSelectedStyle('iconLibrary', nextLibrary);
                    }}
                    ariaLabel="Icon library"
                >
                    {ICON_LIBRARY_OPTIONS.filter(o => o.id !== 'custom').map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                </FlatSelect>
            </FlatField>
            <FlatField label="Icon" stacked>
                <FlatSelect
                    value={selectedStyle.cardIconName}
                    onValueChange={(value) => updateSelectedStyle('cardIconName', value as IconOptionId)}
                    ariaLabel="Card icon"
                >
                    {getIconOptionsForLibrary(selectedStyle.iconLibrary)
                        .filter((option) => option.id !== 'none')
                        .map((option) => (<option key={option.id} value={option.id}>{option.label}</option>))}
                </FlatSelect>
            </FlatField>
            <div className="flex flex-wrap items-start gap-3">
                <FlatColorControl label="Icon Color" value={selectedStyle.cardIconColor} onChange={(value) => updateSelectedStyle('cardIconColor', value)} tokens={activeTokenSet.tokens} />
                <FlatUnitField label="Size" value={selectedStyle.cardIconSize} min={12} max={48} unit="px" onChange={(value) => updateSelectedStyle('cardIconSize', value)} />
            </div>
            <FlatSwitchRow label="Background" checked={selectedStyle.cardIconBgEnabled} onCheckedChange={(value) => updateSelectedStyle('cardIconBgEnabled', value)} />
            {selectedStyle.cardIconBgEnabled ? (
                <div className="flex flex-wrap items-start gap-3">
                    <FlatColorControl label="Bg Color" value={selectedStyle.cardIconBgColor} onChange={(value) => updateSelectedStyle('cardIconBgColor', value)} tokens={activeTokenSet.tokens} />
                    <FlatUnitField label="Radius" value={selectedStyle.cardIconBgRadius} min={0} max={24} unit="px" onChange={(value) => updateSelectedStyle('cardIconBgRadius', value)} />
                </div>
            ) : null}
        </>
    ) : null}
</CardConfigSubsection>
```

Add the same Icon subsection to `product-card` and `listing-card` config sections.

**Step 2: Verify**

Run: `cd /Users/blair/Desktop/Development/ui-studio-oss && pnpm tsc --noEmit 2>&1 | head -30`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/ui/ui-studio/inspector/InspectorPanel.tsx
git commit -m "feat(card): add icon slot inspector controls for all card types"
```

---

## Task 6: Inspector — Badge customisation controls

**Files:**
- Modify: `src/components/ui/ui-studio/inspector/InspectorPanel.tsx`

**Step 1: Add Badge subsection to generic card and product card configs**

These currently don't have badge support. Add after the Icon subsection:

```tsx
<CardConfigSubsection title="Badge" defaultOpen={Boolean(selectedStyle.cardBadgeText?.trim())}>
    <FlatField label="Badge Text" stacked>
        <input
            type="text"
            value={selectedStyle.cardBadgeText}
            onChange={(event) => updateSelectedStyles({
                cardBadgeText: event.target.value,
                cardShowBadge: event.target.value.trim().length > 0,
            })}
            className={studioInputClass}
            placeholder="Leave empty to hide badge"
        />
    </FlatField>
    {hasCardContent(selectedStyle.cardBadgeText) ? (
        <>
            <div className="flex flex-wrap items-start gap-3">
                <FlatColorControl label="Text Color" value={selectedStyle.cardBadgeColor} onChange={(value) => updateSelectedStyle('cardBadgeColor', value)} tokens={activeTokenSet.tokens} />
                <FlatColorControl label="Background" value={selectedStyle.cardBadgeBgColor} onChange={(value) => updateSelectedStyle('cardBadgeBgColor', value)} tokens={activeTokenSet.tokens} />
            </div>
            <FlatField label="Position" stacked>
                <FlatSelect value={selectedStyle.cardBadgePosition} onValueChange={(value) => updateSelectedStyle('cardBadgePosition', value as ComponentStyleConfig['cardBadgePosition'])} ariaLabel="Badge position">
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                </FlatSelect>
            </FlatField>
        </>
    ) : null}
</CardConfigSubsection>
```

For the listing card, update the existing badge subsection to add color/position controls (it currently only has text input).

**Step 2: Verify and commit**

```bash
pnpm tsc --noEmit
git add src/components/ui/ui-studio/inspector/InspectorPanel.tsx
git commit -m "feat(card): add badge customisation controls (color, position) for all card types"
```

---

## Task 7: Inspector — Feature items controls

**Files:**
- Modify: `src/components/ui/ui-studio/inspector/InspectorPanel.tsx`

**Step 1: Add Feature Items subsection to all card configs**

```tsx
<CardConfigSubsection title="Feature Tags" defaultOpen={selectedStyle.cardFeatureItems.length > 0}>
    <div className="space-y-2">
        {selectedStyle.cardFeatureItems.map((item, index) => (
            <div key={item.id} className="flex items-center gap-1.5">
                <input
                    type="text"
                    value={item.label}
                    onChange={(event) => {
                        const updated = [...selectedStyle.cardFeatureItems];
                        updated[index] = { ...item, label: event.target.value };
                        updateSelectedStyle('cardFeatureItems', updated);
                    }}
                    className={cn(studioInputClass, 'flex-1')}
                    placeholder="Tag label"
                />
                <button
                    type="button"
                    onClick={() => {
                        const updated = selectedStyle.cardFeatureItems.filter((_, i) => i !== index);
                        updateSelectedStyle('cardFeatureItems', updated);
                    }}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm border border-white/10 text-[var(--inspector-muted-text)] transition hover:border-white/20 hover:text-[var(--inspector-text)]"
                >
                    <X className="size-3.5" />
                </button>
            </div>
        ))}
        <button
            type="button"
            onClick={() => {
                const newItem: CardFeatureItem = { id: crypto.randomUUID().slice(0, 8), label: 'New tag' };
                updateSelectedStyle('cardFeatureItems', [...selectedStyle.cardFeatureItems, newItem]);
            }}
            className="inline-flex h-7 w-full items-center justify-center rounded-sm border border-dashed border-white/10 text-[11px] font-medium text-[var(--inspector-muted-text)] transition hover:border-white/20 hover:text-[var(--inspector-text)]"
        >
            + Add tag
        </button>
    </div>
    {selectedStyle.cardFeatureItems.length > 0 ? (
        <div className="flex flex-wrap items-start gap-3">
            <FlatColorControl label="Tag Background" value={selectedStyle.cardFeatureItemBgColor} onChange={(value) => updateSelectedStyle('cardFeatureItemBgColor', value)} tokens={activeTokenSet.tokens} />
            <FlatColorControl label="Tag Text" value={selectedStyle.cardFeatureItemTextColor} onChange={(value) => updateSelectedStyle('cardFeatureItemTextColor', value)} tokens={activeTokenSet.tokens} />
        </div>
    ) : null}
</CardConfigSubsection>
```

Import `CardFeatureItem` from the types file. Import `X` from lucide-react if not already imported.

Add the same subsection to all 3 card type inspector sections.

**Step 2: Verify and commit**

```bash
pnpm tsc --noEmit
git add src/components/ui/ui-studio/inspector/InspectorPanel.tsx
git commit -m "feat(card): add feature items inspector controls with add/remove/edit"
```

---

## Task 8: Inspector — Secondary button controls

**Files:**
- Modify: `src/components/ui/ui-studio/inspector/InspectorPanel.tsx`

**Step 1: Extend the existing Actions subsection in all card configs**

In the generic card Actions subsection (around line 2178), after the existing "Button Text" field, add:

```tsx
<FlatField label="Secondary Button" stacked>
    <input
        type="text"
        value={selectedStyle.cardSecondaryButtonText}
        onChange={(event) => updateSelectedStyles({
            cardSecondaryButtonText: event.target.value,
            cardShowSecondaryButton: event.target.value.trim().length > 0,
        })}
        className={studioInputClass}
        placeholder="Leave empty to hide"
    />
</FlatField>
{selectedStyle.cardShowSecondaryButton && hasCardContent(selectedStyle.cardSecondaryButtonText) ? (
    <FlatField label="Secondary Variant" stacked>
        <FlatSelect value={selectedStyle.cardSecondaryButtonVariant} onValueChange={(value) => updateSelectedStyle('cardSecondaryButtonVariant', value as ComponentStyleConfig['cardSecondaryButtonVariant'])} ariaLabel="Secondary button variant">
            <option value="default">Default</option>
            <option value="outline">Outline</option>
            <option value="ghost">Ghost</option>
            <option value="secondary">Secondary</option>
        </FlatSelect>
    </FlatField>
) : null}
```

Add similar controls to product-card and listing-card Actions/Footer sections.

**Step 2: Verify and commit**

```bash
pnpm tsc --noEmit
git add src/components/ui/ui-studio/inspector/InspectorPanel.tsx
git commit -m "feat(card): add secondary button inspector controls"
```

---

## Task 9: Inspector — Per-section font family controls

**Files:**
- Modify: `src/components/ui/ui-studio/inspector/InspectorPanel.tsx`

**Step 1: Add font family select to `CardTypographyControls`**

Add an optional `fontFamily` + `onFontFamilyChange` prop to the `CardTypographyControls` component:

```tsx
function CardTypographyControls({
    // ... existing props ...
    fontFamily,
    onFontFamilyChange,
}: {
    // ... existing types ...
    fontFamily?: string;
    onFontFamilyChange?: (value: string) => void;
}) {
```

Inside the component's return, add a Font select above the existing Size/Weight fields (only render if `onFontFamilyChange` is provided):

```tsx
{onFontFamilyChange ? (
    <FlatField label="Font" stacked>
        <FlatSelect value={fontFamily ?? ''} onValueChange={onFontFamilyChange} ariaLabel={`${title} font family`}>
            {GOOGLE_FONTS.map((font) => (<option key={font.id} value={font.id}>{font.label}</option>))}
        </FlatSelect>
    </FlatField>
) : null}
```

**Step 2: Pass font family props in all card typography control usages**

For each `<CardTypographyControls>` in the 3 card config sections, add:

```tsx
fontFamily={selectedStyle.cardTitleFontFamily}
onFontFamilyChange={(value) => updateSelectedStyle('cardTitleFontFamily', value)}
```

(Adjust field name per section: `cardTitleFontFamily`, `cardSubtitleFontFamily`, `cardBodyFontFamily`, `cardPriceFontFamily`)

**Step 3: Verify and commit**

```bash
pnpm tsc --noEmit
git add src/components/ui/ui-studio/inspector/InspectorPanel.tsx
git commit -m "feat(card): add per-section font family controls to card typography"
```

---

## Task 10: Inspector — Section reordering controls

**Files:**
- Modify: `src/components/ui/ui-studio/inspector/InspectorPanel.tsx`

**Step 1: Add Section Order subsection to all card configs**

Add after the Dividers subsection:

```tsx
<CardConfigSubsection title="Section Order" defaultOpen={false}>
    <div className="space-y-1">
        {selectedStyle.cardSectionOrder.map((sectionKey, index) => (
            <div key={sectionKey} className="flex items-center gap-1">
                <span className="flex-1 truncate text-[11px] text-[var(--inspector-text)]">
                    {sectionKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
                <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => {
                        const order = [...selectedStyle.cardSectionOrder];
                        [order[index - 1], order[index]] = [order[index], order[index - 1]];
                        updateSelectedStyle('cardSectionOrder', order);
                    }}
                    className="inline-flex size-6 items-center justify-center rounded-sm text-[var(--inspector-muted-text)] transition hover:text-[var(--inspector-text)] disabled:opacity-30"
                >
                    <ChevronUp className="size-3.5" />
                </button>
                <button
                    type="button"
                    disabled={index === selectedStyle.cardSectionOrder.length - 1}
                    onClick={() => {
                        const order = [...selectedStyle.cardSectionOrder];
                        [order[index], order[index + 1]] = [order[index + 1], order[index]];
                        updateSelectedStyle('cardSectionOrder', order);
                    }}
                    className="inline-flex size-6 items-center justify-center rounded-sm text-[var(--inspector-muted-text)] transition hover:text-[var(--inspector-text)] disabled:opacity-30"
                >
                    <ChevronDown className="size-3.5" />
                </button>
            </div>
        ))}
    </div>
    <p className="text-[10px] text-[var(--inspector-muted-text)]">
        Reorder content sections within the card. Image position is controlled separately.
    </p>
</CardConfigSubsection>
```

Make sure `ChevronUp` and `ChevronDown` are imported from `lucide-react`.

Add to all 3 card config sections.

**Step 2: Verify and commit**

```bash
pnpm tsc --noEmit
git add src/components/ui/ui-studio/inspector/InspectorPanel.tsx
git commit -m "feat(card): add section reordering inspector controls"
```

---

## Task 11: Export — Update `componentSnippet` for all 3 card types

**Files:**
- Modify: `src/components/ui/ui-studio/preview/render-preview.tsx`

**Step 1: Update `case 'card':` export snippet**

The current export is simple string concatenation. Update it to:
- Respect section ordering (`cardSectionOrder`)
- Include icon block in export (import the icon component)
- Include badge (on image or standalone)
- Include feature items
- Include secondary button
- Include per-section font family as inline style

Build a `sectionSnippetMap` keyed by section name, then iterate `cardSectionOrder` to assemble:

```ts
case 'card': {
    const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
    const s = instance.style;
    const cardProps = [
        s.cardVariant !== 'default' ? `variant="${s.cardVariant}"` : '',
        `className="overflow-hidden"`,
        classNameSnippet.trim(),
    ].filter(Boolean).join('\n  ');

    // Icon snippet
    const iconSnippet = s.cardShowIcon
        ? s.cardIconBgEnabled
            ? `    <div className="flex h-11 w-11 items-center justify-center" style={{ backgroundColor: '${hexToRgba(s.cardIconBgColor, 0.1)}', borderRadius: ${s.cardIconBgRadius} }}>\n      <${getIconExportName(s.cardIconName, s.iconLibrary)} className="h-6 w-6" style={{ color: '${s.cardIconColor}' }} />\n    </div>`
            : `    <${getIconExportName(s.cardIconName, s.iconLibrary)} className="h-6 w-6" style={{ color: '${s.cardIconColor}' }} />`
        : '';

    // Badge snippet (standalone — no image)
    const standaloneBadgeSnippet = hasCardContent(s.cardBadgeText) && !hasCardContent(s.cardImageSrc)
        ? `    <span className="inline-block self-start rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide" style={{ color: '${s.cardBadgeColor}', backgroundColor: '${s.cardBadgeBgColor}' }}>${s.cardBadgeText}</span>`
        : '';

    // Feature items snippet
    const featuresSnippet = s.cardFeatureItems.length > 0
        ? `    <div className="flex flex-wrap gap-1.5">\n${s.cardFeatureItems.map(
            (item) => `      <span className="rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: '${s.cardFeatureItemBgColor}', color: '${s.cardFeatureItemTextColor}' }}>${item.label}</span>`
          ).join('\n')}\n    </div>`
        : '';

    // Text section helpers
    const buildTextSnippet = (tag: string, text: string, fontFamily: string, className: string) => {
        const styleObj = fontFamily ? ` style={{ fontFamily: '${fontFamily}' }}` : '';
        return `    <${tag} className="${className}"${styleObj}>${text}</${tag}>`;
    };

    // Section snippet map
    const sectionSnippets: Record<string, string> = {
        'icon': iconSnippet,
        'badge-standalone': standaloneBadgeSnippet,
        'title': hasCardContent(s.cardTitleText) ? buildTextSnippet('h3', s.cardTitleText, s.cardTitleFontFamily, 'text-lg font-semibold') : '',
        'subtitle': hasCardContent(s.cardSubtitleText) ? buildTextSnippet('p', s.cardSubtitleText, s.cardSubtitleFontFamily, 'text-sm text-muted-foreground') : '',
        'features': featuresSnippet,
        'body': hasCardContent(s.cardBodyText) ? buildTextSnippet('p', s.cardBodyText, s.cardBodyFontFamily, 'text-sm text-muted-foreground') : '',
        'price': hasCardContent(s.cardPriceText)
            ? `    <div className="text-2xl font-bold"${s.cardPriceFontFamily ? ` style={{ fontFamily: '${s.cardPriceFontFamily}' }}` : ''}>${s.cardPriceText}</div>`
            : '',
        'actions': [
            hasCardContent(s.cardToggleText) ? `    <div className="flex items-center justify-between">\n      <span className="text-sm">${s.cardToggleText}</span>\n      <Switch />\n    </div>` : '',
            hasCardContent(s.cardButtonText) && s.cardShowSecondaryButton && hasCardContent(s.cardSecondaryButtonText)
                ? `    <div className="flex gap-2">\n      <Button size="sm" className="flex-1">${s.cardButtonText}</Button>\n      <Button size="sm" variant="${s.cardSecondaryButtonVariant}">${s.cardSecondaryButtonText}</Button>\n    </div>`
                : hasCardContent(s.cardButtonText)
                    ? `    <Button size="sm" className="w-full">${s.cardButtonText}</Button>`
                    : s.cardShowSecondaryButton && hasCardContent(s.cardSecondaryButtonText)
                        ? `    <Button size="sm" variant="${s.cardSecondaryButtonVariant}" className="w-full">${s.cardSecondaryButtonText}</Button>`
                        : '',
        ].filter(Boolean).join('\n'),
    };

    const order = s.cardSectionOrder.length > 0
        ? s.cardSectionOrder
        : ['icon', 'badge-standalone', 'title', 'subtitle', 'features', 'body', 'price', 'actions'];

    const contentParts = order.map((key) => sectionSnippets[key] ?? '').filter(Boolean);

    // Image with badge overlay
    const badgePos = { 'top-left': 'top-3 left-3', 'top-right': 'top-3 right-3', 'bottom-left': 'bottom-3 left-3', 'bottom-right': 'bottom-3 right-3' }[s.cardBadgePosition];
    const imageSnippet = hasCardContent(s.cardImageSrc)
        ? hasCardContent(s.cardBadgeText)
            ? `\n  <div className="relative aspect-[16/10] w-full overflow-hidden">\n    <img src="/placeholder.jpg" alt="Card" className="h-full w-full object-cover" />\n    <span className="absolute ${badgePos} rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide" style={{ color: '${s.cardBadgeColor}', backgroundColor: '${s.cardBadgeBgColor}' }}>${s.cardBadgeText}</span>\n  </div>`
            : `\n  <img src="/placeholder.jpg" alt="Card" className="aspect-[16/10] w-full object-cover" />`
        : '';

    const contentSnippet = contentParts.length > 0
        ? `\n  <CardContent className="space-y-3">\n${contentParts.join('\n')}\n  </CardContent>`
        : '';

    return `${declarations ? `${declarations}\n\n` : ''}<Card${cardProps ? `\n  ${cardProps}` : ''}${previewStyleSnippet}\n>${imageSnippet}${contentSnippet}\n</Card>`;
}
```

Note: You'll need a small helper `getIconExportName(iconId, library)` that returns the import-friendly name (e.g. `'Zap'` for `'lightning'` in lucide). Check if this already exists in the codebase — if not, add it near the icon utility functions.

**Step 2: Update product-card and listing-card export snippets similarly**

Apply the same pattern — ordered sections, icon, badge colors, feature items, secondary button, per-section font families.

**Step 3: Verify and commit**

```bash
pnpm tsc --noEmit
git add src/components/ui/ui-studio/preview/render-preview.tsx
git commit -m "feat(card): update export snippets with new card features and section ordering"
```

---

## Task 12: Final verification

**Files:** All modified files

**Step 1: Full type check**

Run: `cd /Users/blair/Desktop/Development/ui-studio-oss && pnpm tsc --noEmit`
Expected: PASS with 0 errors

**Step 2: Dev server test**

Run: `cd /Users/blair/Desktop/Development/ui-studio-oss && pnpm dev`

Manual checks:
- [ ] Create a new `card` instance — verify default rendering unchanged
- [ ] Toggle icon on — verify icon renders with background
- [ ] Change icon, color, size — verify preview updates
- [ ] Add badge text — verify badge appears on image (or standalone if no image)
- [ ] Change badge color/position — verify
- [ ] Add 3 feature tags — verify they render as styled chips
- [ ] Add secondary button text — verify two buttons render side by side
- [ ] Change section order via up/down arrows — verify preview reorders
- [ ] Set a per-section font family (e.g. Playfair Display on title) — verify it loads and renders
- [ ] Export code — verify clean JSX output
- [ ] Repeat key checks for `product-card` and `listing-card`

**Step 3: Commit**

```bash
git add -A
git commit -m "feat(card): flexible card enhancements complete — icon, badge, features, secondary button, section order, per-section fonts"
```

---

## File Change Summary

| File | Changes |
|---|---|
| `src/components/ui/ui-studio.types.ts` | `CardFeatureItem` interface, 17 new fields on `ComponentStyleConfig` |
| `src/components/ui/ui-studio/constants.ts` | Defaults for all new fields |
| `src/components/ui/ui-studio/preview/render-preview.tsx` | Preview rendering (3 card types) + export snippets (3 card types) |
| `src/components/ui/ui-studio/inspector/InspectorPanel.tsx` | Icon, badge, feature items, secondary button, section order, per-section font controls (3 card types) + `CardTypographyControls` font family prop |

No new files. No changes to other component kinds.
