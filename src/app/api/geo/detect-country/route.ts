import { NextResponse } from "next/server";
import * as z from "zod";

const ipCountrySchema = z.object({
  country_name: z.string().min(1),
  country_code: z.string().length(2),
});

export async function GET() {
  try {
    const upstream = await fetch("https://ipapi.co/json/", {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
    if (!upstream.ok) return NextResponse.json(null);

    const parsed = ipCountrySchema.safeParse(await upstream.json());
    return NextResponse.json(parsed.success ? parsed.data : null);
  } catch {
    return NextResponse.json(null);
  }
}
