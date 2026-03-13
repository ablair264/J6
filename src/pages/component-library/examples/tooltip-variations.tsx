import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const font = "'Inter', system-ui, sans-serif";

/** Default tooltip — standard overlay with arrow. */
export function TooltipDefault() {
  return (
    <Tooltip>
      <TooltipTrigger
        className="rounded-lg border border-solid text-sm font-medium text-center justify-center h-9 px-4"
        style={{
          background: '#1e1e22',
          borderColor: '#303035',
          color: '#e2e8f0',
          fontFamily: font,
        }}
      >
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
  return (
    <Tooltip>
      <TooltipTrigger
        className="rounded-lg text-sm font-medium text-center justify-center h-9 px-4"
        style={{
          background: 'linear-gradient(135deg, #f5a623, #e8940c)',
          color: '#1a1a1d',
          fontFamily: font,
        }}
      >
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
  return (
    <Tooltip>
      <TooltipTrigger
        className="rounded-lg text-sm font-medium text-center justify-center h-9 px-4"
        style={{
          background: '#7c3aed',
          color: '#ffffff',
          fontFamily: font,
        }}
      >
        No arrow
      </TooltipTrigger>
      <TooltipContent arrow={false}>
        Tooltip without arrow
      </TooltipContent>
    </Tooltip>
  );
}
