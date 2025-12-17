# Class-Scoped Constants Over Module-Level Constants

Date: 2025-12-16

## Status

Accepted

## Context

When defining constants that are only used by a single class, there are two common approaches:

1. **Module-level constants**: Defined at the top of the file, outside the class
2. **Class-scoped constants**: Defined as `private static readonly` properties inside the class

```typescript
// Module-level (avoid)
const DEFAULT_TIMEOUT = 5000
const SERVICE_NAME = 'MyService'

export class MyService {
  start() {
    setTimeout(() => {}, DEFAULT_TIMEOUT)
  }
}
```

vs.

```typescript
// Class-scoped (preferred)
export class MyService {
  private static readonly DEFAULT_TIMEOUT = 5000
  private static readonly SERVICE_NAME = 'MyService'

  start() {
    setTimeout(() => {}, MyService.DEFAULT_TIMEOUT)
  }
}
```

The question is: which approach better serves code organization and maintainability?

## Decision

Use **private static readonly class properties** for constants that are only used by a single class.

### Rules

1. **Single-class constants**: Use `private static readonly` inside the class
2. **Shared constants**: Use module-level `const` when multiple classes or functions need the value
3. **Exported constants**: Use module-level `export const` when the constant is part of the public API

### Naming Convention

- Class constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_CONFIG`, `CHANNEL_ID`)
- Prefix with `private static readonly`
- Access via class name: `ClassName.CONSTANT_NAME`

### Example

```typescript
export class AndroidForegroundService implements ForegroundService {
  private static readonly DEFAULT_CONFIG: ForegroundServiceConfig = {
    title: 'TiedSiren is protecting you',
    description: 'Monitoring for blocked apps',
  }

  private static readonly CHANNEL_ID = 'tied-siren-foreground-service'

  private static readonly CHANNEL_NAME = 'TiedSiren Protection'

  async start(config?: Partial<ForegroundServiceConfig>): Promise<void> {
    const mergedConfig = {
      ...AndroidForegroundService.DEFAULT_CONFIG,
      ...config,
    }
    // ...
  }
}
```

## Consequences

### Positive

- **Encapsulation**: Constants are explicitly tied to the class that uses them
- **Discoverability**: Reading the class reveals all its constants in one place
- **Refactoring safety**: Moving or renaming the class carries its constants along
- **Clear ownership**: No ambiguity about which class owns the constant
- **IDE navigation**: Clicking on the constant navigates to the class definition

### Negative

- **Verbosity**: Accessing constants requires `ClassName.CONSTANT_NAME` prefix
- **Longer lines**: The class prefix adds characters to each usage
- **Static context**: Must use class name even inside instance methods (not `this`)

### Neutral

- **Memory**: Both approaches allocate memory once (static vs module scope)
- **Performance**: No runtime difference between the two approaches

## Alternatives Considered

### 1. Module-level constants (current common pattern)

```typescript
const DEFAULT_TIMEOUT = 5000

export class MyService {
  start() {
    setTimeout(() => {}, DEFAULT_TIMEOUT)
  }
}
```

**Rejected because**:
- Constants float above the class without clear ownership
- When file has multiple classes, unclear which constant belongs to which class
- Refactoring the class doesn't automatically move its constants

### 2. Instance properties

```typescript
export class MyService {
  private readonly DEFAULT_TIMEOUT = 5000
}
```

**Rejected because**:
- Allocates memory per instance instead of once per class
- Suggests the value could vary per instance (misleading)
- Not idiomatic for true constants

### 3. Separate constants file

```typescript
// constants.ts
export const MY_SERVICE_DEFAULT_TIMEOUT = 5000

// my-service.ts
import { MY_SERVICE_DEFAULT_TIMEOUT } from './constants'
```

**Rejected because**:
- Fragments related code across files
- Requires prefixing constant names to avoid collisions
- Adds import overhead

## Implementation Notes

### Key Files Affected

- `infra/foreground-service/android.foreground.service.ts` - First application of this pattern

### Migration

No migration required. Apply this pattern to new code and refactor existing code opportunistically.

## References

- [TypeScript Static Members](https://www.typescriptlang.org/docs/handbook/2/classes.html#static-members)
- [Effective TypeScript: Item 18 - Use readonly to Prevent Mutation](https://effectivetypescript.com/)
