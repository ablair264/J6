import type { CSSProperties, ReactNode } from 'react';
import {
    AlertTriangle,
    Bell,
    Bookmark,
    Check,
    Globe as LucideGlobe,
    Heart as LucideHeart,
    Home,
    LoaderCircle,
    Mail,
    Minus as LucideMinus,
    Plus,
    Search as LucideSearch,
    Settings as LucideSettings,
    Shield as LucideShield,
    Slash,
    Sparkles as LucideSparkles,
    Star as LucideStar,
    User,
    X,
    Zap as LucideZap,
    Ban as LucideBan,
} from 'lucide-react';
import {
    Search as StudioSearch,
    Lightning as StudioLightning,
    HeartCircle as StudioHeartCircle,
    Figma as StudioFigma,
    Star as StudioStar,
    Cog as StudioCog,
} from '@mynaui/icons-react';
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
    IconLibrary,
    IconOptionId,
    MotionPresetId,
    PrimitiveAlign,
    PrimitiveSide,
    StyleableState,
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

function hexToRgbChannels(hex: string): { r: number; g: number; b: number } | null {
    const value = hex.replace('#', '');
    const normalized =
        value.length === 3
            ? value
                .split('')
                .map((char) => `${char}${char}`)
                .join('')
            : value;
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
        return null;
    }
    return {
        r: Number.parseInt(normalized.slice(0, 2), 16),
        g: Number.parseInt(normalized.slice(2, 4), 16),
        b: Number.parseInt(normalized.slice(4, 6), 16),
    };
}

function mixChannel(from: number, to: number, amount: number): number {
    return Math.round(from + (to - from) * Math.max(0, Math.min(1, amount)));
}

function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

function toLinearChannel(channel: number): number {
    const value = channel / 255;
    return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const r = toLinearChannel(rgb.r);
    const g = toLinearChannel(rgb.g);
    const b = toLinearChannel(rgb.b);
    return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
}

function contrastRatio(first: { r: number; g: number; b: number }, second: { r: number; g: number; b: number }): number {
    const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
    const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
    return (lighter + 0.05) / (darker + 0.05);
}

function averageRgb(
    first: { r: number; g: number; b: number },
    second: { r: number; g: number; b: number },
): { r: number; g: number; b: number } {
    return {
        r: Math.round((first.r + second.r) / 2),
        g: Math.round((first.g + second.g) / 2),
        b: Math.round((first.b + second.b) / 2),
    };
}

function resolveReadableFontColor(config: ComponentStyleConfig): string {
    const textRgb = hexToRgbChannels(config.fontColor);
    const fillRgb = hexToRgbChannels(config.fillColor);
    if (!textRgb || !fillRgb) {
        return config.fontColor;
    }

    // For mostly transparent fills, the canvas/background can dominate, so keep the user-selected color.
    if (!config.effectGlass && !config.effectGlassmorphism && config.fillOpacity < 55) {
        return config.fontColor;
    }

    const fillToRgb = config.fillMode === 'gradient' ? hexToRgbChannels(config.fillColorTo) : null;
    const effectiveFill = fillToRgb ? averageRgb(fillRgb, fillToRgb) : fillRgb;
    if (contrastRatio(textRgb, effectiveFill) >= 3.2) {
        return config.fontColor;
    }

    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };
    return contrastRatio(white, effectiveFill) >= contrastRatio(black, effectiveFill) ? '#ffffff' : '#000000';
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

const NEUMORPHIC_EFFECT_ENABLED = false;

export function supportsIconSelection(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].iconSelection;
}

export function supportsPanelStyle(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].panelStyle;
}

export function supportsDropdownHoverStyle(kind: UIComponentKind): boolean {
    return kind === 'dropdown';
}

export function supportsStateStyles(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].stateStyles;
}

export function getSupportedStates(kind: UIComponentKind): StyleableState[] {
    return INSPECTOR_REGISTRY[kind].supportedStates;
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

export function supportsGrainEffect(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].effects.grain;
}

export function supportsGradientBorderEffect(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].effects.gradientBorder;
}

export function supportsFrostedTintEffect(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].effects.frostedTint;
}

export function supportsRadialGlowEffect(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].effects.radialGlow;
}

export function supportsElevationShadowEffect(kind: UIComponentKind): boolean {
    return INSPECTOR_REGISTRY[kind].effects.elevationShadow;
}

export function supportsNeumorphicEffect(kind: UIComponentKind): boolean {
    return NEUMORPHIC_EFFECT_ENABLED && INSPECTOR_REGISTRY[kind].effects.neumorphic;
}

export function buildExtractedEffectsClassName(kind: UIComponentKind, style: ComponentStyleConfig): string | undefined {
    const classes: string[] = [];
    const animatedBorderActive = supportsAnimatedBorderEffect(kind) && style.effectAnimatedBorderEnabled;
    const gradientBorderActive = !animatedBorderActive && supportsGradientBorderEffect(kind) && style.effectGradientBorder;
    if (supportsGradientSlideEffect(kind) && style.effectGradientSlideEnabled) {
        classes.push(
            'ui-studio-effect-gradient-slide',
            `ui-studio-effect-gradient-slide-${style.effectGradientSlideDirection}`,
            style.effectGradientSlideFillMode === 'gradient'
                ? 'ui-studio-effect-gradient-slide-gradient'
                : 'ui-studio-effect-gradient-slide-solid',
        );
    }
    if (animatedBorderActive) {
        classes.push('ui-studio-effect-animated-border');
        const hasAnyAnimatedBorderState =
            style.effectAnimatedBorderStateDefault ||
            style.effectAnimatedBorderStateHover ||
            style.effectAnimatedBorderStateActive ||
            style.effectAnimatedBorderStateDisabled;
        if (!hasAnyAnimatedBorderState || style.effectAnimatedBorderStateDefault) {
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
    if (supportsGrainEffect(kind) && style.effectGrain) {
        classes.push('ui-studio-effect-grain');
    }
    if (supportsRadialGlowEffect(kind) && style.effectRadialGlow) {
        classes.push('ui-studio-effect-radial-glow');
    }
    // Gradient border and animated border both control layered background/border.
    // If both are enabled, prefer animated border to preserve motion feedback.
    if (gradientBorderActive) {
        classes.push('ui-studio-effect-gradient-border');
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

export function getIconComponent(icon: IconOptionId, library: IconLibrary = 'studio') {
    return getIconComponentForLibrary(icon, library);
}

function getIconComponentForLibrary(icon: IconOptionId, library: IconLibrary) {
    if (icon === 'none') {
        return null;
    }
    if (library === 'studio') {
        switch (icon) {
            case 'search':
                return StudioSearch;
            case 'lightning':
            case 'bolt':
                return StudioLightning;
            case 'heart':
                return StudioHeartCircle;
            case 'figma':
                return StudioFigma;
            case 'star':
                return StudioStar;
            case 'cog':
                return StudioCog;
            case 'spinner':
                return LoaderCircle;
            default:
                return null;
        }
    }
    if (library === 'lucide') {
        switch (icon) {
            case 'search':
                return LucideSearch;
            case 'lightning':
            case 'bolt':
                return LucideZap;
            case 'heart':
                return LucideHeart;
            case 'star':
                return LucideStar;
            case 'settings':
            case 'cog':
                return LucideSettings;
            case 'bell':
                return Bell;
            case 'user':
                return User;
            case 'mail':
                return Mail;
            case 'bookmark':
                return Bookmark;
            case 'globe':
                return LucideGlobe;
            case 'shield':
                return LucideShield;
            case 'sparkles':
                return LucideSparkles;
            case 'home':
                return Home;
            case 'plus':
                return Plus;
            case 'minus':
                return LucideMinus;
            case 'slash':
                return Slash;
            case 'ban':
                return LucideBan;
            case 'check':
                return Check;
            case 'x':
                return X;
            case 'spinner':
                return LoaderCircle;
            default:
                return null;
        }
    }
    return null;
}

export function renderConfiguredIcon(config: ComponentStyleConfig, className?: string) {
    const iconLibrary = config.iconLibrary ?? 'studio';
    if (config.icon === 'spinner') {
        return <LoaderCircle size={config.iconSize} className={cn('animate-spin', className)} />;
    }
    let IconComponent = getIconComponentForLibrary(config.icon, iconLibrary);
    if (!IconComponent && iconLibrary === 'custom') {
        // Custom-library icons are export-only; preview with a fallback icon.
        IconComponent = getIconComponentForLibrary(config.icon, 'lucide') ?? getIconComponentForLibrary(config.icon, 'studio');
    }
    if (!IconComponent) {
        return null;
    }
    return <IconComponent size={config.iconSize} className={className} />;
}

export function renderLoadingStateIcon(config: ComponentStyleConfig, kind: UIComponentKind): ReactNode {
    if (!config.effectLoadingActiveEnabled || kind === 'button' || kind === 'badge') {
        return null;
    }
    const isActivePreview = config.buttonPreviewState === 'active';
    if (!isActivePreview) {
        return null;
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
    const iconLibrary = config.iconLibrary ?? 'studio';
    if (iconLibrary === 'custom') {
        const customIconName = config.iconCustomName.trim();
        if (!customIconName) {
            return null;
        }
        return `<${customIconName} size={${config.iconSize}} />`;
    }
    if (iconLibrary === 'lucide') {
        switch (config.icon) {
            case 'search':
                return `<Search size={${config.iconSize}} />`;
            case 'lightning':
            case 'bolt':
                return `<Zap size={${config.iconSize}} />`;
            case 'heart':
                return `<Heart size={${config.iconSize}} />`;
            case 'star':
                return `<Star size={${config.iconSize}} />`;
            case 'settings':
            case 'cog':
                return `<Settings size={${config.iconSize}} />`;
            case 'bell':
                return `<Bell size={${config.iconSize}} />`;
            case 'user':
                return `<User size={${config.iconSize}} />`;
            case 'mail':
                return `<Mail size={${config.iconSize}} />`;
            case 'bookmark':
                return `<Bookmark size={${config.iconSize}} />`;
            case 'globe':
                return `<Globe size={${config.iconSize}} />`;
            case 'shield':
                return `<Shield size={${config.iconSize}} />`;
            case 'sparkles':
                return `<Sparkles size={${config.iconSize}} />`;
            case 'home':
                return `<Home size={${config.iconSize}} />`;
            case 'plus':
                return `<Plus size={${config.iconSize}} />`;
            case 'minus':
                return `<Minus size={${config.iconSize}} />`;
            case 'slash':
                return `<Slash size={${config.iconSize}} />`;
            case 'ban':
                return `<Ban size={${config.iconSize}} />`;
            case 'check':
                return `<Check size={${config.iconSize}} />`;
            case 'x':
                return `<X size={${config.iconSize}} />`;
            case 'spinner':
                return `<LoaderCircle size={${config.iconSize}} className="animate-spin" />`;
            default:
                return null;
        }
    }
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

function buildCommentBlock(value: string): string {
    const lines = value.trim().split('\n');
    return ['/*', ...lines.map((line) => ` * ${line}`), ' */'].join('\n');
}

function parseMotionSnippet(
    motionSnippet?: string,
): {
    declarations?: string;
    wrapperOpen?: string;
    wrapperClose?: string;
    supplemental?: string;
} {
    const trimmed = motionSnippet?.trim();
    if (!trimmed) {
        return {};
    }

    const marker = '// Wrap your component preview with motion';
    const markerIndex = trimmed.indexOf(marker);
    if (markerIndex === -1) {
        return { declarations: trimmed };
    }

    const declarations = trimmed.slice(0, markerIndex).trim();
    const wrapperSection = trimmed.slice(markerIndex + marker.length).trim();
    const placeholder = '{/* component */}';
    const wrapperOpenIndex = wrapperSection.indexOf('<motion.div');
    const placeholderIndex = wrapperSection.indexOf(placeholder);
    const wrapperCloseTag = '</motion.div>';
    const wrapperCloseIndex = wrapperSection.indexOf(wrapperCloseTag, placeholderIndex);

    if (wrapperOpenIndex === -1 || placeholderIndex === -1 || wrapperCloseIndex === -1) {
        return { declarations: trimmed };
    }

    return {
        declarations,
        wrapperOpen: wrapperSection.slice(wrapperOpenIndex, placeholderIndex).trimEnd(),
        wrapperClose: wrapperSection
            .slice(placeholderIndex + placeholder.length, wrapperCloseIndex + wrapperCloseTag.length)
            .trim(),
        supplemental: wrapperSection.slice(wrapperCloseIndex + wrapperCloseTag.length).trim(),
    };
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
    const parsedMotion = parseMotionSnippet(motionSnippet);

    if (jsxStartIndex === -1) {
        const body = baseSnippet.trim();
        if (body.length > 0) {
            sections.push(indentBlock(body, 2));
        }
        if (parsedMotion.declarations) {
            sections.push('', indentBlock(parsedMotion.declarations, 2));
        }
        if (parsedMotion.supplemental) {
            sections.push('', indentBlock(buildCommentBlock(parsedMotion.supplemental), 2));
        }
        sections.push('}');
    } else {
        const declarations = lines.slice(0, jsxStartIndex).join('\n').trim();
        const jsxExpression = lines.slice(jsxStartIndex).join('\n').trim();
        const wrappedJsxExpression =
            parsedMotion.wrapperOpen && parsedMotion.wrapperClose
                ? `${parsedMotion.wrapperOpen}\n${indentBlock(jsxExpression, 2)}\n${parsedMotion.wrapperClose}`
                : jsxExpression;

        if (declarations.length > 0) {
            sections.push(indentBlock(declarations, 2));
            sections.push('');
        }

        if (parsedMotion.declarations) {
            sections.push(indentBlock(parsedMotion.declarations, 2));
            sections.push('');
        }

        if (parsedMotion.supplemental) {
            sections.push(indentBlock(buildCommentBlock(parsedMotion.supplemental), 2));
            sections.push('');
        }

        sections.push('  return (');
        sections.push(indentBlock(wrappedJsxExpression, 4));
        sections.push('  );');
        sections.push('}');
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

function usesStrokeReplacementEffect(config: ComponentStyleConfig): boolean {
    return config.effectBorderBeamEnabled || config.effectShineBorderEnabled || config.effectPulseRingEnabled;
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
        fontFamily: config.fontFamily || undefined,
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
    if (config.effectElevationShadow) {
        shadowParts.push(buildElevationShadow(config.elevationLevel));
    }
    if (NEUMORPHIC_EFFECT_ENABLED && config.effectNeumorphic) {
        shadowParts.push(buildNeumorphicShadow(
            config.fillColor,
            config.neumorphicDistance,
            config.neumorphicBlur,
            config.neumorphicInset,
            config.neumorphicDarkOpacity,
            config.neumorphicLightOpacity,
            config.neumorphicIntensity,
        ));
    }

    const textAlign: CSSProperties['textAlign'] = config.fontPosition;
    const justifyContent = fontPositionToJustify(config.fontPosition);

    const blurValue = config.effectBlur ? config.blurAmount : 0;
    const glassmorphismActive = config.effectGlassmorphism;
    const glassBlur = config.effectGlass ? Math.max(config.blurAmount > 0 ? config.blurAmount : 12, 12) : 0;
    const backdropFilter =
        config.effectGlass || glassmorphismActive || blurValue > 0
            ? `blur(${Math.max(
                  glassBlur,
                  glassmorphismActive ? config.glassmorphismBlur : 0,
                  blurValue,
              )}px) saturate(${config.effectGlass || glassmorphismActive ? 160 : 100}%)`
            : undefined;
    const strokeReplacedByEffect = usesStrokeReplacementEffect(config);
    const effectiveBorderWidth = strokeReplacedByEffect ? 0 : config.strokeWeight;
    const effectiveBorderColor = strokeReplacedByEffect ? 'transparent' : borderColor;

    // Glass: use fill color at glassOpacity rather than hard-coding white.
    // This makes the blur visible over any canvas background.
    const glassTint = config.effectGlass
        ? hexToRgba(config.fillColor, config.glassOpacity / 100)
        : undefined;

    // Resolve background: glassmorphism overrides glass which overrides standard fill
    let resolvedBackground: string;
    if (glassmorphismActive) {
        resolvedBackground = hexToRgba(config.fillColor, config.glassmorphismOpacity / 100);
    } else if (config.effectGlass) {
        resolvedBackground = glassTint ?? background;
    } else {
        resolvedBackground = background;
    }

    // Frosted Tint: blend a colour wash over the resolved background
    if (config.effectFrostedTint) {
        const tint = hexToRgba(config.frostedTintColor, config.frostedTintOpacity / 100);
        resolvedBackground = resolvedBackground
            ? `linear-gradient(${tint}, ${tint}), ${resolvedBackground}`
            : tint;
    }

    // Radial Glow: add as a background layer behind fill
    if (config.effectRadialGlow) {
        const glowColor = hexToRgba(config.radialGlowColor, config.radialGlowOpacity / 100);
        const glowGradient = `radial-gradient(${config.radialGlowSize}% ${config.radialGlowSize}% at 50% 50%, ${glowColor} 0%, transparent 70%)`;
        resolvedBackground = resolvedBackground
            ? `${glowGradient}, ${resolvedBackground}`
            : glowGradient;
    }

    // Text shadow
    const textShadow = config.effectTextShadow
        ? `${config.textShadowX}px ${config.textShadowY}px ${config.textShadowBlur}px ${config.textShadowColor}`
        : undefined;

    const result: CSSProperties = {
        background: resolvedBackground,
        borderStyle: glassmorphismActive ? undefined : config.borderStyle,
        borderWidth: glassmorphismActive ? undefined : `${effectiveBorderWidth}px`,
        border: glassmorphismActive ? `1px solid rgba(255,255,255,${(config.glassmorphismBorderOpacity / 100).toFixed(3)})` : undefined,
        borderColor: glassmorphismActive ? undefined : effectiveBorderColor,
        borderRadius: `${config.cornerRadius}px`,
        color: fontColor,
        fontFamily: config.fontFamily || undefined,
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

    // Typography: bold / italic / underline
    if (config.fontBold) {
        result.fontWeight = 700;
    }
    if (config.fontItalic) {
        result.fontStyle = 'italic';
    }
    if (config.fontUnderline) {
        result.textDecoration = 'underline';
    }

    // Text shadow
    if (textShadow) {
        result.textShadow = textShadow;
    }

    return result;
}

/**
 * For components with internal styling (Progress, DataTable, etc.),
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
            if (fullStyle.fontFamily) kept.fontFamily = fullStyle.fontFamily;
            if (fullStyle.fontSize) kept.fontSize = fullStyle.fontSize;
            if (fullStyle.fontWeight) kept.fontWeight = fullStyle.fontWeight;
            if (fullStyle.fontStyle) kept.fontStyle = fullStyle.fontStyle;
            if (fullStyle.textAlign) kept.textAlign = fullStyle.textAlign;
            if (fullStyle.textDecoration) kept.textDecoration = fullStyle.textDecoration;
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
    if (fullStyle.fontFamily) result.fontFamily = fullStyle.fontFamily;
    if (fullStyle.fontSize) result.fontSize = fullStyle.fontSize;
    if (fullStyle.fontWeight) result.fontWeight = fullStyle.fontWeight;
    if (fullStyle.fontStyle) result.fontStyle = fullStyle.fontStyle;
    if (fullStyle.textDecoration) result.textDecoration = fullStyle.textDecoration;
    if (fullStyle.letterSpacing) result.letterSpacing = fullStyle.letterSpacing;
    if (fullStyle.lineHeight) result.lineHeight = fullStyle.lineHeight;
    if (fullStyle.textTransform) result.textTransform = fullStyle.textTransform;
    if (fullStyle.textShadow) result.textShadow = fullStyle.textShadow;
    return result;
}

const loadedFonts = new Set<string>();
export function loadGoogleFont(fontFamily: string): void {
    if (!fontFamily || loadedFonts.has(fontFamily)) return;
    loadedFonts.add(fontFamily);
    const encodedFamily = fontFamily.replace(/ /g, '+');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodedFamily}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap`;
    document.head.appendChild(link);
}

export function buildMotionVariables(config: ComponentStyleConfig): CSSProperties {
    const effectFillBase = buildStateFill(
        config.fillMode,
        config.fillColor,
        config.fillColorTo,
        config.fillWeight,
        config.fillOpacity,
    );
    return {
        ['--ui-motion-speed' as string]: `${config.motionSpeed}s`,
        ['--ui-motion-fill' as string]: hexToRgba(config.fillColor, Math.max(0.25, config.fillOpacity / 100)),
        ['--ui-effect-fill-base' as string]: effectFillBase,
        ['--ui-animated-border-fill' as string]: effectFillBase,
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
        ['--ui-effect-grain-opacity' as string]: `${Math.max(0, Math.min(100, config.grainOpacity)) / 100}`,
        ['--ui-effect-grain-size' as string]: `${config.grainSize}`,
        ['--ui-effect-grad-border-1' as string]: config.gradientBorderColor1,
        ['--ui-effect-grad-border-2' as string]: config.gradientBorderColor2,
        ['--ui-effect-grad-border-3' as string]: config.gradientBorderColor3,
        ['--ui-effect-grad-border-angle' as string]: `${config.gradientBorderAngle}deg`,
        ['--ui-effect-grad-border-width' as string]: `${Math.max(0, config.strokeWeight)}px`,
        ['--ui-effect-grad-border-fill' as string]: effectFillBase,
        ['--ui-effect-radial-glow-fill' as string]: effectFillBase,
        ['--ui-effect-radial-glow-color' as string]: hexToRgba(config.radialGlowColor, config.radialGlowOpacity / 100),
        ['--ui-effect-radial-glow-size' as string]: `${config.radialGlowSize}% ${config.radialGlowSize}%`,
        ['--ui-checkbox-selection-speed' as string]: `${config.checkboxSelectionAnimationSpeed}s`,
        ['--ui-slider-thumb-hover-scale' as string]: String(config.sliderThumbHoverScale),
        ['--ui-slider-thumb-tap-bounce' as string]: `${config.sliderThumbTapBounce}s`,
        ['--ui-slider-bar-fill-speed' as string]: `${config.sliderBarFillSpeed}s`,
        ['--ui-slider-bar-scale' as string]: String(config.sliderBarScale),
        ['--ui-slider-bar-bounce' as string]: `${config.sliderBarBounce}s`,
    } as CSSProperties;
}

/**
 * Build only the CSS variables that are actually needed by active effects/motions.
 * Prevents 40+ unused vars from bloating exported snippets.
 */
export function buildActiveMotionVariables(kind: UIComponentKind, config: ComponentStyleConfig): CSSProperties {
    const vars: Record<string, string> = {};
    const motionPreset = buildMotionClassName(kind, config.motionPreset);
    const effectFillBase = buildStateFill(
        config.fillMode,
        config.fillColor,
        config.fillColorTo,
        config.fillWeight,
        config.fillOpacity,
    );

    // Core motion speed — needed by shimmer, rainbow, and most effects
    const needsSpeed = motionPreset ||
        (supportsAnimatedBorderEffect(kind) && config.effectAnimatedBorderEnabled) ||
        (supportsBorderBeamEffect(kind) && config.effectBorderBeamEnabled) ||
        (supportsShineBorderEffect(kind) && config.effectShineBorderEnabled) ||
        (supportsNeonGlowEffect(kind) && config.effectNeonGlowEnabled) ||
        (supportsPulseRingEffect(kind) && config.effectPulseRingEnabled);
    if (needsSpeed) {
        vars['--ui-motion-speed'] = `${config.motionSpeed}s`;
        vars['--ui-motion-fill'] = hexToRgba(config.fillColor, Math.max(0.25, config.fillOpacity / 100));
    }

    if (
        (supportsAnimatedBorderEffect(kind) && config.effectAnimatedBorderEnabled) ||
        (supportsGradientBorderEffect(kind) && config.effectGradientBorder) ||
        (supportsRadialGlowEffect(kind) && config.effectRadialGlow)
    ) {
        vars['--ui-effect-fill-base'] = effectFillBase;
    }

    // Rainbow
    if (motionPreset === 'ui-studio-motion-rainbow') {
        vars['--ui-motion-rainbow-1'] = config.rainbowColor1;
        vars['--ui-motion-rainbow-2'] = config.rainbowColor2;
        vars['--ui-motion-rainbow-3'] = config.rainbowColor3;
        vars['--ui-motion-rainbow-4'] = config.rainbowColor4;
        vars['--ui-motion-rainbow-5'] = config.rainbowColor5;
    }

    // Shimmer
    if (motionPreset === 'ui-studio-motion-shimmer') {
        vars['--ui-motion-shimmer'] = hexToRgba(config.shimmerColor, 0.68);
    }

    // Gradient Slide
    if (supportsGradientSlideEffect(kind) && config.effectGradientSlideEnabled) {
        vars['--ui-motion-gradient-from'] = config.effectGradientSlideColor;
        vars['--ui-motion-gradient-to'] = config.effectGradientSlideColorTo;
        vars['--ui-effect-gs-speed'] = `${config.effectGradientSlideSpeed}s`;
    }

    // Animated Border
    if (supportsAnimatedBorderEffect(kind) && config.effectAnimatedBorderEnabled) {
        vars['--ui-effect-border-speed'] = `${config.effectAnimatedBorderSpeed}s`;
        vars['--ui-effect-border-width'] = `${Math.max(0, config.strokeWeight)}px`;
        vars['--ui-animated-border-fill'] = effectFillBase;
        vars['--ui-effect-border-1'] = config.effectAnimatedBorderColor1;
        vars['--ui-effect-border-2'] = config.effectAnimatedBorderColor2;
        vars['--ui-effect-border-3'] = config.effectAnimatedBorderColor3;
        vars['--ui-effect-border-4'] = config.effectAnimatedBorderColor4;
        vars['--ui-effect-border-5'] = config.effectAnimatedBorderColor5;
        vars['--ui-effect-border-count'] = String(Math.max(2, Math.min(5, config.effectAnimatedBorderColorCount)));
    }

    // Ripple Fill
    if (supportsRippleFillEffect(kind) && config.effectRippleFillEnabled) {
        vars['--ui-motion-ripple-color'] = config.effectRippleFillColor;
        vars['--ui-effect-ripple-speed'] = `${config.effectRippleFillSpeed}s`;
    }

    // Sweep
    if (supportsSweepEffect(kind) && config.effectSweepEnabled) {
        vars['--ui-effect-sweep-color'] = config.effectSweepColor;
        vars['--ui-effect-sweep-opacity'] = `${Math.max(0, Math.min(100, config.effectSweepOpacity)) / 100}`;
        vars['--ui-effect-sweep-width'] = `${Math.max(4, config.effectSweepWidth)}%`;
        vars['--ui-effect-sweep-speed'] = `${config.effectSweepSpeed}s`;
    }

    // Border Beam
    if (supportsBorderBeamEffect(kind) && config.effectBorderBeamEnabled) {
        vars['--ui-effect-beam-speed'] = `${config.effectBorderBeamSpeed}s`;
        vars['--ui-effect-beam-size'] = `${config.effectBorderBeamSize}px`;
        vars['--ui-effect-beam-width'] = `${Math.max(0, config.strokeWeight)}px`;
        vars['--ui-effect-beam-from'] = config.effectBorderBeamColorFrom;
        vars['--ui-effect-beam-to'] = config.effectBorderBeamColorTo;
    }

    // Shine Border
    if (supportsShineBorderEffect(kind) && config.effectShineBorderEnabled) {
        vars['--ui-effect-shine-speed'] = `${config.effectShineBorderSpeed}s`;
        vars['--ui-effect-shine-color'] = config.effectShineBorderColor;
        vars['--ui-effect-shine-width'] = `${Math.max(0, config.strokeWeight)}px`;
    }

    // Neon Glow
    if (supportsNeonGlowEffect(kind) && config.effectNeonGlowEnabled) {
        vars['--ui-effect-neon-speed'] = `${config.effectNeonGlowSpeed}s`;
        vars['--ui-effect-neon-color1'] = config.effectNeonGlowColor1;
        vars['--ui-effect-neon-color2'] = config.effectNeonGlowColor2;
        vars['--ui-effect-neon-size'] = `${config.effectNeonGlowSize}px`;
    }

    // Pulse Ring
    if (supportsPulseRingEffect(kind) && config.effectPulseRingEnabled) {
        vars['--ui-effect-pulse-speed'] = `${config.effectPulseRingSpeed}s`;
        vars['--ui-effect-pulse-width'] = `${Math.max(0, config.strokeWeight)}px`;
        vars['--ui-effect-pulse-color'] = config.effectPulseRingColor;
    }

    // Grain
    if (supportsGrainEffect(kind) && config.effectGrain) {
        vars['--ui-effect-grain-opacity'] = `${Math.max(0, Math.min(100, config.grainOpacity)) / 100}`;
        vars['--ui-effect-grain-size'] = `${config.grainSize}`;
    }

    // Gradient Border
    if (supportsGradientBorderEffect(kind) && config.effectGradientBorder) {
        vars['--ui-effect-grad-border-1'] = config.gradientBorderColor1;
        vars['--ui-effect-grad-border-2'] = config.gradientBorderColor2;
        vars['--ui-effect-grad-border-3'] = config.gradientBorderColor3;
        vars['--ui-effect-grad-border-angle'] = `${config.gradientBorderAngle}deg`;
        vars['--ui-effect-grad-border-width'] = `${Math.max(0, config.strokeWeight)}px`;
        vars['--ui-effect-grad-border-fill'] = effectFillBase;
    }

    if (supportsRadialGlowEffect(kind) && config.effectRadialGlow) {
        vars['--ui-effect-radial-glow-fill'] = effectFillBase;
        vars['--ui-effect-radial-glow-color'] = hexToRgba(config.radialGlowColor, config.radialGlowOpacity / 100);
        vars['--ui-effect-radial-glow-size'] = `${config.radialGlowSize}% ${config.radialGlowSize}%`;
    }

    // Checkbox/slider — only for those kinds
    if (kind === 'checkbox') {
        vars['--ui-checkbox-selection-speed'] = `${config.checkboxSelectionAnimationSpeed}s`;
    }
    if (kind === 'slider') {
        vars['--ui-slider-thumb-hover-scale'] = String(config.sliderThumbHoverScale);
        vars['--ui-slider-thumb-tap-bounce'] = `${config.sliderThumbTapBounce}s`;
        vars['--ui-slider-bar-fill-speed'] = `${config.sliderBarFillSpeed}s`;
        vars['--ui-slider-bar-scale'] = String(config.sliderBarScale);
        vars['--ui-slider-bar-bounce'] = `${config.sliderBarBounce}s`;
    }

    return vars as CSSProperties;
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

/**
 * Multi-layer elevation shadow — realistic depth via stacked shadows.
 * Levels 1–5 map to progressively deeper shadows (inspired by Material elevation).
 */
export function buildElevationShadow(level: number): string {
    const shadows: Record<number, string> = {
        1: '0 1px 2px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)',
        2: '0 2px 4px rgba(0,0,0,0.14), 0 4px 8px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.08)',
        3: '0 4px 8px rgba(0,0,0,0.16), 0 8px 16px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
        4: '0 8px 16px rgba(0,0,0,0.18), 0 16px 32px rgba(0,0,0,0.14), 0 4px 8px rgba(0,0,0,0.10)',
        5: '0 12px 24px rgba(0,0,0,0.22), 0 24px 48px rgba(0,0,0,0.18), 0 6px 12px rgba(0,0,0,0.12)',
    };
    return shadows[Math.max(1, Math.min(5, Math.round(level)))] ?? shadows[2];
}

/**
 * Neumorphic shadow — derives light/dark shadows from fillColor.
 * Returns a boxShadow value for inset (sunken) or outset (raised) appearance.
 */
export function buildNeumorphicShadow(
    fillColor: string,
    distance: number,
    blur: number,
    inset: boolean,
    darkOpacityPct = 42,
    lightOpacityPct = 30,
    intensityPct = 100,
): string {
    const d = Math.max(4, Math.min(20, distance));
    const b = Math.max(8, Math.min(40, blur));
    const base = hexToRgbChannels(fillColor) ?? { r: 100, g: 116, b: 139 };
    const luminance = (0.2126 * base.r + 0.7152 * base.g + 0.0722 * base.b) / 255;
    const darkSurface = luminance < 0.45;
    const normalizedIntensity = clamp01((((d - 4) / 16) + ((b - 8) / 32)) / 2);
    const minimumProfileBoost = d <= 6 && b <= 12 ? 1.18 : 1;
    const darkBandBoost = luminance >= 0.1 && luminance <= 0.22 ? 1.22 : 1;

    // Keep relief directional and compact (inspired by the reference 2-shadow system).
    const offset = Math.max(2, Math.round(d));
    const blurRadius = Math.max(2, Math.round((d + b) * 0.52));

    const highlight = {
        r: mixChannel(base.r, 255, darkSurface ? 0.4 : 0.86),
        g: mixChannel(base.g, 255, darkSurface ? 0.4 : 0.86),
        b: mixChannel(base.b, 255, darkSurface ? 0.4 : 0.86),
    };
    const shadow = {
        r: mixChannel(base.r, 0, darkSurface ? 0.78 : 0.52),
        g: mixChannel(base.g, 0, darkSurface ? 0.78 : 0.52),
        b: mixChannel(base.b, 0, darkSurface ? 0.78 : 0.52),
    };

    const userDarkOpacity = clamp01(darkOpacityPct / 100);
    const userLightOpacity = clamp01(lightOpacityPct / 100);
    const intensityMultiplier = Math.max(0, Math.min(2, intensityPct / 100));

    const shadowAlpha = clamp01(
        userDarkOpacity
            * (darkSurface ? 1.05 : 0.94)
            * (0.92 + normalizedIntensity * 0.26)
            * minimumProfileBoost
            * darkBandBoost
            * intensityMultiplier,
    );
    const highlightAlpha = clamp01(
        userLightOpacity
            * (darkSurface ? 1.18 : 0.9)
            * (0.9 + normalizedIntensity * 0.2)
            * minimumProfileBoost
            * darkBandBoost
            * intensityMultiplier,
    );

    const highlightShadow = `rgba(${highlight.r}, ${highlight.g}, ${highlight.b}, ${highlightAlpha})`;
    const darkShadow = `rgba(${shadow.r}, ${shadow.g}, ${shadow.b}, ${shadowAlpha})`;

    if (inset) {
        return [
            `inset ${offset}px ${offset}px ${blurRadius}px ${darkShadow}`,
            `inset -${offset}px -${offset}px ${blurRadius}px ${highlightShadow}`,
        ].join(', ');
    }

    return [
        `${offset}px ${offset}px ${blurRadius}px ${darkShadow}`,
        `-${offset}px -${offset}px ${blurRadius}px ${highlightShadow}`,
    ].join(', ');
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

export function sanitizeTokenVarName(tokenId: string): string {
    return tokenId
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'token';
}

const SEMANTIC_TOKEN_CSS_VARS: Record<string, string> = {
    background: '--background',
    foreground: '--foreground',
    primary: '--primary',
    secondary: '--secondary',
    accent: '--accent',
    muted: '--muted',
    border: '--border',
    input: '--input',
    ring: '--ring',
    success: '--success',
    warning: '--warning',
    info: '--info',
    destructive: '--destructive',
    'chart-1': '--chart-1',
    'chart-2': '--chart-2',
    'chart-3': '--chart-3',
};

export function inferTokenCssVar(token: StudioColorToken): string {
    if (token.cssVar) {
        return token.cssVar;
    }
    const normalized = sanitizeTokenVarName(token.id);
    return SEMANTIC_TOKEN_CSS_VARS[normalized] ?? `--ui-${normalized}`;
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

/** Standard Tailwind opacity steps */
const TAILWIND_OPACITY_STEPS = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100];

/**
 * Try to convert an rgba(...) value into a Tailwind `hex/opacity` pair.
 * Returns e.g. { hex: '#1f2937', opacity: 30 } or null if it can't snap.
 */
function tryRgbaToTailwindOpacity(value: string): { hex: string; opacity: number } | null {
    const match = value.match(
        /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([0-9.]+)\s*\)$/i,
    );
    if (!match) return null;

    const alpha = Number(match[4]);
    if (!Number.isFinite(alpha)) return null;

    // alpha=1 → full opacity, just use hex directly (no modifier needed)
    if (alpha >= 0.999) return null;

    const pct = alpha * 100;
    // Find nearest Tailwind step
    let nearest = TAILWIND_OPACITY_STEPS[0];
    let minDist = Math.abs(pct - nearest);
    for (const step of TAILWIND_OPACITY_STEPS) {
        const dist = Math.abs(pct - step);
        if (dist < minDist) {
            minDist = dist;
            nearest = step;
        }
    }
    // Only snap if within 2 percentage points
    if (minDist > 2) return null;

    const hex = rgbStringToHex(value);
    if (!hex) return null;

    return { hex, opacity: nearest };
}

export function buildTailwindStylePayload(
    style: CSSProperties,
    tokenSet?: StudioTokenSet,
): { classTokens: string[]; fallbackStyle: CSSProperties } {
    const classes: string[] = [];
    const fallbackStyle: CSSProperties = {};
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
            return `var(${inferTokenCssVar(token)})`;
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
                    const rgbaOp = tryRgbaToTailwindOpacity(resolved);
                    if (rgbaOp) {
                        classes.push(`bg-[${rgbaOp.hex}]/${rgbaOp.opacity}`);
                    } else {
                        fallbackStyle.background = rawValue as never;
                    }
                }
                break;
            }
            case 'color': {
                const resolved = resolveTokenVariable(value) ?? value;
                if (isTailwindColorClassCandidate(resolved)) {
                    classes.push(`text-[${toTailwindArbitraryValue(resolved)}]`);
                } else {
                    const rgbaOp = tryRgbaToTailwindOpacity(resolved);
                    if (rgbaOp) {
                        classes.push(`text-[${rgbaOp.hex}]/${rgbaOp.opacity}`);
                    } else {
                        fallbackStyle.color = rawValue as never;
                    }
                }
                break;
            }
            case 'borderColor': {
                const resolved = resolveTokenVariable(value) ?? value;
                if (isTailwindColorClassCandidate(resolved)) {
                    classes.push(`border-[${toTailwindArbitraryValue(resolved)}]`);
                } else {
                    const rgbaOp = tryRgbaToTailwindOpacity(resolved);
                    if (rgbaOp) {
                        classes.push(`border-[${rgbaOp.hex}]/${rgbaOp.opacity}`);
                    } else {
                        fallbackStyle.borderColor = rawValue as never;
                    }
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

    return {
        classTokens: Array.from(new Set(classes.filter(Boolean))),
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
    if (classNameParts.length === 1) {
        declarations.push(`const ${classNameVar} = ${classNameParts[0]};`);
    } else {
        declarations.push(`const ${classNameVar} = [${classNameParts.join(', ')}].filter(Boolean).join(' ');`);
    }
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

/** Remove default/unnecessary CSS properties from export output. */
export function filterDefaultProperties(style: CSSProperties): CSSProperties {
    const filtered = { ...style };

    // Remove internal transition (inspector smoothing, not user-configured)
    if (filtered.transition && String(filtered.transition).includes('180ms')) {
        delete filtered.transition;
    }

    // Remove border properties when border width is 0
    if (filtered.borderWidth === '0px' || filtered.borderWidth === '0' || filtered.borderWidth === 0) {
        delete filtered.borderStyle;
        delete filtered.borderColor;
        delete filtered.borderWidth;
    }

    // Remove undefined/null/empty values
    for (const [key, value] of Object.entries(filtered)) {
        if (value === undefined || value === null || value === '') {
            delete (filtered as Record<string, unknown>)[key];
        }
    }

    return filtered;
}

/** Build CSS rule blocks for hover/active/disabled state overrides.
 *  Returns an array of { selector, properties } entries.
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

export function buildPreviewPresentation(instance: ComponentInstance, forExport = false): { style: CSSProperties; motionClassName?: string } {
    const componentPreset = getComponentVisualPreset(instance.kind, instance.style.componentPreset);
    const extractedEffectsClassName = buildExtractedEffectsClassName(instance.kind, instance.style);
    const hasAnimatedBorderEffect = supportsAnimatedBorderEffect(instance.kind) && instance.style.effectAnimatedBorderEnabled;
    const hasGradientBorderEffect = !hasAnimatedBorderEffect && supportsGradientBorderEffect(instance.kind) && instance.style.effectGradientBorder;
    const hasRadialGlowEffect = supportsRadialGlowEffect(instance.kind) && instance.style.effectRadialGlow;

    // When previewing a non-default state (hover/active/disabled), resolve the
    // state overrides into the config so inline styles reflect the active state.
    // This avoids relying on CSS !important to override inline styles (which can
    // fail under Tailwind v4's CSS layer processing).
    const previewState = instance.style.buttonPreviewState;
    const resolvedConfig = previewState && previewState !== 'default' && instance.stateOverrides?.[previewState]
        ? { ...instance.style, ...instance.stateOverrides[previewState] }
        : instance.style;
    const previewStyle = buildPreviewStyle(resolvedConfig);

    // Badges need smaller sizing than buttons
    if (instance.kind === 'badge') {
        const scale = SIZE_SCALE[instance.style.size];
        if (instance.style.customHeight <= 0) {
            previewStyle.minHeight = `${Math.round(24 * scale)}px`;
        }
        previewStyle.paddingInline = `${Math.round(8 * scale)}px`;
    }

    // Checkbox sizing is handled directly in the preview render
    if (instance.kind === 'checkbox') {
        const scale = SIZE_SCALE[instance.style.size];
        previewStyle.minHeight = `${Math.round(22 * scale)}px`;
        previewStyle.paddingInline = '0px';
    }

    const motionVars = forExport
        ? buildActiveMotionVariables(instance.kind, instance.style)
        : buildMotionVariables(instance.style);

    // Dropdown hover CSS vars
    const hasDropdownVars = !forExport && supportsDropdownHoverStyle(instance.kind);

    const contextVars: Record<string, string | undefined> = {};
    if (hasDropdownVars) {
        contextVars['--ui-dropdown-hover-bg'] = hexToRgba(instance.style.dropdownHoverFill, instance.style.dropdownHoverFillOpacity / 100);
        contextVars['--ui-dropdown-hover-fg'] = instance.style.dropdownHoverText;
    }

    // State override CSS vars — derived from stateOverrides map
    const hasStateStyles = !forExport && supportsStateStyles(instance.kind);
    if (hasStateStyles) {
        const base = instance.style;
        const stateVarMap: Array<{ state: string; prefix: string }> = [
            { state: 'hover', prefix: '--ui-btn-hover' },
            { state: 'active', prefix: '--ui-btn-active' },
            { state: 'disabled', prefix: '--ui-btn-disabled' },
        ];
        for (const { state, prefix } of stateVarMap) {
            const overrides = instance.stateOverrides?.[state as keyof NonNullable<typeof instance.stateOverrides>];
            const s = { ...base, ...overrides };
            const stateUsesReplacement = usesStrokeReplacementEffect(s);
            contextVars[`${prefix}-bg`] = buildStateFill(s.fillMode, s.fillColor, s.fillColorTo, s.fillWeight, s.fillOpacity);
            contextVars[`${prefix}-fg`] = hexToRgba(s.fontColor, s.fontOpacity / 100);
            contextVars[`${prefix}-border`] = stateUsesReplacement ? 'transparent' : hexToRgba(s.strokeColor, s.strokeOpacity / 100);
            contextVars[`${prefix}-border-width`] = `${stateUsesReplacement ? 0 : s.strokeWeight}px`;
            contextVars[`${prefix}-font-size`] = `${Math.round(s.fontSize * SIZE_SCALE[s.size])}px`;
            contextVars[`${prefix}-font-weight`] = s.fontBold ? '700' : `${s.fontWeight}`;
            contextVars[`${prefix}-font-style`] = s.fontItalic ? 'italic' : 'normal';
            contextVars[`${prefix}-text-decoration`] = s.fontUnderline ? 'underline' : 'none';
            contextVars[`${prefix}-justify`] = fontPositionToJustify(s.fontPosition);
        }
    }

    const rawStyle = {
        ...previewStyle,
        ...motionVars,
        ...contextVars,
    } as CSSProperties;
    const baseStyle = forExport
        ? filterDefaultProperties(filterInternalVarsFromStyle(rawStyle))
        : rawStyle;
    const motionClassName = buildMotionClassName(instance.kind, instance.style.motionPreset);
    const className = cn(componentPreset?.className, motionClassName, extractedEffectsClassName);
    const shouldClearBackground = Boolean(motionClassName) || hasAnimatedBorderEffect || hasGradientBorderEffect || hasRadialGlowEffect;
    const shouldClearBorderColor = Boolean(motionClassName) || hasAnimatedBorderEffect || hasGradientBorderEffect;
    if (!shouldClearBackground && !shouldClearBorderColor) {
        return { style: baseStyle, motionClassName: className || undefined };
    }

    return {
        style: {
            ...baseStyle,
            // Motion/effect layers define their own visual background.
            ...(shouldClearBackground ? { background: undefined } : {}),
            ...(shouldClearBorderColor ? { borderColor: undefined } : {}),
        },
        motionClassName: className || undefined,
    };
}
