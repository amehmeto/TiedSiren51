# Infrastructure Layer Error Handling Conventions

Date: 2025-12-16

## Status

Accepted

## Context

Infrastructure adapters interact with external systems (databases, native modules, network services) that can fail in unpredictable ways. Without consistent error handling:

- Errors get swallowed silently, making debugging difficult
- Log messages lack context about which adapter failed
- Some adapters rethrow, others don't - inconsistent behavior
- Production issues are hard to trace back to their source

We needed standardized conventions that:
1. Ensure all errors are logged with sufficient context
2. Make errors traceable to their source adapter
3. Are enforceable via tooling (not just documentation)

## Decision

### Convention 1: Public Methods Must Have Try-Catch

All public async methods in infrastructure adapters must wrap their body in a try-catch block.

```typescript
// Good
export class PrismaBlocklistRepository implements BlocklistRepository {
  async create(payload: CreatePayload<Blocklist>): Promise<Blocklist> {
    try {
      // implementation
      return this.mapToBlocklist(created)
    } catch (error) {
      this.logger.error(`[PrismaBlocklistRepository] Failed to create: ${error}`)
      throw error
    }
  }
}

// Bad - no try-catch wrapper
export class PrismaBlocklistRepository implements BlocklistRepository {
  async create(payload: CreatePayload<Blocklist>): Promise<Blocklist> {
    // implementation without try-catch
    return this.mapToBlocklist(created)
  }
}
```

**Why public methods only?**
- Public methods are the boundary between core and infra
- Private methods should throw naturally, letting the public method handle it
- This avoids nested try-catch anti-patterns

**Enforced by:** `local-rules/infra-public-method-try-catch` ESLint rule

### Convention 2: Logger Prefix with Class Name

All `logger.error()` and `logger.warn()` calls must start with `[ClassName]` prefix.

```typescript
// Good
this.logger.error(`[PrismaBlocklistRepository] Failed to create: ${error}`)
this.logger.warn(`[AndroidForegroundService] Permission denied, continuing without notification`)

// Bad - missing prefix
this.logger.error(`Failed to create blocklist: ${error}`)
this.logger.warn(`Permission denied`)
```

**Why this format?**
- Enables filtering logs by adapter: `grep "\[PrismaBlocklistRepository\]"`
- Immediately identifies the failing component in Sentry/production logs
- Consistent format across all adapters

**Note:** `logger.info()` calls do NOT require the prefix - they're informational, not error tracing.

**Enforced by:** `local-rules/infra-logger-prefix` ESLint rule

### Convention 3: Always Rethrow After Logging

After logging an error, always rethrow it. Never swallow errors silently.

```typescript
// Good - log then rethrow
catch (error) {
  this.logger.error(`[ClassName] Failed to doSomething: ${error}`)
  throw error
}

// Bad - swallows error
catch (error) {
  this.logger.error(`[ClassName] Failed to doSomething: ${error}`)
  return // silent failure
}
```

**Exception:** Fire-and-forget operations where the caller explicitly handles errors:

```typescript
// In listener - caller handles errors
const safeStartForegroundService = async () => {
  try {
    await foregroundService.start()
  } catch (error) {
    logger.error(`Failed to start foreground service: ${error}`)
    // Intentionally not rethrowing - non-critical operation
  }
}
```

**Enforced by:** `local-rules/infra-must-rethrow` ESLint rule

### Exclusions

These conventions do NOT apply to:
- Test files (`*.test.ts`, `*.spec.ts`)
- Fake/stub implementations (`in-memory.*.ts`, `fake.*.ts`, `fake-*.ts`)
- Core layer (which has its own `no-try-catch-in-core` rule)

## Consequences

### Positive

- **Consistent error handling** across all 16+ infra adapters
- **Traceable logs** - can filter by adapter in production
- **Enforced by ESLint** - violations fail CI, not just code review
- **Auto-fixable** - both rules provide automatic fixes
- **Clear boundaries** - public methods are error boundaries, private methods are not

### Negative

- **Verbosity** - every public method needs try-catch boilerplate
- **Logger injection required** - all adapters must receive a Logger instance
- **Longer log messages** - prefix adds characters

### Neutral

- **Learning curve** - developers must learn the convention
- **Migration effort** - existing adapters needed updating (done in this PR)

## Implementation Notes

### ESLint Rules

| Rule | Purpose | Auto-fix |
|------|---------|----------|
| `infra-public-method-try-catch` | Enforce try-catch in public async methods | Yes |
| `infra-logger-prefix` | Enforce `[ClassName]` prefix in error/warn | Yes |
| `infra-must-rethrow` | Enforce rethrowing after catch | No |

### Files Affected

All infrastructure adapters in `infra/`:
- `*-repository/*.ts` - Database repositories
- `*-service/*.ts` - External services
- `*-gateway/*.ts` - Authentication gateways
- `siren-tier/*.ts` - Native module adapters

### Logger Injection Pattern

Adapters must receive logger via constructor:

```typescript
export class MyAdapter implements MyPort {
  constructor(private readonly logger: Logger) {}
}
```

Production wiring in `ui/dependencies.ts`:

```typescript
const logger = new SentryLogger()
const myAdapter = new MyAdapter(logger)
```

Test wiring uses `InMemoryLogger` for assertions:

```typescript
const logger = new InMemoryLogger()
const myAdapter = new MyAdapter(logger)
// ... test ...
expect(logger.getLogs()).toContainEqual({
  level: 'error',
  message: '[MyAdapter] Failed to doSomething: Error: ...'
})
```

## References

- [Hexagonal Architecture ADR](../hexagonal-architecture.md)
- [Repository Pattern ADR](../core/repository-pattern.md)
- [Class-Scoped Constants Convention](./class-scoped-constants.md)
