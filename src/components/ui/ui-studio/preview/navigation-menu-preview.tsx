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
import { buildRelationshipMotionProps, renderStaggeredChildren } from '../motion';
import type { ComponentStyleConfig, StudioTextItem } from '@/components/ui/ui-studio.types';
import { buildComponentWrapperStyle } from '../utilities';

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
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const navItems = instanceStyle.navMenuItems.slice(0, instanceStyle.navMenuItemCount);
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
    const wrapLink = (content: React.ReactNode, index: number) => {
        const itemMotionProps = buildRelationshipMotionProps(instanceStyle, {
            activeIndex: hoveredIndex,
            currentIndex: index,
            total: navItems.length,
            axis: instanceStyle.navMenuOrientation === 'vertical' ? 'y' : 'x',
        });
        const hasHoverOrTap = Boolean(itemMotionProps.animate || itemMotionProps.whileHover || itemMotionProps.whileTap);
        if (!hasHoverOrTap) return content;
        return (
            <motion.div
                animate={itemMotionProps.animate}
                whileHover={itemMotionProps.whileHover}
                whileTap={itemMotionProps.whileTap}
                transition={itemMotionProps.transition}
                style={itemMotionProps.style}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex((current) => (current === index ? null : current))}
            >
                {content}
            </motion.div>
        );
    };

    const menuItems = navItems.map((item: StudioTextItem, idx) => {
        if (showDropdown && idx === 1) {
            return (
                <NavigationMenuItem key={item.id}>
                    {wrapLink(
                        <NavigationMenuTrigger variant={triggerVariant}>
                            {item.label}
                        </NavigationMenuTrigger>,
                        idx,
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
            <NavigationMenuItem key={item.id}>
                {wrapLink(
                    <NavigationMenuLink
                        active={isActive}
                        variant={triggerVariant}
                        navigationItem
                        activeBg={instanceStyle.navMenuActiveBg || undefined}
                        activeText={instanceStyle.navMenuActiveText || undefined}
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            setActiveIndex(idx);
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        {item.label}
                    </NavigationMenuLink>,
                    idx,
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
