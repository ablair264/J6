import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const font = "'Inter', system-ui, sans-serif";

/** Drawer trigger — right slide, dark. */
export function DrawerTriggerRight() {
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
      Open Drawer
    </Button>
  );
}

/** Drawer trigger — amber settings button with icon. */
export function DrawerTriggerSettings() {
  return (
    <Button
      className="rounded-lg border border-solid text-sm font-medium text-center justify-center h-10 px-5 gap-2"
      style={{
        background: 'linear-gradient(135deg, #f5a623, #e8940c)',
        borderColor: 'rgba(196, 128, 10, 0.4)',
        color: '#1a1a1d',
        fontFamily: font,
      }}
    >
      <Settings size={16} />
      Settings
    </Button>
  );
}
