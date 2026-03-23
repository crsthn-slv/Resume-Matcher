# Phase 5: Inline application status editing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-23
**Phase:** 05-inline-application-status-editing
**Areas discussed:** interaction model, surface consistency, dashboard coverage, quick-create behavior, inference fallback, save feedback, failure handling

---

## Interaction model

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Click badge opens a small dropdown anchored to the badge | ✓ |
| 2 | Click turns the badge into an inline select | |
| 3 | Other custom interaction | |

**User's choice:** 1
**Notes:** Same badge-triggered dropdown pattern should be used instead of replacing the tag inline.

---

## Surface consistency

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Same pattern on dashboard and resume viewer | ✓ |
| 2 | Different interaction per surface | |

**User's choice:** 1
**Notes:** The user explicitly wants the same interaction in both places.

---

## Dashboard coverage

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Only cards with linked application get clickable status | |
| 2 | Every card gets clickable status, including cards without application | ✓ |
| 3 | Other criteria | |

**User's choice:** 2
**Notes:** Cards without an existing application should still participate in the inline interaction.

---

## Card without application

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Choosing a status triggers quick-create from the card | ✓ |
| 2 | Show “no application” and block editing there | |
| 3 | Redirect to resume viewer first | |

**User's choice:** 1
**Notes:** The user wants the dashboard interaction to be able to create the linked application directly when possible.

---

## Quick-create minimum data

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Use selected status and infer company/role/job context automatically when available | ✓ |
| 2 | Only allow if company/role can already be inferred; otherwise block | |
| 3 | Open a mini form in the dropdown for company and role | |

**User's choice:** 1
**Notes:** Inference is preferred over expanding the dropdown into a form.

---

## Inference fallback

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Show short error in place and do not create | |
| 2 | Fall back to the normal creation form with maximum prefill | ✓ |
| 3 | Create even with empty fields | |

**User's choice:** 2
**Notes:** If quick-create cannot infer enough information, the normal form should still be available as the safe fallback.

---

## Save feedback

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Optimistic status update immediately, with subtle loading feedback | ✓ |
| 2 | Keep old status visible until the save completes | |
| 3 | Save almost silently with minimal feedback | |

**User's choice:** 1
**Notes:** The interaction should feel immediate rather than button-driven.

---

## Loading indicator placement

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Show loading state inside the badge itself | ✓ |
| 2 | Show loading next to the badge | |
| 3 | Use only a global toast/message | |

**User's choice:** 1
**Notes:** The feedback should stay local to the badge interaction.

---

## Failure handling

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Revert badge and show short inline error nearby | |
| 2 | Revert badge and show global toast | ✓ |
| 3 | Keep new badge value even if the save fails | |

**User's choice:** 2
**Notes:** The user prefers revert-on-failure with a global notification instead of adding more inline UI clutter.

---

## the agent's Discretion

- Exact dropdown primitive and implementation details
- Exact inference mechanism for dashboard quick-create
- Exact toast mechanism, as long as it matches the app's current feedback patterns

## Deferred Ideas

None.
