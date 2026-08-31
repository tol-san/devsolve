import {
  CheckCircle2,
  Copy,
  FileCode2,
  FileImage,
  FileText,
  XCircle,
} from "lucide-react";

import { ReportDetailSectionCard } from "@/components/report-management/ReportDetailSectionCard";
import type { ReportManagementDetail } from "@/components/report-management/types";
import { cn } from "@/lib/utils";

type ReportDetailProofOfConceptProps = {
  detail: ReportManagementDetail;
};

export function ReportDetailProofOfConcept({
  detail,
}: ReportDetailProofOfConceptProps) {
  return (
    <ReportDetailSectionCard
      title="Proof of Concept"
      icon={<FileCode2 className="size-4.5" />}
      contentClassName="space-y-5"
    >
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            HTTP Request
          </p>
          <div className="overflow-hidden rounded-2xl border border-border bg-[#0B0F19] shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-full bg-red-400" />
                  <span className="size-2 rounded-full bg-amber-400" />
                  <span className="size-2 rounded-full bg-emerald-400" />
                </span>
                <span>{detail.proofRequestLanguage}</span>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
              >
                <Copy className="size-3.5" />
                Copy
              </button>
            </div>

            <pre className="overflow-x-auto px-4 py-4 text-xs leading-7 whitespace-pre-wrap text-slate-200 font-mono">
              <code>{detail.proofRequest}</code>
            </pre>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ResultCard
            icon={<CheckCircle2 className="size-4.5" />}
            title="Expected Result"
            value={detail.expectedResult}
            tone="green"
          />
          <ResultCard
            icon={<XCircle className="size-4.5" />}
            title="Actual Result"
            value={detail.actualResult}
            tone="red"
          />
        </div>

        <div className="space-y-3 font-sans">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Attachments
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {detail.attachments.length} supporting files included with this report.
              </p>
            </div>

            <span className="inline-flex h-7 items-center rounded-full border border-border bg-card px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap shrink-0">
              {detail.attachments.length} {detail.attachments.length === 1 ? "file" : "files"}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {detail.attachments.map((attachment) => (
              <div
                key={attachment.name}
                className="group flex items-center justify-between gap-4 border-b border-border px-4 py-4 transition-colors last:border-b-0 hover:bg-muted/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={
                      attachment.kind === "image"
                        ? "flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                    }
                  >
                    {attachment.kind === "image" ? (
                      <FileImage className="size-5" />
                    ) : (
                      <FileText className="size-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {attachment.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {attachment.kind === "image" ? "Image evidence" : "Supporting file"}
                    </p>
                  </div>
                </div>

                <span className="inline-flex shrink-0 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {attachment.kind === "image" ? "Preview" : "File"}
                </span>
              </div>
            ))}
          </div>

          {detail.attachments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
              No attachments were included with this submission.
            </div>
          ) : null}
        </div>
    </ReportDetailSectionCard>
  );
}

function ResultCard({
  icon,
  title,
  value,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  tone: "green" | "red";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-4",
        tone === "green" && "border-emerald-500/20 bg-emerald-500/10",
        tone === "red" && "border-red-500/20 bg-red-500/10"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            tone === "green" && "text-emerald-600 dark:text-emerald-400",
            tone === "red" && "text-red-600 dark:text-red-400"
          )}
        >
          {icon}
        </span>
        <p
          className={cn(
            "text-sm font-semibold",
            tone === "green" && "text-emerald-700 dark:text-emerald-300",
            tone === "red" && "text-red-700 dark:text-red-300"
          )}
        >
          {title}
        </p>
      </div>
      <p
        className={cn(
          "mt-3 text-sm font-medium",
          tone === "green" && "text-emerald-600/90 dark:text-emerald-300/90",
          tone === "red" && "text-red-600/90 dark:text-red-300/90"
        )}
      >
        {value}
      </p>
    </div>
  );
}
