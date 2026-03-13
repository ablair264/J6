import { motion } from 'motion/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

/** Amber switch — amber active track. */
export function SwitchAmber() {
  const rootClassName = [
    'rounded-full',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="switch-amber"
        trackColor="#3a3a3f"
        trackActiveColor="var(--j6-amber-400-light)"
        thumbColor="#e2e8f0"
        className={rootClassName}
        style={rootStyle}
      />
      <Label htmlFor="switch-amber" style={{ color: '#e2e8f0', fontFamily: 'Nunito', fontSize: '0.75rem' }}>Enable</Label>
    </div>
  );
}

/** Emerald switch — green active indicator. */
export function SwitchEmerald() {
  const rootClassName = [
    'rounded-full',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="switch-emerald"
        trackColor="#3a3a3f"
        trackActiveColor="var(--j6-accent-emerald-light)"
        thumbColor="#e2e8f0"
        className={rootClassName}
        style={rootStyle}
      />
      <Label htmlFor="switch-emerald" style={{ color: '#e2e8f0', fontFamily: 'Nunito', fontSize: '0.75rem' }}>Active</Label>
    </div>
  );
}

/** Violet switch — purple active track with small size. */
export function SwitchVioletSmall() {
  const rootClassName = [
    'rounded-full',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="switch-violet-sm"
        size="sm"
        trackColor="#3a3a3f"
        trackActiveColor="var(--j6-violet-500-light)"
        thumbColor="#e2e8f0"
        className={rootClassName}
        style={rootStyle}
      />
      <Label htmlFor="switch-violet-sm" style={{ color: '#e2e8f0', fontFamily: 'Nunito', fontSize: '0.75rem' }}>Compact</Label>
    </div>
  );
}

/** Switch with hover scale wrapper. */
export function SwitchHoverScale() {
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  const motionProps = {
    whileHover: {
      scale: 1.08,
      transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
    },
  };

  return (
    <div className="flex items-center gap-2">
      <motion.div {...motionProps}>
        <Switch
          id="switch-hover"
          trackColor="#3a3a3f"
          trackActiveColor="var(--j6-accent-sky-light)"
          thumbColor="#ffffff"
          style={rootStyle}
        />
      </motion.div>
      <Label htmlFor="switch-hover" style={{ color: '#e2e8f0', fontFamily: 'Nunito', fontSize: '0.75rem' }}>Interactive</Label>
    </div>
  );
}
