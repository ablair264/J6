import type { ComponentInstance, ComponentStyleConfig, UIComponentKind } from '@/components/ui/ui-studio.types';
import type { StudioColorToken, StudioTokenSet } from '@/components/ui/token-sets';
import {
    buildExportComponentName,
    buildMotionClassName,
    buildPreviewPresentation,
    resolveTokenToHex,
    supportsAnimatedBorderEffect,
    supportsEntryMotion,
    supportsGradientSlideEffect,
    supportsRippleFillEffect,
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

// ─── Instance Snippet Builders ───────────────────────────────────────────

export function buildSnippetForInstance(
    instance: ComponentInstance,
    exportStyleMode: ExportStyleMode,
    activeTokenSet: StudioTokenSet,
): string {
    const preview = buildPreviewPresentation(instance);
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
    const preview = buildPreviewPresentation(instance);
    const baseSnippet = componentSnippet(
        instance,
        preview.style,
        preview.motionClassName,
        exportStyleMode,
        activeTokenSet,
    );
    return wrapSnippetInNamedComponent(
        baseSnippet,
        buildExportComponentName(instance),
        buildMotionComponentSnippet(getStyleForMotionOutput(instance)),
    );
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
                value: resolveTokenToHex(token) ?? token.value ?? '#000000',
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
    tokenSets: StudioTokenSet[],
    instances: ComponentInstance[],
): string {
    const sanitizeTokenVarName = (tokenId: string): string =>
        tokenId
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

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
    };

    const inferCssVar = (token: StudioColorToken): string => {
        if (token.cssVar) {
            return token.cssVar;
        }
        const normalized = sanitizeTokenVarName(token.id);
        const semanticVars: Record<string, string> = {
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
        };
        return semanticVars[normalized] ?? `--ui-${normalized}`;
    };

    const buildVarLinesForSet = (set: StudioTokenSet): string[] => {
        const deduped = new Map<string, string>();
        for (const token of set.tokens) {
            const cssVar = inferCssVar(token);
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
        const cssVar = inferCssVar(token);
        return `  --color-${sanitizeTokenVarName(token.id)}: var(${cssVar});`;
    });

    const additionalThemeBlocks = tokenSets
        .filter((set) => set.id !== activeTokenSet.id)
        .map((set) => {
            const selector = `[data-ui-theme='${set.id.replace(/'/g, "\\'")}']`;
            return `${selector} {\n${buildVarLinesForSet(set).join('\n')}\n}`;
        })
        .join('\n\n');

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
    top: -8%;
    left: calc(50% - (var(--ui-effect-sweep-width, 22%) / 2));
    width: var(--ui-effect-sweep-width, 22%);
    height: 116%;
    background: linear-gradient(
      100deg,
      rgba(255, 255, 255, 0) 0%,
      color-mix(in srgb, var(--ui-effect-sweep-color, #ffffff) 82%, transparent) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    opacity: 0;
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
  0% { transform: translateX(-160%); opacity: 0; }
  20% { opacity: var(--ui-effect-sweep-opacity, 0.4); }
  100% { transform: translateX(160%); opacity: 0; }
}`);
    }

    return `@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
${[...activeVarLines, ...sizeLines].join('\n')}
}

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
    justify-content: var(--ui-btn-disabled-justify) !important;
    border-style: solid !important;
    opacity: 1 !important;
  }

  .ui-studio-button-preview-hover {
    background: var(--ui-btn-hover-bg) !important;
    --ui-animated-border-fill: var(--ui-btn-hover-bg);
    color: var(--ui-btn-hover-fg) !important;
    border-color: var(--ui-btn-hover-border) !important;
    border-width: var(--ui-btn-hover-border-width) !important;
    font-size: var(--ui-btn-hover-font-size) !important;
    font-weight: var(--ui-btn-hover-font-weight) !important;
    justify-content: var(--ui-btn-hover-justify) !important;
    border-style: solid !important;
  }

  .ui-studio-button-preview-active {
    background: var(--ui-btn-active-bg) !important;
    --ui-animated-border-fill: var(--ui-btn-active-bg);
    color: var(--ui-btn-active-fg) !important;
    border-color: var(--ui-btn-active-border) !important;
    border-width: var(--ui-btn-active-border-width) !important;
    font-size: var(--ui-btn-active-font-size) !important;
    font-weight: var(--ui-btn-active-font-weight) !important;
    justify-content: var(--ui-btn-active-justify) !important;
    border-style: solid !important;
  }

  .ui-studio-button-preview-disabled {
    background: var(--ui-btn-disabled-bg) !important;
    --ui-animated-border-fill: var(--ui-btn-disabled-bg);
    color: var(--ui-btn-disabled-fg) !important;
    border-color: var(--ui-btn-disabled-border) !important;
    border-width: var(--ui-btn-disabled-border-width) !important;
    font-size: var(--ui-btn-disabled-font-size) !important;
    font-weight: var(--ui-btn-disabled-font-weight) !important;
    justify-content: var(--ui-btn-disabled-justify) !important;
    border-style: solid !important;
    opacity: 1 !important;
  }
${motionUtilityBlocks.length > 0 ? `\n${motionUtilityBlocks.join('\n\n')}\n` : ''}
}
${motionKeyframes.length > 0 ? `\n${motionKeyframes.join('\n\n')}\n` : ''}
${additionalThemeBlocks ? `\n/* Optional alternate saved token sets */\n${additionalThemeBlocks}\n` : ''}`;
}
