# Feature Specification: In-Memory Logger

## Overview

Replace all `console.log` statements (currently suppressed with `eslint-disable no-console` comments) with a centralized logging abstraction. This establishes a proper logging dependency that can be injected, tested, and later extended to support external logging services like Sentry.

## Problem Statement

The codebase currently has 18+ locations using `console.log` with disabled ESLint rules. This approach:
- Makes it difficult to control logging behavior across environments
- Prevents centralized log management and filtering
- Blocks future integration with external logging/monitoring services
- Makes testing components that log more difficult

## User Scenarios & Testing

### Scenario 1: Developer Debugging Locally
**As a** developer working on the application
**I want** log messages to be captured in memory during development
**So that** I can inspect logs without cluttering the console output

**Acceptance Criteria:**
- Logs are stored in an accessible in-memory collection
- Logs include timestamp, level, and message
- Logs can be retrieved programmatically for inspection

### Scenario 2: Running Automated Tests
**As a** developer running unit tests
**I want** a logger that captures logs without side effects
**So that** I can verify logging behavior in tests and keep test output clean

**Acceptance Criteria:**
- Logger can be injected as a dependency
- Logs can be cleared between test runs
- Test assertions can verify log messages were recorded

### Scenario 3: Future Production Monitoring (Out of Scope for MVP)
**As a** future requirement
**I want** the logging abstraction to support different implementations
**So that** I can swap in Sentry or other logging services without changing business logic

**Acceptance Criteria:**
- Logger follows the same interface pattern used by other ports in the codebase
- Implementation can be swapped via dependency injection

## Functional Requirements

### FR-1: Logger Interface (Port)
The system shall provide a `Logger` interface in `core/_ports_/` that defines:
- A method to log informational messages
- A method to log warning messages
- A method to log error messages
- Each log entry shall include: timestamp, log level, and message content

### FR-2: In-Memory Logger Implementation
The system shall provide an `InMemoryLogger` implementation in `infra/` that:
- Implements the Logger interface
- Stores all log entries in an in-memory collection
- Provides a method to retrieve all stored logs
- Provides a method to clear all stored logs

### FR-3: Console.log Replacement
The system shall enable replacement of existing `console.log` statements:
- All locations currently using `// eslint-disable-next-line no-console` can be refactored to use the Logger interface
- The InMemoryLogger shall be used in test and development contexts
- ESLint disable comments for `no-console` can be removed after migration

## Non-Functional Requirements

### NFR-1: Consistency with Existing Architecture
- The Logger interface shall follow the same patterns as existing ports (e.g., `NotificationService`, `DatabaseService`)
- The implementation naming convention shall follow existing patterns (e.g., `in-memory.logger.ts`)

### NFR-2: Testability
- The InMemoryLogger shall be fully testable without external dependencies
- The Logger interface shall enable easy mocking in consumer tests

## Success Criteria

- All 18+ existing `console.log` statements with disabled ESLint rules can be migrated to use the Logger interface
- Tests can verify that specific log messages were recorded
- Log entries include timestamp, level, and message
- The InMemoryLogger has unit test coverage
- No ESLint `no-console` disable comments remain after full migration (out of scope for this feature - migration is separate work)

## Out of Scope

- Sentry integration (will be implemented as a separate `SentryLogger` concretion later)
- Console output for production builds
- Log level filtering
- Log persistence to storage
- Migration of existing console.log statements (separate task after logger is available)

## Assumptions

- The existing ports & adapters architecture (`core/_ports_/` for interfaces, `infra/` for implementations) is the correct pattern to follow
- The InMemoryLogger is primarily for testing and development purposes
- Log levels of info, warn, and error are sufficient for current needs
- Timestamps should use ISO 8601 format for consistency

## Dependencies

- None - this is a foundational infrastructure component

## Key Entities

### LogEntry
- `timestamp`: ISO 8601 formatted date-time string
- `level`: "info" | "warn" | "error"
- `message`: string content of the log

### Logger (Interface)
- `info(message: string): void`
- `warn(message: string): void`
- `error(message: string): void`

### InMemoryLogger (Implementation)
- Implements Logger interface
- `logs: LogEntry[]` - stored log entries
- `getLogs(): LogEntry[]` - retrieve all logs
- `clear(): void` - clear all logs
