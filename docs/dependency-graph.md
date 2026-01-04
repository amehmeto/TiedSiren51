# Ticket Dependency Graph

This document visualizes the dependencies between GitHub issues to help with planning and prioritization.

> **Auto-generated** from GitHub issue metadata. Do not edit manually.
> Last updated: 2026-01-04

## Complete Ticket Inventory

### Initiatives (6)
| # | Title | SP | Depends On | Blocks |
|---|-------|----:|------------|--------|
| #62 | [Initiative] Launch Android App | - | - | #63, #64, #65, #66, #67 |
| #63 | [Initiative] Launch iOS App | - | #62 | #64 |
| #64 | [Initiative] Multi device sync | - | #62, #63 | - |
| #65 | [Initiative] Launch MacOS desktop App | - | #62 | - |
| #66 | [Initiative] Launch Windows desktop App | - | #62 | - |
| #67 | [Initiative] Goal based locking/unlocking | - | #62 | - |


### Epics (7)
| # | Title | SP | Depends On | Blocks |
|---|-------|----:|------------|--------|
| #54 | [Epic] User Authentification | 🔴 21 | - | - |
| #55 | [Epic] Blocking Apps on Android | 🔴 13 | - | #57, #58, #59, #61 |
| #57 | [Epic] Strict Mode | 🔴 8 | #55 | - |
| #58 | [Epic] Block websites on Android | - | #55 | #59 |
| #59 | [Epic] Blocking keywords on Android | - | #55, #58 | - |
| #60 | [Epic] Polish design | - | - | - |
| #61 | [Epic] Schedule recurring block sessions | - | #55 | - |


### Features - Other (10)
| # | Title | SP | Depends On | Blocks |
|---|-------|----:|------------|--------|
| #1 | Add ability to filter between system apps and user-installed apps on Android | - | - | - |
| #6 | Add AlarmManager integration for start/end times | - | - | - |
| #8 | Handle overlapping sessions - recalculate on window boundaries | - | - | - |
| #11 | Extract AppLookout abstraction from AccessibilityService logic | - | - | - |
| #12 | Add Noop interfaces for WebsiteTier, KeywordTier, WebsiteLookout, KeywordLookout | - | - | - |
| #13 | Handle daily recurrence in scheduler | - | - | - |
| #14 | Handle weekly recurrence in scheduler | - | - | - |
| #199 | feat(blocklist): add confirmation modal when deleting blocklist used in active sessions | - | - | - |
| #200 | feat(strict-mode): block blocklist deletion during active strict mode sessions | - | - | - |
| #201 | Refactor BlockSession to store blocklist IDs instead of embedded blocklists | 🟠 5 | - | - |


### Features - Blocking Architecture (10)
| # | Title | SP | Depends On | Blocks |
|---|-------|----:|------------|--------|
| #5 | Implement BlockingScheduler with schedule storage | - | - | - |
| #7 | Handle overnight sessions in BlockingScheduler | - | - | - |
| #9 | Expose setBlockingSchedule() API to JS | - | - | - |
| #10 | Extract AppTier abstraction from current blocking logic | - | - | - |
| #170 | fix(android): Blocking overlay never triggers - JS bridge architecture mismatch | 🔴 8 | - | - |
| #180 | Create unified listener for blockSession and blocklist state changes | 🟠 5 | #177, #179 | #185 |
| #182 | Update AndroidSirenTier to call setBlockingSchedule | 🟢 3 | #177 | #183, #184, #185 |
| #183 | Update dependency injection with new architecture | 🟢 2 | #177, #178, #182 | - |
| #184 | Deprecate JS detection path (blockLaunchedApp usecase) | 🟢 3 | #182 | #185 |
| #185 | Remove legacy updateBlockedApps calls and related code | 🟢 2 | #180, #182, #184 | - |


### Features - Authentication (12)
| # | Title | SP | Depends On | Blocks |
|---|-------|----:|------------|--------|
| #88 | Implement Apple Sign-In with Firebase | 🟢 3 | - | - |
| #89 | Add Authentication Error Handling | 🟢 3 | - | - |
| #160 | feat(auth): custom in-app password reset confirmation flow | 🟠 5 | - | #166 |
| #161 | feat(auth): implement email verification flow | 🟢 3 | - | - |
| #162 | feat(auth): change password when logged in | 🟢 2 | #164 | - |
| #163 | feat(auth): account deletion (GDPR compliance) | 🟠 5 | #164 | - |
| #164 | feat(auth): re-authentication for sensitive operations | 🟢 2 | - | #162, #163 |
| #165 | feat(auth): resend password reset email | 🔵 1 | - | - |
| #166 | feat(auth): invalidate sessions after password reset | 🟢 3 | #160 | - |
| #167 | feat(auth): brute force protection on login | 🟢 2 | - | - |
| #168 | feat(auth): security notification emails | 🟢 3 | - | - |
| #169 | feat(auth): deep link to email app after signup | 🟢 2 | - | - |


---

## Overview Diagram

```mermaid
flowchart LR
    classDef initiative0 fill:#7c3aed,stroke:#7c3aed,color:#fff
    classDef initiative1 fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef initiative2 fill:#a78bfa,stroke:#8b5cf6,color:#000
    classDef epic0 fill:#2563eb,stroke:#2563eb,color:#fff
    classDef epic1 fill:#3b82f6,stroke:#2563eb,color:#fff
    classDef epic2 fill:#60a5fa,stroke:#3b82f6,color:#000
    classDef auth0 fill:#16a34a,stroke:#16a34a,color:#fff
    classDef auth1 fill:#22c55e,stroke:#16a34a,color:#fff
    classDef auth2 fill:#4ade80,stroke:#22c55e,color:#000
    classDef blocking0 fill:#ea580c,stroke:#ea580c,color:#fff
    classDef blocking1 fill:#f97316,stroke:#ea580c,color:#fff
    classDef blocking2 fill:#fb923c,stroke:#f97316,color:#000
    classDef bug0 fill:#dc2626,stroke:#dc2626,color:#fff
    classDef bug1 fill:#ef4444,stroke:#dc2626,color:#fff
    classDef bug2 fill:#f87171,stroke:#ef4444,color:#000
    classDef other0 fill:#4b5563,stroke:#4b5563,color:#fff
    classDef other1 fill:#6b7280,stroke:#4b5563,color:#fff
    classDef other2 fill:#9ca3af,stroke:#6b7280,color:#000

    subgraph Initiatives
        direction TB
        T_TS_67["#67 Goal based locking/unlocking"]:::initiative1
        T_TS_66["#66 Launch Windows desktop App"]:::initiative1
        T_TS_65["#65 Launch MacOS desktop App"]:::initiative1
        T_TS_64["#64 Multi device sync"]:::initiative2
        T_TS_63["#63 Launch iOS App"]:::initiative1
        T_TS_62["#62 Launch Android App"]:::initiative0
    end
    subgraph Epics
        direction TB
        T_TS_61["#61 Schedule recurring block sessi..."]:::epic1
        T_TS_60["#60 Polish design"]:::epic0
        T_TS_59["#59 Blocking keywords on Android"]:::epic2
        T_TS_58["#58 Block websites on Android"]:::epic1
        T_TS_57["#57 Strict Mode <span style='color:#ef4444'>8pts</span>"]:::epic1
        T_TS_55["#55 Blocking Apps on Android <span style='color:#ef4444'>13pts</span>"]:::epic0
        T_TS_54["#54 User Authentification <span style='color:#ef4444'>21pts</span>"]:::epic0
    end
    subgraph Blocking
        direction TB
        T_TS_185["#185 legacy updateBlockedApps calls... <span style='color:#22c55e'>2pts</span>"]:::blocking2
        T_TS_184["#184 JS detection path blockLaunche... <span style='color:#22c55e'>3pts</span>"]:::blocking1
        T_TS_183["#183 dependency injection with new ... <span style='color:#22c55e'>2pts</span>"]:::blocking1
        T_TS_182["#182 AndroidSirenTier to call setBl... <span style='color:#22c55e'>3pts</span>"]:::blocking0
        T_TS_180["#180 unified listener for blockSess... <span style='color:#f97316'>5pts</span>"]:::blocking0
        T_TS_170["#170 android: Blocking overlay neve... <span style='color:#ef4444'>8pts</span>"]:::blocking0
        T_TSBO_12["TSBO#12 Noop interfaces for WebsiteTie...<br/>📦 TSBO"]:::blocking0
        T_TSBO_11["TSBO#11 AppLookout abstraction from Ac...<br/>📦 TSBO"]:::blocking0
        T_TSBO_10["TSBO#10 AppTier abstraction from curre...<br/>📦 TSBO"]:::blocking0
        T_TSBO_9["TSBO#9 setBlockingSchedule API to JS<br/>📦 TSBO"]:::blocking0
        T_TSBO_7["TSBO#7 overnight sessions in Blocking...<br/>📦 TSBO"]:::blocking0
        T_TSBO_5["TSBO#5 BlockingScheduler with schedul...<br/>📦 TSBO"]:::blocking0
    end
    subgraph Authentication
        direction TB
        T_TS_169["#169 auth: deep link to email app a... <span style='color:#22c55e'>2pts</span>"]:::auth0
        T_TS_168["#168 auth: security notification em... <span style='color:#22c55e'>3pts</span>"]:::auth0
        T_TS_167["#167 auth: brute force protection o... <span style='color:#22c55e'>2pts</span>"]:::auth0
        T_TS_166["#166 auth: invalidate sessions afte... <span style='color:#22c55e'>3pts</span>"]:::auth1
        T_TS_165["#165 auth: resend password reset em... <span style='color:#3b82f6'>1pt</span>"]:::auth0
        T_TS_164["#164 auth: re-authentication for se... <span style='color:#22c55e'>2pts</span>"]:::auth0
        T_TS_163["#163 auth: account deletion GDPR co... <span style='color:#f97316'>5pts</span>"]:::auth1
        T_TS_162["#162 auth: change password when log... <span style='color:#22c55e'>2pts</span>"]:::auth1
        T_TS_161["#161 auth: implement email verifica... <span style='color:#22c55e'>3pts</span>"]:::auth0
        T_TS_160["#160 auth: custom in-app password r... <span style='color:#f97316'>5pts</span>"]:::auth0
        T_TS_89["#89 Authentication Error Handling <span style='color:#22c55e'>3pts</span>"]:::auth0
        T_TS_88["#88 Apple Sign-In with Firebase <span style='color:#22c55e'>3pts</span>"]:::auth0
    end
    subgraph Other
        direction TB
        T_TS_201["#201 BlockSession to store blocklis... <span style='color:#f97316'>5pts</span>"]:::other0
        T_TS_200["#200 strict-mode: block blocklist d..."]:::other0
        T_TS_199["#199 blocklist: add confirmation mo..."]:::other0
        T_TSBO_14["TSBO#14 weekly recurrence in scheduler<br/>📦 TSBO"]:::other0
        T_TSBO_13["TSBO#13 daily recurrence in scheduler<br/>📦 TSBO"]:::other0
        T_TSBO_8["TSBO#8 overlapping sessions - recalcu...<br/>📦 TSBO"]:::other0
        T_TSBO_6["TSBO#6 AlarmManager integration for s...<br/>📦 TSBO"]:::other0
        T_ELA_1["ELA#1 ability to filter between syst...<br/>📦 ELA"]:::other0
    end
    T_TS_177["TS#177<br/>📦 TS"]:::other0
    T_TS_178["TS#178<br/>📦 TS"]:::other0
    T_TS_179["TS#179<br/>📦 TS"]:::other0

    T_TS_180 --> T_TS_185
    T_TS_182 --> T_TS_185
    T_TS_184 --> T_TS_185
    T_TS_182 --> T_TS_184
    T_TS_177 -.-> T_TS_183
    T_TS_178 -.-> T_TS_183
    T_TS_182 --> T_TS_183
    T_TS_177 -.-> T_TS_182
    T_TS_177 -.-> T_TS_180
    T_TS_179 -.-> T_TS_180
    T_TS_160 --> T_TS_166
    T_TS_164 --> T_TS_163
    T_TS_164 --> T_TS_162
    T_TS_62 --> T_TS_67
    T_TS_62 --> T_TS_66
    T_TS_62 --> T_TS_65
    T_TS_62 --> T_TS_64
    T_TS_63 --> T_TS_64
    T_TS_62 --> T_TS_63
    T_TS_55 --> T_TS_61
    T_TS_55 --> T_TS_59
    T_TS_58 --> T_TS_59
    T_TS_55 --> T_TS_58
    T_TS_55 --> T_TS_57
```


### Features: Blocking Architecture

```mermaid
flowchart TD
    F_TSBO_5["TSBO#5 Implement BlockingSchedul..."]
    F_TSBO_7["TSBO#7 Handle overnight sessions..."]
    F_TSBO_9["TSBO#9 Expose setBlockingSchedul..."]
    F_TSBO_10["TSBO#10 Extract AppTier abstracti..."]
    F_TS_170["#170 fix(android): Blocking ov... <span style='color:#ef4444'>8pts</span>"]
    F_TS_180["#180 Create unified listener f... <span style='color:#f97316'>5pts</span>"]
    F_TS_182["#182 Update AndroidSirenTier t... <span style='color:#22c55e'>3pts</span>"]
    F_TS_183["#183 Update dependency injecti... <span style='color:#22c55e'>2pts</span>"]
    F_TS_184["#184 Deprecate JS detection pa... <span style='color:#22c55e'>3pts</span>"]
    F_TS_185["#185 Remove legacy updateBlock... <span style='color:#22c55e'>2pts</span>"]

    F_TS_182 --> F_TS_183
    F_TS_182 --> F_TS_184
    F_TS_180 --> F_TS_185
    F_TS_182 --> F_TS_185
    F_TS_184 --> F_TS_185
```


### Features: Authentication

```mermaid
flowchart TD
    F_TS_88["#88 Implement Apple Sign-In w... <span style='color:#22c55e'>3pts</span>"]
    F_TS_89["#89 Add Authentication Error ... <span style='color:#22c55e'>3pts</span>"]
    F_TS_160["#160 feat(auth): custom in-app... <span style='color:#f97316'>5pts</span>"]
    F_TS_161["#161 feat(auth): implement ema... <span style='color:#22c55e'>3pts</span>"]
    F_TS_162["#162 feat(auth): change passwo... <span style='color:#22c55e'>2pts</span>"]
    F_TS_163["#163 feat(auth): account delet... <span style='color:#f97316'>5pts</span>"]
    F_TS_164["#164 feat(auth): re-authentica... <span style='color:#22c55e'>2pts</span>"]
    F_TS_165["#165 feat(auth): resend passwo... <span style='color:#3b82f6'>1pt</span>"]
    F_TS_166["#166 feat(auth): invalidate se... <span style='color:#22c55e'>3pts</span>"]
    F_TS_167["#167 feat(auth): brute force p... <span style='color:#22c55e'>2pts</span>"]
    F_TS_168["#168 feat(auth): security noti... <span style='color:#22c55e'>3pts</span>"]
    F_TS_169["#169 feat(auth): deep link to ... <span style='color:#22c55e'>2pts</span>"]

    F_TS_164 --> F_TS_162
    F_TS_164 --> F_TS_163
    F_TS_160 --> F_TS_166
```

---

## Dependency Matrix

Quick reference showing what blocks what:

| Blocker | Blocks These Issues |
|---------|---------------------|
| #55 | #57, #58, #59, #61 |
| #58 | #59 |
| #62 | #63, #64, #65, #66, #67 |
| #63 | #64 |
| #160 | #166 |
| #164 | #162, #163 |
| #180 | #185 |
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

### Story Points

| Points | Color |
|-------:|-------|
| 1 | 🔵 Blue |
| 2-3 | 🟢 Green |
| 5 | 🟠 Orange |
| 8+ | 🔴 Red |

---

*Auto-generated on 2026-01-04 from GitHub issue metadata*
