import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';

/* ── Entry motion variants ───────────────────────────────────────────────── */

/** Primary brand button — scale-down entry (starts big, settles to 1). */
export function ButtonEntryScaleDown() {
  const rootClassName = [
    'bg-[var(--j6-amber-400-light)]',
    'border-solid',
    'border',
    'rounded-sm',
    'text-[var(--j6-neutral-600-dark)]',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[29px]',
    'h-[29px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    borderColor: 'rgba(196, 128, 10, 0.530)',
    fontFamily: 'Nunito',
  };

  const motionProps = {
    initial: { scale: 1.11 },
    animate: { scale: 1 },
    transition: { type: 'tween' as const, duration: 0.55, ease: 'easeInOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <Button variant="default" size="default" className={rootClassName} style={rootStyle}>
        Primary action
      </Button>
    </motion.div>
  );
}

/** Primary brand button — scale-up entry (starts small, settles to 1). */
export function ButtonEntryScaleUp() {
  const rootClassName = [
    'bg-[var(--j6-amber-400-light)]',
    'border-solid',
    'border',
    'rounded-sm',
    'text-[var(--j6-neutral-600-dark)]',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[29px]',
    'h-[29px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    borderColor: 'rgba(196, 128, 10, 0.530)',
    fontFamily: 'Nunito',
  };

  const motionProps = {
    initial: { scale: 0.92 },
    animate: { scale: 1 },
    transition: { type: 'tween' as const, duration: 0.55, ease: 'easeInOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <Button variant="default" size="default" className={rootClassName} style={rootStyle}>
        Primary action
      </Button>
    </motion.div>
  );
}

/* ── Hover motion variants ───────────────────────────────────────────────── */

/** Primary brand button — spring hover lift. */
export function ButtonHoverLift() {
  const rootClassName = [
    'bg-[var(--j6-amber-400-light)]',
    'rounded-sm',
    'text-[var(--j6-neutral-600-dark)]',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[29px]',
    'h-[29px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  const motionProps = {
    whileHover: {
      y: 1,
      scale: 1.04,
      transition: { type: 'spring' as const, duration: 0.25, stiffness: 485, damping: 20, mass: 0.8 },
    },
  };

  return (
    <motion.div {...motionProps}>
      <Button variant="default" size="default" className={rootClassName} style={rootStyle}>
        Primary action
      </Button>
    </motion.div>
  );
}

/** Primary brand button — hover + tap combo (lift on hover, squish on tap). */
export function ButtonHoverTapCombo() {
  const rootClassName = [
    'bg-[var(--j6-amber-400-light)]',
    'rounded-sm',
    'text-[var(--j6-neutral-600-dark)]',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[29px]',
    'h-[29px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  const motionProps = {
    whileHover: {
      y: 1,
      scale: 1.04,
      transition: { type: 'spring' as const, duration: 0.25, stiffness: 485, damping: 20, mass: 0.8 },
    },
    whileTap: {
      scale: 0.96,
      transition: { type: 'spring' as const, duration: 0.15, stiffness: 420, damping: 30, mass: 0.75 },
    },
  };

  return (
    <motion.div {...motionProps}>
      <Button variant="default" size="default" className={rootClassName} style={rootStyle}>
        Primary action
      </Button>
    </motion.div>
  );
}

/* ── Effect variants ─────────────────────────────────────────────────────── */

/** Gradient slide button — orange-to-amber sweep with icon. */
export function ButtonGradientSlide() {
  const rootEffectClassName = 'ui-studio-effect-gradient-slide ui-studio-effect-gradient-slide-left ui-studio-effect-gradient-slide-gradient';
  const rootClassName = [
    rootEffectClassName,
    'bg-[var(--j6-amber-400-light)]',
    'border-solid',
    'border-[0.5px]',
    'border-[#c4800a]/75',
    'rounded-sm',
    'text-[var(--j6-neutral-0-light)]',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[29px]',
    'h-[29px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
    '--ui-motion-gradient-from': '#eb5a0c',
    '--ui-motion-gradient-to': '#ff8a05',
    '--ui-effect-gs-speed': '0.32s',
  };

  return (
    <Button variant="default" size="default" className={rootClassName} style={rootStyle}>
      <Bookmark size={18} /> Primary action
    </Button>
  );
}

/** Animated border — multi-color rotating border with icon. */
export function ButtonAnimatedBorder() {
  const rootEffectClassName = 'ui-studio-effect-animated-border ui-studio-effect-animated-border-state-default ui-studio-effect-animated-border-state-hover ui-studio-effect-animated-border-state-active';
  const rootClassName = [
    rootEffectClassName,
    'border-solid',
    'border-2',
    'rounded-sm',
    'text-[var(--j6-neutral-0-light)]',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[33px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
    '--ui-motion-speed': '2.8s',
    '--ui-motion-fill': 'rgba(159, 114, 255, 1.000)',
    '--ui-effect-fill-base': 'rgba(159, 114, 255, 1.000)',
    '--ui-effect-border-speed': '2.8s',
    '--ui-effect-border-width': '3px',
    '--ui-effect-border-1': '#6d28d9',
    '--ui-effect-border-2': '#3b0e87',
    '--ui-effect-border-3': '#9f72ff',
    '--ui-effect-border-4': '#34d399',
    '--ui-effect-border-5': '#f59e0b',
    '--ui-effect-border-count': '3',
  };

  return (
    <Button variant="default" size="default" className={rootClassName} style={rootStyle}>
      <Bookmark size={18} /> Primary action
    </Button>
  );
}

/** Ripple fill — violet with click ripple effect. */
export function ButtonRippleFill() {
  const rootEffectClassName = 'ui-studio-effect-ripple-fill';
  const rootClassName = [
    rootEffectClassName,
    'bg-[var(--j6-violet-400)]',
    'rounded-sm',
    'text-[var(--j6-neutral-0-light)]',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[33px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
    '--ui-motion-ripple-color': '#3b0e87',
    '--ui-effect-ripple-speed': '0.5s',
  };

  return (
    <Button variant="default" size="default" className={rootClassName} style={rootStyle}>
      Primary action
    </Button>
  );
}

/** Border beam — dark bg with pink traveling beam. */
export function ButtonBorderBeam() {
  const rootEffectClassName = 'ui-studio-effect-border-beam';
  const rootClassName = [
    rootEffectClassName,
    'bg-[var(--j6-neutral-600-dark)]',
    'rounded-sm',
    'text-[var(--j6-neutral-0-light)]',
    'text-sm',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[38px]',
    'h-[38px]',
    'px-[14px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
    '--ui-motion-speed': '2.8s',
    '--ui-motion-fill': 'rgba(26, 26, 29, 1.000)',
    '--ui-effect-beam-speed': '6s',
    '--ui-effect-beam-size': '80px',
    '--ui-effect-beam-width': '2px',
    '--ui-effect-beam-from': '#f472b6',
    '--ui-effect-beam-to': '#db2777',
  };

  return (
    <Button variant="default" size="default" className={rootClassName} style={rootStyle}>
      Primary action
    </Button>
  );
}

/** Border beam large — same effect at a bigger size. */
export function ButtonBorderBeamLarge() {
  const rootEffectClassName = 'ui-studio-effect-border-beam';
  const rootClassName = [
    rootEffectClassName,
    'bg-[var(--j6-neutral-600-dark)]',
    'rounded-sm',
    'text-[var(--j6-neutral-0-light)]',
    'text-base',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[44px]',
    'h-[44px]',
    'px-[17px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
    '--ui-motion-speed': '2.8s',
    '--ui-motion-fill': 'rgba(26, 26, 29, 1.000)',
    '--ui-effect-beam-speed': '6s',
    '--ui-effect-beam-size': '80px',
    '--ui-effect-beam-width': '2px',
    '--ui-effect-beam-from': '#f472b6',
    '--ui-effect-beam-to': '#db2777',
  };

  return (
    <Button variant="default" size="default" className={rootClassName} style={rootStyle}>
      Primary action
    </Button>
  );
}

/** Shine border — indigo with white light sweep. */
export function ButtonShineBorder() {
  const rootEffectClassName = 'ui-studio-effect-shine-border';
  const rootClassName = [
    rootEffectClassName,
    'bg-[var(--j6-accent-indigo-light)]',
    'rounded-sm',
    'text-[var(--j6-neutral-0-light)]',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[34px]',
    'h-[34px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
    '--ui-motion-speed': '2.8s',
    '--ui-motion-fill': 'rgba(67, 56, 202, 1.000)',
    '--ui-effect-shine-speed': '4s',
    '--ui-effect-shine-color': '#ffffff',
    '--ui-effect-shine-width': '2px',
  };

  return (
    <Button variant="default" size="default" className={rootClassName} style={rootStyle}>
      Primary action
    </Button>
  );
}

/** Pulse ring — sky accent with radiating pulse. */
export function ButtonPulseRing() {
  const rootEffectClassName = 'ui-studio-effect-pulse-ring';
  const rootClassName = [
    rootEffectClassName,
    'bg-[var(--j6-accent-sky-light)]',
    'rounded-sm',
    'text-[var(--j6-neutral-0-light)]',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[34px]',
    'h-[34px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
    '--ui-motion-speed': '2.8s',
    '--ui-motion-fill': 'rgba(2, 132, 199, 1.000)',
    '--ui-effect-pulse-speed': '1.5s',
    '--ui-effect-pulse-width': '2px',
    '--ui-effect-pulse-color': '#22d3ee',
  };

  return (
    <Button variant="default" size="default" className={rootClassName} style={rootStyle}>
      Primary action
    </Button>
  );
}

/** Glass button — transparent with backdrop blur and hover lift. */
export function ButtonGlass() {
  const rootClassName = [
    'bg-[#000000]/0',
    'rounded-sm',
    'text-[var(--j6-neutral-0-light)]',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[34px]',
    'h-[34px]',
    'px-[12px]',
    'shadow-[0_2px_4px_rgba(0,0,0,0.14),_0_4px_8px_rgba(0,0,0,0.10),_0_1px_2px_rgba(0,0,0,0.08)]',
    'backdrop-[blur(40px)_saturate(160%)]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  const motionProps = {
    whileHover: {
      y: 1,
      scale: 1.04,
      transition: { type: 'spring' as const, duration: 0.25, stiffness: 485, damping: 20, mass: 0.8 },
    },
  };

  return (
    <motion.div {...motionProps}>
      <Button variant="default" size="default" className={rootClassName} style={rootStyle}>
        Primary action
      </Button>
    </motion.div>
  );
}
