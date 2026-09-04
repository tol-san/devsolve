"use client";

import { useGetMyOrganizationQuery } from "@/lib/redux/services/organizationsApi";
import { MyOrgCard } from "@/components/organizations/MyOrgCard";
import { OrgVerificationPanel } from "@/components/organizations/OrgVerificationPanel";
import { OrgActionsMenu } from "@/components/organizations/OrgActionsMenu";
import { motion } from "motion/react";
import { Building2, PlusCircle, RefreshCw, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function MyOrganizationDashboardPage() {
  const { data: organization, isLoading, isError, refetch } = useGetMyOrganizationQuery();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6 w-full pb-12"
      >
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Dashboard</span>
              <ChevronRight className="w-3 h-3" />
              <span>Organization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              My Organization
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your organization profile, verification status, and team preferences.
            </p>
          </div>
        </header>

        <div className="space-y-6 animate-pulse">
          <div className="h-64 bg-muted rounded-xl"></div>
          <div className="h-48 bg-muted rounded-xl"></div>
        </div>
      </motion.div>
    );
  }

  if (isError || !organization) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6 w-full pb-12"
      >
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1">
                <Home className="w-3 h-3" /> Dashboard
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="font-medium text-foreground">Organization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              My Organization
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your organization profile, verification status, and team preferences.
            </p>
          </div>
        </header>

        <Card className="border-border bg-card shadow-sm text-center py-12 px-6">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
              <Building2 className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              No Organization Found
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground max-w-md mx-auto">
              You are currently not associated with an active organization. Register your company or organization to launch security programs and invite team members.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/company-register">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                <PlusCircle className="w-4 h-4" />
                Register an Organization
              </Button>
            </Link>
            <Button variant="outline" onClick={() => refetch()} className="gap-2 border-border">
              <RefreshCw className="w-4 h-4" />
              Retry Fetch
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1">
              <Home className="w-3 h-3" /> Dashboard
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-medium text-foreground">Organization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            My Organization
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your organization profile, verification status, and team preferences.
          </p>
        </div>
      </header>

      <div className="space-y-6">
        <MyOrgCard organization={organization} />
        <OrgVerificationPanel />
        <OrgActionsMenu status={organization.status} />
      </div>
    </motion.div>
  );
}
