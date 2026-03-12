import { useRef, useCallback, type CSSProperties, type ReactNode } from 'react';
import { motion, useMotionValue, useMotionTemplate, useSpring } from 'motion/react';
import { normalizeStyleConfig, MOTION_COMPONENT_PRESETS, SURFACE_MOTION_PRESET_IDS } from './constants';
import type {
    ComponentStyleConfig,
    MotionEaseOption,
    MotionTransitionType,
    MotionTrigger,
    UIComponentKind,
} from '@/components/ui/ui-studio.types';

// Internal-only types (not exported)
type MotionKeyframeValue = number | string | Array<number | string>;

interface MotionStepValues {
    opacity?: MotionKeyframeValue;
    x?: MotionKeyframeValue;
    y?: MotionKeyframeValue;
    scale?: MotionKeyframeValue;
    rotate?: MotionKeyframeValue;
    filter?: MotionKeyframeValue;
    transformOrigin?: string;
}

interface MotionTimelineStep {
    id: string;
    trigger: MotionTrigger;
    label: string;
    from?: MotionStepValues;
    to?: MotionStepValues;
    duration: number;
    delay: number;
    transitionType: MotionTransitionType;
    ease: MotionEaseOption;
    customBezier?: [number, number, number, number];
    stiffness?: number;
    damping?: number;
    mass?: number;
    repeat?: number;
    repeatDelay?: number;
    at?: number;
}

export type MotionTransitionScope = 'entry' | 'hover' | 'tap';

// ─── Easing Resolution ────────────────────────────────────────────────────

type MotionEasingValue =
    | 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
    | 'circIn' | 'circOut' | 'circInOut'
    | 'backIn' | 'backOut' | 'backInOut'
    | 'anticipate'
    | [number, number, number, number]
    | Array<'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'circIn' | 'circOut' | 'circInOut' | 'backIn' | 'backOut' | 'backInOut' | 'anticipate' | [number, number, number, number]>;

type MotionRuntimeValues = Partial<Record<Exclude<keyof MotionStepValues, 'transformOrigin'>, MotionKeyframeValue>>;

interface MotionCompiledStep {
    id: string;
    trigger: MotionTrigger;
    label: string;
    from?: MotionRuntimeValues;
    to?: MotionRuntimeValues;
    transition: {
        type: 'spring' | 'tween';
        duration: number;
        delay: number;
        ease?: MotionEasingValue;
        stiffness?: number;
        damping?: number;
        mass?: number;
        times?: number[];
    };
    at?: number;
    repeat?: number;
    repeatDelay?: number;
    transformOrigin?: string;
}

interface MotionCompiledTrigger {
    trigger: MotionTrigger;
    steps: MotionCompiledStep[];
    initial?: MotionRuntimeValues;
    target?: MotionRuntimeValues;
    transition?: MotionCompiledStep['transition'];
    transformOrigin?: string;
}

interface MotionCompiledConfig {
    entry?: MotionCompiledTrigger;
    hover?: MotionCompiledTrigger;
    tap?: MotionCompiledTrigger;
    exit?: MotionCompiledTrigger;
    loop?: MotionCompiledTrigger;
    scroll?: MotionCompiledTrigger;
}

export type PreviewGestureMotion = any;

export interface PreviewMotionProps {
    initial?: any;
    animate?: any;
    whileInView?: any;
    whileHover?: PreviewGestureMotion;
    whileTap?: PreviewGestureMotion;
    transition?: any;
    viewport?: {
        once?: boolean;
        amount?: number;
    };
    style?: CSSProperties;
}

export function resolveEase(ease: MotionEaseOption, customBezier?: [number, number, number, number]): MotionEasingValue {
    switch (ease) {
        case 'linear': return 'linear';
        case 'easeIn': return 'easeIn';
        case 'easeOut': return 'easeOut';
        case 'easeInOut': return 'easeInOut';
        case 'anticipate': return 'anticipate';
        case 'backIn': return 'backIn';
        case 'backOut': return 'backOut';
        case 'backInOut': return 'backInOut';
        case 'circIn': return 'circIn';
        case 'circOut': return 'circOut';
        case 'circInOut': return 'circInOut';
        case 'cubicBezier': return customBezier ?? [0.4, 0, 0.2, 1] as [number, number, number, number];
        default: return 'easeInOut';
    }
}

function buildTransitionFromValues(
    transitionType: MotionTransitionType,
    ease: MotionEaseOption,
    duration: number,
    delay: number,
    stiffness: number,
    damping: number,
    mass: number,
    customBezier?: [number, number, number, number],
): MotionCompiledStep['transition'] {
    const resolvedEase = resolveEase(ease, customBezier);
    return transitionType === 'spring'
        ? {
            type: 'spring',
            duration,
            delay,
            stiffness,
            damping,
            mass,
        }
        : {
            type: 'tween',
            duration,
            delay,
            ease: resolvedEase,
        };
}

function stripUndefinedValues(values?: MotionStepValues): MotionRuntimeValues | undefined {
    if (!values) {
        return undefined;
    }

    const next: MotionRuntimeValues = {};
    if (values.opacity !== undefined) next.opacity = values.opacity;
    if (values.x !== undefined) next.x = values.x;
    if (values.y !== undefined) next.y = values.y;
    if (values.scale !== undefined) next.scale = values.scale;
    if (values.rotate !== undefined) next.rotate = values.rotate;
    if (values.filter !== undefined) next.filter = values.filter;
    return Object.keys(next).length ? next : undefined;
}

function collectTransformOrigin(step: MotionTimelineStep): string | undefined {
    return step.to?.transformOrigin ?? step.from?.transformOrigin;
}

// ─── Step Builders ───────────────────────────────────────────────────────

function buildEntryStep(config: ComponentStyleConfig): MotionTimelineStep | null {
    if (!config.motionEntryEnabled) {
        return null;
    }

    const initialScale = config.motionInitialScale !== 100 ? config.motionInitialScale / 100 : undefined;
    const animateScale = config.motionAnimateScale !== 100
        ? [config.motionAnimateScale / 100, 1]
        : initialScale !== undefined ? 1 : undefined;
    const hasFilter = Boolean(config.motionInitialFilter || config.motionAnimateFilter);

    return {
        id: 'entry',
        trigger: 'entry',
        label: 'Entry',
        from: {
            opacity: config.motionInitialOpacity / 100,
            x: config.motionInitialX,
            y: config.motionInitialY,
            ...(initialScale !== undefined ? { scale: initialScale } : {}),
            ...(config.motionInitialFilter ? { filter: config.motionInitialFilter } : {}),
            ...(config.motionTransformOrigin ? { transformOrigin: config.motionTransformOrigin } : {}),
        },
        to: {
            opacity: config.motionAnimateOpacity / 100,
            x: config.motionAnimateX === 0 ? 0 : [config.motionAnimateX, 0],
            y: config.motionAnimateY === 0 ? 0 : [config.motionAnimateY, 0],
            rotate: config.motionAnimateRotate === 0 ? 0 : [config.motionAnimateRotate, 0],
            ...(animateScale !== undefined ? { scale: animateScale } : {}),
            ...(hasFilter ? { filter: config.motionAnimateFilter || 'blur(0px)' } : {}),
            ...(config.motionTransformOrigin ? { transformOrigin: config.motionTransformOrigin } : {}),
        },
        duration: config.motionDuration,
        delay: config.motionDelay,
        transitionType: config.motionTransitionType,
        ease: config.motionEase,
        ...(config.motionEase === 'cubicBezier' ? { customBezier: config.motionCustomBezier } : {}),
        ...(config.motionTransitionType === 'spring'
            ? {
                stiffness: config.motionStiffness,
                damping: config.motionDamping,
                mass: config.motionMass,
            }
            : {}),
    };
}

function buildHoverStep(config: ComponentStyleConfig): MotionTimelineStep | null {
    if (!config.motionHoverEnabled) return null;
    const useOverride = config.motionHoverTransitionOverride;
    return {
        id: 'hover',
        trigger: 'hover',
        label: 'Hover',
        to: {
            scale: config.motionHoverScale / 100,
            x: config.motionHoverX,
            y: config.motionHoverY,
            rotate: config.motionHoverRotate,
            opacity: config.motionHoverOpacity / 100,
        },
        duration: useOverride ? config.motionHoverDuration : config.motionDuration,
        delay: useOverride ? config.motionHoverDelay : config.motionDelay,
        transitionType: useOverride ? config.motionHoverTransitionType : config.motionTransitionType,
        ease: useOverride ? config.motionHoverEase : config.motionEase,
        ...(config.motionCustomBezier ? { customBezier: config.motionCustomBezier } : {}),
        ...((useOverride ? config.motionHoverTransitionType : config.motionTransitionType) === 'spring'
            ? {
                stiffness: useOverride ? config.motionHoverStiffness : config.motionStiffness,
                damping: useOverride ? config.motionHoverDamping : config.motionDamping,
                mass: useOverride ? config.motionHoverMass : config.motionMass,
            }
            : {}),
    };
}

function buildTapStep(config: ComponentStyleConfig): MotionTimelineStep | null {
    if (!config.motionTapEnabled) return null;
    const useOverride = config.motionTapTransitionOverride;
    return {
        id: 'tap',
        trigger: 'tap',
        label: 'Tap',
        to: {
            scale: config.motionTapScale / 100,
            x: config.motionTapX,
            y: config.motionTapY,
            rotate: config.motionTapRotate,
            opacity: config.motionTapOpacity / 100,
        },
        duration: useOverride ? config.motionTapDuration : config.motionDuration,
        delay: useOverride ? config.motionTapDelay : config.motionDelay,
        transitionType: useOverride ? config.motionTapTransitionType : config.motionTransitionType,
        ease: useOverride ? config.motionTapEase : config.motionEase,
        ...(config.motionCustomBezier ? { customBezier: config.motionCustomBezier } : {}),
        ...((useOverride ? config.motionTapTransitionType : config.motionTransitionType) === 'spring'
            ? {
                stiffness: useOverride ? config.motionTapStiffness : config.motionStiffness,
                damping: useOverride ? config.motionTapDamping : config.motionDamping,
                mass: useOverride ? config.motionTapMass : config.motionMass,
            }
            : {}),
    };
}

function buildExitStep(config: ComponentStyleConfig): MotionTimelineStep | null {
    if (!config.motionExitEnabled) {
        return null;
    }

    return {
        id: 'exit',
        trigger: 'exit',
        label: 'Exit',
        to: {
            opacity: config.motionInitialOpacity / 100,
            x: config.motionInitialX,
            y: config.motionInitialY,
            scale: config.motionInitialScale / 100,
            rotate: config.motionAnimateRotate === 0 ? 0 : config.motionAnimateRotate,
            ...(config.motionInitialFilter ? { filter: config.motionInitialFilter } : {}),
            ...(config.motionTransformOrigin ? { transformOrigin: config.motionTransformOrigin } : {}),
        },
        duration: config.motionDuration,
        delay: 0,
        transitionType: config.motionTransitionType,
        ease: config.motionEase,
        ...(config.motionEase === 'cubicBezier' ? { customBezier: config.motionCustomBezier } : {}),
        ...(config.motionTransitionType === 'spring'
            ? {
                stiffness: config.motionStiffness,
                damping: config.motionDamping,
                mass: config.motionMass,
            }
            : {}),
    };
}

function buildScrollStep(config: ComponentStyleConfig): MotionTimelineStep | null {
    if (!config.motionScrollEnabled) {
        return null;
    }

    const fallbackOffset = config.motionScrollParallax !== 0 ? config.motionScrollParallax : 24;
    const hasEntryMotion = config.motionEntryEnabled;
    const initialScale = hasEntryMotion && config.motionInitialScale !== 100 ? config.motionInitialScale / 100 : undefined;
    const targetScale = hasEntryMotion && (config.motionAnimateScale !== 100 || initialScale !== undefined)
        ? config.motionAnimateScale / 100
        : undefined;
    const hasFilter = hasEntryMotion && Boolean(config.motionInitialFilter || config.motionAnimateFilter);

    return {
        id: 'scroll',
        trigger: 'scroll',
        label: config.motionScrollMode === 'progress' ? 'Scroll Progress' : 'Scroll Enter',
        from: {
            ...(hasEntryMotion ? { opacity: config.motionInitialOpacity / 100 } : {}),
            x: hasEntryMotion ? config.motionInitialX : 0,
            y: hasEntryMotion
                ? (config.motionInitialY !== 0 ? config.motionInitialY : fallbackOffset)
                : fallbackOffset,
            ...(initialScale !== undefined ? { scale: initialScale } : {}),
            ...(hasFilter ? { filter: config.motionInitialFilter } : {}),
            ...(config.motionTransformOrigin ? { transformOrigin: config.motionTransformOrigin } : {}),
        },
        to: {
            ...(hasEntryMotion ? { opacity: config.motionAnimateOpacity / 100 } : {}),
            x: hasEntryMotion ? config.motionAnimateX : 0,
            y: hasEntryMotion ? config.motionAnimateY : 0,
            ...(targetScale !== undefined ? { scale: targetScale } : {}),
            ...(hasFilter ? { filter: config.motionAnimateFilter || 'blur(0px)' } : {}),
            ...(config.motionTransformOrigin ? { transformOrigin: config.motionTransformOrigin } : {}),
        },
        duration: config.motionDuration,
        delay: config.motionDelay,
        transitionType: config.motionTransitionType,
        ease: config.motionEase,
        ...(config.motionEase === 'cubicBezier' ? { customBezier: config.motionCustomBezier } : {}),
        ...(config.motionTransitionType === 'spring'
            ? {
                stiffness: config.motionStiffness,
                damping: config.motionDamping,
                mass: config.motionMass,
            }
            : {}),
    };
}

function getMotionTimeline(config: ComponentStyleConfig): MotionTimelineStep[] {
    return [
        buildEntryStep(config),
        buildHoverStep(config),
        buildTapStep(config),
        buildExitStep(config),
        buildScrollStep(config),
    ].filter((step): step is MotionTimelineStep => Boolean(step));
}

function compileMotionStep(step: MotionTimelineStep, config: ComponentStyleConfig): MotionCompiledStep {
    return {
        id: step.id,
        trigger: step.trigger,
        label: step.label,
        from: stripUndefinedValues(step.from),
        to: stripUndefinedValues(step.to),
        transition: buildTransitionFromValues(
            step.transitionType,
            step.ease,
            step.duration,
            step.delay,
            step.stiffness ?? config.motionStiffness,
            step.damping ?? config.motionDamping,
            step.mass ?? config.motionMass,
            step.customBezier ?? config.motionCustomBezier,
        ),
        at: step.at,
        repeat: step.repeat,
        repeatDelay: step.repeatDelay,
        transformOrigin: collectTransformOrigin(step),
    };
}

function buildTriggerTimeline(steps: MotionCompiledStep[]): MotionCompiledTrigger | undefined {
    if (!steps.length) {
        return undefined;
    }

    const firstStep = steps[0];
    if (steps.length === 1) {
        return {
            trigger: firstStep.trigger,
            steps,
            initial: firstStep.from,
            target: firstStep.to,
            transition: firstStep.transition,
            transformOrigin: firstStep.transformOrigin,
        };
    }

    const keys = new Set<keyof MotionRuntimeValues>();
    steps.forEach((step) => {
        Object.keys(step.from ?? {}).forEach((key) => keys.add(key as keyof MotionRuntimeValues));
        Object.keys(step.to ?? {}).forEach((key) => keys.add(key as keyof MotionRuntimeValues));
    });

    const totalDuration = steps.reduce((max, step) => Math.max(max, (step.at ?? 0) + step.transition.delay + step.transition.duration), 0) || 0.001;
    const target: MotionRuntimeValues = {};
    const transitionEase: Array<Exclude<MotionEasingValue, MotionEasingValue[]>> = [];
    const transitionTimes: number[] = [];

    keys.forEach((key) => {
        const values: Array<string | number> = [];

        steps.forEach((step) => {
            const fromValue = step.from?.[key];
            const toValue = step.to?.[key];
            if (values.length === 0 && fromValue !== undefined) {
                values.push(...(Array.isArray(fromValue) ? fromValue : [fromValue]));
            }
            if (toValue !== undefined) {
                values.push(...(Array.isArray(toValue) ? toValue : [toValue]));
            }
        });

        if (!values.length) {
            return;
        }

        target[key] = values.length === 1 ? values[0] : values;
    });

    steps.forEach((step, index) => {
        const easeValue = step.transition.ease;
        const segmentEnd = ((step.at ?? 0) + step.transition.delay + step.transition.duration) / totalDuration;
        if (index === 0) {
            transitionTimes.push(0);
        }
        transitionTimes.push(Math.min(1, Number(segmentEnd.toFixed(4))));
        if (easeValue !== undefined) {
            transitionEase.push(easeValue as Exclude<MotionEasingValue, MotionEasingValue[]>);
        }
    });

    return {
        trigger: firstStep.trigger,
        steps,
        initial: firstStep.from,
        target: Object.keys(target).length ? target : undefined,
        transition: {
            type: 'tween',
            duration: totalDuration,
            delay: 0,
            ...(transitionEase.length ? { ease: transitionEase.length === 1 ? transitionEase[0] : transitionEase } : {}),
            ...(transitionTimes.length > 1 ? { times: transitionTimes } : {}),
        },
        transformOrigin: steps.find((step) => step.transformOrigin)?.transformOrigin,
    };
}

export function compileMotionConfig(config: ComponentStyleConfig): MotionCompiledConfig {
    const steps = getMotionTimeline(config).map((step) => compileMotionStep(step, config));
    const stepsByTrigger = steps.reduce<Record<MotionTrigger, MotionCompiledStep[]>>(
        (acc, step) => {
            acc[step.trigger].push(step);
            return acc;
        },
        { entry: [], hover: [], tap: [], exit: [], loop: [], scroll: [] },
    );
    const entry = buildTriggerTimeline(stepsByTrigger.entry);
    const exit = buildTriggerTimeline(stepsByTrigger.exit) ?? (entry?.initial
        ? {
            trigger: 'exit',
            steps: [],
            target: entry.initial,
            transition: entry.transition,
            transformOrigin: entry.transformOrigin,
        }
        : undefined);

    return {
        entry,
        hover: buildTriggerTimeline(stepsByTrigger.hover),
        tap: buildTriggerTimeline(stepsByTrigger.tap),
        exit,
        loop: buildTriggerTimeline(stepsByTrigger.loop),
        scroll: buildTriggerTimeline(stepsByTrigger.scroll),
    };
}

export function buildMotionGesture(config: ComponentStyleConfig, trigger: 'hover' | 'tap'): PreviewGestureMotion | undefined {
    const compiled = compileMotionConfig(config)[trigger];
    if (!compiled?.target) {
        return undefined;
    }
    return {
        ...compiled.target,
        ...(compiled.transition ? { transition: compiled.transition } : {}),
    };
}

export function buildPreviewMotionProps(
    config: ComponentStyleConfig,
    options: {
        allowEntry?: boolean;
        allowInteraction?: boolean;
    } = {},
): PreviewMotionProps {
    const { allowEntry = true, allowInteraction = true } = options;
    const compiled = compileMotionConfig(config);
    const previewMode = config.motionPreviewMode;
    const transformOrigin = compiled.entry?.transformOrigin;
    const scrollTransformOrigin = compiled.scroll?.transformOrigin;

    const scrollStyle = scrollTransformOrigin ? { transformOrigin: scrollTransformOrigin } : transformOrigin ? { transformOrigin } : undefined;
    const scrollViewport = {
        once: !config.motionScrollReplay,
        amount: Math.max(0, Math.min(1, config.motionScrollStart / 100)),
    };

    if (previewMode === 'hover' && allowInteraction && compiled.hover?.target) {
        return {
            animate: compiled.hover.target,
            transition: compiled.hover.transition,
            ...(transformOrigin ? { style: { transformOrigin } } : {}),
        };
    }

    if (previewMode === 'tap' && allowInteraction && compiled.tap?.target) {
        return {
            animate: compiled.tap.target,
            transition: compiled.tap.transition,
            ...(transformOrigin ? { style: { transformOrigin } } : {}),
        };
    }

    if (previewMode === 'loop' && compiled.loop?.target) {
        const loopStep = compiled.loop.steps[0];
        return {
            initial: allowEntry && config.motionEntryEnabled ? compiled.entry?.initial : undefined,
            animate: compiled.loop.target,
            transition: compiled.loop.transition
                ? {
                    ...compiled.loop.transition,
                    repeat: loopStep?.repeat && loopStep.repeat > 0 ? loopStep.repeat : Infinity,
                    repeatDelay: loopStep?.repeatDelay ?? 0,
                }
                : undefined,
            ...(transformOrigin ? { style: { transformOrigin } } : {}),
        };
    }

    if (previewMode === 'scrub' && compiled.scroll?.target) {
        return {
            animate: compiled.scroll.target,
            transition: compiled.scroll.transition
                ? { ...compiled.scroll.transition, duration: 0 }
                : { type: 'tween' as const, duration: 0 },
            ...(scrollStyle ? { style: scrollStyle } : {}),
        };
    }

    if (config.motionScrollEnabled && compiled.scroll?.target) {
        return {
            initial: compiled.scroll.initial ?? (allowEntry && config.motionEntryEnabled ? compiled.entry?.initial : undefined),
            whileInView: compiled.scroll.target,
            transition: compiled.scroll.transition ?? (allowEntry ? compiled.entry?.transition : undefined),
            viewport: scrollViewport,
            ...(scrollStyle ? { style: scrollStyle } : {}),
        };
    }

    return {
        initial: allowEntry && config.motionEntryEnabled ? compiled.entry?.initial : undefined,
        animate: allowEntry && config.motionEntryEnabled ? compiled.entry?.target : undefined,
        whileHover: allowInteraction ? buildMotionGesture(config, 'hover') : undefined,
        whileTap: allowInteraction ? buildMotionGesture(config, 'tap') : undefined,
        transition: allowEntry ? compiled.entry?.transition : undefined,
        ...(transformOrigin ? { style: { transformOrigin } } : {}),
    };
}

function stripGestureTransition(gesture: PreviewGestureMotion | undefined): Record<string, any> | undefined {
    if (!gesture) {
        return undefined;
    }
    const { transition: _transition, ...target } = gesture as Record<string, any>;
    return Object.keys(target).length ? target : undefined;
}

function scaleTowardDefault(value: unknown, factor: number, defaultValue: number): unknown {
    if (typeof value !== 'number') {
        return value ?? defaultValue;
    }
    return defaultValue + (value - defaultValue) * factor;
}

function buildChildrenFollowerTarget(
    hoverTarget: Record<string, any> | undefined,
    axis: 'x' | 'y',
    currentIndex: number,
    activeIndex: number,
): Record<string, any> | undefined {
    if (!hoverTarget) {
        return undefined;
    }

    const direction = currentIndex < activeIndex ? -1 : 1;
    return {
        ...(hoverTarget.scale !== undefined ? { scale: scaleTowardDefault(hoverTarget.scale, 0.45, 1) } : { scale: 1.01 }),
        ...(hoverTarget.opacity !== undefined ? { opacity: Math.max(0.8, Number(scaleTowardDefault(hoverTarget.opacity, 0.45, 1))) } : { opacity: 0.9 }),
        ...(hoverTarget.rotate !== undefined ? { rotate: scaleTowardDefault(hoverTarget.rotate, 0.4, 0) } : {}),
        ...(axis === 'x'
            ? { x: hoverTarget.x !== undefined ? scaleTowardDefault(hoverTarget.x, 0.35, 0) : direction * 3 }
            : { y: hoverTarget.y !== undefined ? scaleTowardDefault(hoverTarget.y, 0.35, 0) : direction * 3 }),
    };
}

function buildSiblingFollowerTarget(
    hoverTarget: Record<string, any> | undefined,
    axis: 'x' | 'y',
    currentIndex: number,
    activeIndex: number,
): Record<string, any> {
    const direction = currentIndex < activeIndex ? -1 : 1;
    return {
        opacity: hoverTarget?.opacity !== undefined ? Math.max(0.58, Number(scaleTowardDefault(hoverTarget.opacity, 0.2, 1))) : 0.7,
        scale: hoverTarget?.scale !== undefined && typeof hoverTarget.scale === 'number' && hoverTarget.scale < 1
            ? scaleTowardDefault(hoverTarget.scale, 0.2, 1)
            : 0.98,
        ...(axis === 'x' ? { x: direction * 6 } : { y: direction * 4 }),
    };
}

export function buildRelationshipMotionProps(
    config: ComponentStyleConfig,
    options: {
        activeIndex: number | null;
        currentIndex: number;
        total: number;
        axis?: 'x' | 'y';
    },
): PreviewMotionProps {
    const base = buildPreviewMotionProps(config, { allowEntry: false, allowInteraction: true });
    const hasGroupScope = config.motionStaggerEnabled || config.motionGroupStrategy !== 'none';
    const axis = options.axis ?? 'x';

    if (options.activeIndex === null || options.total <= 1 || !hasGroupScope) {
        return base;
    }
    if (options.currentIndex === options.activeIndex) {
        return base;
    }

    const hoverGesture = buildMotionGesture(config, 'hover');
    const hoverTarget = stripGestureTransition(hoverGesture);
    const hoverTransition = (hoverGesture as Record<string, any> | undefined)?.transition ?? base.transition;

    return {
        ...base,
        animate: buildChildrenFollowerTarget(hoverTarget, axis, options.currentIndex, options.activeIndex) ?? base.animate,
        transition: hoverTransition,
    };
}

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
    return buildTransitionFromValues(
        transition.transitionType,
        transition.ease,
        transition.duration,
        transition.delay,
        transition.stiffness,
        transition.damping,
        transition.mass,
        config.motionCustomBezier,
    );
}

export function buildMotionTransitionSnippet(config: ComponentStyleConfig, scope: MotionTransitionScope = 'entry'): string {
    const transition = getMotionTransitionValues(config, scope);
    if (transition.transitionType === 'spring') {
        return `{ type: 'spring', duration: ${transition.duration}, delay: ${transition.delay}, stiffness: ${transition.stiffness}, damping: ${transition.damping}, mass: ${transition.mass} }`;
    }
    if (transition.ease === 'cubicBezier' && config.motionCustomBezier) {
        return `{ type: 'tween', duration: ${transition.duration}, delay: ${transition.delay}, ease: [${config.motionCustomBezier.join(', ')}] }`;
    }
    return `{ type: 'tween', duration: ${transition.duration}, delay: ${transition.delay}, ease: '${transition.ease}' }`;
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
    return (
        config.motionEntryEnabled ||
        config.motionExitEnabled ||
        config.motionScrollEnabled ||
        config.motionHoverEnabled ||
        config.motionTapEnabled ||
        config.motionStaggerEnabled ||
        config.motionGroupStrategy !== 'none'
    );
}

function buildMotionExitValues(config: ComponentStyleConfig) {
    return compileMotionConfig(config).exit?.target;
}

export function renderEntryMotion(content: ReactNode, config: ComponentStyleConfig): ReactNode {
    if (!config.motionEntryEnabled && !config.motionScrollEnabled) {
        return content;
    }
    const previewMotion = buildPreviewMotionProps(config, { allowEntry: true, allowInteraction: false });

    return (
        <motion.div
            initial={previewMotion.initial}
            animate={previewMotion.animate}
            whileInView={previewMotion.whileInView}
            exit={config.motionExitEnabled ? buildMotionExitValues(config) : undefined}
            transition={previewMotion.transition}
            viewport={previewMotion.viewport}
            {...(previewMotion.style ? { style: previewMotion.style } : {})}
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
    const previewMotion = buildPreviewMotionProps(config, { allowEntry, allowInteraction });

    return (
        <motion.div
            className="w-full"
            initial={previewMotion.initial}
            animate={previewMotion.animate}
            whileInView={previewMotion.whileInView}
            whileHover={previewMotion.whileHover}
            whileTap={previewMotion.whileTap}
            exit={config.motionExitEnabled ? buildMotionExitValues(config) : undefined}
            transition={previewMotion.transition}
            viewport={previewMotion.viewport}
            {...(previewMotion.style ? { style: previewMotion.style } : {})}
        >
            {content}
        </motion.div>
    );
}

// ─── Stagger Wrapper ──────────────────────────────────────────────────────

function resolveGroupStrategy(config: ComponentStyleConfig): 'none' | 'stagger' | 'queue' {
    if (config.motionGroupStrategy !== 'none') {
        return config.motionGroupStrategy;
    }
    return config.motionStaggerEnabled ? 'stagger' : 'none';
}

function buildCenterOriginOrder(total: number): number[] {
    if (total <= 0) {
        return [];
    }

    const order: number[] = [];
    const leftCenter = Math.floor((total - 1) / 2);
    const rightCenter = Math.ceil((total - 1) / 2);

    order.push(leftCenter);
    if (rightCenter !== leftCenter) {
        order.push(rightCenter);
    }

    let offset = 1;
    while (order.length < total) {
        const left = leftCenter - offset;
        const right = rightCenter + offset;
        if (left >= 0) {
            order.push(left);
        }
        if (right < total) {
            order.push(right);
        }
        offset += 1;
    }

    return order;
}

function buildGroupOrder(total: number, origin: ComponentStyleConfig['motionGroupOrigin']): number[] {
    if (origin === 'last') {
        return Array.from({ length: total }, (_, index) => total - 1 - index);
    }
    if (origin === 'center') {
        return buildCenterOriginOrder(total);
    }
    return Array.from({ length: total }, (_, index) => index);
}

function buildGroupDelayRanks(total: number, origin: ComponentStyleConfig['motionGroupOrigin']): number[] {
    const order = buildGroupOrder(total, origin);
    const ranks = Array.from({ length: total }, () => 0);
    order.forEach((childIndex, rank) => {
        ranks[childIndex] = rank;
    });
    return ranks;
}

function buildGroupChildMotion(config: ComponentStyleConfig) {
    const compiled = compileMotionConfig(config);
    const previewMotion = buildPreviewMotionProps(config, { allowEntry: true, allowInteraction: false });
    const entryTransition = compiled.entry?.transition ?? previewMotion.transition ?? { type: 'tween', duration: 0.25, ease: 'easeOut' };
    const entryDuration =
        typeof entryTransition?.duration === 'number' && entryTransition.duration > 0
            ? entryTransition.duration
            : 0.25;

    return {
        initial: compiled.entry?.initial ?? previewMotion.initial ?? { opacity: 0, y: 8 },
        animate: compiled.entry?.target ?? previewMotion.animate ?? (previewMotion.whileInView ? undefined : { opacity: 1, y: 0 }),
        whileInView: previewMotion.whileInView,
        transition: entryTransition,
        duration: entryDuration,
        viewport: previewMotion.viewport,
        style: compiled.entry?.transformOrigin ? { transformOrigin: compiled.entry.transformOrigin } : previewMotion.style,
    };
}

export function renderStaggeredChildren(
    children: ReactNode[],
    config: ComponentStyleConfig,
): ReactNode[] {
    const strategy = resolveGroupStrategy(config);
    if (strategy === 'none') {
        return children;
    }
    const interval = config.motionGroupInterval > 0 ? config.motionGroupInterval : config.motionStaggerDelay;
    const ranks = buildGroupDelayRanks(children.length, config.motionGroupOrigin);
    const childMotion = buildGroupChildMotion(config);

    return children.map((child, index) => {
        const orderIndex = ranks[index] ?? index;
        const delay = strategy === 'queue'
            ? orderIndex * (childMotion.duration + interval)
            : orderIndex * interval;
        return (
            <motion.div
                key={index}
                initial={childMotion.initial}
                animate={childMotion.animate}
                whileInView={childMotion.whileInView}
                transition={{
                    ...(childMotion.transition ?? {}),
                    delay: (childMotion.transition?.delay ?? 0) + delay,
                }}
                viewport={childMotion.viewport}
                style={childMotion.style}
            >
                {child}
            </motion.div>
        );
    });
}

// ─── Advanced Hover Effects (Tilt 3D / Glare / Spotlight) ────────────────

export function hasAdvancedHoverEnabled(config: ComponentStyleConfig): boolean {
    return config.motionHoverTiltEnabled || config.motionHoverGlareEnabled || config.motionHoverSpotlightEnabled;
}

/**
 * React component wrapper that adds mouse-tracking hover effects.
 * Uses useMotionValue for smooth, spring-animated transforms.
 *
 * Tilt 3D: rotateX/rotateY from mouse position (React Bits TiltedCard pattern)
 * Glare: radial-gradient overlay positioned at mouse (React Bits GlareHover pattern)
 * Spotlight: radial-gradient background at mouse (Magic UI MagicCard pattern)
 */
export function AdvancedHoverWrapper({
    children,
    config,
    className,
}: {
    children: ReactNode;
    config: ComponentStyleConfig;
    className?: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Raw mouse position (0–1 range)
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    // Spring-animated tilt rotation for smooth return-to-zero
    const tiltStrength = config.motionHoverTiltStrength;
    const rotateX = useSpring(0, { stiffness: 300, damping: 30 });
    const rotateY = useSpring(0, { stiffness: 300, damping: 30 });

    // Glare overlay gradient (radial-gradient positioned at mouse)
    const glareOpacityHex = Math.round((config.motionHoverGlareOpacity ?? 0.2) * 255)
        .toString(16)
        .padStart(2, '0');
    const glareBackground = useMotionTemplate`radial-gradient(circle at ${mouseX}% ${mouseY}%, ${config.motionHoverGlareColor}${glareOpacityHex}, transparent 60%)`;

    // Spotlight background gradient
    const spotlightSize = config.motionHoverSpotlightSize ?? 200;
    const spotlightBackground = useMotionTemplate`radial-gradient(${spotlightSize}px circle at ${mouseX}% ${mouseY}%, ${config.motionHoverSpotlightColor}22, transparent 80%)`;

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            mouseX.set(x);
            mouseY.set(y);

            if (config.motionHoverTiltEnabled) {
                rotateX.set(((y / 100) - 0.5) * -tiltStrength);
                rotateY.set(((x / 100) - 0.5) * tiltStrength);
            }
        },
        [config.motionHoverTiltEnabled, tiltStrength, mouseX, mouseY, rotateX, rotateY],
    );

    const handleMouseLeave = useCallback(() => {
        mouseX.set(50);
        mouseY.set(50);
        rotateX.set(0);
        rotateY.set(0);
    }, [mouseX, mouseY, rotateX, rotateY]);

    return (
        <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
            style={{
                position: 'relative',
                transformStyle: config.motionHoverTiltEnabled ? 'preserve-3d' : undefined,
                perspective: config.motionHoverTiltEnabled ? 800 : undefined,
                rotateX: config.motionHoverTiltEnabled ? rotateX : undefined,
                rotateY: config.motionHoverTiltEnabled ? rotateY : undefined,
            }}
        >
            {children}
            {config.motionHoverGlareEnabled && (
                <motion.div
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    style={{ background: glareBackground }}
                    aria-hidden="true"
                />
            )}
            {config.motionHoverSpotlightEnabled && (
                <motion.div
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    style={{ background: spotlightBackground }}
                    aria-hidden="true"
                />
            )}
        </motion.div>
    );
}

// ─── Snippet Generation ───────────────────────────────────────────────────

export function buildMotionComponentSnippet(config: ComponentStyleConfig): string {
    if (!hasAnyMotionEnabled(config)) {
        return '';
    }

    const compiled = compileMotionConfig(config);
    const groupStrategy = resolveGroupStrategy(config);
    const scrollViewport = {
        once: !config.motionScrollReplay,
        amount: Math.max(0, Math.min(1, config.motionScrollStart / 100)),
    };
    const groupInterval = config.motionGroupInterval > 0 ? config.motionGroupInterval : config.motionStaggerDelay;
    const groupChildMotion = buildGroupChildMotion(config);
    const serializeValue = (value: unknown): string => {
        if (value === undefined) return 'undefined';
        if (Array.isArray(value)) return `[${value.map((item) => serializeValue(item)).join(', ')}]`;
        if (value && typeof value === 'object') {
            return `{ ${Object.entries(value)
                .filter(([, entry]) => entry !== undefined)
                .map(([key, entry]) => `${key}: ${serializeValue(entry)}`)
                .join(', ')} }`;
        }
        if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
        return String(value);
    };

    const motionPropsEntries = [
        !config.motionScrollEnabled && config.motionEntryEnabled && compiled.entry?.initial ? `initial: ${serializeValue(compiled.entry.initial)}` : null,
        !config.motionScrollEnabled && config.motionEntryEnabled && compiled.entry?.target ? `animate: ${serializeValue(compiled.entry.target)}` : null,
        config.motionHoverEnabled ? `whileHover: ${serializeValue(buildMotionGesture(config, 'hover'))}` : null,
        config.motionTapEnabled ? `whileTap: ${serializeValue(buildMotionGesture(config, 'tap'))}` : null,
        config.motionExitEnabled && compiled.exit?.target ? `exit: ${serializeValue(compiled.exit.target)}` : null,
        !config.motionScrollEnabled && compiled.entry?.transition ? `transition: ${serializeValue(compiled.entry.transition)}` : null,
        !config.motionScrollEnabled && compiled.entry?.transformOrigin ? `style: ${serializeValue({ transformOrigin: compiled.entry.transformOrigin })}` : null,
    ].filter(Boolean);
    const scrollMotionEntries = config.motionScrollEnabled && compiled.scroll?.target
        ? [
            compiled.scroll.initial ? `initial: ${serializeValue(compiled.scroll.initial)}` : null,
            `whileInView: ${serializeValue(compiled.scroll.target)}`,
            (compiled.scroll.transition ?? compiled.entry?.transition) ? `transition: ${serializeValue(compiled.scroll.transition ?? compiled.entry?.transition)}` : null,
            `viewport: ${serializeValue(scrollViewport)}`,
            (compiled.scroll.transformOrigin ?? compiled.entry?.transformOrigin)
                ? `style: ${serializeValue({ transformOrigin: compiled.scroll.transformOrigin ?? compiled.entry?.transformOrigin })}`
                : null,
        ].filter(Boolean)
        : [];

    const timelineGroups = Object.entries(compiled)
        .filter(([, trigger]) => trigger?.steps.length)
        .map(([trigger, value]) => `  ${trigger}: ${serializeValue((value?.steps ?? []).map((step: MotionCompiledStep) => ({
            id: step.id,
            label: step.label,
            from: step.from,
            to: step.to,
            transition: step.transition,
            at: step.at,
            repeat: step.repeat,
            repeatDelay: step.repeatDelay,
        })))}`)
        .join(',\n');

    let snippet = `const motionProps = {\n  ${motionPropsEntries.join(',\n  ')}\n};`;

    if (scrollMotionEntries.length) {
        snippet += `\n\nconst scrollMotion = {\n  ${scrollMotionEntries.join(',\n  ')}\n};`;
        if (config.motionScrollMode === 'progress') {
            snippet += `\n\n// Progress mode uses an in-view fallback here. For continuous scrubbing, drive the same target with scrollYProgress.`;
        }
    }

    if (timelineGroups) {
        snippet += `\n\nconst motionTimeline = {\n${timelineGroups}\n};`;
    }

    const motionWrapperProps = scrollMotionEntries.length ? '{...motionProps} {...scrollMotion}' : '{...motionProps}';
    snippet += `\n\n// Wrap your component preview with motion\n<motion.div ${motionWrapperProps}>\n  {/* component */}\n</motion.div>`;

    if (groupStrategy !== 'none') {
        snippet += `\n\n// Group children\nconst groupStrategy = '${groupStrategy}';\nconst groupOrigin = '${config.motionGroupOrigin}';\nconst groupInterval = ${groupInterval};\nconst getGroupOrder = (index, total) => {\n  if (groupOrigin === 'last') return total - 1 - index;\n  if (groupOrigin === 'center') {\n    const center = (total - 1) / 2;\n    return Array.from({ length: total }, (_, childIndex) => childIndex)\n      .sort((a, b) => Math.abs(a - center) - Math.abs(b - center) || a - b)\n      .indexOf(index);\n  }\n  return index;\n};\n{items.map((item, index) => {\n  const orderIndex = getGroupOrder(index, items.length);\n  const delay = groupStrategy === 'queue'\n    ? orderIndex * (${groupChildMotion.duration} + groupInterval)\n    : orderIndex * groupInterval;\n  return (\n    <motion.div\n      key={item.id}\n      initial={${serializeValue(groupChildMotion.initial)}}\n      ${groupChildMotion.animate ? `animate={${serializeValue(groupChildMotion.animate)}}` : ''}\n      ${groupChildMotion.whileInView ? `whileInView={${serializeValue(groupChildMotion.whileInView)}}` : ''}\n      transition={{ ...${serializeValue(groupChildMotion.transition)}, delay }}\n      ${groupChildMotion.viewport ? `viewport={${serializeValue(groupChildMotion.viewport)}}` : ''}\n      ${groupChildMotion.style ? `style={${serializeValue(groupChildMotion.style)}}` : ''}\n    >\n      {item.content}\n    </motion.div>\n  );\n})}`;
    }

    if (hasAdvancedHoverEnabled(config)) {
        snippet += buildAdvancedHoverSnippet(config);
    }

    return snippet;
}

export function buildAdvancedHoverSnippet(config: ComponentStyleConfig): string {
    if (!hasAdvancedHoverEnabled(config)) return '';

    const parts: string[] = [];

    if (config.motionHoverTiltEnabled) {
        parts.push(
`// ─── Tilt 3D (mouse-tracking perspective rotation) ───
const containerRef = useRef<HTMLDivElement>(null);
const rotateX = useSpring(0, { stiffness: 300, damping: 30 });
const rotateY = useSpring(0, { stiffness: 300, damping: 30 });

function handleMouseMove(e: React.MouseEvent) {
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return;
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  rotateX.set(y * -${config.motionHoverTiltStrength});
  rotateY.set(x * ${config.motionHoverTiltStrength});
}
function handleMouseLeave() { rotateX.set(0); rotateY.set(0); }

<motion.div
  ref={containerRef}
  onMouseMove={handleMouseMove}
  onMouseLeave={handleMouseLeave}
  style={{ perspective: 800, rotateX, rotateY }}
>
  {/* content */}
</motion.div>`
        );
    }

    if (config.motionHoverGlareEnabled) {
        const opHex = Math.round((config.motionHoverGlareOpacity ?? 0.2) * 255).toString(16).padStart(2, '0');
        parts.push(
`// ─── Glare (radial-gradient overlay follows mouse) ───
const mouseX = useMotionValue(50);
const mouseY = useMotionValue(50);
const glare = useMotionTemplate\`radial-gradient(circle at \${mouseX}% \${mouseY}%, ${config.motionHoverGlareColor}${opHex}, transparent 60%)\`;

<motion.div className="relative" onMouseMove={/* update mouseX/mouseY */}>
  {/* content */}
  <motion.div
    className="pointer-events-none absolute inset-0 rounded-[inherit]"
    style={{ background: glare }}
  />
</motion.div>`
        );
    }

    if (config.motionHoverSpotlightEnabled) {
        parts.push(
`// ─── Spotlight (radial-gradient background follows mouse) ───
const mouseX = useMotionValue(50);
const mouseY = useMotionValue(50);
const spotlight = useMotionTemplate\`radial-gradient(${config.motionHoverSpotlightSize}px circle at \${mouseX}% \${mouseY}%, ${config.motionHoverSpotlightColor}22, transparent 80%)\`;

<motion.div className="relative" onMouseMove={/* update mouseX/mouseY */}>
  {/* content */}
  <motion.div
    className="pointer-events-none absolute inset-0 rounded-[inherit]"
    style={{ background: spotlight }}
  />
</motion.div>`
        );
    }

    return '\n\n' + parts.join('\n\n');
}
