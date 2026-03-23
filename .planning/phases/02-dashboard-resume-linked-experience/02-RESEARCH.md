# Phase 2: Dashboard Resume-Linked Experience - Research

**Researched:** 2026-03-23
**Domain:** Next.js dashboard and resume-viewer integration for resume-linked application tracking
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- The current dashboard page remains the main surface; no separate applications table is added.
- Application tracking is embedded into the existing `Tailored resumes` experience.
- Dashboard filtering still includes application-status control, but visible items remain tailored-resume entries.
- Tailored-resume entries signal linked applications with a simple status badge only.
- Clicking a tailored resume keeps the normal resume page flow.
- The resume page must include a dedicated application area with details, edit controls, and status actions.
- Initial application creation starts from the tailored-resume page, not from a dashboard-wide create action.

### the agent's Discretion
- Exact badge placement and filtering control layout on the dashboard.
- Whether dashboard filtering/search acts globally or inside the tailored-resume subsection.
- Exact composition of the in-page application block and whether its edit flow uses inline sections or dialogs.

### Deferred Ideas (OUT OF SCOPE)
- Standalone applications table or alternate tracker page
- Settings pipeline UI
- Post-tailoring entry flow changes
- Kanban, reminders, interview tracking, and smart parsing
</user_constraints>

<research_summary>
## Summary

Phase 2 can be implemented cleanly without changing the backend contract delivered in Phase 1. The current dashboard already owns tailored-resume loading, card rendering, and navigation into `/resumes/[id]`, while the resume viewer page already centralizes the detailed per-resume experience. That makes the viewer page the natural home for the linked application block and `Create application` action.

The main architectural choice is how to join applications to tailored resumes in the frontend. The existing backend exposes a display-ready `GET /applications` with `q` and `status` filters plus `resume_id`, which is enough to build a client-side map keyed by `resume_id` and decorate the tailored-resume list. For the resume viewer route, the same list endpoint can be queried and then resolved by `resume_id` for the current record, avoiding a Phase 2 backend detour for a dedicated `/applications/by-resume/{resume_id}` endpoint.

**Primary recommendation:** Split Phase 2 into three plans: first add a typed `applications` API client and shared frontend mapping helpers; second integrate search, status filters, ordering, and status badges into the existing dashboard cards; third add a dedicated application panel plus create/edit/status flows inside the resume viewer page using the existing Swiss-style dialog primitives.
</research_summary>

<standard_stack>
## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | existing repo dependency | Dashboard and resume-viewer page composition | Existing routes already live under `apps/frontend/app/(default)/` |
| React 19 client components | existing repo dependency | Local state, async loading, dialogs, filtered dashboard rendering | Current dashboard and viewer are already client-rendered |
| Tailwind CSS + shared UI primitives | existing repo dependency | Swiss-style cards, buttons, dialogs, badges/layout styling | Existing UI components already encode the repo's visual rules |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@/lib/api/client.ts` helpers | existing repo code | Shared `apiFetch`, `apiPost`, `apiPatch`, `apiPut` wrappers | Use for all new application endpoints |
| `useTranslations()` | existing repo code | User-facing strings and locale-aware labels | Use for dashboard filters, application panel, dialogs, and status labels |
| `useRouter()` / `useParams()` | Next.js | Existing navigation and route resolution | Reuse in dashboard cards and resume viewer flow |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Joining apps to resumes in frontend from `GET /applications` | Add a new backend endpoint keyed by `resume_id` | Cleaner single-purpose read, but expands backend scope after Phase 1 already shipped |
| Application block inside `/resumes/[id]` | Dashboard modal for all application actions | Faster surface-level access, but conflicts with the locked decision to keep the normal resume page flow |
| Extend tailored resume cards with full metadata | Badge-only signal plus details inside viewer | More dashboard context, but contradicts the user's preference for a lightweight dashboard |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```text
apps/frontend/
├── app/(default)/
│   ├── dashboard/page.tsx                  # add application-aware loading, search, filter, badge rendering
│   └── resumes/[id]/page.tsx               # add linked application block and creation/edit/status flows
├── components/
│   ├── dashboard/                          # optional dashboard filter/search subcomponents if extraction helps
│   └── applications/                       # new application panel/dialog components if needed
└── lib/api/
    ├── applications.ts                     # new typed frontend client for application endpoints
    └── index.ts                            # re-export application helpers
```

### Pattern 1: Frontend-side resume/application join keyed by `resume_id`
**What:** Fetch application list data once, index it by `resume_id`, and decorate tailored-resume items with the matching application summary.
**When to use:** Dashboard rendering and resume viewer lookup when the route is resume-centric.
**Example:**
```ts
const applications = await fetchApplications({ q, status });
const applicationsByResumeId = new Map(
  applications.items
    .filter((item) => item.resume_id)
    .map((item) => [item.resume_id as string, item])
);

const visibleTailoredResumes = tailoredResumes
  .filter((resume) => applicationsByResumeId.has(resume.resume_id))
  .map((resume) => ({
    ...resume,
    application: applicationsByResumeId.get(resume.resume_id) ?? null,
  }));
```

### Pattern 2: Keep dashboard cards lightweight, push depth into the viewer page
**What:** Show only a status badge in dashboard cards, and render the rest of the application UX inside `/resumes/[id]`.
**When to use:** When the user prefers the dashboard to stay scannable and detail work to happen inside the existing resume page.
**Example:**
```tsx
{resume.application && (
  <span className="font-mono text-xs uppercase border border-black px-2 py-1">
    {resume.application.status}
  </span>
)}
```

### Anti-Patterns to Avoid
- **Building a second dashboard surface:** contradicts the phase context and duplicates navigation.
- **Mutating application status through metadata PATCH flows:** Phase 1 explicitly reserved history writes for the status endpoint.
- **Adding card metadata beyond the badge by default:** user explicitly rejected a fuller dashboard table/card treatment.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| API fetch wrappers | Per-file raw `fetch()` calls | `apiFetch`, `apiPost`, `apiPatch` from `lib/api/client.ts` | Keeps URL resolution, timeout, and error handling consistent |
| Dialog primitives | One-off modal implementations | `components/ui/dialog.tsx` and `confirm-dialog.tsx` | Already aligned with the repo's Swiss-style UI |
| Dashboard card visuals | New card system for applications | Existing `Card`, `CardTitle`, `CardDescription` primitives | Preserves the current dashboard language and hover behavior |
| i18n plumbing | Inline hard-coded text | `useTranslations()` and message files | Existing routes already use it extensively |

**Key insight:** Phase 2 should be an extension of the dashboard and viewer patterns already in production, not a new UI subsystem.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Filtering resumes and applications independently
**What goes wrong:** Dashboard search/status controls affect only one dataset, so cards shown on screen no longer correspond to the intended application filter.
**Why it happens:** Resume list and application list are fetched separately without a single join/filter pipeline.
**How to avoid:** Treat the application list as the filter driver for tailored resumes, then project matching resume cards from that joined dataset.
**Warning signs:** Search input filters by resume title while status filter applies to applications, producing inconsistent results.

### Pitfall 2: Viewer page has no stable way to find the linked application
**What goes wrong:** `/resumes/[id]` can show resume data but cannot render or mutate the linked application because it never resolves the corresponding record.
**Why it happens:** The route only loads resume data and assumes an application id will already be known.
**How to avoid:** Add a shared lookup helper that fetches applications and resolves by `resume_id` for the current viewer route.
**Warning signs:** Viewer implementation starts adding hidden app ids to URLs or localStorage to bridge the gap.

### Pitfall 3: Dashboard badge strings and viewer actions bypass i18n
**What goes wrong:** New UI strings appear only in English or drift from existing translation key conventions.
**Why it happens:** Fast-moving feature work drops message keys directly into JSX.
**How to avoid:** Reuse `useTranslations()` for every new label and centralize message-key naming for dashboard and resume-viewer application flows.
**Warning signs:** Raw status/action labels appear inline in TSX files.
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from existing repo sources:

### Dashboard card routing pattern
```tsx
// Source: apps/frontend/app/(default)/dashboard/page.tsx
<Card
  key={resume.resume_id}
  variant="interactive"
  className="aspect-square h-full bg-canvas"
  onClick={() => router.push(`/resumes/${resume.resume_id}`)}
>
```

### Resume viewer page as the existing detail surface
```tsx
// Source: apps/frontend/app/(default)/resumes/[id]/page.tsx
const data = await fetchResume(resumeId);
setResumeData(data.processed_resume as ResumeData);
```

### Shared API wrapper pattern
```ts
// Source: apps/frontend/lib/api/resume.ts
const res = await apiPatch(`/resumes/${encodeURIComponent(resumeId)}/title`, { title });
if (!res.ok) {
  const text = await res.text().catch(() => '');
  throw new Error(`Failed to rename resume (status ${res.status}): ${text}`);
}
```

### Existing translation hook pattern
```ts
// Source: apps/frontend/lib/i18n/translations.ts
const { t } = useTranslations();
<button>{t('common.save')}</button>
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

What's changed recently:

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Dedicated admin-like table for workflow features | Embed workflow metadata into existing primary-object experiences | Common product UI trend in recent SaaS tools | Supports the user's preference to keep the resume workflow central |
| Modal-heavy management from overview pages | Lightweight overview signal + deeper detail on the existing object page | Widely used for reducing dashboard clutter | Aligns with status-badge-only cards plus viewer-page application block |
| Ad hoc string literals in React views | Strict hook-based locale lookup through shared message stores | Standard in multilingual app shells | New dashboard/viewer application strings should follow the existing translation system |

**New patterns to consider:**
- Resume/application join helpers in the API layer or page-level selector logic
- Dedicated application panel component inside the resume viewer page for separation of concerns

**Deprecated/outdated:**
- Overview pages that duplicate the full detail experience
- Inline status mutation logic that bypasses audit/history endpoints
</sota_updates>

<open_questions>
## Open Questions

1. **Best frontend lookup strategy for a resume's linked application**
   - What we know: backend guarantees `resume_id` on linked applications and the route is resume-centric.
   - What's unclear: whether the helper should always call `GET /applications` and resolve by `resume_id`, or cache/join from dashboard state during navigation.
   - Recommendation: Plan for a route-local lookup helper first; only optimize further if performance becomes a real issue.

2. **Whether the application edit flow should be modal or inline within the viewer page**
   - What we know: the application area lives inside the resume page.
   - What's unclear: whether metadata editing is easiest as a dialog, collapsible form, or embedded card section.
   - Recommendation: Let planning lock a dedicated edit dialog if it keeps the viewer page simpler, while leaving read-only details and status actions visible inline.
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- `apps/frontend/app/(default)/dashboard/page.tsx` - existing tailored-resume dashboard loading, card rendering, and navigation behavior
- `apps/frontend/app/(default)/resumes/[id]/page.tsx` - existing detailed resume viewer route and state model
- `apps/frontend/lib/api/client.ts` and `apps/frontend/lib/api/resume.ts` - frontend API wrapper and typing conventions
- `apps/frontend/components/ui/card.tsx` - dashboard card primitive and interactive styling
- `apps/frontend/components/ui/dialog.tsx` and `apps/frontend/components/ui/confirm-dialog.tsx` - modal/dialog interaction patterns

### Secondary (MEDIUM confidence)
- `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md` - updated milestone direction and phase scope
- `.planning/phases/02-dashboard-resume-linked-experience/02-CONTEXT.md` - locked Phase 2 UI/flow decisions
- `docs/agent/architecture/frontend-architecture.md` - frontend route/component conventions
- `apps/frontend/lib/i18n/translations.ts` and `apps/frontend/messages/*.json` - translation system and locale footprint
</sources>
