import type { Node, Edge } from "@xyflow/react";

export interface ErdColumn {
  id: string;
  name: string;
  type: string; 
  isPk?: boolean;
  isFk?: boolean;
  isNullable?: boolean;
  isUnique?: boolean;
}

export interface UmlMember {
  id: string;
  name: string;
  type?: string;
  visibility?: "+" | "-" | "#" | "~";
  isStatic?: boolean;
}

export type CustomNodeType =
  | "clientNode"
  | "serverNode"
  | "databaseNode"
  | "cloudNode"
  | "decisionNode"
  | "noteNode"
  // Database & ERD
  | "tableNode"
  // Conceptual & Domain Modeling
  | "conceptNode"
  | "groupNode"
  // Flowchart & Process
  | "terminalNode"
  | "actionNode"
  | "eventNode"
  | "dataNode"
  // UML & Object Oriented
  | "classNode";

export type DiagramCategory =
  | "all"
  | "concept"
  | "flowchart"
  | "erd"
  | "architecture"
  | "uml";

export interface CustomNodeData extends Record<string, unknown> {
  label: string;
  subtext?: string;
  badge?: string;
  iconName?: string;
  colorTheme?:
    | "blue"
    | "emerald"
    | "purple"
    | "amber"
    | "rose"
    | "slate"
    | "indigo"
    | "cyan"
    | "teal"
    | "orange";
  tableName?: string;
  columns?: ErdColumn[];
  attributes?: UmlMember[];
  methods?: UmlMember[];
  isInterface?: boolean;
  actor?: string;
  status?: "pending" | "running" | "completed" | "failed" | "active";
  triggerType?: "webhook" | "timer" | "click" | "queue" | "manual";
  terminalType?: "start" | "end" | "stop";
  groupTitle?: string;
  borderStyle?: "solid" | "dashed" | "dotted";
  width?: number;
  height?: number;
}

export type AppNode = Node<CustomNodeData, CustomNodeType>;
export type AppEdge = Edge;

export interface DiagramTemplate {
  id: string;
  name: string;
  category?: DiagramCategory;
  description: string;
  nodes: AppNode[];
  edges: AppEdge[];
}

