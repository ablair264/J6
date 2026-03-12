import type { CSSProperties } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ListBox } from 'react-aria-components';
import { Pencil, Copy, Share, Trash2, ChevronRight, MoreVertical, Users, Mail } from 'lucide-react';
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
import { buildPreviewMotionProps, buildEntryPresetMotionConfig, renderWithMotionControls } from '../motion';
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
    const [submenuOpen, setSubmenuOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const relativeRef = useRef<HTMLDivElement | null>(null);
    const submenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const shareItemRef = useRef<HTMLDivElement | null>(null);
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

    const isIconTrigger = motionConfig.dropdownTriggerVariant === 'icon';
    const showIcons = motionConfig.dropdownShowItemIcons;
    const showSubmenu = motionConfig.dropdownShowSubmenu;

    // Panel typography: inherit fontFamily/fontSize/fontWeight from panelStyle
    const itemLabelStyle: CSSProperties = {
        fontSize: panelStyle.fontSize,
        fontWeight: panelStyle.fontWeight,
        fontFamily: panelStyle.fontFamily,
    };

    useEffect(() => {
        if (!isOpen || pinnedOpen) {
            return;
        }
        const onPointerDown = (event: PointerEvent) => {
            if (containerRef.current?.contains(event.target as Node)) {
                return;
            }
            setIsOpen(false);
            setSubmenuOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
        };
    }, [isOpen, pinnedOpen]);

    useEffect(() => {
        if (!menuOpen) {
            setSubmenuOpen(false);
        }
    }, [menuOpen]);

    // Submenu hover timers
    const clearSubmenuTimer = useCallback(() => {
        if (submenuTimerRef.current) {
            clearTimeout(submenuTimerRef.current);
            submenuTimerRef.current = null;
        }
    }, []);

    const startSubmenuClose = useCallback(() => {
        clearSubmenuTimer();
        submenuTimerRef.current = setTimeout(() => setSubmenuOpen(false), 200);
    }, [clearSubmenuTimer]);

    const handleSubmenuAreaEnter = useCallback(() => {
        clearSubmenuTimer();
        setSubmenuOpen(true);
    }, [clearSubmenuTimer]);

    useEffect(() => {
        return () => clearSubmenuTimer();
    }, [clearSubmenuTimer]);

    // Compute submenu position relative to the share item's ListBoxItem parent
    const [submenuPos, setSubmenuPos] = useState<{ top: number; left: number } | null>(null);
    useEffect(() => {
        if (submenuOpen && shareItemRef.current && relativeRef.current) {
            // Walk up to the ListBoxItem element (the closest rendered item ancestor)
            const itemEl = shareItemRef.current.closest('[role="option"]') ?? shareItemRef.current.parentElement?.parentElement;
            const rect = (itemEl ?? shareItemRef.current).getBoundingClientRect();
            const parentRect = relativeRef.current.getBoundingClientRect();
            setSubmenuPos({
                top: rect.top - parentRect.top,
                left: rect.right - parentRect.left + 4,
            });
        }
    }, [submenuOpen]);

    const panelFontColor = panelStyle.color as string | undefined;
    const iconColorStyle: CSSProperties | undefined = panelFontColor ? { color: panelFontColor } : undefined;
    const iconSize = 'size-4';
    const dropdownBodyPreviewMotion = buildPreviewMotionProps(dropdownBodyMotionConfig, { allowEntry: true, allowInteraction: false });

    const renderItemContent = (label: string, icon?: React.ReactNode, keyboard?: string) => {
        const content = showIcons && icon ? (
            <span className="inline-flex items-center gap-2">
                {icon}
                <span style={itemLabelStyle}>{label}</span>
            </span>
        ) : (
            <span style={itemLabelStyle}>{label}</span>
        );

        return (
            <>
                <DropdownLabel>
                    {renderWithMotionControls(content, dropdownOptionMotionConfig, false, true)}
                </DropdownLabel>
                {keyboard ? <DropdownKeyboard>{keyboard}</DropdownKeyboard> : null}
            </>
        );
    };

    const triggerButton = isIconTrigger ? (
        <Button
            variant="ghost"
            size="icon"
            style={triggerStyle}
            disabled={motionConfig.buttonPreviewState === 'disabled'}
            className={cn('h-9 w-9', BUTTON_STATE_CLASS_NAME, buttonPreviewStateClass, triggerClassName)}
            onClick={() => {
                if (pinnedOpen) return;
                setIsOpen((current) => !current);
            }}
        >
            <MoreVertical className="size-4" />
        </Button>
    ) : (
        <Button
            variant="secondary"
            size="sm"
            style={triggerStyle}
            disabled={motionConfig.buttonPreviewState === 'disabled'}
            className={cn(BUTTON_STATE_CLASS_NAME, buttonPreviewStateClass, triggerClassName)}
            onClick={() => {
                if (pinnedOpen) return;
                setIsOpen((current) => !current);
            }}
        >
            {withIcon(
                pinnedOpen ? 'Menu pinned' : isOpen ? 'Close menu' : 'Menu trigger',
                iconNode,
                iconPosition,
            )}
        </Button>
    );

    return (
        <div
            ref={containerRef}
            className="flex w-full justify-center py-14"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
        >
            <div ref={relativeRef} className="relative inline-flex">
                {renderWithMotionControls(triggerButton, motionConfig, false, true)}
                <AnimatePresence>
                    {menuOpen ? (
                        <div style={menuStyle}>
                            <motion.div
                                key={`${instanceId}-dropdown-menu`}
                                initial={dropdownBodyPreviewMotion.initial}
                                animate={dropdownBodyPreviewMotion.animate}
                                whileInView={dropdownBodyPreviewMotion.whileInView}
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
                                transition={dropdownBodyPreviewMotion.transition}
                                viewport={dropdownBodyPreviewMotion.viewport}
                                style={dropdownBodyPreviewMotion.style}
                            >
                                <ListBox
                                    aria-label="Dropdown preview"
                                    selectionMode="single"
                                    className="grid min-w-[220px] grid-cols-[auto_1fr] gap-y-1 rounded-xl p-1"
                                    style={panelStyle}
                                >
                                    <DropdownItem id={`${instanceId}-edit`} className={dropdownHoverClass} onAction={() => !pinnedOpen && setIsOpen(false)}>
                                        {renderItemContent('Edit component', <Pencil className={iconSize} style={iconColorStyle} />, '⌘E')}
                                    </DropdownItem>
                                    <DropdownItem id={`${instanceId}-duplicate`} className={dropdownHoverClass} onAction={() => !pinnedOpen && setIsOpen(false)}>
                                        {renderItemContent('Duplicate', <Copy className={iconSize} style={iconColorStyle} />)}
                                    </DropdownItem>
                                    {showSubmenu ? (
                                        <DropdownItem
                                            id={`${instanceId}-share`}
                                            className={cn(dropdownHoverClass, 'pr-1')}
                                            onHoverStart={() => handleSubmenuAreaEnter()}
                                            onHoverEnd={() => startSubmenuClose()}
                                        >
                                            <DropdownLabel>
                                                {renderWithMotionControls(
                                                    <span
                                                        ref={shareItemRef}
                                                        className="inline-flex w-full items-center justify-between gap-2"
                                                    >
                                                        <span className="inline-flex items-center gap-2">
                                                            {showIcons ? <Share className={iconSize} style={iconColorStyle} /> : null}
                                                            <span style={itemLabelStyle}>Share</span>
                                                        </span>
                                                        <ChevronRight className="size-3.5" style={iconColorStyle} />
                                                    </span>,
                                                    dropdownOptionMotionConfig,
                                                    false,
                                                    true,
                                                )}
                                            </DropdownLabel>
                                        </DropdownItem>
                                    ) : null}
                                    <DropdownSeparator />
                                    <DropdownItem
                                        id={`${instanceId}-delete`}
                                        intent="danger"
                                        className={dropdownHoverClass}
                                        onAction={() => !pinnedOpen && setIsOpen(false)}
                                    >
                                        {renderItemContent('Delete', <Trash2 className={iconSize} style={iconColorStyle} />)}
                                    </DropdownItem>
                                </ListBox>
                            </motion.div>
                        </div>
                    ) : null}
                </AnimatePresence>

                {/* Submenu rendered OUTSIDE the ListBox to avoid React Aria focus conflicts */}
                <AnimatePresence>
                    {menuOpen && showSubmenu && submenuOpen && submenuPos ? (
                        <motion.div
                            key={`${instanceId}-submenu`}
                            className="absolute z-30"
                            style={{ top: submenuPos.top, left: submenuPos.left }}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -4 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            onMouseEnter={handleSubmenuAreaEnter}
                            onMouseLeave={startSubmenuClose}
                        >
                            <div
                                className="min-w-[160px] space-y-0.5 rounded-xl p-1"
                                style={panelStyle}
                            >
                                <button
                                    type="button"
                                    className={cn(
                                        'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors',
                                        dropdownHoverClass,
                                    )}
                                    onClick={() => { if (!pinnedOpen) { setSubmenuOpen(false); setIsOpen(false); } }}
                                >
                                    {showIcons ? <Users className={iconSize} style={iconColorStyle} /> : null}
                                    <span style={itemLabelStyle}>Team</span>
                                </button>
                                <button
                                    type="button"
                                    className={cn(
                                        'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors',
                                        dropdownHoverClass,
                                    )}
                                    onClick={() => { if (!pinnedOpen) { setSubmenuOpen(false); setIsOpen(false); } }}
                                >
                                    {showIcons ? <Mail className={iconSize} style={iconColorStyle} /> : null}
                                    <span style={itemLabelStyle}>Email</span>
                                </button>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}
