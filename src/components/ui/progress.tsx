import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva("", {
  variants: {
    variant: {
      linear: "",
      circular: "",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: {
    variant: "linear",
    size: "md",
  },
})

const linearTrackSizes = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
} as const

const circularDimensions = {
  sm: { size: 32, strokeWidth: 3, radius: 12, circumference: 2 * Math.PI * 12 },
  md: { size: 48, strokeWidth: 4, radius: 18, circumference: 2 * Math.PI * 18 },
  lg: { size: 64, strokeWidth: 5, radius: 24, circumference: 2 * Math.PI * 24 },
} as const

interface ProgressProps
  extends Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "children">,
    VariantProps<typeof progressVariants> {
  showLabel?: boolean
  indicatorClassName?: string
}

function Progress({
  className,
  value,
  max = 100,
  variant = "linear",
  size = "md",
  showLabel = false,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const percentage = Math.round(((value ?? 0) / max) * 100)

  if (variant === "circular") {
    const dims = circularDimensions[size ?? "md"]
    const offset = dims.circumference - (percentage / 100) * dims.circumference

    return (
      <ProgressPrimitive.Root
        data-slot="progress"
        data-variant="circular"
        data-size={size}
        value={value}
        max={max}
        className={cn("relative inline-flex items-center justify-center", className)}
        {...props}
      >
        <svg
          width={dims.size}
          height={dims.size}
          viewBox={`0 0 ${dims.size} ${dims.size}`}
          className="-rotate-90"
        >
          <circle
            cx={dims.size / 2}
            cy={dims.size / 2}
            r={dims.radius}
            fill="none"
            strokeWidth={dims.strokeWidth}
            className="stroke-muted"
          />
          <circle
            cx={dims.size / 2}
            cy={dims.size / 2}
            r={dims.radius}
            fill="none"
            strokeWidth={dims.strokeWidth}
            strokeDasharray={dims.circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("stroke-primary transition-[stroke-dashoffset] duration-500 ease-in-out", indicatorClassName)}
          />
        </svg>
        {showLabel && (
          <span
            data-slot="progress-label"
            className={cn(
              "absolute font-medium text-foreground",
              {
                "text-[10px]": size === "sm",
                "text-xs": size === "md",
                "text-sm": size === "lg",
              }
            )}
          >
            {percentage}%
          </span>
        )}
      </ProgressPrimitive.Root>
    )
  }

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-variant="linear"
      data-size={size}
      value={value}
      max={max}
      className={cn("relative w-full", className)}
      {...props}
    >
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-muted",
          linearTrackSizes[size ?? "md"]
        )}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            "h-full rounded-full bg-primary transition-[width] duration-500 ease-in-out",
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span
          data-slot="progress-label"
          className={cn(
            "mt-1 block text-right font-medium text-muted-foreground",
            {
              "text-[10px]": size === "sm",
              "text-xs": size === "md",
              "text-sm": size === "lg",
            }
          )}
        >
          {percentage}%
        </span>
      )}
    </ProgressPrimitive.Root>
  )
}

export { Progress, progressVariants }
