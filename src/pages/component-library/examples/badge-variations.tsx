import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Ban, Bell, Search, Check, Shield, X, Bookmark } from 'lucide-react';

/* ── Static variants ─────────────────────────────────────────────────────── */

/** Solid destructive badge with icon. */
export function BadgeSolidDestructive() {
  const rootClassName = [
    'rounded-md',
    'text-[var(--j6-neutral-0-light)]',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[24px]',
    'px-[8px]',
  ].join(' ');
  const rootStyle = {
    background: 'rgba(239, 68, 68, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Badge className={rootClassName} style={rootStyle}><Ban size={12} /> Badge token</Badge>
  );
}

/** Outline badge — transparent bg with border. */
export function BadgeOutline() {
  const rootClassName = [
    'bg-[#ffffff]/0',
    'border-solid',
    'border',
    'rounded-md',
    'text-[var(--j6-neutral-50-light)]',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[24px]',
    'px-[8px]',
  ].join(' ');
  const rootStyle = {
    borderColor: 'rgba(203, 213, 225, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Badge className={rootClassName} style={rootStyle}>Badge token</Badge>
  );
}

/** Pill badge — sky accent, full radius. */
export function BadgePillSky() {
  const rootComponentClassName = 'rounded-full';
  const rootClassName = [
    rootComponentClassName,
    'bg-[var(--j6-accent-sky-light)]',
    'rounded-3xl',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[24px]',
    'px-[8px]',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(248, 250, 252, 1.000)',
  };

  return (
    <Badge className={rootClassName} style={rootStyle}>Badge token</Badge>
  );
}

/* ── Effect variants ─────────────────────────────────────────────────────── */

/** Pill badge with grain texture + bell icon. */
export function BadgeGrainBell() {
  const rootEffectClassName = 'ui-studio-effect-grain';
  const rootClassName = [
    'rounded-full',
    rootEffectClassName,
    'bg-[var(--j6-accent-sky-light)]',
    'rounded-3xl',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[24px]',
    'px-[8px]',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(248, 250, 252, 1.000)',
    '--ui-effect-grain-opacity': '0.25',
    '--ui-effect-grain-size': '200',
  };

  return (
    <Badge className={rootClassName} style={rootStyle}><Bell size={11} /> Badge token</Badge>
  );
}

/** Pill badge with grain — no icon. */
export function BadgeGrainPlain() {
  const rootEffectClassName = 'ui-studio-effect-grain';
  const rootClassName = [
    'rounded-full',
    rootEffectClassName,
    'bg-[var(--j6-accent-sky-light)]',
    'rounded-3xl',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[24px]',
    'px-[8px]',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(248, 250, 252, 1.000)',
    '--ui-effect-grain-opacity': '0.25',
    '--ui-effect-grain-size': '200',
  };

  return (
    <Badge className={rootClassName} style={rootStyle}>Badge token</Badge>
  );
}

/** Grain icon-only badge — search icon. */
export function BadgeGrainIconOnly() {
  const rootEffectClassName = 'ui-studio-effect-grain';
  const rootClassName = [
    'rounded-full',
    rootEffectClassName,
    'bg-[var(--j6-accent-sky-light)]',
    'rounded-3xl',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[24px]',
    'px-[8px]',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(248, 250, 252, 1.000)',
    '--ui-effect-grain-opacity': '0.25',
    '--ui-effect-grain-size': '200',
  };

  return (
    <Badge className={rootClassName} style={rootStyle}><Search size={11} /></Badge>
  );
}

/* ── Semantic status variants ────────────────────────────────────────────── */

/** Success badge — green tint with check icon. */
export function BadgeStatusSuccess() {
  const rootClassName = [
    'border-solid',
    'border',
    'border-[#059669]/30',
    'rounded-md',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[24px]',
    'px-[8px]',
  ].join(' ');
  const rootStyle = {
    background: 'rgba(236, 253, 245, 1.000)',
    color: 'rgba(6, 95, 70, 1.000)',
  };

  return (
    <Badge className={rootClassName} style={rootStyle}><Check size={10} /> Badge token</Badge>
  );
}

/** Warning badge — yellow tint with shield icon. */
export function BadgeStatusWarning() {
  const rootClassName = [
    'border-solid',
    'border',
    'border-[#ca8a04]/30',
    'rounded-md',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[24px]',
    'px-[8px]',
  ].join(' ');
  const rootStyle = {
    background: 'rgba(254, 252, 232, 1.000)',
    color: 'rgba(133, 77, 14, 1.000)',
  };

  return (
    <Badge className={rootClassName} style={rootStyle}><Shield size={13} /> Badge token</Badge>
  );
}

/** Error badge — red tint with X icon. */
export function BadgeStatusError() {
  const rootClassName = [
    'border-solid',
    'border',
    'border-[#dc2626]/20',
    'rounded-md',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[24px]',
    'px-[8px]',
  ].join(' ');
  const rootStyle = {
    background: 'rgba(254, 242, 242, 1.000)',
    color: 'rgba(153, 27, 27, 1.000)',
  };

  return (
    <Badge className={rootClassName} style={rootStyle}><X size={12} /> Badge token</Badge>
  );
}

/** Info badge — blue tint with bookmark icon. */
export function BadgeStatusInfo() {
  const rootClassName = [
    'border-solid',
    'border',
    'border-[#3b82f6]/30',
    'rounded-md',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[24px]',
    'px-[8px]',
  ].join(' ');
  const rootStyle = {
    background: 'rgba(239, 246, 255, 1.000)',
    color: 'rgba(30, 58, 138, 1.000)',
  };

  return (
    <Badge className={rootClassName} style={rootStyle}><Bookmark size={12} /> Badge token</Badge>
  );
}

/* ── Motion variants ─────────────────────────────────────────────────────── */

/** Info badge with blur-fade entry animation. */
export function BadgeEntryBlurFade() {
  const rootClassName = [
    'border-solid',
    'border',
    'border-[#3b82f6]/30',
    'rounded-md',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[24px]',
    'px-[8px]',
  ].join(' ');
  const rootStyle = {
    background: 'rgba(239, 246, 255, 1.000)',
    color: 'rgba(30, 58, 138, 1.000)',
  };

  const motionProps = {
    initial: { filter: 'blur(4px)' },
    animate: { filter: 'blur(0px)' },
    transition: { type: 'tween' as const, duration: 0.65, ease: 'easeInOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <Badge className={rootClassName} style={rootStyle}><Bookmark size={12} /> Badge token</Badge>
    </motion.div>
  );
}

/** Info badge with spring tap — squish on press. */
export function BadgeTapSpring() {
  const rootClassName = [
    'border-solid',
    'border',
    'border-[#3b82f6]/30',
    'rounded-md',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[24px]',
    'px-[8px]',
  ].join(' ');
  const rootStyle = {
    background: 'rgba(239, 246, 255, 1.000)',
    color: 'rgba(30, 58, 138, 1.000)',
  };

  const motionProps = {
    whileTap: {
      scale: 0.96,
      transition: { type: 'spring' as const, duration: 0.15, stiffness: 420, damping: 30, mass: 0.75 },
    },
  };

  return (
    <motion.div {...motionProps}>
      <Badge className={rootClassName} style={rootStyle}><Bookmark size={12} /> Badge token</Badge>
    </motion.div>
  );
}
