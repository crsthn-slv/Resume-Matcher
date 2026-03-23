# Phase 3: Workflow Integrations - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-23T12:40:00Z
**Phase:** 03-workflow-integrations
**Areas discussed:** Settings pipeline management, post-tailoring creation flow, flow continuity

---

## Settings pipeline management

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated Settings section | Extend the existing Settings page with inline add/remove/reorder controls for application statuses | ✓ |
| Separate Settings sub-route | Create a dedicated pipeline management screen under Settings | |
| Minimal read-only section | Show statuses in Settings but defer editing to another phase | |

**User's choice:** Auto-selected recommended option: dedicated Settings section.
**Notes:** Best fit with the current Settings page structure and avoids fragmenting admin workflow.

---

## Post-tailoring creation flow

| Option | Description | Selected |
|--------|-------------|----------|
| Immediate next-step prompt after tailoring | Offer application creation right after tailored resume confirmation, carrying linked IDs forward | ✓ |
| Manual later creation from dashboard/viewer only | Leave creation discoverable but not prompted after tailoring | |
| Separate post-tailoring application screen | Route to a distinct creation page after tailoring | |

**User's choice:** Auto-selected recommended option: immediate next-step prompt after tailoring.
**Notes:** Matches the roadmap requirement and reduces the chance that the user loses the momentum of creating the linked application.

---

## Flow continuity

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse Phase 2 resume viewer flow | Keep the resume page as the destination and reuse its application creation/edit patterns | ✓ |
| Build a second specialized application form for tailoring | Create a new form only for the tailoring flow | |
| Let the agent decide later | Delay the interaction decision to planning | |

**User's choice:** Auto-selected recommended option: reuse Phase 2 resume viewer flow.
**Notes:** Preserves a single application-management pattern and keeps the product resume-centric.

---

## the agent's Discretion

- Exact reorder interaction in Settings
- Exact trigger/presentation for the post-tailoring create prompt
- Final reuse mechanism between tailoring and resume-viewer application creation

## Deferred Ideas

None.
