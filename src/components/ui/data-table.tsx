"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// CVA Variants
// ---------------------------------------------------------------------------

const dataTableVariants = cva(
  "w-full caption-bottom text-sm border-collapse",
  {
    variants: {
      variant: {
        default: "",
        bordered: "border rounded-md",
      },
      striped: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      striped: false,
    },
  }
)

const dataTableHeaderVariants = cva(
  "h-10 px-4 text-left align-middle text-sm font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
  {
    variants: {
      sortable: {
        true: "cursor-pointer select-none hover:text-foreground transition-colors",
        false: "",
      },
    },
    defaultVariants: {
      sortable: false,
    },
  }
)

const dataTableRowVariants = cva(
  "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
  {
    variants: {
      striped: {
        true: "even:bg-muted/30",
        false: "",
      },
    },
    defaultVariants: {
      striped: false,
    },
  }
)

const dataTableCellVariants = cva(
  "p-4 align-middle [&:has([role=checkbox])]:pr-0",
  {
    variants: {
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
    },
    defaultVariants: {
      align: "left",
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
  variant,
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
        className={cn(dataTableVariants({ variant, striped }), className)}
        {...props}
      >
        <thead className="border-b bg-muted/40 [&_tr]:border-b">
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
            <DataTableRow key={rowIndex} striped={striped}>
              {columns.map((column) => (
                <DataTableCell key={column.key} align={column.align}>
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
        dataTableHeaderVariants({ sortable }),
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
  ...props
}: React.ComponentProps<"td"> & VariantProps<typeof dataTableCellVariants>) {
  return (
    <td
      data-slot="data-table-cell"
      className={cn(dataTableCellVariants({ align }), className)}
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
