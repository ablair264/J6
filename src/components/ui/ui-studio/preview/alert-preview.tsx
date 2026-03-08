import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import {
    CircleAlert,
    CircleCheck,
    CircleX,
    Database,
    Globe,
    Lightbulb,
    RefreshCw,
    RotateCcw,
    ShieldCheck,
    X,
} from 'lucide-react';
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

    // Reset dismissed state when config changes
    useEffect(() => {
        setDismissed(false);
    }, [
        styleConfig.alertVariant,
        styleConfig.alertDismissible,
        styleConfig.alertShowIcon,
        styleConfig.alertTitleText,
        styleConfig.alertDescriptionText,
        styleConfig.alertDescriptionMode,
        styleConfig.alertListItems,
        styleConfig.alertActionMode,
    ]);

    const resolveAlertIcon = () => {
        if (styleConfig.icon !== 'none') {
            return renderConfiguredIcon(styleConfig, 'size-4 text-current');
        }
        switch (styleConfig.alertIconMode) {
            case 'shield':
                return <ShieldCheck className="size-4 text-current" />;
            case 'database':
                return <Database className="size-4 text-current" />;
            case 'globe':
                return <Globe className="size-4 text-current" />;
            case 'lightbulb':
                return <Lightbulb className="size-4 text-current" />;
            case 'circle-alert':
                return <CircleAlert className="size-4 text-current" />;
            case 'circle-check':
                return <CircleCheck className="size-4 text-current" />;
            case 'x-circle':
                return <CircleX className="size-4 text-current" />;
            case 'variant':
            default:
                return undefined;
        }
    };

    const listItems = styleConfig.alertListItems
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);

    const primaryIcon = styleConfig.alertPrimaryActionIcon === 'refresh'
        ? <RefreshCw className="size-3" />
        : styleConfig.alertPrimaryActionIcon === 'x'
            ? <X className="size-3" />
            : null;

    const hasPrimaryAction = styleConfig.alertPrimaryActionLabel.trim().length > 0;
    const hasSecondaryAction = styleConfig.alertActionMode === 'double' && styleConfig.alertSecondaryActionLabel.trim().length > 0;
    const showActionRow = styleConfig.alertActionMode !== 'none' && (hasPrimaryAction || hasSecondaryAction);
    const showInlineLink = styleConfig.alertShowInlineLink && styleConfig.alertInlineLinkLabel.trim().length > 0;

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
            dismissMotion={{
                hoverEnabled: styleConfig.alertCloseHoverEnabled,
                hoverScale: styleConfig.alertCloseHoverScale,
                tapEnabled: styleConfig.alertCloseTapEnabled,
                tapScale: styleConfig.alertCloseTapScale,
            }}
            icon={resolveAlertIcon()}
            onDismiss={() => setDismissed(true)}
            style={style}
            className={cn('max-w-md', motionClassName)}
        >
            <AlertTitle>{styleConfig.alertTitleText || 'Alert Title'}</AlertTitle>
            <AlertDescription>
                {styleConfig.alertDescriptionMode === 'list' ? (
                    <div className="space-y-1.5">
                        <p>{styleConfig.alertDescriptionText || 'Please check the following details:'}</p>
                        {listItems.length > 0 ? (
                            <ul className="list-inside list-disc space-y-0.5 text-sm">
                                {listItems.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                ) : (
                    <p>{styleConfig.alertDescriptionText || 'This is an alert message with relevant details.'}</p>
                )}
                {showInlineLink ? (
                    <Button
                        type="button"
                        variant={styleConfig.alertInlineLinkVariant}
                        size="sm"
                        className="h-auto p-0 underline"
                    >
                        {styleConfig.alertInlineLinkLabel}
                    </Button>
                ) : null}
            </AlertDescription>
            {showActionRow ? (
                <AlertAction>
                    {hasSecondaryAction ? (
                        <Button
                            type="button"
                            variant={styleConfig.alertSecondaryActionVariant}
                            size={styleConfig.alertActionSize}
                        >
                            {styleConfig.alertSecondaryActionLabel}
                        </Button>
                    ) : null}
                    {hasPrimaryAction ? (
                        <Button
                            type="button"
                            variant={styleConfig.alertPrimaryActionVariant}
                            size={styleConfig.alertActionSize}
                        >
                            {primaryIcon}
                            {styleConfig.alertPrimaryActionLabel}
                        </Button>
                    ) : null}
                </AlertAction>
            ) : null}
        </Alert>
    );
}
