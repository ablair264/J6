import type {
    ComponentStyleConfig,
    MotionCategory,
    MotionGroupOrigin,
    MotionGroupStrategy,
    MotionPreviewMode,
    MotionRelationshipScope,
    MotionScrollMode,
    MotionTimelineStep,
} from '@/components/ui/ui-studio.types';

type MotionSchemaFieldKeys =
    | 'motionAuthoringMode'
    | 'motionCategory'
    | 'motionRelationshipScope'
    | 'motionPreviewMode'
    | 'motionTimelineEnabled'
    | 'motionTimelineSteps'
    | 'motionGroupStrategy'
    | 'motionGroupOrigin'
    | 'motionGroupInterval'
    | 'motionGroupScope'
    | 'motionScrollEnabled'
    | 'motionScrollMode'
    | 'motionScrollStart'
    | 'motionScrollEnd'
    | 'motionScrollReplay'
    | 'motionScrollParallax';

export type MotionSchemaFields = Pick<ComponentStyleConfig, MotionSchemaFieldKeys>;

function inferMotionCategory(config: ComponentStyleConfig): MotionCategory {
    if (config.motionStaggerEnabled) {
        return 'hierarchy';
    }
    if (config.motionPreset !== 'none') {
        return 'attention';
    }
    if (config.motionHoverEnabled || config.motionTapEnabled) {
        return 'feedback';
    }
    if (config.motionEntryEnabled || config.motionExitEnabled) {
        return 'transition';
    }
    return 'ambient';
}

function inferRelationshipScope(config: ComponentStyleConfig): MotionRelationshipScope {
    return config.motionStaggerEnabled ? 'children' : 'self';
}

function inferGroupStrategy(config: ComponentStyleConfig): MotionGroupStrategy {
    return config.motionStaggerEnabled ? 'stagger' : 'none';
}

function inferGroupOrigin(config: ComponentStyleConfig): MotionGroupOrigin {
    return config.motionStaggerDirection === 'reverse' ? 'last' : 'first';
}

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
        id: 'legacy-entry',
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
    if (!config.motionHoverEnabled) {
        return null;
    }

    return {
        id: 'legacy-hover',
        trigger: 'hover',
        label: 'Hover',
        to: {
            scale: config.motionHoverScale / 100,
            x: config.motionHoverX,
            y: config.motionHoverY,
            rotate: config.motionHoverRotate,
            opacity: config.motionHoverOpacity / 100,
        },
        duration: config.motionHoverDuration,
        delay: config.motionHoverDelay,
        transitionType: config.motionHoverTransitionType,
        ease: config.motionHoverEase,
        ...(config.motionHoverEase === 'cubicBezier' ? { customBezier: config.motionCustomBezier } : {}),
        ...(config.motionHoverTransitionType === 'spring'
            ? {
                stiffness: config.motionHoverStiffness,
                damping: config.motionHoverDamping,
                mass: config.motionHoverMass,
            }
            : {}),
    };
}

function buildTapStep(config: ComponentStyleConfig): MotionTimelineStep | null {
    if (!config.motionTapEnabled) {
        return null;
    }

    return {
        id: 'legacy-tap',
        trigger: 'tap',
        label: 'Tap',
        to: {
            scale: config.motionTapScale / 100,
            x: config.motionTapX,
            y: config.motionTapY,
            rotate: config.motionTapRotate,
            opacity: config.motionTapOpacity / 100,
        },
        duration: config.motionTapDuration,
        delay: config.motionTapDelay,
        transitionType: config.motionTapTransitionType,
        ease: config.motionTapEase,
        ...(config.motionTapEase === 'cubicBezier' ? { customBezier: config.motionCustomBezier } : {}),
        ...(config.motionTapTransitionType === 'spring'
            ? {
                stiffness: config.motionTapStiffness,
                damping: config.motionTapDamping,
                mass: config.motionTapMass,
            }
            : {}),
    };
}

function buildExitStep(config: ComponentStyleConfig): MotionTimelineStep | null {
    if (!config.motionExitEnabled) {
        return null;
    }

    return {
        id: 'legacy-exit',
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
        id: 'legacy-scroll',
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

export function buildLegacyMotionTimeline(config: ComponentStyleConfig): MotionTimelineStep[] {
    return [
        buildEntryStep(config),
        buildHoverStep(config),
        buildTapStep(config),
        buildExitStep(config),
        buildScrollStep(config),
    ].filter((step): step is MotionTimelineStep => Boolean(step));
}

export function normalizeMotionSchemaFields(
    style: Partial<ComponentStyleConfig> | undefined,
    merged: ComponentStyleConfig,
): MotionSchemaFields {
    const explicitSteps = style?.motionTimelineSteps;
    const timelineEnabled = style?.motionTimelineEnabled ?? Boolean(explicitSteps?.length);
    const relationshipScope = style?.motionRelationshipScope ?? inferRelationshipScope(merged);
    const groupStrategy = style?.motionGroupStrategy ?? inferGroupStrategy(merged);

    return {
        motionAuthoringMode: style?.motionAuthoringMode ?? (timelineEnabled ? 'timeline' : 'simple'),
        motionCategory: style?.motionCategory ?? inferMotionCategory(merged),
        motionRelationshipScope: relationshipScope,
        motionPreviewMode: style?.motionPreviewMode ?? 'idle' satisfies MotionPreviewMode,
        motionTimelineEnabled: timelineEnabled,
        motionTimelineSteps: explicitSteps && explicitSteps.length > 0 ? explicitSteps : buildLegacyMotionTimeline(merged),
        motionGroupStrategy: groupStrategy,
        motionGroupOrigin: style?.motionGroupOrigin ?? inferGroupOrigin(merged),
        motionGroupInterval: style?.motionGroupInterval ?? merged.motionStaggerDelay,
        motionGroupScope: style?.motionGroupScope ?? relationshipScope,
        motionScrollEnabled: style?.motionScrollEnabled ?? false,
        motionScrollMode: style?.motionScrollMode ?? ('enter' satisfies MotionScrollMode),
        motionScrollStart: style?.motionScrollStart ?? 0,
        motionScrollEnd: style?.motionScrollEnd ?? 100,
        motionScrollReplay: style?.motionScrollReplay ?? false,
        motionScrollParallax: style?.motionScrollParallax ?? 0,
    };
}
