# TypeScript Strict Mode

Date: 2025-01-28

## Status

Accepted

## Context

TypeScript offers varying levels of type checking strictness. TiedSiren51 is a complex application with:

- Multiple domains (auth, siren, blocklist, session)
- External dependencies (repositories, services)
- Async operations
- Redux state management

**Loose TypeScript** (`strict: false`):
- Faster to write code
- Allows implicit `any`
- Nullable values not checked
- Runtime type errors possible

**Strict TypeScript** (`strict: true`):
- Compile-time error detection
- Explicit types required
- Null/undefined safety
- Function parameter checking
- Slower initial development

## Decision

Enable **TypeScript Strict Mode** with all strictness flags.

### Configuration

**tsconfig.json**:
```json
{
  "compilerOptions": {
    // Core strict mode
    "strict": true,

    // Strict flag components (enabled by strict:true)
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional strictness
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

## Consequences

### Positive

- **Catch bugs early**: Many bugs caught at compile time
- **Type safety**: No implicit `any`, all types explicit
- **Null safety**: Null/undefined handled explicitly
- **Refactoring confidence**: Compiler catches breaking changes
- **Self-documenting**: Types serve as documentation
- **IDE support**: Better autocomplete and IntelliSense
- **Function safety**: Function parameter types enforced
- **No unused code**: Detects unused variables/parameters
- **Return value safety**: All code paths must return value
- **Index safety**: Accessing object/array keys checked

### Negative

- **Slower initial development**: Must satisfy type checker
- **Learning curve**: Team must understand strict TypeScript
- **More verbose**: Must write explicit types
- **External library issues**: Poorly-typed libraries cause friction
- **Strictness can be too strict**: Sometimes need escape hatches
- **Migration effort**: Existing code needed updates for strict mode

### Neutral

- **Trade-off**: Development speed vs type safety
- **Discipline required**: Team must not abuse `as any`

## Alternatives Considered

### 1. Loose TypeScript (strict: false)
**Rejected because**:
```typescript
// Allows dangerous code
let user  // Implicitly any
user.name.toUpperCase()  // Runtime error if user is undefined
```
- Too many runtime errors
- Loses TypeScript benefits
- False confidence (it compiles!)

### 2. Partial Strictness
**Rejected because**:
- Inconsistent codebase
- Some files strict, others not
- Confusing for team
- Doesn't prevent bugs uniformly

### 3. Flow
**Rejected because**:
- Smaller ecosystem than TypeScript
- Less tooling support
- Declining community
- Migration difficulty

### 4. No Types (Plain JavaScript)
**Rejected because**:
- No compile-time checks
- Poor IDE support
- Higher bug rate
- Harder refactoring

## Implementation Notes

### Key Files
- `/tsconfig.json` - TypeScript configuration
- All `.ts` and `.tsx` files follow strict mode

### Strict Flags Explained

**`noImplicitAny`**: No implicit any types
```typescript
// ❌ Error
function add(a, b) {  // Parameters implicitly any
  return a + b
}

// ✅ Correct
function add(a: number, b: number): number {
  return a + b
}
```

**`strictNullChecks`**: Null/undefined must be handled
```typescript
// ❌ Error
const user: User = getUser()  // might be undefined
user.name.toUpperCase()

// ✅ Correct
const user = getUser()
if (user) {
  user.name.toUpperCase()
}

// Or
const user = getUser()
user?.name.toUpperCase()
```

**`noUnusedLocals`**: No unused variables
```typescript
// ❌ Error
const unused = 'value'  // Declared but never used

// ✅ Correct (prefix with _ if intentional)
const _ignored = 'value'
```

**`noImplicitReturns`**: All code paths must return
```typescript
// ❌ Error
function getUserName(user: User): string {
  if (user.name) {
    return user.name
  }
  // Missing return for other path
}

// ✅ Correct
function getUserName(user: User): string {
  if (user.name) {
    return user.name
  }
  return 'Anonymous'
}
```

**`noUncheckedIndexedAccess`**: Array/object access returns T | undefined
```typescript
// ❌ Error (without strict)
const items = ['a', 'b', 'c']
const item: string = items[10]  // Might be undefined!

// ✅ Correct (with strict)
const items = ['a', 'b', 'c']
const item: string | undefined = items[10]

if (item) {
  item.toUpperCase()
}
```

### Escape Hatches (Use Sparingly)

**Type assertions** (when you know better than compiler):
```typescript
// Use only when truly necessary
const value = unknownValue as KnownType
```

**Non-null assertion** (when you're certain value exists):
```typescript
// Use only when you're certain
const user = users.find(u => u.id === '1')!
```

**Any type** (last resort):
```typescript
// Avoid, but sometimes needed for poorly-typed libraries
const weirdLibraryValue: any = someLibrary.getValue()
```

### Common Patterns

**Optional chaining**:
```typescript
user?.profile?.avatar?.url
```

**Nullish coalescing**:
```typescript
const name = user.name ?? 'Anonymous'
```

**Type guards**:
```typescript
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value
}

if (isUser(data)) {
  // data is typed as User here
  console.log(data.id)
}
```

**Discriminated unions**:
```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

function handleResult(result: Result<User>) {
  if (result.success) {
    console.log(result.data.name)  // ✅ Type-safe
  } else {
    console.log(result.error)  // ✅ Type-safe
  }
}
```

### Related ADRs
- [No Switch Statements](no-switch-statements.md)
- [Complexity Limits](complexity-limits.md)
- [Path Aliases](path-aliases.md)

## References

- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- `/tsconfig.json` - Configuration
