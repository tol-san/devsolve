import { toDate } from "@/lib/format/datetime";

export function isoDateTime(
  value: string | null | undefined,
): string | undefined {
  return toDate(value)?.toISOString();
}
