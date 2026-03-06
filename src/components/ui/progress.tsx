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

interface ProgressProps
  extends Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "children">,
    VariantProps<typeof progressVariants> {
  showLabel?: boolean
  animateValue?: boolean
  indicatorClassName?: string
  trackColor?: string
  indicatorColor?: string
  labelColor?: string
  circularSize?: number
  circularStrokeWidth?: number
}

function Progress({
  className,
  value,
  max = 100,
  variant = "linear",
  size = "md",
  showLabel = false,
  animateValue = true,
  indicatorClassName,
  trackColor,
  indicatorColor,
  labelColor,
  circularSize,
  circularStrokeWidth,
  style,
  ...props
}: ProgressProps) {
  const percentage = Math.round(((value ?? 0) / max) * 100)

  if (variant === "circular") {
    const cSize = circularSize ?? 48
    const cStroke = circularStrokeWidth ?? 4
    const cRadius = (cSize - cStroke) / 2
    const circumference = 2 * Math.PI * cRadius
    const offset = circumference - (percentage / 100) * circumference

    return (
      <ProgressPrimitive.Root
        data-slot="progress"
        data-variant="circular"
        data-size={size}
        value={value}
        max={max}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={style}
        {...props}
      >
        <svg
          width={cSize}
          height={cSize}
          viewBox={`0 0 ${cSize} ${cSize}`}
          className="-rotate-90"
        >
          <circle
            cx={cSize / 2}
            cy={cSize / 2}
            r={cRadius}
            fill="none"
            strokeWidth={cStroke}
            stroke={trackColor}
            className={cn(!trackColor && "stroke-muted")}
          />
          <circle
            cx={cSize / 2}
            cy={cSize / 2}
            r={cRadius}
            fill="none"
            strokeWidth={cStroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke={indicatorColor}
            className={cn(
              !indicatorColor && "stroke-primary",
              animateValue && "transition-[stroke-dashoffset] duration-500 ease-in-out",
              indicatorClassName
            )}
          />
        </svg>
        {showLabel && (
          <span
            data-slot="progress-label"
            className="absolute"
            style={{ color: labelColor }}
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
      style={style}
      {...props}
    >
      <div
        className={cn(
          "w-full overflow-hidden rounded-full",
          linearTrackSizes[size ?? "md"]
        )}
        style={{ borderRadius: style?.borderRadius, backgroundColor: trackColor }}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            "h-full rounded-full",
            !indicatorColor && "bg-primary",
            animateValue && "transition-[width] duration-500 ease-in-out",
            indicatorClassName
          )}
          style={{ width: `${percentage}%`, borderRadius: style?.borderRadius, backgroundColor: indicatorColor }}
        />
      </div>
      {showLabel && (
        <span
          data-slot="progress-label"
          className="mt-1 block text-right"
          style={{ color: labelColor }}
        >
          {percentage}%
        </span>
      )}
    </ProgressPrimitive.Root>
  )
}

export { Progress, progressVariants }
