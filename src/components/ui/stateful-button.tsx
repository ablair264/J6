'use client';

import * as React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

export type StatefulButtonState = 'idle' | 'loading' | 'success' | 'failure' | 'warning';
export type StatefulButtonResultState = Exclude<StatefulButtonState, 'idle' | 'loading'>;

interface StatefulButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    children: React.ReactNode;
    state?: StatefulButtonState;
    resultState?: StatefulButtonResultState;
    resetDelayMs?: number;
    loadingDurationMs?: number;
    loadingPosition?: 'left' | 'right';
    autoPlay?: boolean;
    autoPlayKey?: string | number;
}

export function StatefulButton({
    className,
    children,
    onClick,
    disabled,
    state,
    resultState = 'success',
    resetDelayMs = 1600,
    loadingDurationMs = 600,
    loadingPosition = 'left',
    autoPlay = false,
    autoPlayKey,
    ...buttonProps
}: StatefulButtonProps) {
    const [internalState, setInternalState] = React.useState<StatefulButtonState>('idle');
    const resetTimerRef = React.useRef<number | null>(null);
    const autoplayTokenRef = React.useRef<string | number | null>(null);

    const clearResetTimer = React.useCallback(() => {
        if (resetTimerRef.current !== null) {
            window.clearTimeout(resetTimerRef.current);
            resetTimerRef.current = null;
        }
    }, []);

    React.useEffect(() => clearResetTimer, [clearResetTimer]);

    const isControlled = state !== undefined;
    const currentState = isControlled ? state : internalState;
    const isRunning = currentState === 'loading';

    const runSequence = React.useCallback(async (nextResultState: StatefulButtonResultState) => {
        clearResetTimer();
        setInternalState('loading');
        await new Promise((resolve) => window.setTimeout(resolve, loadingDurationMs));
        setInternalState(nextResultState);
        resetTimerRef.current = window.setTimeout(() => {
            setInternalState('idle');
            resetTimerRef.current = null;
        }, resetDelayMs);
    }, [clearResetTimer, loadingDurationMs, resetDelayMs]);

    const handleClick = React.useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || isRunning) return;
        if (isControlled) {
            await onClick?.(event);
            return;
        }
        const startedAt = Date.now();
        clearResetTimer();
        setInternalState('loading');
        try {
            await onClick?.(event);
            const remainingLoadingMs = Math.max(0, loadingDurationMs - (Date.now() - startedAt));
            if (remainingLoadingMs > 0) {
                await new Promise((resolve) => window.setTimeout(resolve, remainingLoadingMs));
            }
            setInternalState(resultState);
        } catch (error) {
            const remainingLoadingMs = Math.max(0, loadingDurationMs - (Date.now() - startedAt));
            if (remainingLoadingMs > 0) {
                await new Promise((resolve) => window.setTimeout(resolve, remainingLoadingMs));
            }
            setInternalState('failure');
            throw error;
        } finally {
            resetTimerRef.current = window.setTimeout(() => {
                setInternalState('idle');
                resetTimerRef.current = null;
            }, resetDelayMs);
        }
    }, [clearResetTimer, disabled, isControlled, isRunning, loadingDurationMs, onClick, resetDelayMs, resultState]);

    React.useEffect(() => {
        if (isControlled || disabled || !autoPlay) {
            autoplayTokenRef.current = null;
            return;
        }
        const token = autoPlayKey ?? resultState;
        if (autoplayTokenRef.current === token) {
            return;
        }
        autoplayTokenRef.current = token;
        void runSequence(resultState);
    }, [autoPlay, autoPlayKey, disabled, isControlled, resultState, runSequence]);

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
            disabled={disabled || isRunning}
            data-state={currentState}
            className={cn(
                'inline-flex min-w-[120px] items-center justify-center gap-2 rounded-full px-4 py-2 font-medium ring-offset-2 transition duration-200',
                className,
            )}
            onClick={handleClick}
            {...safeButtonProps}
        >
            <motion.span
                layout
                className={cn(
                    'inline-flex items-center gap-2',
                    loadingPosition === 'right' ? 'flex-row-reverse' : 'flex-row',
                )}
            >
                <ButtonStateIcon state={currentState} />
                <span>{children}</span>
            </motion.span>
        </motion.button>
    );
}

function ButtonStateIcon({ state }: { state: StatefulButtonState }) {
    return (
        <AnimatePresence initial={false} mode="wait">
            {state === 'loading' ? <LoaderIcon key="loading" /> : null}
            {state === 'success' ? <CheckIcon key="success" /> : null}
            {state === 'failure' ? <FailureIcon key="failure" /> : null}
            {state === 'warning' ? <WarningIcon key="warning" /> : null}
        </AnimatePresence>
    );
}

function LoaderIcon() {
    return (
        <motion.svg
            key="loader"
            initial={{ opacity: 0, width: 0, scale: 0.6 }}
            animate={{ opacity: 1, width: 20, scale: 1, rotate: 360 }}
            exit={{ opacity: 0, width: 0, scale: 0.6 }}
            transition={{
                opacity: { duration: 0.18, ease: 'easeOut' },
                width: { duration: 0.18, ease: 'easeOut' },
                scale: { duration: 0.18, ease: 'easeOut' },
                rotate: { duration: 0.8, repeat: Infinity, ease: 'linear' },
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="20"
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
            key="check"
            initial={{ opacity: 0, width: 0, scale: 0.6 }}
            animate={{ opacity: 1, width: 20, scale: 1 }}
            exit={{ opacity: 0, width: 0, scale: 0.6 }}
            xmlns="http://www.w3.org/2000/svg"
            width="20"
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

function FailureIcon() {
    return (
        <motion.span
            key="failure"
            initial={{ opacity: 0, width: 0, scale: 0.6 }}
            animate={{ opacity: 1, width: 20, scale: 1 }}
            exit={{ opacity: 0, width: 0, scale: 0.6 }}
            className="inline-flex shrink-0 items-center justify-center text-current"
        >
            <X className="size-4" />
        </motion.span>
    );
}

function WarningIcon() {
    return (
        <motion.span
            key="warning"
            initial={{ opacity: 0, width: 0, scale: 0.6 }}
            animate={{ opacity: 1, width: 20, scale: 1 }}
            exit={{ opacity: 0, width: 0, scale: 0.6 }}
            className="inline-flex shrink-0 items-center justify-center text-current"
        >
            <AlertTriangle className="size-4" />
        </motion.span>
    );
}

export const StageButton = StatefulButton;
