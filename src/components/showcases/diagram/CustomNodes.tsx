"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  AppWindow,
  Boxes,
  Brain,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock,
  Cloud,
  Database,
  FileJson,
  FileText,
  GitFork,
  Key,
  Layers,
  Lightbulb,
  Link2,
  Play,
  Radio,
  Server,
  ShieldCheck,
  Square,
  StickyNote,
  Table2,
  User,
  Workflow,
  Zap,
} from "lucide-react";
import type { AppNode, ErdColumn, UmlMember } from "./types";
import { cn } from "@/lib/utils";

const handleStyle =
  "!size-3 !border-2 !border-background !bg-primary transition-all hover:!scale-125 hover:!bg-primary/80";

export const ClientNode = memo(function ClientNode({
  data,
  selected,
}: NodeProps<AppNode>) {
  return (
    <div
      className={cn(
        "group relative min-w-[180px] max-w-[260px] rounded-xl border bg-card p-3.5 text-card-foreground shadow-sm transition-all duration-200",
        selected
          ? "border-primary ring-2 ring-primary/30 shadow-md"
          : "border-border hover:border-border/80 hover:shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="target" position={Position.Left} className={handleStyle} />

      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
          <AppWindow className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-sm font-semibold text-foreground">
              {data.label || "Client UI"}
            </span>
            {data.badge && (
              <span className="shrink-0 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                {data.badge}
              </span>
            )}
          </div>
          {data.subtext && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {data.subtext}
            </p>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
});

export const ServerNode = memo(function ServerNode({
  data,
  selected,
}: NodeProps<AppNode>) {
  return (
    <div
      className={cn(
        "group relative min-w-[180px] max-w-[260px] rounded-xl border bg-card p-3.5 text-card-foreground shadow-sm transition-all duration-200",
        selected
          ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-md"
          : "border-border hover:border-border/80 hover:shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="target" position={Position.Left} className={handleStyle} />

      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <Server className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-sm font-semibold text-foreground">
              {data.label || "Backend API"}
            </span>
            {data.badge && (
              <span className="shrink-0 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                {data.badge}
              </span>
            )}
          </div>
          {data.subtext && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {data.subtext}
            </p>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
});

export const DatabaseNode = memo(function DatabaseNode({
  data,
  selected,
}: NodeProps<AppNode>) {
  return (
    <div
      className={cn(
        "group relative min-w-[180px] max-w-[260px] rounded-xl border bg-card p-3.5 text-card-foreground shadow-sm transition-all duration-200",
        selected
          ? "border-purple-500 ring-2 ring-purple-500/30 shadow-md"
          : "border-border hover:border-border/80 hover:shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="target" position={Position.Left} className={handleStyle} />

      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
          <Database className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-sm font-semibold text-foreground">
              {data.label || "Database"}
            </span>
            {data.badge && (
              <span className="shrink-0 rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                {data.badge}
              </span>
            )}
          </div>
          {data.subtext && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {data.subtext}
            </p>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
});

export const CloudNode = memo(function CloudNode({
  data,
  selected,
}: NodeProps<AppNode>) {
  return (
    <div
      className={cn(
        "group relative min-w-[180px] max-w-[260px] rounded-xl border bg-card p-3.5 text-card-foreground shadow-sm transition-all duration-200",
        selected
          ? "border-amber-500 ring-2 ring-amber-500/30 shadow-md"
          : "border-border hover:border-border/80 hover:shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="target" position={Position.Left} className={handleStyle} />

      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <Cloud className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-sm font-semibold text-foreground">
              {data.label || "Cloud Gateway"}
            </span>
            {data.badge && (
              <span className="shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                {data.badge}
              </span>
            )}
          </div>
          {data.subtext && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {data.subtext}
            </p>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
});

export const DecisionNode = memo(function DecisionNode({
  data,
  selected,
}: NodeProps<AppNode>) {
  return (
    <div
      className={cn(
        "group relative min-w-[160px] max-w-[220px] rounded-xl border bg-card p-3 text-card-foreground shadow-sm transition-all duration-200",
        selected
          ? "border-rose-500 ring-2 ring-rose-500/30 shadow-md"
          : "border-border hover:border-border/80 hover:shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="target" position={Position.Left} className={handleStyle} />

      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
          <GitFork className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="truncate text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            {data.badge || "Condition"}
          </span>
          <p className="text-sm font-semibold text-foreground truncate">
            {data.label || "Valid token?"}
          </p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
});

export const NoteNode = memo(function NoteNode({
  data,
  selected,
}: NodeProps<AppNode>) {
  return (
    <div
      className={cn(
        "group relative min-w-[180px] max-w-[280px] rounded-xl border bg-muted/70 p-3 text-muted-foreground shadow-xs transition-all duration-200 backdrop-blur-xs",
        selected
          ? "border-primary ring-2 ring-primary/30"
          : "border-border/60 hover:border-border",
      )}
    >
      <Handle type="target" position={Position.Top} className={handleStyle} />
      <div className="flex items-start gap-2">
        <StickyNote className="size-4 shrink-0 text-muted-foreground/80 mt-0.5" />
        <div className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-foreground">
            {data.label || "Note"}
          </span>
          {data.subtext && (
            <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
              {data.subtext}
            </p>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className={handleStyle} />
    </div>
  );
});

export const TableNode = memo(function TableNode({
  data,
  selected,
}: NodeProps<AppNode>) {
  const columns = data.columns || [
    { id: "col-1", name: "id", type: "UUID", isPk: true },
    { id: "col-2", name: "created_at", type: "TIMESTAMP" },
  ];

  const colorTheme = data.colorTheme || "emerald";

  const themeColors: Record<
    string,
    { header: string; icon: string; border: string; badge: string }
  > = {
    emerald: {
      header: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-b-emerald-500/20",
      icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/20",
      border: "border-emerald-500/40 ring-emerald-500/30",
      badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    },
    blue: {
      header: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-b-blue-500/20",
      icon: "text-blue-600 dark:text-blue-400 bg-blue-500/20",
      border: "border-blue-500/40 ring-blue-500/30",
      badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    },
    purple: {
      header: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-b-purple-500/20",
      icon: "text-purple-600 dark:text-purple-400 bg-purple-500/20",
      border: "border-purple-500/40 ring-purple-500/30",
      badge: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
    },
    amber: {
      header: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-b-amber-500/20",
      icon: "text-amber-600 dark:text-amber-400 bg-amber-500/20",
      border: "border-amber-500/40 ring-amber-500/30",
      badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    },
    indigo: {
      header: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-b-indigo-500/20",
      icon: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/20",
      border: "border-indigo-500/40 ring-indigo-500/30",
      badge: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
    },
    cyan: {
      header: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-b-cyan-500/20",
      icon: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/20",
      border: "border-cyan-500/40 ring-cyan-500/30",
      badge: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
    },
    rose: {
      header: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-b-rose-500/20",
      icon: "text-rose-600 dark:text-rose-400 bg-rose-500/20",
      border: "border-rose-500/40 ring-rose-500/30",
      badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    },
    slate: {
      header: "bg-muted/70 text-foreground border-b-border",
      icon: "text-foreground bg-muted",
      border: "border-border ring-primary/30",
      badge: "bg-muted text-muted-foreground",
    },
  };

  const theme = themeColors[colorTheme] || themeColors.emerald;

  return (
    <div
      className={cn(
        "group relative min-w-[240px] max-w-[340px] rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-200 overflow-hidden",
        selected
          ? cn("ring-2 shadow-lg", theme.border)
          : "border-border hover:border-border/80 hover:shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className={handleStyle} id="table-top" />
      <Handle type="target" position={Position.Left} className={handleStyle} id="table-left" />

      <div
        className={cn(
          "flex items-center justify-between gap-2.5 px-3.5 py-2.5 border-b",
          theme.header,
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg shadow-xs",
              theme.icon,
            )}
          >
            <Table2 className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-bold tracking-tight text-foreground font-mono">
              {data.tableName || data.label || "table_name"}
            </h4>
            {data.subtext && (
              <p className="truncate text-[10px] text-muted-foreground">
                {data.subtext}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase font-mono",
              theme.badge,
            )}
          >
            {data.badge || `${columns.length} cols`}
          </span>
        </div>
      </div>

      <div className="divide-y divide-border/50 py-1 bg-card/90">
        {columns.map((col) => (
          <div
            key={col.id}
            className="group/row relative flex items-center justify-between gap-2 px-3.5 py-1.5 text-xs transition-colors hover:bg-muted/40"
          >
            <Handle
              type="target"
              position={Position.Left}
              id={`col-left-${col.id}`}
              className="!size-2.5 !-left-1.5 !border !border-background !bg-muted-foreground/60 transition-all hover:!scale-150 hover:!bg-primary"
            />

            <div className="flex items-center gap-2 min-w-0 flex-1">
              {col.isPk ? (
                <span
                  className="flex items-center gap-0.5 rounded bg-amber-500/15 px-1 py-0.2 text-[9px] font-black text-amber-600 dark:text-amber-400 font-mono"
                  title="Primary Key"
                >
                  <Key className="size-2.5" />
                  PK
                </span>
              ) : col.isFk ? (
                <span
                  className="flex items-center gap-0.5 rounded bg-blue-500/15 px-1 py-0.2 text-[9px] font-bold text-blue-600 dark:text-blue-400 font-mono"
                  title="Foreign Key"
                >
                  <Link2 className="size-2.5" />
                  FK
                </span>
              ) : (
                <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0 ml-1" />
              )}

              <span
                className={cn(
                  "truncate font-mono font-medium",
                  col.isPk ? "font-bold text-foreground" : "text-foreground/90",
                )}
              >
                {col.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {col.isNullable && (
                <span className="text-[9px] font-mono text-muted-foreground/70 uppercase">
                  null
                </span>
              )}
              {col.isUnique && (
                <span className="rounded bg-muted px-1 py-0.2 text-[9px] font-mono font-semibold text-muted-foreground">
                  UQ
                </span>
              )}
              <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                {col.type}
              </span>
            </div>

            <Handle
              type="source"
              position={Position.Right}
              id={`col-right-${col.id}`}
              className="!size-2.5 !-right-1.5 !border !border-background !bg-muted-foreground/60 transition-all hover:!scale-150 hover:!bg-primary"
            />
          </div>
        ))}

        {columns.length === 0 && (
          <div className="px-3.5 py-3 text-center text-xs text-muted-foreground italic">
            No columns defined yet
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className={handleStyle} id="table-bottom" />
      <Handle type="source" position={Position.Right} className={handleStyle} id="table-right" />
    </div>
  );
});

export const ConceptNode = memo(function ConceptNode({
  data,
  selected,
}: NodeProps<AppNode>) {
  const colorTheme = data.colorTheme || "indigo";

  return (
    <div
      className={cn(
        "group relative min-w-[200px] max-w-[280px] rounded-2xl border bg-card/95 p-4 text-card-foreground shadow-sm transition-all duration-200 backdrop-blur-xs",
        selected
          ? "border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg"
          : "border-border hover:border-border/80 hover:shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="target" position={Position.Left} className={handleStyle} />

      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
          <Brain className="size-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-sm font-bold text-foreground">
              {data.label || "Concept"}
            </span>
            <span className="shrink-0 rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              {data.badge || "CONCEPT"}
            </span>
          </div>
          {data.subtext && (
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {data.subtext}
            </p>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
});

export const GroupNode = memo(function GroupNode({
  data,
  selected,
}: NodeProps<AppNode>) {
  return (
    <div
      className={cn(
        "group relative min-w-[320px] min-h-[220px] rounded-3xl border-2 bg-muted/20 p-4 text-foreground transition-all duration-200",
        data.borderStyle === "dashed" ? "border-dashed" : "border-solid",
        selected
          ? "border-primary ring-2 ring-primary/20 shadow-md"
          : "border-border/80 hover:border-border",
      )}
    >
      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="target" position={Position.Left} className={handleStyle} />

      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Boxes className="size-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            {data.groupTitle || data.label || "Boundary Context"}
          </span>
        </div>
        {data.badge && (
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {data.badge}
          </span>
        )}
      </div>

      {data.subtext && (
        <p className="text-xs text-muted-foreground italic mb-2">
          {data.subtext}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
});

export const TerminalNode = memo(function TerminalNode({
  data,
  selected,
}: NodeProps<AppNode>) {
  const isStart = data.terminalType === "start" || data.label?.toLowerCase().includes("start");

  return (
    <div
      className={cn(
        "group relative flex items-center justify-center min-w-[140px] rounded-full border-2 px-5 py-2.5 shadow-sm transition-all duration-200",
        isStart
          ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300",
        selected && "ring-2 ring-primary/40 shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="target" position={Position.Left} className={handleStyle} />

      <div className="flex items-center gap-2">
        {isStart ? (
          <Play className="size-3.5 fill-current" />
        ) : (
          <Square className="size-3.5 fill-current" />
        )}
        <span className="text-xs font-bold uppercase tracking-wider">
          {data.label || (isStart ? "Start" : "End")}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
});

export const ActionNode = memo(function ActionNode({
  data,
  selected,
}: NodeProps<AppNode>) {
  return (
    <div
      className={cn(
        "group relative min-w-[190px] max-w-[270px] rounded-xl border bg-card p-3.5 text-card-foreground shadow-sm transition-all duration-200",
        selected
          ? "border-cyan-500 ring-2 ring-cyan-500/30 shadow-md"
          : "border-border hover:border-border/80 hover:shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="target" position={Position.Left} className={handleStyle} />

      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
          <Workflow className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-sm font-semibold text-foreground">
              {data.label || "Process Action"}
            </span>
          </div>
          {data.actor && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <User className="size-3" />
              <span className="truncate">{data.actor}</span>
            </div>
          )}
          {data.subtext && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {data.subtext}
            </p>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
});

export const EventNode = memo(function EventNode({
  data,
  selected,
}: NodeProps<AppNode>) {
  return (
    <div
      className={cn(
        "group relative min-w-[170px] max-w-[240px] rounded-2xl border bg-card p-3 text-card-foreground shadow-sm transition-all duration-200",
        selected
          ? "border-amber-500 ring-2 ring-amber-500/30 shadow-md"
          : "border-border hover:border-border/80 hover:shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="target" position={Position.Left} className={handleStyle} />

      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Zap className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="truncate text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block font-mono">
            {data.triggerType || data.badge || "EVENT"}
          </span>
          <p className="text-xs font-bold text-foreground truncate">
            {data.label || "Event Triggered"}
          </p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
});

export const DataNode = memo(function DataNode({
  data,
  selected,
}: NodeProps<AppNode>) {
  return (
    <div
      className={cn(
        "group relative min-w-[180px] max-w-[250px] rounded-xl border bg-card p-3 text-card-foreground shadow-sm transition-all duration-200",
        selected
          ? "border-blue-500 ring-2 ring-blue-500/30 shadow-md"
          : "border-border hover:border-border/80 hover:shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="target" position={Position.Left} className={handleStyle} />

      <div className="flex items-start gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 mt-0.5">
          <FileText className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold text-foreground truncate">
              {data.label || "Data / Document"}
            </span>
            <span className="rounded bg-blue-500/10 px-1 py-0.2 font-mono text-[9px] font-semibold text-blue-600 dark:text-blue-400">
              {data.badge || "I/O"}
            </span>
          </div>
          {data.subtext && (
            <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-mono">
              {data.subtext}
            </p>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
});

export const ClassNode = memo(function ClassNode({
  data,
  selected,
}: NodeProps<AppNode>) {
  const attributes: UmlMember[] = data.attributes || [
    { id: "a-1", visibility: "+", name: "id", type: "UUID" },
    { id: "a-2", visibility: "-", name: "status", type: "String" },
  ];

  const methods: UmlMember[] = data.methods || [
    { id: "m-1", visibility: "+", name: "execute()", type: "void" },
    { id: "m-2", visibility: "+", name: "getStatus()", type: "String" },
  ];

  return (
    <div
      className={cn(
        "group relative min-w-[220px] max-w-[300px] rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 overflow-hidden font-mono",
        selected
          ? "border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg"
          : "border-border hover:border-border/80 hover:shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="target" position={Position.Left} className={handleStyle} />

      <div className="bg-indigo-500/10 px-3 py-2 border-b border-indigo-500/20 text-center">
        {data.isInterface && (
          <span className="text-[9px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block font-semibold">
            «interface»
          </span>
        )}
        <h4 className="text-xs font-bold text-foreground truncate">
          {data.label || "ClassName"}
        </h4>
      </div>

      <div className="divide-y divide-border/30 px-3 py-1.5 bg-card text-[11px]">
        {attributes.map((attr) => (
          <div key={attr.id} className="py-0.5 flex items-center justify-between gap-1">
            <span className="text-muted-foreground font-bold">
              {attr.visibility || "+"} {attr.name}
            </span>
            {attr.type && (
              <span className="text-[10px] text-muted-foreground/70">
                : {attr.type}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-border/60 divide-y divide-border/30 px-3 py-1.5 bg-card text-[11px]">
        {methods.map((method) => (
          <div key={method.id} className="py-0.5 flex items-center justify-between gap-1">
            <span className="text-foreground font-medium">
              {method.visibility || "+"} {method.name}
            </span>
            {method.type && (
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                : {method.type}
              </span>
            )}
          </div>
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
});

export const nodeTypes = {
  clientNode: ClientNode,
  serverNode: ServerNode,
  databaseNode: DatabaseNode,
  cloudNode: CloudNode,
  decisionNode: DecisionNode,
  noteNode: NoteNode,
  tableNode: TableNode,
  conceptNode: ConceptNode,
  groupNode: GroupNode,
  terminalNode: TerminalNode,
  actionNode: ActionNode,
  eventNode: EventNode,
  dataNode: DataNode,
  classNode: ClassNode,
};

