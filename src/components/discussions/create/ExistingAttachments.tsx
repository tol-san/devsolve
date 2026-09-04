"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, FileText, ImageIcon, Loader2, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { attachmentUrl } from "@/lib/api/attachment-url";
import { formatBytes } from "@/lib/discussions/format";

export type ExistingAttachment = {
  id?: string;
  originalFileName?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  fileSize?: number;
  downloadUrl?: string;
};

type ExistingAttachmentsProps = {
  attachments: ExistingAttachment[];
  onRemove?: (attachmentId: string) => Promise<void>;
  disabled?: boolean;
};

export function ExistingAttachments({
  attachments,
  onRemove,
  disabled,
}: ExistingAttachmentsProps) {
  const [pendingRemoval, setPendingRemoval] =
    useState<ExistingAttachment | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const files = attachments.filter((file) => attachmentUrl(file.downloadUrl));
  if (files.length === 0) return null;

  const nameOf = (file: ExistingAttachment) =>
    file.originalFileName || file.fileName || "Attachment";

  const confirmRemoval = async () => {
    const id = pendingRemoval?.id;
    if (!onRemove || !id) return;

    setRemovingId(id);
    try {
      await onRemove(id);
      setPendingRemoval(null);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section aria-label="Files already attached" className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Already attached
        </h3>
        <span className="text-xs font-medium text-muted-foreground">
          {files.length} {files.length === 1 ? "file" : "files"}
          {onRemove ? " · removing one is immediate" : " · kept when you save"}
        </span>
      </div>

      <ul className="space-y-2">
        {files.map((file, index) => {
          const href = attachmentUrl(file.downloadUrl) as string;
          const name = nameOf(file);
          const isImage =
            file.mimeType?.startsWith("image/") ||
            /\.(png|jpe?g|webp|gif|svg)$/i.test(name);
          const isRemoving = removingId === file.id;

          return (
            <li
              key={file.id ?? `${name}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-2.5"
            >
              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                {isImage ? (
                  <Image
                    src={href}
                    alt={name}
                    width={44}
                    height={44}
                    unoptimized
                    className="size-full object-cover"
                  />
                ) : (
                  <FileText className="size-5 text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[file.mimeType, formatBytes(file.sizeBytes ?? file.fileSize)]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Open ${name}`}
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {isImage ? (
                    <ImageIcon className="size-4" />
                  ) : (
                    <Download className="size-4" />
                  )}
                </a>

                {onRemove && file.id && (
                  <button
                    type="button"
                    onClick={() => setPendingRemoval(file)}
                    disabled={disabled || isRemoving}
                    aria-label={`Remove ${name}`}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600 disabled:pointer-events-none disabled:opacity-50 dark:hover:text-red-400"
                  >
                    {isRemoving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <AlertDialog
        open={Boolean(pendingRemoval)}
        onOpenChange={(open) => {
          if (!open && !removingId) setPendingRemoval(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {pendingRemoval ? nameOf(pendingRemoval) : "this file"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              It is deleted straight away, not when you save, and cancelling the
              edit afterwards will not bring it back. You would need to upload
              it again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(removingId)}>
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void confirmRemoval();
              }}
              disabled={Boolean(removingId)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {removingId ? "Removing…" : "Remove file"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
