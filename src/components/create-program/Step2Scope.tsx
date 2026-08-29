"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScopeTarget } from "./types";

interface Step2ScopeProps {
  inScopeTargets: ScopeTarget[];
  outOfScopeTargets: ScopeTarget[];
  setInScopeTargets: (targets: ScopeTarget[]) => void;
  setOutOfScopeTargets: (targets: ScopeTarget[]) => void;
  addInScope: () => void;
  removeInScope: (id: string) => void;
  addOutOfScope: () => void;
  removeOutOfScope: (id: string) => void;
}

export function Step2Scope({
  inScopeTargets,
  outOfScopeTargets,
  setInScopeTargets,
  setOutOfScopeTargets,
  addInScope,
  removeInScope,
  addOutOfScope,
  removeOutOfScope,
}: Step2ScopeProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground">
        Scope Definition
      </h2>

      {/* IN-SCOPE TARGETS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
            ✓
          </span>
          <label className="text-sm font-semibold text-foreground">
            In-Scope Targets
          </label>
        </div>

        {inScopeTargets.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 p-3 sm:p-0 rounded-xl sm:rounded-none bg-muted/40 sm:bg-transparent border sm:border-0 border-border"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <Select
                value={item.type}
                onValueChange={(val) => {
                  const updated = [...inScopeTargets];
                  updated[index].type = val ?? "WEB";
                  setInScopeTargets(updated);
                }}
              >
                <SelectTrigger className="h-11 w-28 sm:w-32 rounded-xl border-border bg-card text-foreground text-sm font-medium shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEB">Web</SelectItem>
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="MOBILE">Mobile</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="text"
                placeholder="app.example.com or api.example.com/*"
                value={item.target}
                onChange={(e) => {
                  const updated = [...inScopeTargets];
                  updated[index].target = e.target.value;
                  setInScopeTargets(updated);
                }}
                className="h-11 rounded-xl border-border bg-card text-foreground text-base focus-visible:ring-blue-500 flex-1 min-w-0"
              />

              {inScopeTargets.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInScope(item.id)}
                  className="h-11 w-11 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0 sm:hidden"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Input
              type="text"
              placeholder="Description (optional)"
              value={item.description}
              onChange={(e) => {
                const updated = [...inScopeTargets];
                updated[index].description = e.target.value;
                setInScopeTargets(updated);
              }}
              className="h-11 rounded-xl border-border bg-card text-foreground text-base focus-visible:ring-blue-500 flex-1 min-w-0"
            />

            {inScopeTargets.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeInScope(item.id)}
                className="h-11 w-11 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0 hidden sm:flex"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          onClick={addInScope}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm h-10 px-4 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add In-Scope Target
        </Button>
      </div>

      <hr className="border-border" />

      {/* OUT-OF-SCOPE TARGETS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold">
            ✕
          </span>
          <label className="text-sm font-semibold text-foreground">
            Out-of-Scope Targets
          </label>
        </div>

        {outOfScopeTargets.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 p-3 sm:p-0 rounded-xl sm:rounded-none bg-muted/40 sm:bg-transparent border sm:border-0 border-border"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <Select
                value={item.type}
                onValueChange={(val) => {
                  const updated = [...outOfScopeTargets];
                  updated[index].type = val ?? "WEB";
                  setOutOfScopeTargets(updated);
                }}
              >
                <SelectTrigger className="h-11 w-28 sm:w-32 rounded-xl border-border bg-card text-foreground text-sm font-medium shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEB">Web</SelectItem>
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="MOBILE">Mobile</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="text"
                placeholder="*.internal.example.com"
                value={item.target}
                onChange={(e) => {
                  const updated = [...outOfScopeTargets];
                  updated[index].target = e.target.value;
                  setOutOfScopeTargets(updated);
                }}
                className="h-11 rounded-xl border-border bg-card text-foreground text-base focus-visible:ring-blue-500 flex-1 min-w-0"
              />

              {outOfScopeTargets.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOutOfScope(item.id)}
                  className="h-11 w-11 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0 sm:hidden"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Input
              type="text"
              placeholder="Description (optional)"
              value={item.description}
              onChange={(e) => {
                const updated = [...outOfScopeTargets];
                updated[index].description = e.target.value;
                setOutOfScopeTargets(updated);
              }}
              className="h-11 rounded-xl border-border bg-card text-foreground text-base focus-visible:ring-blue-500 flex-1 min-w-0"
            />

            {outOfScopeTargets.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOutOfScope(item.id)}
                className="h-11 w-11 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0 hidden sm:flex"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          onClick={addOutOfScope}
          className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm h-10 px-4 cursor-pointer dark:bg-rose-600 dark:hover:bg-rose-700"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Out-Of-Scope Target
        </Button>
      </div>
    </div>
  );
}
