import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetReportByIdQuery,
  useAddReportCommentMutation,
  RetestItem,
  MOCK_RETEST_HISTORY,
} from "@/lib/redux/services/reportsApi";

export type ReportTab = "summary" | "retest";

export function useReportDetail() {
  const params = useParams();
  const router = useRouter();
  const reportId = (params?.id as string) || "1";

  const {
    data: initialReport,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetReportByIdQuery(reportId);
  const [addComment, { isLoading: isSubmitting }] = useAddReportCommentMutation();

  const [isForceRejected, setIsForceRejected] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTab>("summary");
  const [commentText, setCommentText] = useState("");
  const [copiedPayload, setCopiedPayload] = useState(false);

  const [retestHistory, setRetestHistory] = useState<RetestItem[]>([]);

  const handleBack = () => {
    router.back();
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment({ reportId, text: commentText }).unwrap();
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleInitiateRetest = () => {
    setRetestHistory(MOCK_RETEST_HISTORY);
  };

  const handleResetRetest = () => {
    setRetestHistory([]);
  };

  const handleCopyPayload = () => {
    const payload = initialReport?.proofOfConcept;
    if (!payload) return;

    navigator.clipboard.writeText(payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const isRejected =
    isForceRejected !== null ? isForceRejected : initialReport?.status === "REJECTED";

  const report = initialReport;

  return {
    reportId,
    report,
    isLoading,
    isError,
    error,
    refetch,
    isRejected,
    setIsForceRejected,
    activeTab,
    setActiveTab,
    commentText,
    setCommentText,
    isSubmitting,
    copiedPayload,
    retestHistory,
    handleBack,
    handleSendComment,
    handleInitiateRetest,
    handleResetRetest,
    handleCopyPayload,
  };
}
