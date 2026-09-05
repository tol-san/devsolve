import {
  ProfileStats,
  SeverityStats,
  ProfileBadge,
} from "@/lib/types/profile/types";
import SeverityBreakdown from "../SeverityBreakdown";
import BadgesGrid from "../BadgesGrid";

interface OverviewTabProps {
  stats: ProfileStats;
  severity: SeverityStats;
  badges: ProfileBadge[];
}

export default function OverviewTab({ severity, badges }: OverviewTabProps) {
  return (
    <div className="space-y-5">
      <SeverityBreakdown severity={severity} />
      {badges.length > 0 && <BadgesGrid badges={badges} />}
    </div>
  );
}
