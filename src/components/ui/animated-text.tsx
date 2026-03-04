import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useSpring, useTransform, type Transition } from 'motion/react';
import { cn } from '@/lib/utils';

export type AnimatedTextVariant =
    | 'typewriter'
    | 'blur-in'
    | 'split-entrance'
    | 'counting-number'
    | 'decrypt'
    | 'gradient-sweep'
    | 'shiny-text';

export type AnimatedTextSplitBy = 'char' | 'word' | 'line';
export type AnimatedTextTrigger = 'mount' | 'hover';

export interface AnimatedTextProps {
    text: string;
    variant?: AnimatedTextVariant;
    speed?: number;
    stagger?: number;
    splitBy?: AnimatedTextSplitBy;
    gradientColor1?: string;
    gradientColor2?: string;
    trigger?: AnimatedTextTrigger;
    className?: string;
    style?: React.CSSProperties;
}

function splitText(text: string, splitBy: AnimatedTextSplitBy): string[] {
    if (splitBy === 'char') return text.split('');
    if (splitBy === 'word') return text.split(/(\s+)/);
    return text.split('\n');
}

// ─── Typewriter (speed = total duration in seconds) ─────────────────────────

function TypewriterText({
    text, speed = 1, className, style,
}: Pick<AnimatedTextProps, 'text' | 'speed' | 'className' | 'style'>) {
    const [displayText, setDisplayText] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    const indexRef = useRef(0);

    useEffect(() => {
        indexRef.current = 0;
        setDisplayText('');
        setShowCursor(true);
        const charCount = text.length;
        const interval = Math.max(10, ((speed ?? 1) * 1000) / charCount);
        const timer = setInterval(() => {
            indexRef.current += 1;
            setDisplayText(text.slice(0, indexRef.current));
            if (indexRef.current >= charCount) {
                clearInterval(timer);
                setTimeout(() => setShowCursor(false), 800);
            }
        }, interval);
        return () => clearInterval(timer);
    }, [text, speed]);

    return (
        <span className={className} style={style} data-slot="animated-text">
            {displayText}
            {showCursor && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
                    className="inline-block w-[2px] h-[1em] bg-current ml-0.5 align-middle"
                />
            )}
        </span>
    );
}

// ─── Blur-In (React Bits BlurText: stagger blur→sharp per word/char) ───────

function BlurInText({
    text, speed = 0.3, stagger = 0.04, splitBy = 'word', className, style,
}: Pick<AnimatedTextProps, 'text' | 'speed' | 'stagger' | 'splitBy' | 'className' | 'style'>) {
    const segments = useMemo(() => splitText(text, splitBy), [text, splitBy]);
    const isLineSplit = splitBy === 'line';
    const transition = (i: number): Transition => ({
        delay: i * (stagger ?? 0.04),
        duration: speed ?? 0.3,
        ease: 'easeOut',
    });

    return (
        <span className={cn(isLineSplit ? 'inline-flex flex-col items-start' : 'inline-flex flex-wrap', className)} style={style} data-slot="animated-text">
            {segments.map((segment, i) => (
                <motion.span
                    key={`${segment}-${i}`}
                    initial={{ opacity: 0, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={transition(i)}
                    className={cn('inline-block', isLineSplit && 'block w-full')}
                    style={segment.match(/^\s+$/) ? { whiteSpace: 'pre' } : undefined}
                >
                    {segment}
                </motion.span>
            ))}
        </span>
    );
}

// ─── Split Entrance (Magic UI TextAnimate: stagger slide/scale per segment) ─

function SplitEntranceText({
    text, speed = 0.3, stagger = 0.03, splitBy = 'char', className, style,
}: Pick<AnimatedTextProps, 'text' | 'speed' | 'stagger' | 'splitBy' | 'className' | 'style'>) {
    const segments = useMemo(() => splitText(text, splitBy), [text, splitBy]);
    const isLineSplit = splitBy === 'line';
    const transition = (i: number): Transition => ({
        delay: i * (stagger ?? 0.03),
        duration: speed ?? 0.3,
        ease: [0.2, 0.65, 0.3, 0.9],
    });

    return (
        <span className={cn(isLineSplit ? 'inline-flex flex-col items-start' : 'inline-flex flex-wrap', className)} style={style} data-slot="animated-text">
            {segments.map((segment, i) => (
                <motion.span
                    key={`${segment}-${i}`}
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={transition(i)}
                    className={cn('inline-block', isLineSplit && 'block w-full')}
                    style={segment.match(/^\s+$/) ? { whiteSpace: 'pre' } : undefined}
                >
                    {segment}
                </motion.span>
            ))}
        </span>
    );
}

// ─── Counting Number (Magic UI NumberTicker: spring interpolation) ──────────

function CountingNumberText({
    text, speed = 1.5, className, style,
}: Pick<AnimatedTextProps, 'text' | 'speed' | 'className' | 'style'>) {
    const numericValue = parseFloat(text.replace(/[^0-9.-]/g, '')) || 0;
    const prefix = text.match(/^[^0-9.-]*/)?.[0] ?? '';
    const suffix = text.match(/[^0-9.-]*$/)?.[0] ?? '';
    const decimals = (text.split('.')[1]?.replace(/[^0-9]/g, '').length) ?? 0;

    const springValue = useSpring(0, {
        stiffness: 100,
        damping: 30,
        duration: speed ?? 1.5,
    });

    const display = useTransform(springValue, (latest) =>
        `${prefix}${latest.toFixed(decimals)}${suffix}`
    );

    useEffect(() => {
        springValue.set(numericValue);
    }, [numericValue, springValue]);

    return (
        <motion.span className={className} style={style} data-slot="animated-text">
            {display}
        </motion.span>
    );
}

// ─── Decrypt (speed = total duration in seconds) ────────────────────────────

const DECRYPT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

function DecryptText({
    text, speed = 1, className, style,
}: Pick<AnimatedTextProps, 'text' | 'speed' | 'className' | 'style'>) {
    const [display, setDisplay] = useState(() =>
        text.split('').map(() => DECRYPT_CHARS[Math.floor(Math.random() * DECRYPT_CHARS.length)]).join('')
    );
    const resolvedRef = useRef(0);

    useEffect(() => {
        resolvedRef.current = 0;
        setDisplay(text.split('').map(() => DECRYPT_CHARS[Math.floor(Math.random() * DECRYPT_CHARS.length)]).join(''));

        const charCount = text.length;
        const interval = Math.max(10, ((speed ?? 1) * 1000) / charCount);
        const timer = setInterval(() => {
            resolvedRef.current += 1;
            if (resolvedRef.current > charCount) {
                clearInterval(timer);
                return;
            }
            setDisplay(
                text.split('').map((char, i) =>
                    i < resolvedRef.current
                        ? char
                        : DECRYPT_CHARS[Math.floor(Math.random() * DECRYPT_CHARS.length)]
                ).join('')
            );
        }, interval);

        return () => clearInterval(timer);
    }, [text, speed]);

    return (
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={cn('font-mono', className)}
            style={style}
            data-slot="animated-text"
        >
            {display}
        </motion.span>
    );
}

// ─── Gradient Sweep (Magic UI AnimatedGradientText: moving bg-position) ─────

function GradientSweepText({
    text, speed = 3, gradientColor1 = '#22d3ee', gradientColor2 = '#a78bfa',
    className, style,
}: Pick<AnimatedTextProps, 'text' | 'speed' | 'gradientColor1' | 'gradientColor2' | 'className' | 'style'>) {
    return (
        <span
            className={cn('ui-studio-animated-text-gradient', className)}
            style={{
                ...style,
                backgroundImage: `linear-gradient(90deg, ${gradientColor1}, ${gradientColor2}, ${gradientColor1})`,
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `ui-studio-gradient-sweep ${speed ?? 3}s linear infinite`,
            }}
            data-slot="animated-text"
        >
            {text}
        </span>
    );
}

// ─── Shiny Text (Magic UI AnimatedShinyText: light sweep via bg-position) ───

function ShinyText({
    text, speed = 2, gradientColor1 = 'rgba(255,255,255,0.1)', gradientColor2 = 'rgba(255,255,255,0.8)',
    className, style,
}: Pick<AnimatedTextProps, 'text' | 'speed' | 'gradientColor1' | 'gradientColor2' | 'className' | 'style'>) {
    return (
        <span
            className={cn('ui-studio-animated-text-shiny', className)}
            style={{
                ...style,
                backgroundImage: `linear-gradient(120deg, transparent 40%, ${gradientColor2} 50%, transparent 60%)`,
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `ui-studio-shiny-sweep ${speed ?? 2}s ease-in-out infinite`,
                color: gradientColor1,
            }}
            data-slot="animated-text"
        >
            {text}
        </span>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function AnimatedText({
    text,
    variant = 'blur-in',
    speed,
    stagger,
    splitBy = 'word',
    gradientColor1,
    gradientColor2,
    trigger = 'mount',
    className,
    style,
}: AnimatedTextProps) {
    const [hoverKey, setHoverKey] = useState(0);
    const [hasHovered, setHasHovered] = useState(trigger === 'mount');
    const triggerAnimation = () => {
        setHasHovered(true);
        setHoverKey((k) => k + 1);
    };

    const wrapperProps = trigger === 'hover'
        ? {
            onMouseEnter: triggerAnimation,
            onFocus: triggerAnimation,
            onClick: triggerAnimation,
            tabIndex: 0,
            role: 'button' as const,
        }
        : {};

    // Before first hover: show static text
    if (trigger === 'hover' && !hasHovered) {
        return (
            <span {...wrapperProps} className={className} style={{ ...style, cursor: 'pointer' }} data-slot="animated-text">
                {text}
            </span>
        );
    }

    const commonProps = { text, speed, className, style };
    const animKey = trigger === 'hover' ? hoverKey : undefined;

    const content = (() => {
        switch (variant) {
            case 'typewriter':
                return <TypewriterText key={animKey} {...commonProps} />;
            case 'blur-in':
                return <BlurInText key={animKey} {...commonProps} stagger={stagger} splitBy={splitBy} />;
            case 'split-entrance':
                return <SplitEntranceText key={animKey} {...commonProps} stagger={stagger} splitBy={splitBy} />;
            case 'counting-number':
                return <CountingNumberText key={animKey} {...commonProps} />;
            case 'decrypt':
                return <DecryptText key={animKey} {...commonProps} />;
            case 'gradient-sweep':
                return <GradientSweepText key={animKey} {...commonProps} gradientColor1={gradientColor1} gradientColor2={gradientColor2} />;
            case 'shiny-text':
                return <ShinyText key={animKey} {...commonProps} gradientColor1={gradientColor1} gradientColor2={gradientColor2} />;
            default:
                return <span className={className} style={style} data-slot="animated-text">{text}</span>;
        }
    })();

    return <span {...wrapperProps}>{content}</span>;
}
