import { motion } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from './theme';

const freeFeatures = [
  '16 free components',
  'Visual inspector panel',
  'Motion FX controls',
  'CSS code export',
  'Light & dark canvas',
  'Style presets',
];

const proFeatures = [
  'All 22 components',
  '6 Pro-only components',
  'Tailwind export',
  'Token-based design systems',
  'Advanced hover effects',
  'Priority support',
  'All future components',
];

export function Pricing() {
  const { t } = useTheme();

  return (
    <section id="pricing" style={{ background: t.bgAlt, padding: '100px 0' }}>
      <div className="mx-auto" style={{ maxWidth: 1120, padding: '0 24px' }}>
        {/* Header */}
        <div className="mb-12 text-center">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: t.proSoft,
              color: t.pro,
              border: `1px solid ${t.proBorder}`,
            }}
          >
            Pricing
          </span>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: t.text }}
          >
            Start free. Upgrade when ready.
          </h2>
          <p
            className="mx-auto mt-3 max-w-lg text-base"
            style={{ color: t.textMuted }}
          >
            No credit card required. Use the free tier as long as you like,
            then unlock Pro when you need more.
          </p>
        </div>

        {/* Cards */}
        <div
          className="mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2"
          style={{ maxWidth: 720 }}
        >
          {/* ── Free tier ── */}
          <motion.div
            className="relative rounded-2xl p-8"
            style={{
              background: t.bgCard,
              border: `1px solid ${t.border}`,
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <p
              className="text-sm font-semibold tracking-wide uppercase"
              style={{ color: t.textMuted }}
            >
              Free
            </p>
            <div className="mt-3 flex items-baseline gap-1">
              <span
                className="font-bold leading-none"
                style={{ fontSize: 42, color: t.text }}
              >
                &pound;0
              </span>
              <span className="text-sm" style={{ color: t.textMuted }}>
                /forever
              </span>
            </div>
            <p className="mt-3 text-sm" style={{ color: t.textMid }}>
              Access to 16 production-ready components, no time limit.
            </p>

            {/* Feature list */}
            <ul className="mt-6 flex flex-col gap-3">
              {freeFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-2.5">
                  <span
                    className="flex shrink-0 items-center justify-center rounded"
                    style={{
                      width: 16,
                      height: 16,
                      background: t.accentSoft,
                    }}
                  >
                    <Check size={9} style={{ color: t.accent }} strokeWidth={3} />
                  </span>
                  <span className="text-sm" style={{ color: t.textMid }}>
                    {feat}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              to="/register"
              className="mt-8 block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors"
              style={{
                border: `1px solid ${t.accent}`,
                color: t.accent,
                background: 'transparent',
              }}
            >
              Get started free
            </Link>
          </motion.div>

          {/* ── Pro tier ── */}
          <motion.div
            className="relative rounded-2xl p-8"
            style={{
              background: t.bgCard,
              border: `2px solid ${t.pro}`,
              boxShadow: `0 0 40px ${t.proSoft}, 0 0 80px ${t.proSoft}`,
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Most popular badge */}
            <span
              className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                top: -12,
                background: t.pro,
                color: '#fff',
              }}
            >
              <Sparkles size={11} />
              Most popular
            </span>

            <p
              className="text-sm font-semibold tracking-wide uppercase"
              style={{ color: t.pro }}
            >
              Pro
            </p>
            <div className="mt-3 flex items-baseline gap-1">
              <span
                className="font-bold leading-none"
                style={{ fontSize: 42, color: t.text }}
              >
                &pound;9
              </span>
              <span className="text-sm" style={{ color: t.textMuted }}>
                /month
              </span>
            </div>
            <p className="mt-3 text-sm" style={{ color: t.textMid }}>
              All 22 components plus Tailwind export and token sets.
            </p>

            {/* Feature list */}
            <ul className="mt-6 flex flex-col gap-3">
              {proFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-2.5">
                  <span
                    className="flex shrink-0 items-center justify-center rounded"
                    style={{
                      width: 16,
                      height: 16,
                      background: t.proSoft,
                    }}
                  >
                    <Check size={9} style={{ color: t.pro }} strokeWidth={3} />
                  </span>
                  <span className="text-sm" style={{ color: t.textMid }}>
                    {feat}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              to="/register"
              className="mt-8 block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors"
              style={{
                background: t.pro,
                color: '#fff',
                border: `1px solid ${t.pro}`,
              }}
            >
              Upgrade to Pro
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
