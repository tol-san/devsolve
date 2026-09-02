"use client";

import React from "react";
import Link from "next/link";
import { BookmarkItem } from "@/lib/types/bookmarks/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Clock, ShieldAlert, Award, ThumbsUp, Layers, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface BookmarkCardProps {
  item: BookmarkItem;
  onRemove: (item: BookmarkItem) => Promise<void>;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({ item, onRemove }) => {
  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await onRemove(item);
      toast.success("Bookmark removed", {
        description: `"${item.title}" removed from your saved items.`,
      });
    } catch {
      toast.error("Bookmark could not be removed. Please try again.");
    }
  };

  const getCategoryBadge = () => {
    switch (item.category) {
      case "Program":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-200/80 dark:border-blue-500/20 text-xs font-medium rounded-lg px-2.5 py-0.5">
            Program
          </Badge>
        );
      case "Problems":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/20 text-xs font-medium rounded-lg px-2.5 py-0.5">
            Problem
          </Badge>
        );
      case "Solutions":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/20 text-xs font-medium rounded-lg px-2.5 py-0.5">
            Solution
          </Badge>
        );
      case "Showcases":
        return (
          <Badge variant="outline" className="rounded-lg border-violet-200/80 bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
            Showcase
          </Badge>
        );
      default:
        return null;
    }
  };

  const getSeverityColor = (sev?: string) => {
    switch (sev) {
      case "Critical":
        return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 border-red-200 dark:border-red-500/20";
      case "High":
        return "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300 border-orange-200 dark:border-orange-500/20";
      case "Medium":
        return "bg-yellow-50 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col justify-between gap-4 rounded-2xl bg-card p-5 shadow-2xs ring-1 ring-foreground/5 transition-all duration-200 hover:shadow-md hover:ring-foreground/10 dark:ring-foreground/10 dark:hover:ring-foreground/20"
    >
      {/* Stretched clickable overlay linking to details */}
      <Link
        href={item.url || "/community"}
        className="absolute inset-0 z-0 rounded-2xl focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`View details for ${item.title}`}
      />

      {/* CARD TOP BAR */}
      <div className="relative z-10 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2">
          {getCategoryBadge()}
          {item.severity && (
            <Badge variant="outline" className={`text-xs rounded-lg px-2 py-0.5 font-medium border ${getSeverityColor(item.severity)}`}>
              <ShieldAlert className="w-3 h-3 mr-1 inline" />
              {item.severity}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pointer-events-auto">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {item.savedAt}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={(event) => void handleRemove(event)}
            title="Remove from saved bookmarks"
            aria-label={`Remove ${item.title} from bookmarks`}
            className="rounded-full text-blue-600 hover:text-red-600 dark:text-blue-400 dark:hover:text-red-400 cursor-pointer"
          >
            <Bookmark className="fill-current" />
          </Button>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="relative z-10 space-y-2 flex-1 pointer-events-none">
        <h3 className="text-base font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* CATEGORY SPECIFIC METADATA */}
      <div className="relative z-10 pt-1 pointer-events-none">
        {item.category === "Program" &&
          (item.companyName || item.bountyMax || item.inScopeCount !== undefined) && (
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-xl ring-1 ring-foreground/5 dark:ring-foreground/10">
              <span className="font-semibold text-foreground">
                {item.companyName || "Organization"}
              </span>
              {item.bountyMax && (
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Max {item.bountyMax}
                </span>
              )}
              {item.inScopeCount !== undefined && (
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {item.inScopeCount} assets
                </span>
              )}
            </div>
          )}

        {item.category === "Problems" &&
          (item.points !== undefined || item.submissionsCount !== undefined || item.status) && (
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-xl ring-1 ring-foreground/5 dark:ring-foreground/10">
              {item.points !== undefined && (
                <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                  <Award className="w-3.5 h-3.5" />
                  {item.points} Points
                </span>
              )}
              {item.submissionsCount !== undefined && <span>{item.submissionsCount} submissions</span>}
              {item.status && (
                <span className="flex items-center gap-1 text-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  {item.status}
                </span>
              )}
            </div>
          )}

        {item.category === "Solutions" &&
          (item.authorName || item.readTime || item.likesCount !== undefined) && (
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-xl ring-1 ring-foreground/5 dark:ring-foreground/10">
              <span className="font-medium text-foreground">
                By {item.authorName || "Community Member"}
              </span>
              {item.readTime && <span>{item.readTime}</span>}
              {item.likesCount !== undefined && (
                <span className="flex items-center gap-1 text-foreground">
                  <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
                  {item.likesCount}
                </span>
              )}
            </div>
          )}
      </div>

      {/* TAGS CHIPS */}
      <div className="relative z-10 flex flex-wrap items-center gap-1.5 pt-1 pointer-events-none">
        {item.tags.slice(0, 3).map((tag, idx) => (
          <span
            key={idx}
            className="text-[11px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-md"
          >
            #{tag}
          </span>
        ))}
        {item.tags.length > 3 && (
          <span className="text-[11px] text-muted-foreground font-medium">
            +{item.tags.length - 3} more
          </span>
        )}
      </div>
    </motion.div>
  );
};
