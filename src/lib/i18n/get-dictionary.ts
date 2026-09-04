import "server-only";
import type { Locale } from "./config";
import { DEFAULT_LOCALE } from "./config";

const loaders = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  km: () => import("./dictionaries/km.json").then((m) => m.default),
} as const;

export type Dictionary = Awaited<ReturnType<(typeof loaders)["en"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const load = loaders[locale] ?? loaders[DEFAULT_LOCALE];
  return load() as Promise<Dictionary>;
}
