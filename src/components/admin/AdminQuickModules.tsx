"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  FileCheck,
  Users,
  PanelsTopLeft,
  ArrowUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuickModule {
  href: string;
  label: string;
  subtitle: string;
  Icon: LucideIcon;
  tag: string;
}

const QUICK_MODULES: QuickModule[] = [
  {
    href: "/dashboard/company-verification",
    label: "Company Verifications",
    subtitle: "KYC credentials, documents & domain approvals",
    Icon: Building2,
    tag: "KYC",
  },
  {
    href: "/dashboard/report-confirmation",
    label: "Report Confirmation",
    subtitle: "Vulnerability validation, severity triage & awards",
    Icon: FileCheck,
    tag: "Triage",
  },
  {
    href: "/dashboard/users",
    label: "User Management",
    subtitle: "Accounts, permissions, suspensions & roles",
    Icon: Users,
    tag: "Accounts",
  },
  {
    href: "/dashboard/content-moderation",
    label: "Content Management",
    subtitle: "Community moderation, discussions & flag reviews",
    Icon: PanelsTopLeft,
    tag: "Moderation",
  },
];

export function AdminQuickModules() {
  return (
    <Card className="lg:col-span-5 rounded-2xl border border-border/80 bg-card shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10 flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-border/80">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              Quick admin modules
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-0.5">
              Direct access to administrative platform suites
            </CardDescription>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs">
            4 Suites
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {QUICK_MODULES.map(({ href, label, subtitle, Icon, tag }) => (
          <Link key={href} href={href} className="block group">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/40 hover:border-border transition cursor-pointer">
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-xl flex items-center justify-center shrink-0 border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-2xs">
                  <Icon className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition">
                      {label}
                    </h4>
                    <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded border border-primary/20 bg-primary/10 text-primary">
                      {tag}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center border border-border/50 transition-colors group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
