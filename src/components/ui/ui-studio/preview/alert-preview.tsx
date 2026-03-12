import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { RotateCcw } from 'lucide-react';
import { Alert, AlertAction, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ComponentStyleConfig } from '@/components/ui/ui-studio.types';
import { renderConfiguredIcon } from '../utilities';

export function AlertPreview({
    styleConfig,
    style,
    motionClassName,
}: {
    styleConfig: ComponentStyleConfig;
    style: CSSProperties;
    motionClassName?: string;
}) {
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        setDismissed(false);
    }, [styleConfig.alertVariant, styleConfig.alertDismissible, styleConfig.alertShowIcon, styleConfig.alertActionMode]);

    const customIcon = styleConfig.icon !== 'none'
        ? renderConfiguredIcon(styleConfig, 'size-4 text-current')
        : undefined;

    const title = styleConfig.alertTitle || 'Alert Title';
    const description = styleConfig.alertDescription || 'This is an alert message with relevant details.';
    const showActions = styleConfig.alertActionMode !== 'none';
    const showSecondary = styleConfig.alertActionMode === 'double';

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
            variant={styleConfig.alertVariant}
            dismissible={styleConfig.alertDismissible}
            showIcon={styleConfig.alertShowIcon}
            icon={customIcon}
            onDismiss={() => setDismissed(true)}
            style={style}
            className={cn('max-w-md', motionClassName)}
        >
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
            {showActions ? (
                <AlertAction>
                    {showSecondary ? (
                        <Button type="button" variant="outline" size="xs">
                            {styleConfig.alertSecondaryLabel || 'Cancel'}
                        </Button>
                    ) : null}
                    <Button type="button" variant="default" size="xs">
                        {styleConfig.alertPrimaryLabel || 'Confirm'}
                    </Button>
                </AlertAction>
            ) : null}
        </Alert>
    );
}
