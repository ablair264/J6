import { AnimatedText } from '@/components/ui/animated-text';

/** Typewriter — amber text on dark bg. */
export function AnimatedTextTypewriter() {
  const rootClassName = [
    'text-lg',
    'font-semibold',
  ].join(' ');
  const rootStyle = {
    color: 'var(--j6-amber-400-light)',
    fontFamily: 'Nunito',
  };

  return (
    <AnimatedText
      text="Welcome to UI Studio"
      variant="typewriter"
      speed={1.2}
      className={rootClassName}
      style={rootStyle}
    />
  );
}

/** Blur-in — word-by-word reveal. */
export function AnimatedTextBlurIn() {
  const rootClassName = [
    'text-base',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <AnimatedText
      text="Design components visually"
      variant="blur-in"
      speed={0.3}
      stagger={0.06}
      splitBy="word"
      className={rootClassName}
      style={rootStyle}
    />
  );
}

/** Split entrance — character-level animation. */
export function AnimatedTextSplitEntrance() {
  const rootClassName = [
    'text-base',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(200, 196, 188, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <AnimatedText
      text="Preview in real-time"
      variant="split-entrance"
      speed={0.3}
      stagger={0.03}
      splitBy="char"
      className={rootClassName}
      style={rootStyle}
    />
  );
}

/** Gradient sweep — cyan to violet. */
export function AnimatedTextGradientSweep() {
  const rootClassName = [
    'text-xl',
    'font-bold',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <AnimatedText
      text="Export clean code"
      variant="gradient-sweep"
      speed={3}
      gradientColor1="var(--j6-accent-cyan-light)"
      gradientColor2="var(--j6-violet-400)"
      className={rootClassName}
      style={rootStyle}
    />
  );
}

/** Shiny text — amber shimmer. */
export function AnimatedTextShiny() {
  const rootClassName = [
    'text-lg',
    'font-semibold',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <AnimatedText
      text="Premium components"
      variant="shiny-text"
      speed={2}
      gradientColor1="var(--j6-amber-500-light)"
      gradientColor2="rgba(255,255,255,0.9)"
      className={rootClassName}
      style={rootStyle}
    />
  );
}

/** Decrypt — code-style reveal. */
export function AnimatedTextDecrypt() {
  const rootClassName = [
    'text-base',
    'font-mono',
  ].join(' ');
  const rootStyle = {
    color: 'var(--j6-accent-emerald-light)',
    fontFamily: 'JetBrains Mono, monospace',
  };

  return (
    <AnimatedText
      text="SYSTEM ONLINE"
      variant="decrypt"
      speed={1}
      className={rootClassName}
      style={rootStyle}
    />
  );
}

/** Counting number — large stat display. */
export function AnimatedTextCountingNumber() {
  const rootClassName = [
    'text-3xl',
    'font-bold',
  ].join(' ');
  const rootStyle = {
    color: 'var(--j6-amber-400-light)',
    fontFamily: 'Nunito',
  };

  return (
    <AnimatedText
      text="1247"
      variant="counting-number"
      speed={1.5}
      className={rootClassName}
      style={rootStyle}
    />
  );
}

/** Word rotate — cycling words. */
export function AnimatedTextWordRotate() {
  const rootClassName = [
    'text-lg',
    'font-semibold',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <AnimatedText
      text="Design, Preview, Export, Ship"
      variant="word-rotate"
      speed={2}
      className={rootClassName}
      style={rootStyle}
    />
  );
}

/** Bounce — hover-triggered bounce on chars. */
export function AnimatedTextBounce() {
  const rootClassName = [
    'text-lg',
    'font-bold',
  ].join(' ');
  const rootStyle = {
    color: 'var(--j6-violet-400)',
    fontFamily: 'Nunito',
  };

  return (
    <AnimatedText
      text="Hover me!"
      variant="bounce"
      className={rootClassName}
      style={rootStyle}
    />
  );
}
