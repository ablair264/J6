import { useEffect, useId, useRef, useState } from 'react';
import { Activity, CalendarDays, MapPin, Users, Video } from 'lucide-react';
import { Area, AreaChart, Line, LineChart } from 'recharts';
import { Card } from '@/components/ui/card';
import { type ChartConfig, ChartContainer } from '@/components/ui/chart';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatValue, type ValueFormat } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Simple user shape for avatar stacks. */
export interface AvatarUser {
  name: string;
  image?: string;
  email?: string;
  role?: string;
}

interface CompactCardBaseProps {
  title?: string;
  accentColor?: string;
  className?: string;
  onClick?: () => void;
}

function compactAccentStyle(accentColor: string): React.CSSProperties {
  return { '--_accent': accentColor } as React.CSSProperties;
}

function AccentBar() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px] transition-[width] duration-300 ease-out group-hover:w-[6px]"
        style={{ backgroundColor: 'var(--_accent)' }}
      />
    </span>
  );
}

/** Simple blur-in text animation to replace BlurInText dependency. */
function BlurInSpan({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <span
      className={cn(
        'transition-all duration-500',
        visible ? 'opacity-100 blur-0' : 'opacity-0 blur-sm',
        className,
      )}
    >
      {text}
    </span>
  );
}

/** Render an avatar stack using the project's Avatar/AvatarGroup components. */
function AvatarStack({
  users,
  maxVisible = 3,
  size = 32,
  className,
}: {
  users: AvatarUser[];
  maxVisible?: number;
  size?: number;
  className?: string;
}) {
  const visible = users.slice(0, maxVisible);
  const overflow = users.length - maxVisible;

  return (
    <AvatarGroup spacing={-8} className={className}>
      {visible.map((user, i) => (
        <Avatar key={i} customSize={size} shape="circle">
          {user.image ? (
            <AvatarImage src={user.image} alt={user.name} />
          ) : (
            <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
              {user.name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      ))}
      {overflow > 0 && (
        <AvatarGroupCount size={size} radius={999}>
          +{overflow}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  );
}

export const COMPACT_CARD_MIN_HEIGHT = 124;

/* ------------------------------------------------------------------ */
/*  LiveActivityCompactCard                                             */
/* ------------------------------------------------------------------ */

export interface LiveActivityCompactCardProps extends CompactCardBaseProps {
  latestUpdate: string;
  updateKey?: string | number;
  activeLabel?: string;
  isLive?: boolean;
  loading?: boolean;
  footerHint?: string;
}

export function LiveActivityCompactCard({
  title = 'Live Activity',
  latestUpdate,
  updateKey,
  activeLabel = 'Live now',
  isLive = true,
  loading = false,
  footerHint,
  accentColor = 'var(--color-chart-1)',
  className,
  onClick,
}: LiveActivityCompactCardProps) {
  if (loading) {
    return (
      <Card
        className={cn(
          'group relative min-h-[124px] p-3.5 pl-5 gap-2 overflow-hidden',
          className,
        )}
        style={compactAccentStyle(accentColor)}
      >
        <AccentBar />
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'group relative min-h-[124px] p-3.5 pl-5 gap-2 overflow-hidden cursor-pointer transition-colors',
        className,
      )}
      style={compactAccentStyle(accentColor)}
      onClick={onClick}
    >
      <AccentBar />
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
          {title}
        </p>
        {isLive ? (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-0.5">
            <span className="relative inline-flex size-2.5 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/40" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.7)]" />
            </span>
            <span className="text-[10px] font-medium text-emerald-300">
              {activeLabel}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2 py-0.5">
            <span className="inline-flex size-2 rounded-full bg-muted-foreground/40" />
            <span className="text-[10px] font-medium text-muted-foreground/60">
              Offline
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0 items-center gap-3 overflow-hidden">
        <Activity size={22} className="shrink-0 text-muted-foreground/50" />
        <BlurInSpan
          key={String(updateKey ?? latestUpdate)}
          text={latestUpdate}
          className="text-[18px] leading-[1.2] font-semibold text-foreground break-words"
        />
      </div>

      {footerHint && (
        <p className="text-[10px] font-medium text-muted-foreground/50">
          {footerHint}
        </p>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  NextEventCompactCard                                                */
/* ------------------------------------------------------------------ */

export interface NextEventCompactCardProps extends CompactCardBaseProps {
  eventName: string;
  eventTime: string;
  status?: string;
  isOnlineMeeting?: boolean;
  location?: string;
  attendees?: AvatarUser[];
  icon?: React.ReactNode;
}

export function NextEventCompactCard({
  title = 'Next Event',
  eventName,
  eventTime,
  status = 'Scheduled',
  isOnlineMeeting = false,
  location,
  attendees = [],
  icon,
  accentColor = 'var(--color-chart-2)',
  className,
  onClick,
}: NextEventCompactCardProps) {
  return (
    <Card
      className={cn(
        'group relative min-h-[124px] p-3.5 pl-5 gap-1.5 overflow-visible cursor-pointer transition-colors',
        className,
      )}
      style={compactAccentStyle(accentColor)}
      onClick={onClick}
    >
      <AccentBar />
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
          {icon ?? <CalendarDays className="h-3 w-3" />}
          {title}
        </div>
        {attendees.length > 0 && (
          <AvatarStack
            users={attendees}
            maxVisible={3}
            size={24}
            className="shrink-0"
          />
        )}
      </div>

      <p className="text-[19px] font-semibold leading-[1.2] text-foreground truncate">
        {eventName}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-xs text-muted-foreground">{eventTime}</p>
        {isOnlineMeeting ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-accent px-2 py-0.5 text-[10px] font-medium text-foreground/90">
            <Video className="h-2.5 w-2.5" />
            Online
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md border border-border/70 bg-accent px-2 py-0.5 text-[10px] font-medium text-foreground/90">
            {status}
          </span>
        )}
      </div>

      {location && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  WhosOnlineCompactCard                                               */
/* ------------------------------------------------------------------ */

export interface WhosOnlineCompactCardProps extends CompactCardBaseProps {
  users: AvatarUser[];
  countLabel?: string;
  icon?: React.ReactNode;
}

const AVATAR_STEP_PX = 24;
const AVATAR_OVERFLOW_RESERVE_PX = 44;
const CARD_PADDING_PX = 28;

export function WhosOnlineCompactCard({
  title = "Who's Online",
  users,
  countLabel,
  icon,
  accentColor = 'var(--color-chart-3)',
  className,
  onClick,
}: WhosOnlineCompactCardProps) {
  const label = countLabel ?? `${users.length} people online`;
  const cardRef = useRef<HTMLDivElement>(null);
  const [maxVisible, setMaxVisible] = useState(6);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const usable = entry.contentRect.width - CARD_PADDING_PX - AVATAR_OVERFLOW_RESERVE_PX;
      setMaxVisible(Math.max(2, Math.floor(usable / AVATAR_STEP_PX)));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Card
      ref={cardRef}
      className={cn(
        'group relative min-h-[124px] p-3.5 pl-5 gap-2 overflow-visible cursor-pointer transition-colors justify-between',
        className,
      )}
      style={compactAccentStyle(accentColor)}
      onClick={onClick}
    >
      <AccentBar />
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
          {icon ?? <Users className="h-3 w-3" />}
          {title}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-0.5">
          <span className="relative inline-flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/40" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[10px] font-medium tabular-nums text-emerald-300">
            {users.length} online
          </span>
        </span>
      </div>

      <AvatarStack
        users={users}
        maxVisible={maxVisible}
        size={32}
        className="w-full"
      />

      <p className="text-[10px] text-muted-foreground leading-4">{label}</p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  SparkStatsCompactCard                                               */
/* ------------------------------------------------------------------ */

export interface CompactSparklinePoint {
  name: string;
  value: number;
}

export interface SparkStatsCompactCardProps extends CompactCardBaseProps {
  value: number | string;
  format?: ValueFormat;
  statLabel?: string;
  data?: CompactSparklinePoint[];
  chartType?: 'area' | 'line';
  icon?: React.ReactNode;
}

export function SparkStatsCompactCard({
  title = 'Performance',
  value,
  format = 'number',
  statLabel = 'vs last period',
  data = [],
  chartType = 'area',
  icon,
  accentColor = 'var(--color-chart-4)',
  className,
  onClick,
}: SparkStatsCompactCardProps) {
  const uid = useId().replace(/:/g, '');
  const gradientId = `compact-spark-${uid}`;
  const chartConfig: ChartConfig = {
    value: { label: title, color: accentColor },
  };

  const formattedValue =
    typeof value === 'string' ? value : formatValue(value, format);

  return (
    <Card
      className={cn(
        'group relative min-h-[124px] p-3.5 pl-5 gap-1.5 overflow-hidden cursor-pointer transition-colors',
        className,
      )}
      style={compactAccentStyle(accentColor)}
      onClick={onClick}
    >
      <AccentBar />
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
          {icon ?? <Activity className="h-3 w-3" />}
          {title}
        </div>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formattedValue}
        </span>
      </div>

      {data.length > 0 && (
        <ChartContainer className="w-full h-12 -mx-1" config={chartConfig}>
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
              <Line
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          ) : (
            <AreaChart data={data} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
              <Area
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                fillOpacity={0.35}
                dot={false}
              />
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          )}
        </ChartContainer>
      )}

      <p className="text-[11px] text-muted-foreground leading-4">{statLabel}</p>
    </Card>
  );
}
