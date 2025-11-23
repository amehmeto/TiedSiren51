# Complexity Limits for Code Quality

Date: 2025-01-28

## Status

Accepted

## Context

Code complexity affects maintainability, testability, and bug likelihood. TiedSiren51 has complex business logic around:

- Block session state management
- Siren matching and filtering
- Blocklist operations
- Time-based scheduling

**Complexity metrics**:
- **Cyclomatic complexity**: Number of independent paths through code
- **Cognitive complexity**: How hard code is to understand
- **Nesting depth**: How many levels of indentation

**High complexity causes**:
- Hard to understand code
- Difficult to test (many edge cases)
- More bugs
- Harder onboarding
- Slower code review

## Decision

Enforce **cyclomatic complexity limit of 10** via ESLint.

### Implementation

**.eslintrc.cjs**:
```javascript
module.exports = {
  rules: {
    'complexity': ['warn', { max: 10 }],
    'max-depth': ['warn', { max: 4 }],
    'max-nested-callbacks': ['warn', { max: 3 }],
    'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true }],
  },
}
```

## Consequences

### Positive

- **Readability**: Functions easier to understand
- **Testability**: Fewer test cases needed per function
- **Fewer bugs**: Simpler code has fewer bugs
- **Code review**: Faster, more thorough reviews
- **Refactoring pressure**: Encourages breaking down complex functions
- **Maintainability**: Easier to modify in future
- **Early warning**: Catches growing complexity before it's too late

### Negative

- **Refactoring required**: Existing complex code must be simplified
- **Sometimes restrictive**: Rare cases legitimately need higher complexity
- **Learning curve**: Team must learn to decompose functions
- **More functions**: May create many small functions
- **Can be gamed**: Can artificially reduce complexity metric

### Neutral

- **Subjective threshold**: 10 is arbitrary but reasonable
- **Warning not error**: Allows exceptions with justification

## Alternatives Considered

### 1. No Complexity Limits
**Rejected because**:
- Complexity grows unchecked
- No forcing function for simplification
- Code becomes unmaintainable

### 2. Stricter Limit (5)
**Rejected because**:
- Too restrictive for reasonable cases
- Forces over-decomposition
- May hurt readability with too many tiny functions

### 3. Looser Limit (20)
**Rejected because**:
- Allows overly complex functions
- Doesn't prevent complexity problems
- Less effective enforc

ement

### 4. Cognitive Complexity Instead
**Rejected because**:
- Harder to measure consistently
- No standard ESLint rule (yet)
- Cyclomatic complexity is proven metric

## Implementation Notes

### Key Files
- `/.eslintrc.cjs` - Complexity rule configuration

### Cyclomatic Complexity Explained

**Complexity = 1 + decision points**

Decision points:
- `if`, `else if`
- `while`, `for`, `do-while`
- `case` in switch (but we banned switch!)
- `&&`, `||` in conditions
- `catch`
- Ternary operator `? :`

**Example**:
```typescript
// Complexity = 1 (baseline) + 2 (if statements) = 3
function getUserStatus(user: User): string {
  if (!user) {
    return 'Unknown'
  }

  if (user.isActive) {
    return 'Active'
  }

  return 'Inactive'
}

// Complexity = 1 + 4 (if/else) + 2 (&&) = 7
function complexFunction(user: User, session: Session): boolean {
  if (!user && !session) {
    return false
  }

  if (user.isActive) {
    if (session.isValid) {
      return true
    } else {
      return false
    }
  } else if (user.isPending) {
    return session.isPending
  }

  return false
}
```

### Reducing Complexity

**Technique 1: Extract functions**
```typescript
// Before (complexity = 8)
function startSession(blocklist: Blocklist): Session {
  if (!blocklist.sirens.length) {
    throw new Error('Empty blocklist')
  }

  if (hasActiveSession()) {
    throw new Error('Session active')
  }

  const session = {
    id: generateId(),
    startTime: new Date(),
    blocklistId: blocklist.id,
  }

  if (blocklist.schedule) {
    if (isScheduled(blocklist.schedule)) {
      return scheduleSession(session)
    }
  }

  return startImmediately(session)
}

// After (complexity = 3 per function)
function startSession(blocklist: Blocklist): Session {
  validateBlocklist(blocklist)
  validateNoActiveSession()

  const session = createSession(blocklist)

  return blocklist.schedule
    ? scheduleSession(session, blocklist.schedule)
    : startImmediately(session)
}

function validateBlocklist(blocklist: Blocklist): void {
  if (!blocklist.sirens.length) {
    throw new Error('Empty blocklist')
  }
}

function validateNoActiveSession(): void {
  if (hasActiveSession()) {
    throw new Error('Session active')
  }
}
```

**Technique 2: Use object maps** (instead of if/else chains)
```typescript
// Before (complexity = 5)
function getSirenIcon(type: SirenType): string {
  if (type === 'app') {
    return 'phone'
  } else if (type === 'website') {
    return 'globe'
  } else if (type === 'keyword') {
    return 'search'
  } else {
    return 'question'
  }
}

// After (complexity = 1)
const sirenIcons = {
  app: 'phone',
  website: 'globe',
  keyword: 'search',
} as const

function getSirenIcon(type: SirenType): string {
  return sirenIcons[type] ?? 'question'
}
```

**Technique 3: Early returns**
```typescript
// Before (complexity = 5, nested)
function canStartSession(user: User, blocklist: Blocklist): boolean {
  if (user.isActive) {
    if (blocklist.isValid) {
      if (!hasActiveSession()) {
        return true
      }
    }
  }
  return false
}

// After (complexity = 4, but more readable)
function canStartSession(user: User, blocklist: Blocklist): boolean {
  if (!user.isActive) return false
  if (!blocklist.isValid) return false
  if (hasActiveSession()) return false

  return true
}
```

**Technique 4: Combine conditions**
```typescript
// Before (complexity = 4)
function isValid(session: Session): boolean {
  if (!session.startTime) {
    return false
  }

  if (!session.endTime) {
    return false
  }

  if (session.isActive) {
    return false
  }

  return true
}

// After (complexity = 2)
function isValid(session: Session): boolean {
  if (!session.startTime || !session.endTime || session.isActive) {
    return false
  }

  return true
}

// Or even simpler (complexity = 1)
function isValid(session: Session): boolean {
  return !!(session.startTime && session.endTime && !session.isActive)
}
```

### When to Exceed Limit

**Acceptable exceptions** (with `eslint-disable` comment):
- Complex but necessary algorithms
- State machines with many states
- Parser/validator logic
- One-time migration code

**Must**:
- Add comment explaining why complexity is necessary
- Consider refactoring anyway
- Extra test coverage for complex functions

```typescript
/* eslint-disable complexity */
function complexButNecessaryValidation(data: unknown): boolean {
  // This validator handles 15 different input formats for legacy compatibility
  // Breaking it up would hurt readability more than high complexity
  // TODO: Refactor when legacy formats are deprecated

  // ... complex logic here
}
/* eslint-enable complexity */
```

### Related ADRs
- [No Switch Statements](no-switch-statements.md)
- [TypeScript Strict Mode](typescript-strict-mode.md)
- [Custom ESLint Rules](custom-eslint-rules.md)

## References

- [Cyclomatic Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
- [ESLint complexity rule](https://eslint.org/docs/latest/rules/complexity)
- `/.eslintrc.cjs` - Configuration
