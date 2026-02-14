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

## Phase 1-3: Fetch Data, Parse Dependencies, Compute Status, Show Kanban

All data gathering, dependency parsing, status computation, and Kanban output are handled by a single script:

```bash
./scripts/sync-project-data.sh
```

This script:
1. **Fetches in parallel**: main repo issues, PRs, project board state, cross-repo issues (blocking-overlay, expo-foreground-service, expo-accessibility-service)
2. **Parses dependencies** from issue bodies (YAML `depends_on`/`blocks` + inline patterns like "Depends on #X", "Blocked by #X")
3. **Computes statuses**: done (closed), in-progress (has open PR), blocked (open dep), ready (all deps closed)
4. **Outputs Kanban board** (markdown) with In Progress, Ready, Blocked, Recently Done sections
5. **Detects board mismatches** (board status vs computed status)

Use `--json` for raw JSON output: `./scripts/sync-project-data.sh --json`

Display the Kanban output to the user, then proceed to Phase 4.

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

### 4.3 Execute Updates Automatically

**Do NOT ask for confirmation.** Apply all board updates immediately (add missing issues, fix status mismatches). This is a core responsibility of /sync-project.

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

To view the diagram interactively:

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

**Handled automatically by `./scripts/sync-project-data.sh`.**

The script detects orphan tickets (open, non-epic, no hierarchy section) and:
1. **High confidence (≥2 keyword matches)**: auto-assigns to matching Epic (adds hierarchy section to issue body)
2. **No/low match**: auto-adds a label based on title keywords (tooling, auth, blocking, android, enhancement, etc.)

**No user confirmation needed.** Every orphan gets either an Epic parent or a label — never left unlabeled.

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

# Fetch project board state (wraps gh project item-list with owner resolution)
./scripts/fetch-project-board.sh

# Update project item status (requires item ID)
gh project item-edit --project-id PROJECT_ID --id ITEM_ID --field-id FIELD_ID --single-select-option-id OPTION_ID

# Dependency graph commands
npm run graph              # Generate markdown (auto-fixes bidirectional mismatches)
npm run graph:live         # Open mermaid.live (auto-fixes bidirectional mismatches)
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
