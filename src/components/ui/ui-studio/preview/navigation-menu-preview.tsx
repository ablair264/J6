import { useState } from 'react';
import type { CSSProperties } from 'react';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { renderStaggeredChildren } from '../motion';
import type { ComponentStyleConfig } from '@/components/ui/ui-studio.types';
import { buildComponentWrapperStyle } from '../utilities';

const NAV_ITEMS = ['Home', 'About', 'Services', 'Contact', 'Blog'];

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

    const menuItems = navItems.map((label, idx) => (
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
    ));
    const staggeredItems = renderStaggeredChildren(menuItems, instanceStyle);

    return (
        <NavigationMenu
            orientation={instanceStyle.navMenuOrientation}
            style={buildComponentWrapperStyle(style, 'navigation-menu')}
            className={cn(motionClassName)}
        >
            <NavigationMenuList>
                {staggeredItems}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
