import { motion } from 'motion/react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const interFont = "'Inter', system-ui, sans-serif";

/** Info alert — default blue styling. */
export function AlertInfo() {
  return (
    <Alert variant="info" className="rounded-lg text-sm" style={{ fontFamily: interFont }}>
      <AlertTitle>New Update Available</AlertTitle>
      <AlertDescription>
        Version 2.4 includes motion presets and animated text components.
      </AlertDescription>
    </Alert>
  );
}

/** Success alert — green styling with check icon. */
export function AlertSuccess() {
  return (
    <Alert variant="success" className="rounded-lg text-sm" style={{ fontFamily: interFont }}>
      <AlertTitle>Deployment Complete</AlertTitle>
      <AlertDescription>
        All changes have been deployed to production.
      </AlertDescription>
    </Alert>
  );
}

/** Warning alert — amber styling with dismissible. */
export function AlertWarningDismissible() {
  return (
    <Alert variant="warning" dismissible className="rounded-lg text-sm" style={{ fontFamily: interFont }}>
      <AlertTitle>API Rate Limit</AlertTitle>
      <AlertDescription>
        You're approaching 80% of your hourly request limit.
      </AlertDescription>
    </Alert>
  );
}

/** Error alert — red styling. */
export function AlertError() {
  return (
    <Alert variant="error" className="rounded-lg text-sm" style={{ fontFamily: interFont }}>
      <AlertTitle>Build Failed</AlertTitle>
      <AlertDescription>
        TypeScript compilation error in motion-schema.ts line 42.
      </AlertDescription>
    </Alert>
  );
}

/** Alert with blur-fade entry animation. */
export function AlertEntryBlurFade() {
  const motionProps = {
    initial: { filter: 'blur(6px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1 },
    transition: { type: 'tween' as const, duration: 0.6, ease: 'easeOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <Alert variant="info" className="rounded-lg text-sm" style={{ fontFamily: interFont }}>
        <AlertTitle>Motion Presets Available</AlertTitle>
        <AlertDescription>
          Blur-fade, slide-scale, and drop-in animations are ready to use across all components.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}

/** Alert with scale-up entry animation. */
export function AlertEntryScaleUp() {
  const motionProps = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'tween' as const, duration: 0.45, ease: 'easeOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <Alert variant="success" className="rounded-lg text-sm" style={{ fontFamily: interFont }}>
        <AlertTitle>Export Successful</AlertTitle>
        <AlertDescription>
          Your component has been exported as clean React + Tailwind code.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
