# Typed Async Thunk Factory for Type-Safe Dependencies

Date: 2025-01-28

## Status

Accepted

## Context

Redux Toolkit's `createAsyncThunk` allows async operations in Redux, but accessing injected dependencies requires type configuration:

```typescript
// Without types, `extra` is `unknown`
const fetchData = createAsyncThunk(
  'domain/fetch',
  async (_, thunkAPI) => {
    const data = await thunkAPI.extra.repository.findAll() // ❌ Type error!
  }
)
```

Problems with untyped thunks:
- `extra` is typed as `unknown`
- No autocomplete for dependencies
- No type checking for dependency methods
- Runtime errors if dependency doesn't exist
- Must manually cast `extra` in every thunk

TiedSiren51 has many dependencies injected via thunk `extraArgument`:
- Repositories (BlockSession, Blocklist, Siren, Device)
- Services (Auth, Notification, Database)
- Providers (Date, BackgroundTask)

Need type-safe access to all dependencies in every async thunk.

## Decision

Create a **typed async thunk factory** using Redux Toolkit's `withTypes` API.

### Implementation

**1. Type-Configured Factory** (`/core/_redux_/create-app-thunk.ts`)

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from './rootReducer'
import type { AppDispatch } from './createStore'
import type { Dependencies } from './dependencies'

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  extra: Dependencies // ✅ Typed dependencies!
}>()
```

**2. Usage in Use Cases**

```typescript
import { createAppAsyncThunk } from '@core/_redux_/create-app-thunk'

export const fetchAvailableSirens = createAppAsyncThunk(
  'siren/fetchAvailable',
  async (_, { extra }) => {
    // ✅ Full autocomplete and type checking!
    const sirens = await extra.sirensRepository.findAll()
    return sirens
  }
)

export const loadUser = createAppAsyncThunk(
  'auth/loadUser',
  async (userId: string, { extra, getState }) => {
    // ✅ All typed: extra, getState, dispatch
    const user = await extra.authGateway.getUserById(userId)
    const currentState = getState() // Typed as RootState
    return user
  }
)
```

**3. Type Benefits**

```typescript
// Autocomplete for dependencies
extra.authGateway. // ✅ Shows: getCurrentUser, login, logout, etc.
extra.blockSessionRepository. // ✅ Shows: save, findAll, findById, etc.

// Type checking
extra.authGateway.nonExistentMethod() // ❌ Compile error!
extra.blockSessionRepository.save(wrongType) // ❌ Type error!

// State typing
const state = getState()
state.siren. // ✅ Typed as SirenState
```

## Consequences

### Positive

- **Type safety**: Full TypeScript checking for dependencies
- **Autocomplete**: IDE suggests available dependencies and methods
- **Compile-time errors**: Catch missing/wrong dependencies before runtime
- **Refactoring safety**: Renaming dependencies updates all usages
- **Documentation**: Types document what dependencies exist
- **DX**: Better developer experience with IntelliSense
- **Consistency**: All thunks use same typed pattern
- **No casting**: No manual `as` casts needed
- **State typing**: `getState()` returns typed `RootState`
- **Dispatch typing**: Dispatch is fully typed for type-safe action dispatch

### Negative

- **Setup required**: Must create typed factory upfront
- **Import overhead**: Must import custom factory instead of RTK's
- **Coupling**: Thunks coupled to specific types
- **Indirection**: Extra abstraction layer
- **Type complexity**: Generic types can be hard to understand

### Neutral

- **Centralized types**: All type configuration in one place
- **Redux Toolkit pattern**: Official RTK pattern (using `withTypes`)

## Alternatives Considered

### 1. Manual Type Assertions
**Rejected because**:
```typescript
// Must cast in every thunk
const deps = thunkAPI.extra as Dependencies
```
- Repetitive and error-prone
- No autocomplete until after cast
- Easy to forget
- Not DRY

### 2. Thunk Type Parameter
**Rejected because**:
```typescript
// Must specify types on every thunk
createAsyncThunk<ReturnType, ArgType, { extra: Dependencies }>(...)
```
- Verbose on every thunk
- Easy to forget or get wrong
- Doesn't help with state/dispatch types

### 3. Global Augmentation
**Rejected because**:
```typescript
declare module '@reduxjs/toolkit' {
  interface ThunkApiConfig {
    extra: Dependencies
  }
}
```
- Affects all thunks globally (might not want this)
- Less explicit
- Harder to trace
- Not recommended by Redux Toolkit

### 4. Wrapper Function
**Rejected because**:
```typescript
function createTypedThunk(name, handler) {
  return createAsyncThunk(name, handler as any)
}
```
- Loses type inference for return/args
- Type safety issues
- Not standard pattern

## Implementation Notes

### Key Files
- `/core/_redux_/create-app-thunk.ts` - Typed factory
- `/core/_redux_/dependencies.ts` - Dependency types
- `/core/{domain}/usecases/` - Usage in use cases

### Factory Implementation

```typescript
// /core/_redux_/create-app-thunk.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from './rootReducer'
import type { AppDispatch } from './createStore'
import type { Dependencies } from './dependencies'

/**
 * Pre-typed createAsyncThunk with access to:
 * - state: RootState
 * - dispatch: AppDispatch
 * - extra: Dependencies (injected via thunk extraArgument)
 */
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  extra: Dependencies
}>()
```

### Usage Patterns

**Simple fetch:**
```typescript
export const fetchSirens = createAppAsyncThunk(
  'siren/fetch',
  async (_, { extra }) => {
    return await extra.sirensRepository.findAll()
  }
)
```

**With arguments:**
```typescript
export const fetchBlocklist = createAppAsyncThunk(
  'blocklist/fetch',
  async (blocklistId: string, { extra }) => {
    return await extra.blocklistRepository.findById(blocklistId)
  }
)
```

**With state access:**
```typescript
export const syncSession = createAppAsyncThunk(
  'session/sync',
  async (_, { extra, getState }) => {
    const state = getState()
    const activeSession = selectActiveSession(state)

    if (!activeSession) return

    await extra.blockSessionRepository.update(activeSession.id, {
      lastSyncedAt: new Date(),
    })
  }
)
```

**With dispatch:**
```typescript
export const loginUser = createAppAsyncThunk(
  'auth/login',
  async (credentials: Credentials, { extra, dispatch }) => {
    const user = await extra.authGateway.login(credentials)

    // Dispatch other actions
    dispatch(fetchUserData(user.id))
    dispatch(loadSettings())

    return user
  }
)
```

**Error handling:**
```typescript
export const saveBlocklist = createAppAsyncThunk(
  'blocklist/save',
  async (blocklist: Blocklist, { extra, rejectWithValue }) => {
    try {
      await extra.blocklistRepository.save(blocklist)
      return blocklist
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)
```

### Type Safety Examples

```typescript
// ✅ Correct usage
const sirens = await extra.sirensRepository.findAll()

// ❌ Compile errors
extra.nonExistent.method() // Property 'nonExistent' does not exist
extra.sirensRepository.wrongMethod() // Property 'wrongMethod' does not exist
extra.sirensRepository.findAll(wrongArg) // Expected 0 arguments

// ✅ Typed state
const state = getState()
state.siren.entities // Typed correctly
state.wrongDomain // Property 'wrongDomain' does not exist

// ✅ Typed dispatch
dispatch(validAction()) // Works
dispatch(invalidAction()) // Type error if action doesn't exist
```

### Related ADRs
- [Redux Toolkit for Business Logic](redux-toolkit-for-business-logic.md)
- [Dependency Injection Pattern](../architecture/dependency-injection-pattern.md)
- [Hexagonal Architecture](../architecture/hexagonal-architecture.md)

## References

- [RTK withTypes API](https://redux-toolkit.js.org/usage/usage-with-typescript#typing-createasyncthunk)
- [Redux TypeScript Guide](https://redux.js.org/usage/usage-with-typescript)
- `/core/_redux_/create-app-thunk.ts` - Implementation
