import { motion } from 'motion/react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

/** Info alert — default blue styling. */
export function AlertInfo() {
  const rootClassName = [
    'rounded-md',
    'text-sm',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <Alert variant="info" className={rootClassName} style={rootStyle}>
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>This is an informational alert with default styling.</AlertDescription>
    </Alert>
  );
}

/** Success alert — green styling with check icon. */
export function AlertSuccess() {
  const rootClassName = [
    'rounded-md',
    'text-sm',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <Alert variant="success" className={rootClassName} style={rootStyle}>
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>Operation completed successfully.</AlertDescription>
    </Alert>
  );
}

/** Warning alert — amber styling with dismissible. */
export function AlertWarningDismissible() {
  const rootClassName = [
    'rounded-md',
    'text-sm',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <Alert variant="warning" dismissible className={rootClassName} style={rootStyle}>
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>Please review before proceeding.</AlertDescription>
    </Alert>
  );
}

/** Error alert — red styling. */
export function AlertError() {
  const rootClassName = [
    'rounded-md',
    'text-sm',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <Alert variant="error" className={rootClassName} style={rootStyle}>
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Something went wrong. Please try again.</AlertDescription>
    </Alert>
  );
}

/** Alert with blur-fade entry animation. */
export function AlertEntryBlurFade() {
  const rootClassName = [
    'rounded-md',
    'text-sm',
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
      <Alert variant="info" className={rootClassName} style={rootStyle}>
        <AlertTitle>New feature</AlertTitle>
        <AlertDescription>Motion animations are now available for all components.</AlertDescription>
      </Alert>
    </motion.div>
  );
}

/** Alert with scale-up entry animation. */
export function AlertEntryScaleUp() {
  const rootClassName = [
    'rounded-md',
    'text-sm',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  const motionProps = {
    initial: { scale: 0.92, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'tween' as const, duration: 0.45, ease: 'easeOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <Alert variant="success" className={rootClassName} style={rootStyle}>
        <AlertTitle>Deployed</AlertTitle>
        <AlertDescription>Your changes are now live.</AlertDescription>
      </Alert>
    </motion.div>
  );
}
