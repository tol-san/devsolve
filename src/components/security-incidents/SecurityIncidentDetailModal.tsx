"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  FileWarning,
  User,
  Building,
  Calendar,
  Layers,
  FileText,
  Clock,
  Shield,
  ArrowUpRight,
  UserX,
  Ban,
  RotateCcw,
  MoreVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserStatusBadge } from "@/components/admin/users/UserStatusBadge";
import type { SecurityIncident, MalwareUploader } from "@/lib/types/security-incidents/types";
import type { ModerationActionType } from "@/lib/types/admin/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

interface SecurityIncidentDetailModalProps {
  incident: SecurityIncident | null;
  isOpen: boolean;
  onClose: () => void;
  scope?: "admin" | "org";
  uploaderStatus?: string | null;
  onModerateUser?: (user: MalwareUploader, actionType: ModerationActionType) => void;
}

export function SecurityIncidentDetailModal({
  incident,
  isOpen,
  onClose,
  scope = "admin",
  uploaderStatus,
  onModerateUser,
}: SecurityIncidentDetailModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!incident) return null;

  const isMalicious = incident.verdict === "MALICIOUS";
  const vtLookupUrl = `https://www.virustotal.com/gui/file/${incident.sha256Hash}`;

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(incident.sha256Hash);
      setCopiedHash(true);
      toast.success("SHA-256 Hash copied to clipboard");
      setTimeout(() => setCopiedHash(false), 2000);
    } catch {
      toast.error("Failed to copy hash");
    }
  };

  const maliciousRatio = incident.stats.total > 0
    ? (incident.stats.malicious / incident.stats.total) * 100
    : 0;

  const suspiciousRatio = incident.stats.total > 0
    ? (incident.stats.suspicious / incident.stats.total) * 100
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-border bg-card shadow-2xl">
        {/* Header with Danger/Warning Banner */}
        <div
          className={cn(
            "p-6 border-b flex items-start gap-4",
            isMalicious
              ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300"
              : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
          )}
        >
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
              isMalicious
                ? "bg-red-500/20 border-red-500/30 text-red-600 dark:text-red-400"
                : "bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400"
            )}
          >
            {isMalicious ? (
              <ShieldAlert className="size-6" />
            ) : (
              <AlertTriangle className="size-6" />
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "font-bold uppercase tracking-wider text-xs px-2.5 py-0.5",
                  isMalicious
                    ? "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30"
                    : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                )}
              >
                {incident.verdict}
              </Badge>
              <span className="text-xs text-muted-foreground font-medium">
                Incident ID: {incident.id.slice(0, 8)}...
              </span>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground truncate mt-1">
              {incident.filename}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Blocked on {formatDate(incident.blockedAt)} • Discarded before storage
            </DialogDescription>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Security Summary Alert */}
          <div className="p-4 rounded-xl border border-border/80 bg-muted/40 text-sm space-y-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Shield className="size-4 text-primary" />
              <span>VirusTotal Engine Verdict Breakdown</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The fail-closed security guard refused this upload because security scanning detected threats.
              The file was blocked and rolling back the transaction ensured no malicious bytes were retained.
            </p>

            {/* Detections Ratio Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-red-600 dark:text-red-400">
                  {incident.stats.malicious} Malicious Engines
                </span>
                {incident.stats.suspicious > 0 && (
                  <span className="text-amber-600 dark:text-amber-400">
                    {incident.stats.suspicious} Suspicious
                  </span>
                )}
                <span className="text-muted-foreground">
                  {incident.stats.total} Total Engines Queried
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
                <div
                  style={{ width: `${maliciousRatio}%` }}
                  className="bg-red-500 h-full"
                />
                <div
                  style={{ width: `${suspiciousRatio}%` }}
                  className="bg-amber-500 h-full"
                />
                <div
                  style={{ width: `${100 - (maliciousRatio + suspiciousRatio)}%` }}
                  className="bg-muted-foreground/20 h-full"
                />
              </div>
            </div>
          </div>

          {/* Hash & External Lookup Card */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              SHA-256 Cryptographic Hash
            </label>
            <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/30 font-mono text-xs text-foreground break-all select-all">
              <span className="flex-1 min-w-0">{incident.sha256Hash}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyHash}
                className="h-8 px-2.5 shrink-0 text-xs gap-1.5 cursor-pointer hover:bg-muted"
                title="Copy SHA-256"
              >
                {copiedHash ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
            <div className="flex justify-end pt-1">
              <a
                href={vtLookupUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>Look up hash on VirusTotal</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* File Info */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <FileWarning className="size-3.5 text-primary" />
                <span>File Details</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Size:</span>
                  <span className="font-semibold text-foreground text-xs">
                    {formatBytes(incident.fileSizeBytes)} ({incident.fileSizeBytes.toLocaleString()} bytes)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Filename:</span>
                  <span className="font-mono text-foreground text-xs truncate max-w-[180px]">
                    {incident.filename}
                  </span>
                </div>
              </div>
            </div>

            {/* Uploader Details */}
            {(() => {
              const resolvedStatus =
                uploaderStatus || incident.uploader.status || "ACTIVE";
              const isSuspended = resolvedStatus.toUpperCase() === "SUSPENDED";

              return (
                <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <User className="size-3.5 text-primary" />
                      <span>Uploader / Researcher</span>
                    </div>
                    {scope === "admin" && incident.uploader.id && onModerateUser && (
                      <div className="flex items-center gap-1">
                        {isSuspended ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onModerateUser(
                                { ...incident.uploader, status: resolvedStatus },
                                "REINSTATE"
                              )
                            }
                            className="h-6 px-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg cursor-pointer"
                            title="Reinstate uploader account"
                          >
                            <RotateCcw className="size-3 mr-1" />
                            <span>Reinstate</span>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onModerateUser(
                                { ...incident.uploader, status: resolvedStatus },
                                "SUSPEND"
                              )
                            }
                            className="h-6 px-2 text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 rounded-lg cursor-pointer"
                            title="Suspend uploader account"
                          >
                            <UserX className="size-3 mr-1" />
                            <span>Suspend</span>
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onModerateUser(
                              { ...incident.uploader, status: resolvedStatus },
                              "BAN"
                            )
                          }
                          className="h-6 px-2 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 rounded-lg cursor-pointer"
                          title="Ban uploader account"
                        >
                          <Ban className="size-3 mr-1" />
                          <span>Ban</span>
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">Handle:</span>
                      {incident.uploader.username ? (
                        <Link
                          href={`/profile/${incident.uploader.username}`}
                          target="_blank"
                          className="font-semibold text-primary hover:underline text-xs inline-flex items-center gap-1"
                        >
                          <span>@{incident.uploader.username}</span>
                          <ArrowUpRight className="size-3" />
                        </Link>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">
                          {incident.uploader.id.slice(0, 8)}... (Deleted)
                        </span>
                      )}
                    </div>
                    {incident.uploader.email && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-xs">Email:</span>
                        <span className="font-mono text-foreground text-xs truncate max-w-[180px]">
                          {incident.uploader.email}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1 border-t border-border/50">
                      <span className="text-muted-foreground text-xs font-medium">
                        Account Status:
                      </span>
                      <UserStatusBadge status={resolvedStatus} size="sm" />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Target Scope */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Building className="size-3.5 text-primary" />
                <span>Target Organization</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">Target:</span>
                  {incident.organization ? (
                    <span className="font-semibold text-foreground text-xs">
                      {incident.organization.name || incident.organization.id.slice(0, 8)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Platform Scope (Standalone/Community)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Related Report */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <FileText className="size-3.5 text-primary" />
                <span>Associated Report</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">Report ID:</span>
                  {incident.reportId ? (
                    <Link
                      href={`/dashboard/report-management/${incident.reportId}`}
                      className="font-semibold text-primary hover:underline text-xs inline-flex items-center gap-1"
                    >
                      <span>#{incident.reportId.slice(0, 8)}</span>
                      <ArrowUpRight className="size-3" />
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      None (Direct attachment)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2">
          <a
            href={vtLookupUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
            <span>Open in VirusTotal GUI</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {scope === "admin" && incident.uploader.id && onModerateUser && (() => {
              const resolvedStatus =
                uploaderStatus || incident.uploader.status || "ACTIVE";
              const isSuspended = resolvedStatus.toUpperCase() === "SUSPENDED";

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground cursor-pointer shadow-2xs transition-colors"
                  >
                    <ShieldAlert className="size-3.5 text-primary" />
                    <span>Moderate User</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border border-border bg-popover text-popover-foreground">
                    <div className="px-3 py-2 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-foreground truncate">
                          {incident.uploader.username ? `@${incident.uploader.username}` : incident.uploader.id.slice(0, 8)}
                        </span>
                        <UserStatusBadge status={resolvedStatus} size="xs" />
                      </div>
                      {incident.uploader.email && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {incident.uploader.email}
                        </p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    {isSuspended ? (
                      <DropdownMenuItem
                        onClick={() =>
                          onModerateUser(
                            { ...incident.uploader, status: resolvedStatus },
                            "REINSTATE"
                          )
                        }
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer"
                      >
                        <RotateCcw className="size-4 mr-2" />
                        Reinstate Account
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() =>
                          onModerateUser(
                            { ...incident.uploader, status: resolvedStatus },
                            "SUSPEND"
                          )
                        }
                        className="text-xs font-semibold text-orange-600 dark:text-orange-400 cursor-pointer"
                      >
                        <UserX className="size-4 mr-2" />
                        Suspend Account
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() =>
                        onModerateUser(
                          { ...incident.uploader, status: resolvedStatus },
                          "BAN"
                        )
                      }
                      className="text-xs font-semibold text-purple-600 dark:text-purple-400 cursor-pointer"
                    >
                      <Ban className="size-4 mr-2" />
                      Permanently Ban Account
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        onModerateUser(
                          { ...incident.uploader, status: resolvedStatus },
                          "WARN"
                        )
                      }
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 cursor-pointer"
                    >
                      <ShieldAlert className="size-4 mr-2" />
                      Issue Security Warning
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl px-5 text-xs font-semibold cursor-pointer h-9"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
