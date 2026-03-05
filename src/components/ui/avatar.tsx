import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  shape?: "circle" | "rounded"
  size?: "sm" | "md" | "lg"
  badge?: boolean
  badgeColor?: string
  customSize?: number
  radius?: number
  bgColor?: string
  bgGradientTo?: string
  bgMode?: "solid" | "gradient"
  bgOpacity?: number
  strokeWeight?: number
  strokeColor?: string
  strokeOpacity?: number
}

function Avatar({
  className,
  shape = "circle",
  size = "md",
  badge = false,
  badgeColor = "bg-green-500",
  customSize,
  radius,
  bgColor,
  bgGradientTo,
  bgMode = "solid",
  bgOpacity,
  strokeWeight,
  strokeColor,
  strokeOpacity,
  children,
  style,
  ...props
}: AvatarProps) {
  const resolvedSize = customSize ?? (size === "sm" ? 32 : size === "lg" ? 56 : 40)
  const resolvedRadius = radius ?? (shape === "circle" ? 999 : 8)

  const bgAlpha = bgOpacity !== undefined ? bgOpacity / 100 : 1
  const background = bgColor
    ? bgMode === "gradient" && bgGradientTo
      ? `linear-gradient(135deg, ${hexToRgba(bgColor, bgAlpha)} 0%, ${hexToRgba(bgGradientTo, bgAlpha)} 100%)`
      : hexToRgba(bgColor, bgAlpha)
    : undefined

  const borderStyle: React.CSSProperties = strokeWeight && strokeWeight > 0
    ? {
        borderWidth: strokeWeight,
        borderStyle: "solid",
        borderColor: strokeColor
          ? hexToRgba(strokeColor, strokeOpacity !== undefined ? strokeOpacity / 100 : 1)
          : undefined,
      }
    : {}

  const mergedStyle: React.CSSProperties = {
    width: resolvedSize,
    height: resolvedSize,
    borderRadius: resolvedRadius,
    ...(background ? { background } : {}),
    ...borderStyle,
    ...style,
  }

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-shape={shape}
      data-size={size}
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={mergedStyle}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: "inherit" }}>
        {children}
      </div>
      {badge && (
        <span
          data-slot="avatar-badge"
          className={cn(
            "absolute bottom-0 right-0 z-10 block rounded-full ring-2 ring-background",
            typeof badgeColor === "string" && badgeColor.startsWith("#") ? "" : badgeColor,
          )}
          style={{
            width: resolvedSize * 0.2,
            height: resolvedSize * 0.2,
            ...(typeof badgeColor === "string" && badgeColor.startsWith("#") ? { backgroundColor: badgeColor } : {}),
          }}
        />
      )}
    </AvatarPrimitive.Root>
  )
}

function AvatarImage({
  className,
  style,
  imageOpacity,
  overlayColor,
  overlayOpacity,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image> & {
  imageOpacity?: number
  overlayColor?: string
  overlayOpacity?: number
}) {
  const hasOverlay = overlayColor && overlayOpacity && overlayOpacity > 0

  return (
    <>
      <AvatarPrimitive.Image
        data-slot="avatar-image"
        className={cn("aspect-square size-full object-cover", className)}
        style={{
          ...style,
          ...(imageOpacity !== undefined && imageOpacity < 100 ? { opacity: imageOpacity / 100 } : {}),
        }}
        {...props}
      />
      {hasOverlay && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: hexToRgba(overlayColor, overlayOpacity / 100),
            borderRadius: "inherit",
          }}
        />
      )}
    </>
  )
}

function AvatarFallback({
  className,
  style,
  fontFamily,
  fontSize,
  fontColor,
  fontBold,
  fontItalic,
  fontUnderline,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> & {
  fontFamily?: string
  fontSize?: number
  fontColor?: string
  fontBold?: boolean
  fontItalic?: boolean
  fontUnderline?: boolean
}) {
  const typoStyle: React.CSSProperties = {
    ...(fontFamily ? { fontFamily } : {}),
    ...(fontSize ? { fontSize } : {}),
    ...(fontColor ? { color: fontColor } : {}),
    ...(fontBold ? { fontWeight: 700 } : {}),
    ...(fontItalic ? { fontStyle: "italic" } : {}),
    ...(fontUnderline ? { textDecoration: "underline" } : {}),
    ...style,
  }

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center font-medium select-none",
        className
      )}
      style={typoStyle}
      {...props}
    />
  )
}

function AvatarGroup({
  className,
  spacing = -8,
  style,
  ...props
}: React.ComponentProps<"div"> & { spacing?: number }) {
  return (
    <div
      data-slot="avatar-group"
      className={cn("flex items-center [&>*+*]:ml-[var(--avatar-group-spacing)]", className)}
      style={{
        "--avatar-group-spacing": `${spacing}px`,
        ...style,
      } as React.CSSProperties}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  size = 40,
  radius = 999,
  bgColor,
  fontColor,
  fontSize,
  ...props
}: React.ComponentProps<"div"> & {
  size?: number
  radius?: number
  bgColor?: string
  fontColor?: string
  fontSize?: number
}) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex shrink-0 items-center justify-center font-medium ring-2 ring-background select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bgColor || "var(--muted)",
        color: fontColor || "var(--muted-foreground)",
        fontSize: fontSize || size * 0.35,
      }}
      {...props}
    />
  )
}

// Utility — inline hex→rgba
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "")
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex
  return `rgba(${r},${g},${b},${alpha})`
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount }
