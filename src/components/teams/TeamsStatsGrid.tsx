import {
  Eye,
  ShieldCheck,
  type LucideIcon,
  UserCheck,
  Users,
} from "lucide-react";

import type { TeamCounts } from "@/components/teams/types";
import { cn } from "@/lib/utils";

type TeamStatCard = {
  title: string;
  value: number;
  meta: string;
  icon: LucideIcon;
  iconClassName: string;
};

function buildTeamStatCards(counts: TeamCounts): TeamStatCard[] {
  return [
    {
      title: "Total Members",
      value: counts.total,
      meta:
        counts.pending > 0
          ? `${counts.active} active · ${counts.pending} invited`
          : `${counts.active} active`,
      icon: Users,
      iconClassName: "bg-muted text-foreground",
    },
    {
      title: "Managers",
      value: counts.managers,
      meta: "Super admin",
      icon: ShieldCheck,
      iconClassName: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Members",
      value: counts.members,
      meta: "Day-to-day collaborators",
      icon: UserCheck,
      iconClassName: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Viewers",
      value: counts.viewers,
      meta: "Read-only",
      icon: Eye,
      iconClassName: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];
}

type TeamsStatsGridProps = {
  counts: TeamCounts;
};

export function TeamsStatsGrid({ counts }: TeamsStatsGridProps) {
  const statCards = buildTeamStatCards(counts);

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statCards.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className={cn(
              "rounded-[26px] bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none px-5 py-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-2xl",
                  item.iconClassName
                )}
              >
                <Icon className="size-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{item.meta}</p>
              </div>
            </div>

            <p className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-none">
              {item.value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
