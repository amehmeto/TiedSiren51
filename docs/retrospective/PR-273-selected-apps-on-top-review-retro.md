# PR #273 Review Retrospective — Display Selected Apps at Top of Selection List

## Timeline

| Round | Date | Reviewer Comments | Fix Commit | Days Since PR Open |
|-------|------|-------------------|------------|-------------------|
| **R1** | Feb 12-13 | 9 threads | `68bec76` (Feb 13, 04:37) | Day 3 |
| **R2** | Feb 13 | 6 threads | `2ceb5f3` (Feb 13, 15:37) | Day 4 |
| **R3** | Feb 13-14 | 12 threads | `be9f2df` (Feb 14, 01:11) | Day 4-5 |
| **R3.5** | Feb 14 | 1 thread (naming) | `a9e4ee8` (Feb 14, 16:33) | Day 5 |
| **R4** | Feb 14 | 5 threads | `b8592f2` + `624ae7b` (Feb 14, 18:34-18:46) | Day 5 |
| **R5** | Feb 14-15 | 5 threads | `12d1c6c` + `a5f6863` (Feb 15, 00:12-00:40) | Day 6 |

**Total: 6 review rounds, 39 threads, 24 commits, 6 days** for a feature that was fundamentally about sorting a list.

## Root Cause Classification

| Category | Count | % |
|----------|-------|---|
| **Naming/Style** | 15 | 38% |
| **Architecture/Design** | 8 | 21% |
| **Tooling/Config** | 5 | 13% |
| **Testing** | 4 | 10% |
| **Misunderstanding** | 4 | 10% |
| **Logic/Bug** | 1 | 3% |
| **Nit** | 2 | 5% |

## Repeat Offenders

### 1. Naming (15 threads, 38%) — The single biggest source of review rounds

- R1: `item.item` naming
- R2: `sortedApps` -> `sortedAndroidApps`, `SortedListItem`, `compute`
- R3: `result`, `r`, `listItem`, identity `(s) => s`
- R3.5: `sirenEntries`
- R5: `sortWithSelectedFirst`

Claude consistently chose generic/ambiguous names that the reviewer flagged. The same pattern repeated 6 rounds.

### 2. Architecture/Location (8 threads, 21%) — Sorting logic placement

- R1: Reviewer said "sorting should be in the view model" -- Claude moved it but kept it as a separate file
- R3: Reviewer repeated "the file is still here, inline it in the view model" -- Claude didn't fully execute
- R3 (again): same thread, reviewer had to ask a third time
- R4: Type narrowing logic in component instead of view model (3 threads)

Claude repeatedly half-executed architectural feedback, requiring the reviewer to re-ask.

### 3. Incomplete fixes causing new rounds

Multiple threads where Claude said "done" but the fix was incomplete:
- Thread 2802050525: 7 comments across 3 rounds for one issue (sort file location)
- Thread 2805367449: 4 comments because Claude didn't reply initially
- Thread 2806408183: Naming fix was only partial (`i` -> `entry` -> `withoutDividers`)

### 4. Coverage files committed accidentally

4 threads all about the same mistake (coverage output committed to git). Should have been caught pre-commit.

## Prevention Recommendations

### Naming/Style (15 occurrences)

1. **Expand `no-lame-naming` ESLint rule** -- Already created mid-PR, but too late. Add more generic names: `entry`, `list`, `sorted`, `value`, `info`, `handler`. Set to `error` not `warn`.
2. **Add to CLAUDE.md**: "Use domain-specific names, not generic ones. `siren` not `item`, `blocklist` not `data`, `androidApps` not `sortedApps`."
3. **Pre-review self-check**: Add instruction to CLAUDE.md: "Before committing, review all new variable/function names. Replace any generic name with a domain-specific one."

### Architecture/Design (8 occurrences)

4. **Add to CLAUDE.md**: "View model selectors must be self-contained -- all presentation logic lives in the view model. Components should only destructure flat fields, never narrow discriminated unions."
5. **ADR enforcement**: The view model ADR already says this. Add instruction: "After creating/modifying a view model, re-read the view-model-pattern ADR and verify compliance before committing."
6. **Add to CLAUDE.md**: "When reviewer says to move code into a file, inline it -- don't create a new helper file. Private functions within the same file are preferred over separate modules for internal logic."

### Incomplete Fixes (4 occurrences)

7. **Add to CLAUDE.md**: "After addressing review feedback, verify each fix is complete by re-reading the reviewer's comment and your diff. If the reviewer said 'delete this file', verify the file no longer exists."
8. **Improve `/fix-review`**: Add a verification step that checks if files mentioned for deletion actually got deleted.

### Tooling/Config (5 occurrences)

9. **Pre-commit hook**: Add `coverage/` to `.gitignore` check in pre-commit -- if any `coverage/*` files are staged, abort commit.

### Testing (4 occurrences)

10. **Add `expect-separate-act-assert` enforcement for `toMatchObject`**: The existing ESLint rule catches inline objects but not multiple expects. Consider extending it or adding documentation that tests should use `toMatchObject(expectedViewModel)` for view model tests.

## Actionable Items (Prioritized)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 1 | **Add naming guidelines to CLAUDE.md**: "Always use domain-specific names (siren, blocklist, session) instead of generic names (item, data, result, entry). Review all new names before committing." | High -- prevents 38% of review comments | 5 min |
| 2 | **Add view model completeness rule to CLAUDE.md**: "Components must only destructure flat fields from view models. All presentation logic (type narrowing, fallbacks, formatting) belongs in the view model selector." | High -- prevents 21% of review comments | 5 min |
| 3 | **Add "verify fix completeness" rule to CLAUDE.md**: "After each fix, re-read the original review comment and verify the exact request was fulfilled. If 'delete this file' was requested, verify via `ls` that it's gone." | High -- prevents multi-round back-and-forth | 5 min |
| 4 | **Promote `no-lame-naming` to error** and expand the word list to include: `entry`, `list`, `sorted`, `value`, `info`, `handler`, `util`, `helper` | Medium -- automated catch | 15 min |
| 5 | **Add `**/coverage/**` to pre-commit gitignore check** | Medium -- prevents accidental commits | 10 min |
| 6 | **Add to CLAUDE.md**: "When moving code, prefer inlining as a private function in the consuming file over creating a new helper module. Only extract to a separate file if reused across multiple modules." | Medium -- prevents architecture back-and-forth | 5 min |
| 7 | **Improve `/fix-review` with deletion verification** | Low -- edge case | 30 min |

## Summary

**The core problem**: 38% of review comments were naming issues, and 21% were architecture/design issues where Claude placed logic in the wrong layer. These two categories account for **59% of all 39 threads** and drove most of the 6 review rounds.

**Claude's main failure mode**: Choosing generic names and half-executing architectural moves. When told to move sorting into the view model, Claude moved the *call* but kept the function in a separate file, requiring 3 rounds to fully resolve.

**Biggest bang for the buck**: Adding 3 lines to CLAUDE.md (naming convention, view model completeness, fix verification) would likely have prevented ~23 of the 39 review threads.
