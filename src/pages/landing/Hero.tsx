import { useTheme } from './theme';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronRight, ChevronDown, Star } from 'lucide-react';

export function Hero() {
  const { t } = useTheme();

  return (
    <section
      className="relative flex items-center justify-center"
      style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${t.accentSoft} 0%, transparent 70%), ${t.bg}`,
      }}
    >
      <style>{`
        @keyframes hero-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>

      <div
        className="flex flex-col items-center text-center"
        style={{ maxWidth: 1120, width: '100%', padding: '0 24px' }}
      >
        {/* Badge */}
        <motion.a
          href="#components"
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium no-underline mb-8"
          style={{
            background: t.accentSoft,
            border: `1px solid ${t.accentBorder}`,
            color: t.accent,
          }}
        >
          <Sparkles size={14} />
          22 components &middot; Free + Pro
          <ChevronRight size={14} />
        </motion.a>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          style={{
            fontSize: 'clamp(42px, 7vw, 80px)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-2px',
            color: t.text,
            margin: 0,
          }}
        >
          Design components.
          <br />
          <span
            style={{
              background: `linear-gradient(135deg, ${t.accent}, #ff8c4a)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Ship production code.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-6"
          style={{
            maxWidth: 580,
            fontSize: 'clamp(16px, 1.8vw, 19px)',
            lineHeight: 1.6,
            color: t.textMid,
          }}
        >
          J6 is a visual UI component designer for React. Customise components,
          apply Motion animations, build token-based design systems — then export
          clean CSS or Tailwind code.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-10"
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold no-underline transition-transform hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: t.accent,
              color: '#fff',
              boxShadow: `0 0 24px ${t.accentBorder}, 0 2px 8px rgba(0,0,0,0.15)`,
            }}
          >
            Start designing free
            <ArrowRight size={16} />
          </Link>

          <a
            href="#components"
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold no-underline transition-colors"
            style={{
              background: 'transparent',
              color: t.text,
              border: `1px solid ${t.border}`,
            }}
          >
            Browse components
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.45 }}
          className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-14 text-sm"
          style={{ color: t.textMuted }}
        >
          <span className="flex items-center gap-1.5">
            <span style={{ color: t.text, fontWeight: 600 }}>22</span> UI
            Components
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span className="flex items-center gap-1.5">
            <span style={{ color: t.text, fontWeight: 600 }}>100+</span> Style
            Presets
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>CSS &amp; Tailwind Export</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span className="inline-flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                fill={t.accent}
                stroke={t.accent}
              />
            ))}
            <span className="ml-1">Loved by devs</span>
          </span>
        </motion.div>

        {/* Scroll cue */}
        <motion.a
          href="#components"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col items-center gap-1 no-underline mt-20"
          style={{ color: t.textMuted, fontSize: 13 }}
        >
          See it in action
          <ChevronDown
            size={18}
            style={{ animation: 'hero-bounce 1.6s ease-in-out infinite' }}
          />
        </motion.a>
      </div>
    </section>
  );
}
