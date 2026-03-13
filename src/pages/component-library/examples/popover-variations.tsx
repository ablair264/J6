import { Button } from '@/components/ui/button';

/** Popover trigger — dark info button. */
export function PopoverTriggerDark() {
  const rootClassName = [
    'bg-[var(--j6-neutral-600-dark)]',
    'border-solid',
    'border',
    'border-[#5a5a64]',
    'rounded-sm',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[29px]',
    'h-[29px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Button className={rootClassName} style={rootStyle}>
      More Info
    </Button>
  );
}

/** Popover trigger — amber styled. */
export function PopoverTriggerAmber() {
  const rootClassName = [
    'bg-[var(--j6-amber-400-light)]',
    'rounded-sm',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[29px]',
    'h-[29px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    color: 'var(--j6-neutral-600-dark)',
    fontFamily: 'Nunito',
  };

  return (
    <Button className={rootClassName} style={rootStyle}>
      Details
    </Button>
  );
}

/** Popover trigger — violet with grain effect. */
export function PopoverTriggerVioletGrain() {
  const rootEffectClassName = 'ui-studio-effect-grain';
  const rootClassName = [
    rootEffectClassName,
    'bg-[var(--j6-violet-500-light)]',
    'rounded-sm',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[29px]',
    'h-[29px]',
    'px-[12px]',
  ].join(' ');
  const rootStyle = {
    color: 'var(--j6-neutral-0-light)',
    fontFamily: 'Nunito',
    '--ui-effect-grain-opacity': '0.2',
    '--ui-effect-grain-size': '200',
  };

  return (
    <Button className={rootClassName} style={rootStyle}>
      Settings
    </Button>
  );
}
