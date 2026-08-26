"use client";

import React from "react";
import { FileCode2, ShieldAlert, Key, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PocTemplateToolbarProps {
  onInsertTemplate: (templateText: string) => void;
}

const TEMPLATES = {
  standard: `## Vulnerability Summary
Describe the vulnerability concisely.

## Prerequisites & Environment
- Target Domain/API: https://
- User Role/Permissions: Authenticated / Unauthenticated
- Browser/Tooling used: Burp Suite v2026.1, Curl

## Steps to Reproduce
1. Navigate to \`https://target-domain.com/vulnerable-endpoint\`
2. Send the following HTTP request:
\`\`\`http
POST /v1/action HTTP/1.1
Host: api.target.com
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{"param": "test' OR 1=1--"}
\`\`\`
3. Observe the response containing unauthorized internal data.

## Proof of Concept (PoC)
Insert screenshot, payload URL, or script snippet here.

## Business & Security Impact
Explain what an attacker can accomplish (e.g., unauthorized data exfiltration, system compromise).

## Suggested Remediation
Use parameterized queries / ORM mapping and validate input parameters.`,

  sqli: `## SQL Injection Details
- Vulnerable Endpoint: \`/api/v1/search\`
- Parameter: \`query\`
- Technique: Boolean-based blind / Time-based blind

## Steps to Reproduce
1. Send HTTP request with time-delay payload:
\`\`\`http
GET /api/v1/search?query=admin'%20AND%20(SELECT%201%20FROM%20(SELECT(SLEEP(5)))a)--%20 HTTP/1.1
Host: api.payments.com
\`\`\`
2. Notice the response time is delayed by exactly 5 seconds.

## Database Information Extracted
- Database Engine: PostgreSQL 16.2
- Current User: \`app_db_user\`

## Impact
Full database read access including user hashes and personal data.

## Remediation
Prepared statements and parameterized query execution.`,

  idor: `## Insecure Direct Object Reference (IDOR)
- Affected Endpoint: \`/api/v2/users/{user_id}/invoices\`
- Access Vector: ID parameter substitution

## Steps to Reproduce
1. Log in as User A (ID: 1042).
2. Request invoice endpoint for User B (ID: 1043):
\`\`\`http
GET /api/v2/users/1043/invoices HTTP/1.1
Authorization: Bearer <USER_A_TOKEN>
\`\`\`
3. User B's billing records and payment details are returned without authorization check.

## Impact
Unauthorized access to arbitrary customer invoices and financial records across the tenant.

## Remediation
Enforce server-side authorization check comparing requestor session ID with resource owner.`,
};

export const PocTemplateToolbar: React.FC<PocTemplateToolbarProps> = ({ onInsertTemplate }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 py-2 px-3 bg-muted/40 rounded-t-xl border border-b-0 border-border">
      <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
        <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
        <span>Quick Templates:</span>
      </span>

      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={() => onInsertTemplate(TEMPLATES.standard)}
        className="text-xs border-border dark:border-border hover:bg-muted text-foreground cursor-pointer"
      >
        <Globe className="w-3 h-3 text-muted-foreground" />
        <span>Standard PoC</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={() => onInsertTemplate(TEMPLATES.sqli)}
        className="text-xs border-border dark:border-border hover:bg-muted text-foreground cursor-pointer"
      >
        <ShieldAlert className="w-3 h-3 text-red-500" />
        <span>SQL Injection</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={() => onInsertTemplate(TEMPLATES.idor)}
        className="text-xs border-border dark:border-border hover:bg-muted text-foreground cursor-pointer"
      >
        <Key className="w-3 h-3 text-amber-500" />
        <span>IDOR / Auth Bypass</span>
      </Button>
    </div>
  );
};
