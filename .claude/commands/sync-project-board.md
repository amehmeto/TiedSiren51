---
description: Daily sync of GitHub Issues/Projects with recent PRs and code changes. Shows summary, asks confirmation, then displays updated Kanban.
---

## Daily Sync Workflow

Synchronize GitHub Issues and Projects with recent code changes. This command:
1. Analyzes recent PRs (merged and open)
2. Compares with current GitHub Issues state
3. Generates a summary of proposed updates
4. **Asks for confirmation** before making any changes
5. Shows the updated Kanban board and roadmap

---

## Phase 1: Gather Current State

### 1.1 Recent PRs (last 7 days)

```bash
gh pr list --limit 20 --state all --json number,title,state,mergedAt,createdAt,headRefName,labels
```

Focus on:
- **Merged PRs**: What issues should be closed? What labels need updating?
- **Open PRs**: What's in progress? Any stale PRs?

### 1.2 GitHub Issues State

```bash
gh issue list --limit 50 --state all --json number,title,state,labels,milestone
```

Look for:
- Open issues that should be closed (completed by merged PRs)
- Issues missing labels
- Issues not in the project board
- Stale issues that need attention

### 1.3 GitHub Project State

```bash
gh project item-list 1 --owner $(gh repo view --json owner -q '.owner.login') --format json
```

Check:
- Items with null status
- Items that should move to "Done"
- Missing issues that should be added

### 1.4 Recent Commits on Main

```bash
gh api repos/{owner}/{repo}/commits --jq '.[0:10] | .[] | {sha: .sha[0:7], message: .commit.message | split("\n")[0], date: .commit.author.date}'
```

Identify:
- Features completed without linked issues
- Bug fixes that should close issues

---

## Phase 2: Generate Sync Summary

Present findings in this format:

```markdown
# Daily Sync Summary - [DATE]

## Recent Activity

### Merged PRs (last 7 days)
| PR | Title | Merged | Related Issues |
|----|-------|--------|----------------|
| #XXX | ... | YYYY-MM-DD | #YYY (should close) |

### Open PRs
| PR | Title | Status | Days Open |
|----|-------|--------|-----------|
| #XXX | ... | Draft/Ready | N |

## Proposed Updates

### Issues to Close
- [ ] #XXX - Completed by PR #YYY

### Issues to Update (labels/comments)
- [ ] #XXX - Add label: `blocking`
- [ ] #XXX - Add comment: Architecture update reference

### Issues to Add to Project
- [ ] #XXX - Add to "Tied Siren" project, status: Todo

### Project Items to Update Status
- [ ] #XXX - Move from "Todo" to "In Progress"
- [ ] #XXX - Move from "In Progress" to "Done"

### ADR/Architecture Notes
- Any new architectural decisions in recent PRs
- References to update in issue descriptions

## No Changes Needed
- [List items that are already in sync]
```

---

## Phase 3: Confirmation Gate

**CRITICAL**: Before making ANY changes, ask for user confirmation:

```
## Proposed Changes Summary

I found the following updates to make:
- X issues to close
- Y issues to update (labels/comments)
- Z issues to add to project
- W project items to update status

Would you like me to proceed with these updates?

Options:
1. **Proceed with all** - Apply all proposed changes
2. **Review individually** - Go through each change one by one
3. **Skip updates** - Just show me the Kanban board
4. **Customize** - Let me specify which changes to make
```

Use the AskUserQuestion tool to get confirmation.

---

## Phase 4: Apply Updates (after confirmation)

### 4.1 Close Issues

```bash
gh issue close <NUMBER> --comment "Completed by PR #XXX"
```

### 4.2 Update Issue Labels

```bash
gh issue edit <NUMBER> --add-label "label1,label2"
```

### 4.3 Add Comments to Issues

```bash
gh issue comment <NUMBER> --body "..."
```

### 4.4 Add Issues to Project

```bash
gh project item-add 1 --owner <OWNER> --url <ISSUE_URL>
```

### 4.5 Update Project Item Status

Note: GitHub CLI project field updates require the project item ID and field ID.
If complex status updates are needed, provide instructions for manual update.

---

## Phase 5: Display Updated Kanban & Roadmap

After updates (or if skipped), display the current state:

### 5.1 Kanban Board View

```bash
gh project item-list 1 --owner <OWNER> --format json
```

Present as:

```markdown
# Kanban Board - [PROJECT_NAME]

## In Progress
| Issue | Title | Labels | Assignee |
|-------|-------|--------|----------|
| #XXX | ... | blocking, android | @user |

## Todo
| Issue | Title | Labels | Priority |
|-------|-------|--------|----------|
| #XXX | ... | enhancement | High |

## Done (last 7 days)
| Issue | Title | Completed |
|-------|-------|-----------|
| #XXX | ... | YYYY-MM-DD |

## Backlog (no status)
| Issue | Title | Created |
|-------|-------|---------|
| #XXX | ... | YYYY-MM-DD |
```

### 5.2 Roadmap Summary

Reference the cross-platform roadmap if it exists:

```bash
# Check for roadmap file
cat docs/tech-debt/cross-platform-roadmap.md 2>/dev/null | head -100
```

Present current milestone progress:

```markdown
# Roadmap Progress

## Current Focus: [MILESTONE]
- Android v1.0: [X/Y tasks complete]
- Key blockers: #XXX, #YYY

## Upcoming
- Next milestone: [NAME]
- Blocked by: [dependencies]

## Timeline
[Visual from roadmap if available]
```

### 5.3 Metrics Summary

```markdown
# Health Metrics

| Metric | Value | Trend |
|--------|-------|-------|
| Open Issues | X | +/-N from last week |
| Open PRs | X | +/-N |
| Issues without labels | X | |
| Stale issues (>30 days) | X | |
| Project coverage | X% | (issues in project / total) |
```

---

## Quick Reference

### Labels to Watch
- `blocking` - App/website blocking feature
- `android` - Android platform specific
- `auth` - Authentication related
- `needs-refinement` - Needs more detail
- `in-progress` - Currently being worked on

### Project Statuses
- `Todo` - Not started
- `In Progress` - Active work
- `Done` - Completed

### Key Files to Reference
- `docs/tech-debt/cross-platform-roadmap.md` - Platform timeline
- `docs/adr/README.md` - Architecture decisions index
- `docs/adr/infrastructure/siren-tier-orchestrator.md` - Native blocking architecture

---

## Example Usage

```
/daily-sync
```
Runs the full workflow: gather → summarize → confirm → update → display

```
/daily-sync --dry-run
```
Only shows summary without asking to update (if argument provided)

---

## Important Notes

- **Never auto-close issues** without user confirmation
- **Preserve existing labels** when adding new ones (use --add-label, not --label)
- **Link PRs to issues** in comments for traceability
- **Be conservative** - when in doubt, ask rather than assume
- Run this daily to keep the project board accurate and actionable
