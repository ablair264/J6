import { motion } from 'motion/react';
import { Progress } from '@/components/ui/progress';

const font = "'Inter', system-ui, sans-serif";

/** Linear progress — amber indicator on dark track. */
export function ProgressLinearAmber() {
  return (
    <Progress
      value={65}
      trackColor="#1e1e22"
      indicatorColor="#f5a623"
      size="lg"
      className="w-[280px]"
      style={{ fontFamily: font }}
    />
  );
}

/** Linear progress — emerald with visible label. */
export function ProgressLinearWithLabel() {
  return (
    <Progress
      value={42}
      showLabel
      trackColor="#1e1e22"
      indicatorColor="#10b981"
      labelColor="#e2e8f0"
      size="lg"
      className="w-[280px]"
      style={{ fontFamily: font, fontSize: '0.8125rem' }}
    />
  );
}

/** Circular progress — violet ring with label. */
export function ProgressCircularViolet() {
  return (
    <Progress
      value={72}
      variant="circular"
      circularSize={72}
      circularStrokeWidth={6}
      trackColor="#1e1e22"
      indicatorColor="#8b5cf6"
      showLabel
      labelColor="#c4b5fd"
      style={{ fontFamily: font, fontSize: '0.875rem', fontWeight: 600 }}
    />
  );
}

/** Circular progress — small sky blue indicator. */
export function ProgressCircularSmall() {
  return (
    <Progress
      value={85}
      variant="circular"
      circularSize={48}
      circularStrokeWidth={4}
      trackColor="#1e1e22"
      indicatorColor="#0ea5e9"
      style={{ fontFamily: font }}
    />
  );
}

/** Linear progress with blur-fade entry animation. */
export function ProgressEntryBlurFade() {
  return (
    <motion.div
      initial={{ filter: 'blur(4px)', opacity: 0 }}
      animate={{ filter: 'blur(0px)', opacity: 1 }}
      transition={{ type: 'tween' as const, duration: 0.55, ease: 'easeInOut' as const }}
    >
      <Progress
        value={55}
        trackColor="#1e1e22"
        indicatorColor="#f472b6"
        size="lg"
        className="w-[280px]"
        style={{ fontFamily: font }}
      />
    </motion.div>
  );
}
