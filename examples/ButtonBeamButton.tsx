export function ButtonBeamButton() {
  const previewStyle = {
    background: 'linear-gradient(135deg, rgba(15, 105, 209, 0.880) 0%, rgba(15, 105, 209, 0.880) 60%, rgba(5, 45, 94, 0.880) 100%)',
    borderStyle: 'solid',
    borderWidth: '0px',
    borderColor: 'transparent',
    borderRadius: '5px',
    color: 'rgba(219, 231, 248, 1.000)',
    fontFamily: 'Space Grotesk',
    fontSize: '12px',
    fontWeight: 700,
    textAlign: 'center',
    justifyContent: 'center',
    minHeight: '34px',
    height: '34px',
    paddingInline: '12px',
    transition: 'background 180ms ease, border-color 180ms ease, color 180ms ease, border-radius 180ms ease, box-shadow 180ms ease',
    '--ui-motion-speed': '2.8s',
    '--ui-motion-fill': 'rgba(15, 105, 209, 0.880)',
    '--ui-effect-shine-speed': '1.8s',
    '--ui-effect-shine-color': '#ffffff',
    '--ui-effect-shine-width': '2px',
    '--ui-effect-grain-opacity': '0.18',
    '--ui-effect-grain-size': '120',
    '--ui-btn-hover-bg': 'linear-gradient(135deg, rgba(15, 105, 209, 0.880) 0%, rgba(15, 105, 209, 0.880) 60%, rgba(5, 45, 94, 0.880) 100%)',
    '--ui-btn-hover-fg': 'rgba(219, 231, 248, 1.000)',
    '--ui-btn-hover-border': 'transparent',
    '--ui-btn-hover-border-width': '0px',
    '--ui-btn-hover-font-size': '12px',
    '--ui-btn-hover-font-weight': '500',
    '--ui-btn-hover-justify': 'center',
    '--ui-btn-active-bg': 'linear-gradient(135deg, rgba(15, 105, 209, 0.880) 0%, rgba(15, 105, 209, 0.880) 60%, rgba(5, 45, 94, 0.880) 100%)',
    '--ui-btn-active-fg': 'rgba(219, 231, 248, 1.000)',
    '--ui-btn-active-border': 'transparent',
    '--ui-btn-active-border-width': '0px',
    '--ui-btn-active-font-size': '12px',
    '--ui-btn-active-font-weight': '500',
    '--ui-btn-active-justify': 'center',
    '--ui-btn-disabled-bg': 'linear-gradient(135deg, rgba(15, 105, 209, 0.880) 0%, rgba(15, 105, 209, 0.880) 60%, rgba(5, 45, 94, 0.880) 100%)',
    '--ui-btn-disabled-fg': 'rgba(219, 231, 248, 1.000)',
    '--ui-btn-disabled-border': 'transparent',
    '--ui-btn-disabled-border-width': '0px',
    '--ui-btn-disabled-font-size': '12px',
    '--ui-btn-disabled-font-weight': '500',
    '--ui-btn-disabled-justify': 'center',
  };
  // Extracted effects stay grouped here so they are easy to move or replace.
  const buttonEffectClassName = 'ui-studio-effect-shine-border ui-studio-effect-grain';
  const buttonClassName = ['ui-studio-button-state', buttonEffectClassName].filter(Boolean).join(' ');

  const motionProps = {
    whileHover: { scale: 1.05, x: 0, y: 2, rotate: 0, opacity: 1.00, transition: { type: 'tween', duration: 0.2, delay: 0, ease: 'easeInOut' } },
    transition: { type: 'tween', duration: 0.35, delay: 0, ease: 'easeInOut' },
  };

  // Wrap your component preview with motion
  <motion.div {...motionProps}>
    {/* component */}
  </motion.div>

  return (
    <Button intent="primary" size="md" className={buttonClassName} style={previewStyle}>
      Primary action
    </Button>
  );
}