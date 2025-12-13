# Architecture Patterns

## Clean Architecture Folder Structure

```
project/
├── core/                    # Business logic (framework-agnostic)
│   ├── __constants__/       # Shared constants
│   ├── __utils__/           # Pure utility functions
│   ├── _ports_/             # Interface definitions (dependency inversion)
│   ├── _redux_/             # State management setup
│   ├── _tests_/             # Shared test utilities
│   └── [domain]/            # Feature folders
│       ├── [domain].slice.ts
│       ├── [entity].ts
│       ├── selectors/
│       ├── usecases/
│       └── listeners/
│
├── infra/                   # Infrastructure implementations
│   ├── __abstract__/        # Base classes (repository patterns)
│   └── [service]/           # Concrete implementations
│       ├── real.[service].ts
│       └── fake.[service].ts
│
└── ui/                      # Presentation layer
    ├── design-system/       # Reusable UI components
    ├── screens/             # Screen components
    ├── hooks/               # Custom React hooks
    └── navigation/          # Navigation setup
```

## Port Definitions (core/_ports_/)

Define interfaces that infrastructure must implement:

```typescript
// core/_ports_/auth.gateway.ts
export interface AuthGateway {
  signIn(email: string, password: string): Promise<User>
  signOut(): Promise<void>
  getCurrentUser(): Promise<User | null>
}

// core/_ports_/repository.ts
export interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>
  findAll(): Promise<T[]>
  save(entity: T): Promise<void>
  delete(id: string): Promise<void>
}
```

## Abstract Repository Pattern

Create `infra/__abstract__/in-memory.repository.ts`:

```typescript
import { Repository, CreatePayload, UpdatePayload } from '@core/_ports_/repository'

export class InMemoryRepository<T extends { id: string }> implements Repository<T> {
  protected entities: Map<string, T> = new Map()

  async findById(id: string): Promise<T | null> {
    return this.entities.get(id) ?? null
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.entities.values())
  }

  async save(entity: T): Promise<void> {
    this.entities.set(entity.id, entity)
  }

  async delete(id: string): Promise<void> {
    this.entities.delete(id)
  }

  // Test helpers
  givenExists(entity: T): this {
    this.entities.set(entity.id, entity)
    return this
  }

  reset(): void {
    this.entities.clear()
  }
}
```

## Dependency Injection Setup

### Dependencies Interface (core/_redux_/dependencies.ts)

```typescript
import { AuthGateway } from '@core/_ports_/auth.gateway'
import { Repository } from '@core/_ports_/repository'
import { DateProvider } from '@core/_ports_/date-provider'
import { Logger } from '@core/_ports_/logger'

export interface Dependencies {
  authGateway: AuthGateway
  repository: Repository<Entity>
  dateProvider: DateProvider
  logger: Logger
}
```

### Store Creation with DI (core/_redux_/createStore.ts)

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from './rootReducer'
import { Dependencies } from './dependencies'

export const createStore = (
  dependencies: Dependencies,
  preloadedState?: Partial<RootState>,
) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: dependencies,
        },
      }),
  })
}

export type AppStore = ReturnType<typeof createStore>
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = AppStore['dispatch']
```

### Thunk with Dependencies (core/_redux_/create-app-thunk.ts)

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit'
import { Dependencies } from './dependencies'
import { RootState, AppDispatch } from './createStore'

export const createAppThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  extra: Dependencies
}>()
```

## Use Case Pattern

```typescript
// core/auth/usecases/sign-in.usecase.ts
import { createAppThunk } from '@core/_redux_/create-app-thunk'
import { userAuthenticated } from '../reducer'

export const signIn = createAppThunk(
  'auth/signIn',
  async (
    { email, password }: { email: string; password: string },
    { extra: { authGateway, logger }, dispatch },
  ) => {
    const user = await authGateway.signIn(email, password)
    dispatch(userAuthenticated(user))
    logger.info('User signed in', { userId: user.id })
    return user
  },
)
```

## Selector Pattern

One selector per file for maintainability:

```typescript
// core/auth/selectors/selectIsAuthenticated.ts
import { RootState } from '@core/_redux_/createStore'

export const selectIsAuthenticated = (state: RootState): boolean => {
  return state.auth.user !== null
}
```

## Listener Pattern (Redux Toolkit)

```typescript
// core/auth/listeners/on-user-logged-in.listener.ts
import { createListenerMiddleware } from '@reduxjs/toolkit'
import { userAuthenticated } from '../reducer'
import { Dependencies } from '@core/_redux_/dependencies'

export const onUserLoggedInListener = (
  startListening: ReturnType<typeof createListenerMiddleware>['startListening'],
) => {
  startListening({
    actionCreator: userAuthenticated,
    effect: async (action, { extra }) => {
      const { logger } = extra as Dependencies
      logger.info('User logged in', { userId: action.payload.id })
    },
  })
}
```

## Utility Functions

### Exhaustive Guard

```typescript
// core/__utils__/exhaustive-guard.ts
export const exhaustiveGuard = (_value: never): never => {
  throw new Error(`Unhandled case: ${JSON.stringify(_value)}`)
}

// Usage
type Status = 'pending' | 'active' | 'completed'

function handleStatus(status: Status): string {
  switch (status) {
    case 'pending':
      return 'Waiting'
    case 'active':
      return 'In Progress'
    case 'completed':
      return 'Done'
    default:
      return exhaustiveGuard(status) // TypeScript error if case missing
  }
}
```

## Best Practices

### 1. Core Layer Rules
- No framework dependencies (React, Redux internals)
- No I/O operations (fetch, localStorage, Date)
- All external dependencies via ports
- Pure functions where possible

### 2. Infrastructure Layer Rules
- Implements port interfaces
- Can use external libraries
- Error handling at boundaries
- Logging of external operations

### 3. UI Layer Rules
- Uses core via dispatch/selectors
- No direct infrastructure access
- Presentational components pure
- Business logic in hooks/view-models
