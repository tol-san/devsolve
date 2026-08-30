"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ThanksEntry } from "@/lib/types/profile/types";

interface ThanksCardProps {
  entry: ThanksEntry;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ThanksCard({ entry }: ThanksCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all duration-200 hover:border-border/80 hover:shadow-xs"
    >
      <div className="flex items-start gap-3.5">
        {entry.orgLogoUrl ? (
          <Image
            src={entry.orgLogoUrl}
            alt={entry.orgName}
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
            {entry.orgName.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">{entry.orgName}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{entry.message}</p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">{formatDate(entry.date)}</p>
        </div>
      </div>
    </motion.div>
  );
}
