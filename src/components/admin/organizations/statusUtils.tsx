import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type VerificationStatus = "PENDING" | "APPROVED" | "ACTIVE" | "REJECTED";

interface StatusConfig {
  label: string;
  dotClass: string;
  badgeClass: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  ACTIVE: {
    label: "Active",
    dotClass: "bg-emerald-500",
    badgeClass: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold",
  },
  APPROVED: {
    label: "Active",
    dotClass: "bg-emerald-500",
    badgeClass: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold",
  },
  REJECTED: {
    label: "Rejected",
    dotClass: "bg-rose-500",
    badgeClass: "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold",
  },
  PENDING: {
    label: "Pending KYC",
    dotClass: "bg-amber-500",
    badgeClass: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold",
  },
};

export function getStatusConfig(status: string): StatusConfig {
  const normalized = status?.toUpperCase();
  return STATUS_CONFIG[normalized] ?? STATUS_CONFIG.PENDING;
}

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export function StatusBadge({ status, size = "sm", showIcon = true }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const sizeClass = size === "md" ? "h-7 px-3 text-xs" : "h-6 px-2.5 text-xs";

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg shadow-2xs transition-colors",
        config.badgeClass,
        sizeClass,
      )}
    >
      {showIcon && (
        <span
          aria-hidden="true"
          className={cn("size-2 shrink-0 rounded-full", config.dotClass)}
        />
      )}
      <span>{config.label}</span>
    </Badge>
  );
}
