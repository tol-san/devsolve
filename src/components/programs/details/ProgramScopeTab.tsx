import React from "react";
import { ProgramDetail } from "@/lib/types/programs/types";
import { Badge } from "@/components/ui/badge";
import { Globe, Shield, AlertTriangle } from "lucide-react";

export function ProgramScopeTab({ program }: { program: ProgramDetail }) {
  const assets = program.assets || [];
const inScope = assets.filter(
  (a) => a.isInScope === true || (a.isInScope as unknown) === "true"
);

const outOfScope = assets.filter(
  (a) =>
    a.isInScope === false ||
    (a.isInScope as unknown) === "false" ||
    a.isInScope === undefined
);

console.log("TOTAL COUNT:", program.assets?.length)

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 p-4 sm:p-6 space-y-4 overflow-hidden">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">In-Scope Targets</h3>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 rounded-lg dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/15 shrink-0">
            {inScope.length} Targets
          </Badge>
        </div>

        {inScope.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No in-scope assets listed.</p>
        ) : (
          <div className="divide-y divide-border">
            {inScope.map((asset) => (
              <div key={asset.id} className="py-3 space-y-1">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-mono text-sm font-semibold text-foreground truncate min-w-0">
                    {asset.identifier}
                  </span>
                  <Badge variant="outline" className="text-xs rounded-md shrink-0">
                    {asset.assetType}
                  </Badge>
                  <Badge variant="secondary" className="text-xs rounded-md shrink-0">
                    Max: {asset.maxSeverity}
                  </Badge>
                </div>
                {asset.description && (
                  <p className="text-xs text-muted-foreground break-words pl-6">
                    {asset.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {outOfScope.length > 0 && (
        <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 p-4 sm:p-6 space-y-4 overflow-hidden">
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">Out-of-Scope Targets</h3>
          </div>
          <div className="divide-y divide-border">
            {outOfScope.map((asset) => (
              <div key={asset.id} className="py-3 space-y-1">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="font-mono text-sm text-muted-foreground truncate min-w-0">
                    {asset.identifier}
                  </span>
                  <Badge variant="outline" className="text-xs rounded-md text-muted-foreground shrink-0">
                    {asset.assetType}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}