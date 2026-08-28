"use client"

import * as React from "react"
import { motion } from "motion/react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * The dashboard's table surface.
 *
 * Every screen's table renders through these parts, so the decisions live here
 * rather than in seventeen sets of utility classes. Two of those decisions are
 * worth naming, because the obvious alternatives are what made the old tables
 * read as grey:
 *
 * The header is the card surface, not a filled band. A `bg-muted` strip across
 * the top of every table put a slab of grey between the reader and the data;
 * a single hairline rule separates them just as clearly and costs no colour.
 *
 * The row you are pointing at picks up a trace of the brand blue and a rule
 * down its leading edge, rather than another wash of grey. Hover is the one
 * moment a table can answer back, so it is the one place colour earns its keep.
 */
function Table({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<"table"> & { containerClassName?: string }) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "relative w-full overflow-x-auto overscroll-x-contain",
        // The rows are the subject; the scrollbar should not compete with them.
        "[scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]",
        "[&::-webkit-scrollbar]:h-1.5",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
        containerClassName
      )}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        // Sticky costs nothing in a table that fits — there is no scrollport to
        // stick to — and keeps the column names in view in one that does not.
        "sticky top-0 z-10",
        "[&_tr]:border-0",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-border bg-muted/30 font-medium",
        "[&_tr]:border-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border/60 transition-colors duration-150",
        // Scoped to `tbody`: a header or footer row is not something you hover,
        // select or expand, and scoping it out beats racing the header's own
        // rule on specificity.
        "[tbody_&]:hover:bg-primary/[0.04] dark:[tbody_&]:hover:bg-primary/[0.09]",
        "[tbody_&]:has-aria-expanded:bg-primary/[0.05]",
        "[tbody_&]:data-[state=selected]:bg-primary/[0.07]",
        // The leading-edge rule. It rides on the first cell rather than the row
        // because `border-collapse` swallows a shadow set on a `tr`.
        "[tbody_&]:hover:[&>*:first-child]:shadow-[inset_2px_0_0_0_var(--primary)]",
        "[tbody_&]:data-[state=selected]:[&>*:first-child]:shadow-[inset_2px_0_0_0_var(--primary)]",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-11 px-3 text-left align-middle",
        "text-xs font-semibold tracking-[0.06em] whitespace-nowrap uppercase",
        "text-muted-foreground",
        // Opaque, so body rows scroll under a stuck header instead of through it.
        "bg-card",
        // Shadow-as-border: a real `border-b` is dropped by `border-collapse`
        // once the header is sticky, an inset rule travels with it.
        "shadow-[inset_0_-1px_0_0_var(--border)]",
        "[&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-3 align-middle whitespace-nowrap",
        // Digits line up in columns the way readers expect them to.
        "tabular-nums",
        "transition-shadow duration-150",
        "[&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * `TableRow` with motion props attached, created once at module scope — the
 * staggered row entrances several dashboard tables use need a motion component,
 * and building one inside a render would remount every row on each pass.
 */
const MotionTableRow = motion.create(TableRow)

/**
 * What a table says when it has nothing to show.
 *
 * A row reading "No results." in grey is the cheapest thing a table can do and
 * the least useful: it states the obvious and offers no way out. This gives the
 * reason an icon, a sentence that distinguishes "nothing here yet" from
 * "nothing matches your filters", and room for the action that resolves it.
 */
function TableEmpty({
  colSpan,
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  colSpan: number
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className={cn("h-56 whitespace-normal p-8 text-center", className)}
      >
        <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
          {Icon ? (
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Icon className="size-6" />
            </span>
          ) : null}

          <p className="text-base font-semibold text-foreground">{title}</p>

          {description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}

          {action ? <div className="pt-1">{action}</div> : null}
        </div>
      </TableCell>
    </TableRow>
  )
}

/**
 * Loading rows shaped like the rows they stand in for.
 *
 * The table keeps its columns and its height while the data is in flight, so
 * the surrounding page does not jump when the rows arrive — which a line of
 * "Loading…" text cannot do.
 */
function TableSkeleton({
  rows = 5,
  columns,
  className,
}: {
  rows?: number
  columns: number
  className?: string
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <TableRow key={row} className={className}>
          {Array.from({ length: columns }, (_, column) => (
            <TableCell key={column} className="p-4">
              <Skeleton
                className="h-4 rounded-md"
                // Varied widths read as content rather than as a loading bar.
                style={{ width: column === 0 ? "70%" : column % 3 === 0 ? "45%" : "60%" }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  MotionTableRow,
  TableCell,
  TableCaption,
  TableEmpty,
  TableSkeleton,
}
