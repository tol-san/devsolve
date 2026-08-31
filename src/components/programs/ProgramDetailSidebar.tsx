"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Calendar, FileText, Loader2 } from "lucide-react";
import { Program, ProgramDetail } from "@/lib/types/programs/types";
import { isPublished } from "@/lib/programs/draft-status";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";

interface ProgramDetailSidebarProps {
  program: ProgramDetail;
}

export const ProgramDetailSidebar: React.FC<ProgramDetailSidebarProps> = ({
  program,
}) => {
  const router = useRouter();
  const lp = useLocalePath();
  const { data: session } = authClient.useSession();
  const { handleLogin, isLoggingIn } = useKeycloakLogin();

  const handleSubmitReport = () => {
    /* Locale-prefixed: this is the return leg of "Change program" on the
       report form, and a bare path would bounce a Khmer reporter through a
       redirect back into English. */
    const targetUrl = lp(`/dashboard/submit-report?programId=${program.id}`);
    if (session?.user) {
      router.push(targetUrl);
    } else {
      handleLogin(targetUrl);
    }
  };

// this is the right bar card in the program detail

  return (
    <aside className="space-y-6">
      {/* Widget 1: Program Timeline */}
      <section className="bg-card p-4 sm:p-6 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Program Timeline
        </h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <dt className="text-muted-foreground font-medium">Start Date</dt>
            {/* <dd className="font-semibold text-slate-800">{program.createdAt || "June 1, 2025"}</dd> */}
            <span className="text-foreground">{program.createdAt?.split('T')[0]}</span>
          </div>
          {/* <div className="flex justify-between items-center">
            <dt className="text-slate-500 font-medium">End Date</dt>
            <dd className="font-semibold text-slate-800">{ "Aug 31, 2025"}</dd>
          </div> */}
          <div className="flex justify-between items-center">
            <dt className="text-muted-foreground font-medium">Status</dt>
            <dd className="font-medium text-muted-foreground flex items-center gap-1 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              {program.state}
            </dd>
          </div>
        </dl>
      </section>

      {/* Widget 2: Quick Stats */}
      <section className="bg-card p-4 sm:p-6 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Quick Stats
        </h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <dt className="text-muted-foreground font-medium">Total Reports</dt>
            <dd className="font-bold text-foreground">
              { 142}
            </dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-muted-foreground font-medium">Active Researchers</dt>
            <dd className="font-bold text-foreground">
              { 89}
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

      {/* Widget 3: CTA Card — researchers only, and only once the program is
          live. This sidebar is also what the owner previews from Saved drafts,
          where inviting someone to start testing against an unpublished
          program, and deep-linking a report form at it, has nothing behind
          it. */}
      {isPublished(program) && (
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
