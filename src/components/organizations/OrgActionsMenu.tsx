"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  OrganizationStatus,
  useDeleteMyOrganizationMutation,
  useResubmitOrganizationMutation,
} from "@/lib/redux/services/organizationsApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Users, PlusCircle, Trash2, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface OrgActionsMenuProps {
  status: OrganizationStatus;
}

export function OrgActionsMenu({ status }: OrgActionsMenuProps) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteOrg, { isLoading: isDeleting }] = useDeleteMyOrganizationMutation();
  const [resubmitOrg, { isLoading: isResubmitting }] = useResubmitOrganizationMutation();

  const handleDelete = async () => {
    try {
      await deleteOrg().unwrap();
      toast.success("Organization Deleted", {
        description: "Your organization account has been deleted.",
      });
      setIsDeleteOpen(false);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Failed to delete organization.";
      toast.error("Deletion Failed", { description: msg });
    }
  };

  const handleResubmit = async () => {
    try {
      await resubmitOrg().unwrap();
      toast.success("Organization Resubmitted", {
        description: "Your organization application has been resubmitted for review.",
      });
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Failed to resubmit organization.";
      toast.error("Resubmit Failed", { description: msg });
    }
  };

  return (
    <>
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Quick Management & Actions
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Common administrative tasks and settings for your organization.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/dashboard/teams">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 px-4 border-border hover:bg-muted text-foreground"
              >
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-semibold">Manage Team Members</div>
                  <div className="text-xs text-muted-foreground">Invite, edit roles and permissions</div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/create-program">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 px-4 border-border hover:bg-muted text-foreground"
              >
                <PlusCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-semibold">Launch New Program</div>
                  <div className="text-xs text-muted-foreground">Create a bug bounty or disclosure policy</div>
                </div>
              </Button>
            </Link>
          </div>

          <div className="border-t border-border pt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              {status === "REJECTED" && (
                <Button
                  onClick={handleResubmit}
                  disabled={isResubmitting}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                >
                  <RefreshCw className={`w-4 h-4 ${isResubmitting ? "animate-spin" : ""}`} />
                  {isResubmitting ? "Resubmitting..." : "Resubmit Organization Review"}
                </Button>
              )}
            </div>

            <Button
              onClick={() => setIsDeleteOpen(true)}
              variant="outline"
              size="sm"
              className="gap-2 border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300"
            >
              <Trash2 className="w-4 h-4" />
              Delete Organization
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Organization
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              Are you sure you want to delete your organization? This action is <strong className="text-rose-600">permanent</strong> and will remove all programs, team member access, and associated verification records.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
