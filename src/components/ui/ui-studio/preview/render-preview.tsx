import React, { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FileText, FolderOpen, Settings, Users, Bookmark, Globe, Shield, Zap, Mail, MessageCircle, PhoneCall, Check, X, Minus, Heart, Ban, Slash, Star } from 'lucide-react';
import { Checkbox as CheckboxPrimitive, Dialog as RadixDialogPrimitive } from 'radix-ui';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { DataTable } from '@/components/ui/data-table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { StatefulButton } from '@/components/ui/stateful-button';
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
import type { ComponentInstance, ComponentStyleConfig, IconOptionId, UIComponentKind } from '@/components/ui/ui-studio.types';
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
    getIconComponent,
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
import { ProgressPreview } from './progress-preview';
import { InteractiveDropdownPreview } from './dropdown-preview';
import { NavigationMenuPreview } from './navigation-menu-preview';
import type { ExportStyleMode } from '../utilities';

const MotionTooltipTrigger = motion.create(TooltipTrigger);

function normalizeLegacySwitchIcon(iconName: string): IconOptionId {
    if (iconName === 'bolt') return 'lightning';
    return iconName as IconOptionId;
}

function safeComponentName(value: string, fallback: string): string {
    const cleaned = value.replace(/[^A-Za-z0-9_$]/g, '');
    if (!cleaned) return fallback;
    if (!/^[A-Za-z_$]/.test(cleaned)) {
        return `Icon${cleaned}`;
    }
    return cleaned;
}

function resolveSwitchIcon(iconName: string, iconLibrary: ComponentStyleConfig['switchIconLibrary']) {
    const normalizedIcon = normalizeLegacySwitchIcon(iconName);
    if (iconLibrary === 'custom') {
        return getIconComponent(normalizedIcon, 'lucide') ?? X;
    }
    return getIconComponent(normalizedIcon, iconLibrary) ?? getIconComponent(normalizedIcon, 'lucide') ?? X;
}

function resolveSwitchIconName(
    iconName: string,
    iconLibrary: ComponentStyleConfig['switchIconLibrary'],
    fallbackName: string,
): string {
    if (iconLibrary === 'custom') {
        return safeComponentName(iconName, fallbackName);
    }
    const normalizedIcon = normalizeLegacySwitchIcon(iconName);
    if (iconLibrary === 'studio') {
        switch (normalizedIcon) {
            case 'search': return 'Search';
            case 'lightning': return 'Lightning';
            case 'heart': return 'HeartCircle';
            case 'figma': return 'Figma';
            case 'star': return 'Star';
            case 'cog': return 'Cog';
            case 'spinner': return 'LoaderCircle';
            default: return fallbackName;
        }
    }
    switch (normalizedIcon) {
        case 'search': return 'Search';
        case 'lightning': return 'Zap';
        case 'heart': return 'Heart';
        case 'star': return 'Star';
        case 'settings':
        case 'cog':
            return 'Settings';
        case 'bell': return 'Bell';
        case 'user': return 'User';
        case 'mail': return 'Mail';
        case 'bookmark': return 'Bookmark';
        case 'globe': return 'Globe';
        case 'shield': return 'Shield';
        case 'sparkles': return 'Sparkles';
        case 'home': return 'Home';
        case 'plus': return 'Plus';
        case 'minus': return 'Minus';
        case 'slash': return 'Slash';
        case 'ban': return 'Ban';
        case 'check': return 'Check';
        case 'x': return 'X';
        case 'spinner': return 'LoaderCircle';
        default: return fallbackName;
    }
}

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

// Group map for divider logic — dividers only appear between different groups
const CARD_SECTION_GROUP: Record<string, string> = {
    'icon': 'visual', 'badge-standalone': 'visual', 'image-top': 'visual', 'image-bottom': 'visual',
    'title': 'text', 'subtitle': 'text', 'header': 'text',
    'features': 'content', 'body': 'content',
    'price': 'commerce',
    'actions': 'actions', 'footer-top': 'actions', 'footer-bottom': 'actions',
};

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
            const prevGroup = CARD_SECTION_GROUP[visibleSections[index - 1].key] ?? '';
            const curGroup = CARD_SECTION_GROUP[section.key] ?? '';
            // Only add divider when crossing group boundaries
            if (prevGroup !== curGroup || !prevGroup) {
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
        }
        nodes.push(
            <React.Fragment key={section.key}>
                {section.node}
            </React.Fragment>,
        );
        return nodes;
    });
}

const getIconExportName = (iconId: string): string => {
    const nameMap: Record<string, string> = {
        'search': 'Search', 'lightning': 'Zap', 'bolt': 'Zap', 'heart': 'Heart',
        'star': 'Star', 'cog': 'Settings', 'bell': 'Bell', 'user': 'User',
        'mail': 'Mail', 'bookmark': 'Bookmark', 'globe': 'Globe', 'shield': 'Shield',
        'sparkles': 'Sparkles', 'home': 'Home', 'plus': 'Plus', 'minus': 'Minus',
    };
    return nameMap[iconId] ?? iconId.charAt(0).toUpperCase() + iconId.slice(1);
};

export function componentSnippet(
    instance: ComponentInstance,
    previewStyle: CSSProperties,
    _motionClassName?: string,
    styleMode: ExportStyleMode = 'inline',
    tokenSet?: StudioTokenSet,
): string {
    const isPanelComponent = ['dialog', 'drawer', 'dropdown', 'popover', 'tooltip'].includes(instance.kind);
    const kindCamel = instance.kind.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    const stylePrefix = isPanelComponent ? 'trigger' : kindCamel;
    const previewBindings = buildSnippetStyleBindings(previewStyle, styleMode, stylePrefix, tokenSet);
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
            const listItems = instance.style.alertListItems
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean);
            const showInlineLink = instance.style.alertShowInlineLink && instance.style.alertInlineLinkLabel.trim().length > 0;
            const hasPrimaryAction = instance.style.alertPrimaryActionLabel.trim().length > 0;
            const hasSecondaryAction = instance.style.alertActionMode === 'double' && instance.style.alertSecondaryActionLabel.trim().length > 0;
            const showActionRow = instance.style.alertActionMode !== 'none' && (hasPrimaryAction || hasSecondaryAction);

            const alertIconComponent =
                instance.style.alertIconMode === 'shield'
                    ? 'ShieldCheck'
                    : instance.style.alertIconMode === 'database'
                        ? 'Database'
                        : instance.style.alertIconMode === 'globe'
                            ? 'Globe'
                            : instance.style.alertIconMode === 'lightbulb'
                                ? 'Lightbulb'
                                : instance.style.alertIconMode === 'circle-alert'
                                    ? 'CircleAlert'
                                    : instance.style.alertIconMode === 'circle-check'
                                        ? 'CircleCheck'
                                        : instance.style.alertIconMode === 'x-circle'
                                            ? 'CircleX'
                                            : null;
            const iconProp =
                instance.style.icon !== 'none' && icon
                    ? `icon={${icon}}`
                    : alertIconComponent
                        ? `icon={<${alertIconComponent} className="size-4" />}`
                        : '';
            const alertProps = [
                `variant="${instance.style.alertVariant}"`,
                `dismissible={${String(instance.style.alertDismissible)}}`,
                instance.style.alertShowIcon ? '' : 'showIcon={false}',
                instance.style.alertShowIcon && iconProp ? iconProp : '',
                instance.style.alertDismissible
                    ? `dismissMotion={{ hoverEnabled: ${String(instance.style.alertCloseHoverEnabled)}, hoverScale: ${instance.style.alertCloseHoverScale}, tapEnabled: ${String(instance.style.alertCloseTapEnabled)}, tapScale: ${instance.style.alertCloseTapScale} }}`
                    : '',
            ].filter(Boolean).join('\n  ');
            const descriptionSnippet = instance.style.alertDescriptionMode === 'list'
                ? `<AlertDescription>\n    <p>${instance.style.alertDescriptionText || 'Please check the following details:'}</p>${listItems.length > 0 ? `\n    <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm">\n${listItems.map((item) => `      <li>${item}</li>`).join('\n')}\n    </ul>` : ''}${showInlineLink ? `\n    <Button variant="${instance.style.alertInlineLinkVariant}" size="sm" className="h-auto p-0 underline">${instance.style.alertInlineLinkLabel}</Button>` : ''}\n  </AlertDescription>`
                : `<AlertDescription>${instance.style.alertDescriptionText || 'This is an alert message with relevant details.'}${showInlineLink ? ` <Button variant="${instance.style.alertInlineLinkVariant}" size="sm" className="h-auto p-0 underline">${instance.style.alertInlineLinkLabel}</Button>` : ''}</AlertDescription>`;
            const primaryActionIcon =
                instance.style.alertPrimaryActionIcon === 'refresh'
                    ? '<RefreshCw className="size-3" /> '
                    : instance.style.alertPrimaryActionIcon === 'x'
                        ? '<X className="size-3" /> '
                        : '';
            const actionSnippet = showActionRow
                ? `\n  <AlertAction>${hasSecondaryAction ? `\n    <Button variant="${instance.style.alertSecondaryActionVariant}" size="${instance.style.alertActionSize}">${instance.style.alertSecondaryActionLabel}</Button>` : ''}${hasPrimaryAction ? `\n    <Button variant="${instance.style.alertPrimaryActionVariant}" size="${instance.style.alertActionSize}">${primaryActionIcon}${instance.style.alertPrimaryActionLabel}</Button>` : ''}\n  </AlertAction>`
                : '';
            return `${declarations ? `${declarations}\n\n` : ''}<Alert\n  ${alertProps}${classNameSnippet}${previewStyleSnippet}\n>\n  <AlertTitle>${instance.style.alertTitleText || 'Alert Title'}</AlertTitle>\n  ${descriptionSnippet}${actionSnippet}\n</Alert>`;
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
        case 'stage-button': {
            const declarations = [previewBindings.declarations, buttonClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<StatefulButton${buttonClassNameSnippet}${previewStyleSnippet}>${buttonText}</StatefulButton>`;
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
            const isIconTrigger = instance.style.dropdownTriggerVariant === 'icon';
            const showItemIcons = instance.style.dropdownShowItemIcons;
            const triggerSnippet = isIconTrigger
                ? `<Button variant="ghost" size="icon"${buttonClassNameSnippet}${previewStyleSnippet}><MoreVertical className="size-4" /></Button>`
                : `<Button intent="secondary" size="sm"${buttonClassNameSnippet}${previewStyleSnippet}>${instance.style.iconPosition === 'left' ? iconLeft : ''}Menu trigger${instance.style.iconPosition === 'right' ? iconRight : ''}</Button>`;
            const itemIconEdit = showItemIcons ? '<Pencil className="size-4" /> ' : '';
            const itemIconDuplicate = showItemIcons ? '<Copy className="size-4" /> ' : '';
            const itemIconDelete = showItemIcons ? '<Trash2 className="size-4" /> ' : '';
            const submenuSnippet = instance.style.dropdownShowSubmenu
                ? `\n        <DropdownItem id="share" className="${dropdownHoverClass}">\n          <DropdownLabel>${showItemIcons ? '<Share className="size-4" /> ' : ''}Share <ChevronRight className="size-3.5 ml-auto" /></DropdownLabel>\n          {/* Submenu content */}\n        </DropdownItem>`
                : '';
            return `${dropdownDeclarations}\n\n<div className="flex w-full justify-center py-14">\n  <div className="relative inline-flex">\n    ${triggerSnippet}\n    <div style={dropdownPositionStyle}>\n      <ListBox aria-label="Dropdown preview"${dropdownListClassNameSnippet}${contentStyleSnippet}>\n        <DropdownItem id="edit" className="${dropdownHoverClass}">\n          <DropdownLabel>${itemIconEdit}Edit component</DropdownLabel>\n          <DropdownKeyboard>⌘E</DropdownKeyboard>\n        </DropdownItem>\n        <DropdownItem id="duplicate" className="${dropdownHoverClass}">\n          <DropdownLabel>${itemIconDuplicate}Duplicate</DropdownLabel>\n        </DropdownItem>${submenuSnippet}\n        <DropdownSeparator />\n        <DropdownItem id="delete" intent="danger" className="${dropdownHoverClass}">\n          <DropdownLabel>${itemIconDelete}Delete</DropdownLabel>\n        </DropdownItem>\n      </ListBox>\n    </div>\n  </div>\n</div>`;
        }
        case 'popover': {
            const popoverDeclarations = [previewBindings.declarations, panelBindings.declarations, buttonClassBinding.declarations].filter(Boolean).join('\n');
            const popoverSideAttr = instance.style.popoverSide !== 'bottom' ? ` side="${instance.style.popoverSide}"` : '';
            const popoverAlignAttr = instance.style.popoverAlign !== 'center' ? ` align="${instance.style.popoverAlign}"` : '';
            return `${popoverDeclarations}\n\n<Popover>\n  <PopoverTrigger${buttonClassNameSnippet}${previewStyleSnippet}>${instance.style.iconPosition === 'left' ? iconLeft : ''}Toggle popover${instance.style.iconPosition === 'right' ? iconRight : ''}</PopoverTrigger>\n  <PopoverContent${popoverSideAttr}${popoverAlignAttr}${buildSnippetClassNameAttr(undefined, contentClassNameVar)}${contentStyleSnippet}>...</PopoverContent>\n</Popover>`;
        }
        case 'input': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const inputHasLeftIcon = instance.style.inputShowIcon && instance.style.inputIconPosition === 'left';
            const inputHasRightIcon = instance.style.inputShowIcon && instance.style.inputIconPosition === 'right';
            const inputPlaceholder = instance.style.inputPlaceholder || 'Type here...';
            const inputIconSnippetLeft = inputHasLeftIcon ? `\n  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">${iconLeft.trim()}</span>` : '';
            const inputIconSnippetRight = inputHasRightIcon ? `\n  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">${iconRight.trim()}</span>` : '';
            const inputPaddingClass = inputHasLeftIcon ? ' pl-10' : inputHasRightIcon ? ' pr-10' : '';
            const labelSnippet = instance.style.inputLabel ? `<Label>${instance.style.inputLabel}</Label>\n` : '';
            return `${declarations ? `${declarations}\n\n` : ''}${labelSnippet}<div className="relative">${inputIconSnippetLeft}\n  <Input${classNameSnippet ? classNameSnippet.replace('"', `"${inputPaddingClass}`) : inputPaddingClass ? ` className="${inputPaddingClass.trim()}"` : ''}${previewStyleSnippet} placeholder="${inputPlaceholder}" />${inputIconSnippetRight}\n</div>`;
        }
        case 'tabs': {
            const tabDeclarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const tabLabels = ['Style', 'Effects', 'Layout', 'Preview', 'Settings', 'Export'].slice(0, Math.max(2, Math.min(6, instance.style.tabsCount)));
            const activeIndicatorColor = instance.style.tabsVariant === 'line'
                ? (instance.style.tabsActiveBorderColor || instance.style.tabsIndicatorColor)
                : '';
            const activeBg = instance.style.tabsVariant === 'line' ? '' : instance.style.tabsActiveBg;

            const listStyle: CSSProperties = {
                borderRadius: `${instance.style.tabsListRadius}px`,
                paddingInline: `${instance.style.tabsListPaddingX}px`,
                paddingBlock: `${instance.style.tabsListPaddingY}px`,
                gap: `${instance.style.tabsGap}px`,
                fontSize: `${instance.style.tabsListFontSize}px`,
                fontWeight: instance.style.tabsListFontWeight,
                ...(instance.style.tabsShadow
                    ? { boxShadow: '0 8px 18px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.14)' }
                    : {}),
                ...(instance.style.tabsListBorderWidth > 0
                    ? {
                        borderStyle: 'solid',
                        borderWidth: `${instance.style.tabsListBorderWidth}px`,
                        borderColor: instance.style.tabsListBorderColor || '#e2e8f0',
                    }
                    : {}),
                ...(instance.style.tabsInactiveBg ? { ['--tabs-inactive-bg' as string]: instance.style.tabsInactiveBg } : {}),
                ...(instance.style.tabsHoverBg ? { ['--tabs-hover-bg' as string]: instance.style.tabsHoverBg } : {}),
                ...(instance.style.tabsHoverTextColor ? { ['--tabs-hover-text' as string]: instance.style.tabsHoverTextColor } : {}),
            };

            const triggerStyle: CSSProperties = {
                borderRadius: `${instance.style.tabsTabRadius}px`,
                paddingInline: `${instance.style.tabsTabPaddingX}px`,
            };

            const listStyleCode = styleToCode(listStyle);
            const triggerStyleCode = styleToCode(triggerStyle);

            const listProps = [
                instance.style.tabsVariant !== 'default' ? `variant="${instance.style.tabsVariant}"` : '',
                instance.style.tabsListBg ? `listBg="${instance.style.tabsListBg}"` : '',
                instance.style.tabsFullWidth ? 'fullWidth' : '',
            ].filter(Boolean).join(' ');
            const listAttr = listProps ? ` ${listProps}` : '';
            const triggerProps = [
                activeBg ? `activeBg="${activeBg}"` : '',
                activeIndicatorColor ? `indicatorColor="${activeIndicatorColor}"` : '',
                instance.style.tabsActiveTextColor ? `activeTextColor="${instance.style.tabsActiveTextColor}"` : '',
                instance.style.tabsInactiveTextColor ? `inactiveTextColor="${instance.style.tabsInactiveTextColor}"` : '',
            ].filter(Boolean).join(' ');
            const triggerAttr = triggerProps ? ` ${triggerProps}` : '';
            const listClassName = [
                instance.style.tabsFullWidth ? 'w-full' : '',
                (instance.style.tabsHoverBg || instance.style.tabsHoverTextColor) ? 'ui-studio-tabs-hover' : '',
                instance.style.tabsInactiveBg ? 'ui-studio-tabs-inactive' : '',
                'overflow-x-auto',
            ].filter(Boolean).join(' ');
            const triggerClassName = instance.style.tabsInactiveBg ? 'data-[state=inactive]:bg-[var(--tabs-inactive-bg)]' : '';
            const tabPrefixIcon = instance.style.tabsShowIcons && instance.style.icon !== 'none' && instance.style.tabsIconPosition === 'left' ? iconLeft : '';
            const tabSuffixIcon = instance.style.tabsShowIcons && instance.style.icon !== 'none' && instance.style.tabsIconPosition === 'right' ? iconRight : '';
            const triggerLines = tabLabels
                .map((label, index) => `    <TabsTrigger value="tab-${index}"${triggerAttr}${triggerClassName ? ` className="${triggerClassName}"` : ''} style={tabsTriggerStyle}><span className="inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap">${tabPrefixIcon}${label}${tabSuffixIcon}</span></TabsTrigger>`)
                .join('\n');
            const contentLines = tabLabels
                .map((label, index) => `  <TabsContent value="tab-${index}">${label} tab body</TabsContent>`)
                .join('\n');
            return `${tabDeclarations ? `${tabDeclarations}\n\n` : ''}const tabsListStyle = ${listStyleCode};\nconst tabsTriggerStyle = ${triggerStyleCode};\n\n<Tabs defaultValue="tab-0"${instance.style.tabsFullWidth ? ' className="w-full"' : ''}${classNameSnippet}${previewStyleSnippet}>\n  <TabsList${listAttr}${listClassName ? ` className="${listClassName}"` : ''} style={tabsListStyle}>\n${triggerLines}\n  </TabsList>\n${contentLines}\n</Tabs>`;
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
            const nS = instance.style;
            const navProps = [
                `orientation="${nS.navMenuOrientation}"`,
                nS.navMenuHoverBg ? `hoverBg="${nS.navMenuHoverBg}"` : '',
                nS.navMenuHoverText ? `hoverText="${nS.navMenuHoverText}"` : '',
                nS.navMenuActiveBg ? `activeBg="${nS.navMenuActiveBg}"` : '',
                nS.navMenuActiveText ? `activeText="${nS.navMenuActiveText}"` : '',
            ].filter(Boolean).join(' ');
            const dropdownSnippet = nS.navMenuShowDropdown
                ? `\n    <NavigationMenuItem>\n      <NavigationMenuTrigger variant="${nS.navMenuTriggerVariant}">About</NavigationMenuTrigger>\n      <NavigationMenuContent>\n        <ul className="grid w-[340px] gap-2 p-3">\n          <li><NavigationMenuLink asChild><a href="#">Documentation</a></NavigationMenuLink></li>\n          <li><NavigationMenuLink asChild><a href="#">Team</a></NavigationMenuLink></li>\n        </ul>\n      </NavigationMenuContent>\n    </NavigationMenuItem>`
                : `\n    <NavigationMenuItem>\n      <NavigationMenuLink>About</NavigationMenuLink>\n    </NavigationMenuItem>`;
            const linkProps = [
                nS.navMenuActiveBg ? `activeBg="${nS.navMenuActiveBg}"` : '',
                nS.navMenuActiveText ? `activeText="${nS.navMenuActiveText}"` : '',
            ].filter(Boolean).join(' ');
            const linkAttr = linkProps ? ` ${linkProps}` : '';
            return `${declarations ? `${declarations}\n\n` : ''}<NavigationMenu ${navProps}${classNameSnippet}${previewStyleSnippet}>\n  <NavigationMenuList>\n    <NavigationMenuItem>\n      <NavigationMenuLink active${linkAttr}>Home</NavigationMenuLink>\n    </NavigationMenuItem>${dropdownSnippet}\n  </NavigationMenuList>\n</NavigationMenu>`;
        }
        case 'progress': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const pS = instance.style;
            const progressProps = [
                `value={${pS.progressValue}}`,
                `variant="${pS.progressVariant}"`,
                `showLabel={${String(pS.progressShowLabel)}}`,
                `animateValue={${String(pS.progressAnimateValue)}}`,
                pS.progressTrackColor ? `trackColor="${pS.progressTrackColor}"` : '',
                pS.progressIndicatorColor ? `indicatorColor="${pS.progressIndicatorColor}"` : '',
                pS.progressLabelColor ? `labelColor="${pS.progressLabelColor}"` : '',
                pS.progressVariant === 'circular' && pS.progressCircularSize !== 48 ? `circularSize={${pS.progressCircularSize}}` : '',
                pS.progressVariant === 'circular' && pS.progressCircularStrokeWidth !== 4 ? `circularStrokeWidth={${pS.progressCircularStrokeWidth}}` : '',
                classNameSnippet.trim(),
            ].filter(Boolean).join('\n  ');
            return `${declarations ? `${declarations}\n\n` : ''}<Progress\n  ${progressProps}${previewStyleSnippet}\n/>`;
        }
        case 'slider': {
            const declarations = [previewBindings.declarations, sliderClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<div${buildSnippetClassNameAttr(undefined, previewClassNameVar)}${previewStyleSnippet}>\n  <Slider${sliderClassNameSnippet} defaultValue={[55]} max={100} step={1} />\n</div>`;
        }
        case 'card': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const s = instance.style;
            const cardProps = [
                s.cardVariant !== 'default' ? `variant="${s.cardVariant}"` : '',
                `className="overflow-hidden"`,
                classNameSnippet.trim(),
            ].filter(Boolean).join('\n  ');

            // Icon snippet
            const iconExportName = getIconExportName(s.cardIconName);
            const iconSnippet = s.cardShowIcon
                ? s.cardIconBgEnabled
                    ? `    <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: '${s.cardIconBgColor}15' }}>\n      <${iconExportName} className="h-6 w-6" style={{ color: '${s.cardIconColor}' }} />\n    </div>`
                    : `    <${iconExportName} className="h-6 w-6" style={{ color: '${s.cardIconColor}' }} />`
                : '';

            // Badge position map
            const badgePos = { 'top-left': 'top-3 left-3', 'top-right': 'top-3 right-3', 'bottom-left': 'bottom-3 left-3', 'bottom-right': 'bottom-3 right-3' }[s.cardBadgePosition];

            // Image snippet (with optional badge overlay)
            const imageSnippet = hasCardContent(s.cardImageSrc)
                ? hasCardContent(s.cardBadgeText)
                    ? `\n  <div className="relative aspect-[16/10] w-full overflow-hidden">\n    <img src="/placeholder.jpg" alt="Card" className="h-full w-full object-cover" />\n    <span className="absolute ${badgePos} rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide" style={{ color: '${s.cardBadgeColor}', backgroundColor: '${s.cardBadgeBgColor}' }}>${s.cardBadgeText}</span>\n  </div>`
                    : `\n  <img src="/placeholder.jpg" alt="Card" className="aspect-[16/10] w-full object-cover" />`
                : '';

            // Standalone badge (when no image)
            const standaloneBadgeAlignExport = s.cardBadgePosition.includes('right') ? 'self-end' : s.cardBadgePosition.includes('left') ? 'self-start' : 'self-center';
            const standaloneBadgeSnippet = hasCardContent(s.cardBadgeText) && !hasCardContent(s.cardImageSrc)
                ? `    <span className="inline-block ${standaloneBadgeAlignExport} rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide" style={{ color: '${s.cardBadgeColor}', backgroundColor: '${s.cardBadgeBgColor}' }}>${s.cardBadgeText}</span>`
                : '';

            // Feature items
            const featuresSnippet = s.cardFeatureItems.length > 0
                ? `    <div className="flex flex-wrap gap-1.5">\n${s.cardFeatureItems.map(
                    (item) => `      <span className="rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: '${s.cardFeatureItemBgColor}', color: '${s.cardFeatureItemTextColor}' }}>${item.label}</span>`,
                  ).join('\n')}\n    </div>`
                : '';

            // Text snippet helper
            const buildTextSnippet = (tag: string, text: string, fontFamily: string, className: string) => {
                const styleAttr = fontFamily ? ` style={{ fontFamily: '${fontFamily}' }}` : '';
                return `    <${tag} className="${className}"${styleAttr}>${text}</${tag}>`;
            };

            // Actions snippet
            const actionsSnippet = (() => {
                const parts: string[] = [];
                if (hasCardContent(s.cardToggleText)) {
                    parts.push(`    <div className="flex items-center justify-between">\n      <span className="text-sm">${s.cardToggleText}</span>\n      <Switch />\n    </div>`);
                }
                const hasPrimary = hasCardContent(s.cardButtonText);
                const hasSecondary = s.cardShowSecondaryButton && hasCardContent(s.cardSecondaryButtonText);
                if (hasPrimary && hasSecondary) {
                    parts.push(`    <div className="flex gap-2">\n      <Button size="sm" className="flex-1">${s.cardButtonText}</Button>\n      <Button size="sm" variant="${s.cardSecondaryButtonVariant}">${s.cardSecondaryButtonText}</Button>\n    </div>`);
                } else if (hasPrimary) {
                    parts.push(`    <Button size="sm" className="w-full">${s.cardButtonText}</Button>`);
                } else if (hasSecondary) {
                    parts.push(`    <Button size="sm" variant="${s.cardSecondaryButtonVariant}" className="w-full">${s.cardSecondaryButtonText}</Button>`);
                }
                return parts.join('\n');
            })();

            // Section ordering
            const sectionSnippets: Record<string, string> = {
                'icon': iconSnippet,
                'badge-standalone': standaloneBadgeSnippet,
                'title': hasCardContent(s.cardTitleText) ? buildTextSnippet('h3', s.cardTitleText, s.cardTitleFontFamily, 'text-lg font-semibold') : '',
                'subtitle': hasCardContent(s.cardSubtitleText) ? buildTextSnippet('p', s.cardSubtitleText, s.cardSubtitleFontFamily, 'text-sm text-muted-foreground') : '',
                'features': featuresSnippet,
                'body': hasCardContent(s.cardBodyText) ? buildTextSnippet('p', s.cardBodyText, s.cardBodyFontFamily, 'text-sm text-muted-foreground') : '',
                'price': hasCardContent(s.cardPriceText)
                    ? `    <div className="text-2xl font-bold"${s.cardPriceFontFamily ? ` style={{ fontFamily: '${s.cardPriceFontFamily}' }}` : ''}>${s.cardPriceText}</div>`
                    : '',
                'actions': actionsSnippet,
            };

            const order = s.cardSectionOrder.length > 0
                ? s.cardSectionOrder
                : ['icon', 'badge-standalone', 'title', 'subtitle', 'features', 'body', 'price', 'actions'];

            const contentParts = order.map((key) => sectionSnippets[key] ?? '').filter(Boolean);

            const contentSnippet = contentParts.length > 0
                ? `\n  <CardContent className="space-y-3">\n${contentParts.join('\n')}\n  </CardContent>`
                : '';

            return `${declarations ? `${declarations}\n\n` : ''}<Card${cardProps ? `\n  ${cardProps}` : ''}${previewStyleSnippet}\n>${imageSnippet}${contentSnippet}\n</Card>`;
        }
        case 'product-card': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const s = instance.style;
            const cardProps = [
                s.cardVariant !== 'default' ? `variant="${s.cardVariant}"` : '',
                `className="overflow-hidden"`,
                classNameSnippet.trim(),
            ].filter(Boolean).join('\n  ');

            // Badge position map
            const badgePos = { 'top-left': 'top-3 left-3', 'top-right': 'top-3 right-3', 'bottom-left': 'bottom-3 left-3', 'bottom-right': 'bottom-3 right-3' }[s.cardBadgePosition];

            const imageSnippet = hasCardContent(s.cardImageSrc)
                ? hasCardContent(s.cardBadgeText)
                    ? `\n  <div className="relative aspect-[16/10] w-full overflow-hidden">\n    <img src="/placeholder.jpg" alt="Product" className="h-full w-full object-cover" />\n    <span className="absolute ${badgePos} rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide" style={{ color: '${s.cardBadgeColor}', backgroundColor: '${s.cardBadgeBgColor}' }}>${s.cardBadgeText}</span>\n  </div>`
                    : `\n  <img src="/placeholder.jpg" alt="Product" className="aspect-[16/10] w-full object-cover" />`
                : '';

            // Icon in header
            const iconExportName = getIconExportName(s.cardIconName);
            const headerIconSnippet = s.cardShowIcon
                ? `\n    <${iconExportName} className="h-5 w-5" style={{ color: '${s.cardIconColor}' }} />`
                : '';

            const titleSnippet = hasCardContent(s.cardTitleText)
                ? `\n    <CardTitle${s.cardTitleFontFamily ? ` style={{ fontFamily: '${s.cardTitleFontFamily}' }}` : ''}>${s.cardTitleText}</CardTitle>`
                : '';
            const descSnippet = hasCardContent(s.cardSubtitleText)
                ? `\n    <CardDescription${s.cardSubtitleFontFamily ? ` style={{ fontFamily: '${s.cardSubtitleFontFamily}' }}` : ''}>${s.cardSubtitleText}</CardDescription>`
                : '';

            const headerSnippet = (headerIconSnippet || titleSnippet || descSnippet)
                ? `\n  <CardHeader>${headerIconSnippet}${titleSnippet}${descSnippet}\n  </CardHeader>`
                : '';

            const priceSnippet = hasCardContent(s.cardPriceText)
                ? `\n    <div className="text-2xl font-bold"${s.cardPriceFontFamily ? ` style={{ fontFamily: '${s.cardPriceFontFamily}' }}` : ''}>${s.cardPriceText}</div>`
                : '';
            const bodySnippet = hasCardContent(s.cardBodyText)
                ? `\n    <p className="mt-2 text-sm text-muted-foreground"${s.cardBodyFontFamily ? ` style={{ fontFamily: '${s.cardBodyFontFamily}' }}` : ''}>${s.cardBodyText}</p>`
                : '';

            // Feature items in content
            const featuresSnippet = s.cardFeatureItems.length > 0
                ? `\n    <div className="mt-2 flex flex-wrap gap-1.5">\n${s.cardFeatureItems.map(
                    (item) => `      <span className="rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: '${s.cardFeatureItemBgColor}', color: '${s.cardFeatureItemTextColor}' }}>${item.label}</span>`,
                  ).join('\n')}\n    </div>`
                : '';

            // Footer with primary + secondary buttons
            const hasPrimary = hasCardContent(s.cardButtonText);
            const hasSecondary = s.cardShowSecondaryButton && hasCardContent(s.cardSecondaryButtonText);
            let footerSnippet = '';
            if (hasPrimary && hasSecondary) {
                footerSnippet = `\n  <CardFooter className="gap-2">\n    <Button size="sm" className="flex-1">${s.cardButtonText}</Button>\n    <Button size="sm" variant="${s.cardSecondaryButtonVariant}">${s.cardSecondaryButtonText}</Button>\n  </CardFooter>`;
            } else if (hasPrimary) {
                footerSnippet = `\n  <CardFooter className="justify-between gap-2">\n    <span className="text-xs text-muted-foreground">In stock</span>\n    <Button size="sm">${s.cardButtonText}</Button>\n  </CardFooter>`;
            } else if (hasSecondary) {
                footerSnippet = `\n  <CardFooter>\n    <Button size="sm" variant="${s.cardSecondaryButtonVariant}" className="w-full">${s.cardSecondaryButtonText}</Button>\n  </CardFooter>`;
            }

            return `${declarations ? `${declarations}\n\n` : ''}<Card${cardProps ? `\n  ${cardProps}` : ''}${previewStyleSnippet}\n>${imageSnippet}${headerSnippet}\n  <CardContent>${priceSnippet}${bodySnippet}${featuresSnippet}\n  </CardContent>${footerSnippet}\n</Card>`;
        }
        case 'listing-card': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const s = instance.style;
            const cardProps = [
                s.cardVariant !== 'default' ? `variant="${s.cardVariant}"` : '',
                `className="overflow-hidden"`,
                classNameSnippet.trim(),
            ].filter(Boolean).join('\n  ');

            // Badge position map
            const badgePos = { 'top-left': 'top-3 left-3', 'top-right': 'top-3 right-3', 'bottom-left': 'bottom-3 left-3', 'bottom-right': 'bottom-3 right-3' }[s.cardBadgePosition];

            const imageSnippet = hasCardContent(s.cardImageSrc)
                ? hasCardContent(s.cardBadgeText)
                    ? `\n  <div className="relative aspect-[16/10] w-full overflow-hidden">\n    <img src="/placeholder.jpg" alt="Listing" className="h-full w-full object-cover" />\n    <span className="absolute ${badgePos} rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide" style={{ color: '${s.cardBadgeColor}', backgroundColor: '${s.cardBadgeBgColor}' }}>${s.cardBadgeText}</span>\n  </div>`
                    : `\n  <div className="relative aspect-[16/10] w-full overflow-hidden">\n    <img src="/placeholder.jpg" alt="Listing" className="h-full w-full object-cover" />\n  </div>`
                : '';

            // Feature items (replaces hardcoded specs)
            const featuresSnippet = s.cardFeatureItems.length > 0
                ? `\n    <div className="flex flex-wrap gap-1.5">\n${s.cardFeatureItems.map(
                    (item) => `      <span className="rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: '${s.cardFeatureItemBgColor}', color: '${s.cardFeatureItemTextColor}' }}>${item.label}</span>`,
                  ).join('\n')}\n    </div>`
                : s.cardShowSpecs
                    ? `\n    <div className="flex flex-wrap gap-1.5">\n      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">Category</span>\n      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">Type</span>\n      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">Detail</span>\n    </div>`
                    : '';

            const pricingSnippet = (hasCardContent(s.cardPriceText) || hasCardContent(s.cardBodyText))
                ? `\n    <div>${hasCardContent(s.cardPriceText) ? `\n      <div className="text-3xl font-bold"${s.cardPriceFontFamily ? ` style={{ fontFamily: '${s.cardPriceFontFamily}' }}` : ''}>${s.cardPriceText}</div>` : ''}${hasCardContent(s.cardBodyText) ? `\n      <p className="mt-0.5 text-xs text-muted-foreground"${s.cardBodyFontFamily ? ` style={{ fontFamily: '${s.cardBodyFontFamily}' }}` : ''}>${s.cardBodyText}</p>` : ''}\n    </div>`
                : '';

            // CTA with optional secondary button
            const hasCta = hasCardContent(s.cardCtaText);
            const hasSecondary = s.cardShowSecondaryButton && hasCardContent(s.cardSecondaryButtonText);
            let ctaSnippet = '';
            if (hasCta && hasSecondary) {
                ctaSnippet = `\n    <div className="flex gap-2">\n      <Button className="flex-1" size="sm">${s.cardCtaText}</Button>\n      <Button size="sm" variant="${s.cardSecondaryButtonVariant}">${s.cardSecondaryButtonText}</Button>\n    </div>`;
            } else if (hasCta) {
                ctaSnippet = `\n    <Button className="w-full" size="sm">${s.cardCtaText}</Button>`;
            } else if (hasSecondary) {
                ctaSnippet = `\n    <Button className="w-full" size="sm" variant="${s.cardSecondaryButtonVariant}">${s.cardSecondaryButtonText}</Button>`;
            }

            const titleBlock = (hasCardContent(s.cardTitleText) || hasCardContent(s.cardSubtitleText))
                ? `\n    <div>${hasCardContent(s.cardTitleText) ? `\n      <h3 className="text-xl font-bold"${s.cardTitleFontFamily ? ` style={{ fontFamily: '${s.cardTitleFontFamily}' }}` : ''}>${s.cardTitleText}</h3>` : ''}${hasCardContent(s.cardSubtitleText) ? `\n      <p className="text-sm text-muted-foreground"${s.cardSubtitleFontFamily ? ` style={{ fontFamily: '${s.cardSubtitleFontFamily}' }}` : ''}>${s.cardSubtitleText}</p>` : ''}\n    </div>`
                : '';

            return `${declarations ? `${declarations}\n\n` : ''}<Card${cardProps ? `\n  ${cardProps}` : ''}${previewStyleSnippet}\n>${imageSnippet}\n  <CardContent className="space-y-3 pt-4">${titleBlock}${featuresSnippet}${pricingSnippet}${ctaSnippet}\n  </CardContent>\n</Card>`;
        }
        case 'switch': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const switchSize = instance.style.size === 'sm' ? 'sm' : 'default';
            const defaultTrackWidth = switchSize === 'sm' ? 24 : 32;
            const defaultTrackHeight = switchSize === 'sm' ? 14 : 18;
            const defaultThumbSize = switchSize === 'sm' ? 12 : 16;
            const resolvedTrackWidth = instance.style.switchCustomWidth > 0 ? instance.style.switchCustomWidth : defaultTrackWidth;
            const resolvedTrackHeight = instance.style.switchCustomHeight > 0 ? instance.style.switchCustomHeight : defaultTrackHeight;
            const trackPadding = 1;
            const trackBorderWidth = Math.max(0, instance.style.switchTrackBorderWidth);
            const maxThumbWidth = Math.max(0, resolvedTrackWidth - (trackPadding * 2) - (trackBorderWidth * 2));
            const maxThumbHeight = Math.max(0, resolvedTrackHeight - (trackPadding * 2) - (trackBorderWidth * 2));
            const resolvedThumbWidth = Math.min(
                instance.style.switchThumbWidth > 0 ? instance.style.switchThumbWidth : defaultThumbSize,
                maxThumbWidth,
            );
            const resolvedThumbHeight = Math.min(
                instance.style.switchThumbHeight > 0 ? instance.style.switchThumbHeight : defaultThumbSize,
                maxThumbHeight,
            );
            const thumbTravel = Math.max(
                0,
                resolvedTrackWidth - resolvedThumbWidth - (trackPadding * 2) - (trackBorderWidth * 2),
            );
            const hasCustomSizing =
                instance.style.switchCustomWidth > 0 ||
                instance.style.switchCustomHeight > 0 ||
                instance.style.switchThumbWidth > 0 ||
                instance.style.switchThumbHeight > 0;
            const wrapperClassNames = [
                'flex items-center gap-2',
                instance.style.switchLabelPosition === 'left' ? 'flex-row-reverse justify-end' : '',
                instance.style.switchTrackBorderWidth > 0 ? 'ui-studio-switch-bordered' : '',
                instance.style.switchGlowEnabled ? 'ui-studio-switch-glow' : '',
                (instance.style.switchTrackRadius > 0 || instance.style.switchThumbRadius > 0) ? 'ui-studio-switch-custom-radius' : '',
                instance.style.switchThumbScale !== 1 ? 'ui-studio-switch-thumb-scale' : '',
                hasCustomSizing ? 'ui-studio-switch-custom-size' : '',
            ].filter(Boolean).join(' ');

            const wrapperStyle: CSSProperties = {
                ['--switch-anim-speed' as string]: `${instance.style.switchAnimationSpeed}s`,
                ['--switch-track-border-width' as string]: `${trackBorderWidth}px`,
                ...(instance.style.switchTrackBorderWidth > 0
                    ? {
                        ['--switch-track-border' as string]: instance.style.switchTrackBorderColor || 'rgba(255,255,255,0.2)',
                    }
                    : {}),
                ...(instance.style.switchGlowEnabled
                    ? {
                        ['--switch-glow-color' as string]: instance.style.switchGlowColor || '#22d3ee',
                        ['--switch-glow-size' as string]: `${instance.style.switchGlowSize}px`,
                    }
                    : {}),
                ...(instance.style.switchTrackRadius > 0
                    ? { ['--switch-track-radius' as string]: `${instance.style.switchTrackRadius}px` }
                    : {}),
                ...(instance.style.switchThumbRadius > 0
                    ? { ['--switch-thumb-radius' as string]: `${instance.style.switchThumbRadius}px` }
                    : {}),
                ...(instance.style.switchThumbScale !== 1
                    ? { ['--switch-thumb-scale' as string]: String(instance.style.switchThumbScale) }
                    : {}),
                ...(hasCustomSizing
                    ? {
                        ['--switch-track-width' as string]: `${resolvedTrackWidth}px`,
                        ['--switch-track-height' as string]: `${resolvedTrackHeight}px`,
                        ['--switch-thumb-width' as string]: `${resolvedThumbWidth}px`,
                        ['--switch-thumb-height' as string]: `${resolvedThumbHeight}px`,
                        ['--switch-track-padding' as string]: `${trackPadding}px`,
                        ['--switch-thumb-travel' as string]: `${thumbTravel}px`,
                    }
                    : {}),
            };
            const labelStyle: CSSProperties = {
                fontSize: `${instance.style.switchLabelSize}px`,
                fontWeight: instance.style.switchLabelWeight,
                ...(instance.style.switchLabelColor ? { color: instance.style.switchLabelColor } : {}),
            };
            const switchInlineStyle: CSSProperties = hasCustomSizing
                ? {}
                : {
                    ...(instance.style.switchCustomWidth > 0 ? { width: `${instance.style.switchCustomWidth}px` } : {}),
                    ...(instance.style.switchCustomHeight > 0 ? { height: `${instance.style.switchCustomHeight}px` } : {}),
                };
            const wrapperStyleCode = styleToCode(wrapperStyle);
            const labelStyleCode = styleToCode(labelStyle);
            const switchStyleCode = styleToCode(switchInlineStyle);
            const checkedIconName = resolveSwitchIconName(
                instance.style.switchIconChecked,
                instance.style.switchIconLibrary,
                'Check',
            );
            const uncheckedIconName = resolveSwitchIconName(
                instance.style.switchIconUnchecked,
                instance.style.switchIconLibrary,
                'X',
            );
            const customSwitchImportNote =
                instance.style.switchShowIcon &&
                instance.style.switchIconLibrary === 'custom' &&
                instance.style.switchIconImportPath.trim().length > 0
                    ? `\n// Import custom switch icons from "${instance.style.switchIconImportPath}":\n// import { ${uncheckedIconName}, ${checkedIconName} } from "${instance.style.switchIconImportPath}";`
                    : '';
            const switchProps = [
                instance.style.switchChecked ? 'defaultChecked' : '',
                instance.style.switchDisabled ? 'disabled' : '',
                instance.style.switchTrackColor ? `trackColor="${instance.style.switchTrackColor}"` : '',
                instance.style.switchTrackActiveColor ? `trackActiveColor="${instance.style.switchTrackActiveColor}"` : '',
                instance.style.switchThumbColor ? `thumbColor="${instance.style.switchThumbColor}"` : '',
                instance.style.switchThumbActiveColor ? `thumbActiveColor="${instance.style.switchThumbActiveColor}"` : '',
                classNameSnippet.trim(),
            ].filter(Boolean).join('\n  ');
            const thumbContentSnippet = instance.style.switchShowIcon
                ? `\nconst switchThumbContent = (\n  <span className="pointer-events-none inline-flex items-center justify-center text-current">\n    <span className="inline-flex items-center justify-center group-data-[state=checked]/switch:hidden">\n      <${uncheckedIconName} size={${instance.style.switchIconSize}} />\n    </span>\n    <span className="hidden items-center justify-center group-data-[state=checked]/switch:inline-flex">\n      <${checkedIconName} size={${instance.style.switchIconSize}} />\n    </span>\n  </span>\n);`
                : '';
            return `${declarations ? `${declarations}\n\n` : ''}${customSwitchImportNote ? `${customSwitchImportNote}\n` : ''}const switchWrapperStyle = ${wrapperStyleCode};\nconst switchLabelStyle = ${labelStyleCode};\nconst switchStyle = ${switchStyleCode};${thumbContentSnippet}\n\n<div className="${wrapperClassNames}" style={switchWrapperStyle}>\n  <Switch\n    id="switch-demo"\n    ${switchProps ? `${switchProps}\n    ` : ''}${instance.style.switchShowIcon ? 'thumbContent={switchThumbContent}\n    ' : ''}style={{ ...switchStyle${instance.style.switchShowIcon ? `, color: '${instance.style.switchIconColor}'` : ''} }}\n  />\n  <Label htmlFor="switch-demo" style={switchLabelStyle}>${instance.style.switchLabel || 'Toggle'}</Label>\n</div>`;
        }
        case 'animated-text': {
            const textPreviewStyle = buildComponentWrapperStyle(previewStyle, 'animated-text');
            const textPreviewBindings = buildSnippetStyleBindings(textPreviewStyle, styleMode, 'animatedTextPreview', tokenSet);
            const textPreviewClassVar = styleMode === 'tailwind' ? textPreviewBindings.classVarName : undefined;
            const textRootClassBinding = buildExportClassBinding('animatedTextRoot', {
                componentClassName,
                effectClassName,
                styleClassVarName: textPreviewClassVar,
            });
            const textClassNameSnippet = buildSnippetClassNameVarAttr(textRootClassBinding.classNameVar);
            const textStyleSnippet = buildSnippetStyleAttr(textPreviewBindings.styleVarName);
            const declarations = [textPreviewBindings.declarations, textRootClassBinding.declarations].filter(Boolean).join('\n');
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
                textClassNameSnippet.trim(),
            ].filter(Boolean).join('\n  ');
            return `${declarations ? `${declarations}\n\n` : ''}<AnimatedText\n  ${textProps}${textStyleSnippet}\n/>`;
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

        case 'stage-button': {
            const overflowClass = instance.style.effectPulseRingEnabled ? 'overflow-visible' : 'overflow-hidden';
            return (
                <StatefulButton
                    disabled={instance.style.buttonPreviewState === 'disabled'}
                    style={style}
                    className={cn('max-w-full', overflowClass, BUTTON_STATE_CLASS_NAME, buttonPreviewStateClass, motionClassName)}
                >
                    {buttonText}
                </StatefulButton>
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
                            <PopoverContent className="w-72" side={instance.style.popoverSide} align={instance.style.popoverAlign} style={panelStyle}>
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

        case 'input':
            {
                const autocompleteMotion = buildEntryPresetMotionConfig('input', instance.style, instance.style.inputAutocompleteBodyMotionPresetId);
                const inputHasIcon = instance.style.inputShowIcon && icon;
                const inputIconLeft = inputHasIcon && instance.style.inputIconPosition === 'left';
                const inputIconRight = inputHasIcon && instance.style.inputIconPosition === 'right';
                const inputPaddingStyle: CSSProperties = {
                    ...style,
                    paddingLeft: inputIconLeft ? '2.5rem' : style.paddingInline,
                    paddingRight: inputIconRight ? '2.5rem' : style.paddingInline,
                };
                const labelStyle: CSSProperties = {
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight,
                    fontFamily: style.fontFamily,
                    color: style.color,
                };
                return (
                    <div className="w-full max-w-sm space-y-2">
                        {instance.style.inputLabel ? (
                            <label className="block text-sm" style={labelStyle}>{instance.style.inputLabel}</label>
                        ) : null}
                        <div className="relative w-full">
                            {inputIconLeft ? (
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    {icon}
                                </span>
                            ) : null}
                            <Input style={inputPaddingStyle} placeholder={instance.style.inputPlaceholder || 'Type here...'} className={cn('max-w-sm', motionClassName)} />
                            {inputIconRight ? (
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    {icon}
                                </span>
                            ) : null}
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
            const tabTextStyle = extractTextStyle(style);
            delete tabTextStyle.color;
            const activeIndicatorColor = instance.style.tabsVariant === 'line'
                ? (instance.style.tabsActiveBorderColor || instance.style.tabsIndicatorColor || undefined)
                : undefined;
            const activeTabBackground = instance.style.tabsVariant === 'line'
                ? undefined
                : (instance.style.tabsActiveBg || undefined);
            const tabCount = Math.max(2, Math.min(6, instance.style.tabsCount));
            const tabLabels = ['Style', 'Effects', 'Layout', 'Preview', 'Settings', 'Export'].slice(0, tabCount);
            const showTabIcons = instance.style.tabsShowIcons && instance.style.icon !== 'none';

            const listStyle: CSSProperties = {
                borderRadius: `${instance.style.tabsListRadius}px`,
                paddingInline: `${instance.style.tabsListPaddingX}px`,
                paddingBlock: `${instance.style.tabsListPaddingY}px`,
                gap: `${instance.style.tabsGap}px`,
                fontSize: `${instance.style.tabsListFontSize}px`,
                fontWeight: instance.style.tabsListFontWeight,
                ...(instance.style.tabsListBorderWidth > 0
                    ? {
                        borderStyle: 'solid',
                        borderWidth: `${instance.style.tabsListBorderWidth}px`,
                        borderColor: instance.style.tabsListBorderColor || '#e2e8f0',
                    }
                    : {}),
                ...(instance.style.tabsShadow
                    ? { boxShadow: '0 8px 18px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.14)' }
                    : {}),
                ...(instance.style.tabsInactiveBg ? { ['--tabs-inactive-bg' as string]: instance.style.tabsInactiveBg } : {}),
                ...(instance.style.tabsHoverBg ? { ['--tabs-hover-bg' as string]: instance.style.tabsHoverBg } : {}),
                ...(instance.style.tabsHoverTextColor ? { ['--tabs-hover-text' as string]: instance.style.tabsHoverTextColor } : {}),
            };
            const triggerStyle = {
                ...tabTextStyle,
                fontSize: `${instance.style.tabsListFontSize}px`,
                fontWeight: instance.style.tabsListFontWeight,
                borderRadius: `${instance.style.tabsTabRadius}px`,
                paddingInline: `${instance.style.tabsTabPaddingX}px`,
                minHeight: `${Math.round(32 * SIZE_SCALE[instance.style.size])}px`,
                justifyContent:
                    instance.style.fontPosition === 'left'
                        ? 'flex-start'
                        : instance.style.fontPosition === 'right'
                            ? 'flex-end'
                            : 'center',
                textAlign: instance.style.fontPosition,
            } satisfies CSSProperties;
            const fallbackTextColor = typeof style.color === 'string' ? style.color : undefined;
            const tabsBodyMotion = buildEntryPresetMotionConfig('tabs', instance.style, instance.style.tabsBodyMotionPresetId);
            const tabsTextMotion = buildEntryPresetMotionConfig('tabs', instance.style, instance.style.tabsTextMotionPresetId);
            const listClassName = cn(
                instance.style.tabsFullWidth ? 'w-full' : undefined,
                (instance.style.tabsHoverBg || instance.style.tabsHoverTextColor) ? 'ui-studio-tabs-hover' : undefined,
                instance.style.tabsInactiveBg ? 'ui-studio-tabs-inactive' : undefined,
                'overflow-x-auto',
            );

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

            const renderTabLabel = (label: string) => {
                if (!showTabIcons) {
                    return label;
                }
                const tabIcon = renderConfiguredIcon(instance.style, 'size-4 shrink-0');
                return (
                    <>
                        {instance.style.tabsIconPosition === 'right' ? (
                            <>
                                {label}
                                {tabIcon}
                            </>
                        ) : (
                            <>
                                {tabIcon}
                                {label}
                            </>
                        )}
                    </>
                );
            };

            return (
                <Tabs
                    defaultValue="tab-0"
                    className={cn(instance.style.tabsFullWidth ? 'w-full' : 'max-w-md')}
                >
                    <TabsList
                        variant={instance.style.tabsVariant}
                        listBg={instance.style.tabsListBg || undefined}
                        fullWidth={instance.style.tabsFullWidth}
                        className={listClassName}
                        style={listStyle}
                    >
                        {tabLabels.map((label, i) => (
                            <TabsTrigger
                                key={i}
                                value={`tab-${i}`}
                                style={triggerStyle}
                                activeBg={activeTabBackground}
                                indicatorColor={activeIndicatorColor}
                                activeTextColor={instance.style.tabsActiveTextColor || fallbackTextColor}
                                inactiveTextColor={instance.style.tabsInactiveTextColor || fallbackTextColor}
                                className={cn(
                                    'min-w-0',
                                    instance.style.tabsInactiveBg ? 'data-[state=inactive]:bg-[var(--tabs-inactive-bg)]' : undefined,
                                )}
                                asChild={hasHoverOrTap}
                            >
                                {hasHoverOrTap ? (
                                    <motion.button className="inline-flex w-full min-w-0 items-center justify-center" whileHover={tabHover} whileTap={tabTap}>
                                        <span className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap">
                                            {renderTabLabel(label)}
                                        </span>
                                    </motion.button>
                                ) : (
                                    <span className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap">
                                        {renderTabLabel(label)}
                                    </span>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {tabLabels.map((label, i) => (
                        <TabsContent key={i} value={`tab-${i}`} className="rounded-xl border border-dashed border-border/70 p-3 text-sm text-muted-foreground">
                            {renderEntryMotion(
                                renderEntryMotion(<span>{label} tab body</span>, tabsTextMotion),
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
                    styleConfig={instance.style}
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

        case 'progress':
            return (
                <ProgressPreview
                    instanceStyle={instance.style}
                    previewStyle={style}
                    motionClassName={motionClassName}
                />
            );

        case 'card': {
            const s = instance.style;
            const showImage = hasCardContent(s.cardImageSrc);
            const showTitle = hasCardContent(s.cardTitleText);
            const showSubtitle = hasCardContent(s.cardSubtitleText);
            const showBody = hasCardContent(s.cardBodyText);
            const showPrice = hasCardContent(s.cardPriceText);
            const showToggle = hasCardContent(s.cardToggleText);
            const showButton = hasCardContent(s.cardButtonText);
            const hasAnyContent = showTitle || showSubtitle || showBody || showPrice || showToggle || showButton || s.cardShowIcon || s.cardFeatureItems.length > 0 || (s.cardShowSecondaryButton && hasCardContent(s.cardSecondaryButtonText)) || hasCardContent(s.cardBadgeText);
            const cardWrapperStyle = buildComponentWrapperStyle(style, 'card');
            const cardMaxWidth = s.customWidth > 0 ? `${s.customWidth}px` : undefined;
            const cardDirectStyle = buildCardDirectStyle(style, s);

            // Load per-section Google Fonts
            if (s.cardTitleFontFamily) loadGoogleFont(s.cardTitleFontFamily);
            if (s.cardSubtitleFontFamily) loadGoogleFont(s.cardSubtitleFontFamily);
            if (s.cardBodyFontFamily) loadGoogleFont(s.cardBodyFontFamily);
            if (s.cardPriceFontFamily) loadGoogleFont(s.cardPriceFontFamily);

            const buildCardTextStyle = (
                color: string,
                size: number,
                weight: number,
                align: ComponentStyleConfig['fontPosition'],
                fontFamily?: string,
            ) => ({
                color,
                fontSize: `${size}px`,
                fontWeight: weight,
                textAlign: align,
                width: '100%',
                ...(fontFamily ? { fontFamily } : {}),
            } satisfies CSSProperties);
            const titleStyle = buildCardTextStyle(
                s.cardTitleColor,
                s.cardTitleSize,
                s.cardTitleWeight,
                s.cardTitleAlign,
                s.cardTitleFontFamily,
            );
            const subtitleStyle = buildCardTextStyle(
                s.cardSubtitleColor,
                s.cardSubtitleSize,
                s.cardSubtitleWeight,
                s.cardSubtitleAlign,
                s.cardSubtitleFontFamily,
            );
            const bodyStyle = buildCardTextStyle(
                s.cardBodyColor,
                s.cardBodySize,
                s.cardBodyWeight,
                s.cardBodyAlign,
                s.cardBodyFontFamily,
            );
            const priceStyle = buildCardTextStyle(
                s.cardPriceColor,
                s.cardPriceSize,
                s.cardPriceWeight,
                s.cardPriceAlign,
                s.cardPriceFontFamily,
            );
            const actionAlignment = s.cardBodyAlign === 'center'
                ? 'items-center'
                : s.cardBodyAlign === 'right'
                    ? 'items-end'
                    : 'items-start';

            // Icon block
            const iconBlock = s.cardShowIcon ? (() => {
                const IconComp = getIconComponent(s.cardIconName, s.iconLibrary);
                if (!IconComp) return null;
                const iconEl = <IconComp style={{ width: s.cardIconSize, height: s.cardIconSize, color: s.cardIconColor }} />;
                if (s.cardIconBgEnabled) {
                    return (
                        <div className="flex items-center justify-center"
                            style={{
                                width: s.cardIconSize + 20, height: s.cardIconSize + 20,
                                backgroundColor: hexToRgba(s.cardIconBgColor, 0.1),
                                borderRadius: s.cardIconBgRadius,
                            }}>
                            {iconEl}
                        </div>
                    );
                }
                return iconEl;
            })() : null;

            // Standalone badge (renders when no image present)
            const standaloneBadgeAlign = s.cardBadgePosition.includes('right') ? 'self-end' : s.cardBadgePosition.includes('left') ? 'self-start' : 'self-center';
            const standaloneBadgeBlock = hasCardContent(s.cardBadgeText) && !showImage ? (
                <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide', standaloneBadgeAlign)}
                    style={{ color: s.cardBadgeColor, backgroundColor: s.cardBadgeBgColor }}>
                    {s.cardBadgeText}
                </span>
            ) : null;

            // Feature items
            const featureItemsBlock = s.cardFeatureItems.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {s.cardFeatureItems.map((item) => (
                        <span key={item.id} className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                            style={{ backgroundColor: s.cardFeatureItemBgColor, color: s.cardFeatureItemTextColor }}>
                            {item.label}
                        </span>
                    ))}
                </div>
            ) : null;

            // Badge position for image overlay
            const badgePositionClass = {
                'top-left': 'top-3 left-3',
                'top-right': 'top-3 right-3',
                'bottom-left': 'bottom-3 left-3',
                'bottom-right': 'bottom-3 right-3',
            }[s.cardBadgePosition];

            const imageBlock = showImage ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img src={s.cardImageSrc} alt="Card" className="h-full w-full object-cover" />
                    {hasCardContent(s.cardBadgeText) && (
                        <span className={cn('absolute rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide shadow-sm', badgePositionClass)}
                            style={{ color: s.cardBadgeColor, backgroundColor: s.cardBadgeBgColor }}>
                            {s.cardBadgeText}
                        </span>
                    )}
                </div>
            ) : null;

            const priceBlock = showPrice ? (
                <div className={cn('flex w-full flex-col gap-1', actionAlignment)}>
                    <span style={priceStyle}>{s.cardPriceText}</span>
                </div>
            ) : null;

            const actionBlock = (showToggle || showButton || (s.cardShowSecondaryButton && hasCardContent(s.cardSecondaryButtonText))) ? (
                <div className={cn('flex w-full flex-col gap-3', actionAlignment)}>
                    {showToggle ? (
                        <div className="flex w-full items-center justify-between gap-3">
                            <span style={bodyStyle}>{s.cardToggleText}</span>
                            <Switch defaultChecked />
                        </div>
                    ) : null}
                    {(showButton || (s.cardShowSecondaryButton && hasCardContent(s.cardSecondaryButtonText))) ? (
                        <div className="flex w-full gap-2">
                            {showButton ? <Button size="sm" className="flex-1">{s.cardButtonText}</Button> : null}
                            {s.cardShowSecondaryButton && hasCardContent(s.cardSecondaryButtonText) ? (
                                <Button size="sm" variant={s.cardSecondaryButtonVariant} className={showButton ? '' : 'flex-1'}>
                                    {s.cardSecondaryButtonText}
                                </Button>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            ) : null;

            // Order-driven content sections
            const sectionMap: Record<string, CardSection> = {
                'icon': { key: 'icon', node: iconBlock },
                'badge-standalone': { key: 'badge-standalone', node: standaloneBadgeBlock },
                'title': { key: 'title', node: showTitle ? <h3 style={titleStyle}>{s.cardTitleText}</h3> : null },
                'subtitle': { key: 'subtitle', node: showSubtitle ? <p style={subtitleStyle}>{s.cardSubtitleText}</p> : null },
                'features': { key: 'features', node: featureItemsBlock },
                'body': { key: 'body', node: showBody ? <p style={bodyStyle}>{s.cardBodyText}</p> : null },
                'price': { key: 'price', node: priceBlock },
                'actions': { key: 'actions', node: actionBlock },
            };

            const order = s.cardSectionOrder.length > 0
                ? s.cardSectionOrder
                : ['icon', 'badge-standalone', 'title', 'subtitle', 'features', 'body', 'price', 'actions'];

            const contentSections: CardSection[] = order
                .map((key) => sectionMap[key])
                .filter((section): section is CardSection => section !== undefined);

            const cardSections: CardSection[] = [
                { key: 'image-top', node: s.cardImagePosition === 'top' ? imageBlock : null },
                {
                    key: 'content',
                    node: hasAnyContent ? (
                        <CardContent className="space-y-3">
                            {buildCardSectionStack(
                                contentSections,
                                s.cardShowDividers,
                                s.cardDividerColor,
                                s.cardDividerWidth,
                            )}
                        </CardContent>
                    ) : null,
                },
                { key: 'image-bottom', node: s.cardImagePosition === 'bottom' ? imageBlock : null },
            ];
            return (
                <div className="w-full" style={{ ...cardWrapperStyle, maxWidth: cardMaxWidth || '24rem' }}>
                    <Card
                        variant={s.cardVariant}
                        className={cn(motionClassName, 'overflow-hidden')}
                        style={cardDirectStyle}
                    >
                        {buildCardSectionStack(
                            cardSections,
                            s.cardShowDividers,
                            s.cardDividerColor,
                            s.cardDividerWidth,
                        )}
                    </Card>
                </div>
            );
        }

        case 'product-card': {
            const s = instance.style;
            const showImage = hasCardContent(s.cardImageSrc);
            const showTitle = hasCardContent(s.cardTitleText);
            const showSubtitle = hasCardContent(s.cardSubtitleText);
            const showBody = hasCardContent(s.cardBodyText);
            const showPrice = hasCardContent(s.cardPriceText);
            const showFooter = hasCardContent(s.cardButtonText) || (s.cardShowSecondaryButton && hasCardContent(s.cardSecondaryButtonText));
            const pcWrapperStyle = buildComponentWrapperStyle(style, 'product-card');
            const pcMaxWidth = s.customWidth > 0 ? `${s.customWidth}px` : undefined;
            const pcDirectStyle = buildCardDirectStyle(style, s);

            // Load per-section Google Fonts
            if (s.cardTitleFontFamily) loadGoogleFont(s.cardTitleFontFamily);
            if (s.cardSubtitleFontFamily) loadGoogleFont(s.cardSubtitleFontFamily);
            if (s.cardBodyFontFamily) loadGoogleFont(s.cardBodyFontFamily);
            if (s.cardPriceFontFamily) loadGoogleFont(s.cardPriceFontFamily);

            const buildCardTextStyle = (
                color: string,
                size: number,
                weight: number,
                align: ComponentStyleConfig['fontPosition'],
                fontFamily?: string,
            ) => ({
                color,
                fontSize: `${size}px`,
                fontWeight: weight,
                textAlign: align,
                width: '100%',
                ...(fontFamily ? { fontFamily } : {}),
            } satisfies CSSProperties);
            const titleStyle = buildCardTextStyle(
                s.cardTitleColor,
                s.cardTitleSize,
                s.cardTitleWeight,
                s.cardTitleAlign,
                s.cardTitleFontFamily,
            );
            const subtitleStyle = buildCardTextStyle(
                s.cardSubtitleColor,
                s.cardSubtitleSize,
                s.cardSubtitleWeight,
                s.cardSubtitleAlign,
                s.cardSubtitleFontFamily,
            );
            const bodyStyle = buildCardTextStyle(
                s.cardBodyColor,
                s.cardBodySize,
                s.cardBodyWeight,
                s.cardBodyAlign,
                s.cardBodyFontFamily,
            );
            const priceStyle = buildCardTextStyle(
                s.cardPriceColor,
                s.cardPriceSize,
                s.cardPriceWeight,
                s.cardPriceAlign,
                s.cardPriceFontFamily,
            );
            const footerAlignment = s.cardActionsPosition === 'top' ? 'order-first' : 'order-last';

            // Icon block
            const iconBlock = s.cardShowIcon ? (() => {
                const IconComp = getIconComponent(s.cardIconName, s.iconLibrary);
                if (!IconComp) return null;
                const iconEl = <IconComp style={{ width: s.cardIconSize, height: s.cardIconSize, color: s.cardIconColor }} />;
                if (s.cardIconBgEnabled) {
                    return (
                        <div className="flex items-center justify-center"
                            style={{
                                width: s.cardIconSize + 20, height: s.cardIconSize + 20,
                                backgroundColor: hexToRgba(s.cardIconBgColor, 0.1),
                                borderRadius: s.cardIconBgRadius,
                            }}>
                            {iconEl}
                        </div>
                    );
                }
                return iconEl;
            })() : null;

            // Feature items
            const featureItemsBlock = s.cardFeatureItems.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {s.cardFeatureItems.map((item) => (
                        <span key={item.id} className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                            style={{ backgroundColor: s.cardFeatureItemBgColor, color: s.cardFeatureItemTextColor }}>
                            {item.label}
                        </span>
                    ))}
                </div>
            ) : null;

            // Badge position for image overlay
            const badgePositionClass = {
                'top-left': 'top-3 left-3',
                'top-right': 'top-3 right-3',
                'bottom-left': 'bottom-3 left-3',
                'bottom-right': 'bottom-3 right-3',
            }[s.cardBadgePosition];

            const imageBlock = showImage ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img src={s.cardImageSrc} alt="Product" className="h-full w-full object-cover" />
                    {hasCardContent(s.cardBadgeText) && (
                        <span className={cn('absolute rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide shadow-sm', badgePositionClass)}
                            style={{ color: s.cardBadgeColor, backgroundColor: s.cardBadgeBgColor }}>
                            {s.cardBadgeText}
                        </span>
                    )}
                </div>
            ) : null;
            const priceBlock = showPrice ? (
                <div className="flex w-full flex-col gap-1">
                    <span style={priceStyle}>{s.cardPriceText}</span>
                </div>
            ) : null;

            // Footer block with secondary button support
            const footerBlock = showFooter ? (
                <CardFooter className={cn('justify-between gap-2', footerAlignment)}>
                    <span className="text-xs text-muted-foreground">In stock</span>
                    <div className="flex gap-2">
                        {hasCardContent(s.cardButtonText) ? <Button size="sm">{s.cardButtonText}</Button> : null}
                        {s.cardShowSecondaryButton && hasCardContent(s.cardSecondaryButtonText) ? (
                            <Button size="sm" variant={s.cardSecondaryButtonVariant}>{s.cardSecondaryButtonText}</Button>
                        ) : null}
                    </div>
                </CardFooter>
            ) : null;

            // Order-driven content sections
            const sectionMap: Record<string, CardSection> = {
                'icon': { key: 'icon', node: iconBlock },
                'header': {
                    key: 'header',
                    node: showTitle || showSubtitle ? (
                        <CardHeader>
                            {showTitle ? <CardTitle style={titleStyle}>{s.cardTitleText}</CardTitle> : null}
                            {showSubtitle ? <CardDescription style={subtitleStyle}>{s.cardSubtitleText}</CardDescription> : null}
                        </CardHeader>
                    ) : null,
                },
                'features': { key: 'features', node: featureItemsBlock },
                'body': { key: 'body', node: showBody ? <p style={bodyStyle}>{s.cardBodyText}</p> : null },
                'price': { key: 'price', node: priceBlock },
            };

            const order = s.cardSectionOrder.length > 0
                ? s.cardSectionOrder
                : ['icon', 'header', 'features', 'body', 'price'];

            const orderedContentSections: CardSection[] = order
                .map((key) => sectionMap[key])
                .filter((section): section is CardSection => section !== undefined);

            const innerSections: CardSection[] = [
                {
                    key: 'footer-top',
                    node: s.cardActionsPosition === 'top' ? footerBlock : null,
                },
                {
                    key: 'content',
                    node: orderedContentSections.some((sec) => sec.node !== null) ? (
                        <CardContent className="space-y-3">
                            {buildCardSectionStack(
                                orderedContentSections,
                                s.cardShowDividers,
                                s.cardDividerColor,
                                s.cardDividerWidth,
                            )}
                        </CardContent>
                    ) : null,
                },
                {
                    key: 'footer-bottom',
                    node: s.cardActionsPosition === 'bottom' ? footerBlock : null,
                },
            ];
            const hasInnerSections = innerSections.some((section) => section.node !== null);
            return (
                <div className="w-full" style={{ ...pcWrapperStyle, maxWidth: pcMaxWidth || '24rem' }}>
                    <Card
                        variant={s.cardVariant}
                        className={cn(motionClassName, 'overflow-hidden')}
                        style={pcDirectStyle}
                    >
                        {buildCardSectionStack(
                            [
                                { key: 'image-top', node: s.cardImagePosition === 'top' ? imageBlock : null },
                                {
                                    key: 'body-stack',
                                    node: hasInnerSections ? (
                                        <div className="flex flex-col">
                                            {buildCardSectionStack(
                                                innerSections,
                                                s.cardShowDividers,
                                                s.cardDividerColor,
                                                s.cardDividerWidth,
                                            )}
                                        </div>
                                    ) : null,
                                },
                                { key: 'image-bottom', node: s.cardImagePosition === 'bottom' ? imageBlock : null },
                            ],
                            s.cardShowDividers,
                            s.cardDividerColor,
                            s.cardDividerWidth,
                        )}
                    </Card>
                </div>
            );
        }

        case 'listing-card': {
            const s = instance.style;
            const showImage = hasCardContent(s.cardImageSrc);
            const showBadge = hasCardContent(s.cardBadgeText);
            const showTitle = hasCardContent(s.cardTitleText);
            const showSubtitle = hasCardContent(s.cardSubtitleText);
            const showBody = hasCardContent(s.cardBodyText);
            const showPrice = hasCardContent(s.cardPriceText);
            const showCta = hasCardContent(s.cardCtaText);
            const lcWrapperStyle = buildComponentWrapperStyle(style, 'listing-card');
            const lcMaxWidth = s.customWidth > 0 ? `${s.customWidth}px` : undefined;
            const lcDirectStyle = buildCardDirectStyle(style, s);

            // Load per-section Google Fonts
            if (s.cardTitleFontFamily) loadGoogleFont(s.cardTitleFontFamily);
            if (s.cardSubtitleFontFamily) loadGoogleFont(s.cardSubtitleFontFamily);
            if (s.cardBodyFontFamily) loadGoogleFont(s.cardBodyFontFamily);
            if (s.cardPriceFontFamily) loadGoogleFont(s.cardPriceFontFamily);

            const buildCardTextStyle = (
                color: string,
                size: number,
                weight: number,
                align: ComponentStyleConfig['fontPosition'],
                fontFamily?: string,
            ) => ({
                color,
                fontSize: `${size}px`,
                fontWeight: weight,
                textAlign: align,
                width: '100%',
                ...(fontFamily ? { fontFamily } : {}),
            } satisfies CSSProperties);
            const titleStyle = buildCardTextStyle(
                s.cardTitleColor,
                s.cardTitleSize,
                s.cardTitleWeight,
                s.cardTitleAlign,
                s.cardTitleFontFamily,
            );
            const subtitleStyle = buildCardTextStyle(
                s.cardSubtitleColor,
                s.cardSubtitleSize,
                s.cardSubtitleWeight,
                s.cardSubtitleAlign,
                s.cardSubtitleFontFamily,
            );
            const bodyStyle = buildCardTextStyle(
                s.cardBodyColor,
                s.cardBodySize,
                s.cardBodyWeight,
                s.cardBodyAlign,
                s.cardBodyFontFamily,
            );
            const priceStyle = buildCardTextStyle(
                s.cardPriceColor,
                s.cardPriceSize,
                s.cardPriceWeight,
                s.cardPriceAlign,
                s.cardPriceFontFamily,
            );
            const ctaAlignment = s.cardActionsPosition === 'top'
                ? 'order-first'
                : 'order-last';

            // Icon block
            const iconBlock = s.cardShowIcon ? (() => {
                const IconComp = getIconComponent(s.cardIconName, s.iconLibrary);
                if (!IconComp) return null;
                const iconEl = <IconComp style={{ width: s.cardIconSize, height: s.cardIconSize, color: s.cardIconColor }} />;
                if (s.cardIconBgEnabled) {
                    return (
                        <div className="flex items-center justify-center"
                            style={{
                                width: s.cardIconSize + 20, height: s.cardIconSize + 20,
                                backgroundColor: hexToRgba(s.cardIconBgColor, 0.1),
                                borderRadius: s.cardIconBgRadius,
                            }}>
                            {iconEl}
                        </div>
                    );
                }
                return iconEl;
            })() : null;

            // Feature items (replaces specs when present)
            const featureItemsBlock = s.cardFeatureItems.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {s.cardFeatureItems.map((item) => (
                        <span key={item.id} className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                            style={{ backgroundColor: s.cardFeatureItemBgColor, color: s.cardFeatureItemTextColor }}>
                            {item.label}
                        </span>
                    ))}
                </div>
            ) : null;

            // Badge position for image overlay
            const badgePositionClass = {
                'top-left': 'top-3 left-3',
                'top-right': 'top-3 right-3',
                'bottom-left': 'bottom-3 left-3',
                'bottom-right': 'bottom-3 right-3',
            }[s.cardBadgePosition];

            const imageBlock = showImage ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img src={s.cardImageSrc} alt="Listing" className="h-full w-full object-cover" />
                    {showBadge && (
                        <span className={cn('absolute rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide shadow-sm', badgePositionClass)}
                            style={{ color: s.cardBadgeColor, backgroundColor: s.cardBadgeBgColor }}>
                            {s.cardBadgeText}
                        </span>
                    )}
                </div>
            ) : null;

            // CTA block with secondary button support
            const ctaBlock = showCta || (s.cardShowSecondaryButton && hasCardContent(s.cardSecondaryButtonText)) ? (
                s.cardShowSecondaryButton && hasCardContent(s.cardSecondaryButtonText) ? (
                    <div className="flex w-full gap-2">
                        {showCta ? <Button className="flex-1" size="sm">{s.cardCtaText}</Button> : null}
                        <Button size="sm" variant={s.cardSecondaryButtonVariant}>{s.cardSecondaryButtonText}</Button>
                    </div>
                ) : (
                    <Button className="w-full" size="sm">{s.cardCtaText}</Button>
                )
            ) : null;

            // Specs fallback (when no feature items configured)
            const specsBlock = featureItemsBlock ?? (s.cardShowSpecs ? (
                <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">Category</span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">Type</span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">Detail</span>
                </div>
            ) : null);

            // Order-driven content sections
            const sectionMap: Record<string, CardSection> = {
                'icon': { key: 'icon', node: iconBlock },
                'heading': {
                    key: 'heading',
                    node: showTitle || showSubtitle ? (
                        <div>
                            {showTitle ? <h3 style={titleStyle}>{s.cardTitleText}</h3> : null}
                            {showSubtitle ? <p style={subtitleStyle}>{s.cardSubtitleText}</p> : null}
                        </div>
                    ) : null,
                },
                'features': { key: 'features', node: specsBlock },
                'pricing': {
                    key: 'pricing',
                    node: showPrice || showBody ? (
                        <div>
                            {showPrice ? <div style={priceStyle}>{s.cardPriceText}</div> : null}
                            {showBody ? <p style={bodyStyle}>{s.cardBodyText}</p> : null}
                        </div>
                    ) : null,
                },
                'cta': { key: 'cta', node: ctaBlock },
            };

            const order = s.cardSectionOrder.length > 0
                ? s.cardSectionOrder
                : ['icon', 'heading', 'features', 'pricing', 'cta'];

            const orderedContentSections: CardSection[] = order
                .map((key) => sectionMap[key])
                .filter((section): section is CardSection => section !== undefined);

            const hasListingContent = orderedContentSections.some((section) => section.node !== null);
            return (
                <div className="w-full" style={{ ...lcWrapperStyle, maxWidth: lcMaxWidth || '25rem' }}>
                    <Card
                        variant={s.cardVariant}
                        className={cn(motionClassName, 'overflow-hidden')}
                        style={lcDirectStyle}
                    >
                        {buildCardSectionStack(
                            [
                                { key: 'image-top', node: s.cardImagePosition === 'top' ? imageBlock : null },
                                {
                                    key: 'content',
                                    node: hasListingContent ? (
                                        <CardContent className="space-y-3 pt-4">
                                            {buildCardSectionStack(
                                                orderedContentSections,
                                                s.cardShowDividers,
                                                s.cardDividerColor,
                                                s.cardDividerWidth,
                                            )}
                                        </CardContent>
                                    ) : null,
                                },
                                { key: 'image-bottom', node: s.cardImagePosition === 'bottom' ? imageBlock : null },
                            ],
                            s.cardShowDividers,
                            s.cardDividerColor,
                            s.cardDividerWidth,
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
            const switchSize = instance.style.size === 'sm' ? 'sm' : 'default';
            const defaultTrackWidth = switchSize === 'sm' ? 24 : 32;
            const defaultTrackHeight = switchSize === 'sm' ? 14 : 18;
            const defaultThumbSize = switchSize === 'sm' ? 12 : 16;
            const resolvedTrackWidth = instance.style.switchCustomWidth > 0 ? instance.style.switchCustomWidth : defaultTrackWidth;
            const resolvedTrackHeight = instance.style.switchCustomHeight > 0 ? instance.style.switchCustomHeight : defaultTrackHeight;
            const trackPadding = 1;
            const trackBorderWidth = Math.max(0, instance.style.switchTrackBorderWidth);
            const maxThumbWidth = Math.max(0, resolvedTrackWidth - (trackPadding * 2) - (trackBorderWidth * 2));
            const maxThumbHeight = Math.max(0, resolvedTrackHeight - (trackPadding * 2) - (trackBorderWidth * 2));
            const resolvedThumbWidth = Math.min(
                instance.style.switchThumbWidth > 0 ? instance.style.switchThumbWidth : defaultThumbSize,
                maxThumbWidth,
            );
            const resolvedThumbHeight = Math.min(
                instance.style.switchThumbHeight > 0 ? instance.style.switchThumbHeight : defaultThumbSize,
                maxThumbHeight,
            );
            const thumbTravel = Math.max(
                0,
                resolvedTrackWidth - resolvedThumbWidth - (trackPadding * 2) - (trackBorderWidth * 2),
            );
            const hasCustomSizing =
                instance.style.switchCustomWidth > 0 ||
                instance.style.switchCustomHeight > 0 ||
                instance.style.switchThumbWidth > 0 ||
                instance.style.switchThumbHeight > 0;
            const CheckedThumbIcon = resolveSwitchIcon(instance.style.switchIconChecked, instance.style.switchIconLibrary);
            const UncheckedThumbIcon = resolveSwitchIcon(instance.style.switchIconUnchecked, instance.style.switchIconLibrary);
            const wrapperStyle = buildComponentWrapperStyle(style, 'switch');
            const switchDecorClassName = cn(
                'shrink-0',
                instance.style.switchTrackBorderWidth > 0 ? 'ui-studio-switch-bordered' : undefined,
                instance.style.switchGlowEnabled ? 'ui-studio-switch-glow' : undefined,
                (instance.style.switchTrackRadius > 0 || instance.style.switchThumbRadius > 0) ? 'ui-studio-switch-custom-radius' : undefined,
                instance.style.switchThumbScale !== 1 ? 'ui-studio-switch-thumb-scale' : undefined,
                hasCustomSizing ? 'ui-studio-switch-custom-size' : undefined,
            );
            const switchDecorStyle: CSSProperties = {
                ['--switch-anim-speed' as string]: `${instance.style.switchAnimationSpeed}s`,
                ['--switch-track-border-width' as string]: `${trackBorderWidth}px`,
                ...(instance.style.switchTrackBorderWidth > 0
                    ? {
                        ['--switch-track-border' as string]: instance.style.switchTrackBorderColor || 'rgba(255,255,255,0.2)',
                    }
                    : {}),
                ...(instance.style.switchGlowEnabled
                    ? {
                        ['--switch-glow-color' as string]: instance.style.switchGlowColor || '#22d3ee',
                        ['--switch-glow-size' as string]: `${instance.style.switchGlowSize}px`,
                    }
                    : {}),
                ...(instance.style.switchTrackRadius > 0
                    ? { ['--switch-track-radius' as string]: `${instance.style.switchTrackRadius}px` }
                    : {}),
                ...(instance.style.switchThumbRadius > 0
                    ? { ['--switch-thumb-radius' as string]: `${instance.style.switchThumbRadius}px` }
                    : {}),
                ...(instance.style.switchThumbScale !== 1
                    ? { ['--switch-thumb-scale' as string]: String(instance.style.switchThumbScale) }
                    : {}),
                ...(hasCustomSizing
                    ? {
                        ['--switch-track-width' as string]: `${resolvedTrackWidth}px`,
                        ['--switch-track-height' as string]: `${resolvedTrackHeight}px`,
                        ['--switch-thumb-width' as string]: `${resolvedThumbWidth}px`,
                        ['--switch-thumb-height' as string]: `${resolvedThumbHeight}px`,
                        ['--switch-track-padding' as string]: `${trackPadding}px`,
                        ['--switch-thumb-travel' as string]: `${thumbTravel}px`,
                    }
                    : {}),
            };
            const switchInlineStyle: CSSProperties = hasCustomSizing
                ? {}
                : {
                    ...(instance.style.switchCustomWidth > 0 ? { width: `${instance.style.switchCustomWidth}px` } : {}),
                    ...(instance.style.switchCustomHeight > 0 ? { height: `${instance.style.switchCustomHeight}px` } : {}),
                };
            const labelStyle: CSSProperties = {
                fontSize: `${instance.style.switchLabelSize}px`,
                fontWeight: instance.style.switchLabelWeight,
                ...(instance.style.switchLabelColor ? { color: instance.style.switchLabelColor } : {}),
            };
            const thumbContent = instance.style.switchShowIcon ? (
                <span className="pointer-events-none inline-flex items-center justify-center text-current">
                    <span className="inline-flex items-center justify-center group-data-[state=checked]/switch:hidden">
                        <UncheckedThumbIcon size={instance.style.switchIconSize} />
                    </span>
                    <span className="hidden items-center justify-center group-data-[state=checked]/switch:inline-flex">
                        <CheckedThumbIcon size={instance.style.switchIconSize} />
                    </span>
                </span>
            ) : undefined;

            return (
                <div
                    className={cn(
                        'flex items-center gap-3',
                        instance.style.switchLabelPosition === 'left' ? 'flex-row-reverse justify-end' : undefined,
                    )}
                    style={wrapperStyle}
                >
                    <motion.div whileHover={switchHover} whileTap={switchTap} className={switchDecorClassName} style={switchDecorStyle}>
                        <Switch
                            id={switchId}
                            key={`${switchId}-${instance.style.switchChecked}-${instance.style.switchDisabled}`}
                            defaultChecked={instance.style.switchChecked}
                            disabled={instance.style.switchDisabled}
                            size={switchSize}
                            trackColor={instance.style.switchTrackColor || undefined}
                            trackActiveColor={instance.style.switchTrackActiveColor || undefined}
                            thumbColor={instance.style.switchThumbColor || undefined}
                            thumbActiveColor={instance.style.switchThumbActiveColor || undefined}
                            thumbContent={thumbContent}
                            className={cn(motionClassName)}
                            style={{
                                ...switchInlineStyle,
                                ...(instance.style.switchShowIcon ? { color: instance.style.switchIconColor } : {}),
                            }}
                        />
                    </motion.div>
                    {instance.style.switchLabel && (
                        <Label htmlFor={switchId} className="cursor-pointer" style={labelStyle}>
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
            const animTextStyle: React.CSSProperties = {
                ...(instance.style.fontFamily ? { fontFamily: instance.style.fontFamily } : {}),
                ...(instance.style.fontItalic ? { fontStyle: 'italic' as const } : {}),
                ...(instance.style.fontUnderline ? { textDecoration: 'underline' } : {}),
                ...(instance.style.fontBold ? { fontWeight: 700 } : {}),
                fontSize: style.fontSize,
                color: style.color,
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
                        style={animTextStyle}
                    />
                </div>
            );
        }

        default:
            return null;
    }
}

export { buildPreviewPresentation };
