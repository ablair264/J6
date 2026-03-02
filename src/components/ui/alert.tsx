import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  InfoIcon,
  CircleCheckIcon,
  TriangleAlertIcon,
  CircleXIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative flex w-full gap-3 rounded-lg border p-4 text-sm [&>svg]:shrink-0 [&>svg]:size-5 [&>svg]:mt-0.5",
  {
    variants: {
      variant: {
        info: "border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100 dark:[&>svg]:text-blue-400",
        success:
          "border-green-200 bg-green-50 text-green-900 [&>svg]:text-green-600 dark:border-green-800 dark:bg-green-950/50 dark:text-green-100 dark:[&>svg]:text-green-400",
        warning:
          "border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-600 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100 dark:[&>svg]:text-amber-400",
        error:
          "border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100 dark:[&>svg]:text-red-400",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const variantIcons = {
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  error: CircleXIcon,
} as const

interface AlertProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof alertVariants> {
  dismissible?: boolean
  onDismiss?: () => void
}

function Alert({
  className,
  variant = "info",
  dismissible = false,
  onDismiss,
  children,
  ...props
}: AlertProps) {
  const [visible, setVisible] = React.useState(true)
  const Icon = variantIcons[variant ?? "info"]

  if (!visible) return null

  return (
    <div
      data-slot="alert"
      data-variant={variant}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon />
      <div data-slot="alert-content" className="flex-1 space-y-1">
        {children}
      </div>
      {dismissible && (
        <button
          data-slot="alert-close"
          type="button"
          onClick={() => {
            setVisible(false)
            onDismiss?.()
          }}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label="Dismiss"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  )
}

function AlertTitle({
  className,
  ...props
}: React.ComponentProps<"h5">) {
  return (
    <h5
      data-slot="alert-title"
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm [&_p]:leading-relaxed opacity-90", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
