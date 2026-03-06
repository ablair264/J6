import React, { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FileText, FolderOpen, Settings, Users, Bookmark, Globe, Shield, Zap, Mail, MessageCircle, PhoneCall } from 'lucide-react';
import { Checkbox as CheckboxPrimitive, Dialog as RadixDialogPrimitive } from 'radix-ui';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { DataTable } from '@/components/ui/data-table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AnimatedText } from '@/components/ui/animated-text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownItem,
    DropdownKeyboard,
    DropdownLabel,
} from '@/components/ui/dropdown';
import { ListBox } from 'react-aria-components';
import { cn } from '@/lib/utils';
import type { ComponentInstance, ComponentStyleConfig, UIComponentKind } from '@/components/ui/ui-studio.types';
import type { StudioTokenSet } from '@/components/ui/token-sets';
import {
    BUTTON_STATE_CLASS_NAME,
    PRESET_CHECKBOX_INDICATOR_SIZE,
    normalizeStyleConfig,
    SIZE_SCALE,
    mapSizeOptionToButtonSize,
    buildButtonPreviewStateClass,
} from '../constants';
import {
    buildPanelStyle,
    buildDropdownMenuPositionStyle,
    buildPrimitivePlacement,
    buildExtractedEffectsClassName,
    buildMotionClassName,
    buildPreviewPresentation,
    buildComponentWrapperStyle,
    extractTextStyle,
    getComponentVisualPreset,
    iconSnippet,
    renderConfiguredIcon,
    renderLoadingStateIcon,
    renderCheckboxSelectionIndicator,
    withIcon,
    styleToCode,
    buildSnippetStyleAttr,
    buildSnippetStyleBindings,
    buildSnippetClassNameAttr,
    buildSnippetClassNameVarAttr,
    buildExportClassBinding,
    buildCardDirectStyle,
    loadGoogleFont,
    hexToRgba,
} from '../utilities';
import {
    AdvancedHoverWrapper,
    buildEntryPresetMotionConfig,
    buildMotionTransition,
    hasAdvancedHoverEnabled,
    renderEntryMotion,
    renderStaggeredChildren,
    renderWithMotionControls,
} from '../motion';
import { AlertPreview } from './alert-preview';
import { DrawerPreview } from './drawer-preview';
import { InteractiveDropdownPreview } from './dropdown-preview';
import { NavigationMenuPreview } from './navigation-menu-preview';
import type { ExportStyleMode } from '../utilities';

const MotionTooltipTrigger = motion.create(TooltipTrigger);

// ─── Avatar Popover Preview ─────────────────────────────────────────────────

interface AvatarPopoverUser {
    name: string;
    initials: string;
    role: string;
    image?: string;
}

const AVATAR_DEMO_USERS: AvatarPopoverUser[] = [
    { name: 'Casey North', initials: 'CN', role: 'Designer' },
    { name: 'Lara Reed', initials: 'LR', role: 'Engineer' },
    { name: 'Evan Ross', initials: 'ER', role: 'Product' },
    { name: 'Nia Holt', initials: 'NH', role: 'Marketing' },
    { name: 'Alex Kim', initials: 'AK', role: 'Sales' },
    { name: 'Sam Chen', initials: 'SC', role: 'Support' },
    { name: 'Jo Park', initials: 'JP', role: 'Analytics' },
    { name: 'Max Wu', initials: 'MW', role: 'DevOps' },
];

function buildAvatarPopoverStyle(s: ComponentStyleConfig): CSSProperties {
    const popoverBgAlpha = s.avatarPopoverBgOpacity / 100;
    const popoverBg = s.avatarPopoverBgMode === 'gradient'
        ? `linear-gradient(135deg, ${hexToRgba(s.avatarPopoverBgColor, popoverBgAlpha)} 0%, ${hexToRgba(s.avatarPopoverBgColorTo, popoverBgAlpha)} 100%)`
        : hexToRgba(s.avatarPopoverBgColor, popoverBgAlpha);
    const popoverBorder = s.avatarPopoverStrokeWeight > 0
        ? `${s.avatarPopoverStrokeWeight}px solid ${hexToRgba(s.avatarPopoverStrokeColor, s.avatarPopoverStrokeOpacity / 100)}`
        : 'none';
    return {
        width: s.avatarPopoverWidth,
        padding: s.avatarPopoverPadding,
        borderRadius: s.avatarPopoverRadius,
        background: popoverBg,
        border: popoverBorder,
        backdropFilter: 'blur(8px)',
        ...(s.avatarPopoverFontFamily ? { fontFamily: s.avatarPopoverFontFamily } : {}),
        fontSize: s.avatarPopoverFontSize,
        fontWeight: s.avatarPopoverFontBold ? 700 : s.avatarPopoverFontWeight,
        color: s.avatarPopoverFontColor,
        ...(s.avatarPopoverFontItalic ? { fontStyle: 'italic' as const } : {}),
        ...(s.avatarPopoverFontUnderline ? { textDecoration: 'underline' } : {}),
    };
}

function buildAvatarProps(s: ComponentStyleConfig) {
    const hasImage = !!s.avatarSrc;
    return {
        customSize: s.avatarCustomSize,
        radius: s.avatarRadius,
        bgColor: hasImage ? undefined : s.avatarBgColor,
        bgGradientTo: hasImage ? undefined : s.avatarBgColorTo,
        bgMode: s.avatarBgMode as 'solid' | 'gradient',
        bgOpacity: hasImage ? undefined : s.avatarBgOpacity,
        strokeWeight: s.avatarStrokeWeight,
        strokeColor: s.avatarStrokeColor,
        strokeOpacity: s.avatarStrokeOpacity,
        badge: s.avatarShowBadge,
        badgeColor: s.avatarBadgeColor,
    };
}

function buildAvatarHoverMotion(s: ComponentStyleConfig) {
    if (s.motionHoverEnabled) {
        return {
            scale: s.motionHoverScale / 100,
            x: s.motionHoverX,
            y: s.motionHoverY,
            rotate: s.motionHoverRotate,
            opacity: s.motionHoverOpacity / 100,
            transition: buildMotionTransition(s, 'hover'),
        };
    }
    if (s.avatarPopoverEnabled) {
        return { y: -2, scale: 1.06 };
    }
    return undefined;
}

function buildAvatarTapMotion(s: ComponentStyleConfig) {
    if (s.motionTapEnabled) {
        return {
            scale: s.motionTapScale / 100,
            x: s.motionTapX,
            y: s.motionTapY,
            rotate: s.motionTapRotate,
            opacity: s.motionTapOpacity / 100,
            transition: buildMotionTransition(s, 'tap'),
        };
    }
    return undefined;
}

// ─── Single Avatar Preview (with popover support) ───────────────────────────

function AvatarSinglePreview({ instance, motionClassName }: { instance: ComponentInstance; motionClassName?: string }) {
    const s = instance.style;
    const [hovered, setHovered] = useState(false);
    const closeTimer = useRef<number | null>(null);

    const clearCloseTimer = useCallback(() => {
        if (closeTimer.current !== null) {
            window.clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    }, []);

    const openCard = useCallback(() => {
        clearCloseTimer();
        setHovered(true);
    }, [clearCloseTimer]);

    const closeCardWithDelay = useCallback((delayMs?: number) => {
        clearCloseTimer();
        closeTimer.current = window.setTimeout(() => {
            setHovered(false);
        }, delayMs ?? s.avatarPopoverDelay);
    }, [clearCloseTimer, s.avatarPopoverDelay]);

    useEffect(() => clearCloseTimer, [clearCloseTimer]);

    if (s.avatarFontFamily) loadGoogleFont(s.avatarFontFamily);
    if (s.avatarPopoverFontFamily) loadGoogleFont(s.avatarPopoverFontFamily);

    const hasImage = !!s.avatarSrc;
    const avatarProps = buildAvatarProps(s);
    const popoverStyle = buildAvatarPopoverStyle(s);

    return (
        <motion.div
            className="relative"
            whileHover={buildAvatarHoverMotion(s)}
            whileTap={buildAvatarTapMotion(s)}
            transition={{ type: 'spring', stiffness: 360, damping: 18 }}
            onMouseEnter={() => s.avatarPopoverEnabled && openCard()}
            onMouseLeave={() => s.avatarPopoverEnabled && closeCardWithDelay()}
        >
            <Avatar {...avatarProps} className={cn(motionClassName)}>
                {hasImage ? (
                    <AvatarImage
                        src={s.avatarSrc}
                        alt="User"
                        imageOpacity={s.avatarImageOpacity}
                        overlayColor={s.avatarOverlayColor}
                        overlayOpacity={s.avatarOverlayOpacity}
                    />
                ) : null}
                <AvatarFallback
                    fontFamily={s.avatarFontFamily}
                    fontSize={s.avatarFontSize}
                    fontColor={s.avatarFontColor}
                    fontBold={s.avatarFontBold}
                    fontItalic={s.avatarFontItalic}
                    fontUnderline={s.avatarFontUnderline}
                >
                    {s.avatarFallbackText}
                </AvatarFallback>
            </Avatar>

            <AnimatePresence>
                {s.avatarPopoverEnabled && hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 14, scale: 0.92 }}
                        animate={{ opacity: 1, y: -10, scale: 1, transition: { type: 'spring', stiffness: 420, damping: 24 } }}
                        exit={{ opacity: 0, y: 6, scale: 0.96, transition: { duration: 0.16 } }}
                        className="pointer-events-auto absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 shadow-xl"
                        style={popoverStyle}
                        onMouseEnter={() => openCard()}
                        onMouseLeave={() => closeCardWithDelay(s.avatarPopoverDelay + 40)}
                    >
                        <div className="flex items-center gap-2.5">
                            <Avatar customSize={36} radius={s.avatarRadius} bgColor={hasImage ? undefined : s.avatarBgColor}>
                                {hasImage ? <AvatarImage src={s.avatarSrc} alt="User" /> : null}
                                <AvatarFallback fontSize={12} fontColor={s.avatarFontColor} fontBold>{s.avatarFallbackText}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold leading-none" style={{ fontSize: s.avatarPopoverFontSize }}>{s.avatarFallbackText}</p>
                                <p className="mt-1 truncate opacity-60" style={{ fontSize: Math.max(10, s.avatarPopoverFontSize - 2) }}>Team Member</p>
                                <div className="mt-1.5 inline-flex items-center gap-2 opacity-70">
                                    <button type="button" className="inline-flex items-center justify-center rounded-md p-1 transition-colors hover:opacity-100">
                                        <MessageCircle style={{ width: s.avatarPopoverIconSize, height: s.avatarPopoverIconSize, color: s.avatarPopoverIconColor }} />
                                    </button>
                                    <button type="button" className="inline-flex items-center justify-center rounded-md p-1 transition-colors hover:opacity-100">
                                        <Mail style={{ width: s.avatarPopoverIconSize, height: s.avatarPopoverIconSize, color: s.avatarPopoverIconColor }} />
                                    </button>
                                    <button type="button" className="inline-flex items-center justify-center rounded-md p-1 transition-colors hover:opacity-100">
                                        <PhoneCall style={{ width: s.avatarPopoverIconSize, height: s.avatarPopoverIconSize, color: s.avatarPopoverIconColor }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Avatar Group Preview ───────────────────────────────────────────────────

function AvatarGroupPreview({ instance, motionClassName }: { instance: ComponentInstance; motionClassName?: string }) {
    const s = instance.style;
    const [activeUser, setActiveUser] = useState<string | null>(null);
    const closeTimer = useRef<number | null>(null);

    const clearCloseTimer = useCallback(() => {
        if (closeTimer.current !== null) {
            window.clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    }, []);

    const openCard = useCallback((name: string) => {
        clearCloseTimer();
        setActiveUser(name);
    }, [clearCloseTimer]);

    const closeCardWithDelay = useCallback((name: string, delayMs?: number) => {
        clearCloseTimer();
        closeTimer.current = window.setTimeout(() => {
            setActiveUser((current) => (current === name ? null : current));
        }, delayMs ?? s.avatarPopoverDelay);
    }, [clearCloseTimer, s.avatarPopoverDelay]);

    useEffect(() => clearCloseTimer, [clearCloseTimer]);

    if (s.avatarFontFamily) loadGoogleFont(s.avatarFontFamily);
    if (s.avatarPopoverFontFamily) loadGoogleFont(s.avatarPopoverFontFamily);

    const visibleUsers = AVATAR_DEMO_USERS.slice(0, s.avatarGroupCount);
    const hasImage = !!s.avatarSrc;
    const avatarProps = buildAvatarProps(s);
    const popoverStyle = buildAvatarPopoverStyle(s);

    const renderGroupAvatar = (user: AvatarPopoverUser, index: number) => {
        const userImage = index === 0 && s.avatarSrc ? s.avatarSrc : user.image;
        const showImage = !!userImage;

        return (
            <motion.div
                key={user.name}
                className="relative"
                whileHover={buildAvatarHoverMotion(s)}
                whileTap={buildAvatarTapMotion(s)}
                transition={{ type: 'spring', stiffness: 360, damping: 18 }}
                onMouseEnter={() => s.avatarPopoverEnabled && openCard(user.name)}
                onMouseLeave={() => s.avatarPopoverEnabled && closeCardWithDelay(user.name)}
            >
                <Avatar {...avatarProps} className={cn(motionClassName)}>
                    {showImage ? (
                        <AvatarImage
                            src={userImage}
                            alt={user.name}
                            imageOpacity={s.avatarImageOpacity}
                            overlayColor={s.avatarOverlayColor}
                            overlayOpacity={s.avatarOverlayOpacity}
                        />
                    ) : null}
                    <AvatarFallback
                        fontFamily={s.avatarFontFamily}
                        fontSize={s.avatarFontSize}
                        fontColor={s.avatarFontColor}
                        fontBold={s.avatarFontBold}
                        fontItalic={s.avatarFontItalic}
                        fontUnderline={s.avatarFontUnderline}
                    >
                        {user.initials}
                    </AvatarFallback>
                </Avatar>

                <AnimatePresence>
                    {s.avatarPopoverEnabled && activeUser === user.name && (
                        <motion.div
                            initial={{ opacity: 0, y: 14, scale: 0.92 }}
                            animate={{ opacity: 1, y: -10, scale: 1, transition: { type: 'spring', stiffness: 420, damping: 24 } }}
                            exit={{ opacity: 0, y: 6, scale: 0.96, transition: { duration: 0.16 } }}
                            className="pointer-events-auto absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 shadow-xl"
                            style={popoverStyle}
                            onMouseEnter={() => openCard(user.name)}
                            onMouseLeave={() => closeCardWithDelay(user.name, s.avatarPopoverDelay + 40)}
                        >
                            <div className="flex items-center gap-2.5">
                                <Avatar customSize={36} radius={s.avatarRadius} bgColor={hasImage ? undefined : s.avatarBgColor}>
                                    {showImage ? <AvatarImage src={userImage} alt={user.name} /> : null}
                                    <AvatarFallback fontSize={12} fontColor={s.avatarFontColor} fontBold>{user.initials}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold leading-none" style={{ fontSize: s.avatarPopoverFontSize }}>{user.name}</p>
                                    <p className="mt-1 truncate opacity-60" style={{ fontSize: Math.max(10, s.avatarPopoverFontSize - 2) }}>{user.role}</p>
                                    <div className="mt-1.5 inline-flex items-center gap-2 opacity-70">
                                        <button type="button" className="inline-flex items-center justify-center rounded-md p-1 transition-colors hover:opacity-100">
                                            <MessageCircle style={{ width: s.avatarPopoverIconSize, height: s.avatarPopoverIconSize, color: s.avatarPopoverIconColor }} />
                                        </button>
                                        <button type="button" className="inline-flex items-center justify-center rounded-md p-1 transition-colors hover:opacity-100">
                                            <Mail style={{ width: s.avatarPopoverIconSize, height: s.avatarPopoverIconSize, color: s.avatarPopoverIconColor }} />
                                        </button>
                                        <button type="button" className="inline-flex items-center justify-center rounded-md p-1 transition-colors hover:opacity-100">
                                            <PhoneCall style={{ width: s.avatarPopoverIconSize, height: s.avatarPopoverIconSize, color: s.avatarPopoverIconColor }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    return (
        <AvatarGroup spacing={s.avatarGroupSpacing}>
            {visibleUsers.map((user, i) => renderGroupAvatar(user, i))}
            {visibleUsers.length < AVATAR_DEMO_USERS.length && (
                <AvatarGroupCount
                    size={s.avatarCustomSize}
                    radius={s.avatarRadius}
                    fontSize={s.avatarFontSize * 0.75}
                >
                    +{AVATAR_DEMO_USERS.length - visibleUsers.length}
                </AvatarGroupCount>
            )}
        </AvatarGroup>
    );
}

type CardSection = { key: string; node: ReactNode };

function hasCardContent(value: string | undefined): boolean {
    return Boolean(value?.trim());
}

function buildCardSectionStack(
    sections: CardSection[],
    showDividers: boolean,
    dividerColor: string,
    dividerWidth: number,
): ReactNode[] {
    const visibleSections = sections.filter((section) => section.node !== null);
    return visibleSections.flatMap((section, index) => {
        const nodes: ReactNode[] = [];
        if (index > 0 && showDividers) {
            nodes.push(
                <div
                    key={`divider-${section.key}`}
                    className="w-full rounded-full"
                    style={{
                        height: `${Math.max(1, dividerWidth)}px`,
                        backgroundColor: dividerColor,
                    }}
                />,
            );
        }
        nodes.push(
            <React.Fragment key={section.key}>
                {section.node}
            </React.Fragment>,
        );
        return nodes;
    });
}

export function componentSnippet(
    instance: ComponentInstance,
    previewStyle: CSSProperties,
    _motionClassName?: string,
    styleMode: ExportStyleMode = 'inline',
    tokenSet?: StudioTokenSet,
): string {
    const previewBindings = buildSnippetStyleBindings(previewStyle, styleMode, 'preview', tokenSet);
    const panelBindings = buildSnippetStyleBindings(buildPanelStyle(instance.style), styleMode, 'content', tokenSet);
    const previewStyleSnippet = buildSnippetStyleAttr(previewBindings.styleVarName);
    const previewClassNameVar = styleMode === 'tailwind' ? previewBindings.classVarName : undefined;
    const contentStyleSnippet = buildSnippetStyleAttr(panelBindings.styleVarName);
    const contentClassNameVar = styleMode === 'tailwind' ? panelBindings.classVarName : undefined;
    const componentClassName = cn(
        getComponentVisualPreset(instance.kind, instance.style.componentPreset)?.className,
        buildMotionClassName(instance.kind, instance.style.motionPreset),
    );
    const effectClassName = buildExtractedEffectsClassName(instance.kind, instance.style);
    const rootClassBinding = buildExportClassBinding('root', {
        componentClassName,
        effectClassName,
        styleClassVarName: previewClassNameVar,
    });
    const buttonClassBinding = buildExportClassBinding('button', {
        componentClassName,
        effectClassName,
        extraClassNames: [BUTTON_STATE_CLASS_NAME],
        styleClassVarName: previewClassNameVar,
    });
    const checkboxClassBinding = buildExportClassBinding('checkbox', {
        componentClassName,
        effectClassName,
        styleClassVarName: previewClassNameVar,
    });
    const sliderClassBinding = buildExportClassBinding('slider', {
        componentClassName,
        effectClassName,
    });
    const classNameSnippet = buildSnippetClassNameVarAttr(rootClassBinding.classNameVar);
    const buttonClassNameSnippet = buildSnippetClassNameVarAttr(buttonClassBinding.classNameVar);
    const checkboxClassNameSnippet = buildSnippetClassNameVarAttr(checkboxClassBinding.classNameVar);
    const sliderClassNameSnippet = buildSnippetClassNameVarAttr(sliderClassBinding.classNameVar);

    const badgeText = instance.style.badgeShowText ? 'Badge token' : '';
    const buttonText = instance.style.buttonShowText ? 'Primary action' : '';
    const icon = iconSnippet(instance.style);
    const iconLeft = icon ? `${icon} ` : '';
    const iconRight = icon ? ` ${icon}` : '';
    const dropdownPositionStyleCode = styleToCode(buildDropdownMenuPositionStyle(instance.style));
    const tooltipPlacement = buildPrimitivePlacement(instance.style.tooltipSide, instance.style.tooltipAlign);
    const checkboxDefaultChecked =
        instance.style.checkboxState === 'indeterminate'
            ? "'indeterminate'"
            : instance.style.checkboxState === 'checked'
                ? 'true'
                : 'false';
    const labelFor = instance.style.labelFor.trim() || 'field-id';
    const safeLabelText = instance.style.labelText.replace(/'/g, "\\'");
    const safeCheckboxName = instance.style.checkboxName.replace(/'/g, "\\'");
    const safeCheckboxValue = instance.style.checkboxValue.replace(/'/g, "\\'");
    const dropdownHoverClass =
        'data-[hovered]:!bg-[var(--ui-dropdown-hover-bg)] data-[focused]:!bg-[var(--ui-dropdown-hover-bg)] data-[hovered]:!text-[var(--ui-dropdown-hover-fg)] data-[focused]:!text-[var(--ui-dropdown-hover-fg)]';

    switch (instance.kind) {
        case 'accordion': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const accProps = [
                instance.style.accordionAllowMultiple ? 'type="multiple"' : 'type="single"',
                !instance.style.accordionAllowMultiple ? `collapsible={${String(instance.style.accordionCollapsible)}}` : '',
                instance.style.accordionDividerColor ? `dividerColor="${instance.style.accordionDividerColor}"` : '',
                !instance.style.accordionDividerEnabled ? 'dividerEnabled={false}' : '',
                instance.style.accordionDividerWeight !== 1 ? `dividerWeight={${instance.style.accordionDividerWeight}}` : '',
                instance.style.accordionPaddingH !== 16 ? `paddingH={${instance.style.accordionPaddingH}}` : '',
                instance.style.accordionPaddingW !== 16 ? `paddingW={${instance.style.accordionPaddingW}}` : '',
                instance.style.accordionSpacing ? `spacing={${instance.style.accordionSpacing}}` : '',
                classNameSnippet.trim(),
            ].filter(Boolean).join('\n  ');
            return `${declarations ? `${declarations}\n\n` : ''}<Accordion\n  ${accProps}${previewStyleSnippet}\n>\n  <AccordionItem value="item-1">\n    <AccordionTrigger>Section 1</AccordionTrigger>\n    <AccordionContent>Content for section 1.</AccordionContent>\n  </AccordionItem>\n</Accordion>`;
        }
        case 'alert': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const alertProps = [
                `variant="${instance.style.alertVariant}"`,
                `dismissible={${String(instance.style.alertDismissible)}}`,
                instance.style.alertShowIcon ? '' : 'showIcon={false}',
                instance.style.alertDismissible
                    ? `dismissMotion={{ hoverEnabled: ${String(instance.style.alertCloseHoverEnabled)}, hoverScale: ${instance.style.alertCloseHoverScale}, tapEnabled: ${String(instance.style.alertCloseTapEnabled)}, tapScale: ${instance.style.alertCloseTapScale} }}`
                    : '',
            ].filter(Boolean).join('\n  ');
            return `${declarations ? `${declarations}\n\n` : ''}<Alert\n  ${alertProps}${classNameSnippet}${previewStyleSnippet}\n>\n  <AlertTitle>Alert Title</AlertTitle>\n  <AlertDescription>This is an alert message.</AlertDescription>\n</Alert>`;
        }
        case 'avatar': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const avatarPropsSnippet = [
                `customSize={${instance.style.avatarCustomSize}}`,
                `radius={${instance.style.avatarRadius}}`,
                instance.style.avatarShowBadge ? `badge badgeColor="${instance.style.avatarBadgeColor}"` : '',
                instance.style.avatarStrokeWeight > 0 ? `strokeWeight={${instance.style.avatarStrokeWeight}} strokeColor="${instance.style.avatarStrokeColor}"` : '',
            ].filter(Boolean).join(' ');
            const exportSrc = instance.style.avatarSrc?.startsWith('data:') ? '/images/avatar.jpg' : instance.style.avatarSrc;
            const imageSnippet = instance.style.avatarSrc
                ? `\n  <AvatarImage src="${exportSrc}" alt="User"${instance.style.avatarImageOpacity < 100 ? ` imageOpacity={${instance.style.avatarImageOpacity}}` : ''} />`
                : '';
            const fallbackSnippet = `\n  <AvatarFallback>${instance.style.avatarFallbackText}</AvatarFallback>`;
            return `${declarations ? `${declarations}\n\n` : ''}<Avatar ${avatarPropsSnippet}${classNameSnippet}${previewStyleSnippet}>${imageSnippet}${fallbackSnippet}\n</Avatar>`;
        }
        case 'avatar-group': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const avatarPropsSnippet = [
                `customSize={${instance.style.avatarCustomSize}}`,
                `radius={${instance.style.avatarRadius}}`,
                instance.style.avatarShowBadge ? `badge badgeColor="${instance.style.avatarBadgeColor}"` : '',
                instance.style.avatarStrokeWeight > 0 ? `strokeWeight={${instance.style.avatarStrokeWeight}} strokeColor="${instance.style.avatarStrokeColor}"` : '',
            ].filter(Boolean).join(' ');
            const fallbackSnippet = `\n    <AvatarFallback>JD</AvatarFallback>`;
            const singleAvatar = `  <Avatar ${avatarPropsSnippet}>${fallbackSnippet}\n  </Avatar>`;
            const avatars = Array.from({ length: instance.style.avatarGroupCount }, () => singleAvatar).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<AvatarGroup spacing={${instance.style.avatarGroupSpacing}}>\n${avatars}\n</AvatarGroup>`;
        }
        case 'badge': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<Badge${classNameSnippet}${previewStyleSnippet}>${instance.style.iconPosition === 'left' ? iconLeft : ''}${badgeText}${instance.style.iconPosition === 'right' ? iconRight : ''}</Badge>`;
        }
        case 'button': {
            const declarations = [previewBindings.declarations, buttonClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<Button intent="primary" size="md"${buttonClassNameSnippet}${previewStyleSnippet}>\n  ${instance.style.iconPosition === 'left' ? `${iconLeft}` : ''}${buttonText}${instance.style.iconPosition === 'right' ? `${iconRight}` : ''}\n</Button>`;
        }
        case 'checkbox': {
            const cbLabel = instance.style.checkboxLabel || 'Enable notifications';
            const declarations = [previewBindings.declarations, checkboxClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<div className="flex items-center gap-2">\n  <Checkbox\n    id="checkbox-demo"\n    defaultChecked={${checkboxDefaultChecked}}\n    disabled={${String(instance.style.checkboxDisabled)}}\n    required={${String(instance.style.checkboxRequired)}}\n    name="${safeCheckboxName}"\n    value="${safeCheckboxValue}"\n    ${checkboxClassNameSnippet.trim()}${previewStyleSnippet}\n  />\n  <Label htmlFor="checkbox-demo">${cbLabel}</Label>\n</div>`;
        }
        case 'dialog': {
            const dialogDeclarations = [previewBindings.declarations, panelBindings.declarations, buttonClassBinding.declarations].filter(Boolean).join('\n');
            return `${dialogDeclarations ? `${dialogDeclarations}\n\n` : ''}<DialogTrigger defaultOpen={${String(instance.style.dialogDefaultOpen)}}>\n  <Button intent="primary"${buttonClassNameSnippet}${previewStyleSnippet}>Open dialog</Button>\n  <ModalOverlay isDismissable={${String(!instance.style.dialogModal)}}>\n    <Modal>\n      <Dialog${buildSnippetClassNameAttr(undefined, contentClassNameVar)}${contentStyleSnippet}>...</Dialog>\n    </Modal>\n  </ModalOverlay>\n</DialogTrigger>`;
        }
        case 'dropdown': {
            const dropdownDeclarations = [previewBindings.declarations, panelBindings.declarations, buttonClassBinding.declarations, `const dropdownPositionStyle = ${dropdownPositionStyleCode};`]
                .filter(Boolean)
                .join('\n');
            const dropdownListClassNameSnippet = buildSnippetClassNameAttr(
                'grid min-w-[220px] grid-cols-[auto_1fr] gap-y-1 rounded-xl p-1',
                contentClassNameVar,
            );
            return `${dropdownDeclarations}\n\n<div className="flex w-full justify-center py-14">\n  <div className="relative inline-flex">\n    <Button intent="secondary" size="sm"${buttonClassNameSnippet}${previewStyleSnippet}>Menu trigger</Button>\n    <div style={dropdownPositionStyle}>\n      <ListBox aria-label="Dropdown preview"${dropdownListClassNameSnippet}${contentStyleSnippet}>\n        <DropdownItem id="edit" className="${dropdownHoverClass}">\n          <DropdownLabel>${instance.style.iconPosition === 'left' ? iconLeft : ''}Edit component${instance.style.iconPosition === 'right' ? iconRight : ''}</DropdownLabel>\n          <DropdownKeyboard>⌘E</DropdownKeyboard>\n        </DropdownItem>\n      </ListBox>\n    </div>\n  </div>\n</div>`;
        }
        case 'popover': {
            const popoverDeclarations = [previewBindings.declarations, panelBindings.declarations, buttonClassBinding.declarations].filter(Boolean).join('\n');
            return `${popoverDeclarations}\n\n<Popover>\n  <PopoverTrigger${buttonClassNameSnippet}${previewStyleSnippet}>${instance.style.iconPosition === 'left' ? iconLeft : ''}Toggle popover${instance.style.iconPosition === 'right' ? iconRight : ''}</PopoverTrigger>\n  <PopoverContent${buildSnippetClassNameAttr(undefined, contentClassNameVar)}${contentStyleSnippet}>...</PopoverContent>\n</Popover>`;
        }
        case 'label':
            {
                const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
                return `${declarations ? `${declarations}\n\n` : ''}<div className="flex items-center justify-center">\n  <Label htmlFor="${labelFor}"${classNameSnippet}${previewStyleSnippet}>${instance.style.iconPosition === 'left' ? iconLeft : ''}${safeLabelText}${instance.style.iconPosition === 'right' ? iconRight : ''}</Label>\n  ${instance.style.labelShowField ? `<Input id="${labelFor}" placeholder="Linked field" />` : `<div id="${labelFor}" />`}\n</div>`;
            }
        case 'input': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<Input${classNameSnippet}${previewStyleSnippet} placeholder="Type here..." />`;
        }
        case 'tabs': {
            const tabDeclarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const listProps = [
                instance.style.tabsVariant !== 'default' ? `variant="${instance.style.tabsVariant}"` : '',
                instance.style.tabsListBg ? `listBg="${instance.style.tabsListBg}"` : '',
            ].filter(Boolean).join(' ');
            const listAttr = listProps ? ` ${listProps}` : '';
            const activeBgAttr = instance.style.tabsActiveBg ? ` activeBg="${instance.style.tabsActiveBg}"` : '';
            return `${tabDeclarations ? `${tabDeclarations}\n\n` : ''}<Tabs defaultValue="tab-1">\n  <TabsList${listAttr}>\n    <TabsTrigger value="tab-1"${activeBgAttr}${classNameSnippet}${previewStyleSnippet}>${instance.style.iconPosition === 'left' ? iconLeft : ''}Tab 1${instance.style.iconPosition === 'right' ? iconRight : ''}</TabsTrigger>\n    <TabsTrigger value="tab-2"${activeBgAttr}${classNameSnippet}${previewStyleSnippet}>Tab 2</TabsTrigger>\n  </TabsList>\n  <TabsContent value="tab-1">Tab content</TabsContent>\n</Tabs>`;
        }
        case 'tooltip': {
            const tooltipDeclarations = [previewBindings.declarations, panelBindings.declarations, buttonClassBinding.declarations].filter(Boolean).join('\n');
            return `${tooltipDeclarations}\n\n<Tooltip delay={${instance.style.tooltipDelay}}>\n  <TooltipTrigger${buttonClassNameSnippet}${previewStyleSnippet}>${instance.style.iconPosition === 'left' ? iconLeft : ''}Hover for tooltip${instance.style.iconPosition === 'right' ? iconRight : ''}</TooltipTrigger>\n  <TooltipContent arrow={${String(instance.style.tooltipArrow)}} placement="${tooltipPlacement}" offset={${instance.style.tooltipSideOffset}}${buildSnippetClassNameAttr(undefined, contentClassNameVar)}${contentStyleSnippet}>Tooltip copy</TooltipContent>\n</Tooltip>`;
        }
        case 'data-table': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const dtS = instance.style;
            const columnsSnippet = dtS.dataTableShowStatusBadge
                ? `columns={[{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status', variant: 'badge' }, { key: 'role', label: 'Role' }]}`
                : `columns={[{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }, { key: 'role', label: 'Role' }]}`;
            const dtProps = [
                columnsSnippet,
                `data={[{ name: 'Alice', status: 'Active', role: 'Admin' }]}`,
                `sortable={${String(dtS.dataTableSortable)}}`,
                `striped={${String(dtS.dataTableStriped)}}`,
                `size="${dtS.size}"`,
                dtS.dataTableVariant !== 'default' ? `variant="${dtS.dataTableVariant}"` : '',
                dtS.dataTableHeaderBg ? `headerBg="${dtS.dataTableHeaderBg}"` : '',
                dtS.dataTableRowBg ? `rowBg="${dtS.dataTableRowBg}"` : '',
                dtS.dataTableStripedBg && dtS.dataTableStriped ? `stripedBg="${dtS.dataTableStripedBg}"` : '',
                dtS.dataTableTextColor ? `textColor="${dtS.dataTableTextColor}"` : '',
                dtS.dataTableHeaderTextColor ? `headerTextColor="${dtS.dataTableHeaderTextColor}"` : '',
                dtS.dataTableBorderColor ? `borderColor="${dtS.dataTableBorderColor}"` : '',
                dtS.dataTableShowStatusBadge ? `badgeColors={{ Active: { bg: '${dtS.dataTableBadgeSuccessColor}20', text: '${dtS.dataTableBadgeSuccessColor}' }, Pending: { bg: '${dtS.dataTableBadgeWarningColor}20', text: '${dtS.dataTableBadgeWarningColor}' }, Inactive: { bg: '${dtS.dataTableBadgeErrorColor}20', text: '${dtS.dataTableBadgeErrorColor}' } }}` : '',
                classNameSnippet.trim(),
            ].filter(Boolean).join('\n  ');
            return `${declarations ? `${declarations}\n\n` : ''}<DataTable\n  ${dtProps}${previewStyleSnippet}\n/>`;
        }
        case 'drawer': {
            const drawerDeclarations = [previewBindings.declarations, panelBindings.declarations, buttonClassBinding.declarations].filter(Boolean).join('\n');
            return `${drawerDeclarations ? `${drawerDeclarations}\n\n` : ''}<Drawer>\n  <DrawerTrigger asChild>\n    <Button${buttonClassNameSnippet}${previewStyleSnippet}>Open drawer</Button>\n  </DrawerTrigger>\n  <DrawerContent side="${instance.style.drawerSide}"${buildSnippetClassNameAttr(undefined, contentClassNameVar)}${contentStyleSnippet}>\n    <DrawerHeader>\n      <DrawerTitle>Drawer</DrawerTitle>\n      <DrawerDescription>Drawer panel content.</DrawerDescription>\n    </DrawerHeader>\n  </DrawerContent>\n</Drawer>`;
        }
        case 'navigation-menu': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<NavigationMenu orientation="${instance.style.navMenuOrientation}"${classNameSnippet}${previewStyleSnippet}>\n  <NavigationMenuList>\n    <NavigationMenuItem>\n      <NavigationMenuLink active>Home</NavigationMenuLink>\n    </NavigationMenuItem>\n    <NavigationMenuItem>\n      <NavigationMenuLink>About</NavigationMenuLink>\n    </NavigationMenuItem>\n  </NavigationMenuList>\n</NavigationMenu>`;
        }
        case 'progress': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<Progress\n  value={${instance.style.progressValue}}\n  variant="${instance.style.progressVariant}"\n  showLabel={${String(instance.style.progressShowLabel)}}\n  animateValue={${String(instance.style.progressAnimateValue)}}\n  ${classNameSnippet.trim()}${previewStyleSnippet}\n/>`;
        }
        case 'skeleton': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<div className="space-y-2">\n  <Skeleton variant="${instance.style.skeletonVariant}"${classNameSnippet}${previewStyleSnippet} />\n  ${instance.style.skeletonLines > 1 ? `<Skeleton variant="text" />\n  ` : ''}${instance.style.skeletonLines > 2 ? '<Skeleton variant="text" className="w-3/4" />' : ''}\n</div>`;
        }
        case 'slider': {
            const declarations = [previewBindings.declarations, sliderClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<div${buildSnippetClassNameAttr(undefined, previewClassNameVar)}${previewStyleSnippet}>\n  <Slider${sliderClassNameSnippet} defaultValue={[55]} max={100} step={1} />\n</div>`;
        }
        case 'card': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const cardProps = [
                instance.style.cardVariant !== 'default' ? `variant="${instance.style.cardVariant}"` : '',
                `className="overflow-hidden"`,
                classNameSnippet.trim(),
            ].filter(Boolean).join('\n  ');
            const imageSnippet = hasCardContent(instance.style.cardImageSrc)
                ? `\n  <img src="/placeholder.jpg" alt="Card" className="aspect-[16/10] w-full object-cover" />`
                : '';
            const contentParts: string[] = [];
            if (hasCardContent(instance.style.cardTitleText)) contentParts.push(`    <h3 className="text-lg font-semibold">${instance.style.cardTitleText}</h3>`);
            if (hasCardContent(instance.style.cardSubtitleText)) contentParts.push(`    <p className="text-sm text-muted-foreground">${instance.style.cardSubtitleText}</p>`);
            if (hasCardContent(instance.style.cardBodyText)) contentParts.push(`    <p className="text-sm text-muted-foreground">${instance.style.cardBodyText}</p>`);
            if (hasCardContent(instance.style.cardPriceText)) contentParts.push(`    <div className="text-2xl font-bold">${instance.style.cardPriceText}</div>`);
            if (hasCardContent(instance.style.cardToggleText)) contentParts.push(`    <div className="flex items-center justify-between">\n      <span className="text-sm">${instance.style.cardToggleText}</span>\n      <Switch />\n    </div>`);
            if (hasCardContent(instance.style.cardButtonText)) contentParts.push(`    <Button size="sm" className="w-full">${instance.style.cardButtonText}</Button>`);
            const contentSnippet = contentParts.length > 0
                ? `\n  <CardContent className="space-y-3">\n${contentParts.join('\n')}\n  </CardContent>`
                : '';
            return `${declarations ? `${declarations}\n\n` : ''}<Card${cardProps ? `\n  ${cardProps}` : ''}${previewStyleSnippet}\n>${imageSnippet}${contentSnippet}\n</Card>`;
        }
        case 'product-card': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const cardProps = [
                instance.style.cardVariant !== 'default' ? `variant="${instance.style.cardVariant}"` : '',
                `className="overflow-hidden"`,
                classNameSnippet.trim(),
            ].filter(Boolean).join('\n  ');
            const imageSnippet = hasCardContent(instance.style.cardImageSrc)
                ? `\n  <img src="/placeholder.jpg" alt="Product" className="aspect-[16/10] w-full object-cover" />`
                : '';
            const headerSnippet = (hasCardContent(instance.style.cardTitleText) || hasCardContent(instance.style.cardSubtitleText))
                ? `\n  <CardHeader>${hasCardContent(instance.style.cardTitleText) ? `\n    <CardTitle>${instance.style.cardTitleText}</CardTitle>` : ''}${hasCardContent(instance.style.cardSubtitleText) ? `\n    <CardDescription>${instance.style.cardSubtitleText}</CardDescription>` : ''}\n  </CardHeader>`
                : '';
            const priceSnippet = hasCardContent(instance.style.cardPriceText)
                ? `\n    <div className="text-2xl font-bold">${instance.style.cardPriceText}</div>`
                : '';
            const footerSnippet = hasCardContent(instance.style.cardButtonText)
                ? `\n  <CardFooter className="justify-between gap-2">\n    <span className="text-xs text-muted-foreground">In stock</span>\n    <Button size="sm">${instance.style.cardButtonText}</Button>\n  </CardFooter>`
                : '';
            return `${declarations ? `${declarations}\n\n` : ''}<Card${cardProps ? `\n  ${cardProps}` : ''}${previewStyleSnippet}\n>${imageSnippet}${headerSnippet}\n  <CardContent>${priceSnippet}${hasCardContent(instance.style.cardBodyText) ? `\n    <p className="mt-2 text-sm text-muted-foreground">${instance.style.cardBodyText}</p>` : ''}\n  </CardContent>${footerSnippet}\n</Card>`;
        }
        case 'listing-card': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const cardProps = [
                instance.style.cardVariant !== 'default' ? `variant="${instance.style.cardVariant}"` : '',
                `className="overflow-hidden"`,
                classNameSnippet.trim(),
            ].filter(Boolean).join('\n  ');
            const imageSnippet = hasCardContent(instance.style.cardImageSrc)
                ? `\n  <div className="relative aspect-[16/10] w-full overflow-hidden">\n    <img src="/placeholder.jpg" alt="Listing" className="w-full h-full object-cover" />${hasCardContent(instance.style.cardBadgeText) ? `\n    <span className="absolute top-3 right-3 rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-white">${instance.style.cardBadgeText}</span>` : ''}\n  </div>`
                : '';
            const specsSnippet = instance.style.cardShowSpecs
                ? `\n    <div className="flex flex-wrap gap-1.5">\n      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">Category</span>\n      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">Type</span>\n      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">Detail</span>\n    </div>`
                : '';
            const pricingSnippet = (hasCardContent(instance.style.cardPriceText) || hasCardContent(instance.style.cardBodyText))
                ? `\n    <div>${hasCardContent(instance.style.cardPriceText) ? `\n      <div className="text-3xl font-bold">${instance.style.cardPriceText}</div>` : ''}${hasCardContent(instance.style.cardBodyText) ? `\n      <p className="mt-0.5 text-xs text-muted-foreground">${instance.style.cardBodyText}</p>` : ''}\n    </div>`
                : '';
            const ctaSnippet = hasCardContent(instance.style.cardCtaText)
                ? `\n    <Button className="w-full" size="sm">${instance.style.cardCtaText}</Button>`
                : '';
            return `${declarations ? `${declarations}\n\n` : ''}<Card${cardProps ? `\n  ${cardProps}` : ''}${previewStyleSnippet}\n>${imageSnippet}\n  <CardContent className="space-y-3 pt-4">\n    <div>${hasCardContent(instance.style.cardTitleText) ? `\n      <h3 className="text-xl font-bold">${instance.style.cardTitleText}</h3>` : ''}${hasCardContent(instance.style.cardSubtitleText) ? `\n      <p className="text-sm text-muted-foreground">${instance.style.cardSubtitleText}</p>` : ''}\n    </div>${specsSnippet}${pricingSnippet}${ctaSnippet}\n  </CardContent>\n</Card>`;
        }
        case 'switch': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const switchProps = [
                instance.style.switchChecked ? 'defaultChecked' : '',
                instance.style.switchDisabled ? 'disabled' : '',
                instance.style.switchTrackColor ? `trackColor="${instance.style.switchTrackColor}"` : '',
                instance.style.switchTrackActiveColor ? `trackActiveColor="${instance.style.switchTrackActiveColor}"` : '',
                instance.style.switchThumbColor ? `thumbColor="${instance.style.switchThumbColor}"` : '',
                instance.style.switchThumbActiveColor ? `thumbActiveColor="${instance.style.switchThumbActiveColor}"` : '',
            ].filter(Boolean).join('\n  ');
            return `${declarations ? `${declarations}\n\n` : ''}<div className="flex items-center gap-2">\n  <Switch\n    id="switch-demo"\n    ${switchProps ? `${switchProps}\n    ` : ''}${classNameSnippet.trim()}${previewStyleSnippet}\n  />\n  <Label htmlFor="switch-demo">${instance.style.switchLabel || 'Toggle'}</Label>\n</div>`;
        }
        case 'animated-text': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const s = instance.style;
            const animTextContent = s.animatedTextVariant === 'counting-number'
                ? String(s.animatedTextNumberValue ?? 0)
                : (s.animatedTextContent || 'Hello World');
            const hasStagger = ['blur-in', 'split-entrance', 'gradual-spacing', 'letters-pull-up'].includes(s.animatedTextVariant);
            const textProps = [
                `text="${animTextContent}"`,
                s.animatedTextVariant !== 'blur-in' ? `variant="${s.animatedTextVariant}"` : '',
                s.animatedTextSpeed !== 0.3 ? `speed={${s.animatedTextSpeed}}` : '',
                hasStagger && s.animatedTextStaggerDelay !== 0.04 ? `stagger={${s.animatedTextStaggerDelay}}` : '',
                (s.animatedTextVariant === 'blur-in' || s.animatedTextVariant === 'split-entrance') && s.animatedTextSplitBy !== 'word' ? `splitBy="${s.animatedTextSplitBy}"` : '',
                (s.animatedTextVariant === 'gradient-sweep' || s.animatedTextVariant === 'shiny-text') && s.animatedTextGradientColor1 ? `gradientColor1="${s.animatedTextGradientColor1}"` : '',
                (s.animatedTextVariant === 'gradient-sweep' || s.animatedTextVariant === 'shiny-text') && s.animatedTextGradientColor2 ? `gradientColor2="${s.animatedTextGradientColor2}"` : '',
                s.animatedTextTrigger !== 'mount' ? `trigger="${s.animatedTextTrigger}"` : '',
                classNameSnippet.trim(),
            ].filter(Boolean).join('\n  ');
            return `${declarations ? `${declarations}\n\n` : ''}<AnimatedText\n  ${textProps}${previewStyleSnippet}\n/>`;
        }
        default:
            return '';
    }
}

export function renderPreview(
    instance: ComponentInstance,
    style: CSSProperties,
    motionClassName?: string,
    options?: { pinOverlayOpen?: boolean },
) {
    const pinOverlayOpen = options?.pinOverlayOpen === true;
    // Load Google Fonts if selected
    if (instance.style.fontFamily) loadGoogleFont(instance.style.fontFamily);
    if (instance.style.accordionTriggerFontFamily) loadGoogleFont(instance.style.accordionTriggerFontFamily);
    if (instance.style.accordionContentFontFamily) loadGoogleFont(instance.style.accordionContentFontFamily);
    const panelStyle = buildPanelStyle(instance.style);
    const dropdownMenuPositionStyle = buildDropdownMenuPositionStyle(instance.style);
    const tooltipPlacement = buildPrimitivePlacement(instance.style.tooltipSide, instance.style.tooltipAlign);
    const checkboxDefaultChecked =
        instance.style.checkboxState === 'indeterminate'
            ? 'indeterminate'
            : instance.style.checkboxState === 'checked'
                ? true
                : false;
    const animatedCheckboxChecked =
        instance.style.checkboxState === 'indeterminate' ? ('indeterminate' as const) : undefined;
    const animatedCheckboxDefaultChecked = instance.style.checkboxState === 'checked';
    const labelFor = instance.style.labelFor.trim() || `${instance.id}-label-field`;
    const labelText = instance.style.labelText.trim() || 'Monthly rental';
    const badgeText = instance.style.badgeShowText ? 'Badge token' : '';
    const buttonText = instance.style.buttonShowText ? 'Primary action' : '';
    const icon = renderConfiguredIcon(instance.style, 'shrink-0');
    const loadingStateIcon = renderLoadingStateIcon(instance.style, instance.kind);
    const previewIcon = loadingStateIcon ?? icon;
    const dropdownHoverClass =
        'data-[hovered]:!bg-[var(--ui-dropdown-hover-bg)] data-[focused]:!bg-[var(--ui-dropdown-hover-bg)] data-[hovered]:!text-[var(--ui-dropdown-hover-fg)] data-[focused]:!text-[var(--ui-dropdown-hover-fg)]';
    const scaledControl = {
        ...style,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
        minHeight:
            instance.style.customHeight > 0
                ? `${instance.style.customHeight}px`
                : `${Math.round(22 * SIZE_SCALE[instance.style.size])}px`,
        minWidth:
            instance.style.customWidth > 0
                ? `${instance.style.customWidth}px`
                : `${Math.round(22 * SIZE_SCALE[instance.style.size])}px`,
        width:
            instance.style.customWidth > 0
                ? `${instance.style.customWidth}px`
                : `${Math.round(22 * SIZE_SCALE[instance.style.size])}px`,
        height:
            instance.style.customHeight > 0
                ? `${instance.style.customHeight}px`
                : `${Math.round(22 * SIZE_SCALE[instance.style.size])}px`,
        paddingInline: 0,
    } satisfies CSSProperties;
    const buttonPreviewStateClass = buildButtonPreviewStateClass(instance.style.buttonPreviewState);

    switch (instance.kind) {
        case 'badge':
            return (
                <Badge style={style} className={cn('max-w-full overflow-hidden', motionClassName)}>
                    {withIcon(badgeText, previewIcon, instance.style.iconPosition)}
                </Badge>
            );

        case 'button': {
            const overflowClass = instance.style.effectPulseRingEnabled ? 'overflow-visible' : 'overflow-hidden';
            return (
                <Button
                    variant="default"
                    size={mapSizeOptionToButtonSize(instance.style.size)}
                    disabled={instance.style.buttonPreviewState === 'disabled'}
                    style={style}
                    className={cn('max-w-full', overflowClass, BUTTON_STATE_CLASS_NAME, buttonPreviewStateClass, motionClassName)}
                >
                    {withIcon(buttonText, previewIcon, instance.style.iconPosition)}
                </Button>
            );
        }

        case 'checkbox': {
            const checkboxId = `${instance.id}-checkbox`;
            const s = instance.style;
            const checkboxMotionConfig = normalizeStyleConfig({
                ...s,
                motionEntryEnabled: false,
                motionHoverEnabled: s.checkboxHoverEnabled,
                motionTapEnabled: s.checkboxTapEnabled,
                motionHoverScale: s.checkboxHoverScale,
                motionTapScale: s.checkboxTapScale,
            });
            const checkboxSize = `${Math.round(22 * SIZE_SCALE[s.size])}px`;
            const checkboxStyle = {
                width: checkboxSize,
                height: checkboxSize,
                borderRadius: `${s.checkboxCornerRadius}px`,
                borderWidth: `${s.strokeWeight}px`,
                '--ui-checkbox-border': s.checkboxBorderColor,
                '--ui-checkbox-checked-bg': s.checkboxCheckedColor,
                '--ui-checkbox-checked-border': s.checkboxCheckedColor,
                '--ui-checkbox-indicator': s.checkboxIndicatorColor,
            } as CSSProperties;
            return (
                <div
                    className="flex items-center gap-3"
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                >
                    {renderWithMotionControls(
                        <CheckboxPrimitive.Root
                            data-slot="checkbox"
                            id={checkboxId}
                            defaultChecked={animatedCheckboxDefaultChecked}
                            checked={animatedCheckboxChecked}
                            disabled={s.checkboxDisabled}
                            required={s.checkboxRequired}
                            name={s.checkboxName}
                            value={s.checkboxValue}
                            style={checkboxStyle}
                            className={cn(
                                'ui-studio-checkbox inline-flex items-center justify-center shrink-0 border border-solid transition-colors outline-none',
                                motionClassName,
                            )}
                        >
                            <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current size-full">
                                <div className={cn(PRESET_CHECKBOX_INDICATOR_SIZE[s.size], 'ui-studio-checkbox-indicator flex items-center justify-center')}>
                                    {renderCheckboxSelectionIndicator(s)}
                                </div>
                            </CheckboxPrimitive.Indicator>
                        </CheckboxPrimitive.Root>,
                        checkboxMotionConfig,
                        false,
                        true,
                    )}
                    <Label htmlFor={checkboxId} className="whitespace-nowrap" style={{ color: style.color, fontSize: style.fontSize, fontWeight: style.fontWeight, fontFamily: style.fontFamily }}>
                        {s.checkboxLabel || 'Enable notifications'}
                    </Label>
                </div>
            );
        }

        case 'dialog':
            {
                const dialogBodyMotion = buildEntryPresetMotionConfig('dialog', instance.style, instance.style.dialogBodyMotionPresetId);
                const dialogTextMotion = buildEntryPresetMotionConfig('dialog', instance.style, instance.style.dialogTextMotionPresetId);
                const dialogBody = renderEntryMotion(
                <div className="space-y-3 p-5">
                    {renderEntryMotion(
                        <div className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3
                                        className="text-base font-semibold"
                                        style={{
                                            color: instance.style.dialogTitleColor,
                                            fontSize: instance.style.dialogTitleSize,
                                            fontWeight: instance.style.dialogTitleWeight,
                                            textAlign: instance.style.dialogTitleAlign,
                                        }}
                                    >
                                        {instance.style.dialogTitleText}
                                    </h3>
                                    <p
                                        className="mt-1 text-sm"
                                        style={{
                                            color: instance.style.dialogBodyColor,
                                            fontSize: instance.style.dialogBodySize,
                                            fontWeight: instance.style.dialogBodyWeight,
                                            textAlign: instance.style.dialogBodyAlign,
                                        }}
                                    >
                                        {instance.style.dialogBodyText}
                                    </p>
                                </div>
                                {instance.style.dialogShowCloseIcon ? (
                                    pinOverlayOpen ? (
                                        renderWithMotionControls(
                                            <button
                                                type="button"
                                                className="inline-flex size-7 items-center justify-center rounded-md border border-white/15 text-sm text-[#d9e5f7]"
                                                aria-label="Close dialog"
                                                tabIndex={-1}
                                            >
                                                ×
                                            </button>,
                                            instance.style,
                                            false,
                                            true,
                                        )
                                    ) : (
                                        <RadixDialogPrimitive.Close asChild>
                                            {renderWithMotionControls(
                                                <button
                                                    type="button"
                                                    className="inline-flex size-7 items-center justify-center rounded-md border border-white/15 text-sm text-[#d9e5f7] transition hover:bg-white/10"
                                                    aria-label="Close dialog"
                                                >
                                                    ×
                                                </button>,
                                                instance.style,
                                                false,
                                                true,
                                            )}
                                        </RadixDialogPrimitive.Close>
                                    )
                                ) : null}
                            </div>
                        </div>,
                        dialogTextMotion,
                    )}
                    {instance.style.dialogShowActionButton ? (
                        <div className="flex justify-end">
                            {pinOverlayOpen ? (
                                renderWithMotionControls(
                                    <Button variant="outline" size="sm" tabIndex={-1}>
                                        {instance.style.dialogActionButtonText}
                                    </Button>,
                                    instance.style,
                                    false,
                                    true,
                                )
                            ) : (
                                <RadixDialogPrimitive.Close asChild>
                                    {renderWithMotionControls(
                                        <Button variant="outline" size="sm">
                                            {instance.style.dialogActionButtonText}
                                        </Button>,
                                        instance.style,
                                        false,
                                        true,
                                    )}
                                </RadixDialogPrimitive.Close>
                            )}
                        </div>
                    ) : null}
                </div>,
                    dialogBodyMotion,
                );

                if (pinOverlayOpen) {
                    return (
                        <div
                            className="relative flex min-h-[360px] w-[min(100%,760px)] items-center justify-center overflow-hidden rounded-[28px]"
                            onClick={(event) => event.stopPropagation()}
                            onPointerDown={(event) => event.stopPropagation()}
                        >
                            <div
                                className={cn(
                                    'absolute inset-0',
                                    instance.style.dialogModal ? 'bg-black/30 backdrop-blur-[2px]' : 'bg-black/10 backdrop-blur-none',
                                )}
                            />
                            <div className="relative z-10 h-fit w-[min(92vw,430px)] overflow-hidden rounded-xl shadow-2xl outline-none" style={panelStyle}>
                                {dialogBody}
                            </div>
                        </div>
                    );
                }

                return (
                    <div onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
                        <RadixDialogPrimitive.Root defaultOpen={instance.style.dialogDefaultOpen} modal={instance.style.dialogModal}>
                            <RadixDialogPrimitive.Trigger asChild>
                                {renderWithMotionControls(
                                    <Button
                                        variant="default"
                                        size={mapSizeOptionToButtonSize(instance.style.size)}
                                        disabled={instance.style.buttonPreviewState === 'disabled'}
                                        style={style}
                                        className={cn('max-w-full overflow-hidden', BUTTON_STATE_CLASS_NAME, buttonPreviewStateClass, motionClassName)}
                                    >
                                        {withIcon('Open dialog', icon, instance.style.iconPosition)}
                                    </Button>,
                                    instance.style,
                                    false,
                                    true,
                                )}
                            </RadixDialogPrimitive.Trigger>
                            <RadixDialogPrimitive.Portal>
                                <RadixDialogPrimitive.Overlay
                                    className={cn(
                                        'fixed inset-0 z-50',
                                        instance.style.dialogModal ? 'bg-black/30 backdrop-blur-[2px]' : 'bg-black/10 backdrop-blur-none',
                                    )}
                                />
                                <RadixDialogPrimitive.Content className="fixed inset-0 z-50 m-auto h-fit w-[min(92vw,430px)] overflow-hidden rounded-xl shadow-2xl outline-none" style={panelStyle}>
                                    {dialogBody}
                                </RadixDialogPrimitive.Content>
                            </RadixDialogPrimitive.Portal>
                        </RadixDialogPrimitive.Root>
                    </div>
                );
            }

        case 'dropdown':
            return (
                <InteractiveDropdownPreview
                    instanceId={instance.id}
                    triggerStyle={style}
                    triggerClassName={motionClassName}
                    panelStyle={panelStyle}
                    menuStyle={dropdownMenuPositionStyle}
                    motionConfig={instance.style}
                    iconNode={icon}
                    iconPosition={instance.style.iconPosition}
                    dropdownHoverClass={dropdownHoverClass}
                    pinnedOpen={pinOverlayOpen}
                />
            );

        case 'popover':
            {
                const popoverBodyMotion = buildEntryPresetMotionConfig('popover', instance.style, instance.style.popoverBodyMotionPresetId);
                const popoverTextMotion = buildEntryPresetMotionConfig('popover', instance.style, instance.style.popoverTextMotionPresetId);
                return (
                    <div onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
                        <Popover open={pinOverlayOpen ? true : undefined}>
                            <PopoverTrigger asChild>
                                {renderWithMotionControls(
                                    <Button
                                        variant="default"
                                        size={instance.style.size === 'sm' ? 'sm' : instance.style.size === 'lg' ? 'lg' : 'default'}
                                        disabled={instance.style.buttonPreviewState === 'disabled'}
                                        style={style}
                                        className={cn('max-w-full overflow-hidden', BUTTON_STATE_CLASS_NAME, buttonPreviewStateClass, motionClassName)}
                                    >
                                        {withIcon('Toggle popover', icon, instance.style.iconPosition)}
                                    </Button>,
                                    instance.style,
                                    false,
                                    true,
                                )}
                            </PopoverTrigger>
                            <PopoverContent className="w-72" style={panelStyle}>
                                {renderEntryMotion(
                                    <div className="space-y-2">
                                        {renderEntryMotion(
                                            <div className="space-y-2">
                                                <PopoverHeader>
                                                    <PopoverTitle>Popover preview</PopoverTitle>
                                                    <PopoverDescription>Styled from the side controls.</PopoverDescription>
                                                </PopoverHeader>
                                                <p className="text-sm text-muted-foreground">Update fill, stroke, and effects to see this change in real time.</p>
                                            </div>,
                                            popoverTextMotion,
                                        )}
                                    </div>,
                                    popoverBodyMotion,
                                )}
                            </PopoverContent>
                        </Popover>
                    </div>
                );
            }

        case 'label':
            return (
                <div className="flex w-full items-center justify-center">
                    <div className="flex max-w-full items-center gap-3">
                        {instance.style.labelShowField ? (
                            <Input id={labelFor} placeholder="Linked field" className="w-[180px]" />
                        ) : (
                            <div id={labelFor} className="size-3 rounded-full bg-primary/30" />
                        )}
                        <Label style={style} className="inline-flex max-w-full items-center overflow-hidden">
                            {withIcon(labelText, icon, instance.style.iconPosition)}
                        </Label>
                    </div>
                </div>
            );

        case 'input':
            {
                const autocompleteMotion = buildEntryPresetMotionConfig('input', instance.style, instance.style.inputAutocompleteBodyMotionPresetId);
                return (
                    <div className="w-full max-w-sm space-y-2">
                        <div className="relative w-full">
                            <Input style={style} placeholder="Type here..." className={cn('max-w-sm', motionClassName)} />
                            {loadingStateIcon ? (
                                <span
                                    className={cn(
                                        'pointer-events-none absolute top-1/2 -translate-y-1/2 text-current',
                                        instance.style.effectLoadingPosition === 'left' ? 'left-3' : 'right-3',
                                    )}
                                >
                                    {loadingStateIcon}
                                </span>
                            ) : null}
                        </div>
            {instance.style.inputAutocompleteEnabled ? (
                renderEntryMotion(
                    <div
                        className="rounded-lg px-2 py-1.5 text-[11px] shadow-lg ui-studio-input-autocomplete"
                        style={{
                            backgroundColor: instance.style.inputAutocompleteBgColor,
                            borderColor: instance.style.inputAutocompleteBorderColor,
                            color: instance.style.inputAutocompleteTextColor,
                            borderWidth: 1,
                            borderStyle: 'solid',
                            ['--ui-input-autocomplete-option-hover-bg' as string]: instance.style.inputAutocompleteOptionHoverBgColor,
                            ['--ui-input-autocomplete-option-hover-text' as string]: instance.style.inputAutocompleteOptionHoverTextColor,
                        }}
                    >
                        <div className="rounded px-1.5 py-1 ui-studio-input-autocomplete-option">Autocomplete option</div>
                        <div className="rounded px-1.5 py-1 ui-studio-input-autocomplete-option">Another result</div>
                    </div>,
                    autocompleteMotion,
                )
            ) : null}
                    </div>
                );
            }

        case 'tabs': {
            const triggerStyle = {
                ...extractTextStyle(style),
                borderRadius: style.borderRadius,
                minHeight: `${Math.round(32 * SIZE_SCALE[instance.style.size])}px`,
            } satisfies CSSProperties;
            const tabsBodyMotion = buildEntryPresetMotionConfig('tabs', instance.style, instance.style.tabsBodyMotionPresetId);
            const tabsTextMotion = buildEntryPresetMotionConfig('tabs', instance.style, instance.style.tabsTextMotionPresetId);
            const tabLabels = ['Style', 'Effects', 'Layout', 'Tokens', 'Export'];
            const tabCount = instance.style.tabsCount;

            const hasHoverOrTap = instance.style.motionHoverEnabled || instance.style.motionTapEnabled;
            const tabHover = instance.style.motionHoverEnabled ? {
                scale: instance.style.motionHoverScale / 100,
                x: instance.style.motionHoverX,
                y: instance.style.motionHoverY,
                rotate: instance.style.motionHoverRotate,
                opacity: instance.style.motionHoverOpacity / 100,
            } : undefined;
            const tabTap = instance.style.motionTapEnabled ? {
                scale: instance.style.motionTapScale / 100,
                x: instance.style.motionTapX,
                y: instance.style.motionTapY,
                rotate: instance.style.motionTapRotate,
                opacity: instance.style.motionTapOpacity / 100,
            } : undefined;

            return (
                <Tabs defaultValue="tab-0" className="w-full max-w-md">
                    <TabsList
                        variant={instance.style.tabsVariant}
                        listBg={instance.style.tabsListBg || undefined}
                        className={cn(instance.style.tabsUnderlineMotionEnabled && 'ui-studio-tabs-underline')}
                        style={{ borderRadius: style.borderRadius, boxShadow: style.boxShadow }}
                    >
                        {Array.from({ length: tabCount }, (_, i) => (
                            <TabsTrigger
                                key={i}
                                value={`tab-${i}`}
                                style={triggerStyle}
                                activeBg={instance.style.tabsActiveBg || undefined}
                                className={cn(
                                    'max-w-full overflow-hidden',
                                    instance.style.tabsUnderlineMotionEnabled && 'ui-studio-tabs-underline-trigger',
                                )}
                                asChild={hasHoverOrTap}
                            >
                                {hasHoverOrTap ? (
                                    <motion.button whileHover={tabHover} whileTap={tabTap}>
                                        {i === 0 ? withIcon(tabLabels[i] ?? `Tab ${i + 1}`, icon, instance.style.iconPosition) : (tabLabels[i] ?? `Tab ${i + 1}`)}
                                    </motion.button>
                                ) : (
                                    <>{i === 0 ? withIcon(tabLabels[i] ?? `Tab ${i + 1}`, icon, instance.style.iconPosition) : (tabLabels[i] ?? `Tab ${i + 1}`)}</>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {Array.from({ length: tabCount }, (_, i) => (
                        <TabsContent key={i} value={`tab-${i}`} className="rounded-xl border border-dashed border-border/70 p-3 text-sm text-muted-foreground">
                            {renderEntryMotion(
                                renderEntryMotion(<span>{tabLabels[i] ?? `Tab ${i + 1}`} tab body</span>, tabsTextMotion),
                                tabsBodyMotion,
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            );
        }

        case 'tooltip':
            {
                const tooltipBodyMotion = buildEntryPresetMotionConfig('tooltip', instance.style, instance.style.tooltipBodyMotionPresetId);
                const tooltipTextMotion = buildEntryPresetMotionConfig('tooltip', instance.style, instance.style.tooltipTextMotionPresetId);
                const tooltipTriggerHover = instance.style.motionHoverEnabled
                    ? {
                        scale: instance.style.motionHoverScale / 100,
                        x: instance.style.motionHoverX,
                        y: instance.style.motionHoverY,
                        rotate: instance.style.motionHoverRotate,
                        opacity: instance.style.motionHoverOpacity / 100,
                        transition: buildMotionTransition(instance.style, 'hover'),
                    }
                    : undefined;
                const tooltipTriggerTap = instance.style.motionTapEnabled
                    ? {
                        scale: instance.style.motionTapScale / 100,
                        x: instance.style.motionTapX,
                        y: instance.style.motionTapY,
                        rotate: instance.style.motionTapRotate,
                        opacity: instance.style.motionTapOpacity / 100,
                        transition: buildMotionTransition(instance.style, 'tap'),
                    }
                    : undefined;
                return (
                    <div onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
                        <Tooltip delay={instance.style.tooltipDelay} isOpen={pinOverlayOpen ? true : undefined}>
                            <MotionTooltipTrigger
                                style={style}
                                className={cn(
                                    'inline-flex min-w-0 max-w-full items-center overflow-hidden rounded-lg border border-border px-3 py-2',
                                    BUTTON_STATE_CLASS_NAME,
                                    buttonPreviewStateClass,
                                    motionClassName,
                                )}
                                whileHover={tooltipTriggerHover}
                                whileTap={tooltipTriggerTap}
                            >
                                <span className="inline-flex min-w-0 max-w-full items-center overflow-hidden">
                                    {withIcon('Hover for tooltip', icon, instance.style.iconPosition)}
                                </span>
                            </MotionTooltipTrigger>
                            <TooltipContent arrow={instance.style.tooltipArrow} placement={tooltipPlacement as never} offset={instance.style.tooltipSideOffset} style={panelStyle}>
                                {renderEntryMotion(
                                    renderEntryMotion(<span>Adjustable tooltip content</span>, tooltipTextMotion),
                                    tooltipBodyMotion,
                                )}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                );
            }

        case 'slider': {
            const sliderWrapperStyle = {
                ...buildComponentWrapperStyle(style, 'slider'),
            };
            if (!sliderWrapperStyle.width) {
                sliderWrapperStyle.width = '320px';
            }
            return (
                <div className={cn('rounded-xl p-4', BUTTON_STATE_CLASS_NAME, buttonPreviewStateClass)} style={sliderWrapperStyle}>
                    <div className="flex items-center gap-2">
                        {instance.style.componentPreset === 'slider-elastic' ? <span className="text-sm text-muted-foreground">-</span> : null}
                        <Slider className={cn('ui-studio-slider-motion', motionClassName)} defaultValue={[55]} max={100} step={1} />
                        {instance.style.componentPreset === 'slider-elastic' ? <span className="text-sm text-muted-foreground">+</span> : null}
                    </div>
                </div>
            );
        }

        case 'accordion': {
            const items = Array.from({ length: instance.style.accordionItemCount }, (_, i) => i + 1);
            const accordionProps = instance.style.accordionAllowMultiple
                ? { type: 'multiple' as const, defaultValue: ['item-1'] }
                : { type: 'single' as const, collapsible: instance.style.accordionCollapsible, defaultValue: 'item-1' };

            const triggerTypoStyle: React.CSSProperties = {
                ...(instance.style.accordionTriggerFontFamily ? { fontFamily: instance.style.accordionTriggerFontFamily } : {}),
                fontSize: instance.style.accordionTriggerFontSize,
                fontWeight: instance.style.accordionTriggerFontBold ? 700 : instance.style.accordionTriggerFontWeight,
                ...(instance.style.accordionTriggerFontColor ? { color: instance.style.accordionTriggerFontColor } : {}),
                ...(instance.style.accordionTriggerFontItalic ? { fontStyle: 'italic' } : {}),
                ...(instance.style.accordionTriggerFontUnderline ? { textDecoration: 'underline' } : {}),
            };

            const contentTypoStyle: React.CSSProperties = {
                ...(instance.style.accordionContentFontFamily ? { fontFamily: instance.style.accordionContentFontFamily } : {}),
                fontSize: instance.style.accordionContentFontSize,
                fontWeight: instance.style.accordionContentFontBold ? 700 : instance.style.accordionContentFontWeight,
                ...(instance.style.accordionContentFontColor ? { color: instance.style.accordionContentFontColor } : {}),
                ...(instance.style.accordionContentFontItalic ? { fontStyle: 'italic' } : {}),
                ...(instance.style.accordionContentFontUnderline ? { textDecoration: 'underline' } : {}),
            };

            const accordionIconData = [
                { icon: FileText, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Documents', subtitle: 'Manage your files', content: 'View, upload, and organize all your documents in one place.' },
                { icon: FolderOpen, color: '#fb923c', bg: 'rgba(251,146,60,0.1)', label: 'Projects', subtitle: 'Organize your work', content: 'Group related files and tasks into projects.' },
                { icon: Settings, color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)', label: 'Settings', subtitle: 'Customize your experience', content: 'Adjust preferences, update account details, and configure behavior.' },
                { icon: Users, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Team Members', subtitle: 'Manage users and roles', content: 'Invite new members, assign roles, and control access permissions.' },
                { icon: Bookmark, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', label: 'Bookmarks', subtitle: 'Save for later', content: 'Organize and manage your saved items.' },
                { icon: Globe, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', label: 'Integrations', subtitle: 'Connect services', content: 'Link external tools and automate workflows.' },
                { icon: Shield, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Security', subtitle: 'Protect your data', content: 'Configure security settings and manage access controls.' },
                { icon: Zap, color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Automation', subtitle: 'Speed up tasks', content: 'Set up automated workflows and triggers.' },
            ];

            const showIcons = instance.style.accordionShowIcons;
            const iconPos = instance.style.accordionIconPosition;

            // Build per-item hover/tap motion props
            const itemWhileHover = instance.style.motionHoverEnabled
                ? {
                    scale: instance.style.motionHoverScale / 100,
                    x: instance.style.motionHoverX,
                    y: instance.style.motionHoverY,
                    rotate: instance.style.motionHoverRotate,
                    opacity: instance.style.motionHoverOpacity / 100,
                    transition: buildMotionTransition(instance.style, 'hover'),
                }
                : undefined;
            const itemWhileTap = instance.style.motionTapEnabled
                ? {
                    scale: instance.style.motionTapScale / 100,
                    x: instance.style.motionTapX,
                    y: instance.style.motionTapY,
                    rotate: instance.style.motionTapRotate,
                    opacity: instance.style.motionTapOpacity / 100,
                    transition: buildMotionTransition(instance.style, 'tap'),
                }
                : undefined;
            const hasItemMotion = !!(itemWhileHover || itemWhileTap);

            const accordionItems = items.map((n) => {
                const iconInfo = accordionIconData[(n - 1) % accordionIconData.length];
                const IconComp = iconInfo.icon;
                const iconEl = showIcons ? (
                    <div
                        className="flex shrink-0 items-center justify-center rounded-xl p-2.5"
                        style={{ backgroundColor: iconInfo.bg, color: iconInfo.color }}
                    >
                        <IconComp size={20} />
                    </div>
                ) : null;

                const triggerContent = showIcons ? (
                    <div className={cn('flex items-center gap-3', iconPos === 'right' && 'flex-row-reverse')}>
                        {iconEl}
                        <div className="flex flex-col items-start text-left">
                            <span>{iconInfo.label}</span>
                            <span className="text-sm opacity-60">{iconInfo.subtitle}</span>
                        </div>
                    </div>
                ) : (
                    <>Section {n}</>
                );

                const item = (
                    <AccordionItem key={n} value={`item-${n}`}>
                        <AccordionTrigger triggerStyle={triggerTypoStyle}>{triggerContent}</AccordionTrigger>
                        <AccordionContent contentStyle={contentTypoStyle}>
                            {showIcons ? (
                                <p style={iconPos === 'left' ? { paddingLeft: 52 } : undefined}>{iconInfo.content}</p>
                            ) : (
                                <>Content for section {n}.</>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                );

                // Wrap each item with hover/tap motion individually
                if (hasItemMotion) {
                    return (
                        <motion.div key={n} whileHover={itemWhileHover} whileTap={itemWhileTap}>
                            {item}
                        </motion.div>
                    );
                }
                return item;
            });
            const staggeredItems = renderStaggeredChildren(accordionItems, instance.style);
            // Entry motion on whole accordion, hover/tap handled per-item above
            return renderWithMotionControls(
                <div className="w-full max-w-md" style={buildComponentWrapperStyle(style, 'accordion')}>
                    <Accordion
                        {...accordionProps}
                        dividerColor={instance.style.accordionDividerColor || undefined}
                        dividerEnabled={instance.style.accordionDividerEnabled}
                        dividerWeight={instance.style.accordionDividerWeight}
                        paddingH={instance.style.accordionPaddingH}
                        paddingW={instance.style.accordionPaddingW}
                        spacing={instance.style.accordionSpacing}
                        style={{ color: style.color }}
                        className={cn(motionClassName)}
                    >
                        {staggeredItems}
                    </Accordion>
                </div>,
                instance.style,
                true,
                false, // interaction handled per-item
            );
        }

        case 'alert':
            return renderWithMotionControls(
                <AlertPreview
                    alertVariant={instance.style.alertVariant}
                    alertDismissible={instance.style.alertDismissible}
                    alertShowIcon={instance.style.alertShowIcon}
                    alertCloseHoverEnabled={instance.style.alertCloseHoverEnabled}
                    alertCloseHoverScale={instance.style.alertCloseHoverScale}
                    alertCloseTapEnabled={instance.style.alertCloseTapEnabled}
                    alertCloseTapScale={instance.style.alertCloseTapScale}
                    style={style}
                    motionClassName={motionClassName}
                />,
                instance.style,
                true,
                true,
            );

        case 'avatar':
            return <AvatarSinglePreview instance={instance} motionClassName={motionClassName} />;

        case 'avatar-group':
            return <AvatarGroupPreview instance={instance} motionClassName={motionClassName} />;

        case 'data-table': {
            const s = instance.style;
            const columnLabels = ['Name', 'Status', 'Role', 'Email', 'Department'];
            const columns = Array.from({ length: s.dataTableColumns }, (_, i) => ({
                key: `col${i}`,
                label: columnLabels[i] ?? `Column ${i + 1}`,
                ...(s.dataTableShowStatusBadge && i === 1 ? { variant: 'badge' as const } : {}),
            }));
            const sampleRows = [
                ['Alice', 'Active', 'Admin', 'alice@co.com', 'Engineering'],
                ['Bob', 'Inactive', 'User', 'bob@co.com', 'Design'],
                ['Carol', 'Active', 'Editor', 'carol@co.com', 'Marketing'],
                ['Dave', 'Pending', 'Viewer', 'dave@co.com', 'Sales'],
                ['Eve', 'Active', 'Admin', 'eve@co.com', 'Product'],
            ];
            const data = Array.from({ length: s.dataTableRows }, (_, rowIdx) =>
                Object.fromEntries(columns.map((col, colIdx) => [col.key, sampleRows[rowIdx % 5]?.[colIdx] ?? `R${rowIdx + 1}`]))
            );
            const badgeColors = s.dataTableShowStatusBadge ? {
                'Active': { bg: `${s.dataTableBadgeSuccessColor}20`, text: s.dataTableBadgeSuccessColor },
                'Inactive': { bg: `${s.dataTableBadgeErrorColor}20`, text: s.dataTableBadgeErrorColor },
                'Pending': { bg: `${s.dataTableBadgeWarningColor}20`, text: s.dataTableBadgeWarningColor },
            } : undefined;
            return (
                <div className="w-full max-w-lg overflow-auto" style={buildComponentWrapperStyle(style, 'data-table')}>
                    <DataTable
                        columns={columns}
                        data={data}
                        sortable={s.dataTableSortable}
                        striped={s.dataTableStriped}
                        size={s.size}
                        variant={s.dataTableVariant}
                        headerBg={s.dataTableHeaderBg || undefined}
                        rowBg={s.dataTableRowBg || undefined}
                        stripedBg={s.dataTableStripedBg || undefined}
                        textColor={s.dataTableTextColor || undefined}
                        headerTextColor={s.dataTableHeaderTextColor || undefined}
                        borderColor={s.dataTableBorderColor || undefined}
                        badgeColors={badgeColors}
                        className={cn(motionClassName)}
                    />
                </div>
            );
        }

        case 'drawer':
            return (
                <DrawerPreview
                    instanceStyle={instance.style}
                    triggerStyle={style}
                    panelStyle={panelStyle}
                    motionClassName={motionClassName}
                    pinnedOpen={pinOverlayOpen}
                />
            );

        case 'navigation-menu':
            return (
                <NavigationMenuPreview
                    instanceStyle={instance.style}
                    style={style}
                    motionClassName={motionClassName}
                />
            );

        case 'progress': {
            const progressWrapperStyle = {
                ...buildComponentWrapperStyle(style, 'progress'),
                width: style.width,
                maxWidth: style.width ?? '24rem',
            } satisfies CSSProperties;
            return (
                <div className="w-full" style={progressWrapperStyle}>
                    <Progress
                        value={instance.style.progressValue}
                        variant={instance.style.progressVariant}
                        size={instance.style.size}
                        showLabel={instance.style.progressShowLabel}
                        animateValue={instance.style.progressAnimateValue}
                        className={cn(motionClassName)}
                        style={{ borderRadius: style.borderRadius, boxShadow: style.boxShadow }}
                    />
                </div>
            );
        }

        case 'skeleton': {
            const animSpeed = instance.style.skeletonAnimationSpeed <= 0.75 ? 'fast' as const
                : instance.style.skeletonAnimationSpeed >= 1.5 ? 'slow' as const
                : 'normal' as const;
            const skeletonPassthrough = { borderRadius: style.borderRadius, boxShadow: style.boxShadow };
            return (
                <div className="w-full max-w-sm space-y-2" style={buildComponentWrapperStyle(style, 'skeleton')}>
                    <Skeleton
                        variant={instance.style.skeletonVariant}
                        animationSpeed={animSpeed}
                        className={cn(motionClassName)}
                        style={skeletonPassthrough}
                    />
                    {instance.style.skeletonLines > 1 && <Skeleton variant="text" animationSpeed={animSpeed} style={skeletonPassthrough} />}
                    {instance.style.skeletonLines > 2 && <Skeleton variant="text" animationSpeed={animSpeed} className="w-3/4" style={skeletonPassthrough} />}
                </div>
            );
        }

        case 'card': {
            const showImage = hasCardContent(instance.style.cardImageSrc);
            const showTitle = hasCardContent(instance.style.cardTitleText);
            const showSubtitle = hasCardContent(instance.style.cardSubtitleText);
            const showBody = hasCardContent(instance.style.cardBodyText);
            const showPrice = hasCardContent(instance.style.cardPriceText);
            const showToggle = hasCardContent(instance.style.cardToggleText);
            const showButton = hasCardContent(instance.style.cardButtonText);
            const hasAnyContent = showTitle || showSubtitle || showBody || showPrice || showToggle || showButton;
            const cardWrapperStyle = buildComponentWrapperStyle(style, 'card');
            const cardMaxWidth = instance.style.customWidth > 0 ? `${instance.style.customWidth}px` : undefined;
            const cardDirectStyle = buildCardDirectStyle(style, instance.style);
            const buildCardTextStyle = (
                color: string,
                size: number,
                weight: number,
                align: ComponentStyleConfig['fontPosition'],
            ) => ({
                color,
                fontSize: `${size}px`,
                fontWeight: weight,
                textAlign: align,
                width: '100%',
            } satisfies CSSProperties);
            const titleStyle = buildCardTextStyle(
                instance.style.cardTitleColor,
                instance.style.cardTitleSize,
                instance.style.cardTitleWeight,
                instance.style.cardTitleAlign,
            );
            const subtitleStyle = buildCardTextStyle(
                instance.style.cardSubtitleColor,
                instance.style.cardSubtitleSize,
                instance.style.cardSubtitleWeight,
                instance.style.cardSubtitleAlign,
            );
            const bodyStyle = buildCardTextStyle(
                instance.style.cardBodyColor,
                instance.style.cardBodySize,
                instance.style.cardBodyWeight,
                instance.style.cardBodyAlign,
            );
            const priceStyle = buildCardTextStyle(
                instance.style.cardPriceColor,
                instance.style.cardPriceSize,
                instance.style.cardPriceWeight,
                instance.style.cardPriceAlign,
            );
            const actionAlignment = instance.style.cardBodyAlign === 'center'
                ? 'items-center'
                : instance.style.cardBodyAlign === 'right'
                    ? 'items-end'
                    : 'items-start';
            const imageBlock = showImage ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img src={instance.style.cardImageSrc} alt="Card" className="h-full w-full object-cover" />
                </div>
            ) : null;
            const priceBlock = showPrice ? (
                <div className={cn('flex w-full flex-col gap-1', actionAlignment)}>
                    <span style={priceStyle}>{instance.style.cardPriceText}</span>
                </div>
            ) : null;
            const actionBlock = (showToggle || showButton) ? (
                <div className={cn('flex w-full flex-col gap-3', actionAlignment)}>
                    {showToggle ? (
                        <div className="flex w-full items-center justify-between gap-3">
                            <span style={bodyStyle}>{instance.style.cardToggleText}</span>
                            <Switch defaultChecked />
                        </div>
                    ) : null}
                    {showButton ? (
                        <Button size="sm" className="w-full">{instance.style.cardButtonText}</Button>
                    ) : null}
                </div>
            ) : null;
            const contentSections: CardSection[] = [
                { key: 'price-top', node: instance.style.cardPricePosition === 'top' ? priceBlock : null },
                { key: 'actions-top', node: instance.style.cardActionsPosition === 'top' ? actionBlock : null },
                { key: 'title', node: showTitle ? <h3 style={titleStyle}>{instance.style.cardTitleText}</h3> : null },
                { key: 'subtitle', node: showSubtitle ? <p style={subtitleStyle}>{instance.style.cardSubtitleText}</p> : null },
                { key: 'body', node: showBody ? <p style={bodyStyle}>{instance.style.cardBodyText}</p> : null },
                { key: 'price-bottom', node: instance.style.cardPricePosition === 'bottom' ? priceBlock : null },
                { key: 'actions-bottom', node: instance.style.cardActionsPosition === 'bottom' ? actionBlock : null },
            ];
            const cardSections: CardSection[] = [
                { key: 'image-top', node: instance.style.cardImagePosition === 'top' ? imageBlock : null },
                {
                    key: 'content',
                    node: hasAnyContent ? (
                        <CardContent className="space-y-3">
                            {buildCardSectionStack(
                                contentSections,
                                instance.style.cardShowDividers,
                                instance.style.cardDividerColor,
                                instance.style.cardDividerWidth,
                            )}
                        </CardContent>
                    ) : null,
                },
                { key: 'image-bottom', node: instance.style.cardImagePosition === 'bottom' ? imageBlock : null },
            ];
            return (
                <div className="w-full" style={{ ...cardWrapperStyle, maxWidth: cardMaxWidth || '24rem' }}>
                    <Card
                        variant={instance.style.cardVariant}
                        className={cn(motionClassName, 'overflow-hidden')}
                        style={cardDirectStyle}
                    >
                        {buildCardSectionStack(
                            cardSections,
                            instance.style.cardShowDividers,
                            instance.style.cardDividerColor,
                            instance.style.cardDividerWidth,
                        )}
                    </Card>
                </div>
            );
        }

        case 'product-card': {
            const showImage = hasCardContent(instance.style.cardImageSrc);
            const showTitle = hasCardContent(instance.style.cardTitleText);
            const showSubtitle = hasCardContent(instance.style.cardSubtitleText);
            const showBody = hasCardContent(instance.style.cardBodyText);
            const showPrice = hasCardContent(instance.style.cardPriceText);
            const showFooter = hasCardContent(instance.style.cardButtonText);
            const pcWrapperStyle = buildComponentWrapperStyle(style, 'product-card');
            const pcMaxWidth = instance.style.customWidth > 0 ? `${instance.style.customWidth}px` : undefined;
            const pcDirectStyle = buildCardDirectStyle(style, instance.style);
            const buildCardTextStyle = (
                color: string,
                size: number,
                weight: number,
                align: ComponentStyleConfig['fontPosition'],
            ) => ({
                color,
                fontSize: `${size}px`,
                fontWeight: weight,
                textAlign: align,
                width: '100%',
            } satisfies CSSProperties);
            const titleStyle = buildCardTextStyle(
                instance.style.cardTitleColor,
                instance.style.cardTitleSize,
                instance.style.cardTitleWeight,
                instance.style.cardTitleAlign,
            );
            const subtitleStyle = buildCardTextStyle(
                instance.style.cardSubtitleColor,
                instance.style.cardSubtitleSize,
                instance.style.cardSubtitleWeight,
                instance.style.cardSubtitleAlign,
            );
            const bodyStyle = buildCardTextStyle(
                instance.style.cardBodyColor,
                instance.style.cardBodySize,
                instance.style.cardBodyWeight,
                instance.style.cardBodyAlign,
            );
            const priceStyle = buildCardTextStyle(
                instance.style.cardPriceColor,
                instance.style.cardPriceSize,
                instance.style.cardPriceWeight,
                instance.style.cardPriceAlign,
            );
            const footerAlignment = instance.style.cardActionsPosition === 'top' ? 'order-first' : 'order-last';
            const imageBlock = showImage ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img src={instance.style.cardImageSrc} alt="Product" className="h-full w-full object-cover" />
                </div>
            ) : null;
            const priceBlock = showPrice ? (
                <div className="flex w-full flex-col gap-1">
                    <span style={priceStyle}>{instance.style.cardPriceText}</span>
                </div>
            ) : null;
            const innerSections: CardSection[] = [
                {
                    key: 'footer-top',
                    node: instance.style.cardActionsPosition === 'top' && showFooter ? (
                        <CardFooter className={cn('justify-between gap-2', footerAlignment)}>
                            <span className="text-xs text-muted-foreground">In stock</span>
                            <Button size="sm">{instance.style.cardButtonText}</Button>
                        </CardFooter>
                    ) : null,
                },
                {
                    key: 'header',
                    node: showTitle || showSubtitle ? (
                        <CardHeader>
                            {showTitle ? <CardTitle style={titleStyle}>{instance.style.cardTitleText}</CardTitle> : null}
                            {showSubtitle ? <CardDescription style={subtitleStyle}>{instance.style.cardSubtitleText}</CardDescription> : null}
                        </CardHeader>
                    ) : null,
                },
                {
                    key: 'content',
                    node: showPrice || showBody ? (
                        <CardContent className="space-y-3">
                            {buildCardSectionStack(
                                [
                                    { key: 'price-top', node: instance.style.cardPricePosition === 'top' ? priceBlock : null },
                                    { key: 'body', node: showBody ? <p style={bodyStyle}>{instance.style.cardBodyText}</p> : null },
                                    { key: 'price-bottom', node: instance.style.cardPricePosition === 'bottom' ? priceBlock : null },
                                ],
                                instance.style.cardShowDividers,
                                instance.style.cardDividerColor,
                                instance.style.cardDividerWidth,
                            )}
                        </CardContent>
                    ) : null,
                },
                {
                    key: 'footer-bottom',
                    node: instance.style.cardActionsPosition === 'bottom' && showFooter ? (
                        <CardFooter className={cn('justify-between gap-2', footerAlignment)}>
                            <span className="text-xs text-muted-foreground">In stock</span>
                            <Button size="sm">{instance.style.cardButtonText}</Button>
                        </CardFooter>
                    ) : null,
                },
            ];
            const hasInnerSections = innerSections.some((section) => section.node !== null);
            return (
                <div className="w-full" style={{ ...pcWrapperStyle, maxWidth: pcMaxWidth || '24rem' }}>
                    <Card
                        variant={instance.style.cardVariant}
                        className={cn(motionClassName, 'overflow-hidden')}
                        style={pcDirectStyle}
                    >
                        {buildCardSectionStack(
                            [
                                { key: 'image-top', node: instance.style.cardImagePosition === 'top' ? imageBlock : null },
                                {
                                    key: 'body-stack',
                                    node: hasInnerSections ? (
                                        <div className="flex flex-col">
                                            {buildCardSectionStack(
                                                innerSections,
                                                instance.style.cardShowDividers,
                                                instance.style.cardDividerColor,
                                                instance.style.cardDividerWidth,
                                            )}
                                        </div>
                                    ) : null,
                                },
                                { key: 'image-bottom', node: instance.style.cardImagePosition === 'bottom' ? imageBlock : null },
                            ],
                            instance.style.cardShowDividers,
                            instance.style.cardDividerColor,
                            instance.style.cardDividerWidth,
                        )}
                    </Card>
                </div>
            );
        }

        case 'listing-card': {
            const showImage = hasCardContent(instance.style.cardImageSrc);
            const showBadge = hasCardContent(instance.style.cardBadgeText);
            const showTitle = hasCardContent(instance.style.cardTitleText);
            const showSubtitle = hasCardContent(instance.style.cardSubtitleText);
            const showBody = hasCardContent(instance.style.cardBodyText);
            const showPrice = hasCardContent(instance.style.cardPriceText);
            const showCta = hasCardContent(instance.style.cardCtaText);
            const lcWrapperStyle = buildComponentWrapperStyle(style, 'listing-card');
            const lcMaxWidth = instance.style.customWidth > 0 ? `${instance.style.customWidth}px` : undefined;
            const lcDirectStyle = buildCardDirectStyle(style, instance.style);
            const buildCardTextStyle = (
                color: string,
                size: number,
                weight: number,
                align: ComponentStyleConfig['fontPosition'],
            ) => ({
                color,
                fontSize: `${size}px`,
                fontWeight: weight,
                textAlign: align,
                width: '100%',
            } satisfies CSSProperties);
            const titleStyle = buildCardTextStyle(
                instance.style.cardTitleColor,
                instance.style.cardTitleSize,
                instance.style.cardTitleWeight,
                instance.style.cardTitleAlign,
            );
            const subtitleStyle = buildCardTextStyle(
                instance.style.cardSubtitleColor,
                instance.style.cardSubtitleSize,
                instance.style.cardSubtitleWeight,
                instance.style.cardSubtitleAlign,
            );
            const bodyStyle = buildCardTextStyle(
                instance.style.cardBodyColor,
                instance.style.cardBodySize,
                instance.style.cardBodyWeight,
                instance.style.cardBodyAlign,
            );
            const priceStyle = buildCardTextStyle(
                instance.style.cardPriceColor,
                instance.style.cardPriceSize,
                instance.style.cardPriceWeight,
                instance.style.cardPriceAlign,
            );
            const ctaAlignment = instance.style.cardActionsPosition === 'top'
                ? 'order-first'
                : 'order-last';
            const imageBlock = showImage ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img src={instance.style.cardImageSrc} alt="Listing" className="h-full w-full object-cover" />
                    {showBadge && (
                        <span className="absolute top-3 right-3 rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-white shadow-sm">
                            {instance.style.cardBadgeText}
                        </span>
                    )}
                </div>
            ) : null;
            const contentSections: CardSection[] = [
                {
                    key: 'cta-top',
                    node: instance.style.cardActionsPosition === 'top' && showCta ? (
                        <Button className={cn('w-full', ctaAlignment)} size="sm">
                            {instance.style.cardCtaText}
                        </Button>
                    ) : null,
                },
                {
                    key: 'heading',
                    node: showTitle || showSubtitle ? (
                        <div>
                            {showTitle ? <h3 style={titleStyle}>{instance.style.cardTitleText}</h3> : null}
                            {showSubtitle ? <p style={subtitleStyle}>{instance.style.cardSubtitleText}</p> : null}
                        </div>
                    ) : null,
                },
                {
                    key: 'specs',
                    node: instance.style.cardShowSpecs ? (
                        <div className="flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">Category</span>
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">Type</span>
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">Detail</span>
                        </div>
                    ) : null,
                },
                {
                    key: 'pricing',
                    node: showPrice || showBody ? (
                        <div>
                            {showPrice ? <div style={priceStyle}>{instance.style.cardPriceText}</div> : null}
                            {showBody ? <p style={bodyStyle}>{instance.style.cardBodyText}</p> : null}
                        </div>
                    ) : null,
                },
                {
                    key: 'cta-bottom',
                    node: instance.style.cardActionsPosition === 'bottom' && showCta ? (
                        <Button className={cn('w-full', ctaAlignment)} size="sm">
                            {instance.style.cardCtaText}
                        </Button>
                    ) : null,
                },
            ];
            const hasListingContent = contentSections.some((section) => section.node !== null);
            return (
                <div className="w-full" style={{ ...lcWrapperStyle, maxWidth: lcMaxWidth || '25rem' }}>
                    <Card
                        variant={instance.style.cardVariant}
                        className={cn(motionClassName, 'overflow-hidden')}
                        style={lcDirectStyle}
                    >
                        {buildCardSectionStack(
                            [
                                { key: 'image-top', node: instance.style.cardImagePosition === 'top' ? imageBlock : null },
                                {
                                    key: 'content',
                                    node: hasListingContent ? (
                                        <CardContent className="space-y-3 pt-4">
                                            {buildCardSectionStack(
                                                contentSections,
                                                instance.style.cardShowDividers,
                                                instance.style.cardDividerColor,
                                                instance.style.cardDividerWidth,
                                            )}
                                        </CardContent>
                                    ) : null,
                                },
                                { key: 'image-bottom', node: instance.style.cardImagePosition === 'bottom' ? imageBlock : null },
                            ],
                            instance.style.cardShowDividers,
                            instance.style.cardDividerColor,
                            instance.style.cardDividerWidth,
                        )}
                    </Card>
                </div>
            );
        }

        case 'switch': {
            const switchId = `${instance.id}-switch`;
            const switchHover = instance.style.motionHoverEnabled
                ? {
                    scale: instance.style.motionHoverScale / 100,
                    x: instance.style.motionHoverX,
                    y: instance.style.motionHoverY,
                    rotate: instance.style.motionHoverRotate,
                    opacity: instance.style.motionHoverOpacity / 100,
                    transition: buildMotionTransition(instance.style, 'hover'),
                }
                : undefined;
            const switchTap = instance.style.motionTapEnabled
                ? {
                    scale: instance.style.motionTapScale / 100,
                    x: instance.style.motionTapX,
                    y: instance.style.motionTapY,
                    rotate: instance.style.motionTapRotate,
                    opacity: instance.style.motionTapOpacity / 100,
                    transition: buildMotionTransition(instance.style, 'tap'),
                }
                : undefined;

            return (
                <div className="flex items-center gap-3" style={buildComponentWrapperStyle(style, 'switch')}>
                    <motion.div whileHover={switchHover} whileTap={switchTap} className="shrink-0">
                        <Switch
                            id={switchId}
                            key={`${switchId}-${instance.style.switchChecked}-${instance.style.switchDisabled}`}
                            defaultChecked={instance.style.switchChecked}
                            disabled={instance.style.switchDisabled}
                            size={instance.style.size === 'sm' ? 'sm' : 'default'}
                            trackColor={instance.style.switchTrackColor || undefined}
                            trackActiveColor={instance.style.switchTrackActiveColor || undefined}
                            thumbColor={instance.style.switchThumbColor || undefined}
                            thumbActiveColor={instance.style.switchThumbActiveColor || undefined}
                            className={cn(motionClassName)}
                        />
                    </motion.div>
                    {instance.style.switchLabel && (
                        <Label htmlFor={switchId} className="cursor-pointer text-sm">
                            {instance.style.switchLabel}
                        </Label>
                    )}
                </div>
            );
        }

        case 'animated-text': {
            const animTextContent = instance.style.animatedTextVariant === 'counting-number'
                ? String(instance.style.animatedTextNumberValue ?? 0)
                : (instance.style.animatedTextContent || 'Hello World');
            const animKey = `${instance.style.animatedTextVariant}-${animTextContent}-${instance.style.animatedTextSpeed}-${instance.style.animatedTextStaggerDelay}-${instance.style.animatedTextSplitBy}-${instance.style.animatedTextTrigger}`;
            const animWrapperStyle: React.CSSProperties = {
                ...buildComponentWrapperStyle(style, 'animated-text'),
                ...(instance.style.fontFamily ? { fontFamily: instance.style.fontFamily } : {}),
                ...(instance.style.fontItalic ? { fontStyle: 'italic' } : {}),
                ...(instance.style.fontUnderline ? { textDecoration: 'underline' } : {}),
                ...(instance.style.fontBold ? { fontWeight: 700 } : {}),
            };
            return (
                <div style={animWrapperStyle}>
                    <AnimatedText
                        key={animKey}
                        text={animTextContent}
                        variant={instance.style.animatedTextVariant}
                        speed={instance.style.animatedTextSpeed}
                        stagger={instance.style.animatedTextStaggerDelay}
                        splitBy={instance.style.animatedTextSplitBy}
                        gradientColor1={instance.style.animatedTextGradientColor1 || undefined}
                        gradientColor2={instance.style.animatedTextGradientColor2 || undefined}
                        trigger={instance.style.animatedTextTrigger}
                        className={cn(motionClassName)}
                    />
                </div>
            );
        }

        default:
            return null;
    }
}

export { buildPreviewPresentation };
