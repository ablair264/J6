import { Button } from '@/components/ui/button';

const font = "'Inter', system-ui, sans-serif";

/** Dialog trigger — dark styled open button. */
export function DialogTriggerDark() {
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
      Open Dialog
    </Button>
  );
}

/** Dialog trigger — amber primary action. */
export function DialogTriggerAmber() {
  return (
    <Button
      className="rounded-lg border border-solid text-sm font-medium text-center justify-center h-10 px-5"
      style={{
        background: 'linear-gradient(135deg, #f5a623, #e8940c)',
        borderColor: 'rgba(196, 128, 10, 0.4)',
        color: '#1a1a1d',
        fontFamily: font,
      }}
    >
      Confirm Action
    </Button>
  );
}

/** Dialog trigger — destructive rose variant. */
export function DialogTriggerDestructive() {
  return (
    <Button
      className="rounded-lg border border-solid text-sm font-medium text-center justify-center h-10 px-5"
      style={{
        background: '#e11d48',
        borderColor: 'rgba(190, 18, 60, 0.4)',
        color: '#ffffff',
        fontFamily: font,
      }}
    >
      Delete Item
    </Button>
  );
}
