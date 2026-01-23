---
description: Unified project sync - fetches issues, parses dependencies from bodies, syncs board status, updates dependency graph, shows Kanban.
---

Unified command that:
1. Fetches all issues and PRs
2. **Automatically parses dependencies** from issue bodies (no hardcoding!)
3. Syncs GitHub Project board status
4. Updates the dependency graph via `node scripts/ticket-graph/generate-dependency-graph.mjs` (validates cycles, dangling refs, generates Mermaid)
5. Shows Kanban board and ready-to-start issues

---

## Phase 1: Gather All Data

### 1.1 Fetch All Issues (with bodies for dependency parsing)

```bash
gh issue list --limit 100 --state all --json number,title,body,labels,state,closedAt
```

### 1.2 Fetch Recent PRs

```bash
gh pr list --limit 20 --state all --json number,title,state,mergedAt,headRefName,labels
```

### 1.3 Fetch GitHub Project State

```bash
gh project item-list 1 --owner $(gh repo view --json owner -q '.owner.login') --format json
```

### 1.4 Fetch Issues from Related Repositories

For cross-repo dependency tracking:

```bash
# tied-siren-blocking-overlay
gh issue list --repo amehmeto/tied-siren-blocking-overlay --state all --json number,title,body,state --limit 50

# expo-foreground-service
gh issue list --repo amehmeto/expo-foreground-service --state all --json number,title,body,state --limit 20

# expo-accessibility-service
gh issue list --repo amehmeto/expo-accessibility-service --state all --json number,title,body,state --limit 20
```

> **Fallback handling**: If a repository is inaccessible (permissions, network, deleted), log a warning and continue with available repos. Cross-repo dependencies pointing to inaccessible repos should be marked as "unknown" rather than causing sync failure.

---

## Phase 2: Parse Dependencies from Issue Bodies

### 2.1 Dependency Patterns to Detect

Parse the issue body for these patterns (case-insensitive):

| Pattern | Example | Extracted |
|---------|---------|-----------|
| YAML frontmatter | `depends_on: [177, 178]` | `[177, 178]` |
| Inline depends | `Depends on #123` | `[123]` |
| Blocked by | `Blocked by #123, #124` | `[123, 124]` |
| After | `After #123` | `[123]` |
| Requires | `Requires #123` | `[123]` |
| Blocks | `blocks: [184, 185]` | reverse dep |

### 2.2 Parsing Algorithm

```
For each issue:
  1. Check for YAML frontmatter block (```yaml ... ```)
  2. Extract `depends_on: [...]` array
  3. Extract `blocks: [...]` array (reverse dependencies)
  4. Scan body for inline patterns: "depends on #X", "blocked by #X"
  5. Store: { number, title, repo, state, depends_on[], blocks[] }
```

### 2.3 Build Dependency Graph

```
dependencies = {}
for each issue:
  dependencies[issue.number] = {
    title: issue.title,
    repo: issue.repo,
    state: issue.state,
    depends_on: parsed_depends_on,
    blocks: parsed_blocks,
    status: null  # computed next
  }
```

---

## Phase 3: Compute Issue Status

For each issue, determine status based on dependencies:

| Status | Criteria |
|--------|----------|
| `done` | Issue state is CLOSED |
| `ready` | All `depends_on` issues are CLOSED |
| `blocked` | At least one `depends_on` issue is OPEN |
| `in-progress` | Has `in-progress` label OR has open PR |

### 3.1 Topological Sort

Sort issues by dependency order to identify:
- **Phase 1**: Issues with no dependencies (can start now)
- **Phase 2**: Issues whose deps are all in Phase 1
- **Phase 3+**: Subsequent phases

---

## Phase 4: Sync Project Board

### 4.1 Identify Mismatches

Compare computed status with project board status:

| Computed | Board | Action |
|----------|-------|--------|
| done | Todo/In Progress | Move to Done |
| ready | null | Add to project, set Todo |
| in-progress | Todo | Move to In Progress |
| blocked | In Progress | Flag for review |

### 4.2 Generate Proposed Updates

```markdown
## Proposed Board Updates

### Issues to Close
- [ ] #XXX - Completed by PR #YYY

### Status Changes
- [ ] #XXX - Move from "Todo" → "In Progress" (has open PR)
- [ ] #XXX - Move from "In Progress" → "Done" (closed)

### Add to Project
- [ ] #XXX - Not in project, should be added as "Todo"
```

### 4.3 Confirmation Gate

**Ask user before making changes** using AskUserQuestion tool.

---

## Phase 5: Update Dependency Graph File

Run the dependency graph generator script:

```bash
node scripts/ticket-graph/generate-dependency-graph.mjs
```

This script will:
1. Fetch issues from all repos in parallel (TiedSiren51, tied-siren-blocking-overlay, expo-*, etc.)
2. Build a **TicketGraph** data structure with nodes and edges
3. **Validate** the graph (detect cycles, dangling refs, bidirectional mismatches)
4. **Auto-fix bidirectional mismatches** by updating GitHub issues via `gh issue edit`
5. **Fail if mismatches cannot be fixed** (blocking behavior)
6. Generate `docs/dependency-graph.md` with:
   - Graph statistics (nodes, edges, critical path)
   - Ticket inventory tables by type (initiatives, epics, features, bugs)
   - Mermaid diagram grouped by parent Epic
   - Dependency matrix

### 5.1 Bidirectional Mismatch Handling (Automatic)

The script automatically fixes bidirectional mismatches:
- If `#A depends_on #B` but `#B` doesn't have `blocks: [A]`, it adds the missing entry
- If `#A blocks #B` but `#B` doesn't have `depends_on: [A]`, it adds the missing entry

If auto-fix fails, the script exits with error and lists issues to fix manually.

### 5.2 Validation Warnings Reference

| Type | Severity | Action |
|------|----------|--------|
| `cycle` | Critical | Manual fix required - break the dependency cycle |
| `dangling_ref` | Warning | Create the missing issue or remove the reference |
| `bidirectional_mismatch` | **Auto-fixed** | Script updates issues automatically |

### 5.3 Optional: Open in Mermaid Live

To generate markdown AND open the interactive diagram:

```bash
npm run graph:live
```

### 5.4 Optional: Export Graph as JSON

For debugging or further analysis:

```bash
node scripts/ticket-graph/generate-dependency-graph.mjs --json > graph.json
```

---

## Phase 5.5: Categorize Orphan Tickets

Before generating the final graph, identify tickets that are not assigned to any Epic.

### 5.5.1 Detect Orphan Tickets

An orphan ticket is one that:
- Is NOT an initiative or epic (type is feature, bug, or task)
- Does NOT have a parent epic in its hierarchy section (`🏔️ Epic | [#XX`)
- Is still OPEN (closed tickets can be ignored)

### 5.5.2 Fetch Open Epics Dynamically

First, fetch the current list of open epics:

```bash
gh issue list --label epic --state open --json number,title,url --limit 50
```

For each epic, extract keywords from its title by:
1. Removing common prefixes like `[Epic]`, `Epic:`, etc.
2. Splitting the remaining title into significant words (ignore articles, prepositions)
3. Including any domain-specific terms (e.g., "auth", "blocking", "android")

Example keyword extraction:
- `[Epic] User Authentication` → keywords: `auth, authentication, user, sign-in, password, login`
- `[Epic] Blocking Apps on Android` → keywords: `blocking, apps, android, block`

### 5.5.3 Match Orphan Tickets to Epics

For each orphan ticket, analyze its title and body against the dynamically-fetched epic keywords:

1. **Score each epic** based on keyword matches in the ticket title/body
2. **High confidence (≥2 keyword matches)**: Auto-assign to that epic
3. **Low confidence (1 match or tie)**: Ask user to confirm

If a match is found, update the ticket's body to add the hierarchy section:

```markdown
## Hierarchy
| Level | Link |
|-------|------|
| 🏔️ Epic | [#XX - Epic Name](url) |
```

### 5.5.4 Handle Tickets That Don't Match Any Epic

If an orphan ticket doesn't match any existing epic, use `AskUserQuestion` to ask the user:

```
Ticket #XXX "Some ticket title" doesn't match any existing Epic.

Options:
1. Assign to existing Epic: [list epics as options]
2. Create new Epic for this ticket
3. Leave as orphan (no parent Epic)
```

If the user chooses to create a new Epic:
1. Ask for the new Epic's title (suggest based on ticket keywords)
2. Create the Epic issue with the `epic` label:
   ```bash
   gh issue create --title "[Epic] New Epic Name" --label epic --body "Epic description..."
   ```
3. Assign the orphan ticket to the newly created Epic

### 5.5.5 Report Orphan Tickets

Display a summary of actions taken:

```markdown
## Orphan Tickets Report

### Auto-Categorized (High Confidence)
| Ticket | Assigned To | Matched Keywords |
|--------|-------------|------------------|
| #XXX | Epic #YY | auth, login |

### User-Assigned
| Ticket | Assigned To | Action |
|--------|-------------|--------|
| #XXX | Epic #YY | User selected |
| #ZZZ | Epic #NEW | Created new Epic |

### Left as Orphan
| Ticket | Title | Reason |
|--------|-------|--------|
| #XXX | Some title | User chose to skip |
```

### 5.5.6 Update Tickets

For categorized tickets, update the issue body to add the hierarchy section:

```bash
gh issue edit <number> --body "$(updated_body_with_hierarchy)"
```

---

## Phase 6: Display Results

### 6.1 Kanban Board

```markdown
# Kanban Board

## 🟢 Ready to Start
| # | Title | Repo | Blocked By |
|---|-------|------|------------|
| #182 | AndroidSirenTier | blocking-overlay | — |

## 🔵 In Progress
| # | Title | Repo | PR |
|---|-------|------|-----|
| #179 | selectBlockingSchedule | TiedSiren51 | #197 |

## 🟡 Blocked
| # | Title | Blocked By |
|---|-------|------------|
| #180 | Unified listener | #179 |

## ✅ Recently Done
| # | Title | Closed |
|---|-------|--------|
| #178 | SirenLookout port | 2026-01-02 |
```

### 6.2 Dependency Visualization

The dependency graph is in `docs/dependency-graph.md`. For interactive viewing:

```bash
node scripts/ticket-graph/generate-dependency-graph.mjs --live
```

### 6.3 Health Metrics

From the graph generator output:

```markdown
| Metric | Value |
|--------|-------|
| Total Nodes | X |
| Total Edges | Y |
| Root Nodes (no dependencies) | Z |
| Leaf Nodes (nothing depends on them) | W |
| Orphan Nodes (isolated) | N |
| Critical Path Length | M |
| Validation Warnings | V |
```

---

## Issue Body Template

For new issues, recommend this template:

```markdown
## Description
[Issue description]

## Dependencies
<!--
Add dependencies in YAML frontmatter OR inline:
-->

```yaml
depends_on: [177, 178]
blocks: [184]
```

OR inline: Depends on #177, #178. Blocks #184.

## Acceptance Criteria
- [ ] ...
```

---

## Quick Reference

### Commands Used

```bash
# Fetch issues with bodies
gh issue list --state all --json number,title,body,labels,state,closedAt --limit 100

# Fetch from other repos
gh issue list --repo amehmeto/tied-siren-blocking-overlay --state all --json number,title,body,state

# Update project item status (requires item ID)
gh project item-edit --project-id PROJECT_ID --id ITEM_ID --field-id FIELD_ID --single-select-option-id OPTION_ID

# Dependency graph commands
npm run graph              # Generate markdown (auto-fixes bidirectional mismatches)
npm run graph:live         # Generate markdown + open mermaid.live
npm run graph:view         # ASCII tree view in terminal
```

### Repository Mapping

| Abbreviation | Full Name |
|--------------|-----------|
| TiedSiren51 | amehmeto/TiedSiren51 |
| blocking-overlay | amehmeto/tied-siren-blocking-overlay |
| expo-accessibility-service | amehmeto/expo-accessibility-service |
| expo-foreground-service | amehmeto/expo-foreground-service |

---

## Important Notes

- **No hardcoded dependencies** - everything is parsed from issue bodies
- **Cross-repo support** - tracks issues across all TiedSiren repositories
- **Confirmation required** - always ask before making changes
- **Mermaid diagrams** - auto-generated with repo info on each node
- Run regularly to keep project state accurate
