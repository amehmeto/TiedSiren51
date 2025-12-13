# Research: In-Memory Logger

## Technical Context Analysis

### Existing Architecture Patterns

**Decision:** Follow the existing ports & adapters pattern
**Rationale:** The codebase consistently uses:
- Interfaces in `core/_ports_/` (e.g., `database.service.ts`, `notification.service.ts`, `date-provider.ts`)
- Implementations in `infra/{service-name}/` (e.g., `infra/database-service/`, `infra/date-provider/`)
- Naming convention: `{implementation}.{service-name}.ts` (e.g., `stub.database.service.ts`, `real.date-provider.ts`)

**Alternatives considered:**
- Global singleton logger - rejected as it breaks testability and DI patterns
- Context-based logging - over-engineered for current needs

### Interface Naming Convention

**Decision:** Use `Logger` interface in `core/_ports_/logger.ts`
**Rationale:** Follows pattern of other ports (`DatabaseService`, `NotificationService`, `DateProvider`)
**Alternatives considered:**
- `LoggerService` - inconsistent, some ports use "Service", others don't
- `LoggingPort` - "Port" suffix not used in existing codebase

### Implementation Naming

**Decision:** Use `in-memory.logger.ts` in `infra/logger/`
**Rationale:** Follows existing patterns like `stub.database.service.ts`, `fake.notification.service.ts`
**Alternatives considered:**
- `memory.logger.ts` - less explicit
- `fake.logger.ts` - "fake" implies test double, this is a real implementation for in-memory storage

### DateProvider Dependency

**Decision:** Inject `DateProvider` for timestamp generation
**Rationale:**
- Enables testable timestamps
- Follows existing pattern (StubDateProvider has controllable `now` property)
- Consistent with codebase's DI approach

**Alternatives considered:**
- Using `new Date()` directly - untestable, can't verify timestamps
- Optional timestamp parameter - adds complexity to every log call

### Log Level Type

**Decision:** Use TypeScript union type `'info' | 'warn' | 'error'`
**Rationale:** Simple, type-safe, matches common logging levels
**Alternatives considered:**
- Enum - adds unnecessary complexity for 3 values
- Numeric levels - less readable, not needed without filtering

### Log Entry Structure

**Decision:** Simple object with `timestamp`, `level`, `message`
**Rationale:** Minimum viable structure that supports all use cases in spec
**Alternatives considered:**
- Including stack traces - out of scope, add later if needed
- Metadata/context field - over-engineering for MVP

## Dependencies

| Dependency | Purpose | Notes |
|------------|---------|-------|
| DateProvider | Timestamp generation | Existing port, inject via constructor |
| None (external) | N/A | Pure TypeScript, no external libs needed |

## File Structure

```
core/_ports_/
  logger.ts              # Logger interface + LogEntry type

infra/logger/
  in-memory.logger.ts    # InMemoryLogger implementation
  in-memory.logger.spec.ts  # Unit tests
```

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking existing code | Logger is additive, no existing code changes required |
| Performance overhead | In-memory storage is negligible; logs can be cleared |
| Memory growth | `clear()` method provided; document usage patterns |

## Resolved Clarifications

All technical decisions are resolved. No NEEDS CLARIFICATION items remain.
