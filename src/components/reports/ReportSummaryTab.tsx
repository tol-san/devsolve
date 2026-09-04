"use client";

import React, { useState } from "react";
import {
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  History,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownView } from "@/components/ui/markdown-view";
import { ReportSidebarPanels } from "@/components/reports/ReportSidebarPanels";
import type { ReportDetail } from "@/lib/types/reports/types";
import {
  AttachmentPreviewModal,
  type AttachmentItem,
} from "@/components/reports/AttachmentPreviewModal";

interface ReportSummaryTabProps {
  report: ReportDetail;
  sidebar?: React.ReactNode;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card p-5 sm:p-6 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border shadow-xs space-y-3">
      <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function ReportSummaryTab({ report, sidebar }: ReportSummaryTabProps) {
  const hasEvidence = report.attachments.length > 0;
  const hasReferences = report.referenceLinks.length > 0;
  const [previewAttachment, setPreviewAttachment] = useState<AttachmentItem | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <main className="lg:col-span-2 space-y-6">
        <Section title="Description">
          <div className="prose dark:prose-invert max-w-none text-foreground">
            <MarkdownView
              source={report.description}
              className="text-base text-foreground/90 leading-relaxed"
            />
          </div>
        </Section>

        {report.impact &&
          report.impact.trim() !== "" &&
          report.impact !==
            "Impact information has not been explicitly provided for this report." && (
            <Section title="Impact">
              <div className="prose dark:prose-invert max-w-none text-foreground">
                <MarkdownView
                  source={report.impact}
                  className="text-base text-foreground/90 leading-relaxed"
                />
              </div>
            </Section>
          )}

        {report.reproduceSteps.length > 0 && (
          <Section title="Steps to Reproduce">
            <div className="space-y-2.5 text-base text-foreground/90 leading-relaxed">
              {report.reproduceSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold text-xs mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <MarkdownView source={step} className="text-sm sm:text-base leading-relaxed" />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {report.proofOfConcept && (
          <Section title="Proof of Concept">
            <pre className="overflow-x-auto rounded-xl bg-muted/60 p-4 text-sm text-foreground border border-border">
              <code className="font-mono">{report.proofOfConcept}</code>
            </pre>
          </Section>
        )}

        {report.remediation && (
          <Section title="Suggested Remediation">
            <div className="prose dark:prose-invert max-w-none text-foreground">
              <MarkdownView
                source={report.remediation}
                className="text-base text-foreground/90 leading-relaxed"
              />
            </div>
          </Section>
        )}

        {hasReferences && (
          <Section title="Reference Links">
            <ul className="space-y-2">
              {report.referenceLinks.map((link) => (
                <li key={link}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1.5 text-base font-medium text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {link}
                    <ExternalLink className="size-3.5 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Evidence & Attachments">
          {hasEvidence ? (
            <div className="space-y-2.5">
              {report.attachments.map((file) => {
                const ext = file.name.split(".").pop()?.toLowerCase() || "";
                const isImg =
                  /^(png|jpg|jpeg|webp|gif|svg)$/i.test(ext) ||
                  file.type?.startsWith("image/");
                const isCode =
                  /^(txt|log|json|xml|js|ts|py|sh)$/i.test(ext) ||
                  file.type?.includes("text") ||
                  file.type?.includes("json");
                const isPdf = ext === "pdf" || file.type?.includes("pdf");

                return (
                  <div
                    key={file.name}
                    onClick={() => setPreviewAttachment(file)}
                    className="group flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-muted/40 hover:bg-muted/70 rounded-xl border border-border transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-105 transition-transform">
                        {isImg ? (
                          <ImageIcon className="size-5 text-purple-500" />
                        ) : isCode ? (
                          <FileCode className="size-5 text-blue-500" />
                        ) : isPdf ? (
                          <FileText className="size-5 text-rose-500" />
                        ) : (
                          <Paperclip className="size-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {file.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-mono px-1.5 py-0 shrink-0 hidden sm:inline-flex"
                          >
                            {ext || "FILE"}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {[file.size, file.type].filter(Boolean).join(" • ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewAttachment(file);
                        }}
                        className="h-8 px-2.5 gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                        title="Preview attachment"
                      >
                        <Eye className="size-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                      </Button>

                      {file.url && (
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            const a = document.createElement("a");
                            a.href = file.url!;
                            a.download = file.name;
                            a.target = "_blank";
                            a.rel = "noopener noreferrer";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          className="size-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                          title="Download attachment"
                        >
                          <Download className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="flex items-center gap-2 text-base text-muted-foreground">
              <FileText className="size-4 shrink-0" />
              No files were attached to this report.
            </p>
          )}
        </Section>

        <Section title="Activity">
          {report.updates.length > 0 ? (
            <ol className="space-y-3">
              {report.updates.map((update) => (
                <li key={update.id} className="flex items-start gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <div className="min-w-0">
                    <p className="text-base text-foreground">
                      <span className="font-semibold">{update.actor}</span>{" "}
                      {update.actionText}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {update.timestamp}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="flex items-center gap-2 text-base text-muted-foreground">
              <History className="size-4 shrink-0" />
              Nothing has happened on this report yet.
            </p>
          )}
        </Section>
      </main>

      {sidebar ?? <ReportSidebarPanels report={report} />}

      <AttachmentPreviewModal
        attachment={previewAttachment}
        isOpen={Boolean(previewAttachment)}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  );
}
