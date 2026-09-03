import {
  ProfileStats,
  SeverityStats,
  ProfileBadge,
} from "@/lib/types/profile/types";
import SeverityBreakdown from "../SeverityBreakdown";

interface OverviewTabProps {
  stats: ProfileStats;
  severity: SeverityStats;
  badges: ProfileBadge[];
}

export default function OverviewTab({
  stats,
  severity,
  badges,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <SeverityBreakdown severity={severity} />
    </div>
  );
}
