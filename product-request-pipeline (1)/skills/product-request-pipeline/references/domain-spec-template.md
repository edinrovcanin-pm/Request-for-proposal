# Domain Specification Template

Use this template when generating domain specs for Major Feature and Integration requests.

## System Prompt for Generation

```
You are a senior product manager at FuelMe (fuel.me), a B2B fuel delivery/management platform.

Platform structure:
- Customer Portal: Fleet managers and site managers place orders, track deliveries, manage accounts
- Vendor Portal: Fuel vendors manage pricing, inventory, delivery schedules
- Admin Portal: FuelMe operations team manages the platform, users, billing
- Driver App: Delivery drivers receive routes, confirm deliveries, capture signatures

Generate an engineering-ready Domain Specification from the product request below.
Be specific to FuelMe. Include RBAC considerations. Flag dependencies.
Use Given/When/Then for acceptance criteria.

If an Additional Document is provided alongside the product request, treat it as primary source material.
Incorporate its business requirements, stakeholder decisions, and domain context throughout the spec —
do not relegate it to a footnote. If the document contradicts the request fields, flag the discrepancy.
```

## Output Template

```markdown
# Domain Specification: [Title]

## 1. Overview
Brief summary of what this spec covers and why it matters to the business.
One paragraph, 3-5 sentences.

## 2. Problem Definition
- **Current State:** What exists today and why it's insufficient
- **Who is affected:** Specific user roles and which portal they use
- **Pain points:** Bulleted list of specific problems
- **Root cause:** Why this problem exists at a system level
- **Quantified impact:** Numbers from the request (time wasted, revenue lost, support costs)

## 3. Proposed System Behavior
High-level description of how the system should work after implementation.
Include a numbered flow of the core behavior.
Mention which portals/apps are affected.

## 4. Functional Requirements
Group by feature area. Number each requirement.

### [Area 1]
- FR-1: [Testable requirement]
- FR-2: [Testable requirement]

### [Area 2]
- FR-3: [Testable requirement]
- FR-4: [Testable requirement]

## 5. Non-Functional Requirements
- **Performance:** Response times, throughput targets
- **Scalability:** Concurrent users, data volume targets
- **Reliability:** Uptime, retry behavior, failure handling
- **Security:** RBAC rules, data access scoping, compliance
- **Data retention:** How long data is kept

## 6. User Flow
### Primary Flow: [Main use case]
Numbered step-by-step walkthrough from the user's perspective.

### Alternate Flow: [Secondary use case]
Numbered steps for alternate paths.

### Error Flow: [Failure scenario]
What happens when things go wrong.

## 7. Edge Cases
Bulleted list of boundary conditions, unusual inputs, timing issues, and error scenarios.
Each should describe the scenario AND the expected system behavior.

## 8. Acceptance Criteria
Use Given/When/Then format:
- AC-1: Given [context], when [action], then [expected result]
- AC-2: Given [context], when [action], then [expected result]

Include at least one AC per major functional requirement.
Include performance/scale ACs from non-functional requirements.

## 9. Implementation Notes
- **Dependencies:** What must exist before this can be built
- **Data Model:** Table names, key columns, indexes, relationships
- **RBAC:** Who can do what, per role
- **Phasing:** If complex, suggest Phase 1/2/3 breakdown
- **Technical considerations:** Architecture suggestions, integration points, performance strategies
```

## Quality Checklist

Before saving a generated spec, verify:
- [ ] All 9 sections are populated
- [ ] Functional requirements are numbered and testable
- [ ] Acceptance criteria use Given/When/Then format
- [ ] RBAC is specified for each user role
- [ ] Dependencies are explicitly listed
- [ ] Data model includes table names and key columns
- [ ] Edge cases cover at least 5 scenarios
- [ ] Phasing is suggested if the feature is complex
- [ ] If Additional Document was provided, its key content is incorporated (not ignored)
