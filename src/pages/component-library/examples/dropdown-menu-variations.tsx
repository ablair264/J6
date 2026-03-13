import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const font = "'Inter', system-ui, sans-serif";

/** Dropdown trigger — dark with chevron. */
export function DropdownMenuTriggerDark() {
  return (
    <Button
      className="rounded-lg border border-solid text-sm font-medium text-center justify-center h-10 px-5 gap-1.5"
      style={{
        background: '#1e1e22',
        borderColor: '#303035',
        color: '#e2e8f0',
        fontFamily: font,
      }}
    >
      Options <ChevronDown size={15} />
    </Button>
  );
}

/** Dropdown trigger — amber with hover lift. */
export function DropdownMenuTriggerAmber() {
  return (
    <motion.div
      whileHover={{
        y: -1,
        scale: 1.03,
        transition: { type: 'spring' as const, duration: 0.25, stiffness: 485, damping: 20, mass: 0.8 },
      }}
    >
      <Button
        className="rounded-lg text-sm font-medium text-center justify-center h-10 px-5 gap-1.5"
        style={{
          background: 'linear-gradient(135deg, #f5a623, #e8940c)',
          color: '#1a1a1d',
          fontFamily: font,
        }}
      >
        Actions <ChevronDown size={15} />
      </Button>
    </motion.div>
  );
}

/** Dropdown trigger — violet gradient-slide effect. */
export function DropdownMenuTriggerEffect() {
  return (
    <Button
      className="ui-studio-effect-gradient-slide ui-studio-effect-gradient-slide-left ui-studio-effect-gradient-slide-gradient rounded-lg text-sm font-medium text-center justify-center h-10 px-5 gap-1.5"
      style={{
        background: '#7c3aed',
        color: '#ffffff',
        fontFamily: font,
        '--ui-motion-gradient-from': '#4f46e5',
        '--ui-motion-gradient-to': '#9f72ff',
        '--ui-effect-gs-speed': '0.35s',
      } as React.CSSProperties}
    >
      Menu <ChevronDown size={15} />
    </Button>
  );
}
