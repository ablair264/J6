"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// CVA Variants
// ---------------------------------------------------------------------------

const dataTableVariants = cva(
  "w-full caption-bottom border-collapse",
  {
    variants: {
      variant: {
        default: "",
        bordered: "border rounded-md",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const dataTableHeaderVariants = cva(
  "text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
  {
    variants: {
      sortable: {
        true: "cursor-pointer select-none hover:text-foreground transition-colors",
        false: "",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-sm",
      },
    },
    defaultVariants: {
      sortable: false,
      size: "md",
    },
  }
)

const dataTableRowVariants = cva(
  "border-b transition-colors data-[state=selected]:bg-muted",
  {
    variants: {
      striped: {
        true: "",
        false: "hover:bg-muted/50",
      },
    },
    defaultVariants: {
      striped: false,
    },
  }
)

const dataTableCellVariants = cva(
  "align-middle [&:has([role=checkbox])]:pr-0",
  {
    variants: {
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      size: {
        sm: "px-3 py-2",
        md: "p-4",
        lg: "px-5 py-4",
      },
    },
    defaultVariants: {
      align: "left",
      size: "md",
    },
  }
)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortDirection = "asc" | "desc" | null

interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: "left" | "center" | "right"
}

interface DataTableProps
  extends React.ComponentProps<"table">,
    VariantProps<typeof dataTableVariants> {
  columns: DataTableColumn[]
  data: Record<string, string>[]
  sortable?: boolean
  striped?: boolean
  size?: "sm" | "md" | "lg"
  headerBg?: string
  stripedBg?: string
  onSort?: (columnKey: string, direction: SortDirection) => void
}

// ---------------------------------------------------------------------------
// Sort Indicator
// ---------------------------------------------------------------------------

function SortIndicator({ direction }: { direction: SortDirection }) {
  if (direction === "asc") {
    return <ChevronUpIcon className="ml-1 inline-block size-4" />
  }
  if (direction === "desc") {
    return <ChevronDownIcon className="ml-1 inline-block size-4" />
  }
  return (
    <ChevronsUpDownIcon className="ml-1 inline-block size-3.5 opacity-40" />
  )
}

// ---------------------------------------------------------------------------
// DataTable
// ---------------------------------------------------------------------------

function DataTable({
  className,
  columns,
  data,
  sortable = false,
  striped = false,
  size = "md",
  variant,
  headerBg,
  stripedBg,
  onSort,
  ...props
}: DataTableProps) {
  const [sortState, setSortState] = React.useState<{
    key: string | null
    direction: SortDirection
  }>({ key: null, direction: null })

  const handleSort = React.useCallback(
    (columnKey: string) => {
      setSortState((prev) => {
        let next: SortDirection
        if (prev.key !== columnKey) {
          next = "asc"
        } else if (prev.direction === "asc") {
          next = "desc"
        } else {
          next = null
        }
        onSort?.(columnKey, next)
        return { key: next ? columnKey : null, direction: next }
      })
    },
    [onSort]
  )

  const sortedData = React.useMemo(() => {
    if (!sortState.key || !sortState.direction) return data

    const key = sortState.key
    const dir = sortState.direction === "asc" ? 1 : -1

    return [...data].sort((a, b) => {
      const aVal = a[key] ?? ""
      const bVal = b[key] ?? ""
      return aVal.localeCompare(bVal) * dir
    })
  }, [data, sortState])

  return (
    <div className="relative w-full overflow-auto">
      <table
        data-slot="data-table"
        data-variant={variant}
        className={cn(dataTableVariants({ variant, size }), className)}
        {...props}
      >
        <thead
          className={cn("border-b [&_tr]:border-b", !headerBg && "bg-muted/40")}
          style={headerBg ? { backgroundColor: headerBg } : undefined}
        >
          <tr data-slot="data-table-header-row" className="border-b">
            {columns.map((column) => {
              const isColumnSortable =
                sortable && (column.sortable !== false)
              const currentDirection =
                sortState.key === column.key ? sortState.direction : null

              return (
                <DataTableHeader
                  key={column.key}
                  sortable={isColumnSortable}
                  size={size}
                  align={column.align}
                  onClick={
                    isColumnSortable
                      ? () => handleSort(column.key)
                      : undefined
                  }
                  aria-sort={
                    currentDirection === "asc"
                      ? "ascending"
                      : currentDirection === "desc"
                        ? "descending"
                        : "none"
                  }
                >
                  <span className="inline-flex items-center">
                    {column.label}
                    {isColumnSortable && (
                      <SortIndicator direction={currentDirection} />
                    )}
                  </span>
                </DataTableHeader>
              )
            })}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {sortedData.map((row, rowIndex) => (
            <DataTableRow
              key={rowIndex}
              striped={striped}
              style={
                striped && stripedBg && rowIndex % 2 === 1
                  ? { backgroundColor: stripedBg }
                  : undefined
              }
            >
              {columns.map((column) => (
                <DataTableCell key={column.key} align={column.align} size={size}>
                  {row[column.key] ?? ""}
                </DataTableCell>
              ))}
            </DataTableRow>
          ))}
          {sortedData.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Standalone sub-components (exported for custom table composition)
// ---------------------------------------------------------------------------

function DataTableHeader({
  className,
  sortable,
  size,
  align,
  children,
  ...props
}: React.ComponentProps<"th"> &
  VariantProps<typeof dataTableHeaderVariants> & {
    align?: "left" | "center" | "right"
  }) {
  return (
    <th
      data-slot="data-table-header"
      className={cn(
        dataTableHeaderVariants({ sortable, size }),
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

function DataTableRow({
  className,
  striped,
  ...props
}: React.ComponentProps<"tr"> & VariantProps<typeof dataTableRowVariants>) {
  return (
    <tr
      data-slot="data-table-row"
      className={cn(dataTableRowVariants({ striped }), className)}
      {...props}
    />
  )
}

function DataTableCell({
  className,
  align,
  size,
  ...props
}: React.ComponentProps<"td"> & VariantProps<typeof dataTableCellVariants>) {
  return (
    <td
      data-slot="data-table-cell"
      className={cn(dataTableCellVariants({ align, size }), className)}
      {...props}
    />
  )
}

export {
  DataTable,
  DataTableHeader,
  DataTableRow,
  DataTableCell,
  SortIndicator,
  dataTableVariants,
  dataTableHeaderVariants,
  dataTableRowVariants,
  dataTableCellVariants,
}
export type { DataTableProps, DataTableColumn, SortDirection }
