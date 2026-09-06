"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Zap,
  Calendar,
  FileText,
  Loader2,
  Clock,
  Building2,
  CheckCircle2,
  Globe,
  ArrowRight,
} from "lucide-react";
import { ProgramDetail } from "@/lib/types/programs/types";
import { isPublished, isUnderReview } from "@/lib/programs/draft-status";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth/auth-client";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useGetMyProgramInvitationsQuery } from "@/lib/redux/services/programInvitationsApi";
import { useGetOrganizationByIdQuery } from "@/lib/redux/services/organizationsApi";

interface ProgramDetailSidebarProps {
  program: ProgramDetail;
  isOwnProgram?: boolean;
}

export const ProgramDetailSidebar: React.FC<ProgramDetailSidebarProps> = ({
  program,
  isOwnProgram: isOwnProgramProp,
}) => {
  const router = useRouter();
  const lp = useLocalePath();
  const { data: session } = authClient.useSession();
  const { handleLogin, isLoggingIn } = useKeycloakLogin();
  const { memberships, membership, hasCompanyAccess } = useCompanyAccess();

  const isPrivate =
    program.visibility === "PRIVATE" || program.visibility === "INVITE_ONLY";

  const { data: myInvitationsData } = useGetMyProgramInvitationsQuery(
    { page: 0, size: 100 },
    { skip: !isPrivate || !session?.user }
  );

  const matchedInvitation =
    isPrivate && myInvitationsData?.content
      ? myInvitationsData.content.find((inv) => {
          const lowerId = program.id?.toLowerCase();
          const lowerHandle = program.handle?.toLowerCase();
          return (
            inv.programId?.toLowerCase() === lowerId ||
            (lowerHandle && inv.programHandle?.toLowerCase() === lowerHandle)
          );
        }) ?? null
      : null;

  const programOrgId = program.organizationId || program.organization?.id;
  const isCompanyOwnerOfProgram = Boolean(
    hasCompanyAccess &&
      ((programOrgId &&
        (memberships?.some(
          (m) => m.organizationId.toLowerCase() === programOrgId.toLowerCase(),
        ) ||
          membership?.organizationId?.toLowerCase() ===
            programOrgId.toLowerCase())) ||
        (program.organizationName &&
          (memberships?.some(
            (m) =>
              m.organizationName?.toLowerCase() ===
              program.organizationName?.toLowerCase(),
          ) ||
            membership?.organizationName?.toLowerCase() ===
              program.organizationName?.toLowerCase()))),
  );

  const isOwnProgram = isOwnProgramProp ?? isCompanyOwnerOfProgram;

  const isPendingReview =
    isUnderReview(program) || program.submissionState === "PENDING_REVIEW";

  const isInvitedPending =
    isPrivate && !isOwnProgram && matchedInvitation?.status === "INVITED";
  const isPrivateAccepted =
    isPrivate && matchedInvitation?.status === "ACCEPTED";

  const canSubmitReport =
    isPublished(program) &&
    !isPendingReview &&
    !isOwnProgram &&
    (!isPrivate || isPrivateAccepted);

  const effectiveOrgId = program.organization?.id || program.organizationId;
  const { data: fetchedOrg } = useGetOrganizationByIdQuery(effectiveOrgId ?? "", {
    skip: !effectiveOrgId || Boolean(program.organization?.logoUrl && program.organization?.name),
  });
  const org = program.organization || fetchedOrg;
  const [imageError, setImageError] = React.useState(false);
  const orgLogoUrl = !imageError ? (org?.logoUrl || program.logoUrl) : null;
  const orgName = org?.name || program.organizationName || "Organization";
  const initials =
    orgName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "OR";

  const handleSubmitReport = () => {
    const targetUrl = lp(`/dashboard/submit-report?programId=${program.id}`);
    if (session?.user) {
      router.push(targetUrl);
    } else {
      handleLogin(targetUrl);
    }
  };

  return (
    <aside className="space-y-6">
      {/* Organization Profile Card */}
      {(org || program.organizationName) && (
        <section className="bg-card p-5 sm:p-6 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Organization</span>
            </h3>
            {org?.verifiedAt && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold rounded-full px-2 py-0.5 gap-1">
                <CheckCircle2 className="size-3" />
                <span>Verified</span>
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {orgLogoUrl ? (
                <Image
                  src={orgLogoUrl}
                  alt={orgName}
                  width={48}
                  height={48}
                  className="size-10 object-contain"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              ) : (
                <span className="text-sm font-bold text-foreground">
                  {initials}
                </span>
              )}
            </div>

            <div className="min-w-0 space-y-0.5 flex-1">
              <h4 className="text-sm font-bold text-foreground truncate">
                {orgName}
              </h4>
              {org?.websiteUrl && (
                <a
                  href={org.websiteUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 truncate"
                >
                  <Globe className="size-3 shrink-0" />
                  <span className="truncate">{org.websiteUrl.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
            </div>
          </div>

          {org?.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {org.description}
            </p>
          )}

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            {org?.industry && (
              <span className="font-medium bg-muted px-2 py-0.5 rounded-md text-[11px] text-foreground">
                {org.industry}
              </span>
            )}
            {effectiveOrgId && (
              <Link
                href={lp(`/company?id=${effectiveOrgId}`)}
                className="text-primary font-semibold hover:underline inline-flex items-center gap-1 ml-auto text-xs"
              >
                <span>View Profile</span>
                <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        </section>
      )}

      <section className="bg-card p-4 sm:p-6 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Program Timeline
        </h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <dt className="text-muted-foreground font-medium">Start Date</dt>
            <span className="text-foreground">{program.createdAt?.split("T")[0]}</span>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-muted-foreground font-medium">Status</dt>
            <dd className="font-medium text-muted-foreground flex items-center gap-1 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              {program.state}
            </dd>
          </div>
        </dl>
      </section>

      <section className="bg-card p-4 sm:p-6 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Quick Stats
        </h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <dt className="text-muted-foreground font-medium">Total Reports</dt>
            <dd className="font-bold text-foreground">
              {142}
            </dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-muted-foreground font-medium">Active Researchers</dt>
            <dd className="font-bold text-foreground">
              {89}
            </dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-muted-foreground font-medium">Program Type</dt>
            <dd className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100 text-xs dark:text-blue-300 dark:bg-blue-500/10 dark:border-blue-500/20">
              {program.engagementType ?? "Not set"}
            </dd>
          </div>
        </dl>
      </section>

      {isInvitedPending && (
        <section className="bg-card p-6 rounded-2xl ring-1 ring-amber-500/20 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
            <Clock className="w-4 h-4" />
            <span>Invitation Pending</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You have received an invitation to this private program. Please review and accept your invitation before submitting vulnerability reports.
          </p>
          <Link href={lp("/dashboard/program-invitations")} className="block">
            <Button
              className="w-full h-10 rounded-xl font-semibold text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs"
            >
              Review Invitation
            </Button>
          </Link>
        </section>
      )}

      {canSubmitReport && (
        <section className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl" />
          <div className="space-y-2 relative z-10">
            <h3 className="text-lg font-bold tracking-tight">Ready to start?</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Read the scope and rules carefully before testing.
            </p>
          </div>

          <div className="block relative z-10">
            <Button
              onClick={handleSubmitReport}
              disabled={isLoggingIn}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold gap-2 shadow-sm cursor-pointer"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Submit a Report
            </Button>
          </div>
        </section>
      )}
    </aside>
  );
};
