# Port Interface Naming Convention

Date: 2025-01-24

## Status

Accepted

## Context

TiedSiren51 uses hexagonal architecture with port interfaces in `/core/_ports_/`. There was inconsistency between documentation (using `I` prefix like `IAuthGateway`) and actual implementation (no prefix, like `AuthGateway`, `SirenTier`).

We need a consistent naming convention that:
- Clearly identifies port interfaces vs implementations
- Is concise and readable
- Follows TypeScript/JavaScript community norms
- Doesn't create noise in the codebase

## Decision

Use **no prefix** for port interfaces. Name them descriptively based on their role.

### Naming Pattern

**For service-like ports** (actions/behavior):
- Pattern: `{Domain}{Role}`
- Examples: `AuthGateway`, `NotificationService`, `DateProvider`

**For repository-like ports** (data access):
- Pattern: `{Entity}Repository`
- Examples: `BlockSessionRepository`, `BlocklistRepository`, `SirensRepository`

**For domain-specific abstractions** (like tiers, layers):
- Pattern: `{Domain}{Abstraction}`
- Examples: `SirenTier`, `SirenLookout`

### Implementation Naming

**Production implementations**:
- Pattern: `{Technology/Specificity}{PortName}`
- Examples:
  - `FirebaseAuthGateway` implements `AuthGateway`
  - `PrismaBlockSessionRepository` implements `BlockSessionRepository`
  - `AndroidSirenTier` implements `SirenTier`
  - `RealNotificationService` implements `NotificationService`

**Test doubles**:
- **Fakes** (functional implementations): `Fake{PortName}`
  - Example: `FakeAuthGateway`, `FakeDataBlockSessionRepository`
- **Stubs** (minimal implementations): `Stub{PortName}`
  - Example: `StubDateProvider`, `StubDatabaseService`
- **In-memory** (fallback/simple): `InMemory{PortName}`
  - Example: `InMemorySirenTier`

### File Naming

**Port interface files**:
- Pattern: `{port-name}.ts` (kebab-case)
- Location: `/core/_ports_/`
- Examples:
  - `auth.gateway.ts` exports `AuthGateway`
  - `siren.tier.ts` exports `SirenTier`
  - `block-session.repository.ts` exports `BlockSessionRepository`

**Implementation files**:
- Pattern: `{implementation-name}.ts` (kebab-case)
- Location: `/infra/{domain}-{type}/`
- Examples:
  - `/infra/auth-gateway/firebase.auth.gateway.ts` exports `FirebaseAuthGateway`
  - `/infra/siren-tier/AndroidSirenTier.ts` exports `AndroidSirenTier`
  - `/infra/block-session-repository/prisma.block-session.repository.ts` exports `PrismaBlockSessionRepository`

## Examples

### Port Interface
```typescript
// core/_ports_/siren.tier.ts
export interface SirenTier {
  target(sirens: Sirens): Promise<void>
  block(packageName: string): Promise<void>
}
```

### Production Implementation
```typescript
// infra/siren-tier/AndroidSirenTier.ts
import { SirenTier } from '@core/_ports_/siren.tier'
import ExpoBlockingOverlay from 'expo-blocking-overlay'

export class AndroidSirenTier implements SirenTier {
  async target(sirens: Sirens): Promise<void> {
    // Android-specific implementation
  }

  async block(packageName: string): Promise<void> {
    await ExpoBlockingOverlay.showOverlay(packageName, Date.now())
  }
}
```

### Test Double
```typescript
// infra/siren-tier/in-memory.siren-tier.ts
import { SirenTier } from '@core/_ports_/siren.tier'

export class InMemorySirenTier implements SirenTier {
  blockedApps: string[] = []

  async target(sirens: Sirens): Promise<void> {
    console.log('Targeted sirens:', sirens)
  }

  async block(packageName: string): Promise<void> {
    console.log('Blocking app:', packageName)
    this.blockedApps.push(packageName)
  }
}
```

## Consequences

### Positive

- **Cleaner code**: No `I` prefix noise
- **Clear role**: Name describes what the port does, not that it's an interface
- **TypeScript native**: Interfaces don't need prefixes in TypeScript/JavaScript
- **Consistent with community**: Most TypeScript projects don't use `I` prefix
- **Implementation clarity**: `AndroidSirenTier implements SirenTier` reads naturally
- **Easier to type**: Less boilerplate in imports and declarations

### Negative

- **Less explicit**: Can't immediately tell from name alone if something is a port or implementation
- **Requires discipline**: Team must understand hexagonal architecture to know what's a port
- **IDE ambiguity**: Searching for "SirenTier" finds both interface and implementations

### Mitigations

- **Location convention**: Ports always in `/core/_ports_/`, implementations in `/infra/`
- **File organization**: Clear separation makes it obvious
- **Documentation**: ADRs and README explain the pattern
- **Code review**: Enforce convention in PRs
- **ESLint rule**: `@typescript-eslint/naming-convention` automatically flags I-prefix interfaces as errors

## Alternatives Considered

### 1. `I` Prefix (C# style)
```typescript
interface IAuthGateway { }
class FirebaseAuthGateway implements IAuthGateway { }
```

**Rejected because**:
- Adds visual noise
- Not idiomatic in TypeScript/JavaScript
- Redundant information (TypeScript knows it's an interface)
- Makes code harder to read

### 2. `Port` Suffix
```typescript
interface AuthGatewayPort { }
class FirebaseAuthGateway implements AuthGatewayPort { }
```

**Rejected because**:
- Verbose
- "Port" is implementation detail, not domain concept
- Reads awkwardly

### 3. Abstract Classes Instead of Interfaces
```typescript
abstract class AuthGateway { }
class FirebaseAuthGateway extends AuthGateway { }
```

**Rejected because**:
- Interfaces are more flexible (multiple interface implementation)
- Interfaces have zero runtime cost
- Interfaces are TypeScript idiom for contracts

### 4. Type Aliases
```typescript
type AuthGateway = { }
class FirebaseAuthGateway implements AuthGateway { } // Can't implement type
```

**Rejected because**:
- Can't use `implements` with type aliases
- Less clear intent (types are for shapes, interfaces are for contracts)

## Implementation Notes

### ESLint Enforcement

The naming convention is enforced automatically via ESLint:

**Configuration** (`.eslintrc.cjs`):
```javascript
'@typescript-eslint/naming-convention': [
  'error',
  {
    selector: 'interface',
    format: ['PascalCase'],
    custom: {
      regex: '^I[A-Z]',
      match: false,
    },
  },
]
```

**What this does**:
- Applies to all TypeScript interfaces
- Requires PascalCase formatting
- Rejects any interface name starting with `I` followed by uppercase letter
- Raises an error during `npm run lint` or in IDE with ESLint extension

**Example errors caught**:
```typescript
// ❌ Error: I-prefix convention not allowed
export interface IAuthGateway { }
export interface IRepository { }

// ✅ Correct: No I-prefix
export interface AuthGateway { }
export interface Repository { }

// ✅ Correct: Legitimate word starting with I
export interface Interfactor { }

// ✅ Correct: Proper PascalCase for acronyms
export interface IpAddress { }  // Not IPAddress
export interface IoDevice { }   // Not IODevice
export interface IdCard { }     // Not IDCard
```

**Note**: The rule blocks `I` followed by uppercase letter, so acronyms should follow PascalCase convention (e.g., `IpAddress`, not `IPAddress`).

### Migration Strategy

No migration needed - this ADR documents the **actual current convention** used in the codebase. Previous documentation (older ADRs) used `I` prefix incorrectly and will be updated.

### Key Ports in Codebase

Current ports following this convention:
- `AuthGateway` - Authentication operations
- `BackgroundTaskService` - Background task scheduling
- `BlockSessionRepository` - Block session persistence
- `BlocklistRepository` - Blocklist persistence
- `DatabaseService` - Database initialization
- `DateProvider` - Time/date operations
- `ForegroundService` - Android foreground service for background persistence
- `InstalledAppRepository` - Installed apps data access
- `Logger` - Logging operations
- `NotificationService` - Push notifications
- `RemoteDeviceRepository` - Remote device sync persistence
- `SirenLookout` - App launch detection
- `SirensRepository` - Siren data access
- `SirenTier` - Platform-specific blocking behavior
- `TimerRepository` - Strict mode timer persistence

### Related ADRs

- [Hexagonal Architecture](../hexagonal-architecture.md) - Overall architecture
- [Dependency Injection Pattern](dependency-injection-pattern.md) - How ports are wired
- [Repository Pattern](repository-pattern.md) - Repository naming conventions

## References

- [TypeScript Handbook - Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)
- [Clean Code - Avoid Hungarian Notation](https://github.com/ryanmcdermott/clean-code-javascript#avoid-using-prefixes)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [TypeScript ESLint Naming Convention](https://typescript-eslint.io/rules/naming-convention/)
- ESLint configuration: `/.eslintrc.cjs`
- Existing codebase: `/core/_ports_/`
