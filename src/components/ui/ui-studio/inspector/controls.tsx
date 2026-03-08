import type { ComponentType, ReactNode } from 'react';
import { Children, isValidElement, useState, useEffect, useMemo, useRef } from 'react';
import { Circle, CircleHalf } from '@mynaui/icons-react';
import { ChevronDown } from 'lucide-react';
import { Switch } from 'radix-ui';
import {
    ColorPicker,
    ColorPickerAlphaSlider,
    ColorPickerArea,
    ColorPickerContent,
    ColorPickerHueSlider,
    ColorPickerInput,
} from '@/components/ui/color-picker';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { normalizeHexColor, SYSTEM_TOKEN_SET } from '@/components/ui/token-sets';
import type { StudioColorToken } from '@/components/ui/token-sets';
import type { FillMode } from '@/components/ui/ui-studio.types';
import { resolveTokenToHex } from '../utilities';

export function InspectorPanel({
    title,
    description,
    defaultOpen = false,
    children,
}: {
    title: string;
    description?: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    return (
        <Collapsible defaultOpen={defaultOpen}>
            <section className="ui-studio-inspector-panel">
                <CollapsibleTrigger className="group/inspector-panel flex w-full items-start justify-between gap-3 text-left">
                    <div className="min-w-0">
                        <p className="ui-studio-heading text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--inspector-text)]">{title}</p>
                        {description ? <p className="mt-1 text-[12px] text-[var(--inspector-muted-text)]">{description}</p> : null}
                    </div>
                    <ChevronDown className="mt-0.5 size-4 shrink-0 text-[var(--inspector-muted-text)] transition-transform group-data-[state=open]/inspector-panel:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden pt-2.5 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down data-[state=closed]:duration-200 data-[state=open]:duration-200">
                    <div className="space-y-2">{children}</div>
                </CollapsibleContent>
            </section>
        </Collapsible>
    );
}

export function InspectorRow({
    label,
    children,
    className,
    labelClassName,
}: {
    label: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    labelClassName?: string;
}) {
    return (
        <div className={cn('ui-studio-inspector-row space-y-1.5', className)}>
            <div className={cn('text-[12px] font-medium text-[var(--inspector-muted-text)]', labelClassName)}>{label}</div>
            <div className="min-w-0">{children}</div>
        </div>
    );
}

export function SegmentedControl<T extends string>({
    value,
    options,
    onChange,
    columns,
}: {
    value: T;
    options: Array<{ label: string; value: T }>;
    onChange: (value: T) => void;
    columns?: number;
}) {
    return (
        <div
            role="radiogroup"
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
        >
            {options.map((option) => (
                <button
                    role="radio"
                    aria-checked={value === option.value}
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={cn(
                        'ui-studio-inspector-focus rounded-md border border-transparent px-2 py-1 text-[12px] font-semibold transition',
                        value === option.value
                            ? 'bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)] shadow-[inset_0_0_0_1px_var(--inspector-border-strong)]'
                            : 'text-[var(--inspector-muted-text)] hover:border-[var(--inspector-border-soft)] hover:text-[var(--inspector-text)]',
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

export function UnitInput({
    value,
    min,
    max,
    step = 1,
    unit,
    onChange,
    className,
    ariaLabel,
    zeroLabel,
}: {
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (value: number) => void;
    className?: string;
    ariaLabel?: string;
    zeroLabel?: string;
}) {
    const scrubStartRef = useRef<{ x: number; value: number } | null>(null);
    const [draftValue, setDraftValue] = useState(() => String(value));
    const precision = useMemo(() => {
        if (Number.isInteger(step)) {
            return 0;
        }
        const decimals = String(step).split('.')[1];
        return decimals ? decimals.length : 2;
    }, [step]);
    const clamp = useMemo(() => (next: number) => Math.max(min, Math.min(max, next)), [min, max]);
    const normalize = useMemo(() => (next: number) => {
        const clamped = clamp(next);
        if (precision === 0) {
            return Math.round(clamped);
        }
        return Number(clamped.toFixed(precision));
    }, [clamp, precision]);

    useEffect(() => {
        setDraftValue(String(value));
    }, [value]);

    const commitDraftValue = (rawValue: string) => {
        const trimmed = rawValue.trim();
        if (trimmed.length === 0 || trimmed === '-' || trimmed === '.' || trimmed === '-.') {
            setDraftValue(String(value));
            return;
        }

        const parsed = Number(trimmed);
        if (!Number.isFinite(parsed)) {
            setDraftValue(String(value));
            return;
        }

        const normalizedValue = normalize(parsed);
        setDraftValue(String(normalizedValue));
        onChange(normalizedValue);
    };

    useEffect(() => {
        const onPointerMove = (event: PointerEvent) => {
            if (!scrubStartRef.current) {
                return;
            }
            const delta = event.clientX - scrubStartRef.current.x;
            const modifier = event.shiftKey ? 0.2 : event.altKey ? 0.5 : event.metaKey || event.ctrlKey ? 2.5 : 1;
            const next = scrubStartRef.current.value + (delta / 4) * step * modifier;
            onChange(normalize(next));
        };

        const onPointerUp = () => {
            scrubStartRef.current = null;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [onChange, normalize, step]);

    return (
        <div className="relative">
            <input
                type="text"
                inputMode={precision === 0 ? 'numeric' : 'decimal'}
                value={draftValue}
                onChange={(event) => {
                    const nextValue = event.currentTarget.value;
                    setDraftValue(nextValue);

                    const trimmed = nextValue.trim();
                    if (trimmed.length === 0 || trimmed === '-' || trimmed === '.' || trimmed === '-.') {
                        return;
                    }

                    const parsed = Number(trimmed);
                    if (!Number.isFinite(parsed)) {
                        return;
                    }

                    onChange(normalize(parsed));
                }}
                onBlur={(event) => commitDraftValue(event.currentTarget.value)}
                onPointerDown={(event) => {
                    if (event.button !== 0) {
                        return;
                    }
                    scrubStartRef.current = { x: event.clientX, value };
                    document.body.style.cursor = 'ew-resize';
                    document.body.style.userSelect = 'none';
                }}
                autoComplete="off"
                aria-label={ariaLabel}
                data-zero={zeroLabel && value === 0 ? 'true' : undefined}
                className={cn(
                    'ui-studio-inspector-input h-6 w-full cursor-ew-resize rounded-sm px-2 text-[12px] font-medium text-[var(--inspector-text)]',
                    unit ? 'pr-9' : '',
                    className,
                )}
            />
            {zeroLabel && value === 0 ? (
                <span className="pointer-events-none absolute inset-0 flex items-center px-2 text-[12px] font-medium text-[var(--inspector-muted-text)]">
                    {zeroLabel}
                </span>
            ) : null}
            {unit ? (
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[var(--inspector-muted-text)]">
                    {unit}
                </span>
            ) : null}
        </div>
    );
}

export function QuickValueChips({
    values,
    unit,
    onSelect,
}: {
    values: number[];
    unit?: string;
    onSelect: (value: number) => void;
}) {
    return (
        <div className="flex flex-wrap items-center gap-1">
            {values.map((chipValue) => (
                <button
                    key={chipValue}
                    type="button"
                    onClick={() => onSelect(chipValue)}
                    className="ui-studio-inspector-focus rounded-md border border-transparent px-1.5 py-1 text-[10px] font-semibold text-[var(--inspector-muted-text)] transition hover:border-[var(--inspector-border-soft)] hover:text-[var(--inspector-text)]"
                >
                    {chipValue}
                    {unit}
                </button>
            ))}
        </div>
    );
}

export function RangeField({
    label,
    min,
    max,
    step,
    unit,
    value,
    onChange,
    showSlider = false,
    quickValues,
}: {
    label: string;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    value: number;
    onChange: (value: number) => void;
    showSlider?: boolean;
    quickValues?: number[];
}) {
    return (
        <div className="space-y-1.5">
            <InspectorRow label={label}>
                <UnitInput value={value} min={min} max={max} step={step} unit={unit} onChange={onChange} ariaLabel={label} />
            </InspectorRow>
            {quickValues && quickValues.length > 0 ? (
                <div>
                    <QuickValueChips values={quickValues} unit={unit} onSelect={onChange} />
                </div>
            ) : null}
            {showSlider ? (
                <input
                    type="range"
                    aria-label={label}
                    min={min}
                    max={max}
                    step={step ?? 1}
                    value={value}
                    onChange={(event) => onChange(Number(event.target.value))}
                    className="ui-studio-range h-1.5 w-full cursor-pointer accent-[var(--inspector-accent)]"
                />
            ) : null}
        </div>
    );
}

export function TokenColorSelect({
    tokens,
    onSelect,
    className,
}: {
    tokens: StudioColorToken[];
    onSelect: (color: string) => void;
    className?: string;
}) {
    return (
        <select
            defaultValue=""
            onChange={(event) => {
                const tokenId = event.target.value;
                if (!tokenId) {
                    return;
                }
                const token = tokens.find((item) => item.id === tokenId);
                if (!token) {
                    return;
                }
                const hex = resolveTokenToHex(token);
                if (hex) {
                    onSelect(hex);
                    event.currentTarget.value = '';
                }
            }}
            className={cn(
                'ui-studio-inspector-input h-6 rounded-sm px-2 text-[10px] text-[var(--inspector-muted-text)]',
                className,
            )}
        >
            <option value="">Token</option>
            {tokens.map((token) => (
                <option key={token.id} value={token.id}>
                    {token.label}
                </option>
            ))}
        </select>
    );
}

export function ColorTokenField({
    label,
    value,
    opacityValue,
    onOpacityChange,
    onChange,
    tokens,
}: {
    label: string;
    value: string;
    opacityValue?: number;
    onOpacityChange?: (value: number) => void;
    onChange: (value: string) => void;
    tokens?: StudioColorToken[];
}) {
    return (
        <div className="space-y-1.5">
            <InspectorRow label={label}>
                <div className="grid grid-cols-[minmax(0,92px)_minmax(0,1fr)_minmax(0,92px)] items-center gap-2">
                    <TokenColorSelect tokens={tokens ?? SYSTEM_TOKEN_SET.tokens} onSelect={onChange} className="w-full" />
                    <input
                        type="text"
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        className="ui-studio-inspector-input h-6 w-full rounded-sm px-2 font-mono text-[12px] text-[var(--inspector-text)]"
                    />
                    {typeof opacityValue === 'number' ? (
                        <UnitInput
                            value={opacityValue}
                            min={0}
                            max={100}
                            unit="%"
                            onChange={(nextValue) => onOpacityChange?.(Math.max(0, Math.min(100, nextValue)))}
                            ariaLabel={`${label} opacity`}
                        />
                    ) : (
                        <span />
                    )}
                </div>
            </InspectorRow>
            <div className="min-w-0">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
                    <input
                        type="color"
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        className="ui-studio-inspector-input h-6 w-10 cursor-pointer rounded-sm p-1"
                        aria-label={`${label} swatch`}
                    />
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export function FlatInspectorSection({
    title,
    icon: Icon,
    defaultOpen = true,
    subtitle,
    children,
}: {
    title: string;
    icon: ComponentType<{ className?: string }>;
    defaultOpen?: boolean;
    subtitle?: ReactNode;
    children: ReactNode;
}) {
    return (
        <Collapsible defaultOpen={defaultOpen}>
            <section className="py-0.5">
                <CollapsibleTrigger className="group/flat-section flex w-full items-center justify-between rounded-md px-2 py-2 text-left transition-colors hover:bg-white/[0.04]">
                    <div className="inline-flex min-w-0 items-center gap-2.5">
                        <Icon className="size-4 shrink-0 text-[var(--inspector-muted-text)]" />
                        <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--inspector-text)]">{title}</p>
                            {subtitle ? <p className="mt-0.5 text-[10px] text-[var(--inspector-muted-text)]">{subtitle}</p> : null}
                        </div>
                    </div>
                    <ChevronDown className="size-4 text-[var(--inspector-muted-text)] transition-transform duration-200 group-data-[state=open]/flat-section:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden px-2 pb-3 pt-1 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down data-[state=closed]:duration-200 data-[state=open]:duration-200">
                    <div className="space-y-3">{children}</div>
                </CollapsibleContent>
            </section>
        </Collapsible>
    );
}

export function FlatElementSubsection({
    title,
    defaultOpen = true,
    subtitle,
    children,
    open,
    onOpenChange,
}: {
    title: string;
    defaultOpen?: boolean;
    subtitle?: ReactNode;
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    return (
        <Collapsible {...(open !== undefined ? { open, onOpenChange } : { defaultOpen })}>
            <div className="space-y-4">
                <CollapsibleTrigger className="group/flat-subsection flex w-full items-center justify-between rounded-md py-0.5 text-left transition-colors hover:bg-white/[0.02]">
                    <div className="min-w-0">
                        <p className="truncate text-[12px] font-bold text-[var(--inspector-text)]">{title}</p>
                        {subtitle ? <p className="mt-0.5 text-[12px] text-[var(--inspector-muted-text)]">{subtitle}</p> : null}
                    </div>
                    <ChevronDown className="size-3.5 text-[var(--inspector-muted-text)] transition-transform duration-200 group-data-[state=open]/flat-subsection:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden pt-1 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down data-[state=closed]:duration-150 data-[state=open]:duration-150">
                    <div className="space-y-2.5">{children}</div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}

export function FlatField({
    label,
    children,
    stacked: _stacked = false,
}: {
    label: ReactNode;
    children: ReactNode;
    stacked?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <span className="block text-[12px] font-medium text-[var(--inspector-muted-text)]">{label}</span>
            <div className="min-w-0 w-full">{children}</div>
        </div>
    );
}

export function FlatUnitField({
    label,
    value,
    min,
    max,
    step = 1,
    unit,
    onChange,
    zeroLabel,
    stacked: _stacked = true,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (value: number) => void;
    zeroLabel?: string;
    stacked?: boolean;
}) {
    const fieldControl = (
        <div className="relative w-full max-w-[90px] min-w-0 shrink-0">
            <UnitInput
                value={value}
                min={min}
                max={max}
                step={step}
                unit={unit}
                onChange={onChange}
                ariaLabel={label}
                zeroLabel={zeroLabel}
                className={cn(
                    'ui-studio-inspector-input h-6 rounded-sm border-[var(--inspector-border-soft)] bg-[#0c121d] pr-7 text-left text-[12px] font-medium [color-scheme:dark]',
                    unit ? 'pr-8' : '',
                )}
            />
        </div>
    );

    return (
        <label className="block space-y-2">
            <span className="text-[12px] font-medium text-[var(--inspector-muted-text)]">{label}</span>
            {fieldControl}
        </label>
    );
}

export function MiniNumberField({
    label,
    value,
    min,
    max,
    step = 1,
    unit,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (value: number) => void;
}) {
    return (
        <FlatField label={label} stacked>
            <UnitInput
                value={value}
                min={min}
                max={max}
                step={step}
                unit={unit}
                onChange={onChange}
                ariaLabel={label}
                className="ui-studio-inspector-input h-6 rounded-sm border-[var(--inspector-border-soft)] bg-[#0c121d] text-right text-[12px] [color-scheme:dark]"
            />
        </FlatField>
    );
}

export function FlatSelect({
    value,
    onValueChange,
    children,
    ariaLabel,
    className,
}: {
    value: string | number;
    onValueChange: (value: string) => void;
    children: ReactNode;
    ariaLabel?: string;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const options = useMemo(
        () =>
            Children.toArray(children).flatMap((child) => {
                if (!isValidElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>(child)) {
                    return [];
                }
                if (child.type !== 'option') {
                    return [];
                }

                const optionValue = child.props.value ?? child.key;
                if (optionValue === null || optionValue === undefined) {
                    return [];
                }

                return [{
                    value: String(optionValue),
                    label: child.props.children,
                    disabled: child.props.disabled === true,
                }];
            }),
        [children],
    );
    const selectedValue = String(value);
    const selectedOption = options.find((option) => option.value === selectedValue);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label={ariaLabel}
                    className={cn(
                        'ui-studio-inspector-input inline-flex h-6 w-full items-center justify-between gap-2 rounded-sm border-[var(--inspector-border-soft)] bg-[#0c121d] px-2 text-[12px] font-bold text-[var(--inspector-text)]',
                        className,
                    )}
                >
                    <span className="min-w-0 truncate text-left">{selectedOption?.label ?? selectedValue}</span>
                    <ChevronDown className="size-3.5 shrink-0 text-[var(--inspector-muted-text)]" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                side="bottom"
                align="end"
                sideOffset={6}
                className="w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-1 text-[var(--inspector-text)]"
            >
                <div role="listbox" aria-label={ariaLabel} className="space-y-0.5">
                    {options.map((option) => {
                        const isSelected = option.value === selectedValue;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                disabled={option.disabled}
                                onClick={() => {
                                    if (option.disabled) {
                                        return;
                                    }
                                    onValueChange(option.value);
                                    setOpen(false);
                                }}
                                className={cn(
                                    'flex w-full items-center rounded-sm px-2 py-1.5 text-left text-[12px] font-medium transition',
                                    option.disabled
                                        ? 'cursor-not-allowed opacity-40'
                                        : isSelected
                                            ? 'bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)]'
                                            : 'text-[var(--inspector-muted-text)] hover:bg-white/[0.04] hover:text-[var(--inspector-text)]',
                                )}
                            >
                                <span className="truncate">{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function FlatSwitchRow({
    label,
    checked,
    onCheckedChange,
}: {
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-[var(--inspector-text)]">{label}</span>
            <Switch.Root
                checked={checked}
                onCheckedChange={onCheckedChange}
                aria-label={label}
                className={cn(
                    'relative h-4 w-7 shrink-0 rounded-full border transition-colors duration-200 outline-none',
                    'focus-visible:ring-2 focus-visible:ring-[color:var(--inspector-accent-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--inspector-bg)]',
                    'border-[var(--inspector-border-soft)] bg-[var(--inspector-input)]',
                    'data-[state=checked]:border-[var(--inspector-border-strong)] data-[state=checked]:bg-[color:var(--inspector-accent-soft)]',
                )}
            >
                <Switch.Thumb
                    className={cn(
                        'block size-3 rounded-full transition-transform duration-200 will-change-transform',
                        'translate-x-[1px] bg-[var(--inspector-muted-text)]',
                        'data-[state=checked]:translate-x-[12px] data-[state=checked]:bg-[var(--inspector-accent)]',
                    )}
                />
            </Switch.Root>
        </div>
    );
}

export function FlatPresetChips({
    items,
    onSelect,
}: {
    items: Array<{ id: string; label: string }>;
    onSelect: (id: string) => void;
}) {
    if (items.length === 0) {
        return null;
    }
    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className="rounded-md border border-[var(--inspector-border-soft)] px-2 py-1 text-[12px] text-[var(--inspector-muted-text)] transition hover:border-[var(--inspector-border-strong)] hover:text-[var(--inspector-text)]"
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}

export function FlatColorControl({
    label,
    value,
    opacity,
    onOpacityChange,
    onChange,
    tokens,
    allowGradient = false,
    mode = 'solid',
    onModeChange,
    secondaryValue,
    onSecondaryChange,
    mix,
    onMixChange,
    stacked = false,
    compact = false,
}: {
    label: string;
    value: string;
    opacity?: number;
    onOpacityChange?: (value: number) => void;
    onChange: (value: string) => void;
    tokens: StudioColorToken[];
    allowGradient?: boolean;
    mode?: FillMode;
    onModeChange?: (mode: FillMode) => void;
    secondaryValue?: string;
    onSecondaryChange?: (value: string) => void;
    mix?: number;
    onMixChange?: (value: number) => void;
    stacked?: boolean;
    compact?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [pickerTab, setPickerTab] = useState<'picker' | 'tokens'>('picker');
    const primaryHex = normalizeHexColor(value) ?? '#000000';
    const gradientHex = normalizeHexColor(secondaryValue ?? '#ffffff') ?? '#ffffff';

    return (
        <div className="space-y-2">
            <FlatField label={label} stacked={stacked}>
                <div className={cn('flex min-w-0 flex-nowrap items-center', compact ? 'gap-1.5' : 'gap-2')}>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    compact
                                        ? 'inline-flex h-6 min-w-[40px] flex-1 items-center justify-center rounded-sm bg-transparent p-0.5 text-left outline-none transition hover:opacity-90 focus-visible:ring-1 focus-visible:ring-[color:var(--inspector-accent-soft)]'
                                        : 'ui-studio-inspector-input inline-flex h-6 min-w-0 flex-1 items-center rounded-sm border-[var(--inspector-border-soft)] bg-[#0c121d] p-0.5 text-left',
                                )}
                            >
                                <span
                                    className={cn(
                                        'h-full w-full rounded-[6px]',
                                        compact ? 'border border-white/10' : 'border border-[var(--inspector-border-soft)]',
                                    )}
                                    style={{
                                        background:
                                            mode === 'gradient' && allowGradient
                                                ? `linear-gradient(135deg, ${primaryHex}, ${gradientHex})`
                                                : primaryHex,
                                    }}
                                />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            side="left"
                            align="start"
                            sideOffset={10}
                            className="w-[320px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-3 text-[var(--inspector-text)]"
                        >
                            <Tabs value={pickerTab} onValueChange={(value) => setPickerTab(value as 'picker' | 'tokens')} className="w-full">
                                <TabsList variant="line" className="w-full border-b border-[var(--inspector-border-soft)] pb-1">
                                    <TabsTrigger value="picker" className="text-xs text-[var(--inspector-muted-text)] data-[state=active]:text-[var(--inspector-text)]">
                                        Picker
                                    </TabsTrigger>
                                    <TabsTrigger value="tokens" className="text-xs text-[var(--inspector-muted-text)] data-[state=active]:text-[var(--inspector-text)]">
                                        Tokens
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="picker" className="space-y-3 pt-2">
                                    {allowGradient ? (
                                        <div className="inline-flex rounded-sm border border-[var(--inspector-border-soft)] bg-[var(--inspector-input)] p-1">
                                            <button
                                                type="button"
                                                onClick={() => onModeChange?.('solid')}
                                                className={cn(
                                                    'inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs transition',
                                                    mode === 'solid'
                                                        ? 'bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)]'
                                                        : 'text-[var(--inspector-muted-text)] hover:text-[var(--inspector-text)]',
                                                )}
                                            >
                                                <Circle className="size-3.5" />
                                                Solid
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onModeChange?.('gradient')}
                                                className={cn(
                                                    'inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs transition',
                                                    mode === 'gradient'
                                                        ? 'bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)]'
                                                        : 'text-[var(--inspector-muted-text)] hover:text-[var(--inspector-text)]',
                                                )}
                                            >
                                                <CircleHalf className="size-3.5" />
                                                Gradient
                                            </button>
                                        </div>
                                    ) : null}

                                    <ColorPicker inline value={primaryHex} onValueChange={(next) => onChange(normalizeHexColor(next) ?? primaryHex)}>
                                        <ColorPickerContent className="w-full !gap-2 !p-0">
                                            <ColorPickerArea className="h-32 w-full rounded-sm border border-white/10" />
                                            <ColorPickerHueSlider className="h-3 w-full rounded-full" />
                                            <ColorPickerAlphaSlider className="h-3 w-full rounded-full" />
                                            <ColorPickerInput className="w-full" />
                                        </ColorPickerContent>
                                    </ColorPicker>

                                    {allowGradient && mode === 'gradient' && onSecondaryChange ? (
                                        <div className="space-y-2 rounded-sm border border-[var(--inspector-border-soft)] bg-[var(--inspector-input)] p-2.5">
                                            <FlatField label="Gradient Color B" stacked>
                                                <ColorPicker inline value={gradientHex} onValueChange={(next) => onSecondaryChange(normalizeHexColor(next) ?? gradientHex)}>
                                                    <ColorPickerContent className="w-full !gap-2 !p-0">
                                                        <ColorPickerArea className="h-24 w-full rounded-sm border border-white/10" />
                                                        <ColorPickerHueSlider className="h-3 w-full rounded-full" />
                                                        <ColorPickerInput className="w-full" />
                                                    </ColorPickerContent>
                                                </ColorPicker>
                                            </FlatField>
                                            {typeof mix === 'number' && onMixChange ? (
                                                <FlatUnitField label="Mix" value={mix} min={0} max={100} unit="%" onChange={onMixChange} />
                                            ) : null}
                                        </div>
                                    ) : null}
                                </TabsContent>
                                <TabsContent value="tokens" className="pt-2">
                                    <div className="max-h-56 space-y-1 overflow-auto pr-1">
                                        {tokens.map((token) => {
                                            const hex = resolveTokenToHex(token) ?? '#000000';
                                            return (
                                                <button
                                                    key={token.id}
                                                    type="button"
                                                    onClick={() => onChange(hex)}
                                                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-[color:var(--inspector-accent-soft)]"
                                                >
                                                    <span className="size-4 rounded-sm border border-[var(--inspector-border-soft)]" style={{ background: hex }} />
                                                    <span className="text-xs text-[var(--inspector-text)]">{token.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </PopoverContent>
                    </Popover>
                    {typeof opacity === 'number' && onOpacityChange ? (
                        <div className={cn('shrink-0', compact ? 'w-[68px]' : 'w-[96px]')}>
                            <UnitInput
                                value={opacity}
                                min={0}
                                max={100}
                                unit="%"
                                onChange={(next) => onOpacityChange(Math.max(0, Math.min(100, next)))}
                                ariaLabel={`${label} opacity`}
                                className={cn(
                                    'ui-studio-inspector-input h-6 rounded-sm border-[var(--inspector-border-soft)] bg-[#0c121d] text-right text-[12px] [color-scheme:dark]',
                                    compact ? 'pr-7' : 'pr-12',
                                )}
                            />
                        </div>
                    ) : null}
                </div>
            </FlatField>
        </div>
    );
}
