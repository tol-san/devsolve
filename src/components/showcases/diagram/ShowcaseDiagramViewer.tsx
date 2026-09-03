"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Network,
  Image as ImageIcon,
  Layers,
  Sparkles,
  X,
  Eye,
  Loader2,
} from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { nodeTypes } from "./CustomNodes";
import { fetchAndExtractDiagram, type DiagramPayload } from "./pngMetadata";
import { cn } from "@/lib/utils";

interface ShowcaseDiagramViewerProps {
  diagramUrl: string;
  title?: string;
  stepId?: string;
  className?: string;
}

/**
 * Inner React Flow Canvas component that accesses ReactFlow instance hooks
 */
function DiagramFlowCanvas({
  nodes,
  edges,
  showMinimap = true,
  interactive = true,
}: {
  nodes: Node[];
  edges: Edge[];
  showMinimap?: boolean;
  interactive?: boolean;
}) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  return (
    <div className="relative size-full overflow-hidden bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2.5}
        panOnDrag={interactive}
        zoomOnScroll={interactive}
        nodesDraggable={interactive}
        nodesConnectable={false}
        elementsSelectable={interactive}
        className="bg-background"
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: false,
          style: { strokeWidth: 2 },
        }}
      >
        <Background gap={16} size={1.2} className="opacity-35" />

        <Controls
          showInteractive={false}
          className="!border-border !bg-card !shadow-md !rounded-xl overflow-hidden [&>button]:!border-border [&>button]:!bg-card [&>button]:!text-foreground hover:[&>button]:!bg-muted"
        />

        {showMinimap && (
          <MiniMap
            zoomable
            pannable
            className="!border-border !bg-card/90 !shadow-md rounded-xl backdrop-blur-xs"
            nodeColor={(n) => {
              if (n.type === "conceptNode" || n.type === "classNode")
                return "#6366f1";
              if (n.type === "tableNode") return "#10b981";
              if (n.type === "actionNode") return "#06b6d4";
              if (n.type === "eventNode") return "#f59e0b";
              if (n.type === "terminalNode") return "#10b981";
              if (n.type === "serverNode") return "#3b82f6";
              if (n.type === "databaseNode") return "#a855f7";
              return "#64748b";
            }}
          />
        )}
      </ReactFlow>
    </div>
  );
}

export function ShowcaseDiagramViewer({
  diagramUrl,
  title = "Step Diagram",
  stepId,
  className,
}: ShowcaseDiagramViewerProps) {
  const [diagramData, setDiagramData] = useState<DiagramPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"flow" | "image">("flow");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  // Fetch and extract React Flow nodes & edges from diagram PNG or legacy fallbacks
  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchAndExtractDiagram(diagramUrl, stepId)
      .then((payload) => {
        if (!active) return;
        if (payload && payload.nodes && payload.nodes.length > 0) {
          setDiagramData(payload);
          setViewMode("flow");
        } else {
          setDiagramData(null);
          setViewMode("image");
        }
      })
      .catch((err) => {
        if (!active) return;
        console.warn("Failed to load diagram interactive payload:", err);
        setDiagramData(null);
        setViewMode("image");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [diagramUrl, stepId]);

  const hasReactFlow = Boolean(diagramData?.nodes && diagramData.nodes.length > 0);

  // Skeleton loading state matching container shape
  if (loading) {
    return (
      <div
        className={cn(
          "relative h-72 sm:h-96 w-full overflow-hidden rounded-2xl border border-border bg-card/60 p-4 shadow-sm",
          className,
        )}
      >
        <div className="flex size-full animate-pulse flex-col items-center justify-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Loader2 className="size-5 animate-spin" />
          </div>
          <div className="space-y-1.5 text-center">
            <div className="h-4 w-36 rounded-md bg-muted" />
            <div className="h-3 w-48 rounded-md bg-muted/60" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200",
        className,
      )}
    >
      {/* ── Top Header / Control Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card/95 px-3 py-2.5 sm:px-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {hasReactFlow && (
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("flow")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all",
                  viewMode === "flow"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Network className="size-3.5 text-primary" />
                <span>Interactive Flow</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("image")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all",
                  viewMode === "image"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ImageIcon className="size-3.5 text-muted-foreground" />
                <span>Static Image</span>
              </button>
            </div>
          )}

          {hasReactFlow && (
            <span className="hidden items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary sm:inline-flex">
              <Sparkles className="size-3" />
              {diagramData?.nodes.length} Nodes
            </span>
          )}
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-1.5">
          {viewMode === "flow" && hasReactFlow && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowMinimap((prev) => !prev)}
              title={showMinimap ? "Hide MiniMap" : "Show MiniMap"}
              aria-label="Toggle MiniMap"
              className={cn(
                "size-7 rounded-lg text-muted-foreground hover:text-foreground",
                showMinimap && "bg-muted text-foreground",
              )}
            >
              <Layers className="size-3.5" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsFullscreen(true)}
            title="Expand to Fullscreen"
            aria-label="Expand diagram to fullscreen"
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <Maximize2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Main Display Viewport ── */}
      <div className="relative h-72 sm:h-96 lg:h-[420px] w-full overflow-hidden bg-background">
        {viewMode === "flow" && hasReactFlow && diagramData ? (
          <ReactFlowProvider>
            <DiagramFlowCanvas
              nodes={diagramData.nodes}
              edges={diagramData.edges}
              showMinimap={showMinimap}
              interactive={true}
            />
          </ReactFlowProvider>
        ) : (
          /* Static Image View */
          <div className="relative flex size-full items-center justify-center overflow-hidden bg-background p-2">
            {!imageFailed ? (
              <Image
                src={diagramUrl}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 860px"
                className="object-contain"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                <Network className="size-8 opacity-40" />
                <p>Could not preview diagram image</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Fullscreen Interactive Modal ── */}
      <DialogPrimitive.Root open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-[240] bg-black/70 backdrop-blur-xs duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <DialogPrimitive.Popup className="fixed inset-0 z-[250] flex h-screen w-screen flex-col overflow-hidden bg-background p-0 text-foreground outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
            {/* Modal Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Network className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                    {title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Interactive Diagram · Pan, zoom, and inspect architecture nodes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasReactFlow && (
                  <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setViewMode("flow")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all",
                        viewMode === "flow"
                          ? "bg-background text-foreground shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Network className="size-3.5 text-primary" />
                      <span>Flow</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("image")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all",
                        viewMode === "image"
                          ? "bg-background text-foreground shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <ImageIcon className="size-3.5 text-muted-foreground" />
                      <span>Image</span>
                    </button>
                  </div>
                )}

                <DialogPrimitive.Close
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                    />
                  }
                >
                  <X className="size-4.5" />
                  <span className="sr-only">Close diagram preview</span>
                </DialogPrimitive.Close>
              </div>
            </div>

            {/* Modal Canvas Edge-to-Edge */}
            <div className="relative size-full flex-1 overflow-hidden bg-background">
              {viewMode === "flow" && hasReactFlow && diagramData ? (
                <ReactFlowProvider>
                  <DiagramFlowCanvas
                    nodes={diagramData.nodes}
                    edges={diagramData.edges}
                    showMinimap={true}
                    interactive={true}
                  />
                </ReactFlowProvider>
              ) : (
                <div className="relative flex size-full items-center justify-center p-4">
                  <Image
                    src={diagramUrl}
                    alt={title}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
