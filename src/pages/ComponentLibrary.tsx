import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { BUILDER_REGISTRY } from '@/registry/components';
import { EXAMPLES } from './component-library/examples';
import { DetailPage } from './component-library/DetailPage';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Theme tokens
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const T = {
    bg: '#0a0a0b',
    subtle: '#111113',
    surface: '#141416',
    elevated: '#1a1a1d',
    text: '#f0ede8',
    textSec: '#9a9aa3',
    textMuted: '#6b6b72',
    brand: '#f5a623',
    brandHover: '#ffba4a',
    interactive: '#7c3aed',
    interactiveHover: '#9f72ff',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.15)',
    success: '#34d399',
    warning: '#facc15',
    error: '#fb7185',
    info: '#38bdf8',
    electric: '#22d3ee',
    bloom: '#f472b6',
    acid: '#a3e635',
    plasma: '#818cf8',
    inferno: '#fb923c',
    crimson: '#f43f5e',
    spearmint: '#10b981',
    solar: '#facc15',
} as const;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Category config
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
type Category = 'primitives' | 'data-display' | 'feedback' | 'overlay' | 'navigation' | 'charts' | 'compact';

const CATEGORY_ORDER: Category[] = ['primitives', 'data-display', 'feedback', 'overlay', 'navigation', 'charts', 'compact'];
const CATEGORY_LABELS: Record<Category, string> = {
    'primitives': 'Primitives',
    'data-display': 'Data Display',
    'feedback': 'Feedback',
    'overlay': 'Overlay',
    'navigation': 'Navigation',
    'charts': 'Charts',
    'compact': 'Compact',
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Sidebar
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface SidebarProps {
    activeSlug: string | undefined;
    onNavigate: (slug: string | null) => void;
}

function Sidebar({ activeSlug, onNavigate }: SidebarProps) {
    const [search, setSearch] = useState('');

    const filtered = BUILDER_REGISTRY.filter((c) =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    // Group by category
    const grouped = CATEGORY_ORDER.reduce<Record<string, typeof BUILDER_REGISTRY>>((acc, cat) => {
        const items = filtered.filter((c) => c.category === cat);
        if (items.length > 0) acc[cat] = items;
        return acc;
    }, {});

    return (
        <aside
            className="w-[220px] min-w-[220px] h-screen sticky top-0 flex flex-col overflow-hidden"
            style={{ background: T.bg, borderRight: `1px solid ${T.border}` }}
        >
            {/* Logo */}
            <div className="px-4 pt-4 pb-3">
                <button onClick={() => onNavigate(null)} className="flex items-center gap-2 cursor-pointer">
                    <div
                        className="size-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                        style={{ background: T.brand, color: '#0a0a0b' }}
                    >
                        U
                    </div>
                    <span className="text-[14px] font-semibold" style={{ color: T.text }}>UI Studio</span>
                </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-3">
                <div className="relative">
                    <MagnifyingGlassIcon
                        className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2"
                        style={{ color: T.textMuted }}
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-8 py-1.5 rounded-lg text-[12px] outline-none placeholder:text-[12px]"
                        style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
                    />
                    <span
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1 py-0.5 rounded"
                        style={{ background: T.elevated, color: T.textMuted }}
                    >
                        ⌘K
                    </span>
                </div>
            </div>

            {/* Nav links grouped by category */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
                {Object.entries(grouped).map(([cat, items]) => (
                    <div key={cat}>
                        <div className="px-2 pt-1 pb-1">
                            <span
                                className="text-[10px] font-semibold uppercase tracking-widest"
                                style={{ color: T.textMuted }}
                            >
                                {CATEGORY_LABELS[cat as Category]}
                            </span>
                        </div>
                        {items.map((c) => (
                            <button
                                key={c.name}
                                onClick={() => onNavigate(c.name)}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] transition-colors block"
                                style={{
                                    background: activeSlug === c.name ? `${T.brand}12` : 'transparent',
                                    color: activeSlug === c.name ? T.brand : T.textSec,
                                }}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-4" style={{ borderTop: `1px solid ${T.border}` }}>
                <p className="text-[11px] mb-1" style={{ color: T.textMuted }}>Built with UI Studio OSS</p>
                <Link to="/" className="text-[12px] font-medium" style={{ color: T.brand }}>
                    Back to home
                </Link>
            </div>
        </aside>
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Index Grid
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function IndexGrid({ onNavigate }: { onNavigate: (slug: string) => void }) {
    // Group registry by category for grid display
    return (
        <div className="p-8 lg:p-12">
            <div className="mb-10">
                <p
                    className="text-[11px] font-medium uppercase tracking-[0.15em] mb-2"
                    style={{ color: T.brand }}
                >
                    Component Library
                </p>
                <h1 className="text-[28px] font-semibold tracking-tight" style={{ color: T.text }}>
                    Elements{' '}
                    <span className="text-[15px] font-normal ml-2" style={{ color: T.textSec }}>
                        Small building blocks for your application.
                    </span>
                </h1>
            </div>

            {CATEGORY_ORDER.map((cat) => {
                const items = BUILDER_REGISTRY.filter((c) => c.category === cat);
                if (items.length === 0) return null;
                return (
                    <div key={cat} className="mb-10">
                        <h2
                            className="text-[12px] font-semibold uppercase tracking-wider mb-4"
                            style={{ color: T.textMuted }}
                        >
                            {CATEGORY_LABELS[cat]}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {items.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => onNavigate(c.name)}
                                    className="group text-left cursor-pointer"
                                >
                                    <div
                                        className="rounded-xl overflow-hidden flex items-center justify-center p-6 min-h-[120px] transition-all"
                                        style={{
                                            background: T.surface,
                                            border: `1px solid ${T.border}`,
                                        }}
                                    >
                                        {/* Placeholder thumbnail */}
                                        <div
                                            className="text-[11px] font-medium px-3 py-1.5 rounded-lg"
                                            style={{
                                                background: `${T.brand}15`,
                                                color: T.brand,
                                            }}
                                        >
                                            {c.label}
                                        </div>
                                    </div>
                                    <p className="mt-2.5 text-[13px] font-medium" style={{ color: T.text }}>
                                        {c.label}
                                    </p>
                                    <p className="mt-0.5 text-[11px] line-clamp-2" style={{ color: T.textMuted }}>
                                        {c.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Main Export
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function ComponentLibrary() {
    const { slug } = useParams<{ slug?: string }>();
    const navigate = useNavigate();

    const handleNavigate = (target: string | null) => {
        if (target) {
            navigate(`/library/${target}`);
        } else {
            navigate('/library');
        }
    };

    const examples = slug ? (EXAMPLES[slug] ?? []) : [];

    return (
        <div className="flex" style={{ background: T.bg, color: T.text, minHeight: '100vh' }}>
            <Sidebar activeSlug={slug} onNavigate={handleNavigate} />
            <main className="flex-1 overflow-y-auto h-screen">
                {slug ? (
                    <DetailPage slug={slug} examples={examples} />
                ) : (
                    <IndexGrid onNavigate={(s) => handleNavigate(s)} />
                )}
            </main>
        </div>
    );
}
