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
    <section className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4">
      {metricItems.map((metric, index) => {
        const Icon = METRIC_ICONS[index];
        const isActive = activeQueue === metric.queueKey;

        return (
          <button
            type="button"
            key={metric.title}
            onClick={() => onMetricClick?.(metric.key)}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[26px] cursor-pointer"
          >
            <Card
              size="sm"
              className={cn(
                "rounded-[26px] bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none py-0 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
                "[--card-spacing:--spacing(0)]"
              )}
            >
              <CardContent className="flex items-start justify-between px-5 py-5">
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex size-11 items-center justify-center rounded-2xl shadow-2xs transition-transform duration-200",
                        index === 0 && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
                        index === 1 && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                        index === 2 && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
                        index === 3 && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {metric.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground/80">{METRIC_HELPERS[index]}</span>
                    </div>
                  </div>

                  <div className="flex items-end gap-3">
                    {isLoading ? (
                      <div className="h-9 w-20 animate-pulse rounded-xl bg-muted" />
                    ) : (
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-none">
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
