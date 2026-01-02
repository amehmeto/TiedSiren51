# Type Guards for Branded Types

Date: 2026-01-02

## Status

Accepted

## Context

**Type guards should be favored over type assertions.** Type assertions (`as Type`) bypass TypeScript's type checking entirely, shifting the burden of correctness to the developer. Type guards provide runtime validation and let TypeScript narrow types safely.

TypeScript template literal types like `HHmmString` and `ISODateString` provide compile-time safety but have limitations:

```typescript
export type HHmmString = `${number}:${number}`
```

This type accepts `"12:30"` but also `"123456:789"` - it doesn't truly enforce the "HH:mm" format. When creating values of these types, we were using type assertions with eslint-disable comments:

```typescript
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- padStart guarantees HH:mm format
return `${hours}:${minutes}` as HHmmString
```

Problems with this approach:
- Type assertions bypass type checking entirely
- The safety guarantee is in a comment, not in code
- No runtime validation if inputs are incorrect
- Scattered eslint-disable comments throughout the codebase

## Decision

**Favor type guards over type assertions.** When you need to tell TypeScript that a value has a specific type, prefer runtime validation over compile-time bypasses.

| Approach | Safety | Use When |
|----------|--------|----------|
| Type guard (`is`) | Runtime + compile-time | Checking external/untrusted data |
| Assertion function (`asserts`) | Runtime + compile-time | Internal conversions with guaranteed validity |
| Type assertion (`as`) | None (bypasses checks) | **Avoid** - only as last resort with eslint-disable |

### Convention 1: Naming Convention

- Type guards: `isX()` (e.g., `isHHmmString`, `isISODateString`)
- Assertion functions: `assertX()` (e.g., `assertHHmmString`, `assertISODateString`)

### Convention 2: Define Type Guards in the Port File

Type guards live alongside their type definitions in the port file:

```typescript
// core/_ports_/date-provider.ts
export type HHmmString = `${number}:${number}`

export function isHHmmString(value: string): value is HHmmString {
  return /^\d{2}:\d{2}$/.test(value)
}
```

### Convention 3: Use Assertion Functions for Guaranteed-Valid Conversions

When the code logic guarantees validity (e.g., `padStart(2, '0')` ensures two digits), use an assertion function that throws on invalid input:

```typescript
export function assertHHmmString(value: string): asserts value is HHmmString {
  if (!isHHmmString(value)) {
    throw new Error(`Invalid HHmm format: "${value}". Expected "HH:mm" (e.g., "09:30")`)
  }
}
```

Usage in implementations:

```typescript
toHHmm(date: Date): HHmmString {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const result = `${hours}:${minutes}`
  assertHHmmString(result)
  return result
}
```

### Convention 4: Use Type Guards for External/Untrusted Data

When parsing data from external sources (database, API, user input), use the type guard with explicit handling:

```typescript
// In repository mapping
const startedAt = dbSession.startedAt
if (!isHHmmString(startedAt)) {
  throw new Error(`Invalid startedAt in database: ${startedAt}`)
}
return { ...session, startedAt }
```

### Convention 5: No eslint-disable for Type Assertions

Remove all `@typescript-eslint/consistent-type-assertions` eslint-disable comments for branded types. If a type assertion is needed, it indicates missing type guard infrastructure.

## Consequences

### Positive

- **Runtime validation** catches bugs that compile-time checks miss
- **Self-documenting** - the regex in the type guard is the source of truth
- **No eslint-disable comments** - cleaner code
- **Centralized validation** - one place to update if format requirements change
- **Better error messages** - assertion functions provide clear diagnostics

### Negative

- **Slight runtime overhead** - regex test on every conversion (negligible for date operations)
- **More verbose** - assertion call instead of inline cast
- **Migration effort** - existing assertions need updating

### Neutral

- **Testing** - type guards themselves should be tested (simple unit tests)

## Alternatives Considered

### 1. Branded Types with Symbol

```typescript
declare const HHmmBrand: unique symbol
type HHmmString = string & { [HHmmBrand]: never }
```

Rejected: More complex, still requires type assertions or factory functions, doesn't add runtime validation.

### 2. Zod/io-ts Schema Validation

```typescript
const HHmmString = z.string().regex(/^\d{2}:\d{2}$/)
```

Rejected: Adds external dependency for simple validations, overkill for internal type boundaries.

### 3. Keep Type Assertions with Comments

Rejected: Comments are not enforced, assertions bypass type checking, scattered eslint-disable noise.

## Implementation Notes

### Affected Types

| Type | Guard Function | Assertion Function |
|------|---------------|-------------------|
| `HHmmString` | `isHHmmString()` | `assertHHmmString()` |
| `ISODateString` | `isISODateString()` | `assertISODateString()` |

### Files to Update

- `core/_ports_/date-provider.ts` - Add type guards
- `infra/date-provider/real.date-provider.ts` - Replace assertions
- `infra/date-provider/stub.date-provider.ts` - Replace assertions
- `infra/block-session-repository/prisma.block-session.repository.ts` - Replace assertions

## References

- [TypeScript Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [TypeScript Assertion Functions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions)
