import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const interFont = "'Inter', system-ui, sans-serif";

/** Default card — clean dark surface with subtle border. */
export function CardDefault() {
  return (
    <Card
      className="bg-[#141416] border-solid border border-[#2a2a2e] rounded-xl text-sm"
      style={{ color: '#c8c4bc', fontFamily: interFont }}
    >
      <CardHeader>
        <CardTitle style={{ color: '#f0ede8' }}>Component Inspector</CardTitle>
        <CardDescription style={{ color: '#9a9aa3' }}>
          Adjust styles, motion presets, and effects in real time with the visual inspector panel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ color: '#c8c4bc' }}>
          Every property change reflects instantly in the preview. Fine-tune typography, spacing, colors, borders, and shadows without writing a single line of code.
        </p>
      </CardContent>
    </Card>
  );
}

/** Elevated card — deeper shadow with footer action button. */
export function CardElevatedAction() {
  return (
    <Card
      variant="elevated"
      className="bg-[#1a1a1d] border-solid border border-[#2a2a2e] rounded-xl text-sm shadow-lg"
      style={{ color: '#c8c4bc', fontFamily: interFont }}
    >
      <CardHeader>
        <CardTitle style={{ color: '#f0ede8' }}>Export to Code</CardTitle>
        <CardDescription style={{ color: '#9a9aa3' }}>
          Generate production-ready React components with Tailwind classes or inline styles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ color: '#c8c4bc' }}>
          Exported code is clean and dependency-free. No proprietary wrappers, no CSS variable chains — just standard React and Tailwind you can ship as-is.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          variant="default"
          size="sm"
          style={{
            fontFamily: interFont,
            backgroundColor: '#8b5cf6',
            color: '#ffffff',
            borderRadius: '8px',
          }}
        >
          Export Component
        </Button>
      </CardFooter>
    </Card>
  );
}

/** Glass card — translucent surface with backdrop blur. */
export function CardGlass() {
  return (
    <Card
      variant="glass"
      className="bg-white/[0.04] border-solid border border-white/[0.08] backdrop-blur-xl rounded-xl text-sm"
      style={{ color: '#d4d0ca', fontFamily: interFont }}
    >
      <CardHeader>
        <CardTitle style={{ color: '#f0ede8' }}>Glass Morphism</CardTitle>
        <CardDescription style={{ color: '#a3a3ab' }}>
          Frosted translucent surface that blends with the background content behind it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ color: '#c8c4bc' }}>
          Achieved with a low-opacity white background and a backdrop blur filter. Works best over gradients or textured backgrounds.
        </p>
      </CardContent>
    </Card>
  );
}

/** Card with hover lift — spring-animated Y translation and scale. */
export function CardHoverLift() {
  const motionProps = {
    whileHover: {
      y: -4,
      scale: 1.02,
      transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
    },
  };

  return (
    <motion.div {...motionProps} style={{ cursor: 'pointer' }}>
      <Card
        className="bg-[#141416] border-solid border border-[#2a2a2e] rounded-xl text-sm"
        style={{ color: '#c8c4bc', fontFamily: interFont }}
      >
        <CardHeader>
          <CardTitle style={{ color: '#f0ede8' }}>Hover Interaction</CardTitle>
          <CardDescription style={{ color: '#9a9aa3' }}>
            Spring-physics lift effect on mouse hover with smooth return.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p style={{ color: '#c8c4bc' }}>
            Hover over this card to see the lift animation. Uses spring physics with configurable stiffness and damping for natural-feeling motion.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Card with scale-up entry animation on mount. */
export function CardEntryScaleUp() {
  const motionProps = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'tween' as const, duration: 0.5, ease: 'easeOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <Card
        className="bg-[#141416] border-solid border border-[#2a2a2e] rounded-xl text-sm"
        style={{ color: '#c8c4bc', fontFamily: interFont }}
      >
        <CardHeader>
          <CardTitle style={{ color: '#f0ede8' }}>Entry Animation</CardTitle>
          <CardDescription style={{ color: '#9a9aa3' }}>
            Scales up smoothly from 90% when the component first mounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p style={{ color: '#c8c4bc' }}>
            Entry presets fire once on mount. Combine with hover and tap motions for layered interaction design.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Card with animated border-beam effect. */
export function CardBorderBeam() {
  const rootStyle: React.CSSProperties & Record<string, string> = {
    color: '#c8c4bc',
    fontFamily: interFont,
    '--ui-motion-speed': '2.8s',
    '--ui-motion-fill': '#141416',
    '--ui-effect-beam-speed': '6s',
    '--ui-effect-beam-size': '80px',
    '--ui-effect-beam-width': '2px',
    '--ui-effect-beam-from': '#8b5cf6',
    '--ui-effect-beam-to': '#6d28d9',
  };

  return (
    <Card
      className="ui-studio-effect-border-beam bg-[#141416] rounded-xl text-sm"
      style={rootStyle}
    >
      <CardHeader>
        <CardTitle style={{ color: '#f0ede8' }}>Border Beam</CardTitle>
        <CardDescription style={{ color: 'rgba(139, 92, 246, 0.7)' }}>
          Animated violet beam traces the card border on a continuous loop.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ color: '#c8c4bc' }}>
          The border-beam effect uses a CSS conic-gradient animation with zero JavaScript overhead. Fully configurable beam speed, size, and color stops.
        </p>
      </CardContent>
    </Card>
  );
}
