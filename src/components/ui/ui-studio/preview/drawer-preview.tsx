import type { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerClose,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { BUTTON_STATE_CLASS_NAME, buildButtonPreviewStateClass } from '../constants';
import { buildEntryPresetMotionConfig, renderEntryMotion, renderWithMotionControls } from '../motion';
import type { ComponentStyleConfig } from '@/components/ui/ui-studio.types';

export function DrawerPreview({
    instanceStyle,
    triggerStyle,
    panelStyle,
    motionClassName,
    pinnedOpen,
}: {
    instanceStyle: ComponentStyleConfig;
    triggerStyle: CSSProperties;
    panelStyle: CSSProperties;
    motionClassName?: string;
    pinnedOpen: boolean;
}) {
    const drawerBodyMotion = buildEntryPresetMotionConfig('drawer', instanceStyle, instanceStyle.drawerBodyMotionPresetId);
    const drawerSide = instanceStyle.drawerSide;
    const isH = drawerSide === 'left' || drawerSide === 'right';
    const drawerPanelW = Math.min(instanceStyle.drawerWidth, 240);
    const buttonPreviewStateClass = buildButtonPreviewStateClass(instanceStyle.buttonPreviewState);

    // Typography from panel style for drawer content
    const titleStyle: CSSProperties = {
        fontSize: panelStyle.fontSize,
        fontWeight: panelStyle.fontWeight,
        fontFamily: panelStyle.fontFamily,
        color: panelStyle.color,
    };
    const descriptionStyle: CSSProperties = {
        fontFamily: panelStyle.fontFamily,
    };

    // Pinned mode: show static miniature layout
    if (pinnedOpen) {
        const drawerPanel = (
            <div
                className={cn(
                    'shrink-0 border-border/40',
                    drawerSide === 'left' && 'border-r',
                    drawerSide === 'right' && 'border-l',
                    drawerSide === 'top' && 'border-b',
                    drawerSide === 'bottom' && 'border-t',
                )}
                style={{
                    ...panelStyle,
                    ...(isH ? { width: `${drawerPanelW}px` } : { height: '120px' }),
                }}
            >
                {renderEntryMotion(
                    <div className="space-y-2 p-4">
                        <div style={titleStyle}>Drawer</div>
                        <div className="text-muted-foreground" style={{ ...descriptionStyle, fontSize: '0.75rem' }}>Panel content area.</div>
                    </div>,
                    drawerBodyMotion,
                )}
            </div>
        );
        const drawerMain = (
            <div className="flex-1 bg-muted/10 p-3">
                <div className="text-[10px] text-muted-foreground/60">Main content</div>
            </div>
        );
        return (
            <div className={cn(
                'relative overflow-hidden rounded-xl border border-border/40',
                isH ? 'flex h-[240px] w-full max-w-lg' : 'flex h-[280px] w-full max-w-lg flex-col',
            )}>
                {(drawerSide === 'left' || drawerSide === 'top')
                    ? <>{drawerPanel}{drawerMain}</>
                    : <>{drawerMain}{drawerPanel}</>}
            </div>
        );
    }

    // Interactive mode: use actual Drawer component
    return (
        <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
            <Drawer>
                <DrawerTrigger asChild>
                    {renderWithMotionControls(
                        <Button
                            variant="default"
                            size="sm"
                            style={triggerStyle}
                            className={cn('max-w-full overflow-hidden', BUTTON_STATE_CLASS_NAME, buttonPreviewStateClass, motionClassName)}
                        >
                            Open drawer
                        </Button>,
                        instanceStyle,
                        false,
                        true,
                    )}
                </DrawerTrigger>
                <DrawerContent side={drawerSide} style={panelStyle}>
                    <DrawerHeader>
                        <DrawerTitle style={titleStyle}>Drawer</DrawerTitle>
                        <DrawerDescription style={descriptionStyle}>Panel content area styled from studio controls.</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-6 pb-6">
                        <p className="text-muted-foreground" style={descriptionStyle}>Use the inspector to customise border, fill, and effect settings.</p>
                    </div>
                    <DrawerClose />
                </DrawerContent>
            </Drawer>
        </div>
    );
}
