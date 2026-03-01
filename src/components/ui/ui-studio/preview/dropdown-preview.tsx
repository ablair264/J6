import type { CSSProperties } from 'react';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ListBox } from 'react-aria-components';
import { Button } from '@/components/ui/button';
import {
    DropdownItem,
    DropdownKeyboard,
    DropdownLabel,
    DropdownSeparator,
} from '@/components/ui/dropdown';
import { cn } from '@/lib/utils';
import { BUTTON_STATE_CLASS_NAME } from '../constants';
import { buildButtonPreviewStateClass } from '../constants';
import { buildMotionTransition, buildEntryPresetMotionConfig, renderWithMotionControls } from '../motion';
import { normalizeStyleConfig } from '../constants';
import { withIcon } from '../utilities';
import type { ComponentStyleConfig } from '@/components/ui/ui-studio.types';

export function InteractiveDropdownPreview({
    instanceId,
    triggerStyle,
    triggerClassName,
    panelStyle,
    menuStyle,
    motionConfig,
    iconNode,
    iconPosition,
    dropdownHoverClass,
    pinnedOpen = false,
}: {
    instanceId: string;
    triggerStyle: CSSProperties;
    triggerClassName?: string;
    panelStyle: CSSProperties;
    menuStyle: CSSProperties;
    motionConfig: ComponentStyleConfig;
    iconNode: React.ReactNode;
    iconPosition: 'left' | 'right';
    dropdownHoverClass: string;
    pinnedOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const menuOpen = pinnedOpen || isOpen;
    const buttonPreviewStateClass = buildButtonPreviewStateClass(motionConfig.buttonPreviewState);
    const dropdownBodyMotionConfig = buildEntryPresetMotionConfig('dropdown', motionConfig, motionConfig.dropdownBodyMotionPresetId);
    const dropdownOptionMotionConfig = normalizeStyleConfig({
        ...motionConfig,
        motionEntryEnabled: false,
        motionHoverEnabled: motionConfig.dropdownOptionHoverEnabled,
        motionTapEnabled: motionConfig.dropdownOptionTapEnabled,
        motionHoverScale: motionConfig.dropdownOptionHoverScale,
        motionHoverY: motionConfig.dropdownOptionHoverY,
        motionTapScale: motionConfig.dropdownOptionTapScale,
        motionTapY: motionConfig.dropdownOptionTapY,
    });

    useEffect(() => {
        if (!isOpen || pinnedOpen) {
            return;
        }
        const onPointerDown = (event: PointerEvent) => {
            if (containerRef.current?.contains(event.target as Node)) {
                return;
            }
            setIsOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
        };
    }, [isOpen, pinnedOpen]);

    return (
        <div
            ref={containerRef}
            className="flex w-full justify-center py-14"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
        >
            <div className="relative inline-flex">
                {renderWithMotionControls(
                    <Button
                        variant="secondary"
                        size="sm"
                        style={triggerStyle}
                        disabled={motionConfig.buttonPreviewState === 'disabled'}
                        className={cn(BUTTON_STATE_CLASS_NAME, buttonPreviewStateClass, triggerClassName)}
                        onClick={() => {
                            if (pinnedOpen) {
                                return;
                            }
                            setIsOpen((current) => !current);
                        }}
                    >
                        {pinnedOpen ? 'Menu pinned' : isOpen ? 'Close menu' : 'Menu trigger'}
                    </Button>,
                    motionConfig,
                    false,
                    true,
                )}
                <AnimatePresence>
                    {menuOpen ? (
                        <div style={menuStyle}>
                            <motion.div
                                key={`${instanceId}-dropdown-menu`}
                                initial={
                                    dropdownBodyMotionConfig.motionEntryEnabled
                                        ? {
                                            opacity: dropdownBodyMotionConfig.motionInitialOpacity / 100,
                                            x: dropdownBodyMotionConfig.motionInitialX,
                                            y: dropdownBodyMotionConfig.motionInitialY,
                                        }
                                        : undefined
                                }
                                animate={
                                    dropdownBodyMotionConfig.motionEntryEnabled
                                        ? {
                                            opacity: dropdownBodyMotionConfig.motionAnimateOpacity / 100,
                                            x:
                                                dropdownBodyMotionConfig.motionAnimateX !== 0
                                                    ? [dropdownBodyMotionConfig.motionAnimateX, 0]
                                                    : 0,
                                            y:
                                                dropdownBodyMotionConfig.motionAnimateY !== 0
                                                    ? [dropdownBodyMotionConfig.motionAnimateY, 0]
                                                    : 0,
                                            rotate:
                                                dropdownBodyMotionConfig.motionAnimateRotate !== 0
                                                    ? [dropdownBodyMotionConfig.motionAnimateRotate, 0]
                                                    : 0,
                                        }
                                        : undefined
                                }
                                exit={
                                    motionConfig.motionExitEnabled
                                        ? {
                                            opacity: dropdownBodyMotionConfig.motionInitialOpacity / 100,
                                            x: dropdownBodyMotionConfig.motionInitialX,
                                            y: dropdownBodyMotionConfig.motionInitialY,
                                            rotate:
                                                dropdownBodyMotionConfig.motionAnimateRotate === 0
                                                    ? 0
                                                    : dropdownBodyMotionConfig.motionAnimateRotate,
                                        }
                                        : dropdownBodyMotionConfig.motionEntryEnabled
                                            ? {
                                                opacity: 0,
                                                x: 0,
                                                y: motionConfig.dropdownSide === 'top' ? 8 : -8,
                                                rotate: 0,
                                            }
                                            : undefined
                                }
                                transition={buildMotionTransition(dropdownBodyMotionConfig)}
                            >
                                <ListBox
                                    aria-label="Dropdown preview"
                                    selectionMode="single"
                                    className="grid min-w-[220px] grid-cols-[auto_1fr] gap-y-1 rounded-xl p-1"
                                    style={panelStyle}
                                >
                                    <DropdownItem id={`${instanceId}-edit`} className={dropdownHoverClass} onAction={() => !pinnedOpen && setIsOpen(false)}>
                                        <DropdownLabel>
                                            {renderWithMotionControls(
                                                withIcon('Edit component', iconNode, iconPosition),
                                                dropdownOptionMotionConfig,
                                                false,
                                                true,
                                            )}
                                        </DropdownLabel>
                                        <DropdownKeyboard>⌘E</DropdownKeyboard>
                                    </DropdownItem>
                                    <DropdownItem id={`${instanceId}-duplicate`} className={dropdownHoverClass} onAction={() => !pinnedOpen && setIsOpen(false)}>
                                        <DropdownLabel>
                                            {renderWithMotionControls(
                                                'Duplicate instance',
                                                dropdownOptionMotionConfig,
                                                false,
                                                true,
                                            )}
                                        </DropdownLabel>
                                    </DropdownItem>
                                    <DropdownSeparator />
                                    <DropdownItem
                                        id={`${instanceId}-delete`}
                                        intent="danger"
                                        className={dropdownHoverClass}
                                        onAction={() => !pinnedOpen && setIsOpen(false)}
                                    >
                                        <DropdownLabel>
                                            {renderWithMotionControls(
                                                'Delete instance',
                                                dropdownOptionMotionConfig,
                                                false,
                                                true,
                                            )}
                                        </DropdownLabel>
                                    </DropdownItem>
                                </ListBox>
                            </motion.div>
                        </div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}
