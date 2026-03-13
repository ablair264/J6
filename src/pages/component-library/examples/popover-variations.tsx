import { Button } from '@/components/ui/button';

const font = "'Inter', system-ui, sans-serif";

/** Popover trigger — dark info button. */
export function PopoverTriggerDark() {
  return (
    <Button
      className="rounded-lg border border-solid text-sm font-medium text-center justify-center h-10 px-5"
      style={{
        background: '#1e1e22',
        borderColor: '#303035',
        color: '#e2e8f0',
        fontFamily: font,
      }}
    >
      More Info
    </Button>
  );
}

/** Popover trigger — amber styled. */
export function PopoverTriggerAmber() {
  return (
    <Button
      className="rounded-lg text-sm font-medium text-center justify-center h-10 px-5"
      style={{
        background: 'linear-gradient(135deg, #f5a623, #e8940c)',
        color: '#1a1a1d',
        fontFamily: font,
      }}
    >
      Details
    </Button>
  );
}

/** Popover trigger — violet with grain effect. */
export function PopoverTriggerVioletGrain() {
  return (
    <Button
      className="ui-studio-effect-grain rounded-lg text-sm font-medium text-center justify-center h-10 px-5"
      style={{
        background: '#7c3aed',
        color: '#ffffff',
        fontFamily: font,
        '--ui-effect-grain-opacity': '0.2',
        '--ui-effect-grain-size': '200',
      } as React.CSSProperties}
    >
      Settings
    </Button>
  );
}
