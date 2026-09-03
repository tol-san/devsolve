import { NextResponse } from "next/server";
import * as z from "zod";
import { DEFAULT_COUNTRIES } from "@/lib/constants/auth";

const upstreamCountrySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(2),
});

/** GET /api/geo/countries — normalized country names and ISO alpha-2 codes. */
export async function GET() {
  try {
    const upstream = await fetch(
      "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/index.json",
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 86_400 },
        signal: AbortSignal.timeout(5_000),
      },
    );

    if (!upstream.ok) {
      return NextResponse.json(DEFAULT_COUNTRIES);
    }

    const raw: unknown = await upstream.json();
    const parsed = z.array(upstreamCountrySchema).safeParse(raw);
    if (!parsed.success) {
      if (Array.isArray(raw)) {
        const valid = raw
          .filter(
            (item): item is { name: string; code: string } =>
              Boolean(item) &&
              typeof item === "object" &&
              "name" in item &&
              typeof item.name === "string" &&
              item.name.length > 0 &&
              "code" in item &&
              typeof item.code === "string" &&
              item.code.length >= 2,
          )
          .map((item) => ({
            name: item.name,
            code: item.code.toLowerCase(),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        if (valid.length > 0) {
          return NextResponse.json(valid);
        }
      }
      return NextResponse.json(DEFAULT_COUNTRIES);
    }

    const countries = parsed.data
      .map((country) => ({
        name: country.name,
        code: country.code.toLowerCase(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(countries);
  } catch {
    return NextResponse.json(DEFAULT_COUNTRIES);
  }
}

