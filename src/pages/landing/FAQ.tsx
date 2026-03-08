import { useState } from 'react';
import { useTheme } from './theme';
import { motion } from 'motion/react';
import { Plus, Minus, ArrowRight } from 'lucide-react';

const faqs = [
  {
    q: 'What is J6?',
    a: 'J6 is a visual UI component designer for React developers. It lets you customise shadcn/ui-based components via a graphical inspector, apply Motion animations, build token sets, and export clean CSS or Tailwind code — all without writing a line of CSS.',
  },
  {
    q: 'Do I need to know CSS to use J6?',
    a: "No. J6's inspector is visual — you use sliders, colour pickers, and toggles. But because the code it exports is clean, standard CSS or Tailwind, you can always go deeper if you want to.",
  },
  {
    q: 'What components are in the free tier?',
    a: '16 of the 22 components are completely free with no time limit: Accordion, Alert, Avatar, Badge, Button, Checkbox, Dialog, Drawer, Dropdown, Input, Popover, Progress, Slider, Switch, Tabs, and Tooltip.',
  },
  {
    q: "What's in Pro that's not in Free?",
    a: 'Pro unlocks 6 additional components (Animated Text, Avatar Group, Card, DataTable, Listing Card, Navigation Menu), Tailwind code export, token-based design systems, and advanced mouse-tracking hover effects (tilt, glare, spotlight).',
  },
  {
    q: "What does 'export' mean — where does my code go?",
    a: "When you click Export in J6, you get a JSX snippet and the style declaration for your component, either as CSS variables (inline) or Tailwind utility classes. Copy it directly into your codebase. There's no build step or SDK dependency.",
  },
  {
    q: 'Is the exported code production-ready?',
    a: "Yes. J6 generates standard React JSX with inline styles or Tailwind classes. It's the same code you'd write by hand — just generated in seconds instead of minutes.",
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

export function FAQ() {
  const { t } = useTheme();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <motion.div
      id="faq"
      className="w-full"
      style={{ padding: '100px 0' }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr]" style={{ maxWidth: 1120, gap: 60, padding: '0 24px' }}>
        {/* Left column — sticky label */}
        <div className="md:sticky md:self-start" style={{ top: 100 }}>
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: t.accent, backgroundColor: t.accentSoft }}
          >
            FAQ
          </span>

          <h2
            className="mt-4 font-semibold leading-tight"
            style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: t.text }}
          >
            Questions answered
          </h2>

          <p className="mt-3 text-sm" style={{ color: t.textMuted }}>
            Can't find what you're looking for?
          </p>

          <a
            href="#"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: t.accent }}
          >
            Contact us
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Right column — Accordion */}
        <div>
          {faqs.map((item, i) => {
            const isOpen = open === i;

            return (
              <div key={i} style={{ borderBottom: `1px solid ${t.border}` }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between text-left"
                  style={{ padding: '20px 0' }}
                >
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: t.text }}>
                    {item.q}
                  </span>

                  <span
                    className="flex shrink-0 items-center justify-center rounded-md transition-colors"
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: isOpen ? t.accent : t.accentSoft,
                      color: isOpen ? '#fff' : t.accent,
                    }}
                  >
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>

                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? 300 : 0 }}
                >
                  <p
                    className="pb-5"
                    style={{ fontSize: 13.5, color: t.textMid, lineHeight: 1.75 }}
                  >
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
