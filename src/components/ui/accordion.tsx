"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { ChevronDownIcon } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"

const accordionVariants = cva("w-full", {
  variants: {
    variant: {
      default: "divide-y divide-border",
      bordered: "divide-y divide-border rounded-md border",
      ghost: "space-y-1",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

type AccordionSingleProps = React.ComponentProps<
  typeof AccordionPrimitive.Root
> & {
  type: "single"
  collapsible?: boolean
} & VariantProps<typeof accordionVariants>

type AccordionMultipleProps = React.ComponentProps<
  typeof AccordionPrimitive.Root
> & {
  type: "multiple"
} & VariantProps<typeof accordionVariants>

type AccordionProps = AccordionSingleProps | AccordionMultipleProps

function Accordion({ className, variant, ...props }: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      data-variant={variant}
      className={cn(accordionVariants({ variant }), className)}
      {...(props as React.ComponentProps<typeof AccordionPrimitive.Root>)}
    />
  )
}

const accordionItemVariants = cva("", {
  variants: {
    variant: {
      default: "",
      bordered: "px-4",
      ghost: "rounded-md border px-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("group/accordion-item", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-center justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
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
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
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
          <div className={cn("pb-4 pt-0 text-sm", className)}>{children}</div>
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
  accordionVariants,
  accordionItemVariants,
}
export type { AccordionProps }
