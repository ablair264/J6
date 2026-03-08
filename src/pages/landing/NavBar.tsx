import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Moon, Sun } from 'lucide-react';
import { useTheme } from './theme';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Components', href: '#components' },
  { label: 'Pricing', href: '#pricing' },
] as const;

export function NavBar() {
  const { dark, toggle, t } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-3 transition-all duration-300"
      style={{
        backgroundColor: scrolled
          ? dark
            ? 'rgba(14,14,12,0.75)'
            : 'rgba(248,248,245,0.75)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? `1px solid ${t.border}` : '1px solid transparent',
        boxShadow: scrolled ? t.shadow : 'none',
      }}
    >
      {/* Logo */}
      <a href="#" className="flex items-center gap-2.5 no-underline">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${t.accent}, #ff7c3a)`,
          }}
        >
          <Layers className="w-4.5 h-4.5 text-white" size={18} />
        </div>
        <span
          className="text-lg font-bold tracking-tight"
          style={{ color: t.text }}
        >
          J6
        </span>
      </a>

      {/* Nav links — hidden on mobile */}
      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm font-medium no-underline transition-colors duration-200"
            style={{ color: t.textMid }}
            onMouseEnter={(e) => (e.currentTarget.style.color = t.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = t.textMid)}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="flex items-center justify-center w-9 h-9 rounded-lg border transition-colors duration-200 cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            borderColor: t.border,
            color: t.textMid,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = t.borderHover;
            e.currentTarget.style.color = t.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = t.border;
            e.currentTarget.style.color = t.textMid;
          }}
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <Link
          to="/register"
          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold no-underline transition-opacity duration-200 hover:opacity-90"
          style={{
            background: `linear-gradient(135deg, ${t.accent}, #ff7c3a)`,
            color: '#ffffff',
          }}
        >
          Get started free
        </Link>
      </div>
    </nav>
  );
}
