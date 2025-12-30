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
- Minimizes JS↔Native bridge crossings

## Decision

Implement **SirenTier** and **SirenLookout** as orchestrators with **Kotlin-internal dependency injection**. The JS layer sees a simple interface; the native layer handles sub-dependency orchestration.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Core Layer (JS)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     Ports                            │   │
│  │  SirenTier (blocking)    SirenLookout (detection)   │   │
│  │  - setBlockingSchedule()  - onSirenDetected()       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    JS↔Native Bridge (thin)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Native Layer (Kotlin)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           SirenTierModule (Expo Module)              │   │
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
│  │         SirenLookoutModule (Expo Module)             │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │ AppLookout  │ │WebsiteLook- │ │KeywordLook- │   │   │
│  │  │             │ │ out (noop)  │ │ out (noop)  │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### JS Port Definitions (Simple)

```typescript
// core/_ports_/siren.tier.ts
export interface SirenTier {
  initialize(): Promise<void>
  setBlockingSchedule(schedule: BlockingSchedule): Promise<void>
}

export interface BlockingSchedule {
  windows: BlockingWindow[]
}

export interface BlockingWindow {
  id: string
  startTime: string    // "14:00"
  endTime: string      // "15:00"
  sirens: {
    apps: string[]     // package names
    websites: string[] // domains (future)
    keywords: string[] // search terms (future)
  }
}

// core/_ports_/siren.lookout.ts
export interface SirenLookout {
  initialize(): Promise<void>
  onSirenDetected(callback: (siren: DetectedSiren) => void): void
}

export interface DetectedSiren {
  type: 'app' | 'website' | 'keyword'
  identifier: string
  timestamp: number
}
```

### JS Adapter (Thin Wrapper)

```typescript
// infra/siren-tier/android.siren-tier.ts
export class AndroidSirenTier implements SirenTier {
  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    await TiedSirenModule.initialize()
  }

  async setBlockingSchedule(schedule: BlockingSchedule): Promise<void> {
    try {
      await TiedSirenModule.setBlockingSchedule(schedule.windows)
      this.logger.info('Blocking schedule synced to native')
    } catch (error) {
      this.logger.error(`Failed to sync blocking schedule: ${error}`)
      throw error
    }
  }
}
```

### Kotlin Internal Interfaces (Hidden from JS)

```kotlin
// BlockingScheduler - shared scheduling infrastructure
interface BlockingScheduler {
    suspend fun scheduleWindow(window: BlockingWindow)
    suspend fun cancelWindow(windowId: String)
    suspend fun cancelAll()
}

// AppTier - app-specific blocking
interface AppTier {
    suspend fun block(packages: List<String>)
    suspend fun unblockAll()
}

// WebsiteTier - website-specific blocking (future)
interface WebsiteTier {
    suspend fun block(domains: List<String>)
    suspend fun unblockAll()
}

// KeywordTier - keyword-specific blocking (future)
interface KeywordTier {
    suspend fun block(keywords: List<String>)
    suspend fun unblockAll()
}
```

### Kotlin Orchestrator Implementation

```kotlin
// SirenTierModule.kt (Expo Module)
// Note: Uses Expo Modules API. Use @AsyncFunction for async methods.
class SirenTierModule(
    private val blockingScheduler: BlockingScheduler,
    private val appTier: AppTier,
    private val websiteTier: WebsiteTier,    // NoopWebsiteTier initially
    private val keywordTier: KeywordTier,    // NoopKeywordTier initially
) : Module() {

    // Expo Modules API uses @AsyncFunction for coroutine-based methods
    @AsyncFunction
    suspend fun setBlockingSchedule(windows: List<BlockingWindow>) {
        // Cancel existing schedules
        blockingScheduler.cancelAll()

        // Schedule each window
        for (window in windows) {
            blockingScheduler.scheduleWindow(window)

            // Delegate to appropriate tiers
            appTier.block(window.sirens.apps)
            websiteTier.block(window.sirens.websites)
            keywordTier.block(window.sirens.keywords)
        }
    }
}
```

### Kotlin Noop Implementations

```kotlin
// NoopWebsiteTier.kt
class NoopWebsiteTier : WebsiteTier {
    override suspend fun block(domains: List<String>) {
        // No-op until website blocking is implemented
    }

    override suspend fun unblockAll() {
        // No-op
    }
}
```

## Consequences

### Positive

- **Simple JS interface**: JS only knows `setBlockingSchedule()`, no sub-deps
- **Fewer bridge crossings**: One call instead of multiple
- **Native handles native**: Kotlin DI stays in Kotlin
- **Hidden implementation**: Sub-dependencies are internal to native module
- **Extensible**: Add new siren types in Kotlin without JS changes
- **Testable**: Each Kotlin sub-dependency can be unit tested
- **Platform flexibility**: Different platforms implement different tiers

### Negative

- **Less JS flexibility**: Can't swap sub-deps from JS side
- **Harder to mock from JS**: Need to mock the entire native module
- **Kotlin knowledge required**: Must understand Kotlin DI for changes

### Neutral

- **Noop implementations in Kotlin**: Placeholders until features are ready
- **Type-specific handling**: Each siren type has unique requirements

## Alternatives Considered

### 1. JS-side orchestration with multiple Expo modules

```typescript
// Would require multiple modules
const appTier = new AndroidAppTier(logger)
const websiteTier = new NoopWebsiteTier()
const sirenTier = new AndroidSirenTier(appTier, websiteTier, ...)
```

**Rejected because:**

- More JS↔Native bridge crossings (performance)
- More npm packages to maintain
- Exposes native implementation details to JS
- Sub-deps are native concerns, not JS concerns

### 2. Single monolithic SirenTier without sub-dependencies

**Rejected because:**

- Would become unwieldy as more siren types are added
- Hard to test individual features
- No clear separation of concerns

### 3. Strategy pattern with runtime registration

**Rejected because:**

- More complex than needed for known siren types
- Harder to type safely
- Overkill when types are predetermined

## Implementation Notes

### JS Files

- `core/_ports_/siren.tier.ts` - Simple port interface
- `core/_ports_/siren.lookout.ts` - Simple detection port
- `infra/siren-tier/android.siren-tier.ts` - Thin wrapper calling native
- `infra/siren-lookout/android.siren-lookout.ts` - Thin wrapper for events

### Kotlin Files (expo-siren-tier module)

- `SirenTierModule.kt` - Expo module entry point
- `BlockingScheduler.kt` - AlarmManager-based scheduling
- `AppTier.kt` - App blocking via SharedPreferences
- `NoopWebsiteTier.kt` - Placeholder
- `NoopKeywordTier.kt` - Placeholder

### Kotlin Files (expo-siren-lookout module)

- `SirenLookoutModule.kt` - Expo module entry point
- `AppLookout.kt` - AccessibilityService integration
- `NoopWebsiteLookout.kt` - Placeholder
- `NoopKeywordLookout.kt` - Placeholder

### Migration Path

1. **Phase 1**: Refactor SirenTier port to simple interface
2. **Phase 2**: Implement Kotlin SirenTierModule with internal DI
3. **Phase 3**: Add full-native blocking path for apps
4. **Phase 4**: Add WebsiteTier when website blocking is needed
5. **Phase 5**: Add KeywordTier when keyword blocking is needed

## Related ADRs

- [Native Blocking Scheduler](native-blocking-scheduler.md) - Scheduling infrastructure
- [Foreground Service](foreground-service.md) - Keeps app alive for detection
- [Hexagonal Architecture](../hexagonal-architecture.md) - Port/adapter pattern

## References

- [Orchestrator Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/choreography#solution)
- [Expo Modules API](https://docs.expo.dev/modules/overview/)
