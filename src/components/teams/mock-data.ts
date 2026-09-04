import type { RoleFilter, StatusFilter } from "@/components/teams/types";

export const ROLE_FILTERS: RoleFilter[] = [
  "All",
  "Manager",
  "Member",
  "Viewer",
];

export const STATUS_FILTERS: StatusFilter[] = ["All", "Active", "Invited"];
