import { motion } from 'motion/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const interFont = "'Inter', system-ui, sans-serif";

/** Default tabs — dark with bright amber active indicator. */
export function TabsDefaultDark() {
  return (
    <Tabs
      defaultValue="tab1"
      className="text-sm font-medium"
      style={{ color: '#e2e8f0', fontFamily: interFont }}
    >
      <TabsList variant="default" listBg="#1e1e22">
        <TabsTrigger
          value="tab1"
          activeBg="#f5a623"
          activeTextColor="#0a0a0b"
          inactiveTextColor="#9a9aa3"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="tab2"
          activeBg="#f5a623"
          activeTextColor="#0a0a0b"
          inactiveTextColor="#9a9aa3"
        >
          Features
        </TabsTrigger>
        <TabsTrigger
          value="tab3"
          activeBg="#f5a623"
          activeTextColor="#0a0a0b"
          inactiveTextColor="#9a9aa3"
        >
          Pricing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="pt-4 text-sm" style={{ color: '#c8c4bc' }}>
        A high-level summary of features, metrics, and recent activity across all projects.
      </TabsContent>
      <TabsContent value="tab2" className="pt-4 text-sm" style={{ color: '#c8c4bc' }}>
        Visual preview, motion presets, advanced hover effects, and one-click export.
      </TabsContent>
      <TabsContent value="tab3" className="pt-4 text-sm" style={{ color: '#c8c4bc' }}>
        Free for open-source. Pro plans start at $12/month with premium components.
      </TabsContent>
    </Tabs>
  );
}

/** Line tabs — violet underline indicator. */
export function TabsLineViolet() {
  return (
    <Tabs
      defaultValue="tab1"
      className="text-sm font-medium"
      style={{ color: '#e2e8f0', fontFamily: interFont }}
    >
      <TabsList variant="line">
        <TabsTrigger
          value="tab1"
          indicatorColor="#8b5cf6"
          activeTextColor="#c4b5fd"
          inactiveTextColor="#6b6b72"
        >
          Design
        </TabsTrigger>
        <TabsTrigger
          value="tab2"
          indicatorColor="#8b5cf6"
          activeTextColor="#c4b5fd"
          inactiveTextColor="#6b6b72"
        >
          Motion
        </TabsTrigger>
        <TabsTrigger
          value="tab3"
          indicatorColor="#8b5cf6"
          activeTextColor="#c4b5fd"
          inactiveTextColor="#6b6b72"
        >
          Export
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="pt-4 text-sm" style={{ color: '#c8c4bc' }}>
        Adjust colors, typography, spacing, and border radius with a live visual preview.
      </TabsContent>
      <TabsContent value="tab2" className="pt-4 text-sm" style={{ color: '#c8c4bc' }}>
        Choose from entry presets like blur-fade, slide-scale, and drop-in animations.
      </TabsContent>
      <TabsContent value="tab3" className="pt-4 text-sm" style={{ color: '#c8c4bc' }}>
        Export clean React + Tailwind code, ready to paste into your project.
      </TabsContent>
    </Tabs>
  );
}

/** Pill tabs — rounded emerald pills. */
export function TabsPillEmerald() {
  return (
    <Tabs
      defaultValue="tab1"
      className="text-sm font-medium"
      style={{ color: '#e2e8f0', fontFamily: interFont }}
    >
      <TabsList variant="pill">
        <TabsTrigger
          value="tab1"
          activeBg="#10b981"
          activeTextColor="#ffffff"
          inactiveTextColor="#6b6b72"
        >
          Active
        </TabsTrigger>
        <TabsTrigger
          value="tab2"
          activeBg="#10b981"
          activeTextColor="#ffffff"
          inactiveTextColor="#6b6b72"
        >
          Pending
        </TabsTrigger>
        <TabsTrigger
          value="tab3"
          activeBg="#10b981"
          activeTextColor="#ffffff"
          inactiveTextColor="#6b6b72"
        >
          Archived
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="pt-4 text-sm" style={{ color: '#c8c4bc' }}>
        3 deployments running across production and staging environments.
      </TabsContent>
      <TabsContent value="tab2" className="pt-4 text-sm" style={{ color: '#c8c4bc' }}>
        2 pull requests awaiting review before merging to main.
      </TabsContent>
      <TabsContent value="tab3" className="pt-4 text-sm" style={{ color: '#c8c4bc' }}>
        12 previous releases stored for rollback and audit purposes.
      </TabsContent>
    </Tabs>
  );
}

/** Segment tabs — with blur-fade entry animation. */
export function TabsSegmentEntry() {
  const motionProps = {
    initial: { filter: 'blur(6px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1 },
    transition: { type: 'tween' as const, duration: 0.6, ease: 'easeOut' as const },
  };

  return (
    <motion.div {...motionProps}>
      <Tabs
        defaultValue="tab1"
        className="text-sm font-medium"
        style={{ color: '#e2e8f0', fontFamily: interFont }}
      >
        <TabsList variant="segment">
          <TabsTrigger
            value="tab1"
            activeBg="#0ea5e9"
            activeTextColor="#ffffff"
            inactiveTextColor="#6b6b72"
          >
            Day
          </TabsTrigger>
          <TabsTrigger
            value="tab2"
            activeBg="#0ea5e9"
            activeTextColor="#ffffff"
            inactiveTextColor="#6b6b72"
          >
            Week
          </TabsTrigger>
          <TabsTrigger
            value="tab3"
            activeBg="#0ea5e9"
            activeTextColor="#ffffff"
            inactiveTextColor="#6b6b72"
          >
            Month
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="pt-4 text-sm" style={{ color: '#c8c4bc' }}>
          Hourly breakdown of traffic, conversions, and engagement for today.
        </TabsContent>
        <TabsContent value="tab2" className="pt-4 text-sm" style={{ color: '#c8c4bc' }}>
          Aggregated weekly trends with day-over-day comparisons.
        </TabsContent>
        <TabsContent value="tab3" className="pt-4 text-sm" style={{ color: '#c8c4bc' }}>
          Full monthly report with growth metrics and goal tracking.
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
