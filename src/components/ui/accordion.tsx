"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { ChevronDownIcon } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"

type AccordionSingleProps = React.ComponentProps<
  typeof AccordionPrimitive.Root
> & {
  type: "single"
  collapsible?: boolean
}

type AccordionMultipleProps = React.ComponentProps<
  typeof AccordionPrimitive.Root
> & {
  type: "multiple"
}

type AccordionProps = (AccordionSingleProps | AccordionMultipleProps) & {
  dividerColor?: string
  dividerWeight?: number
  dividerEnabled?: boolean
  paddingH?: number
  paddingW?: number
  spacing?: number
}

function Accordion({
  className,
  style,
  children,
  dividerColor,
  dividerWeight = 1,
  dividerEnabled = true,
  paddingH,
  paddingW,
  spacing = 0,
  ...props
}: AccordionProps) {
  const mergedStyle: React.CSSProperties = {
    ...style,
    ...(dividerColor ? { ['--accordion-divider-color' as string]: dividerColor } : {}),
    ...(dividerWeight !== undefined ? { ['--accordion-divider-weight' as string]: `${dividerWeight}px` } : {}),
    ...(paddingH !== undefined ? { ['--accordion-padding-h' as string]: `${paddingH}px` } : {}),
    ...(paddingW !== undefined ? { ['--accordion-padding-w' as string]: `${paddingW}px` } : {}),
  };

  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      data-divider={dividerEnabled ? "true" : "false"}
      className={cn("w-full", className)}
      style={mergedStyle}
      {...(props as React.ComponentProps<typeof AccordionPrimitive.Root>)}
    >
      {spacing > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing}px` }}>
          {children}
        </div>
      ) : children}
    </AccordionPrimitive.Root>
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "group/accordion-item",
        "border-b border-[var(--accordion-divider-color,var(--border))] [border-width:var(--accordion-divider-weight,1px)] [[data-divider=false]_&]:border-0",
        "last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  triggerStyle,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & { triggerStyle?: React.CSSProperties }) {
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-center justify-between gap-4 rounded-md text-left transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        style={{
          paddingTop: 'var(--accordion-padding-h, 16px)',
          paddingBottom: 'var(--accordion-padding-h, 16px)',
          paddingLeft: 'var(--accordion-padding-w, 16px)',
          paddingRight: 'var(--accordion-padding-w, 16px)',
          ...triggerStyle,
        }}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/accordion-item:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  contentStyle,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content> & { contentStyle?: React.CSSProperties }) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden"
      {...props}
    >
      <AnimatePresence initial={false}>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div
            className={cn("pt-0", className)}
            style={{
              paddingBottom: 'var(--accordion-padding-h, 16px)',
              paddingLeft: 'var(--accordion-padding-w, 16px)',
              paddingRight: 'var(--accordion-padding-w, 16px)',
              ...contentStyle,
            }}
          >
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </AccordionPrimitive.Content>
  )
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
}
export type { AccordionProps }
