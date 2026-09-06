import { Metadata } from "next";
import { NO_INDEX } from "@/lib/seo/metadata";
import { RequireRole } from "@/components/auth/RequireRole";
import { MyProgramInvitationsView } from "@/components/researchers/MyProgramInvitationsView";

export const metadata: Metadata = {
  title: "Private Programs · DevSolve",
  description: "View and manage private program invitations and active security scopes.",
  robots: NO_INDEX,
};

export default function ProgramInvitationsPage() {
  return (
    <RequireRole
      roles={["USER"]}
      title="This screen is for researchers"
      description="Your account signs in as a company, so there are no researcher invitations to show. To manage guest lists for your private programs, visit Program Management."
      action={{ href: "/dashboard/program-management", label: "Program Management" }}
    >
      <MyProgramInvitationsView />
    </RequireRole>
  );
}
