import type { CSSProperties, ReactNode } from 'react';
import { AlertTriangle, Check, LoaderCircle, X } from 'lucide-react';
import { Search, Lightning, HeartCircle, Figma, Star, Cog } from '@mynaui/icons-react';
import { cn } from '@/lib/utils';
import { normalizeHexColor } from '@/components/ui/token-sets';
import type { StudioColorToken, StudioTokenSet } from '@/components/ui/token-sets';
import {
    COMPONENTS,
    DEFAULT_STYLE,
    BUTTON_STATE_CLASS_NAME,
    buildButtonPreviewStateClass,
    COMPONENT_VISUAL_PRESETS,
    SIZE_SCALE,
} from './constants';
import type {
    ButtonPreviewState,
    ComponentStyleConfig,
    ComponentInstance,
    ComponentInfo,
    ComponentVisualPreset,
    FillMode,
    FontPosition,
    IconOptionId,
    MotionPresetId,
    PrimitiveAlign,
    PrimitiveSide,
    UIComponentKind,
} from '@/components/ui/ui-studio.types';

/**
 * Tailwind CSS Export Utilities
 *
 * Optimized based on tailwind-best-practices skill guidelines:
 * - Prefer standard Tailwind tokens over arbitrary values
 * - Map visual values to closest standard Tailwind scale values
 * - Height/width arbitrary values are acceptable for precise sizing
 *
 * Mapping functions follow Tailwind's default scale:
 * - Border radius: none, sm (2px), md (4-6px), lg (8-10px), xl (12px), 2xl (16px), 3xl (24px), full
 * - Border width: 0, 1 (default), 2, 4, 8
 * - Font size: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px), 3xl (30px), 4xl (36px)
 * - Font weight: thin (100), extralight (200), light (300), normal (400), medium (500), semibold (600), bold (700), extrabold (800), black (900)
 */

// ─── Color Utilities ──────────────────────────────────────────────────────────

export function hexToRgba(hex: string, opacity: number): string {
    const value = hex.replace('#', '');
    const normalized =
        value.length === 3
            ? value
                .split('')
                .map((char) => `${char}${char}`)
                .join('')
            : value;

    const valid = /^[0-9a-fA-F]{6}$/.test(normalized) ? normalized : '000000';
    const red = Number.parseInt(valid.slice(0, 2), 16);
    const green = Number.parseInt(valid.slice(2, 4), 16);
    const blue = Number.parseInt(valid.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(opacity, 1)).toFixed(3)})`;
}

export function rgbStringToHex(value: string): string | null {
    const match = value.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
    if (!match) {
        return null;
    }
    const toHex = (channel: number) => Math.max(0, Math.min(255, channel)).toString(16).padStart(2, '0');
    return `#${toHex(Number(match[1]))}${toHex(Number(match[2]))}${toHex(Number(match[3]))}`;
}

export function cssColorToHex(value: string): string | null {
    if (typeof document === 'undefined' || !value) {
        return null;
    }
    const probe = document.createElement('span');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.color = '';
    probe.style.color = value;
    if (!probe.style.color) {
        return null;
    }
    const parent = document.body ?? document.documentElement;
    parent.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    probe.remove();
    return rgbStringToHex(computed);
}

export function resolveCssTokenToHex(cssVar: string): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    const raw = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    return (
        normalizeHexColor(raw) ??
        rgbStringToHex(raw) ??
        cssColorToHex(raw) ??
        cssColorToHex(`var(${cssVar})`)
    );
}

export function resolveTokenToHex(token: StudioColorToken): string | null {
    if (typeof token.value === 'string') {
        return normalizeHexColor(token.value);
    }
    if (typeof token.cssVar === 'string') {
        return resolveCssTokenToHex(token.cssVar);
    }
    return null;
}

// ─── Component Kind Utilities ─────────────────────────────────────────────────

export function isUIComponentKind(value: string | undefined): value is UIComponentKind {
    return COMPONENTS.some((component) => component.kind === value);
}

// ─── Feature Support Utilities ────────────────────────────────────────────────
// All driven by the inspector registry — single source of truth.

import { INSPECTOR_REGISTRY } from './inspector/inspector-registry';

export function supportsIconSelection(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].iconSelection;
}

export function supportsPanelStyle(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].panelStyle;
}

export function supportsDropdownHoverStyle(kind: UIComponentKind): boolean {
    return kind === 'dropdown';
}

export function supportsButtonStateStyle(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].buttonStateStyle;
}

export function supportsTypographyStyle(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].sections.typography;
}

export function supportsPrimitiveControls(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].primitiveControls;
}

export function supportsEntryMotion(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].motion.entryPresets;
}

export function supportsAdvancedHover(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].sections.advancedHover;
}

export function supportsGradientSlideEffect(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].effects.gradientSlide;
}

export function supportsAnimatedBorderEffect(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].effects.animatedBorder;
}

export function supportsRippleFillEffect(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].effects.rippleFill;
}

export function supportsLoadingEffect(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].effects.loading;
}

export function supportsSweepEffect(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].effects.sweep;
}

export function supportsStaggerMotion(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].motion.stagger;
}

export function supportsBorderBeamEffect(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].effects.borderBeam;
}

export function supportsShineBorderEffect(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].effects.shineBorder;
}

export function supportsNeonGlowEffect(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].effects.neonGlow;
}

export function supportsPulseRingEffect(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].effects.pulseRing;
}

export function buildExtractedEffectsClassName(kind: UIComponentKind, style: ComponentStyleConfig): string | undefined {
    const classes: string[] = [];
    if (supportsGradientSlideEffect(kind) && style.effectGradientSlideEnabled) {
        classes.push(
            'ui-studio-effect-gradient-slide',
            `ui-studio-effect-gradient-slide-${style.effectGradientSlideDirection}`,
            style.effectGradientSlideFillMode === 'gradient'
                ? 'ui-studio-effect-gradient-slide-gradient'
                : 'ui-studio-effect-gradient-slide-solid',
        );
    }
    if (supportsAnimatedBorderEffect(kind) && style.effectAnimatedBorderEnabled) {
        classes.push('ui-studio-effect-animated-border');
        if (style.effectAnimatedBorderStateDefault) {
            classes.push('ui-studio-effect-animated-border-state-default');
        }
        if (style.effectAnimatedBorderStateHover) {
            classes.push('ui-studio-effect-animated-border-state-hover');
        }
        if (style.effectAnimatedBorderStateActive) {
            classes.push('ui-studio-effect-animated-border-state-active');
        }
        if (style.effectAnimatedBorderStateDisabled) {
            classes.push('ui-studio-effect-animated-border-state-disabled');
        }
    }
    if (supportsRippleFillEffect(kind) && style.effectRippleFillEnabled) {
        classes.push('ui-studio-effect-ripple-fill');
    }
    if (supportsSweepEffect(kind) && style.effectSweepEnabled) {
        classes.push('ui-studio-effect-sweep');
        if (style.effectSweepStateDefault) {
            classes.push('ui-studio-effect-sweep-state-default');
        }
        if (style.effectSweepStateHover) {
            classes.push('ui-studio-effect-sweep-state-hover');
        }
        if (style.effectSweepStateActive) {
            classes.push('ui-studio-effect-sweep-state-active');
        }
        if (style.effectSweepStateDisabled) {
            classes.push('ui-studio-effect-sweep-state-disabled');
        }
    }
    if (supportsBorderBeamEffect(kind) && style.effectBorderBeamEnabled) {
        classes.push('ui-studio-effect-border-beam');
    }
    if (supportsShineBorderEffect(kind) && style.effectShineBorderEnabled) {
        classes.push('ui-studio-effect-shine-border');
    }
    if (supportsNeonGlowEffect(kind) && style.effectNeonGlowEnabled) {
        classes.push('ui-studio-effect-neon-glow');
    }
    if (supportsPulseRingEffect(kind) && style.effectPulseRingEnabled) {
        classes.push('ui-studio-effect-pulse-ring');
    }
    return classes.length > 0 ? classes.join(' ') : undefined;
}

// ─── Placement Utilities ──────────────────────────────────────────────────────

export function buildPrimitivePlacement(side: PrimitiveSide, align: PrimitiveAlign): string {
    return align === 'center' ? side : `${side} ${align}`;
}

export function buildDropdownMenuPositionStyle(config: ComponentStyleConfig): CSSProperties {
    const sideOffset = Math.max(0, config.dropdownSideOffset);
    const alignOffset = config.dropdownAlignOffset;
    const positioned: CSSProperties = {
        position: 'absolute',
        zIndex: 10,
    };

    if (config.dropdownSide === 'top') {
        positioned.bottom = `calc(100% + ${sideOffset}px)`;
        if (config.dropdownAlign === 'start') {
            positioned.left = `${alignOffset}px`;
        } else if (config.dropdownAlign === 'end') {
            positioned.left = `calc(100% + ${alignOffset}px)`;
            positioned.transform = 'translateX(-100%)';
        } else {
            positioned.left = `calc(50% + ${alignOffset}px)`;
            positioned.transform = 'translateX(-50%)';
        }
        return positioned;
    }

    if (config.dropdownSide === 'bottom') {
        positioned.top = `calc(100% + ${sideOffset}px)`;
        if (config.dropdownAlign === 'start') {
            positioned.left = `${alignOffset}px`;
        } else if (config.dropdownAlign === 'end') {
            positioned.left = `calc(100% + ${alignOffset}px)`;
            positioned.transform = 'translateX(-100%)';
        } else {
            positioned.left = `calc(50% + ${alignOffset}px)`;
            positioned.transform = 'translateX(-50%)';
        }
        return positioned;
    }

    if (config.dropdownSide === 'left') {
        positioned.right = `calc(100% + ${sideOffset}px)`;
        if (config.dropdownAlign === 'start') {
            positioned.top = `${alignOffset}px`;
        } else if (config.dropdownAlign === 'end') {
            positioned.top = `calc(100% + ${alignOffset}px)`;
            positioned.transform = 'translateY(-100%)';
        } else {
            positioned.top = `calc(50% + ${alignOffset}px)`;
            positioned.transform = 'translateY(-50%)';
        }
        return positioned;
    }

    positioned.left = `calc(100% + ${sideOffset}px)`;
    if (config.dropdownAlign === 'start') {
        positioned.top = `${alignOffset}px`;
    } else if (config.dropdownAlign === 'end') {
        positioned.top = `calc(100% + ${alignOffset}px)`;
        positioned.transform = 'translateY(-100%)';
    } else {
        positioned.top = `calc(50% + ${alignOffset}px)`;
        positioned.transform = 'translateY(-50%)';
    }
    return positioned;
}

// ─── Icon Utilities ───────────────────────────────────────────────────────────

export function getIconComponent(icon: IconOptionId) {
    switch (icon) {
        case 'search':
            return Search;
        case 'lightning':
            return Lightning;
        case 'heart':
            return HeartCircle;
        case 'figma':
            return Figma;
        case 'star':
            return Star;
        case 'cog':
            return Cog;
        case 'spinner':
            return LoaderCircle;
        default:
            return null;
    }
}

export function renderConfiguredIcon(config: ComponentStyleConfig, className?: string) {
    if (config.icon === 'spinner') {
        return <LoaderCircle size={config.iconSize} className={cn('animate-spin', className)} />;
    }
    const IconComponent = getIconComponent(config.icon);
    if (!IconComponent) {
        return null;
    }
    return <IconComponent size={config.iconSize} className={className} />;
}

export function renderLoadingStateIcon(config: ComponentStyleConfig, kind: UIComponentKind): ReactNode {
    if (!config.effectLoadingActiveEnabled) {
        return null;
    }
    const isActivePreview = config.buttonPreviewState === 'active';
    const isBadgeDefaultPreview = kind === 'badge' && config.effectLoadingBadgeDefaultEnabled && config.buttonPreviewState === 'default';
    if (!isActivePreview && !isBadgeDefaultPreview) {
        return null;
    }
    if (!isActivePreview) {
        return <LoaderCircle size={config.iconSize} className="animate-spin shrink-0 text-current" />;
    }
    if (config.effectLoadingOutcome === 'failure') {
        return <X size={config.iconSize} className="shrink-0 text-current ui-studio-loading-icon-failure" />;
    }
    if (config.effectLoadingOutcome === 'warning') {
        return <AlertTriangle size={config.iconSize} className="shrink-0 text-current ui-studio-loading-icon-warning" />;
    }
    return <Check size={config.iconSize} className="shrink-0 text-current ui-studio-loading-icon-success" />;
}

export function renderCheckboxSelectionIndicator(config: ComponentStyleConfig): ReactNode {
    if (config.checkboxSelectionIcon === 'cross') {
        return <X className="ui-studio-checkbox-indicator-icon" />;
    }
    if (config.checkboxSelectionIcon === 'solid') {
        return <span className="ui-studio-checkbox-indicator-solid" />;
    }
    return <Check className="ui-studio-checkbox-indicator-icon" />;
}

export function iconSnippet(config: ComponentStyleConfig): string | null {
    switch (config.icon) {
        case 'search':
            return `<Search size={${config.iconSize}} />`;
        case 'lightning':
            return `<Lightning size={${config.iconSize}} />`;
        case 'heart':
            return `<HeartCircle size={${config.iconSize}} />`;
        case 'figma':
            return `<Figma size={${config.iconSize}} />`;
        case 'star':
            return `<Star size={${config.iconSize}} />`;
        case 'cog':
            return `<Cog size={${config.iconSize}} />`;
        case 'spinner':
            return `<LoaderCircle size={${config.iconSize}} className="animate-spin" />`;
        default:
            return null;
    }
}

export function withIcon(content: ReactNode, iconNode: ReactNode, position: 'left' | 'right') {
    const hasText =
        typeof content === 'string'
            ? content.trim().length > 0
            : content !== null && content !== undefined && content !== false;

    if (!hasText && !iconNode) {
        return null;
    }

    if (!hasText && iconNode) {
        return <span className="inline-flex items-center">{iconNode}</span>;
    }

    const textNode = <span className="min-w-0 truncate">{content}</span>;
    if (!iconNode) {
        return textNode;
    }
    return (
        <span className="inline-flex min-w-0 max-w-full items-center gap-2 overflow-hidden">
            {position === 'left' ? (
                <>
                    {iconNode}
                    {textNode}
                </>
            ) : (
                <>
                    {textNode}
                    {iconNode}
                </>
            )}
        </span>
    );
}

// ─── Name / File Utilities ────────────────────────────────────────────────────

export function buildKindTitle(kind: UIComponentKind): string {
    const component = COMPONENTS.find((item) => item.kind === kind);
    return component?.label ?? kind;
}

export function sanitizeFileSegment(value: string): string {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return cleaned.length > 0 ? cleaned : 'snippet';
}

export function toPascalCase(value: string): string {
    const words = value
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) {
        return '';
    }

    return words
        .map((word) => {
            const lower = word.toLowerCase();
            return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
        })
        .join('');
}

export function indentBlock(value: string, spaces: number): string {
    const prefix = ' '.repeat(spaces);
    return value
        .split('\n')
        .map((line) => (line.length > 0 ? `${prefix}${line}` : line))
        .join('\n');
}

export function buildExportComponentName(instance: ComponentInstance): string {
    const kindName = toPascalCase(instance.kind) || 'Component';
    const instanceName = toPascalCase(instance.name);
    const normalizedInstanceName =
        instanceName.length > 0
            ? instanceName.toLowerCase().startsWith(kindName.toLowerCase())
                ? instanceName
                : `${kindName}${instanceName}`
            : `${kindName}Variant`;
    const safeName = /^[A-Za-z_]/.test(normalizedInstanceName) ? normalizedInstanceName : `${kindName}${normalizedInstanceName}`;
    return safeName;
}

export function ensureUniqueComponentName(baseName: string, usedNames: Set<string>): string {
    let candidate = baseName;
    let suffix = 2;
    while (usedNames.has(candidate)) {
        candidate = `${baseName}${suffix}`;
        suffix += 1;
    }
    usedNames.add(candidate);
    return candidate;
}

export function wrapSnippetInNamedComponent(
    baseSnippet: string,
    componentName: string,
    motionSnippet?: string,
    includeDefaultExport = false,
): string {
    const lines = baseSnippet.split('\n');
    const jsxStartIndex = lines.findIndex((line) => line.trimStart().startsWith('<'));
    const sections: string[] = [`export function ${componentName}() {`];

    if (jsxStartIndex === -1) {
        const body = baseSnippet.trim();
        if (body.length > 0) {
            sections.push(indentBlock(body, 2));
        }
        sections.push('}');
    } else {
        const declarations = lines.slice(0, jsxStartIndex).join('\n').trim();
        const jsxExpression = lines.slice(jsxStartIndex).join('\n').trim();

        if (declarations.length > 0) {
            sections.push(indentBlock(declarations, 2));
            sections.push('');
        }

        sections.push('  return (');
        sections.push(indentBlock(jsxExpression, 4));
        sections.push('  );');
        sections.push('}');
    }

    if (motionSnippet && motionSnippet.trim().length > 0) {
        sections.push('', motionSnippet.trim());
    }

    if (includeDefaultExport) {
        sections.push('', `export default ${componentName};`);
    }

    return sections.join('\n');
}

export function downloadSnippetFile(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

// ─── Style Building Utilities ─────────────────────────────────────────────────

export function fontPositionToJustify(position: FontPosition): CSSProperties['justifyContent'] {
    return position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center';
}

export function buildPanelStyle(config: ComponentStyleConfig): CSSProperties {
    const shadow = config.panelEffectDropShadow
        ? `${config.panelDropShadowX}px ${config.panelDropShadowY}px ${config.panelDropShadowBlur}px ${config.panelDropShadowSpread}px ${hexToRgba('#000000', 0.28)}`
        : undefined;
    const panelWidth = config.panelCustomWidth > 0 ? `${config.panelCustomWidth}px` : undefined;
    const panelHeight = config.panelCustomHeight > 0 ? `${config.panelCustomHeight}px` : undefined;
    return {
        background: hexToRgba(config.panelFillColor, config.panelFillOpacity / 100),
        color: hexToRgba(config.panelFontColor, config.panelFontOpacity / 100),
        borderColor: hexToRgba(config.panelStrokeColor, config.panelStrokeOpacity / 100),
        borderWidth: `${config.panelStrokeWeight}px`,
        borderStyle: 'solid',
        borderRadius: `${config.panelCornerRadius}px`,
        width: panelWidth,
        minWidth: panelWidth,
        height: panelHeight,
        minHeight: panelHeight,
        fontSize: `${config.panelFontSize}px`,
        fontWeight: config.panelFontWeight,
        boxShadow: shadow,
        backdropFilter: config.panelEffectBlur && config.panelBlurAmount > 0 ? `blur(${config.panelBlurAmount}px)` : undefined,
    };
}

export function buildPreviewStyle(config: ComponentStyleConfig): CSSProperties {
    const scale = SIZE_SCALE[config.size];
    const alpha = Math.max(0, Math.min(1, config.fillOpacity / 100));

    const solidFill = hexToRgba(config.fillColor, alpha);
    const gradientFill = `linear-gradient(135deg, ${hexToRgba(config.fillColor, alpha)} 0%, ${hexToRgba(
        config.fillColor,
        alpha,
    )} ${config.fillWeight}%, ${hexToRgba(config.fillColorTo, alpha)} 100%)`;

    const background = config.fillMode === 'gradient' ? gradientFill : solidFill;
    const borderColor = hexToRgba(config.strokeColor, config.strokeOpacity / 100);
    const fontColor = hexToRgba(config.fontColor, config.fontOpacity / 100);

    const shadowParts: string[] = [];
    if (config.effectDropShadow) {
        const dropBlur = config.dropShadowBlur > 0 ? config.dropShadowBlur : Math.max(2, Math.round(config.dropShadowStrength / 2));
        shadowParts.push(
            `${config.dropShadowX}px ${config.dropShadowY}px ${dropBlur}px ${config.dropShadowSpread}px ${hexToRgba('#000000', 0.22)}`,
        );
    }
    if (config.effectInnerShadow) {
        const innerBlur =
            config.innerShadowBlur > 0 ? config.innerShadowBlur : Math.max(1, Math.round(config.innerShadowStrength / 3));
        shadowParts.push(
            `inset ${config.innerShadowX}px ${config.innerShadowY}px ${innerBlur}px ${config.innerShadowSpread}px ${hexToRgba(
                '#000000',
                0.26,
            )}`,
        );
    }
    if (config.effectOutlineGlow) {
        shadowParts.push(`0 0 ${config.outlineGlowSize}px ${config.outlineGlowColor}`);
    }

    const textAlign: CSSProperties['textAlign'] = config.fontPosition;
    const justifyContent = fontPositionToJustify(config.fontPosition);

    const blurValue = config.effectBlur ? config.blurAmount : 0;
    const glassmorphismActive = config.effectGlassmorphism;
    const backdropFilter =
        config.effectGlass || glassmorphismActive || blurValue > 0
            ? `blur(${Math.max(
                  config.effectGlass ? 8 : 0,
                  glassmorphismActive ? config.glassmorphismBlur : 0,
                  blurValue,
              )}px) saturate(${config.effectGlass ? 140 : 100}%)`
            : undefined;

    const glassTint = config.effectGlass ? hexToRgba('#ffffff', config.glassOpacity / 100) : undefined;

    // Resolve background: glassmorphism overrides glass which overrides standard fill
    let resolvedBackground: string;
    if (glassmorphismActive) {
        resolvedBackground = `rgba(255,255,255,${(config.glassmorphismOpacity / 100).toFixed(3)})`;
    } else if (config.effectGlass) {
        resolvedBackground = glassTint ?? background;
    } else {
        resolvedBackground = background;
    }

    // Text shadow
    const textShadow = config.effectTextShadow
        ? `${config.textShadowX}px ${config.textShadowY}px ${config.textShadowBlur}px ${config.textShadowColor}`
        : undefined;

    const result: CSSProperties = {
        background: resolvedBackground,
        borderStyle: glassmorphismActive ? undefined : config.borderStyle,
        borderWidth: glassmorphismActive ? undefined : `${config.strokeWeight}px`,
        border: glassmorphismActive ? `1px solid rgba(255,255,255,${(config.glassmorphismBorderOpacity / 100).toFixed(3)})` : undefined,
        borderColor: glassmorphismActive ? undefined : borderColor,
        borderRadius: `${config.cornerRadius}px`,
        color: fontColor,
        fontSize: `${Math.round(config.fontSize * scale)}px`,
        fontWeight: config.fontWeight,
        textAlign,
        justifyContent,
        minHeight: config.customHeight > 0 ? `${config.customHeight}px` : `${Math.round(38 * scale)}px`,
        height: config.customHeight > 0 ? `${config.customHeight}px` : undefined,
        width: config.customWidth > 0 ? `${config.customWidth}px` : undefined,
        paddingInline: `${Math.round(14 * scale)}px`,
        boxShadow: shadowParts.length > 0 ? shadowParts.join(', ') : undefined,
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        transition:
            'background 180ms ease, border-color 180ms ease, color 180ms ease, border-radius 180ms ease, box-shadow 180ms ease',
    };

    // Typography: letter-spacing
    if (config.letterSpacing !== 0) {
        result.letterSpacing = `${config.letterSpacing}px`;
    }

    // Typography: line-height (0 = auto, otherwise unitless multiplier)
    if (config.lineHeight !== 0) {
        result.lineHeight = config.lineHeight;
    }

    // Typography: text-transform
    if (config.textTransform !== 'none') {
        result.textTransform = config.textTransform;
    }

    // Text shadow
    if (textShadow) {
        result.textShadow = textShadow;
    }

    return result;
}

/**
 * For components with internal styling (Progress, Skeleton, DataTable, etc.),
 * strip background/border/fill properties from the wrapper style so they
 * don't override the component's own visuals. Keep layout properties.
 *
 * Strategy is driven by the inspector registry's `wrapperStyle` field.
 */
export function buildComponentWrapperStyle(
    fullStyle: CSSProperties,
    kind: UIComponentKind,
): CSSProperties {
    const strategy = INSPECTOR_REGISTRY[kind].wrapperStyle;

    switch (strategy) {
        case 'full':
            return fullStyle;

        case 'typography-only': {
            const kept: CSSProperties = {};
            if (fullStyle.color) kept.color = fullStyle.color;
            if (fullStyle.fontSize) kept.fontSize = fullStyle.fontSize;
            if (fullStyle.fontWeight) kept.fontWeight = fullStyle.fontWeight;
            if (fullStyle.textAlign) kept.textAlign = fullStyle.textAlign;
            if (fullStyle.letterSpacing) kept.letterSpacing = fullStyle.letterSpacing;
            if (fullStyle.lineHeight) kept.lineHeight = fullStyle.lineHeight;
            if (fullStyle.textTransform) kept.textTransform = fullStyle.textTransform;
            if (fullStyle.textShadow) kept.textShadow = fullStyle.textShadow;
            return kept;
        }

        case 'shadow-only': {
            const kept: CSSProperties = {};
            if (fullStyle.boxShadow) kept.boxShadow = fullStyle.boxShadow;
            return kept;
        }

        case 'minimal': {
            const kept: CSSProperties = {};
            if (fullStyle.borderRadius) kept.borderRadius = fullStyle.borderRadius;
            if (fullStyle.boxShadow) kept.boxShadow = fullStyle.boxShadow;
            return kept;
        }

        case 'strip-border': {
            const {
                borderColor: _bc,
                borderWidth: _bw,
                borderStyle: _bs,
                border: _b,
                paddingInline: _pi,
                minHeight: _mh,
                height: _h,
                width: _w,
                ...rest
            } = fullStyle;
            return rest;
        }

        case 'strip-structural': {
            const {
                background: _bg,
                borderColor: _bc,
                borderWidth: _bw,
                borderStyle: _bs,
                border: _b,
                paddingInline: _pi,
                ...rest
            } = fullStyle;
            return rest;
        }

        // Note: buildCardDirectStyle() extracts what strip-structural removes
        // so it can be applied directly to the Card component.

        case 'strip-all': {
            const {
                background: _bg,
                borderColor: _bc,
                borderWidth: _bw,
                borderStyle: _bs,
                border: _b,
                paddingInline: _pi,
                minHeight: _mh,
                height: _h,
                width: _w,
                ...rest
            } = fullStyle;
            return rest;
        }

        case 'strip-layout': {
            const {
                background: _bg,
                borderColor: _bc,
                borderWidth: _bw,
                borderStyle: _bs,
                border: _b,
                paddingInline: _pi,
                minHeight: _mh,
                height: _h,
                ...rest
            } = fullStyle;
            return rest;
        }

        default:
            return fullStyle;
    }
}

/**
 * Extract the properties that strip-structural removes from the wrapper,
 * so they can be applied directly to the Card component.
 */
export function buildCardDirectStyle(fullStyle: CSSProperties, config: ComponentStyleConfig): CSSProperties {
    const result: CSSProperties = {};
    if (fullStyle.background) result.background = fullStyle.background;
    if (fullStyle.borderColor) result.borderColor = fullStyle.borderColor;
    if (fullStyle.borderWidth) result.borderWidth = fullStyle.borderWidth;
    if (fullStyle.borderStyle) result.borderStyle = fullStyle.borderStyle;
    if (fullStyle.border) result.border = fullStyle.border;
    if (config.cornerRadius > 0) result.borderRadius = `${config.cornerRadius}px`;
    if (fullStyle.backdropFilter) {
        result.backdropFilter = fullStyle.backdropFilter;
        result.WebkitBackdropFilter = fullStyle.WebkitBackdropFilter;
    }
    return result;
}

/**
 * Extract text/font-related styles from the full preview style,
 * for passing to inner elements like TabsTrigger.
 */
export function extractTextStyle(fullStyle: CSSProperties): CSSProperties {
    const result: CSSProperties = {};
    if (fullStyle.color) result.color = fullStyle.color;
    if (fullStyle.fontSize) result.fontSize = fullStyle.fontSize;
    if (fullStyle.fontWeight) result.fontWeight = fullStyle.fontWeight;
    if (fullStyle.letterSpacing) result.letterSpacing = fullStyle.letterSpacing;
    if (fullStyle.lineHeight) result.lineHeight = fullStyle.lineHeight;
    if (fullStyle.textTransform) result.textTransform = fullStyle.textTransform;
    if (fullStyle.textShadow) result.textShadow = fullStyle.textShadow;
    return result;
}

export function buildMotionVariables(config: ComponentStyleConfig): CSSProperties {
    return {
        ['--ui-motion-speed' as string]: `${config.motionSpeed}s`,
        ['--ui-motion-fill' as string]: hexToRgba(config.fillColor, Math.max(0.25, config.fillOpacity / 100)),
        ['--ui-motion-gradient-from' as string]: config.effectGradientSlideColor,
        ['--ui-motion-gradient-to' as string]: config.effectGradientSlideColorTo,
        ['--ui-motion-ripple-color' as string]: config.effectRippleFillColor,
        ['--ui-motion-rainbow-1' as string]: config.rainbowColor1,
        ['--ui-motion-rainbow-2' as string]: config.rainbowColor2,
        ['--ui-motion-rainbow-3' as string]: config.rainbowColor3,
        ['--ui-motion-rainbow-4' as string]: config.rainbowColor4,
        ['--ui-motion-rainbow-5' as string]: config.rainbowColor5,
        ['--ui-motion-shimmer' as string]: hexToRgba(config.shimmerColor, 0.68),
        ['--ui-effect-gs-speed' as string]: `${config.effectGradientSlideSpeed}s`,
        ['--ui-effect-border-speed' as string]: `${config.effectAnimatedBorderSpeed}s`,
        ['--ui-effect-border-width' as string]: `${Math.max(0, config.strokeWeight)}px`,
        ['--ui-effect-border-1' as string]: config.effectAnimatedBorderColor1,
        ['--ui-effect-border-2' as string]: config.effectAnimatedBorderColor2,
        ['--ui-effect-border-3' as string]: config.effectAnimatedBorderColor3,
        ['--ui-effect-border-4' as string]: config.effectAnimatedBorderColor4,
        ['--ui-effect-border-5' as string]: config.effectAnimatedBorderColor5,
        ['--ui-effect-border-count' as string]: String(Math.max(2, Math.min(5, config.effectAnimatedBorderColorCount))),
        ['--ui-effect-ripple-speed' as string]: `${config.effectRippleFillSpeed}s`,
        ['--ui-effect-sweep-color' as string]: config.effectSweepColor,
        ['--ui-effect-sweep-opacity' as string]: `${Math.max(0, Math.min(100, config.effectSweepOpacity)) / 100}`,
        ['--ui-effect-sweep-width' as string]: `${Math.max(4, config.effectSweepWidth)}%`,
        ['--ui-effect-sweep-speed' as string]: `${config.effectSweepSpeed}s`,
        // Border Beam
        ['--ui-effect-beam-speed' as string]: `${config.effectBorderBeamSpeed}s`,
        ['--ui-effect-beam-size' as string]: `${config.effectBorderBeamSize}px`,
        ['--ui-effect-beam-width' as string]: `${Math.max(0, config.strokeWeight)}px`,
        ['--ui-effect-beam-from' as string]: config.effectBorderBeamColorFrom,
        ['--ui-effect-beam-to' as string]: config.effectBorderBeamColorTo,
        // Shine Border
        ['--ui-effect-shine-speed' as string]: `${config.effectShineBorderSpeed}s`,
        ['--ui-effect-shine-color' as string]: config.effectShineBorderColor,
        ['--ui-effect-shine-width' as string]: `${Math.max(0, config.strokeWeight)}px`,
        // Neon Glow
        ['--ui-effect-neon-speed' as string]: `${config.effectNeonGlowSpeed}s`,
        ['--ui-effect-neon-color1' as string]: config.effectNeonGlowColor1,
        ['--ui-effect-neon-color2' as string]: config.effectNeonGlowColor2,
        ['--ui-effect-neon-size' as string]: `${config.effectNeonGlowSize}px`,
        // Pulse Ring
        ['--ui-effect-pulse-speed' as string]: `${config.effectPulseRingSpeed}s`,
        ['--ui-effect-pulse-width' as string]: `${Math.max(0, config.strokeWeight)}px`,
        ['--ui-effect-pulse-color' as string]: config.effectPulseRingColor,
        ['--ui-checkbox-selection-speed' as string]: `${config.checkboxSelectionAnimationSpeed}s`,
        ['--ui-slider-thumb-hover-scale' as string]: String(config.sliderThumbHoverScale),
        ['--ui-slider-thumb-tap-bounce' as string]: `${config.sliderThumbTapBounce}s`,
        ['--ui-slider-bar-fill-speed' as string]: `${config.sliderBarFillSpeed}s`,
        ['--ui-slider-bar-scale' as string]: String(config.sliderBarScale),
        ['--ui-slider-bar-bounce' as string]: `${config.sliderBarBounce}s`,
    } as CSSProperties;
}

export function supportsMotionPreset(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].motionPreset;
}

export function buildMotionClassName(kind: UIComponentKind, preset: MotionPresetId): string | undefined {
    if (!supportsMotionPreset(kind) || preset === 'none') {
        return undefined;
    }
    return preset === 'rainbow' ? 'ui-studio-motion-rainbow' : 'ui-studio-motion-shimmer';
}

export function buildStateFill(
    mode: FillMode,
    color: string,
    colorTo: string,
    weight: number,
    opacity: number,
): string {
    const alpha = Math.max(0, Math.min(1, opacity / 100));
    if (mode === 'gradient') {
        const stop = Math.max(0, Math.min(100, weight));
        return `linear-gradient(135deg, ${hexToRgba(color, alpha)} 0%, ${hexToRgba(color, alpha)} ${stop}%, ${hexToRgba(
            colorTo,
            alpha,
        )} 100%)`;
    }
    return hexToRgba(color, alpha);
}

// ─── Visual Preset Helpers ────────────────────────────────────────────────────

export function getComponentVisualPresets(kind: UIComponentKind): ComponentVisualPreset[] {
    return COMPONENT_VISUAL_PRESETS[kind] ?? [];
}

export function getComponentVisualPreset(kind: UIComponentKind, presetId: string): ComponentVisualPreset | undefined {
    return getComponentVisualPresets(kind).find((preset) => preset.id === presetId);
}

// ─── Tailwind/Snippet Style Helpers ──────────────────────────────────────────

export function styleToCode(style: CSSProperties): string {
    const entries = Object.entries(style).filter(([, value]) => value !== undefined && value !== null);
    const body = entries
        .map(([key, value]) => {
            const keyLiteral = /^[$A-Z_][0-9A-Z_$]*$/i.test(key) ? key : `'${key}'`;
            if (typeof value === 'number') {
                return `  ${keyLiteral}: ${value},`;
            }
            return `  ${keyLiteral}: '${String(value).replace(/'/g, "\\'")}',`;
        })
        .join('\n');

    return `{\n${body}\n}`;
}

export function toTailwindArbitraryValue(value: string): string {
    return value.trim().replace(/\s+/g, '_');
}

function sanitizeTokenVarName(tokenId: string): string {
    return tokenId
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'token';
}

function tryResolveSolidColorToHex(value: string): string | null {
    const normalizedHex = normalizeHexColor(value);
    if (normalizedHex) {
        return normalizedHex;
    }

    const rgbaMatch = value.match(
        /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([01](?:\.\d+)?))?\s*\)$/i,
    );
    if (!rgbaMatch) {
        return null;
    }

    const alphaRaw = rgbaMatch[4];
    const alpha = alphaRaw === undefined ? 1 : Number(alphaRaw);
    if (!Number.isFinite(alpha) || alpha < 0.999) {
        return null;
    }

    const toHex = (channel: string) =>
        Math.max(0, Math.min(255, Number(channel)))
            .toString(16)
            .padStart(2, '0');

    return `#${toHex(rgbaMatch[1])}${toHex(rgbaMatch[2])}${toHex(rgbaMatch[3])}`;
}

function mergeClassTokens(...tokens: Array<string | undefined>): string {
    return Array.from(
        new Set(
            tokens
                .flatMap((token) => (token ?? '').split(/\s+/))
                .map((token) => token.trim())
                .filter(Boolean),
        ),
    ).join(' ');
}

function parsePixelValue(value: string): number | null {
    const match = value.trim().match(/^(-?\d+(?:\.\d+)?)px$/i);
    if (!match) {
        return null;
    }
    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : null;
}

function mapBorderWidthClass(value: string): string | null {
    const px = parsePixelValue(value);
    if (px === null) {
        return null;
    }
    if (px === 0) {
        return 'border-0';
    }
    // Tailwind standard border widths: 1 (default), 2, 4, 8
    if (px === 1) {
        return 'border';
    }
    if (px === 2) {
        return 'border-2';
    }
    if (px === 3) {
        // 3px is close to 2px or 4px; prefer 2 for subtle borders
        return 'border-2';
    }
    if (px === 4) {
        return 'border-4';
    }
    if (px >= 5 && px <= 6) {
        // Mid-range values map to 4px for consistency
        return 'border-4';
    }
    if (px >= 7 && px <= 10) {
        return 'border-8';
    }
    if (px > 10) {
        return 'border-8';
    }
    return null;
}

function mapRadiusClass(value: string): string | null {
    const px = parsePixelValue(value);
    if (px === null) {
        return null;
    }
    if (px <= 0) {
        return 'rounded-none';
    }
    // Match Tailwind's default scale (4px base unit)
    if (px === 2) {
        return 'rounded-sm';
    }
    if (px === 4) {
        return 'rounded-md';
    }
    if (px === 6) {
        return 'rounded-md';
    }
    if (px === 8) {
        return 'rounded-lg';
    }
    if (px === 10) {
        return 'rounded-lg';
    }
    if (px === 12) {
        return 'rounded-xl';
    }
    if (px === 16) {
        return 'rounded-2xl';
    }
    if (px === 24) {
        return 'rounded-3xl';
    }
    if (px >= 9999) {
        return 'rounded-full';
    }
    // For values close to standard tokens, prefer the token
    if (px > 16 && px < 24) {
        return 'rounded-2xl';
    }
    if (px > 24) {
        return 'rounded-3xl';
    }
    // Small values (< 2px) map to smallest token
    return 'rounded-sm';
}

function mapFontSizeClass(value: string): string | null {
    const px = parsePixelValue(value);
    if (px === null) {
        return null;
    }
    // Exact matches to Tailwind's default scale
    if (px === 12) {
        return 'text-xs';
    }
    if (px === 14) {
        return 'text-sm';
    }
    if (px === 16) {
        return 'text-base';
    }
    if (px === 18) {
        return 'text-lg';
    }
    if (px === 20) {
        return 'text-xl';
    }
    if (px === 24) {
        return 'text-2xl';
    }
    if (px === 30) {
        return 'text-3xl';
    }
    if (px === 36) {
        return 'text-4xl';
    }
    // Range-based fallback for values between standard tokens
    if (px < 12) {
        return 'text-xs';
    }
    if (px < 14) {
        return 'text-xs';
    }
    if (px < 16) {
        return 'text-sm';
    }
    if (px < 18) {
        return 'text-base';
    }
    if (px < 20) {
        return 'text-lg';
    }
    if (px < 24) {
        return 'text-xl';
    }
    if (px < 30) {
        return 'text-2xl';
    }
    if (px < 36) {
        return 'text-3xl';
    }
    return 'text-4xl';
}

function mapFontWeightClass(value: string): string | null {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return null;
    }
    // Exact matches to Tailwind's font-weight scale
    if (numeric === 100) {
        return 'font-thin';
    }
    if (numeric === 200) {
        return 'font-extralight';
    }
    if (numeric === 300) {
        return 'font-light';
    }
    if (numeric === 400) {
        return 'font-normal';
    }
    if (numeric === 500) {
        return 'font-medium';
    }
    if (numeric === 600) {
        return 'font-semibold';
    }
    if (numeric === 700) {
        return 'font-bold';
    }
    if (numeric === 800) {
        return 'font-extrabold';
    }
    if (numeric === 900) {
        return 'font-black';
    }
    // Range-based fallback for values between standard tokens
    if (numeric < 300) {
        return 'font-light';
    }
    if (numeric < 400) {
        return 'font-light';
    }
    if (numeric < 500) {
        return 'font-normal';
    }
    if (numeric < 600) {
        return 'font-medium';
    }
    if (numeric < 700) {
        return 'font-semibold';
    }
    if (numeric < 800) {
        return 'font-bold';
    }
    if (numeric < 900) {
        return 'font-extrabold';
    }
    return 'font-black';
}

function isTailwindColorClassCandidate(value: string): boolean {
    const trimmed = value.trim();
    return trimmed.startsWith('var(') || Boolean(normalizeHexColor(trimmed));
}

export function buildTailwindStylePayload(
    style: CSSProperties,
    tokenSet?: StudioTokenSet,
): { classTokens: string[]; fallbackStyle: CSSProperties } {
    const classes: string[] = [];
    const fallbackStyle: CSSProperties = {};
    const localTokenVars: Record<string, string> = {};
    const entries = Object.entries(style).filter(([, value]) => value !== undefined && value !== null);

    const resolveTokenVariable = (rawColor: string): string | null => {
        if (!tokenSet) {
            return null;
        }

        const comparable = tryResolveSolidColorToHex(rawColor);
        if (!comparable) {
            return null;
        }

        for (const token of tokenSet.tokens) {
            const tokenHex = resolveTokenToHex(token);
            if (!tokenHex || tokenHex !== comparable) {
                continue;
            }
            if (token.cssVar) {
                return `var(${token.cssVar})`;
            }
            const localVar = `--ui-token-${sanitizeTokenVarName(token.id)}`;
            localTokenVars[localVar] = tokenHex;
            return `var(${localVar})`;
        }

        return null;
    };

    for (const [key, rawValue] of entries) {
        const value = String(rawValue);
        if (key.startsWith('--')) {
            fallbackStyle[key as keyof CSSProperties] = rawValue as never;
            continue;
        }

        switch (key) {
            case 'background': {
                const resolved = resolveTokenVariable(value) ?? value;
                if (isTailwindColorClassCandidate(resolved)) {
                    classes.push(`bg-[${toTailwindArbitraryValue(resolved)}]`);
                } else {
                    fallbackStyle.background = rawValue as never;
                }
                break;
            }
            case 'color': {
                const resolved = resolveTokenVariable(value) ?? value;
                if (isTailwindColorClassCandidate(resolved)) {
                    classes.push(`text-[${toTailwindArbitraryValue(resolved)}]`);
                } else {
                    fallbackStyle.color = rawValue as never;
                }
                break;
            }
            case 'borderColor': {
                const resolved = resolveTokenVariable(value) ?? value;
                if (isTailwindColorClassCandidate(resolved)) {
                    classes.push(`border-[${toTailwindArbitraryValue(resolved)}]`);
                } else {
                    fallbackStyle.borderColor = rawValue as never;
                }
                break;
            }
            case 'borderWidth':
                classes.push(mapBorderWidthClass(value) ?? `border-[${toTailwindArbitraryValue(value)}]`);
                break;
            case 'borderStyle':
                if (value === 'solid') {
                    classes.push('border-solid');
                } else if (value === 'dashed') {
                    classes.push('border-dashed');
                } else if (value === 'dotted') {
                    classes.push('border-dotted');
                } else {
                    classes.push(`[border-style:${toTailwindArbitraryValue(value)}]`);
                }
                break;
            case 'border':
                // Glassmorphism composite border value — use arbitrary property
                fallbackStyle.border = rawValue as never;
                break;
            case 'borderRadius':
                classes.push(mapRadiusClass(value) ?? `rounded-[${toTailwindArbitraryValue(value)}]`);
                break;
            case 'fontSize':
                classes.push(mapFontSizeClass(value) ?? `text-[${toTailwindArbitraryValue(value)}]`);
                break;
            case 'fontWeight':
                classes.push(mapFontWeightClass(value) ?? `font-[${toTailwindArbitraryValue(value)}]`);
                break;
            case 'textAlign':
                if (value === 'left' || value === 'center' || value === 'right' || value === 'justify') {
                    classes.push(`text-${value}`);
                } else {
                    classes.push(`[text-align:${toTailwindArbitraryValue(value)}]`);
                }
                break;
            case 'justifyContent':
                if (value === 'flex-start') {
                    classes.push('justify-start');
                } else if (value === 'flex-end') {
                    classes.push('justify-end');
                } else if (value === 'center') {
                    classes.push('justify-center');
                } else if (value === 'space-between') {
                    classes.push('justify-between');
                } else if (value === 'space-around') {
                    classes.push('justify-around');
                } else if (value === 'space-evenly') {
                    classes.push('justify-evenly');
                } else {
                    classes.push(`[justify-content:${toTailwindArbitraryValue(value)}]`);
                }
                break;
            case 'minHeight':
                classes.push(`min-h-[${toTailwindArbitraryValue(value)}]`);
                break;
            case 'height':
                classes.push(`h-[${toTailwindArbitraryValue(value)}]`);
                break;
            case 'width':
                classes.push(`w-[${toTailwindArbitraryValue(value)}]`);
                break;
            case 'paddingInline':
                classes.push(`px-[${toTailwindArbitraryValue(value)}]`);
                break;
            case 'boxShadow':
                classes.push(`shadow-[${toTailwindArbitraryValue(value)}]`);
                break;
            case 'backdropFilter':
                classes.push(`backdrop-[${toTailwindArbitraryValue(value)}]`);
                break;
            case 'WebkitBackdropFilter':
                // WebKit variant is redundant when using backdrop utility classes.
                break;
            case 'letterSpacing':
                classes.push(`tracking-[${toTailwindArbitraryValue(value)}]`);
                break;
            case 'lineHeight':
                classes.push(`leading-[${toTailwindArbitraryValue(value)}]`);
                break;
            case 'textTransform':
                if (value === 'uppercase') {
                    classes.push('uppercase');
                } else if (value === 'lowercase') {
                    classes.push('lowercase');
                } else if (value === 'capitalize') {
                    classes.push('capitalize');
                } else if (value === 'none') {
                    classes.push('normal-case');
                } else {
                    classes.push(`[text-transform:${toTailwindArbitraryValue(value)}]`);
                }
                break;
            case 'textShadow':
                classes.push(`[text-shadow:${toTailwindArbitraryValue(value)}]`);
                break;
            case 'transition': {
                const normalized = value.replace(/\s+/g, ' ').trim();
                if (
                    normalized ===
                    'background 180ms ease, border-color 180ms ease, color 180ms ease, border-radius 180ms ease, box-shadow 180ms ease'
                ) {
                    classes.push('transition-[background,border-color,color,border-radius,box-shadow]', 'duration-[180ms]', 'ease-in-out');
                } else {
                    fallbackStyle.transition = rawValue as never;
                }
                break;
            }
            default:
                fallbackStyle[key as keyof CSSProperties] = rawValue as never;
                break;
        }
    }

    const localTokenVarClasses = Object.entries(localTokenVars).map(
        ([cssVar, cssValue]) => `[${cssVar}:${toTailwindArbitraryValue(cssValue)}]`,
    );

    return {
        classTokens: Array.from(new Set([...localTokenVarClasses, ...classes].filter(Boolean))),
        fallbackStyle,
    };
}

export type ExportStyleMode = 'inline' | 'tailwind';

export function buildSnippetClassNameAttr(staticClassName?: string, styleClassVarName?: string): string {
    const normalizedStatic = staticClassName?.trim();
    if (normalizedStatic && styleClassVarName) {
        const escapedStatic = normalizedStatic.replace(/'/g, "\\'");
        return ` className={['${escapedStatic}', ${styleClassVarName}].filter(Boolean).join(' ')}`;
    }
    if (styleClassVarName) {
        return ` className={${styleClassVarName}}`;
    }
    if (normalizedStatic) {
        return ` className="${normalizedStatic}"`;
    }
    return '';
}

function toSnippetStringLiteral(value: string): string {
    return `'${value.replace(/'/g, "\\'")}'`;
}

export function buildExportClassBinding(
    baseName: string,
    options: {
        componentClassName?: string;
        effectClassName?: string;
        extraClassNames?: string[];
        styleClassVarName?: string;
    },
): { declarations: string; classNameVar?: string } {
    const declarations: string[] = [];
    const classNameParts: string[] = [];

    if (options.extraClassNames && options.extraClassNames.length > 0) {
        classNameParts.push(...options.extraClassNames.map((token) => toSnippetStringLiteral(token)));
    }

    const normalizedComponentClassName = options.componentClassName?.trim();
    if (normalizedComponentClassName) {
        const componentClassVar = `${baseName}ComponentClassName`;
        declarations.push(`const ${componentClassVar} = ${toSnippetStringLiteral(normalizedComponentClassName)};`);
        classNameParts.push(componentClassVar);
    }

    const normalizedEffectClassName = options.effectClassName?.trim();
    if (normalizedEffectClassName) {
        const effectClassVar = `${baseName}EffectClassName`;
        declarations.push('// Extracted effects stay grouped here so they are easy to move or replace.');
        declarations.push(`const ${effectClassVar} = ${toSnippetStringLiteral(normalizedEffectClassName)};`);
        classNameParts.push(effectClassVar);
    }

    if (options.styleClassVarName) {
        classNameParts.push(options.styleClassVarName);
    }

    if (classNameParts.length === 0) {
        return { declarations: declarations.join('\n') };
    }

    const classNameVar = `${baseName}ClassName`;
    declarations.push(`const ${classNameVar} = [${classNameParts.join(', ')}].filter(Boolean).join(' ');`);
    return { declarations: declarations.join('\n'), classNameVar };
}

export function buildSnippetClassNameVarAttr(classNameVar?: string): string {
    return classNameVar ? ` className={${classNameVar}}` : '';
}

export function buildSnippetStyleAttr(styleVarName?: string): string {
    return styleVarName ? ` style={${styleVarName}}` : '';
}

export function buildSnippetStyleBindings(
    style: CSSProperties,
    styleMode: ExportStyleMode,
    baseName: string,
    tokenSet?: StudioTokenSet,
): {
    declarations: string;
    classVarName?: string;
    styleVarName?: string;
} {
    if (styleMode === 'inline') {
        return {
            declarations: `const ${baseName}Style = ${styleToCode(style)};`,
            styleVarName: `${baseName}Style`,
        };
    }

    const { classTokens, fallbackStyle } = buildTailwindStylePayload(style, tokenSet);
    const declarations: string[] = [];

    if (classTokens.length > 0) {
        const classRows = classTokens
            .map((token) => `  '${token.replace(/'/g, "\\'")}',`)
            .join('\n');
        declarations.push(`const ${baseName}ClassName = [\n${classRows}\n].join(' ');`);
    }

    if (Object.keys(fallbackStyle).length > 0) {
        declarations.push(`const ${baseName}Style = ${styleToCode(fallbackStyle)};`);
    }

    return {
        declarations: declarations.join('\n'),
        classVarName: classTokens.length > 0 ? `${baseName}ClassName` : undefined,
        styleVarName: Object.keys(fallbackStyle).length > 0 ? `${baseName}Style` : undefined,
    };
}

export function buildPreviewPresentation(instance: ComponentInstance): { style: CSSProperties; motionClassName?: string } {
    const componentPreset = getComponentVisualPreset(instance.kind, instance.style.componentPreset);
    const extractedEffectsClassName = buildExtractedEffectsClassName(instance.kind, instance.style);
    const hasAnimatedBorderEffect = supportsAnimatedBorderEffect(instance.kind) && instance.style.effectAnimatedBorderEnabled;
    const baseStyle = {
        ...buildPreviewStyle(instance.style),
        ...buildMotionVariables(instance.style),
        ['--ui-dropdown-hover-bg' as string]: hexToRgba(
            instance.style.dropdownHoverFill,
            instance.style.dropdownHoverFillOpacity / 100,
        ),
        ['--ui-dropdown-hover-fg' as string]: instance.style.dropdownHoverText,
        ['--ui-btn-hover-bg' as string]: buildStateFill(
            instance.style.buttonHoverFillMode,
            instance.style.buttonHoverFillColor,
            instance.style.buttonHoverFillColorTo,
            instance.style.buttonHoverFillWeight,
            instance.style.buttonHoverFillOpacity,
        ),
        ['--ui-btn-hover-fg' as string]: hexToRgba(instance.style.buttonHoverFontColor, instance.style.buttonHoverFontOpacity / 100),
        ['--ui-btn-hover-border' as string]: hexToRgba(
            instance.style.buttonHoverStrokeColor,
            instance.style.buttonHoverStrokeOpacity / 100,
        ),
        ['--ui-btn-hover-border-width' as string]: `${instance.style.buttonHoverStrokeWeight}px`,
        ['--ui-btn-hover-font-size' as string]: `${Math.round(instance.style.buttonHoverFontSize * SIZE_SCALE[instance.style.size])}px`,
        ['--ui-btn-hover-font-weight' as string]: instance.style.buttonHoverFontWeight,
        ['--ui-btn-hover-justify' as string]: fontPositionToJustify(instance.style.buttonHoverFontPosition),
        ['--ui-btn-active-bg' as string]: buildStateFill(
            instance.style.buttonActiveFillMode,
            instance.style.buttonActiveFillColor,
            instance.style.buttonActiveFillColorTo,
            instance.style.buttonActiveFillWeight,
            instance.style.buttonActiveFillOpacity,
        ),
        ['--ui-btn-active-fg' as string]: hexToRgba(
            instance.style.buttonActiveFontColor,
            instance.style.buttonActiveFontOpacity / 100,
        ),
        ['--ui-btn-active-border' as string]: hexToRgba(
            instance.style.buttonActiveStrokeColor,
            instance.style.buttonActiveStrokeOpacity / 100,
        ),
        ['--ui-btn-active-border-width' as string]: `${instance.style.buttonActiveStrokeWeight}px`,
        ['--ui-btn-active-font-size' as string]: `${Math.round(instance.style.buttonActiveFontSize * SIZE_SCALE[instance.style.size])}px`,
        ['--ui-btn-active-font-weight' as string]: instance.style.buttonActiveFontWeight,
        ['--ui-btn-active-justify' as string]: fontPositionToJustify(instance.style.buttonActiveFontPosition),
        ['--ui-btn-disabled-bg' as string]: buildStateFill(
            instance.style.buttonDisabledFillMode,
            instance.style.buttonDisabledFillColor,
            instance.style.buttonDisabledFillColorTo,
            instance.style.buttonDisabledFillWeight,
            instance.style.buttonDisabledFillOpacity,
        ),
        ['--ui-btn-disabled-fg' as string]: hexToRgba(
            instance.style.buttonDisabledFontColor,
            instance.style.buttonDisabledFontOpacity / 100,
        ),
        ['--ui-btn-disabled-border' as string]: hexToRgba(
            instance.style.buttonDisabledStrokeColor,
            instance.style.buttonDisabledStrokeOpacity / 100,
        ),
        ['--ui-btn-disabled-border-width' as string]: `${instance.style.buttonDisabledStrokeWeight}px`,
        ['--ui-btn-disabled-font-size' as string]: `${Math.round(instance.style.buttonDisabledFontSize * SIZE_SCALE[instance.style.size])}px`,
        ['--ui-btn-disabled-font-weight' as string]: instance.style.buttonDisabledFontWeight,
        ['--ui-btn-disabled-justify' as string]: fontPositionToJustify(instance.style.buttonDisabledFontPosition),
    } as CSSProperties;
    const motionClassName = buildMotionClassName(instance.kind, instance.style.motionPreset);
    const className = cn(componentPreset?.className, motionClassName, extractedEffectsClassName);
    if (!motionClassName && !hasAnimatedBorderEffect) {
        return { style: baseStyle, motionClassName: className || undefined };
    }

    return {
        style: {
            ...baseStyle,
            // Motion/effect layers define their own visual background.
            background: undefined,
            borderColor: undefined,
        },
        motionClassName: className || undefined,
    };
}
