import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { RotateCcw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { AlertVariant } from '@/components/ui/ui-studio.types';

export function AlertPreview({
    alertVariant,
    alertDismissible,
    alertShowIcon,
    style,
    motionClassName,
}: {
    alertVariant: AlertVariant;
    alertDismissible: boolean;
    alertShowIcon: boolean;
    style: CSSProperties;
    motionClassName?: string;
}) {
    const [dismissed, setDismissed] = useState(false);

    // Reset dismissed state when config changes
    useEffect(() => {
        setDismissed(false);
    }, [alertVariant, alertDismissible, alertShowIcon]);

    if (dismissed) {
        return (
            <button
                type="button"
                onClick={() => setDismissed(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border/50 px-4 py-3 text-xs text-muted-foreground transition hover:bg-muted/20"
            >
                <RotateCcw className="size-3" />
                Alert dismissed — click to show again
            </button>
        );
    }

    return (
        <Alert
            variant={alertVariant}
            dismissible={alertDismissible}
            onDismiss={() => setDismissed(true)}
            style={style}
            className={cn('max-w-md', motionClassName)}
        >
            <AlertTitle>Alert Title</AlertTitle>
            <AlertDescription>This is an alert message with relevant details.</AlertDescription>
        </Alert>
    );
}
