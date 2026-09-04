"use client";

import React, { useState } from "react";
import { Globe, LoaderCircle, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVirusTotalScan } from "@/hooks/useVirusTotalScan";
import { ContentScanStatus } from "@/components/security/ContentScanStatus";
import { validateScanUrl } from "@/lib/validations/attachment";

interface VirusTotalUrlScannerProps {
  onScanComplete?: (url: string, isSafe: boolean) => void;
  defaultUrl?: string;
  className?: string;
}

export function VirusTotalUrlScanner({
  onScanComplete,
  defaultUrl = "",
  className,
}: VirusTotalUrlScannerProps) {
  const [url, setUrl] = useState(defaultUrl);
  const [localError, setLocalError] = useState<string | null>(null);

  const { scanUrl, currentResult, isScanning, isConfigured } = useVirusTotalScan();

  if (!isConfigured) {
    return null;
  }

  const handleScan = async () => {
    setLocalError(null);
    const err = validateScanUrl(url);
    if (err) {
      setLocalError(err);
      return;
    }

    const res = await scanUrl(url);
    if (onScanComplete) {
      onScanComplete(url, res.isSafeToProceed);
    }
  };

  return (
    <div className={`space-y-3 font-sans ${className || ""}`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Shield className="h-4 w-4 text-primary" />
        <span>VirusTotal URL Threat Scanner</span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setLocalError(null);
            }}
            placeholder="https://example.com/target-endpoint"
            disabled={isScanning}
            className="pl-9 h-11 rounded-xl"
          />
        </div>
        <Button
          type="button"
          onClick={handleScan}
          disabled={isScanning || !url.trim()}
          className="h-11 rounded-xl px-5 font-semibold shrink-0 cursor-pointer"
        >
          {isScanning ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              Scanning…
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Check URL
            </>
          )}
        </Button>
      </div>

      {localError && (
        <p className="text-xs font-medium text-destructive">{localError}</p>
      )}

      {currentResult && <ContentScanStatus result={currentResult} />}
    </div>
  );
}
