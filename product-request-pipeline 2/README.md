# Product Request Pipeline

Automated intake pipeline for FuelMe product requests. Handles the full lifecycle from Notion intake through Linear ticket creation.

## What it does

- Scans Notion Product Requests databases (NextGen + Legacy) for new entries
- Runs AI quality review on each request
- Generates domain specs from approved requests
- Generates PRDs for NextGen Major Feature/Integration requests
- Creates structured Linear tickets (Epic + BE/FE/QA/Mobile) following team standards
- Syncs Linear statuses back to Notion
- Sends Slack notifications for new requests

## Required Connectors

This plugin requires three MCP connectors to be enabled:

- **Notion** — reads/writes Product Requests, Domain Specs, PRD databases
- **Linear** — creates and reads tickets in the NG team
- **Slack** — sends new request notifications (optional, pipeline continues without it)

## Commands

| Command | Description |
|---------|-------------|
| `/check-the-base` | Scan both pipelines for new requests, review, and process |
| `/sync-statuses` | Update Notion statuses from Linear |

## Skill Triggers

The skill also activates on conversational triggers like:
- "check new requests", "review requests"
- "generate domain spec for [title]"
- "generate PRD for [title]"
- "create tickets for [title]"
- "status report", "sync statuses"

## Pipelines

**NextGen** — Major Features get: Domain Spec → PRD → Linear Tickets
**Legacy** — Bug Fixes get: Linear Tickets directly

## Setup

No additional configuration needed beyond connecting the three MCP servers (Notion, Linear, Slack) in Claude's tools menu.
