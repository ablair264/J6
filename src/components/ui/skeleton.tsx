import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const skeletonVariants = cva(
  "animate-pulse bg-muted",
  {
    variants: {
      variant: {
        text: "h-4 w-full rounded-md",
        avatar: "size-10 rounded-full",
        card: "h-32 w-full rounded-xl",
        custom: "rounded-md",
      },
      animationSpeed: {
        slow: "[animation-duration:2.5s]",
        normal: "[animation-duration:1.5s]",
        fast: "[animation-duration:0.75s]",
      },
    },
    defaultVariants: {
      variant: "text",
      animationSpeed: "normal",
    },
  }
)

function Skeleton({
  className,
  variant = "text",
  animationSpeed = "normal",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof skeletonVariants>) {
  return (
    <div
      data-slot="skeleton"
      data-variant={variant}
      className={cn(skeletonVariants({ variant, animationSpeed, className }))}
      {...props}
    />
  )
}

export { Skeleton, skeletonVariants }
