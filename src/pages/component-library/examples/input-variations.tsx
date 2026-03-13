import { motion } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Dark input — standard text input with amber focus ring. */
export function InputDark() {
  const rootClassName = [
    'bg-[var(--j6-neutral-600-dark)]',
    'border-solid',
    'border',
    'border-[#5a5a64]',
    'rounded-sm',
    'text-sm',
    'h-[38px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <div className="flex flex-col gap-2">
      <Label style={{ color: '#8a8a94', fontFamily: 'Nunito', fontSize: '0.75rem' }}>Email</Label>
      <Input
        type="email"
        placeholder="name@example.com"
        className={rootClassName}
        style={rootStyle}
      />
    </div>
  );
}

/** Light input — clean with subtle border. */
export function InputLight() {
  const rootClassName = [
    'bg-[var(--j6-neutral-0-light)]',
    'border-solid',
    'border',
    'border-[#1f2937]/20',
    'rounded-sm',
    'text-sm',
    'h-[38px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(42, 42, 46, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <div className="flex flex-col gap-2">
      <Label style={{ color: '#5a5a64', fontFamily: 'Nunito', fontSize: '0.75rem' }}>Username</Label>
      <Input
        type="text"
        placeholder="Enter username"
        className={rootClassName}
        style={rootStyle}
      />
    </div>
  );
}

/** Input with blur-fade entry animation. */
export function InputEntryBlurFade() {
  const rootClassName = [
    'bg-[var(--j6-neutral-600-dark)]',
    'border-solid',
    'border',
    'border-[#3a3a3f]',
    'rounded-sm',
    'text-sm',
    'h-[38px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  const motionProps = {
    initial: { filter: 'blur(4px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1 },
    transition: { type: 'tween' as const, duration: 0.55, ease: 'easeInOut' as const },
  };

  return (
    <motion.div {...motionProps} className="flex flex-col gap-2">
      <Label style={{ color: '#8a8a94', fontFamily: 'Nunito', fontSize: '0.75rem' }}>Search</Label>
      <Input
        type="search"
        placeholder="Search components..."
        className={rootClassName}
        style={rootStyle}
      />
    </motion.div>
  );
}

/** Input with violet focus styling. */
export function InputVioletFocus() {
  const rootClassName = [
    'bg-[var(--j6-neutral-700-light)]',
    'border-solid',
    'border',
    'border-[var(--j6-violet-500-light)]/30',
    'rounded-sm',
    'text-sm',
    'h-[38px]',
    'px-[12px]',
    'focus:border-[var(--j6-violet-400)]',
    'focus:ring-[var(--j6-violet-400)]/20',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(200, 196, 188, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <div className="flex flex-col gap-2">
      <Label style={{ color: '#8a8a94', fontFamily: 'Nunito', fontSize: '0.75rem' }}>Password</Label>
      <Input
        type="password"
        placeholder="Enter password"
        className={rootClassName}
        style={rootStyle}
      />
    </div>
  );
}
