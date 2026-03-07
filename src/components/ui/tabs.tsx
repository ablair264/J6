"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "rounded-md bg-muted p-1 group-data-[orientation=horizontal]/tabs:h-9",
        line: "gap-1 rounded-none bg-transparent p-1 group-data-[orientation=horizontal]/tabs:h-9",
        pill: "gap-1 rounded-none bg-transparent p-0 group-data-[orientation=horizontal]/tabs:h-9",
        segment: "rounded-lg border border-border/50 bg-muted/50 p-1 group-data-[orientation=horizontal]/tabs:h-10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  listBg,
  style,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants> & { listBg?: string }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), listBg && "!bg-transparent", className)}
      style={listBg ? { ...style, backgroundColor: listBg } : style}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  activeBg,
  indicatorColor,
  activeTextColor,
  inactiveTextColor,
  style,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  activeBg?: string;
  indicatorColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
}) {
  const cssVars: Record<string, string> = {};
  if (activeBg) cssVars['--tabs-active-bg'] = activeBg;
  if (indicatorColor) cssVars['--tabs-indicator-color'] = indicatorColor;
  if (activeTextColor) cssVars['--tabs-active-text'] = activeTextColor;
  if (inactiveTextColor) cssVars['--tabs-inactive-text'] = inactiveTextColor;

  const mergedStyle = Object.keys(cssVars).length > 0
    ? { ...style, ...cssVars }
    : style;

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // base
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 border border-transparent px-3 py-1.5 whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // vertical orientation
        "group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start",
        // inactive text color
        inactiveTextColor
          ? "text-[var(--tabs-inactive-text)] hover:text-[var(--tabs-active-text,var(--tabs-inactive-text))]"
          : "text-muted-foreground hover:text-foreground",
        // active text color
        activeTextColor
          ? "data-[state=active]:text-[var(--tabs-active-text)]"
          : "data-[state=active]:text-foreground",

        // ── default variant ──
        "group-data-[variant=default]/tabs-list:rounded-md",
        !activeBg && "group-data-[variant=default]/tabs-list:data-[state=active]:bg-background dark:group-data-[variant=default]/tabs-list:data-[state=active]:bg-input/30 dark:group-data-[variant=default]/tabs-list:data-[state=active]:border-input",
        activeBg && "group-data-[variant=default]/tabs-list:data-[state=active]:bg-[var(--tabs-active-bg)]",
        "group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm",

        // ── line variant ──
        "group-data-[variant=line]/tabs-list:rounded-md group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none",
        // line indicator (::after)
        "after:absolute after:opacity-0 after:transition-opacity",
        "group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5",
        "group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5",
        indicatorColor ? "after:bg-[var(--tabs-indicator-color)]" : "after:bg-foreground",
        "group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",

        // ── pill variant ──
        "group-data-[variant=pill]/tabs-list:rounded-full",
        !activeBg && "group-data-[variant=pill]/tabs-list:data-[state=active]:bg-foreground/10",
        activeBg && "group-data-[variant=pill]/tabs-list:data-[state=active]:bg-[var(--tabs-active-bg)]",

        // ── segment variant ──
        "group-data-[variant=segment]/tabs-list:rounded-md",
        !activeBg && "group-data-[variant=segment]/tabs-list:data-[state=active]:bg-background dark:group-data-[variant=segment]/tabs-list:data-[state=active]:bg-input/50",
        activeBg && "group-data-[variant=segment]/tabs-list:data-[state=active]:bg-[var(--tabs-active-bg)]",
        "group-data-[variant=segment]/tabs-list:data-[state=active]:shadow-sm",

        className
      )}
      style={mergedStyle}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
