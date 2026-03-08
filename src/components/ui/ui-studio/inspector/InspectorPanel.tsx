import { useEffect, useMemo, type ChangeEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, ChevronUp, Minus, SlidersHorizontal, X } from 'lucide-react';
import {
    Config,
    Delete,
    EditOne,
    Moon,
    Plus,
    Ruler,
    Sparkles,
    Swatches,
    Table,
    TextAlignCenter,
    TextAlignLeft,
    TextAlignRight,
    TypeBold,
    TypeItalic,
    TypeUnderline,
} from '@mynaui/icons-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { StudioColorToken } from '@/components/ui/token-sets';
import type {
    AnimatedTextSplitBy,
    AnimatedTextTrigger,
    AnimatedTextVariant,
    ButtonPreviewState,
    ComponentInstance,
    ComponentStyleConfig,
    FillMode,
    FontPosition,
    IconLibrary,
    IconOptionId,
    CardFeatureItem,
} from '@/components/ui/ui-studio.types';
import {
    GOOGLE_FONTS,
    ICON_LIBRARY_OPTIONS,
    LUCIDE_ICON_OPTIONS,
    STUDIO_ICON_OPTIONS,
} from '../constants';
import {
    buildKindTitle,
    getComponentVisualPreset,
    getComponentVisualPresets,
    supportsElevationShadowEffect,
    supportsFrostedTintEffect,
    supportsGradientBorderEffect,
    supportsGrainEffect,
    supportsNeumorphicEffect,
    supportsRadialGlowEffect,
    supportsDropdownHoverStyle,
    supportsIconSelection,
    supportsStateStyles,
    supportsTypographyStyle,
} from '../utilities';
import { getInspectorLayout } from './inspector-registry';
import {
    useStudioStore,
    selectSelectedInstance,
    selectActiveTokenSet,
    selectSelectedStyle,
    resolveStateStyle,
} from '../store';
import {
    FlatColorControl,
    FlatElementSubsection,
    FlatField,
    FlatInspectorSection,
    FlatSelect,
    FlatSwitchRow,
    FlatUnitField,
    MiniNumberField,
} from './index';

const studioInputClass =
    'ui-studio-inspector-input h-7 w-full rounded-md border-[var(--inspector-border-soft)] bg-[var(--inspector-input)] px-2 text-[12px] text-[var(--inspector-text)] outline-none transition placeholder:text-[color:var(--inspector-muted-text)]/80 focus-visible:border-[var(--inspector-border-strong)]';
const inspectorChoiceButtonBase = 'h-6 flex-1 rounded-sm px-2 text-[12px] font-medium transition-colors';
const inspectorChoiceButtonActive = 'bg-white/[0.10] text-[#eef5ff] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]';
const inspectorChoiceButtonIdle = 'text-[#7f8ca3] hover:bg-white/[0.03] hover:text-[#dfe7f5]';
const inspectorIconChoiceButtonBase = 'inline-flex h-7 flex-1 items-center justify-center rounded-lg transition-colors';
const cardWeightOptions = [300, 400, 500, 600, 700] as const;
const cardKinds = ['card', 'product-card', 'listing-card'] as const;
const switchTrackPadding = 1;
const switchThumbInputMax = 40;

function getSwitchDefaults(size: ComponentStyleConfig['size']) {
    if (size === 'sm') {
        return { trackWidth: 24, trackHeight: 14 };
    }
    return { trackWidth: 32, trackHeight: 18 };
}

function getSwitchThumbLimits(style: ComponentStyleConfig) {
    const defaults = getSwitchDefaults(style.size);
    const trackWidth = style.switchCustomWidth > 0 ? style.switchCustomWidth : defaults.trackWidth;
    const trackHeight = style.switchCustomHeight > 0 ? style.switchCustomHeight : defaults.trackHeight;
    const borderWidth = Math.max(0, style.switchTrackBorderWidth);
    const maxWidth = Math.max(0, trackWidth - (switchTrackPadding * 2) - (borderWidth * 2));
    const maxHeight = Math.max(0, trackHeight - (switchTrackPadding * 2) - (borderWidth * 2));

    return {
        maxWidth: Math.min(switchThumbInputMax, maxWidth),
        maxHeight: Math.min(switchThumbInputMax, maxHeight),
    };
}

function CardConfigSubsection({
    title,
    children,
    defaultOpen = false,
}: {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
}) {
    return (
        <FlatElementSubsection title={title} defaultOpen={defaultOpen}>
            {children}
        </FlatElementSubsection>
    );
}

function CardImageDropzone({
    inputId,
    value,
    onChange,
    onClear,
}: {
    inputId: string;
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
}) {
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                onChange(reader.result);
            }
        };
        reader.readAsDataURL(file);
        event.currentTarget.value = '';
    };

    return (
        <div className="space-y-2">
            <label
                htmlFor={inputId}
                className={cn(
                    'flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[var(--inspector-border)] bg-[var(--inspector-input-bg)] px-3 py-4 text-center transition hover:border-[var(--inspector-border-strong)]',
                    value && 'overflow-hidden p-1',
                )}
            >
                <input id={inputId} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                {value ? (
                    <img src={value} alt="Card preview" className="h-full max-h-[168px] w-full rounded-sm object-cover" />
                ) : (
                    <div className="space-y-1">
                        <p className="text-[12px] font-medium text-[var(--inspector-text)]">Upload Image</p>
                        <p className="text-[11px] text-[var(--inspector-muted-text)]">Click to add artwork</p>
                    </div>
                )}
            </label>
            {value ? (
                <button
                    type="button"
                    onClick={onClear}
                    className="inline-flex h-7 items-center rounded-sm border border-white/10 px-2 text-[11px] font-medium text-[var(--inspector-muted-text)] transition hover:border-white/20 hover:text-[var(--inspector-text)]"
                >
                    Remove image
                </button>
            ) : null}
        </div>
    );
}

function CardTypographyControls({
    title,
    textValue,
    color,
    size,
    weight,
    align,
    sizeMin,
    sizeMax,
    tokens,
    defaultOpen = false,
    textPlaceholder,
    children,
    fontFamily,
    onTextChange,
    onColorChange,
    onSizeChange,
    onWeightChange,
    onAlignChange,
    onFontFamilyChange,
}: {
    title: string;
    textValue: string;
    color: string;
    size: number;
    weight: number;
    align: FontPosition;
    sizeMin: number;
    sizeMax: number;
    tokens: StudioColorToken[];
    defaultOpen?: boolean;
    textPlaceholder: string;
    children?: ReactNode;
    fontFamily?: string;
    onTextChange: (value: string) => void;
    onColorChange: (value: string) => void;
    onSizeChange: (value: number) => void;
    onWeightChange: (value: number) => void;
    onAlignChange: (value: FontPosition) => void;
    onFontFamilyChange?: (value: string) => void;
}) {
    return (
        <CardConfigSubsection title={`${title} Typography`} defaultOpen={defaultOpen}>
            <FlatField label="Text" stacked>
                <input
                    type="text"
                    value={textValue}
                    onChange={(event) => onTextChange(event.target.value)}
                    className={studioInputClass}
                    placeholder={textPlaceholder}
                />
            </FlatField>
            <FlatColorControl label="Color" value={color} onChange={onColorChange} tokens={tokens} />
            {onFontFamilyChange ? (
                <FlatField label="Font" stacked>
                    <FlatSelect value={fontFamily ?? ''} onValueChange={onFontFamilyChange} ariaLabel={`${title} font family`}>
                        {GOOGLE_FONTS.map((font) => (<option key={font.id} value={font.id}>{font.label}</option>))}
                    </FlatSelect>
                </FlatField>
            ) : null}
            <FlatUnitField label="Size" value={size} min={sizeMin} max={sizeMax} unit="px" onChange={onSizeChange} />
            <FlatField label="Weight" stacked>
                <FlatSelect value={weight} onValueChange={(value) => onWeightChange(Number(value))} ariaLabel={`${title} weight`}>
                    {cardWeightOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </FlatSelect>
            </FlatField>
            <FlatField label="Alignment" stacked>
                <FlatSelect value={align} onValueChange={(value) => onAlignChange(value as FontPosition)} ariaLabel={`${title} alignment`}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </FlatSelect>
            </FlatField>
            {children}
        </CardConfigSubsection>
    );
}

export function InspectorPanel() {
    const selectedInstance = useStudioStore(selectSelectedInstance);
    const selectedStyle = useStudioStore(selectSelectedStyle);
    const activeTokenSet = useStudioStore(selectActiveTokenSet);
    const editingVariantId = useStudioStore((s) => s.editingVariantId);
    const setEditingVariantId = useStudioStore((s) => s.setEditingVariantId);
    const editingVariantName = useStudioStore((s) => s.editingVariantName);
    const setEditingVariantName = useStudioStore((s) => s.setEditingVariantName);
    const effectsBuilderOpen = useStudioStore((s) => s.effectsBuilderOpen);
    const setEffectsBuilderOpen = useStudioStore((s) => s.setEffectsBuilderOpen);
    const pendingEffectId = useStudioStore((s) => s.pendingEffectId);
    const setPendingEffectId = useStudioStore((s) => s.setPendingEffectId);
    const updateSelectedStyle = useStudioStore((s) => s.updateSelectedStyle);
    const updateSelectedStyles = useStudioStore((s) => s.updateSelectedStyles);
    const updateStateOverride = useStudioStore((s) => s.updateStateOverride);
    const updateStateOverrides = useStudioStore((s) => s.updateStateOverrides);
    const applySizeTokenToSelected = useStudioStore((s) => s.applySizeTokenToSelected);
    const deleteInstance = useStudioStore((s) => s.deleteInstance);
    const updateInstanceName = useStudioStore((s) => s.updateInstanceName);
    const applyComponentVisualPreset = useStudioStore((s) => s.applyComponentVisualPreset);

    // ─── Derived state (driven by inspector registry) ──────────────────────

    const layout = selectedInstance ? getInspectorLayout(selectedInstance.kind) : null;
    const hasPanelElementControls = layout?.panelStyle ?? false;
    const usesStateAppearanceControls = selectedInstance ? supportsStateStyles(selectedInstance.kind) : false;
    const isCardKind = Boolean(selectedInstance && cardKinds.includes(selectedInstance.kind as typeof cardKinds[number]));
    const usesCustomCardTypographyInspector = isCardKind;

    const supportsTextIconMode =
        selectedInstance?.kind === 'button' || selectedInstance?.kind === 'badge';

    const showWidthControl =
        selectedInstance?.kind === 'slider' ||
        selectedInstance?.kind === 'checkbox' ||
        selectedInstance?.kind === 'input' ||
        selectedInstance?.kind === 'tabs' ||
        selectedInstance?.kind === 'card' ||
        selectedInstance?.kind === 'product-card' ||
        selectedInstance?.kind === 'listing-card';

    const appearanceSectionTitle = selectedInstance
        ? `${buildKindTitle(selectedInstance.kind)} Appearance`
        : 'Appearance';

    const contentDisplayMode: 'text' | 'text-icon' | 'icon' = selectedStyle
        ? selectedInstance?.kind === 'button'
            ? selectedStyle.buttonShowText
                ? selectedStyle.icon === 'none'
                    ? 'text'
                    : 'text-icon'
                : 'icon'
            : selectedInstance?.kind === 'badge'
                ? selectedStyle.badgeShowText
                    ? selectedStyle.icon === 'none'
                        ? 'text'
                        : 'text-icon'
                    : 'icon'
                : 'text'
        : 'text';

    const componentVisualPresets = selectedInstance ? getComponentVisualPresets(selectedInstance.kind) : [];
    const designVisualPresets = componentVisualPresets.filter((preset) => !preset.id.startsWith('motion-'));
    const activeDesignPresetId =
        selectedStyle && designVisualPresets.some((preset) => preset.id === selectedStyle.componentPreset)
            ? selectedStyle.componentPreset
            : designVisualPresets[0]?.id;
    const activeComponentPreset = selectedInstance && selectedStyle?.componentPreset
        ? getComponentVisualPreset(selectedInstance.kind, selectedStyle.componentPreset)
        : undefined;
    const switchThumbLimits = selectedInstance?.kind === 'switch' && selectedStyle
        ? getSwitchThumbLimits(selectedStyle)
        : { maxWidth: switchThumbInputMax, maxHeight: switchThumbInputMax };

    const updateSwitchSizingWithClamp = (updates: Partial<ComponentStyleConfig>) => {
        if (!selectedStyle || selectedInstance?.kind !== 'switch') {
            updateSelectedStyles(updates);
            return;
        }
        const merged = { ...selectedStyle, ...updates };
        const limits = getSwitchThumbLimits(merged);
        const nextUpdates: Partial<ComponentStyleConfig> = { ...updates };

        if (merged.switchThumbWidth > 0) {
            nextUpdates.switchThumbWidth = Math.min(merged.switchThumbWidth, limits.maxWidth);
        }
        if (merged.switchThumbHeight > 0) {
            nextUpdates.switchThumbHeight = Math.min(merged.switchThumbHeight, limits.maxHeight);
        }

        updateSelectedStyles(nextUpdates);
    };

    useEffect(() => {
        if (!selectedStyle || selectedInstance?.kind !== 'switch') return;
        const limits = getSwitchThumbLimits(selectedStyle);
        const updates: Partial<ComponentStyleConfig> = {};

        if (selectedStyle.switchThumbWidth > 0 && selectedStyle.switchThumbWidth > limits.maxWidth) {
            updates.switchThumbWidth = limits.maxWidth;
        }
        if (selectedStyle.switchThumbHeight > 0 && selectedStyle.switchThumbHeight > limits.maxHeight) {
            updates.switchThumbHeight = limits.maxHeight;
        }

        if (Object.keys(updates).length > 0) {
            updateSelectedStyles(updates);
        }
    }, [
        selectedInstance?.kind,
        selectedStyle,
        updateSelectedStyles,
    ]);

    // ─── Effect options ───────────────────────────────────────────────────

    const effectOptions = selectedStyle && layout
        ? [
            { id: 'drop-shadow', label: 'Drop Shadow', enabled: selectedStyle.effectDropShadow, supported: layout.effects.dropShadow },
            { id: 'inner-shadow', label: 'Inner Shadow', enabled: selectedStyle.effectInnerShadow, supported: layout.effects.innerShadow },
            { id: 'background-blur', label: 'Background Blur', enabled: selectedStyle.effectBlur, supported: layout.effects.backgroundBlur },
            { id: 'glass-tint', label: 'Glass / Blur', enabled: selectedStyle.effectGlass, supported: layout.effects.glassTint },
            { id: 'gradient-slide', label: 'Gradient Slide', enabled: selectedStyle.effectGradientSlideEnabled, supported: layout.effects.gradientSlide },
            { id: 'animated-border', label: hasPanelElementControls ? 'Animated Border (Trigger)' : 'Animated Border', enabled: selectedStyle.effectAnimatedBorderEnabled, supported: layout.effects.animatedBorder },
            { id: 'ripple-fill', label: 'Ripple Fill (Hover)', enabled: selectedStyle.effectRippleFillEnabled, supported: layout.effects.rippleFill },
            { id: 'loading-state', label: 'Loading State Icon', enabled: selectedStyle.effectLoadingActiveEnabled, supported: layout.effects.loading },
            { id: 'sweep', label: 'Sweep Animation', enabled: selectedStyle.effectSweepEnabled, supported: layout.effects.sweep },
            { id: 'border-beam', label: 'Border Beam', enabled: selectedStyle.effectBorderBeamEnabled, supported: layout.effects.borderBeam },
            { id: 'shine-border', label: 'Shine Border', enabled: selectedStyle.effectShineBorderEnabled, supported: layout.effects.shineBorder },
            { id: 'neon-glow', label: 'Neon Glow', enabled: selectedStyle.effectNeonGlowEnabled, supported: layout.effects.neonGlow },
            { id: 'pulse-ring', label: 'Pulse Ring', enabled: selectedStyle.effectPulseRingEnabled, supported: layout.effects.pulseRing },
            { id: 'grain', label: 'Noise & Grain', enabled: selectedStyle.effectGrain, supported: selectedInstance ? supportsGrainEffect(selectedInstance.kind) : false },
            { id: 'gradient-border', label: 'Gradient Border', enabled: selectedStyle.effectGradientBorder, supported: selectedInstance ? supportsGradientBorderEffect(selectedInstance.kind) : false },
            { id: 'frosted-tint', label: 'Frosted Tint', enabled: selectedStyle.effectFrostedTint, supported: selectedInstance ? supportsFrostedTintEffect(selectedInstance.kind) : false },
            { id: 'radial-glow', label: 'Radial Glow', enabled: selectedStyle.effectRadialGlow, supported: selectedInstance ? supportsRadialGlowEffect(selectedInstance.kind) : false },
            { id: 'elevation-shadow', label: 'Elevation', enabled: selectedStyle.effectElevationShadow, supported: selectedInstance ? supportsElevationShadowEffect(selectedInstance.kind) : false },
            { id: 'neumorphic', label: 'Neumorphic', enabled: selectedStyle.effectNeumorphic, supported: selectedInstance ? supportsNeumorphicEffect(selectedInstance.kind) : false },
        ].filter((item) => item.supported)
        : [];
    const inactiveEffectOptions = effectOptions.filter((item) => !item.enabled);

    useEffect(() => {
        if (!effectsBuilderOpen) return;
        if (!pendingEffectId || !inactiveEffectOptions.some((option) => option.id === pendingEffectId)) {
            setPendingEffectId(inactiveEffectOptions[0]?.id ?? null);
        }
    }, [effectsBuilderOpen, inactiveEffectOptions, pendingEffectId, setPendingEffectId]);

    // ─── Appearance helpers ───────────────────────────────────────────────

    const getStateAppearanceValues = (state: ButtonPreviewState) => {
        if (!selectedStyle || !selectedInstance || !supportsStateStyles(selectedInstance.kind)) {
            return null;
        }
        const resolved = resolveStateStyle(selectedInstance, state);
        return {
            fillMode: resolved.fillMode,
            fillColor: resolved.fillColor,
            fillColorTo: resolved.fillColorTo,
            fillWeight: resolved.fillWeight,
            fillOpacity: resolved.fillOpacity,
            fontSize: resolved.fontSize,
            fontWeight: resolved.fontWeight,
            fontPosition: resolved.fontPosition,
            fontColor: resolved.fontColor,
            fontOpacity: resolved.fontOpacity,
            strokeColor: resolved.strokeColor,
            strokeOpacity: resolved.strokeOpacity,
            strokeWeight: resolved.strokeWeight,
        };
    };

    const currentAppearanceValues = selectedStyle
        ? usesStateAppearanceControls
            ? getStateAppearanceValues(selectedStyle.buttonPreviewState)
            : {
                fillMode: selectedStyle.fillMode,
                fillColor: selectedStyle.fillColor,
                fillColorTo: selectedStyle.fillColorTo,
                fillWeight: selectedStyle.fillWeight,
                fillOpacity: selectedStyle.fillOpacity,
                fontSize: selectedStyle.fontSize,
                fontWeight: selectedStyle.fontWeight,
                fontPosition: selectedStyle.fontPosition,
                fontColor: selectedStyle.fontColor,
                fontOpacity: selectedStyle.fontOpacity,
                strokeColor: selectedStyle.strokeColor,
                strokeOpacity: selectedStyle.strokeOpacity,
                strokeWeight: selectedStyle.strokeWeight,
            }
        : null;

    const showAppearanceSection = Boolean(
        selectedInstance &&
        selectedStyle &&
        selectedInstance.kind !== 'tabs' &&
        (
            hasPanelElementControls ||
            layout?.sections.appearance ||
            (supportsTypographyStyle(selectedInstance.kind) && !usesCustomCardTypographyInspector) ||
            supportsTextIconMode ||
            supportsIconSelection(selectedInstance.kind)
        ),
    );

    type AppearanceField = 'fillMode' | 'fillColor' | 'fillColorTo' | 'fillWeight' | 'fillOpacity'
        | 'fontSize' | 'fontWeight' | 'fontPosition' | 'fontColor' | 'fontOpacity'
        | 'strokeColor' | 'strokeOpacity' | 'strokeWeight';

    const updateAppearanceField = (
        field: AppearanceField,
        value: string | number | FillMode,
    ) => {
        if (!selectedStyle) return;
        const previewState = selectedStyle.buttonPreviewState;
        if (usesStateAppearanceControls && previewState !== 'default') {
            updateStateOverride(previewState, field, value as never);
            return;
        }
        updateSelectedStyle(field, value as never);
    };

    const getIconOptionsForLibrary = (library: IconLibrary) => {
        if (library === 'lucide') {
            return LUCIDE_ICON_OPTIONS;
        }
        return STUDIO_ICON_OPTIONS;
    };

    const getDefaultIconForLibrary = (library: IconLibrary): IconOptionId => {
        const firstOption = getIconOptionsForLibrary(library).find((option) => option.id !== 'none');
        return firstOption?.id ?? 'search';
    };

    const getResolvedIconValue = (
        library: IconLibrary,
        currentIcon: IconOptionId,
        includeNone: boolean,
    ): IconOptionId => {
        const options = getIconOptionsForLibrary(library).filter((option) => includeNone || option.id !== 'none');
        const hasCurrent = options.some((option) => option.id === currentIcon);
        if (hasCurrent) {
            return currentIcon;
        }
        if (!includeNone && currentIcon === 'none') {
            return getDefaultIconForLibrary(library);
        }
        return includeNone ? 'none' : (options[0]?.id ?? getDefaultIconForLibrary(library));
    };

    const getSwitchIconOptions = (library: IconLibrary): Array<{ id: IconOptionId; label: string }> =>
        getIconOptionsForLibrary(library).filter((option) => option.id !== 'none');

    const getDefaultSwitchIconChecked = (library: IconLibrary): IconOptionId =>
        getSwitchIconOptions(library).find((option) => option.id === 'check')?.id
        ?? getSwitchIconOptions(library).find((option) => option.id === 'star')?.id
        ?? getDefaultIconForLibrary(library);

    const getDefaultSwitchIconUnchecked = (library: IconLibrary): IconOptionId =>
        getSwitchIconOptions(library).find((option) => option.id === 'x')?.id
        ?? getSwitchIconOptions(library).find((option) => option.id === 'minus')?.id
        ?? getDefaultIconForLibrary(library);

    const updateContentDisplayMode = (mode: 'text' | 'text-icon' | 'icon') => {
        if (!selectedInstance || !supportsTextIconMode) return;
        const activeLibrary = selectedStyle?.iconLibrary === 'lucide' ? 'lucide' : 'studio';
        const defaultIcon: IconOptionId =
            selectedStyle?.icon === 'none'
                ? getDefaultIconForLibrary(activeLibrary)
                : selectedStyle?.icon ?? getDefaultIconForLibrary(activeLibrary);
        if (selectedInstance.kind === 'button') {
            updateSelectedStyle('buttonShowText', mode !== 'icon');
            updateSelectedStyle('icon', mode === 'text' ? 'none' : defaultIcon);
            return;
        }
        updateSelectedStyle('badgeShowText', mode !== 'icon');
        updateSelectedStyle('icon', mode === 'text' ? 'none' : defaultIcon);
    };

    const updateCardTextField = (
        textKey: 'cardTitleText' | 'cardSubtitleText' | 'cardBodyText' | 'cardPriceText',
        visibilityKey: 'cardShowTitle' | 'cardShowSubtitle' | 'cardShowBody' | 'cardShowPrice',
        value: string,
    ) => {
        updateSelectedStyles({
            [textKey]: value,
            [visibilityKey]: value.trim().length > 0,
        } as Partial<ComponentStyleConfig>);
    };

    const updateCardImage = (value: string) => {
        updateSelectedStyles({
            cardImageSrc: value,
            cardShowImage: value.trim().length > 0,
        });
    };

    // ─── Effect helpers ───────────────────────────────────────────────────

    type EffectId = 'drop-shadow' | 'inner-shadow' | 'background-blur' | 'glass-tint' | 'gradient-slide' | 'animated-border' | 'ripple-fill' | 'loading-state' | 'sweep' | 'border-beam' | 'shine-border' | 'neon-glow' | 'pulse-ring' | 'grain' | 'gradient-border' | 'frosted-tint' | 'radial-glow' | 'elevation-shadow' | 'neumorphic';

    const setEffectEnabled = (effectId: EffectId, enabled: boolean) => {
        switch (effectId) {
            case 'drop-shadow': updateSelectedStyle('effectDropShadow', enabled); break;
            case 'inner-shadow': updateSelectedStyle('effectInnerShadow', enabled); break;
            case 'background-blur': updateSelectedStyle('effectBlur', enabled); break;
            case 'glass-tint': updateSelectedStyle('effectGlass', enabled); break;
            case 'gradient-slide': updateSelectedStyle('effectGradientSlideEnabled', enabled); break;
            case 'animated-border':
                updateSelectedStyles({
                    effectAnimatedBorderEnabled: enabled,
                    ...(enabled ? { effectGradientBorder: false } : {}),
                });
                break;
            case 'ripple-fill': updateSelectedStyle('effectRippleFillEnabled', enabled); break;
            case 'loading-state': updateSelectedStyle('effectLoadingActiveEnabled', enabled); break;
            case 'sweep': updateSelectedStyle('effectSweepEnabled', enabled); break;
            case 'border-beam': updateSelectedStyle('effectBorderBeamEnabled', enabled); break;
            case 'shine-border': updateSelectedStyle('effectShineBorderEnabled', enabled); break;
            case 'neon-glow': updateSelectedStyle('effectNeonGlowEnabled', enabled); break;
            case 'pulse-ring': updateSelectedStyle('effectPulseRingEnabled', enabled); break;
            case 'grain': updateSelectedStyle('effectGrain', enabled); break;
            case 'gradient-border':
                updateSelectedStyles({
                    effectGradientBorder: enabled,
                    ...(enabled ? { effectAnimatedBorderEnabled: false } : {}),
                });
                break;
            case 'frosted-tint': updateSelectedStyle('effectFrostedTint', enabled); break;
            case 'radial-glow': updateSelectedStyle('effectRadialGlow', enabled); break;
            case 'elevation-shadow': updateSelectedStyle('effectElevationShadow', enabled); break;
            case 'neumorphic': updateSelectedStyle('effectNeumorphic', enabled); break;
        }
    };

    const renderEffectStateSelect = (effectId: 'animated-border' | 'sweep') => {
        if (!selectedStyle) return null;
        const optionKeys = effectId === 'animated-border'
            ? [
                { label: 'Default', key: 'effectAnimatedBorderStateDefault' as const },
                { label: 'Hover', key: 'effectAnimatedBorderStateHover' as const },
                { label: 'Active', key: 'effectAnimatedBorderStateActive' as const },
                { label: 'Disabled', key: 'effectAnimatedBorderStateDisabled' as const },
            ]
            : [
                { label: 'Default', key: 'effectSweepStateDefault' as const },
                { label: 'Hover', key: 'effectSweepStateHover' as const },
                { label: 'Active', key: 'effectSweepStateActive' as const },
                { label: 'Disabled', key: 'effectSweepStateDisabled' as const },
            ];
        const activeLabels = optionKeys.filter((option) => selectedStyle[option.key]).map((option) => option.label);

        return (
            <FlatField label="States" stacked>
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className="ui-studio-inspector-input inline-flex h-6 w-full items-center justify-between gap-2 rounded-sm border-[var(--inspector-border-soft)] bg-[#0c121d] px-2 text-[12px] font-medium text-[var(--inspector-text)]"
                        >
                            <span className="min-w-0 truncate text-left">
                                {activeLabels.length > 0 ? activeLabels.join(', ') : 'No states'}
                            </span>
                            <ChevronDown className="size-3.5 shrink-0 text-[var(--inspector-muted-text)]" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        side="left"
                        align="start"
                        sideOffset={10}
                        className="w-[220px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-2 text-[var(--inspector-text)]"
                    >
                        <div className="space-y-1">
                            {optionKeys.map((option) => {
                                const checked = selectedStyle[option.key];
                                return (
                                    <button
                                        key={option.key}
                                        type="button"
                                        onClick={() => updateSelectedStyle(option.key, !checked)}
                                        className={cn(
                                            'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[12px] font-medium transition',
                                            checked
                                                ? 'bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)]'
                                                : 'text-[var(--inspector-muted-text)] hover:bg-white/[0.04] hover:text-[var(--inspector-text)]',
                                        )}
                                    >
                                        <Check className={cn('size-3.5 shrink-0', checked ? 'opacity-100' : 'opacity-0')} />
                                        <span>{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </PopoverContent>
                </Popover>
            </FlatField>
        );
    };

    const renderEffectConfigurator = (effectId: EffectId) => {
        if (!selectedStyle || !selectedInstance) return null;

        switch (effectId) {
            case 'drop-shadow':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <MiniNumberField label="Distance" value={Math.max(0, selectedStyle.dropShadowY)} min={0} max={80} onChange={(value) => updateSelectedStyles({ dropShadowStrength: value, dropShadowY: value })} />
                        <MiniNumberField label="X" value={selectedStyle.dropShadowX} min={-80} max={80} onChange={(value) => updateSelectedStyle('dropShadowX', value)} />
                        <MiniNumberField label="Blur" value={selectedStyle.dropShadowBlur} min={0} max={80} onChange={(value) => updateSelectedStyle('dropShadowBlur', value)} />
                        <MiniNumberField label="Spread" value={selectedStyle.dropShadowSpread} min={-40} max={40} onChange={(value) => updateSelectedStyle('dropShadowSpread', value)} />
                    </div>
                );
            case 'inner-shadow':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <MiniNumberField label="X" value={selectedStyle.innerShadowX} min={-80} max={80} onChange={(value) => updateSelectedStyle('innerShadowX', value)} />
                        <MiniNumberField label="Y" value={selectedStyle.innerShadowY} min={-80} max={80} onChange={(value) => updateSelectedStyle('innerShadowY', value)} />
                        <MiniNumberField label="Blur" value={selectedStyle.innerShadowBlur} min={0} max={80} onChange={(value) => updateSelectedStyle('innerShadowBlur', value)} />
                        <MiniNumberField label="Spread" value={selectedStyle.innerShadowSpread} min={-40} max={40} onChange={(value) => updateSelectedStyle('innerShadowSpread', value)} />
                    </div>
                );
            case 'background-blur':
                return <MiniNumberField label="Amount" value={selectedStyle.blurAmount} min={0} max={30} unit="px" onChange={(value) => updateSelectedStyle('blurAmount', value)} />;
            case 'glass-tint':
                return (
                    <div className="space-y-3">
                        <FlatUnitField label="Fill Opacity" value={selectedStyle.glassOpacity} min={0} max={100} unit="%" onChange={(value) => updateSelectedStyle('glassOpacity', value)} />
                        <FlatUnitField label="Blur Amount" value={selectedStyle.blurAmount} min={4} max={40} unit="px" onChange={(value) => updateSelectedStyle('blurAmount', value)} />
                        <p className="text-[11px] text-[var(--inspector-muted-text)]">Place the component over content for best results.</p>
                    </div>
                );
            case 'gradient-slide':
                return (
                    <div className="space-y-3">
                        <FlatField label="Direction" stacked>
                            <FlatSelect value={selectedStyle.effectGradientSlideDirection} onValueChange={(value) => updateSelectedStyle('effectGradientSlideDirection', value as ComponentStyleConfig['effectGradientSlideDirection'])}>
                                <option value="left">Left → Right</option>
                                <option value="right">Right → Left</option>
                                <option value="top">Top → Bottom</option>
                                <option value="bottom">Bottom → Top</option>
                            </FlatSelect>
                        </FlatField>
                        <FlatColorControl
                            label="Slide Color"
                            value={selectedStyle.effectGradientSlideColor}
                            onChange={(value) => updateSelectedStyle('effectGradientSlideColor', value)}
                            tokens={activeTokenSet.tokens}
                            allowGradient
                            mode={selectedStyle.effectGradientSlideFillMode}
                            onModeChange={(mode) => updateSelectedStyle('effectGradientSlideFillMode', mode)}
                            secondaryValue={selectedStyle.effectGradientSlideColorTo}
                            onSecondaryChange={(value) => updateSelectedStyle('effectGradientSlideColorTo', value)}
                        />
                        <FlatUnitField label="Motion Speed" value={selectedStyle.effectGradientSlideSpeed} min={0.1} max={2} step={0.05} unit="s" onChange={(value) => updateSelectedStyle('effectGradientSlideSpeed', value)} />
                    </div>
                );
            case 'animated-border':
                return (
                    <div className="space-y-3">
                        <FlatUnitField label="Preset Speed" value={selectedStyle.effectAnimatedBorderSpeed} min={0.6} max={8} step={0.1} unit="s" onChange={(value) => updateSelectedStyle('effectAnimatedBorderSpeed', value)} />
                        <FlatField label="Color Count" stacked>
                            <FlatSelect value={selectedStyle.effectAnimatedBorderColorCount} onValueChange={(value) => updateSelectedStyle('effectAnimatedBorderColorCount', Math.max(2, Math.min(5, Number(value))))}>
                                {[2, 3, 4, 5].map((count) => (<option key={count} value={count}>{count}</option>))}
                            </FlatSelect>
                        </FlatField>
                        <FlatColorControl label="Color 1" value={selectedStyle.effectAnimatedBorderColor1} onChange={(value) => updateSelectedStyle('effectAnimatedBorderColor1', value)} tokens={activeTokenSet.tokens} />
                        <FlatColorControl label="Color 2" value={selectedStyle.effectAnimatedBorderColor2} onChange={(value) => updateSelectedStyle('effectAnimatedBorderColor2', value)} tokens={activeTokenSet.tokens} />
                        {selectedStyle.effectAnimatedBorderColorCount >= 3 ? <FlatColorControl label="Color 3" value={selectedStyle.effectAnimatedBorderColor3} onChange={(value) => updateSelectedStyle('effectAnimatedBorderColor3', value)} tokens={activeTokenSet.tokens} /> : null}
                        {selectedStyle.effectAnimatedBorderColorCount >= 4 ? <FlatColorControl label="Color 4" value={selectedStyle.effectAnimatedBorderColor4} onChange={(value) => updateSelectedStyle('effectAnimatedBorderColor4', value)} tokens={activeTokenSet.tokens} /> : null}
                        {selectedStyle.effectAnimatedBorderColorCount >= 5 ? <FlatColorControl label="Color 5" value={selectedStyle.effectAnimatedBorderColor5} onChange={(value) => updateSelectedStyle('effectAnimatedBorderColor5', value)} tokens={activeTokenSet.tokens} /> : null}
                        <p className="text-[11px] text-[var(--inspector-muted-text)]">Border width is linked to Stroke Width.</p>
                        {renderEffectStateSelect('animated-border')}
                    </div>
                );
            case 'ripple-fill':
                return (
                    <div className="space-y-3">
                        <FlatColorControl label="Ripple Color" value={selectedStyle.effectRippleFillColor} onChange={(value) => updateSelectedStyle('effectRippleFillColor', value)} tokens={activeTokenSet.tokens} />
                        <FlatUnitField label="Fill Speed" value={selectedStyle.effectRippleFillSpeed} min={0.2} max={1.8} step={0.05} unit="s" onChange={(value) => updateSelectedStyle('effectRippleFillSpeed', value)} />
                    </div>
                );
            case 'loading-state':
                return (
                    <div className="space-y-3">
                        <FlatField label="Icon Position" stacked>
                            <FlatSelect value={selectedStyle.effectLoadingPosition} onValueChange={(value) => updateSelectedStyle('effectLoadingPosition', value as 'left' | 'right')}>
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                            </FlatSelect>
                        </FlatField>
                        <FlatField label="Outcome Icon" stacked>
                            <FlatSelect value={selectedStyle.effectLoadingOutcome} onValueChange={(value) => updateSelectedStyle('effectLoadingOutcome', value as ComponentStyleConfig['effectLoadingOutcome'])}>
                                <option value="success">Success</option>
                                <option value="failure">Failure</option>
                                <option value="warning">Warning</option>
                            </FlatSelect>
                        </FlatField>
                        {selectedInstance.kind === 'badge' ? (
                            <FlatSwitchRow
                                label="Show in Default State"
                                checked={selectedStyle.effectLoadingBadgeDefaultEnabled}
                                onCheckedChange={(checked) => updateSelectedStyle('effectLoadingBadgeDefaultEnabled', checked)}
                            />
                        ) : null}
                    </div>
                );
            case 'sweep':
                return (
                    <div className="space-y-3">
                        <FlatColorControl
                            label="Sweep Color"
                            value={selectedStyle.effectSweepColor}
                            opacity={selectedStyle.effectSweepOpacity}
                            onOpacityChange={(value) => updateSelectedStyle('effectSweepOpacity', value)}
                            onChange={(value) => updateSelectedStyle('effectSweepColor', value)}
                            tokens={activeTokenSet.tokens}
                        />
                        <FlatUnitField label="Sweep Width" value={selectedStyle.effectSweepWidth} min={8} max={60} unit="%" onChange={(value) => updateSelectedStyle('effectSweepWidth', value)} />
                        <FlatUnitField label="Sweep Speed" value={selectedStyle.effectSweepSpeed} min={0.4} max={4} step={0.1} unit="s" onChange={(value) => updateSelectedStyle('effectSweepSpeed', value)} />
                        {renderEffectStateSelect('sweep')}
                    </div>
                );
            case 'border-beam':
                return (
                    <div className="space-y-3">
                        <FlatColorControl label="Color From" value={selectedStyle.effectBorderBeamColorFrom} onChange={(value) => updateSelectedStyle('effectBorderBeamColorFrom', value)} tokens={activeTokenSet.tokens} />
                        <FlatColorControl label="Color To" value={selectedStyle.effectBorderBeamColorTo} onChange={(value) => updateSelectedStyle('effectBorderBeamColorTo', value)} tokens={activeTokenSet.tokens} />
                        <FlatUnitField label="Beam Spread" value={selectedStyle.effectBorderBeamSize} min={20} max={200} step={5} unit="px" onChange={(value) => updateSelectedStyle('effectBorderBeamSize', value)} />
                        <FlatUnitField label="Speed" value={selectedStyle.effectBorderBeamSpeed} min={1} max={12} step={0.5} unit="s" onChange={(value) => updateSelectedStyle('effectBorderBeamSpeed', value)} />
                    </div>
                );
            case 'shine-border':
                return (
                    <div className="space-y-3">
                        <FlatColorControl label="Shine Color" value={selectedStyle.effectShineBorderColor} onChange={(value) => updateSelectedStyle('effectShineBorderColor', value)} tokens={activeTokenSet.tokens} />
                        <FlatUnitField label="Speed" value={selectedStyle.effectShineBorderSpeed} min={1} max={10} step={0.5} unit="s" onChange={(value) => updateSelectedStyle('effectShineBorderSpeed', value)} />
                    </div>
                );
            case 'neon-glow':
                return (
                    <div className="space-y-3">
                        <FlatColorControl label="Color 1" value={selectedStyle.effectNeonGlowColor1} onChange={(value) => updateSelectedStyle('effectNeonGlowColor1', value)} tokens={activeTokenSet.tokens} />
                        <FlatColorControl label="Color 2" value={selectedStyle.effectNeonGlowColor2} onChange={(value) => updateSelectedStyle('effectNeonGlowColor2', value)} tokens={activeTokenSet.tokens} />
                        <FlatUnitField label="Glow Size" value={selectedStyle.effectNeonGlowSize} min={4} max={40} step={2} unit="px" onChange={(value) => updateSelectedStyle('effectNeonGlowSize', value)} />
                        <FlatUnitField label="Speed" value={selectedStyle.effectNeonGlowSpeed} min={1} max={8} step={0.5} unit="s" onChange={(value) => updateSelectedStyle('effectNeonGlowSpeed', value)} />
                    </div>
                );
            case 'pulse-ring':
                return (
                    <div className="space-y-3">
                        <FlatColorControl label="Ring Color" value={selectedStyle.effectPulseRingColor} onChange={(value) => updateSelectedStyle('effectPulseRingColor', value)} tokens={activeTokenSet.tokens} />
                        <FlatUnitField label="Speed" value={selectedStyle.effectPulseRingSpeed} min={0.5} max={4} step={0.25} unit="s" onChange={(value) => updateSelectedStyle('effectPulseRingSpeed', value)} />
                    </div>
                );
            case 'grain':
                return (
                    <div className="space-y-3">
                        <FlatUnitField label="Opacity" value={selectedStyle.grainOpacity} min={0} max={100} step={1} unit="%" onChange={(value) => updateSelectedStyle('grainOpacity', value)} />
                        <FlatUnitField label="Grain Size" value={selectedStyle.grainSize} min={60} max={200} step={10} unit="px" onChange={(value) => updateSelectedStyle('grainSize', value)} />
                    </div>
                );
            case 'gradient-border':
                return (
                    <div className="space-y-3">
                        <FlatUnitField label="Angle" value={selectedStyle.gradientBorderAngle} min={0} max={360} step={5} unit="deg" onChange={(value) => updateSelectedStyle('gradientBorderAngle', value)} />
                        <FlatColorControl label="Color 1" value={selectedStyle.gradientBorderColor1} onChange={(value) => updateSelectedStyle('gradientBorderColor1', value)} tokens={activeTokenSet.tokens} />
                        <FlatColorControl label="Color 2" value={selectedStyle.gradientBorderColor2} onChange={(value) => updateSelectedStyle('gradientBorderColor2', value)} tokens={activeTokenSet.tokens} />
                        <FlatColorControl label="Color 3" value={selectedStyle.gradientBorderColor3} onChange={(value) => updateSelectedStyle('gradientBorderColor3', value)} tokens={activeTokenSet.tokens} />
                    </div>
                );
            case 'frosted-tint':
                return (
                    <div className="space-y-3">
                        <FlatColorControl label="Tint Color" value={selectedStyle.frostedTintColor} onChange={(value) => updateSelectedStyle('frostedTintColor', value)} tokens={activeTokenSet.tokens} />
                        <FlatUnitField label="Opacity" value={selectedStyle.frostedTintOpacity} min={0} max={100} step={1} unit="%" onChange={(value) => updateSelectedStyle('frostedTintOpacity', value)} />
                    </div>
                );
            case 'radial-glow':
                return (
                    <div className="space-y-3">
                        <FlatColorControl label="Glow Color" value={selectedStyle.radialGlowColor} onChange={(value) => updateSelectedStyle('radialGlowColor', value)} tokens={activeTokenSet.tokens} />
                        <FlatUnitField label="Size" value={selectedStyle.radialGlowSize} min={40} max={200} step={5} unit="%" onChange={(value) => updateSelectedStyle('radialGlowSize', value)} />
                        <FlatUnitField label="Opacity" value={selectedStyle.radialGlowOpacity} min={0} max={100} step={1} unit="%" onChange={(value) => updateSelectedStyle('radialGlowOpacity', value)} />
                    </div>
                );
            case 'elevation-shadow':
                return <FlatUnitField label="Level" value={selectedStyle.elevationLevel} min={1} max={5} step={1} onChange={(value) => updateSelectedStyle('elevationLevel', value)} />;
            case 'neumorphic':
                return (
                    <div className="space-y-3">
                        <FlatUnitField label="Distance" value={selectedStyle.neumorphicDistance} min={4} max={20} step={1} unit="px" onChange={(value) => updateSelectedStyle('neumorphicDistance', value)} />
                        <FlatUnitField label="Blur" value={selectedStyle.neumorphicBlur} min={8} max={40} step={2} unit="px" onChange={(value) => updateSelectedStyle('neumorphicBlur', value)} />
                        <FlatUnitField label="Intensity" value={selectedStyle.neumorphicIntensity} min={0} max={200} step={5} unit="%" onChange={(value) => updateSelectedStyle('neumorphicIntensity', value)} />
                        <div className="grid grid-cols-2 gap-2">
                            <FlatUnitField label="Dark Opacity" value={selectedStyle.neumorphicDarkOpacity} min={0} max={100} step={1} unit="%" onChange={(value) => updateSelectedStyle('neumorphicDarkOpacity', value)} />
                            <FlatUnitField label="Light Opacity" value={selectedStyle.neumorphicLightOpacity} min={0} max={100} step={1} unit="%" onChange={(value) => updateSelectedStyle('neumorphicLightOpacity', value)} />
                        </div>
                        <FlatSwitchRow
                            label="Inset (sunken)"
                            checked={selectedStyle.neumorphicInset}
                            onCheckedChange={(checked) => updateSelectedStyle('neumorphicInset', checked)}
                        />
                    </div>
                );
        }
    };

    // ─── Rename helpers ───────────────────────────────────────────────────

    const startRenameVariant = (instance: ComponentInstance) => {
        setEditingVariantId(instance.id);
        setEditingVariantName(instance.name);
    };

    const commitRenameVariant = (instanceId: string) => {
        const trimmed = editingVariantName.trim();
        if (trimmed.length > 0) {
            updateInstanceName(instanceId, trimmed);
        }
        setEditingVariantId(null);
        setEditingVariantName('');
    };

    // ─── Render ───────────────────────────────────────────────────────────

    if (!selectedStyle || !selectedInstance) {
        return <div className="p-4 text-sm text-[#87a0c2]">Select a variant to open the design inspector.</div>;
    }

    return (
        <ScrollArea className="ui-studio-inspector-scroll min-h-0 h-full min-w-0 flex-1 overflow-x-hidden">
            <div className="min-w-0 overflow-x-hidden px-2 pb-6 pt-2">
                <div className="mx-1 mb-1.5 flex items-center justify-between border-b border-white/8 px-2 pb-2 pt-1">
                    {editingVariantId === selectedInstance.id ? (
                        <input
                            value={editingVariantName}
                            onChange={(event) => setEditingVariantName(event.target.value)}
                            onBlur={() => commitRenameVariant(selectedInstance.id)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') { event.preventDefault(); commitRenameVariant(selectedInstance.id); }
                                if (event.key === 'Escape') { event.preventDefault(); setEditingVariantId(null); setEditingVariantName(''); }
                            }}
                            className={cn(studioInputClass, 'h-8 max-w-[220px]')}
                            autoFocus
                        />
                    ) : (
                        <div className="inline-flex items-center gap-2">
                            <h2 className="truncate text-sm font-semibold text-[#edf5ff]">{selectedInstance.name}</h2>
                            <button
                                type="button"
                                onClick={() => startRenameVariant(selectedInstance)}
                                className="rounded-md p-1 text-[#8fa6c7] transition hover:bg-white/[0.06] hover:text-[#eaf2ff]"
                                aria-label="Rename component"
                            >
                                <EditOne className="size-4" />
                            </button>
                        </div>
                    )}
                    <Tooltip delay={800}>
                        <TooltipTrigger
                            className="inline-flex size-8 items-center justify-center rounded-md text-[#8fa6c7] transition hover:bg-white/[0.06] hover:text-[#ff9ca4]"
                            onPress={() => deleteInstance(selectedInstance.id)}
                            aria-label="Clear selected component"
                        >
                            <Delete className="size-4" />
                        </TooltipTrigger>
                        <TooltipContent>Clear</TooltipContent>
                    </Tooltip>
                </div>
                <div className="flex flex-col divide-y divide-[var(--inspector-border-soft)]">
                    {/* Presets */}
                    {designVisualPresets.length > 0 && activeDesignPresetId ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Presets" icon={Sparkles} defaultOpen={false} subtitle={`${designVisualPresets.length} presets`}>
                                <FlatSelect
                                    value={activeDesignPresetId}
                                    onValueChange={(value) => applyComponentVisualPreset(value)}
                                    ariaLabel={`${buildKindTitle(selectedInstance.kind)} preset`}
                                >
                                    {designVisualPresets.map((preset) => (
                                        <option key={preset.id} value={preset.id}>{preset.label}</option>
                                    ))}
                                </FlatSelect>
                                {activeComponentPreset ? (
                                    <p className="text-[10px] leading-relaxed text-[var(--inspector-muted-text)]">{activeComponentPreset.description}</p>
                                ) : null}
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Dimensions */}
                    {layout?.sections.dimensions && <div className="p-1">
                        <FlatInspectorSection
                            title={hasPanelElementControls ? 'Button Design' : 'Dimensions'}
                            icon={Ruler}
                            defaultOpen
                            subtitle={hasPanelElementControls ? 'Button trigger sizing and visual styling.' : undefined}
                        >
                            <div className={cn('flex items-start gap-3', showWidthControl ? 'flex-wrap' : 'flex-nowrap')}>
                                <div className="w-[112px] shrink-0">
                                    <FlatField label="Size" stacked>
                                        <div className="flex h-6 w-full items-center gap-1 rounded-sm bg-[var(--inspector-input)]">
                                            {([
                                                { label: 'S', value: 'sm' },
                                                { label: 'M', value: 'md' },
                                                { label: 'L', value: 'lg' },
                                            ] as const).map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => applySizeTokenToSelected(option.value, activeTokenSet.sizeTokens[option.value])}
                                                    className={cn(
                                                        inspectorChoiceButtonBase,
                                                        selectedStyle.size === option.value
                                                            ? inspectorChoiceButtonActive
                                                            : inspectorChoiceButtonIdle,
                                                    )}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </FlatField>
                                </div>
                                {showWidthControl ? (
                                    <FlatUnitField label="Width" value={selectedStyle.customWidth} min={0} max={640} unit="px" onChange={(value) => updateSelectedStyle('customWidth', value)} zeroLabel="auto" />
                                ) : null}
                                <FlatUnitField label="Height" value={selectedStyle.customHeight} min={0} max={720} unit="px" onChange={(value) => updateSelectedStyle('customHeight', value)} zeroLabel="auto" />
                                <FlatUnitField label="Radius" value={selectedStyle.cornerRadius} min={0} max={40} unit="px" onChange={(value) => updateSelectedStyle('cornerRadius', value)} />
                            </div>
                            {hasPanelElementControls ? (
                                <>
                                    {currentAppearanceValues ? (
                                        <div className="flex items-end gap-1.5">
                                            <div className="min-w-0 flex-1">
                                                <FlatColorControl label="Fill" value={currentAppearanceValues.fillColor} opacity={currentAppearanceValues.fillOpacity} onOpacityChange={(value) => updateAppearanceField('fillOpacity', value)} onChange={(value) => updateAppearanceField('fillColor', value)} tokens={activeTokenSet.tokens} allowGradient mode={currentAppearanceValues.fillMode} onModeChange={(mode) => updateAppearanceField('fillMode', mode)} secondaryValue={currentAppearanceValues.fillColorTo} onSecondaryChange={(value) => updateAppearanceField('fillColorTo', value)} mix={currentAppearanceValues.fillWeight} onMixChange={(value) => updateAppearanceField('fillWeight', value)} stacked compact />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <FlatColorControl label="Stroke" value={currentAppearanceValues.strokeColor} opacity={currentAppearanceValues.strokeOpacity} onOpacityChange={(value) => updateAppearanceField('strokeOpacity', value)} onChange={(value) => updateAppearanceField('strokeColor', value)} tokens={activeTokenSet.tokens} stacked compact />
                                            </div>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button type="button" aria-label="Adjust stroke width" className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm border border-[color:var(--inspector-accent)]/30 bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)] transition hover:border-[color:var(--inspector-accent)]/50 hover:bg-[color:var(--inspector-accent-soft)]/80 hover:text-[var(--inspector-text)]">
                                                        <SlidersHorizontal className="size-4" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent side="left" align="start" sideOffset={10} className="w-[220px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-3 text-[var(--inspector-text)]">
                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <p className="text-[12px] font-medium text-[var(--inspector-text)]">Stroke Width</p>
                                                            <p className="text-[11px] text-[var(--inspector-muted-text)]">{currentAppearanceValues.strokeWeight}px</p>
                                                        </div>
                                                        <Slider value={[currentAppearanceValues.strokeWeight]} onValueChange={(values: number[]) => updateAppearanceField('strokeWeight', values[0] ?? 0)} min={0} max={8} step={0.5} />
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    ) : null}

                                    {supportsTypographyStyle(selectedInstance.kind) && !usesCustomCardTypographyInspector && currentAppearanceValues ? (
                                        <>
                                            <FlatField label="Font" stacked>
                                                <FlatSelect value={selectedStyle.fontFamily} onValueChange={(value) => updateSelectedStyle('fontFamily', value)} ariaLabel="Font family">
                                                    {GOOGLE_FONTS.map((font) => (<option key={font.id} value={font.id}>{font.label}</option>))}
                                                </FlatSelect>
                                            </FlatField>
                                            <FlatField label="Typography" stacked>
                                                <div className="flex flex-wrap items-end gap-3">
                                                    <FlatUnitField label="Size" value={currentAppearanceValues.fontSize} min={10} max={72} unit="px" onChange={(value) => updateAppearanceField('fontSize', value)} />
                                                    <div className="w-[92px] shrink-0">
                                                        <FlatField label="Weight" stacked>
                                                            <FlatSelect value={currentAppearanceValues.fontWeight} onValueChange={(value) => updateAppearanceField('fontWeight', Number(value))} ariaLabel="Typography weight">
                                                                {[300, 400, 500, 600, 700].map((weight) => (<option key={weight} value={weight}>{weight}</option>))}
                                                            </FlatSelect>
                                                        </FlatField>
                                                    </div>
                                                </div>
                                            </FlatField>
                                            <FlatField label="Style">
                                                <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                    <button type="button" onClick={() => updateSelectedStyle('fontBold', !selectedStyle.fontBold)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.fontBold ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                        <TypeBold className="size-4" />
                                                    </button>
                                                    <button type="button" onClick={() => updateSelectedStyle('fontItalic', !selectedStyle.fontItalic)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.fontItalic ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                        <TypeItalic className="size-4" />
                                                    </button>
                                                    <button type="button" onClick={() => updateSelectedStyle('fontUnderline', !selectedStyle.fontUnderline)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.fontUnderline ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                        <TypeUnderline className="size-4" />
                                                    </button>
                                                </div>
                                            </FlatField>
                                            {selectedInstance.kind !== 'animated-text' && (
                                                <FlatField label="Align">
                                                    <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                        {[
                                                            { value: 'left' as const, icon: TextAlignLeft },
                                                            { value: 'center' as const, icon: TextAlignCenter },
                                                            { value: 'right' as const, icon: TextAlignRight },
                                                        ].map((item) => {
                                                            const Icon = item.icon;
                                                            return (
                                                                <button key={item.value} type="button" onClick={() => updateAppearanceField('fontPosition', item.value as FontPosition)} className={cn(inspectorIconChoiceButtonBase, currentAppearanceValues.fontPosition === item.value ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                                    <Icon className="size-4" />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </FlatField>
                                            )}
                                            {!(selectedInstance.kind === 'animated-text' && (selectedStyle.animatedTextVariant === 'gradient-sweep' || selectedStyle.animatedTextVariant === 'shiny-text')) && (
                                                <FlatField label="Text" stacked>
                                                    <FlatColorControl label="Color" value={currentAppearanceValues.fontColor} opacity={currentAppearanceValues.fontOpacity} onOpacityChange={(value) => updateAppearanceField('fontOpacity', value)} onChange={(value) => updateAppearanceField('fontColor', value)} tokens={activeTokenSet.tokens} compact />
                                                </FlatField>
                                            )}
                                        </>
                                    ) : null}

                                    {supportsTextIconMode ? (
                                        <FlatField label="Content Mode" stacked>
                                            <FlatSelect value={contentDisplayMode} onValueChange={(value) => updateContentDisplayMode(value as 'text' | 'text-icon' | 'icon')} ariaLabel="Content mode">
                                                <option value="text">Text only</option>
                                                <option value="text-icon">Text + Icon</option>
                                                <option value="icon">Icon only</option>
                                            </FlatSelect>
                                        </FlatField>
                                    ) : null}

                                    <AnimatePresence initial={false}>
                                        {supportsIconSelection(selectedInstance.kind) && (contentDisplayMode === 'text-icon' || contentDisplayMode === 'icon' || selectedInstance.kind === 'alert') ? (
                                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18, ease: 'easeOut' }} className="space-y-3">
                                                <FlatField label="Icon Library">
                                                    <FlatSelect
                                                        value={selectedStyle.iconLibrary}
                                                        onValueChange={(value) => {
                                                            const nextLibrary = value as IconLibrary;
                                                            updateSelectedStyle('iconLibrary', nextLibrary);
                                                            if (nextLibrary !== 'custom') {
                                                                const nextIcon = getResolvedIconValue(nextLibrary, selectedStyle.icon, true);
                                                                updateSelectedStyle('icon', nextIcon);
                                                            }
                                                        }}
                                                        ariaLabel="Icon library"
                                                    >
                                                        {ICON_LIBRARY_OPTIONS.map((option) => (
                                                            <option key={option.id} value={option.id}>{option.label}</option>
                                                        ))}
                                                    </FlatSelect>
                                                </FlatField>
                                                {selectedStyle.iconLibrary === 'custom' ? (
                                                    <>
                                                        <FlatField label="Icon Import Path" stacked>
                                                            <input
                                                                type="text"
                                                                value={selectedStyle.iconCustomImportPath}
                                                                onChange={(event) => updateSelectedStyle('iconCustomImportPath', event.target.value)}
                                                                className={studioInputClass}
                                                                placeholder="@my/icons"
                                                            />
                                                        </FlatField>
                                                        <FlatField label="Icon Name" stacked>
                                                            <input
                                                                type="text"
                                                                value={selectedStyle.iconCustomName}
                                                                onChange={(event) => updateSelectedStyle('iconCustomName', event.target.value)}
                                                                className={studioInputClass}
                                                                placeholder="RocketIcon"
                                                            />
                                                        </FlatField>
                                                    </>
                                                ) : (
                                                    <FlatField label="Icon">
                                                        <FlatSelect
                                                            value={getResolvedIconValue(selectedStyle.iconLibrary, selectedStyle.icon, true)}
                                                            onValueChange={(value) => updateSelectedStyle('icon', value as IconOptionId)}
                                                            ariaLabel="Icon"
                                                        >
                                                            {getIconOptionsForLibrary(selectedStyle.iconLibrary).map((option) => (
                                                                <option key={option.id} value={option.id}>{option.label}</option>
                                                            ))}
                                                        </FlatSelect>
                                                    </FlatField>
                                                )}
                                                <FlatField label="Icon Position">
                                                    <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                        {(['left', 'right'] as const).map((position) => (
                                                            <button key={position} type="button" onClick={() => updateSelectedStyle('iconPosition', position)} className={cn(inspectorChoiceButtonBase, selectedStyle.iconPosition === position ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                                {position}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </FlatField>
                                            </motion.div>
                                        ) : null}
                                    </AnimatePresence>
                                </>
                            ) : null}
                        </FlatInspectorSection>
                    </div>}

                    {/* DataTable Config */}
                    {selectedInstance?.kind === 'data-table' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Table Config" icon={Table} defaultOpen>
                                <FlatField label="Variant">
                                    <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                        {(['default', 'bordered'] as const).map((v) => (
                                            <button key={v} type="button" onClick={() => updateSelectedStyle('dataTableVariant', v)} className={cn(inspectorChoiceButtonBase, selectedStyle.dataTableVariant === v ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                {v === 'default' ? 'Default' : 'Bordered'}
                                            </button>
                                        ))}
                                    </div>
                                </FlatField>
                                <div className="space-y-1.5">
                                    <FlatSwitchRow label="Sortable" checked={selectedStyle.dataTableSortable} onCheckedChange={(value) => updateSelectedStyle('dataTableSortable', value)} />
                                    <FlatSwitchRow label="Striped" checked={selectedStyle.dataTableStriped} onCheckedChange={(value) => updateSelectedStyle('dataTableStriped', value)} />
                                    <FlatSwitchRow label="Show Status Badges" checked={selectedStyle.dataTableShowStatusBadge} onCheckedChange={(value) => updateSelectedStyle('dataTableShowStatusBadge', value)} />
                                </div>
                                <div className="flex flex-wrap items-start gap-3">
                                    <FlatUnitField label="Columns" value={selectedStyle.dataTableColumns} min={2} max={6} unit="" onChange={(value) => updateSelectedStyle('dataTableColumns', value)} />
                                    <FlatUnitField label="Rows" value={selectedStyle.dataTableRows} min={1} max={10} unit="" onChange={(value) => updateSelectedStyle('dataTableRows', value)} />
                                </div>
                                <FlatColorControl label="Header Background" value={selectedStyle.dataTableHeaderBg} onChange={(value) => updateSelectedStyle('dataTableHeaderBg', value)} tokens={activeTokenSet.tokens} />
                                <FlatColorControl label="Row Background" value={selectedStyle.dataTableRowBg} onChange={(value) => updateSelectedStyle('dataTableRowBg', value)} tokens={activeTokenSet.tokens} />
                                {selectedStyle.dataTableStriped ? (
                                    <FlatColorControl label="Stripe Color" value={selectedStyle.dataTableStripedBg} onChange={(value) => updateSelectedStyle('dataTableStripedBg', value)} tokens={activeTokenSet.tokens} />
                                ) : null}
                                <FlatColorControl label="Header Text Color" value={selectedStyle.dataTableHeaderTextColor} onChange={(value) => updateSelectedStyle('dataTableHeaderTextColor', value)} tokens={activeTokenSet.tokens} />
                                <FlatColorControl label="Text Color" value={selectedStyle.dataTableTextColor} onChange={(value) => updateSelectedStyle('dataTableTextColor', value)} tokens={activeTokenSet.tokens} />
                                <FlatColorControl label="Border Color" value={selectedStyle.dataTableBorderColor} onChange={(value) => updateSelectedStyle('dataTableBorderColor', value)} tokens={activeTokenSet.tokens} />
                                {selectedStyle.dataTableShowStatusBadge ? (
                                    <>
                                        <FlatColorControl label="Success Badge" value={selectedStyle.dataTableBadgeSuccessColor} onChange={(value) => updateSelectedStyle('dataTableBadgeSuccessColor', value)} tokens={activeTokenSet.tokens} />
                                        <FlatColorControl label="Warning Badge" value={selectedStyle.dataTableBadgeWarningColor} onChange={(value) => updateSelectedStyle('dataTableBadgeWarningColor', value)} tokens={activeTokenSet.tokens} />
                                        <FlatColorControl label="Error Badge" value={selectedStyle.dataTableBadgeErrorColor} onChange={(value) => updateSelectedStyle('dataTableBadgeErrorColor', value)} tokens={activeTokenSet.tokens} />
                                    </>
                                ) : null}
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Drawer Config */}
                    {selectedInstance?.kind === 'drawer' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Drawer Config" icon={Table} defaultOpen>
                                <FlatField label="Side">
                                    <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                        {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
                                            <button key={side} type="button" onClick={() => updateSelectedStyle('drawerSide', side)} className={cn(inspectorChoiceButtonBase, selectedStyle.drawerSide === side ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                {side.charAt(0).toUpperCase() + side.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </FlatField>
                                <FlatUnitField label="Width" value={selectedStyle.drawerWidth} min={200} max={600} unit="px" onChange={(value) => updateSelectedStyle('drawerWidth', value)} />
                                <FlatUnitField label="Overlay Blur" value={selectedStyle.drawerOverlayBlur} min={0} max={20} unit="px" onChange={(value) => updateSelectedStyle('drawerOverlayBlur', value)} />
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Dropdown Config */}
                    {selectedInstance?.kind === 'dropdown' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Dropdown Config" icon={Table} defaultOpen>
                                <FlatField label="Trigger">
                                    <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                        {(['button', 'icon'] as const).map((v) => (
                                            <button key={v} type="button" onClick={() => updateSelectedStyle('dropdownTriggerVariant', v)} className={cn(inspectorChoiceButtonBase, selectedStyle.dropdownTriggerVariant === v ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                {v === 'button' ? 'Text Button' : 'Icon Button'}
                                            </button>
                                        ))}
                                    </div>
                                </FlatField>
                                <div className="space-y-1.5">
                                    <FlatSwitchRow label="Show Item Icons" checked={selectedStyle.dropdownShowItemIcons} onCheckedChange={(value) => updateSelectedStyle('dropdownShowItemIcons', value)} />
                                    <FlatSwitchRow label="Show Submenu" checked={selectedStyle.dropdownShowSubmenu} onCheckedChange={(value) => updateSelectedStyle('dropdownShowSubmenu', value)} />
                                </div>
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Popover Config */}
                    {selectedInstance?.kind === 'popover' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Popover Config" icon={Table} defaultOpen>
                                <FlatField label="Side">
                                    <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                                            <button key={side} type="button" onClick={() => updateSelectedStyle('popoverSide', side)} className={cn(inspectorChoiceButtonBase, selectedStyle.popoverSide === side ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                {side.charAt(0).toUpperCase() + side.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </FlatField>
                                <FlatField label="Align">
                                    <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                        {(['start', 'center', 'end'] as const).map((align) => (
                                            <button key={align} type="button" onClick={() => updateSelectedStyle('popoverAlign', align)} className={cn(inspectorChoiceButtonBase, selectedStyle.popoverAlign === align ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                {align.charAt(0).toUpperCase() + align.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </FlatField>
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Nav Menu Config */}
                    {selectedInstance?.kind === 'navigation-menu' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Nav Menu Config" icon={Table} defaultOpen>
                                <FlatElementSubsection title="Behavior" defaultOpen>
                                    <FlatField label="Orientation">
                                        <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                            {(['horizontal', 'vertical'] as const).map((v) => (
                                                <button key={v} type="button" onClick={() => updateSelectedStyle('navMenuOrientation', v)} className={cn(inspectorChoiceButtonBase, selectedStyle.navMenuOrientation === v ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </FlatField>
                                    <FlatField label="Style">
                                        <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                            {(['ghost', 'default'] as const).map((v) => (
                                                <button key={v} type="button" onClick={() => updateSelectedStyle('navMenuTriggerVariant', v)} className={cn(inspectorChoiceButtonBase, selectedStyle.navMenuTriggerVariant === v ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </FlatField>
                                    <FlatUnitField label="Items" value={selectedStyle.navMenuItemCount} min={2} max={5} unit="" onChange={(value) => updateSelectedStyle('navMenuItemCount', value)} />
                                    <div className="space-y-1.5">
                                        <FlatSwitchRow label="Active Indicator" checked={selectedStyle.navMenuActiveIndicator} onCheckedChange={(value) => updateSelectedStyle('navMenuActiveIndicator', value)} />
                                        <FlatSwitchRow label="Show Dropdown" checked={selectedStyle.navMenuShowDropdown} onCheckedChange={(value) => updateSelectedStyle('navMenuShowDropdown', value)} />
                                    </div>
                                </FlatElementSubsection>
                                <FlatElementSubsection title="Colors" defaultOpen={false}>
                                    <FlatColorControl label="Hover Background" value={selectedStyle.navMenuHoverBg} onChange={(value) => updateSelectedStyle('navMenuHoverBg', value)} tokens={activeTokenSet.tokens} />
                                    <FlatColorControl label="Hover Text" value={selectedStyle.navMenuHoverText} onChange={(value) => updateSelectedStyle('navMenuHoverText', value)} tokens={activeTokenSet.tokens} />
                                    <FlatColorControl label="Active Background" value={selectedStyle.navMenuActiveBg} onChange={(value) => updateSelectedStyle('navMenuActiveBg', value)} tokens={activeTokenSet.tokens} />
                                    <FlatColorControl label="Active Text" value={selectedStyle.navMenuActiveText} onChange={(value) => updateSelectedStyle('navMenuActiveText', value)} tokens={activeTokenSet.tokens} />
                                </FlatElementSubsection>
                                {selectedStyle.navMenuShowDropdown ? (
                                    <FlatElementSubsection title="Dropdown Panel" defaultOpen={false}>
                                        <FlatColorControl label="Background" value={selectedStyle.navMenuDropdownBg} onChange={(value) => updateSelectedStyle('navMenuDropdownBg', value)} tokens={activeTokenSet.tokens} />
                                        <FlatColorControl label="Text" value={selectedStyle.navMenuDropdownText} onChange={(value) => updateSelectedStyle('navMenuDropdownText', value)} tokens={activeTokenSet.tokens} />
                                        <FlatColorControl label="Border" value={selectedStyle.navMenuDropdownBorderColor} onChange={(value) => updateSelectedStyle('navMenuDropdownBorderColor', value)} tokens={activeTokenSet.tokens} />
                                    </FlatElementSubsection>
                                ) : null}
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Accordion Config */}
                    {selectedInstance?.kind === 'accordion' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Accordion Config" icon={Table} defaultOpen>
                                <FlatElementSubsection title="Layout & Behavior" defaultOpen>
                                    <div className="space-y-2">
                                        <FlatSwitchRow label="Collapsible" checked={selectedStyle.accordionCollapsible} onCheckedChange={(value) => updateSelectedStyle('accordionCollapsible', value)} />
                                        <FlatSwitchRow label="Allow Multiple" checked={selectedStyle.accordionAllowMultiple} onCheckedChange={(value) => updateSelectedStyle('accordionAllowMultiple', value)} />
                                    </div>
                                    <FlatUnitField label="Items" value={selectedStyle.accordionItemCount} min={1} max={8} unit="" onChange={(value) => updateSelectedStyle('accordionItemCount', value)} />
                                    <div className="flex flex-wrap items-start gap-3">
                                        <FlatUnitField label="Padding (H)" value={selectedStyle.accordionPaddingH} min={0} max={48} unit="px" onChange={(value) => updateSelectedStyle('accordionPaddingH', value)} />
                                        <FlatUnitField label="Padding (W)" value={selectedStyle.accordionPaddingW} min={0} max={48} unit="px" onChange={(value) => updateSelectedStyle('accordionPaddingW', value)} />
                                        <FlatUnitField label="Spacing" value={selectedStyle.accordionSpacing} min={0} max={32} unit="px" onChange={(value) => updateSelectedStyle('accordionSpacing', value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <FlatSwitchRow label="Divider" checked={selectedStyle.accordionDividerEnabled} onCheckedChange={(value) => updateSelectedStyle('accordionDividerEnabled', value)} />
                                        {selectedStyle.accordionDividerEnabled && (
                                            <>
                                                <FlatUnitField label="Divider Weight" value={selectedStyle.accordionDividerWeight} min={0.5} max={4} step={0.5} unit="px" onChange={(value) => updateSelectedStyle('accordionDividerWeight', value)} />
                                                <FlatColorControl label="Divider Color" value={selectedStyle.accordionDividerColor} onChange={(value) => updateSelectedStyle('accordionDividerColor', value)} tokens={activeTokenSet.tokens} />
                                            </>
                                        )}
                                    </div>
                                </FlatElementSubsection>
                                <FlatElementSubsection title="Icons" defaultOpen={false}>
                                    <FlatSwitchRow label="Show Icons" checked={selectedStyle.accordionShowIcons} onCheckedChange={(value) => updateSelectedStyle('accordionShowIcons', value)} />
                                    {selectedStyle.accordionShowIcons && (
                                        <FlatField label="Icon Position">
                                            <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                {(['left', 'right'] as const).map((position) => (
                                                    <button key={position} type="button" onClick={() => updateSelectedStyle('accordionIconPosition', position)} className={cn(inspectorChoiceButtonBase, selectedStyle.accordionIconPosition === position ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                        {position === 'left' ? 'Left' : 'Right'}
                                                    </button>
                                                ))}
                                            </div>
                                        </FlatField>
                                    )}
                                </FlatElementSubsection>
                                <FlatElementSubsection title="Trigger Typography" defaultOpen={false}>
                                    <FlatField label="Font" stacked>
                                        <FlatSelect value={selectedStyle.accordionTriggerFontFamily} onValueChange={(value) => updateSelectedStyle('accordionTriggerFontFamily', value)} ariaLabel="Trigger font family">
                                            {GOOGLE_FONTS.map((font) => (<option key={font.id} value={font.id}>{font.label}</option>))}
                                        </FlatSelect>
                                    </FlatField>
                                    <div className="flex flex-wrap items-end gap-3">
                                        <FlatUnitField label="Size" value={selectedStyle.accordionTriggerFontSize} min={10} max={72} unit="px" onChange={(value) => updateSelectedStyle('accordionTriggerFontSize', value)} />
                                        <div className="w-[92px] shrink-0">
                                            <FlatField label="Weight" stacked>
                                                <FlatSelect value={selectedStyle.accordionTriggerFontWeight} onValueChange={(value) => updateSelectedStyle('accordionTriggerFontWeight', Number(value))} ariaLabel="Trigger font weight">
                                                    {[300, 400, 500, 600, 700].map((weight) => (<option key={weight} value={weight}>{weight}</option>))}
                                                </FlatSelect>
                                            </FlatField>
                                        </div>
                                    </div>
                                    <FlatField label="Style">
                                        <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                            <button type="button" onClick={() => updateSelectedStyle('accordionTriggerFontBold', !selectedStyle.accordionTriggerFontBold)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.accordionTriggerFontBold ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                <TypeBold className="size-4" />
                                            </button>
                                            <button type="button" onClick={() => updateSelectedStyle('accordionTriggerFontItalic', !selectedStyle.accordionTriggerFontItalic)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.accordionTriggerFontItalic ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                <TypeItalic className="size-4" />
                                            </button>
                                            <button type="button" onClick={() => updateSelectedStyle('accordionTriggerFontUnderline', !selectedStyle.accordionTriggerFontUnderline)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.accordionTriggerFontUnderline ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                <TypeUnderline className="size-4" />
                                            </button>
                                        </div>
                                    </FlatField>
                                    <FlatColorControl label="Color" value={selectedStyle.accordionTriggerFontColor} onChange={(value) => updateSelectedStyle('accordionTriggerFontColor', value)} tokens={activeTokenSet.tokens} />
                                </FlatElementSubsection>
                                <FlatElementSubsection title="Content Typography" defaultOpen={false}>
                                    <FlatField label="Font" stacked>
                                        <FlatSelect value={selectedStyle.accordionContentFontFamily} onValueChange={(value) => updateSelectedStyle('accordionContentFontFamily', value)} ariaLabel="Content font family">
                                            {GOOGLE_FONTS.map((font) => (<option key={font.id} value={font.id}>{font.label}</option>))}
                                        </FlatSelect>
                                    </FlatField>
                                    <div className="flex flex-wrap items-end gap-3">
                                        <FlatUnitField label="Size" value={selectedStyle.accordionContentFontSize} min={10} max={72} unit="px" onChange={(value) => updateSelectedStyle('accordionContentFontSize', value)} />
                                        <div className="w-[92px] shrink-0">
                                            <FlatField label="Weight" stacked>
                                                <FlatSelect value={selectedStyle.accordionContentFontWeight} onValueChange={(value) => updateSelectedStyle('accordionContentFontWeight', Number(value))} ariaLabel="Content font weight">
                                                    {[300, 400, 500, 600, 700].map((weight) => (<option key={weight} value={weight}>{weight}</option>))}
                                                </FlatSelect>
                                            </FlatField>
                                        </div>
                                    </div>
                                    <FlatField label="Style">
                                        <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                            <button type="button" onClick={() => updateSelectedStyle('accordionContentFontBold', !selectedStyle.accordionContentFontBold)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.accordionContentFontBold ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                <TypeBold className="size-4" />
                                            </button>
                                            <button type="button" onClick={() => updateSelectedStyle('accordionContentFontItalic', !selectedStyle.accordionContentFontItalic)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.accordionContentFontItalic ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                <TypeItalic className="size-4" />
                                            </button>
                                            <button type="button" onClick={() => updateSelectedStyle('accordionContentFontUnderline', !selectedStyle.accordionContentFontUnderline)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.accordionContentFontUnderline ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                <TypeUnderline className="size-4" />
                                            </button>
                                        </div>
                                    </FlatField>
                                    <FlatColorControl label="Color" value={selectedStyle.accordionContentFontColor} onChange={(value) => updateSelectedStyle('accordionContentFontColor', value)} tokens={activeTokenSet.tokens} />
                                </FlatElementSubsection>
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Avatar / Avatar Group Config */}
                    {(selectedInstance?.kind === 'avatar' || selectedInstance?.kind === 'avatar-group') && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title={selectedInstance.kind === 'avatar-group' ? 'Avatar Group Config' : 'Avatar Config'} icon={Table} defaultOpen>
                                {selectedInstance.kind === 'avatar' && (
                                    <>
                                        <FlatField label="Fallback Text" stacked>
                                            <input type="text" value={selectedStyle.avatarFallbackText} onChange={(e: ChangeEvent<HTMLInputElement>) => updateSelectedStyle('avatarFallbackText', e.target.value)} className="h-7 w-full rounded-md bg-[var(--inspector-input)] px-2 text-xs text-[var(--inspector-fg)]" />
                                        </FlatField>
                                        <FlatField label="Image" stacked>
                                            <div className="flex w-full items-center gap-1.5">
                                                <input type="text" value={selectedStyle.avatarSrc?.startsWith('data:') ? '(uploaded file)' : selectedStyle.avatarSrc} onChange={(e: ChangeEvent<HTMLInputElement>) => updateSelectedStyle('avatarSrc', e.target.value)} placeholder="https://..." className="h-7 min-w-0 flex-1 rounded-md bg-[var(--inspector-input)] px-2 text-xs text-[var(--inspector-fg)]" readOnly={selectedStyle.avatarSrc?.startsWith('data:')} />
                                                <label className="flex h-7 shrink-0 cursor-pointer items-center rounded-md bg-[var(--inspector-input)] px-2 text-[10px] text-[var(--inspector-fg)] transition-colors hover:bg-[var(--inspector-input-hover,var(--inspector-input))]">
                                                    Upload
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        const reader = new FileReader();
                                                        reader.onload = () => {
                                                            if (typeof reader.result === 'string') updateSelectedStyle('avatarSrc', reader.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                        e.target.value = '';
                                                    }} />
                                                </label>
                                                {selectedStyle.avatarSrc && (
                                                    <button type="button" onClick={() => updateSelectedStyle('avatarSrc', '')} className="flex h-7 shrink-0 items-center rounded-md bg-[var(--inspector-input)] px-1.5 text-[var(--inspector-fg)] opacity-60 transition-opacity hover:opacity-100">
                                                        <Delete className="size-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            {selectedStyle.avatarSrc?.startsWith('data:') && (
                                                <p className="mt-1 text-[10px] leading-tight text-[var(--inspector-fg)] opacity-40">Uploaded images are stored locally and will use a placeholder URL in exported code.</p>
                                            )}
                                        </FlatField>
                                    </>
                                )}
                                <div className="flex flex-wrap items-start gap-3">
                                    <FlatUnitField label="Size" value={selectedStyle.avatarCustomSize} min={16} max={128} unit="px" onChange={(value) => updateSelectedStyle('avatarCustomSize', value)} />
                                    <FlatUnitField label="Radius" value={selectedStyle.avatarRadius} min={0} max={999} unit="px" onChange={(value) => updateSelectedStyle('avatarRadius', value)} />
                                </div>
                                {selectedInstance.kind === 'avatar' && (
                                    <>
                                        <FlatSwitchRow label="Show Badge" checked={selectedStyle.avatarShowBadge} onCheckedChange={(value) => updateSelectedStyle('avatarShowBadge', value)} />
                                        {selectedStyle.avatarShowBadge && (
                                            <FlatColorControl label="Badge Color" value={selectedStyle.avatarBadgeColor} onChange={(value) => updateSelectedStyle('avatarBadgeColor', value)} tokens={activeTokenSet.tokens} />
                                        )}
                                    </>
                                )}
                                {selectedInstance.kind === 'avatar-group' && (
                                    <>
                                        <FlatUnitField label="Count" value={selectedStyle.avatarGroupCount} min={2} max={8} unit="" onChange={(value) => updateSelectedStyle('avatarGroupCount', value)} />
                                        <FlatUnitField label="Spacing" value={selectedStyle.avatarGroupSpacing} min={-20} max={20} unit="px" onChange={(value) => updateSelectedStyle('avatarGroupSpacing', value)} />
                                    </>
                                )}
                            </FlatInspectorSection>

                            <FlatInspectorSection title="Avatar Appearance" icon={Swatches} defaultOpen={false}>
                                {!selectedStyle.avatarSrc ? (
                                    <FlatElementSubsection title="Background" defaultOpen>
                                        <FlatField label="Mode">
                                            <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                {(['solid', 'gradient'] as const).map((mode) => (
                                                    <button key={mode} type="button" onClick={() => updateSelectedStyle('avatarBgMode', mode)} className={cn(inspectorChoiceButtonBase, selectedStyle.avatarBgMode === mode ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                        {mode === 'solid' ? 'Solid' : 'Gradient'}
                                                    </button>
                                                ))}
                                            </div>
                                        </FlatField>
                                        <FlatColorControl label="Color" value={selectedStyle.avatarBgColor} onChange={(value) => updateSelectedStyle('avatarBgColor', value)} tokens={activeTokenSet.tokens} />
                                        {selectedStyle.avatarBgMode === 'gradient' ? (
                                            <FlatColorControl label="Color To" value={selectedStyle.avatarBgColorTo} onChange={(value) => updateSelectedStyle('avatarBgColorTo', value)} tokens={activeTokenSet.tokens} />
                                        ) : null}
                                        <FlatUnitField label="Opacity" value={selectedStyle.avatarBgOpacity} min={0} max={100} unit="%" onChange={(value) => updateSelectedStyle('avatarBgOpacity', value)} />
                                    </FlatElementSubsection>
                                ) : (
                                    <FlatElementSubsection title="Image" defaultOpen>
                                        <FlatUnitField label="Opacity" value={selectedStyle.avatarImageOpacity} min={0} max={100} unit="%" onChange={(value) => updateSelectedStyle('avatarImageOpacity', value)} />
                                        <FlatColorControl label="Overlay Color" value={selectedStyle.avatarOverlayColor} onChange={(value) => updateSelectedStyle('avatarOverlayColor', value)} tokens={activeTokenSet.tokens} />
                                        <FlatUnitField label="Overlay Opacity" value={selectedStyle.avatarOverlayOpacity} min={0} max={100} unit="%" onChange={(value) => updateSelectedStyle('avatarOverlayOpacity', value)} />
                                    </FlatElementSubsection>
                                )}

                                <FlatElementSubsection title="Stroke" defaultOpen={false}>
                                    <FlatUnitField label="Weight" value={selectedStyle.avatarStrokeWeight} min={0} max={8} unit="px" onChange={(value) => updateSelectedStyle('avatarStrokeWeight', value)} />
                                    {selectedStyle.avatarStrokeWeight > 0 ? (
                                        <>
                                            <FlatColorControl label="Color" value={selectedStyle.avatarStrokeColor} onChange={(value) => updateSelectedStyle('avatarStrokeColor', value)} tokens={activeTokenSet.tokens} />
                                            <FlatUnitField label="Opacity" value={selectedStyle.avatarStrokeOpacity} min={0} max={100} unit="%" onChange={(value) => updateSelectedStyle('avatarStrokeOpacity', value)} />
                                        </>
                                    ) : null}
                                </FlatElementSubsection>

                                {!selectedStyle.avatarSrc ? (
                                    <FlatElementSubsection title="Typography" defaultOpen={false}>
                                        <FlatField label="Font" stacked>
                                            <FlatSelect value={selectedStyle.avatarFontFamily} onValueChange={(value) => updateSelectedStyle('avatarFontFamily', value)} ariaLabel="Font family">
                                                {GOOGLE_FONTS.map((font) => (<option key={font.id} value={font.id}>{font.label}</option>))}
                                            </FlatSelect>
                                        </FlatField>
                                        <FlatUnitField label="Size" value={selectedStyle.avatarFontSize} min={8} max={72} unit="px" onChange={(value) => updateSelectedStyle('avatarFontSize', value)} />
                                        <FlatColorControl label="Color" value={selectedStyle.avatarFontColor} onChange={(value) => updateSelectedStyle('avatarFontColor', value)} tokens={activeTokenSet.tokens} />
                                        <FlatField label="Style">
                                            <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                <button type="button" onClick={() => updateSelectedStyle('avatarFontBold', !selectedStyle.avatarFontBold)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.avatarFontBold ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                    <TypeBold className="size-4" />
                                                </button>
                                                <button type="button" onClick={() => updateSelectedStyle('avatarFontItalic', !selectedStyle.avatarFontItalic)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.avatarFontItalic ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                    <TypeItalic className="size-4" />
                                                </button>
                                                <button type="button" onClick={() => updateSelectedStyle('avatarFontUnderline', !selectedStyle.avatarFontUnderline)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.avatarFontUnderline ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                    <TypeUnderline className="size-4" />
                                                </button>
                                            </div>
                                        </FlatField>
                                    </FlatElementSubsection>
                                ) : null}

                                <FlatElementSubsection title="Hover Popover" defaultOpen={false}>
                                    <FlatSwitchRow label="Enable Popover" checked={selectedStyle.avatarPopoverEnabled} onCheckedChange={(value) => updateSelectedStyle('avatarPopoverEnabled', value)} />
                                    {selectedStyle.avatarPopoverEnabled ? (
                                        <>
                                            <FlatUnitField label="Delay (ms)" value={selectedStyle.avatarPopoverDelay} min={0} max={2000} step={10} unit="ms" onChange={(value) => updateSelectedStyle('avatarPopoverDelay', value)} />
                                            <div className="flex flex-wrap items-start gap-3">
                                                <FlatUnitField label="Width" value={selectedStyle.avatarPopoverWidth} min={120} max={320} unit="px" onChange={(value) => updateSelectedStyle('avatarPopoverWidth', value)} />
                                                <FlatUnitField label="Padding" value={selectedStyle.avatarPopoverPadding} min={0} max={32} unit="px" onChange={(value) => updateSelectedStyle('avatarPopoverPadding', value)} />
                                                <FlatUnitField label="Radius" value={selectedStyle.avatarPopoverRadius} min={0} max={24} unit="px" onChange={(value) => updateSelectedStyle('avatarPopoverRadius', value)} />
                                            </div>
                                            <FlatField label="BG Mode">
                                                <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                    {(['solid', 'gradient'] as const).map((mode) => (
                                                        <button key={mode} type="button" onClick={() => updateSelectedStyle('avatarPopoverBgMode', mode)} className={cn(inspectorChoiceButtonBase, selectedStyle.avatarPopoverBgMode === mode ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                            {mode === 'solid' ? 'Solid' : 'Gradient'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </FlatField>
                                            <FlatColorControl label="BG Color" value={selectedStyle.avatarPopoverBgColor} onChange={(value) => updateSelectedStyle('avatarPopoverBgColor', value)} tokens={activeTokenSet.tokens} />
                                            {selectedStyle.avatarPopoverBgMode === 'gradient' ? (
                                                <FlatColorControl label="BG Color To" value={selectedStyle.avatarPopoverBgColorTo} onChange={(value) => updateSelectedStyle('avatarPopoverBgColorTo', value)} tokens={activeTokenSet.tokens} />
                                            ) : null}
                                            <FlatUnitField label="BG Opacity" value={selectedStyle.avatarPopoverBgOpacity} min={0} max={100} unit="%" onChange={(value) => updateSelectedStyle('avatarPopoverBgOpacity', value)} />
                                            <FlatUnitField label="Stroke Weight" value={selectedStyle.avatarPopoverStrokeWeight} min={0} max={4} unit="px" onChange={(value) => updateSelectedStyle('avatarPopoverStrokeWeight', value)} />
                                            {selectedStyle.avatarPopoverStrokeWeight > 0 ? (
                                                <>
                                                    <FlatColorControl label="Stroke Color" value={selectedStyle.avatarPopoverStrokeColor} onChange={(value) => updateSelectedStyle('avatarPopoverStrokeColor', value)} tokens={activeTokenSet.tokens} />
                                                    <FlatUnitField label="Stroke Opacity" value={selectedStyle.avatarPopoverStrokeOpacity} min={0} max={100} unit="%" onChange={(value) => updateSelectedStyle('avatarPopoverStrokeOpacity', value)} />
                                                </>
                                            ) : null}
                                            <FlatField label="Font" stacked>
                                                <FlatSelect value={selectedStyle.avatarPopoverFontFamily} onValueChange={(value) => updateSelectedStyle('avatarPopoverFontFamily', value)} ariaLabel="Popover font">
                                                    {GOOGLE_FONTS.map((font) => (<option key={font.id} value={font.id}>{font.label}</option>))}
                                                </FlatSelect>
                                            </FlatField>
                                            <div className="flex flex-wrap items-end gap-3">
                                                <FlatUnitField label="Font Size" value={selectedStyle.avatarPopoverFontSize} min={8} max={24} unit="px" onChange={(value) => updateSelectedStyle('avatarPopoverFontSize', value)} />
                                                <div className="w-[92px] shrink-0">
                                                    <FlatField label="Weight" stacked>
                                                        <FlatSelect value={selectedStyle.avatarPopoverFontWeight} onValueChange={(value) => updateSelectedStyle('avatarPopoverFontWeight', Number(value))} ariaLabel="Popover font weight">
                                                            {[300, 400, 500, 600, 700].map((w) => (<option key={w} value={w}>{w}</option>))}
                                                        </FlatSelect>
                                                    </FlatField>
                                                </div>
                                            </div>
                                            <FlatField label="Style">
                                                <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                    <button type="button" onClick={() => updateSelectedStyle('avatarPopoverFontBold', !selectedStyle.avatarPopoverFontBold)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.avatarPopoverFontBold ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                        <TypeBold className="size-4" />
                                                    </button>
                                                    <button type="button" onClick={() => updateSelectedStyle('avatarPopoverFontItalic', !selectedStyle.avatarPopoverFontItalic)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.avatarPopoverFontItalic ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                        <TypeItalic className="size-4" />
                                                    </button>
                                                    <button type="button" onClick={() => updateSelectedStyle('avatarPopoverFontUnderline', !selectedStyle.avatarPopoverFontUnderline)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.avatarPopoverFontUnderline ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                        <TypeUnderline className="size-4" />
                                                    </button>
                                                </div>
                                            </FlatField>
                                            <FlatColorControl label="Font Color" value={selectedStyle.avatarPopoverFontColor} onChange={(value) => updateSelectedStyle('avatarPopoverFontColor', value)} tokens={activeTokenSet.tokens} />
                                            <div className="flex flex-wrap items-start gap-3">
                                                <FlatUnitField label="Icon Size" value={selectedStyle.avatarPopoverIconSize} min={8} max={24} unit="px" onChange={(value) => updateSelectedStyle('avatarPopoverIconSize', value)} />
                                            </div>
                                            <FlatColorControl label="Icon Color" value={selectedStyle.avatarPopoverIconColor} onChange={(value) => updateSelectedStyle('avatarPopoverIconColor', value)} tokens={activeTokenSet.tokens} />
                                        </>
                                    ) : null}
                                </FlatElementSubsection>
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Alert Config */}
                    {selectedInstance?.kind === 'alert' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Alert Config" icon={Table} defaultOpen>
                                <div className="space-y-1.5">
                                    <FlatField label="Variant" stacked>
                                        <FlatSelect value={selectedStyle.alertVariant} onValueChange={(value) => updateSelectedStyle('alertVariant', value as ComponentStyleConfig['alertVariant'])} ariaLabel="Alert variant">
                                            <option value="default">Default</option>
                                            <option value="info">Info</option>
                                            <option value="success">Success</option>
                                            <option value="warning">Warning</option>
                                            <option value="error">Error</option>
                                            <option value="destructive">Destructive</option>
                                            <option value="invert">Invert</option>
                                        </FlatSelect>
                                    </FlatField>
                                    <FlatSwitchRow label="Borderless" checked={selectedStyle.alertBorderless} onCheckedChange={(value) => updateSelectedStyle('alertBorderless', value)} />
                                    <FlatSwitchRow label="Dismissible" checked={selectedStyle.alertDismissible} onCheckedChange={(value) => updateSelectedStyle('alertDismissible', value)} />
                                    <FlatSwitchRow label="Dismiss as action" checked={selectedStyle.alertDismissAsAction} onCheckedChange={(value) => updateSelectedStyle('alertDismissAsAction', value)} />
                                    <FlatSwitchRow label="Show Icon" checked={selectedStyle.alertShowIcon} onCheckedChange={(value) => updateSelectedStyle('alertShowIcon', value)} />
                                    <FlatField label="Icon Style" stacked>
                                        <FlatSelect value={selectedStyle.alertIconMode} onValueChange={(value) => updateSelectedStyle('alertIconMode', value as ComponentStyleConfig['alertIconMode'])} ariaLabel="Alert icon style">
                                            <option value="variant">By Variant</option>
                                            <option value="shield">Shield</option>
                                            <option value="database">Database</option>
                                            <option value="globe">Globe</option>
                                            <option value="lightbulb">Lightbulb</option>
                                            <option value="circle-alert">Circle Alert</option>
                                            <option value="circle-check">Circle Check</option>
                                            <option value="x-circle">Circle X</option>
                                        </FlatSelect>
                                    </FlatField>
                                    <FlatField label="Title" stacked>
                                        <input
                                            type="text"
                                            value={selectedStyle.alertTitleText}
                                            onChange={(e) => updateSelectedStyle('alertTitleText', e.target.value)}
                                            className={studioInputClass}
                                            placeholder="Alert Title"
                                        />
                                    </FlatField>
                                    <FlatField label="Description" stacked>
                                        <textarea
                                            value={selectedStyle.alertDescriptionText}
                                            onChange={(e) => updateSelectedStyle('alertDescriptionText', e.target.value)}
                                            className={cn(studioInputClass, 'min-h-[64px] resize-y py-2')}
                                            placeholder="Alert description text"
                                        />
                                    </FlatField>
                                    <FlatField label="Description Mode" stacked>
                                        <FlatSelect value={selectedStyle.alertDescriptionMode} onValueChange={(value) => updateSelectedStyle('alertDescriptionMode', value as ComponentStyleConfig['alertDescriptionMode'])} ariaLabel="Alert description mode">
                                            <option value="plain">Plain</option>
                                            <option value="list">Bullet List</option>
                                        </FlatSelect>
                                    </FlatField>
                                    {selectedStyle.alertDescriptionMode === 'list' ? (
                                        <FlatField label="List Items" stacked>
                                            <textarea
                                                value={selectedStyle.alertListItems}
                                                onChange={(e) => updateSelectedStyle('alertListItems', e.target.value)}
                                                className={cn(studioInputClass, 'min-h-[72px] resize-y py-2')}
                                                placeholder={'Item one\nItem two\nItem three'}
                                            />
                                        </FlatField>
                                    ) : null}
                                </div>

                                <FlatElementSubsection title="Actions" defaultOpen={false}>
                                    <FlatField label="Action Mode" stacked>
                                        <FlatSelect value={selectedStyle.alertActionMode} onValueChange={(value) => updateSelectedStyle('alertActionMode', value as ComponentStyleConfig['alertActionMode'])} ariaLabel="Alert action mode">
                                            <option value="none">None</option>
                                            <option value="single">Single</option>
                                            <option value="double">Double</option>
                                        </FlatSelect>
                                    </FlatField>
                                    {selectedStyle.alertActionMode !== 'none' ? (
                                        <>
                                            <FlatField label="Action Size" stacked>
                                                <FlatSelect value={selectedStyle.alertActionSize} onValueChange={(value) => updateSelectedStyle('alertActionSize', value as ComponentStyleConfig['alertActionSize'])} ariaLabel="Alert action size">
                                                    <option value="xs">XS</option>
                                                    <option value="sm">SM</option>
                                                </FlatSelect>
                                            </FlatField>
                                            <FlatField label="Primary Label" stacked>
                                                <input
                                                    type="text"
                                                    value={selectedStyle.alertPrimaryActionLabel}
                                                    onChange={(e) => updateSelectedStyle('alertPrimaryActionLabel', e.target.value)}
                                                    className={studioInputClass}
                                                    placeholder="Primary action"
                                                />
                                            </FlatField>
                                            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                                <FlatField label="Primary Variant" stacked>
                                                    <FlatSelect value={selectedStyle.alertPrimaryActionVariant} onValueChange={(value) => updateSelectedStyle('alertPrimaryActionVariant', value as ComponentStyleConfig['alertPrimaryActionVariant'])} ariaLabel="Primary action variant">
                                                        <option value="default">Default</option>
                                                        <option value="outline">Outline</option>
                                                        <option value="ghost">Ghost</option>
                                                        <option value="link">Link</option>
                                                    </FlatSelect>
                                                </FlatField>
                                                <FlatField label="Primary Icon" stacked>
                                                    <FlatSelect value={selectedStyle.alertPrimaryActionIcon} onValueChange={(value) => updateSelectedStyle('alertPrimaryActionIcon', value as ComponentStyleConfig['alertPrimaryActionIcon'])} ariaLabel="Primary action icon">
                                                        <option value="none">None</option>
                                                        <option value="refresh">Refresh</option>
                                                        <option value="x">X</option>
                                                    </FlatSelect>
                                                </FlatField>
                                            </div>
                                            {selectedStyle.alertActionMode === 'double' ? (
                                                <>
                                                    <FlatField label="Secondary Label" stacked>
                                                        <input
                                                            type="text"
                                                            value={selectedStyle.alertSecondaryActionLabel}
                                                            onChange={(e) => updateSelectedStyle('alertSecondaryActionLabel', e.target.value)}
                                                            className={studioInputClass}
                                                            placeholder="Secondary action"
                                                        />
                                                    </FlatField>
                                                    <FlatField label="Secondary Variant" stacked>
                                                        <FlatSelect value={selectedStyle.alertSecondaryActionVariant} onValueChange={(value) => updateSelectedStyle('alertSecondaryActionVariant', value as ComponentStyleConfig['alertSecondaryActionVariant'])} ariaLabel="Secondary action variant">
                                                            <option value="default">Default</option>
                                                            <option value="outline">Outline</option>
                                                            <option value="ghost">Ghost</option>
                                                            <option value="link">Link</option>
                                                        </FlatSelect>
                                                    </FlatField>
                                                </>
                                            ) : null}
                                    </>
                                    ) : null}
                                    <FlatSwitchRow label="Inline Link" checked={selectedStyle.alertShowInlineLink} onCheckedChange={(value) => updateSelectedStyle('alertShowInlineLink', value)} />
                                    {selectedStyle.alertShowInlineLink ? (
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                            <FlatField label="Link Label" stacked>
                                                <input
                                                    type="text"
                                                    value={selectedStyle.alertInlineLinkLabel}
                                                    onChange={(e) => updateSelectedStyle('alertInlineLinkLabel', e.target.value)}
                                                    className={studioInputClass}
                                                    placeholder="Learn more"
                                                />
                                            </FlatField>
                                            <FlatField label="Link Variant" stacked>
                                                <FlatSelect value={selectedStyle.alertInlineLinkVariant} onValueChange={(value) => updateSelectedStyle('alertInlineLinkVariant', value as ComponentStyleConfig['alertInlineLinkVariant'])} ariaLabel="Inline link variant">
                                                    <option value="link">Link</option>
                                                    <option value="ghost">Ghost</option>
                                                    <option value="outline">Outline</option>
                                                    <option value="default">Default</option>
                                                </FlatSelect>
                                            </FlatField>
                                        </div>
                                    ) : null}
                                </FlatElementSubsection>
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {selectedInstance?.kind === 'tooltip' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Tooltip Config" icon={Sparkles} defaultOpen>
                                <FlatSwitchRow
                                    label="Show arrow"
                                    checked={selectedStyle.tooltipArrow}
                                    onCheckedChange={(value) => updateSelectedStyle('tooltipArrow', value)}
                                />
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {selectedInstance?.kind === 'dialog' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Dialog Config" icon={Sparkles} defaultOpen>
                                <FlatElementSubsection title="Title Typography" defaultOpen={false}>
                                    <FlatField label="Text" stacked>
                                        <input
                                            type="text"
                                            value={selectedStyle.dialogTitleText}
                                            onChange={(event) => updateSelectedStyle('dialogTitleText', event.target.value)}
                                            className={studioInputClass}
                                            placeholder="Heading copy"
                                        />
                                    </FlatField>
                                    <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5">
                                        <FlatColorControl
                                            label="Color"
                                            value={selectedStyle.dialogTitleColor}
                                            onChange={(value) => updateSelectedStyle('dialogTitleColor', value)}
                                            tokens={activeTokenSet.tokens}
                                            compact
                                        />
                                        <FlatField label="Alignment" stacked>
                                            <FlatSelect value={selectedStyle.dialogTitleAlign} onValueChange={(value) => updateSelectedStyle('dialogTitleAlign', value as FontPosition)} ariaLabel="Dialog title alignment">
                                                <option value="left">Left</option>
                                                <option value="center">Center</option>
                                                <option value="right">Right</option>
                                            </FlatSelect>
                                        </FlatField>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5">
                                        <FlatUnitField label="Size" value={selectedStyle.dialogTitleSize} min={16} max={32} unit="px" onChange={(value) => updateSelectedStyle('dialogTitleSize', value)} />
                                        <FlatField label="Weight" stacked>
                                            <FlatSelect value={selectedStyle.dialogTitleWeight} onValueChange={(value) => updateSelectedStyle('dialogTitleWeight', Number(value))} ariaLabel="Dialog title weight">
                                                {cardWeightOptions.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </FlatSelect>
                                        </FlatField>
                                    </div>
                                </FlatElementSubsection>

                                <FlatElementSubsection title="Body Typography" defaultOpen={false}>
                                    <FlatField label="Text" stacked>
                                        <input
                                            type="text"
                                            value={selectedStyle.dialogBodyText}
                                            onChange={(event) => updateSelectedStyle('dialogBodyText', event.target.value)}
                                            className={studioInputClass}
                                            placeholder="Body copy"
                                        />
                                    </FlatField>
                                    <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5">
                                        <FlatColorControl
                                            label="Color"
                                            value={selectedStyle.dialogBodyColor}
                                            onChange={(value) => updateSelectedStyle('dialogBodyColor', value)}
                                            tokens={activeTokenSet.tokens}
                                            compact
                                        />
                                        <FlatField label="Alignment" stacked>
                                            <FlatSelect value={selectedStyle.dialogBodyAlign} onValueChange={(value) => updateSelectedStyle('dialogBodyAlign', value as FontPosition)} ariaLabel="Dialog body alignment">
                                                <option value="left">Left</option>
                                                <option value="center">Center</option>
                                                <option value="right">Right</option>
                                            </FlatSelect>
                                        </FlatField>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5">
                                        <FlatUnitField label="Size" value={selectedStyle.dialogBodySize} min={12} max={20} unit="px" onChange={(value) => updateSelectedStyle('dialogBodySize', value)} />
                                        <FlatField label="Weight" stacked>
                                            <FlatSelect value={selectedStyle.dialogBodyWeight} onValueChange={(value) => updateSelectedStyle('dialogBodyWeight', Number(value))} ariaLabel="Dialog body weight">
                                                {cardWeightOptions.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </FlatSelect>
                                        </FlatField>
                                    </div>
                                </FlatElementSubsection>

                                <FlatElementSubsection title="Actions" defaultOpen={false}>
                                    <FlatSwitchRow
                                        label="Show close icon"
                                        checked={selectedStyle.dialogShowCloseIcon}
                                        onCheckedChange={(value) => updateSelectedStyle('dialogShowCloseIcon', value)}
                                    />
                                    <FlatSwitchRow
                                        label="Show action button"
                                        checked={selectedStyle.dialogShowActionButton}
                                        onCheckedChange={(value) => updateSelectedStyle('dialogShowActionButton', value)}
                                    />
                                    {selectedStyle.dialogShowActionButton ? (
                                        <FlatField label="Action button text" stacked>
                                            <input
                                                type="text"
                                                value={selectedStyle.dialogActionButtonText}
                                                onChange={(event) => updateSelectedStyle('dialogActionButtonText', event.target.value)}
                                                className={studioInputClass}
                                            />
                                        </FlatField>
                                    ) : null}
                                </FlatElementSubsection>
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {selectedInstance?.kind === 'input' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Input Config" icon={Table} defaultOpen>
                                <FlatField label="Label" stacked>
                                    <input
                                        type="text"
                                        value={selectedStyle.inputLabel}
                                        onChange={(e) => updateSelectedStyle('inputLabel', e.target.value)}
                                        className={studioInputClass}
                                        placeholder="No label"
                                    />
                                </FlatField>
                                <FlatField label="Placeholder" stacked>
                                    <input
                                        type="text"
                                        value={selectedStyle.inputPlaceholder}
                                        onChange={(e) => updateSelectedStyle('inputPlaceholder', e.target.value)}
                                        className={studioInputClass}
                                        placeholder="Type here..."
                                    />
                                </FlatField>
                                <FlatElementSubsection title="Icon" defaultOpen={false}>
                                    <FlatSwitchRow label="Show Icon" checked={selectedStyle.inputShowIcon} onCheckedChange={(value) => {
                                        updateSelectedStyle('inputShowIcon', value);
                                        if (value && selectedStyle.icon === 'none') {
                                            const fallbackLibrary = selectedStyle.iconLibrary === 'custom' ? 'studio' : selectedStyle.iconLibrary;
                                            updateSelectedStyle('icon', getDefaultIconForLibrary(fallbackLibrary));
                                        }
                                    }} />
                                    {selectedStyle.inputShowIcon ? (
                                        <>
                                            <FlatField label="Icon Library">
                                                <FlatSelect
                                                    value={selectedStyle.iconLibrary}
                                                    onValueChange={(value) => {
                                                        const nextLibrary = value as IconLibrary;
                                                        updateSelectedStyle('iconLibrary', nextLibrary);
                                                        if (nextLibrary !== 'custom') {
                                                            updateSelectedStyle('icon', getResolvedIconValue(nextLibrary, selectedStyle.icon, false));
                                                        }
                                                    }}
                                                    ariaLabel="Input icon library"
                                                >
                                                    {ICON_LIBRARY_OPTIONS.map((option) => (
                                                        <option key={option.id} value={option.id}>{option.label}</option>
                                                    ))}
                                                </FlatSelect>
                                            </FlatField>
                                            {selectedStyle.iconLibrary === 'custom' ? (
                                                <>
                                                    <FlatField label="Icon Import Path" stacked>
                                                        <input
                                                            type="text"
                                                            value={selectedStyle.iconCustomImportPath}
                                                            onChange={(event) => updateSelectedStyle('iconCustomImportPath', event.target.value)}
                                                            className={studioInputClass}
                                                            placeholder="@my/icons"
                                                        />
                                                    </FlatField>
                                                    <FlatField label="Icon Name" stacked>
                                                        <input
                                                            type="text"
                                                            value={selectedStyle.iconCustomName}
                                                            onChange={(event) => updateSelectedStyle('iconCustomName', event.target.value)}
                                                            className={studioInputClass}
                                                            placeholder="SearchIcon"
                                                        />
                                                    </FlatField>
                                                </>
                                            ) : (
                                                <FlatField label="Icon">
                                                    <FlatSelect
                                                        value={getResolvedIconValue(selectedStyle.iconLibrary, selectedStyle.icon, false)}
                                                        onValueChange={(value) => updateSelectedStyle('icon', value as IconOptionId)}
                                                        ariaLabel="Input icon"
                                                    >
                                                        {getIconOptionsForLibrary(selectedStyle.iconLibrary)
                                                            .filter((option) => option.id !== 'none')
                                                            .map((option) => (<option key={option.id} value={option.id}>{option.label}</option>))}
                                                    </FlatSelect>
                                                </FlatField>
                                            )}
                                            <FlatField label="Icon Position">
                                                <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                    {(['left', 'right'] as const).map((pos) => (
                                                        <button key={pos} type="button" onClick={() => updateSelectedStyle('inputIconPosition', pos)} className={cn(inspectorChoiceButtonBase, selectedStyle.inputIconPosition === pos ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                            {pos.charAt(0).toUpperCase() + pos.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </FlatField>
                                        </>
                                    ) : null}
                                </FlatElementSubsection>
                                <FlatElementSubsection title="Autocomplete" defaultOpen={false}>
                                    <FlatSwitchRow label="Show Autocomplete" checked={selectedStyle.inputAutocompleteEnabled} onCheckedChange={(value) => updateSelectedStyle('inputAutocompleteEnabled', value)} />
                                    {selectedStyle.inputAutocompleteEnabled ? (
                                        <>
                                            <FlatColorControl label="Background" value={selectedStyle.inputAutocompleteBgColor} onChange={(value) => updateSelectedStyle('inputAutocompleteBgColor', value)} tokens={activeTokenSet.tokens} />
                                            <FlatColorControl label="Border" value={selectedStyle.inputAutocompleteBorderColor} onChange={(value) => updateSelectedStyle('inputAutocompleteBorderColor', value)} tokens={activeTokenSet.tokens} />
                                            <FlatColorControl label="Text" value={selectedStyle.inputAutocompleteTextColor} onChange={(value) => updateSelectedStyle('inputAutocompleteTextColor', value)} tokens={activeTokenSet.tokens} />
                                            <FlatColorControl label="Option hover bg" value={selectedStyle.inputAutocompleteOptionHoverBgColor} onChange={(value) => updateSelectedStyle('inputAutocompleteOptionHoverBgColor', value)} tokens={activeTokenSet.tokens} />
                                            <FlatColorControl label="Option hover text" value={selectedStyle.inputAutocompleteOptionHoverTextColor} onChange={(value) => updateSelectedStyle('inputAutocompleteOptionHoverTextColor', value)} tokens={activeTokenSet.tokens} />
                                        </>
                                    ) : null}
                                </FlatElementSubsection>
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Progress Config */}
                    {selectedInstance?.kind === 'progress' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Progress Config" icon={Table} defaultOpen>
                                <div className="flex flex-wrap items-start gap-3">
                                    <FlatUnitField label="Value" value={selectedStyle.progressValue} min={0} max={100} unit="%" onChange={(value) => updateSelectedStyle('progressValue', value)} />
                                    <FlatUnitField label="Width" value={selectedStyle.customWidth} min={0} max={640} unit="px" onChange={(value) => updateSelectedStyle('customWidth', value)} zeroLabel="auto" />
                                </div>
                                <FlatField label="Variant">
                                    <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                        {(['linear', 'circular'] as const).map((v) => (
                                            <button key={v} type="button" onClick={() => updateSelectedStyle('progressVariant', v)} className={cn(inspectorChoiceButtonBase, selectedStyle.progressVariant === v ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                {v === 'linear' ? 'Linear' : 'Circular'}
                                            </button>
                                        ))}
                                    </div>
                                </FlatField>
                                {selectedStyle.progressVariant === 'circular' ? (
                                    <div className="flex flex-wrap items-start gap-3">
                                        <FlatUnitField label="Size" value={selectedStyle.progressCircularSize} min={24} max={200} unit="px" onChange={(value) => updateSelectedStyle('progressCircularSize', value)} />
                                        <FlatUnitField label="Stroke" value={selectedStyle.progressCircularStrokeWidth} min={1} max={20} unit="px" onChange={(value) => updateSelectedStyle('progressCircularStrokeWidth', value)} />
                                    </div>
                                ) : null}
                                <div className="space-y-1.5">
                                    <FlatSwitchRow label="Show Label" checked={selectedStyle.progressShowLabel} onCheckedChange={(value) => updateSelectedStyle('progressShowLabel', value)} />
                                    <FlatSwitchRow label="Animate Value" checked={selectedStyle.progressAnimateValue} onCheckedChange={(value) => updateSelectedStyle('progressAnimateValue', value)} />
                                    <FlatSwitchRow label="Play Animation" checked={selectedStyle.progressPlayAnimation} onCheckedChange={(value) => updateSelectedStyle('progressPlayAnimation', value)} />
                                </div>
                                <FlatColorControl label="Track Color" value={selectedStyle.progressTrackColor} onChange={(value) => updateSelectedStyle('progressTrackColor', value)} tokens={activeTokenSet.tokens} />
                                <FlatColorControl label="Indicator Color" value={selectedStyle.progressIndicatorColor} onChange={(value) => updateSelectedStyle('progressIndicatorColor', value)} tokens={activeTokenSet.tokens} />
                                <FlatColorControl label="Label Color" value={selectedStyle.progressLabelColor} onChange={(value) => updateSelectedStyle('progressLabelColor', value)} tokens={activeTokenSet.tokens} />
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Tabs Config */}
                    {selectedInstance?.kind === 'tabs' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Tabs Config" icon={Table} defaultOpen>
                                <FlatField label="Variant">
                                    <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                        {(['default', 'line', 'pill', 'segment'] as const).map((v) => (
                                            <button key={v} type="button" onClick={() => updateSelectedStyle('tabsVariant', v)} className={cn(inspectorChoiceButtonBase, selectedStyle.tabsVariant === v ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                {v === 'default' ? 'Default' : v === 'line' ? 'Line' : v === 'pill' ? 'Pill' : 'Segment'}
                                            </button>
                                        ))}
                                    </div>
                                </FlatField>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                    <FlatUnitField label="Tab Count" value={selectedStyle.tabsCount} min={2} max={6} unit="" onChange={(value) => updateSelectedStyle('tabsCount', value)} />
                                    <FlatSwitchRow label="Full Width" checked={selectedStyle.tabsFullWidth} onCheckedChange={(value) => updateSelectedStyle('tabsFullWidth', value)} />
                                </div>

                                <FlatElementSubsection title="Primary Colors" defaultOpen>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                        <FlatColorControl
                                            label="List Background"
                                            value={selectedStyle.tabsListBg}
                                            onChange={(value) => updateSelectedStyle('tabsListBg', value)}
                                            tokens={activeTokenSet.tokens}
                                            compact
                                        />
                                        {selectedStyle.tabsVariant === 'line' ? (
                                            <FlatColorControl
                                                label="Indicator Color"
                                                value={selectedStyle.tabsActiveBorderColor || selectedStyle.tabsIndicatorColor}
                                                onChange={(value) => updateSelectedStyles({
                                                    tabsIndicatorColor: value,
                                                    tabsActiveBorderColor: value,
                                                })}
                                                tokens={activeTokenSet.tokens}
                                                compact
                                            />
                                        ) : (
                                            <FlatColorControl
                                                label="Active Tab Bg"
                                                value={selectedStyle.tabsActiveBg}
                                                onChange={(value) => updateSelectedStyle('tabsActiveBg', value)}
                                                tokens={activeTokenSet.tokens}
                                                compact
                                            />
                                        )}
                                        <FlatColorControl
                                            label="Active Text"
                                            value={selectedStyle.tabsActiveTextColor}
                                            onChange={(value) => updateSelectedStyle('tabsActiveTextColor', value)}
                                            tokens={activeTokenSet.tokens}
                                            compact
                                        />
                                        <FlatColorControl
                                            label="Inactive Text"
                                            value={selectedStyle.tabsInactiveTextColor}
                                            onChange={(value) => updateSelectedStyle('tabsInactiveTextColor', value)}
                                            tokens={activeTokenSet.tokens}
                                            compact
                                        />
                                    </div>
                                </FlatElementSubsection>

                                <FlatElementSubsection title="Layout & Shape" defaultOpen={false}>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                        <FlatUnitField label="Tab Gap" value={selectedStyle.tabsGap} min={0} max={16} unit="px" onChange={(value) => updateSelectedStyle('tabsGap', value)} />
                                        <FlatUnitField label="List Padding H" value={selectedStyle.tabsListPaddingX} min={0} max={24} unit="px" onChange={(value) => updateSelectedStyle('tabsListPaddingX', value)} />
                                        <FlatUnitField label="List Padding V" value={selectedStyle.tabsListPaddingY} min={0} max={16} unit="px" onChange={(value) => updateSelectedStyle('tabsListPaddingY', value)} />
                                        <FlatUnitField label="Tab Padding H" value={selectedStyle.tabsTabPaddingX} min={0} max={32} unit="px" onChange={(value) => updateSelectedStyle('tabsTabPaddingX', value)} />
                                        <FlatUnitField label="List Radius" value={selectedStyle.tabsListRadius} min={0} max={24} unit="px" onChange={(value) => updateSelectedStyle('tabsListRadius', value)} />
                                        <FlatUnitField label="Tab Radius" value={selectedStyle.tabsTabRadius} min={0} max={20} unit="px" onChange={(value) => updateSelectedStyle('tabsTabRadius', value)} />
                                    </div>
                                </FlatElementSubsection>

                                <FlatElementSubsection title="Typography" defaultOpen={false}>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                        <FlatUnitField label="Font Size" value={selectedStyle.tabsListFontSize} min={10} max={20} unit="px" onChange={(value) => updateSelectedStyle('tabsListFontSize', value)} />
                                        <FlatField label="Weight">
                                            <FlatSelect value={selectedStyle.tabsListFontWeight} onValueChange={(value) => updateSelectedStyle('tabsListFontWeight', Number(value))} ariaLabel="Tabs list font weight">
                                                {[400, 500, 600, 700].map((weight) => (
                                                    <option key={weight} value={weight}>{weight}</option>
                                                ))}
                                            </FlatSelect>
                                        </FlatField>
                                    </div>
                                </FlatElementSubsection>

                                <FlatElementSubsection title="Advanced Colors" defaultOpen={false}>
                                    <div className="grid grid-cols-[1fr_110px] gap-2 items-end">
                                        <FlatColorControl
                                            label="List Border"
                                            value={selectedStyle.tabsListBorderColor}
                                            onChange={(value) => updateSelectedStyle('tabsListBorderColor', value)}
                                            tokens={activeTokenSet.tokens}
                                            stacked
                                            compact
                                        />
                                        <FlatUnitField label="Width" value={selectedStyle.tabsListBorderWidth} min={0} max={6} step={1} unit="px" onChange={(value) => updateSelectedStyle('tabsListBorderWidth', value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                        <FlatColorControl
                                            label="Inactive Bg"
                                            value={selectedStyle.tabsInactiveBg}
                                            onChange={(value) => updateSelectedStyle('tabsInactiveBg', value)}
                                            tokens={activeTokenSet.tokens}
                                            compact
                                        />
                                        <FlatColorControl
                                            label="Hover Bg"
                                            value={selectedStyle.tabsHoverBg}
                                            onChange={(value) => updateSelectedStyle('tabsHoverBg', value)}
                                            tokens={activeTokenSet.tokens}
                                            compact
                                        />
                                        <FlatColorControl
                                            label="Hover Text"
                                            value={selectedStyle.tabsHoverTextColor}
                                            onChange={(value) => updateSelectedStyle('tabsHoverTextColor', value)}
                                            tokens={activeTokenSet.tokens}
                                            compact
                                        />
                                    </div>
                                </FlatElementSubsection>

                                <FlatElementSubsection title="Icons" defaultOpen={false}>
                                    <FlatSwitchRow
                                        label="Show Icons"
                                        checked={selectedStyle.tabsShowIcons}
                                        onCheckedChange={(value) => {
                                            updateSelectedStyle('tabsShowIcons', value);
                                            if (value && selectedStyle.icon === 'none') {
                                                const fallbackLibrary = selectedStyle.iconLibrary === 'custom' ? 'studio' : selectedStyle.iconLibrary;
                                                updateSelectedStyle('icon', getDefaultIconForLibrary(fallbackLibrary));
                                            }
                                        }}
                                    />
                                    {selectedStyle.tabsShowIcons ? (
                                        <>
                                            <FlatField label="Icon Library" stacked>
                                                <FlatSelect
                                                    value={selectedStyle.iconLibrary}
                                                    onValueChange={(value) => {
                                                        const nextLibrary = value as IconLibrary;
                                                        updateSelectedStyle('iconLibrary', nextLibrary);
                                                        if (nextLibrary !== 'custom') {
                                                            updateSelectedStyle('icon', getResolvedIconValue(nextLibrary, selectedStyle.icon, false));
                                                        }
                                                    }}
                                                    ariaLabel="Tabs icon library"
                                                >
                                                    {ICON_LIBRARY_OPTIONS.map((option) => (
                                                        <option key={option.id} value={option.id}>{option.label}</option>
                                                    ))}
                                                </FlatSelect>
                                            </FlatField>
                                            {selectedStyle.iconLibrary === 'custom' ? (
                                                <>
                                                    <FlatField label="Icon Import Path" stacked>
                                                        <input
                                                            type="text"
                                                            value={selectedStyle.iconCustomImportPath}
                                                            onChange={(event) => updateSelectedStyle('iconCustomImportPath', event.target.value)}
                                                            className={studioInputClass}
                                                            placeholder="@my/icons"
                                                        />
                                                    </FlatField>
                                                    <FlatField label="Icon Name" stacked>
                                                        <input
                                                            type="text"
                                                            value={selectedStyle.iconCustomName}
                                                            onChange={(event) => updateSelectedStyle('iconCustomName', event.target.value)}
                                                            className={studioInputClass}
                                                            placeholder="TabIcon"
                                                        />
                                                    </FlatField>
                                                </>
                                            ) : (
                                                <FlatField label="Tab Icon" stacked>
                                                    <FlatSelect
                                                        value={getResolvedIconValue(selectedStyle.iconLibrary, selectedStyle.icon, false)}
                                                        onValueChange={(value) => updateSelectedStyle('icon', value as IconOptionId)}
                                                        ariaLabel="Tabs icon"
                                                    >
                                                        {getIconOptionsForLibrary(selectedStyle.iconLibrary)
                                                            .filter((option) => option.id !== 'none')
                                                            .map((option) => (
                                                                <option key={option.id} value={option.id}>{option.label}</option>
                                                            ))}
                                                    </FlatSelect>
                                                </FlatField>
                                            )}
                                            <FlatField label="Icon Position">
                                                <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                    {(['left', 'right'] as const).map((value) => (
                                                        <button
                                                            key={value}
                                                            type="button"
                                                            onClick={() => updateSelectedStyle('tabsIconPosition', value)}
                                                            className={cn(
                                                                inspectorChoiceButtonBase,
                                                                selectedStyle.tabsIconPosition === value ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle,
                                                            )}
                                                        >
                                                            {value === 'left' ? 'Left' : 'Right'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </FlatField>
                                        </>
                                    ) : null}
                                </FlatElementSubsection>
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Card Config (generic) */}
                    {selectedInstance?.kind === 'card' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Card Config" icon={Table} defaultOpen>
                                <div className="space-y-3">
                                    <CardConfigSubsection title="Icon" defaultOpen={selectedStyle.cardShowIcon}>
                                        <FlatSwitchRow label="Show icon" checked={selectedStyle.cardShowIcon} onCheckedChange={(value) => updateSelectedStyle('cardShowIcon', value)} />
                                        {selectedStyle.cardShowIcon ? (
                                            <>
                                                <FlatField label="Icon Library" stacked>
                                                    <FlatSelect
                                                        value={selectedStyle.iconLibrary}
                                                        onValueChange={(value) => updateSelectedStyle('iconLibrary', value as IconLibrary)}
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
                                        {Boolean(selectedStyle.cardBadgeText?.trim()) ? (
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
                                                    const newItem = { id: crypto.randomUUID().slice(0, 8), label: 'New tag' };
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

                                    <CardConfigSubsection title="Image" defaultOpen={Boolean(selectedStyle.cardImageSrc)}>
                                        <CardImageDropzone
                                            inputId={`${selectedInstance.id}-card-image`}
                                            value={selectedStyle.cardImageSrc}
                                            onChange={updateCardImage}
                                            onClear={() => updateCardImage('')}
                                        />
                                        {selectedStyle.cardImageSrc ? (
                                            <FlatField label="Placement" stacked>
                                                <FlatSelect value={selectedStyle.cardImagePosition} onValueChange={(value) => updateSelectedStyle('cardImagePosition', value as ComponentStyleConfig['cardImagePosition'])} ariaLabel="Image position">
                                                    <option value="top">Top</option>
                                                    <option value="bottom">Bottom</option>
                                                </FlatSelect>
                                            </FlatField>
                                        ) : null}
                                    </CardConfigSubsection>

                                    <CardConfigSubsection title="Dividers" defaultOpen={selectedStyle.cardShowDividers}>
                                        <FlatSwitchRow label="Show dividers" checked={selectedStyle.cardShowDividers} onCheckedChange={(value) => updateSelectedStyle('cardShowDividers', value)} />
                                        {selectedStyle.cardShowDividers ? (
                                            <>
                                                <FlatColorControl label="Color" value={selectedStyle.cardDividerColor} onChange={(value) => updateSelectedStyle('cardDividerColor', value)} tokens={activeTokenSet.tokens} />
                                                <FlatUnitField label="Width" value={selectedStyle.cardDividerWidth} min={1} max={8} unit="px" onChange={(value) => updateSelectedStyle('cardDividerWidth', value)} />
                                            </>
                                        ) : null}
                                    </CardConfigSubsection>

                                    <CardConfigSubsection title="Actions" defaultOpen={Boolean(selectedStyle.cardToggleText.trim()) || Boolean(selectedStyle.cardButtonText.trim())}>
                                        <FlatField label="Toggle Label" stacked>
                                            <input
                                                type="text"
                                                value={selectedStyle.cardToggleText}
                                                onChange={(event) => updateSelectedStyles({
                                                    cardToggleText: event.target.value,
                                                    cardShowToggle: event.target.value.trim().length > 0,
                                                })}
                                                className={studioInputClass}
                                                placeholder="Leave empty to hide the toggle"
                                            />
                                        </FlatField>
                                        <FlatField label="Button Text" stacked>
                                            <input
                                                type="text"
                                                value={selectedStyle.cardButtonText}
                                                onChange={(event) => updateSelectedStyles({
                                                    cardButtonText: event.target.value,
                                                    cardShowButton: event.target.value.trim().length > 0,
                                                })}
                                                className={studioInputClass}
                                                placeholder="Leave empty to hide the button"
                                            />
                                        </FlatField>
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
                                        {selectedStyle.cardShowSecondaryButton && selectedStyle.cardSecondaryButtonText.trim() ? (
                                            <FlatField label="Secondary Variant" stacked>
                                                <FlatSelect value={selectedStyle.cardSecondaryButtonVariant} onValueChange={(value) => updateSelectedStyle('cardSecondaryButtonVariant', value as ComponentStyleConfig['cardSecondaryButtonVariant'])} ariaLabel="Secondary button variant">
                                                    <option value="default">Default</option>
                                                    <option value="outline">Outline</option>
                                                    <option value="ghost">Ghost</option>
                                                    <option value="secondary">Secondary</option>
                                                </FlatSelect>
                                            </FlatField>
                                        ) : null}
                                        {(selectedStyle.cardToggleText.trim() || selectedStyle.cardButtonText.trim()) ? (
                                            <FlatField label="Placement" stacked>
                                                <FlatSelect value={selectedStyle.cardActionsPosition} onValueChange={(value) => updateSelectedStyle('cardActionsPosition', value as ComponentStyleConfig['cardActionsPosition'])} ariaLabel="Actions position">
                                                    <option value="top">Top</option>
                                                    <option value="bottom">Bottom</option>
                                                </FlatSelect>
                                            </FlatField>
                                        ) : null}
                                    </CardConfigSubsection>

                                    <CardTypographyControls
                                        title="Title"
                                        textValue={selectedStyle.cardTitleText}
                                        color={selectedStyle.cardTitleColor}
                                        size={selectedStyle.cardTitleSize}
                                        weight={selectedStyle.cardTitleWeight}
                                        align={selectedStyle.cardTitleAlign}
                                        sizeMin={10}
                                        sizeMax={40}
                                        tokens={activeTokenSet.tokens}
                                        defaultOpen={Boolean(selectedStyle.cardTitleText.trim())}
                                        textPlaceholder="Leave empty to hide the title"
                                        fontFamily={selectedStyle.cardTitleFontFamily}
                                        onFontFamilyChange={(value) => updateSelectedStyle('cardTitleFontFamily', value)}
                                        onTextChange={(value) => updateCardTextField('cardTitleText', 'cardShowTitle', value)}
                                        onColorChange={(value) => updateSelectedStyle('cardTitleColor', value)}
                                        onSizeChange={(value) => updateSelectedStyle('cardTitleSize', value)}
                                        onWeightChange={(value) => updateSelectedStyle('cardTitleWeight', value)}
                                        onAlignChange={(value) => updateSelectedStyle('cardTitleAlign', value)}
                                    />
                                    <CardTypographyControls
                                        title="Subtitle"
                                        textValue={selectedStyle.cardSubtitleText}
                                        color={selectedStyle.cardSubtitleColor}
                                        size={selectedStyle.cardSubtitleSize}
                                        weight={selectedStyle.cardSubtitleWeight}
                                        align={selectedStyle.cardSubtitleAlign}
                                        sizeMin={10}
                                        sizeMax={32}
                                        tokens={activeTokenSet.tokens}
                                        defaultOpen={Boolean(selectedStyle.cardSubtitleText.trim())}
                                        textPlaceholder="Leave empty to hide the subtitle"
                                        fontFamily={selectedStyle.cardSubtitleFontFamily}
                                        onFontFamilyChange={(value) => updateSelectedStyle('cardSubtitleFontFamily', value)}
                                        onTextChange={(value) => updateCardTextField('cardSubtitleText', 'cardShowSubtitle', value)}
                                        onColorChange={(value) => updateSelectedStyle('cardSubtitleColor', value)}
                                        onSizeChange={(value) => updateSelectedStyle('cardSubtitleSize', value)}
                                        onWeightChange={(value) => updateSelectedStyle('cardSubtitleWeight', value)}
                                        onAlignChange={(value) => updateSelectedStyle('cardSubtitleAlign', value)}
                                    />
                                    <CardTypographyControls
                                        title="Body"
                                        textValue={selectedStyle.cardBodyText}
                                        color={selectedStyle.cardBodyColor}
                                        size={selectedStyle.cardBodySize}
                                        weight={selectedStyle.cardBodyWeight}
                                        align={selectedStyle.cardBodyAlign}
                                        sizeMin={10}
                                        sizeMax={32}
                                        tokens={activeTokenSet.tokens}
                                        defaultOpen={Boolean(selectedStyle.cardBodyText.trim())}
                                        textPlaceholder="Leave empty to hide the body copy"
                                        fontFamily={selectedStyle.cardBodyFontFamily}
                                        onFontFamilyChange={(value) => updateSelectedStyle('cardBodyFontFamily', value)}
                                        onTextChange={(value) => updateCardTextField('cardBodyText', 'cardShowBody', value)}
                                        onColorChange={(value) => updateSelectedStyle('cardBodyColor', value)}
                                        onSizeChange={(value) => updateSelectedStyle('cardBodySize', value)}
                                        onWeightChange={(value) => updateSelectedStyle('cardBodyWeight', value)}
                                        onAlignChange={(value) => updateSelectedStyle('cardBodyAlign', value)}
                                    />
                                    <CardTypographyControls
                                        title="Price"
                                        textValue={selectedStyle.cardPriceText}
                                        color={selectedStyle.cardPriceColor}
                                        size={selectedStyle.cardPriceSize}
                                        weight={selectedStyle.cardPriceWeight}
                                        align={selectedStyle.cardPriceAlign}
                                        sizeMin={10}
                                        sizeMax={48}
                                        tokens={activeTokenSet.tokens}
                                        defaultOpen={Boolean(selectedStyle.cardPriceText.trim())}
                                        textPlaceholder="Leave empty to hide the price"
                                        fontFamily={selectedStyle.cardPriceFontFamily}
                                        onFontFamilyChange={(value) => updateSelectedStyle('cardPriceFontFamily', value)}
                                        onTextChange={(value) => updateCardTextField('cardPriceText', 'cardShowPrice', value)}
                                        onColorChange={(value) => updateSelectedStyle('cardPriceColor', value)}
                                        onSizeChange={(value) => updateSelectedStyle('cardPriceSize', value)}
                                        onWeightChange={(value) => updateSelectedStyle('cardPriceWeight', value)}
                                        onAlignChange={(value) => updateSelectedStyle('cardPriceAlign', value)}
                                    >
                                        <FlatField label="Placement" stacked>
                                            <FlatSelect value={selectedStyle.cardPricePosition} onValueChange={(value) => updateSelectedStyle('cardPricePosition', value as ComponentStyleConfig['cardPricePosition'])} ariaLabel="Price position">
                                                <option value="top">Top</option>
                                                <option value="bottom">Bottom</option>
                                            </FlatSelect>
                                        </FlatField>
                                    </CardTypographyControls>

                                    <CardConfigSubsection title="Section Order" defaultOpen={false}>
                                        <div className="space-y-1">
                                            {selectedStyle.cardSectionOrder.map((sectionKey, index) => (
                                                <div key={sectionKey} className="flex items-center gap-1">
                                                    <span className="flex-1 truncate text-[11px] text-[var(--inspector-text)] capitalize">
                                                        {sectionKey.replace(/-/g, ' ')}
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
                                </div>
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Product Card Config */}
                    {selectedInstance?.kind === 'product-card' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Product Card Config" icon={Table} defaultOpen>
                                <div className="space-y-3">
                                    <CardConfigSubsection title="Icon" defaultOpen={selectedStyle.cardShowIcon}>
                                        <FlatSwitchRow label="Show icon" checked={selectedStyle.cardShowIcon} onCheckedChange={(value) => updateSelectedStyle('cardShowIcon', value)} />
                                        {selectedStyle.cardShowIcon ? (
                                            <>
                                                <FlatField label="Icon Library" stacked>
                                                    <FlatSelect
                                                        value={selectedStyle.iconLibrary}
                                                        onValueChange={(value) => updateSelectedStyle('iconLibrary', value as IconLibrary)}
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
                                        {Boolean(selectedStyle.cardBadgeText?.trim()) ? (
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
                                                    const newItem = { id: crypto.randomUUID().slice(0, 8), label: 'New tag' };
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

                                    <CardConfigSubsection title="Image" defaultOpen={Boolean(selectedStyle.cardImageSrc)}>
                                        <CardImageDropzone
                                            inputId={`${selectedInstance.id}-product-card-image`}
                                            value={selectedStyle.cardImageSrc}
                                            onChange={updateCardImage}
                                            onClear={() => updateCardImage('')}
                                        />
                                        {selectedStyle.cardImageSrc ? (
                                            <FlatField label="Placement" stacked>
                                                <FlatSelect value={selectedStyle.cardImagePosition} onValueChange={(value) => updateSelectedStyle('cardImagePosition', value as ComponentStyleConfig['cardImagePosition'])} ariaLabel="Image position">
                                                    <option value="top">Top</option>
                                                    <option value="bottom">Bottom</option>
                                                </FlatSelect>
                                            </FlatField>
                                        ) : null}
                                    </CardConfigSubsection>

                                    <CardConfigSubsection title="Dividers" defaultOpen={selectedStyle.cardShowDividers}>
                                        <FlatSwitchRow label="Show dividers" checked={selectedStyle.cardShowDividers} onCheckedChange={(value) => updateSelectedStyle('cardShowDividers', value)} />
                                        {selectedStyle.cardShowDividers ? (
                                            <>
                                                <FlatColorControl label="Color" value={selectedStyle.cardDividerColor} onChange={(value) => updateSelectedStyle('cardDividerColor', value)} tokens={activeTokenSet.tokens} />
                                                <FlatUnitField label="Width" value={selectedStyle.cardDividerWidth} min={1} max={8} unit="px" onChange={(value) => updateSelectedStyle('cardDividerWidth', value)} />
                                            </>
                                        ) : null}
                                    </CardConfigSubsection>

                                    <CardConfigSubsection title="Footer" defaultOpen={Boolean(selectedStyle.cardButtonText.trim())}>
                                        <FlatField label="Button Text" stacked>
                                            <input
                                                type="text"
                                                value={selectedStyle.cardButtonText}
                                                onChange={(event) => updateSelectedStyles({
                                                    cardButtonText: event.target.value,
                                                    cardShowFooter: event.target.value.trim().length > 0,
                                                })}
                                                className={studioInputClass}
                                                placeholder="Leave empty to hide the footer action"
                                            />
                                        </FlatField>
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
                                        {selectedStyle.cardShowSecondaryButton && selectedStyle.cardSecondaryButtonText.trim() ? (
                                            <FlatField label="Secondary Variant" stacked>
                                                <FlatSelect value={selectedStyle.cardSecondaryButtonVariant} onValueChange={(value) => updateSelectedStyle('cardSecondaryButtonVariant', value as ComponentStyleConfig['cardSecondaryButtonVariant'])} ariaLabel="Secondary button variant">
                                                    <option value="default">Default</option>
                                                    <option value="outline">Outline</option>
                                                    <option value="ghost">Ghost</option>
                                                    <option value="secondary">Secondary</option>
                                                </FlatSelect>
                                            </FlatField>
                                        ) : null}
                                        {selectedStyle.cardButtonText.trim() ? (
                                            <FlatField label="Placement" stacked>
                                                <FlatSelect value={selectedStyle.cardActionsPosition} onValueChange={(value) => updateSelectedStyle('cardActionsPosition', value as ComponentStyleConfig['cardActionsPosition'])} ariaLabel="Footer position">
                                                    <option value="top">Top</option>
                                                    <option value="bottom">Bottom</option>
                                                </FlatSelect>
                                            </FlatField>
                                        ) : null}
                                    </CardConfigSubsection>

                                    <CardTypographyControls
                                        title="Title"
                                        textValue={selectedStyle.cardTitleText}
                                        color={selectedStyle.cardTitleColor}
                                        size={selectedStyle.cardTitleSize}
                                        weight={selectedStyle.cardTitleWeight}
                                        align={selectedStyle.cardTitleAlign}
                                        sizeMin={10}
                                        sizeMax={40}
                                        tokens={activeTokenSet.tokens}
                                        defaultOpen={Boolean(selectedStyle.cardTitleText.trim())}
                                        textPlaceholder="Leave empty to hide the title"
                                        fontFamily={selectedStyle.cardTitleFontFamily}
                                        onFontFamilyChange={(value) => updateSelectedStyle('cardTitleFontFamily', value)}
                                        onTextChange={(value) => {
                                            updateCardTextField('cardTitleText', 'cardShowTitle', value);
                                            updateSelectedStyle('cardShowHeader', value.trim().length > 0 || selectedStyle.cardSubtitleText.trim().length > 0);
                                        }}
                                        onColorChange={(value) => updateSelectedStyle('cardTitleColor', value)}
                                        onSizeChange={(value) => updateSelectedStyle('cardTitleSize', value)}
                                        onWeightChange={(value) => updateSelectedStyle('cardTitleWeight', value)}
                                        onAlignChange={(value) => updateSelectedStyle('cardTitleAlign', value)}
                                    />
                                    <CardTypographyControls
                                        title="Subtitle"
                                        textValue={selectedStyle.cardSubtitleText}
                                        color={selectedStyle.cardSubtitleColor}
                                        size={selectedStyle.cardSubtitleSize}
                                        weight={selectedStyle.cardSubtitleWeight}
                                        align={selectedStyle.cardSubtitleAlign}
                                        sizeMin={10}
                                        sizeMax={32}
                                        tokens={activeTokenSet.tokens}
                                        defaultOpen={Boolean(selectedStyle.cardSubtitleText.trim())}
                                        textPlaceholder="Leave empty to hide the subtitle"
                                        fontFamily={selectedStyle.cardSubtitleFontFamily}
                                        onFontFamilyChange={(value) => updateSelectedStyle('cardSubtitleFontFamily', value)}
                                        onTextChange={(value) => {
                                            updateCardTextField('cardSubtitleText', 'cardShowSubtitle', value);
                                            updateSelectedStyle('cardShowHeader', value.trim().length > 0 || selectedStyle.cardTitleText.trim().length > 0);
                                        }}
                                        onColorChange={(value) => updateSelectedStyle('cardSubtitleColor', value)}
                                        onSizeChange={(value) => updateSelectedStyle('cardSubtitleSize', value)}
                                        onWeightChange={(value) => updateSelectedStyle('cardSubtitleWeight', value)}
                                        onAlignChange={(value) => updateSelectedStyle('cardSubtitleAlign', value)}
                                    />

                                    <CardTypographyControls
                                        title="Body"
                                        textValue={selectedStyle.cardBodyText}
                                        color={selectedStyle.cardBodyColor}
                                        size={selectedStyle.cardBodySize}
                                        weight={selectedStyle.cardBodyWeight}
                                        align={selectedStyle.cardBodyAlign}
                                        sizeMin={10}
                                        sizeMax={32}
                                        tokens={activeTokenSet.tokens}
                                        defaultOpen={Boolean(selectedStyle.cardBodyText.trim())}
                                        textPlaceholder="Leave empty to hide the body copy"
                                        fontFamily={selectedStyle.cardBodyFontFamily}
                                        onFontFamilyChange={(value) => updateSelectedStyle('cardBodyFontFamily', value)}
                                        onTextChange={(value) => updateCardTextField('cardBodyText', 'cardShowBody', value)}
                                        onColorChange={(value) => updateSelectedStyle('cardBodyColor', value)}
                                        onSizeChange={(value) => updateSelectedStyle('cardBodySize', value)}
                                        onWeightChange={(value) => updateSelectedStyle('cardBodyWeight', value)}
                                        onAlignChange={(value) => updateSelectedStyle('cardBodyAlign', value)}
                                    />

                                    <CardTypographyControls
                                        title="Price"
                                        textValue={selectedStyle.cardPriceText}
                                        color={selectedStyle.cardPriceColor}
                                        size={selectedStyle.cardPriceSize}
                                        weight={selectedStyle.cardPriceWeight}
                                        align={selectedStyle.cardPriceAlign}
                                        sizeMin={10}
                                        sizeMax={48}
                                        tokens={activeTokenSet.tokens}
                                        defaultOpen={Boolean(selectedStyle.cardPriceText.trim())}
                                        textPlaceholder="Leave empty to hide the price"
                                        fontFamily={selectedStyle.cardPriceFontFamily}
                                        onFontFamilyChange={(value) => updateSelectedStyle('cardPriceFontFamily', value)}
                                        onTextChange={(value) => updateCardTextField('cardPriceText', 'cardShowPrice', value)}
                                        onColorChange={(value) => updateSelectedStyle('cardPriceColor', value)}
                                        onSizeChange={(value) => updateSelectedStyle('cardPriceSize', value)}
                                        onWeightChange={(value) => updateSelectedStyle('cardPriceWeight', value)}
                                        onAlignChange={(value) => updateSelectedStyle('cardPriceAlign', value)}
                                    >
                                        <FlatField label="Placement" stacked>
                                            <FlatSelect value={selectedStyle.cardPricePosition} onValueChange={(value) => updateSelectedStyle('cardPricePosition', value as ComponentStyleConfig['cardPricePosition'])} ariaLabel="Price position">
                                                <option value="top">Top</option>
                                                <option value="bottom">Bottom</option>
                                            </FlatSelect>
                                        </FlatField>
                                    </CardTypographyControls>

                                    <CardConfigSubsection title="Section Order" defaultOpen={false}>
                                        <div className="space-y-1">
                                            {selectedStyle.cardSectionOrder.map((sectionKey, index) => (
                                                <div key={sectionKey} className="flex items-center gap-1">
                                                    <span className="flex-1 truncate text-[11px] text-[var(--inspector-text)] capitalize">
                                                        {sectionKey.replace(/-/g, ' ')}
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
                                </div>
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Listing Card Config */}
                    {selectedInstance?.kind === 'listing-card' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Listing Card Config" icon={Table} defaultOpen>
                                <div className="space-y-3">
                                    <CardConfigSubsection title="Icon" defaultOpen={selectedStyle.cardShowIcon}>
                                        <FlatSwitchRow label="Show icon" checked={selectedStyle.cardShowIcon} onCheckedChange={(value) => updateSelectedStyle('cardShowIcon', value)} />
                                        {selectedStyle.cardShowIcon ? (
                                            <>
                                                <FlatField label="Icon Library" stacked>
                                                    <FlatSelect
                                                        value={selectedStyle.iconLibrary}
                                                        onValueChange={(value) => updateSelectedStyle('iconLibrary', value as IconLibrary)}
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
                                        {Boolean(selectedStyle.cardBadgeText?.trim()) ? (
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
                                                    const newItem = { id: crypto.randomUUID().slice(0, 8), label: 'New tag' };
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

                                    <CardConfigSubsection title="Image" defaultOpen={Boolean(selectedStyle.cardImageSrc)}>
                                        <CardImageDropzone
                                            inputId={`${selectedInstance.id}-listing-card-image`}
                                            value={selectedStyle.cardImageSrc}
                                            onChange={updateCardImage}
                                            onClear={() => updateCardImage('')}
                                        />
                                        {selectedStyle.cardImageSrc ? (
                                            <FlatField label="Placement" stacked>
                                                <FlatSelect value={selectedStyle.cardImagePosition} onValueChange={(value) => updateSelectedStyle('cardImagePosition', value as ComponentStyleConfig['cardImagePosition'])} ariaLabel="Image position">
                                                    <option value="top">Top</option>
                                                    <option value="bottom">Bottom</option>
                                                </FlatSelect>
                                            </FlatField>
                                        ) : null}
                                    </CardConfigSubsection>

                                    <CardConfigSubsection title="Dividers" defaultOpen={selectedStyle.cardShowDividers}>
                                        <FlatSwitchRow label="Show dividers" checked={selectedStyle.cardShowDividers} onCheckedChange={(value) => updateSelectedStyle('cardShowDividers', value)} />
                                        {selectedStyle.cardShowDividers ? (
                                            <>
                                                <FlatColorControl label="Color" value={selectedStyle.cardDividerColor} onChange={(value) => updateSelectedStyle('cardDividerColor', value)} tokens={activeTokenSet.tokens} />
                                                <FlatUnitField label="Width" value={selectedStyle.cardDividerWidth} min={1} max={8} unit="px" onChange={(value) => updateSelectedStyle('cardDividerWidth', value)} />
                                            </>
                                        ) : null}
                                    </CardConfigSubsection>

                                    <CardConfigSubsection title="Details" defaultOpen={selectedStyle.cardShowSpecs || Boolean(selectedStyle.cardPriceText.trim()) || Boolean(selectedStyle.cardBodyText.trim())}>
                                        <FlatSwitchRow label="Specs" checked={selectedStyle.cardShowSpecs} onCheckedChange={(value) => updateSelectedStyle('cardShowSpecs', value)} />
                                        {selectedStyle.cardPriceText.trim() || selectedStyle.cardBodyText.trim() ? (
                                            <FlatField label="Pricing Placement" stacked>
                                                <FlatSelect value={selectedStyle.cardPricePosition} onValueChange={(value) => updateSelectedStyle('cardPricePosition', value as ComponentStyleConfig['cardPricePosition'])} ariaLabel="Pricing position">
                                                    <option value="top">Top</option>
                                                    <option value="bottom">Bottom</option>
                                                </FlatSelect>
                                            </FlatField>
                                        ) : null}
                                    </CardConfigSubsection>

                                    <CardConfigSubsection title="CTA" defaultOpen={Boolean(selectedStyle.cardCtaText.trim())}>
                                        <FlatField label="CTA Text" stacked>
                                            <input
                                                type="text"
                                                value={selectedStyle.cardCtaText}
                                                onChange={(event) => updateSelectedStyles({
                                                    cardCtaText: event.target.value,
                                                    cardShowCta: event.target.value.trim().length > 0,
                                                })}
                                                className={studioInputClass}
                                                placeholder="Leave empty to hide the CTA"
                                            />
                                        </FlatField>
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
                                        {selectedStyle.cardShowSecondaryButton && selectedStyle.cardSecondaryButtonText.trim() ? (
                                            <FlatField label="Secondary Variant" stacked>
                                                <FlatSelect value={selectedStyle.cardSecondaryButtonVariant} onValueChange={(value) => updateSelectedStyle('cardSecondaryButtonVariant', value as ComponentStyleConfig['cardSecondaryButtonVariant'])} ariaLabel="Secondary button variant">
                                                    <option value="default">Default</option>
                                                    <option value="outline">Outline</option>
                                                    <option value="ghost">Ghost</option>
                                                    <option value="secondary">Secondary</option>
                                                </FlatSelect>
                                            </FlatField>
                                        ) : null}
                                        {selectedStyle.cardCtaText.trim() ? (
                                            <FlatField label="Placement" stacked>
                                                <FlatSelect value={selectedStyle.cardActionsPosition} onValueChange={(value) => updateSelectedStyle('cardActionsPosition', value as ComponentStyleConfig['cardActionsPosition'])} ariaLabel="CTA position">
                                                    <option value="top">Top</option>
                                                    <option value="bottom">Bottom</option>
                                                </FlatSelect>
                                            </FlatField>
                                        ) : null}
                                    </CardConfigSubsection>

                                    <CardTypographyControls
                                        title="Title"
                                        textValue={selectedStyle.cardTitleText}
                                        color={selectedStyle.cardTitleColor}
                                        size={selectedStyle.cardTitleSize}
                                        weight={selectedStyle.cardTitleWeight}
                                        align={selectedStyle.cardTitleAlign}
                                        sizeMin={10}
                                        sizeMax={40}
                                        tokens={activeTokenSet.tokens}
                                        defaultOpen={Boolean(selectedStyle.cardTitleText.trim())}
                                        textPlaceholder="Leave empty to hide the title"
                                        fontFamily={selectedStyle.cardTitleFontFamily}
                                        onFontFamilyChange={(value) => updateSelectedStyle('cardTitleFontFamily', value)}
                                        onTextChange={(value) => updateCardTextField('cardTitleText', 'cardShowTitle', value)}
                                        onColorChange={(value) => updateSelectedStyle('cardTitleColor', value)}
                                        onSizeChange={(value) => updateSelectedStyle('cardTitleSize', value)}
                                        onWeightChange={(value) => updateSelectedStyle('cardTitleWeight', value)}
                                        onAlignChange={(value) => updateSelectedStyle('cardTitleAlign', value)}
                                    />

                                    <CardTypographyControls
                                        title="Subtitle"
                                        textValue={selectedStyle.cardSubtitleText}
                                        color={selectedStyle.cardSubtitleColor}
                                        size={selectedStyle.cardSubtitleSize}
                                        weight={selectedStyle.cardSubtitleWeight}
                                        align={selectedStyle.cardSubtitleAlign}
                                        sizeMin={10}
                                        sizeMax={32}
                                        tokens={activeTokenSet.tokens}
                                        defaultOpen={Boolean(selectedStyle.cardSubtitleText.trim())}
                                        textPlaceholder="Leave empty to hide the subtitle"
                                        fontFamily={selectedStyle.cardSubtitleFontFamily}
                                        onFontFamilyChange={(value) => updateSelectedStyle('cardSubtitleFontFamily', value)}
                                        onTextChange={(value) => updateCardTextField('cardSubtitleText', 'cardShowSubtitle', value)}
                                        onColorChange={(value) => updateSelectedStyle('cardSubtitleColor', value)}
                                        onSizeChange={(value) => updateSelectedStyle('cardSubtitleSize', value)}
                                        onWeightChange={(value) => updateSelectedStyle('cardSubtitleWeight', value)}
                                        onAlignChange={(value) => updateSelectedStyle('cardSubtitleAlign', value)}
                                    />

                                    <CardTypographyControls
                                        title="Body"
                                        textValue={selectedStyle.cardBodyText}
                                        color={selectedStyle.cardBodyColor}
                                        size={selectedStyle.cardBodySize}
                                        weight={selectedStyle.cardBodyWeight}
                                        align={selectedStyle.cardBodyAlign}
                                        sizeMin={10}
                                        sizeMax={32}
                                        tokens={activeTokenSet.tokens}
                                        defaultOpen={Boolean(selectedStyle.cardBodyText.trim())}
                                        textPlaceholder="Leave empty to hide the body copy"
                                        fontFamily={selectedStyle.cardBodyFontFamily}
                                        onFontFamilyChange={(value) => updateSelectedStyle('cardBodyFontFamily', value)}
                                        onTextChange={(value) => updateSelectedStyles({
                                            cardBodyText: value,
                                            cardShowBody: value.trim().length > 0,
                                            cardShowPricing: value.trim().length > 0 || selectedStyle.cardPriceText.trim().length > 0,
                                        })}
                                        onColorChange={(value) => updateSelectedStyle('cardBodyColor', value)}
                                        onSizeChange={(value) => updateSelectedStyle('cardBodySize', value)}
                                        onWeightChange={(value) => updateSelectedStyle('cardBodyWeight', value)}
                                        onAlignChange={(value) => updateSelectedStyle('cardBodyAlign', value)}
                                    />

                                    <CardTypographyControls
                                        title="Price"
                                        textValue={selectedStyle.cardPriceText}
                                        color={selectedStyle.cardPriceColor}
                                        size={selectedStyle.cardPriceSize}
                                        weight={selectedStyle.cardPriceWeight}
                                        align={selectedStyle.cardPriceAlign}
                                        sizeMin={10}
                                        sizeMax={48}
                                        tokens={activeTokenSet.tokens}
                                        defaultOpen={Boolean(selectedStyle.cardPriceText.trim())}
                                        textPlaceholder="Leave empty to hide the price"
                                        fontFamily={selectedStyle.cardPriceFontFamily}
                                        onFontFamilyChange={(value) => updateSelectedStyle('cardPriceFontFamily', value)}
                                        onTextChange={(value) => updateSelectedStyles({
                                            cardPriceText: value,
                                            cardShowPrice: value.trim().length > 0,
                                            cardShowPricing: value.trim().length > 0 || selectedStyle.cardBodyText.trim().length > 0,
                                        })}
                                        onColorChange={(value) => updateSelectedStyle('cardPriceColor', value)}
                                        onSizeChange={(value) => updateSelectedStyle('cardPriceSize', value)}
                                        onWeightChange={(value) => updateSelectedStyle('cardPriceWeight', value)}
                                        onAlignChange={(value) => updateSelectedStyle('cardPriceAlign', value)}
                                    />

                                    <CardConfigSubsection title="Section Order" defaultOpen={false}>
                                        <div className="space-y-1">
                                            {selectedStyle.cardSectionOrder.map((sectionKey, index) => (
                                                <div key={sectionKey} className="flex items-center gap-1">
                                                    <span className="flex-1 truncate text-[11px] text-[var(--inspector-text)] capitalize">
                                                        {sectionKey.replace(/-/g, ' ')}
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
                                </div>
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Switch Config */}
                    {selectedInstance?.kind === 'switch' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Switch Config" icon={Table} defaultOpen>
                                <FlatField label="Label" stacked>
                                    <input
                                        type="text"
                                        value={selectedStyle.switchLabel}
                                        onChange={(e) => updateSelectedStyle('switchLabel', e.target.value)}
                                        className={studioInputClass}
                                        placeholder="Toggle"
                                    />
                                </FlatField>

                                <FlatElementSubsection title="Label" defaultOpen={false}>
                                    <FlatField label="Label Position">
                                        <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                            {(['left', 'right'] as const).map((value) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => updateSelectedStyle('switchLabelPosition', value)}
                                                    className={cn(
                                                        inspectorChoiceButtonBase,
                                                        selectedStyle.switchLabelPosition === value ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle,
                                                    )}
                                                >
                                                    {value === 'left' ? 'Left' : 'Right'}
                                                </button>
                                            ))}
                                        </div>
                                    </FlatField>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                        <FlatUnitField label="Label Size" value={selectedStyle.switchLabelSize} min={10} max={24} unit="px" onChange={(value) => updateSelectedStyle('switchLabelSize', value)} />
                                        <FlatField label="Label Weight">
                                            <FlatSelect value={selectedStyle.switchLabelWeight} onValueChange={(value) => updateSelectedStyle('switchLabelWeight', Number(value))} ariaLabel="Switch label weight">
                                                {[400, 500, 600, 700].map((weight) => (
                                                    <option key={weight} value={weight}>{weight}</option>
                                                ))}
                                            </FlatSelect>
                                        </FlatField>
                                    </div>
                                    <FlatColorControl label="Label Color" value={selectedStyle.switchLabelColor} onChange={(value) => updateSelectedStyle('switchLabelColor', value)} tokens={activeTokenSet.tokens} />
                                </FlatElementSubsection>

                                <FlatElementSubsection title="Track &amp; Thumb" defaultOpen>
                                    <FlatColorControl label="Track (Off)" value={selectedStyle.switchTrackColor} onChange={(value) => updateSelectedStyle('switchTrackColor', value)} tokens={activeTokenSet.tokens} />
                                    <FlatColorControl label="Track (On)" value={selectedStyle.switchTrackActiveColor} onChange={(value) => updateSelectedStyle('switchTrackActiveColor', value)} tokens={activeTokenSet.tokens} />
                                    <FlatColorControl label="Thumb (Off)" value={selectedStyle.switchThumbColor} onChange={(value) => updateSelectedStyle('switchThumbColor', value)} tokens={activeTokenSet.tokens} />
                                    <FlatColorControl label="Thumb (On)" value={selectedStyle.switchThumbActiveColor} onChange={(value) => updateSelectedStyle('switchThumbActiveColor', value)} tokens={activeTokenSet.tokens} />
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                        <FlatUnitField label="Track Width" value={selectedStyle.switchCustomWidth} min={0} max={80} unit="px" onChange={(value) => updateSwitchSizingWithClamp({ switchCustomWidth: value })} zeroLabel="auto" />
                                        <FlatUnitField label="Track Height" value={selectedStyle.switchCustomHeight} min={0} max={40} unit="px" onChange={(value) => updateSwitchSizingWithClamp({ switchCustomHeight: value })} zeroLabel="auto" />
                                        <FlatUnitField label="Thumb Width" value={selectedStyle.switchThumbWidth} min={0} max={switchThumbLimits.maxWidth} unit="px" onChange={(value) => updateSelectedStyle('switchThumbWidth', value === 0 ? 0 : Math.min(value, switchThumbLimits.maxWidth))} zeroLabel="auto" />
                                        <FlatUnitField label="Thumb Height" value={selectedStyle.switchThumbHeight} min={0} max={switchThumbLimits.maxHeight} unit="px" onChange={(value) => updateSelectedStyle('switchThumbHeight', value === 0 ? 0 : Math.min(value, switchThumbLimits.maxHeight))} zeroLabel="auto" />
                                    </div>
                                    <div className="grid grid-cols-[1fr_110px] gap-2 items-end">
                                        <FlatColorControl
                                            label="Track Border"
                                            value={selectedStyle.switchTrackBorderColor}
                                            onChange={(value) => updateSelectedStyle('switchTrackBorderColor', value)}
                                            tokens={activeTokenSet.tokens}
                                            stacked
                                            compact
                                        />
                                        <FlatUnitField label="Width" value={selectedStyle.switchTrackBorderWidth} min={0} max={6} step={1} unit="px" onChange={(value) => updateSwitchSizingWithClamp({ switchTrackBorderWidth: value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                        <FlatUnitField label="Track Radius" value={selectedStyle.switchTrackRadius} min={0} max={20} step={1} unit="px" onChange={(value) => updateSelectedStyle('switchTrackRadius', value)} />
                                        <FlatUnitField label="Thumb Radius" value={selectedStyle.switchThumbRadius} min={0} max={20} step={1} unit="px" onChange={(value) => updateSelectedStyle('switchThumbRadius', value)} />
                                    </div>
                                </FlatElementSubsection>

                                <FlatElementSubsection title="Icons" defaultOpen={false}>
                                    <FlatSwitchRow label="Thumb Icon" checked={selectedStyle.switchShowIcon} onCheckedChange={(value) => updateSelectedStyle('switchShowIcon', value)} />
                                    {selectedStyle.switchShowIcon ? (
                                        <>
                                            <FlatField label="Icon Library" stacked>
                                                <FlatSelect
                                                    value={selectedStyle.switchIconLibrary}
                                                    onValueChange={(value) => {
                                                        const nextLibrary = value as IconLibrary;
                                                        updateSelectedStyles({
                                                            switchIconLibrary: nextLibrary,
                                                            ...(nextLibrary !== 'custom'
                                                                ? {
                                                                    switchIconChecked: getDefaultSwitchIconChecked(nextLibrary),
                                                                    switchIconUnchecked: getDefaultSwitchIconUnchecked(nextLibrary),
                                                                }
                                                                : {}),
                                                        });
                                                    }}
                                                    ariaLabel="Switch icon library"
                                                >
                                                    {ICON_LIBRARY_OPTIONS.map((option) => (
                                                        <option key={option.id} value={option.id}>{option.label}</option>
                                                    ))}
                                                </FlatSelect>
                                            </FlatField>
                                            {selectedStyle.switchIconLibrary === 'custom' ? (
                                                <>
                                                    <FlatField label="Icon Import Path" stacked>
                                                        <input
                                                            type="text"
                                                            value={selectedStyle.switchIconImportPath}
                                                            onChange={(event) => updateSelectedStyle('switchIconImportPath', event.target.value)}
                                                            className={studioInputClass}
                                                            placeholder="@my/icons"
                                                        />
                                                    </FlatField>
                                                    <FlatField label="Checked Icon Name" stacked>
                                                        <input
                                                            type="text"
                                                            value={selectedStyle.switchIconChecked}
                                                            onChange={(event) => updateSelectedStyle('switchIconChecked', event.target.value)}
                                                            className={studioInputClass}
                                                            placeholder="CheckIcon"
                                                        />
                                                    </FlatField>
                                                    <FlatField label="Unchecked Icon Name" stacked>
                                                        <input
                                                            type="text"
                                                            value={selectedStyle.switchIconUnchecked}
                                                            onChange={(event) => updateSelectedStyle('switchIconUnchecked', event.target.value)}
                                                            className={studioInputClass}
                                                            placeholder="CloseIcon"
                                                        />
                                                    </FlatField>
                                                </>
                                            ) : (
                                                <>
                                                    <FlatField label="Checked Icon" stacked>
                                                        <FlatSelect
                                                            value={getResolvedIconValue(selectedStyle.switchIconLibrary, selectedStyle.switchIconChecked as IconOptionId, false)}
                                                            onValueChange={(value) => updateSelectedStyle('switchIconChecked', value)}
                                                            ariaLabel="Switch checked icon"
                                                        >
                                                            {getSwitchIconOptions(selectedStyle.switchIconLibrary).map((option) => (
                                                                <option key={option.id} value={option.id}>{option.label}</option>
                                                            ))}
                                                        </FlatSelect>
                                                    </FlatField>
                                                    <FlatField label="Unchecked Icon" stacked>
                                                        <FlatSelect
                                                            value={getResolvedIconValue(selectedStyle.switchIconLibrary, selectedStyle.switchIconUnchecked as IconOptionId, false)}
                                                            onValueChange={(value) => updateSelectedStyle('switchIconUnchecked', value)}
                                                            ariaLabel="Switch unchecked icon"
                                                        >
                                                            {getSwitchIconOptions(selectedStyle.switchIconLibrary).map((option) => (
                                                                <option key={option.id} value={option.id}>{option.label}</option>
                                                            ))}
                                                        </FlatSelect>
                                                    </FlatField>
                                                </>
                                            )}
                                            <FlatColorControl label="Icon Color" value={selectedStyle.switchIconColor} onChange={(value) => updateSelectedStyle('switchIconColor', value)} tokens={activeTokenSet.tokens} />
                                            <FlatUnitField label="Icon Size" value={selectedStyle.switchIconSize} min={6} max={16} unit="px" onChange={(value) => updateSelectedStyle('switchIconSize', value)} />
                                        </>
                                    ) : null}
                                </FlatElementSubsection>

                                <FlatElementSubsection title="Glow" defaultOpen={false}>
                                    <FlatSwitchRow label="Glow (On)" checked={selectedStyle.switchGlowEnabled} onCheckedChange={(value) => updateSelectedStyle('switchGlowEnabled', value)} />
                                    {selectedStyle.switchGlowEnabled ? (
                                        <>
                                            <FlatColorControl label="Glow Color" value={selectedStyle.switchGlowColor} onChange={(value) => updateSelectedStyle('switchGlowColor', value)} tokens={activeTokenSet.tokens} />
                                            <FlatUnitField label="Glow Size" value={selectedStyle.switchGlowSize} min={2} max={24} step={1} unit="px" onChange={(value) => updateSelectedStyle('switchGlowSize', value)} />
                                        </>
                                    ) : null}
                                </FlatElementSubsection>
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Checkbox Config */}
                    {selectedInstance?.kind === 'checkbox' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Checkbox Config" icon={Table} defaultOpen>
                                <FlatField label="Label" stacked>
                                    <input
                                        type="text"
                                        value={selectedStyle.checkboxLabel}
                                        onChange={(e) => updateSelectedStyle('checkboxLabel', e.target.value)}
                                        className={studioInputClass}
                                        placeholder="Enable notifications"
                                    />
                                </FlatField>
                                <FlatField label="State" stacked>
                                    <FlatSelect value={selectedStyle.checkboxState} onValueChange={(value) => updateSelectedStyle('checkboxState', value as ComponentStyleConfig['checkboxState'])}>
                                        <option value="checked">Checked</option>
                                        <option value="unchecked">Unchecked</option>
                                        <option value="indeterminate">Indeterminate</option>
                                    </FlatSelect>
                                </FlatField>
                                <FlatField label="Selection Icon" stacked>
                                    <FlatSelect value={selectedStyle.checkboxSelectionIcon} onValueChange={(value) => updateSelectedStyle('checkboxSelectionIcon', value as ComponentStyleConfig['checkboxSelectionIcon'])}>
                                        <option value="tick">Tick</option>
                                        <option value="cross">Cross</option>
                                        <option value="solid">Solid</option>
                                    </FlatSelect>
                                </FlatField>
                                <FlatSwitchRow label="Disabled" checked={selectedStyle.checkboxDisabled} onCheckedChange={(value) => updateSelectedStyle('checkboxDisabled', value)} />
                                <FlatColorControl label="Checked Color" value={selectedStyle.checkboxCheckedColor} onChange={(value) => updateSelectedStyle('checkboxCheckedColor', value)} tokens={activeTokenSet.tokens} />
                                <FlatColorControl label="Border Color" value={selectedStyle.checkboxBorderColor} onChange={(value) => updateSelectedStyle('checkboxBorderColor', value)} tokens={activeTokenSet.tokens} />
                                <FlatColorControl label="Indicator Color" value={selectedStyle.checkboxIndicatorColor} onChange={(value) => updateSelectedStyle('checkboxIndicatorColor', value)} tokens={activeTokenSet.tokens} />
                                <FlatUnitField label="Corner Radius" value={selectedStyle.checkboxCornerRadius} min={0} max={999} unit="px" onChange={(value) => updateSelectedStyle('checkboxCornerRadius', value)} />
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Animated Text Config */}
                    {selectedInstance?.kind === 'animated-text' && selectedStyle ? (
                        <div className="p-1">
                            <FlatInspectorSection title="Text Animation" icon={Sparkles} defaultOpen>
                                <FlatField label="Animation" stacked>
                                    <FlatSelect value={selectedStyle.animatedTextVariant} onValueChange={(value) => updateSelectedStyle('animatedTextVariant', value as AnimatedTextVariant)} ariaLabel="Animation variant">
                                        <option value="typewriter">Typewriter</option>
                                        <option value="blur-in">Blur In</option>
                                        <option value="split-entrance">Split Entrance</option>
                                        <option value="counting-number">Counting Number</option>
                                        <option value="decrypt">Decrypt</option>
                                        <option value="gradient-sweep">Gradient Sweep</option>
                                        <option value="shiny-text">Shiny Text</option>
                                        <option value="word-rotate">Word Rotate</option>
                                        <option value="gradual-spacing">Gradual Spacing</option>
                                        <option value="letters-pull-up">Letters Pull Up</option>
                                        <option value="fade-up">Fade Up</option>
                                        <option value="fade-down">Fade Down</option>
                                    </FlatSelect>
                                </FlatField>
                                {selectedStyle.animatedTextVariant === 'counting-number' ? (
                                    <FlatField label="Number Value" stacked>
                                        <input
                                            type="number"
                                            className={studioInputClass}
                                            value={selectedStyle.animatedTextNumberValue}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
                                                    updateSelectedStyle('animatedTextNumberValue', Number(val) || 0);
                                                }
                                            }}
                                            placeholder="Enter number..."
                                        />
                                    </FlatField>
                                ) : selectedStyle.animatedTextVariant === 'word-rotate' ? (
                                    <FlatField label="Words (comma-separated)" stacked>
                                        <input
                                            type="text"
                                            className={studioInputClass}
                                            value={selectedStyle.animatedTextContent}
                                            onChange={(e) => updateSelectedStyle('animatedTextContent', e.target.value)}
                                            placeholder="Word1, Word2, Word3..."
                                        />
                                    </FlatField>
                                ) : (
                                    <FlatField label="Text Content" stacked>
                                        <input
                                            type="text"
                                            className={studioInputClass}
                                            value={selectedStyle.animatedTextContent}
                                            onChange={(e) => updateSelectedStyle('animatedTextContent', e.target.value)}
                                            placeholder="Enter text..."
                                        />
                                    </FlatField>
                                )}
                                <FlatField label="Trigger" stacked>
                                    <FlatSelect value={selectedStyle.animatedTextTrigger} onValueChange={(value) => updateSelectedStyle('animatedTextTrigger', value as AnimatedTextTrigger)} ariaLabel="Animation trigger">
                                        <option value="mount">On Mount</option>
                                        <option value="hover">On Hover</option>
                                    </FlatSelect>
                                </FlatField>
                                {(selectedStyle.animatedTextVariant === 'blur-in' || selectedStyle.animatedTextVariant === 'split-entrance') && (
                                    <FlatField label="Split By" stacked>
                                        <FlatSelect value={selectedStyle.animatedTextSplitBy} onValueChange={(value) => updateSelectedStyle('animatedTextSplitBy', value as AnimatedTextSplitBy)} ariaLabel="Split mode">
                                            <option value="char">Character</option>
                                            <option value="word">Word</option>
                                            <option value="line">Line</option>
                                        </FlatSelect>
                                    </FlatField>
                                )}
                                <div className="flex flex-wrap items-start gap-4">
                                    <FlatUnitField label="Speed" value={selectedStyle.animatedTextSpeed} min={0.01} max={5} step={0.05} unit="s" onChange={(value) => updateSelectedStyle('animatedTextSpeed', value)} />
                                    {(selectedStyle.animatedTextVariant === 'blur-in' || selectedStyle.animatedTextVariant === 'split-entrance' || selectedStyle.animatedTextVariant === 'gradual-spacing' || selectedStyle.animatedTextVariant === 'letters-pull-up') && (
                                        <FlatUnitField label="Stagger" value={selectedStyle.animatedTextStaggerDelay} min={0.01} max={0.5} step={0.01} unit="s" onChange={(value) => updateSelectedStyle('animatedTextStaggerDelay', value)} />
                                    )}
                                </div>
                                {(selectedStyle.animatedTextVariant === 'gradient-sweep' || selectedStyle.animatedTextVariant === 'shiny-text') && (
                                    <>
                                        <FlatColorControl label="Gradient Color 1" value={selectedStyle.animatedTextGradientColor1} onChange={(value) => updateSelectedStyle('animatedTextGradientColor1', value)} tokens={activeTokenSet.tokens} />
                                        <FlatColorControl label="Gradient Color 2" value={selectedStyle.animatedTextGradientColor2} onChange={(value) => updateSelectedStyle('animatedTextGradientColor2', value)} tokens={activeTokenSet.tokens} />
                                    </>
                                )}
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Appearance / Panel Design */}
                    {showAppearanceSection ? (
                        <div className="p-1">
                            <FlatInspectorSection
                                title={hasPanelElementControls ? 'Panel Design' : appearanceSectionTitle}
                                icon={Swatches}
                                defaultOpen
                                subtitle={hasPanelElementControls ? 'Overlay dimensions and styling.' : undefined}
                            >
                            {hasPanelElementControls ? (
                                <>
                                    <>
                                        {selectedInstance && supportsDropdownHoverStyle(selectedInstance.kind) ? (
                                            <>
                                                <FlatColorControl label="Item Hover Fill" value={selectedStyle.dropdownHoverFill} opacity={selectedStyle.dropdownHoverFillOpacity} onOpacityChange={(value) => updateSelectedStyle('dropdownHoverFillOpacity', value)} onChange={(value) => updateSelectedStyle('dropdownHoverFill', value)} tokens={activeTokenSet.tokens} />
                                                <FlatColorControl label="Item Hover Text" value={selectedStyle.dropdownHoverText} onChange={(value) => updateSelectedStyle('dropdownHoverText', value)} tokens={activeTokenSet.tokens} />
                                            </>
                                        ) : null}
                                        <div className="flex flex-wrap items-start gap-4">
                                            <FlatUnitField label="Width" value={selectedStyle.panelCustomWidth} min={0} max={720} unit="px" onChange={(value) => updateSelectedStyle('panelCustomWidth', value)} />
                                            <FlatUnitField label="Height" value={selectedStyle.panelCustomHeight} min={0} max={720} unit="px" onChange={(value) => updateSelectedStyle('panelCustomHeight', value)} />
                                            <FlatUnitField label="Radius" value={selectedStyle.panelCornerRadius} min={0} max={40} unit="px" onChange={(value) => updateSelectedStyle('panelCornerRadius', value)} />
                                        </div>
                                        <div className="flex items-end gap-1.5">
                                            <div className="min-w-0 flex-1">
                                                <FlatColorControl label="Fill" value={selectedStyle.panelFillColor} opacity={selectedStyle.panelFillOpacity} onOpacityChange={(value) => updateSelectedStyle('panelFillOpacity', value)} onChange={(value) => updateSelectedStyle('panelFillColor', value)} tokens={activeTokenSet.tokens} stacked compact />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <FlatColorControl label="Stroke" value={selectedStyle.panelStrokeColor} opacity={selectedStyle.panelStrokeOpacity} onOpacityChange={(value) => updateSelectedStyle('panelStrokeOpacity', value)} onChange={(value) => updateSelectedStyle('panelStrokeColor', value)} tokens={activeTokenSet.tokens} stacked compact />
                                            </div>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button type="button" aria-label="Adjust stroke width" className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm border border-[color:var(--inspector-accent)]/30 bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)] transition hover:border-[color:var(--inspector-accent)]/50 hover:bg-[color:var(--inspector-accent-soft)]/80 hover:text-[var(--inspector-text)]">
                                                        <SlidersHorizontal className="size-4" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent side="left" align="start" sideOffset={10} className="w-[220px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-3 text-[var(--inspector-text)]">
                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <p className="text-[12px] font-medium text-[var(--inspector-text)]">Stroke Width</p>
                                                            <p className="text-[11px] text-[var(--inspector-muted-text)]">{selectedStyle.panelStrokeWeight}px</p>
                                                        </div>
                                                        <Slider value={[selectedStyle.panelStrokeWeight]} onValueChange={(values: number[]) => updateSelectedStyle('panelStrokeWeight', values[0] ?? 0)} min={0} max={8} step={0.5} />
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <FlatField label="Typography" stacked>
                                            <div className="flex flex-wrap items-end gap-3">
                                                <FlatUnitField label="Size" value={selectedStyle.panelFontSize} min={10} max={36} unit="px" onChange={(value) => updateSelectedStyle('panelFontSize', value)} />
                                                <div className="w-[92px] shrink-0">
                                                    <FlatField label="Weight" stacked>
                                                        <FlatSelect value={selectedStyle.panelFontWeight} onValueChange={(value) => updateSelectedStyle('panelFontWeight', Number(value))} ariaLabel="Typography weight">
                                                            {[300, 400, 500, 600, 700].map((weight) => (<option key={weight} value={weight}>{weight}</option>))}
                                                        </FlatSelect>
                                                    </FlatField>
                                                </div>
                                            </div>
                                        </FlatField>
                                        <FlatField label="Text" stacked>
                                            <div className="flex items-end gap-1.5">
                                                <div className="min-w-0 flex-1">
                                                    <FlatColorControl label="Color" value={selectedStyle.panelFontColor} opacity={selectedStyle.panelFontOpacity} onOpacityChange={(value) => updateSelectedStyle('panelFontOpacity', value)} onChange={(value) => updateSelectedStyle('panelFontColor', value)} tokens={activeTokenSet.tokens} compact />
                                                </div>
                                                <div className="flex flex-wrap items-end gap-1.5">
                                                    <div className="flex items-center gap-1">
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <button type="button" aria-label="Configure panel text shadow" className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded-sm border transition', selectedStyle.panelEffectDropShadow ? 'border-[color:var(--inspector-accent)]/30 bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)]' : 'border-[var(--inspector-border-soft)] bg-[#0c121d] text-[var(--inspector-muted-text)] hover:border-[var(--inspector-border-strong)] hover:text-[var(--inspector-text)]')}>
                                                                    <Sparkles className="size-4" />
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent side="left" align="end" sideOffset={12} collisionPadding={16} className="w-[220px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-3 text-[var(--inspector-text)]">
                                                                <div className="space-y-3">
                                                                    <div className="space-y-1">
                                                                        <p className="text-[12px] font-medium text-[var(--inspector-text)]">Drop Shadow</p>
                                                                        <p className="text-[11px] text-[var(--inspector-muted-text)]">Adjusting any value enables it.</p>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <MiniNumberField label="Distance" value={Math.max(0, selectedStyle.panelDropShadowY)} min={0} max={80} onChange={(value) => updateSelectedStyles({ panelEffectDropShadow: true, panelDropShadowY: value })} />
                                                                        <MiniNumberField label="X" value={selectedStyle.panelDropShadowX} min={-80} max={80} onChange={(value) => updateSelectedStyles({ panelEffectDropShadow: true, panelDropShadowX: value })} />
                                                                        <MiniNumberField label="Blur" value={selectedStyle.panelDropShadowBlur} min={0} max={80} onChange={(value) => updateSelectedStyles({ panelEffectDropShadow: true, panelDropShadowBlur: value })} />
                                                                        <MiniNumberField label="Spread" value={selectedStyle.panelDropShadowSpread} min={-40} max={40} onChange={(value) => updateSelectedStyles({ panelEffectDropShadow: true, panelDropShadowSpread: value })} />
                                                                    </div>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                        {selectedStyle.panelEffectDropShadow ? (
                                                            <button type="button" onClick={() => updateSelectedStyle('panelEffectDropShadow', false)} className="inline-flex h-6 items-center rounded-sm border border-white/10 px-2 text-[11px] font-medium text-[var(--inspector-muted-text)] transition hover:border-white/20 hover:text-[var(--inspector-text)]">Remove</button>
                                                        ) : null}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <button type="button" aria-label="Configure panel text blur" className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded-sm border transition', selectedStyle.panelEffectBlur ? 'border-[color:var(--inspector-accent)]/30 bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)]' : 'border-[var(--inspector-border-soft)] bg-[#0c121d] text-[var(--inspector-muted-text)] hover:border-[var(--inspector-border-strong)] hover:text-[var(--inspector-text)]')}>
                                                                    <Moon className="size-4" />
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent side="left" align="end" sideOffset={12} collisionPadding={16} className="w-[220px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-3 text-[var(--inspector-text)]">
                                                                <div className="space-y-3">
                                                                    <div className="space-y-1">
                                                                        <p className="text-[12px] font-medium text-[var(--inspector-text)]">Background Blur</p>
                                                                        <p className="text-[11px] text-[var(--inspector-muted-text)]">Adjusting the amount enables it.</p>
                                                                    </div>
                                                                    <MiniNumberField label="Amount" value={selectedStyle.panelBlurAmount} min={0} max={30} unit="px" onChange={(value) => updateSelectedStyles({ panelEffectBlur: true, panelBlurAmount: value })} />
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                        {selectedStyle.panelEffectBlur ? (
                                                            <button type="button" onClick={() => updateSelectedStyle('panelEffectBlur', false)} className="inline-flex h-6 items-center rounded-sm border border-white/10 px-2 text-[11px] font-medium text-[var(--inspector-muted-text)] transition hover:border-white/20 hover:text-[var(--inspector-text)]">Remove</button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </FlatField>
                                    </>
                                </>
                            ) : (
                                <>
                                    {currentAppearanceValues && layout?.sections.appearance ? (
                                        <>
                                            <FlatColorControl label="Fill" value={currentAppearanceValues.fillColor} opacity={currentAppearanceValues.fillOpacity} onOpacityChange={(value) => updateAppearanceField('fillOpacity', value)} onChange={(value) => updateAppearanceField('fillColor', value)} tokens={activeTokenSet.tokens} allowGradient mode={currentAppearanceValues.fillMode} onModeChange={(mode) => updateAppearanceField('fillMode', mode)} secondaryValue={currentAppearanceValues.fillColorTo} onSecondaryChange={(value) => updateAppearanceField('fillColorTo', value)} mix={currentAppearanceValues.fillWeight} onMixChange={(value) => updateAppearanceField('fillWeight', value)} />
                                            <FlatColorControl label="Stroke" value={currentAppearanceValues.strokeColor} opacity={currentAppearanceValues.strokeOpacity} onOpacityChange={(value) => updateAppearanceField('strokeOpacity', value)} onChange={(value) => updateAppearanceField('strokeColor', value)} tokens={activeTokenSet.tokens} />
                                            <FlatUnitField label="Stroke Width" value={currentAppearanceValues.strokeWeight} min={0} max={8} unit="px" onChange={(value) => updateAppearanceField('strokeWeight', value)} />
                                        </>
                                    ) : null}

                                    {supportsTypographyStyle(selectedInstance.kind) && currentAppearanceValues ? (
                                        <>
                                            <FlatField label="Font" stacked>
                                                <FlatSelect value={selectedStyle.fontFamily} onValueChange={(value) => updateSelectedStyle('fontFamily', value)} ariaLabel="Font family">
                                                    {GOOGLE_FONTS.map((font) => (<option key={font.id} value={font.id}>{font.label}</option>))}
                                                </FlatSelect>
                                            </FlatField>
                                            <FlatField label="Typography" stacked>
                                                <div className="flex gap-2 [&>*]:min-w-0 [&>*]:flex-1">
                                                    <FlatUnitField label="Size" value={currentAppearanceValues.fontSize} min={10} max={72} unit="px" onChange={(value) => updateAppearanceField('fontSize', value)} />
                                                    <FlatField label="Weight">
                                                        <FlatSelect value={currentAppearanceValues.fontWeight} onValueChange={(value) => updateAppearanceField('fontWeight', Number(value))} ariaLabel="Typography weight">
                                                            {[300, 400, 500, 600, 700].map((weight) => (<option key={weight} value={weight}>{weight}</option>))}
                                                        </FlatSelect>
                                                    </FlatField>
                                                </div>
                                            </FlatField>
                                            <FlatField label="Style">
                                                <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                    <button type="button" onClick={() => updateSelectedStyle('fontBold', !selectedStyle.fontBold)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.fontBold ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                        <TypeBold className="size-4" />
                                                    </button>
                                                    <button type="button" onClick={() => updateSelectedStyle('fontItalic', !selectedStyle.fontItalic)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.fontItalic ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                        <TypeItalic className="size-4" />
                                                    </button>
                                                    <button type="button" onClick={() => updateSelectedStyle('fontUnderline', !selectedStyle.fontUnderline)} className={cn(inspectorIconChoiceButtonBase, selectedStyle.fontUnderline ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                        <TypeUnderline className="size-4" />
                                                    </button>
                                                </div>
                                            </FlatField>
                                            {selectedInstance.kind !== 'animated-text' && (
                                                <FlatField label="Align">
                                                    <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                        {[
                                                            { value: 'left' as const, icon: TextAlignLeft },
                                                            { value: 'center' as const, icon: TextAlignCenter },
                                                            { value: 'right' as const, icon: TextAlignRight },
                                                        ].map((item) => {
                                                            const Icon = item.icon;
                                                            return (
                                                                <button key={item.value} type="button" onClick={() => updateAppearanceField('fontPosition', item.value as FontPosition)} className={cn(inspectorIconChoiceButtonBase, currentAppearanceValues.fontPosition === item.value ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                                    <Icon className="size-4" />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </FlatField>
                                            )}
                                            {!(selectedInstance.kind === 'animated-text' && selectedStyle && (selectedStyle.animatedTextVariant === 'gradient-sweep' || selectedStyle.animatedTextVariant === 'shiny-text')) && (
                                                <FlatColorControl label="Text" value={currentAppearanceValues.fontColor} opacity={currentAppearanceValues.fontOpacity} onOpacityChange={(value) => updateAppearanceField('fontOpacity', value)} onChange={(value) => updateAppearanceField('fontColor', value)} tokens={activeTokenSet.tokens} />
                                            )}
                                        </>
                                    ) : null}

                                    {supportsTextIconMode ? (
                                        <FlatField label="Content Mode" stacked>
                                            <FlatSelect value={contentDisplayMode} onValueChange={(value) => updateContentDisplayMode(value as 'text' | 'text-icon' | 'icon')} ariaLabel="Content mode">
                                                <option value="text">Text only</option>
                                                <option value="text-icon">Text + Icon</option>
                                                <option value="icon">Icon only</option>
                                            </FlatSelect>
                                        </FlatField>
                                    ) : null}

                                    <AnimatePresence initial={false}>
                                        {supportsIconSelection(selectedInstance.kind) && (contentDisplayMode === 'text-icon' || contentDisplayMode === 'icon' || selectedInstance.kind === 'alert') ? (
                                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18, ease: 'easeOut' }} className="space-y-3">
                                                <FlatField label="Icon Library">
                                                    <FlatSelect
                                                        value={selectedStyle.iconLibrary}
                                                        onValueChange={(value) => {
                                                            const nextLibrary = value as IconLibrary;
                                                            updateSelectedStyle('iconLibrary', nextLibrary);
                                                            if (nextLibrary !== 'custom') {
                                                                const nextIcon = getResolvedIconValue(nextLibrary, selectedStyle.icon, true);
                                                                updateSelectedStyle('icon', nextIcon);
                                                            }
                                                        }}
                                                        ariaLabel="Icon library"
                                                    >
                                                        {ICON_LIBRARY_OPTIONS.map((option) => (
                                                            <option key={option.id} value={option.id}>{option.label}</option>
                                                        ))}
                                                    </FlatSelect>
                                                </FlatField>
                                                {selectedStyle.iconLibrary === 'custom' ? (
                                                    <>
                                                        <FlatField label="Icon Import Path" stacked>
                                                            <input
                                                                type="text"
                                                                value={selectedStyle.iconCustomImportPath}
                                                                onChange={(event) => updateSelectedStyle('iconCustomImportPath', event.target.value)}
                                                                className={studioInputClass}
                                                                placeholder="@my/icons"
                                                            />
                                                        </FlatField>
                                                        <FlatField label="Icon Name" stacked>
                                                            <input
                                                                type="text"
                                                                value={selectedStyle.iconCustomName}
                                                                onChange={(event) => updateSelectedStyle('iconCustomName', event.target.value)}
                                                                className={studioInputClass}
                                                                placeholder="RocketIcon"
                                                            />
                                                        </FlatField>
                                                    </>
                                                ) : (
                                                    <FlatField label="Icon">
                                                        <FlatSelect
                                                            value={getResolvedIconValue(selectedStyle.iconLibrary, selectedStyle.icon, true)}
                                                            onValueChange={(value) => updateSelectedStyle('icon', value as IconOptionId)}
                                                            ariaLabel="Icon"
                                                        >
                                                            {getIconOptionsForLibrary(selectedStyle.iconLibrary).map((option) => (
                                                                <option key={option.id} value={option.id}>{option.label}</option>
                                                            ))}
                                                        </FlatSelect>
                                                    </FlatField>
                                                )}
                                                <FlatField label="Icon Position">
                                                    <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                        {(['left', 'right'] as const).map((position) => (
                                                            <button key={position} type="button" onClick={() => updateSelectedStyle('iconPosition', position)} className={cn(inspectorChoiceButtonBase, selectedStyle.iconPosition === position ? inspectorChoiceButtonActive : inspectorChoiceButtonIdle)}>
                                                                {position}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </FlatField>
                                            </motion.div>
                                        ) : null}
                                    </AnimatePresence>
                                </>
                            )}
                            </FlatInspectorSection>
                        </div>
                    ) : null}

                    {/* Effects */}
                    {layout?.sections.effects && <div className="p-1">
                        <section className="py-0.5">
                            <div className="flex items-center justify-between rounded-md px-2 py-2">
                                <div className="inline-flex min-w-0 items-center gap-2.5">
                                    <Sparkles className="size-4 shrink-0 text-[var(--inspector-muted-text)]" />
                                    <p className="truncate text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--inspector-text)]">Effects</p>
                                </div>
                                <Popover open={effectsBuilderOpen} onOpenChange={setEffectsBuilderOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            disabled={inactiveEffectOptions.length === 0}
                                            aria-label="Add effect"
                                            className={cn(
                                                'inline-flex size-7 shrink-0 items-center justify-center rounded-sm border transition',
                                                inactiveEffectOptions.length === 0
                                                    ? 'cursor-not-allowed border-white/8 bg-white/[0.02] text-white/20'
                                                    : 'border-[color:var(--inspector-accent)]/30 bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)] hover:border-[color:var(--inspector-accent)]/50 hover:bg-[color:var(--inspector-accent-soft)]/80 hover:text-[var(--inspector-text)]',
                                            )}
                                        >
                                            <Plus className="size-4" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent side="left" align="end" sideOffset={12} collisionPadding={16} className="w-[248px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-3 text-[var(--inspector-text)]">
                                        <div className="space-y-3">
                                            <FlatField label="Effect" stacked>
                                                <FlatSelect value={pendingEffectId ?? inactiveEffectOptions[0]?.id ?? ''} onValueChange={(value) => setPendingEffectId(value)} ariaLabel="Effect to add">
                                                    {inactiveEffectOptions.map((option) => (<option key={option.id} value={option.id}>{option.label}</option>))}
                                                </FlatSelect>
                                            </FlatField>
                                            {pendingEffectId ? renderEffectConfigurator(pendingEffectId as EffectId) : null}
                                            <button
                                                type="button"
                                                disabled={!pendingEffectId}
                                                onClick={() => {
                                                    if (!pendingEffectId) return;
                                                    setEffectEnabled(pendingEffectId as EffectId, true);
                                                    setEffectsBuilderOpen(false);
                                                }}
                                                className={cn(
                                                    'inline-flex h-8 w-full items-center justify-center rounded-sm text-[12px] font-semibold transition',
                                                    pendingEffectId
                                                        ? 'bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)] hover:bg-[color:var(--inspector-accent-soft)]/80'
                                                        : 'cursor-not-allowed bg-white/[0.04] text-white/25',
                                                )}
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {effectOptions.filter((option) => option.enabled).length > 0 ? (
                                <div className="space-y-2 px-2 pb-3 pt-1">
                                    {effectOptions
                                        .filter((option) => option.enabled)
                                        .map((option) => (
                                            <div key={option.id} className="flex items-center gap-2">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button type="button" className="inline-flex min-w-0 flex-1 items-center justify-between gap-2 rounded-sm border border-[var(--inspector-border-soft)] bg-[#0c121d] px-2.5 py-2 text-left transition hover:border-[var(--inspector-border-strong)]">
                                                            <span className="truncate text-[12px] font-medium text-[var(--inspector-text)]">{option.label}</span>
                                                            <Config className="size-4 shrink-0 text-[var(--inspector-muted-text)]" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent side="left" align="end" sideOffset={12} collisionPadding={16} className="w-[248px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-3 text-[var(--inspector-text)]">
                                                        <div className="space-y-3">
                                                            <div className="space-y-1">
                                                                <p className="text-[12px] font-medium text-[var(--inspector-text)]">{option.label}</p>
                                                                <p className="text-[11px] text-[var(--inspector-muted-text)]">Changes apply instantly.</p>
                                                            </div>
                                                            {renderEffectConfigurator(option.id as EffectId)}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                                <button
                                                    type="button"
                                                    onClick={() => setEffectEnabled(option.id as EffectId, false)}
                                                    aria-label={`Remove ${option.label}`}
                                                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-white/[0.02] text-[var(--inspector-muted-text)] transition hover:border-white/20 hover:text-[var(--inspector-text)]"
                                                >
                                                    <Minus className="size-4" />
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            ) : null}
                        </section>
                    </div>}
                </div>
            </div>
        </ScrollArea>
    );
}
