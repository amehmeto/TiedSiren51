# Quickstart: In-Memory Logger

## Overview

The In-Memory Logger provides a simple, injectable logging abstraction that stores log entries in memory. It's designed for testing and development scenarios where you need to capture and verify log output.

## Usage

### Basic Logging

```typescript
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'

// Create logger with date provider
const dateProvider = new StubDateProvider()
const logger = new InMemoryLogger(dateProvider)

// Log messages
logger.info('Application started')
logger.warn('Cache miss detected')
logger.error('Failed to connect to database')
```

### Retrieving Logs

```typescript
// Get all logged entries
const logs = logger.getLogs()

// Each entry has: timestamp, level, message
logs.forEach(entry => {
  console.log(`[${entry.level}] ${entry.timestamp}: ${entry.message}`)
})
```

### Clearing Logs

```typescript
// Clear all stored logs (useful between test runs)
logger.clear()
```

## Testing Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'

describe('MyService', () => {
  let logger: InMemoryLogger
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    logger = new InMemoryLogger(dateProvider)
  })

  it('should log when operation completes', () => {
    const service = new MyService(logger)

    service.doSomething()

    const logs = logger.getLogs()
    expect(logs).toHaveLength(1)
    expect(logs[0].level).toBe('info')
    expect(logs[0].message).toContain('operation completed')
  })

  it('should log error on failure', () => {
    const service = new MyService(logger)

    service.doSomethingThatFails()

    const logs = logger.getLogs()
    expect(logs.some(log => log.level === 'error')).toBe(true)
  })
})
```

## Injecting as Dependency

```typescript
// In your service/class
class AuthGateway {
  constructor(private logger: Logger) {}

  async login(email: string): Promise<void> {
    this.logger.info(`Login attempt for ${email}`)
    // ... login logic
  }
}

// In production/development
const authGateway = new AuthGateway(new InMemoryLogger(dateProvider))

// In tests
const testLogger = new InMemoryLogger(new StubDateProvider())
const authGateway = new AuthGateway(testLogger)
```

## Log Entry Structure

Each log entry contains:

| Field | Type | Example |
|-------|------|---------|
| `timestamp` | string (ISO 8601) | `"2025-11-26T10:30:00.000Z"` |
| `level` | `'info' \| 'warn' \| 'error'` | `"info"` |
| `message` | string | `"User logged in successfully"` |

## Future Extensions

The `Logger` interface is designed to support additional implementations:

- **SentryLogger**: Send logs to Sentry for production monitoring
- **ConsoleLogger**: Output to console for local development
- **CompositeLogger**: Route logs to multiple destinations

All implementations use the same interface, enabling seamless swapping via dependency injection.
