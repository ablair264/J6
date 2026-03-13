import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup } from '@/components/ui/avatar';

/**
 * Avatar with hover scale — subtle lift on interaction.
 */
export function AvatarWithBadge() {
  const rootClassName = [
    'bg-[var(--j6-neutral-0-light)]',
    'border-solid',
    'border',
    'border-[#1f2937]/30',
    'rounded-sm',
    'text-sm',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[38px]',
    'px-[14px]',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
  };

  const motionProps = {
    whileHover: {
      scale: 1.02,
      transition: { type: 'tween' as const, duration: 0.2, ease: 'easeInOut' as const },
    },
  };

  return (
    <motion.div {...motionProps}>
      <Avatar customSize={62} radius={999} badge badgeColor="#22c55e" className={rootClassName} style={rootStyle}>
        <AvatarImage src="/images/avatar.jpg" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </motion.div>
  );
}

/**
 * Avatar group with hover float — slight y-shift + scale on hover.
 */
export function AvatarGroupStacked() {
  const motionProps = {
    whileHover: {
      y: -2,
      scale: 1.04,
      transition: { type: 'tween' as const, duration: 0.2, ease: 'easeInOut' as const },
    },
  };

  return (
    <motion.div {...motionProps}>
      <AvatarGroup spacing={-8}>
        <Avatar customSize={48} radius={999} strokeWeight={1} strokeColor="#ffda80">
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar customSize={48} radius={999} strokeWeight={1} strokeColor="#ffda80">
          <AvatarFallback>LR</AvatarFallback>
        </Avatar>
        <Avatar customSize={48} radius={999} strokeWeight={1} strokeColor="#ffda80">
          <AvatarFallback>ER</AvatarFallback>
        </Avatar>
        <Avatar customSize={48} radius={999} strokeWeight={1} strokeColor="#ffda80">
          <AvatarFallback>NH</AvatarFallback>
        </Avatar>
      </AvatarGroup>
    </motion.div>
  );
}
