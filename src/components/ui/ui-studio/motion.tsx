import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { normalizeStyleConfig, MOTION_COMPONENT_PRESETS, SURFACE_MOTION_PRESET_IDS } from './constants';
import type { ComponentStyleConfig, UIComponentKind } from '@/components/ui/ui-studio.types';

export type MotionTransitionScope = 'entry' | 'hover' | 'tap';

export function getMotionTransitionValues(config: ComponentStyleConfig, scope: MotionTransitionScope) {
    if (scope === 'hover') {
        return {
            transitionType: config.motionHoverTransitionType,
            ease: config.motionHoverEase,
            duration: config.motionHoverDuration,
            delay: config.motionHoverDelay,
            stiffness: config.motionHoverStiffness,
            damping: config.motionHoverDamping,
            mass: config.motionHoverMass,
        };
    }
    if (scope === 'tap') {
        return {
            transitionType: config.motionTapTransitionType,
            ease: config.motionTapEase,
            duration: config.motionTapDuration,
            delay: config.motionTapDelay,
            stiffness: config.motionTapStiffness,
            damping: config.motionTapDamping,
            mass: config.motionTapMass,
        };
    }
    return {
        transitionType: config.motionTransitionType,
        ease: config.motionEase,
        duration: config.motionDuration,
        delay: config.motionDelay,
        stiffness: config.motionStiffness,
        damping: config.motionDamping,
        mass: config.motionMass,
    };
}

export function buildMotionTransition(config: ComponentStyleConfig, scope: MotionTransitionScope = 'entry') {
    const transition = getMotionTransitionValues(config, scope);
    return transition.transitionType === 'spring'
        ? {
            type: 'spring' as const,
            duration: transition.duration,
            delay: transition.delay,
            stiffness: transition.stiffness,
            damping: transition.damping,
            mass: transition.mass,
        }
        : {
            type: 'tween' as const,
            duration: transition.duration,
            delay: transition.delay,
            ease: transition.ease,
        };
}

export function buildMotionTransitionSnippet(config: ComponentStyleConfig, scope: MotionTransitionScope = 'entry'): string {
    const transition = getMotionTransitionValues(config, scope);
    return transition.transitionType === 'spring'
        ? `{ type: 'spring', duration: ${transition.duration}, delay: ${transition.delay}, stiffness: ${transition.stiffness}, damping: ${transition.damping}, mass: ${transition.mass} }`
        : `{ type: 'tween', duration: ${transition.duration}, delay: ${transition.delay}, ease: '${transition.ease}' }`;
}

export function getMotionComponentPresets(kind: UIComponentKind) {
    return MOTION_COMPONENT_PRESETS.filter((preset) => !preset.kinds || preset.kinds.includes(kind));
}

export function getSurfaceMotionPresetsForKind(kind: UIComponentKind) {
    return getMotionComponentPresets(kind).filter((preset) => SURFACE_MOTION_PRESET_IDS.has(preset.id));
}

export function getSurfaceMotionPreset(kind: UIComponentKind, presetId: string) {
    return getSurfaceMotionPresetsForKind(kind).find((preset) => preset.id === presetId);
}

export function buildEntryPresetMotionConfig(
    kind: UIComponentKind,
    source: ComponentStyleConfig,
    presetId: string,
): ComponentStyleConfig {
    if (presetId === 'custom') {
        return normalizeStyleConfig({
            ...source,
            motionEntryEnabled: true,
            motionHoverEnabled: false,
            motionTapEnabled: false,
        });
    }
    const preset = getSurfaceMotionPreset(kind, presetId);
    if (!preset) {
        return {
            ...source,
            motionEntryEnabled: false,
            motionHoverEnabled: false,
            motionTapEnabled: false,
        };
    }
    return normalizeStyleConfig({
        ...source,
        ...preset.values,
        motionEntryEnabled: true,
        motionHoverEnabled: false,
        motionTapEnabled: false,
    });
}

export function hasAnyMotionEnabled(config: ComponentStyleConfig): boolean {
    return config.motionEntryEnabled || config.motionExitEnabled || config.motionHoverEnabled || config.motionTapEnabled;
}

function buildMotionExitValues(config: ComponentStyleConfig) {
    return {
        opacity: config.motionInitialOpacity / 100,
        x: config.motionInitialX,
        y: config.motionInitialY,
        rotate: config.motionAnimateRotate === 0 ? 0 : config.motionAnimateRotate,
    };
}

export function renderEntryMotion(content: ReactNode, config: ComponentStyleConfig): ReactNode {
    if (!config.motionEntryEnabled) {
        return content;
    }

    const animateX = config.motionAnimateX === 0 ? 0 : [config.motionAnimateX, 0];
    const animateY = config.motionAnimateY === 0 ? 0 : [config.motionAnimateY, 0];
    const animateRotate = config.motionAnimateRotate === 0 ? 0 : [config.motionAnimateRotate, 0];

    return (
        <motion.div
            initial={{
                opacity: config.motionInitialOpacity / 100,
                x: config.motionInitialX,
                y: config.motionInitialY,
            }}
            animate={{
                opacity: config.motionAnimateOpacity / 100,
                x: animateX,
                y: animateY,
                rotate: animateRotate,
            }}
            exit={config.motionExitEnabled ? buildMotionExitValues(config) : undefined}
            transition={buildMotionTransition(config, 'entry')}
        >
            {content}
        </motion.div>
    );
}

export function renderWithMotionControls(
    content: ReactNode,
    config: ComponentStyleConfig,
    allowEntry = true,
    allowInteraction = true,
): ReactNode {
    if (!hasAnyMotionEnabled(config) || content === null) {
        return content;
    }
    if (!allowEntry && !allowInteraction) {
        return content;
    }

    const animateX = config.motionAnimateX === 0 ? 0 : [config.motionAnimateX, 0];
    const animateY = config.motionAnimateY === 0 ? 0 : [config.motionAnimateY, 0];
    const animateRotate = config.motionAnimateRotate === 0 ? 0 : [config.motionAnimateRotate, 0];

    const whileHover = allowInteraction && config.motionHoverEnabled
        ? {
            scale: config.motionHoverScale / 100,
            x: config.motionHoverX,
            y: config.motionHoverY,
            rotate: config.motionHoverRotate,
            opacity: config.motionHoverOpacity / 100,
            transition: buildMotionTransition(config, 'hover'),
        }
        : undefined;

    const whileTap = allowInteraction && config.motionTapEnabled
        ? {
            scale: config.motionTapScale / 100,
            x: config.motionTapX,
            y: config.motionTapY,
            rotate: config.motionTapRotate,
            opacity: config.motionTapOpacity / 100,
            transition: buildMotionTransition(config, 'tap'),
        }
        : undefined;

    return (
        <motion.div
            className="w-full"
            initial={
                allowEntry && config.motionEntryEnabled
                    ? {
                        opacity: config.motionInitialOpacity / 100,
                        x: config.motionInitialX,
                        y: config.motionInitialY,
                    }
                    : undefined
            }
            animate={
                allowEntry && config.motionEntryEnabled
                    ? {
                        opacity: config.motionAnimateOpacity / 100,
                        x: animateX,
                        y: animateY,
                        rotate: animateRotate,
                    }
                    : undefined
            }
            whileHover={whileHover}
            whileTap={whileTap}
            exit={config.motionExitEnabled ? buildMotionExitValues(config) : undefined}
            transition={allowEntry ? buildMotionTransition(config, 'entry') : undefined}
        >
            {content}
        </motion.div>
    );
}

export function buildMotionComponentSnippet(config: ComponentStyleConfig): string {
    if (!hasAnyMotionEnabled(config)) {
        return '';
    }

    const animateX = config.motionAnimateX === 0 ? '0' : `[${config.motionAnimateX}, 0]`;
    const animateY = config.motionAnimateY === 0 ? '0' : `[${config.motionAnimateY}, 0]`;
    const animateRotate = config.motionAnimateRotate === 0 ? '0' : `[${config.motionAnimateRotate}, 0]`;
    const entryTransitionSnippet = buildMotionTransitionSnippet(config, 'entry');
    const hoverTransitionSnippet = buildMotionTransitionSnippet(config, 'hover');
    const tapTransitionSnippet = buildMotionTransitionSnippet(config, 'tap');

    const entrySnippet = config.motionEntryEnabled
        ? `\n  initial: { opacity: ${(config.motionInitialOpacity / 100).toFixed(2)}, x: ${config.motionInitialX}, y: ${config.motionInitialY} },\n  animate: { opacity: ${(config.motionAnimateOpacity / 100).toFixed(2)}, x: ${animateX}, y: ${animateY}, rotate: ${animateRotate} },`
        : '';
    const exitSnippet = config.motionExitEnabled
        ? `\n  exit: { opacity: ${(config.motionInitialOpacity / 100).toFixed(2)}, x: ${config.motionInitialX}, y: ${config.motionInitialY}, rotate: ${config.motionAnimateRotate === 0 ? '0' : config.motionAnimateRotate} },`
        : '';

    const hoverSnippet = config.motionHoverEnabled
        ? `\n  whileHover: { scale: ${(config.motionHoverScale / 100).toFixed(2)}, x: ${config.motionHoverX}, y: ${config.motionHoverY}, rotate: ${config.motionHoverRotate}, opacity: ${(config.motionHoverOpacity / 100).toFixed(2)}, transition: ${hoverTransitionSnippet} },`
        : '';
    const tapSnippet = config.motionTapEnabled
        ? `\n  whileTap: { scale: ${(config.motionTapScale / 100).toFixed(2)}, x: ${config.motionTapX}, y: ${config.motionTapY}, rotate: ${config.motionTapRotate}, opacity: ${(config.motionTapOpacity / 100).toFixed(2)}, transition: ${tapTransitionSnippet} },`
        : '';
    return `const motionProps = {${entrySnippet}${exitSnippet}${hoverSnippet}${tapSnippet}\n  transition: ${entryTransitionSnippet},\n};\n\n// Wrap your component preview with motion\n<motion.div {...motionProps}>\n  {/* component */}\n</motion.div>`;
}
