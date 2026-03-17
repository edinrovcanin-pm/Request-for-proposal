---
description: Scan both pipelines for new product requests
---

Check BOTH the NextGen and Legacy Product Requests databases in Notion for any entries with Status = "New".

For each pipeline:
1. Query the Notion database for new requests
2. Send Slack notifications for each new request to the pipeline's channel
3. Run quality review on each request
4. Present findings with approve/decline/revise options immediately — do not wait or ask before showing options

After presenting all reviews, wait for user decisions before proceeding with domain spec, PRD, or ticket generation.
