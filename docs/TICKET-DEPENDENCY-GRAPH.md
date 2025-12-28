# Ticket Dependency Graph

This document visualizes the dependencies between GitHub issues to help with planning and prioritization.

## Complete Ticket Inventory

### Initiatives (6)
| # | Title | Depends On | Blocks |
|---|-------|------------|--------|
| #62 | Launch Android App | - | #63, #64, #65, #66, #67 |
| #63 | Launch iOS App | #62 | #64 |
| #64 | Multi Device Sync | #62, #63 | - |
| #65 | Launch MacOS | #62 | - |
| #66 | Launch Windows | #62 | - |
| #67 | Goal-Based Locking | #62 | - |

### Epics (7)
| # | Title | Depends On | Blocks |
|---|-------|------------|--------|
| #54 | User Authentication | - | - |
| #55 | Blocking Apps on Android | - | #57, #58, #59, #61 |
| #57 | Strict Mode | #55 | - |
| #58 | Block Websites on Android | #55 | #59 |
| #59 | Blocking Keywords on Android | #55, #58 | - |
| #60 | Polish Design | - | - |
| #61 | Schedule Recurring Sessions | #55 | - |

### Bug (1)
| # | Title | Severity | Related |
|---|-------|----------|---------|
| #170 | Blocking overlay never triggers | Critical | Fixed by #171-185 |

### Features - Blocking Architecture (15)
| # | Title | Depends On | Blocks |
|---|-------|------------|--------|
| #96 | Guided Permission Setup | - | - |
| #171 | Multi-Listener Support (accessibility) | - | #173 |
| #172 | Callback System (foreground service) | - | #173 |
| #173 | BlockingCallback + SharedPreferences | #171, #172 | - |
| #177 | SirenTier Port Refactor | - | #180, #181, #182, #183 |
| #178 | SirenLookout Port Refactor | - | #181, #183 |
| #179 | selectBlockingSchedule Selector | - | #180 |
| #180 | Unified Listener | #177, #179 | #185 |
| #181 | Noop Implementations | #177, #178 | - |
| #182 | AndroidSirenTier Implementation | #177 | #183, #184, #185 |
| #183 | Update Dependency Injection | #177, #178, #182 | - |
| #184 | Deprecate JS Detection Path | #182 | #185 |
| #185 | Remove Legacy Code | #180, #182, #184 | - |

### Features - Authentication (12)
| # | Title | Depends On | Blocks |
|---|-------|------------|--------|
| #88 | Apple Sign-In | - | - |
| #89 | Error Handling | - | - |
| #160 | Custom Password Reset | - | #166 |
| #161 | Email Verification | - | - |
| #162 | Change Password | - | - |
| #163 | Account Deletion (GDPR) | #164 | - |
| #164 | Re-authentication | - | #162, #163 |
| #165 | Resend Reset Email | - | - |
| #166 | Invalidate Sessions | #160 | - |
| #167 | Brute Force Protection | - | - |
| #168 | Security Notifications | - | - |
| #169 | Deep Link to Email | - | - |

---

## Overview Diagram

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
    T177 --> T183
    T178 --> T181
    T178 --> T183

    %% Selector → Listener
    T179 --> T180

    %% Implementation dependencies
    T182 --> T183
    T182 --> T184
    T182 --> T185

    %% Cleanup chain
    T184 --> T185
    T180 --> T185

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
    subgraph "Core Auth (Standalone)"
        A88["#88 Apple Sign-In"]
        A89["#89 Error Handling"]
    end

    subgraph "Password Management"
        A160["#160 Custom Password Reset"]
        A162["#162 Change Password"]
        A164["#164 Re-authentication"]
        A165["#165 Resend Reset Email"]
        A166["#166 Invalidate Sessions"]
    end

    subgraph "Email & Security (Standalone)"
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

    %% Email verification → deep link (optional)
    A161 -.-> A169
```

## Recommended Execution Order

### Phase 1: Foundation (No Dependencies)
| Issue | Title | Points | Epic |
|-------|-------|--------|------|
| #177 | SirenTier Port Refactor | 3 | #55 |
| #178 | SirenLookout Port Refactor | 2 | #55 |
| #171 | Multi-Listener Support | 3 | #55 |
| #172 | Callback System | 3 | #55 |
| #179 | selectBlockingSchedule Selector | 5 | #55 |
| #88 | Apple Sign-In | 3 | #54 |
| #89 | Error Handling | 3 | #54 |
| #164 | Re-authentication | 2 | #54 |
| #160 | Custom Password Reset | 5 | #54 |
| #161 | Email Verification | 3 | #54 |

### Phase 2: Core Implementation
| Issue | Title | Depends On | Epic |
|-------|-------|------------|------|
| #173 | BlockingCallback + SharedPreferences | #171, #172 | #55 |
| #181 | Noop Implementations | #177, #178 | #55 |
| #182 | AndroidSirenTier Implementation | #177 | #55 |
| #180 | Unified Listener | #177, #179 | #55 |
| #162 | Change Password | #164 | #54 |
| #163 | Account Deletion | #164 | #54 |
| #166 | Invalidate Sessions | #160 | #54 |

### Phase 3: Integration & Cleanup
| Issue | Title | Depends On | Epic |
|-------|-------|------------|------|
| #183 | Update Dependency Injection | #177, #178, #182 | #55 |
| #184 | Deprecate JS Detection Path | #182 | #55 |
| #185 | Remove Legacy Code | #180, #182, #184 | #55 |

### Standalone Features (Can Start Anytime)
| Issue | Title | Points | Epic |
|-------|-------|--------|------|
| #96 | Guided Permission Setup | 3 | #55 |
| #165 | Resend Reset Email | 1 | #54 |
| #167 | Brute Force Protection | 2 | #54 |
| #168 | Security Notifications | 3 | #54 |
| #169 | Deep Link to Email | 2 | #54 |

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

## Legend

- **Solid arrows (→)**: Direct dependency (must complete first)
- **Dotted arrows (-.->)**: Related/contributes to
- **Red nodes**: Bugs
- **Subgraphs**: Logical groupings

---

*Last updated: 2025-12-28*
*Generated from issue metadata*
