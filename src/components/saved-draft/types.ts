export type DraftCategory =
  | "all"
  | "problem"
  | "showcase"
  | "solution"
  | "program"
  | "response"
  | "report";

export type ProgramDraftKind = "bounty" | "response";

export type SavedDraftItem = {
  id: string;
  title: string;
  description: string;
  category: DraftCategory;
  tags: string[];
  updatedAt: string;
  updatedAtIso?: string;
  initials: string;
  logoSrc: string;
  logoAlt: string;
  problemId?: string;
  programDraftKind?: ProgramDraftKind;
  repoUrl?: string;
  liveUrl?: string;
  categoryName?: string;
  problemType?: string;
  approachType?: string;
  severity?: string;
  organizationName?: string;
};
