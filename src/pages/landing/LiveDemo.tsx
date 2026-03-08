import { motion } from 'motion/react';
import {
  Zap, Heart, Download, Star, ArrowRight, Sparkles,
  Check, Shield, Globe, Cpu, Eye, Layout,
} from 'lucide-react';
import { useTheme } from './theme';
import { BentoC } from './BentoLayout';

export function LiveDemo() {
  const { dark, t } = useTheme();

  // ── Cell 0: Button showcase (left top) ──
  const cell0 = (
    <motion.div
      className="flex h-full flex-col justify-center p-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-3">
        {/* Row 1: primary sizes */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center gap-1.5 rounded-xl px-5 py-2.5"
            style={{
              background: `linear-gradient(135deg, ${t.accent}, #ff7c3a)`,
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              boxShadow: `0 4px 16px ${t.accentBorder}`,
            }}
          >
            <Zap size={14} /> Get started
          </div>
          <div
            className="flex items-center gap-1.5 rounded-xl px-5 py-2.5"
            style={{
              background: 'transparent',
              color: t.text,
              fontWeight: 600,
              fontSize: 14,
              border: `1.5px solid ${t.border}`,
            }}
          >
            <Heart size={14} /> Favorite
          </div>
        </div>
        {/* Row 2: secondary variants */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center gap-1.5 rounded-lg px-4 py-2"
            style={{
              background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              color: t.textMid,
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            <Download size={13} /> Export
          </div>
          <div
            className="flex items-center gap-1.5 rounded-lg px-4 py-2"
            style={{
              background: t.proSoft,
              color: t.pro,
              fontWeight: 600,
              fontSize: 13,
              border: `1px solid ${t.proBorder}`,
            }}
          >
            <Star size={13} /> Pro
          </div>
          <div
            className="rounded-lg px-4 py-2"
            style={{
              color: t.accent,
              fontWeight: 500,
              fontSize: 13,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Learn more
          </div>
        </div>
        {/* Row 3: icon-only + pill */}
        <div className="flex items-center gap-2.5">
          {[Shield, Globe, Cpu, Eye].map((Icon, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 36,
                height: 36,
                background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${t.border}`,
                color: t.textMid,
              }}
            >
              <Icon size={15} />
            </div>
          ))}
          <div
            className="rounded-full px-4 py-2"
            style={{
              background: t.accent,
              color: '#fff',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Pill button
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ── Cell 1: Badges + toggles + tags (left bottom) ──
  const cell1 = (
    <motion.div
      className="flex h-full flex-col justify-center gap-4 p-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Badge row */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: t.accent, color: '#fff' }}
        >
          New
        </span>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: t.pro, color: '#fff' }}
        >
          Pro
        </span>
        <span
          className="rounded-md px-3 py-1 text-xs font-semibold"
          style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: t.textMid }}
        >
          Beta
        </span>
        <span
          className="rounded-full px-3 py-1 text-xs font-medium"
          style={{ border: `1.5px solid ${t.border}`, color: t.textMid }}
        >
          Outline
        </span>
        <span
          className="rounded-full px-3 py-1 text-xs font-medium"
          style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
        >
          <Check size={10} className="inline mr-1" style={{ verticalAlign: '-1px' }} />
          Success
        </span>
      </div>
      {/* Switch row */}
      <div className="flex items-center gap-4">
        {/* Switch on */}
        <div className="flex items-center gap-2.5">
          <div
            className="relative rounded-full"
            style={{ width: 44, height: 24, background: t.accent }}
          >
            <div
              className="absolute rounded-full"
              style={{
                width: 18, height: 18, top: 3, left: 23,
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
              }}
            />
          </div>
          <span className="text-xs font-medium" style={{ color: t.textMid }}>Motion FX</span>
        </div>
        {/* Switch off */}
        <div className="flex items-center gap-2.5">
          <div
            className="relative rounded-full"
            style={{
              width: 44, height: 24,
              background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}
          >
            <div
              className="absolute rounded-full"
              style={{
                width: 18, height: 18, top: 3, left: 3,
                background: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
            />
          </div>
          <span className="text-xs font-medium" style={{ color: t.textMuted }}>Hover FX</span>
        </div>
      </div>
    </motion.div>
  );

  // ── Cell 2: Card preview (right tall) ──
  const cell2 = (
    <motion.div
      className="flex h-full flex-col p-4"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <div
        className="flex h-full flex-col rounded-2xl overflow-hidden"
        style={{
          background: t.bgAlt,
          border: `1px solid ${t.border}`,
        }}
      >
        {/* Card image header */}
        <div
          style={{
            height: '40%',
            minHeight: 120,
            background: `linear-gradient(135deg, ${t.accent}22, ${t.pro}22), ${dark ? '#1a1a17' : '#f0f0ec'}`,
            position: 'relative',
          }}
        >
          {/* Decorative grid pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `radial-gradient(${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          />
          {/* Floating badge */}
          <div
            className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1"
            style={{
              background: dark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              fontSize: 11,
              fontWeight: 600,
              color: t.accent,
              border: `1px solid ${t.accentBorder}`,
            }}
          >
            <Sparkles size={10} /> Featured
          </div>
          {/* Floating icon */}
          <div
            className="absolute -bottom-5 left-5 flex items-center justify-center rounded-xl"
            style={{
              width: 44,
              height: 44,
              background: `linear-gradient(135deg, ${t.accent}, #ff7c3a)`,
              boxShadow: `0 4px 12px ${t.accentBorder}`,
              border: `2px solid ${t.bgAlt}`,
            }}
          >
            <Layout size={20} color="#fff" />
          </div>
        </div>

        {/* Card body */}
        <div className="flex flex-1 flex-col px-5 pt-8 pb-5">
          <h4
            className="text-lg font-bold"
            style={{ color: t.text }}
          >
            Component Studio
          </h4>
          <p
            className="mt-1 text-sm"
            style={{ color: t.textMuted, lineHeight: 1.5 }}
          >
            Design, customise, and export production-ready React components
          </p>

          {/* Feature tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['Visual Editor', 'Motion FX', 'Code Export'].map((tag) => (
              <span
                key={tag}
                className="rounded-md px-2.5 py-1 text-[11px] font-medium"
                style={{
                  background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  color: t.textMid,
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price + CTA */}
          <div className="mt-4 flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold" style={{ color: t.text }}>Free</span>
              <span className="ml-1 text-sm" style={{ color: t.textMuted }}>to start</span>
            </div>
            <div
              className="flex items-center gap-1.5 rounded-lg px-4 py-2"
              style={{
                background: t.accent,
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                boxShadow: `0 2px 8px ${t.accentBorder}`,
              }}
            >
              Get started <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <section
      id="components"
      style={{ padding: '100px 0', background: t.bgAlt }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: 1120, padding: '0 24px' }}
      >
        {/* Section header */}
        <div className="mb-12 text-center">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: t.proSoft,
              color: t.pro,
              border: `1px solid ${t.proBorder}`,
            }}
          >
            Component library
          </span>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: t.text }}
          >
            Real components. Real output.
          </h2>
          <p
            className="mx-auto mt-3 max-w-lg text-base"
            style={{ color: t.textMuted }}
          >
            See exactly what you'll build — styled buttons, badges, cards, and
            more, ready to drop into your codebase.
          </p>
        </div>

        {/* Bento grid */}
        <BentoC>
          {[cell0, cell1, cell2]}
        </BentoC>
      </div>
    </section>
  );
}
