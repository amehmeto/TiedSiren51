# No Nested Call Expressions

Date: 2026-01-03

## Status

Accepted (disabled globally - enable per-file as needed)

## Context

Nested function calls like `foo(bar(x))` can reduce readability by:

1. Hiding intermediate values that aid debugging
2. Making call order unclear (inner executes first)
3. Creating long, dense expressions that are hard to scan

```typescript
// Nested (harder to read and debug)
const result = transform(parse(fetch(url)))

// Extracted (clearer flow, debuggable)
const response = fetch(url)
const parsed = parse(response)
const result = transform(parsed)
```

However, some patterns are idiomatic and readable when nested, particularly functional array methods.

## Decision

Provide an ESLint rule `local-rules/no-nested-call-expressions` that flags nested calls, with escape hatches for common patterns.

### Configuration

The rule is **disabled globally** because many valid patterns use nesting (e.g., `expect(getValue()).toBe(...)`, builder patterns). Enable it per-file where stricter style is desired.

```javascript
// .eslintrc.cjs
'local-rules/no-nested-call-expressions': 'off',
```

### Allowed Patterns

When enabled, configure `allowedPatterns` for idiomatic nesting:

```javascript
'local-rules/no-nested-call-expressions': ['error', {
  allowedPatterns: ['^map$', '^filter$', '^flatMap$', '^reduce$']
}]
```

### Examples

```typescript
// BAD - nested call obscures the intermediate value
const user = getUser(parseId(request.params.id))

// GOOD - extracted for clarity
const userId = parseId(request.params.id)
const user = getUser(userId)

// ALLOWED - functional patterns are idiomatic
const names = users.filter(isActive).map(getName)
```

## Consequences

### Positive

- **Debuggability**: Intermediate variables can be inspected
- **Readability**: Each step is on its own line
- **Self-documentation**: Variable names describe intermediate values
- **Git diffs**: Changes to one step don't affect surrounding lines

### Negative

- **Verbosity**: More lines of code
- **Naming overhead**: Must choose names for intermediate values
- **False positives**: Some nested patterns are genuinely clear

### Neutral

- **Performance**: Modern JS engines optimize both patterns equally

## Alternatives Considered

### 1. Always allow nesting

**Rejected because**: Deeply nested calls become unreadable and hard to debug.

### 2. Always forbid nesting

**Rejected because**: Some patterns (`arr.map(fn)`, test assertions) are clearer nested.

### 3. Enable globally with many exceptions

**Rejected because**: Too many false positives in practice. Better to enable per-file.

## Implementation

- ESLint rule: `eslint-rules/no-nested-call-expressions.cjs`
- Tests: `eslint-rules/no-nested-call-expressions.spec.cjs`

## References

- [ESLint Custom Rules](https://eslint.org/docs/latest/extend/custom-rules)
- Related: `local-rules/no-module-level-constants` (similar readability goal)
