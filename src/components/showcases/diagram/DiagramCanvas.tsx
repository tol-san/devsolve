"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Edge,
  type OnConnect,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  AppWindow,
  Boxes,
  Brain,
  CircleDot,
  Cloud,
  Database,
  FileText,
  GitFork,
  Key,
  Layers,
  Link2,
  Maximize2,
  Play,
  Plus,
  RotateCcw,
  Server,
  Sparkles,
  Square,
  StickyNote,
  Table2,
  Trash2,
  User,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { nodeTypes } from "./CustomNodes";
import { DIAGRAM_TEMPLATES } from "./templates";
import type { AppNode, CustomNodeType, DiagramCategory, ErdColumn, UmlMember } from "./types";
import { cn } from "@/lib/utils";

const SQL_DATA_TYPES = [
  "UUID",
  "VARCHAR(255)",
  "BIGINT",
  "INTEGER",
  "BOOLEAN",
  "TIMESTAMP",
  "TEXT",
  "JSONB",
  "NUMERIC(10,2)",
  "DATE",
];

const UML_VISIBILITY = ["+", "-", "#", "~"] as const;

const COLOR_THEMES: Array<{
  id: "emerald" | "blue" | "purple" | "amber" | "indigo" | "cyan" | "rose" | "slate";
  label: string;
  bgClass: string;
}> = [
  { id: "indigo", label: "Indigo", bgClass: "bg-indigo-500" },
  { id: "emerald", label: "Emerald", bgClass: "bg-emerald-500" },
  { id: "blue", label: "Blue", bgClass: "bg-blue-500" },
  { id: "purple", label: "Purple", bgClass: "bg-purple-500" },
  { id: "amber", label: "Amber", bgClass: "bg-amber-500" },
  { id: "cyan", label: "Cyan", bgClass: "bg-cyan-500" },
  { id: "rose", label: "Rose", bgClass: "bg-rose-500" },
  { id: "slate", label: "Slate", bgClass: "bg-slate-500" },
];

interface DiagramCanvasProps {
  initialNodes?: AppNode[];
  initialEdges?: Edge[];
  onStateChange?: (nodes: AppNode[], edges: Edge[]) => void;
}

export function DiagramCanvas({
  initialNodes = [],
  initialEdges = [],
  onStateChange,
}: DiagramCanvasProps) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<DiagramCategory>("all");

  useEffect(() => {
    onStateChange?.(nodes, edges);
  }, [nodes, edges, onStateChange]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId],
  );

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        animated: false,
        type: "smoothstep",
        label: "",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges],
  );

  const addNode = (type: CustomNodeType) => {
    const id = `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const defaultConfigs: Record<
      CustomNodeType,
      Partial<AppNode["data"]> & { label: string }
    > = {
      clientNode: {
        label: "Client App",
        subtext: "Web or Mobile Client",
        badge: "Frontend",
      },
      serverNode: {
        label: "API Service",
        subtext: "Handles requests & logic",
        badge: "Backend",
      },
      databaseNode: {
        label: "Database",
        subtext: "Stores application state",
        badge: "Database",
      },
      cloudNode: {
        label: "Cloud Gateway",
        subtext: "Routing & Infrastructure",
        badge: "Cloud",
      },
      decisionNode: {
        label: "Condition?",
        subtext: "",
        badge: "Check",
      },
      noteNode: {
        label: "Step Note",
        subtext: "Key implementation details",
        badge: "Note",
      },
      tableNode: {
        label: "new_table",
        tableName: "new_table",
        subtext: "Database table entity",
        badge: "TABLE",
        colorTheme: "emerald",
        columns: [
          { id: `col-${Date.now()}-1`, name: "id", type: "UUID", isPk: true },
          { id: `col-${Date.now()}-2`, name: "created_at", type: "TIMESTAMP" },
        ],
      },
      conceptNode: {
        label: "Core Domain Concept",
        subtext: "Domain model representing key business rules",
        badge: "AGGREGATE ROOT",
        colorTheme: "indigo",
      },
      groupNode: {
        label: "Bounded Context",
        groupTitle: "Bounded Context Boundary",
        subtext: "Subsystem domain boundary",
        badge: "DOMAIN",
        borderStyle: "dashed",
      },
      terminalNode: {
        label: "Start Process",
        terminalType: "start",
      },
      actionNode: {
        label: "Execute Workflow Step",
        actor: "Service Worker",
        subtext: "Perform business logic transaction",
      },
      eventNode: {
        label: "Webhook Event Trigger",
        triggerType: "webhook",
        badge: "EVENT",
      },
      dataNode: {
        label: "Payload Document",
        subtext: "application/json response",
        badge: "I/O",
      },
      classNode: {
        label: "UserEntity",
        attributes: [
          { id: "a1", visibility: "-", name: "id", type: "UUID" },
          { id: "a2", visibility: "+", name: "status", type: "String" },
        ],
        methods: [
          { id: "m1", visibility: "+", name: "save()", type: "void" },
          { id: "m2", visibility: "+", name: "getId()", type: "UUID" },
        ],
      },
    };

    const config = defaultConfigs[type];
    const newNode: AppNode = {
      id,
      type,
      position: {
        x: 240 + Math.random() * 60,
        y: 160 + Math.random() * 60,
      },
      data: config as AppNode["data"],
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(id);
    setSelectedEdgeId(null);
  };

  const updateSelectedNode = (key: string, value: unknown) => {
    if (!selectedNodeId) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          const updatedData = {
            ...node.data,
            [key]: value,
          };
          if (key === "tableName" && typeof value === "string") {
            updatedData.label = value;
          }
          if (key === "groupTitle" && typeof value === "string") {
            updatedData.label = value;
          }
          return {
            ...node,
            data: updatedData,
          };
        }
        return node;
      }),
    );
  };

  const updateColumn = (colId: string, patch: Partial<ErdColumn>) => {
    if (!selectedNodeId) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          const cols = node.data.columns || [];
          return {
            ...node,
            data: {
              ...node.data,
              columns: cols.map((col) => (col.id === colId ? { ...col, ...patch } : col)),
            },
          };
        }
        return node;
      }),
    );
  };

  const addColumn = () => {
    if (!selectedNodeId) return;
    const newCol: ErdColumn = {
      id: `col-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      name: "new_field",
      type: "VARCHAR(255)",
    };
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          const cols = node.data.columns || [];
          return { ...node, data: { ...node.data, columns: [...cols, newCol] } };
        }
        return node;
      }),
    );
  };

  const removeColumn = (colId: string) => {
    if (!selectedNodeId) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          const cols = node.data.columns || [];
          return { ...node, data: { ...node.data, columns: cols.filter((c) => c.id !== colId) } };
        }
        return node;
      }),
    );
  };

  const addUmlMember = (kind: "attributes" | "methods") => {
    if (!selectedNodeId) return;
    const newMember: UmlMember = {
      id: `${kind[0]}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      visibility: "+",
      name: kind === "attributes" ? "newField" : "newMethod()",
      type: kind === "attributes" ? "String" : "void",
    };
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          const list = (node.data[kind] as UmlMember[]) || [];
          return { ...node, data: { ...node.data, [kind]: [...list, newMember] } };
        }
        return node;
      }),
    );
  };

  const updateUmlMember = (
    kind: "attributes" | "methods",
    memberId: string,
    patch: Partial<UmlMember>,
  ) => {
    if (!selectedNodeId) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          const list = (node.data[kind] as UmlMember[]) || [];
          return {
            ...node,
            data: {
              ...node.data,
              [kind]: list.map((m) => (m.id === memberId ? { ...m, ...patch } : m)),
            },
          };
        }
        return node;
      }),
    );
  };

  const removeUmlMember = (kind: "attributes" | "methods", memberId: string) => {
    if (!selectedNodeId) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          const list = (node.data[kind] as UmlMember[]) || [];
          return {
            ...node,
            data: {
              ...node.data,
              [kind]: list.filter((m) => m.id !== memberId),
            },
          };
        }
        return node;
      }),
    );
  };

  const updateSelectedEdge = (patch: Partial<Edge>) => {
    if (!selectedEdgeId) return;
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === selectedEdgeId) {
          return { ...edge, ...patch };
        }
        return edge;
      }),
    );
  };

  const deleteSelected = () => {
    if (selectedNodeId) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== selectedNodeId && e.target !== selectedNodeId,
        ),
      );
      setSelectedNodeId(null);
    } else if (selectedEdgeId) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
      setSelectedEdgeId(null);
    }
  };

  const applyTemplate = (templateId: string | null) => {
    if (!templateId) return;
    if (templateId === "blank") {
      clearCanvas();
      return;
    }
    const tpl = DIAGRAM_TEMPLATES.find((t) => t.id === templateId);
    if (tpl) {
      setNodes(tpl.nodes);
      setEdges(tpl.edges);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setTimeout(() => {
        fitView({ padding: 0.25, duration: 300 });
      }, 50);
    }
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background">
      <div className="flex flex-col gap-2 border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Mode:
            </span>
            {(
              [
                { id: "all", label: "All Paradigms" },
                { id: "concept", label: "🧠 Conceptual & DDD" },
                { id: "flowchart", label: "📊 Flowchart" },
                { id: "erd", label: "🗄️ ERD Schema" },
                { id: "architecture", label: "🏗️ Architecture" },
                { id: "uml", label: "📐 UML Class" },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-56">
              <Select onValueChange={applyTemplate}>
                <SelectTrigger className="h-8 rounded-lg border-border bg-background text-xs font-semibold">
                  <Sparkles className="mr-1.5 size-3.5 text-primary" />
                  <SelectValue placeholder="Load template..." />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="blank" className="text-xs font-medium text-muted-foreground">
                    Blank Canvas (Clean)
                  </SelectItem>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    Conceptual & Domain Maps
                  </div>
                  {DIAGRAM_TEMPLATES.filter((t) => t.category === "concept").map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                      {tpl.name}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    Flowcharts & Processes
                  </div>
                  {DIAGRAM_TEMPLATES.filter((t) => t.category === "flowchart").map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                      {tpl.name}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    Database ERD Schemas
                  </div>
                  {DIAGRAM_TEMPLATES.filter((t) => t.category === "erd").map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                      {tpl.name}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    UML Class Diagrams
                  </div>
                  {DIAGRAM_TEMPLATES.filter((t) => t.category === "uml").map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                      {tpl.name}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    System Architecture
                  </div>
                  {DIAGRAM_TEMPLATES.filter((t) => t.category === "architecture").map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                      {tpl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fitView({ padding: 0.25, duration: 300 })}
              className="h-8 gap-1 rounded-lg px-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Fit diagram to viewport"
            >
              <Maximize2 className="size-3.5" />
              Fit View
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearCanvas}
              className="h-8 gap-1 rounded-lg px-2 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Clear all nodes"
            >
              <RotateCcw className="size-3.5" />
              Clear
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/50">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Add Element:
          </span>

          {(activeCategory === "all" || activeCategory === "concept") && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNode("conceptNode")}
                className="h-7 gap-1.5 rounded-lg border-indigo-500/30 bg-indigo-500/10 px-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-500/20 dark:text-indigo-300"
              >
                <Brain className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                + Concept
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNode("groupNode")}
                className="h-7 gap-1.5 rounded-lg border-border bg-background px-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <Boxes className="size-3.5 text-primary" />
                + Boundary Group
              </Button>
            </>
          )}

          {(activeCategory === "all" || activeCategory === "flowchart") && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNode("terminalNode")}
                className="h-7 gap-1.5 rounded-lg border-emerald-500/30 bg-emerald-500/10 px-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
              >
                <Play className="size-3 text-emerald-600 dark:text-emerald-400" />
                + Start/End
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNode("actionNode")}
                className="h-7 gap-1.5 rounded-lg border-cyan-500/30 bg-cyan-500/10 px-2.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-500/20 dark:text-cyan-300"
              >
                <Workflow className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                + Action Step
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNode("eventNode")}
                className="h-7 gap-1.5 rounded-lg border-amber-500/30 bg-amber-500/10 px-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
              >
                <Zap className="size-3.5 text-amber-600 dark:text-amber-400" />
                + Event
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNode("dataNode")}
                className="h-7 gap-1.5 rounded-lg border-blue-500/30 bg-blue-500/10 px-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-500/20 dark:text-blue-300"
              >
                <FileText className="size-3.5 text-blue-600 dark:text-blue-400" />
                + Data / Doc
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNode("decisionNode")}
                className="h-7 gap-1.5 rounded-lg border-rose-500/30 bg-rose-500/10 px-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-500/20 dark:text-rose-300"
              >
                <GitFork className="size-3.5 text-rose-500" />
                + Decision
              </Button>
            </>
          )}

          {(activeCategory === "all" || activeCategory === "erd") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addNode("tableNode")}
              className="h-7 gap-1.5 rounded-lg border-emerald-500/40 bg-emerald-500/10 px-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              <Table2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              + Table (ERD)
            </Button>
          )}

          {(activeCategory === "all" || activeCategory === "uml") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addNode("classNode")}
              className="h-7 gap-1.5 rounded-lg border-indigo-500/30 bg-indigo-500/10 px-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-500/20 dark:text-indigo-300 font-mono"
            >
              <Layers className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              + UML Class
            </Button>
          )}

          {(activeCategory === "all" || activeCategory === "architecture") && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNode("clientNode")}
                className="h-7 gap-1.5 rounded-lg border-border bg-background px-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <AppWindow className="size-3.5 text-blue-500" />
                Client
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNode("serverNode")}
                className="h-7 gap-1.5 rounded-lg border-border bg-background px-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <Server className="size-3.5 text-emerald-500" />
                Server
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNode("databaseNode")}
                className="h-7 gap-1.5 rounded-lg border-border bg-background px-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <Database className="size-3.5 text-purple-500" />
                Database
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNode("cloudNode")}
                className="h-7 gap-1.5 rounded-lg border-border bg-background px-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <Cloud className="size-3.5 text-amber-500" />
                Cloud
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNode("noteNode")}
                className="h-7 gap-1.5 rounded-lg border-border bg-background px-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <StickyNote className="size-3.5 text-muted-foreground" />
                Note
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="relative flex-1 w-full h-full min-h-0" id="react-flow-diagram-viewport">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => {
            setSelectedNodeId(node.id);
            setSelectedEdgeId(null);
          }}
          onEdgeClick={(_, edge) => {
            setSelectedEdgeId(edge.id);
            setSelectedNodeId(null);
          }}
          onPaneClick={() => {
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
          }}
          fitView={nodes.length > 0}
          className="bg-background"
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: false,
            style: { strokeWidth: 2 },
          }}
        >
          <Background gap={18} size={1.2} className="opacity-40" />
          <Controls
            className="!border-border !bg-card !shadow-md !rounded-xl overflow-hidden [&>button]:!border-border [&>button]:!bg-card [&>button]:!text-foreground hover:[&>button]:!bg-muted"
            showInteractive={false}
          />
          <MiniMap
            zoomable
            pannable
            className="!border-border !bg-card/80 !shadow-md rounded-xl backdrop-blur-xs"
            nodeColor={(n) => {
              if (n.type === "conceptNode" || n.type === "classNode") return "#6366f1";
              if (n.type === "tableNode") return "#10b981";
              if (n.type === "actionNode") return "#06b6d4";
              if (n.type === "eventNode") return "#f59e0b";
              if (n.type === "terminalNode") return "#10b981";
              if (n.type === "serverNode") return "#3b82f6";
              if (n.type === "databaseNode") return "#a855f7";
              return "#64748b";
            }}
          />
        </ReactFlow>

        {nodes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="pointer-events-auto flex max-w-xl flex-col items-center gap-3.5 rounded-3xl border border-border/80 bg-card/90 p-6 shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Workflow className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  Multi-Paradigm Diagram Builder
                </h3>
                <p className="text-xs text-muted-foreground">
                  Draw Conceptual Domain Maps, Flowcharts, ERD Database Schemas, UML Class Models, and System Architectures:
                </p>
              </div>

              <div className="w-full pt-2 space-y-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate("concept-ddd")}
                    className="h-8 rounded-xl border-indigo-500/30 bg-indigo-500/10 px-3 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20"
                  >
                    🧠 DDD Concept Map
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate("flow-checkout")}
                    className="h-8 rounded-xl border-cyan-500/30 bg-cyan-500/10 px-3 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20"
                  >
                    📊 Checkout Flowchart
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate("erd-ecommerce")}
                    className="h-8 rounded-xl border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                  >
                    🛒 E-Commerce ERD
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate("uml-ecommerce")}
                    className="h-8 rounded-xl border-indigo-500/30 bg-indigo-500/10 px-3 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20"
                  >
                    📐 UML Class Model
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate("system-architecture")}
                    className="h-8 rounded-xl border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    🏗️ System Architecture
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedNode && selectedNode.type === "tableNode" && (
          <div className="absolute right-4 top-4 z-20 w-84 max-h-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-md animate-in fade-in-0 slide-in-from-right-4 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Table2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  ERD Table Properties
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={deleteSelected}
                className="size-7 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete table"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase font-mono">
                  Table Name
                </label>
                <Input
                  value={selectedNode.data.tableName || selectedNode.data.label || ""}
                  onChange={(e) => updateSelectedNode("tableName", e.target.value)}
                  className="h-8 rounded-lg border-border bg-background font-mono text-xs font-bold"
                  placeholder="e.g. users, orders"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Description / Table Comment
                </label>
                <Input
                  value={selectedNode.data.subtext || ""}
                  onChange={(e) => updateSelectedNode("subtext", e.target.value)}
                  className="h-8 rounded-lg border-border bg-background text-xs"
                  placeholder="e.g. Store customer checkout details"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Header Color Theme
                </label>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {COLOR_THEMES.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => updateSelectedNode("colorTheme", th.id)}
                      className={cn(
                        "size-5 rounded-full transition-transform hover:scale-110",
                        th.bgClass,
                        (selectedNode.data.colorTheme || "emerald") === th.id
                          ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
                          : "opacity-80 hover:opacity-100",
                      )}
                      title={th.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Columns ({(selectedNode.data.columns || []).length})
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addColumn}
                  className="h-7 gap-1 rounded-lg border-border bg-background px-2 text-[11px] font-semibold hover:bg-muted"
                >
                  <Plus className="size-3" />
                  Add Column
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(selectedNode.data.columns || []).map((col) => (
                  <div
                    key={col.id}
                    className="rounded-xl border border-border/80 bg-background/80 p-2 space-y-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={col.name}
                        onChange={(e) => updateColumn(col.id, { name: e.target.value })}
                        placeholder="column_name"
                        className="h-7 min-w-0 flex-1 font-mono text-xs"
                      />
                      <div className="w-28 shrink-0">
                        <Select
                          value={col.type}
                          onValueChange={(val: string | null) =>
                            updateColumn(col.id, { type: val ?? "VARCHAR(255)" })
                          }
                        >
                          <SelectTrigger className="h-7 rounded-lg border-border bg-background font-mono text-[11px]">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-popover">
                            {SQL_DATA_TYPES.map((t) => (
                              <SelectItem key={t} value={t} className="font-mono text-xs">
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeColumn(col.id)}
                        className="size-7 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Remove column"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateColumn(col.id, { isPk: !col.isPk })}
                        className={cn(
                          "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold font-mono transition-colors",
                          col.isPk
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40"
                            : "bg-muted/60 text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <Key className="size-2.5" />
                        PK
                      </button>
                      <button
                        type="button"
                        onClick={() => updateColumn(col.id, { isFk: !col.isFk })}
                        className={cn(
                          "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold font-mono transition-colors",
                          col.isFk
                            ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40"
                            : "bg-muted/60 text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <Link2 className="size-2.5" />
                        FK
                      </button>
                      <button
                        type="button"
                        onClick={() => updateColumn(col.id, { isNullable: !col.isNullable })}
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-mono transition-colors",
                          col.isNullable
                            ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40 font-bold"
                            : "bg-muted/60 text-muted-foreground hover:bg-muted",
                        )}
                      >
                        NULL
                      </button>
                      <button
                        type="button"
                        onClick={() => updateColumn(col.id, { isUnique: !col.isUnique })}
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-mono transition-colors",
                          col.isUnique
                            ? "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 font-bold"
                            : "bg-muted/60 text-muted-foreground hover:bg-muted",
                        )}
                      >
                        UQ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedNode && selectedNode.type === "classNode" && (
          <div className="absolute right-4 top-4 z-20 w-84 max-h-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-md animate-in fade-in-0 slide-in-from-right-4 duration-200 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
                  UML Class Properties
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={deleteSelected}
                className="size-7 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete class"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>

            <div className="space-y-3 font-sans">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase font-mono">
                  Class Name
                </label>
                <Input
                  value={selectedNode.data.label || ""}
                  onChange={(e) => updateSelectedNode("label", e.target.value)}
                  className="h-8 rounded-lg border-border bg-background font-mono text-xs font-bold"
                  placeholder="e.g. OrderService"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateSelectedNode("isInterface", !selectedNode.data.isInterface)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold border transition-colors",
                    selectedNode.data.isInterface
                      ? "border-indigo-500 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {selectedNode.data.isInterface ? "«interface» active" : "Mark as Interface"}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between font-sans">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Attributes ({(selectedNode.data.attributes || []).length})
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addUmlMember("attributes")}
                  className="h-7 gap-1 rounded-lg border-border bg-background px-2 text-[11px] font-semibold hover:bg-muted font-sans"
                >
                  <Plus className="size-3" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {(selectedNode.data.attributes || []).map((attr) => (
                  <div key={attr.id} className="flex items-center gap-1.5">
                    <select
                      value={attr.visibility || "+"}
                      onChange={(e) =>
                        updateUmlMember("attributes", attr.id, {
                          visibility: e.target.value as "+" | "-" | "#" | "~",
                        })
                      }
                      className="h-7 rounded border border-border bg-background px-1 text-xs font-mono font-bold"
                    >
                      {UML_VISIBILITY.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={attr.name}
                      onChange={(e) =>
                        updateUmlMember("attributes", attr.id, { name: e.target.value })
                      }
                      placeholder="fieldName"
                      className="h-7 flex-1 font-mono text-xs"
                    />
                    <Input
                      value={attr.type || ""}
                      onChange={(e) =>
                        updateUmlMember("attributes", attr.id, { type: e.target.value })
                      }
                      placeholder="Type"
                      className="h-7 w-20 font-mono text-xs text-muted-foreground"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeUmlMember("attributes", attr.id)}
                      className="size-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between font-sans">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Methods ({(selectedNode.data.methods || []).length})
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addUmlMember("methods")}
                  className="h-7 gap-1 rounded-lg border-border bg-background px-2 text-[11px] font-semibold hover:bg-muted font-sans"
                >
                  <Plus className="size-3" />
                  Add Method
                </Button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {(selectedNode.data.methods || []).map((method) => (
                  <div key={method.id} className="flex items-center gap-1.5">
                    <select
                      value={method.visibility || "+"}
                      onChange={(e) =>
                        updateUmlMember("methods", method.id, {
                          visibility: e.target.value as "+" | "-" | "#" | "~",
                        })
                      }
                      className="h-7 rounded border border-border bg-background px-1 text-xs font-mono font-bold"
                    >
                      {UML_VISIBILITY.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={method.name}
                      onChange={(e) =>
                        updateUmlMember("methods", method.id, { name: e.target.value })
                      }
                      placeholder="methodName()"
                      className="h-7 flex-1 font-mono text-xs"
                    />
                    <Input
                      value={method.type || ""}
                      onChange={(e) =>
                        updateUmlMember("methods", method.id, { type: e.target.value })
                      }
                      placeholder="return"
                      className="h-7 w-20 font-mono text-xs text-muted-foreground"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeUmlMember("methods", method.id)}
                      className="size-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedNode &&
          selectedNode.type !== "tableNode" &&
          selectedNode.type !== "classNode" && (
            <div className="absolute right-4 top-4 z-20 w-76 max-h-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-md animate-in fade-in-0 slide-in-from-right-4 duration-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Node Properties
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={deleteSelected}
                  className="size-7 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Delete node"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Title / Label
                  </label>
                  <Input
                    value={selectedNode.data.label || ""}
                    onChange={(e) => updateSelectedNode("label", e.target.value)}
                    className="h-8 rounded-lg border-border bg-background text-xs"
                    placeholder="Title"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Description / Subtext
                  </label>
                  <Input
                    value={selectedNode.data.subtext || ""}
                    onChange={(e) => updateSelectedNode("subtext", e.target.value)}
                    className="h-8 rounded-lg border-border bg-background text-xs"
                    placeholder="Details or rules"
                  />
                </div>

                {selectedNode.type === "actionNode" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                      Actor / Responsible Role
                    </label>
                    <Input
                      value={selectedNode.data.actor || ""}
                      onChange={(e) => updateSelectedNode("actor", e.target.value)}
                      className="h-8 rounded-lg border-border bg-background text-xs"
                      placeholder="e.g. Customer, Background Worker"
                    />
                  </div>
                )}

                {selectedNode.type === "eventNode" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                      Trigger Type
                    </label>
                    <Input
                      value={selectedNode.data.triggerType || ""}
                      onChange={(e) => updateSelectedNode("triggerType", e.target.value)}
                      className="h-8 rounded-lg border-border bg-background text-xs"
                      placeholder="e.g. webhook, cron, user_click"
                    />
                  </div>
                )}

                {selectedNode.type === "groupNode" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                      Border Style
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateSelectedNode("borderStyle", "dashed")}
                        className={cn(
                          "flex-1 rounded-lg py-1 text-xs font-semibold border transition-colors",
                          selectedNode.data.borderStyle === "dashed"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground",
                        )}
                      >
                        Dashed
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSelectedNode("borderStyle", "solid")}
                        className={cn(
                          "flex-1 rounded-lg py-1 text-xs font-semibold border transition-colors",
                          selectedNode.data.borderStyle === "solid"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground",
                        )}
                      >
                        Solid
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Badge / Classification Tag
                  </label>
                  <Input
                    value={selectedNode.data.badge || ""}
                    onChange={(e) => updateSelectedNode("badge", e.target.value)}
                    className="h-8 rounded-lg border-border bg-background text-xs"
                    placeholder="e.g. AGGREGATE ROOT, VALUE OBJECT"
                  />
                </div>
              </div>
            </div>
          )}

        {selectedEdge && (
          <div className="absolute right-4 top-4 z-20 w-80 rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-md animate-in fade-in-0 slide-in-from-right-4 duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Relationship Properties
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={deleteSelected}
                className="size-7 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete connector"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Relation Label / Cardinality
              </label>
              <Input
                value={(selectedEdge.label as string) || ""}
                onChange={(e) => updateSelectedEdge({ label: e.target.value })}
                className="h-8 rounded-lg border-border bg-background text-xs"
                placeholder="e.g. is a, depends on, 1 : N"
              />

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    "is a",
                    "has a",
                    "depends on",
                    "triggers",
                    "«implements»",
                    "1 : N",
                    "1 : 1",
                    "N : M",
                    "Yes",
                    "No",
                  ].map((card) => (
                    <button
                      key={card}
                      type="button"
                      onClick={() => updateSelectedEdge({ label: card })}
                      className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground hover:bg-primary/15 hover:text-primary transition-colors"
                    >
                      {card}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1 border-t border-border">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Connector Style
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateSelectedEdge({ type: "smoothstep" })}
                  className={cn(
                    "flex-1 rounded-lg py-1 text-xs font-semibold border transition-colors",
                    selectedEdge.type === "smoothstep" || !selectedEdge.type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  Smooth
                </button>
                <button
                  type="button"
                  onClick={() => updateSelectedEdge({ type: "step" })}
                  className={cn(
                    "flex-1 rounded-lg py-1 text-xs font-semibold border transition-colors",
                    selectedEdge.type === "step"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  Step
                </button>
                <button
                  type="button"
                  onClick={() => updateSelectedEdge({ type: "straight" })}
                  className={cn(
                    "flex-1 rounded-lg py-1 text-xs font-semibold border transition-colors",
                    selectedEdge.type === "straight"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  Straight
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
