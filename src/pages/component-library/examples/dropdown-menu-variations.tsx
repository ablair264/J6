import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

/** Dropdown trigger — dark with chevron. */
export function DropdownMenuTriggerDark() {
  const rootClassName = [
    'bg-[var(--j6-neutral-600-dark)]',
    'border-solid',
    'border',
    'border-[#5a5a64]',
    'rounded-sm',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[29px]',
    'h-[29px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Button className={rootClassName} style={rootStyle}>
      Options <ChevronDown size={14} />
    </Button>
  );
}

/** Dropdown trigger — amber with hover lift. */
export function DropdownMenuTriggerAmber() {
  const rootClassName = [
    'bg-[var(--j6-amber-400-light)]',
    'rounded-sm',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[29px]',
    'h-[29px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    color: 'var(--j6-neutral-600-dark)',
    fontFamily: 'Nunito',
  };

  const motionProps = {
    whileHover: {
      y: -1,
      scale: 1.03,
      transition: { type: 'spring' as const, duration: 0.25, stiffness: 485, damping: 20, mass: 0.8 },
    },
  };

  return (
    <motion.div {...motionProps}>
      <Button className={rootClassName} style={rootStyle}>
        Actions <ChevronDown size={14} />
      </Button>
    </motion.div>
  );
}

/** Dropdown trigger — violet gradient-slide effect. */
export function DropdownMenuTriggerEffect() {
  const rootEffectClassName = 'ui-studio-effect-gradient-slide ui-studio-effect-gradient-slide-left ui-studio-effect-gradient-slide-gradient';
  const rootClassName = [
    rootEffectClassName,
    'bg-[var(--j6-violet-500-light)]',
    'rounded-sm',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[29px]',
    'h-[29px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    color: 'var(--j6-neutral-0-light)',
    fontFamily: 'Nunito',
    '--ui-motion-gradient-from': '#6d28d9',
    '--ui-motion-gradient-to': '#9f72ff',
    '--ui-effect-gs-speed': '0.32s',
  };

  return (
    <Button className={rootClassName} style={rootStyle}>
      Menu <ChevronDown size={14} />
    </Button>
  );
}
