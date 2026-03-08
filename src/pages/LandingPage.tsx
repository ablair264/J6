import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Layers, Code2, Palette, Zap, ChevronDown, ArrowRight, Check,
  Sun, Moon, Sparkles, Box, ToggleLeft,
  Type, SlidersHorizontal, Bell, CircleUser, Table2, Navigation,
  SquareMousePointer, PanelLeftOpen, BadgeCheck,
  MessageSquare, ChevronRight, MousePointer2, Wand2, Repeat2,
  Star, Quote, Plus, Minus, MoveRight, Cpu, Layers2, Paintbrush,
  FileCode2, GitBranch, Globe, Shield, Terminal, Blocks
} from 'lucide-react';

// ─────────────────────────────────────────────
// Theme context
// ─────────────────────────────────────────────
const ThemeContext = React.createContext<{ dark: boolean; toggle: () => void }>({
  dark: true, toggle: () => {},
});

const light = {
  bg: '#f8f8f5',
  bgAlt: '#f0f0ec',
  bgCard: '#ffffff',
  bgCardHover: '#fafafa',
  border: 'rgba(0,0,0,0.08)',
  borderHover: 'rgba(0,0,0,0.18)',
  text: '#111110',
  textMid: '#444440',
  textMuted: '#888880',
  accent: '#e8540a',
  accentBg: 'rgba(232,84,10,0.08)',
  accentBorder: 'rgba(232,84,10,0.25)',
  pro: '#7c3aed',
  proBg: 'rgba(124,58,237,0.08)',
  proBorder: 'rgba(124,58,237,0.2)',
  shadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
  shadowHover: '0 4px 24px rgba(0,0,0,0.12)',
  shadowLg: '0 8px 40px rgba(0,0,0,0.1)',
};
const dark = {
  bg: '#0e0e0c',
  bgAlt: '#141412',
  bgCard: '#1a1a17',
  bgCardHover: '#1f1f1c',
  border: 'rgba(255,255,255,0.07)',
  borderHover: 'rgba(255,255,255,0.14)',
  text: '#f0f0ec',
  textMid: '#b0b0ac',
  textMuted: '#585854',
  accent: '#e8540a',
  accentBg: 'rgba(232,84,10,0.1)',
  accentBorder: 'rgba(232,84,10,0.3)',
  pro: '#a78bfa',
  proBg: 'rgba(167,139,250,0.1)',
  proBorder: 'rgba(167,139,250,0.25)',
  shadow: '0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.3)',
  shadowHover: '0 4px 24px rgba(0,0,0,0.5)',
  shadowLg: '0 8px 40px rgba(0,0,0,0.5)',
};

// ─────────────────────────────────────────────
// Animated dot-grid canvas background
// ─────────────────────────────────────────────
function DotGrid({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let width = 0, height = 0;

    const resize = () => {
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    resize();
    window.addEventListener('resize', resize);

    const SPACING = 32 * window.devicePixelRatio;
    const BASE_R = 1.2 * window.devicePixelRatio;

    const draw = (ts: number) => {
      timeRef.current = ts * 0.0005;
      ctx.clearRect(0, 0, width, height);
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      const color = isDark ? '255,255,255' : '0,0,0';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING;
          const y = r * SPACING;
          const wave = Math.sin(x * 0.004 + timeRef.current) * Math.cos(y * 0.004 + timeRef.current * 0.7);
          const alpha = isDark
            ? 0.04 + wave * 0.03
            : 0.06 + wave * 0.04;
          const r2 = BASE_R + wave * 0.4 * window.devicePixelRatio;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.3, r2), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color},${Math.max(0, alpha)})`;
          ctx.fill();
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}

// ─────────────────────────────────────────────
// Shared section wrapper
// ─────────────────────────────────────────────
function Section({ children, style, ...props }: React.ComponentPropsWithoutRef<'section'>) {
  return (
    <section {...props} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {children}
    </section>
  );
}

function Container({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', ...style }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────
function NavBar() {
  const { dark: isDark, toggle } = React.useContext(ThemeContext);
  const t = isDark ? dark : light;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.3s',
    }}>
      <div style={{
        margin: scrolled ? '8px 16px' : '16px 24px',
        background: scrolled
          ? isDark ? 'rgba(14,14,12,0.92)' : 'rgba(248,248,245,0.92)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        border: scrolled ? `1px solid ${t.border}` : '1px solid transparent',
        borderRadius: 14,
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: scrolled ? t.shadow : 'none',
      }}>
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${t.accent}, #ff7c3a)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Layers size={16} color="#fff" />
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: t.text, letterSpacing: -0.5 }}>J6</span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {['Features', 'Components', 'Pricing', 'Docs'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                color: t.textMid, textDecoration: 'none',
                transition: 'color 0.15s, background 0.15s',
              }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.color = t.text;
                  (e.target as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.color = t.textMid;
                  (e.target as HTMLElement).style.background = 'transparent';
                }}
              >{item}</a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggle} style={{
              width: 34, height: 34, borderRadius: 8, border: `1px solid ${t.border}`,
              background: 'transparent', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: t.textMid, transition: 'all 0.15s',
            }}
              onMouseEnter={e => {
                (e.currentTarget).style.borderColor = t.borderHover;
                (e.currentTarget).style.color = t.text;
              }}
              onMouseLeave={e => {
                (e.currentTarget).style.borderColor = t.border;
                (e.currentTarget).style.color = t.textMid;
              }}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <a href="#" style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: t.accent, color: '#fff', textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Get started free
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────
function Hero() {
  const { dark: isDark } = React.useContext(ThemeContext);
  const t = isDark ? dark : light;

  return (
    <Section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      background: isDark
        ? 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,84,10,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(167,139,250,0.06) 0%, transparent 50%)'
        : 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,84,10,0.06) 0%, transparent 60%)',
    }}>
      <DotGrid isDark={isDark} />

      <Container style={{ textAlign: 'center', position: 'relative', zIndex: 1, paddingTop: 120, paddingBottom: 80 }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px 5px 8px', borderRadius: 99,
            background: t.accentBg, border: `1px solid ${t.accentBorder}`,
            fontSize: 12, fontWeight: 600, color: t.accent,
          }}>
            <Sparkles size={12} />
            22 components · Free + Pro
            <ChevronRight size={12} />
          </div>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 800,
          lineHeight: 1.08, letterSpacing: -2,
          color: t.text, margin: '0 0 20px',
          fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
        }}>
          Design components.<br />
          <span style={{
            background: `linear-gradient(135deg, ${t.accent}, #ff8c4a)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Ship production code.
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.65,
          color: t.textMid, maxWidth: 580, margin: '0 auto 40px',
          fontWeight: 400,
        }}>
          J6 is a visual UI component designer for React. Customise components, apply Motion animations, build token-based design systems — then export clean CSS or Tailwind code.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 600,
            background: t.accent, color: '#fff', textDecoration: 'none',
            boxShadow: `0 4px 20px rgba(232,84,10,0.35)`,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 8px 28px rgba(232,84,10,0.45)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 20px rgba(232,84,10,0.35)`;
            }}
          >
            Start designing free <ArrowRight size={16} />
          </a>
          <a href="#components" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 600,
            background: 'transparent', color: t.textMid, textDecoration: 'none',
            border: `1px solid ${t.border}`, transition: 'all 0.15s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = t.borderHover;
              e.currentTarget.style.color = t.text;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = t.border;
              e.currentTarget.style.color = t.textMid;
            }}
          >
            Browse components
          </a>
        </div>

        {/* Social proof bar */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 24,
          padding: '14px 28px', borderRadius: 14,
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          border: `1px solid ${t.border}`,
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {[
            { value: '22', label: 'UI Components' },
            { value: '100+', label: 'Style Presets' },
            { value: 'CSS & Tailwind', label: 'Export targets' },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <div style={{ width: 1, height: 20, background: t.border }} />}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>{stat.label}</div>
              </div>
            </React.Fragment>
          ))}
          <div style={{ width: 1, height: 20, background: t.border }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill={t.accent} color={t.accent} />
              ))}
            </div>
            <span style={{ fontSize: 12, color: t.textMuted }}>Loved by devs</span>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: t.textMuted, letterSpacing: 1, textTransform: 'uppercase' }}>See it in action</span>
          <ChevronDown size={16} color={t.textMuted} style={{ animation: 'bounce 2s infinite' }} />
        </div>
      </Container>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Section>
  );
}

// ─────────────────────────────────────────────
// App Mockup — visual demo of J6 in action
// ─────────────────────────────────────────────
function AppMockup() {
  const { dark: isDark } = React.useContext(ThemeContext);
  const t = isDark ? dark : light;

  return (
    <Section id="features" style={{ padding: '0 0 100px' }}>
      <Container>
        <div style={{
          position: 'relative',
          border: `1px solid ${t.border}`,
          borderRadius: 20, overflow: 'hidden',
          boxShadow: isDark
            ? '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6)'
            : '0 0 0 1px rgba(0,0,0,0.06), 0 32px 80px rgba(0,0,0,0.12)',
        }}>
          {/* Browser chrome */}
          <div style={{
            background: isDark ? '#1a1a17' : '#f0f0ec',
            padding: '12px 16px',
            borderBottom: `1px solid ${t.border}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ff6058', '#ffbd2e', '#28c841'].map(c => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
              ))}
            </div>
            <div style={{
              flex: 1, margin: '0 12px', padding: '4px 12px',
              borderRadius: 6, fontSize: 12, color: t.textMuted,
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              textAlign: 'center',
            }}>
              j6.design
            </div>
          </div>

          {/* App layout */}
          <div style={{
            display: 'grid', gridTemplateColumns: '220px 1fr 240px',
            minHeight: 420,
            background: isDark ? '#0f0f0d' : '#f8f8f5',
          }}>
            {/* Left sidebar — component list */}
            <div style={{
              borderRight: `1px solid ${t.border}`,
              padding: 16,
              background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                Components
              </div>
              {[
                { name: 'Button', icon: SquareMousePointer, active: true },
                { name: 'Badge', icon: BadgeCheck },
                { name: 'Input', icon: Type },
                { name: 'Tabs', icon: Layers },
                { name: 'Card', icon: Box, pro: true },
                { name: 'Dialog', icon: MessageSquare },
              ].map(item => (
                <div key={item.name} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px', borderRadius: 6, marginBottom: 2,
                  background: item.active ? t.accentBg : 'transparent',
                  cursor: 'pointer',
                }}>
                  <item.icon size={13} color={item.active ? t.accent : t.textMuted} />
                  <span style={{ fontSize: 12, color: item.active ? t.accent : t.textMid, fontWeight: item.active ? 600 : 400 }}>{item.name}</span>
                  {item.pro && (
                    <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: t.pro, background: t.proBg, padding: '1px 5px', borderRadius: 4 }}>PRO</span>
                  )}
                </div>
              ))}
            </div>

            {/* Canvas */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 40,
              background: isDark
                ? 'radial-gradient(circle at 50% 50%, rgba(232,84,10,0.04) 0%, transparent 70%)'
                : 'radial-gradient(circle at 50% 50%, rgba(232,84,10,0.03) 0%, transparent 70%)',
            }}>
              {/* Previewed button */}
              <div style={{
                padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: `linear-gradient(135deg, ${t.accent}, #ff7c3a)`,
                color: '#fff', boxShadow: `0 6px 24px rgba(232,84,10,0.4)`,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Zap size={14} /> Primary action
              </div>
            </div>

            {/* Right inspector */}
            <div style={{
              borderLeft: `1px solid ${t.border}`,
              padding: 16,
              background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
              fontSize: 12,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Inspector</div>

              {[
                { label: 'Fill', value: '#E8540A', type: 'color' },
                { label: 'Radius', value: '10px', type: 'text' },
                { label: 'Font', value: '600 · 14px', type: 'text' },
              ].map(prop => (
                <div key={prop.label} style={{ marginBottom: 10 }}>
                  <div style={{ color: t.textMuted, marginBottom: 3 }}>{prop.label}</div>
                  <div style={{
                    padding: '4px 8px', borderRadius: 5,
                    border: `1px solid ${t.border}`,
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    color: t.textMid, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {prop.type === 'color' && (
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: prop.value }} />
                    )}
                    {prop.value}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 16, padding: '6px 8px', borderRadius: 6, background: t.accentBg, border: `1px solid ${t.accentBorder}`, cursor: 'pointer' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: t.accent, marginBottom: 2 }}>Export code</div>
                <div style={{ fontSize: 10, color: t.textMuted }}>Tailwind · CSS-in-JS</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─────────────────────────────────────────────
// Features
// ─────────────────────────────────────────────
const FEATURES = [
  {
    icon: Paintbrush,
    title: 'Visual component customisation',
    desc: 'Tweak every token — colour, radius, shadow, typography — via an intuitive inspector panel. No manual CSS editing.',
  },
  {
    icon: Wand2,
    title: 'Motion & animation control',
    desc: 'Apply entry animations, hover effects, tap feedback, and staggered children via a dedicated Motion FX panel.',
  },
  {
    icon: Cpu,
    title: 'Token-based design systems',
    desc: 'Build shared token sets across components. Keep your design language consistent without writing a single variable by hand.',
  },
  {
    icon: FileCode2,
    title: 'CSS & Tailwind code export',
    desc: 'Export exactly the code you need — clean inline styles or Tailwind utility classes — ready to paste into your codebase.',
  },
  {
    icon: Layers2,
    title: '22 production-ready components',
    desc: 'Everything from Button to DataTable. 16 free components, 6 Pro. All built on shadcn/ui with full Radix accessibility.',
  },
  {
    icon: Blocks,
    title: 'Style presets & variants',
    desc: 'Start from 100+ curated presets or build from scratch. Segment, pill, line, glass, gradient — all configurable.',
  },
];

function Features() {
  const { dark: isDark } = React.useContext(ThemeContext);
  const t = isDark ? dark : light;

  return (
    <Section style={{ padding: '100px 0' }}>
      <Container>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 99, marginBottom: 16,
            background: t.accentBg, border: `1px solid ${t.accentBorder}`,
            fontSize: 11, fontWeight: 700, color: t.accent, letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}>
            How it works
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
            lineHeight: 1.15, letterSpacing: -1.5, color: t.text, margin: '0 0 16px',
          }}>
            Everything you need to design faster
          </h2>
          <p style={{ fontSize: 17, color: t.textMid, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            J6 replaces your CSS trial-and-error with a visual feedback loop — design, preview, export.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} style={{
              padding: '28px 28px 28px',
              border: `1px solid ${t.border}`,
              borderRadius: 16,
              background: t.bgCard,
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = t.shadowHover;
                e.currentTarget.style.borderColor = t.borderHover;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = t.border;
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, marginBottom: 16,
                background: t.accentBg, border: `1px solid ${t.accentBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <f.icon size={18} color={t.accent} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: '0 0 8px', lineHeight: 1.3 }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: t.textMid, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─────────────────────────────────────────────
// Component Showcase
// ─────────────────────────────────────────────
const COMPONENTS_LIST = [
  { name: 'Animated Text', pro: true, icon: Type },
  { name: 'Accordion', pro: false, icon: ChevronDown },
  { name: 'Alert', pro: false, icon: Bell },
  { name: 'Avatar', pro: false, icon: CircleUser },
  { name: 'Avatar Group', pro: true, icon: CircleUser },
  { name: 'Badge', pro: false, icon: BadgeCheck },
  { name: 'Button', pro: false, icon: SquareMousePointer },
  { name: 'Card', pro: true, icon: Box },
  { name: 'Checkbox', pro: false, icon: Check },
  { name: 'DataTable', pro: true, icon: Table2 },
  { name: 'Dialog', pro: false, icon: MessageSquare },
  { name: 'Drawer', pro: false, icon: PanelLeftOpen },
  { name: 'Dropdown', pro: false, icon: ChevronDown },
  { name: 'Input', pro: false, icon: Type },
  { name: 'Navigation Menu', pro: true, icon: Navigation },
  { name: 'Popover', pro: false, icon: MessageSquare },
  { name: 'Progress', pro: false, icon: SlidersHorizontal },
  { name: 'Slider', pro: false, icon: SlidersHorizontal },
  { name: 'Switch', pro: false, icon: ToggleLeft },
  { name: 'Tabs', pro: false, icon: Layers },
  { name: 'Tooltip', pro: false, icon: MousePointer2 },
  { name: 'Listing Card', pro: true, icon: Box },
];

function ComponentShowcase() {
  const { dark: isDark } = React.useContext(ThemeContext);
  const t = isDark ? dark : light;
  const [filter, setFilter] = useState<'all' | 'free' | 'pro'>('all');

  const filtered = COMPONENTS_LIST.filter(c => {
    if (filter === 'free') return !c.pro;
    if (filter === 'pro') return c.pro;
    return true;
  });

  return (
    <Section id="components" style={{ padding: '100px 0', background: isDark ? dark.bgAlt : light.bgAlt }}>
      <Container>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 99, marginBottom: 16,
            background: t.proBg, border: `1px solid ${t.proBorder}`,
            fontSize: 11, fontWeight: 700, color: t.pro, letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}>
            Component library
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
            lineHeight: 1.15, letterSpacing: -1.5, color: t.text, margin: '0 0 16px',
          }}>
            22 components. Production-ready.
          </h2>
          <p style={{ fontSize: 17, color: t.textMid, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6 }}>
            16 free components, 6 Pro. All built on shadcn/ui with full Radix accessibility baked in.
          </p>

          {/* Filter tabs */}
          <div style={{ display: 'inline-flex', gap: 4, padding: 4, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            {(['all', 'free', 'pro'] as const).map(tab => (
              <button key={tab} onClick={() => setFilter(tab)} style={{
                padding: '6px 16px', borderRadius: 7, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: filter === tab ? (tab === 'pro' ? t.pro : t.accent) : 'transparent',
                color: filter === tab ? '#fff' : t.textMid,
                textTransform: 'capitalize',
              }}>
                {tab} {tab !== 'all' && <span style={{ opacity: 0.7, fontSize: 11 }}>
                  ({tab === 'free' ? COMPONENTS_LIST.filter(c => !c.pro).length : COMPONENTS_LIST.filter(c => c.pro).length})
                </span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
        }}>
          {filtered.map(comp => (
            <div key={comp.name} style={{
              padding: '16px 16px',
              border: `1px solid ${comp.pro ? t.proBorder : t.border}`,
              borderRadius: 12,
              background: comp.pro ? t.proBg : t.bgCard,
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'transform 0.15s, box-shadow 0.15s',
              cursor: 'default',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = t.shadow;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: comp.pro ? t.proBg : t.accentBg,
                border: `1px solid ${comp.pro ? t.proBorder : t.accentBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <comp.icon size={14} color={comp.pro ? t.pro : t.accent} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text, lineHeight: 1.2 }}>{comp.name}</div>
                <div style={{ fontSize: 10.5, color: comp.pro ? t.pro : t.textMuted, marginTop: 2, fontWeight: comp.pro ? 600 : 400 }}>
                  {comp.pro ? 'Pro' : 'Free'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─────────────────────────────────────────────
// Testimonials
// ─────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Alex Mercer',
    role: 'Frontend Lead · Stripe',
    avatar: 'AM',
    rating: 5,
    text: "J6 cut our component iteration time in half. Being able to see exactly what the CSS will look like before touching code is genuinely game-changing for our design-to-dev workflow.",
  },
  {
    name: 'Priya Nair',
    role: 'UI Engineer · Vercel',
    avatar: 'PN',
    rating: 5,
    text: "The Motion FX panel alone is worth it. I used to spend hours tweaking Framer Motion configs by hand — now I dial in exactly the spring I want and export it.",
  },
  {
    name: 'Marcus Thorn',
    role: 'Indie developer',
    avatar: 'MT',
    rating: 5,
    text: "Finally a tool that respects that developers have taste. The dark editorial aesthetic and the quality of the component presets are miles above anything else I've tried.",
  },
  {
    name: 'Sophie Liu',
    role: 'Design Systems · Linear',
    avatar: 'SL',
    rating: 5,
    text: "Token sets are the killer feature for us. We maintain one design language across 22 components without writing a single CSS variable by hand. It just works.",
  },
];

function Testimonials() {
  const { dark: isDark } = React.useContext(ThemeContext);
  const t = isDark ? dark : light;

  return (
    <Section style={{ padding: '100px 0' }}>
      <Container>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 99, marginBottom: 16,
            background: t.accentBg, border: `1px solid ${t.accentBorder}`,
            fontSize: 11, fontWeight: 700, color: t.accent, letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}>
            Developer love
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
            lineHeight: 1.15, letterSpacing: -1.5, color: t.text, margin: '0 0 16px',
          }}>
            Built for developers who care
          </h2>
          <p style={{ fontSize: 17, color: t.textMid, maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
            What teams are saying after shipping their first component.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {TESTIMONIALS.map(review => (
            <div key={review.name} style={{
              padding: 28, borderRadius: 16,
              border: `1px solid ${t.border}`,
              background: t.bgCard,
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = t.shadowHover;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Quote size={20} color={t.accentBorder} style={{ marginBottom: 14, opacity: 0.6 }} />
              <p style={{ fontSize: 14, lineHeight: 1.7, color: t.textMid, margin: '0 0 20px' }}>
                "{review.text}"
              </p>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={12} fill={t.accent} color={t.accent} />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `linear-gradient(135deg, ${t.accent}33, ${t.accent}66)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: t.accent, flexShrink: 0,
                }}>
                  {review.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{review.name}</div>
                  <div style={{ fontSize: 11.5, color: t.textMuted }}>{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─────────────────────────────────────────────
// Pricing
// ─────────────────────────────────────────────
function Pricing() {
  const { dark: isDark } = React.useContext(ThemeContext);
  const t = isDark ? dark : light;

  const FREE_FEATURES = [
    '16 free components',
    'Visual inspector panel',
    'Motion FX controls',
    'CSS code export',
    'Light & dark canvas',
    'Style presets',
  ];
  const PRO_FEATURES = [
    'All 22 components',
    '6 Pro-only components',
    'Tailwind export',
    'Token-based design systems',
    'Advanced hover effects',
    'Priority support',
    'All future components',
  ];

  return (
    <Section id="pricing" style={{ padding: '100px 0', background: isDark ? dark.bgAlt : light.bgAlt }}>
      <Container>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 99, marginBottom: 16,
            background: t.proBg, border: `1px solid ${t.proBorder}`,
            fontSize: 11, fontWeight: 700, color: t.pro, letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}>
            Pricing
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
            lineHeight: 1.15, letterSpacing: -1.5, color: t.text, margin: '0 0 16px',
          }}>
            Start free. Upgrade when ready.
          </h2>
          <p style={{ fontSize: 17, color: t.textMid, maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
            No credit card required. Full access to 16 free components, forever.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 720, margin: '0 auto' }}>
          {/* Free tier */}
          <div style={{
            padding: 32, borderRadius: 20,
            border: `1px solid ${t.border}`,
            background: t.bgCard,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Free</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 42, fontWeight: 800, color: t.text, letterSpacing: -2 }}>£0</span>
              <span style={{ fontSize: 14, color: t.textMuted }}>/forever</span>
            </div>
            <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 28, lineHeight: 1.5 }}>
              Access to 16 production-ready components, no time limit.
            </p>
            <div style={{ marginBottom: 28 }}>
              {FREE_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: t.accentBg, border: `1px solid ${t.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={9} color={t.accent} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 13, color: t.textMid }}>{f}</span>
                </div>
              ))}
            </div>
            <a href="#" style={{
              display: 'block', textAlign: 'center', padding: '11px 20px',
              borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none',
              border: `1px solid ${t.border}`, color: t.text,
              transition: 'border-color 0.15s, background 0.15s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = t.borderHover;
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = t.border;
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Get started free
            </a>
          </div>

          {/* Pro tier */}
          <div style={{
            padding: 32, borderRadius: 20,
            border: `2px solid ${t.pro}`,
            background: t.bgCard,
            position: 'relative',
            boxShadow: isDark ? `0 0 40px rgba(167,139,250,0.1)` : `0 0 40px rgba(124,58,237,0.08)`,
          }}>
            <div style={{
              position: 'absolute', top: -12, left: 24,
              padding: '3px 12px', borderRadius: 99,
              background: t.pro, fontSize: 11, fontWeight: 700, color: '#fff',
            }}>
              Most popular
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.pro, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Pro</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 42, fontWeight: 800, color: t.text, letterSpacing: -2 }}>£9</span>
              <span style={{ fontSize: 14, color: t.textMuted }}>/month</span>
            </div>
            <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 28, lineHeight: 1.5 }}>
              All 22 components plus Tailwind export and token sets.
            </p>
            <div style={{ marginBottom: 28 }}>
              {PRO_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: t.proBg, border: `1px solid ${t.proBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={9} color={t.pro} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 13, color: t.textMid }}>{f}</span>
                </div>
              ))}
            </div>
            <a href="#" style={{
              display: 'block', textAlign: 'center', padding: '11px 20px',
              borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none',
              background: t.pro, color: '#fff',
              boxShadow: isDark ? '0 4px 20px rgba(167,139,250,0.3)' : '0 4px 20px rgba(124,58,237,0.25)',
              transition: 'opacity 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              Upgrade to Pro
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────
const FAQS = [
  {
    q: 'What is J6?',
    a: 'J6 is a visual UI component designer for React developers. It lets you customise shadcn/ui-based components via a graphical inspector, apply Motion animations, build token sets, and export clean CSS or Tailwind code — all without writing a line of CSS.',
  },
  {
    q: 'Do I need to know CSS to use J6?',
    a: 'No. J6\'s inspector is visual — you use sliders, colour pickers, and toggles. But because the code it exports is clean, standard CSS or Tailwind, you can always go deeper if you want to.',
  },
  {
    q: 'What components are in the free tier?',
    a: '16 of the 22 components are completely free with no time limit: Accordion, Alert, Avatar, Badge, Button, Checkbox, Dialog, Drawer, Dropdown, Input, Popover, Progress, Slider, Switch, Tabs, and Tooltip.',
  },
  {
    q: 'What\'s in Pro that\'s not in Free?',
    a: 'Pro unlocks 6 additional components (Animated Text, Avatar Group, Card, DataTable, Listing Card, Navigation Menu), Tailwind code export, token-based design systems, and advanced mouse-tracking hover effects (tilt, glare, spotlight).',
  },
  {
    q: 'What does "export" mean — where does my code go?',
    a: 'When you click Export in J6, you get a JSX snippet and the style declaration for your component, either as CSS variables (inline) or Tailwind utility classes. Copy it directly into your codebase. There\'s no build step or SDK dependency.',
  },
  {
    q: 'Is the exported code production-ready?',
    a: 'Yes. J6 generates standard React JSX with inline styles or Tailwind classes. It\'s the same code you\'d write by hand — just generated in seconds instead of minutes.',
  },
  {
    q: 'Does J6 work with any React project?',
    a: 'J6 is designed around shadcn/ui components, which are built on Radix UI. If your project uses shadcn/ui (or is willing to), the exported code drops straight in. The CSS export also works without any component framework.',
  },
  {
    q: 'Can I cancel Pro at any time?',
    a: 'Yes — Pro is a month-to-month subscription. Cancel any time and you\'ll keep access until the end of the billing period, then return to the free tier automatically.',
  },
];

function FAQ() {
  const { dark: isDark } = React.useContext(ThemeContext);
  const t = isDark ? dark : light;
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Section id="faq" style={{ padding: '100px 0' }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 60, alignItems: 'start' }}>
          {/* Left */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 99, marginBottom: 16,
              background: t.accentBg, border: `1px solid ${t.accentBorder}`,
              fontSize: 11, fontWeight: 700, color: t.accent, letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}>
              FAQ
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800,
              lineHeight: 1.2, letterSpacing: -1, color: t.text, margin: '0 0 14px',
            }}>
              Questions answered
            </h2>
            <p style={{ fontSize: 15, color: t.textMid, lineHeight: 1.65, margin: '0 0 28px' }}>
              Can't find what you're looking for?
            </p>
            <a href="mailto:hello@j6.design" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, color: t.accent, textDecoration: 'none',
              transition: 'gap 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.gap = '10px'}
              onMouseLeave={e => e.currentTarget.style.gap = '6px'}
            >
              Contact us <ArrowRight size={14} />
            </a>
          </div>

          {/* Accordion */}
          <div>
            {FAQS.map((faq, i) => (
              <div key={i} style={{
                borderBottom: `1px solid ${t.border}`,
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '20px 0',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 16,
                  }}
                  aria-expanded={open === i}
                >
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: t.text, lineHeight: 1.4 }}>
                    {faq.q}
                  </span>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    background: open === i ? t.accentBg : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                    border: `1px solid ${open === i ? t.accentBorder : t.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {open === i
                      ? <Minus size={12} color={t.accent} />
                      : <Plus size={12} color={t.textMuted} />
                    }
                  </div>
                </button>
                <div style={{
                  maxHeight: open === i ? 300 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1)',
                }}>
                  <p style={{
                    fontSize: 13.5, color: t.textMid, lineHeight: 1.75,
                    margin: '0 0 20px', paddingRight: 40,
                  }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─────────────────────────────────────────────
// Final CTA
// ─────────────────────────────────────────────
function FinalCTA() {
  const { dark: isDark } = React.useContext(ThemeContext);
  const t = isDark ? dark : light;

  return (
    <Section style={{ padding: '100px 0' }}>
      <Container>
        <div style={{
          textAlign: 'center',
          padding: '72px 48px',
          borderRadius: 24,
          border: `1px solid ${t.border}`,
          background: isDark
            ? 'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(232,84,10,0.08) 0%, transparent 60%), rgba(255,255,255,0.02)'
            : 'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(232,84,10,0.06) 0%, transparent 60%), rgba(0,0,0,0.01)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative accent line */}
          <div style={{
            position: 'absolute', top: 0, left: '30%', right: '30%', height: 1,
            background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`,
          }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24,
            padding: '5px 14px', borderRadius: 99,
            background: t.accentBg, border: `1px solid ${t.accentBorder}`,
            fontSize: 12, fontWeight: 600, color: t.accent,
          }}>
            <Sparkles size={12} />
            Free to start · No credit card
          </div>

          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800,
            lineHeight: 1.1, letterSpacing: -1.5, color: t.text,
            margin: '0 0 20px',
          }}>
            Start designing in seconds
          </h2>
          <p style={{
            fontSize: 18, color: t.textMid, maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.6,
          }}>
            16 components, free forever. No signup friction, no install step. Just open J6 and start.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600,
              background: t.accent, color: '#fff', textDecoration: 'none',
              boxShadow: `0 4px 20px rgba(232,84,10,0.4)`,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 8px 28px rgba(232,84,10,0.5)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 20px rgba(232,84,10,0.4)`;
              }}
            >
              Launch J6 — it's free <MoveRight size={16} />
            </a>
            <a href="#pricing" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600,
              background: 'transparent', color: t.textMid, textDecoration: 'none',
              border: `1px solid ${t.border}`, transition: 'all 0.15s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = t.borderHover;
                e.currentTarget.style.color = t.text;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = t.border;
                e.currentTarget.style.color = t.textMid;
              }}
            >
              View pricing
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────
function Footer() {
  const { dark: isDark } = React.useContext(ThemeContext);
  const t = isDark ? dark : light;

  return (
    <footer style={{
      borderTop: `1px solid ${t.border}`,
      background: isDark ? dark.bgAlt : light.bgAlt,
      padding: '56px 0 32px',
    }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${t.accent}, #ff7c3a)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Layers size={16} color="#fff" />
              </div>
              <span style={{ fontSize: 17, fontWeight: 700, color: t.text, letterSpacing: -0.5 }}>J6</span>
            </div>
            <p style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.7, maxWidth: 260 }}>
              Visual UI component designer for React developers. Design, customise, and export production-ready components.
            </p>
          </div>

          {/* Links */}
          {[
            {
              title: 'Product',
              links: ['Features', 'Components', 'Pricing', 'Changelog'],
            },
            {
              title: 'Developers',
              links: ['Docs', 'API Reference', 'GitHub', 'shadcn/ui'],
            },
            {
              title: 'Company',
              links: ['About', 'Blog', 'Privacy', 'Terms'],
            },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
                {col.title}
              </div>
              {col.links.map(link => (
                <a key={link} href="#" style={{
                  display: 'block', marginBottom: 9, fontSize: 13, color: t.textMid,
                  textDecoration: 'none', transition: 'color 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = t.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = t.textMid)}
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div style={{
          borderTop: `1px solid ${t.border}`, paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 10,
        }}>
          <p style={{ fontSize: 12, color: t.textMuted }}>
            © {new Date().getFullYear()} J6. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: t.textMuted }}>
            Built for developers who care about design.
          </p>
        </div>
      </Container>
    </footer>
  );
}

// ─────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.body.style.background = isDark ? dark.bg : light.bg;
    document.body.style.transition = 'background 0.3s';
    document.body.style.margin = '0';
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ dark: isDark, toggle: () => setIsDark(d => !d) }}>
      <div style={{
        fontFamily: "'Geist', 'Inter', system-ui, -apple-system, sans-serif",
        background: isDark ? dark.bg : light.bg,
        color: isDark ? dark.text : light.text,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}>
        <NavBar />
        <main>
          <Hero />
          <AppMockup />
          <Features />
          <ComponentShowcase />
          <Testimonials />
          <Pricing />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
};

export default LandingPage;
