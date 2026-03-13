import { motion } from 'motion/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const font = "'Inter', system-ui, sans-serif";

/** Amber switch — bright amber active track. */
export function SwitchAmber() {
  return (
    <div className="flex items-center gap-3">
      <Switch
        id="switch-amber"
        defaultChecked={true}
        trackColor="#2a2a2e"
        trackActiveColor="#f5a623"
        thumbColor="#ffffff"
        thumbActiveColor="#ffffff"
        style={{ fontFamily: font }}
      />
      <Label
        htmlFor="switch-amber"
        className="text-sm font-medium"
        style={{ color: '#f0ede8', fontFamily: font }}
      >
        Dark mode
      </Label>
    </div>
  );
}

/** Emerald switch — green active indicator. */
export function SwitchEmerald() {
  return (
    <div className="flex items-center gap-3">
      <Switch
        id="switch-emerald"
        defaultChecked={true}
        trackColor="#2a2a2e"
        trackActiveColor="#10b981"
        thumbColor="#ffffff"
        thumbActiveColor="#ffffff"
        style={{ fontFamily: font }}
      />
      <Label
        htmlFor="switch-emerald"
        className="text-sm font-medium"
        style={{ color: '#f0ede8', fontFamily: font }}
      >
        Notifications
      </Label>
    </div>
  );
}

/** Violet switch — purple active track with compact size. */
export function SwitchVioletSmall() {
  return (
    <div className="flex items-center gap-3">
      <Switch
        id="switch-violet-sm"
        defaultChecked={true}
        size="sm"
        trackColor="#2a2a2e"
        trackActiveColor="#8b5cf6"
        thumbColor="#ffffff"
        thumbActiveColor="#ffffff"
        style={{ fontFamily: font }}
      />
      <Label
        htmlFor="switch-violet-sm"
        className="text-xs font-medium"
        style={{ color: '#c4b5fd', fontFamily: font }}
      >
        Compact toggle
      </Label>
    </div>
  );
}

/** Switch with hover scale wrapper — sky blue active track. */
export function SwitchHoverScale() {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        whileHover={{
          scale: 1.08,
          transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
        }}
      >
        <Switch
          id="switch-hover"
          defaultChecked={true}
          trackColor="#2a2a2e"
          trackActiveColor="#0ea5e9"
          thumbColor="#ffffff"
          thumbActiveColor="#ffffff"
          style={{ fontFamily: font }}
        />
      </motion.div>
      <Label
        htmlFor="switch-hover"
        className="text-sm font-medium"
        style={{ color: '#f0ede8', fontFamily: font }}
      >
        Auto-save
      </Label>
    </div>
  );
}
