import { motion } from 'motion/react';
import { StatefulButton } from '@/components/ui/stateful-button';

/* ── State cycle variants ────────────────────────────────────────────────── */

/** Emerald stage button — success cycle with auto-play. */
export function StageButtonEmeraldSuccess() {
  const rootClassName = [
    'bg-[var(--j6-accent-emerald-light)]',
    'border-solid',
    'border',
    'border-[#16b8a8]/80',
    'rounded-md',
    'text-[var(--j6-neutral-50-dark)]',
    'text-sm',
    'font-semibold',
    'text-center',
    'justify-center',
    'min-h-[34px]',
    'h-[34px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <StatefulButton
      className={rootClassName}
      style={rootStyle}
      autoPlay
      resultState="success"
      loadingDurationMs={600}
      resetDelayMs={1600}
    >
      Submit
    </StatefulButton>
  );
}

/** Amber stage button — warning cycle. */
export function StageButtonAmberWarning() {
  const rootClassName = [
    'bg-[var(--j6-amber-400-light)]',
    'border-solid',
    'border',
    'border-[#c4800a]/50',
    'rounded-md',
    'text-[var(--j6-neutral-600-dark)]',
    'text-sm',
    'font-semibold',
    'text-center',
    'justify-center',
    'min-h-[34px]',
    'h-[34px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <StatefulButton
      className={rootClassName}
      style={rootStyle}
      autoPlay
      resultState="warning"
      loadingDurationMs={800}
    >
      Validate
    </StatefulButton>
  );
}

/* ── Motion variants ─────────────────────────────────────────────────────── */

/** Rose stage button — failure cycle with hover lift. */
export function StageButtonRoseFailure() {
  const rootClassName = [
    'bg-[var(--j6-accent-rose-light)]',
    'border-solid',
    'border',
    'border-[#e11d48]/50',
    'rounded-md',
    'text-[var(--j6-neutral-0-light)]',
    'text-sm',
    'font-semibold',
    'text-center',
    'justify-center',
    'min-h-[34px]',
    'h-[34px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
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
      <StatefulButton
        className={rootClassName}
        style={rootStyle}
        autoPlay
        resultState="failure"
        loadingDurationMs={500}
      >
        Delete
      </StatefulButton>
    </motion.div>
  );
}

/* ── Effect variants ─────────────────────────────────────────────────────── */

/** Violet stage button with grain effect. */
export function StageButtonVioletGrain() {
  const rootEffectClassName = 'ui-studio-effect-grain';
  const rootClassName = [
    rootEffectClassName,
    'bg-[var(--j6-violet-500-light)]',
    'rounded-md',
    'text-[var(--j6-neutral-0-light)]',
    'text-sm',
    'font-semibold',
    'text-center',
    'justify-center',
    'min-h-[34px]',
    'h-[34px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
    '--ui-effect-grain-opacity': '0.2',
    '--ui-effect-grain-size': '200',
  };

  return (
    <StatefulButton
      className={rootClassName}
      style={rootStyle}
      autoPlay
      resultState="success"
    >
      Confirm
    </StatefulButton>
  );
}
