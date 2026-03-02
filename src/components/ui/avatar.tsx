import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-muted",
  {
    variants: {
      shape: {
        circle: "rounded-full",
        rounded: "rounded-lg",
      },
      size: {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-14 text-base",
      },
    },
    defaultVariants: {
      shape: "circle",
      size: "md",
    },
  }
)

interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  badge?: boolean
  badgeColor?: string
}

function Avatar({
  className,
  shape = "circle",
  size = "md",
  badge = false,
  badgeColor = "bg-green-500",
  children,
  ...props
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-shape={shape}
      data-size={size}
      className={cn("relative inline-flex shrink-0", className)}
      {...props}
    >
      <span className={cn(avatarVariants({ shape, size }))}>
        {children}
      </span>
      {badge && (
        <span
          data-slot="avatar-badge"
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-background",
            badgeColor,
            {
              "size-2": size === "sm",
              "size-2.5": size === "md",
              "size-3.5": size === "lg",
            }
          )}
        />
      )}
    </AvatarPrimitive.Root>
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center bg-muted font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants }
