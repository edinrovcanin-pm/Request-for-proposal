# PRD Template

Use this template when generating PRDs for NextGen Major Feature and Integration requests. The PRD is generated AFTER the domain spec and uses it as primary input.

## System Prompt for Generation

```
You are a senior product manager at FuelMe (fuel.me), a B2B fuel delivery/management platform.

Platform structure:
- Customer Portal: Fleet managers and site managers place orders, track deliveries, manage accounts
- Vendor Portal: Fuel vendors manage pricing, inventory, delivery schedules
- Admin Portal: FuelMe operations team manages the platform, users, billing
- Driver App: Delivery drivers receive routes, confirm deliveries, capture signatures

Generate a stakeholder-ready PRD from the domain specification below.
Write for product managers, designers, and engineering leads — not just developers.
Include full RBAC tables, detailed user stories with acceptance criteria, and OKRs.

If an Additional Document is provided alongside the domain spec, incorporate its contents as
supplementary context — it may contain stakeholder decisions, business rules, legacy system details,
or domain knowledge that enriches the PRD. Weave relevant details into the appropriate sections
rather than treating the document as a separate appendix.
```

## Header Block

Every PRD starts with this metadata block (rendered as a table or key-value list at the top):

```
Product Manager: Gojko Dakovic
Designer: TBD
Team Leads: TBD
Reviewers: TBD
Target Release: MVP
Linear Project: TBD
```

## Output Template

```markdown
# PRD: [Title]

[Header block — see above]

## 1. Context of Work

### Why

[3-4 paragraphs explaining the business context. Structure as:]

Paragraph 1: What operational problem exists and why it matters to FuelMe's business.

Paragraph 2: "This PRD enables:" — bullet list of 4-6 key capabilities this feature introduces.

Paragraph 3: "Without this capability:" — bullet list of 3-5 consequences of not building this, describing current manual/broken workflows.

Paragraph 4: "This PRD defines the [Feature Name] capabilities within [Portal] → [Section] → [Page]."

### Who

Primary Users ([Portal]):
- [Role 1] ([permission level and what they do])
- [Role 2] ([permission level and what they do])
- [Continue for all affected roles]

### When

Bullet list of 4-6 scenarios describing WHEN users need this feature:
- When [scenario 1]
- When [scenario 2]
- ...

### Where

Bullet list of all UI locations/pages where this feature appears:
- [Portal] → [Section] → [Page/View]
- [Portal] → [Section] → [Page/View] → [Sub-view]
- ...

### How (High-Level)

Numbered list (5-7 steps) describing the high-level user flow:
1. User navigates to [location]
2. User sees [what they see]
3. User views [summary/cards/data]
4. User can: [bullet list of key actions]

## 2. Problem Statement

[2-3 paragraphs restating the problem in stakeholder language. Include:]
- What is broken or missing today
- Specific consequences (quantified where possible)
- What this PRD introduces as the solution

## 3. Glossary

Group terms by category:

[Domain] Terms:
- **[Term]**: [Definition]
- **[Term]**: [Definition]

Operational Terms:
- **[Term]**: [Definition]

Notification Terms:
- **[Term]**: [Definition]

Data & Reporting Terms:
- **[Term]**: [Definition]

## 4. Objectives & Key Results (OKRs)

### Objective
[Single sentence describing the high-level goal]

### Key Results
- [Measurable KR 1 — tied to business metrics from the original request]
- [Measurable KR 2 — tied to user behavior or system performance]
- [Measurable KR 3 — tied to operational impact]
- [Measurable KR 4 — tied to audit/compliance]
- [Measurable KR 5 — tied to data/reporting value]

## 5. Emergent Requirements

[2 paragraphs explaining:]

Paragraph 1: This PRD captures known requirements. We expect emergent requirements during: [list of discovery moments — sprint demos, first real usage, integration testing, user feedback].

Paragraph 2: The product backlog will be updated iteratively as we learn more about: [bullet list of 4-5 open questions that can't be answered until implementation begins].

"These emergent requirements cannot be fully anticipated upfront and will be prioritized as discovered."

## 6. Permissions & Access Control

### Access Model

[Portal] Roles & Permissions table:

| Role | [Permission 1] | [Permission 2] | [Permission 3] | ... |
|------|---|---|---|---|
| System Admin | ✓ | ✓ | ✓ | ... |
| Super Admin | ✓ | ✓ | ✓ | ... |
| [Role 3] | ✓ | ✓ | ✗ | ... |
| [Continue for all roles] |

### Audit Logging

All management actions must be logged with:
- [Entity] ID (where applicable)
- Action type ([list specific action types])
- User who performed action
- Timestamp
- Changed fields (for configuration edits)
- Previous and new values

## 7. User Stories & Acceptance Criteria

### Story 1: [Action-oriented title]

As a [Role],
I can [action],
So that [business value].

**Acceptance Criteria:**
- [Detailed AC — describe UI elements, behavior, data shown]
- [AC for interactions — click, filter, sort behaviors]
- [AC for empty states]
- [AC for edge cases]
- [AC for refresh/auto-update behavior]

### Story 2: [Action-oriented title]
[Same format — continue for all major user stories]

[Include 6-12 user stories covering all major flows from the domain spec]

## 8. Design

- PRD Video: To be added
- Figma Design: To be added

## 9. Dependencies

Bullet list of all system dependencies:
- [Dependency 1] ([PRD/System reference]) — [what it provides]
- [Dependency 2] ([reference]) — [what it provides]
- [External dependency] — [integration details]
- [Infrastructure dependency] — [what's needed]

## 10. Timeline & Estimates

- Estimated Effort: TBD by engineering team
- Target Delivery: MVP Phase 1
- Priority: [High/Medium/Low] ([brief justification])

## 11. Explicitly Out of MVP Scope

The following are intentionally excluded from MVP:
- [Out of scope item 1] ([brief reason])
- [Out of scope item 2] ([brief reason])
- [Continue — typically 6-10 items]

## 12. Review & Sign-off

### Change History
- [Date]: Initial draft created based on Product Request [REQ-ID] — [Request Title]
- [Any additional context about stakeholder feedback incorporated]
```

## Quality Checklist

Before saving a generated PRD, verify:
- [ ] All 12 sections are populated
- [ ] Header block has Product Manager set to "Gojko Dakovic"
- [ ] Context of Work covers Why, Who, When, Where, How
- [ ] Problem Statement is written in stakeholder language (not technical)
- [ ] Glossary defines all domain-specific terms
- [ ] OKRs are measurable and tied to business metrics
- [ ] Emergent Requirements section acknowledges unknowns
- [ ] RBAC table covers all relevant Admin Portal roles
- [ ] User Stories use "As a / I can / So that" format
- [ ] Acceptance Criteria are detailed and testable
- [ ] Dependencies reference specific systems/PRDs
- [ ] Out of Scope items are explicitly listed
- [ ] Change History references the original Product Request ID
- [ ] If Additional Document was provided, its key content is incorporated (not ignored)
