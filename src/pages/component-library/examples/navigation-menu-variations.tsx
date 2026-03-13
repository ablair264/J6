import { FileText, Layers3, Sparkles, Users } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

const interFont = "'Inter', system-ui, sans-serif";

function MenuPanelLink({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          href="#"
          onClick={(event) => event.preventDefault()}
          className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-white/[0.04]"
        >
          <Icon className="mt-0.5 size-4 shrink-0 opacity-75" />
          <div className="space-y-1">
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="text-xs leading-snug opacity-65">{description}</p>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
}

/** Horizontal nav — dark with amber dropdown content. */
export function NavigationMenuDarkAmber() {
  return (
    <div className="w-full max-w-[440px] pb-36">
      <NavigationMenu
        hoverBg="rgba(245,166,35,0.12)"
        hoverText="#f5a623"
        activeBg="rgba(245,166,35,0.18)"
        activeText="#f5a623"
        className="text-sm font-medium"
        style={{ color: '#e2e8f0', fontFamily: interFont }}
      >
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" navigationItem onClick={(event) => event.preventDefault()}>Home</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger variant="ghost">Components</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[340px] gap-1 rounded-xl border border-white/10 bg-[#141416] p-2 text-[#f0ede8]">
                <MenuPanelLink icon={Layers3} title="Library" description="Browse buttons, inputs, overlays, and charts." />
                <MenuPanelLink icon={FileText} title="Docs" description="Implementation notes and production-ready snippets." />
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" navigationItem active onClick={(event) => event.preventDefault()}>
              Docs
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

/** Horizontal nav — violet resources menu. */
export function NavigationMenuViolet() {
  return (
    <div className="w-full max-w-[440px] pb-36">
      <NavigationMenu
        hoverBg="rgba(139,92,246,0.12)"
        hoverText="#c4b5fd"
        activeBg="rgba(139,92,246,0.18)"
        activeText="#c4b5fd"
        className="text-sm font-medium"
        style={{ color: '#c8c4bc', fontFamily: interFont }}
      >
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" navigationItem onClick={(event) => event.preventDefault()}>Overview</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger variant="ghost">Resources</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[340px] gap-1 rounded-xl border border-[#8b5cf6]/20 bg-[#120d1d] p-2 text-white">
                <MenuPanelLink icon={Sparkles} title="Playbooks" description="Patterns for shipping polished UI faster." />
                <MenuPanelLink icon={Users} title="Community" description="Design critiques, changelogs, and release previews." />
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" navigationItem onClick={(event) => event.preventDefault()}>Pricing</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

/** Vertical nav — stacked orientation with active item. */
export function NavigationMenuVertical() {
  return (
    <div className="w-full max-w-[260px] pb-32">
      <NavigationMenu
        orientation="vertical"
        hoverBg="rgba(16,185,129,0.1)"
        hoverText="#34d399"
        activeBg="rgba(16,185,129,0.15)"
        activeText="#34d399"
        className="text-sm font-medium"
        style={{ color: '#e2e8f0', fontFamily: interFont }}
      >
        <NavigationMenuList className="w-full items-stretch">
          <NavigationMenuItem>
            <NavigationMenuLink href="#" navigationItem onClick={(event) => event.preventDefault()} className="w-full justify-start">
              Dashboard
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" navigationItem active onClick={(event) => event.preventDefault()} className="w-full justify-start">
              Settings
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" navigationItem onClick={(event) => event.preventDefault()} className="w-full justify-start">
              Account
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
