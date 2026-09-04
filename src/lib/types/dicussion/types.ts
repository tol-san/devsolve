export type DiscussionCategory = "All" | "Problems" | "Showcase";

export type DiscussionSort = "newest" | "oldest" | "top" | "discussed" | "viewed";

export type TopicFilter = string;

export interface DiscussionPost {
  id: string;
  title: string;
  category: "Problems" | "Showcase";
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
  sortTimestamp?: string;
  isBookmarked?: boolean;
  isUpvoted?: boolean;
}

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
  
  stepByStep?: string[];
  codeFix?: string;
  hasDiagram?: boolean;
  hasVideo?: boolean;
  
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
