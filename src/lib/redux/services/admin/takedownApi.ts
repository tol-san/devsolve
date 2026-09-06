import { baseApi } from "../baseApi";
import type { ModerationActionResponse } from "@/lib/types/admin/types";
import type { TakedownTarget } from "@/lib/validations/moderation";

/** Maps a target type onto its takedown collection path. */
const TAKEDOWN_PATHS: Record<TakedownTarget, string> = {
  PROBLEM: "problems",
  SHOWCASE: "showcases",
  SOLUTION: "solutions",
  COMMENT: "comments",
  PROGRAM: "programs",
};

export interface TakedownRequest {
  targetType: TakedownTarget;
  targetId: string;
  reason: string;
}

/**
 * A takedown that comes back 404 means the content is already gone — another
 * admin removed it, or the author deleted it first. The desired end state has
 * been reached, so it is reported as a success with `alreadyGone` set rather
 * than as an error the admin has to interpret.
 */
export interface TakedownResult {
  action: ModerationActionResponse | null;
  alreadyGone: boolean;
}

export const takedownApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    takeDownContent: builder.mutation<TakedownResult, TakedownRequest>({
      async queryFn({ targetType, targetId, reason }, _api, _extra, fetchWithBQ) {
        const result = await fetchWithBQ({
          url: `/admin/${TAKEDOWN_PATHS[targetType]}/${targetId}/takedown`,
          method: "POST",
          body: { reason },
        });

        if (result.error) {
          if (result.error.status === 404) {
            return { data: { action: null, alreadyGone: true } };
          }
          return { error: result.error };
        }

        return {
          data: {
            action: (result.data as ModerationActionResponse) ?? null,
            alreadyGone: false,
          },
        };
      },
      invalidatesTags: (_result, _error, { targetType, targetId }) => [
        "ModerationAction",
        { type: "ContentReport", id: "LIST" },
        { type: mapTag(targetType), id: targetId },
        { type: mapTag(targetType), id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

function mapTag(target: TakedownTarget) {
  switch (target) {
    case "PROBLEM":
      return "Problem" as const;
    case "SHOWCASE":
      return "Showcase" as const;
    case "SOLUTION":
      return "Solution" as const;
    case "COMMENT":
      return "Comment" as const;
    case "PROGRAM":
      return "Program" as const;
  }
}

export const { useTakeDownContentMutation } = takedownApi;
