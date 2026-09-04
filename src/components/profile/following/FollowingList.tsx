"use client";

import { useState } from "react";
import { UserCheck } from "lucide-react";
import { FilterSearch } from "@/components/ui/filter-bar";
import { FollowingUser } from "@/lib/types/profile/types";
import FollowingItem from "./FollowingItem";

interface FollowingListProps {
  totalUsers: number;
  items: FollowingUser[];
  baseProfilePath?: string;
}

export default function FollowingList({
  totalUsers,
  items,
  baseProfilePath,
}: FollowingListProps) {
  const [search, setSearch] = useState("");
  const [hiddenUserIds, setHiddenUserIds] = useState<string[]>([]);

  const filteredItems = items
    .filter((item) => !hiddenUserIds.includes(item.userId))
    .filter((item) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      const nameMatch = item.fullName.toLowerCase().includes(q);
      const bioMatch = item.biography?.toLowerCase().includes(q) ?? false;
      return nameMatch || bioMatch;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-border pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Following
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              People you follow on DevSolve.
            </p>
          </div>

          <FilterSearch
          value={search}
          onChange={setSearch}
          label="Search following"
          placeholder="Search following..."
          className="w-full sm:max-w-xs"
        />
        </div>

        <p className="pt-0.5 text-sm font-medium text-muted-foreground">
          {totalUsers} {totalUsers === 1 ? "person" : "people"}
        </p>
      </div>

      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <FollowingItem
              key={item.userId}
              user={item}
              baseProfilePath={baseProfilePath}
              onUnfollow={(userId) =>
                setHiddenUserIds((current) =>
                  current.includes(userId) ? current : [...current, userId],
                )
              }
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-12 px-6 text-center shadow-2xs ring-1 ring-foreground/5 dark:ring-foreground/10">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <UserCheck size={24} />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {search ? "No users found" : "You're not following any users yet."}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {search
                ? `No users match "${search}".`
                : "When you follow researchers, they will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
