import { motion } from 'motion/react';
import { ChevronDown, Copy, Download, Share2, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const font = "'Inter', system-ui, sans-serif";

/** Dropdown menu example — dark action list. */
export function DropdownMenuTriggerDark() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="rounded-lg border border-solid text-sm font-medium text-center justify-center h-10 px-5 gap-1.5 bg-[#1e1e22] hover:bg-[#1e1e22] text-[#e2e8f0]"
          style={{
            borderColor: '#303035',
            fontFamily: font,
          }}
        >
          Options <ChevronDown size={15} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56 border-white/10 bg-[#141416] text-[#f0ede8]">
        <DropdownMenuLabel style={{ fontFamily: font }}>Project actions</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/8" />
        <DropdownMenuItem style={{ fontFamily: font }}>
          <Download size={15} />
          Export build
          <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem style={{ fontFamily: font }}>
          <Copy size={15} />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" style={{ fontFamily: font }}>
          <Trash2 size={15} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Dropdown menu example — amber trigger with quick actions. */
export function DropdownMenuTriggerAmber() {
  return (
    <motion.div
      whileHover={{
        y: -1,
        scale: 1.03,
        transition: { type: 'spring' as const, duration: 0.25, stiffness: 485, damping: 20, mass: 0.8 },
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-lg text-sm font-medium text-center justify-center h-10 px-5 gap-1.5 bg-[#f5a623] hover:bg-[#ffba4a] text-[#1a1a1d]"
            style={{ fontFamily: font }}
          >
            Actions <ChevronDown size={15} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 border-[#f5a623]/25 bg-[#1a1510] text-[#fff1d6]">
          <DropdownMenuItem style={{ fontFamily: font }}>
            <Sparkles size={15} />
            Promote draft
          </DropdownMenuItem>
          <DropdownMenuItem style={{ fontFamily: font }}>
            <Share2 size={15} />
            Share preview
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#f5a623]/12" />
          <DropdownMenuItem variant="destructive" style={{ fontFamily: font }}>
            <Trash2 size={15} />
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}

/** Dropdown menu example — violet trigger with submenu. */
export function DropdownMenuTriggerEffect() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="ui-studio-effect-gradient-slide ui-studio-effect-gradient-slide-left ui-studio-effect-gradient-slide-gradient rounded-lg text-sm font-medium text-center justify-center h-10 px-5 gap-1.5 bg-[#7c3aed] hover:bg-[#7c3aed] text-white"
          style={{
            fontFamily: font,
            '--ui-motion-gradient-from': '#4f46e5',
            '--ui-motion-gradient-to': '#9f72ff',
            '--ui-effect-gs-speed': '0.35s',
          } as React.CSSProperties}
        >
          Menu <ChevronDown size={15} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56 border-[#8b5cf6]/25 bg-[#120d1d] text-white">
        <DropdownMenuItem style={{ fontFamily: font }}>
          <Copy size={15} />
          Clone style
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger style={{ fontFamily: font }}>
            <Share2 size={15} />
            Share
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-[#8b5cf6]/25 bg-[#120d1d] text-white">
            <DropdownMenuItem style={{ fontFamily: font }}>Copy link</DropdownMenuItem>
            <DropdownMenuItem style={{ fontFamily: font }}>Invite team</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator className="bg-white/8" />
        <DropdownMenuItem variant="destructive" style={{ fontFamily: font }}>
          <Trash2 size={15} />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
