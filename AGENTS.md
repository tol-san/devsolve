<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UI & Design System Guidelines

When performing any work related to UI components, layout, styling, theme, animations, or visual design, AI agents MUST:
1. Read and follow the design specifications in [`design.md`](file:///c:/Users/tolsa/Documents/My%20project/devsolve-frontend/design.md).
2. Use the `motion` library (`import { motion } from "motion/react"`) for smooth UI animations, layout transitions, and interactive visual feedback.
3. **Typography & Font Sizes**: Maintain legible, clear typography across all components and pages:
   - Body & Form Inputs: Use `text-base` (16px) or `text-sm` (14px) for optimal readability. Avoid small fonts like `text-xs` (12px) or `text-[11px]` for main form inputs, primary table content, and body paragraphs.
   - Headers & Navigation: Use `text-base` / `text-lg` for navigation items and clear visual hierarchy for section titles (`text-lg`, `text-xl`, `text-2xl`).
   - Form Styling: Ensure input fields use clean white backgrounds (`bg-white`) with clear, defined borders (`border-slate-300`).
4. **Dashboard Page Layout Standard**:
   - All page components under `/dashboard/*` MUST be wrapped in a `<motion.div>` with standard entrance animation parameters (`initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}`) and container layout (`className="space-y-6 w-full pb-12"`).
   - Use the consistent page header pattern (`<header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">`) with breadcrumb navigation, a prominent `<h1>` title (`text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100`), and a descriptive subtext.
   - Ensure loading states use structured skeleton pulse containers (`animate-pulse`) matching the page structure instead of simple unstyled spinners.
5. **No Native `<select>` Tags**: NEVER use raw HTML `<select>` tags or native browser select dropdowns. ALWAYS use the `shadcn/ui` Select component (`import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"`) for all dropdowns, select inputs, and rows-per-page pickers across the application.
6. **No Explicit Mock Badges**: NEVER add explicit "Mock Preview Data", "Mock Data", or similar preview badges/indicators to UI headers or components. Render all fallback or mock data cleanly and seamlessly without explicit mock tag banners.
7. **Strict Dynamic Dark Mode Tokens**: NEVER hardcode dark/light mode hex colors or hardcoded slate shades (e.g. `bg-[#0b0f17]`, `bg-[#131926]`, `bg-[#1a2133]`, `border-slate-800`, `text-slate-300`). ALWAYS use standard dynamic theme tokens (`bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `ring-1 ring-foreground/5 dark:ring-foreground/10`) across all components and pages to guarantee seamless Light & Dark mode support without exception.
8. **One Shared Page Background**: every page in the app sits on the landing hero's backdrop — grid paper, drifting colour fields, scan beams and rising motes (pulsing cells disabled by default). It is mounted once per shell by `PageBackdrop` (`src/components/layout/PageBackdrop.tsx`, a `fixed inset-0 -z-10` wrapper around `SectionBackdrop`) in the `(public)`, `(auth)` and `dashboard` layouts, plus `NotFoundStage` for the 404, which renders outside those layouts.
   - **Page shells must stay transparent.** NEVER paint an opaque background on a page-level wrapper (`min-h-screen bg-background`, `bg-white`, `bg-slate-50`, `bg-muted/30`, `bg-[#F8FAFC]`, …) — it hides the backdrop. Cards, panels, tables, inputs and other inner surfaces keep their own `bg-card` / `bg-background` as normal.
   - **Do not add a second `SectionBackdrop`** to a page or a full-page section: two grids at different `gridSize` values moiré against each other. The exceptions are the landing sections (`src/components/landing/*`), the `/about` sections and the footer, which each paint their own opaque surface and therefore carry their own copy.
   - New route ⇒ nothing to do: the layout already supplies the backdrop. Just leave the page's outermost element without a background.

# Data Fetching & Mutations

Use **RTK Query** (via `@reduxjs/toolkit`) as the **only** approach for fetching and mutating server data. Specifically:
- Use generated hooks (e.g. `useGetXxxQuery`, `useUpdateXxxMutation`) in components.
- Do **NOT** use raw `fetch`, `axios`, or `useEffect` for server-side data — always go through RTK Query endpoints.
- The Redux store is already configured; add new API slices and wire them into the store's `reducer` and `middleware` accordingly.

# Tech Stack

| Area | Technology |
|------|-----------|
| Framework | Next.js 16.2.10 (App Router) |
| UI | shadcn/ui + TailwindCSS v4 |
| Animations | `motion/react` (Motion v12) |
| State / Data | Redux Toolkit + RTK Query |
| Forms | react-hook-form + zod |
| Auth | better-auth + Keycloak (OIDC/PKCE) |
| Icons | lucide-react |
| HTTP (internal) | RTK Query only — no raw fetch/axios |

# Auth Flow

- **Keycloak issuer:** `https://auth.quizzy.it.com/realms/devsolve`
- **Protocol:** OIDC with PKCE (S256) — `Require PKCE` is enabled on the Keycloak client.
- **Library:** `better-auth` with the `genericOAuth` + `keycloak` preset (`src/lib/auth/auth.ts`).
- **Login trigger:** Calling better-auth's `genericOAuth` sign-in redirects the user to the Keycloak login form.
- **Session:** better-auth issues a session cookie after the OAuth callback; the middleware (`src/proxy.ts`) reads this cookie via `getSessionCookie()` to gate private routes.
- **Route protection:**
  - Unauthenticated users hitting `/dashboard/*` → redirected to `/`.
  - Authenticated users hitting `/` directly (not via internal nav) → redirected to `/dashboard`.

# API Proxy & Bearer Token Pattern (Mandatory for ALL Endpoints & Code)

ALL API communication and data fetching across the application MUST strictly follow this standard pattern:

1. **Client / UI Layer**: Components MUST use RTK Query hooks exclusively (`src/lib/redux/services/*`). Never use raw `fetch` or `axios` in components.
2. **Dynamic Bearer Token Injection**: `baseApi` (`src/lib/redux/services/baseApi.ts`) automatically retrieves the Keycloak JWT Bearer token via `getAccessToken()` (`src/lib/auth/access-token.ts`) using `authClient.getAccessToken({ providerId: "keycloak" })` from `better-auth`'s server-side session.
3. **Next.js Server Proxy Layer**: Requests MUST NOT hit the backend API URL directly from the client. ALL requests MUST route through Next.js server-side API proxy routes (`src/app/api/...`), which:
   - Validate payloads with Zod.
   - Verify session authentication via `auth.api.getSession()` / `getAccessToken()`.
   - Relay requests server-to-server to `${BACKEND_API_URL}` with `Authorization: Bearer <token>`.
4. **Automatic Re-authorization**: On `401 Unauthorized`, `baseApi` automatically invalidates the token cache and replays the request once.

**Concrete Reference Examples**:
- **Registration Flow (`POST /api/auth/register`)**: UI → `useRegisterUserMutation()` → Proxy route `src/app/api/auth/register/route.ts` → `${BACKEND_API_URL}/auth/register`.
- **Authenticated Endpoint Flow (`/me`)**: UI → `useGetProfileByUsernameQuery()` → `baseApi` injects Bearer token → Proxy route `src/app/api/user-profiles/me/route.ts` → `${BACKEND_API_URL}/user-profiles/me`.

# SEO (Mandatory for every new route)

The SEO layer lives in `src/lib/seo`. **Every new page under `src/app` must declare its metadata** — a route that ships without it inherits the site defaults and competes with the home page in search results.

1. **Describe the page**: export `metadata` (static) or `generateMetadata` (data-driven) built with `pageMetadata()` from `src/lib/seo/metadata.ts`. It derives the canonical URL, Open Graph and Twitter cards from one title/description/path, so never hand-write those tags.
2. **Client pages cannot export metadata**. When a page is `"use client"`, make `page.tsx` a server component that renders the client component (see `/community`, `/company`, `/profile/[username]`). A pass-through `layout.tsx` carrying the metadata is acceptable **only for a leaf route with no child routes** (see `/about`) — see the next rule for why.
3. **Never set a `title` on a layout that has child routes** — a title in a layout, plain or `absolute`, replaces the root title template for everything beneath it, and those children lose their `· DevSolve` suffix. Layouts that only need `robots: NO_INDEX` must set only that.
4. **Private, transactional and duplicate routes**: apply `robots: NO_INDEX` (from `src/lib/seo/metadata.ts`) to anything behind sign-in, any form/composer, and any thin listing. For a page that genuinely duplicates another URL, do not noindex it — pass the *primary* route as `path` to `pageMetadata()` so its canonical points there (see `/company/programs/[id]`).
5. **Server-side reads for metadata** go through `src/lib/seo/content.ts`, never RTK Query — it has no store during `generateMetadata`. Those fetches are deliberately anonymous, so metadata reflects what a crawler can actually see, and they return `null` rather than throwing.
6. **Structured data**: emit schema.org JSON-LD with `<JsonLd>` and the builders in `src/lib/seo/jsonld.tsx`. Only describe what is visibly on the page — overstating it is a manual-action risk for the whole domain.
7. **Social cards**: use the `opengraph-image.tsx` file convention with `ogCard()` from `src/lib/seo/og-card.tsx`. Do **not** also set `openGraph.images` in metadata — file-based metadata outranks it, so the two would fight.
8. **Descriptions from user Markdown** must go through `describe()` in `src/lib/seo/text.ts`, which strips Markdown without mangling identifiers like `invalid_grant`.
9. **`NEXT_PUBLIC_SITE_URL` must be the real public origin in production.** A loopback value is ignored by `src/lib/seo/site.ts` in production builds, which then falls back to the deployment domain.
10. **`sitemap.ts` / `robots.ts`**: any new public route type must be added to `src/app/sitemap.ts`, and any new private or transactional prefix to `src/app/robots.ts`.



***
## If any change in the future please reflex change this instruction.
