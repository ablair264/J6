import { useTheme } from './theme';
import { motion } from 'motion/react';
import { Sparkles, MoveRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FinalCTA() {
  const { t } = useTheme();

  return (
    <section style={{ padding: '100px 0' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px' }}>
        <div
          style={{
            textAlign: 'center',
            borderRadius: 24,
            padding: '72px 48px',
            border: `1px solid ${t.border}`,
            position: 'relative',
            overflow: 'hidden',
            background: `radial-gradient(ellipse at bottom center, ${t.accentSoft}, transparent 70%), ${t.bgCard}`,
          }}
        >
          {/* Decorative accent line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '30%',
              right: '30%',
              height: 1,
              background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`,
            }}
          />

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 9999,
              border: `1px solid ${t.accentBorder}`,
              background: t.accentSoft,
              color: t.accent,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            <Sparkles size={14} />
            Free to start · No credit card
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: 'clamp(28px, 5vw, 52px)',
              fontWeight: 800,
              color: t.text,
              margin: '0 0 16px',
              lineHeight: 1.1,
            }}
          >
            Start designing in seconds
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: 17,
              color: t.textMuted,
              maxWidth: 520,
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            16 components, free forever. No signup friction, no install step.
            Just open J6 and start.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 28px',
                borderRadius: 12,
                background: t.accent,
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: `0 0 24px ${t.accentBorder}`,
                transition: 'opacity 0.2s',
              }}
            >
              Launch J6 — it's free
              <MoveRight size={16} />
            </Link>

            <a
              href="#pricing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 28px',
                borderRadius: 12,
                background: 'transparent',
                color: t.textMid,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                border: `1px solid ${t.border}`,
                transition: 'color 0.2s, border-color 0.2s',
              }}
            >
              View pricing
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
