import { useTheme } from './theme';
import { Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const { t } = useTheme();

  const linkStyle: React.CSSProperties = {
    color: t.textMuted,
    textDecoration: 'none',
    fontSize: 14,
    lineHeight: 2.2,
    transition: 'color 0.2s',
  };

  const columnHeadingStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: t.textMid,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 12,
  };

  return (
    <footer
      style={{
        borderTop: `1px solid ${t.border}`,
        background: t.bgAlt,
        padding: '56px 0 32px',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px' }}>
        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 48,
            marginBottom: 48,
          }}
        >
          {/* Column 1 — Brand */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${t.accent}, #ff8a50)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={16} color="#fff" />
              </div>
              <span
                style={{ fontSize: 18, fontWeight: 700, color: t.text }}
              >
                J6
              </span>
            </div>
            <p
              style={{
                fontSize: 14,
                color: t.textMuted,
                lineHeight: 1.7,
                maxWidth: 260,
              }}
            >
              A visual component design studio for React, CSS, and Tailwind.
              Preview, style, and export — all in one place.
            </p>
          </div>

          {/* Column 2 — Product */}
          <div>
            <p style={columnHeadingStyle}>Product</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <a href="#features" style={linkStyle}>
                Features
              </a>
              <a href="#components" style={linkStyle}>
                Components
              </a>
              <a href="#pricing" style={linkStyle}>
                Pricing
              </a>
            </div>
          </div>

          {/* Column 3 — Developers */}
          <div>
            <p style={columnHeadingStyle}>Developers</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <a href="#" style={linkStyle}>
                Docs
              </a>
              <a href="#" style={linkStyle}>
                GitHub
              </a>
              <a href="#" style={linkStyle}>
                shadcn/ui
              </a>
            </div>
          </div>

          {/* Column 4 — Company */}
          <div>
            <p style={columnHeadingStyle}>Company</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <a href="#" style={linkStyle}>
                About
              </a>
              <a href="#" style={linkStyle}>
                Privacy
              </a>
              <a href="#" style={linkStyle}>
                Terms
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: `1px solid ${t.border}`,
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: t.textMuted }}>
            &copy; 2026 J6. All rights reserved.
          </span>
          <span style={{ fontSize: 13, color: t.textMuted }}>
            Built for developers who care about design.
          </span>
        </div>
      </div>
    </footer>
  );
}
