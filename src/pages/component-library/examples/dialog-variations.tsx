import { Button } from '@/components/ui/button';

/** Dialog trigger — dark styled open button. */
export function DialogTriggerDark() {
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
    'min-h-[34px]',
    'h-[34px]',
    'px-[14px]',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Button className={rootClassName} style={rootStyle}>
      Open Dialog
    </Button>
  );
}

/** Dialog trigger — amber primary action. */
export function DialogTriggerAmber() {
  const rootClassName = [
    'bg-[var(--j6-amber-400-light)]',
    'border-solid',
    'border',
    'border-[#c4800a]/50',
    'rounded-sm',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[34px]',
    'h-[34px]',
    'px-[14px]',
  ].join(' ');
  const rootStyle = {
    color: 'var(--j6-neutral-600-dark)',
    fontFamily: 'Nunito',
  };

  return (
    <Button className={rootClassName} style={rootStyle}>
      Confirm Action
    </Button>
  );
}

/** Dialog trigger — destructive rose variant. */
export function DialogTriggerDestructive() {
  const rootClassName = [
    'bg-[var(--j6-accent-rose-light)]',
    'rounded-sm',
    'text-xs',
    'font-medium',
    'text-center',
    'justify-center',
    'min-h-[34px]',
    'h-[34px]',
    'px-[14px]',
  ].join(' ');
  const rootStyle = {
    color: 'var(--j6-neutral-0-light)',
    fontFamily: 'Nunito',
  };

  return (
    <Button className={rootClassName} style={rootStyle}>
      Delete Item
    </Button>
  );
}
