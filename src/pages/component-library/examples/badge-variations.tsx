import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Ban, Bell, Search, Check, Shield, X, Bookmark } from 'lucide-react';

const font = "'Inter', system-ui, sans-serif";

/* ── Static variants ─────────────────────────────────────────────────────── */

/** Solid destructive badge with icon. */
export function BadgeSolidDestructive() {
  return (
    <Badge
      className="rounded-md text-[11px] font-medium text-center justify-center min-h-[24px] px-2 gap-1"
      style={{ background: '#ef4444', color: '#ffffff', fontFamily: font }}
    >
      <Ban size={12} /> Rejected
    </Badge>
  );
}

/** Outline badge — transparent bg with border. */
export function BadgeOutline() {
  return (
    <Badge
      className="rounded-md border border-solid text-[11px] font-medium text-center justify-center min-h-[22px] px-2"
      style={{
        background: 'transparent',
        borderColor: '#505058',
        color: '#e2e8f0',
        fontFamily: font,
      }}
    >
      Draft
    </Badge>
  );
}

/** Pill badge — sky accent, full radius. */
export function BadgePillSky() {
  return (
    <Badge
      className="rounded-full text-xs font-medium text-center justify-center min-h-[28px] px-3.5"
      style={{ background: '#0ea5e9', color: '#ffffff', fontFamily: font }}
    >
      New
    </Badge>
  );
}

/* ── Effect variants ─────────────────────────────────────────────────────── */

/** Pill badge with grain texture + bell icon. */
export function BadgeGrainBell() {
  return (
    <Badge
      className="ui-studio-effect-grain rounded-full text-xs font-medium text-center justify-center min-h-[28px] px-3.5 gap-1"
      style={{
        background: '#0ea5e9',
        color: '#ffffff',
        fontFamily: font,
        '--ui-effect-grain-opacity': '0.25',
        '--ui-effect-grain-size': '200',
      } as React.CSSProperties}
    >
      <Bell size={12} /> 3 Updates
    </Badge>
  );
}

/** Pill badge with grain — no icon. */
export function BadgeGrainPlain() {
  return (
    <Badge
      className="ui-studio-effect-grain rounded-full text-[11px] font-medium text-center justify-center min-h-[24px] px-2.5"
      style={{
        background: '#0ea5e9',
        color: '#ffffff',
        fontFamily: font,
        '--ui-effect-grain-opacity': '0.25',
        '--ui-effect-grain-size': '200',
      } as React.CSSProperties}
    >
      Featured
    </Badge>
  );
}

/** Grain icon-only badge — search icon. */
export function BadgeGrainIconOnly() {
  return (
    <Badge
      className="ui-studio-effect-grain rounded-full text-[11px] font-medium text-center justify-center min-h-[24px] px-2"
      style={{
        background: '#0ea5e9',
        color: '#ffffff',
        fontFamily: font,
        '--ui-effect-grain-opacity': '0.25',
        '--ui-effect-grain-size': '200',
      } as React.CSSProperties}
    >
      <Search size={12} />
    </Badge>
  );
}

/* ── Semantic status variants ────────────────────────────────────────────── */

/** Success badge — green tint with check icon. */
export function BadgeStatusSuccess() {
  return (
    <Badge
      className="rounded-md border border-solid text-[11px] font-medium text-center justify-center min-h-[24px] px-2.5 gap-1"
      style={{
        background: '#ecfdf5',
        borderColor: 'rgba(5, 150, 105, 0.3)',
        color: '#065f46',
        fontFamily: font,
      }}
    >
      <Check size={11} /> Completed
    </Badge>
  );
}

/** Warning badge — yellow tint with shield icon. */
export function BadgeStatusWarning() {
  return (
    <Badge
      className="rounded-md border border-solid text-xs font-medium text-center justify-center min-h-[26px] px-3 gap-1"
      style={{
        background: '#fefce8',
        borderColor: 'rgba(202, 138, 4, 0.3)',
        color: '#854d0e',
        fontFamily: font,
      }}
    >
      <Shield size={12} /> Review
    </Badge>
  );
}

/** Error badge — red tint with X icon. */
export function BadgeStatusError() {
  return (
    <Badge
      className="rounded-md border border-solid text-[11px] font-medium text-center justify-center min-h-[24px] px-2.5 gap-1"
      style={{
        background: '#fef2f2',
        borderColor: 'rgba(220, 38, 38, 0.2)',
        color: '#991b1b',
        fontFamily: font,
      }}
    >
      <X size={12} /> Failed
    </Badge>
  );
}

/** Info badge — blue tint with bookmark icon. */
export function BadgeStatusInfo() {
  return (
    <Badge
      className="rounded-md border border-solid text-xs font-medium text-center justify-center min-h-[26px] px-3 gap-1.5"
      style={{
        background: '#eff6ff',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        color: '#1e3a8a',
        fontFamily: font,
      }}
    >
      <Bookmark size={12} /> Updated
    </Badge>
  );
}

/* ── Motion variants ─────────────────────────────────────────────────────── */

/** Info badge with blur-fade entry animation. */
export function BadgeEntryBlurFade() {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(4px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ type: 'tween' as const, duration: 0.65, ease: 'easeInOut' as const }}
    >
      <Badge
        className="rounded-md border border-solid text-xs font-medium text-center justify-center min-h-[26px] px-3 gap-1.5"
        style={{
          background: '#eff6ff',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          color: '#1e3a8a',
          fontFamily: font,
        }}
      >
        <Bookmark size={12} /> Updated
      </Badge>
    </motion.div>
  );
}

/** Info badge with spring tap — squish on press. */
export function BadgeTapSpring() {
  return (
    <motion.div
      whileTap={{
        scale: 0.96,
        transition: { type: 'spring' as const, duration: 0.15, stiffness: 420, damping: 30, mass: 0.75 },
      }}
    >
      <Badge
        className="rounded-md border border-solid text-[11px] font-medium text-center justify-center min-h-[24px] px-2.5 gap-1 cursor-pointer"
        style={{
          background: '#eff6ff',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          color: '#1e3a8a',
          fontFamily: font,
        }}
      >
        <Bookmark size={12} /> Updated
      </Badge>
    </motion.div>
  );
}
