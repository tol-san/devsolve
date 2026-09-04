"use client";

import React, { useState, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ChevronLeft,
  Building2,
  User,
  Briefcase,
  Mail,
  Phone,
  Globe,
  MapPin,
  Activity,
  CheckCircle2,
  XCircle,
  Send,
  Hash,
  ShieldCheck,
  History,
  Users,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useGetAdminOrganizationByIdQuery,
  useApproveOrganizationMutation,
  useRejectOrganizationMutation,
  useGetOrganizationReviewHistoryQuery,
} from "@/lib/redux/services/adminApi";
import { MOCK_COMPANY_VERIFICATIONS } from "@/lib/redux/services/admin/adminMockData";
import { OrganizationReviewHistoryItem } from "@/lib/types/admin/types";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/organizations/statusUtils";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

const PRESET_REJECTION_REASONS = [
  "Incomplete or unverifiable business registration documents.",
  "Domain ownership could not be verified.",
  "Provided contact email does not match official company domain.",
  "Invalid business tax ID or registration credentials.",
];

function InfoField({
  icon: Icon,
  label,
  children,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {label}
        </span>
        {action}
      </div>
      <div className="text-sm font-semibold text-foreground break-words leading-snug">
        {children}
      </div>
    </div>
  );
}

export default function OrganizationVerificationDetailPage({
  params,
}: DetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const companyId = resolvedParams.id;

  const isUuid = useMemo(
    () =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        companyId || "",
      ),
    [companyId],
  );

  const {
    data: realOrg,
    isLoading: isOrgLoading,
    isFetching: isOrgFetching,
    isError: isOrgError,
  } = useGetAdminOrganizationByIdQuery(companyId, {
    skip: !companyId || !isUuid,
  });

  const { data: rawReviewHistory } = useGetOrganizationReviewHistoryQuery(
    companyId,
    {
      skip: !companyId || !isUuid || isOrgError,
    },
  );

  const [approveOrganization, { isLoading: isApproving }] =
    useApproveOrganizationMutation();
  const [rejectOrganization, { isLoading: isRejecting }] =
    useRejectOrganizationMutation();

  const isUpdating = isApproving || isRejecting;

  const mockOrg = useMemo(
    () => MOCK_COMPANY_VERIFICATIONS.find((c) => c.id === companyId),
    [companyId],
  );

  const isLoading = isUuid && (isOrgLoading || isOrgFetching);
  const isError = (isUuid && isOrgError && !mockOrg) || (!isUuid && !mockOrg);

  const company = useMemo(() => {
    if (realOrg) {
      return {
        id: realOrg.id,
        companyName: realOrg.name,
        contactName:
          realOrg.ownerFullName ||
          (realOrg.ownerId ? `Owner (${realOrg.ownerId.slice(0, 8)})` : "—"),
        jobTitle: realOrg.ownerJobTitle || "Organization Owner",
        email:
          realOrg.ownerEmail ||
          `${realOrg.slug || "contact"}@${realOrg.domain || "organization.com"}`,
        phone: "—",
        website: realOrg.websiteUrl,
        domain: realOrg.domain,
        country: realOrg.country ?? "—",
        industry: realOrg.industry,
        businessType: realOrg.industry ?? "Technology",
        companySize: realOrg.companySize,
        description: realOrg.description,
        joiningReason: realOrg.joiningReason,
        emailVerified: realOrg.emailVerified ?? false,
        submissionVersion: realOrg.submissionVersion ?? 1,
        rejectionReason: realOrg.rejectionReason,
        reviewedAt: realOrg.reviewedAt,
        verifiedAt: realOrg.verifiedAt,
        status: (realOrg.status === "ACTIVE"
          ? "APPROVED"
          : realOrg.status === "PENDING"
            ? "PENDING"
            : "REJECTED") as "APPROVED" | "PENDING" | "REJECTED",
        submittedAt: realOrg.createdAt
          ? new Date(realOrg.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : undefined,
        registrationDate: realOrg.createdAt
          ? new Date(realOrg.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—",
        orgCode: realOrg.slug,
      };
    }
    return mockOrg ?? null;
  }, [realOrg, mockOrg]);

  const reviewHistory = rawReviewHistory;

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmApprove = async () => {
    if (!company) return;
    try {
      await approveOrganization({ id: company.id }).unwrap();

      setIsApproveModalOpen(false);
      toast.success("Organization Approved", {
        description: `${company.companyName} is now verified. Redirecting to verifications...`,
      });

      router.push("/dashboard/company-verification");
    } catch (err: unknown) {
      const errorData = err as { data?: { message?: string } };
      const message =
        errorData?.data?.message ??
        "Failed to approve organization. Please try again.";
      toast.error("Approval Failed", { description: message });
    }
  };

  const handleConfirmReject = async () => {
    if (!company) return;
    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason) {
      setRejectionError(
        "Please provide a reason for rejecting the application.",
      );
      return;
    }

    if (trimmedReason.length > 1000) {
      setRejectionError("Rejection reason must be 1000 characters or less.");
      return;
    }

    setRejectionError(null);

    try {
      await rejectOrganization({
        id: company.id,
        reason: trimmedReason,
      }).unwrap();

      setIsRejectModalOpen(false);
      setRejectionReason("");
      toast.success("Organization Rejected", {
        description: `${company.companyName} verification request was rejected. Redirecting...`,
      });

      router.push("/dashboard/company-verification");
    } catch (err: unknown) {
      const errorData = err as { data?: { message?: string } };
      const message =
        errorData?.data?.message ??
        "Failed to reject organization. Please try again.";
      toast.error("Rejection Failed", { description: message });
    }
  };

  const displayValue = (val: string | undefined | null, fallback = "—") =>
    val?.trim() || fallback;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6 w-full pb-12 animate-pulse"
      >
        <div className="h-4 w-44 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (isError || !company) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6 w-full pb-12"
      >
        <nav className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link
            href="/dashboard/company-verification"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Organizations
          </Link>
        </nav>
        <Card className="bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 p-8 text-center space-y-4 max-w-md mx-auto my-12 shadow-2xs">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-foreground">
            Organization Not Found
          </h2>
          <p className="text-sm text-muted-foreground">
            The requested organization details could not be retrieved from the
            server.
          </p>
          <Button
            onClick={() => router.push("/dashboard/company-verification")}
            className="rounded-xl px-5 h-10 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Back to Organizations List
          </Button>
        </Card>
      </motion.div>
    );
  }

  const isFinalized =
    company.status === "APPROVED" || company.status === "REJECTED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <nav className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Link
          href="/dashboard/company-verification"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Organizations
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold truncate max-w-60">
          {company.companyName}
        </span>
      </nav>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 border border-border shadow-sm flex items-center justify-center font-bold text-white text-2xl shrink-0">
            {company.companyName.charAt(0)}
          </div>
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                {company.companyName}
              </h1>
              {company.orgCode && (
                <button
                  type="button"
                  onClick={() => handleCopy(company.orgCode!, "Slug")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Copy slug"
                >
                  {copiedField === "Slug" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {company.orgCode}
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={company.status} showIcon={false} />

              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold border-border text-muted-foreground bg-muted/60"
              >
                {company.industry ?? company.businessType}
              </Badge>

              {company.emailVerified && (
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  Email Verified
                </Badge>
              )}

              {company.submissionVersion && company.submissionVersion > 1 && (
                <Badge
                  variant="secondary"
                  className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                >
                  Version {company.submissionVersion}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="text-left md:text-right shrink-0 bg-muted/40 p-3 sm:p-0 rounded-xl sm:bg-transparent border border-border sm:border-none">
          <span className="text-xs text-muted-foreground font-medium block">
            Submitted Date
          </span>
          <span className="text-sm font-bold text-foreground block mt-0.5">
            {company.submittedAt ?? company.registrationDate ?? "—"}
          </span>
        </div>
      </header>

      {company.status === "APPROVED" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-3 text-emerald-900 dark:text-emerald-200 shadow-2xs"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 flex-1">
            <h4 className="text-sm font-bold">
              Organization Approved & Active
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
              This organization has passed verification review and has full
              access to managing bounty programs.
              {company.verifiedAt && (
                <span>
                  {" "}
                  Verified on{" "}
                  {new Date(company.verifiedAt).toLocaleDateString()}.
                </span>
              )}
            </p>
          </div>
        </motion.div>
      )}

      {company.status === "REJECTED" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-start gap-3 text-rose-900 dark:text-rose-200 shadow-2xs"
        >
          <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-bold">
              Verification Application Rejected
            </h4>
            {company.rejectionReason && (
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl text-xs font-medium text-rose-800 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60">
                <span className="font-bold block text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-0.5">
                  Rejection Reason:
                </span>
                &ldquo;{company.rejectionReason}&rdquo;
              </div>
            )}
            {company.reviewedAt && (
              <p className="text-xs text-rose-600 dark:text-rose-400 pt-0.5">
                Reviewed on {new Date(company.reviewedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  Verification Decision
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isFinalized
                    ? "Decision has been recorded for this application."
                    : "Review organization details and take immediate action."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isFinalized ? (
                  <Badge
                    variant="outline"
                    className="px-3 py-1 text-xs font-semibold text-muted-foreground border-border"
                  >
                    Decision Finalized
                  </Badge>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRejectionReason("");
                        setRejectionError(null);
                        setIsRejectModalOpen(true);
                      }}
                      disabled={isUpdating}
                      className="rounded-xl px-4 h-10 text-sm font-semibold border-rose-300 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-400 transition-colors gap-2 cursor-pointer shadow-2xs"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Application
                    </Button>

                    <Button
                      onClick={() => setIsApproveModalOpen(true)}
                      disabled={isUpdating}
                      className="rounded-xl px-5 h-10 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors gap-2 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Application
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          <Card className="bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 p-6 shadow-2xs space-y-6">
            <h2 className="text-base font-bold text-foreground pb-3 border-b border-border flex items-center justify-between">
              <span>Company Information</span>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <InfoField icon={Building2} label="Organization Name">
                {displayValue(company.companyName)}
              </InfoField>

              <InfoField icon={User} label="Owner / Contact Name">
                {displayValue(company.contactName)}
              </InfoField>

              <InfoField icon={Briefcase} label="Owner Job Title">
                {displayValue(company.jobTitle)}
              </InfoField>

              <InfoField
                icon={Mail}
                label="Contact Email"
                action={
                  company.email ? (
                    <button
                      type="button"
                      onClick={() => handleCopy(company.email!, "Email")}
                      className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      title="Copy email"
                    >
                      {copiedField === "Email" ? "Copied" : "Copy"}
                    </button>
                  ) : null
                }
              >
                <a
                  href={`mailto:${company.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  {displayValue(company.email)}
                </a>
              </InfoField>

              <InfoField icon={Phone} label="Phone">
                {displayValue(company.phone)}
              </InfoField>

              <InfoField icon={Globe} label="Website">
                {company.website || company.domain ? (
                  <a
                    href={
                      company.website
                        ? company.website.startsWith("http")
                          ? company.website
                          : `https://${company.website}`
                        : `https://${company.domain}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    {company.website ?? `https://${company.domain}`}
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                ) : (
                  "—"
                )}
              </InfoField>

              <InfoField icon={MapPin} label="Country">
                {displayValue(company.country)}
              </InfoField>

              <InfoField icon={Activity} label="Industry">
                {displayValue(company.industry ?? company.businessType)}
              </InfoField>

              {company.companySize && (
                <InfoField icon={Users} label="Company Size">
                  {displayValue(company.companySize)}
                </InfoField>
              )}
            </div>

            {company.joiningReason && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Joining Reason & Goal
                </span>
                <div className="bg-muted/50 p-4 rounded-xl text-sm text-foreground border border-border leading-relaxed">
                  {company.joiningReason}
                </div>
              </div>
            )}

            {company.description && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Company Overview
                </span>
                <div className="bg-muted/50 p-4 rounded-xl text-sm text-foreground border border-border leading-relaxed">
                  {company.description}
                </div>
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              Verification Signals
            </h3>

            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <Mail className="w-3.5 h-3.5" />
                  Email Verified
                </dt>
                <dd>
                  {company.emailVerified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                <dt className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <Globe className="w-3.5 h-3.5" />
                  Domain Match
                </dt>
                <dd className="font-semibold text-foreground text-right truncate max-w-35">
                  {displayValue(company.domain)}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                <dt className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <Hash className="w-3.5 h-3.5" />
                  Organization Code
                </dt>
                <dd className="font-mono font-semibold text-foreground text-right">
                  {displayValue(company.orgCode)}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                <dt className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  Submitted Date
                </dt>
                <dd className="font-semibold text-foreground text-right">
                  {displayValue(
                    company.submittedAt ?? company.registrationDate,
                  )}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                <dt className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Status
                </dt>
                <dd>
                  <StatusBadge status={company.status} />
                </dd>
              </div>
            </dl>
          </Card>

          {reviewHistory && reviewHistory.length > 0 && (
            <Card className="bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-500" />
                Review History Timeline
              </h3>
              <div className="space-y-3 pt-1">
                {reviewHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-muted/50 rounded-xl text-xs space-y-1 border border-border"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span
                        className={
                          item.decision === "APPROVED" ||
                          item.action === "APPROVED"
                            ? "text-emerald-600 dark:text-emerald-400 font-bold"
                            : item.decision === "REJECTED" ||
                                item.action === "REJECTED"
                              ? "text-rose-600 dark:text-rose-400 font-bold"
                              : "text-foreground"
                        }
                      >
                        {item.decision ?? item.action ?? "REVIEW"}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        {item.reviewedAt || item.createdAt
                          ? new Date(
                              item.reviewedAt || item.createdAt!,
                            ).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>

                    {(item.reviewerName || item.reviewerId) && (
                      <p className="text-muted-foreground text-[11px]">
                        Reviewer:{" "}
                        {item.reviewerName ?? item.reviewerId?.slice(0, 8)}
                      </p>
                    )}

                    {(item.reason || item.notes) && (
                      <p className="text-muted-foreground italic pt-1 border-t border-border leading-relaxed">
                        &ldquo;{item.reason ?? item.notes}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-foreground">
              Quick Actions
            </h3>

            <div className="space-y-2">
              {company.email && company.email !== "—" && (
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-accent border border-border transition-colors group cursor-pointer"
                >
                  <Send className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                  Email Owner
                </a>
              )}

              {(company.website || company.domain) && (
                <a
                  href={
                    company.website
                      ? company.website.startsWith("http")
                        ? company.website
                        : `https://${company.website}`
                      : `https://${company.domain}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors group cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                  Visit Website
                </a>
              )}

              <button
                type="button"
                onClick={() => handleCopy(company.id, "Organization ID")}
                className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors group cursor-pointer"
              >
                <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                Copy Organization ID
              </button>
            </div>
          </Card>
        </aside>
      </div>

      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Approve Organization Application?
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to approve{" "}
              <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                {company.companyName}
              </strong>
              ? This will grant them verified organization status and enable
              program publishing capabilities.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsApproveModalOpen(false)}
              disabled={isApproving}
              className="rounded-xl h-10 px-4 text-sm font-semibold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmApprove}
              disabled={isApproving}
              className="rounded-xl h-10 px-5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 cursor-pointer"
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Reject Organization Application
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Please provide a clear reason for rejecting{" "}
              <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                {company.companyName}
              </strong>
              . This reason will be recorded in the audit history and sent to
              the applicant.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Quick Reasons
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REJECTION_REASONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setRejectionReason(preset);
                    setRejectionError(null);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-left font-medium cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="rejection-reason-input"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {rejectionReason.length}/1000 chars
              </span>
            </div>
            <textarea
              id="rejection-reason-input"
              rows={4}
              maxLength={1000}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (rejectionError) setRejectionError(null);
              }}
              placeholder="Explain why this verification request is rejected..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs resize-none"
            />
            {rejectionError && (
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {rejectionError}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={isRejecting}
              className="rounded-xl h-10 px-4 text-sm font-semibold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmReject}
              disabled={isRejecting || !rejectionReason.trim()}
              className="rounded-xl h-10 px-5 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isRejecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Reject Organization
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
