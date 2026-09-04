"use client";

import React from "react";
import { motion } from "motion/react";
import {
  MoreVertical,
  UserX,
  UserCheck,
  Shield,
  Building2,
  User,
  ShieldAlert,
  ChevronRight,
  FileText,
  LayoutGrid,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AdminUserItem } from "@/lib/redux/services/adminApi";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";

interface UserTableRowProps {
  user: AdminUserItem;
  index: number;
  onUpdateStatus: (id: string, status: "ACTIVE" | "SUSPENDED") => void;
  onUpdateRole: (
    id: string,
    role: "USER" | "COMPANY" | "ADMIN" | "MODERATOR"
  ) => void;
}

const ROLE_OPTIONS: {
  value: "USER" | "COMPANY" | "ADMIN" | "MODERATOR";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "USER", label: "Researcher", icon: User },
  { value: "COMPANY", label: "Company", icon: Building2 },
  { value: "ADMIN", label: "Admin", icon: Shield },
  { value: "MODERATOR", label: "Moderator", icon: ShieldAlert },
];

function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300",
    "bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function UserTableRow({
  user,
  index,
  onUpdateStatus,
  onUpdateRole,
}: UserTableRowProps) {
  const isSuspended = user.status === "SUSPENDED";
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-2xs hover:shadow-xs transition-all group ${
        isSuspended
          ? "border-rose-200/70 dark:border-rose-900/50"
          : "border-slate-200/80 dark:border-slate-800"
      }`}
    >
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(
              user.name
            )}`}
          >
            {initials}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {user.name}
              </h3>
              <UserRoleBadge role={user.role} />
              <UserStatusBadge status={user.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email}
              </span>
              <span>•</span>
              <span>Joined {user.joinedDate}</span>
              {user.reportsSubmitted !== undefined && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {user.reportsSubmitted} reports
                  </span>
                </>
              )}
              {user.programsManaged !== undefined && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                    {user.programsManaged} programs
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Button
            variant="outline"
            onClick={() =>
              onUpdateStatus(user.id, isSuspended ? "ACTIVE" : "SUSPENDED")
            }
            className={`h-9 px-3.5 rounded-xl text-sm font-semibold cursor-pointer gap-1.5 transition-colors shadow-2xs ${
              isSuspended
                ? "border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                : "border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-700"
            }`}
          >
            {isSuspended ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                Activate
              </>
            ) : (
              <>
                <UserX className="w-3.5 h-3.5" />
                Suspend
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center h-9 w-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg">
              <DropdownMenuLabel className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                User: {user.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-sm font-medium cursor-pointer">
                  <Shield className="w-4 h-4 mr-2 text-slate-400" />
                  Change Role
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-44 rounded-xl shadow-lg">
                    {ROLE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isCurrent = user.role === opt.value;
                      return (
                        <DropdownMenuItem
                          key={opt.value}
                          disabled={isCurrent}
                          onClick={() => onUpdateRole(user.id, opt.value)}
                          className="text-sm font-medium cursor-pointer"
                        >
                          <Icon className="w-4 h-4 mr-2 text-slate-400" />
                          {opt.label}
                          {isCurrent && (
                            <span className="ml-auto text-xs text-slate-400">Current</span>
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() =>
                  onUpdateStatus(user.id, isSuspended ? "ACTIVE" : "SUSPENDED")
                }
                className={`text-sm font-medium cursor-pointer ${
                  isSuspended
                    ? "text-emerald-700 dark:text-emerald-400 focus:text-emerald-700"
                    : "text-rose-600 dark:text-rose-400 focus:text-rose-600"
                }`}
              >
                {isSuspended ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Reinstate Account
                  </>
                ) : (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    Suspend Account
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}
