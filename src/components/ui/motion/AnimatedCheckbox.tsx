import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface AnimatedCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
    disabled?: boolean;
    className?: string;
}

export function AnimatedCheckbox({ checked, onChange, label, description, disabled, className }: AnimatedCheckboxProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'flex w-full items-center gap-2.5 py-1 text-left transition-opacity',
                disabled && 'cursor-not-allowed opacity-40',
                className,
            )}
        >
            <div
                className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                    checked
                        ? 'border-[#2dd4bf] bg-[#2dd4bf]/20'
                        : 'border-white/20 bg-white/[0.04]',
                )}
            >
                <AnimatePresence>
                    {checked && (
                        <motion.svg
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                        >
                            <motion.path
                                d="M2 5L4.5 7.5L8 3"
                                stroke="#2dd4bf"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.2, delay: 0.05 }}
                            />
                        </motion.svg>
                    )}
                </AnimatePresence>
            </div>
            <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium text-[#dbe7f8]">{label}</span>
                {description && <p className="text-[10px] leading-relaxed text-[#64748b]">{description}</p>}
            </div>
        </button>
    );
}
