# Standalone Expo Modules

Date: 2025-01-24

## Status

Accepted

## Context

TiedSiren51 uses React Native with Expo SDK and needs native functionality that React Native doesn't provide out-of-the-box:

- Android AccessibilityService for app detection
- Android app blocking overlays
- Platform-specific device features

We need a strategy for developing native modules that:
- Keeps business logic separate from native platform code
- Makes native modules reusable and shareable
- Allows modules to be published independently
- Maintains clean architecture boundaries
- Supports future extraction to separate repositories

## Decision

**All Expo modules MUST be standalone, live in separate repositories, and be decoupled from TiedSiren business logic.**

### Principles

1. **Separate Repository**: Each Expo module lives in its own git repository from day one
2. **Standalone Design**: Each module is self-contained and usable by any React Native + Expo project
3. **Business Logic Separation**: Modules provide primitives, not domain logic
4. **External Dependency**: Consumed via package.json (git reference or npm)
5. **Generic API**: Module APIs must not reference TiedSiren-specific concepts
6. **No Internal Modules**: Never create modules inside TiedSiren51 repository

### Module Organization

**Location**: Separate repository (e.g., `github.com/amehmeto/expo-blocking-overlay`)

Each module is structured in its own repository:

```
github.com/amehmeto/expo-blocking-overlay/
├── android/                    # Native Android code
│   └── src/main/
│       ├── java/expo/modules/blockingoverlay/
│       │   ├── ExpoBlockingOverlayModule.kt
│       │   └── BlockingOverlayActivity.kt
│       ├── res/                # Android resources
│       └── AndroidManifest.xml
├── ios/                        # Native iOS code (if applicable)
├── src/
│   └── index.ts                # TypeScript interface
├── expo-module.config.json     # Expo module configuration
├── package.json                # Module metadata
├── README.md                   # Module documentation (public-facing)
├── .github/
│   └── workflows/              # CI/CD for module
└── LICENSE                     # Module license
```

### Consumption Strategy

Expo modules are **always** consumed as external dependencies via package.json.

**Option 1: Git Reference** (Recommended during development):
```json
// TiedSiren51/package.json
{
  "dependencies": {
    "expo-blocking-overlay": "git+https://github.com/amehmeto/expo-blocking-overlay.git#v1.0.0"
  }
}
```

**Option 2: Published npm Package** (Recommended for production):
```json
// TiedSiren51/package.json
{
  "dependencies": {
    "expo-blocking-overlay": "^1.0.0"
  }
}
```

**Option 3: Local Development** (Only for active module development):
```json
// TiedSiren51/package.json
{
  "dependencies": {
    "expo-blocking-overlay": "file:../expo-blocking-overlay"
  }
}
```

**Note**: Option 3 requires cloning the module repo as a sibling directory. Never use `/modules/` inside TiedSiren51.

### Integration with Hexagonal Architecture

Expo modules exist **outside** the hexagonal architecture layers:

```
┌─────────────────────────────────────┐
│  TiedSiren51 Application            │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ Core Layer (Business Logic)  │  │
│  │   ├── SirenTier interface    │  │
│  │   └── Domain logic            │  │
│  └──────────────────────────────┘  │
│           ↑                          │
│  ┌──────────────────────────────┐  │
│  │ Infra Layer (Adapters)       │  │
│  │   └── AndroidSirenTier ─────────────┐
│  │       (implements SirenTier)  │  │  │
│  └──────────────────────────────┘  │  │
│                                      │  │
└──────────────────────────────────────┘  │
                                           │
    ┌──────────────────────────────────┐  │
    │ expo-blocking-overlay (Module)  │←─┘
    │ - Generic, standalone            │
    │ - No TiedSiren coupling          │
    │ - Publishable to npm             │
    └──────────────────────────────────┘
```

**Key Point**: `AndroidSirenTier` (infra adapter) calls `expo-blocking-overlay` (external module), keeping business logic separate from native implementation.

## Examples

### ❌ BAD: Coupled to TiedSiren

```kotlin
// modules/expo-blocking-overlay/android/.../ExpoBlockingOverlayModule.kt
class ExpoBlockingOverlayModule : Module() {
  fun blockSiren(sirenId: String) {  // ❌ "Siren" is TiedSiren concept
    // ... show overlay
  }
}
```

```typescript
// modules/expo-blocking-overlay/index.ts
export interface BlockSessionData {  // ❌ TiedSiren-specific type
  sessionId: string
  blocklistId: string
  sirens: Siren[]
}
```

### ✅ GOOD: Standalone and Generic

```kotlin
// modules/expo-blocking-overlay/android/.../ExpoBlockingOverlayModule.kt
class ExpoBlockingOverlayModule : Module() {
  fun showOverlay(packageName: String, blockUntil: Long) {  // ✅ Generic parameters
    // ... show overlay
  }
}
```

```typescript
// modules/expo-blocking-overlay/index.ts
export default {
  showOverlay(packageName: string, blockUntil: number): Promise<void>  // ✅ Generic API
}
```

```typescript
// infra/siren-tier/AndroidSirenTier.ts (TiedSiren-specific)
import ExpoBlockingOverlay from 'expo-blocking-overlay'
import { SirenTier } from '@core/_ports_/siren.tier'

export class AndroidSirenTier implements SirenTier {
  async block(packageName: string): Promise<void> {
    // TiedSiren business logic: when to block, for how long
    const blockUntil = this.calculateBlockEnd()

    // Generic module: just display overlay
    await ExpoBlockingOverlay.showOverlay(packageName, blockUntil)
  }

  private calculateBlockEnd(): number {
    // TiedSiren-specific: block session logic
    return Date.now() + (30 * 60 * 1000)
  }
}
```

## Consequences

### Positive

- **Reusability**: Modules can be used by other projects
- **Clarity**: Clear separation between native primitives and business logic
- **Shareability**: Easy to publish and share with community
- **Testability**: Modules can be tested independently
- **Maintainability**: Module bugs can be fixed without touching TiedSiren code
- **Open Source Potential**: Modules can be open-sourced easily
- **Repository Flexibility**: Easy to extract to separate repos when ready
- **Clean Architecture**: Maintains hexagonal architecture boundaries
- **No Vendor Lock-in**: Not tied to TiedSiren's specific needs

### Negative

- **More Abstraction**: Additional layer between business logic and native code
- **Generic API Design**: Must think about reusability, not just immediate needs
- **Boilerplate**: Each module needs package.json, README, etc.
- **Documentation Burden**: Must document module as if for external consumers
- **Version Management**: Must manage module versions if published separately
- **Breaking Changes**: Can't casually change module API without considering external users

### Neutral

- **Development Overhead**: More upfront design, but pays off long-term
- **Repository Strategy**: Flexibility to keep in monorepo or extract later

## Alternatives Considered

### 1. Native Modules Coupled to TiedSiren

**Example**:
```kotlin
class TiedSirenOverlayModule {
  fun blockSiren(siren: Siren, session: BlockSession) { }
}
```

**Rejected because**:
- Tightly couples native code to TiedSiren domain
- Impossible to reuse in other projects
- Hard to test independently
- Can't be open-sourced or published
- Violates single responsibility (native module knows about sessions, sirens, etc.)

### 2. All Logic in Native Module

**Example**: Put block session calculation, siren checking, etc. in Kotlin

**Rejected because**:
- Business logic duplicated across platforms (Android, iOS)
- TypeScript/Redux state management abandoned
- Harder to test (need Android instrumentation for business logic)
- Can't change business rules without native code changes
- Violates hexagonal architecture

### 3. Expo Modules Inside /infra

**Example**: Put modules in `/infra/expo-modules/`

**Rejected because**:
- Implies modules are part of infrastructure layer (they're not)
- Suggests coupling to TiedSiren architecture
- Harder to extract to separate repositories
- Confuses module as "infrastructure adapter" vs "external dependency"

### 4. Turbo Modules (New Architecture)

**Rejected because**:
- Overkill for simple modules
- Expo Modules API provides simpler DX
- Already using Expo SDK, consistent with ecosystem
- Expo Modules will support New Architecture when ready

## Implementation Notes

### Module Development Checklist

When creating a new Expo module:

- [ ] Create separate git repository: `github.com/amehmeto/{module-name}`
- [ ] Write generic API (no TiedSiren concepts)
- [ ] Add standalone README as if publishing to npm
- [ ] Include package.json with version and metadata
- [ ] Add LICENSE file (MIT recommended)
- [ ] Setup GitHub Actions for CI/CD
- [ ] Document all parameters and return types
- [ ] Add error handling for all edge cases
- [ ] Write unit tests for TypeScript interface
- [ ] Write Android instrumentation tests
- [ ] Design for cross-platform (even if starting with one platform)
- [ ] No imports from TiedSiren51 code
- [ ] Think: "Could another app use this?"
- [ ] Tag releases: `v1.0.0`, `v1.0.1`, etc.

### Existing Modules Following This Pattern

All modules live in separate repositories:

- `github.com/amehmeto/expo-accessibility-service` - AccessibilityService wrapper
- `github.com/amehmeto/expo-list-installed-apps` - Get installed apps list
- `github.com/amehmeto/expo-blocking-overlay` (this feature) - Display blocking overlays

### Integration Pattern

```typescript
// ✅ Correct: Adapter uses module
// infra/siren-tier/AndroidSirenTier.ts
import ExpoBlockingOverlay from 'expo-blocking-overlay'  // External module
import { SirenTier } from '@core/_ports_/siren.tier'     // Business logic

export class AndroidSirenTier implements SirenTier {
  async block(packageName: string): Promise<void> {
    await ExpoBlockingOverlay.showOverlay(packageName, Date.now() + 1800000)
  }
}

// ❌ Wrong: Core layer directly imports module
// core/siren/usecases/blockSiren.ts
import ExpoBlockingOverlay from 'expo-blocking-overlay'  // ❌ Core shouldn't know about modules
```

### Publishing Strategy

Modules are created in separate repositories from day one:

1. **Create repository**: `github.com/amehmeto/{module-name}`
2. **Setup CI/CD**: GitHub Actions for testing and releases
3. **Initial consumption**: Use git reference in TiedSiren51's package.json
4. **Publish to npm** (when stable): `npm publish` or GitHub Packages
5. **Switch to npm version**: Update package.json to use published version
6. **Maintain independently**: All bug fixes and features in module repo

**Development Workflow**:
1. Clone module repo as sibling: `../expo-blocking-overlay/`
2. Use `"file:../expo-blocking-overlay"` for active development
3. Commit and tag in module repo when ready
4. Switch TiedSiren51 to git reference: `"git+https://...#v1.0.0"`
5. Continue TiedSiren51 development with stable module version

### Related ADRs

- [Hexagonal Architecture](../hexagonal-architecture.md) - Overall architecture
- [Dependency Injection Pattern](../core/dependency-injection-pattern.md) - How adapters access modules

## References

- [Expo Modules API](https://docs.expo.dev/modules/overview/)
- [Creating an Expo Module](https://docs.expo.dev/modules/get-started/)
- [Module Project Structure](https://docs.expo.dev/modules/project-structure/)
- [npm install from Git](https://docs.npmjs.com/cli/v7/commands/npm-install#git-urls-as-dependencies)
- Existing modules: `github.com/amehmeto/expo-accessibility-service`, `github.com/amehmeto/expo-list-installed-apps`
- Module examples: `@amehmeto/expo-accessibility-service`, `@amehmeto/expo-list-installed-apps`
