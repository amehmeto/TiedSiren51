# Implementation Plan: In-Memory Logger

## Technical Context

| Aspect | Details |
|--------|---------|
| Architecture | Ports & Adapters (Hexagonal) |
| Language | TypeScript |
| Test Framework | Vitest |
| Existing Patterns | `core/_ports_/` for interfaces, `infra/{name}/` for implementations |
| Dependencies | DateProvider (existing port) |

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Follow existing patterns | ✅ Pass | Uses ports & adapters like other services |
| Testability | ✅ Pass | Injectable, mockable, inspectable logs |
| No external dependencies | ✅ Pass | Pure TypeScript implementation |
| Type safety | ✅ Pass | Full TypeScript with strict types |

## Implementation Tasks

### Task 1: Create Logger Interface (Port)

**File:** `core/_ports_/logger.ts`

**Acceptance Criteria:**
- [ ] Define `LogLevel` type: `'info' | 'warn' | 'error'`
- [ ] Define `LogEntry` interface with timestamp, level, message
- [ ] Define `Logger` interface with info(), warn(), error() methods
- [ ] Export all types

**Dependencies:** None

---

### Task 2: Create InMemoryLogger Implementation

**File:** `infra/logger/in-memory.logger.ts`

**Acceptance Criteria:**
- [ ] Create `InMemoryLogger` class implementing `Logger` interface
- [ ] Accept `DateProvider` as constructor dependency
- [ ] Implement `info()` method - creates LogEntry with level 'info'
- [ ] Implement `warn()` method - creates LogEntry with level 'warn'
- [ ] Implement `error()` method - creates LogEntry with level 'error'
- [ ] Implement `getLogs()` method - returns copy of logs array
- [ ] Implement `clear()` method - empties logs array
- [ ] Use DateProvider.getISOStringNow() for timestamps

**Dependencies:** Task 1

---

### Task 3: Write Unit Tests for InMemoryLogger

**File:** `infra/logger/in-memory.logger.spec.ts`

**Test Cases:**
- [ ] `info()` stores entry with level 'info'
- [ ] `warn()` stores entry with level 'warn'
- [ ] `error()` stores entry with level 'error'
- [ ] Each log entry has correct timestamp from DateProvider
- [ ] Each log entry has correct message
- [ ] `getLogs()` returns all logged entries in order
- [ ] `getLogs()` returns copy (not reference to internal array)
- [ ] `clear()` removes all entries
- [ ] Logger starts with empty logs
- [ ] Multiple log calls accumulate entries

**Dependencies:** Task 2

---

### Task 4: Verify Integration with Existing Codebase

**Actions:**
- [ ] Run full test suite to ensure no regressions
- [ ] Run ESLint to verify code style compliance
- [ ] Verify TypeScript compilation succeeds

**Dependencies:** Task 3

## File Structure

```
core/_ports_/
  logger.ts                    # NEW: Logger interface + types

infra/logger/                  # NEW: Directory
  in-memory.logger.ts          # NEW: InMemoryLogger implementation
  in-memory.logger.spec.ts     # NEW: Unit tests
```

## Implementation Order

```
Task 1 (Interface)
     │
     ▼
Task 2 (Implementation)
     │
     ▼
Task 3 (Tests)
     │
     ▼
Task 4 (Verification)
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing code | Logger is purely additive, no changes to existing files |
| Import path issues | Use existing `@/` alias pattern |
| Test isolation | Use fresh logger instance per test with beforeEach |

## Out of Scope (Explicit)

- Migration of existing console.log statements (separate task)
- Sentry integration (future feature)
- Console output implementation
- Log filtering by level

## Success Verification

After implementation, verify:
1. `npm test` passes with new tests included
2. `npm run lint` passes
3. `npx tsc` compiles without errors
4. InMemoryLogger can be instantiated and used as shown in quickstart.md
