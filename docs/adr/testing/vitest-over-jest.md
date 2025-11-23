# Vitest Over Jest for Unit Testing

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51 needs a unit testing framework for:
- Business logic in `/core` (use cases, slices, selectors)
- UI components and view models in `/ui`
- Repository implementations in `/infra`
- Utilities and helpers

Requirements:
- **Fast**: Quick feedback during development
- **TypeScript support**: First-class TypeScript without extra config
- **ESM support**: Native ES modules (no transpilation needed)
- **React Native compatible**: Works with React Native and Expo
- **Watch mode**: Auto-rerun tests on file changes
- **Coverage**: Built-in coverage reporting
- **DX**: Good error messages and IDE integration

Jest is the traditional choice for React/React Native, but it has known pain points:
- Slow on large codebases (transforms all files)
- ESM support requires configuration
- TypeScript requires `ts-jest` or Babel
- CommonJS-first (awkward with modern ESM code)

## Decision

Use **Vitest** as the primary unit testing framework.

### Configuration

**vitest.config.js:**
```javascript
export default {
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.spec.ts',
        '**/*.test.ts',
      ],
    },
    exclude: [
      'infra/**/prisma.*.test.ts', // Excluded due to polyfill issues
    ],
  },
}
```

### Test File Patterns
- `**/*.spec.ts` - Unit tests
- `**/*.test.ts` - Integration/component tests
- Co-located with source files

### Test Scripts
```json
{
  "test": "vitest",                    // Watch mode
  "test:prepush": "vitest run",        // CI/git hooks
  "test:cov": "vitest run --coverage", // Coverage report
  "test:cov:track": "node scripts/track-coverage.js", // Track history
}
```

## Consequences

### Positive

- **Speed**: 10-50x faster than Jest due to Vite's transform caching
- **Native ESM**: No configuration needed for ES modules
- **Native TypeScript**: Reads `tsconfig.json`, no extra setup
- **Vite integration**: Can share Vite config if needed
- **Jest compatibility**: Compatible API (describe, it, expect, etc.)
- **Watch mode**: Instant test reruns on file changes
- **Modern**: Built for modern JavaScript/TypeScript
- **Coverage**: Built-in V8 coverage (no Istanbul needed)
- **Concurrent**: Tests run in parallel by default
- **Better errors**: Clear error messages with source maps
- **Snapshot testing**: Same API as Jest
- **Mocking**: Powerful mocking with `vi.mock()`

### Negative

- **Ecosystem maturity**: Younger than Jest (less Stack Overflow answers)
- **Plugin compatibility**: Some Jest plugins don't work (need Vitest equivalents)
- **Learning curve**: Team familiar with Jest must learn small differences
- **React Native quirks**: Some RN-specific test utilities less documented
- **Migration cost**: Had to migrate existing Jest tests
- **Prisma tests excluded**: Polyfill conflicts force exclusion of Prisma integration tests
- **Community size**: Smaller community than Jest (but growing)

### Neutral

- **API differences**: Minor differences from Jest (mostly compatible)
- **Configuration**: Different config format than `jest.config.js`

## Alternatives Considered

### 1. Jest
**Rejected because**:
- Slower test runs (transformations, CommonJS)
- ESM support requires workarounds
- TypeScript requires extra config (`ts-jest`)
- Heavier transform pipeline
- More setup for modern code

### 2. Native Node Test Runner
**Rejected because**:
- No coverage reporting built-in
- No watch mode
- Less mature mocking
- Limited assertion library
- No React component testing support

### 3. AVA
**Rejected because**:
- Tests always run in separate processes (slower)
- Different API from Jest (steeper migration)
- Less React ecosystem support
- Smaller community

### 4. Mocha + Chai
**Rejected because**:
- Requires multiple libraries (Mocha, Chai, Sinon)
- More configuration needed
- Less integrated experience
- No built-in coverage

## Implementation Notes

### Key Files
- `/vitest.config.js` - Vitest configuration
- `/package.json` - Test scripts
- `/scripts/track-coverage.js` - Custom coverage tracking
- `/scripts/view-coverage-history.js` - Coverage history viewer

### Coverage Tracking
- Custom scripts track coverage over time
- Current coverage: **98.83%**
- GitHub Actions generate coverage reports on PRs
- Coverage comparison shows improvements/regressions

### Test Structure
```typescript
// Example test file
import { describe, it, expect } from 'vitest'
import { createTestStore } from '@core/_tests_/createTestStore'

describe('BlockSession Use Cases', () => {
  it('starts a block session', async () => {
    const store = createTestStore()

    await store.dispatch(startBlockSession({ blocklistId: '1' }))

    expect(selectActiveSession(store.getState())).toBeDefined()
  })
})
```

### Excluded Tests
Pattern: `infra/**/prisma.*.test.ts`

**Reason**: Prisma integration tests have polyfill conflicts with `@prisma/react-native` and `react-native-url-polyfill` in test environment.

**Tracked in**: `/docs/TECH_DEBT.md#5-testing-coverage-`

### Migration from Jest
- API mostly compatible (describe/it/expect)
- `jest.fn()` → `vi.fn()`
- `jest.mock()` → `vi.mock()`
- Updated test scripts
- Maintained test coverage

### Related ADRs
- [Fixture Pattern for Test Data](fixture-pattern.md)
- [Test Store Factory](test-store-factory.md)
- [Stub vs Fake Implementations](stub-vs-fake-implementations.md)
- [Coverage Tracking and History](coverage-tracking.md)

## References

- [Vitest Documentation](https://vitest.dev/)
- [Vitest vs Jest](https://vitest.dev/guide/comparisons.html#jest)
- `/vitest.config.js` - Current configuration
- Current coverage: 98.83% (tracked in `/README.md`)
