import {
  AdminDashboardOverviewResponse,
  CompanyVerificationItem,
  ReportConfirmationItem,
  AdminUserItem,
  ModerationItem,
  ContentReportItem,
  ReportReasonsBreakdownData,
} from "@/lib/types/admin/types";

export const MOCK_ADMIN_OVERVIEW: AdminDashboardOverviewResponse = {
  stats: [
    {
      id: "stat_orgs",
      title: "Organizations",
      value: "214",
      subtext: "12 pending KYC",
      type: "organizations",
    },
    {
      id: "stat_programs",
      title: "Programs",
      value: "389",
      subtext: "34 active bounties",
      type: "programs",
    },
    {
      id: "stat_reports",
      title: "Total Reports",
      value: "1,847",
      subtext: "128 awaiting review",
      type: "total_reports",
    },
    {
      id: "stat_users",
      title: "Users",
      value: "5,203",
      subtext: "1,204 active this week",
      type: "users",
    },
    {
      id: "stat_posts",
      title: "Community Posts",
      value: "3,612",
      subtext: "4 pending approval",
      type: "community_posts",
    },
    {
      id: "stat_disputes",
      title: "Open Disputes",
      value: "23",
      subtext: "3 unresolved > 7d",
      type: "disputes",
    },
  ],
  activityChart: [
    { month: "Jan", reports: 42, communityPosts: 42, disputes: 40 },
    { month: "Feb", reports: 58, communityPosts: 58, disputes: 58 },
    { month: "Mar", reports: 50, communityPosts: 50, disputes: 50 },
    { month: "Apr", reports: 72, communityPosts: 72, disputes: 70 },
    { month: "May", reports: 88, communityPosts: 88, disputes: 86 },
    { month: "Jun", reports: 96, communityPosts: 96, disputes: 96 },
    { month: "Jul", reports: 116, communityPosts: 116, disputes: 114 },
  ],
  reportStatusBreakdown: {
    confirmed: 341,
    pending: 128,
    rejected: 87,
    inReview: 54,
    total: 610,
  },
  actionQueue: {
    totalCount: 26,
    items: [
      {
        id: "aq_admin_1",
        title: "Company Verifications Pending",
        subtitle: "KYB & Domain Audit",
        count: 12,
        status: "urgent",
        linkHref: "/dashboard/company-verification",
        type: "verification",
      },
      {
        id: "aq_admin_2",
        title: "Critical Reports for Admin Review",
        subtitle: "Pre-company Triage Validation",
        count: 8,
        status: "urgent",
        linkHref: "/dashboard/report-confirmation",
        type: "report_confirmation",
      },
      {
        id: "aq_admin_3",
        title: "Community Moderation Queue",
        subtitle: "Flagged Posts & Discussions",
        count: 4,
        status: "pending",
        linkHref: "/dashboard/content-moderation",
        type: "moderation",
      },
      {
        id: "aq_admin_4",
        title: "Pending User Access Requests",
        subtitle: "Role Elevation Reviews",
        count: 2,
        status: "normal",
        linkHref: "/dashboard/users",
        type: "user_review",
      },
    ],
  },
  recentActivity: [
    {
      id: "act_1",
      title: "Company 'CyberArmor Inc.' verification document approved",
      actor: "Admin Alex",
      timestamp: "10m ago",
      type: "verification",
      badgeText: "Approved",
    },
    {
      id: "act_2",
      title: "Report #1042 (Critical RCE) confirmed and routed to PayTech",
      actor: "Admin Sarah",
      timestamp: "45m ago",
      type: "user_action",
      badgeText: "Report Confirmed",
    },
    {
      id: "act_3",
      title: "$12,500 bounty payout approved for ACME Corp VDP",
      actor: "Admin System",
      timestamp: "2h ago",
      type: "bounty",
      badgeText: "Payout Sent",
    },
    {
      id: "act_4",
      title: "Flagged community post #892 removed for policy breach",
      actor: "Mod Dave",
      timestamp: "3h ago",
      type: "system",
      badgeText: "Moderated",
    },
  ],
};

export const MOCK_COMPANY_VERIFICATIONS: CompanyVerificationItem[] = [
  {
    id: "comp_1",
    orgCode: "ORG-2025-001",
    companyName: "Acme Corporation",
    email: "james.chen@acme.com",
    domain: "acme.com",
    taxId: "TAX-9948201",
    businessType: "Technology / Software",
    registrationDate: "2025-07-08",
    submittedAt: "Jul 8, 2025, 04:14 PM",
    status: "PENDING",
    documentsCount: 3,
    notes: "Submitted Certificate of Incorporation & Tax Certificate.",
    contactName: "James Chen",
    jobTitle: "CISO",
    phone: "+1 415 234 5678",
    website: "https://acme.com",
    country: "United States",
    industry: "Technology / Software",
    description:
      "Acme Corporation is a leading software platform serving 12M+ users globally. We are committed to proactive security and want to run a public bug bounty program to identify vulnerabilities before they become incidents.",
    logoUrl:
      "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=128&auto=format&fit=crop&q=80",
    riskIndicators: {
      domainMatchesEmail: true,
      noFailedDocs: true,
      descriptionProvided: true,
    },
  },
  {
    id: "comp_2",
    orgCode: "ORG-2025-002",
    companyName: "Nexus Financial Solutions",
    email: "security@nexusfin.com",
    domain: "nexusfin.com",
    taxId: "TAX-4481923",
    businessType: "FinTech Platform",
    registrationDate: "2026-07-28",
    submittedAt: "Jul 28, 2026, 11:30 AM",
    status: "PENDING",
    documentsCount: 3,
    notes: "Submitted Certificate of Incorporation & Tax Certificate.",
    contactName: "Sarah Jenkins",
    jobTitle: "Head of Security",
    phone: "+1 212 555 0192",
    website: "https://nexusfin.com",
    country: "United States",
    industry: "FinTech / Banking",
    description:
      "Nexus Financial Solutions powers next-gen payment gateways and digital asset custody for over 500 enterprise institutions.",
    logoUrl:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&auto=format&fit=crop&q=80",
    riskIndicators: {
      domainMatchesEmail: true,
      noFailedDocs: true,
      descriptionProvided: true,
    },
  },
  {
    id: "comp_3",
    orgCode: "ORG-2025-003",
    companyName: "CloudPulse Systems",
    email: "admin@cloudpulse.io",
    domain: "cloudpulse.io",
    taxId: "TAX-1129481",
    businessType: "Cloud Infrastructure",
    registrationDate: "2026-07-27",
    submittedAt: "Jul 27, 2026, 09:15 AM",
    status: "APPROVED",
    documentsCount: 4,
    notes: "Fully verified KYB and active VDP host.",
    contactName: "Alex Rivera",
    jobTitle: "VP of Engineering",
    phone: "+1 415 888 2049",
    website: "https://cloudpulse.io",
    country: "Canada",
    industry: "Cloud Infrastructure",
    description:
      "CloudPulse Systems delivers edge computing infrastructure, microservice orchestration, and serverless runtime platforms.",
    logoUrl:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=128&auto=format&fit=crop&q=80",
    riskIndicators: {
      domainMatchesEmail: true,
      noFailedDocs: true,
      descriptionProvided: true,
    },
  },
  {
    id: "comp_4",
    orgCode: "ORG-2025-004",
    companyName: "Shadow Crypto Protocol",
    email: "contact@shadowcrypto.fake",
    domain: "shadowcrypto.fake",
    taxId: "TAX-0000000",
    businessType: "DeFi",
    registrationDate: "2026-07-24",
    submittedAt: "Jul 24, 2026, 02:00 PM",
    status: "REJECTED",
    documentsCount: 1,
    notes: "Invalid business registration document.",
    contactName: "Unknown Registrant",
    jobTitle: "Founder",
    phone: "+1 000 000 0000",
    website: "https://shadowcrypto.fake",
    country: "Unknown",
    industry: "DeFi",
    description: "Decentralized liquidity pool aggregator protocol.",
    logoUrl: "",
    riskIndicators: {
      domainMatchesEmail: false,
      noFailedDocs: false,
      descriptionProvided: false,
    },
  },
];

export const MOCK_REPORT_CONFIRMATIONS: ReportConfirmationItem[] = [
  {
    id: "rep_conf_1",
    reportCode: "DS-4456",
    title: "Stored XSS in user profile bio field",
    researcherName: "@c0sm0null",
    companyName: "Shopify",
    programName: "Shopify HackerOne",
    avatarColor: "bg-purple-600 text-white",
    severity: "High",
    status: "CONFIRMED",
    submittedAt: "Jun 22, 2026, 09:30:15 AM",
    acceptedAt: "Jun 25, 2026, 02:45:00 PM",
    rewardEstimate: "$1,200 - $3,000",
    rewardAmount: "$1,800",
    category: "XSS / Stored",
    cwe: "CWE-79: Cross-site Scripting (XSS)",
    cvssScore: "8.2",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N",
    targetAsset: "https://admin.shopify.com/api/v1/profile/bio",
    severitiesAgree: true,
    hackerClaimedSeverity: {
      tier: "High",
      cvss: "CVSS 7.0 - 8.9",
      typicalReward: "Typically $1,200 - $3,000",
    },
    companyConfirmedSeverity: {
      tier: "High",
      cvss: "CVSS 7.0 - 8.9",
      typicalReward: "Typically $1,200 - $3,000",
    },
    companyReasoning:
      "Severity aligns with our bounty matrix for stored XSS affecting admin context. High is correct — well-documented, clean PoC.",
    description:
      "A vulnerability was discovered in the User Profile API endpoint (/api/v1/profile/{id}) where an authenticated user could access and modify any other user's profile details by simply changing the 'id' parameter. The server fails to validate if the authenticated user owns the resource being requested.",
    impact:
      "This is a classic Insecure Direct Object Reference (IDOR). Attackers could harvest private information for the entire user base, including email addresses, phone numbers, and physical addresses.",
    reproduceSteps: [
      "Log in as user A.",
      "Intercept the request to 'GET /api/v1/profile/12345' (your ID).",
      "Change the ID to '12346' (user B's ID).",
      "Observe that the full profile details for user B are returned, including PII.",
    ],
    pocPayload: `GET /api/v1/profile/12346 HTTP/1.1
Host: admin.shopify.com
Authorization: Bearer <user_A_session_token>`,
    attachments: [
      { name: "evidence_proof.png", size: "1.4 MB", type: "image/png" },
      { name: "payload.json", size: "4 KB", type: "application/json" },
    ],
    discussionThread: [
      {
        id: "m1",
        author: "@c0sm0null",
        role: "HACKER",
        text: "Thanks for the quick triage — happy with the High severity decision!",
        timestamp: "Jun 2, 2026",
      },
      {
        id: "m2",
        author: "Shopify",
        role: "COMPANY",
        text: "Confirmed — patch is in test release. Bounty processing.",
        timestamp: "Jun 3, 2026",
      },
    ],
    fairnessSignals: {
      companyDowngradeRate: "22%",
      companyDowngradeText: "Downgraded severity in 2/99 reviewed reports",
      researcherAcceptanceRate: "76%",
      researcherReputationText:
        "28 total reports • Rep score 870/100 • Trusted researcher with strong track record",
    },
    triageNotes:
      "High severity confirmed. Bounty set to $1,800 based on admin context stored XSS matrix.",
    auditLog: [
      {
        id: "al_1",
        action: "Report Submitted",
        actor: "@c0sm0null",
        timestamp: "Jun 22, 2026",
      },
      {
        id: "al_2",
        action: "Triage Confirmed & Reward Assigned ($1,800)",
        actor: "Shopify Security Team",
        timestamp: "Jun 25, 2026",
      },
    ],
  },
  {
    id: "rep_conf_2",
    reportCode: "DS-4420",
    title: "SQL Injection in Authentication API Endpoint",
    researcherName: "alex_sec",
    companyName: "Nexus Financial",
    programName: "Nexus FinTech Public Bounty",
    avatarColor: "bg-blue-600 text-white",
    severity: "Critical",
    status: "PENDING",
    submittedAt: "Jul 28, 2026, 01:15:22 PM",
    rewardEstimate: "$3,500 - $5,000",
    rewardAmount: "$4,500",
    category: "Web Vulnerability",
    cwe: "CWE-89: Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')",
    cvssScore: "9.8",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    targetAsset: "https://api.nexusfin.com/v1/auth/login",
    severitiesAgree: true,
    hackerClaimedSeverity: {
      tier: "Critical",
      cvss: "CVSS 9.0 - 10.0",
      typicalReward: "Typically $3,500 - $5,000",
    },
    companyConfirmedSeverity: {
      tier: "Critical",
      cvss: "CVSS 9.0 - 10.0",
      typicalReward: "Typically $3,500 - $5,000",
    },
    companyReasoning:
      "Validated blind time-based SQL injection vulnerability on production login gateway.",
    description:
      "A time-based blind SQL injection vulnerability exists in the POST parameter 'username' of the authentication endpoint. Unauthenticated attackers can execute arbitrary SQL queries against the underlying database server.",
    impact:
      "Full database compromise, leading to unauthorized retrieval of user hashes, PII, transaction logs, and potentially remote command execution depending on database privilege escalation.",
    reproduceSteps: [
      "Send a POST request to https://api.nexusfin.com/v1/auth/login with JSON body `{\"username\": \"admin' AND (SELECT 1 FROM (SELECT(SLEEP(5)))a)--\", \"password\": \"test\"}`.",
      "Observe server response latency delaying by exactly 5 seconds.",
    ],
    pocPayload: `POST /v1/auth/login HTTP/1.1\nHost: api.nexusfin.com\nContent-Type: application/json\n\n{"username": "admin' AND (SELECT 1 FROM (SELECT(SLEEP(5)))a)--"}`,
    attachments: [
      { name: "sql_injection_proof.png", size: "1.2 MB", type: "image/png" },
    ],
    discussionThread: [
      {
        id: "m201",
        author: "alex_sec",
        role: "HACKER",
        text: "Please verify sleep payload on the login endpoint.",
        timestamp: "Jul 28, 2026, 01:15:22 PM",
      },
    ],
    fairnessSignals: {
      companyDowngradeRate: "10%",
      companyDowngradeText: "Downgraded severity in 1/10 reviewed reports",
      researcherAcceptanceRate: "92%",
      researcherReputationText:
        "45 total reports • Rep score 940/100 • Top tier bug hunter",
    },
    triageNotes:
      "Awaiting initial triage validation by platform security engineer.",
    auditLog: [
      {
        id: "al_10",
        action: "Report Submitted",
        actor: "alex_sec",
        timestamp: "Jul 28, 2026, 01:15:22 PM",
      },
    ],
  },
  {
    id: "rep_conf_3",
    reportCode: "DS-4389",
    title: "Unauthenticated Remote Code Execution in Image Processor",
    researcherName: "bug_hunter_pro",
    companyName: "CloudPulse Systems",
    programName: "CloudPulse Infrastructure VDP",
    avatarColor: "bg-emerald-600 text-white",
    severity: "Critical",
    status: "PENDING",
    submittedAt: "Jul 28, 2026, 11:42:09 AM",
    rewardEstimate: "$7,500 - $10,000",
    rewardAmount: "$8,500",
    category: "Infrastructure",
    cwe: "CWE-78: Improper Neutralization of Special Elements used in an OS Command",
    cvssScore: "10.0",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
    targetAsset: "https://media.cloudpulse.io/v2/transform",
    severitiesAgree: true,
    hackerClaimedSeverity: {
      tier: "Critical",
      cvss: "CVSS 9.0 - 10.0",
      typicalReward: "Typically $7,500 - $10,000",
    },
    companyConfirmedSeverity: {
      tier: "Critical",
      cvss: "CVSS 9.0 - 10.0",
      typicalReward: "Typically $7,500 - $10,000",
    },
    companyReasoning:
      "RCE confirmed via SVG ImageMagick delegate execution vector.",
    description:
      "The image transformation daemon invokes ImageMagick delegates without sanitizing image metadata parameters, enabling unauthenticated remote code execution via malformed SVG payloads.",
    impact:
      "Allows remote attackers to execute arbitrary system commands with root privileges inside the containerized conversion worker.",
    reproduceSteps: [
      "Craft an SVG file containing a malicious delegate command string.",
      "Upload the SVG to the transform endpoint via curl binary post.",
    ],
    pocPayload: `<?xml version="1.0" encoding="UTF-8"?><svg width="100" height="100"><image href="https://example.com/test.jpg" /></svg>`,
    attachments: [
      { name: "rce_poc_exploit.svg", size: "14 KB", type: "image/svg+xml" },
    ],
    discussionThread: [],
    fairnessSignals: {
      companyDowngradeRate: "15%",
      companyDowngradeText: "Downgraded severity in 3/20 reviewed reports",
      researcherAcceptanceRate: "88%",
      researcherReputationText: "50 total reports • Rep score 910/100",
    },
    auditLog: [
      {
        id: "al_11",
        action: "Report Submitted",
        actor: "bug_hunter_pro",
        timestamp: "3h ago",
      },
    ],
  },
];

export const MOCK_ADMIN_USERS: AdminUserItem[] = [
  {
    id: "usr_1",
    name: "Alex Rivera",
    email: "alex.rivera@devsolve.com",
    role: "ADMIN",
    status: "ACTIVE",
    joinedDate: "2025-01-10",
    avatarUrl: "/u1.jpg",
  },
  {
    id: "usr_2",
    name: "Sarah Chen",
    email: "sarah@nexusfin.com",
    role: "COMPANY",
    status: "ACTIVE",
    joinedDate: "2026-02-14",
    programsManaged: 3,
    avatarUrl: "/u2.jpg",
  },
  {
    id: "usr_3",
    name: "Marcus Vance",
    email: "marcus_vance@sec.io",
    role: "USER",
    status: "ACTIVE",
    joinedDate: "2026-03-01",
    reportsSubmitted: 28,
    avatarUrl: "/u3.jpg",
  },
  {
    id: "usr_4",
    name: "Spammy Bot",
    email: "bot99281@tempmail.org",
    role: "USER",
    status: "SUSPENDED",
    joinedDate: "2026-07-20",
    reportsSubmitted: 0,
    avatarUrl: "/u4.jpg",
  },
  {
    id: "usr_5",
    name: "David Kim",
    email: "david.kim@devsolve.com",
    role: "ADMIN",
    status: "ACTIVE",
    joinedDate: "2025-06-15",
    avatarUrl: "/u1.jpg",
  },
  {
    id: "usr_6",
    name: "Priya Patel",
    email: "priya.patel@cyberarm.io",
    role: "COMPANY",
    status: "ACTIVE",
    joinedDate: "2026-04-22",
    programsManaged: 7,
    avatarUrl: "/u2.jpg",
  },
  {
    id: "usr_7",
    name: "Jordan Blake",
    email: "j.blake@sec-research.dev",
    role: "USER",
    status: "ACTIVE",
    joinedDate: "2026-01-05",
    reportsSubmitted: 54,
    avatarUrl: "/u3.jpg",
  },
  {
    id: "usr_8",
    name: "Elena Sokolova",
    email: "elena@devsolve.com",
    role: "ADMIN",
    status: "ACTIVE",
    joinedDate: "2025-11-03",
    avatarUrl: "/u4.jpg",
  },
  {
    id: "usr_9",
    name: "Thomas Webb",
    email: "t.webb@bugbounty.pro",
    role: "USER",
    status: "SUSPENDED",
    joinedDate: "2026-06-18",
    reportsSubmitted: 2,
    avatarUrl: "/u1.jpg",
  },
  {
    id: "usr_10",
    name: "CloudPulse Admin",
    email: "admin@cloudpulse.io",
    role: "COMPANY",
    status: "ACTIVE",
    joinedDate: "2026-07-27",
    programsManaged: 4,
    avatarUrl: "/u2.jpg",
  },
  {
    id: "usr_11",
    name: "New Researcher",
    email: "new.user@example.com",
    role: "USER",
    status: "PENDING",
    joinedDate: "2026-07-31",
    reportsSubmitted: 0,
    avatarUrl: "/u3.jpg",
  },
];

export const MOCK_MODERATION_ITEMS: ModerationItem[] = [
  {
    id: "mod_1",
    contentType: "DISCUSSION",
    title: "Leaked zero-day exploit disclosure without verification",
    authorName: "dark_coder_99",
    reason: "Policy Violation",
    reportedAt: "2h ago",
    status: "PENDING",
    details:
      "Post contains unverified zero-day exploit code targeting active member VDP.",
  },
  {
    id: "mod_2",
    contentType: "COMMENT",
    title: "Abusive language in report feedback section",
    authorName: "angry_user_44",
    reason: "Harassment",
    reportedAt: "5h ago",
    status: "PENDING",
    details: "User engaged in toxic comments towards company triage engineer.",
  },
  {
    id: "mod_3",
    contentType: "SHOWCASE",
    title: "Promotional spam link insertion in security article",
    authorName: "seo_spammer",
    reason: "Spam",
    reportedAt: "1d ago",
    status: "PENDING",
    details:
      "Article contains automated affiliate links to unverified crypto wallet.",
  },
];

export const MOCK_CONTENT_REPORTS: ContentReportItem[] = [
  {
    id: "cr_1",
    type: "SOLUTION",
    title: '"Buy cheap followers here — best price guaranteed..."',
    snippet:
      "Instant delivery on 10,000 real active followers for cheap. Click here to boost your profile now!",
    timestamp: "1 day ago",
    reportCount: 8,
    reason: "Spam",
    author: "spammer_x",
    pastViolationsCount: 3,
    status: "PENDING",
  },
  {
    id: "cr_2",
    type: "PROBLEM",
    title: '"How to hack my ex\'s Instagram account..."',
    snippet:
      "Need urgent tool or keylogger to gain access to account without password verification. Will pay.",
    timestamp: "3 days ago",
    reportCount: 12,
    reason: "Harmful",
    author: "anon_44",
    status: "PENDING",
  },
  {
    id: "cr_3",
    type: "COMMENT",
    title: '"This is completely wrong, you clearly have no idea..."',
    snippet:
      "Stop posting nonsense solutions. You are wasting everyone's time and shouldn't be on this platform.",
    timestamp: "4 days ago",
    reportCount: 3,
    reason: "Offensive",
    author: "rude_user",
    status: "PENDING",
  },
  {
    id: "cr_4",
    type: "PROGRAM",
    title: '"Test our website"',
    snippet:
      "Unverified bounty program submission with invalid company details and no security scope.",
    timestamp: "8 days ago",
    reportCount: 1,
    reason: "Off-topic",
    author: "FakeCorp",
    pastViolationsCount: 2,
    status: "PENDING",
  },
  {
    id: "cr_5",
    type: "SOLUTION",
    title: '"Zero-day RCE PoC download mirror link"',
    snippet:
      "Download mirror executable containing unverified payload targeting active enterprise VDPs.",
    timestamp: "2 hours ago",
    reportCount: 6,
    reason: "Harmful",
    author: "shadow_leaker",
    pastViolationsCount: 4,
    status: "PENDING",
  },
  {
    id: "cr_6",
    type: "COMMENT",
    title: '"Unsolicited crypto casino referral link"',
    snippet:
      "Earn 500 free spins today at fast-payout-casino.fake! Limited time promo bonus code.",
    timestamp: "5 hours ago",
    reportCount: 5,
    reason: "Spam",
    author: "bot_promoter",
    pastViolationsCount: 1,
    status: "PENDING",
  },
];

export const MOCK_REPORT_REASONS_BREAKDOWN: ReportReasonsBreakdownData = {
  spam: 6,
  harmful: 3,
  offensive: 3,
  offTopic: 2,
  total: 14,
};

export let mockCompanyVerificationsStore = [...MOCK_COMPANY_VERIFICATIONS];
export let mockReportConfirmationsStore = [...MOCK_REPORT_CONFIRMATIONS];
export let mockAdminUsersStore = [...MOCK_ADMIN_USERS];
export let mockModerationItemsStore = [...MOCK_MODERATION_ITEMS];
export let mockContentReportsStore = [...MOCK_CONTENT_REPORTS];

export function updateMockCompanyVerificationsStore(
  updater: (prev: CompanyVerificationItem[]) => CompanyVerificationItem[]
) {
  mockCompanyVerificationsStore = updater(mockCompanyVerificationsStore);
}

export function updateMockReportConfirmationsStore(
  updater: (prev: ReportConfirmationItem[]) => ReportConfirmationItem[]
) {
  mockReportConfirmationsStore = updater(mockReportConfirmationsStore);
}

export function updateMockAdminUsersStore(
  updater: (prev: AdminUserItem[]) => AdminUserItem[]
) {
  mockAdminUsersStore = updater(mockAdminUsersStore);
}

export function updateMockModerationItemsStore(
  updater: (prev: ModerationItem[]) => ModerationItem[]
) {
  mockModerationItemsStore = updater(mockModerationItemsStore);
}

export function updateMockContentReportsStore(
  updater: (prev: ContentReportItem[]) => ContentReportItem[]
) {
  mockContentReportsStore = updater(mockContentReportsStore);
}
