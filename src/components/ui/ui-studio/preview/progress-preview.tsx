import { useEffect, useState, type CSSProperties } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ComponentStyleConfig } from '@/components/ui/ui-studio.types';
import { buildComponentWrapperStyle } from '../utilities';

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

    // Play animation: cycle 0 → 100 → 0
    useEffect(() => {
        if (!s.progressPlayAnimation) {
            setAnimatedValue(s.progressValue);
            return;
        }
        let value = 0;
        let direction = 1;
        setAnimatedValue(0);
        const interval = setInterval(() => {
            value += direction * 2;
            if (value >= 100) { value = 100; direction = -1; }
            if (value <= 0) { value = 0; direction = 1; }
            setAnimatedValue(value);
        }, 50);
        return () => clearInterval(interval);
    }, [s.progressPlayAnimation, s.progressValue]);

    // Reset animated value when progressValue changes and not playing
    useEffect(() => {
        if (!s.progressPlayAnimation) {
            setAnimatedValue(s.progressValue);
        }
    }, [s.progressValue, s.progressPlayAnimation]);

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
                animateValue={s.progressAnimateValue}
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
