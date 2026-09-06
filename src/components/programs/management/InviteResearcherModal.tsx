"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  UserCheck,
  UserPlus,
  Loader2,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetPublicProfilesQuery,
  type PublicUserProfileItem,
} from "@/lib/redux/services/profileApi";
import { useInviteResearcherMutation } from "@/lib/redux/services/programInvitationsApi";
import { apiErrorMessage } from "@/lib/api/error-message";
import { cn } from "@/lib/utils";

interface InviteResearcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programName: string;
  preselectedUser?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
}

export function InviteResearcherModal({
  isOpen,
  onClose,
  programId,
  programName,
  preselectedUser,
}: InviteResearcherModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null>(null);
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [inviteResearcher, { isLoading: isInviting }] =
    useInviteResearcherMutation();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Set preselected user if provided
  useEffect(() => {
    if (preselectedUser) {
      setSelectedUser(preselectedUser);
    } else if (isOpen) {
      setSelectedUser(null);
      setSearchTerm("");
      setDebouncedSearch("");
      setNote("");
      setErrorMessage(null);
    }
  }, [preselectedUser, isOpen]);

  const { data: searchData, isFetching: isSearching } =
    useGetPublicProfilesQuery(
      { query: debouncedSearch, pageSize: 8 },
      { skip: !isOpen || Boolean(preselectedUser) || debouncedSearch.length < 2 },
    );

  const profiles: PublicUserProfileItem[] = searchData?.content ?? [];

  const handleSelectUser = (profile: PublicUserProfileItem) => {
    setSelectedUser({
      id: profile.id,
      name: profile.fullName || "DevSolve Researcher",
      avatarUrl: profile.avatarUrl,
    });
    setErrorMessage(null);
  };

  const handleClearSelectedUser = () => {
    setSelectedUser(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setErrorMessage("Please select a researcher to invite.");
      return;
    }

    setErrorMessage(null);

    try {
      await inviteResearcher({
        programId,
        body: {
          userId: selectedUser.id,
          note: note.trim() || undefined,
        },
      }).unwrap();

      toast.success(`Invitation sent to ${selectedUser.name}`);
      onClose();
    } catch (err: any) {
      // Surface backend errors verbatim (409, 404, 403)
      const message =
        err?.data?.message ||
        apiErrorMessage(err, "Failed to send invitation.");
      setErrorMessage(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-6 bg-card border border-border shadow-xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            <span>Invite Researcher to Guest List</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Invite a researcher to <span className="font-semibold text-foreground">{programName}</span>.
            They will be able to read program scope and policies immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* User Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Researcher <span className="text-destructive">*</span>
            </label>

            {selectedUser ? (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-primary/40 bg-primary/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative size-10 shrink-0 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center font-bold text-sm text-muted-foreground">
                    {selectedUser.avatarUrl ? (
                      <Image
                        src={selectedUser.avatarUrl}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      selectedUser.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {selectedUser.name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Check className="size-3 text-emerald-500" /> Selected researcher
                    </p>
                  </div>
                </div>

                {!preselectedUser && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelectedUser}
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    title="Change researcher"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search researcher by name or keyword..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-background h-10 rounded-xl"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
                  )}
                </div>

                {/* Search Results Dropdown */}
                {debouncedSearch.length >= 2 && (
                  <div className="max-h-52 overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-md space-y-1">
                    {profiles.length > 0 ? (
                      profiles.map((profile) => (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => handleSelectUser(profile)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-muted/60 transition-colors cursor-pointer"
                        >
                          <div className="relative size-8 shrink-0 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center font-bold text-xs text-muted-foreground">
                            {profile.avatarUrl ? (
                              <Image
                                src={profile.avatarUrl}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              (profile.fullName || "User").slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {profile.fullName || "Unnamed Researcher"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {profile.reputation !== undefined
                                ? `${profile.reputation} reputation`
                                : "Researcher"}
                              {profile.country ? ` · ${profile.country}` : ""}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : !isSearching ? (
                      <div className="py-4 text-center text-xs text-muted-foreground">
                        No active researchers found matching &ldquo;{debouncedSearch}&rdquo;
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Invitation Note */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold uppercase tracking-wider text-muted-foreground">
                Invitation Note <span className="font-normal lowercase text-muted-foreground/80">(optional)</span>
              </label>
              <span
                className={cn(
                  "font-mono text-[11px]",
                  note.length > 1900 ? "text-amber-500" : "text-muted-foreground",
                )}
              >
                {note.length} / 2000
              </span>
            </div>
            <Textarea
              placeholder="Tell the researcher why you're inviting them to this private program (e.g. specialized scope, tech stack match)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={2000}
              rows={3}
              className="resize-none bg-background rounded-xl text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              A brief personal note encourages acceptance and prevents invitations from reading like spam.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isInviting}
              className="rounded-xl font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedUser || isInviting}
              className="rounded-xl font-semibold gap-1.5"
            >
              {isInviting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Sending Invitation...</span>
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  <span>Send Invitation</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
