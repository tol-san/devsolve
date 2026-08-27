export type DraftCategory = "all" | "program" | "response" | "report";

export type ProgramDraftKind = "bounty" | "response";

export type SavedDraftItem = {
  id: string;
  title: string;
  description: string;
  category: DraftCategory;
  tags: string[];
  updatedAt: string;
  /** The raw instant behind `updatedAt`, which is a formatted date and cannot
      be ordered. Absent only on an item built without one. */
  updatedAtIso?: string;
  initials: string;
  logoSrc: string;
  logoAlt: string;
  programDraftKind?: ProgramDraftKind;
};
