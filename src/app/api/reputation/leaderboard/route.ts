import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import {
  bearerTokenFor,
  relay,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";

const leaderboardEntrySchema = z
  .object({
    rank: z.number().int().nonnegative(),
    id: z.uuid(),
    username: z.string().nullish(),
    fullName: z.string().nullish(),
    avatarUrl: z.string().nullish(),
    country: z.string().nullish(),
    reputation: z.number().int().nullish(),
    totalReports: z.number().int().nullish(),
    validReports: z.number().int().nullish(),
    criticalReports: z.number().int().nullish(),
    recognitionCount: z.number().int().nullish(),
  })
  .passthrough();

const leaderboardPageSchema = z
  .object({
    totalElements: z.number().int().nonnegative().optional(),
    totalPages: z.number().int().positive().optional(),
    size: z.number().int().positive().optional(),
    content: z.array(leaderboardEntrySchema).default([]),
    number: z.number().int().nonnegative().optional(),
    first: z.boolean().optional(),
    last: z.boolean().optional(),
    numberOfElements: z.number().int().nonnegative().optional(),
    pageable: z.unknown().optional(),
    sort: z.unknown().optional(),
    empty: z.boolean().optional(),
  })
  .passthrough();

type LeaderboardPage = z.infer<typeof leaderboardPageSchema>;

const PAGE_SIZE = 100;

/**
 * The window the ranking is measured over. Anything else is dropped rather
 * than passed on, so a typo cannot turn into an upstream error.
 */
const PERIODS = ["DAY", "WEEK", "MONTH", "ALL_TIME"] as const;

type Period = (typeof PERIODS)[number];

function periodOf(params: URLSearchParams): Period | null {
  const value = params.get("period");
  return PERIODS.includes(value as Period) ? (value as Period) : null;
}

function windowed(period: Period | null): string {
  return period ? `&period=${period}` : "";
}

async function fetchLeaderboardPage(
  page: number,
  token: string | null,
  period: Period | null,
) {
  const response = await upstreamFetch(
    `/reputation/leaderboard?page=${page}&size=${PAGE_SIZE}${windowed(period)}`,
    token,
  );

  const raw = await response.text();
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  return { response, data };
}

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  const params = request.nextUrl.searchParams;
  const period = periodOf(params);

  /* A caller that names a page wants that page — the widget asking for the
     top five has no use for every ranked researcher. Only the unpaged call,
     which the leaderboard screen makes, is stitched together below. */
  const page = params.get("page");
  const size = params.get("size");
  if (page !== null || size !== null) {
    const query = new URLSearchParams({
      page: String(Math.max(0, Number(page ?? 0) || 0)),
      size: String(Math.min(100, Math.max(1, Number(size ?? 20) || 20))),
    });
    try {
      const upstream = await upstreamFetch(
        `/reputation/leaderboard?${query.toString()}${windowed(period)}`,
        token,
      );
      return relay(upstream, "Unable to load the leaderboard.");
    } catch {
      return unreachable("leaderboard");
    }
  }

  try {
    const firstPage = await fetchLeaderboardPage(0, token, period);
    if (!firstPage.response.ok) {
      return relay(firstPage.response, "Unable to load the leaderboard.");
    }

    const firstParsed = leaderboardPageSchema.safeParse(firstPage.data);
    if (!firstParsed.success) {
      return NextResponse.json(
        { message: "The leaderboard service returned an unexpected response." },
        { status: 502 },
      );
    }

    const totalPages = Math.max(1, firstParsed.data.totalPages ?? 1);
    const remainingPages =
      totalPages > 1
        ? await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) =>
              fetchLeaderboardPage(index + 1, token, period),
            ),
          )
        : [];

    for (const page of remainingPages) {
      if (!page.response.ok) {
        return relay(page.response, "Unable to load the leaderboard.");
      }
    }

    const parsedRemaining: LeaderboardPage[] = [];
    for (const page of remainingPages) {
      const parsed = leaderboardPageSchema.safeParse(page.data);
      if (!parsed.success) {
        return NextResponse.json(
          { message: "The leaderboard service returned an unexpected response." },
          { status: 502 },
        );
      }
      parsedRemaining.push(parsed.data);
    }

    const content = [
      ...firstParsed.data.content,
      ...parsedRemaining.flatMap((page) => page.content),
    ];

    return NextResponse.json(
      {
        ...firstParsed.data,
        totalElements: firstParsed.data.totalElements ?? content.length,
        totalPages: 1,
        size: content.length,
        content,
        number: 0,
        first: true,
        last: true,
        numberOfElements: content.length,
        empty: content.length === 0,
      },
      { status: 200 },
    );
  } catch {
    return unreachable("leaderboard");
  }
}
