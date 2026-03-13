import { motion } from 'motion/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const interFont = "'Inter', system-ui, sans-serif";

/** Dark accordion — single collapsible with amber dividers. */
export function AccordionDarkAmber() {
  return (
    <Accordion
      type="single"
      collapsible
      dividerColor="#f5a623"
      dividerWeight={1}
      dividerEnabled
      paddingH={16}
      paddingW={18}
      className="bg-[#141416] border-solid border border-[#2a2a2e] rounded-xl text-sm font-medium"
      style={{ color: '#f0ede8', fontFamily: interFont }}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger style={{ color: '#f0ede8' }}>
          What frameworks are supported?
        </AccordionTrigger>
        <AccordionContent style={{ color: '#9a9aa3' }}>
          UI Studio exports clean React components with Tailwind CSS classes. You can drop the generated code directly into any Vite, Next.js, or Remix project without additional configuration.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger style={{ color: '#f0ede8' }}>
          How does the motion system work?
        </AccordionTrigger>
        <AccordionContent style={{ color: '#9a9aa3' }}>
          Motion presets are powered by React Motion and include entry, exit, hover, and tap animations. Each preset exports as a standalone motion wrapper with no runtime dependencies beyond the motion library.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger style={{ color: '#f0ede8' }}>
          Can I customize the exported code?
        </AccordionTrigger>
        <AccordionContent style={{ color: '#9a9aa3' }}>
          Absolutely. All exported components use standard React props and Tailwind utilities. There are no proprietary abstractions locking you in — edit the output however you need.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/** Spaced accordion — no dividers, relaxed spacing. */
export function AccordionLightSpaced() {
  return (
    <Accordion
      type="single"
      collapsible
      dividerEnabled={false}
      spacing={8}
      paddingH={16}
      paddingW={18}
      className="bg-[#1a1a1d] rounded-xl text-sm font-medium"
      style={{ color: '#e0ddd7', fontFamily: interFont }}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger style={{ color: '#e0ddd7' }}>
          Design tokens and theming
        </AccordionTrigger>
        <AccordionContent style={{ color: '#87878f' }}>
          Components ship with a token system for colors, spacing, and typography. Override tokens at the theme level to match your brand without touching individual component styles.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger style={{ color: '#e0ddd7' }}>
          Accessibility and keyboard navigation
        </AccordionTrigger>
        <AccordionContent style={{ color: '#87878f' }}>
          Built on Radix primitives, every component supports full keyboard navigation, ARIA attributes, and screen reader announcements out of the box.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger style={{ color: '#e0ddd7' }}>
          Component variants and effects
        </AccordionTrigger>
        <AccordionContent style={{ color: '#87878f' }}>
          Each component includes multiple visual variants powered by CVA. Layer on effects like border-beam, neon-glow, or gradient-sweep for premium polish.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/** Accordion with blur-fade entry animation. */
export function AccordionEntryBlurFade() {
  const motionProps = {
    initial: { filter: 'blur(6px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1 },
    transition: { type: 'tween' as const, duration: 0.6, ease: 'easeOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <Accordion
        type="single"
        collapsible
        dividerColor="#404045"
        dividerWeight={1}
        dividerEnabled
        paddingH={16}
        paddingW={18}
        className="bg-[#111113] border-solid border border-[#1e1e22] rounded-xl text-sm font-medium"
        style={{ color: '#e2e0db', fontFamily: interFont }}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger style={{ color: '#e2e0db' }}>
            Getting started with UI Studio
          </AccordionTrigger>
          <AccordionContent style={{ color: '#8a8a93' }}>
            Install the package with pnpm, open the visual editor, and start composing components. Changes reflect instantly in the live preview panel.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger style={{ color: '#e2e0db' }}>
            Exporting production-ready code
          </AccordionTrigger>
          <AccordionContent style={{ color: '#8a8a93' }}>
            Once you are satisfied with the design, click Export to generate a clean React component with inline styles or Tailwind classes — your choice.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}

/** Accordion with multiple open items and violet accent. */
export function AccordionMultipleOpen() {
  return (
    <Accordion
      type="multiple"
      dividerColor="#8b5cf6"
      dividerWeight={1}
      dividerEnabled
      paddingH={16}
      paddingW={18}
      className="bg-[#141416] border-solid border border-[rgba(139,92,246,0.25)] rounded-xl text-sm font-medium"
      style={{ color: '#d4d0ca', fontFamily: interFont }}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger style={{ color: '#e8e5e0' }}>
          Entry and exit presets
        </AccordionTrigger>
        <AccordionContent style={{ color: '#9a9aa3' }}>
          Choose from blur-fade, slide-scale, drop-in, expand-x, and expand-y. Each preset is configurable with duration, easing, and delay parameters.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger style={{ color: '#e8e5e0' }}>
          Border and outline effects
        </AccordionTrigger>
        <AccordionContent style={{ color: '#9a9aa3' }}>
          Add border-beam, shine-border, neon-glow, or pulse-ring effects. These run on CSS animations and have zero JavaScript runtime cost.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger style={{ color: '#e8e5e0' }}>
          Advanced hover interactions
        </AccordionTrigger>
        <AccordionContent style={{ color: '#9a9aa3' }}>
          Enable 3D tilt, glare overlay, or spotlight tracking on hover. These mouse-tracking effects use requestAnimationFrame for smooth 60fps performance.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
