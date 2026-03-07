import { useState } from 'react';
import type { CSSProperties } from 'react';
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
    motionClassName,
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

    const menuItems = navItems.map((label, idx) => {
        // Make the second item ("About" typically) the dropdown trigger when enabled
        if (showDropdown && idx === 1) {
            return (
                <NavigationMenuItem key={label}>
                    <NavigationMenuTrigger variant={triggerVariant}>
                        {label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[340px] gap-2 p-3 md:grid-cols-1" style={dropdownPanelStyle}>
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

        return (
            <NavigationMenuItem key={label}>
                <NavigationMenuLink
                    active={instanceStyle.navMenuActiveIndicator && idx === activeIndex}
                    onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        setActiveIndex(idx);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    {label}
                </NavigationMenuLink>
            </NavigationMenuItem>
        );
    });
    const staggeredItems = renderStaggeredChildren(menuItems, instanceStyle);

    const wrapperStyle = buildComponentWrapperStyle(style, 'navigation-menu');

    return (
        <NavigationMenu
            orientation={instanceStyle.navMenuOrientation}
            style={wrapperStyle}
            className={cn(motionClassName)}
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
