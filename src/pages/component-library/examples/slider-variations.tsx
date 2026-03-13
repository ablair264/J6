import { motion } from 'motion/react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

/** Dark slider — default range. */
export function SliderDark() {
  const rootClassName = [
    'w-[200px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <div className="flex flex-col gap-3">
      <Label style={{ color: '#8a8a94', fontFamily: 'Nunito', fontSize: '0.75rem' }}>Volume</Label>
      <Slider
        defaultValue={[50]}
        max={100}
        className={rootClassName}
        style={rootStyle}
      />
    </div>
  );
}

/** Range slider — dual thumb for range selection. */
export function SliderRange() {
  const rootClassName = [
    'w-[200px]',
  ].join(' ');
  const rootStyle = {
    fontFamily: 'Nunito',
  };

  return (
    <div className="flex flex-col gap-3">
      <Label style={{ color: '#8a8a94', fontFamily: 'Nunito', fontSize: '0.75rem' }}>Price Range</Label>
      <Slider
        defaultValue={[25, 75]}
        max={100}
        className={rootClassName}
        style={rootStyle}
      />
    </div>
  );
}

/** Slider with blur-fade entry. */
export function SliderEntryBlurFade() {
  const rootClassName = [
    'w-[200px]',
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
    <motion.div {...motionProps} className="flex flex-col gap-3">
      <Label style={{ color: '#8a8a94', fontFamily: 'Nunito', fontSize: '0.75rem' }}>Brightness</Label>
      <Slider
        defaultValue={[70]}
        max={100}
        className={rootClassName}
        style={rootStyle}
      />
    </motion.div>
  );
}
