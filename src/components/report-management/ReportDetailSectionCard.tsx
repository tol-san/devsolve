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
        "overflow-hidden rounded-2xl bg-card text-card-foreground border border-border shadow-xs",
        className
      )}
    >
      <CardHeader className="rounded-t-2xl border-b border-border/70 bg-muted/30 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              {icon}
            </div>
            <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {title}
            </CardTitle>
          </div>

          {headerRight ? (
            <div className="flex flex-wrap items-center gap-2">{headerRight}</div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className={cn("px-5 py-5 sm:px-6 sm:py-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
