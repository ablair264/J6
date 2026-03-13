import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup } from '@/components/ui/avatar';

const font = "'Inter', system-ui, sans-serif";

/**
 * Avatar based on `Avatar5-tailwind (8).tsx`.
 */
export function AvatarWithBadge() {
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        transition: { type: 'tween' as const, duration: 0.2, ease: 'easeInOut' as const },
      }}
    >
      <Avatar
        customSize={62}
        radius={999}
        badge
        badgeColor="#22c55e"
        className="border border-[#1f2937]/30 bg-[var(--ui-primitive-neutral-0-light)]"
        style={{ color: 'rgba(226, 232, 240, 1)', fontFamily: font }}
      >
        <AvatarImage src="/images/avatar.jpg" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </motion.div>
  );
}

/**
 * Avatar based on `Avatar5-tailwind (9).tsx`.
 */
export function AvatarFallbackNeutral() {
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        transition: { type: 'tween' as const, duration: 0.2, ease: 'easeInOut' as const },
      }}
    >
      <Avatar
        customSize={56}
        radius={999}
        strokeWeight={1}
        strokeColor="#d1d5db"
        className="border border-[#1f2937]/30 bg-[var(--ui-primitive-neutral-0-light)]"
        style={{ color: 'rgba(226, 232, 240, 1)', fontFamily: font }}
      >
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </motion.div>
  );
}

/**
 * Avatar group based on `AvatarGroup8-tailwind.tsx`.
 */
export function AvatarGroupStacked() {
  return (
    <motion.div
      whileHover={{
        y: -2,
        scale: 1.04,
        transition: { type: 'tween' as const, duration: 0.2, ease: 'easeInOut' as const },
      }}
    >
      <AvatarGroup spacing={-8}>
        <Avatar customSize={48} radius={999} strokeWeight={1} strokeColor="#ffda80">
          <AvatarFallback style={{ fontFamily: font }}>CN</AvatarFallback>
        </Avatar>
        <Avatar customSize={48} radius={999} strokeWeight={1} strokeColor="#ffda80">
          <AvatarFallback style={{ fontFamily: font }}>LR</AvatarFallback>
        </Avatar>
        <Avatar customSize={48} radius={999} strokeWeight={1} strokeColor="#ffda80">
          <AvatarFallback style={{ fontFamily: font }}>ER</AvatarFallback>
        </Avatar>
        <Avatar customSize={48} radius={999} strokeWeight={1} strokeColor="#ffda80">
          <AvatarFallback style={{ fontFamily: font }}>NH</AvatarFallback>
        </Avatar>
      </AvatarGroup>
    </motion.div>
  );
}
