import type { StyleableState, UIComponentKind } from '@/components/ui/ui-studio.types';

// ─── Wrapper Style Strategies ────────────────────────────────────────────────
// Controls which CSS properties buildComponentWrapperStyle keeps/strips.

export type WrapperStyleStrategy =
    | 'full'                // Pass all styles through (button, badge, etc.)
    | 'typography-only'     // Only color/font/text props (animated-text)
    | 'shadow-only'         // Only boxShadow (switch)
    | 'minimal'             // Only borderRadius + boxShadow (avatar)
    | 'strip-border'        // Strip border/bg/padding, keep rest (accordion)
    | 'strip-structural'    // Strip border/bg/padding/dimensions (card)
    | 'strip-all'           // Strip border/bg/padding/dimensions/sizing (alert, progress, etc.)
    | 'strip-layout';       // Like strip-all but keeps width (navigation-menu)

// ─── Inspector Layout Types ─────────────────────────────────────────────────

export interface InspectorSections {
    presets: boolean;
    dimensions: boolean;
    componentConfig: string | false;   // false = none, string = section title
    appearance: boolean;               // Fill / Stroke color pickers
    typography: boolean;
    effects: boolean;
    advancedHover: boolean;
    motion: boolean;
}

export interface InspectorEffects {
    dropShadow: boolean;
    innerShadow: boolean;
    backgroundBlur: boolean;
    glassTint: boolean;
    gradientSlide: boolean;
    animatedBorder: boolean;
    rippleFill: boolean;
    loading: boolean;
    sweep: boolean;
    borderBeam: boolean;
    shineBorder: boolean;
    neonGlow: boolean;
    pulseRing: boolean;
}

export interface InspectorMotion {
    entryPresets: boolean;
    hoverEffects: boolean;
    tapEffects: boolean;
    stagger: boolean;
}

export interface InspectorLayout {
    sections: InspectorSections;
    effects: InspectorEffects;
    motion: InspectorMotion;
    wrapperStyle: WrapperStyleStrategy;
    iconSelection: boolean;
    panelStyle: boolean;
    stateStyles: boolean;
    supportedStates: StyleableState[];
    primitiveControls: boolean;
    motionPreset: boolean;          // rainbow/shimmer class preset
}

// ─── Default shapes for common patterns ─────────────────────────────────────

const NO_EFFECTS: InspectorEffects = {
    dropShadow: false, innerShadow: false, backgroundBlur: false, glassTint: false,
    gradientSlide: false, animatedBorder: false, rippleFill: false, loading: false,
    sweep: false, borderBeam: false, shineBorder: false, neonGlow: false, pulseRing: false,
};

const STANDARD_EFFECTS: InspectorEffects = {
    dropShadow: true, innerShadow: true, backgroundBlur: true, glassTint: true,
    gradientSlide: true, animatedBorder: true, rippleFill: true, loading: true,
    sweep: true, borderBeam: true, shineBorder: true, neonGlow: false, pulseRing: false,
};

const SURFACE_EFFECTS: InspectorEffects = {
    dropShadow: true, innerShadow: true, backgroundBlur: true, glassTint: true,
    gradientSlide: false, animatedBorder: true, rippleFill: false, loading: false,
    sweep: false, borderBeam: true, shineBorder: true, neonGlow: true, pulseRing: false,
};

const NO_MOTION: InspectorMotion = {
    entryPresets: false, hoverEffects: false, tapEffects: false, stagger: false,
};

const FULL_MOTION: InspectorMotion = {
    entryPresets: true, hoverEffects: true, tapEffects: true, stagger: false,
};

// ─── Registry ───────────────────────────────────────────────────────────────

export const INSPECTOR_REGISTRY: Record<UIComponentKind, InspectorLayout> = {
    // ── Interactive primitives ──────────────────────────────────────────────
    button: {
        sections: { presets: true, dimensions: true, componentConfig: false, appearance: true, typography: true, effects: true, advancedHover: false, motion: true },
        effects: { ...STANDARD_EFFECTS, neonGlow: false, pulseRing: true },
        motion: FULL_MOTION,
        wrapperStyle: 'full',
        iconSelection: true, panelStyle: false, stateStyles: true, supportedStates: ['hover', 'active', 'disabled'], primitiveControls: false, motionPreset: true,
    },
    badge: {
        sections: { presets: true, dimensions: true, componentConfig: false, appearance: true, typography: true, effects: true, advancedHover: false, motion: true },
        effects: { ...STANDARD_EFFECTS, neonGlow: false, pulseRing: true, loading: false },
        motion: FULL_MOTION,
        wrapperStyle: 'full',
        iconSelection: true, panelStyle: false, stateStyles: true, supportedStates: ['hover', 'active'], primitiveControls: false, motionPreset: true,
    },
    input: {
        sections: { presets: true, dimensions: true, componentConfig: 'Input Config', appearance: true, typography: true, effects: true, advancedHover: false, motion: true },
        effects: { ...STANDARD_EFFECTS, neonGlow: false, pulseRing: false },
        motion: FULL_MOTION,
        wrapperStyle: 'full',
        iconSelection: false, panelStyle: false, stateStyles: true, supportedStates: ['hover', 'focus', 'disabled'], primitiveControls: false, motionPreset: false,
    },
    checkbox: {
        sections: { presets: true, dimensions: true, componentConfig: 'Checkbox Config', appearance: false, typography: true, effects: false, advancedHover: false, motion: true },
        effects: NO_EFFECTS,
        motion: FULL_MOTION,
        wrapperStyle: 'full',
        iconSelection: false, panelStyle: false, stateStyles: true, supportedStates: ['hover', 'disabled'], primitiveControls: false, motionPreset: false,
    },
    slider: {
        sections: { presets: true, dimensions: true, componentConfig: false, appearance: true, typography: false, effects: true, advancedHover: false, motion: true },
        effects: { ...NO_EFFECTS, dropShadow: true, innerShadow: true, backgroundBlur: true, glassTint: true },
        motion: FULL_MOTION,
        wrapperStyle: 'full',
        iconSelection: false, panelStyle: false, stateStyles: true, supportedStates: ['hover', 'disabled'], primitiveControls: false, motionPreset: false,
    },
    switch: {
        sections: { presets: true, dimensions: false, componentConfig: 'Switch Config', appearance: false, typography: false, effects: false, advancedHover: false, motion: true },
        effects: NO_EFFECTS,
        motion: { entryPresets: false, hoverEffects: true, tapEffects: true, stagger: false },
        wrapperStyle: 'shadow-only',
        iconSelection: false, panelStyle: false, stateStyles: true, supportedStates: ['hover', 'disabled'], primitiveControls: false, motionPreset: false,
    },

    // ── Surface / panel components ──────────────────────────────────────────
    card: {
        sections: { presets: true, dimensions: true, componentConfig: 'Card Config', appearance: true, typography: true, effects: true, advancedHover: true, motion: true },
        effects: {
            dropShadow: true, innerShadow: true, backgroundBlur: true, glassTint: true,
            gradientSlide: true, animatedBorder: true, rippleFill: false, loading: false,
            sweep: true, borderBeam: false, shineBorder: false, neonGlow: true, pulseRing: false,
        },
        motion: FULL_MOTION,
        wrapperStyle: 'strip-structural',
        iconSelection: true, panelStyle: false, stateStyles: true, supportedStates: ['hover'], primitiveControls: false, motionPreset: false,
    },
    'product-card': {
        sections: { presets: true, dimensions: true, componentConfig: 'Product Card Config', appearance: true, typography: true, effects: true, advancedHover: true, motion: true },
        effects: {
            dropShadow: true, innerShadow: true, backgroundBlur: true, glassTint: true,
            gradientSlide: true, animatedBorder: true, rippleFill: false, loading: false,
            sweep: true, borderBeam: false, shineBorder: false, neonGlow: true, pulseRing: false,
        },
        motion: FULL_MOTION,
        wrapperStyle: 'strip-structural',
        iconSelection: true, panelStyle: false, stateStyles: true, supportedStates: ['hover'], primitiveControls: false, motionPreset: false,
    },
    'listing-card': {
        sections: { presets: true, dimensions: true, componentConfig: 'Listing Card Config', appearance: true, typography: true, effects: true, advancedHover: true, motion: true },
        effects: {
            dropShadow: true, innerShadow: true, backgroundBlur: true, glassTint: true,
            gradientSlide: true, animatedBorder: true, rippleFill: false, loading: false,
            sweep: true, borderBeam: false, shineBorder: false, neonGlow: true, pulseRing: false,
        },
        motion: FULL_MOTION,
        wrapperStyle: 'strip-structural',
        iconSelection: true, panelStyle: false, stateStyles: true, supportedStates: ['hover'], primitiveControls: false, motionPreset: false,
    },
    dialog: {
        sections: { presets: true, dimensions: true, componentConfig: false, appearance: true, typography: true, effects: true, advancedHover: false, motion: true },
        effects: { ...SURFACE_EFFECTS },
        motion: { entryPresets: true, hoverEffects: false, tapEffects: false, stagger: false },
        wrapperStyle: 'full',
        iconSelection: false, panelStyle: true, stateStyles: true, supportedStates: ['hover', 'active', 'disabled'], primitiveControls: true, motionPreset: false,
    },
    drawer: {
        sections: { presets: true, dimensions: true, componentConfig: 'Drawer Config', appearance: true, typography: true, effects: true, advancedHover: false, motion: true },
        effects: { ...SURFACE_EFFECTS },
        motion: { entryPresets: true, hoverEffects: false, tapEffects: false, stagger: false },
        wrapperStyle: 'full',
        iconSelection: true, panelStyle: true, stateStyles: true, supportedStates: ['hover', 'active', 'disabled'], primitiveControls: false, motionPreset: false,
    },
    dropdown: {
        sections: { presets: true, dimensions: true, componentConfig: 'Dropdown Config', appearance: true, typography: true, effects: true, advancedHover: false, motion: true },
        effects: { ...SURFACE_EFFECTS },
        motion: { entryPresets: true, hoverEffects: false, tapEffects: false, stagger: false },
        wrapperStyle: 'full',
        iconSelection: true, panelStyle: true, stateStyles: true, supportedStates: ['hover', 'active', 'disabled'], primitiveControls: true, motionPreset: false,
    },
    popover: {
        sections: { presets: true, dimensions: true, componentConfig: 'Popover Config', appearance: true, typography: true, effects: true, advancedHover: false, motion: true },
        effects: { ...SURFACE_EFFECTS },
        motion: { entryPresets: true, hoverEffects: false, tapEffects: false, stagger: false },
        wrapperStyle: 'full',
        iconSelection: true, panelStyle: true, stateStyles: true, supportedStates: ['hover', 'active', 'disabled'], primitiveControls: false, motionPreset: false,
    },
    tooltip: {
        sections: { presets: true, dimensions: true, componentConfig: false, appearance: true, typography: true, effects: true, advancedHover: false, motion: true },
        effects: { ...SURFACE_EFFECTS },
        motion: { entryPresets: true, hoverEffects: false, tapEffects: false, stagger: false },
        wrapperStyle: 'full',
        iconSelection: true, panelStyle: true, stateStyles: true, supportedStates: ['hover', 'active', 'disabled'], primitiveControls: true, motionPreset: false,
    },

    // ── Structured / data components ────────────────────────────────────────
    accordion: {
        sections: { presets: true, dimensions: false, componentConfig: 'Accordion Config', appearance: false, typography: false, effects: true, advancedHover: false, motion: true },
        effects: {
            dropShadow: true, innerShadow: true, backgroundBlur: true, glassTint: true,
            gradientSlide: true, animatedBorder: true, rippleFill: false, loading: false,
            sweep: true, borderBeam: true, shineBorder: true, neonGlow: true, pulseRing: false,
        },
        motion: { entryPresets: true, hoverEffects: true, tapEffects: true, stagger: true },
        wrapperStyle: 'strip-border',
        iconSelection: false, panelStyle: false, stateStyles: false, supportedStates: [], primitiveControls: false, motionPreset: false,
    },
    tabs: {
        sections: { presets: true, dimensions: false, componentConfig: 'Tabs Config', appearance: false, typography: true, effects: true, advancedHover: false, motion: true },
        effects: {
            dropShadow: true, innerShadow: true, backgroundBlur: true, glassTint: true,
            gradientSlide: true, animatedBorder: true, rippleFill: true, loading: false,
            sweep: false, borderBeam: true, shineBorder: true, neonGlow: false, pulseRing: false,
        },
        motion: FULL_MOTION,
        wrapperStyle: 'full',
        iconSelection: true, panelStyle: false, stateStyles: true, supportedStates: ['hover', 'active'], primitiveControls: false, motionPreset: false,
    },
    'data-table': {
        sections: { presets: true, dimensions: false, componentConfig: 'Table Config', appearance: false, typography: true, effects: true, advancedHover: false, motion: true },
        effects: { ...NO_EFFECTS, dropShadow: true, innerShadow: true, backgroundBlur: true, glassTint: true },
        motion: { entryPresets: true, hoverEffects: false, tapEffects: false, stagger: false },
        wrapperStyle: 'strip-all',
        iconSelection: false, panelStyle: false, stateStyles: false, supportedStates: [], primitiveControls: false, motionPreset: false,
    },
    'navigation-menu': {
        sections: { presets: true, dimensions: false, componentConfig: 'Nav Menu Config', appearance: false, typography: true, effects: true, advancedHover: false, motion: true },
        effects: {
            dropShadow: true, innerShadow: true, backgroundBlur: true, glassTint: true,
            gradientSlide: false, animatedBorder: true, rippleFill: false, loading: false,
            sweep: false, borderBeam: false, shineBorder: false, neonGlow: false, pulseRing: false,
        },
        motion: { entryPresets: true, hoverEffects: true, tapEffects: true, stagger: true },
        wrapperStyle: 'strip-layout',
        iconSelection: false, panelStyle: false, stateStyles: false, supportedStates: [], primitiveControls: false, motionPreset: false,
    },

    // ── Display / feedback components ───────────────────────────────────────
    alert: {
        sections: { presets: true, dimensions: false, componentConfig: 'Alert Config', appearance: true, typography: true, effects: true, advancedHover: false, motion: true },
        effects: {
            dropShadow: true, innerShadow: true, backgroundBlur: true, glassTint: true,
            gradientSlide: true, animatedBorder: true, rippleFill: false, loading: false,
            sweep: true, borderBeam: true, shineBorder: true, neonGlow: true, pulseRing: false,
        },
        motion: { entryPresets: true, hoverEffects: true, tapEffects: true, stagger: false },
        wrapperStyle: 'full',
        iconSelection: true, panelStyle: false, stateStyles: true, supportedStates: ['hover'], primitiveControls: false, motionPreset: false,
    },
    avatar: {
        sections: { presets: true, dimensions: false, componentConfig: 'Avatar Config', appearance: false, typography: false, effects: false, advancedHover: false, motion: true },
        effects: NO_EFFECTS,
        motion: FULL_MOTION,
        wrapperStyle: 'minimal',
        iconSelection: false, panelStyle: false, stateStyles: false, supportedStates: [], primitiveControls: false, motionPreset: false,
    },
    'avatar-group': {
        sections: { presets: true, dimensions: false, componentConfig: 'Avatar Group Config', appearance: false, typography: false, effects: false, advancedHover: false, motion: true },
        effects: NO_EFFECTS,
        motion: FULL_MOTION,
        wrapperStyle: 'minimal',
        iconSelection: false, panelStyle: false, stateStyles: false, supportedStates: [], primitiveControls: false, motionPreset: false,
    },
    progress: {
        sections: { presets: true, dimensions: false, componentConfig: 'Progress Config', appearance: false, typography: true, effects: true, advancedHover: false, motion: true },
        effects: { ...NO_EFFECTS, dropShadow: true, innerShadow: true, backgroundBlur: true, glassTint: true },
        motion: { entryPresets: true, hoverEffects: false, tapEffects: false, stagger: false },
        wrapperStyle: 'strip-all',
        iconSelection: false, panelStyle: false, stateStyles: false, supportedStates: [], primitiveControls: false, motionPreset: false,
    },
    // ── Text animation ──────────────────────────────────────────────────────
    'animated-text': {
        sections: { presets: true, dimensions: false, componentConfig: false, appearance: false, typography: true, effects: false, advancedHover: false, motion: false },
        effects: NO_EFFECTS,
        motion: NO_MOTION,
        wrapperStyle: 'typography-only',
        iconSelection: false, panelStyle: false, stateStyles: false, supportedStates: [], primitiveControls: false, motionPreset: false,
    },
};

// ─── Lookup helper ──────────────────────────────────────────────────────────

export function getInspectorLayout(kind: UIComponentKind): InspectorLayout {
    return INSPECTOR_REGISTRY[kind];
}
