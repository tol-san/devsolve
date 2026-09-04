export type BookmarkCategory =
  | "all"
  | "Program"
  | "Problems"
  | "Solutions"
  | "Showcases";

export type BookmarkSeverity = "Critical" | "High" | "Medium" | "Low";

export type BookmarkableType = "PROGRAM" | "PROBLEM" | "SOLUTION" | "SHOWCASE";

export interface BookmarkItem {
  id: string;
  bookmarkableId: string;
  bookmarkableType: BookmarkableType;
  category: Exclude<BookmarkCategory, "all">;
  title: string;
  description: string;
  savedAt: string;
  tags: string[];
  url?: string;
  
  companyName?: string;
  logoUrl?: string;
  bountyMax?: string;
  programType?: "Bounty" | "Response" | "Vulnerability";
  inScopeCount?: number;

  severity?: BookmarkSeverity;
  points?: number;
  submissionsCount?: number;
  status?: "Open" | "Solved" | "In Review";

  authorName?: string;
  authorAvatar?: string;
  readTime?: string;
  likesCount?: number;
  targetProgram?: string;
}

export interface BookmarkFilterParams {
  category?: BookmarkCategory;
  search?: string;
  severity?: string;
  sortBy?: "newest" | "oldest" | "title";
}

export interface BookmarksResponse {
  data: BookmarkItem[];
  counts: {
    all: number;
    Program: number;
    Problems: number;
    Solutions: number;
    Showcases: number;
  };
  totalCount: number;
}
