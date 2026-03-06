"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const navigationMenuVariants = cva(
  "group relative z-10 flex max-w-max flex-1 items-center justify-center",
  {
    variants: {
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

function NavigationMenu({
  className,
  children,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> &
  VariantProps<typeof navigationMenuVariants>) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(navigationMenuVariants({ orientation }), className)}
      {...props}
    >
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1 group-data-[orientation=vertical]:flex-col group-data-[orientation=vertical]:items-start",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      {...props}
    />
  )
}

const navigationMenuTriggerVariants = cva(
  "group/trigger inline-flex h-9 w-max items-center justify-center gap-1 rounded-md px-4 py-2 outline-none transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default:
          "bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent/50 data-[active]:bg-accent/50",
        ghost:
          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent/50 data-[active]:bg-accent/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function NavigationMenuTrigger({
  className,
  children,
  variant,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger> &
  VariantProps<typeof navigationMenuTriggerVariants>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerVariants({ variant }), className)}
      {...props}
    >
      {children}
      <ChevronDownIcon
        className="relative top-px ml-1 size-3 transition-transform duration-200 group-data-[state=open]/trigger:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 left-0 top-0 w-full md:absolute md:w-auto",
        className
      )}
      {...props}
    />
  )
}

const navigationMenuLinkVariants = cva(
  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      active: {
        true: "bg-accent text-accent-foreground",
        false:
          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

function NavigationMenuLink({
  className,
  active,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link> &
  VariantProps<typeof navigationMenuLinkVariants>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      data-active={active || undefined}
      className={cn(navigationMenuLinkVariants({ active }), className)}
      {...props}
    />
  )
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className={cn("absolute left-0 top-full flex justify-center")}>
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow-md transition-[width,height] duration-300 md:w-[var(--radix-navigation-menu-viewport-width)]",
          className
        )}
        {...props}
      />
    </div>
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] size-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
  NavigationMenuIndicator,
  navigationMenuVariants,
  navigationMenuTriggerVariants,
  navigationMenuLinkVariants,
}
