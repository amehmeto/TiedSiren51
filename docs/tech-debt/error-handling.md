# Error Handling Enhancement

**Priority**: 🚨 **HIGH**
**Effort**: Medium
**Status**: Open
**Created**: January 28, 2025

## Problem Statement

Current error handling is generic and makes debugging difficult:

- Generic `Error` objects don't provide context
- Stack traces don't help identify error source (infra vs core vs ui)
- Error messages might hide important implementation details
- No structured error codes for programmatic handling
- Difficult to distinguish between recoverable and fatal errors

## Current Issues

```typescript
// Current approach - too generic
catch (error) {
  throw new Error('Failed to save blocklist')
}

// What we need
catch (error) {
  throw new DatabaseError('Failed to save blocklist', {
    cause: error,
    code: 'BLOCKLIST_SAVE_FAILED',
    layer: 'infrastructure',
    recoverable: true
  })
}
```

## Proposed Solution

### 1. Create Custom Error Hierarchy

```typescript
// core/errors/base.error.ts
export abstract class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly layer: 'ui' | 'core' | 'infrastructure',
    public readonly recoverable: boolean,
    public readonly cause?: Error,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

// infrastructure/errors/database.error.ts
export class DatabaseError extends ApplicationError {
  constructor(message: string, cause?: Error) {
    super(message, 'DATABASE_ERROR', 'infrastructure', true, cause)
  }
}

// core/errors/domain.error.ts
export class DomainValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 'core', true)
  }
}
```

### 2. Error Handler Utilities

```typescript
// utils/error-handler.ts
export function handleError(error: unknown): UserFacingError {
  if (error instanceof ApplicationError) {
    return {
      message: getUserMessage(error.code),
      recoverable: error.recoverable,
      code: error.code,
    }
  }

  // Unknown errors are treated as non-recoverable
  return {
    message: 'An unexpected error occurred',
    recoverable: false,
    code: 'UNKNOWN_ERROR',
  }
}
```

### 3. Error Codes Catalog

Maintain a central catalog of error codes with user-friendly messages:

```typescript
// core/errors/error-codes.ts
export const ERROR_MESSAGES: Record<string, string> = {
  DATABASE_ERROR: 'Could not save your changes. Please try again.',
  NETWORK_ERROR: 'Connection lost. Check your internet connection.',
  VALIDATION_ERROR: 'Invalid input. Please check your data.',
  // ...
}
```

## Benefits

- **Better debugging**: Know exactly where errors originate
- **User-friendly messages**: Map error codes to helpful messages
- **Programmatic handling**: Code can react differently to error types
- **Better logging**: Structured errors are easier to log and analyze
- **Type safety**: TypeScript can enforce error handling patterns

## Implementation Plan

1. **Phase 1**: Create base error classes (1-2 hours)
2. **Phase 2**: Add error types for infrastructure layer (2-3 hours)
3. **Phase 3**: Add error types for core layer (2-3 hours)
4. **Phase 4**: Update error handling in existing code (4-6 hours)
5. **Phase 5**: Add error handler utilities and UI integration (2-3 hours)

**Total Estimated Effort**: ~2-3 days

## Trigger Points

Address when:
- First error reports from production users (if not already done)
- Debugging becomes consistently difficult
- Before launching to a larger user base

## Related ADRs

- [Hexagonal Architecture](../adr/core/hexagonal-architecture.md) - Error handling at layer boundaries
- [Dependency Injection Pattern](../adr/core/dependency-injection-pattern.md) - Injecting error handlers

## References

- [TypeScript Custom Errors](https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript)
- [Error Handling Best Practices](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#example-6)
