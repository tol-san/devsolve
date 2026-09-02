export type DiscussionCategory = "All" | "Problems" | "Showcase";

export type DiscussionSort = "newest" | "oldest" | "top" | "discussed" | "viewed";

// Topics are backend-driven categories (GET /categories) now, not a fixed
// frontend list, so this is just a semantic alias for a category name.
export type TopicFilter = string;

export interface DiscussionPost {
  id: string;
  title: string;
  category: "Problems" | "Showcase";
  /**
   * The sidebar's topic vocabulary for a problem. A showcase carries its own
   * category name here instead — that is what the backend gives it and what
   * the card badge should read — so the field is wider than `TopicFilter`.
   */
  topic: TopicFilter | (string & {});
  description: string;
  tags: string[];
  techStack?: string[];
  votes: number;
  answersCount: number;
  viewsCount: number;
  status?: "Solved" | "Open";
  thumbnailUrl?: string;
  author: {
    id?: string;
    name: string;
    avatarUrl: string;
    reputation?: number;
  };
  createdAt: string;
  /** Raw API timestamp used for stable cross-resource sorting. */
  sortTimestamp?: string;
  isBookmarked?: boolean;
  isUpvoted?: boolean;
}

/**
 * Topics are the problem categories in use, so a topic is whatever the backend
 * calls one. `TopicFilter` stays in the union to keep the original vocabulary
 * assignable and to preserve autocomplete on it.
 */
export type TopicName = TopicFilter | (string & {});

export interface TopicCount {
  name: TopicName;
  count: number;
  problemCategoryId?: string;
  showcaseCategoryId?: string;
}

export interface CommentItem {
  id: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  content: string;
  createdAt: string;
}

export interface SolutionItem {
  id: string;
  author: {
    name: string;
    avatarUrl: string;
    reputation: number;
  };
  type: "rich" | "basic";
  isAccepted?: boolean;
  votes: number;
  createdAt: string;
  explanation: string;
  
  // Rich solution fields
  stepByStep?: string[];
  codeFix?: string;
  hasDiagram?: boolean;
  hasVideo?: boolean;
  
  // Comments thread
  comments: CommentItem[];
}

export interface ProblemDetail {
  id: string;
  title: string;
  status: "Open" | "Solved";
  sdlcPhase: string;
  category: string;
  tags: string[];
  votes: number;
  description: string;
  codeSnippet?: string;
  postedBy: {
    name: string;
    avatarUrl: string;
    reputation: number;
  };
  postedDate: string;
  viewsCount: number;
  solutions: SolutionItem[];
}
