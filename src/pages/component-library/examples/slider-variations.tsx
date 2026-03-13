import { motion } from 'motion/react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const font = "'Inter', system-ui, sans-serif";

/** Dark slider — single thumb volume control. */
export function SliderDark() {
  return (
    <div className="flex flex-col gap-3">
      <Label
        className="text-sm font-medium"
        style={{ color: '#f0ede8', fontFamily: font }}
      >
        Volume
      </Label>
      <Slider
        defaultValue={[50]}
        max={100}
        className="w-[280px]"
        style={{ fontFamily: font }}
      />
    </div>
  );
}

/** Range slider — dual thumb for price range selection. */
export function SliderRange() {
  return (
    <div className="flex flex-col gap-3">
      <Label
        className="text-sm font-medium"
        style={{ color: '#f0ede8', fontFamily: font }}
      >
        Price Range
      </Label>
      <Slider
        defaultValue={[25, 75]}
        max={100}
        className="w-[280px]"
        style={{ fontFamily: font }}
      />
    </div>
  );
}

/** Slider with blur-fade entry animation. */
export function SliderEntryBlurFade() {
  return (
    <motion.div
      initial={{ filter: 'blur(4px)', opacity: 0 }}
      animate={{ filter: 'blur(0px)', opacity: 1 }}
      transition={{ type: 'tween' as const, duration: 0.55, ease: 'easeInOut' as const }}
      className="flex flex-col gap-3"
    >
      <Label
        className="text-sm font-medium"
        style={{ color: '#f0ede8', fontFamily: font }}
      >
        Brightness
      </Label>
      <Slider
        defaultValue={[70]}
        max={100}
        className="w-[280px]"
        style={{ fontFamily: font }}
      />
    </motion.div>
  );
}
