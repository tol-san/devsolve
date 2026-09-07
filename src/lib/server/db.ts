import { Pool } from "pg";

export const dbPool = new Pool({
  host: process.env.DB_HOST || "51.79.146.203",
  port: parseInt(process.env.DB_PORT || "8888", 10),
  database: process.env.DB_NAME || "devsolve_db",
  user: process.env.DB_USER || "phsardigital",
  password: process.env.DB_PASSWORD || "qwer",
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function saveReportSuggestedWeakness(
  reportId: string,
  suggestedWeakness: string | null,
  weaknessId?: string | null
): Promise<void> {
  if (!reportId) return;
  try {
    if (suggestedWeakness && suggestedWeakness.trim().length > 0) {
      await dbPool.query(
        `UPDATE reports 
         SET suggested_weakness = $1, weakness_id = NULL 
         WHERE id = $2`,
        [suggestedWeakness.trim().slice(0, 255), reportId]
      );
    } else if (weaknessId) {
      await dbPool.query(
        `UPDATE reports 
         SET weakness_id = $1, suggested_weakness = NULL 
         WHERE id = $2`,
        [weaknessId, reportId]
      );
    } else {
      await dbPool.query(
        `UPDATE reports 
         SET suggested_weakness = NULL, weakness_id = NULL 
         WHERE id = $1`,
        [reportId]
      );
    }
  } catch (err) {
    console.error(`[db] Failed to update report weakness for ${reportId}:`, err);
  }
}

export async function saveDraftSuggestedWeakness(
  draftId: string,
  suggestedWeakness: string | null,
  weaknessId?: string | null
): Promise<void> {
  if (!draftId) return;
  try {
    if (suggestedWeakness && suggestedWeakness.trim().length > 0) {
      await dbPool.query(
        `UPDATE report_drafts 
         SET suggested_weakness = $1, weakness_id = NULL 
         WHERE id = $2`,
        [suggestedWeakness.trim().slice(0, 255), draftId]
      );
    } else if (weaknessId) {
      await dbPool.query(
        `UPDATE report_drafts 
         SET weakness_id = $1, suggested_weakness = NULL 
         WHERE id = $2`,
        [weaknessId, draftId]
      );
    } else {
      await dbPool.query(
        `UPDATE report_drafts 
         SET suggested_weakness = NULL, weakness_id = NULL 
         WHERE id = $1`,
        [draftId]
      );
    }
  } catch (err) {
    console.error(`[db] Failed to update draft weakness for ${draftId}:`, err);
  }
}

export async function getReportWeakness(
  reportId: string
): Promise<{ suggestedWeakness: string | null; weaknessId: string | null } | null> {
  if (!reportId) return null;
  try {
    const res = await dbPool.query(
      `SELECT suggested_weakness, weakness_id FROM reports WHERE id = $1 LIMIT 1`,
      [reportId]
    );
    if (res.rows.length === 0) return null;
    return {
      suggestedWeakness: res.rows[0].suggested_weakness ?? null,
      weaknessId: res.rows[0].weakness_id ?? null,
    };
  } catch (err) {
    console.error(`[db] Failed to fetch report weakness for ${reportId}:`, err);
    return null;
  }
}

export async function enrichReportsWithWeakness<T extends { id: string; suggestedWeakness?: any; weakness?: any }>(
  reports: T[]
): Promise<T[]> {
  if (!reports || reports.length === 0) return reports;

  const missingIds = reports
    .filter((r) => r.id && !r.suggestedWeakness && !r.weakness)
    .map((r) => r.id);

  if (missingIds.length === 0) return reports;

  try {
    const res = await dbPool.query(
      `SELECT id, suggested_weakness, weakness_id FROM reports WHERE id = ANY($1::uuid[])`,
      [missingIds]
    );

    const map = new Map<string, { suggested_weakness: string | null; weakness_id: string | null }>();
    for (const row of res.rows) {
      map.set(row.id, row);
    }

    for (const r of reports) {
      const dbRow = map.get(r.id);
      if (dbRow?.suggested_weakness) {
        (r as any).suggestedWeakness = dbRow.suggested_weakness;
        (r as any).suggested_weakness = dbRow.suggested_weakness;
        (r as any).weakness = null;
        (r as any).weaknessObj = null;
      }
    }
  } catch (err) {
    console.error("[db] Failed to enrich reports with weakness:", err);
  }

  return reports;
}

interface DbReportRow {
  report_id: string;
  program_id: string | null;
  program_name: string | null;
  program_handle: string | null;
  program_visibility: string | null;
  organization_id: string | null;
  organization_name: string | null;
  organization_logo_url: string | null;
  organization_slug: string | null;
  organization_website_url: string | null;
  organization_industry: string | null;
  triage_severity: string | null;
  reported_severity: string | null;
  severity: string | null;
  report_title: string | null;
  suggested_weakness: string | null;
}

export async function enrichReportsWithProgramAndOrg<T extends { id: string }>(
  reports: T[]
): Promise<T[]> {
  if (!reports || reports.length === 0) return reports;

  const reportIds = reports.map((r) => r.id).filter(Boolean);
  if (reportIds.length === 0) return reports;

  try {
    const [reportsRes, disputesRes] = await Promise.all([
      dbPool.query<DbReportRow>(
        `SELECT 
           r.id as report_id,
           r.triage_severity,
           r.reported_severity,
           r.severity,
           r.title as report_title,
           r.suggested_weakness,
           p.id as program_id,
           p.name as program_name,
           p.handle as program_handle,
           p.visibility as program_visibility,
           o.id as organization_id,
           o.name as organization_name,
           o.logo_url as organization_logo_url,
           o.slug as organization_slug,
           o.website_url as organization_website_url,
           o.industry as organization_industry
         FROM reports r
         LEFT JOIN programs p ON p.id = r.program_id
         LEFT JOIN organizations o ON o.id = p.organization_id
         WHERE r.id = ANY($1::uuid[])`,
        [reportIds]
      ),
      dbPool.query<{
        report_id: string;
        id: string;
        status: string;
        reason: string | null;
        resolved_severity: string | null;
      }>(
        `SELECT report_id, id, status, reason, resolved_severity FROM disputes WHERE report_id = ANY($1::uuid[])`,
        [reportIds]
      ).catch(() => ({ rows: [] }))
    ]);

    const map = new Map<string, DbReportRow>();
    for (const row of reportsRes.rows) {
      map.set(row.report_id, row);
    }

    const disputeMap = new Map<string, { id: string; status: string; reason: string | null; resolved_severity: string | null }>();
    for (const d of disputesRes.rows) {
      disputeMap.set(d.report_id, d);
    }

    for (const r of reports) {
      const dbRow = map.get(r.id);
      const item = r as Record<string, unknown>;

      if (dbRow) {
        if (dbRow.program_name && !item.programName) {
          item.programName = dbRow.program_name;
        }
        if (dbRow.program_handle && !item.programHandle) {
          item.programHandle = dbRow.program_handle;
        }
        if (dbRow.organization_id && !item.organizationId) {
          item.organizationId = dbRow.organization_id;
        }
        if (dbRow.organization_name && !item.organizationName) {
          item.organizationName = dbRow.organization_name;
        }
        if (dbRow.organization_logo_url && !item.organizationLogoUrl) {
          item.organizationLogoUrl = dbRow.organization_logo_url;
        }
        if (dbRow.organization_slug && !item.organizationSlug) {
          item.organizationSlug = dbRow.organization_slug;
        }
        if (dbRow.organization_website_url && !item.organizationWebsiteUrl) {
          item.organizationWebsiteUrl = dbRow.organization_website_url;
        }
        if (dbRow.organization_industry && !item.organizationIndustry) {
          item.organizationIndustry = dbRow.organization_industry;
        }

        // Enrich severity from DB if missing or lowercased from backend
        if (dbRow.triage_severity) {
          const sev = String(dbRow.triage_severity).toUpperCase();
          if (!item.triageSeverity) item.triageSeverity = sev;
          if (!item.triage_severity) item.triage_severity = sev;
        }
        if (dbRow.reported_severity) {
          const sev = String(dbRow.reported_severity).toUpperCase();
          if (!item.reportedSeverity) item.reportedSeverity = sev;
          if (!item.reported_severity) item.reported_severity = sev;
        }
        if (dbRow.severity) {
          const sev = String(dbRow.severity).toUpperCase();
          if (!item.severity) item.severity = sev;
        }
        if (dbRow.suggested_weakness && !item.suggestedWeakness) {
          item.suggestedWeakness = dbRow.suggested_weakness;
          item.suggested_weakness = dbRow.suggested_weakness;
        }
      }

      // Attach dispute information
      const dispute = disputeMap.get(r.id);
      if (dispute) {
        const normStatus = (dispute.status || "OPEN").toUpperCase();
        if (!item.dispute) {
          item.dispute = {
            id: dispute.id,
            status: normStatus,
            reason: dispute.reason,
            resolvedSeverity: dispute.resolved_severity ? String(dispute.resolved_severity).toUpperCase() : null,
          };
        }
        item.isDisputed = normStatus !== "DISMISSED" && normStatus !== "RESOLVED";
      } else if (
        !item.isDisputed &&
        dbRow?.triage_severity &&
        dbRow?.reported_severity &&
        String(dbRow.triage_severity).toUpperCase() !== String(dbRow.reported_severity).toUpperCase() &&
        !dbRow.severity
      ) {
        item.isDisputed = true;
      }
    }
  } catch (err) {
    console.error("[db] Failed to enrich reports with program and org:", err);
  }

  return reports;
}

export async function enrichSingleReportWithDisputeAndSeverity(
  reportData: Record<string, any>,
  reportId: string
): Promise<void> {
  if (!reportId || !reportData) return;

  try {
    const [reportRes, disputesRes] = await Promise.all([
      dbPool.query<{
        triage_severity: string | null;
        reported_severity: string | null;
        severity: string | null;
        program_name: string | null;
        organization_name: string | null;
        organization_logo_url: string | null;
      }>(
        `SELECT 
           r.triage_severity,
           r.reported_severity,
           r.severity,
           p.name as program_name,
           o.name as organization_name,
           o.logo_url as organization_logo_url
         FROM reports r
         LEFT JOIN programs p ON p.id = r.program_id
         LEFT JOIN organizations o ON o.id = p.organization_id
         WHERE r.id = $1::uuid`,
        [reportId]
      ),
      dbPool.query<{
        id: string;
        status: string;
        reason: string | null;
        resolved_severity: string | null;
      }>(
        `SELECT id, status, reason, resolved_severity FROM disputes WHERE report_id = $1::uuid ORDER BY created_at DESC LIMIT 1`,
        [reportId]
      ).catch(() => ({ rows: [] }))
    ]);

    const dbRow = reportRes.rows[0];
    if (dbRow) {
      if (dbRow.triage_severity) {
        const sev = String(dbRow.triage_severity).toUpperCase();
        if (!reportData.triageSeverity) reportData.triageSeverity = sev;
        if (!reportData.triage_severity) reportData.triage_severity = sev;
      }
      if (dbRow.reported_severity) {
        const sev = String(dbRow.reported_severity).toUpperCase();
        if (!reportData.reportedSeverity) reportData.reportedSeverity = sev;
        if (!reportData.reported_severity) reportData.reported_severity = sev;
      }
      if (dbRow.severity && !reportData.severity) {
        reportData.severity = String(dbRow.severity).toUpperCase();
      }
      if (dbRow.program_name && !reportData.programName) {
        reportData.programName = dbRow.program_name;
      }
      if (dbRow.organization_name && !reportData.organizationName) {
        reportData.organizationName = dbRow.organization_name;
      }
      if (dbRow.organization_logo_url && !reportData.organizationLogoUrl) {
        reportData.organizationLogoUrl = dbRow.organization_logo_url;
      }
    }

    const dispute = disputesRes.rows[0];
    if (dispute) {
      const normStatus = (dispute.status || "OPEN").toUpperCase();
      if (!reportData.dispute) {
        reportData.dispute = {
          id: dispute.id,
          status: normStatus,
          reason: dispute.reason,
          resolvedSeverity: dispute.resolved_severity ? String(dispute.resolved_severity).toUpperCase() : null,
        };
      }
      reportData.isDisputed = normStatus !== "DISMISSED" && normStatus !== "RESOLVED";
    } else if (
      !reportData.isDisputed &&
      dbRow?.triage_severity &&
      dbRow?.reported_severity &&
      String(dbRow.triage_severity).toUpperCase() !== String(dbRow.reported_severity).toUpperCase() &&
      !dbRow.severity
    ) {
      reportData.isDisputed = true;
    }
  } catch (err) {
    console.error(`[db] Failed to enrich single report ${reportId}:`, err);
  }
}

export async function enrichDraftsWithWeakness<T extends { id: string; suggestedWeakness?: any }>(
  drafts: T[]
): Promise<T[]> {
  if (!drafts || drafts.length === 0) return drafts;

  const missingIds = drafts
    .filter((d) => d.id && !d.suggestedWeakness)
    .map((d) => d.id);

  if (missingIds.length === 0) return drafts;

  try {
    const res = await dbPool.query(
      `SELECT id, suggested_weakness FROM report_drafts WHERE id = ANY($1::uuid[])`,
      [missingIds]
    );

    const map = new Map<string, string | null>();
    for (const row of res.rows) {
      map.set(row.id, row.suggested_weakness);
    }

    for (const d of drafts) {
      const sw = map.get(d.id);
      if (sw) {
        (d as any).suggestedWeakness = sw;
        (d as any).suggested_weakness = sw;
        (d as any).weaknessId = null;
      }
    }
  } catch (err) {
    console.error("[db] Failed to enrich drafts with weakness:", err);
  }

  return drafts;
}

export async function getProblemFromDb(id: string): Promise<any | null> {
  if (!id) return null;
  try {
    const pRes = await dbPool.query("SELECT * FROM problems WHERE id = $1 LIMIT 1", [id]);
    if (pRes.rows.length === 0) return null;
    const p = pRes.rows[0];

    let category = undefined;
    if (p.category_id) {
      const cRes = await dbPool.query(
        "SELECT id, name, slug FROM categories WHERE id = $1 LIMIT 1",
        [p.category_id]
      );
      if (cRes.rows.length > 0) category = cRes.rows[0];
    }

    let author = undefined;
    if (p.author_id) {
      const aRes = await dbPool.query(
        "SELECT id, username, full_name, avatar_url, reputation FROM user_profiles WHERE id = $1 LIMIT 1",
        [p.author_id]
      );
      if (aRes.rows.length > 0) {
        author = {
          id: aRes.rows[0].id,
          username: aRes.rows[0].username,
          name: aRes.rows[0].full_name || aRes.rows[0].username,
          avatarUrl: aRes.rows[0].avatar_url,
          reputation: aRes.rows[0].reputation,
        };
      }
    }

    const envRes = await dbPool.query(
      "SELECT technology, version FROM problem_environments WHERE problem_id = $1 ORDER BY display_order",
      [id]
    );
    const reproRes = await dbPool.query(
      "SELECT instruction FROM problem_reproduction_steps WHERE problem_id = $1 ORDER BY display_order",
      [id]
    );
    const techRes = await dbPool.query(
      "SELECT id, name, version FROM problem_tech_stack WHERE problem_id = $1",
      [id]
    );
    const tagRes = await dbPool.query(
      `SELECT t.id, t.name 
       FROM problem_tags pt 
       JOIN tags t ON pt.tag_id = t.id 
       WHERE pt.problem_id = $1`,
      [id]
    );
    const attRes = await dbPool.query(
      `SELECT id, original_file_name, size_bytes, mime_type, storage_key 
       FROM problem_attachments 
       WHERE problem_id = $1`,
      [id]
    );

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      problemType: p.problem_type,
      sdlcPhase: p.sdlc_phase,
      severity: p.severity,
      status: p.status,
      viewCount: Number(p.view_count || 0),
      version: Number(p.version || 1),
      publishedAt: p.published_at ? p.published_at.toISOString() : null,
      createdAt: p.created_at ? p.created_at.toISOString() : null,
      updatedAt: p.updated_at ? p.updated_at.toISOString() : null,
      expectedBehavior: p.expected_behavior,
      actualBehavior: p.actual_behavior,
      attemptsTried: p.attempts_tried,
      errorMessage: p.error_message,
      repositoryUrl: p.repository_url,
      category,
      author,
      environment: envRes.rows.map((r: any) => ({ technology: r.technology, version: r.version })),
      reproductionSteps: reproRes.rows.map((r: any) => r.instruction),
      technologies: techRes.rows.map((r: any) => ({ id: r.id, name: r.name, version: r.version })),
      tags: tagRes.rows.map((r: any) => ({ id: r.id, name: r.name })),
      attachments: attRes.rows.map((r: any) => ({
        id: r.id,
        originalFileName: r.original_file_name,
        sizeBytes: Number(r.size_bytes || 0),
        mimeType: r.mime_type,
        storageKey: r.storage_key,
        downloadUrl: r.storage_key ? `https://file.quizzy.it.com/products/public/${r.storage_key}` : undefined,
      })),
      contentWarnings: [],
    };
  } catch (err) {
    console.error(`[db] Failed to fetch problem ${id} from DB:`, err);
    return null;
  }
}

export async function getShowcaseFromDb(id: string): Promise<any | null> {
  if (!id) return null;
  try {
    const sRes = await dbPool.query(
      "SELECT * FROM showcases WHERE id = $1 AND deleted_at IS NULL LIMIT 1",
      [id]
    );
    if (sRes.rows.length === 0) return null;
    const s = sRes.rows[0];

    let category = undefined;
    if (s.category_id) {
      const cRes = await dbPool.query(
        "SELECT id, name, slug FROM categories WHERE id = $1 LIMIT 1",
        [s.category_id]
      );
      if (cRes.rows.length > 0) category = cRes.rows[0];
    }

    let author = undefined;
    if (s.author_id) {
      const aRes = await dbPool.query(
        "SELECT id, username, full_name, avatar_url, reputation FROM user_profiles WHERE id = $1 LIMIT 1",
        [s.author_id]
      );
      if (aRes.rows.length > 0) {
        author = {
          id: aRes.rows[0].id,
          username: aRes.rows[0].username,
          name: aRes.rows[0].full_name || aRes.rows[0].username,
          fullName: aRes.rows[0].full_name,
          displayName: aRes.rows[0].full_name || aRes.rows[0].username,
          avatarUrl: aRes.rows[0].avatar_url,
          reputation: aRes.rows[0].reputation,
        };
      }
    }

    const stepsRes = await dbPool.query(
      "SELECT * FROM showcase_steps WHERE showcase_id = $1 ORDER BY step_number ASC",
      [id]
    );

    const tagsRes = await dbPool.query(
      `SELECT t.id, t.name, t.slug
       FROM showcase_tags st
       JOIN tags t ON st.tag_id = t.id
       WHERE st.showcase_id = $1`,
      [id]
    );

    const authorName = author?.displayName || author?.name || "Unknown Author";

    return {
      id: s.id,
      showcaseId: s.id,
      submissionType: "INITIAL" as const,
      title: s.title,
      overview: s.overview,
      coverImageUrl: s.cover_image_url,
      liveUrl: s.live_url,
      repoUrl: s.repo_url,
      videoUrl: s.video_url,
      reviewStatus: s.review_status,
      rejectionReason: s.rejection_reason,
      reviewedBy: s.reviewed_by,
      reviewedAt: s.reviewed_at ? s.reviewed_at.toISOString() : null,
      submittedAt: s.created_at ? s.created_at.toISOString() : new Date().toISOString(),
      createdAt: s.created_at ? s.created_at.toISOString() : new Date().toISOString(),
      updatedAt: s.updated_at ? s.updated_at.toISOString() : null,
      viewCount: Number(s.view_count || 0),
      authorId: s.author_id,
      authorName,
      author,
      categoryId: s.category_id,
      categoryName: category?.name,
      category,
      steps: stepsRes.rows.map((step: any) => ({
        id: step.id,
        showcaseId: s.id,
        stepNumber: Number(step.step_number || 1),
        title: step.title,
        description: step.description,
        codeSnippet: step.code_snippet,
        imageUrl: step.image_url,
        diagramUrl: step.diagram_url,
        createdAt: step.created_at ? step.created_at.toISOString() : new Date().toISOString(),
        updatedAt: step.updated_at ? step.updated_at.toISOString() : new Date().toISOString(),
      })),
      tags: tagsRes.rows.map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
      })),
    };
  } catch (err) {
    console.error(`[db] Failed to fetch showcase ${id} from DB:`, err);
    return null;
  }
}

export interface DbUserProfile {
  id: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  email: string | null;
  reputation: number | null;
}

export async function getUserProfilesByIds(
  ids: string[]
): Promise<Map<string, DbUserProfile>> {
  const map = new Map<string, DbUserProfile>();
  const validIds = Array.from(
    new Set(ids.filter((id) => Boolean(id && typeof id === "string" && id.trim().length > 0)))
  );
  if (validIds.length === 0) return map;
  try {
    const res = await dbPool.query(
      `SELECT id, full_name, username, avatar_url, email, reputation FROM user_profiles WHERE id = ANY($1::uuid[])`,
      [validIds]
    );
    for (const row of res.rows) {
      map.set(row.id, {
        id: row.id,
        fullName: row.full_name ?? null,
        username: row.username ?? null,
        avatarUrl: row.avatar_url ?? null,
        email: row.email ?? null,
        reputation: row.reputation != null ? Number(row.reputation) : null,
      });
    }
  } catch (err) {
    console.error("[db] Failed to fetch user profiles by ids:", err);
  }
  return map;
}

export interface PlatformUserCandidate {
  id: string;
  fullName: string | null;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  isExistingMember: boolean;
  isPendingInvite: boolean;
  memberRole: string | null;
}

export async function searchPlatformUsersForInvitation(
  query?: string | null,
  organizationId?: string | null
): Promise<PlatformUserCandidate[]> {
  const clean = query?.trim() ?? "";
  const hasFilter = clean.length > 0;
  const pattern = `%${clean}%`;

  try {
    if (organizationId) {
      const sql = `
        SELECT 
           up.id,
           up.full_name,
           up.username,
           up.email,
           up.avatar_url,
           om.status as member_status,
           om.role as member_role,
           om.joined_at
         FROM user_profiles up
         LEFT JOIN LATERAL (
           SELECT status, role, joined_at
           FROM organization_members om
           WHERE (om.user_id = up.id OR om.invitation_email = up.email)
             AND om.organization_id = $1
           ORDER BY 
             CASE 
               WHEN om.status = 'active' THEN 1
               WHEN om.status = 'suspended' THEN 2
               ELSE 3
             END
           LIMIT 1
         ) om ON TRUE
         WHERE up.email IS NOT NULL 
           ${hasFilter ? "AND (up.email ILIKE $2 OR up.username ILIKE $2 OR up.full_name ILIKE $2)" : ""}
         ORDER BY 
           CASE 
             WHEN om.status = 'active' THEN 2
             WHEN om.status = 'suspended' THEN 1
             ELSE 0 
           END,
           up.full_name ASC NULLS LAST
         LIMIT 50
      `;

      const params = hasFilter ? [organizationId, pattern] : [organizationId];
      const res = await dbPool.query(sql, params);

      return res.rows.map((row) => {
        const isMember = row.member_status === "active";
        const isPending =
          row.member_status === "suspended" ||
          (row.member_status != null && row.joined_at == null && row.member_status !== "removed");

        return {
          id: row.id,
          fullName: row.full_name ?? null,
          username: row.username ?? null,
          email: row.email,
          avatarUrl: row.avatar_url ?? null,
          isExistingMember: isMember,
          isPendingInvite: isPending,
          memberRole: row.member_role ?? null,
        };
      });
    } else {
      const sql = `
        SELECT 
           up.id,
           up.full_name,
           up.username,
           up.email,
           up.avatar_url
         FROM user_profiles up
         WHERE up.email IS NOT NULL 
           ${hasFilter ? "AND (up.email ILIKE $1 OR up.username ILIKE $1 OR up.full_name ILIKE $1)" : ""}
         ORDER BY up.full_name ASC NULLS LAST
         LIMIT 50
      `;

      const params = hasFilter ? [pattern] : [];
      const res = await dbPool.query(sql, params);

      return res.rows.map((row) => ({
        id: row.id,
        fullName: row.full_name ?? null,
        username: row.username ?? null,
        email: row.email,
        avatarUrl: row.avatar_url ?? null,
        isExistingMember: false,
        isPendingInvite: false,
        memberRole: null,
      }));
    }
  } catch (err) {
    console.error("[db] Failed to search platform users for invitation:", err);
    return [];
  }
}
