"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  CheckCircle2,
  Eye,
  Loader2,
  Mail,
  Send,
  ShieldCheck,
  UserCog,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  DEFAULT_PERMISSIONS_BY_ROLE,
  INVITE_PERMISSION_OPTIONS,
  INVITE_ROLE_OPTIONS,
  MAX_PERMISSIONS_BY_ROLE,
} from "@/components/teams/invite-member/mock-data";
import type {
  InvitePermissionOption,
  InviteRoleOption,
} from "@/components/teams/invite-member/types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { toast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/format/datetime";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { absoluteUrl } from "@/lib/seo/site";
import { useInviteOrganizationMemberMutation } from "@/lib/redux/services/organizationsApi";
import { cn } from "@/lib/utils";

const permissionValues = [
  "VIEW_PROGRAMS",
  "CREATE_PROGRAM",
  "EDIT_PROGRAM",
  "MANAGE_PROGRAM_STATE",
  "DELETE_PROGRAM",
  "VIEW_REPORTS",
  "TRIAGE_REPORTS",
  "MANAGE_DISCLOSURE",
  "AWARD_REWARDS",
  "MANAGE_RESEARCHERS",
  "MANAGE_MEMBERS",
] as const;

const inviteMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Work email is required.")
    .email("Enter a valid work email address."),

  role: z.enum(["MANAGER", "MEMBER", "VIEWER"], {
    message: "Select an organization role.",
  }),

  permissions: z
    .array(z.enum(permissionValues))
    .min(1, "Select at least one permission.")
    .max(11, "You can select up to 11 permissions."),
});

type InviteMemberFormValues = z.infer<
  typeof inviteMemberSchema
>;

type PermissionCategory =
  | "Programs"
  | "Reports"
  | "Disclosure"
  | "Rewards"
  | "Researchers"
  | "Members"
  | "General";

const roleIcons = {
  MANAGER: UserCog,
  MEMBER: UserRound,
  VIEWER: Eye,
} as const;

const roleCapabilities = {
  MANAGER: [
    "Members",
    "Programs",
    "Reports",
    "Settings",
  ],
  MEMBER: ["Programs", "Reports", "Collaboration"],
  VIEWER: ["Programs", "Reports", "Read only"],
} as const;

function getErrorMessage(error: unknown): string {
  if (
    !error ||
    typeof error !== "object" ||
    !("status" in error)
  ) {
    return "Unable to send the invitation. Please try again.";
  }

  const apiError = error as FetchBaseQueryError & {
    data?: {
      message?: string;
      error?: string;
      details?: string;
    };
  };

  const rawMessage =
    apiError.data?.message ??
    apiError.data?.error ??
    apiError.data?.details ??
    "";

  /**
   * A team invitation only reaches someone who already has a DevSolve
   * account — the upstream links an existing user rather than creating one,
   * and answers 404 when there is nobody behind the address. That is the most
   * common way this fails and the one the inviter can actually act on, so it
   * is spelled out rather than folded into a generic failure.
   */
  if (apiError.status === 404) {
    return "No DevSolve account uses that email address. They need to register first, then you can invite them.";
  }

  /* Three different situations upstream — already a member, an invitation
     still outstanding, or an organization not approved yet — and the upstream
     is the only one that knows which. Its sentence is kept whole. */
  if (apiError.status === 409) {
    return (
      rawMessage.trim() ||
      "That invitation cannot be sent right now. They may already be on the team, or an invitation may still be outstanding."
    );
  }

  if (
    apiError.status === 401 ||
    apiError.status === 403
  ) {
    return "You do not have permission to invite organization members.";
  }

  if (rawMessage.trim()) {
    return rawMessage;
  }

  return "Unable to send the invitation. Please try again.";
}

export function InviteMemberForm() {
  const router = useRouter();
  const lp = useLocalePath();

  const [
    inviteOrganizationMember,
    { isLoading },
  ] = useInviteOrganizationMemberMutation();

  /* What the 201 came back with. The token is the whole reason this screen
     stops at a confirmation instead of navigating away: it exists nowhere else
     the inviter can reach, and an email that never arrives would otherwise
     leave the invitation unreachable by anyone. */
  const [sent, setSent] = useState<{
    email: string;
    token?: string;
    expiresAt?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: {
      errors,
      isValid,
    },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      role: "MEMBER",
      permissions: [
        ...DEFAULT_PERMISSIONS_BY_ROLE.MEMBER,
      ],
    },
  });

  const email =
    useWatch({
      control,
      name: "email",
    }) ?? "";

  const selectedRole =
    useWatch({
      control,
      name: "role",
    }) ?? "MEMBER";

  const selectedPermissions =
    useWatch({
      control,
      name: "permissions",
    }) ?? [];

  const selectedRoleTitle =
    INVITE_ROLE_OPTIONS.find(
      (option) => option.role === selectedRole,
    )?.title ?? "Member";

  async function onSubmit(
    values: InviteMemberFormValues,
  ) {
    try {
      const response =
        await inviteOrganizationMember(values).unwrap();

      const expiresAt =
        typeof response.expiresAt === "string"
          ? response.expiresAt
          : undefined;

      toast.success({
        title: "Invitation created",
        description: expiresAt
          ? `${values.email} can join until ${formatDateTime(expiresAt)}.`
          : `${values.email} can now join the team.`,
      });

      setSent({
        email: values.email,
        token:
          typeof response.invitationToken === "string"
            ? response.invitationToken
            : undefined,
        expiresAt,
      });
    } catch (error) {
      const message = getErrorMessage(error);

      setError("root", {
        message,
      });

      toast.destructive({
        title: "Invitation failed",
        description: message,
      });
    }
  }

  function handleRoleChange(values: string[]) {
    const nextRole = values[0] as
      | InviteRoleOption["role"]
      | undefined;

    if (!nextRole) {
      return;
    }

    setValue("role", nextRole, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    setValue(
      "permissions",
      [
        ...(
          DEFAULT_PERMISSIONS_BY_ROLE[nextRole] ??
          []
        ),
      ],
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      },
    );
  }

  function handlePermissionChange(values: string[]) {
    const roleCeiling = MAX_PERMISSIONS_BY_ROLE[selectedRole] ?? [];
    const validValues = values.filter((v) =>
      roleCeiling.includes(v as (typeof roleCeiling)[number]),
    );

    setValue(
      "permissions",
      validValues as InviteMemberFormValues["permissions"],
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      },
    );
  }

  function handleCancel() {
    router.push(lp("/dashboard/team-management"));
  }

  if (sent) {
    return (
      <InvitationSent
        sent={sent}
        onInviteAnother={() => {
          setSent(null);
          reset({
            email: "",
            role: "MEMBER",
            permissions: [...DEFAULT_PERMISSIONS_BY_ROLE.MEMBER],
          });
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="order-1 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10 xl:col-start-1">
          <CardHeader className="border-b border-border px-6 py-5 sm:px-7">
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              Member information
            </CardTitle>

            <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
              Enter the member&apos;s email address and
              configure their organization access.
            </p>
          </CardHeader>

          <CardContent className="px-6 py-7 sm:px-7">
            <FieldGroup className="gap-6">
              {/* Email */}
              <Field
                data-invalid={Boolean(errors.email)}
              >
                <FieldContent className="gap-3">
                  <FieldLabel
                    htmlFor="member-email"
                    className="text-sm font-semibold text-foreground"
                  >
                    Work email
                  </FieldLabel>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="member-email"
                      type="email"
                      autoComplete="email"
                      placeholder="member@company.com"
                      aria-invalid={Boolean(
                        errors.email,
                      )}
                      {...register("email")}
                      className={cn(
                        "h-12 rounded-xl border border-border bg-card pl-12 text-base text-foreground shadow-none placeholder:text-muted-foreground",
                        "focus-visible:border-blue-600 focus-visible:ring-blue-600/15",
                        errors.email &&
                          "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/15",
                      )}
                    />
                  </div>

                  <FieldDescription className="text-sm leading-relaxed text-muted-foreground">
                    The invitation goes to this address, and it has to belong to
                    an existing DevSolve account — invitations link a person who
                    has already registered rather than creating one for them.
                  </FieldDescription>

                  <FieldError
                    errors={[errors.email]}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="order-2 space-y-4 xl:sticky xl:top-24 xl:col-start-2 xl:row-span-2">
          {/* Role selection */}
          <Card className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10">
            <CardHeader className="border-b border-border px-5 py-5">
              <CardTitle className="text-lg font-semibold text-foreground">
                Organization role
              </CardTitle>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Choose the access level for this member.
              </p>
            </CardHeader>

            <CardContent className="px-5 py-5">
              <Field
                data-invalid={Boolean(errors.role)}
              >
                <FieldContent className="gap-4">
                  <ToggleGroup
                    multiple={false}
                    value={[selectedRole]}
                    onValueChange={handleRoleChange}
                    className="flex w-full flex-col gap-3"
                  >
                    {INVITE_ROLE_OPTIONS.map(
                      (option) => (
                        <RoleToggleButton
                          key={option.role}
                          option={option}
                          selected={
                            selectedRole ===
                            option.role
                          }
                        />
                      ),
                    )}
                  </ToggleGroup>

                  <FieldError
                    errors={[errors.role]}
                  />
                </FieldContent>
              </Field>
              </CardContent>
            </Card>

          {/* Summary */}
          <Card className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10">
            <CardHeader className="border-b border-border px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
                  <ShieldCheck className="size-5" />
                </div>

                <div className="min-w-0">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Invitation summary
                  </CardTitle>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Review before sending
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 px-5 py-5">
              <div className="space-y-3">
                <SummaryField
                  icon={Mail}
                  label="Email address"
                  value={
                    email.trim() ||
                    "Not entered yet"
                  }
                  muted={!email.trim()}
                />

                <SummaryField
                  icon={UserRound}
                  label="Organization role"
                  value={selectedRoleTitle}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Permissions
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPermissions.length > 0 ? (
                    selectedPermissions.map(
                      (permission) => (
                        <Badge
                          key={permission}
                          variant="outline"
                          className="rounded-lg border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400"
                        >
                          {formatPermission(
                            permission,
                          )}
                        </Badge>
                      ),
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No permission selected
                    </span>
                  )}
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/10 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />

                  <div>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      Trusted members only
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-blue-700 dark:text-blue-300">
                      Review the member&apos;s email, role,
                      and permissions before sending.
                    </p>
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>
        </div>

        <Card className="order-3 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10 xl:col-start-1">
          <CardHeader className="border-b border-border px-6 py-5 sm:px-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                  Access queue
                </CardTitle>

                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Assign the permissions this teammate should have from day one.
                </p>
              </div>

              <Badge
                variant="outline"
                className="w-fit rounded-full border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400"
              >
                {selectedPermissions.length} selected
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="px-6 py-7 sm:px-7">
            <FieldGroup className="gap-6">
              <Field
                data-invalid={Boolean(
                  errors.permissions,
                )}
              >
                <FieldContent className="gap-4">
                  <div>
                    <FieldLabel className="text-sm font-semibold text-foreground">
                      Permissions
                    </FieldLabel>

                    <FieldDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Select what this member can access inside the organization.
                    </FieldDescription>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
                    <div className="p-3">
                      <ToggleGroup
                        multiple
                        orientation="vertical"
                        value={selectedPermissions}
                        onValueChange={
                          handlePermissionChange
                        }
                        className="w-full gap-0"
                      >
                        {INVITE_PERMISSION_OPTIONS.map(
                          (option) => {
                            const isAllowed = (
                              MAX_PERMISSIONS_BY_ROLE[selectedRole] ?? []
                            ).includes(option.value);
                            return (
                              <PermissionTableRow
                                key={option.value}
                                option={option}
                                selected={selectedPermissions.includes(
                                  option.value,
                                )}
                                disabled={!isAllowed}
                              />
                            );
                          },
                        )}
                      </ToggleGroup>
                    </div>
                  </div>

                  <FieldError
                    errors={[
                      errors.permissions,
                    ]}
                  />
                </FieldContent>
              </Field>

              {errors.root?.message ? (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -4,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="mt-0.5 size-5 shrink-0" />

                  <p>{errors.root.message}</p>
                </motion.div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-11 rounded-xl border-border bg-card px-5 text-sm font-medium text-foreground shadow-none hover:bg-muted cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending invitation...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Send invitation
                    </>
                  )}
                </Button>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="order-4 rounded-2xl border border-border bg-muted/40 p-5 xl:col-start-2">
          <p className="text-sm font-semibold text-foreground">
            What happens next?
          </p>

          <ol className="mt-4 space-y-4">
            <Step
              number="1"
              text="The member receives an invitation email."
            />

            <Step
              number="2"
              text="They sign in using their account."
            />

            <Step
              number="3"
              text="Their role and permissions are activated."
            />
          </ol>
        </div>
      </div>
    </form>
  );
}

type PermissionTableRowProps = {
  option: InvitePermissionOption;
  selected: boolean;
  disabled?: boolean;
};

function PermissionTableRow({
  option,
  selected,
  disabled = false,
}: PermissionTableRowProps) {
  const category =
    getPermissionCategory(option.value);

  return (
      <ToggleGroupItem
        value={option.value}
        disabled={disabled}
        aria-label={`${
          selected ? "Remove" : "Add"
        } ${option.title} permission`}
      className={cn(
        "group block h-auto min-h-0 w-full whitespace-normal rounded-none border-0 bg-transparent px-0 py-0 text-left font-normal shadow-none",
        "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2563EB]/25",
        "hover:bg-transparent aria-pressed:bg-transparent data-[state=on]:bg-transparent dark:hover:bg-transparent dark:aria-pressed:bg-transparent dark:data-[state=on]:bg-transparent",
        "text-slate-900 dark:text-slate-100",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      >
        <motion.div
        initial={false}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.18,
          ease: "easeOut",
        }}
        className={cn(
          "flex items-center justify-between gap-4 rounded-lg border border-transparent px-3 py-3.5 transition-all duration-200",
          selected
            ? "bg-slate-50/90 shadow-none dark:bg-slate-900/80"
            : disabled
              ? "bg-muted/40 text-muted-foreground"
              : "bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/70",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p
                className={cn(
                  "truncate text-sm font-medium transition-colors duration-200 sm:text-base",
                  selected
                    ? "text-[#2563EB] dark:text-blue-300"
                    : "text-slate-900 group-hover:text-[#2563EB] dark:text-slate-100 dark:group-hover:text-blue-300",
                )}
              >
                {option.title}
              </p>

              <PermissionCategoryBadge
                category={category}
              />
            </div>

            <p
              title={option.description}
              className="mt-0.5 line-clamp-1 text-sm text-slate-500 dark:text-slate-400"
            >
              {disabled ? (
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  Not available for this role &mdash; promote to grant.
                </span>
              ) : (
                option.description
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <motion.span
            initial={false}
            animate={{
              scale: selected ? 1 : 0.95,
            }}
            whileHover={{
              scale: 1.02,
            }}
            transition={{
              duration: 0.16,
              ease: "easeOut",
            }}
            aria-hidden="true"
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
              selected
                ? [
                    "border-[#2563EB]",
                    "bg-[#2563EB]",
                    "text-white",
                    "ring-2 ring-blue-100",
                    "dark:border-blue-400",
                    "dark:bg-blue-500",
                    "dark:ring-blue-900/40",
                  ]
                : [
                    "border-slate-300",
                    "bg-white",
                    "text-transparent",
                    "group-hover:border-blue-300",
                    "group-hover:bg-blue-50/80",
                    "group-hover:text-[#2563EB]",
                    "dark:border-slate-700",
                    "dark:bg-slate-950",
                    "dark:group-hover:border-blue-700",
                    "dark:group-hover:bg-blue-950/30",
                    "dark:group-hover:text-blue-300",
                ],
            )}
          >
            <Check className="size-3.5 stroke-[2.5]" />
          </motion.span>
        </div>
      </motion.div>
    </ToggleGroupItem>
  );
}

type RoleToggleButtonProps = {
  option: InviteRoleOption;
  selected: boolean;
};

function RoleToggleButton({
  option,
  selected,
}: RoleToggleButtonProps) {
  const Icon = roleIcons[option.role];
  const capabilities =
    roleCapabilities[option.role];

  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      transition={{
        duration: 0.18,
      }}
      className="w-full"
    >
      <ToggleGroupItem
        value={option.role}
        aria-label={`Select ${option.title} role`}
        className={cn(
          "flex h-auto min-h-0 w-full flex-col items-stretch whitespace-normal rounded-xl border px-4 py-4 text-left transition-all duration-200 aria-pressed:bg-white aria-pressed:text-slate-700 dark:aria-pressed:bg-slate-950 dark:aria-pressed:text-slate-200",
          selected
            ? "border-blue-300 bg-white text-slate-700 shadow-none hover:bg-white dark:border-blue-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-950"
            : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900",
        )}
      >
        <div className="flex w-full items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                selected
                  ? "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
              )}
            >
              <Icon className="size-4" />
            </span>

            <div className="min-w-0">
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {option.title}
              </p>

              <p className="mt-1 whitespace-normal text-sm leading-5 text-slate-500 dark:text-slate-400">
                {getRoleSummary(option.role)}
              </p>
            </div>
          </div>

            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border",
                selected
                  ? "border-[#2563EB] bg-[#2563EB] text-white"
                : "border-slate-300 bg-white text-transparent dark:border-slate-700 dark:bg-slate-950",
            )}
          >
            <Check className="size-4" />
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {capabilities.map((capability) => (
            <span
              key={capability}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-sm font-medium",
                selected
                  ? "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
              )}
            >
              {capability}
            </span>
          ))}
        </div>
      </ToggleGroupItem>
    </motion.div>
  );
}

function PermissionCategoryBadge({
  category,
}: {
  category: PermissionCategory;
}) {
  const styles: Record<
    PermissionCategory,
    string
  > = {
    Programs:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",

    Reports:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300",

    Disclosure:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",

    Rewards:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",

    Researchers:
      "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300",

    Members:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300",

    General:
      "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "w-fit min-w-[88px] justify-center rounded-full px-2.5 py-1 text-xs font-medium",
        styles[category],
      )}
    >
      {category}
    </Badge>
  );
}

type SummaryFieldProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  muted?: boolean;
};

function SummaryField({
  icon: Icon,
  label,
  value,
  muted = false,
}: SummaryFieldProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:ring-slate-700">
          <Icon className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p
            title={value}
            className={cn(
              "mt-1 max-w-full text-sm font-semibold leading-5 [overflow-wrap:anywhere]",
              muted
                ? "text-slate-400"
                : "text-slate-900 dark:text-slate-100",
            )}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#2563EB] ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-700">
        {number}
      </span>

      <p className="pt-0.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {text}
      </p>
    </li>
  );
}

/**
 * What happens after a successful invite.
 *
 * The screen used to bounce straight to team management on a 201, which threw
 * away the one copy of the invitation token anybody would ever see. The email
 * the backend sends is not something this app can confirm arrived — it depends
 * on the recipient's own `INVITATION` email preference and on mail config well
 * outside it — so the link is put in the inviter's hands as well. Belt and
 * braces, and it costs one screen.
 */
function InvitationSent({
  sent,
  onInviteAnother,
}: {
  sent: { email: string; token?: string; expiresAt?: string };
  onInviteAnother: () => void;
}) {
  const lp = useLocalePath();
  const [copied, setCopied] = useState(false);

  /* Built from `NEXT_PUBLIC_SITE_URL`, the same origin canonical URLs use, so
     it is a link that works from any machine — not the inviter's `localhost`. */
  const link = sent.token
    ? absoluteUrl(lp(`/invitations/${sent.token}`))
    : null;

  async function copyLink() {
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.destructive({
        title: "Could not copy the link",
        description: "Select it in the field and copy it by hand.",
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto w-full max-w-2xl"
    >
      <Card className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10">
        <CardContent className="space-y-6 px-6 py-7 sm:px-7">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
            >
              <CheckCircle2 className="size-6" />
            </span>
            <div className="min-w-0 space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Invitation created
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {sent.email}
                </span>{" "}
                can now join your team. It is waiting on their invitations
                screen, and the invitation email is on its way.
                {sent.expiresAt
                  ? ` Either way it stops working on ${formatDateTime(sent.expiresAt)}.`
                  : ""}
              </p>
            </div>
          </div>

          {link ? (
            <div className="space-y-2.5 rounded-xl bg-muted/60 p-4">
              <p className="text-sm font-semibold text-foreground">
                Their invitation link
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  readOnly
                  value={link}
                  aria-label="Invitation link"
                  onFocus={(event) => event.currentTarget.select()}
                  className="h-11 flex-1 rounded-xl bg-card font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void copyLink()}
                  className="h-11 shrink-0 cursor-pointer rounded-xl px-4 text-sm font-semibold"
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied ? "Copied" : "Copy link"}
                </Button>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Send this yourself if the email does not arrive — it can be
                filtered as spam, and an account can turn invitation emails off.
                It only works for {sent.email}, so it is safe to paste in a
                chat.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link
              href={lp("/dashboard/team-management")}
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 rounded-xl px-5 text-base font-semibold",
              )}
            >
              Back to the team
              <ArrowRight data-icon="inline-end" />
            </Link>

            <Button
              type="button"
              variant="outline"
              onClick={onInviteAnother}
              className="h-11 cursor-pointer rounded-xl px-5 text-base font-semibold"
            >
              <Mail className="size-4" />
              Invite someone else
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getPermissionCategory(
  permission: InvitePermissionOption["value"],
): PermissionCategory {
  if (permission.includes("PROGRAM")) {
    return "Programs";
  }

  if (permission.includes("REPORT")) {
    return "Reports";
  }

  if (permission.includes("DISCLOSURE")) {
    return "Disclosure";
  }

  if (permission.includes("REWARD")) {
    return "Rewards";
  }

  if (permission.includes("RESEARCHER")) {
    return "Researchers";
  }

  if (permission.includes("MEMBER")) {
    return "Members";
  }

  return "General";
}

function getRoleSummary(
  role: InviteRoleOption["role"],
): string {
  switch (role) {
    case "MANAGER":
      return "Manage organization operations.";

    case "MEMBER":
      return "Work with programs and reports.";

    case "VIEWER":
      return "View content without editing.";

    default:
      return "";
  }
}

function formatPermission(
  permission: string,
): string {
  return permission
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}
