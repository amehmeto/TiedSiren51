# Ticket Dependency Graph

This document visualizes the dependencies between GitHub issues to help with planning and prioritization.

> **Auto-generated** from GitHub issue metadata. Do not edit manually.
> Last updated: 2025-12-29

## Complete Ticket Inventory

### Initiatives (6)
| # | Title | Depends On | Blocks |
|---|-------|------------|--------|
| #62 | [Initiative] Launch Android App | - | #63, #64, #65, #66, #67 |
| #63 | [Initiative] Launch iOS App | #62 | #64 |
| #64 | [Initiative] Multi device sync | #62, #63 | - |
| #65 | [Initiative] Launch MacOS desktop App | #62 | - |
| #66 | [Initiative] Launch Windows desktop App | #62 | - |
| #67 | [Initiative] Goal based locking/unlocking | #62 | - |


### Epics (7)
| # | Title | Depends On | Blocks |
|---|-------|------------|--------|
| #54 | [Epic] User Authentification | - | - |
| #55 | [Epic] Blocking Apps on Android | - | #57, #58, #59, #61 |
| #57 | [Epic] Strict Mode | #55 | - |
| #58 | [Epic] Block websites on Android | #55 | #59 |
| #59 | [Epic] Blocking keywords on Android | #55, #58 | - |
| #60 | [Epic] Polish design | - | - |
| #61 | [Epic] Schedule recurring block sessions | #55 | - |


### Features - Authentication (12)
| # | Title | Depends On | Blocks |
|---|-------|------------|--------|
| #88 | Implement Apple Sign-In with Firebase | - | - |
| #89 | Add Authentication Error Handling | - | - |
| #160 | feat(auth): custom in-app password reset confirmation flow | - | #166 |
| #161 | feat(auth): implement email verification flow | - | - |
| #162 | feat(auth): change password when logged in | #164 | - |
| #163 | feat(auth): account deletion (GDPR compliance) | #164 | - |
| #164 | feat(auth): re-authentication for sensitive operations | - | #162, #163 |
| #165 | feat(auth): resend password reset email | - | - |
| #166 | feat(auth): invalidate sessions after password reset | #160 | - |
| #167 | feat(auth): brute force protection on login | - | - |
| #168 | feat(auth): security notification emails | - | - |
| #169 | feat(auth): deep link to email app after signup | - | - |


### Features - Other (1)
| # | Title | Depends On | Blocks |
|---|-------|------------|--------|
| #96 | Setup Phase - Guided Permission Setup - 3sp | - | - |


### Features - Blocking Architecture (13)
| # | Title | Depends On | Blocks |
|---|-------|------------|--------|
| #170 | fix(android): Blocking overlay never triggers - JS bridge architecture mismatch | - | - |
| #171 | feat(expo-accessibility-service): Add multiple listeners support | - | #173 |
| #172 | feat(expo-foreground-service): Add callback system via reflection | - | #173 |
| #173 | feat(tied-siren-blocking-overlay): Add BlockingCallback and SharedPreferences support | #171, #172 | - |
| #177 | Refactor SirenTier port to support sub-dependencies injection | - | #180, #181, #182, #183 |
| #178 | Refactor SirenLookout port to support sub-dependencies injection | - | #181, #183 |
| #179 | Create selectBlockingSchedule selector with fresh blocklist join | - | #180 |
| #180 | Create unified listener for blockSession and blocklist state changes | #177, #179 | #185 |
| #181 | Create Noop implementations for future tiers and lookouts | #177, #178 | - |
| #182 | Update AndroidSirenTier to call setBlockingSchedule | #177 | #183, #184, #185 |
| #183 | Update dependency injection with new architecture | #177, #178, #182 | - |
| #184 | Deprecate JS detection path (blockLaunchedApp usecase) | #182 | #185 |
| #185 | Remove legacy updateBlockedApps calls and related code | #180, #182, #184 | - |


---

## Overview Diagram

```mermaid
flowchart LR
    classDef initiative0 fill:#7c3aed,stroke:#7c3aed,color:#fff
    classDef initiative1 fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef initiative2 fill:#a78bfa,stroke:#8b5cf6,color:#000
    classDef initiative3 fill:#c4b5fd,stroke:#a78bfa,color:#000
    classDef epic0 fill:#2563eb,stroke:#2563eb,color:#fff
    classDef epic1 fill:#3b82f6,stroke:#2563eb,color:#fff
    classDef epic2 fill:#60a5fa,stroke:#3b82f6,color:#000
    classDef epic3 fill:#93c5fd,stroke:#60a5fa,color:#000
    classDef auth0 fill:#16a34a,stroke:#16a34a,color:#fff
    classDef auth1 fill:#22c55e,stroke:#16a34a,color:#fff
    classDef auth2 fill:#4ade80,stroke:#22c55e,color:#000
    classDef auth3 fill:#86efac,stroke:#4ade80,color:#000
    classDef blocking0 fill:#ea580c,stroke:#ea580c,color:#fff
    classDef blocking1 fill:#f97316,stroke:#ea580c,color:#fff
    classDef blocking2 fill:#fb923c,stroke:#f97316,color:#000
    classDef blocking3 fill:#fdba74,stroke:#fb923c,color:#000
    classDef bug0 fill:#dc2626,stroke:#dc2626,color:#fff
    classDef bug1 fill:#ef4444,stroke:#dc2626,color:#fff
    classDef bug2 fill:#f87171,stroke:#ef4444,color:#000
    classDef bug3 fill:#fca5a5,stroke:#f87171,color:#000
    classDef other0 fill:#4b5563,stroke:#4b5563,color:#fff
    classDef other1 fill:#6b7280,stroke:#4b5563,color:#fff
    classDef other2 fill:#9ca3af,stroke:#6b7280,color:#000
    classDef other3 fill:#d1d5db,stroke:#9ca3af,color:#000

    subgraph Initiatives
        direction TB
        T67["#67 Goal based locking/unlocking"]:::initiative1
        T66["#66 Launch Windows desktop App"]:::initiative1
        T65["#65 Launch MacOS desktop App"]:::initiative1
        T64["#64 Multi device sync"]:::initiative2
        T63["#63 Launch iOS App"]:::initiative1
        T62["#62 Launch Android App"]:::initiative0
    end
    subgraph Epics
        direction TB
        T61["#61 Schedule recurring block sessi..."]:::epic1
        T60["#60 Polish design"]:::epic0
        T59["#59 Blocking keywords on Android"]:::epic2
        T58["#58 Block websites on Android"]:::epic1
        T57["#57 Strict Mode"]:::epic1
        T55["#55 Blocking Apps on Android"]:::epic0
        T54["#54 User Authentification"]:::epic0
    end
    subgraph Blocking
        direction TB
        T185["#185 legacy updateBlockedApps calls..."]:::blocking3
        T184["#184 JS detection path blockLaunche..."]:::blocking2
        T183["#183 dependency injection with new ..."]:::blocking2
        T182["#182 AndroidSirenTier to call setBl..."]:::blocking1
        T181["#181 Noop implementations for futur..."]:::blocking1
        T180["#180 unified listener for blockSess..."]:::blocking1
        T179["#179 selectBlockingSchedule selecto..."]:::blocking0
        T178["#178 SirenLookout port to support s..."]:::blocking0
        T177["#177 SirenTier port to support sub-..."]:::blocking0
        T173["#173 tied-siren-blocking-overlay: A..."]:::blocking1
        T172["#172 expo-foreground-service: Add c..."]:::blocking0
        T171["#171 expo-accessibility-service: Ad..."]:::blocking0
        T170["#170 android: Blocking overlay neve..."]:::blocking0
    end
    subgraph Authentication
        direction TB
        T169["#169 auth: deep link to email app a..."]:::auth0
        T168["#168 auth: security notification em..."]:::auth0
        T167["#167 auth: brute force protection o..."]:::auth0
        T166["#166 auth: invalidate sessions afte..."]:::auth1
        T165["#165 auth: resend password reset em..."]:::auth0
        T164["#164 auth: re-authentication for se..."]:::auth0
        T163["#163 auth: account deletion GDPR co..."]:::auth1
        T162["#162 auth: change password when log..."]:::auth1
        T161["#161 auth: implement email verifica..."]:::auth0
        T160["#160 auth: custom in-app password r..."]:::auth0
        T89["#89 Authentication Error Handling"]:::auth0
        T88["#88 Apple Sign-In with Firebase"]:::auth0
    end
    subgraph Other
        direction TB
        T96["#96 Phase - Guided Permission Setu..."]:::other0
    end

    T180 --> T185
    T182 --> T185
    T184 --> T185
    T182 --> T184
    T177 --> T183
    T178 --> T183
    T182 --> T183
    T177 --> T182
    T177 --> T181
    T178 --> T181
    T177 --> T180
    T179 --> T180
    T171 --> T173
    T172 --> T173
    T160 --> T166
    T164 --> T163
    T164 --> T162
    T62 --> T67
    T62 --> T66
    T62 --> T65
    T62 --> T64
    T63 --> T64
    T62 --> T63
    T55 --> T61
    T55 --> T59
    T58 --> T59
    T55 --> T58
    T55 --> T57
```


### Features: Authentication

```mermaid
flowchart TD
    F88["#88 Implement Apple Sign-In w..."]
    F89["#89 Add Authentication Error ..."]
    F160["#160 feat(auth): custom in-app..."]
    F161["#161 feat(auth): implement ema..."]
    F162["#162 feat(auth): change passwo..."]
    F163["#163 feat(auth): account delet..."]
    F164["#164 feat(auth): re-authentica..."]
    F165["#165 feat(auth): resend passwo..."]
    F166["#166 feat(auth): invalidate se..."]
    F167["#167 feat(auth): brute force p..."]
    F168["#168 feat(auth): security noti..."]
    F169["#169 feat(auth): deep link to ..."]

    F164 --> F162
    F164 --> F163
    F160 --> F166
```


### Features: Blocking Architecture

```mermaid
flowchart TD
    F170["#170 fix(android): Blocking ov..."]
    F171["#171 feat(expo-accessibility-s..."]
    F172["#172 feat(expo-foreground-serv..."]
    F173["#173 feat(tied-siren-blocking-..."]
    F177["#177 Refactor SirenTier port t..."]
    F178["#178 Refactor SirenLookout por..."]
    F179["#179 Create selectBlockingSche..."]
    F180["#180 Create unified listener f..."]
    F181["#181 Create Noop implementatio..."]
    F182["#182 Update AndroidSirenTier t..."]
    F183["#183 Update dependency injecti..."]
    F184["#184 Deprecate JS detection pa..."]
    F185["#185 Remove legacy updateBlock..."]

    F171 --> F173
    F172 --> F173
    F177 --> F180
    F179 --> F180
    F177 --> F181
    F178 --> F181
    F177 --> F182
    F177 --> F183
    F178 --> F183
    F182 --> F183
    F182 --> F184
    F180 --> F185
    F182 --> F185
    F184 --> F185
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
| #171 | #173 |
| #172 | #173 |
| #177 | #180, #181, #182, #183 |
| #178 | #181, #183 |
| #179 | #180 |
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

---

*Auto-generated on 2025-12-29 from GitHub issue metadata*
