import { formatDateTime } from "@/lib/format/datetime";
import type {
  ManagedReport,
  MetricCard,
  ReportManagementDetail,
} from "@/components/report-management/types";

export const REPORT_METRICS: MetricCard[] = [
  { title: "Total Report", value: 200 },
  { title: "Pending", value: 20 },
  { title: "Under Review", value: 5 },
  { title: "Approved", value: 78 },
];

export const MANAGED_REPORTS: ManagedReport[] = [
  {
    id: 1,
    title: "TikTok Security Bug Bounty",
    programLogo: "/tiktok.png",
    author: "Seng Songhuor",
    authorEmail: "seng@devsolve.io",
    authorInitials: "SS",
    type: "Bounty",
    status: "Open",
    severity: "Critical",
    submittedAt: "Jan 12, 2026, 09:15:32 AM",
    summary:
      "Find security vulnerabilities across TikTok's web platform, mobile apps, and creator APIs with a focus on authentication, payment, and media upload flows.",
    assets: ["api.tiktok.com", "Android App"],
  },
  {
    id: 2,
    title: "TikTok Video Moderation Workflow",
    programLogo: "/tiktok.png",
    author: "Seng Songhuor",
    authorEmail: "moderation@devsolve.io",
    authorInitials: "SS",
    type: "Response",
    status: "Closed",
    severity: "High",
    submittedAt: "Jan 18, 2026, 02:40:18 PM",
    summary:
      "Review a vulnerability report tied to internal moderation tooling and evaluate whether the escalation path can be abused outside the trusted staff environment.",
    assets: ["moderation.tiktok.com", "Internal Dashboard"],
  },
  {
    id: 3,
    title: "TikTok Creator Commerce APIs",
    programLogo: "/tiktok.png",
    author: "Seng Songhuor",
    authorEmail: "commerce@devsolve.io",
    authorInitials: "SS",
    type: "Response",
    status: "Open",
    severity: "Medium",
    submittedAt: "Feb 03, 2026, 11:22:45 AM",
    summary:
      "Assess report triage findings for commerce APIs handling creator shop inventory sync, discount code application, and partner account permissions.",
    assets: ["commerce-api.tiktok.com", "Partner Portal"],
  },
  {
    id: 4,
    title: "TikTok Live Stream Session Handling",
    programLogo: "/tiktok.png",
    author: "Seng Songhuor",
    authorEmail: "live@devsolve.io",
    authorInitials: "SS",
    type: "Response",
    status: "Closed",
    severity: "Low",
    submittedAt: "Feb 14, 2026, 04:05:12 PM",
    summary:
      "Validate whether stream session reuse findings can reproduce against current production infrastructure after the identity service patch was deployed.",
    assets: ["live.tiktok.com", "iOS App"],
  },
  {
    id: 5,
    title: "TikTok Ads Manager Partner Access",
    programLogo: "/tiktok.png",
    author: "Seng Songhuor",
    authorEmail: "ads@devsolve.io",
    authorInitials: "SS",
    type: "Response",
    status: "Closed",
    severity: "High",
    submittedAt: "Mar 02, 2026, 08:30:50 AM",
    summary:
      "Investigate a partner-access permission report affecting shared advertiser workspaces, seat management, and billing account role inheritance.",
    assets: ["ads.tiktok.com", "Billing Console"],
  },
  {
    id: 6,
    title: "TikTok Mobile App Token Exchange",
    programLogo: "/tiktok.png",
    author: "Seng Songhuor",
    authorEmail: "mobile@devsolve.io",
    authorInitials: "SS",
    type: "Bounty",
    status: "Open",
    severity: "Critical",
    submittedAt: "Mar 17, 2026, 01:14:28 PM",
    summary:
      "Prioritize mobile token exchange flaws impacting sign-in refresh flows, device trust signals, and cross-account session persistence on Android.",
    assets: ["Android App", "auth.tiktok.com"],
  },
  {
    id: 7,
    title: "TikTok Creator Studio Draft Uploads",
    programLogo: "/tiktok.png",
    author: "Seng Songhuor",
    authorEmail: "studio@devsolve.io",
    authorInitials: "SS",
    type: "Bounty",
    status: "Open",
    severity: "Medium",
    submittedAt: "Apr 04, 2026, 10:48:19 AM",
    summary:
      "Investigate whether draft upload endpoints expose unintended asset access through orphaned media references and insufficient ownership checks.",
    assets: ["studio.tiktok.com", "Media Upload API"],
  },
  {
    id: 8,
    title: "TikTok Web Session Cookie Scope",
    programLogo: "/tiktok.png",
    author: "Seng Songhuor",
    authorEmail: "web@devsolve.io",
    authorInitials: "SS",
    type: "Response",
    status: "Closed",
    severity: "Critical",
    submittedAt: "Apr 22, 2026, 03:55:04 PM",
    summary:
      "Confirm remediation of a cookie scope report affecting session isolation between creator, business, and personal account surfaces on web.",
    assets: ["www.tiktok.com", "Creator Center"],
  },
  {
    id: 9,
    title: "TikTok Public API Partner Sandbox",
    programLogo: "/tiktok.png",
    author: "Seng Songhuor",
    authorEmail: "sandbox@devsolve.io",
    authorInitials: "SS",
    type: "Bounty",
    status: "Open",
    severity: "High",
    submittedAt: "May 09, 2026, 07:18:36 AM",
    summary:
      "Review sandbox escape findings reported through the partner program and verify whether test credentials can pivot into production-linked resources.",
    assets: ["sandbox-api.tiktok.com", "Partner Sandbox"],
  },
  {
    id: 10,
    title: "TikTok Business Center Role Sync",
    programLogo: "/tiktok.png",
    author: "Seng Songhuor",
    authorEmail: "business@devsolve.io",
    authorInitials: "SS",
    type: "Response",
    status: "Closed",
    severity: "Medium",
    submittedAt: "May 28, 2026, 12:02:41 PM",
    summary:
      "Check whether delayed role synchronization could let removed collaborators retain temporary access to finance and campaign administration flows.",
    assets: ["business.tiktok.com", "Role Sync Worker"],
  },
  {
    id: 11,
    title: "TikTok Identity Recovery Workflow",
    programLogo: "/tiktok.png",
    author: "Seng Songhuor",
    authorEmail: "identity@devsolve.io",
    authorInitials: "SS",
    type: "Bounty",
    status: "Open",
    severity: "Critical",
    submittedAt: "Jun 11, 2026, 05:27:15 PM",
    summary:
      "Examine identity recovery flows involving phone reset, fallback email verification, and MFA downgrade requests for cross-channel abuse.",
    assets: ["identity.tiktok.com", "Recovery Service"],
  },
  {
    id: 12,
    title: "TikTok Shop Merchant API Review",
    programLogo: "/tiktok.png",
    author: "Seng Songhuor",
    authorEmail: "merchant@devsolve.io",
    authorInitials: "SS",
    type: "Response",
    status: "Closed",
    severity: "High",
    submittedAt: "Jul 14, 2026, 09:39:52 AM",
    summary:
      "Triage a report about merchant API access boundaries across storefront management, order export, and staff invitation endpoints.",
    assets: ["merchant-api.tiktok.com", "Merchant Portal"],
  },
];

export const REPORT_DETAIL: ReportManagementDetail = {
  id: 1,
  reportId: "RPT-2026-00123",
  title: "TikTok Security Bug Bounty",
  programLogo: "/tiktok.png",
  submitter: "Lor Vengroth",
  submitterInitials: "LV",
  submitterEmail: "lor@devsolve.io",
  type: "Bounty",
  status: "Open",
  severity: "Critical",
  cvssScore: "8.1",
  submittedDate: "Jan 15, 2026, 10:14:22 AM",
  bountyRange: "$500 - $14,900, 15 - 60 pts",
  summary:
    "Find security vulnerabilities across TikTok's web platform, mobile apps, and creator APIs. The report focuses on sensitive object access in billing and document retrieval workflows tied to authenticated business accounts.",
  assets: ["*.tiktok.com", "api.tiktok.com", "Android App"],
  affectedUrl: "api.example.com/v1/invoices/1337",
  httpMethod: "GET",
  parameter: "invoice_id",
  environment: "Production",
  environmentNote:
    "This vulnerability was tested against live production servers. Please verify findings with caution.",
  vulnerabilityType: "Insecure Direct Object Reference (IDOR)",
  cweIdentifier: "CWE-639",
  vectorString: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N",
  assessmentSummary:
    "The endpoint /api/v1/invoices/{id} does not properly validate whether the authenticated user has permission to access the requested invoice ID. By iterating through the ID parameter, an attacker can download sensitive billing documents belonging to any other company on the platform.",
  reproductionSteps: [
    "Login to app.example.com as a standard user.",
    "Navigate to the Billing section and view your own invoice, such as ID 1337.",
    "Intercept the request using Burp Suite or a similar testing proxy.",
    "Modify the id parameter to a value not owned by you, such as 1336.",
    "Observe that the server returns the full PDF data and metadata for the unrelated invoice.",
  ],
  impact:
    "Exposure of PII, billing records, and enterprise service usage data for unrelated organizations. The issue introduces high confidentiality risk and can create regulatory exposure across customer accounts.",
  rootCause:
    "The invoice controller trusts the public invoice identifier without enforcing an organization ownership check before resolving the resource from storage.",
  remediation:
    "Introduce a direct authorization policy that validates invoice.organization_id against the authenticated organization context before returning invoice data. Use non-enumerable public identifiers for external document lookups and log authorization failures.",
  analystTip:
    "Tip: Prefer UUID-based public invoice references to reduce trivial enumeration, but still keep a strict server-side ownership check for every request.",
  proofRequestLanguage: "javascript",
  proofRequest: `// Reproduce the invoice enumeration issue with a captured session\nconst params = new URLSearchParams({\n  response_type: "token",\n  client_id: "client_id",\n  redirect_uri: "https://app.example.com/callback",\n  scope: "read:profile",\n});\n\n// Request observed during validation\n// GET https://app.example.com/v1/invoices/1337\n// Modify the invoice identifier to an unowned value such as 1336\n// Observe the returned PDF metadata for another organization`,
  expectedResult: "403 Forbidden / 404 Not Found",
  actualResult: "200 OK (full invoice body returned)",
  attachments: [
    {
      name: "screenshot_01.png",
      kind: "image",
      size: "1.4 MB",
      url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    },
    {
      name: "burp_log.xml",
      kind: "file",
      size: "24.8 KB",
      content: `<?xml version="1.0" encoding="UTF-8"?>
<burp_export version="2.0">
  <item>
    <time>2026-08-31 10:14:22 UTC</time>
    <url>https://app.example.com/v1/invoices/1337</url>
    <host ip="192.0.2.42">app.example.com</host>
    <port>443</port>
    <protocol>https</protocol>
    <method>GET</method>
    <path>/v1/invoices/1337</path>
    <request base64="false"><![CDATA[GET /v1/invoices/1337 HTTP/1.1
Host: app.example.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)

]]></request>
    <status>200</status>
    <responselength>4128</responselength>
    <mimetype>JSON</mimetype>
    <response base64="false"><![CDATA[HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 4128
Access-Control-Allow-Origin: *

{
  "invoice_id": 1337,
  "organization_id": "org_victim_9921",
  "client_name": "Target Enterprise Corp",
  "billing_email": "finance@target-enterprise.com",
  "amount_due": 45000.00,
  "currency": "USD",
  "items": [
    { "desc": "Enterprise Cloud License 2026", "price": 45000.00 }
  ],
  "payment_vault_token": "tok_sec_993418820129"
}]]></response>
  </item>
</burp_export>`,
    },
    {
      name: "network_capture.har",
      kind: "file",
      size: "82.4 KB",
      content: `{\n  "log": {\n    "version": "1.2",\n    "creator": { "name": "DevSolve DevTools", "version": "1.0" },\n    "entries": [\n      {\n        "startedDateTime": "2026-08-31T10:14:22.000Z",\n        "time": 48,\n        "request": {\n          "method": "GET",\n          "url": "https://app.example.com/v1/invoices/1337",\n          "httpVersion": "HTTP/2.0"\n        },\n        "response": {\n          "status": 200,\n          "statusText": "OK",\n          "content": { "mimeType": "application/json" }\n        }\n      }\n    ]\n  }\n}`,
    },
  ],
  externalDocumentation: "Google Drive: Full Reproduction Logs",
  internalAssetLink: "Internal Asset: api.example.com/v1/docs",
  relatedReport: "#RPT-2025-00982 - Similar IDOR in /v1/users",
};

function buildDisplayReportId(report: ManagedReport) {
  if (report.reportId?.trim()) return report.reportId;

  const rawId = String(report.id);
  if (/^\d+$/.test(rawId)) {
    return `RPT-2026-${rawId.padStart(5, "0")}`;
  }

  return `RPT-${rawId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function findManagedReportByRouteId(
  reports: ManagedReport[],
  id: string,
) {
  return reports.find(
    (report) =>
      String(report.id) === id ||
      report.reportId === id ||
      buildDisplayReportId(report) === id,
  );
}

export function buildReportDetailFromManagedReport(
  report: ManagedReport,
): ReportManagementDetail {
  return {
    ...REPORT_DETAIL,
    id: report.id,
    reportId: buildDisplayReportId(report),
    title: report.title,
    programLogo: report.programLogo,
    submitter: report.author,
    submitterInitials: report.authorInitials,
    submitterEmail: report.authorEmail,
    type: report.type,
    status: report.status,
    severity: report.severity,
    submittedDate: report.submittedAt,
    summary: report.summary,
    assets: report.assets,
  };
}

export function buildReportManagementDetailFromApiReport(
  report: import("@/lib/types/reports/types").ReportDetail,
): ReportManagementDetail {
  const sevMap: Record<string, import("@/components/report-management/types").ReportSeverity> = {
    CRITICAL: "Critical",
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
  };
  const severity = sevMap[report.severity] || "Medium";
  const isReviewed =
    report.status === "ACCEPTED" ||
    report.status === "RESOLVED" ||
    report.status === "REJECTED";

  const status: import("@/components/report-management/types").ReportStatus =
    isReviewed ? "Closed" : "Open";

  const submittedDate = report.submittedAt
    ? formatDateTime(report.submittedAt)
    : report.submittedAgo || "Recently";

  const attachments = (report.attachments || []).map((att) => {
    const isImg =
      att.type?.startsWith("image/") ||
      /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(att.name);
    return {
      name: att.name,
      kind: (isImg ? "image" : "file") as "image" | "file",
      url: att.url,
      size: att.size,
    };
  });

  const submitter =
    report.reporterName ||
    report.reporterUsername ||
    "Researcher";
  const submitterInitials =
    submitter
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "RE";

  return {
    id: report.id,
    reportId: report.reportId || `RPT-${report.id.slice(0, 8).toUpperCase()}`,
    title: report.title || "Vulnerability Report",
    programLogo: undefined,
    submitter,
    submitterInitials,
    submitterEmail: report.reporterEmail || "researcher@devsolve.local",
    submitterId: report.reporterId || report.reporterUsername || undefined,
    submitterAvatarUrl:
      (report as any).reporterAvatarUrl ||
      (report as any).avatarUrl ||
      undefined,
    type: report.type || "Bounty",
    status,
    isReviewed,
    rawStatus: report.status,
    severity,
    cvssScore: report.cvssScore || "N/A",
    submittedDate,
    bountyRange: report.bountyOrRep || "$500 - $2,500",
    summary: report.description || "No description provided.",
    assets: report.targetEndpoint ? [report.targetEndpoint] : [report.program || "Target Asset"],
    affectedUrl: report.targetEndpoint || "https://api.target.com",
    httpMethod: "GET",
    parameter: "vulnerable_param",
    environment: report.environment || "Production",
    environmentNote:
      report.environment === "PRODUCTION"
        ? "Live production environment"
        : "Staging / QA environment",
    vulnerabilityType: report.weakness || "Vulnerability Finding",
    cweIdentifier: report.weakness || "CWE-Unclassified",
    vectorString: report.cvssVector || "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
    assessmentSummary: report.description || "No assessment summary.",
    reproductionSteps:
      report.reproduceSteps && report.reproduceSteps.length > 0
        ? report.reproduceSteps
        : [report.description || "Follow steps described in summary."],
    impact: report.impact || "Direct security and operational impact on target environment.",
    rootCause: "Insufficient server-side authorization or input validation.",
    remediation: report.remediation || "Implement defensive authorization and validation checks.",
    analystTip: "Validate vulnerability fix against current deployment.",
    proofRequestLanguage: "HTTP",
    proofRequest:
      report.proofOfConcept ||
      (report.reproduceSteps && report.reproduceSteps.length > 0
        ? report.reproduceSteps.join("\n")
        : "No raw request payload provided."),
    expectedResult: "Endpoint should reject unauthorized or invalid access.",
    actualResult: "Endpoint processed unauthorized request with sensitive data returned.",
    attachments,
    externalDocumentation:
      report.referenceLinks && report.referenceLinks.length > 0
        ? report.referenceLinks[0]
        : "No external documentation provided",
    internalAssetLink: report.targetEndpoint || report.program || "Asset identifier",
    relatedReport: "#RPT-NONE",
  };
}

export function getReportDetailById(id: string): ReportManagementDetail {
  const matchedReport = findManagedReportByRouteId(MANAGED_REPORTS, id);

  if (!matchedReport) {
    return REPORT_DETAIL;
  }

  return buildReportDetailFromManagedReport(matchedReport);
}
