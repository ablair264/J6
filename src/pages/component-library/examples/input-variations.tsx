import { motion } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const font = "'Inter', system-ui, sans-serif";

/** Dark input — professional dark theme with subtle border. */
export function InputDark() {
  return (
    <div className="flex flex-col gap-2">
      <Label
        className="text-xs font-medium tracking-wide"
        style={{ color: '#9a9aa3', fontFamily: font }}
      >
        Email
      </Label>
      <Input
        type="email"
        placeholder="name@example.com"
        className="bg-[#141416] border-solid border border-[#303035] rounded-lg text-sm h-10 px-3 placeholder:text-[#5a5a64] focus:border-[#f5a623] focus:ring-[#f5a623]/20 focus:ring-2"
        style={{ color: '#f0ede8', fontFamily: font }}
      />
    </div>
  );
}

/** Lighter-on-dark input — elevated surface with softer contrast. */
export function InputLight() {
  return (
    <div className="flex flex-col gap-2">
      <Label
        className="text-xs font-medium tracking-wide"
        style={{ color: '#9a9aa3', fontFamily: font }}
      >
        Username
      </Label>
      <Input
        type="text"
        placeholder="Enter username"
        className="bg-[#1e1e22] border-solid border border-[#404045] rounded-lg text-sm h-10 px-3 placeholder:text-[#5a5a64] focus:border-[#10b981] focus:ring-[#10b981]/20 focus:ring-2"
        style={{ color: '#e2e8f0', fontFamily: font }}
      />
    </div>
  );
}

/** Input with blur-fade entry animation. */
export function InputEntryBlurFade() {
  return (
    <motion.div
      initial={{ filter: 'blur(4px)', opacity: 0 }}
      animate={{ filter: 'blur(0px)', opacity: 1 }}
      transition={{ type: 'tween' as const, duration: 0.55, ease: 'easeInOut' as const }}
      className="flex flex-col gap-2"
    >
      <Label
        className="text-xs font-medium tracking-wide"
        style={{ color: '#9a9aa3', fontFamily: font }}
      >
        Search
      </Label>
      <Input
        type="search"
        placeholder="Search components..."
        className="bg-[#141416] border-solid border border-[#303035] rounded-lg text-sm h-10 px-3 placeholder:text-[#5a5a64] focus:border-[#0ea5e9] focus:ring-[#0ea5e9]/20 focus:ring-2"
        style={{ color: '#f0ede8', fontFamily: font }}
      />
    </motion.div>
  );
}

/** Input with violet focus ring styling. */
export function InputVioletFocus() {
  return (
    <div className="flex flex-col gap-2">
      <Label
        className="text-xs font-medium tracking-wide"
        style={{ color: '#9a9aa3', fontFamily: font }}
      >
        Password
      </Label>
      <Input
        type="password"
        placeholder="Enter password"
        className="bg-[#141416] border-solid border border-[#303035] rounded-lg text-sm h-10 px-3 placeholder:text-[#5a5a64] focus:border-[#8b5cf6] focus:ring-[#8b5cf6]/25 focus:ring-2"
        style={{ color: '#f0ede8', fontFamily: font }}
      />
    </div>
  );
}
