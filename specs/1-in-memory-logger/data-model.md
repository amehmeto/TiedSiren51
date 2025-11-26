# Data Model: In-Memory Logger

## Entities

### LogLevel (Type)

A union type representing the severity of a log entry.

```
LogLevel = 'info' | 'warn' | 'error'
```

| Value | Description |
|-------|-------------|
| `info` | Informational messages for general application flow |
| `warn` | Warning messages for potentially problematic situations |
| `error` | Error messages for failures and exceptions |

### LogEntry (Type)

Represents a single log entry captured by the logger.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `timestamp` | string | ISO 8601 formatted date-time | Required, format: `YYYY-MM-DDTHH:mm:ss.sssZ` |
| `level` | LogLevel | Severity level of the log | Required, one of: `info`, `warn`, `error` |
| `message` | string | The log message content | Required, non-empty string |

**Example:**
```json
{
  "timestamp": "2025-11-26T10:30:00.000Z",
  "level": "info",
  "message": "User authentication successful"
}
```

## Interfaces

### Logger (Port Interface)

The contract that all logger implementations must fulfill.

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `info` | `message: string` | `void` | Log an informational message |
| `warn` | `message: string` | `void` | Log a warning message |
| `error` | `message: string` | `void` | Log an error message |

### InMemoryLogger (Implementation)

Extends Logger interface with additional methods for log inspection and management.

| Property/Method | Type | Description |
|-----------------|------|-------------|
| `logs` | `LogEntry[]` | Internal storage for log entries (read via `getLogs()`) |
| `info(message)` | `void` | Implements Logger.info |
| `warn(message)` | `void` | Implements Logger.warn |
| `error(message)` | `void` | Implements Logger.error |
| `getLogs()` | `LogEntry[]` | Returns copy of all stored log entries |
| `clear()` | `void` | Removes all stored log entries |

## Relationships

```
┌─────────────────┐
│    Logger       │  (Interface - Port)
│─────────────────│
│ + info()        │
│ + warn()        │
│ + error()       │
└────────┬────────┘
         │ implements
         │
┌────────▼────────┐       ┌─────────────────┐
│ InMemoryLogger  │──────▶│  DateProvider   │  (Dependency)
│─────────────────│       └─────────────────┘
│ - logs[]        │
│ + getLogs()     │
│ + clear()       │
└─────────────────┘
         │
         │ stores
         ▼
┌─────────────────┐
│    LogEntry     │  (Value Object)
│─────────────────│
│ timestamp       │
│ level           │
│ message         │
└─────────────────┘
```

## Validation Rules

| Rule | Entity | Field | Constraint |
|------|--------|-------|------------|
| V1 | LogEntry | timestamp | Must be valid ISO 8601 format |
| V2 | LogEntry | level | Must be one of: 'info', 'warn', 'error' |
| V3 | LogEntry | message | Must be non-empty string |

## State Transitions

The InMemoryLogger has a simple accumulative state:

```
[Empty] ──log()──▶ [Has Entries] ──log()──▶ [Has More Entries]
   ▲                    │                         │
   │                    │                         │
   └────────clear()─────┴─────────clear()─────────┘
```

- **Empty**: Initial state, `logs = []`
- **Has Entries**: After any `info()`, `warn()`, or `error()` call
- **clear()**: Returns to Empty state from any state
