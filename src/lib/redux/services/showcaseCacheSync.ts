import { baseApi } from "./baseApi";

interface PatchResult {
  undo: () => void;
}

function patchQuery(
  dispatch: any,
  endpointName: string,
  args: any,
  recipe: (draft: any) => void,
): PatchResult {
  return dispatch((baseApi.util as any).updateQueryData(endpointName, args, recipe));
}

export function crossPatchShowcaseVote(
  dispatch: any,
  getState: () => any,
  showcaseId: string,
  action: { type: "SET"; value: 1 | -1 } | { type: "REMOVE" },
): PatchResult {
  const state = getState();
  const queries = state?.[baseApi.reducerPath]?.queries ?? {};

  // 1. Determine previous vote from existing queries
  let prevVote: "UP" | "DOWN" | null = null;

  for (const entry of Object.values<any>(queries)) {
    if (!entry || entry.status !== "fulfilled" || !entry.data) continue;

    if (entry.endpointName === "getShowcaseById" && entry.originalArgs === showcaseId) {
      if (entry.data?.viewer?.vote) {
        prevVote = entry.data.viewer.vote;
        break;
      }
    }

    if (
      entry.endpointName === "getVoteSummary" &&
      entry.originalArgs?.type === "SHOWCASE" &&
      entry.originalArgs?.targetId === showcaseId
    ) {
      const cv = entry.data?.currentUserVote;
      if (cv === 1) prevVote = "UP";
      else if (cv === -1) prevVote = "DOWN";
      break;
    }

    if (entry.endpointName === "getDiscussions" && Array.isArray(entry.data?.data)) {
      const post = entry.data.data.find((p: any) => p.id === showcaseId);
      if (post?.viewer?.vote) {
        prevVote = post.viewer.vote;
        break;
      } else if (post?.isUpvoted) {
        prevVote = "UP";
        break;
      }
    }

    if (
      (entry.endpointName === "getShowcases" ||
        entry.endpointName === "getMyShowcases" ||
        entry.endpointName === "getUserShowcases") &&
      Array.isArray(entry.data?.content)
    ) {
      const item = entry.data.content.find((s: any) => s.id === showcaseId);
      if (item?.viewer?.vote) {
        prevVote = item.viewer.vote;
        break;
      }
    }
  }

  // 2. Calculate score and count deltas
  let deltaScore = 0;
  let deltaUp = 0;
  let deltaDown = 0;
  let newVote: "UP" | "DOWN" | null = null;

  if (action.type === "REMOVE") {
    newVote = null;
    if (prevVote === "UP") {
      deltaScore = -1;
      deltaUp = -1;
    } else if (prevVote === "DOWN") {
      deltaScore = 1;
      deltaDown = -1;
    }
  } else {
    const dir = action.value === 1 ? "UP" : "DOWN";
    newVote = dir;
    if (dir === "UP") {
      if (prevVote === "DOWN") {
        deltaScore = 2;
        deltaUp = 1;
        deltaDown = -1;
      } else if (prevVote !== "UP") {
        deltaScore = 1;
        deltaUp = 1;
      }
    } else {
      if (prevVote === "UP") {
        deltaScore = -2;
        deltaDown = 1;
        deltaUp = -1;
      } else if (prevVote !== "DOWN") {
        deltaScore = -1;
        deltaDown = 1;
      }
    }
  }

  const patches: PatchResult[] = [];

  // 3. Dispatch updateQueryData to all active matching queries
  for (const entry of Object.values<any>(queries)) {
    if (!entry || entry.status !== "fulfilled") continue;

    // getShowcaseById
    if (entry.endpointName === "getShowcaseById" && entry.originalArgs === showcaseId) {
      const patch = patchQuery(dispatch, "getShowcaseById", entry.originalArgs, (draft: any) => {
        if (!draft) return;
        if (!draft.engagement) {
          draft.engagement = { voteScore: 0, upvoteCount: 0, downvoteCount: 0, bookmarkCount: 0, followerCount: 0 };
        }
        if (!draft.viewer) {
          draft.viewer = {
            vote: null,
            bookmarked: false,
            following: false,
            followingAuthor: false,
            owner: false,
            canEdit: false,
            canDelete: false,
            editUnderReview: false,
          };
        }
        draft.engagement.voteScore += deltaScore;
        draft.engagement.upvoteCount = Math.max(0, draft.engagement.upvoteCount + deltaUp);
        draft.engagement.downvoteCount = Math.max(0, draft.engagement.downvoteCount + deltaDown);
        draft.viewer.vote = newVote;
      });
      patches.push(patch);
    }

    // getDiscussionById
    if (entry.endpointName === "getDiscussionById" && entry.originalArgs === showcaseId) {
      const patch = patchQuery(dispatch, "getDiscussionById", entry.originalArgs, (draft: any) => {
        if (!draft) return;
        draft.votes += deltaScore;
        draft.isUpvoted = newVote === "UP";
        if (draft.engagement) {
          draft.engagement.voteScore += deltaScore;
          draft.engagement.upvoteCount = Math.max(0, draft.engagement.upvoteCount + deltaUp);
          draft.engagement.downvoteCount = Math.max(0, draft.engagement.downvoteCount + deltaDown);
        }
        if (draft.viewer) {
          draft.viewer.vote = newVote;
        }
      });
      patches.push(patch);
    }

    // getVoteSummary
    if (
      entry.endpointName === "getVoteSummary" &&
      entry.originalArgs?.type === "SHOWCASE" &&
      entry.originalArgs?.targetId === showcaseId
    ) {
      const patch = patchQuery(dispatch, "getVoteSummary", entry.originalArgs, (draft: any) => {
        if (!draft) return;
        draft.score += deltaScore;
        draft.upvotes = Math.max(0, draft.upvotes + deltaUp);
        draft.downvotes = Math.max(0, draft.downvotes + deltaDown);
        draft.currentUserVote = newVote === "UP" ? 1 : newVote === "DOWN" ? -1 : null;
      });
      patches.push(patch);
    }

    // getDiscussions
    if (entry.endpointName === "getDiscussions") {
      const patch = patchQuery(dispatch, "getDiscussions", entry.originalArgs, (draft: any) => {
        if (!draft?.data) return;
        const post = draft.data.find((p: any) => p.id === showcaseId);
        if (!post) return;
        post.votes += deltaScore;
        post.isUpvoted = newVote === "UP";
        if (!post.engagement) {
          post.engagement = {
            voteScore: post.votes,
            upvoteCount: 0,
            downvoteCount: 0,
            bookmarkCount: 0,
            followerCount: 0,
          };
        }
        post.engagement.voteScore += deltaScore;
        post.engagement.upvoteCount = Math.max(0, post.engagement.upvoteCount + deltaUp);
        post.engagement.downvoteCount = Math.max(0, post.engagement.downvoteCount + deltaDown);
        if (!post.viewer) {
          post.viewer = {
            vote: null,
            bookmarked: false,
            following: false,
            followingAuthor: false,
            owner: false,
            canEdit: false,
            canDelete: false,
            editUnderReview: false,
          };
        }
        post.viewer.vote = newVote;
      });
      patches.push(patch);
    }

    // getShowcases, getMyShowcases, getUserShowcases
    if (
      entry.endpointName === "getShowcases" ||
      entry.endpointName === "getMyShowcases" ||
      entry.endpointName === "getUserShowcases"
    ) {
      const patch = patchQuery(dispatch, entry.endpointName, entry.originalArgs, (draft: any) => {
        if (!draft?.content) return;
        const item = draft.content.find((s: any) => s.id === showcaseId);
        if (!item) return;
        if (!item.engagement) {
          item.engagement = {
            voteScore: 0,
            upvoteCount: 0,
            downvoteCount: 0,
            bookmarkCount: 0,
            followerCount: 0,
          };
        }
        item.engagement.voteScore += deltaScore;
        item.engagement.upvoteCount = Math.max(0, item.engagement.upvoteCount + deltaUp);
        item.engagement.downvoteCount = Math.max(0, item.engagement.downvoteCount + deltaDown);
        if (!item.viewer) {
          item.viewer = {
            vote: null,
            bookmarked: false,
            following: false,
            followingAuthor: false,
            owner: false,
            canEdit: false,
            canDelete: false,
            editUnderReview: false,
          };
        }
        item.viewer.vote = newVote;
      });
      patches.push(patch);
    }
  }

  return {
    undo: () => {
      for (const p of patches) {
        try {
          p.undo();
        } catch {
          // ignore undo errors
        }
      }
    },
  };
}

export function crossPatchShowcaseBookmark(
  dispatch: any,
  getState: () => any,
  showcaseId: string,
  isBookmarked: boolean,
): PatchResult {
  const state = getState();
  const queries = state?.[baseApi.reducerPath]?.queries ?? {};
  const delta = isBookmarked ? 1 : -1;
  const patches: PatchResult[] = [];

  for (const entry of Object.values<any>(queries)) {
    if (!entry || entry.status !== "fulfilled") continue;

    // getShowcaseById
    if (entry.endpointName === "getShowcaseById" && entry.originalArgs === showcaseId) {
      const patch = patchQuery(dispatch, "getShowcaseById", entry.originalArgs, (draft: any) => {
        if (!draft) return;
        if (!draft.engagement) {
          draft.engagement = { voteScore: 0, upvoteCount: 0, downvoteCount: 0, bookmarkCount: 0, followerCount: 0 };
        }
        if (!draft.viewer) {
          draft.viewer = {
            vote: null,
            bookmarked: false,
            following: false,
            followingAuthor: false,
            owner: false,
            canEdit: false,
            canDelete: false,
            editUnderReview: false,
          };
        }
        draft.viewer.bookmarked = isBookmarked;
        draft.engagement.bookmarkCount = Math.max(0, draft.engagement.bookmarkCount + delta);
      });
      patches.push(patch);
    }

    // getDiscussionById
    if (entry.endpointName === "getDiscussionById" && entry.originalArgs === showcaseId) {
      const patch = patchQuery(dispatch, "getDiscussionById", entry.originalArgs, (draft: any) => {
        if (!draft) return;
        draft.isBookmarked = isBookmarked;
        if (draft.viewer) draft.viewer.bookmarked = isBookmarked;
        if (draft.engagement) {
          draft.engagement.bookmarkCount = Math.max(0, draft.engagement.bookmarkCount + delta);
        }
      });
      patches.push(patch);
    }

    // getBookmarkStatus
    if (
      entry.endpointName === "getBookmarkStatus" &&
      entry.originalArgs?.type === "SHOWCASE" &&
      entry.originalArgs?.targetId === showcaseId
    ) {
      const patch = patchQuery(dispatch, "getBookmarkStatus", entry.originalArgs, () => isBookmarked);
      patches.push(patch);
    }

    // getDiscussions
    if (entry.endpointName === "getDiscussions") {
      const patch = patchQuery(dispatch, "getDiscussions", entry.originalArgs, (draft: any) => {
        if (!draft?.data) return;
        const post = draft.data.find((p: any) => p.id === showcaseId);
        if (!post) return;
        post.isBookmarked = isBookmarked;
        if (!post.viewer) {
          post.viewer = {
            vote: null,
            bookmarked: false,
            following: false,
            followingAuthor: false,
            owner: false,
            canEdit: false,
            canDelete: false,
            editUnderReview: false,
          };
        }
        post.viewer.bookmarked = isBookmarked;
        if (!post.engagement) {
          post.engagement = {
            voteScore: post.votes,
            upvoteCount: 0,
            downvoteCount: 0,
            bookmarkCount: 0,
            followerCount: 0,
          };
        }
        post.engagement.bookmarkCount = Math.max(0, post.engagement.bookmarkCount + delta);
      });
      patches.push(patch);
    }

    // getShowcases, getMyShowcases, getUserShowcases
    if (
      entry.endpointName === "getShowcases" ||
      entry.endpointName === "getMyShowcases" ||
      entry.endpointName === "getUserShowcases"
    ) {
      const patch = patchQuery(dispatch, entry.endpointName, entry.originalArgs, (draft: any) => {
        if (!draft?.content) return;
        const item = draft.content.find((s: any) => s.id === showcaseId);
        if (!item) return;
        if (!item.viewer) {
          item.viewer = {
            vote: null,
            bookmarked: false,
            following: false,
            followingAuthor: false,
            owner: false,
            canEdit: false,
            canDelete: false,
            editUnderReview: false,
          };
        }
        item.viewer.bookmarked = isBookmarked;
        if (!item.engagement) {
          item.engagement = {
            voteScore: 0,
            upvoteCount: 0,
            downvoteCount: 0,
            bookmarkCount: 0,
            followerCount: 0,
          };
        }
        item.engagement.bookmarkCount = Math.max(0, item.engagement.bookmarkCount + delta);
      });
      patches.push(patch);
    }
  }

  return {
    undo: () => {
      for (const p of patches) {
        try {
          p.undo();
        } catch {
          // ignore undo errors
        }
      }
    },
  };
}
