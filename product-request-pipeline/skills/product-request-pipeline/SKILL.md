---
name: product-request-pipeline
description: "Automated product request intake pipeline using Notion and Linear. Use this skill whenever the user mentions product requests, feature requests, domain specs, PRDs, request review, Linear tickets from specs, request pipeline, intake process, or says 'check new requests', 'sync statuses', 'generate domain spec', 'generate PRD', 'create tickets from spec', or 'status report'. Also trigger when user wants to review, approve, decline, or process incoming product requests, or when they mention the Product Requests database or PRD Database in Notion. This skill handles the full lifecycle: intake → quality review → domain spec generation → PRD generation (NextGen) → approval → Linear ticket creation → status sync."
---

# Product Request Pipeline

Automated intake pipeline: Notion requests → AI quality review → domain spec generation → PRD generation (NextGen) → Linear tickets → status sync.

## Prerequisites

This skill requires **Notion MCP**, **Linear MCP**, and **Slack MCP** to be connected. If any is missing, inform the user and tell them to enable it in the Claude tools menu.

This skill supports **two pipelines**. When the user says "check the base" or "check new requests", determine which pipeline based on context. If ambiguous, ask which one. If the user says "check legacy" or "check nextgen", use the corresponding pipeline.

### NextGen Pipeline
- **Product Requests data source:** `8c2ff541-efb0-40db-8447-0f29366f7c76`
- **Domain Specs data source:** `2c685980-28bc-43e2-8278-1eada149ff03`
- **PRD Database data source:** `117ef140-ff52-4533-8942-aba9574d94b1`
- **PRD Database page:** `3257b539d1e98041adcbe4dcdb57434a`
- **Pipeline page:** `31d7b539d1e980e9b76eda5357d00993`
- **Linear Team:** `NG` (NextGen Development)
- **Slack Channel:** `#nextgen-product-requests` (channel ID: `C0AJWL15V9V`)
- **Request ID prefix:** REQ

### Legacy Pipeline
- **Product Requests data source:** `eed0032a-7e69-449d-8524-900bc8a7c4a9`
- **Pipeline page:** `3257b539d1e98176b7ece8f1f4f5e66f`
- **Linear Team:** `LE` (Legacy Development — tickets go to Triage)
- **Slack Channel:** `#legacy-product-requests` (channel ID: `C0ALWRULM0E`)
- **Request ID prefix:** LEG
- **Note:** Legacy pipeline does NOT have a separate Domain Specs database. Specs are created as child pages under the request itself or in the NextGen Domain Specs database if needed.

---

## Commands

The user can trigger these actions conversationally. Recognize these patterns:

**Pipeline detection:** If the user says "check legacy", "legacy base", "legacy requests" → use Legacy pipeline. If "check nextgen", "nextgen requests" → use NextGen. If just "check the base" → ask which pipeline, or check both if user has previously indicated a preference.

### "Check new requests" / "Check the base" / "Review requests"
Full pipeline scan:
1. Query the correct Notion Product Requests database for entries with Status = "New"
2. **Send Slack notification** to the pipeline's channel for each new request found (see Slack Notifications section)
3. For each request, run **Quality Review** (see below)
4. Present findings to user with approve/decline/revise options (use clickable buttons when possible)
5. Wait for user decision before proceeding
6. After processing all requests, run **Status Sync**

### "Generate domain spec for [title]"
1. Fetch the specific request from Notion
2. Generate domain spec using the template in `references/domain-spec-template.md`
3. Create spec page in Domain Specs database
4. Link spec to the original request via the Domain Spec relation
5. Update request status to "Spec Generated"

### "Generate PRD for [title]" (NextGen only)
1. Fetch the domain spec from Notion
2. Generate PRD using the template in `references/prd-template.md`
3. Create PRD page in PRD Database (`117ef140-ff52-4533-8942-aba9574d94b1`) with:
   - PRD Title: "PRD: [Request Title]"
   - Status: "Draft"
   - Content: The full PRD in markdown
4. This step is **mandatory for NextGen Major Feature and Integration requests** — it runs automatically after domain spec generation, before ticket creation

### "Create tickets for [title]" / "Create Linear tickets"
1. Fetch the approved domain spec from Notion
2. Break down into engineering tickets:
   - One parent Epic ticket
   - Child tickets by area: [BE], [FE], [QA], [DevOps]
   - Each ticket includes: description from spec, acceptance criteria, labels
3. Create all tickets in the correct Linear team with status "Triage":
   - **NextGen requests** → `NG` team (NextGen Development)
   - **Legacy requests** → `LE` team (Legacy Development)
4. **Update ALL Notion fields on the Product Request:**
   - `Linear Issue URL` → Epic URL
   - `Linear Status` → "Backlog"
   - `Status` → "In Development"
   - `Domain Spec` → link to domain spec page (if not already set)
   - `PRD` → link to PRD page (NextGen only, if not already set)

---

## Notion Update Checklist (MANDATORY)

After EVERY pipeline step, update the Product Request record in Notion. Never skip this.

### After Domain Spec creation:
- `Domain Spec` relation → `["https://www.notion.so/<spec-page-id>"]`
- `Status` → "Spec Generated"

### After PRD creation (NextGen only):
- `PRD` relation → `["https://www.notion.so/<prd-page-id>"]`

### After Linear ticket creation:
- `Linear Issue URL` → Epic URL from Linear
- `Linear Status` → "Backlog"
- `Status` → "In Development"

### After PM sets Expected Release Date:
- `date:Expected Release Date:start` → PM's chosen date (ISO-8601)
- `date:Expected Release Date:is_datetime` → 0

### After approval/decline:
- `Status` → appropriate value
- `Review Notes` → feedback (if revision/decline)
- `date:Date Approved:start` → today's date (if approved)

### "Sync statuses" / "Update statuses"
1. Find all Notion requests with a Linear Issue URL
2. For each, check the Linear ticket status
3. Map Linear status → Notion status:
   - Triage/Backlog/Todo → In Development
   - In Progress/Code Review → In Development
   - Testing/Testing Failed → In QA
   - Testing Passed/Released to Beta → In QA
   - Done → Done
   - Canceled → Declined
4. Update Notion Linear Status and Status properties

### "Status report" / "Show me all requests"
1. Fetch all requests from Notion Product Requests database
2. Run status sync first
3. Present a summary table grouped by status

---

## Quality Review Process

When reviewing a request, check these criteria:

### Required Fields Check
| Field | Rule |
|-------|------|
| Request Title | Must be non-empty, 3+ words |
| Request Type | Must be set (Major Feature / Enhancement / Bug Fix / Integration) |
| Priority | Must be set |
| Problem Description | Must be 3+ sentences |
| Proposed Solution | Must be non-empty (Major Feature / Integration only) |
| Business Impact | Must be non-empty (Major Feature / Integration only) |
| User Type | Must be non-empty (Major Feature / Integration only) |
| Affected Area | Must be non-empty |

### Quality Assessment
Rate each request as:
- **✅ Pass** — All fields complete, sufficient detail, impact quantified
- **⚠️ Needs revision** — Some fields incomplete or insufficient detail
- **❌ Decline** — Too vague, one-sentence descriptions, no actionable information

### Present to User
For each request, show:
```
## [Request Title]
REQ-[ID] | [Type] | [Priority] | Submitted by: [Requestor]

**Problem:** [First 2 sentences]
**Solution:** [First sentence]
**Impact:** [Summary]
**Areas:** [Tags]

**Quality Review:**
- [✅/❌] Title: [assessment]
- [✅/❌] Problem Description: [X sentences, assessment]
- [✅/❌] Business Impact: [assessment]
- [✅/❌] Affected Area: [assessment]

**Recommendation:** [Pass / Needs revision / Decline]
```

Then ask the user: "What do you want to do?" with options:
1. Approve — generate domain spec + PRD (NextGen Major Feature/Integration) + tickets
2. Approve spec only — generate spec + PRD, review before tickets
3. Send back for revision — add Review Notes
4. Decline — add Review Notes with reason

**NextGen Major Feature / Integration flow (option 1):**
Domain Spec → PRD → Linear Tickets → Ask PM for Expected Release Date

**Legacy or Bug Fix flow (option 1):**
Linear Tickets directly (no spec or PRD needed) → Ask PM for Expected Release Date

### Expected Release Date Step (MANDATORY after ticket creation)

After Linear tickets are created and Notion is updated, **always** ask the PM to set the Expected Release Date:

"Tickets are created. When do you expect this to be released? Please pick a date for **Expected Release Date**."

Present suggested options based on priority:
- **Critical/Urgent:** "Next week? (YYYY-MM-DD)"
- **High:** "In 2-3 weeks? (YYYY-MM-DD)"
- **Medium:** "Next month? (YYYY-MM-DD)"
- **Low:** "Next quarter? (YYYY-MM-DD)"

The PM can pick a suggested date or provide a custom one. Once they answer, update the Notion Product Request:
- `date:Expected Release Date:start` → the chosen date (ISO-8601)
- `date:Expected Release Date:is_datetime` → 0

**Do NOT skip this step.** If the PM says "skip" or "later", leave the field empty but remind them it needs to be set before the next status sync.

---

## Domain Spec Generation

When generating a domain spec for a Major Feature or Integration request, read `references/domain-spec-template.md` for the full 9-section template.

Key rules:
- Be specific to the FuelMe platform (Customer Portal, Vendor Portal, Admin Portal, Driver App)
- Include RBAC considerations for every feature
- Flag dependencies on other features or systems
- Use Given/When/Then format for acceptance criteria
- Include data model suggestions in Implementation Notes
- Suggest phasing if the feature is complex

After generating, save to Notion Domain Specs database with:
- Spec Title: "Domain Spec: [Request Title]"
- Status: "Draft"
- Version: 1
- Content: The full spec in markdown

**IMPORTANT:** After creating the Domain Spec page, update the original Product Request's "Domain Spec" relation field to link to the newly created spec page. Use the spec page URL in a JSON array: `["https://www.notion.so/<spec-page-id>"]`

---

## PRD Generation (NextGen Only)

**When:** Automatically after domain spec generation for NextGen Major Feature and Integration requests. Also triggered by "Generate PRD for [title]".

**Not applicable to:** Legacy pipeline requests, Bug Fix requests, Enhancement requests (these go straight to tickets).

When generating a PRD, read `references/prd-template.md` for the full 12-section template.

Key rules:
- PRD is a stakeholder-facing document — write for product managers, designers, and engineering leads, not just developers
- Use the domain spec as the primary input but restructure for PRD format
- Include full RBAC permissions table with all Admin Portal roles
- Include detailed user stories with acceptance criteria (Given/When/Then)
- Include OKRs tied to business metrics from the original request
- Include glossary of domain-specific terms
- Flag emergent requirements that will surface during implementation
- Include Dependencies, Timeline & Estimates, and Out of Scope sections
- Mark Design fields as TBD (PRD Video, Figma Design)
- Set Product Manager as "Gojko Dakovic", Designer/Team Leads/Reviewers as TBD

After generating, save to Notion PRD Database with:
- PRD Title: "PRD: [Request Title]"
- Status: "Draft"
- Content: The full PRD in markdown

**IMPORTANT:** After creating the PRD page, update the original Product Request's "PRD" relation field to link to the newly created PRD page. Use the PRD page URL in a JSON array: `["https://www.notion.so/<prd-page-id>"]`

---

## Linear Ticket Decomposition

When breaking a domain spec into Linear tickets, use the team's standard markdown format. NEVER use escaped newlines (`\n`) in descriptions — use actual line breaks. Keep descriptions **concise and scannable** — bullet points, not walls of text.

### General Rules

- **Acceptance Criteria** always use checkbox format: `- [ ] Criterion`
- **Descriptions** are concise — max 3-4 bullet points per section
- **Technical Detail** uses bullet points with `*` for items
- **Figma links** go at the very top of the description (before any headings) when available
- **No `### Requirements` section** — requirements are embedded in Technical Detail and Acceptance Criteria
- **No Given/When/Then** — use plain language checkboxes for ACs

### Epic (Parent)

- Title: `[Epic] [Feature Name]`
- Labels: `Feature`
- Priority: Map from request (Critical→1, High→2, Medium→3, Low→4)
- Links: Notion domain spec URL
- State: Triage

```markdown
### Overview

[2-3 sentences — what this feature does and why it matters. Include key business metric.]

### Phasing

* **Phase 1:** [scope]
* **Phase 2:** [scope]

### Key Data Model

* `table_name` — [purpose, key columns]
* `table_name` — [purpose, key columns]

### Dependencies

* [Dependency 1]
* [Dependency 2]
```

### Backend Tickets [BE]

- Title: `[BE] Short description`
- One ticket per major backend component (schema, API, business logic, integrations)
- Label: `Backend`

```markdown
### User Story

As a [role], I need to [action] so that [outcome].

### Technical Detail

* [Implementation point 1]
* [Implementation point 2]
* [Implementation point 3]

### Acceptance Criteria

- [ ] [Concrete, testable criterion]
- [ ] [Concrete, testable criterion]
- [ ] [Concrete, testable criterion]
```

### Frontend Tickets [FE]

- Title: `[FE] Short description`
- One ticket per UI section or portal view
- Label: `Frontend`

```markdown
[Figma link if available]

### Context

[1-2 sentences explaining what needs to be built and why]

### Screens

* **[Screen/View 1]** — [what it shows]
* **[Screen/View 2]** — [what it shows]

### Acceptance Criteria

- [ ] [Visual/functional criterion]
- [ ] [Visual/functional criterion]
- [ ] [Responsive/accessibility criterion]
```

### Mobile Tickets [Mobile]

- Title: `[Mobile] Short description`
- Use when Driver App or mobile-specific work is needed
- Label: `Frontend` (or create Mobile label if team prefers)
- Same format as [FE] tickets but with mobile-specific context

### QA Tickets [QA]

- Title: `[QA] [Feature Name] — Test Suite`
- One ticket covering full test strategy
- Label: `QA`

```markdown
### User Story

As a QA engineer, I need to validate [feature] so we can ship with confidence.

### Scope

* [Test area 1]: [what to test]
* [Test area 2]: [what to test]
* [Test area 3]: [what to test]

### Acceptance Criteria

- [ ] [Test coverage criterion]
- [ ] [Test coverage criterion]
- [ ] [Performance/load criterion]
```

---

## Status Mapping

### Linear → Notion Status
| Linear Status | Notion "Linear Status" | Notion "Status" |
|---|---|---|
| Triage | Backlog | In Development |
| Backlog | Backlog | In Development |
| Ready for Dev | Todo | In Development |
| In Progress | In Progress | In Development |
| Code Review | In Review | In Development |
| Testing | QA Testing | In QA |
| Testing Failed | QA Testing | In QA |
| Testing Passed | QA Testing | In QA |
| Done | Done | Done |
| Canceled | — | Declined |

---

## Dashboard Artifact

When the user says "check new requests", "status report", or wants to see the pipeline overview, present an interactive React artifact (read `assets/dashboard.jsx`) that shows:
- Current pipeline status (requests by stage)
- New requests awaiting review
- Recent activity log
- Quick action buttons

This gives the user a visual overview before diving into individual requests. After presenting the dashboard, ask which requests they want to process.

---

## Slack Notifications

Slack notifies the team and requestors about key pipeline events. Notifications go to the pipeline's channel and **always @mention the requestor** by resolving their Slack user ID from their email.

### Channels

| Pipeline | Channel | Channel ID |
|----------|---------|------------|
| NextGen | #nextgen-product-requests | `C0AJWL15V9V` |
| Legacy | #legacy-product-requests | `C0ALWRULM0E` |

### Resolving Requestor for @mention

Before sending any notification that tags the requestor:
1. Get the requestor's email from the Notion record (Requestor person field)
2. Use `slack_search_users` to find their Slack user ID by email
3. Use `<@USER_ID>` format in the message to @mention them
4. If requestor can't be resolved, use their name as plain text instead

### Event 1: New Request Submitted

**Trigger:** During "check the base" scan, for each request with Status = "New"

```
🔘 *New product request submitted*

*Title:* [Request Title]
*Type:* [Request Type] | *Priority:* [Priority]
*Submitted by:* [Requestor or content author]
*Pipeline:* [NextGen / Legacy]

_Problem:_ [First 1-2 sentences of Problem Description]

📎 <Notion link|View in Notion>
```

### Event 2: Request Approved

**Trigger:** Immediately after PM approves a request and Linear tickets are created

```
✅ *Product request approved*

<@REQUESTOR_SLACK_ID> your request has been approved and tickets are created!

*Title:* [Request Title]
*Type:* [Request Type] | *Priority:* [Priority]
*Epic:* <Linear Epic URL|[Epic ID]>
*Expected Release:* [Expected Release Date or "TBD"]

📎 <Notion link|View in Notion>
```

### Event 3: Request Declined

**Trigger:** Immediately after PM declines a request

```
❌ *Product request declined*

<@REQUESTOR_SLACK_ID> your request has been declined.

*Title:* [Request Title]
*Reason:* [Review Notes / decline reason]

If you have questions, please reach out to the product team.

📎 <Notion link|View in Notion>
```

### Event 4: Request Done (Shipped)

**Trigger:** During status sync, when a Linear ticket transitions to "Done"

```
🚀 *Feature/fix shipped!*

<@REQUESTOR_SLACK_ID> your request is complete and shipped!

*Title:* [Request Title]
*Type:* [Request Type]
*Completed:* [today's date]

📎 <Notion link|View in Notion>
```

### Rules

- **Always @mention the requestor** using `<@SLACK_USER_ID>` format
- Resolve Slack user ID from requestor's email (Notion person field → email → `slack_search_users`)
- Send notification **once per event** — never duplicate
- If Slack MCP is not connected, skip silently and continue the pipeline
- If requestor can't be found in Slack, use their display name as plain text
- Never block the pipeline because of Slack — notifications are best-effort

---

## Error Handling

- If Notion MCP is not connected: "I need Notion access to check the Product Requests database. Please enable the Notion connector in your Claude tools menu."
- If Linear MCP is not connected: "I need Linear access to create tickets. Please enable the Linear connector in your Claude tools menu."
- If Slack MCP is not connected: Skip Slack notifications silently, log a note, continue with pipeline. Slack is optional — never block the pipeline for it.
- If a request has no Problem Description: Always flag it, never auto-generate a spec from insufficient data
- If Notion database schema has changed: Fetch the database schema first before writing to it
- If Slack message fails to send: Log the error, continue with pipeline. Retry once. If still fails, inform user.
