'use client';

import * as React from 'react';
import { motion, useAnimate } from 'motion/react';
import { cn } from '@/lib/utils';

interface StatefulButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    children: React.ReactNode;
}

export function StatefulButton({ className, children, onClick, disabled, ...buttonProps }: StatefulButtonProps) {
    const [scope, animate] = useAnimate();
    const [isRunning, setIsRunning] = React.useState(false);

    const animateLoading = React.useCallback(async () => {
        await animate(
            '.loader',
            { width: '20px', scale: 1, display: 'block' },
            { duration: 0.2 },
        );
    }, [animate]);

    const animateSuccess = React.useCallback(async () => {
        await animate(
            '.loader',
            { width: '0px', scale: 0, display: 'none' },
            { duration: 0.2 },
        );
        await animate(
            '.check',
            { width: '20px', scale: 1, display: 'block' },
            { duration: 0.2 },
        );
        await animate(
            '.check',
            { width: '0px', scale: 0, display: 'none' },
            { delay: 1.6, duration: 0.2 },
        );
    }, [animate]);

    const handleClick = React.useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || isRunning) return;
        setIsRunning(true);
        try {
            await animateLoading();
            await onClick?.(event);
            await animateSuccess();
        } finally {
            setIsRunning(false);
        }
    }, [animateLoading, animateSuccess, disabled, isRunning, onClick]);

    const {
        onDrag,
        onDragStart,
        onDragEnd,
        onAnimationStart,
        onAnimationEnd,
        ...safeButtonProps
    } = buttonProps;

    return (
        <motion.button
            layout
            layoutId="stage-button"
            ref={scope}
            disabled={disabled || isRunning}
            className={cn(
                'inline-flex min-w-[120px] items-center justify-center gap-2 rounded-full px-4 py-2 font-medium ring-offset-2 transition duration-200',
                className,
            )}
            onClick={handleClick}
            {...safeButtonProps}
        >
            <motion.span layout className="inline-flex items-center gap-2">
                <LoaderIcon />
                <CheckIcon />
                <span>{children}</span>
            </motion.span>
        </motion.button>
    );
}

function LoaderIcon() {
    return (
        <motion.svg
            animate={{ rotate: [0, 360] }}
            initial={{ scale: 0, width: 0, display: 'none' }}
            style={{ scale: 0.5, display: 'none' }}
            transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="loader shrink-0 text-current"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 3a9 9 0 1 0 9 9" />
        </motion.svg>
    );
}

function CheckIcon() {
    return (
        <motion.svg
            initial={{ scale: 0, width: 0, display: 'none' }}
            style={{ scale: 0.5, display: 'none' }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="check shrink-0 text-current"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M9 12l2 2l4 -4" />
        </motion.svg>
    );
}

export const StageButton = StatefulButton;
