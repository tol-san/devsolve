import { FileStack } from "lucide-react";

type SavedDraftHeaderProps = {
  totalDrafts: number;
};

export function SavedDraftHeader({ totalDrafts }: SavedDraftHeaderProps) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-2.5">
        <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-foreground">
          Saved Draft
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Manage all your saved drafts across problems, showcases, solutions,
          programs, and reports.
        </p>
      </div>
    </header>
  );
}
