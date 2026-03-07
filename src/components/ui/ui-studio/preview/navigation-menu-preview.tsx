import { useState } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { FileText, Users, Settings, Mail } from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuTrigger,
    NavigationMenuContent,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { renderStaggeredChildren } from '../motion';
import type { ComponentStyleConfig } from '@/components/ui/ui-studio.types';
import { buildComponentWrapperStyle } from '../utilities';

const NAV_ITEMS = ['Home', 'About', 'Services', 'Contact', 'Blog'];

const DROPDOWN_ITEMS = [
    { label: 'Documentation', description: 'Learn how to get started', icon: FileText },
    { label: 'Team', description: 'Meet the people behind the project', icon: Users },
    { label: 'Settings', description: 'Manage your preferences', icon: Settings },
    { label: 'Contact', description: 'Get in touch with support', icon: Mail },
];

export function NavigationMenuPreview({
    instanceStyle,
    style,
    motionClassName: _motionClassName,
}: {
    instanceStyle: ComponentStyleConfig;
    style: CSSProperties;
    motionClassName?: string;
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const navItems = NAV_ITEMS.slice(0, instanceStyle.navMenuItemCount);
    const showDropdown = instanceStyle.navMenuShowDropdown;
    const triggerVariant = instanceStyle.navMenuTriggerVariant || 'ghost';

    const dropdownPanelStyle: CSSProperties = {
        backgroundColor: instanceStyle.navMenuDropdownBg || undefined,
        color: instanceStyle.navMenuDropdownText || undefined,
        borderColor: instanceStyle.navMenuDropdownBorderColor || undefined,
        borderWidth: instanceStyle.navMenuDropdownBorderColor ? 1 : undefined,
        borderStyle: instanceStyle.navMenuDropdownBorderColor ? 'solid' : undefined,
    };

    // Per-item hover/tap motion
    const hasHoverOrTap = instanceStyle.motionHoverEnabled || instanceStyle.motionTapEnabled;
    const itemHover = instanceStyle.motionHoverEnabled ? {
        scale: instanceStyle.motionHoverScale / 100,
        x: instanceStyle.motionHoverX,
        y: instanceStyle.motionHoverY,
        rotate: instanceStyle.motionHoverRotate,
        opacity: instanceStyle.motionHoverOpacity / 100,
    } : undefined;
    const itemTap = instanceStyle.motionTapEnabled ? {
        scale: instanceStyle.motionTapScale / 100,
        x: instanceStyle.motionTapX,
        y: instanceStyle.motionTapY,
        rotate: instanceStyle.motionTapRotate,
        opacity: instanceStyle.motionTapOpacity / 100,
    } : undefined;

    const wrapLink = (content: React.ReactNode) => {
        if (!hasHoverOrTap) return content;
        return (
            <motion.div whileHover={itemHover} whileTap={itemTap}>
                {content}
            </motion.div>
        );
    };

    const menuItems = navItems.map((label, idx) => {
        if (showDropdown && idx === 1) {
            return (
                <NavigationMenuItem key={label}>
                    {wrapLink(
                        <NavigationMenuTrigger variant={triggerVariant}>
                            {label}
                        </NavigationMenuTrigger>
                    )}
                    <NavigationMenuContent>
                        <ul className="grid w-[340px] gap-1 p-2" style={dropdownPanelStyle}>
                            {DROPDOWN_ITEMS.map((item) => (
                                <li key={item.label}>
                                    <NavigationMenuLink asChild>
                                        <a
                                            href="#"
                                            onClick={(e) => e.preventDefault()}
                                            className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-[var(--nav-hover-bg,hsl(var(--accent)))] hover:text-[var(--nav-hover-text,hsl(var(--accent-foreground)))]"
                                        >
                                            <item.icon className="mt-0.5 size-4 shrink-0 opacity-70" />
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium leading-none">{item.label}</div>
                                                <p className="text-xs leading-snug opacity-60">{item.description}</p>
                                            </div>
                                        </a>
                                    </NavigationMenuLink>
                                </li>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            );
        }

        const isActive = instanceStyle.navMenuActiveIndicator && idx === activeIndex;

        return (
            <NavigationMenuItem key={label}>
                {wrapLink(
                    <NavigationMenuLink
                        active={isActive}
                        activeBg={instanceStyle.navMenuActiveBg || undefined}
                        activeText={instanceStyle.navMenuActiveText || undefined}
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            setActiveIndex(idx);
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        {label}
                    </NavigationMenuLink>
                )}
            </NavigationMenuItem>
        );
    });
    const staggeredItems = renderStaggeredChildren(menuItems, instanceStyle);

    const wrapperStyle = buildComponentWrapperStyle(style, 'navigation-menu');

    return (
        <NavigationMenu
            orientation={instanceStyle.navMenuOrientation}
            style={wrapperStyle}
            hoverBg={instanceStyle.navMenuHoverBg || undefined}
            hoverText={instanceStyle.navMenuHoverText || undefined}
            activeBg={instanceStyle.navMenuActiveBg || undefined}
            activeText={instanceStyle.navMenuActiveText || undefined}
        >
            <NavigationMenuList>
                {staggeredItems}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
