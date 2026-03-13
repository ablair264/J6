import { motion } from 'motion/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

/** Default tabs — dark with amber active. */
export function TabsDefaultDark() {
  const rootClassName = [
    'text-sm',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Tabs defaultValue="tab1" className={rootClassName} style={rootStyle}>
      <TabsList variant="default" listBg="#2a2a2e">
        <TabsTrigger value="tab1" activeBg="var(--j6-amber-400-light)" activeTextColor="#1a1a1d" inactiveTextColor="#8a8a94">Overview</TabsTrigger>
        <TabsTrigger value="tab2" activeBg="var(--j6-amber-400-light)" activeTextColor="#1a1a1d" inactiveTextColor="#8a8a94">Features</TabsTrigger>
        <TabsTrigger value="tab3" activeBg="var(--j6-amber-400-light)" activeTextColor="#1a1a1d" inactiveTextColor="#8a8a94">Pricing</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="pt-3 text-xs" style={{ color: '#c8c4bc' }}>Overview content</TabsContent>
      <TabsContent value="tab2" className="pt-3 text-xs" style={{ color: '#c8c4bc' }}>Features content</TabsContent>
      <TabsContent value="tab3" className="pt-3 text-xs" style={{ color: '#c8c4bc' }}>Pricing content</TabsContent>
    </Tabs>
  );
}

/** Line tabs — violet underline indicator. */
export function TabsLineViolet() {
  const rootClassName = [
    'text-sm',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Tabs defaultValue="tab1" className={rootClassName} style={rootStyle}>
      <TabsList variant="line">
        <TabsTrigger value="tab1" indicatorColor="var(--j6-violet-400)" activeTextColor="#c4a8ff" inactiveTextColor="#8a8a94">Design</TabsTrigger>
        <TabsTrigger value="tab2" indicatorColor="var(--j6-violet-400)" activeTextColor="#c4a8ff" inactiveTextColor="#8a8a94">Motion</TabsTrigger>
        <TabsTrigger value="tab3" indicatorColor="var(--j6-violet-400)" activeTextColor="#c4a8ff" inactiveTextColor="#8a8a94">Export</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="pt-3 text-xs" style={{ color: '#c8c4bc' }}>Design tab</TabsContent>
      <TabsContent value="tab2" className="pt-3 text-xs" style={{ color: '#c8c4bc' }}>Motion tab</TabsContent>
      <TabsContent value="tab3" className="pt-3 text-xs" style={{ color: '#c8c4bc' }}>Export tab</TabsContent>
    </Tabs>
  );
}

/** Pill tabs — rounded emerald pills. */
export function TabsPillEmerald() {
  const rootClassName = [
    'text-sm',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  return (
    <Tabs defaultValue="tab1" className={rootClassName} style={rootStyle}>
      <TabsList variant="pill">
        <TabsTrigger value="tab1" activeBg="var(--j6-accent-emerald-light)" activeTextColor="#ffffff" inactiveTextColor="#8a8a94">Active</TabsTrigger>
        <TabsTrigger value="tab2" activeBg="var(--j6-accent-emerald-light)" activeTextColor="#ffffff" inactiveTextColor="#8a8a94">Pending</TabsTrigger>
        <TabsTrigger value="tab3" activeBg="var(--j6-accent-emerald-light)" activeTextColor="#ffffff" inactiveTextColor="#8a8a94">Archived</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="pt-3 text-xs" style={{ color: '#c8c4bc' }}>Active items</TabsContent>
      <TabsContent value="tab2" className="pt-3 text-xs" style={{ color: '#c8c4bc' }}>Pending items</TabsContent>
      <TabsContent value="tab3" className="pt-3 text-xs" style={{ color: '#c8c4bc' }}>Archived items</TabsContent>
    </Tabs>
  );
}

/** Segment tabs — with blur-fade entry animation. */
export function TabsSegmentEntry() {
  const rootClassName = [
    'text-sm',
    'font-medium',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
  };

  const motionProps = {
    initial: { filter: 'blur(4px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1 },
    transition: { type: 'tween' as const, duration: 0.55, ease: 'easeInOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <Tabs defaultValue="tab1" className={rootClassName} style={rootStyle}>
        <TabsList variant="segment">
          <TabsTrigger value="tab1" activeBg="var(--j6-accent-sky-light)" activeTextColor="#ffffff" inactiveTextColor="#8a8a94">Day</TabsTrigger>
          <TabsTrigger value="tab2" activeBg="var(--j6-accent-sky-light)" activeTextColor="#ffffff" inactiveTextColor="#8a8a94">Week</TabsTrigger>
          <TabsTrigger value="tab3" activeBg="var(--j6-accent-sky-light)" activeTextColor="#ffffff" inactiveTextColor="#8a8a94">Month</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="pt-3 text-xs" style={{ color: '#c8c4bc' }}>Daily view</TabsContent>
        <TabsContent value="tab2" className="pt-3 text-xs" style={{ color: '#c8c4bc' }}>Weekly view</TabsContent>
        <TabsContent value="tab3" className="pt-3 text-xs" style={{ color: '#c8c4bc' }}>Monthly view</TabsContent>
      </Tabs>
    </motion.div>
  );
}
