import { motion } from 'motion/react';
import { StatefulButton } from '@/components/ui/stateful-button';

const font = "'Inter', system-ui, sans-serif";

/* ── State cycle variants ────────────────────────────────────────────────── */

/** Emerald stage button — success cycle with auto-play. */
export function StageButtonEmeraldSuccess() {
  return (
    <StatefulButton
      className="rounded-lg border border-solid text-sm font-semibold text-center justify-center h-10 px-5"
      style={{
        background: '#10b981',
        borderColor: 'rgba(5, 150, 105, 0.6)',
        color: '#ffffff',
        fontFamily: font,
      }}
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
  return (
    <StatefulButton
      className="rounded-lg border border-solid text-sm font-semibold text-center justify-center h-10 px-5"
      style={{
        background: 'linear-gradient(135deg, #f5a623, #e8940c)',
        borderColor: 'rgba(196, 128, 10, 0.4)',
        color: '#1a1a1d',
        fontFamily: font,
      }}
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
  return (
    <motion.div
      whileHover={{
        y: -1,
        scale: 1.03,
        transition: { type: 'spring' as const, duration: 0.25, stiffness: 485, damping: 20, mass: 0.8 },
      }}
    >
      <StatefulButton
        className="rounded-lg border border-solid text-sm font-semibold text-center justify-center h-10 px-5"
        style={{
          background: '#e11d48',
          borderColor: 'rgba(190, 18, 60, 0.4)',
          color: '#ffffff',
          fontFamily: font,
        }}
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
  return (
    <StatefulButton
      className="ui-studio-effect-grain rounded-lg text-sm font-semibold text-center justify-center h-10 px-5"
      style={{
        background: '#7c3aed',
        color: '#ffffff',
        fontFamily: font,
        '--ui-effect-grain-opacity': '0.2',
        '--ui-effect-grain-size': '200',
      } as React.CSSProperties}
      autoPlay
      resultState="success"
    >
      Confirm
    </StatefulButton>
  );
}
