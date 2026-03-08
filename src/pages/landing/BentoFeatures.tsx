import { motion } from 'motion/react';
import { Paintbrush, Wand2, FileCode2, Layers2 } from 'lucide-react';
import { useTheme } from './theme';
import { BentoA } from './BentoLayout';

const presets = ['blur-fade', 'slide-scale', 'drop-in', 'expand-x', 'expand-y'];

const componentNames = [
  'Button', 'Badge', 'Card', 'Input',
  'Tabs', 'Switch', 'Dialog', 'Slider',
  'Alert', 'Avatar', 'Tooltip', 'Drawer',
];

function IconBox({
  icon: Icon,
  accentSoft,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  accentSoft: string;
  accent: string;
}) {
  return (
    <div
      className="flex items-center justify-center rounded-lg"
      style={{ width: 36, height: 36, background: accentSoft }}
    >
      <Icon size={18} style={{ color: accent }} />
    </div>
  );
}

export function BentoFeatures() {
  const { t } = useTheme();

  const cell0 = (
    <motion.div
      className="flex h-full flex-col p-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0 }}
    >
      <IconBox icon={Paintbrush} accentSoft={t.accentSoft} accent={t.accent} />
      <h3
        className="mt-4 text-base font-semibold"
        style={{ color: t.text }}
      >
        Visual Component Customisation
      </h3>
      <p
        className="mt-1.5 text-sm leading-relaxed"
        style={{ color: t.textMuted }}
      >
        Tweak every token — colour, radius, shadow, typography — via an
        intuitive inspector panel.
      </p>
      <div className="mt-auto flex flex-col gap-2 pt-6">
        {[72, 56, 44].map((w, i) => (
          <div
            key={i}
            className="h-2 rounded-full"
            style={{ width: `${w}%`, background: t.accent, opacity: 0.7 - i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );

  const cell1 = (
    <motion.div
      className="flex h-full flex-col p-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <IconBox icon={Wand2} accentSoft={t.accentSoft} accent={t.accent} />
      <h3
        className="mt-4 text-base font-semibold"
        style={{ color: t.text }}
      >
        Motion &amp; Animation
      </h3>
      <p
        className="mt-1.5 text-sm leading-relaxed"
        style={{ color: t.textMuted }}
      >
        Apply entry animations, hover effects, and staggered children via a
        dedicated Motion FX panel.
      </p>
      <div className="mt-auto flex flex-col gap-1.5 pt-6">
        {presets.map((name) => (
          <div key={name} className="flex items-center gap-2">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: t.accent }}
            />
            <span
              className="font-mono text-xs"
              style={{ color: t.textMid }}
            >
              {name}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const cell2 = (
    <motion.div
      className="flex h-full flex-col p-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <IconBox icon={FileCode2} accentSoft={t.accentSoft} accent={t.accent} />
      <h3
        className="mt-4 text-base font-semibold"
        style={{ color: t.text }}
      >
        Clean Code Export
      </h3>
      <div
        className="mt-3 flex-1 overflow-hidden rounded-lg p-3"
        style={{ background: t.bgAlt }}
      >
        <pre
          className="font-mono text-[11px] leading-relaxed"
          style={{ color: t.textMid }}
        >
{`<button className="
  rounded-lg bg-orange-600
  px-4 py-2 font-semibold
  text-white shadow-lg
">`}
        </pre>
      </div>
    </motion.div>
  );

  const cell3 = (
    <motion.div
      className="flex h-full flex-col p-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <IconBox icon={Layers2} accentSoft={t.accentSoft} accent={t.accent} />
      <h3
        className="mt-4 text-base font-semibold"
        style={{ color: t.text }}
      >
        22 Components
      </h3>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {componentNames.map((name) => (
          <span
            key={name}
            className="rounded px-1.5 py-0.5 text-center text-[10px] font-medium"
            style={{
              background: t.accentSoft,
              color: t.textMid,
            }}
          >
            {name}
          </span>
        ))}
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
            How it works
          </span>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: t.text }}
          >
            Everything you need to design faster
          </h2>
          <p
            className="mx-auto mt-3 max-w-lg text-base"
            style={{ color: t.textMuted }}
          >
            A visual studio for crafting production-ready React components with
            real-time preview and clean export.
          </p>
        </div>

        {/* Bento grid */}
        <BentoA>
          {[cell0, cell1, cell2, cell3]}
        </BentoA>
      </div>
    </section>
  );
}
