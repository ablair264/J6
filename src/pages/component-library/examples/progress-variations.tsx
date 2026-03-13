import { motion } from 'motion/react';
import { Progress } from '@/components/ui/progress';

/** Linear progress — amber indicator on dark track. */
export function ProgressLinearAmber() {
  const rootClassName = [
    'w-[200px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <Progress
      value={65}
      trackColor="var(--j6-neutral-600-dark)"
      indicatorColor="var(--j6-amber-400-light)"
      size="md"
      className={rootClassName}
      style={rootStyle}
    />
  );
}

/** Linear progress — with label. */
export function ProgressLinearWithLabel() {
  const rootClassName = [
    'w-[200px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
    fontSize: '0.75rem',
  };

  return (
    <Progress
      value={42}
      showLabel
      trackColor="var(--j6-neutral-600-dark)"
      indicatorColor="var(--j6-accent-emerald-light)"
      labelColor="var(--j6-neutral-200-light)"
      size="lg"
      className={rootClassName}
      style={rootStyle}
    />
  );
}

/** Circular progress — violet ring. */
export function ProgressCircularViolet() {
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <Progress
      value={72}
      variant="circular"
      circularSize={56}
      circularStrokeWidth={5}
      trackColor="#3a3a3f"
      indicatorColor="var(--j6-violet-400)"
      showLabel
      labelColor="#c4a8ff"
      style={rootStyle}
    />
  );
}

/** Circular progress — small sky indicator. */
export function ProgressCircularSmall() {
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <Progress
      value={85}
      variant="circular"
      circularSize={40}
      circularStrokeWidth={3}
      trackColor="#2a2a2e"
      indicatorColor="var(--j6-accent-sky-light)"
      style={rootStyle}
    />
  );
}

/** Progress with blur-fade entry. */
export function ProgressEntryBlurFade() {
  const rootClassName = [
    'w-[200px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  const motionProps = {
    initial: { filter: 'blur(4px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1 },
    transition: { type: 'tween' as const, duration: 0.55, ease: 'easeInOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <Progress
        value={55}
        trackColor="#2a2a2e"
        indicatorColor="var(--j6-accent-pink-light)"
        size="md"
        className={rootClassName}
        style={rootStyle}
      />
    </motion.div>
  );
}
