import { motion } from 'motion/react';
import { Zap, Heart, Download, Check, ArrowRight, Sparkles, Star } from 'lucide-react';
import { useTheme } from './theme';
import { BentoC } from './BentoLayout';

export function LiveDemo() {
  const { dark, t } = useTheme();

  const cell0 = (
    <motion.div
      className="flex h-full flex-col p-5"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0 }}
    >
      <span
        className="text-xs font-medium"
        style={{ color: t.textMuted }}
      >
        Button
      </span>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {/* Solid primary */}
        <div
          className="flex items-center gap-1.5 rounded-lg px-4 py-2"
          style={{
            background: t.accent,
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          <Zap size={14} />
          Primary
        </div>
        {/* Outline */}
        <div
          className="flex items-center gap-1.5 rounded-lg px-4 py-2"
          style={{
            background: 'transparent',
            color: t.text,
            fontWeight: 600,
            fontSize: 13,
            border: `1.5px solid ${t.border}`,
          }}
        >
          <Heart size={14} />
          Outline
        </div>
        {/* Ghost */}
        <div
          className="flex items-center gap-1.5 rounded-lg px-4 py-2"
          style={{
            background: 'transparent',
            color: t.textMid,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          <Download size={14} />
          Ghost
        </div>
        {/* Gradient */}
        <div
          className="flex items-center gap-1.5 rounded-lg px-4 py-2"
          style={{
            background: 'linear-gradient(135deg, #e8540a, #f59e0b)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          <Star size={14} />
          Gradient
        </div>
      </div>
    </motion.div>
  );

  const cell1 = (
    <motion.div
      className="flex h-full flex-col p-5"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <span
        className="text-xs font-medium"
        style={{ color: t.textMuted }}
      >
        Badge &amp; Switch
      </span>
      {/* Badges */}
      <div className="mt-3 flex gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ background: t.accent, color: '#fff' }}
        >
          New
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ background: t.pro, color: '#fff' }}
        >
          Pro
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{
            background: 'transparent',
            color: t.textMid,
            border: `1.5px solid ${t.border}`,
          }}
        >
          Beta
        </span>
      </div>
      {/* Toggle switch */}
      <div className="mt-4">
        <div
          className="relative rounded-full"
          style={{
            width: 44,
            height: 24,
            background: t.accent,
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 18,
              height: 18,
              top: 3,
              left: 23,
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      </div>
    </motion.div>
  );

  const cell2 = (
    <motion.div
      className="flex h-full flex-col p-5"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Card preview */}
      <div
        className="flex h-full flex-col rounded-xl p-5"
        style={{
          background: t.bgAlt,
          border: `1px solid ${t.border}`,
        }}
      >
        {/* Top row: icon + badge */}
        <div className="flex items-start justify-between">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 40,
              height: 40,
              background: t.accentSoft,
            }}
          >
            <Sparkles size={20} style={{ color: t.accent }} />
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
            style={{
              background: t.accentSoft,
              color: t.accent,
              border: `1px solid ${t.accentBorder}`,
            }}
          >
            Featured
          </span>
        </div>

        {/* Title + subtitle */}
        <h4
          className="mt-4 text-base font-bold"
          style={{ color: t.text }}
        >
          Component Studio
        </h4>
        <p
          className="mt-1 text-sm"
          style={{ color: t.textMuted }}
        >
          Design, customise, and export
        </p>

        {/* Feature tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['Visual Editor', 'Motion FX', 'Code Export'].map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
              style={{
                background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                color: t.textMid,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price area */}
        <div className="mt-auto pt-4">
          <span
            className="text-xl font-bold"
            style={{ color: t.text }}
          >
            Free
          </span>
          <span
            className="ml-1.5 text-sm"
            style={{ color: t.textMuted }}
          >
            to start
          </span>
        </div>

        {/* CTA button */}
        <div
          className="mt-3 flex items-center justify-center gap-2 rounded-lg py-2.5"
          style={{
            background: t.accent,
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Get started
          <ArrowRight size={15} />
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
