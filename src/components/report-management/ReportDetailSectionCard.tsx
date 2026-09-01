import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ReportDetailSectionCardProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  contentClassName?: string;
  className?: string;
};

export function ReportDetailSectionCard({
  title,
  icon,
  children,
  headerRight,
  contentClassName,
  className,
}: ReportDetailSectionCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl bg-card text-card-foreground border border-border shadow-xs p-0 py-0 gap-0",
        className
      )}
    >
      <CardHeader className="rounded-t-2xl border-b border-border/70 bg-muted/30 px-4 py-3 sm:px-5 sm:py-3.5 [.border-b]:pb-3 sm:[.border-b]:pb-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              {icon}
            </div>
            <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              {title}
            </CardTitle>
          </div>

          {headerRight ? (
            <div className="flex flex-wrap items-center gap-2">{headerRight}</div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className={cn("p-4 sm:p-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
