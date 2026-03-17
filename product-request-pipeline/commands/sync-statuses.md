---
description: Sync Linear ticket statuses back to Notion
---

Find all Notion Product Requests (both NextGen and Legacy) that have a Linear Issue URL set. For each:

1. Fetch the current Linear ticket status
2. Map it to the Notion status using the status mapping table from the product-request-pipeline skill
3. Update both "Linear Status" and "Status" fields in Notion
4. **If a ticket transitions to "Done":** Send a 🚀 Slack notification to the pipeline's channel, @mentioning the requestor (see Slack Notifications Event 4 in SKILL.md)

Present a summary table of all changes made.
