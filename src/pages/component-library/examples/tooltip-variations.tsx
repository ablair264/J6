import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

/** Default tooltip — standard overlay with arrow. */
export function TooltipDefault() {
  const buttonClassName = [
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
  const buttonStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Tooltip>
      <TooltipTrigger className={buttonClassName} style={buttonStyle}>
        Hover me
      </TooltipTrigger>
      <TooltipContent>
        Tooltip content
      </TooltipContent>
    </Tooltip>
  );
}

/** Inverse tooltip — dark foreground on light. */
export function TooltipInverse() {
  const buttonClassName = [
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
  const buttonStyle = {
    color: 'var(--j6-neutral-600-dark)',
    fontFamily: 'Nunito',
  };

  return (
    <Tooltip>
      <TooltipTrigger className={buttonClassName} style={buttonStyle}>
        Hover me
      </TooltipTrigger>
      <TooltipContent inverse>
        Inverse tooltip
      </TooltipContent>
    </Tooltip>
  );
}

/** Tooltip without arrow. */
export function TooltipNoArrow() {
  const buttonClassName = [
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
  const buttonStyle = {
    color: 'var(--j6-neutral-0-light)',
    fontFamily: 'Nunito',
  };

  return (
    <Tooltip>
      <TooltipTrigger className={buttonClassName} style={buttonStyle}>
        No arrow
      </TooltipTrigger>
      <TooltipContent arrow={false}>
        Tooltip without arrow
      </TooltipContent>
    </Tooltip>
  );
}
