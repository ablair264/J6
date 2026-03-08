import { motion } from 'motion/react';
import {
  SquareMousePointer,
  SlidersHorizontal,
  FileCode2,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from './theme';
import { BentoB } from './BentoLayout';

const sidebarItems = [
  { name: 'Button', active: false },
  { name: 'Badge', active: true },
  { name: 'Card', active: false },
  { name: 'Tabs', active: false },
  { name: 'Input', active: false },
];

const inspectorRows = [
  { label: 'Fill', type: 'swatch' as const },
  { label: 'Radius', value: '12px' },
  { label: 'Shadow', value: 'lg' },
];

const codeLines = `className="rounded-xl
  bg-orange-600 px-6 py-3
  font-semibold text-white
  shadow-lg"`;

export function HowItWorks() {
  const { t } = useTheme();

  /* ── Cell 0: Pick a component ── */
  const cell0 = (
    <motion.div
      className="flex h-full flex-col p-5"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <SquareMousePointer size={18} style={{ color: t.accent, marginBottom: 8 }} />
          <h3 className="text-sm font-semibold" style={{ color: t.text }}>
            Pick a component
          </h3>
        </div>
        <span
          className="text-[28px] font-bold leading-none"
          style={{ color: t.accent }}
        >
          01
        </span>
      </div>

      {/* Mini sidebar */}
      <div className="mt-4 flex flex-col gap-1">
        {sidebarItems.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 rounded-md px-2 py-1.5"
            style={{
              background: item.active ? t.accentSoft : 'transparent',
              border: item.active
                ? `1px solid ${t.accentBorder}`
                : '1px solid transparent',
            }}
          >
            <div
              className="h-2.5 w-2.5 rounded-sm"
              style={{
                background: item.active ? t.accent : t.textMuted,
                opacity: item.active ? 1 : 0.5,
              }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: item.active ? t.accent : t.textMid }}
            >
              {item.name}
            </span>
            {item.active && (
              <ChevronRight
                size={12}
                className="ml-auto"
                style={{ color: t.accent }}
              />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );

  /* ── Cell 1: Visual connector (narrow center) ── */
  const cell1 = (
    <motion.div
      className="flex h-full items-center justify-center p-3"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      <div className="relative flex flex-col items-center gap-0" style={{ height: '80%' }}>
        {[1, 2, 3].map((n, i) => (
          <div
            key={n}
            className="relative z-10 flex items-center justify-center rounded-full text-xs font-semibold"
            style={{
              width: 24,
              height: 24,
              border: `1.5px solid ${t.accent}`,
              color: t.accent,
              background: t.bgCard,
              ...(i === 0
                ? { position: 'absolute' as const, top: 0 }
                : i === 1
                  ? { position: 'absolute' as const, top: '50%', transform: 'translateY(-50%)' }
                  : { position: 'absolute' as const, bottom: 0 }),
            }}
          >
            {n}
          </div>
        ))}
        {/* Connecting line */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            bottom: 12,
            width: 1,
            background: t.accent,
            opacity: 0.25,
          }}
        />
      </div>
    </motion.div>
  );

  /* ── Cell 2: Style it visually ── */
  const cell2 = (
    <motion.div
      className="flex h-full flex-col p-5"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <SlidersHorizontal size={18} style={{ color: t.accent, marginBottom: 8 }} />
          <h3 className="text-sm font-semibold" style={{ color: t.text }}>
            Style it visually
          </h3>
        </div>
        <span
          className="text-[28px] font-bold leading-none"
          style={{ color: t.accent }}
        >
          02
        </span>
      </div>

      {/* Mini inspector */}
      <div className="mt-4 flex flex-col gap-2">
        {inspectorRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-md px-2.5 py-1.5"
            style={{ background: t.bgAlt }}
          >
            <span className="text-xs" style={{ color: t.textMuted }}>
              {row.label}
            </span>
            {row.type === 'swatch' ? (
              <div
                className="h-4 w-4 rounded"
                style={{ background: t.accent }}
              />
            ) : (
              <span
                className="font-mono text-xs font-medium"
                style={{ color: t.textMid }}
              >
                {row.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );

  /* ── Cell 3: Export clean code ── */
  const cell3 = (
    <motion.div
      className="flex h-full flex-col p-5"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <FileCode2 size={18} style={{ color: t.accent, marginBottom: 8 }} />
          <h3 className="text-sm font-semibold" style={{ color: t.text }}>
            Export clean code
          </h3>
        </div>
        <span
          className="text-[28px] font-bold leading-none"
          style={{ color: t.accent }}
        >
          03
        </span>
      </div>

      {/* Mini code block */}
      <div
        className="mt-4 flex-1 overflow-hidden rounded-lg p-3"
        style={{ background: t.bgAlt }}
      >
        <pre
          className="font-mono text-[11px] leading-relaxed"
          style={{ color: t.textMid }}
        >
          {codeLines}
        </pre>
      </div>
    </motion.div>
  );

  return (
    <section style={{ padding: '100px 0' }}>
      <div
        className="mx-auto"
        style={{ maxWidth: 1120, padding: '0 24px' }}
      >
        {/* Section header */}
        <div className="mb-12 text-center">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: t.accentSoft,
              color: t.accent,
              border: `1px solid ${t.accentBorder}`,
            }}
          >
            Workflow
          </span>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: t.text }}
          >
            Three steps. Zero friction.
          </h2>
          <p
            className="mx-auto mt-3 max-w-lg text-base"
            style={{ color: t.textMuted }}
          >
            Pick a component, style it in the visual inspector, and export
            production-ready React &amp; Tailwind code.
          </p>
        </div>

        {/* Bento grid */}
        <BentoB>
          {[cell0, cell1, cell2, cell3]}
        </BentoB>
      </div>
    </section>
  );
}
