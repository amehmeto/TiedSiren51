# SirenTier Orchestrator Pattern

Date: 2025-12-23

## Status

Accepted

## Context

TiedSiren51 needs to block different types of "sirens" (distractions):

- **Apps**: Block specific Android/iOS applications
- **Websites**: Block specific URLs or domains (future)
- **Keywords**: Block content containing specific keywords (future)

Each siren type requires:

1. **Blocking**: Mechanism to prevent access (AppTier, WebsiteTier, KeywordTier)
2. **Detection**: Mechanism to detect access attempts (AppLookout, WebsiteLookout, KeywordLookout)
3. **Scheduling**: Time-based activation/deactivation (shared BlockingScheduler)

The challenge is architecting this in a way that:

- Supports Android first, then macOS, iOS, Windows, Linux
- Allows independent development of each siren type
- Keeps the core business logic platform-agnostic
- Maintains testability with fake implementations

## Decision

Implement **SirenTier** and **SirenLookout** as orchestrators that delegate to specialized sub-dependencies.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Core Layer                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     Ports                            │   │
│  │  SirenTier (blocking)    SirenLookout (detection)   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SirenTier Orchestrator                  │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │BlockingSched│ │   AppTier   │ │ WebsiteTier │   │   │
│  │  │    uler     │ │             │ │   (noop)    │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  │                  ┌─────────────┐                     │   │
│  │                  │ KeywordTier │                     │   │
│  │                  │   (noop)    │                     │   │
│  │                  └─────────────┘                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            SirenLookout Orchestrator                 │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │ AppLookout  │ │WebsiteLook- │ │KeywordLook- │   │   │
│  │  │             │ │ out (noop)  │ │ out (noop)  │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Port Definitions

```typescript
// core/_ports_/siren.tier.ts
export interface SirenTier {
  updateSchedule(schedule: BlockingSchedule): Promise<void>
  getCurrentSchedule(): Promise<BlockingSchedule | null>
  clearSchedule(): Promise<void>
}

// core/_ports_/siren.lookout.ts
export interface SirenLookout {
  startWatching(): void
  stopWatching(): void
  onSirenDetected(listener: (siren: DetectedSiren) => void): void
}

interface DetectedSiren {
  type: 'app' | 'website' | 'keyword'
  identifier: string  // packageName, url, or keyword
}
```

### Sub-dependency Interfaces

```typescript
// BlockingScheduler - shared scheduling infrastructure
interface BlockingScheduler {
  scheduleSession(session: ScheduledSession): Promise<void>
  cancelSession(sessionId: string): Promise<void>
  cancelAll(): Promise<void>
}

// AppTier - app-specific blocking
interface AppTier {
  updateBlockedApps(packages: string[]): Promise<void>
  clearBlockedApps(): Promise<void>
}

// WebsiteTier - website-specific blocking (future)
interface WebsiteTier {
  updateBlockedUrls(urls: string[]): Promise<void>
  clearBlockedUrls(): Promise<void>
}

// KeywordTier - keyword-specific blocking (future)
interface KeywordTier {
  updateBlockedKeywords(keywords: string[]): Promise<void>
  clearBlockedKeywords(): Promise<void>
}

// AppLookout - app launch detection
interface AppLookout {
  startWatching(): void
  stopWatching(): void
  onAppLaunched(listener: (packageName: string) => void): void
}

// WebsiteLookout - website visit detection (future)
interface WebsiteLookout {
  startWatching(): void
  stopWatching(): void
  onWebsiteVisited(listener: (url: string) => void): void
}

// KeywordLookout - keyword detection (future)
interface KeywordLookout {
  startWatching(): void
  stopWatching(): void
  onKeywordDetected(listener: (keyword: string) => void): void
}
```

### Orchestrator Implementation

```typescript
// infra/siren-tier/android.siren-tier.ts
export class AndroidSirenTier implements SirenTier {
  constructor(
    private blockingScheduler: BlockingScheduler,
    private appTier: AppTier,
    private websiteTier: WebsiteTier,    // NoopWebsiteTier initially
    private keywordTier: KeywordTier,    // NoopKeywordTier initially
  ) {}

  async updateSchedule(schedule: BlockingSchedule): Promise<void> {
    // Extract app packages from schedule
    const appPackages = this.extractAppPackages(schedule)
    await this.appTier.updateBlockedApps(appPackages)

    // Schedule sessions
    for (const session of schedule.sessions) {
      await this.blockingScheduler.scheduleSession(session)
    }

    // Future: handle websites and keywords
    // await this.websiteTier.updateBlockedUrls(urls)
    // await this.keywordTier.updateBlockedKeywords(keywords)
  }
}
```

### Noop Implementations for Future Features

```typescript
// infra/siren-tier/noop.website-tier.ts
export class NoopWebsiteTier implements WebsiteTier {
  async updateBlockedUrls(_urls: string[]): Promise<void> {
    // No-op until website blocking is implemented
  }

  async clearBlockedUrls(): Promise<void> {
    // No-op
  }
}
```

## Consequences

### Positive

- **Extensible**: Add new siren types without modifying orchestrator interface
- **Independent development**: Each tier can be developed and tested separately
- **Platform flexibility**: Different platforms can implement different tiers
- **Gradual rollout**: Start with AppTier only, add others when ready
- **Testable**: Each sub-dependency can be faked independently
- **Clear responsibilities**: Each component has single responsibility

### Negative

- **More interfaces**: Additional abstraction layers to maintain
- **Coordination complexity**: Orchestrator must coordinate multiple sub-dependencies
- **Potential duplication**: Some logic may be duplicated across tiers

### Neutral

- **Noop implementations**: Placeholders until features are ready
- **Type-specific handling**: Each siren type may have unique requirements

## Alternatives Considered

### 1. Single monolithic SirenTier

**Rejected because:**

- Would become unwieldy as more siren types are added
- Hard to test individual features
- Platform-specific code mixed together

### 2. Separate ports for each siren type

**Rejected because:**

- Core layer would need to know about each siren type
- More injection points in dependency container
- Harder to coordinate cross-cutting concerns (like scheduling)

### 3. Strategy pattern with runtime registration

**Rejected because:**

- More complex than needed for known siren types
- Harder to type safely
- Overkill when types are predetermined

## Implementation Notes

### Current State (Post-PR #175)

- `SirenLookout` exists but focuses only on app detection
- `updateBlockedApps()` method syncs packages to SharedPreferences
- No scheduling - relies on Redux listener (will be superseded)

### Migration Path

1. **Phase 1**: Introduce BlockingScheduler, keep existing SirenLookout
2. **Phase 2**: Refactor SirenLookout to orchestrator with AppLookout
3. **Phase 3**: Add full-native blocking path for apps
4. **Phase 4**: Add WebsiteTier when website blocking is needed
5. **Phase 5**: Add KeywordTier when keyword blocking is needed

### Key Files

- `core/_ports_/siren.tier.ts` - Orchestrator port
- `core/_ports_/siren.lookout.ts` - Detection orchestrator port
- `infra/siren-tier/android.siren-tier.ts` - Android orchestrator
- `infra/siren-tier/app-tier/` - App-specific blocking
- `infra/siren-tier/blocking-scheduler/` - Scheduling infrastructure
- `infra/siren-lookout/android.siren-lookout.ts` - Android detection orchestrator
- `infra/siren-lookout/app-lookout/` - App detection

## Related ADRs

- [Native Blocking Scheduler](native-blocking-scheduler.md) - Scheduling infrastructure
- [Foreground Service](foreground-service.md) - Keeps app alive for detection
- [Dependency Injection Pattern](../core/dependency-injection-pattern.md) - How dependencies are wired

## References

- [Orchestrator Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/choreography#solution)
- [Hexagonal Architecture](../hexagonal-architecture.md) - Port/adapter pattern
