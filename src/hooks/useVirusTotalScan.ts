"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  usePollAnalysisMutation,
  useSubmitFileScanMutation,
  useSubmitUrlScanMutation,
} from "@/lib/redux/services/virusTotalApi";
import type {
  VirusTotalAnalysisResponse,
  VirusTotalStats,
  VirusTotalVerdict,
} from "@/lib/types/virustotal/types";
import {
  validateAttachment,
  validateScanUrl,
} from "@/lib/validations/attachment";

export type ScanState =
  | "idle"
  | "validating"
  | "submitting"
  | "polling"
  | "clean"
  | "suspicious"
  | "malicious"
  | "timed_out"
  | "unscanned"
  | "unconfigured"
  | "error";

export interface ScanResult {
  id?: string;
  target: string;
  type: "file" | "url";
  state: ScanState;
  verdict: VirusTotalVerdict | "UNKNOWN";
  stats?: VirusTotalStats;
  message?: string;
  isSafeToProceed: boolean;
  pollAttempts: number;
}

const POLL_DELAYS_MS = [5000, 10000, 15000, 20000, 20000, 25000];
const MAX_POLL_ATTEMPTS = 6;

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(() => resolve(), ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

function getErrorStatus(err: unknown): number | null {
  if (typeof err === "object" && err !== null && "status" in err) {
    const status = (err as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  return null;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null && "data" in err) {
    const data = (err as { data?: unknown }).data;
    if (typeof data === "string" && data.trim()) return data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === "string" && msg.trim()) return msg;
    }
  }
  return fallback;
}

/** Global flag to remember 503 unconfigured state across hook instances. */
let isGloballyConfigured: boolean | null = null;

export function useVirusTotalScan() {
  const [submitFile] = useSubmitFileScanMutation();
  const [submitUrl] = useSubmitUrlScanMutation();
  const [pollAnalysis] = usePollAnalysisMutation();

  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(
    isGloballyConfigured !== false,
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Polls an analysis ID using backoff schedule: 5s -> 10s -> 20s (max 3 attempts).
   */
  const pollWithBackoff = useCallback(
    async (
      analysisId: string,
      targetName: string,
      type: "file" | "url",
      signal: AbortSignal,
    ): Promise<ScanResult> => {
      let attempts = 0;

      while (attempts < MAX_POLL_ATTEMPTS) {
        if (signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }

        const delay = POLL_DELAYS_MS[attempts] ?? 20000;
        attempts++;

        setCurrentResult({
          id: analysisId,
          target: targetName,
          type,
          state: "polling",
          verdict: "PENDING",
          pollAttempts: attempts,
          isSafeToProceed: false,
        });

        await sleep(delay, signal);

        try {
          const response = await pollAnalysis(analysisId).unwrap();

          if (response.verdict === "CLEAN") {
            return {
              id: analysisId,
              target: targetName,
              type,
              state: "clean",
              verdict: "CLEAN",
              stats: response.stats,
              isSafeToProceed: true,
              pollAttempts: attempts,
            };
          }

          if (response.verdict === "SUSPICIOUS") {
            return {
              id: analysisId,
              target: targetName,
              type,
              state: "suspicious",
              verdict: "SUSPICIOUS",
              stats: response.stats,
              message: "Content flagged as suspicious by security engines.",
              isSafeToProceed: false,
              pollAttempts: attempts,
            };
          }

          if (response.verdict === "MALICIOUS") {
            return {
              id: analysisId,
              target: targetName,
              type,
              state: "malicious",
              verdict: "MALICIOUS",
              stats: response.stats,
              message: "Content flagged as malicious and unsafe.",
              isSafeToProceed: false,
              pollAttempts: attempts,
            };
          }

          // If still PENDING, loop to next backoff attempt
        } catch (pollErr: unknown) {
          const status = getErrorStatus(pollErr);

          if (status === 404) {
            return {
              id: analysisId,
              target: targetName,
              type,
              state: "error",
              verdict: "UNKNOWN",
              message: "Scan result unavailable.",
              isSafeToProceed: false,
              pollAttempts: attempts,
            };
          }

          if (status === 429 || status === 502) {
            // Quota exhausted or upstream unavailable -> treat as unscanned, allow proceed
            return {
              id: analysisId,
              target: targetName,
              type,
              state: "unscanned",
              verdict: "UNKNOWN",
              message: "Security scanning rate limit reached. Proceeding without scan.",
              isSafeToProceed: true,
              pollAttempts: attempts,
            };
          }

          if (status === 503) {
            isGloballyConfigured = false;
            setIsConfigured(false);
            return {
              id: analysisId,
              target: targetName,
              type,
              state: "unconfigured",
              verdict: "UNKNOWN",
              isSafeToProceed: true,
              pollAttempts: attempts,
            };
          }

          // Other unexpected error -> non-blocking fallback
          return {
            id: analysisId,
            target: targetName,
            type,
            state: "unscanned",
            verdict: "UNKNOWN",
            message: "Unable to verify scan status.",
            isSafeToProceed: true,
            pollAttempts: attempts,
          };
        }
      }

      // Max attempts reached while still PENDING -> treat as timed out (fail-closed)
      return {
        id: analysisId,
        target: targetName,
        type,
        state: "timed_out",
        verdict: "UNKNOWN",
        message: "Security scan did not return a final verdict in time. Unscanned content cannot be accepted; please try again.",
        isSafeToProceed: false,
        pollAttempts: attempts,
      };
    },
    [pollAnalysis],
  );

  /**
   * Scan a standalone file through the explicit VirusTotal endpoint.
   */
  const scanFile = useCallback(
    async (file: File): Promise<ScanResult> => {
      if (isGloballyConfigured === false) {
        return {
          target: file.name,
          type: "file",
          state: "unconfigured",
          verdict: "UNKNOWN",
          isSafeToProceed: true,
          pollAttempts: 0,
        };
      }

      // 1. Client-side pre-validation
      setCurrentResult({
        target: file.name,
        type: "file",
        state: "validating",
        verdict: "PENDING",
        pollAttempts: 0,
        isSafeToProceed: false,
      });

      const validationError = validateAttachment(file);
      if (validationError) {
        const errorResult: ScanResult = {
          target: file.name,
          type: "file",
          state: "error",
          verdict: "UNKNOWN",
          message: validationError,
          isSafeToProceed: false,
          pollAttempts: 0,
        };
        setCurrentResult(errorResult);
        return errorResult;
      }

      // 2. Submit file
      setIsScanning(true);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const abortCtrl = new AbortController();
      abortControllerRef.current = abortCtrl;

      setCurrentResult({
        target: file.name,
        type: "file",
        state: "submitting",
        verdict: "PENDING",
        pollAttempts: 0,
        isSafeToProceed: false,
      });

      try {
        const submitResponse: VirusTotalAnalysisResponse = await submitFile(
          file,
        ).unwrap();

        // 3. Poll analysis
        const finalResult = await pollWithBackoff(
          submitResponse.analysisId,
          file.name,
          "file",
          abortCtrl.signal,
        );

        setCurrentResult(finalResult);
        setIsScanning(false);
        return finalResult;
      } catch (err: unknown) {
        setIsScanning(false);
        const status = getErrorStatus(err);

        if (status === 503) {
          isGloballyConfigured = false;
          setIsConfigured(false);
          const res: ScanResult = {
            target: file.name,
            type: "file",
            state: "unconfigured",
            verdict: "UNKNOWN",
            isSafeToProceed: true,
            pollAttempts: 0,
          };
          setCurrentResult(res);
          return res;
        }

        if (status === 429 || status === 502) {
          const res: ScanResult = {
            target: file.name,
            type: "file",
            state: "unscanned",
            verdict: "UNKNOWN",
            message: "Scan quota exhausted. Proceeding normally.",
            isSafeToProceed: true,
            pollAttempts: 0,
          };
          setCurrentResult(res);
          return res;
        }

        const msg = getErrorMessage(err, "Failed to submit file for scan.");
        const res: ScanResult = {
          target: file.name,
          type: "file",
          state: "error",
          verdict: "UNKNOWN",
          message: msg,
          isSafeToProceed: false,
          pollAttempts: 0,
        };
        setCurrentResult(res);
        return res;
      }
    },
    [pollWithBackoff, submitFile],
  );

  /**
   * Scan a standalone URL through the explicit VirusTotal endpoint.
   */
  const scanUrl = useCallback(
    async (url: string): Promise<ScanResult> => {
      if (isGloballyConfigured === false) {
        return {
          target: url,
          type: "url",
          state: "unconfigured",
          verdict: "UNKNOWN",
          isSafeToProceed: true,
          pollAttempts: 0,
        };
      }

      // 1. Client-side pre-validation
      setCurrentResult({
        target: url,
        type: "url",
        state: "validating",
        verdict: "PENDING",
        pollAttempts: 0,
        isSafeToProceed: false,
      });

      const validationError = validateScanUrl(url);
      if (validationError) {
        const errorResult: ScanResult = {
          target: url,
          type: "url",
          state: "error",
          verdict: "UNKNOWN",
          message: validationError,
          isSafeToProceed: false,
          pollAttempts: 0,
        };
        setCurrentResult(errorResult);
        return errorResult;
      }

      // 2. Submit URL
      setIsScanning(true);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const abortCtrl = new AbortController();
      abortControllerRef.current = abortCtrl;

      setCurrentResult({
        target: url,
        type: "url",
        state: "submitting",
        verdict: "PENDING",
        pollAttempts: 0,
        isSafeToProceed: false,
      });

      try {
        const submitResponse = await submitUrl({ url }).unwrap();

        // 3. Poll analysis
        const finalResult = await pollWithBackoff(
          submitResponse.analysisId,
          url,
          "url",
          abortCtrl.signal,
        );

        setCurrentResult(finalResult);
        setIsScanning(false);
        return finalResult;
      } catch (err: unknown) {
        setIsScanning(false);
        const status = getErrorStatus(err);

        if (status === 503) {
          isGloballyConfigured = false;
          setIsConfigured(false);
          const res: ScanResult = {
            target: url,
            type: "url",
            state: "unconfigured",
            verdict: "UNKNOWN",
            isSafeToProceed: true,
            pollAttempts: 0,
          };
          setCurrentResult(res);
          return res;
        }

        if (status === 429 || status === 502) {
          const res: ScanResult = {
            target: url,
            type: "url",
            state: "unscanned",
            verdict: "UNKNOWN",
            message: "Scan quota exhausted. Proceeding normally.",
            isSafeToProceed: true,
            pollAttempts: 0,
          };
          setCurrentResult(res);
          return res;
        }

        const msg = getErrorMessage(err, "Failed to submit URL for scan.");
        const res: ScanResult = {
          target: url,
          type: "url",
          state: "error",
          verdict: "UNKNOWN",
          message: msg,
          isSafeToProceed: false,
          pollAttempts: 0,
        };
        setCurrentResult(res);
        return res;
      }
    },
    [pollWithBackoff, submitUrl],
  );

  /**
   * Scan multiple items sequentially to protect the 4 requests/min public quota.
   */
  const scanSequence = useCallback(
    async (
      items: Array<{ type: "file"; file: File } | { type: "url"; url: string }>,
    ): Promise<ScanResult[]> => {
      const results: ScanResult[] = [];
      for (const item of items) {
        if (item.type === "file") {
          const res = await scanFile(item.file);
          results.push(res);
          if (!res.isSafeToProceed) break;
        } else {
          const res = await scanUrl(item.url);
          results.push(res);
          if (!res.isSafeToProceed) break;
        }
      }
      return results;
    },
    [scanFile, scanUrl],
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCurrentResult(null);
    setIsScanning(false);
  }, []);

  return {
    scanFile,
    scanUrl,
    scanSequence,
    reset,
    currentResult,
    isScanning,
    isConfigured,
  };
}
