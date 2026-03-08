---
name: product-request-pipeline
description: "Automated product request intake pipeline using Notion and Linear. Use this skill whenever the user mentions product requests, feature requests, domain specs, request review, Linear tickets from specs, request pipeline, intake process, or says 'check new requests', 'sync statuses', 'generate domain spec', 'create tickets from spec', or 'status report'. Also trigger when user wants to review, approve, decline, or process incoming product requests, or when they mention the Product Requests database in Notion. This skill handles the full lifecycle: intake → quality review → domain spec generation → approval → Linear ticket creation → status sync."
---

# Product Request Pipeline

Automated intake pipeline: Notion requests → AI quality review → domain spec generation → Linear tickets → status sync.

## Prerequisites

This skill requires **Notion MCP**, **Linear MCP**, and **Slack MCP** to be connected. If any is missing, inform the user and tell them to enable it in the Claude tools menu.

**Notion Database IDs (FuelMe):**
- Product Requests data source: `8c2ff541-efb0-40db-8447-0f29366f7c76`
- Domain Specs data source: `2c685980-28bc-43e2-8278-1eada149ff03`
- Pipeline page: `31d7b539d1e980e9b76eda5357d00993`

**Linear Team:** `NG` (NextGen Development)

**Slack Channel:** Configurable — ask the user which channel to use on first run. Default: `#product-requests` (the user will provide the channel name or ID)

---

## Commands

The user can trigger these actions conversationally. Recognize these patterns:

### "Check new requests" / "Review requests" / "Process requests"
Full pipeline scan:
1. Query Notion Product Requests database for entries with Status = "New"
2. For each request, run **Quality Review** (see below)
3. Present findings to user with approve/decline/revise options
4. Wait for user decision before proceeding
5. After processing all requests, run **Status Sync**

### "Generate domain spec for [title]"
1. Fetch the specific request from Notion
2. Generate domain spec using the template in `references/domain-spec-template.md`
3. Create spec page in Domain Specs database
4. Link spec to the original request via the Domain Spec relation
5. Update request status to "Spec Generated"

### "Create tickets for [title]" / "Create Linear tickets"
1. Fetch the approved domain spec from Notion
2. Break down into engineering tickets:
   - One parent Epic ticket
   - Child tickets by area: [BE], [FE], [QA], [DevOps]
   - Each ticket includes: description from spec, acceptance criteria, labels
3. Create all tickets in Linear NG team with status "Triage"
4. Link Linear epic URL back to Notion request
5. Update Notion status to "In Development"

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
1. Approve — generate domain spec (+ optionally tickets)
2. Approve spec only — generate spec, review before tickets
3. Send back for revision — add Review Notes
4. Decline — add Review Notes with reason

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

---

## Linear Ticket Decomposition

When breaking a domain spec into Linear tickets, use the team's standard markdown format with `### Heading` sections. NEVER use escaped newlines (`\n`) in descriptions — use actual line breaks.

### Ticket Description Template

All tickets must follow this structure:

```markdown
### User Story

As a [role], I need to [action] so that [outcome].

### [Context Section — varies by ticket type]

Details specific to this ticket...

### Requirements

- FR-X: [requirement from spec]
- FR-Y: [requirement from spec]

### Acceptance Criteria

- Given [context], when [action], then [result]
- [Or bullet-point format for simpler criteria]
```

### Epic (Parent)
- Title: `[Epic] [Feature Name]`
- Sections: `### Overview`, `### Phasing`, `### Key Data Model`, `### Dependencies`
- Labels: `Feature`
- Priority: Map from request (Critical→1, High→2, Medium→3, Low→4)
- Links: Notion domain spec URL
- State: Triage

### Backend Tickets [BE]
- Title: `[BE] Short description`
- Sections: `### User Story`, `### [Technical Detail]`, `### Requirements`, `### Acceptance Criteria`
- One ticket per major backend component (schema, API, business logic, integrations)
- Label: `Backend`

### Frontend Tickets [FE]
- Title: `[FE] Short description`
- Sections: `### User Story`, `### Screens`, `### Tech`, `### Requirements`, `### Acceptance Criteria`
- One ticket per UI section or component
- Label: `Frontend`

### Mobile Tickets [Mobile]
- Title: `[Mobile] Short description`
- Use when Driver App or mobile-specific work is needed
- Label: `Frontend` (or create Mobile label if team prefers)

### QA Tickets [QA]
- Title: `[QA] Feature Name — Test Suite`
- Sections: `### User Story`, `### Scope`, `### Acceptance Criteria`
- One ticket covering full test strategy
- Label: `QA`

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

The skill sends Slack notifications at key pipeline events. Use the Slack MCP `slack_send_message` tool.

### When to notify

| Event | Channel | Message |
|-------|---------|---------|
| New request submitted (detected during scan) | #product-requests | 🔘 *New request:* `[Title]` by [Requestor] — [Type] / [Priority]. Reviewing now. |
| Request sent back for revision | #product-requests | ⚠️ *Revision needed:* `[Title]` — [Summary of what's missing]. @[Requestor] please update in Notion. |
| Request declined | #product-requests | ❌ *Declined:* `[Title]` — [Reason]. See Review Notes in Notion. |
| Domain spec generated | #product-requests | 📄 *Spec generated:* `[Title]` — [Link to Notion spec]. Ready for product review. |
| Spec approved + tickets created | #product-requests | ✅ *Approved:* `[Title]` — [X] Linear tickets created in NG Triage. Epic: [Linear link] |
| Status change (during sync) | #product-requests | 🔄 *Status update:* `[Title]` moved to [New Status] |

### Message format

Keep messages short and actionable. Always include:
- The request title
- A link to the Notion page
- What action is needed (if any)
- Who needs to act

### Example Slack message for a new request:

```
🔘 *New product request submitted*

*Title:* Real-Time Delivery Tracking Map
*Type:* Major Feature | *Priority:* High
*Submitted by:* Mark S.

_Problem:_ Customers have no visibility into delivery location after ordering...

👉 Product team is reviewing. Domain spec will be generated if approved.

📎 <Notion link|View in Notion>
```

### Example Slack message for tickets created:

```
✅ *Request approved — Linear tickets created*

*Title:* Real-Time Delivery Tracking Map
*Epic:* <Linear link|NG-316>
*Tickets:* 6 (3 Backend, 1 Frontend, 1 Mobile, 1 QA)

All tickets in NG Triage. Domain spec linked.

📎 <Notion link|View request> · <Notion link|View spec>
```

### Integration in pipeline flow

Slack notifications are sent automatically at each step of the pipeline:

1. **"Check new requests"** → For each new request found, send notification to channel
2. **After quality review decision:**
   - Approved → notify with "reviewing / generating spec"
   - Sent back → notify requestor with what's missing
   - Declined → notify with reason
3. **After domain spec generated** → notify with link to spec
4. **After tickets created** → notify with epic link and ticket count
5. **During "sync statuses"** → notify only for status changes (not for unchanged items)

### If Slack MCP is not connected

Slack notifications are optional. If Slack MCP is not available:
- Log a warning: "Slack notifications skipped — Slack connector not enabled"
- Continue with the rest of the pipeline normally
- Never block the pipeline because of Slack

---

## Error Handling

- If Notion MCP is not connected: "I need Notion access to check the Product Requests database. Please enable the Notion connector in your Claude tools menu."
- If Linear MCP is not connected: "I need Linear access to create tickets. Please enable the Linear connector in your Claude tools menu."
- If Slack MCP is not connected: Skip Slack notifications silently, log a note, continue with pipeline. Slack is optional — never block the pipeline for it.
- If a request has no Problem Description: Always flag it, never auto-generate a spec from insufficient data
- If Notion database schema has changed: Fetch the database schema first before writing to it
- If Slack message fails to send: Log the error, continue with pipeline. Retry once. If still fails, inform user.
