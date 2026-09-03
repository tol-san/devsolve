"use client";

import React, { useState } from "react";
import { ReactFlowProvider, type Edge } from "@xyflow/react";
import { toPng } from "html-to-image";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  Check,
  Loader2,
  Network,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiagramCanvas } from "./DiagramCanvas";
import type { AppNode } from "./types";
import {
  embedDiagramInPng,
  extractDiagramFromBlobOrFile,
  fetchAndExtractDiagram,
} from "./pngMetadata";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DiagramBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveDiagram: (
    file: File,
    previewUrl: string,
    nodes: AppNode[],
    edges: Edge[],
  ) => void;
  stepTitle?: string;
  initialNodes?: AppNode[];
  initialEdges?: Edge[];
  initialDiagramUrl?: string;
  initialFile?: File;
}

export function DiagramBuilderModal({
  open,
  onOpenChange,
  onSaveDiagram,
  stepTitle,
  initialNodes = [],
  initialEdges = [],
  initialDiagramUrl,
  initialFile,
}: DiagramBuilderModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [currentNodes, setCurrentNodes] = useState<AppNode[]>(initialNodes);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>(initialEdges);

  // Sync state when initialNodes change on open, or extract from existing file/URL
  React.useEffect(() => {
    if (open) {
      if (initialNodes && initialNodes.length > 0) {
        setCurrentNodes(initialNodes);
        setCurrentEdges(initialEdges ?? []);
      } else if (initialFile) {
        extractDiagramFromBlobOrFile(initialFile).then((extracted) => {
          if (extracted?.nodes?.length) {
            setCurrentNodes(extracted.nodes);
            setCurrentEdges(extracted.edges ?? []);
          } else {
            setCurrentNodes([]);
            setCurrentEdges([]);
          }
        });
      } else if (initialDiagramUrl) {
        fetchAndExtractDiagram(initialDiagramUrl).then((extracted) => {
          if (extracted?.nodes?.length) {
            setCurrentNodes(extracted.nodes);
            setCurrentEdges(extracted.edges ?? []);
          } else {
            setCurrentNodes([]);
            setCurrentEdges([]);
          }
        });
      } else {
        setCurrentNodes(initialNodes ?? []);
        setCurrentEdges(initialEdges ?? []);
      }
    }
  }, [open, initialNodes, initialEdges, initialDiagramUrl, initialFile]);

  const handleExportAndAttach = async () => {
    try {
      setIsExporting(true);
      const viewportEl = document.querySelector(
        "#react-flow-diagram-viewport .react-flow__viewport",
      ) as HTMLElement | null;

      const containerEl = document.querySelector(
        "#react-flow-diagram-viewport",
      ) as HTMLElement | null;

      const targetEl = containerEl || viewportEl;

      if (!targetEl) {
        toast.error("Could not capture diagram canvas");
        setIsExporting(false);
        return;
      }

      // Determine canvas background style dynamically from theme
      const isDark = document.documentElement.classList.contains("dark");
      const exportBgColor = isDark ? "#0b0f17" : "#ffffff";

      // Hide controls/minimap temporarily or style properly if capturing container
      // skipFonts: true prevents html-to-image from crawling Monaco Editor/external stylesheets
      const dataUrl = await toPng(targetEl, {
        backgroundColor: exportBgColor,
        quality: 0.95,
        pixelRatio: 2,
        skipFonts: true,
        fontEmbedCSS: "",
        cacheBust: false,
        filter: (node) => {
          // exclude control buttons and minimap from the exported image
          const exclusionClasses = [
            "react-flow__controls",
            "react-flow__minimap",
          ];
          return !exclusionClasses.some((cls) =>
            (node as HTMLElement)?.classList?.contains(cls),
          );
        },
      });

      // Direct synchronous dataURL -> File converter (avoids fetch blob parsing issues)
      const filename = `diagram-${Date.now()}.png`;
      const arr = dataUrl.split(",");
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "image/png";
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      // Embed React Flow graph metadata into standard PNG tEXt chunk
      let finalPngBytes: Uint8Array = u8arr;
      try {
        finalPngBytes = embedDiagramInPng(u8arr, {
          nodes: currentNodes,
          edges: currentEdges,
        });
      } catch (embedErr) {
        console.warn("Could not embed diagram metadata into PNG:", embedErr);
      }

      const file = new File([finalPngBytes as unknown as BlobPart], filename, {
        type: mime,
      });

      onSaveDiagram(file, dataUrl, currentNodes, currentEdges);
      toast.success("Diagram attached to step!");
      onOpenChange(false);
    } catch (err) {
      console.error("Diagram export error:", err);
      toast.error("Failed to generate diagram image");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Full screen backdrop */}
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-[240] bg-black/60 backdrop-blur-xs duration-150",
            "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          )}
        />

        {/* Full screen page container (above navbar z-[100]) */}
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-0 z-[250] flex h-screen w-screen flex-col overflow-hidden bg-background p-0 text-foreground outline-none duration-150",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.99] data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.99]",
          )}
        >
          {/* ── Top Full-Width Header Bar ── */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Network className="size-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                  Diagram & ERD Builder
                </h2>
                <p className="text-xs text-muted-foreground">
                  {stepTitle
                    ? `Step: "${stepTitle}" · Draw architecture flows and ERD database tables`
                    : "Design database schemas (ERD) or architecture flows and attach directly"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-9 rounded-xl border-border bg-background px-4 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Cancel
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={isExporting}
                onClick={handleExportAndAttach}
                className="h-9 gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    Attach to Step
                  </>
                )}
              </Button>

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
                <span className="sr-only">Close diagram builder</span>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* ── Edge-to-Edge Canvas ── */}
          <div className="relative flex-1 w-full h-full min-h-0 overflow-hidden bg-background">
            <ReactFlowProvider>
              <DiagramCanvas
                key={open ? "open" : "closed"}
                initialNodes={initialNodes}
                initialEdges={initialEdges}
                onStateChange={(nodes, edges) => {
                  setCurrentNodes(nodes);
                  setCurrentEdges(edges);
                }}
              />
            </ReactFlowProvider>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
