import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Sparkles, Download, Send, Star, Shield, Rocket, Heart, Plus } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   BUTTON VARIATIONS — Professional showcase with varying sizes, colors,
   fonts, radii, motion effects, and CSS effects.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 1. Primary Brand — Large hero CTA with spring entry ─────────────── */

/** Large primary CTA — bold amber with scale-up entry and hover lift. */
export function ButtonPrimaryHero() {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Button
        className="rounded-xl text-[15px] font-semibold tracking-[-0.01em] h-[52px] px-8 gap-3 bg-gradient-to-b from-[#f5a623] to-[#e8940c] hover:bg-transparent hover:from-[#ffba4a] hover:to-[#f5a623] border border-[#c4800a]/40 text-[#1a1a1d] shadow-[0_1px_2px_rgba(0,0,0,0.2),_inset_0_1px_0_rgba(255,255,255,0.25)]"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        Get Started <ArrowRight size={18} strokeWidth={2.5} />
      </Button>
    </motion.div>
  );
}

/* ── 2. Outline Ghost — Medium with subtle hover reveal ──────────────── */

/** Ghost outline — minimal with border reveal on hover. */
export function ButtonOutlineHover() {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
    >
      <Button
        variant="outline"
        className="rounded-lg text-sm font-medium h-10 px-5 border-[#ffffff]/10 text-[#e2e8f0] bg-transparent hover:bg-[#ffffff]/[0.04] hover:border-[#ffffff]/20 transition-all duration-200"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        Learn More
      </Button>
    </motion.div>
  );
}

/* ── 3. Gradient Slide — Violet-to-indigo sweep with icon ────────────── */

/** Gradient slide effect — violet sweep on hover with icon. */
export function ButtonGradientSlide() {
  const rootEffectClassName = 'ui-studio-effect-gradient-slide ui-studio-effect-gradient-slide-left ui-studio-effect-gradient-slide-gradient';
  return (
    <Button
      className={[
        rootEffectClassName,
        'rounded-xl text-sm font-semibold h-11 px-6 gap-2',
        'bg-[#7c3aed] hover:bg-[#7c3aed] text-white border border-[#6d28d9]/60',
        'shadow-[0_2px_8px_rgba(124,58,237,0.3)]',
      ].join(' ')}
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        '--ui-motion-gradient-from': '#4f46e5',
        '--ui-motion-gradient-to': '#9f72ff',
        '--ui-effect-gs-speed': '0.35s',
      } as React.CSSProperties}
    >
      <Zap size={16} /> Activate
    </Button>
  );
}

/* ── 4. Border Beam — Dark premium with traveling pink beam ──────────── */

/** Border beam — dark surface with animated pink border light. Large. */
export function ButtonBorderBeam() {
  const rootEffectClassName = 'ui-studio-effect-border-beam';
  return (
    <Button
      className={[
        rootEffectClassName,
        'rounded-xl text-[15px] font-semibold h-[52px] px-8 gap-3',
        'bg-[#0f0f11] hover:bg-[#0f0f11] text-[#f0ede8]',
      ].join(' ')}
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        letterSpacing: '-0.01em',
        '--ui-motion-speed': '2.8s',
        '--ui-motion-fill': '#0f0f11',
        '--ui-effect-beam-speed': '5s',
        '--ui-effect-beam-size': '100px',
        '--ui-effect-beam-width': '1.5px',
        '--ui-effect-beam-from': '#f472b6',
        '--ui-effect-beam-to': '#ec4899',
      } as React.CSSProperties}
    >
      <Sparkles size={18} /> Premium Plan
    </Button>
  );
}

/* ── 5. Animated Border — Multi-color rotating border ────────────────── */

/** Animated border — violet base with rotating multi-color border. Medium. */
export function ButtonAnimatedBorder() {
  const rootEffectClassName = 'ui-studio-effect-animated-border ui-studio-effect-animated-border-state-default ui-studio-effect-animated-border-state-hover ui-studio-effect-animated-border-state-active';
  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
    >
      <Button
        className={[
          rootEffectClassName,
          'rounded-lg text-sm font-semibold h-10 px-5 gap-2',
          'border-2 bg-[#7c3aed] hover:bg-[#7c3aed] text-white',
        ].join(' ')}
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          '--ui-motion-speed': '3s',
          '--ui-motion-fill': '#7c3aed',
          '--ui-effect-fill-base': '#7c3aed',
          '--ui-effect-border-speed': '3s',
          '--ui-effect-border-width': '2px',
          '--ui-effect-border-1': '#8b5cf6',
          '--ui-effect-border-2': '#6d28d9',
          '--ui-effect-border-3': '#a78bfa',
          '--ui-effect-border-4': '#34d399',
          '--ui-effect-border-5': '#f59e0b',
          '--ui-effect-border-count': '3',
        } as React.CSSProperties}
      >
        <Star size={15} /> Upgrade
      </Button>
    </motion.div>
  );
}

/* ── 6. Ripple Fill — Emerald with click ripple ──────────────────────── */

/** Ripple fill — emerald green with click ripple effect. */
export function ButtonRippleFill() {
  const rootEffectClassName = 'ui-studio-effect-ripple-fill';
  return (
    <Button
      className={[
        rootEffectClassName,
        'rounded-lg text-sm font-semibold h-11 px-6 gap-2',
        'bg-[#059669] hover:bg-[#059669] text-white',
        'shadow-[0_1px_3px_rgba(0,0,0,0.2),_inset_0_1px_0_rgba(255,255,255,0.1)]',
      ].join(' ')}
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        '--ui-motion-ripple-color': '#047857',
        '--ui-effect-ripple-speed': '0.5s',
      } as React.CSSProperties}
    >
      <Download size={16} /> Download
    </Button>
  );
}

/* ── 7. Shine Border — Indigo with white light sweep ─────────────────── */

/** Shine border — indigo with traveling white light sweep. Small. */
export function ButtonShineBorder() {
  const rootEffectClassName = 'ui-studio-effect-shine-border';
  return (
    <Button
      className={[
        rootEffectClassName,
        'rounded-lg text-xs font-semibold h-8 px-4 gap-1.5',
        'bg-[#4338ca] hover:bg-[#4338ca] text-white',
      ].join(' ')}
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        '--ui-motion-speed': '2.8s',
        '--ui-motion-fill': '#4338ca',
        '--ui-effect-shine-speed': '3.5s',
        '--ui-effect-shine-color': '#ffffff',
        '--ui-effect-shine-width': '1.5px',
      } as React.CSSProperties}
    >
      <Shield size={13} /> Secure
    </Button>
  );
}

/* ── 8. Pulse Ring — Sky with radiating pulse. CTA attention-grabber ─── */

/** Pulse ring — sky blue with radiating pulse ring. */
export function ButtonPulseRing() {
  const rootEffectClassName = 'ui-studio-effect-pulse-ring';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 18, delay: 0.1 }}
    >
      <Button
        className={[
          rootEffectClassName,
          'rounded-xl text-sm font-semibold h-11 px-6 gap-2',
          'bg-[#0284c7] hover:bg-[#0284c7] text-white',
          'shadow-[0_2px_12px_rgba(2,132,199,0.35)]',
        ].join(' ')}
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          '--ui-motion-speed': '2.8s',
          '--ui-motion-fill': '#0284c7',
          '--ui-effect-pulse-speed': '1.8s',
          '--ui-effect-pulse-width': '2px',
          '--ui-effect-pulse-color': '#38bdf8',
        } as React.CSSProperties}
      >
        <Rocket size={16} /> Launch
      </Button>
    </motion.div>
  );
}

/* ── 9. Glass Morphism — Frosted glass with hover lift ───────────────── */

/** Glass — frosted translucent surface with spring hover. */
export function ButtonGlass() {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 22 }}
    >
      <Button
        className="rounded-xl text-sm font-medium h-11 px-6 gap-2 bg-white/[0.06] hover:bg-white/[0.06] text-[#f0ede8] border border-white/[0.12] shadow-[0_4px_16px_rgba(0,0,0,0.15),_inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <Heart size={15} /> Favourite
      </Button>
    </motion.div>
  );
}

/* ── 10. Dark Minimal — Small compact action ─────────────────────────── */

/** Dark minimal — compact secondary action with tap spring. */
export function ButtonDarkMinimal() {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
    >
      <Button
        variant="ghost"
        className="rounded-md text-xs font-medium h-7 px-3 gap-1.5 text-[#9a9aa3] hover:text-[#f0ede8] hover:bg-white/[0.06] transition-colors"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <Plus size={13} /> Add
      </Button>
    </motion.div>
  );
}

/* ── 11. Destructive — Rose with blur-fade entry ─────────────────────── */

/** Destructive — rose red with blur-fade entry animation. */
export function ButtonDestructive() {
  return (
    <motion.div
      initial={{ filter: 'blur(4px)', opacity: 0 }}
      animate={{ filter: 'blur(0px)', opacity: 1 }}
      transition={{ type: 'tween' as const, duration: 0.5, ease: 'easeOut' as const }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      <Button
        variant="destructive"
        className="rounded-lg text-sm font-semibold h-10 px-5 gap-2 bg-[#e11d48] text-white border border-[#be123c]/40 shadow-[0_1px_3px_rgba(225,29,72,0.3)]"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        Delete Project
      </Button>
    </motion.div>
  );
}

/* ── 12. Border Beam Small — Cyan beam on dark. Compact. ─────────────── */

/** Border beam small — compact dark button with cyan traveling beam. */
export function ButtonBorderBeamCompact() {
  const rootEffectClassName = 'ui-studio-effect-border-beam';
  return (
    <Button
      className={[
        rootEffectClassName,
        'rounded-lg text-xs font-semibold h-8 px-4 gap-1.5',
        'bg-[#0f0f11] hover:bg-[#0f0f11] text-[#e2e8f0]',
      ].join(' ')}
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        '--ui-motion-speed': '2.8s',
        '--ui-motion-fill': '#0f0f11',
        '--ui-effect-beam-speed': '4s',
        '--ui-effect-beam-size': '60px',
        '--ui-effect-beam-width': '1.5px',
        '--ui-effect-beam-from': '#22d3ee',
        '--ui-effect-beam-to': '#06b6d4',
      } as React.CSSProperties}
    >
      <Send size={12} /> Send
    </Button>
  );
}
