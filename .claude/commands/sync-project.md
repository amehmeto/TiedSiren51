---
description: Unified project sync - fetches issues, parses dependencies from bodies, syncs board status, updates dependency graph, shows Kanban.
---

Unified command that fetches issues/PRs, parses dependencies, syncs the project board, categorizes orphans, and updates the dependency graph — all automated.

---

## Step 1: Run the sync script

```bash
./scripts/sync-project-data.sh
```

This single script handles everything:
1. **Fetches in parallel**: main repo issues, PRs, project board state, cross-repo issues
2. **Parses dependencies** from issue bodies (YAML `depends_on`/`blocks` + inline patterns)
3. **Computes statuses**: done, in-progress, blocked, ready
4. **Syncs the project board**: adds missing issues, fixes status mismatches (Todo/In Progress/Done) — all via GraphQL, no manual intervention
5. **Categorizes orphan tickets**: auto-assigns to Epics (high confidence) or adds labels (low/no match)
6. **Outputs Kanban board** (markdown) with all sections

Display the Kanban output to the user, then proceed to Step 2.

---

## Step 2: Update the dependency graph

```bash
node scripts/ticket-graph/generate-dependency-graph.mjs
```

This generates `docs/dependency-graph.md` with graph stats, Mermaid diagram, and dependency matrix. It auto-fixes bidirectional mismatches by updating GitHub issues.

Display the graph health metrics to the user.

---

## Quick Reference

```bash
./scripts/sync-project-data.sh --json   # Raw JSON output
npm run graph                            # Generate dependency graph
npm run graph:live                       # Open Mermaid live viewer
npm run graph:view                       # ASCII tree in terminal
```

### Repository Mapping

| Abbreviation | Full Name |
|--------------|-----------|
| TiedSiren51 | amehmeto/TiedSiren51 |
| blocking-overlay | amehmeto/tied-siren-blocking-overlay |
| expo-accessibility-service | amehmeto/expo-accessibility-service |
| expo-foreground-service | amehmeto/expo-foreground-service |
