import type { RoleFilter, StatusFilter } from "@/components/teams/types";

/* The roster itself comes from `GET /organizations/me/members`; the fixture
   that used to sit here was unreferenced. What remains is the filter
   vocabulary, which is UI, not data. */

export const ROLE_FILTERS: RoleFilter[] = [
  "All",
  "Manager",
  "Member",
  "Viewer",
];

export const STATUS_FILTERS: StatusFilter[] = ["All", "Active", "Pending"];
