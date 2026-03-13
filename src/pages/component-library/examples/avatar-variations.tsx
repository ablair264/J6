import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup } from '@/components/ui/avatar';

/**
 * Avatar with online badge and hover scale.
 */
export function AvatarWithBadge() {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        transition: { type: 'tween' as const, duration: 0.2, ease: 'easeInOut' as const },
      }}
    >
      <Avatar
        customSize={62}
        radius={999}
        badge
        badgeColor="#22c55e"
      >
        <AvatarImage src="/images/avatar.jpg" alt="User" />
        <AvatarFallback
          style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#e2e8f0' }}
        >
          JD
        </AvatarFallback>
      </Avatar>
    </motion.div>
  );
}

/**
 * Avatar group — stacked with amber strokes and colorful fallbacks.
 */
export function AvatarGroupStacked() {
  return (
    <motion.div
      whileHover={{
        y: -2,
        transition: { type: 'tween' as const, duration: 0.2, ease: 'easeInOut' as const },
      }}
    >
      <AvatarGroup spacing={-8}>
        <Avatar customSize={48} radius={999} strokeWeight={2} strokeColor="#f5a623" bgColor="#7c3aed">
          <AvatarFallback
            fontColor="#ffffff"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            CN
          </AvatarFallback>
        </Avatar>
        <Avatar customSize={48} radius={999} strokeWeight={2} strokeColor="#f5a623" bgColor="#0ea5e9">
          <AvatarFallback
            fontColor="#ffffff"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            LR
          </AvatarFallback>
        </Avatar>
        <Avatar customSize={48} radius={999} strokeWeight={2} strokeColor="#f5a623" bgColor="#10b981">
          <AvatarFallback
            fontColor="#ffffff"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            ER
          </AvatarFallback>
        </Avatar>
        <Avatar customSize={48} radius={999} strokeWeight={2} strokeColor="#f5a623" bgColor="#f5a623">
          <AvatarFallback
            fontColor="#1a1a1d"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            NH
          </AvatarFallback>
        </Avatar>
      </AvatarGroup>
    </motion.div>
  );
}
