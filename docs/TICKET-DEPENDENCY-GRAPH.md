# Ticket Dependency Graph

This document visualizes the dependencies between GitHub issues to help with planning and prioritization.

## Overview

```mermaid
flowchart TD
    subgraph Initiatives
        I62["#62 Launch Android App"]
        I63["#63 Launch iOS App"]
        I64["#64 Multi Device Sync"]
        I65["#65 Launch MacOS"]
        I66["#66 Launch Windows"]
        I67["#67 Goal-Based Locking"]
    end

    subgraph Epics
        E54["#54 User Authentication"]
        E55["#55 Blocking Apps on Android"]
        E57["#57 Strict Mode"]
        E58["#58 Block Websites"]
        E59["#59 Blocking Keywords"]
        E60["#60 Polish Design"]
        E61["#61 Schedule Recurring Sessions"]
    end

    %% Initiative dependencies
    I62 --> I63
    I62 --> I64
    I63 --> I64
    I62 --> I65
    I62 --> I66
    I62 --> I67

    %% Epic dependencies
    E55 --> E57
    E55 --> E58
    E55 --> E61
    E55 --> E59
    E58 --> E59
```

## Epic #55: Blocking Apps on Android - Fix Architecture

This epic addresses the critical bug #170 where blocking doesn't work when the app is backgrounded.

```mermaid
flowchart TD
    subgraph "Native Module Changes"
        T171["#171 Multi-Listener Support<br/>expo-accessibility-service"]
        T172["#172 Callback System<br/>expo-foreground-service"]
        T173["#173 BlockingCallback<br/>+ SharedPreferences"]
    end

    subgraph "Port Refactoring"
        T177["#177 SirenTier Port Refactor"]
        T178["#178 SirenLookout Port Refactor"]
    end

    subgraph "Core Implementation"
        T179["#179 selectBlockingSchedule<br/>Selector"]
        T180["#180 Unified Listener<br/>for State Changes"]
        T181["#181 Noop Implementations<br/>for Future Tiers"]
        T182["#182 AndroidSirenTier<br/>Implementation"]
    end

    subgraph "Cleanup"
        T183["#183 Update DI"]
        T184["#184 Deprecate JS Path"]
        T185["#185 Remove Legacy Code"]
    end

    B170{{"#170 BUG<br/>Blocking Overlay<br/>Never Triggers"}}

    %% Native module dependencies
    T171 --> T173
    T172 --> T173

    %% Port dependencies
    T177 --> T180
    T177 --> T181
    T177 --> T182
    T178 --> T181

    %% Selector → Listener
    T179 --> T180

    %% Implementation dependencies
    T182 --> T183
    T177 --> T183
    T178 --> T183

    %% Cleanup chain
    T182 --> T184
    T184 --> T185
    T180 --> T185
    T182 --> T185

    %% All fixes contribute to bug resolution
    T173 -.-> B170
    T180 -.-> B170
    T182 -.-> B170
    T185 -.-> B170

    style B170 fill:#f66,stroke:#333
```

## Epic #54: User Authentication

```mermaid
flowchart TD
    subgraph "Core Auth"
        A88["#88 Apple Sign-In"]
        A89["#89 Error Handling"]
        A96["#96 Guided Permission Setup"]
    end

    subgraph "Password Management"
        A160["#160 Custom Password Reset"]
        A162["#162 Change Password"]
        A164["#164 Re-authentication"]
        A165["#165 Resend Reset Email"]
        A166["#166 Invalidate Sessions"]
    end

    subgraph "Email & Security"
        A161["#161 Email Verification"]
        A167["#167 Brute Force Protection"]
        A168["#168 Security Notifications"]
        A169["#169 Deep Link to Email"]
    end

    subgraph "Account"
        A163["#163 Account Deletion (GDPR)"]
    end

    %% Re-auth is prerequisite for sensitive ops
    A164 --> A162
    A164 --> A163

    %% Password reset chain
    A160 --> A166

    %% Email verification → deep link
    A161 -.-> A169
```

## Recommended Execution Order

### Phase 1: Foundation (No Dependencies)
| Issue | Title | Points |
|-------|-------|--------|
| #177 | SirenTier Port Refactor | 3 |
| #178 | SirenLookout Port Refactor | 2 |
| #171 | Multi-Listener Support | 3 |
| #172 | Callback System | 3 |
| #179 | selectBlockingSchedule Selector | 5 |

### Phase 2: Core Implementation
| Issue | Title | Depends On |
|-------|-------|------------|
| #173 | BlockingCallback + SharedPreferences | #171, #172 |
| #181 | Noop Implementations | #177, #178 |
| #182 | AndroidSirenTier Implementation | #177 |
| #180 | Unified Listener | #177, #179 |

### Phase 3: Integration & Cleanup
| Issue | Title | Depends On |
|-------|-------|------------|
| #183 | Update Dependency Injection | #177, #178, #182 |
| #184 | Deprecate JS Detection Path | #182 |
| #185 | Remove Legacy Code | #180, #182, #184 |

## Critical Path

The critical path to fixing **#170** (Blocking overlay never triggers):

```
#177 (SirenTier Port) ─┬─> #182 (AndroidSirenTier) ─┬─> #184 (Deprecate JS) ─┐
                       │                            │                        │
#179 (Selector) ───────┴─> #180 (Unified Listener) ─┴────────────────────────┴─> #185 (Cleanup)
                                                                                      │
#171 (Multi-Listener) ─┬─> #173 (BlockingCallback) ──────────────────────────────────┘
                       │
#172 (Callback System) ┘
```

**Minimum viable fix:** Complete #171, #172, #173 for native-to-native blocking.
**Full architecture:** Complete all Phase 1-3 issues.

## Legend

- **Solid arrows (→)**: Direct dependency (must complete first)
- **Dotted arrows (-.->)**: Related/contributes to
- **Red nodes**: Bugs
- **Subgraphs**: Logical groupings

---

*Last updated: 2025-12-28*
*Generated from issue metadata*
