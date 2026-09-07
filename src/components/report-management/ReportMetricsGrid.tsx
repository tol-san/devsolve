import { BarChart3, CheckCheck, Clock3, ShieldAlert, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const METRIC_ICONS: LucideIcon[] = [BarChart3, Clock3, ShieldAlert, CheckCheck];
const METRIC_HELPERS = [
  "All submitted reports",
  "Waiting for triage",
  "In analyst review",
  "Ready for closure",
];

type MetricType = "total" | "pending" | "underReview" | "approved";

type ReportMetricsGridProps = {
  metrics: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
  };
  activeQueue?: string;
  onMetricClick?: (type: MetricType) => void;
  isLoading?: boolean;
};

export function ReportMetricsGrid({
  metrics,
  activeQueue,
  onMetricClick,
  isLoading = false,
}: ReportMetricsGridProps) {
  const metricItems: { key: MetricType; title: string; value: number; queueKey: string }[] = [
    { key: "total", title: "Total Reports", value: metrics.total, queueKey: "ALL" },
    { key: "pending", title: "Pending", value: metrics.pending, queueKey: "PENDING" },
    { key: "underReview", title: "Under Review", value: metrics.underReview, queueKey: "UNDER_REVIEW" },
    { key: "approved", title: "Approved & Triaged", value: metrics.approved, queueKey: "APPROVED" },
  ];

  return (
    <section className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4 min-w-0 w-full">
      {metricItems.map((metric, index) => {
        const Icon = METRIC_ICONS[index];
        const isActive = activeQueue === metric.queueKey;

        return (
          <button
            type="button"
            key={metric.title}
            onClick={() => onMetricClick?.(metric.key)}
            className="group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl cursor-pointer min-w-0"
          >
            <Card
              size="sm"
              className={cn(
                "relative rounded-2xl bg-card/90 backdrop-blur-md text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border/80 py-0 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 min-w-0 w-full overflow-hidden select-none",
                "[--card-spacing:--spacing(0)]",
                isActive && "ring-2 ring-primary border-primary/40 bg-primary/[0.04]",
              )}
            >
              {/* Ambient radial color glow combining primary + accent */}
              <div className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-gradient-to-br from-primary/15 via-emerald-500/10 to-transparent opacity-40 blur-xl transition-opacity group-hover:opacity-100" />

              <CardContent className="relative z-10 flex items-start justify-between p-3.5 sm:p-4.5 min-w-0 w-full">
                <div className="flex min-w-0 flex-col gap-2 sm:gap-2.5 w-full">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 w-full">
                    <div
                      className={cn(
                        "flex size-8 sm:size-9.5 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground",
                        isActive && "bg-primary text-primary-foreground",
                      )}
                    >
                      <Icon className="size-4 sm:size-4.5" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors truncate" title={metric.title}>
                        {metric.title}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground/80 truncate hidden xs:block">
                        {METRIC_HELPERS[index]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end gap-3 pt-0.5">
                    {isLoading ? (
                      <div className="h-7 sm:h-8 w-14 sm:w-20 animate-pulse rounded-lg bg-muted" />
                    ) : (
                      <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors leading-none">
                        {metric.value}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </section>
  );
}
