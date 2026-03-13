import { Bell, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';

const font = "'Inter', system-ui, sans-serif";

/** Popover example — dark info card. */
export function PopoverTriggerDark() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="rounded-lg border border-solid text-sm font-medium text-center justify-center h-10 px-5 bg-[#1e1e22] hover:bg-[#1e1e22] text-[#e2e8f0]"
          style={{
            borderColor: '#303035',
            fontFamily: font,
          }}
        >
          More Info
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] border-white/10 bg-[#141416] text-[#f0ede8]" sideOffset={10}>
        <PopoverHeader className="gap-2">
          <PopoverTitle className="text-sm font-semibold" style={{ fontFamily: font }}>Release note</PopoverTitle>
          <PopoverDescription className="text-sm text-[#9a9aa3]" style={{ fontFamily: font }}>
            Shared libraries were updated and motion tokens were normalized across buttons and cards.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}

/** Popover example — amber summary with follow-up action. */
export function PopoverTriggerAmber() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="rounded-lg text-sm font-medium text-center justify-center h-10 px-5 bg-[#f5a623] hover:bg-[#ffba4a] text-[#1a1a1d]"
          style={{ fontFamily: font }}
        >
          Details
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] border-[#f5a623]/25 bg-[#1a1510] text-[#f8ecd8]" side="bottom" align="start" sideOffset={10}>
        <PopoverHeader className="gap-2">
          <PopoverTitle className="text-sm font-semibold" style={{ fontFamily: font }}>Migration snapshot</PopoverTitle>
          <PopoverDescription className="text-sm text-[#c8b89a]" style={{ fontFamily: font }}>
            24 components updated, 3 tokens renamed, and no visual regressions detected in the last pass.
          </PopoverDescription>
        </PopoverHeader>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-[#f5a623]/15 bg-[#f5a623]/8 px-3 py-2 text-sm" style={{ fontFamily: font }}>
          <span>Open report</span>
          <ChevronRight size={16} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Popover example — violet utility panel with texture. */
export function PopoverTriggerVioletGrain() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="ui-studio-effect-grain rounded-lg text-sm font-medium text-center justify-center h-10 px-5 bg-[#7c3aed] hover:bg-[#7c3aed] text-white"
          style={{
            fontFamily: font,
            '--ui-effect-grain-opacity': '0.2',
            '--ui-effect-grain-size': '200',
          } as React.CSSProperties}
        >
          Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] border-[#8b5cf6]/25 bg-[#120d1d] text-white" side="right" align="start" sideOffset={12}>
        <PopoverHeader className="gap-2">
          <PopoverTitle className="flex items-center gap-2 text-sm font-semibold" style={{ fontFamily: font }}>
            <Sparkles size={16} />
            Automation
          </PopoverTitle>
          <PopoverDescription className="text-sm text-[#b8a7df]" style={{ fontFamily: font }}>
            Keep approvals on, send daily summaries, and surface only high-signal alerts.
          </PopoverDescription>
        </PopoverHeader>
        <div className="mt-4 space-y-2 text-sm" style={{ fontFamily: font }}>
          <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2">
            <span>Daily digest</span>
            <Bell size={15} className="text-[#c4b5fd]" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2">
            <span>Auto-assign reviews</span>
            <span className="text-[#34d399]">On</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
