# Ticket Dependency Graph

This document visualizes the dependencies between GitHub issues to help with planning and prioritization.

> **Auto-generated** from GitHub issue metadata. Do not edit manually.
> Last updated: 2026-02-25

## Validation Warnings

The following issues were detected in the dependency graph:

- **dangling_ref**: Node TiedSiren51#389 depends on non-existent node TiedSiren51#57
- **dangling_ref**: Node TiedSiren51#219 depends on non-existent node TiedSiren51#55

---

## Graph Statistics

| Metric | Value |
|--------|-------|
| Total Nodes | 114 |
| Total Edges | 30 |
| Root Nodes (no dependencies) | 98 |
| Leaf Nodes (nothing depends on them) | 98 |
| Orphan Nodes (isolated) | 90 |
| Critical Path Length | 5 |

### Critical Path

The longest dependency chain in the graph:

`tied-siren-blocking-overlay#5 → tied-siren-blocking-overlay#6 → tied-siren-blocking-overlay#7 → tied-siren-blocking-overlay#8 → tied-siren-blocking-overlay#13 → tied-siren-blocking-overlay#14`

---

## Complete Ticket Inventory

### Epics (2)
| # | Title | SP | Depends On | Blocks |
|---|-------|----:|------------|--------|
| #219 | [Epic] Native Blocking Layer | 🔴 13 | #55 | - |
| #389 | [Epic] Prevent app uninstall & bypass during strict mode sessions | 🔴 13 | #57 | - |


### Bugs (1)
| # | Title | SP | Severity | Related |
|---|-------|----:|----------|---------| 
| #333 | fix: local Prisma database not scoped per user — data leaks between accounts | - | medium | - |


### Features - Other (67)
| # | Title | SP | Depends On | Blocks |
|---|-------|----:|------------|--------|
| #1 | Add ability to filter between system apps and user-installed apps on Android | - | - | - |
| #4 | Thanks for this module and request for tutorial or guide | - | - | - |
| #10 | feat: Add uniqueBy option to deduplicate apps by package or activity | - | - | - |
| #199 | feat(blocklist): add confirmation modal when deleting blocklist used in active sessions | - | - | - |
| #200 | feat(strict-mode): block blocklist deletion during active strict mode sessions | - | - | - |
| #201 | Refactor BlockSession to store blocklist IDs instead of embedded blocklists | 🟠 5 | - | - |
| #202 | test | - | - | - |
| #229 | feat(claude): add PreToolUse hook to block --no-verify in git push commands | - | - | - |
| #233 | chore: Add fine-grained git checkout permissions to Claude settings | - | - | - |
| #243 | fix: git pull triggers CI watch incorrectly | - | - | - |
| #246 | Update expo-list-installed-apps to include launcher apps fix | - | - | - |
| #248 | Add initial delay to CI watch before polling | - | - | - |
| #250 | Fix FlatList scroll cutoff on selection scenes | - | - | - |
| #252 | Refactor CLAUDE.md using progressive disclosure | - | - | - |
| #255 | feat(strict-mode): disable edit and delete actions on sessions and blocklists during strict mode | - | - | - |
| #257 | Achieve 100% code coverage for custom ESLint rules | - | - | - |
| #258 | feat: enforce stricter-only editing of block sessions during strict mode | - | - | - |
| #260 | refactor(ui): redesign time picker with consistent design system primitives | - | - | - |
| #264 | perf: Add caching for installed apps list | - | - | - |
| #268 | feat(strict-mode): show closed lock icon in tab bar when strict mode is active | - | - | - |
| #270 | feat: add review-fix command, enhance start-issue with issue content, and add branch hygiene rules | - | - | - |
| #272 | Display selected apps at top of blocklist screen | - | - | - |
| #276 | Migrate from ESLint to OxLint | - | - | - |
| #278 | Refactor: Extract BlocklistForm view model selector | - | - | - |
| #287 | refactor: promote require-typed-each ESLint rule from warn to error | - | - | - |
| #288 | refactor: promote no-inline-object-type ESLint rule from warn to error | - | - | - |
| #289 | refactor: promote prefer-extracted-long-params ESLint rule from warn to error | - | - | - |
| #291 | feat(ci): auto-generate review retrospective on PR merge and post to Slack | - | - | - |
| #292 | fix: make start-issue.sh work from any worktree context | - | - | - |
| #299 | feat: add pre-merge-commit Husky hook for squash-merge safety gate | - | - | - |
| #300 | fix(scripts): automate board sync in sync-project-data.sh | - | - | - |
| #304 | fix(ci): retro workflow fails because claude-code-action doesn't expand custom slash commands | - | - | - |
| #312 | fix(block-session): auto-focus name input and use proper placeholder in ChooseName modal | - | - | - |
| #313 | fix(block-session): time picker modal blinks and requires double selection on Android | - | - | - |
| #316 | refactor: split /start-issue into /prepare-worktree and /start-issue | - | - | - |
| #322 | Cerberus: trigger build job when PR is marked as ready for review | - | - | - |
| #328 | fix: Android time picker dark mode text colors (inner clock numbers & buttons) | - | - | - |
| #329 | Redesign Settings screen with grouped sections layout | - | - | - |
| #330 | feat: configure iOS Universal Links for deep linking | - | - | - |
| #334 | feat: redesign strict mode timer with wheel picker component | - | - | - |
| #335 | feat: auto-verify email via deep link instead of manual refresh | - | - | - |
| #336 | Rename generic variables flagged by no-lame-naming and promote to error | - | - | - |
| #338 | Add pre-commit guard against merged branches and fix eslint comments | - | - | - |
| #340 | Adopt OpacityPressable across codebase to replace inline opacity pattern | - | - | - |
| #342 | feat: add feature flags to hide unfinished UI sections before store submission | - | - | - |
| #348 | Display build number below version number in Settings screen | - | - | - |
| #350 | Add feature flag to hide Apple Sign In | - | - | - |
| #352 | Investigate: 'Resend Verification Email' not visible in Settings despite correct logic | - | - | - |
| #353 | chore: upgrade Node.js 18 → 22 LTS | - | - | - |
| #354 | refactor: migrate Prisma → PowerSync + OP-SQLite (local-only) | - | - | - |
| #355 | feat: upgrade Expo SDK 51 → 55 | - | - | - |
| #357 | Modernize visual design — refresh colors, typography, and component styling | - | - | - |
| #359 | chore(docs): update dependency graph, tech debt tracker, and Claude settings | - | - | - |
| #361 | chore(docs): refresh dependency graph after sync-project | - | - | - |
| #363 | chore: uninstall speckit | - | - | - |
| #366 | feat: migrate feature flags to Firebase Remote Config | - | - | - |
| #367 | Add loading spinner while listing installed apps | - | - | - |
| #372 | Add prominent AccessibilityService disclosure screen for Google Play compliance | - | - | - |
| #375 | Match iOS time picker modal colors to app's design palette | - | - | - |
| #377 | refactor: migrate ConsentStorage from AsyncStorage to Prisma repository | - | - | - |
| #381 | Scope PowerSync local database by userId to prevent data leaks between users | - | - | - |
| #383 | chore(hooks): strengthen gh issue/PR validation hooks | - | - | - |
| #385 | fix(ui): improve layout and blur rendering across screens | - | - | - |
| #390 | refactor(infra): extract abstract PowersyncRepository base class | - | - | - |
| #397 | Investigate unstable selector memoization in useSelector calls | - | - | - |
| #399 | chore: remove dead expo-background-fetch code | - | - | - |
| #401 | Delete obsolete PouchDB and Prisma related code and dependencies | - | - | - |


### Features - Blocking Architecture (38)
| # | Title | SP | Depends On | Blocks |
|---|-------|----:|------------|--------|
| #5 | Implement BlockingScheduler with schedule storage | - | - | #8, #7, #6 |
| #6 | Add AlarmManager integration for start/end times | 🟠 5 | #5 | #7, #8, #9, #13 |
| #7 | Handle overnight sessions in BlockingScheduler | 🟢 3 | #5, #6 | #8 |
| #8 | Handle overlapping sessions - recalculate on window boundaries | 🟠 5 | #5, #6, #7 | #13 |
| #9 | Expose setBlockingSchedule() API to JS | 🟢 2 | #6 | #15, #18 |
| #10 | Extract AppTier abstraction from current blocking logic | 🟠 5 | - | #12 |
| #11 | Extract AppLookout abstraction from AccessibilityService logic | 🟢 3 | - | #12 |
| #12 | Add Noop interfaces for WebsiteTier, KeywordTier, WebsiteLookout, KeywordLookout | 🟢 2 | #10, #11 | - |
| #13 | Handle daily recurrence in scheduler | 🟢 3 | #6, #8 | #14 |
| #14 | Handle weekly recurrence in scheduler | 🟠 5 | #13 | - |
| #18 | Connect AccessibilityService to native blocking logic | 🟢 3 | #9 | - |
| #170 | fix(android): Blocking overlay never triggers - JS bridge architecture mismatch | 🔴 8 | - | - |
| #171 | feat(expo-accessibility-service): Add multiple listeners support | 🟢 3 | - | #173 |
| #172 | feat(expo-foreground-service): Add callback system via reflection | 🟢 3 | - | #173 |
| #173 | feat(tied-siren-blocking-overlay): Add BlockingCallback and SharedPreferences support | 🟠 5 | #171, #172 | - |
| #174 | feat(js): Add native blocking initialization and sync logic | - | - | - |
| #177 | Refactor SirenTier port to support sub-dependencies injection | 🟢 3 | - | #180, #181, #182, #183 |
| #178 | Refactor SirenLookout port to support sub-dependencies injection | 🟢 2 | - | #181, #183 |
| #179 | Create selectBlockingSchedule selector with fresh blocklist join | 🟠 5 | - | #180 |
| #180 | Create unified listener for blockSession and blocklist state changes | 🟠 5 | #177, #179 | #185, #208 |
| #181 | Create Noop implementations for future tiers and lookouts | 🟢 2 | #177, #178 | - |
| #182 | Update AndroidSirenTier to call setBlockingSchedule | 🟢 3 | #177 | #183, #184, #185 |
| #183 | Update dependency injection with new architecture | 🟢 2 | #177, #178, #182 | - |
| #184 | Deprecate JS detection path (blockLaunchedApp usecase) | 🟢 3 | #182 | #185 |
| #185 | Remove legacy updateBlockedApps calls and related code | 🟢 2 | #180, #182, #184 | - |
| #208 | feat(listener): Re-evaluate blocking schedule on periodic tick | 🟠 5 | #180 | - |
| #213 | Add confirmation modal before setting strict mode timer | 🟢 2 | - | - |
| #267 | feat(strict-mode): prevent siren deselection from blocklists during strict mode | - | - | - |
| #310 | fix(blocklist): simplify siren selection divider — remove labels, show only when needed | - | - | - |
| #314 | fix(block-session): blocking condition selection accumulates instead of replacing | - | - | - |
| #331 | chore: configure custom domain tiedsiren.app for Firebase Hosting | - | - | - |
| #374 | Add warning modal when selecting Settings app in blocklist siren selection | - | - | - |
| #391 | Auto-block Settings app when strict mode session starts | 🔵 1 | - | - |
| #392 | Detect and block navigation to TiedSiren uninstall screen via AccessibilityService | 🟢 3 | - | - |
| #393 | Harden foreground service with auto-restart and force-stop detection | 🟢 3 | - | - |
| #394 | Use monotonic clock for strict mode timer to prevent clock manipulation | 🟢 2 | - | - |
| #395 | Backup active strict mode session to cloud via PowerSync | 🟢 3 | - | - |
| #396 | Spike: Evaluate Device Admin API feasibility for Play Store compliance | 🔵 1 | - | - |


### Features - Authentication (6)
| # | Title | SP | Depends On | Blocks |
|---|-------|----:|------------|--------|
| #281 | feat(auth): change password | - | - | - |
| #282 | feat(auth): account deletion | - | - | - |
| #290 | refactor(auth): strip password from Redux serialization/logging | - | - | - |
| #298 | feat(auth): Google re-authentication for sensitive operations | - | - | - |
| #311 | fix(auth): align Confirm and Cancel buttons horizontally in reauthentication modal | - | - | - |
| #379 | fix(auth): Android back button returns to authenticated screen after logout | - | - | - |


---

## Overview Diagram

```mermaid
flowchart LR
    classDef initiative0_todo fill:#7c3aed,stroke:#7c3aed,color:#fff
    classDef initiative0_in_progress fill:#a97af9,stroke:#000,color:#fff,stroke-width:3px
    classDef initiative0_done fill:#626262,stroke:#626262,color:#666,stroke-dasharray:3
    classDef initiative1_todo fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef initiative1_in_progress fill:#bda0fe,stroke:#000,color:#fff,stroke-width:3px
    classDef initiative1_done fill:#7c7c7c,stroke:#626262,color:#666,stroke-dasharray:3
    classDef initiative2_todo fill:#a78bfa,stroke:#8b5cf6,color:#000
    classDef initiative2_in_progress fill:#c6b3ff,stroke:#000,color:#000,stroke-width:3px
    classDef initiative2_done fill:#a0a0a0,stroke:#7c7c7c,color:#666,stroke-dasharray:3
    classDef initiative3_todo fill:#c4b5fd,stroke:#a78bfa,color:#000
    classDef initiative3_in_progress fill:#c2b3ff,stroke:#000,color:#000,stroke-width:3px
    classDef initiative3_done fill:#c2c2c2,stroke:#a0a0a0,color:#666,stroke-dasharray:3
    classDef epic0_todo fill:#2563eb,stroke:#2563eb,color:#fff
    classDef epic0_in_progress fill:#6493f8,stroke:#000,color:#fff,stroke-width:3px
    classDef epic0_done fill:#606060,stroke:#606060,color:#666,stroke-dasharray:3
    classDef epic1_todo fill:#3b82f6,stroke:#2563eb,color:#fff
    classDef epic1_in_progress fill:#7fafff,stroke:#000,color:#fff,stroke-width:3px
    classDef epic1_done fill:#7a7a7a,stroke:#606060,color:#666,stroke-dasharray:3
    classDef epic2_todo fill:#60a5fa,stroke:#3b82f6,color:#000
    classDef epic2_in_progress fill:#a8cfff,stroke:#000,color:#000,stroke-width:3px
    classDef epic2_done fill:#9a9a9a,stroke:#7a7a7a,color:#666,stroke-dasharray:3
    classDef epic3_todo fill:#93c5fd,stroke:#60a5fa,color:#000
    classDef epic3_in_progress fill:#b3d7ff,stroke:#000,color:#000,stroke-width:3px
    classDef epic3_done fill:#bcbcbc,stroke:#9a9a9a,color:#666,stroke-dasharray:3
    classDef auth0_todo fill:#16a34a,stroke:#16a34a,color:#fff
    classDef auth0_in_progress fill:#1beb67,stroke:#000,color:#fff,stroke-width:3px
    classDef auth0_done fill:#6f6f6f,stroke:#6f6f6f,color:#666,stroke-dasharray:3
    classDef auth1_todo fill:#22c55e,stroke:#16a34a,color:#fff
    classDef auth1_in_progress fill:#4be885,stroke:#000,color:#fff,stroke-width:3px
    classDef auth1_done fill:#898989,stroke:#6f6f6f,color:#666,stroke-dasharray:3
    classDef auth2_todo fill:#4ade80,stroke:#22c55e,color:#000
    classDef auth2_in_progress fill:#86efac,stroke:#000,color:#000,stroke-width:3px
    classDef auth2_done fill:#a7a7a7,stroke:#898989,color:#666,stroke-dasharray:3
    classDef auth3_todo fill:#86efac,stroke:#4ade80,color:#000
    classDef auth3_in_progress fill:#b9f9d0,stroke:#000,color:#000,stroke-width:3px
    classDef auth3_done fill:#c8c8c8,stroke:#a7a7a7,color:#666,stroke-dasharray:3
    classDef blocking0_todo fill:#ea580c,stroke:#ea580c,color:#fff
    classDef blocking0_in_progress fill:#fe8444,stroke:#000,color:#fff,stroke-width:3px
    classDef blocking0_done fill:#7b7b7b,stroke:#7b7b7b,color:#666,stroke-dasharray:3
    classDef blocking1_todo fill:#f97316,stroke:#ea580c,color:#fff
    classDef blocking1_in_progress fill:#ff9f5d,stroke:#000,color:#fff,stroke-width:3px
    classDef blocking1_done fill:#909090,stroke:#7b7b7b,color:#666,stroke-dasharray:3
    classDef blocking2_todo fill:#fb923c,stroke:#f97316,color:#000
    classDef blocking2_in_progress fill:#ffbc84,stroke:#000,color:#000,stroke-width:3px
    classDef blocking2_done fill:#a8a8a8,stroke:#909090,color:#666,stroke-dasharray:3
    classDef blocking3_todo fill:#fdba74,stroke:#fb923c,color:#000
    classDef blocking3_in_progress fill:#ffdab3,stroke:#000,color:#000,stroke-width:3px
    classDef blocking3_done fill:#c6c6c6,stroke:#a8a8a8,color:#666,stroke-dasharray:3
    classDef bug0_todo fill:#dc2626,stroke:#dc2626,color:#fff
    classDef bug0_in_progress fill:#ed6262,stroke:#000,color:#fff,stroke-width:3px
    classDef bug0_done fill:#5c5c5c,stroke:#5c5c5c,color:#666,stroke-dasharray:3
    classDef bug1_todo fill:#ef4444,stroke:#dc2626,color:#fff
    classDef bug1_in_progress fill:#fa8585,stroke:#000,color:#fff,stroke-width:3px
    classDef bug1_done fill:#777777,stroke:#5c5c5c,color:#666,stroke-dasharray:3
    classDef bug2_todo fill:#f87171,stroke:#ef4444,color:#000
    classDef bug2_in_progress fill:#ffb3b3,stroke:#000,color:#000,stroke-width:3px
    classDef bug2_done fill:#999999,stroke:#777777,color:#666,stroke-dasharray:3
    classDef bug3_todo fill:#fca5a5,stroke:#f87171,color:#000
    classDef bug3_in_progress fill:#ffb3b3,stroke:#000,color:#000,stroke-width:3px
    classDef bug3_done fill:#bfbfbf,stroke:#999999,color:#666,stroke-dasharray:3
    classDef other0_todo fill:#4b5563,stroke:#4b5563,color:#fff
    classDef other0_in_progress fill:#6a7a90,stroke:#000,color:#fff,stroke-width:3px
    classDef other0_done fill:#545454,stroke:#545454,color:#666,stroke-dasharray:3
    classDef other1_todo fill:#6b7280,stroke:#4b5563,color:#fff
    classDef other1_in_progress fill:#9298a6,stroke:#000,color:#fff,stroke-width:3px
    classDef other1_done fill:#727272,stroke:#545454,color:#666,stroke-dasharray:3
    classDef other2_todo fill:#9ca3af,stroke:#6b7280,color:#000
    classDef other2_in_progress fill:#c6cad2,stroke:#000,color:#000,stroke-width:3px
    classDef other2_done fill:#a2a2a2,stroke:#727272,color:#666,stroke-dasharray:3
    classDef other3_todo fill:#d1d5db,stroke:#9ca3af,color:#000
    classDef other3_in_progress fill:#d4d8de,stroke:#000,color:#000,stroke-width:3px
    classDef other3_done fill:#d4d4d4,stroke:#a2a2a2,color:#666,stroke-dasharray:3

    subgraph Epics
        direction TB
        T_TS_389["📝 TS#389 Prevent app uninstall & bypass<br/>during strict mode sessions [13sp]"]:::epic0_todo
        T_TS_219["✅ TS#219 Native Blocking Layer [13sp]"]:::epic0_done
    end
    subgraph Epic_389["TS#389 Prevent app uninstall ..."]
        direction TB
        T_TS_397["📝 TS#397 unstable selector memoization<br/>in useSelector calls"]:::blocking0_todo
        T_TS_396["📝 TS#396 : Evaluate Device Admin API<br/>feasibility for Play Store<br/>compliance [1sp]"]:::blocking0_todo
        T_TS_395["📝 TS#395 active strict mode session to<br/>cloud via PowerSync [3sp]"]:::blocking0_todo
        T_TS_394["📝 TS#394 monotonic clock for strict<br/>mode timer to prevent clock<br/>manipulation [2sp]"]:::blocking0_todo
        T_TS_393["📝 TS#393 foreground service with<br/>auto-restart and force-stop<br/>detection [3sp]"]:::blocking0_todo
        T_TS_392["📝 TS#392 and block navigation to<br/>TiedSiren uninstall screen via<br/>AccessibilityService [3sp]"]:::blocking0_todo
        T_TS_391["📝 TS#391 -block Settings app when<br/>strict mode session starts [1sp]"]:::blocking0_todo
        T_TS_355["📝 TS#355 : upgrade Expo SDK 51 → 55"]:::blocking0_todo
    end
    subgraph Epic_219["TS#219 Native Blocking Layer"]
        direction TB
        T_TSBO_18["✅ TSBO#18 AccessibilityService to native<br/>blocking logic [3sp]"]:::blocking3_done
        T_TSBO_12["✅ TSBO#12 Noop interfaces for<br/>WebsiteTier, KeywordTier,<br/>WebsiteLookout, KeywordLookout [2sp]"]:::blocking1_done
        T_TSBO_11["✅ TSBO#11 AppLookout abstraction from<br/>AccessibilityService logic [3sp]"]:::blocking0_done
        T_TSBO_10["✅ TSBO#10 AppTier abstraction from<br/>current blocking logic [5sp]"]:::blocking0_done
        T_TSBO_9["✅ TSBO#9 setBlockingSchedule API to JS [2sp]"]:::blocking2_done
        T_TSBO_8["✅ TSBO#8 overlapping sessions -<br/>recalculate on window<br/>boundaries [5sp]"]:::blocking1_done
        T_TSBO_7["✅ TSBO#7 overnight sessions in<br/>BlockingScheduler [3sp]"]:::blocking1_done
        T_TSBO_6["✅ TSBO#6 AlarmManager integration for<br/>start/end times [5sp]"]:::blocking1_done
    end
    subgraph Ungrouped
        direction TB
        T_TS_401["✅ TS#401 obsolete PouchDB and Prisma<br/>related code and dependencies"]:::other0_done
        T_TS_399["✅ TS#399 : remove dead<br/>expo-background-fetch code"]:::other0_done
        T_TS_390["✅ TS#390 infra: extract abstract<br/>PowersyncRepository base class"]:::other0_done
        T_TS_385["✅ TS#385 ui: improve layout and blur<br/>rendering across screens"]:::other0_done
        T_TS_383["✅ TS#383 hooks: strengthen gh issue/PR<br/>validation hooks"]:::other0_done
        T_TS_381["✅ TS#381 PowerSync local database by<br/>userId to prevent data leaks<br/>between users"]:::auth0_done
        T_TS_379["✅ TS#379 auth: Android back button<br/>returns to authenticated<br/>screen after logout"]:::auth0_done
        T_TS_377["✅ TS#377 : migrate ConsentStorage from<br/>AsyncStorage to Prisma<br/>repository"]:::other0_done
        T_TS_375["✅ TS#375 iOS time picker modal colors<br/>to app's design palette"]:::other0_done
        T_TS_374["✅ TS#374 warning modal when selecting<br/>Settings app in blocklist<br/>siren selection"]:::blocking0_done
        T_TS_372["✅ TS#372 prominent AccessibilityService<br/>disclosure screen for Google<br/>Play compliance"]:::other0_done
        T_TS_367["✅ TS#367 loading spinner while listing<br/>installed apps"]:::other0_done
        T_TS_366["✅ TS#366 : migrate feature flags to<br/>Firebase Remote Config"]:::other0_done
        T_TS_363["✅ TS#363 : uninstall speckit"]:::other0_done
        T_TS_361["✅ TS#361 docs: refresh dependency graph<br/>after sync-project"]:::other0_done
        T_TS_359["✅ TS#359 docs: update dependency graph,<br/>tech debt tracker, and Claude<br/>settings"]:::other0_done
        T_TS_357["✅ TS#357 visual design — refresh<br/>colors, typography, and<br/>component styling"]:::auth0_done
        T_TS_354["✅ TS#354 : migrate Prisma → PowerSync +<br/>OP-SQLite local-only"]:::other0_done
        T_TS_353["✅ TS#353 : upgrade Node.js 18 → 22 LTS"]:::other0_done
        T_TS_352["✅ TS#352 : 'Resend Verification Email'<br/>not visible in Settings<br/>despite correct logic"]:::other0_done
        T_TS_350["✅ TS#350 feature flag to hide Apple<br/>Sign In"]:::other0_done
        T_TS_348["✅ TS#348 build number below version<br/>number in Settings screen"]:::other0_done
        T_TS_338["✅ TS#338 pre-commit guard against<br/>merged branches and fix eslint<br/>comments"]:::other0_done
        T_TS_336["✅ TS#336 generic variables flagged by<br/>no-lame-naming and promote to<br/>error"]:::other0_done
        T_TS_329["✅ TS#329 Settings screen with grouped<br/>sections layout"]:::other0_done
        T_TS_322["✅ TS#322 : trigger build job when PR is<br/>marked as ready for review"]:::other0_done
        T_TS_316["✅ TS#316 : split /start-issue into<br/>/prepare-worktree and<br/>/start-issue"]:::other0_done
        T_TS_314["✅ TS#314 block-session: blocking<br/>condition selection<br/>accumulates instead of repl..."]:::blocking0_done
        T_TS_313["✅ TS#313 block-session: time picker<br/>modal blinks and requires<br/>double selection on Android"]:::other0_done
        T_TS_312["✅ TS#312 block-session: auto-focus name<br/>input and use proper<br/>placeholder in ChooseName m..."]:::other0_done
        T_TS_311["✅ TS#311 auth: align Confirm and Cancel<br/>buttons horizontally in<br/>reauthentication modal"]:::auth0_done
        T_TS_310["✅ TS#310 blocklist: simplify siren<br/>selection divider — remove<br/>labels, show only when needed"]:::blocking0_done
        T_TS_304["✅ TS#304 ci: retro workflow fails<br/>because claude-code-action<br/>doesn't expand custom slash..."]:::other0_done
        T_TS_292["✅ TS#292 : make start-issue.sh work<br/>from any worktree context"]:::other0_done
        T_TS_291["✅ TS#291 ci: auto-generate review<br/>retrospective on PR merge and<br/>post to Slack"]:::other0_done
        T_TS_289["✅ TS#289 : promote<br/>prefer-extracted-long-params<br/>ESLint rule from warn to error"]:::other0_done
        T_TS_288["✅ TS#288 : promote<br/>no-inline-object-type ESLint<br/>rule from warn to error"]:::other0_done
        T_TS_287["✅ TS#287 : promote require-typed-each<br/>ESLint rule from warn to error"]:::other0_done
        T_TS_276["📝 TS#276 from ESLint to OxLint"]:::other0_todo
        T_TS_270["✅ TS#270 : add review-fix command,<br/>enhance start-issue with issue<br/>content, and add branch hyg..."]:::other0_done
        T_TS_268["✅ TS#268 strict-mode: show closed lock<br/>icon in tab bar when strict<br/>mode is active"]:::blocking0_done
        T_TS_267["✅ TS#267 strict-mode: prevent siren<br/>deselection from blocklists<br/>during strict mode"]:::blocking0_done
        T_TS_260["✅ TS#260 ui: redesign time picker with<br/>consistent design system<br/>primitives"]:::other0_done
        T_TS_258["✅ TS#258 : enforce stricter-only<br/>editing of block sessions<br/>during strict mode"]:::blocking0_done
        T_TS_257["✅ TS#257 100% code coverage for custom<br/>ESLint rules"]:::other0_done
        T_TS_252["✅ TS#252 CLAUDE.md using progressive<br/>disclosure"]:::other0_done
        T_TS_250["✅ TS#250 FlatList scroll cutoff on<br/>selection scenes"]:::other0_done
        T_TS_248["✅ TS#248 initial delay to CI watch<br/>before polling"]:::other0_done
        T_TS_246["✅ TS#246 expo-list-installed-apps to<br/>include launcher apps fix"]:::other0_done
        T_TS_243["✅ TS#243 : git pull triggers CI watch<br/>incorrectly"]:::other0_done
        T_TS_233["✅ TS#233 : Add fine-grained git<br/>checkout permissions to Claude<br/>settings"]:::other0_done
        T_TS_229["✅ TS#229 claude: add PreToolUse hook to<br/>block --no-verify in git push<br/>commands"]:::other0_done
        T_TS_202["✅ TS#202 "]:::other0_done
        T_TS_199["✅ TS#199 blocklist: add confirmation<br/>modal when deleting blocklist<br/>used in active sessions"]:::blocking0_done
        T_TS_181["✅ TS#181 Noop implementations for<br/>future tiers and lookouts [2sp]"]:::blocking1_done
        T_TS_180["✅ TS#180 unified listener for<br/>blockSession and blocklist<br/>state changes [5sp]"]:::blocking1_done
        T_TS_179["✅ TS#179 selectBlockingSchedule<br/>selector with fresh blocklist<br/>join [5sp]"]:::blocking0_done
        T_TS_178["✅ TS#178 SirenLookout port to support<br/>sub-dependencies injection [2sp]"]:::blocking0_done
        T_TS_177["✅ TS#177 SirenTier port to support<br/>sub-dependencies injection [3sp]"]:::blocking0_done
        T_TS_174["✅ TS#174 js: Add native blocking<br/>initialization and sync logic"]:::blocking0_done
        T_TS_173["✅ TS#173 tied-siren-blocking-overlay:<br/>Add BlockingCallback and<br/>SharedPreferences support [5sp]"]:::blocking1_done
        T_TS_172["✅ TS#172 expo-foreground-service: Add<br/>callback system via reflection [3sp]"]:::blocking0_done
        T_TS_171["✅ TS#171 expo-accessibility-service:<br/>Add multiple listeners support [3sp]"]:::blocking0_done
        T_EFS_4["✅ EFS#4 for this module and request<br/>for tutorial or guide"]:::blocking0_done
        T_TSBO_5["✅ TSBO#5 BlockingScheduler with<br/>schedule storage"]:::blocking0_done
        T_ELIA_10["✅ ELIA#10 : Add uniqueBy option to<br/>deduplicate apps by package or<br/>activity"]:::other0_done
        T_ELIA_1["📝 ELIA#1 ability to filter between<br/>system apps and user-installed<br/>apps on Android"]:::other0_todo
        T_TS_342["✅ TS#342 : add feature flags to hide<br/>unfinished UI sections before<br/>store submission"]:::other0_done
        T_TS_340["✅ TS#340 OpacityPressable across<br/>codebase to replace inline<br/>opacity pattern"]:::other0_done
        T_TS_335["✅ TS#335 : auto-verify email via deep<br/>link instead of manual refresh"]:::auth0_done
        T_TS_334["✅ TS#334 : redesign strict mode timer<br/>with wheel picker component"]:::blocking0_done
        T_TS_333["✅ TS#333 : local Prisma database not<br/>scoped per user — data leaks<br/>between accounts"]:::bug0_done
        T_TS_331["🔄 TS#331 : configure custom domain<br/>tiedsiren.app for Firebase<br/>Hosting"]:::blocking0_in_progress
        T_TS_330["📝 TS#330 : configure iOS Universal<br/>Links for deep linking"]:::other0_todo
        T_TS_328["✅ TS#328 : Android time picker dark<br/>mode text colors inner clock<br/>numbers & buttons"]:::other0_done
        T_TS_300["✅ TS#300 scripts: automate board sync<br/>in sync-project-data.sh"]:::other0_done
        T_TS_299["📝 TS#299 : add pre-merge-commit Husky<br/>hook for squash-merge safety<br/>gate"]:::other0_todo
        T_TS_298["✅ TS#298 auth: Google re-authentication<br/>for sensitive operations"]:::auth0_done
        T_TS_290["✅ TS#290 auth: strip password from<br/>Redux serialization/logging"]:::auth0_done
        T_TS_282["✅ TS#282 auth: account deletion"]:::auth0_done
        T_TS_281["✅ TS#281 auth: change password"]:::auth0_done
        T_TS_278["✅ TS#278 : Extract BlocklistForm view<br/>model selector"]:::other0_done
        T_TS_272["✅ TS#272 selected apps at top of<br/>blocklist screen"]:::other0_done
        T_TS_264["📝 TS#264 : Add caching for installed<br/>apps list"]:::other0_todo
        T_TS_255["✅ TS#255 strict-mode: disable edit and<br/>delete actions on sessions and<br/>blocklists during strict mode"]:::blocking0_done
        T_TS_213["✅ TS#213 confirmation modal before<br/>setting strict mode timer [2sp]"]:::blocking0_done
        T_TS_208["✅ TS#208 listener: Re-evaluate blocking<br/>schedule on periodic tick [5sp]"]:::blocking2_done
        T_TS_201["✅ TS#201 BlockSession to store<br/>blocklist IDs instead of<br/>embedded blocklists [5sp]"]:::other0_done
        T_TS_200["✅ TS#200 strict-mode: block blocklist<br/>deletion during active strict<br/>mode sessions"]:::blocking0_done
        T_TS_185["✅ TS#185 legacy updateBlockedApps calls<br/>and related code [2sp]"]:::blocking2_done
        T_TS_184["✅ TS#184 JS detection path<br/>blockLaunchedApp usecase [3sp]"]:::blocking2_done
        T_TS_183["✅ TS#183 dependency injection with new<br/>architecture [2sp]"]:::blocking1_done
        T_TS_182["✅ TS#182 AndroidSirenTier to call<br/>setBlockingSchedule [3sp]"]:::blocking1_done
        T_TS_170["✅ TS#170 android: Blocking overlay<br/>never triggers - JS bridge<br/>architecture mismatch [8sp]"]:::blocking0_done
        T_TSBO_14["✅ TSBO#14 weekly recurrence in scheduler [5sp]"]:::blocking3_done
        T_TSBO_13["✅ TSBO#13 daily recurrence in scheduler [3sp]"]:::blocking2_done
    end

    T_TS_180 --> T_TS_208
    T_TS_180 --> T_TS_185
    T_TS_182 --> T_TS_185
    T_TS_184 --> T_TS_185
    T_TS_182 --> T_TS_184
    T_TS_177 --> T_TS_183
    T_TS_178 --> T_TS_183
    T_TS_182 --> T_TS_183
    T_TS_177 --> T_TS_182
    T_TS_177 --> T_TS_181
    T_TS_178 --> T_TS_181
    T_TS_177 --> T_TS_180
    T_TS_179 --> T_TS_180
    T_TS_171 --> T_TS_173
    T_TS_172 --> T_TS_173
    T_TSBO_9 --> T_TSBO_18
    T_TSBO_13 --> T_TSBO_14
    T_TSBO_10 --> T_TSBO_12
    T_TSBO_11 --> T_TSBO_12
    T_TSBO_6 --> T_TSBO_9
    T_TSBO_6 --> T_TSBO_8
    T_TSBO_7 --> T_TSBO_8
    T_TSBO_6 --> T_TSBO_7
```

---

## Dependency Matrix

Quick reference showing what blocks what:

| Blocker | Blocks These Issues |
|---------|---------------------|
| TSBO#5 | #8, #7, #6 |
| TSBO#6 | #7, #8, #9, #13 |
| TSBO#7 | #8 |
| TSBO#8 | #13 |
| TSBO#9 | #15, #18 |
| TSBO#10 | #12 |
| TSBO#11 | #12 |
| TSBO#13 | #14 |
| #171 | #173 |
| #172 | #173 |
| #177 | #180, #181, #182, #183 |
| #178 | #181, #183 |
| #179 | #180 |
| #180 | #185, #208 |
| #182 | #183, #184, #185 |
| #184 | #185 |


---

## Valid Repositories

| Repo | URL |
|------|-----|
| TiedSiren51 | https://github.com/amehmeto/TiedSiren51 |
| expo-accessibility-service | https://github.com/amehmeto/expo-accessibility-service |
| expo-foreground-service | https://github.com/amehmeto/expo-foreground-service |
| tied-siren-blocking-overlay | https://github.com/amehmeto/tied-siren-blocking-overlay |
| expo-list-installed-apps | https://github.com/amehmeto/expo-list-installed-apps |

---

## Legend

- **Solid arrows (`-->`)**: Direct dependency (must complete first)
- **Initiatives (I)**: Strategic goals
- **Epics (E)**: Large features with multiple stories
- **Features (F)**: Individual stories/tasks
- **Subgraphs**: Logical groupings

### Status

| Emoji | Status | Style |
|-------|--------|-------|
| ✅ | Done | Grayscale, dashed border |
| 🔄 | In Progress | Bright, thick border |
| 📝 | To Do | Normal colors |

### Story Points

| Points | Color |
|-------:|-------|
| 1 | 🔵 Blue |
| 2-3 | 🟢 Green |
| 5 | 🟠 Orange |
| 8+ | 🔴 Red |

---

*Auto-generated on 2026-02-25 from GitHub issue metadata*
