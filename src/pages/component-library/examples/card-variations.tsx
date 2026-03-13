import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/** Default card — simple border with content. */
export function CardDefault() {
  const rootClassName = [
    'bg-[var(--j6-neutral-600-dark)]',
    'border-solid',
    'border',
    'border-[#5a5a64]',
    'rounded-lg',
    'text-sm',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Card className={rootClassName} style={rootStyle}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription style={{ color: 'rgba(138, 138, 148, 1.000)' }}>A short description of this card content.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card body content goes here.</p>
      </CardContent>
    </Card>
  );
}

/** Elevated card — with shadow and footer action. */
export function CardElevatedAction() {
  const rootClassName = [
    'bg-[var(--j6-neutral-700-light)]',
    'border-solid',
    'border',
    'border-[#3a3a3f]',
    'rounded-lg',
    'text-sm',
    'shadow-lg',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Card variant="elevated" className={rootClassName} style={rootStyle}>
      <CardHeader>
        <CardTitle>Elevated Card</CardTitle>
        <CardDescription style={{ color: 'rgba(138, 138, 148, 1.000)' }}>Enhanced depth with shadow.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content with a call-to-action below.</p>
      </CardContent>
      <CardFooter>
        <Button variant="default" size="sm">Action</Button>
      </CardFooter>
    </Card>
  );
}

/** Glass card — translucent with backdrop blur. */
export function CardGlass() {
  const rootClassName = [
    'bg-[#000000]/0',
    'border-solid',
    'border',
    'border-[#ffffff]/20',
    'rounded-lg',
    'text-sm',
    'backdrop-[blur(40px)_saturate(160%)]',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Card variant="glass" className={rootClassName} style={rootStyle}>
      <CardHeader>
        <CardTitle>Glass Card</CardTitle>
        <CardDescription style={{ color: 'rgba(200, 196, 188, 1.000)' }}>Frosted glass effect.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Transparent with backdrop blur.</p>
      </CardContent>
    </Card>
  );
}

/** Card with hover lift motion. */
export function CardHoverLift() {
  const rootClassName = [
    'bg-[var(--j6-neutral-600-dark)]',
    'border-solid',
    'border',
    'border-[#5a5a64]',
    'rounded-lg',
    'text-sm',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  const motionProps = {
    whileHover: {
      y: -4,
      scale: 1.02,
      transition: { type: 'spring' as const, duration: 0.3, stiffness: 400, damping: 25 },
    },
  };

  return (
    <motion.div {...motionProps}>
      <Card className={rootClassName} style={rootStyle}>
        <CardHeader>
          <CardTitle>Hover Card</CardTitle>
          <CardDescription style={{ color: 'rgba(138, 138, 148, 1.000)' }}>Lifts on hover.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Spring-animated hover interaction.</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Card with scale-up entry animation. */
export function CardEntryScaleUp() {
  const rootClassName = [
    'bg-[var(--j6-neutral-600-dark)]',
    'border-solid',
    'border',
    'border-[#5a5a64]',
    'rounded-lg',
    'text-sm',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  const motionProps = {
    initial: { scale: 0.92, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'tween' as const, duration: 0.5, ease: 'easeOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <Card className={rootClassName} style={rootStyle}>
        <CardHeader>
          <CardTitle>Animated Card</CardTitle>
          <CardDescription style={{ color: 'rgba(138, 138, 148, 1.000)' }}>Scales up on mount.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Smooth entry animation.</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Card with border-beam effect. */
export function CardBorderBeam() {
  const rootEffectClassName = 'ui-studio-effect-border-beam';
  const rootClassName = [
    rootEffectClassName,
    'bg-[var(--j6-neutral-600-dark)]',
    'rounded-lg',
    'text-sm',
  ].join(' ');
  const rootStyle: React.CSSProperties & Record<string, string> = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
    '--ui-motion-speed': '2.8s',
    '--ui-motion-fill': 'rgba(26, 26, 29, 1.000)',
    '--ui-effect-beam-speed': '6s',
    '--ui-effect-beam-size': '80px',
    '--ui-effect-beam-width': '2px',
    '--ui-effect-beam-from': '#9f72ff',
    '--ui-effect-beam-to': '#6d28d9',
  };

  return (
    <Card className={rootClassName} style={rootStyle}>
      <CardHeader>
        <CardTitle>Premium Card</CardTitle>
        <CardDescription style={{ color: 'rgba(159, 114, 255, 0.7)' }}>With animated border beam.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Violet border beam effect.</p>
      </CardContent>
    </Card>
  );
}
