# Data Builder Pattern

Date: 2025-11-23

## Status

Accepted

## Context

Tests require creating complex domain objects with many required fields. Creating these objects inline in every test leads to:

- **Verbose setup code**: 10+ lines to create a single test object
- **Test fragility**: Schema changes break many unrelated tests
- **Poor readability**: Setup code obscures the test's intent
- **Duplication**: Same object creation logic repeated across test files
- **Missing defaults**: Every test must specify all fields, even irrelevant ones

Example of the problem:

```typescript
it('should block Instagram during session', () => {
  const siren = {
    packageName: 'com.example.instagram',
    appName: 'Instagram',
    icon: 'base64...',
  }

  const blocklist = {
    id: 'uuid-1',
    name: 'Social Media',
    sirens: {
      android: [siren],
      ios: [],
      linux: [],
      macos: [],
      windows: [],
      websites: [],
      keywords: [],
    },
  }

  const session = {
    id: 'uuid-2',
    name: 'Work time',
    startedAt: '09:00',
    endedAt: '17:00',
    startNotificationId: 'notif-1',
    endNotificationId: 'notif-2',
    blocklists: [blocklist],
    devices: [...],
    blockingConditions: ['TIME'],
  }

  // Actual test logic buried after 30+ lines of setup
})
```

We need a pattern that:
- Provides sensible defaults for all object fields
- Allows selective overriding of specific fields
- Is type-safe and discoverable via IDE autocomplete
- Reduces test setup to 1-2 lines
- Is simple to understand and maintain

## Decision

Use the **Data Builder Pattern** with function-based builders that accept partial overrides.

### Implementation

**1. Builder Function Structure**

Each domain entity has a builder function in `core/_tests_/data-builders/{domain}.builder.ts`:

```typescript
import { faker } from '@faker-js/faker'
import { AndroidSiren } from '../../siren/sirens'

export function buildAndroidSiren(
  wantedAndroidSiren: Partial<AndroidSiren> = {},
): AndroidSiren {
  const randomAndroidSiren: AndroidSiren = {
    packageName: faker.internet.domainName(),
    appName: faker.company.name(),
    icon: faker.image.dataUri(),
  }

  return { ...randomAndroidSiren, ...wantedAndroidSiren }
}
```

**2. Using Builders in Tests**

```typescript
import { buildAndroidSiren, buildBlocklist, buildBlockSession } from '@core/_tests_/data-builders'

it('should block Instagram during session', () => {
  const siren = buildAndroidSiren({ appName: 'Instagram' })
  const blocklist = buildBlocklist({ sirens: { android: [siren] } })
  const session = buildBlockSession({ blocklists: [blocklist] })

  // Test logic - setup reduced from 30+ lines to 3
})
```

**3. Named Exports for Common Test Data**

Export commonly used test objects as named constants:

```typescript
// In android-siren.builder.ts
export const instagramAndroidSiren = buildAndroidSiren({
  packageName: 'com.example.instagram',
  appName: 'Instagram',
  icon: InstagramAppIcon,
})

export const facebookAndroidSiren = buildAndroidSiren({
  packageName: 'com.facebook.katana',
  appName: 'Facebook',
  icon: FacebookAppIcon,
})

// In tests
import { instagramAndroidSiren } from '@core/_tests_/data-builders/android-siren.builder'

it('blocks Instagram', () => {
  const blocklist = buildBlocklist({
    sirens: { android: [instagramAndroidSiren] }
  })
  // ...
})
```

**4. Deep Partial for Nested Objects**

Use `PartialDeep` from `type-fest` for complex nested structures:

```typescript
import type { PartialDeep } from 'type-fest'
import { Blocklist } from '../../blocklist/blocklist'

export function buildBlocklist(
  wantedBlocklist: PartialDeep<Blocklist> = {},
): Blocklist {
  const defaultSirens = {
    android: [buildAndroidSiren()],
    ios: [],
    linux: [],
    macos: [],
    windows: [],
    websites: [faker.internet.domainName()],
    keywords: [faker.lorem.word()],
  }

  const randomBlocklist: Blocklist = {
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(['Work', 'Social', 'Games']),
    sirens: defaultSirens,
  }

  return {
    ...randomBlocklist,
    ...wantedBlocklist,
    sirens: wantedBlocklist.sirens
      ? {
          android: wantedBlocklist.sirens.android ?? defaultSirens.android,
          ios: wantedBlocklist.sirens.ios ?? defaultSirens.ios,
          // ... handle each nested field
        }
      : defaultSirens,
  }
}
```

**5. Composing Builders**

Builders can call other builders to create complex object graphs:

```typescript
export const buildBlockSession = (
  wantedBlockSession: Partial<BlockSession> = {},
): BlockSession => {
  const defaultBlockSession = {
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(['Work time', 'Sleep time']),
    startedAt: '09:00',
    endedAt: '17:00',
    startNotificationId: faker.string.uuid(),
    endNotificationId: faker.string.uuid(),
    blocklists: [buildBlocklist()],      // Compose with blocklist builder
    devices: [buildDevice(), buildDevice()], // Compose with device builder
    blockingConditions: [BlockingConditions.TIME],
  }

  return { ...defaultBlockSession, ...wantedBlockSession }
}
```

## Consequences

### Positive

- **Concise**: 1-2 lines vs 30+ lines of setup
- **Readable**: Test intent is clear, setup doesn't obscure logic
- **Type-safe**: TypeScript ensures overrides match entity shape
- **Discoverable**: IDE autocomplete shows available fields
- **Maintainable**: Schema changes only require updating the builder
- **Flexible**: Override any field(s) needed for specific test
- **Reusable**: Builders and named exports shared across all tests
- **Deterministic when needed**: Can override random values for specific tests
- **Composable**: Builders can use other builders
- **Simple**: Just functions and spread operators, no complex APIs
- **Faker integration**: Realistic random data when randomness is acceptable

### Negative

- **Indirection**: Must look at builder to see default values
- **Setup cost**: Initial time to create builders for each domain entity
- **Maintenance burden**: Builders need updates when schemas change
- **Hidden behavior**: Random data via faker can make tests non-deterministic
- **Deep merging complexity**: Nested objects require careful merging logic
- **Partial<T> limitations**: Deep nesting requires `PartialDeep` from external lib

### Neutral

- **Convention over configuration**: Team must learn the pattern
- **File organization**: Separate directory for builders
- **Import overhead**: Tests must import relevant builders

## Alternatives Considered

### 1. Inline Object Literals

Create objects directly in each test.

**Rejected because**:
- Verbose and repetitive
- Schema changes break many tests
- Obscures test intent

### 2. Fixture Pattern (Given/When/Then)

Use fixture functions with given/when/then API (see [Fixture Pattern ADR](fixture-pattern.md)).

**Rejected because**:
- More complex API than needed for simple object creation
- Overkill for basic data building
- Better suited for integration tests with stateful setup

**Note**: Both patterns coexist - fixtures for complex test scenarios, builders for simple object creation.

### 3. Class-Based Builders

Use classes with fluent builder methods:

```typescript
class SirenBuilder {
  private siren: AndroidSiren = defaultSiren()

  withAppName(name: string) {
    this.siren.appName = name
    return this
  }

  withPackageName(pkg: string) {
    this.siren.packageName = pkg
    return this
  }

  build() {
    return this.siren
  }
}

// Usage
const siren = new SirenBuilder()
  .withAppName('Instagram')
  .withPackageName('com.instagram')
  .build()
```

**Rejected because**:
- More boilerplate (classes vs functions)
- Verbose method definitions for each field
- Less idiomatic JavaScript/TypeScript
- Overkill for simple object creation

### 4. Factory Functions Without Defaults

Simple factory functions but require all fields:

```typescript
export function createSiren(siren: AndroidSiren): AndroidSiren {
  return siren
}
```

**Rejected because**:
- No benefit over plain object literals
- Doesn't solve verbosity problem

### 5. Mock Libraries (e.g., test-data-bot)

Use third-party libraries for test data generation.

**Rejected because**:
- External dependency
- Learning curve for library API
- Our simple pattern is sufficient
- We already use faker for randomization

## Implementation Notes

### File Structure

```
core/_tests_/data-builders/
├── android-siren.builder.ts
├── blocklist.builder.ts
├── block-session.builder.ts
├── device.builder.ts
└── sirens.builder.ts
```

### Naming Conventions

- **Files**: `{domain}.builder.ts`
- **Functions**: `build{Domain}(overrides?)`
- **Named exports**: `{specificName}{Domain}` (e.g., `instagramAndroidSiren`)
- **Parameters**: `wanted{Domain}` for partial overrides

### Example: Complete Builder

```typescript
// core/_tests_/data-builders/android-siren.builder.ts
import { faker } from '@faker-js/faker'
import { InstagramAppIcon } from '@/assets/base64AppIcon/instagramAppIcon'
import { FacebookAppIcon } from '@/assets/base64AppIcon/facebookAppIcon'
import { AndroidSiren } from '../../siren/sirens'

export function buildAndroidSiren(
  wantedAndroidSiren: Partial<AndroidSiren> = {},
): AndroidSiren {
  const androidSirens = [
    {
      packageName: 'com.example.instagram',
      appName: 'Instagram',
      icon: InstagramAppIcon,
    },
    {
      packageName: 'com.facebook.katana',
      appName: 'Facebook',
      icon: FacebookAppIcon,
    },
  ]

  const randomAndroidSiren: AndroidSiren =
    faker.helpers.arrayElement(androidSirens)

  return { ...randomAndroidSiren, ...wantedAndroidSiren }
}

// Named exports for common cases
export const instagramAndroidSiren = buildAndroidSiren({
  packageName: 'com.example.instagram',
  appName: 'Instagram',
  icon: InstagramAppIcon,
})

export const facebookAndroidSiren = buildAndroidSiren({
  packageName: 'com.facebook.katana',
  appName: 'Facebook',
  icon: FacebookAppIcon,
})
```

### Usage Examples

**Basic usage:**
```typescript
const siren = buildAndroidSiren()
// Returns random siren from predefined list
```

**With overrides:**
```typescript
const siren = buildAndroidSiren({ appName: 'Custom App' })
// Returns random siren with custom appName
```

**Using named exports:**
```typescript
import { instagramAndroidSiren } from '@core/_tests_/data-builders/android-siren.builder'

const blocklist = buildBlocklist({
  sirens: { android: [instagramAndroidSiren] }
})
```

**Composing builders:**
```typescript
const session = buildBlockSession({
  name: 'Deep Work',
  blocklists: [
    buildBlocklist({
      name: 'Social Media',
      sirens: { android: [instagramAndroidSiren, facebookAndroidSiren] }
    })
  ]
})
```

### Best Practices

1. **Provide sensible defaults**: Builders should work without any arguments
2. **Use faker for randomization**: Unless determinism is required
3. **Export common cases**: Create named exports for frequently used test data
4. **Keep it simple**: Don't over-engineer - spread operator is sufficient
5. **Compose builders**: Reuse existing builders for nested objects
6. **Minimal overrides**: Only override what's relevant to the test
7. **Type safety**: Use `Partial<T>` or `PartialDeep<T>` for overrides

### Anti-Patterns

❌ **Don't** create builders with required parameters:
```typescript
// Bad - defeats the purpose
function buildSiren(appName: string, packageName: string) { ... }
```

✅ **Do** use optional overrides:
```typescript
// Good
function buildSiren(overrides: Partial<Siren> = {}) { ... }
```

❌ **Don't** use random data when determinism matters:
```typescript
// Bad - test becomes flaky
it('validates app name length', () => {
  const siren = buildAndroidSiren() // Random name
  expect(siren.appName.length).toBeLessThan(20) // Might fail randomly
})
```

✅ **Do** override when testing specific values:
```typescript
// Good
it('validates app name length', () => {
  const siren = buildAndroidSiren({ appName: 'A'.repeat(25) })
  expect(validateSiren(siren)).toContainError('name too long')
})
```

## Related ADRs

- [Fixture Pattern](fixture-pattern.md) - Complementary pattern for complex test scenarios
- [Vitest Over Jest](vitest-over-jest.md)
- [Test Store Factory](test-store-factory.md)

## References

- [Test Data Builders](http://www.natpryce.com/articles/000714.html) - Original pattern by Nat Pryce
- [Growing Object-Oriented Software](http://www.growing-object-oriented-software.com/) - Book that popularized the pattern
- [Faker.js](https://fakerjs.dev/) - Library used for random test data
- [type-fest PartialDeep](https://github.com/sindresorhus/type-fest) - Deep partial types for TypeScript
- Implementation: `core/_tests_/data-builders/`
