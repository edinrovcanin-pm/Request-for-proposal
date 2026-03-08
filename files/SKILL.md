---
name: product-request-pipeline
description: "Automated product request intake pipeline using Notion and Linear. Use this skill whenever the user mentions product requests, feature requests, domain specs, request review, Linear tickets from specs, request pipeline, intake process, or says 'check new requests', 'sync statuses', 'generate domain spec', 'create tickets from spec', or 'status report'. Also trigger when user wants to review, approve, decline, or process incoming product requests, or when they mention the Product Requests database in Notion. This skill handles the full lifecycle: intake → quality review → domain spec generation → approval → Linear ticket creation → status sync."
---

# Product Request Pipeline

Automated intake pipeline: Notion requests → AI quality review → domain spec generation → Linear tickets → status sync.

## Prerequisites

This skill requires **Notion MCP** and **Linear MCP** to be connected. If either is missing, inform the user and tell them to enable it in the Claude tools menu.

**Notion Database IDs (FuelMe):**
- Product Requests data source: `8c2ff541-efb0-40db-8447-0f29366f7c76`
- Domain Specs data source: `2c685980-28bc-43e2-8278-1eada149ff03`
- Pipeline page: `31d7b539d1e980e9b76eda5357d00993`

**Linear Team:** `NG` (NextGen Development)

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

When breaking a domain spec into Linear tickets:

### Epic (Parent)
- Title: `[Epic] [Feature Name]`
- Description: Overview, phasing plan, data model summary, dependencies
- Labels: `Feature`
- Priority: Map from request (Critical→1, High→2, Medium→3, Low→4)
- Links: Notion domain spec URL
- State: Triage

### Backend Tickets [BE]
- One ticket per major backend component (schema, API, business logic, integrations)
- Include relevant functional requirements and acceptance criteria
- Label: `Backend`

### Frontend Tickets [FE]
- One ticket per UI section or component
- Include screen descriptions and user flow references
- Label: `Frontend`

### QA Tickets [QA]
- One ticket covering test strategy
- Include all acceptance criteria from spec
- Reference edge cases section
- Label: `QA`

### Naming Convention
`[BE/FE/QA/DevOps] Short description of the work`

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

## Error Handling

- If Notion MCP is not connected: "I need Notion access to check the Product Requests database. Please enable the Notion connector in your Claude tools menu."
- If Linear MCP is not connected: "I need Linear access to create tickets. Please enable the Linear connector in your Claude tools menu."
- If a request has no Problem Description: Always flag it, never auto-generate a spec from insufficient data
- If Notion database schema has changed: Fetch the database schema first before writing to it
