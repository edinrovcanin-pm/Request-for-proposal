# Product Request Pipeline

**Automated product request intake for FuelMe using Claude AI, Notion, and Linear.**

Submit a request in Notion → AI reviews quality → Domain spec auto-generated → Product approves → Linear tickets created → Track progress in Notion.

## What it does

| Command | Action |
|---------|--------|
| `"Check new requests"` | Scans Notion for new requests, runs AI quality review, asks you to approve/decline |
| `"Generate spec for [title]"` | Creates a 9-section engineering domain spec and saves to Notion |
| `"Create tickets for [title]"` | Breaks approved spec into Linear tickets (epic + child issues) |
| `"Sync statuses"` | Pulls Linear status back into Notion for visibility |
| `"Status report"` | Full pipeline overview with live dashboard |

## Install

### Option A: Install the .skill file
1. Download `product-request-pipeline.skill` from Releases
2. Open Claude Desktop or Claude Code
3. Drag and drop the `.skill` file
4. Done — start using commands above

### Option B: Clone and install manually
```bash
git clone https://github.com/your-org/product-request-pipeline.git
# In Claude Code:
claude skill install ./product-request-pipeline
```

## Prerequisites

1. **Claude.ai** with Notion and Linear connectors enabled
2. **Notion** workspace with the Product Requests and Domain Specs databases set up
3. **Linear** workspace with the target team configured

### Notion Setup
The skill expects two databases:
- **Product Requests** — where stakeholders submit requests
- **Domain Specs** — where AI-generated specs are stored

See the [Notion page template](https://www.notion.so/fuel-me/Product-Request-Intake-Pipeline-31d7b539d1e980e9b76eda5357d00993) for the full setup.

### Configuration
Update the database IDs in `SKILL.md` if your Notion databases have different IDs:
```
Product Requests data source: 8c2ff541-efb0-40db-8447-0f29366f7c76
Domain Specs data source: 2c685980-28bc-43e2-8278-1eada149ff03
Linear Team: NG
```

## How it works

```
Stakeholder                    Claude AI                    Product Team
    |                              |                              |
    |-- Fills Notion form -------->|                              |
    |                              |-- Quality review             |
    |                              |-- Generate domain spec       |
    |                              |-- Save to Notion             |
    |                              |                              |
    |                              |-------- Review request ----->|
    |                              |                              |
    |                              |<------- Approve/Decline -----|
    |                              |                              |
    |                              |-- Create Linear tickets      |
    |                              |-- Update Notion status       |
    |                              |-- Sync Linear → Notion       |
    |                              |                              |
    |<-- Track in Notion ----------|                              |
```

## Request Types

| Type | What happens |
|------|-------------|
| **Major Feature** | Full pipeline: quality review → domain spec → approval → Linear tickets |
| **Integration** | Same as Major Feature |
| **Bug Fix** | Quality review → moves to Under Review (no spec needed) |
| **Enhancement** | Quality review → moves to Under Review (no spec needed) |

## File Structure

```
product-request-pipeline/
├── SKILL.md                           # Main skill definition
├── references/
│   └── domain-spec-template.md        # 9-section spec template
└── assets/
    └── dashboard.jsx                  # Interactive pipeline dashboard
```

## License

Internal use — FuelMe (fuel.me)
