import type { CSSProperties } from 'react';
import type { ComponentInstance, ComponentStyleConfig, UIComponentKind } from '@/components/ui/ui-studio.types';
import type { StudioTokenSet } from '@/components/ui/token-sets';
import {
    buildExportComponentName,
    buildMotionClassName,
    buildPreviewPresentation,
    buildStateOverrideCSS,
    buildTailwindStateClasses,
    inferTokenCssVar,
    resolveTokenToHex,
    sanitizeFileSegment,
    sanitizeTokenVarName,
    supportsAnimatedBorderEffect,
    supportsBorderBeamEffect,
    supportsEntryMotion,
    supportsGradientBorderEffect,
    supportsGradientSlideEffect,
    supportsGrainEffect,
    supportsNeonGlowEffect,
    supportsPulseRingEffect,
    supportsRippleFillEffect,
    supportsShineBorderEffect,
    supportsSweepEffect,
    wrapSnippetInNamedComponent,
} from '../utilities';
import type { ExportStyleMode } from '../utilities';
import { buildMotionComponentSnippet } from '../motion';
import { componentSnippet } from '../preview';

// ─── Helpers ─────────────────────────────────────────────────────────────

function getStyleForMotionOutput(instance: ComponentInstance): ComponentStyleConfig {
    return supportsEntryMotion(instance.kind)
        ? instance.style
        : { ...instance.style, motionEntryEnabled: false };
}

const IMPORT_SOURCE_BY_IDENTIFIER: Record<string, string> = {
    Accordion: '@/components/ui/accordion',
    AccordionItem: '@/components/ui/accordion',
    AccordionTrigger: '@/components/ui/accordion',
    AccordionContent: '@/components/ui/accordion',
    Alert: '@/components/ui/alert',
    AlertAction: '@/components/ui/alert',
    AlertTitle: '@/components/ui/alert',
    AlertDescription: '@/components/ui/alert',
    AnimatedText: '@/components/ui/animated-text',
    Avatar: '@/components/ui/avatar',
    AvatarImage: '@/components/ui/avatar',
    AvatarFallback: '@/components/ui/avatar',
    AvatarGroup: '@/components/ui/avatar',
    AvatarGroupCount: '@/components/ui/avatar',
    Badge: '@/components/ui/badge',
    Button: '@/components/ui/button',
    Card: '@/components/ui/card',
    CardHeader: '@/components/ui/card',
    CardTitle: '@/components/ui/card',
    CardDescription: '@/components/ui/card',
    CardContent: '@/components/ui/card',
    CardFooter: '@/components/ui/card',
    Checkbox: '@/components/ui/checkbox',
    DataTable: '@/components/ui/data-table',
    Dialog: '@/components/ui/dialog',
    DialogTrigger: '@/components/ui/dialog',
    DialogHeader: '@/components/ui/dialog',
    DialogTitle: '@/components/ui/dialog',
    DialogDescription: '@/components/ui/dialog',
    DialogBody: '@/components/ui/dialog',
    DialogFooter: '@/components/ui/dialog',
    DialogClose: '@/components/ui/dialog',
    DialogCloseIcon: '@/components/ui/dialog',
    Drawer: '@/components/ui/drawer',
    DrawerTrigger: '@/components/ui/drawer',
    DrawerContent: '@/components/ui/drawer',
    DrawerHeader: '@/components/ui/drawer',
    DrawerTitle: '@/components/ui/drawer',
    DrawerDescription: '@/components/ui/drawer',
    DrawerClose: '@/components/ui/drawer',
    DropdownItem: '@/components/ui/dropdown',
    DropdownKeyboard: '@/components/ui/dropdown',
    DropdownLabel: '@/components/ui/dropdown',
    DropdownSeparator: '@/components/ui/dropdown',
    Input: '@/components/ui/input',
    Label: '@/components/ui/label',
    ListBox: 'react-aria-components',
    NavigationMenu: '@/components/ui/navigation-menu',
    NavigationMenuList: '@/components/ui/navigation-menu',
    NavigationMenuItem: '@/components/ui/navigation-menu',
    NavigationMenuTrigger: '@/components/ui/navigation-menu',
    NavigationMenuContent: '@/components/ui/navigation-menu',
    NavigationMenuLink: '@/components/ui/navigation-menu',
    Popover: '@/components/ui/popover',
    PopoverContent: '@/components/ui/popover',
    PopoverDescription: '@/components/ui/popover',
    PopoverHeader: '@/components/ui/popover',
    PopoverTitle: '@/components/ui/popover',
    PopoverTrigger: '@/components/ui/popover',
    Progress: '@/components/ui/progress',
    Slider: '@/components/ui/slider',
    StatefulButton: '@/components/ui/stateful-button',
    Switch: '@/components/ui/switch',
    Tabs: '@/components/ui/tabs',
    TabsContent: '@/components/ui/tabs',
    TabsList: '@/components/ui/tabs',
    TabsTrigger: '@/components/ui/tabs',
    Tooltip: '@/components/ui/tooltip',
    TooltipContent: '@/components/ui/tooltip',
    TooltipTrigger: '@/components/ui/tooltip',
    Ban: 'lucide-react',
    Bell: 'lucide-react',
    Bookmark: 'lucide-react',
    Check: 'lucide-react',
    ChevronRight: 'lucide-react',
    CircleAlert: 'lucide-react',
    CircleCheck: 'lucide-react',
    CircleX: 'lucide-react',
    Copy: 'lucide-react',
    Database: 'lucide-react',
    FileText: 'lucide-react',
    FolderOpen: 'lucide-react',
    Globe: 'lucide-react',
    Heart: 'lucide-react',
    Home: 'lucide-react',
    Lightbulb: 'lucide-react',
    Mail: 'lucide-react',
    MessageCircle: 'lucide-react',
    Minus: 'lucide-react',
    MoreVertical: 'lucide-react',
    Pencil: 'lucide-react',
    PhoneCall: 'lucide-react',
    Plus: 'lucide-react',
    RefreshCw: 'lucide-react',
    Search: 'lucide-react',
    Settings: 'lucide-react',
    Share: 'lucide-react',
    Shield: 'lucide-react',
    Slash: 'lucide-react',
    Sparkles: 'lucide-react',
    Star: 'lucide-react',
    Trash2: 'lucide-react',
    User: 'lucide-react',
    Users: 'lucide-react',
    X: 'lucide-react',
    Zap: 'lucide-react',
};

function buildNamedSnippetImports(snippet: string): string {
    const usedIdentifiers = new Set<string>();
    const identifierMatches = snippet.match(/\b[A-Z][A-Za-z0-9]*\b/g) ?? [];
    for (const identifier of identifierMatches) {
        if (IMPORT_SOURCE_BY_IDENTIFIER[identifier]) {
            usedIdentifiers.add(identifier);
        }
    }

    const importsBySource = new Map<string, Set<string>>();
    for (const identifier of usedIdentifiers) {
        const source = IMPORT_SOURCE_BY_IDENTIFIER[identifier];
        const existing = importsBySource.get(source) ?? new Set<string>();
        existing.add(identifier);
        importsBySource.set(source, existing);
    }

    const lines: string[] = [];
    const needsReactNamespace = snippet.includes('React.');
    const reactHooks = ['useRef'].filter((hook) => snippet.includes(`${hook}<`) || snippet.includes(`${hook}(`));
    if (needsReactNamespace || reactHooks.length > 0) {
        const parts: string[] = [];
        if (needsReactNamespace) {
            parts.push('React');
        }
        if (reactHooks.length > 0) {
            parts.push(`{ ${reactHooks.join(', ')} }`);
        }
        lines.push(`import ${parts.join(', ')} from 'react';`);
    }

    const motionMembers = ['motion', 'useMotionValue', 'useMotionTemplate', 'useSpring'].filter((member) =>
        snippet.includes(member),
    );
    if (motionMembers.length > 0) {
        lines.push(`import { ${motionMembers.join(', ')} } from 'motion/react';`);
    }

    const orderedSources = Array.from(importsBySource.keys()).sort();
    for (const source of orderedSources) {
        const names = Array.from(importsBySource.get(source) ?? []).sort();
        lines.push(`import { ${names.join(', ')} } from '${source}';`);
    }

    return lines.join('\n');
}

// ─── Instance Snippet Builders ───────────────────────────────────────────

export function buildSnippetForInstance(
    instance: ComponentInstance,
    exportStyleMode: ExportStyleMode,
    activeTokenSet: StudioTokenSet,
): string {
    const preview = buildPreviewPresentation(instance, true);
    const baseSnippet = componentSnippet(
        instance,
        preview.style,
        preview.motionClassName,
        exportStyleMode,
        activeTokenSet,
    );
    const motionSnippet = buildMotionComponentSnippet(getStyleForMotionOutput(instance));
    return motionSnippet ? `${baseSnippet}\n\n${motionSnippet}` : baseSnippet;
}

export function buildNamedSnippetForInstance(
    instance: ComponentInstance,
    exportStyleMode: ExportStyleMode,
    activeTokenSet: StudioTokenSet,
): string {
    const preview = buildPreviewPresentation(instance, true);
    const baseSnippet = componentSnippet(
        instance,
        preview.style,
        preview.motionClassName,
        exportStyleMode,
        activeTokenSet,
    );
    const namedSnippet = wrapSnippetInNamedComponent(
        baseSnippet,
        buildExportComponentName(instance),
        buildMotionComponentSnippet(getStyleForMotionOutput(instance)),
    );
    const importBlock = buildNamedSnippetImports(namedSnippet);
    return importBlock ? `${importBlock}\n\n${namedSnippet}` : namedSnippet;
}

// ─── CSS Export Builder ──────────────────────────────────────────────────

/** Convert React camelCase CSSProperties to kebab-case CSS declarations. */
function cssPropertiesToCSS(style: CSSProperties): Record<string, string> {
    const result: Record<string, string> = {};
    const camelToKebab = (s: string) =>
        s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`).replace(/^webkit-/, '-webkit-').replace(/^moz-/, '-moz-');

    for (const [key, value] of Object.entries(style)) {
        if (value === undefined || value === null || value === '') continue;
        // Skip any remaining internal CSS custom properties
        if (key.startsWith('--ui-')) continue;
        const cssKey = key.startsWith('--') ? key : camelToKebab(key);
        result[cssKey] = String(value);
    }
    return result;
}

/** Build a clean CSS class export for a component instance.
 *  Generates a named CSS class + pseudo-selector rules for state overrides. */
export function buildCSSExport(
    instance: ComponentInstance,
    activeTokenSet: StudioTokenSet,
): string {
    const presentation = buildPreviewPresentation(instance, true);
    const style = presentation.style;
    const className = `studio-${sanitizeFileSegment(instance.name || instance.kind)}`;

    const cssProps = cssPropertiesToCSS(style);
    const lines: string[] = [];
    lines.push(`/* CSS */`);
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

    // Usage hint
    const componentTag = instance.kind.charAt(0).toUpperCase() + instance.kind.slice(1).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    lines.push('');
    lines.push('/* Usage */');
    lines.push(`<${componentTag} className="${className}">`);
    lines.push(`  ${instance.name || instance.kind}`);
    lines.push(`</${componentTag}>`);


    return lines.join('\n');
}

// ─── Multi-Variant Bundle ────────────────────────────────────────────────

export function buildMultiVariantBundle(
    sourceInstances: ComponentInstance[],
    activeKind: UIComponentKind,
    exportStyleMode: ExportStyleMode,
    activeTokenSetId: string,
    tokenSets: StudioTokenSet[],
): string {
    const payload = {
        version: 1,
        type: 'ui-studio-design-bundle',
        componentKind: activeKind,
        exportStyleMode,
        activeTokenSetId,
        tokenSets: tokenSets.map((set) => ({
            id: set.id,
            name: set.name,
            source: set.source,
            tokens: set.tokens.map((token) => ({
                id: token.id,
                label: token.label,
                value: resolveTokenToHex(token) ?? token.value,
                cssVar: token.cssVar,
            })),
            sizeTokens: set.sizeTokens,
        })),
        components: sourceInstances.map((instance) => ({
            id: instance.id,
            name: instance.name,
            kind: instance.kind,
            style: instance.style,
        })),
    };

    return JSON.stringify(payload, null, 2);
}

// ─── Tailwind Theme CSS ──────────────────────────────────────────────────

export function buildTailwindThemeStyles(
    activeTokenSet: StudioTokenSet,
    instances: ComponentInstance[],
): string {
    const knownVarFallbacks: Record<string, string> = {
        '--background': '#ffffff',
        '--foreground': '#0f1419',
        '--primary': '#4daebc',
        '--secondary': '#f1f5f9',
        '--accent': '#e0f7fa',
        '--muted': '#f1f5f9',
        '--border': '#d8dee8',
        '--input': '#e2e8f0',
        '--ring': '#4daebc',
        '--success': '#10b981',
        '--warning': '#f59e0b',
        '--info': '#3b82f6',
        '--destructive': '#ef4444',
        '--chart-1': '#f97316',
        '--chart-2': '#06b6d4',
        '--chart-3': '#2563eb',
    };

    const buildVarLinesForSet = (set: StudioTokenSet): string[] => {
        const deduped = new Map<string, string>();
        for (const token of set.tokens) {
            const cssVar = inferTokenCssVar(token);
            const resolved =
                resolveTokenToHex(token) ??
                token.value ??
                knownVarFallbacks[cssVar] ??
                '#000000';
            deduped.set(cssVar, resolved);
        }
        return Array.from(deduped.entries()).map(([cssVar, value]) => `  ${cssVar}: ${value};`);
    };

    const activeVarLines = buildVarLinesForSet(activeTokenSet);
    const sizeLines = [
        `  --ui-size-sm-height: ${activeTokenSet.sizeTokens.sm.height}px;`,
        `  --ui-size-sm-width: ${(activeTokenSet.sizeTokens.sm.width ?? 0)}px;`,
        `  --ui-size-md-height: ${activeTokenSet.sizeTokens.md.height}px;`,
        `  --ui-size-md-width: ${(activeTokenSet.sizeTokens.md.width ?? 0)}px;`,
        `  --ui-size-lg-height: ${activeTokenSet.sizeTokens.lg.height}px;`,
        `  --ui-size-lg-width: ${(activeTokenSet.sizeTokens.lg.width ?? 0)}px;`,
    ];

    const themeInlineLines = activeTokenSet.tokens.map((token) => {
        const cssVar = inferTokenCssVar(token);
        return `  --color-${sanitizeTokenVarName(token.id)}: var(${cssVar});`;
    });

    const usesRainbowMotion = instances.some(
        (instance) => buildMotionClassName(instance.kind, instance.style.motionPreset) === 'ui-studio-motion-rainbow',
    );
    const usesShimmerMotion = instances.some(
        (instance) => buildMotionClassName(instance.kind, instance.style.motionPreset) === 'ui-studio-motion-shimmer',
    );
    const usesAnimatedBorderEffect = instances.some(
        (instance) => supportsAnimatedBorderEffect(instance.kind) && instance.style.effectAnimatedBorderEnabled,
    );
    const usesGradientSlideEffect = instances.some(
        (instance) => supportsGradientSlideEffect(instance.kind) && instance.style.effectGradientSlideEnabled,
    );
    const usesRippleFillEffect = instances.some(
        (instance) => supportsRippleFillEffect(instance.kind) && instance.style.effectRippleFillEnabled,
    );
    const usesSweepEffect = instances.some(
        (instance) => supportsSweepEffect(instance.kind) && instance.style.effectSweepEnabled,
    );
    const usesBorderBeamEffect = instances.some(
        (instance) => supportsBorderBeamEffect(instance.kind) && instance.style.effectBorderBeamEnabled,
    );
    const usesShineBorderEffect = instances.some(
        (instance) => supportsShineBorderEffect(instance.kind) && instance.style.effectShineBorderEnabled,
    );
    const usesNeonGlowEffect = instances.some(
        (instance) => supportsNeonGlowEffect(instance.kind) && instance.style.effectNeonGlowEnabled,
    );
    const usesPulseRingEffect = instances.some(
        (instance) => supportsPulseRingEffect(instance.kind) && instance.style.effectPulseRingEnabled,
    );
    const usesGrainEffect = instances.some(
        (instance) => supportsGrainEffect(instance.kind) && instance.style.effectGrain,
    );
    const usesGradientBorderEffect = instances.some(
        (instance) => supportsGradientBorderEffect(instance.kind) && instance.style.effectGradientBorder,
    );
    const usesAnimatedText = instances.some(
        (instance) => instance.kind === 'animated-text',
    );

    const motionUtilityBlocks: string[] = [];
    if (usesRainbowMotion) {
        motionUtilityBlocks.push(`  .ui-studio-motion-rainbow {
    position: relative;
    overflow: hidden;
    border-color: transparent !important;
    background-image:
      linear-gradient(var(--ui-motion-fill, rgba(17, 24, 39, 0.82)), var(--ui-motion-fill, rgba(17, 24, 39, 0.82))),
      linear-gradient(
        90deg,
        var(--ui-motion-rainbow-1, #22d3ee),
        var(--ui-motion-rainbow-2, #60a5fa),
        var(--ui-motion-rainbow-3, #a78bfa),
        var(--ui-motion-rainbow-4, #34d399),
        var(--ui-motion-rainbow-5, #f59e0b),
        var(--ui-motion-rainbow-1, #22d3ee)
      );
    background-origin: border-box;
    background-clip: padding-box, border-box;
    background-size: 100% 100%, 300% 100%;
    animation: ui-studio-rainbow-shift var(--ui-motion-speed, 2.8s) linear infinite;
  }`);
    }

    if (usesShimmerMotion) {
        motionUtilityBlocks.push(`  .ui-studio-motion-shimmer {
    position: relative;
    overflow: hidden;
    background-image: linear-gradient(
      110deg,
      var(--ui-motion-fill, rgba(18, 25, 40, 0.96)) 0%,
      var(--ui-motion-fill, rgba(18, 25, 40, 0.96)) 38%,
      var(--ui-motion-shimmer, rgba(255, 255, 255, 0.66)) 50%,
      var(--ui-motion-fill, rgba(18, 25, 40, 0.96)) 62%,
      var(--ui-motion-fill, rgba(18, 25, 40, 0.96)) 100%
    );
    background-size: 220% 100%;
    animation: ui-studio-shimmer-sweep var(--ui-motion-speed, 2.8s) linear infinite;
  }`);
    }

    if (usesGradientSlideEffect) {
        motionUtilityBlocks.push(`  .ui-studio-effect-gradient-slide {
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  .ui-studio-effect-gradient-slide::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    transition: transform var(--ui-effect-gs-speed, 0.32s) ease;
    z-index: 0;
  }

  .ui-studio-effect-gradient-slide > * {
    position: relative;
    z-index: 1;
  }

  .ui-studio-effect-gradient-slide-gradient::before {
    background: linear-gradient(135deg, var(--ui-motion-gradient-from, #f54900), var(--ui-motion-gradient-to, #ff8904));
  }

  .ui-studio-effect-gradient-slide-solid::before {
    background: var(--ui-motion-gradient-from, #f54900);
  }

  .ui-studio-effect-gradient-slide-left::before {
    transform: translateX(-100%);
  }

  .ui-studio-effect-gradient-slide-right::before {
    transform: translateX(100%);
  }

  .ui-studio-effect-gradient-slide-top::before {
    transform: translateY(-100%);
  }

  .ui-studio-effect-gradient-slide-bottom::before {
    transform: translateY(100%);
  }

  .ui-studio-effect-gradient-slide:hover::before {
    transform: translate(0, 0);
  }`);
    }

    if (usesAnimatedBorderEffect) {
        motionUtilityBlocks.push(`  .ui-studio-effect-animated-border {
    position: relative;
  }

  .ui-studio-effect-animated-border-state-default,
  .ui-studio-effect-animated-border-state-hover:hover,
  .ui-studio-effect-animated-border-state-active:active,
  .ui-studio-effect-animated-border-state-disabled:disabled,
  .ui-studio-effect-animated-border-state-disabled[data-disabled='true'],
  .ui-studio-effect-animated-border-state-disabled[aria-disabled='true'] {
    border-color: transparent !important;
    border-width: var(--ui-effect-border-width, 1px) !important;
    background:
      linear-gradient(var(--ui-animated-border-fill, var(--ui-motion-fill, rgba(17, 24, 39, 0.9))), var(--ui-animated-border-fill, var(--ui-motion-fill, rgba(17, 24, 39, 0.9)))),
      linear-gradient(
        90deg,
        var(--ui-effect-border-1, #22d3ee),
        var(--ui-effect-border-2, #60a5fa),
        var(--ui-effect-border-3, #a78bfa),
        var(--ui-effect-border-4, #34d399),
        var(--ui-effect-border-5, #f59e0b),
        var(--ui-effect-border-1, #22d3ee)
      ) !important;
    background-origin: border-box !important;
    background-clip: padding-box, border-box !important;
    background-size: 100% 100%, 300% 100% !important;
    animation: ui-studio-effect-border-spin var(--ui-effect-border-speed, 2.8s) linear infinite;
  }`);
    }

    if (usesRippleFillEffect) {
        motionUtilityBlocks.push(`  .ui-studio-effect-ripple-fill {
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  .ui-studio-effect-ripple-fill::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 12px;
    height: 12px;
    border-radius: 999px;
    transform: translate(-50%, -50%) scale(0);
    background: var(--ui-motion-ripple-color, #0f172a);
    opacity: 0.86;
    pointer-events: none;
    transition: transform var(--ui-effect-ripple-speed, 0.5s) ease;
    z-index: 0;
  }

  .ui-studio-effect-ripple-fill > * {
    position: relative;
    z-index: 1;
  }

  .ui-studio-effect-ripple-fill:hover::before {
    transform: translate(-50%, -50%) scale(34);
  }`);
    }

    if (usesSweepEffect) {
        motionUtilityBlocks.push(`  .ui-studio-effect-sweep {
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  .ui-studio-effect-sweep::after {
    content: '';
    position: absolute;
    top: -24%;
    left: calc(50% - (var(--ui-effect-sweep-width, 22%) / 2));
    width: var(--ui-effect-sweep-width, 22%);
    height: 148%;
    background: linear-gradient(
      100deg,
      rgba(255, 255, 255, 0) 0%,
      color-mix(in srgb, var(--ui-effect-sweep-color, #ffffff) 20%, transparent) 28%,
      color-mix(in srgb, var(--ui-effect-sweep-color, #ffffff) 88%, transparent) 50%,
      color-mix(in srgb, var(--ui-effect-sweep-color, #ffffff) 20%, transparent) 72%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: translate3d(-220%, 0, 0) skewX(-18deg);
    transform-origin: center;
    opacity: 0;
    filter: blur(8px);
    will-change: transform, opacity;
    backface-visibility: hidden;
    pointer-events: none;
    z-index: 0;
  }

  .ui-studio-effect-sweep > * {
    position: relative;
    z-index: 1;
  }

  .ui-studio-effect-sweep-state-default::after,
  .ui-studio-effect-sweep-state-hover:hover::after,
  .ui-studio-effect-sweep-state-active:active::after,
  .ui-studio-effect-sweep-state-disabled:disabled::after,
  .ui-studio-effect-sweep-state-disabled[data-disabled='true']::after,
  .ui-studio-effect-sweep-state-disabled[aria-disabled='true']::after {
    animation: ui-studio-effect-sweep-pass var(--ui-effect-sweep-speed, 1.6s) ease-in-out infinite;
  }`);
    }

    if (usesBorderBeamEffect) {
        motionUtilityBlocks.push(`  .ui-studio-effect-border-beam {
    position: relative;
    overflow: hidden;
    border-radius: inherit;
    border-color: transparent !important;
    border-width: 0 !important;
  }

  .ui-studio-effect-border-beam::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: conic-gradient(
      from calc(var(--ui-effect-beam-angle, 0deg)),
      transparent 0%,
      var(--ui-effect-beam-from, #22d3ee) 10%,
      var(--ui-effect-beam-to, #a78bfa) 20%,
      transparent 30%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    animation: ui-studio-effect-beam-rotate var(--ui-effect-beam-speed, 6s) linear infinite;
  }`);
    }

    if (usesShineBorderEffect) {
        motionUtilityBlocks.push(`  .ui-studio-effect-shine-border {
    position: relative;
    overflow: hidden;
    border-radius: inherit;
    border-color: transparent !important;
    border-width: 0 !important;
  }

  .ui-studio-effect-shine-border::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: var(--ui-effect-shine-width, 2px);
    background: conic-gradient(
      from calc(var(--ui-effect-shine-angle, 0deg) - 60deg),
      transparent 0%,
      var(--ui-effect-shine-color, #ffffff) 20%,
      transparent 40%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    animation: ui-studio-effect-shine-rotate var(--ui-effect-shine-speed, 4s) linear infinite;
  }`);
    }

    if (usesNeonGlowEffect) {
        motionUtilityBlocks.push(`  .ui-studio-effect-neon-glow {
    animation: ui-studio-effect-neon-pulse var(--ui-effect-neon-speed, 3s) ease-in-out infinite alternate;
  }`);
    }

    if (usesPulseRingEffect) {
        motionUtilityBlocks.push(`  .ui-studio-effect-pulse-ring {
    position: relative;
    overflow: visible !important;
    border-color: transparent !important;
    border-width: 0 !important;
  }

  .ui-studio-effect-pulse-ring::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: var(--ui-effect-pulse-width, 2px) solid var(--ui-effect-pulse-color, #22d3ee);
    pointer-events: none;
    animation: ui-studio-effect-pulse-expand var(--ui-effect-pulse-speed, 1.5s) ease-out infinite;
  }`);
    }

    if (usesGrainEffect) {
        motionUtilityBlocks.push(`  .ui-studio-effect-grain {
    position: relative;
    isolation: isolate;
  }

  .ui-studio-effect-grain::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: var(--ui-effect-grain-opacity, 0.18);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: calc(var(--ui-effect-grain-size, 120) * 1px) calc(var(--ui-effect-grain-size, 120) * 1px);
    mix-blend-mode: overlay;
    z-index: 1;
  }

  .ui-studio-effect-grain > * {
    position: relative;
    z-index: 2;
  }`);
    }

    if (usesGradientBorderEffect) {
        motionUtilityBlocks.push(`  .ui-studio-effect-gradient-border {
    border-color: transparent !important;
    background-image:
      linear-gradient(var(--ui-effect-grad-border-fill, #ffffff), var(--ui-effect-grad-border-fill, #ffffff)),
      linear-gradient(
        var(--ui-effect-grad-border-angle, 135deg),
        var(--ui-effect-grad-border-1, #22d3ee),
        var(--ui-effect-grad-border-2, #a78bfa),
        var(--ui-effect-grad-border-3, #f59e0b)
      ) !important;
    background-origin: border-box !important;
    background-clip: padding-box, border-box !important;
    border-width: var(--ui-effect-grad-border-width, 2px) !important;
    border-style: solid !important;
  }`);
    }

    const motionKeyframes: string[] = [];
    if (usesRainbowMotion) {
        motionKeyframes.push(`@keyframes ui-studio-rainbow-shift {
  0% { background-position: 0% 0%, 0% 0%; }
  100% { background-position: 0% 0%, 300% 0%; }
}`);
    }
    if (usesShimmerMotion) {
        motionKeyframes.push(`@keyframes ui-studio-shimmer-sweep {
  0% { background-position: 180% 0; }
  100% { background-position: -180% 0; }
}`);
    }
    if (usesAnimatedBorderEffect) {
        motionKeyframes.push(`@keyframes ui-studio-effect-border-spin {
  0% { background-position: 0 0, 0% 0; }
  100% { background-position: 0 0, 300% 0; }
}`);
    }
    if (usesSweepEffect) {
        motionKeyframes.push(`@keyframes ui-studio-effect-sweep-pass {
  0% { transform: translate3d(-220%, 0, 0) skewX(-18deg); opacity: 0; }
  22% { opacity: calc(var(--ui-effect-sweep-opacity, 0.4) * 0.72); }
  45% { opacity: var(--ui-effect-sweep-opacity, 0.4); }
  55% { opacity: var(--ui-effect-sweep-opacity, 0.4); }
  100% { transform: translate3d(220%, 0, 0) skewX(-18deg); opacity: 0; }
}`);
    }
    if (usesBorderBeamEffect) {
        motionKeyframes.push(`@keyframes ui-studio-effect-beam-rotate {
  0% { --ui-effect-beam-angle: 0deg; }
  100% { --ui-effect-beam-angle: 360deg; }
}

@property --ui-effect-beam-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}`);
    }
    if (usesShineBorderEffect) {
        motionKeyframes.push(`@keyframes ui-studio-effect-shine-rotate {
  0% { --ui-effect-shine-angle: 0deg; }
  100% { --ui-effect-shine-angle: 360deg; }
}

@property --ui-effect-shine-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}`);
    }
    if (usesNeonGlowEffect) {
        motionKeyframes.push(`@keyframes ui-studio-effect-neon-pulse {
  0% { box-shadow: 0 0 var(--ui-effect-neon-size, 16px) color-mix(in srgb, var(--ui-effect-neon-color1, #22d3ee) 60%, transparent); }
  100% { box-shadow: 0 0 var(--ui-effect-neon-size, 16px) color-mix(in srgb, var(--ui-effect-neon-color2, #a78bfa) 60%, transparent); }
}`);
    }
    if (usesPulseRingEffect) {
        motionKeyframes.push(`@keyframes ui-studio-effect-pulse-expand {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}`);
    }
    if (usesAnimatedText) {
        motionKeyframes.push(`@keyframes ui-studio-gradient-sweep {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes ui-studio-shiny-sweep {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}`);
    }

    return `@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
${[...activeVarLines, ...sizeLines].join('\n')}
}

/* Dark mode: customise these values for your dark theme */
.dark {
${activeVarLines.join('\n')}
}

@theme inline {
${themeInlineLines.join('\n')}
}

@layer utilities {
  .ui-studio-button-state:hover {
    background: var(--ui-btn-hover-bg) !important;
    --ui-animated-border-fill: var(--ui-btn-hover-bg);
    color: var(--ui-btn-hover-fg) !important;
    border-color: var(--ui-btn-hover-border) !important;
    border-width: var(--ui-btn-hover-border-width) !important;
    font-size: var(--ui-btn-hover-font-size) !important;
    font-weight: var(--ui-btn-hover-font-weight) !important;
    font-style: var(--ui-btn-hover-font-style) !important;
    text-decoration: var(--ui-btn-hover-text-decoration) !important;
    justify-content: var(--ui-btn-hover-justify) !important;
    border-style: solid !important;
  }

  .ui-studio-button-state:active {
    background: var(--ui-btn-active-bg) !important;
    --ui-animated-border-fill: var(--ui-btn-active-bg);
    color: var(--ui-btn-active-fg) !important;
    border-color: var(--ui-btn-active-border) !important;
    border-width: var(--ui-btn-active-border-width) !important;
    font-size: var(--ui-btn-active-font-size) !important;
    font-weight: var(--ui-btn-active-font-weight) !important;
    font-style: var(--ui-btn-active-font-style) !important;
    text-decoration: var(--ui-btn-active-text-decoration) !important;
    justify-content: var(--ui-btn-active-justify) !important;
    border-style: solid !important;
  }

  .ui-studio-button-state:disabled,
  .ui-studio-button-state[data-disabled='true'],
  .ui-studio-button-state[aria-disabled='true'] {
    background: var(--ui-btn-disabled-bg) !important;
    --ui-animated-border-fill: var(--ui-btn-disabled-bg);
    color: var(--ui-btn-disabled-fg) !important;
    border-color: var(--ui-btn-disabled-border) !important;
    border-width: var(--ui-btn-disabled-border-width) !important;
    font-size: var(--ui-btn-disabled-font-size) !important;
    font-weight: var(--ui-btn-disabled-font-weight) !important;
    font-style: var(--ui-btn-disabled-font-style) !important;
    text-decoration: var(--ui-btn-disabled-text-decoration) !important;
    justify-content: var(--ui-btn-disabled-justify) !important;
    border-style: solid !important;
    opacity: 1 !important;
  }

${motionUtilityBlocks.length > 0 ? `\n${motionUtilityBlocks.join('\n\n')}\n` : ''
}
${motionKeyframes.length > 0 ? `\n${motionKeyframes.join('\n\n')}\n` : ''}`;
}
