# Update Dependency Graph

Regenerate the issue dependency graph based on current GitHub Issues state.

---

## Phase 1: Gather Issue Data

### 1.1 Fetch All Open Issues

```bash
gh issue list --limit 100 --state open --json number,title,body,labels,state
```

### 1.2 Fetch Closed Blocking/Android Issues (for context)

```bash
gh issue list --limit 50 --state closed --label "blocking" --json number,title,state
```

---

## Phase 2: Parse Dependencies

For each issue, look for dependency indicators in the body:

### Dependency Patterns to Detect

1. **Explicit "Depends on"**: `Depends on #123`, `depends on #123`, `Blocked by #123`
2. **After/Before**: `After #123`, `Before #123`, `Requires #123`
3. **Issue references in context**: `needs #123 to be completed`
4. **Sequence indicators**: Issues numbered sequentially (e.g., #177-#185)

### Known Dependency Mappings

Maintain these mappings based on architectural knowledge:

```yaml
# Native Blocking Architecture
170:                              # Root issue - architecture mismatch
  children: [171, 172, 173]
171: []                           # expo-accessibility-service: multiple listeners
172: []                           # expo-foreground-service: callback system
173: [171, 172]                   # tied-siren-blocking-overlay: BlockingCallback

# JS Architecture Refactoring (sequential chain)
177: []                           # SirenTier port refactor
178: []                           # SirenLookout port refactor
179: []                           # selectBlockingSchedule selector
180: [177, 178, 179]              # Unified listener
181: [177, 178]                   # Noop implementations (Kotlin)
182: [177, 181]                   # AndroidSirenTier setBlockingSchedule
183: [177, 178, 182]              # Update dependency injection
184: [173, 180, 182, 183]         # Deprecate JS detection path
185: [184]                        # Remove legacy code (MUST BE LAST)

# Authentication (mostly independent)
88: []                            # Apple Sign-In
89: []                            # Error handling
160: []                           # Custom password reset
161: []                           # Email verification
162: [164]                        # Change password (needs re-auth)
163: [164]                        # Account deletion (needs re-auth)
164: []                           # Re-authentication
165: [160]                        # Resend password reset
166: []                           # Session invalidation
167: []                           # Brute force protection
168: []                           # Security emails
169: []                           # Deep link to email

# Epics
55: []                            # Blocking Apps on Android
54: []                            # User Authentication
57: [55]                          # Strict Mode (needs blocking working)
62: [54, 55, 57, 60]              # Launch Android App
```

---

## Phase 3: Determine Issue Status

Categorize each issue:

| Status | Criteria |
|--------|----------|
| `done` | Issue is closed |
| `ready` | All dependencies are done |
| `blocked` | Has unfinished dependencies |
| `in-progress` | Has `in-progress` label or assigned |

---

## Phase 4: Generate Mermaid Diagrams

### 4.1 Critical Path Diagram

Show the main epic dependencies for Android v1.0.

### 4.2 Native Blocking Diagram

Show #170's sub-issues and their dependencies.

### 4.3 JS Architecture Diagram

Show #177-#185 chain with phases.

### 4.4 Full Pipeline Diagram

Combined view with color-coded phases.

### 4.5 Authentication Track

Independent auth work stream.

---

## Phase 5: Calculate Work Streams

Group issues by what can be done in parallel:

```
PARALLEL_NOW = issues with no unfinished dependencies
PHASE_2 = issues whose deps are all in PARALLEL_NOW
PHASE_3 = issues whose deps are all in PHASE_2 or earlier
...
```

---

## Phase 6: Update the Graph File

Write to `docs/dependency-graph.md`:

1. Update the "Last updated" timestamp
2. Regenerate all Mermaid diagrams
3. Update the "Work Streams Summary" table
4. Update the "Recommended Execution Order" checklist
5. Mark completed issues with checkboxes: `[x]`
6. Update the "Raw Dependency Data" YAML

---

## Phase 7: Show Diff Summary

After updating, show what changed:

```markdown
## Dependency Graph Updated

### Changes
- Marked #171 as completed
- Added new issue #190 to Phase 2
- Updated critical path (3 issues remaining)

### Current Status
| Phase | Total | Done | Remaining |
|-------|-------|------|-----------|
| Phase 1 | 5 | 3 | 2 |
| Phase 2 | 3 | 0 | 3 |
| Phase 3 | 2 | 0 | 2 |
| Phase 4 | 2 | 0 | 2 |

### Ready to Start Now
- #172 - Callback system (expo-foreground-service)
- #177 - SirenTier port refactor
```

---

## Diagram Color Scheme

Use consistent colors in Mermaid:

```
#90EE90 - Green  - Done / Ready to start
#87CEEB - Blue   - Can start (no blockers)
#FFD700 - Yellow - In progress / Has some deps
#FFA500 - Orange - Multiple dependencies
#FF6B6B - Red    - Blocked / Final cleanup
#DDA0DD - Purple - Has dependencies
```

---

## Example Output

After running this command, you should see:

```
Updated docs/dependency-graph.md

Summary:
- 5 issues ready to start (green)
- 3 issues blocked (yellow)
- 4 issues in cleanup phase (red)

Critical path to Android v1.0:
#171 → #173 → #184 → #185 (4 issues)

Recommended next: Start #171 and #172 in parallel
```

---

## Notes

- Run this command after closing issues or creating new ones
- The dependency data is partially hardcoded based on architectural knowledge
- New issues should include "Depends on #X" in their body for auto-detection
- Review the generated graph for accuracy after major changes
