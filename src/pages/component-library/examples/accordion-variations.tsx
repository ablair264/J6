import { motion } from 'motion/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

/** Dark accordion — single collapsible with amber dividers. */
export function AccordionDarkAmber() {
  const rootClassName = [
    'bg-[var(--j6-neutral-600-dark)]',
    'border-solid',
    'border',
    'border-[#5a5a64]',
    'rounded-md',
    'text-sm',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Accordion
      type="single"
      collapsible
      dividerColor="var(--j6-amber-500-light)"
      dividerWeight={1}
      paddingH={14}
      paddingW={16}
      className={rootClassName}
      style={rootStyle}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>What is UI Studio?</AccordionTrigger>
        <AccordionContent>A visual component design tool for React and Tailwind.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How does export work?</AccordionTrigger>
        <AccordionContent>Components export as clean React + Tailwind code.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it open source?</AccordionTrigger>
        <AccordionContent>Yes, the project is fully open source.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/** Light accordion — spaced items with no dividers. */
export function AccordionLightSpaced() {
  const rootClassName = [
    'bg-[var(--j6-neutral-50-light)]',
    'rounded-md',
    'text-sm',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(58, 58, 63, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Accordion
      type="single"
      collapsible
      dividerEnabled={false}
      spacing={8}
      paddingH={12}
      paddingW={14}
      className={rootClassName}
      style={rootStyle}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Features</AccordionTrigger>
        <AccordionContent>Visual preview, live editing, and instant export.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Components</AccordionTrigger>
        <AccordionContent>21+ components with motion and effects.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/** Accordion with blur-fade entry animation. */
export function AccordionEntryBlurFade() {
  const rootClassName = [
    'bg-[var(--j6-neutral-600-dark)]',
    'border-solid',
    'border',
    'border-[#3a3a3f]',
    'rounded-md',
    'text-sm',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  const motionProps = {
    initial: { filter: 'blur(4px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1 },
    transition: { type: 'tween' as const, duration: 0.55, ease: 'easeInOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <Accordion
        type="single"
        collapsible
        dividerColor="#5a5a64"
        paddingH={14}
        paddingW={16}
        className={rootClassName}
        style={rootStyle}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>Getting started</AccordionTrigger>
          <AccordionContent>Install via pnpm and start designing.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Token system</AccordionTrigger>
          <AccordionContent>J6 tokens provide consistent color primitives.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}

/** Accordion with multiple open items. */
export function AccordionMultipleOpen() {
  const rootClassName = [
    'bg-[var(--j6-neutral-700-light)]',
    'border-solid',
    'border',
    'border-[var(--j6-violet-500-light)]/20',
    'rounded-md',
    'text-sm',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(200, 196, 188, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Accordion
      type="multiple"
      dividerColor="var(--j6-violet-400)"
      dividerWeight={1}
      paddingH={14}
      paddingW={16}
      className={rootClassName}
      style={rootStyle}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Design tokens</AccordionTrigger>
        <AccordionContent>Primitives, semantics, and showcase themes.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Motion system</AccordionTrigger>
        <AccordionContent>Entry, hover, tap, and exit animations.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Effects</AccordionTrigger>
        <AccordionContent>Grain, gradient-slide, border-beam, and more.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
