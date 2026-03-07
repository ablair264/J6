import { useEffect, useState, useRef, useCallback, type CSSProperties } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ComponentStyleConfig } from '@/components/ui/ui-studio.types';
import { buildComponentWrapperStyle } from '../utilities';

const CYCLE_DURATION_MS = 3000; // 3s to go 0→100, 3s to go 100→0

export function ProgressPreview({
    instanceStyle,
    previewStyle,
    motionClassName,
}: {
    instanceStyle: ComponentStyleConfig;
    previewStyle: CSSProperties;
    motionClassName?: string;
}) {
    const s = instanceStyle;
    const [animatedValue, setAnimatedValue] = useState(s.progressValue);
    const rafRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const isPlaying = s.progressPlayAnimation;

    const animate = useCallback((timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        // Full cycle: 0→100 over CYCLE_DURATION_MS, then 100→0 over CYCLE_DURATION_MS
        const cycleDuration = CYCLE_DURATION_MS * 2;
        const position = (elapsed % cycleDuration) / CYCLE_DURATION_MS;
        // position 0→1 = ascending, 1→2 = descending
        const value = position <= 1
            ? Math.round(position * 100)
            : Math.round((2 - position) * 100);
        setAnimatedValue(value);
        rafRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        if (isPlaying) {
            startTimeRef.current = 0;
            rafRef.current = requestAnimationFrame(animate);
            return () => cancelAnimationFrame(rafRef.current);
        }
        setAnimatedValue(s.progressValue);
    }, [isPlaying, s.progressValue, animate]);

    // Sync when progressValue changes while not playing
    useEffect(() => {
        if (!isPlaying) {
            setAnimatedValue(s.progressValue);
        }
    }, [s.progressValue, isPlaying]);

    const progressWrapperStyle = {
        ...buildComponentWrapperStyle(previewStyle, 'progress'),
        width: previewStyle.width,
        maxWidth: previewStyle.width ?? '24rem',
    } satisfies CSSProperties;

    const labelStyle: CSSProperties = {
        fontFamily: previewStyle.fontFamily,
        fontSize: previewStyle.fontSize,
        fontWeight: previewStyle.fontWeight,
    };

    return (
        <div className="w-full" style={progressWrapperStyle}>
            <Progress
                value={animatedValue}
                variant={s.progressVariant}
                size={s.size}
                showLabel={s.progressShowLabel}
                animateValue={!isPlaying && s.progressAnimateValue}
                trackColor={s.progressTrackColor || undefined}
                indicatorColor={s.progressIndicatorColor || undefined}
                labelColor={s.progressLabelColor || undefined}
                circularSize={s.progressVariant === 'circular' ? s.progressCircularSize : undefined}
                circularStrokeWidth={s.progressVariant === 'circular' ? s.progressCircularStrokeWidth : undefined}
                className={cn(motionClassName)}
                style={{ borderRadius: previewStyle.borderRadius, boxShadow: previewStyle.boxShadow, ...labelStyle }}
            />
        </div>
    );
}
