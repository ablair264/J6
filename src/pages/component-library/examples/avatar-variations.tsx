import { Mail, MessageCircle, PhoneCall } from 'lucide-react';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarGroup } from '@/components/ui/avatar';

const font = "'Inter', system-ui, sans-serif";

const actions = [
  { label: 'Message', Icon: MessageCircle },
  { label: 'Email', Icon: Mail },
  { label: 'Call', Icon: PhoneCall },
];

function ContactActions({ color }: { color: string }) {
  return (
    <div className="mt-4 flex items-center gap-3">
      {actions.map(({ label, Icon }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          className="inline-flex size-8 items-center justify-center rounded-full text-current transition-opacity hover:opacity-100"
          style={{ color, opacity: 0.72 }}
        >
          <Icon size={22} strokeWidth={1.8} />
        </button>
      ))}
    </div>
  );
}

function VioletAvatar({ size }: { size: number }) {
  return (
    <Avatar
      customSize={size}
      radius={999}
      bgColor="#3424b9"
      strokeWeight={1}
      strokeColor="#4b3dd4"
      className="shadow-[0_12px_28px_rgba(11,8,45,0.28)]"
    >
      <AvatarFallback
        className="font-semibold tracking-[-0.03em] text-white"
        style={{ fontFamily: font, fontSize: size * 0.34 }}
      >
        JD
      </AvatarFallback>
    </Avatar>
  );
}

function AmberAvatar({ initials, size }: { initials: string; size: number }) {
  return (
    <Avatar
      customSize={size}
      radius={999}
      bgColor="#f79a3e"
      strokeWeight={2}
      strokeColor="#f7c96a"
      className="shadow-[0_12px_28px_rgba(20,12,4,0.22)]"
    >
      <AvatarFallback
        className="font-semibold tracking-[-0.03em] text-white"
        style={{ fontFamily: font, fontSize: size * 0.34 }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export function AvatarProfileCardViolet() {
  return (
    <motion.div
      className="flex min-h-[300px] w-full max-w-[420px] flex-col items-center justify-center gap-9"
      whileHover={{
        y: -3,
        scale: 1.01,
        transition: { type: 'spring', stiffness: 260, damping: 18 },
      }}
    >
      <div className="w-full rounded-[30px] border border-[#4538cc] bg-[linear-gradient(180deg,#2c1d98_0%,#251784_100%)] px-6 py-6 text-white shadow-[0_28px_70px_rgba(10,7,40,0.48)]">
        <div className="flex items-center gap-5">
          <VioletAvatar size={76} />
          <div className="min-w-0">
            <p
              className="truncate text-[18px] font-semibold leading-none tracking-[-0.03em]"
              style={{ fontFamily: font }}
            >
              JD
            </p>
            <p
              className="mt-3 truncate text-[15px] leading-none text-white/60"
              style={{ fontFamily: font }}
            >
              Team Member
            </p>
            <ContactActions color="rgba(255,255,255,0.78)" />
          </div>
        </div>
      </div>

      <VioletAvatar size={116} />
    </motion.div>
  );
}

export function AvatarProfileCardGroup() {
  return (
    <motion.div
      className="flex min-h-[320px] w-full max-w-[440px] flex-col items-center justify-center gap-9"
      whileHover={{
        y: -3,
        scale: 1.01,
        transition: { type: 'spring', stiffness: 260, damping: 18 },
      }}
    >
      <div className="w-full rounded-[30px] border border-[#3a3a42] bg-[linear-gradient(180deg,#1d1d22_0%,#15161a_100%)] px-6 py-6 text-white shadow-[0_28px_64px_rgba(0,0,0,0.42)]">
        <div className="flex items-center gap-5">
          <AmberAvatar initials="ER" size={80} />
          <div className="min-w-0">
            <p
              className="truncate text-[18px] font-semibold leading-none tracking-[-0.03em] text-white"
              style={{ fontFamily: font }}
            >
              Evan Ross
            </p>
            <p
              className="mt-3 truncate text-[15px] leading-none text-white/56"
              style={{ fontFamily: font }}
            >
              Product
            </p>
            <ContactActions color="rgba(221,221,233,0.78)" />
          </div>
        </div>
      </div>

      <AvatarGroup spacing={-12} className="justify-center">
        {['CN', 'LR', 'ER', 'NH'].map((initials) => (
          <AmberAvatar key={initials} initials={initials} size={72} />
        ))}
      </AvatarGroup>
    </motion.div>
  );
}
