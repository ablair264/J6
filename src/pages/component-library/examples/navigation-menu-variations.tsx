import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu';

const interFont = "'Inter', system-ui, sans-serif";

/** Horizontal nav — dark with amber hover accent. */
export function NavigationMenuDarkAmber() {
  return (
    <NavigationMenu
      hoverBg="rgba(245,166,35,0.12)"
      hoverText="#f5a623"
      className="text-sm font-medium"
      style={{ color: '#e2e8f0', fontFamily: interFont }}
    >
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" navigationItem>Home</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" navigationItem>Components</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#"
            navigationItem
            active
            activeBg="rgba(245,166,35,0.18)"
            activeText="#f5a623"
          >
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

/** Horizontal nav — violet accent. */
export function NavigationMenuViolet() {
  return (
    <NavigationMenu
      hoverBg="rgba(139,92,246,0.12)"
      hoverText="#a78bfa"
      className="text-sm font-medium"
      style={{ color: '#c8c4bc', fontFamily: interFont }}
    >
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" navigationItem>Overview</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" navigationItem>Features</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" navigationItem>Pricing</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

/** Vertical nav — emerald accent with active state. */
export function NavigationMenuVertical() {
  return (
    <NavigationMenu
      orientation="vertical"
      hoverBg="rgba(16,185,129,0.1)"
      hoverText="#34d399"
      className="text-sm font-medium"
      style={{ color: '#e2e8f0', fontFamily: interFont }}
    >
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" navigationItem>Dashboard</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#"
            navigationItem
            active
            activeBg="rgba(16,185,129,0.15)"
            activeText="#34d399"
          >
            Settings
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" navigationItem>Account</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
