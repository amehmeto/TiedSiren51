# Testing Setup

## Vitest Configuration (vitest.config.js)

```javascript
import tsconfigPaths from 'vite-tsconfig-paths'

export default {
  test: {
    server: {
      deps: {
        // Add problematic dependencies here
        inline: [],
        interopDefault: true,
      },
    },
    // Exclude specific test patterns if needed
    exclude: ['**/node_modules/**'],

    // Coverage thresholds by file pattern
    coverage: {
      thresholds: {
        // Enforce 100% coverage on critical paths
        '**/*.schema.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        '**/selectors/*.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        '**/usecases/*.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  },
  plugins: [tsconfigPaths()],
}
```

## Test Store Factory Pattern

Create `core/_tests_/createTestStore.ts`:

```typescript
import { createStore } from '../_redux_/createStore'
import { FakeAuthGateway } from '@infra/auth-gateway/fake.auth.gateway'
import { FakeRepository } from '@infra/repository/fake.repository'

// Define all dependencies with sensible test defaults
export const createTestStore = (
  {
    authGateway = new FakeAuthGateway(),
    repository = new FakeRepository(),
    dateProvider = new StubDateProvider(),
    // ... other dependencies
  }: Partial<Dependencies> = {},
  preloadedState?: Partial<RootState>,
) => {
  return createStore(
    {
      authGateway,
      repository,
      dateProvider,
    },
    preloadedState,
  )
}
```

### Usage in Tests

```typescript
import { createTestStore } from '../_tests_/createTestStore'

describe('Feature: My Feature', () => {
  it('should do something', async () => {
    // Arrange - override specific dependencies
    const store = createTestStore({
      authGateway: new FakeAuthGateway().withUser(testUser),
    })

    // Act
    await store.dispatch(myAction())

    // Assert
    expect(store.getState().feature.value).toStrictEqual(expected)
  })
})
```

## State Builder Pattern

Create `core/_tests_/state-builder.ts`:

```typescript
import { RootState, rootReducer } from '../_redux_/rootReducer'

const initialState = rootReducer(undefined, { type: 'INIT' })

export const stateBuilder = (baseState: RootState = initialState) => ({
  build(): RootState {
    return baseState
  },

  withUser(user: User) {
    return stateBuilder(
      rootReducer(baseState, { type: 'auth/setUser', payload: user }),
    )
  },

  withItems(items: Item[]) {
    return stateBuilder(
      rootReducer(baseState, { type: 'items/setAll', payload: items }),
    )
  },

  // Add more chainable methods as needed
})
```

### Usage

```typescript
const state = stateBuilder()
  .withUser(testUser)
  .withItems([item1, item2])
  .build()

const store = createTestStore({}, state)
```

## Data Builder Pattern

Create builders in `core/_tests_/data-builders/`:

```typescript
// entity.builder.ts
import { faker } from '@faker-js/faker'

export const entityBuilder = (overrides: Partial<Entity> = {}): Entity => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  createdAt: faker.date.past().toISOString(),
  ...overrides,
})

// Fluent builder for complex entities
export class EntityBuilder {
  private entity: Partial<Entity> = {}

  withId(id: string) {
    this.entity.id = id
    return this
  }

  withName(name: string) {
    this.entity.name = name
    return this
  }

  build(): Entity {
    return entityBuilder(this.entity)
  }
}
```

## Coverage Tracking Scripts

### scripts/track-coverage.js

Tracks coverage history in JSON format:

```javascript
import { readFileSync, writeFileSync, existsSync } from 'fs'

const coverageFile = 'coverage/coverage-summary.json'
const historyFile = 'coverage-history.json'

const coverage = JSON.parse(readFileSync(coverageFile, 'utf8'))
const history = existsSync(historyFile)
  ? JSON.parse(readFileSync(historyFile, 'utf8'))
  : []

history.push({
  date: new Date().toISOString(),
  branch: process.env.GITHUB_REF || 'local',
  ...coverage.total,
})

writeFileSync(historyFile, JSON.stringify(history, null, 2))
```

### scripts/compare-coverage.cjs

Compares PR coverage against base branch:

```javascript
module.exports = async ({ github, context }) => {
  const prCoverage = require('./pr-coverage.json')
  const baseCoverage = require('./base-coverage.json')

  const diff = {
    statements: prCoverage.statements - baseCoverage.statements,
    branches: prCoverage.branches - baseCoverage.branches,
    functions: prCoverage.functions - baseCoverage.functions,
    lines: prCoverage.lines - baseCoverage.lines,
  }

  const body = `## Coverage Report
| Metric | Base | Current | Change |
|--------|------|---------|--------|
| Statements | ${baseCoverage.statements}% | ${prCoverage.statements}% | ${diff.statements > 0 ? '+' : ''}${diff.statements}% |
| Branches | ${baseCoverage.branches}% | ${prCoverage.branches}% | ${diff.branches > 0 ? '+' : ''}${diff.branches}% |
`

  await github.rest.issues.createComment({
    ...context.repo,
    issue_number: context.issue.number,
    body,
  })
}
```

## Required Dependencies

```bash
npm install -D \
  vitest \
  @vitest/coverage-v8 \
  c8 \
  vite \
  vite-tsconfig-paths \
  vitest-tsconfig-paths \
  @faker-js/faker
```
