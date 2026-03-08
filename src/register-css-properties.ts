/**
 * Register CSS Houdini custom properties so the browser knows how to
 * interpolate them in @keyframes.  Without this, animating
 * --ui-effect-beam-angle (an <angle>) in a conic-gradient stays static
 * because the browser treats the custom property as a plain string.
 *
 * CSS @property declarations should do the same thing, but Tailwind v4's
 * CSS pipeline can strip or reorder them.  This JS call is the reliable
 * fallback that guarantees the properties are registered at runtime.
 */

const properties = [
  { name: '--ui-effect-beam-angle', syntax: '<angle>', initialValue: '0deg' },
  { name: '--ui-effect-shine-angle', syntax: '<angle>', initialValue: '0deg' },
];

for (const prop of properties) {
  try {
    CSS.registerProperty({
      name: prop.name,
      syntax: prop.syntax,
      inherits: false,
      initialValue: prop.initialValue,
    });
  } catch {
    // Already registered or browser doesn't support Houdini — safe to ignore
  }
}
