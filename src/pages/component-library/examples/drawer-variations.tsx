import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

const font = "'Inter', system-ui, sans-serif";

/** Drawer example — right-side project panel. */
export function DrawerTriggerRight() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          className="rounded-lg border border-solid text-sm font-medium text-center justify-center h-10 px-5 bg-[#1e1e22] hover:bg-[#1e1e22] text-[#e2e8f0]"
          style={{
            borderColor: '#303035',
            fontFamily: font,
          }}
        >
          Open Drawer
        </Button>
      </DrawerTrigger>
      <DrawerContent side="right" className="border-l border-white/10 bg-[#141416] text-[#f0ede8]">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold" style={{ fontFamily: font }}>Project details</DrawerTitle>
          <DrawerDescription className="text-[#9a9aa3]" style={{ fontFamily: font }}>
            Quick access to launch settings, teammates, and release notes.
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 px-6 pb-6 text-sm" style={{ fontFamily: font }}>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[#f0ede8]">Current branch</p>
            <p className="mt-1 text-[#9a9aa3]">release/v2.1</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[#f0ede8]">Status</p>
            <p className="mt-1 text-[#34d399]">Ready to ship</p>
          </div>
        </div>
        <DrawerClose className="right-3 top-3 text-[#9a9aa3] hover:bg-white/[0.06]" />
      </DrawerContent>
    </Drawer>
  );
}

/** Drawer example — amber settings panel. */
export function DrawerTriggerSettings() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          className="rounded-lg border border-solid text-sm font-medium text-center justify-center h-10 px-5 gap-2 bg-[#f5a623] hover:bg-[#ffba4a] text-[#1a1a1d]"
          style={{
            borderColor: 'rgba(196, 128, 10, 0.4)',
            fontFamily: font,
          }}
        >
          <Settings size={16} />
          Settings
        </Button>
      </DrawerTrigger>
      <DrawerContent side="left" className="border-r border-[#f5a623]/20 bg-[linear-gradient(180deg,#181313_0%,#120f0f_100%)] text-[#f7efe4]">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold" style={{ fontFamily: font }}>Workspace settings</DrawerTitle>
          <DrawerDescription className="text-[#c6b7a1]" style={{ fontFamily: font }}>
            Tune access, notifications, and brand preferences without leaving the canvas.
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-3 px-6 pb-6 text-sm" style={{ fontFamily: font }}>
          <div className="rounded-xl border border-[#f5a623]/20 bg-[#f5a623]/8 px-4 py-3">
            <p className="text-[#fff2d9]">Brand theme</p>
            <p className="mt-1 text-[#c6b7a1]">Amber editorial</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[#fff2d9]">Approvals</p>
            <p className="mt-1 text-[#c6b7a1]">Require design lead sign-off</p>
          </div>
        </div>
        <DrawerClose className="right-3 top-3 text-[#c6b7a1] hover:bg-white/[0.06]" />
      </DrawerContent>
    </Drawer>
  );
}
