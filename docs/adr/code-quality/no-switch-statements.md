# No Switch Statements Rule

Date: 2025-01-28

## Status

Accepted

## Context

Switch statements in JavaScript/TypeScript have several issues:

- **Fall-through bugs**: Easy to forget `break` statements, causing unintended fall-through
- **Non-exhaustive**: TypeScript can't enforce exhaustiveness checking reliably
- **Poor composability**: Can't easily extract or reuse switch logic
- **Testing complexity**: Each case needs individual test coverage
- **Readability**: Long switch statements become hard to scan
- **Violation of Open/Closed Principle**: Adding cases requires modifying the switch

TiedSiren51 has complex conditional logic around:
- Block session states (idle, active, paused, completed)
- Siren types (app, website, keyword)
- Blocking conditions (always, schedule-based, context-based)
- Platform differences (iOS, Android, web)

The codebase needs a consistent pattern for handling these variations that is type-safe, testable, and maintainable.

## Decision

**Ban switch statements** via ESLint rule `no-switch-statements/no-switch` and use **object maps** or **if/else chains** instead.

### Preferred Pattern: Object Maps

```typescript
// Instead of switch:
switch (sirenType) {
  case 'app':
    return handleApp()
  case 'website':
    return handleWebsite()
  case 'keyword':
    return handleKeyword()
}

// Use object map:
const handlers = {
  app: () => handleApp(),
  website: () => handleWebsite(),
  keyword: () => handleKeyword(),
} as const

return handlers[sirenType]()
```

### When Object Maps Don't Fit: If/Else

For complex conditions or ranges, use if/else:

```typescript
if (complexity <= 5) {
  return 'simple'
} else if (complexity <= 10) {
  return 'moderate'
} else {
  return 'complex'
}
```

### Enforcement

- ESLint rule in `/.eslintrc.cjs`:
  ```javascript
  'no-switch-statements/no-switch': 'error'
  ```
- Pre-commit hook prevents switch statements from being committed
- CI/CD blocks PRs with switch statements

## Consequences

### Positive

- **Type safety**: Object keys can be typed and exhaustiveness checked
- **Composability**: Object maps are first-class values (can pass around, merge, extend)
- **Testing**: Each handler can be tested in isolation
- **No fall-through bugs**: Impossible to forget break statements
- **Readability**: Clear key → value mapping
- **Open/Closed Principle**: Can extend maps without modifying existing code
- **Functional style**: Encourages thinking in terms of data structures
- **Consistency**: One pattern for conditional logic across codebase

### Negative

- **Learning curve**: Team must unlearn switch habit
- **Verbosity**: Simple switches might be more verbose as object maps
- **Performance**: Negligible overhead (object lookup vs jump table)
- **Range conditions**: Object maps don't handle ranges well (must use if/else)
- **Linter dependency**: Requires custom ESLint plugin
- **Exceptions needed**: Rare cases might genuinely need switch-like behavior

### Neutral

- **Different mental model**: Requires thinking in data structures instead of control flow
- **Pattern enforcement**: Team must remember to use object maps

## Alternatives Considered

### 1. Allow Switch Statements
**Rejected because**:
- Fall-through bugs are common
- Less type-safe in TypeScript
- Harder to compose and test
- Doesn't encourage functional patterns

### 2. Discriminated Unions Only
**Rejected because**:
- Too restrictive (doesn't cover all conditional cases)
- Doesn't solve the switch problem, just narrows it
- Still allows switch statements

### 3. Pattern Matching (TC39 Proposal)
**Rejected because**:
- Not yet standardized JavaScript
- Requires Babel plugin
- Future-facing, not production-ready
- Would reconsider when standardized

### 4. Warn Instead of Error
**Rejected because**:
- Warnings get ignored over time
- Inconsistent enforcement
- Defeats purpose of establishing pattern

## Implementation Notes

### ESLint Configuration
```javascript
// .eslintrc.cjs
module.exports = {
  plugins: ['no-switch-statements'],
  rules: {
    'no-switch-statements/no-switch': 'error',
  },
}
```

### Custom Plugin
- Plugin: `eslint-plugin-no-switch-statements`
- Installed as dev dependency
- Catches all switch statement usage

### Example Migrations

**Block Session State:**
```typescript
// Object map for state transitions
const stateTransitions = {
  idle: () => startSession(),
  active: () => pauseSession(),
  paused: () => resumeSession(),
  completed: () => archiveSession(),
} as const
```

**Siren Type Handling:**
```typescript
const sirenValidators = {
  app: validateAppSiren,
  website: validateWebsiteSiren,
  keyword: validateKeywordSiren,
} as const
```

### Related ADRs
- [TypeScript Strict Mode](typescript-strict-mode.md)
- [Complexity Limits](complexity-limits.md)
- [Custom ESLint Rules](custom-eslint-rules.md)

## References

- [ESLint Plugin](https://www.npmjs.com/package/eslint-plugin-no-switch-statements)
- `/.eslintrc.cjs:24` - Rule configuration
- [Why Not Switch](https://www.youtube.com/watch?v=zzAdEt3xZ1M) - Functional programming perspective
