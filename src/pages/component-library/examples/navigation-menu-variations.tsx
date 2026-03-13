import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu';

/** Horizontal nav — dark with amber hover. */
export function NavigationMenuDarkAmber() {
  const rootClassName = [
    'text-sm',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <NavigationMenu
      hoverBg="rgba(255, 186, 74, 0.15)"
      hoverText="var(--j6-amber-400-light)"
      className={rootClassName}
      style={rootStyle}
    >
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" navigationItem>Home</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" navigationItem>Components</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" navigationItem active activeBg="rgba(255, 186, 74, 0.2)" activeText="var(--j6-amber-400-light)">Docs</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

/** Horizontal nav — violet accent. */
export function NavigationMenuViolet() {
  const rootClassName = [
    'text-sm',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(200, 196, 188, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <NavigationMenu
      hoverBg="rgba(159, 114, 255, 0.15)"
      hoverText="var(--j6-violet-400)"
      className={rootClassName}
      style={rootStyle}
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

/** Vertical nav — dark with emerald active. */
export function NavigationMenuVertical() {
  const rootClassName = [
    'text-sm',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <NavigationMenu
      orientation="vertical"
      hoverBg="rgba(52, 211, 153, 0.12)"
      hoverText="var(--j6-accent-emerald-dark)"
      className={rootClassName}
      style={rootStyle}
    >
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" navigationItem>Dashboard</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" navigationItem active activeBg="rgba(52, 211, 153, 0.15)" activeText="var(--j6-accent-emerald-dark)">Settings</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" navigationItem>Account</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
