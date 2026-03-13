import { AnimatedText } from '@/components/ui/animated-text';

const interFont = "'Inter', system-ui, sans-serif";
const monoFont = "'JetBrains Mono', monospace";

/** Typewriter — amber text, large and bold. */
export function AnimatedTextTypewriter() {
  return (
    <AnimatedText
      text="Building the future of UI"
      variant="typewriter"
      speed={1.2}
      className="text-2xl font-bold"
      style={{ color: '#f5a623', fontFamily: interFont }}
    />
  );
}

/** Blur-in — word-by-word reveal, cool neutral. */
export function AnimatedTextBlurIn() {
  return (
    <AnimatedText
      text="Design components visually"
      variant="blur-in"
      speed={0.3}
      stagger={0.06}
      splitBy="word"
      className="text-xl font-semibold"
      style={{ color: '#e2e8f0', fontFamily: interFont }}
    />
  );
}

/** Split entrance — character-level animation, soft violet. */
export function AnimatedTextSplitEntrance() {
  return (
    <AnimatedText
      text="Preview in real-time"
      variant="split-entrance"
      speed={0.3}
      stagger={0.03}
      splitBy="char"
      className="text-lg font-medium"
      style={{ color: '#c4b5fd', fontFamily: interFont }}
    />
  );
}

/** Gradient sweep — cyan to violet animated gradient. */
export function AnimatedTextGradientSweep() {
  return (
    <AnimatedText
      text="Export clean code"
      variant="gradient-sweep"
      speed={3}
      gradientColor1="#22d3ee"
      gradientColor2="#8b5cf6"
      className="text-2xl font-bold"
      style={{ fontFamily: interFont }}
    />
  );
}

/** Shiny text — amber shimmer with white highlight. */
export function AnimatedTextShiny() {
  return (
    <AnimatedText
      text="Premium components"
      variant="shiny-text"
      speed={2}
      gradientColor1="#f5a623"
      gradientColor2="rgba(255,255,255,0.9)"
      className="text-xl font-semibold"
      style={{ fontFamily: interFont }}
    />
  );
}

/** Decrypt — terminal-style code reveal. */
export function AnimatedTextDecrypt() {
  return (
    <AnimatedText
      text="SYSTEM ONLINE"
      variant="decrypt"
      speed={1}
      className="text-lg font-mono"
      style={{ color: '#34d399', fontFamily: monoFont }}
    />
  );
}

/** Counting number — large animated stat display. */
export function AnimatedTextCountingNumber() {
  return (
    <AnimatedText
      text="12,847"
      variant="counting-number"
      speed={1.5}
      className="text-4xl font-bold"
      style={{ color: '#f5a623', fontFamily: interFont }}
    />
  );
}

/** Word rotate — cycling through action words. */
export function AnimatedTextWordRotate() {
  return (
    <AnimatedText
      text="Design, Preview, Export, Ship"
      variant="word-rotate"
      speed={2}
      className="text-xl font-semibold"
      style={{ color: '#e2e8f0', fontFamily: interFont }}
    />
  );
}

/** Bounce — hover-triggered bounce on characters. */
export function AnimatedTextBounce() {
  return (
    <AnimatedText
      text="Hover me!"
      variant="bounce"
      className="text-xl font-bold"
      style={{ color: '#8b5cf6', fontFamily: interFont }}
    />
  );
}
