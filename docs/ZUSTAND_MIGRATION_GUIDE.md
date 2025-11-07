# Zustand Migration Guide - Structure & DI Pattern

This guide shows how to implement **Zustand** with the same **Dependency Injection** pattern used in the current Redux implementation. This is a **structural guide only** - no code changes are made to the existing codebase.

---

## Overview: Redux vs Zustand with DI

### Current Redux Approach
- Redux Toolkit with `extraArgument` for DI
- Thunks for async operations
- Slices for state management
- Centralized store with `combineReducers`

### Zustand Approach (Proposed)
- Zustand stores with DI via closure/factory pattern
- Async actions as store methods
- Separate stores per domain (or combined)
- Dependency injection through store factory functions

---

## Folder Structure Comparison

### Current Redux Structure
```
core/
├── _redux_/
│   ├── dependencies.ts          # DI type definition
│   ├── createStore.ts          # Store factory with DI
│   ├── create-app-thunk.ts     # Typed thunk creator
│   └── rootReducer.ts          # Combined reducers
│
├── auth/
│   ├── reducer.ts              # Auth slice
│   ├── usecases/               # Async thunks
│   └── selectors/              # State selectors
│
├── block-session/
│   ├── block-session.slice.ts  # Block session slice
│   ├── usecases/               # Async thunks
│   └── selectors/
```

### Proposed Zustand Structure
```
core/
├── _zustand_/
│   ├── dependencies.ts          # DI type definition (SAME)
│   ├── createStore.ts          # Store factory with DI
│   ├── store.types.ts          # Store type definitions
│   └── store-utils.ts          # Utility functions
│
├── auth/
│   ├── auth.store.ts           # Auth Zustand store
│   ├── usecases/               # Store action methods
│   └── selectors/              # Derived selectors (hooks)
│
├── block-session/
│   ├── block-session.store.ts  # Block session store
│   ├── usecases/               # Store action methods
│   └── selectors/
```

---

## Key Files Structure

### 1. DI Type Definition (Unchanged)

**File: `core/_zustand_/dependencies.ts`**

```typescript
// Same as Redux version - no changes needed
import { BlockSessionRepository } from '../ports/block-session.repository'
import { BlocklistRepository } from '../ports/blocklist.repository'
// ... other imports

export type Dependencies = {
  databaseService: DatabaseService
  authGateway: AuthGateway
  blockSessionRepository: BlockSessionRepository
  blocklistRepository: BlocklistRepository
  // ... all 12 dependencies
}
```

### 2. Store Factory with DI

**File: `core/_zustand_/createStore.ts`**

```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Dependencies } from './dependencies'
import { createAuthStore } from '@/core/auth/auth.store'
import { createBlockSessionStore } from '@/core/block-session/block-session.store'
import { createBlocklistStore } from '@/core/blocklist/blocklist.store'
import { createSirenStore } from '@/core/siren/siren.store'
import { onUserLoggedInListener } from '@/core/auth/listenners/on-user-logged-in.listener'
import { onUserLoggedOutListener } from '@/core/auth/listenners/on-user-logged-out.listener'

export type PreloadedState = Partial<RootState>

// Combined store type
export type RootState = {
  auth: ReturnType<typeof createAuthStore>
  blockSession: ReturnType<typeof createBlockSessionStore>
  blocklist: ReturnType<typeof createBlocklistStore>
  siren: ReturnType<typeof createSirenStore>
}

export const createStore = (
  dependencies: Dependencies,
  preloadedState?: PreloadedState,
) => {
  // Create individual domain stores with DI
  const authStore = createAuthStore(dependencies, preloadedState?.auth)
  const blockSessionStore = createBlockSessionStore(
    dependencies,
    preloadedState?.blockSession,
  )
  const blocklistStore = createBlocklistStore(
    dependencies,
    preloadedState?.blocklist,
  )
  const sirenStore = createSirenStore(dependencies, preloadedState?.siren)

  // Create combined store
  const useStore = create<RootState>()(
    subscribeWithSelector((set, get) => ({
      auth: authStore,
      blockSession: blockSessionStore,
      blocklist: blocklistStore,
      siren: sirenStore,
    })),
  )

  // Setup listeners (similar to Redux)
  onUserLoggedInListener({
    store: useStore,
    authGateway: dependencies.authGateway,
  })

  onUserLoggedOutListener({
    store: useStore,
    authGateway: dependencies.authGateway,
  })

  return useStore
}

export type AppStore = ReturnType<typeof createStore>
```

**Alternative: Separate Stores Approach** (More Zustand-idiomatic)

```typescript
// core/_zustand_/createStore.ts
export const createStore = (
  dependencies: Dependencies,
  preloadedState?: PreloadedState,
) => {
  // Create stores independently
  const useAuthStore = createAuthStore(dependencies, preloadedState?.auth)
  const useBlockSessionStore = createBlockSessionStore(
    dependencies,
    preloadedState?.blockSession,
  )
  const useBlocklistStore = createBlocklistStore(
    dependencies,
    preloadedState?.blocklist,
  )
  const useSirenStore = createSirenStore(dependencies, preloadedState?.siren)

  // Setup listeners
  // ... listener setup

  return {
    useAuthStore,
    useBlockSessionStore,
    useBlocklistStore,
    useSirenStore,
  }
}
```

### 3. Domain Store Example: Auth Store

**File: `core/auth/auth.store.ts`**

```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Dependencies } from '../_zustand_/dependencies'
import { AuthUser } from './authUser'
import { signInWithEmail } from './usecases/sign-in-with-email.usecase'
import { signUpWithEmail } from './usecases/sign-up-with-email.usecase'
import { signInWithGoogle } from './usecases/sign-in-with-google.usecase'
import { signInWithApple } from './usecases/sign-in-with-apple.usecase'
import { logOut } from './usecases/log-out.usecase'

export type AuthState = {
  authUser: AuthUser | null
  isLoading: boolean
  error: string | null
}

export type AuthActions = {
  // Synchronous actions
  setAuthUser: (user: AuthUser | null) => void
  setError: (error: string | null) => void
  clearError: () => void
  clearAuthState: () => void

  // Async actions (use cases)
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  logOut: () => Promise<void>
}

export type AuthStore = AuthState & AuthActions

export const createAuthStore = (
  dependencies: Dependencies,
  preloadedState?: Partial<AuthState>,
) => {
  return create<AuthStore>()(
    subscribeWithSelector((set, get) => ({
      // Initial state
      authUser: preloadedState?.authUser ?? null,
      isLoading: preloadedState?.isLoading ?? false,
      error: preloadedState?.error ?? null,

      // Synchronous actions
      setAuthUser: (user) => set({ authUser: user, error: null, isLoading: false }),
      setError: (error) => set({ error, isLoading: false }),
      clearError: () => set({ error: null }),
      clearAuthState: () => set({ isLoading: false, error: null }),

      // Async actions (use cases with DI)
      signInWithEmail: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const user = await signInWithEmail(dependencies, email, password)
          set({ authUser: user, isLoading: false, error: null })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Sign in failed',
          })
        }
      },

      signUpWithEmail: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const user = await signUpWithEmail(dependencies, email, password)
          set({ authUser: user, isLoading: false, error: null })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Sign up failed',
          })
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null })
        try {
          const user = await signInWithGoogle(dependencies)
          set({ authUser: user, isLoading: false, error: null })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Google sign in failed',
          })
        }
      },

      signInWithApple: async () => {
        set({ isLoading: true, error: null })
        try {
          const user = await signInWithApple(dependencies)
          set({ authUser: user, isLoading: false, error: null })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Apple sign in failed',
          })
        }
      },

      logOut: async () => {
        set({ isLoading: true, error: null })
        try {
          await logOut(dependencies)
          set({ authUser: null, isLoading: false, error: null })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Logout failed',
          })
        }
      },
    })),
  )
}
```

### 4. Use Cases (Refactored from Thunks)

**File: `core/auth/usecases/sign-in-with-email.usecase.ts`**

```typescript
// Redux version (current):
// export const signInWithEmail = createAppAsyncThunk(
//   'auth/signInWithEmail',
//   async (email: string, { extra: { authGateway } }) => {
//     return authGateway.signInWithEmail(email, password)
//   }
// )

// Zustand version (proposed):
import { Dependencies } from '@/core/_zustand_/dependencies'
import { AuthUser } from '../authUser'

export const signInWithEmail = async (
  dependencies: Dependencies,
  email: string,
  password: string,
): Promise<AuthUser> => {
  const { authGateway } = dependencies
  return authGateway.signInWithEmail(email, password)
}
```

**File: `core/blocklist/usecases/create-blocklist.usecase.ts`**

```typescript
// Redux version (current):
// export const createBlocklist = createAppAsyncThunk(
//   'blocklist/createBlocklist',
//   async (payload: CreatePayload<Blocklist>, { extra: { blocklistRepository } }) => {
//     return blocklistRepository.create(payload)
//   }
// )

// Zustand version (proposed):
import { Dependencies } from '@/core/_zustand_/dependencies'
import { Blocklist } from '../blocklist'
import { CreatePayload } from '../../ports/create.payload'

export const createBlocklist = async (
  dependencies: Dependencies,
  payload: CreatePayload<Blocklist>,
): Promise<Blocklist> => {
  const { blocklistRepository } = dependencies
  return blocklistRepository.create(payload)
}
```

### 5. Domain Store: Blocklist Store

**File: `core/blocklist/blocklist.store.ts`**

```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Dependencies } from '../_zustand_/dependencies'
import { Blocklist, blocklistAdapter } from './blocklist'
import { createBlocklist } from './usecases/create-blocklist.usecase'
import { updateBlocklist } from './usecases/update-blocklist.usecase'
import { renameBlocklist } from './usecases/rename-blocklist.usecase'
import { duplicateBlocklist } from './usecases/duplicate-blocklist.usecase'
import { deleteBlocklist } from './usecases/delete-blocklist.usecase'
import { loadUser } from '../auth/usecases/load-user.usecase'

export type BlocklistState = ReturnType<typeof blocklistAdapter.getInitialState>

export type BlocklistActions = {
  setBlocklists: (blocklists: Blocklist[]) => void
  createBlocklist: (payload: CreatePayload<Blocklist>) => Promise<void>
  updateBlocklist: (payload: UpdatePayload<Blocklist>) => Promise<void>
  renameBlocklist: (id: string, name: string) => Promise<void>
  duplicateBlocklist: (id: string) => Promise<void>
  deleteBlocklist: (id: string) => Promise<void>
  loadUserData: () => Promise<void>
}

export type BlocklistStore = BlocklistState & BlocklistActions

export const createBlocklistStore = (
  dependencies: Dependencies,
  preloadedState?: Partial<BlocklistState>,
) => {
  return create<BlocklistStore>()(
    subscribeWithSelector((set, get) => ({
      // Initial state
      ...blocklistAdapter.getInitialState(),
      ...preloadedState,

      // Synchronous actions
      setBlocklists: (blocklists) => {
        set((state) => {
          const newState = { ...state }
          blocklistAdapter.setAll(newState, blocklists)
          return newState
        })
      },

      // Async actions
      createBlocklist: async (payload) => {
        try {
          const blocklist = await createBlocklist(dependencies, payload)
          set((state) => {
            const newState = { ...state }
            blocklistAdapter.addOne(newState, blocklist)
            return newState
          })
        } catch (error) {
          console.error('Failed to create blocklist:', error)
          throw error
        }
      },

      updateBlocklist: async (payload) => {
        try {
          const blocklist = await updateBlocklist(dependencies, payload)
          set((state) => {
            const newState = { ...state }
            blocklistAdapter.updateOne(newState, {
              id: blocklist.id,
              changes: blocklist,
            })
            return newState
          })
        } catch (error) {
          console.error('Failed to update blocklist:', error)
          throw error
        }
      },

      renameBlocklist: async (id, name) => {
        try {
          const blocklist = await renameBlocklist(dependencies, id, name)
          set((state) => {
            const newState = { ...state }
            blocklistAdapter.updateOne(newState, {
              id: blocklist.id,
              changes: { name: blocklist.name },
            })
            return newState
          })
        } catch (error) {
          console.error('Failed to rename blocklist:', error)
          throw error
        }
      },

      duplicateBlocklist: async (id) => {
        try {
          const blocklist = await duplicateBlocklist(dependencies, id)
          set((state) => {
            const newState = { ...state }
            blocklistAdapter.addOne(newState, blocklist)
            return newState
          })
        } catch (error) {
          console.error('Failed to duplicate blocklist:', error)
          throw error
        }
      },

      deleteBlocklist: async (id) => {
        try {
          await deleteBlocklist(dependencies, id)
          set((state) => {
            const newState = { ...state }
            blocklistAdapter.removeOne(newState, id)
            return newState
          })
        } catch (error) {
          console.error('Failed to delete blocklist:', error)
          throw error
        }
      },

      loadUserData: async () => {
        try {
          const userData = await loadUser(dependencies)
          set((state) => {
            const newState = { ...state }
            blocklistAdapter.setAll(newState, userData.blocklists)
            return newState
          })
        } catch (error) {
          console.error('Failed to load user data:', error)
          throw error
        }
      },
    })),
  )
}
```

### 6. Selectors (Hooks)

**File: `core/blocklist/selectors/selectBlocklists.ts`**

```typescript
// Redux version (current):
// export const selectBlocklists = (state: RootState) => 
//   blocklistAdapter.getSelectors().selectAll(state.blocklist)

// Zustand version (proposed):
import { useBlocklistStore } from '@/core/_zustand_/store-context'
import { blocklistAdapter } from '../blocklist'

export const useBlocklists = () => {
  const blocklists = useBlocklistStore((state) =>
    blocklistAdapter.getSelectors().selectAll(state),
  )
  return blocklists
}

// Or with selector memoization:
import { useMemo } from 'react'
import { useBlocklistStore } from '@/core/_zustand_/store-context'
import { blocklistAdapter } from '../blocklist'

export const useBlocklists = () => {
  return useBlocklistStore(
    useMemo(
      () => (state) => blocklistAdapter.getSelectors().selectAll(state),
      [],
    ),
  )
}
```

### 7. Store Context Provider

**File: `core/_zustand_/store-context.tsx`**

```typescript
import { createContext, useContext, ReactNode } from 'react'
import { AppStore } from './createStore'

const StoreContext = createContext<AppStore | null>(null)

export const StoreProvider = ({
  store,
  children,
}: {
  store: AppStore
  children: ReactNode
}) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('useStore must be used within StoreProvider')
  }
  return store
}

// Convenience hooks for individual stores
export const useAuthStore = () => {
  const store = useStore()
  return store.useAuthStore
}

export const useBlocklistStore = () => {
  const store = useStore()
  return store.useBlocklistStore
}

// ... other store hooks
```

### 8. App Setup

**File: `app/_layout.tsx`**

```typescript
import { StoreProvider } from '@/core/_zustand_/store-context'
import { createStore } from '@/core/_zustand_/createStore'
import { dependencies } from '@/ui/dependencies'
import { useAppInitialization } from '@/ui/hooks/useAppInitialization'

const store = createStore(dependencies)

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider store={store}>
        <AppWithInitialization />
      </StoreProvider>
    </SafeAreaProvider>
  )
}

function AppWithInitialization() {
  const { error, isInitializing, isAuthenticated } = useAppInitialization(store)
  // ... rest of component
}
```

### 9. Test Store Factory

**File: `core/_tests_/createTestStore.ts`**

```typescript
import { createStore } from '../_zustand_/createStore'
import { Dependencies } from '../_zustand_/dependencies'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { FakeDataBlocklistRepository } from '@/infra/blocklist-repository/fake-data.blocklist.repository'
// ... other fake implementations

export const createTestStore = (
  {
    authGateway = new FakeAuthGateway(),
    blocklistRepository = new FakeDataBlocklistRepository(),
    // ... other test dependencies
  }: Partial<Dependencies> = {},
  preloadedState?: Partial<RootState>,
) => {
  return createStore(
    {
      databaseService: new StubDatabaseService(),
      authGateway,
      blocklistRepository,
      // ... all dependencies with defaults
    },
    preloadedState,
  )
}
```

---

## Key Differences: Redux vs Zustand

| Aspect | Redux (Current) | Zustand (Proposed) |
|--------|------------------|-------------------|
| **Store Creation** | `configureStore()` with `extraArgument` | Factory function with DI closure |
| **Async Operations** | `createAppAsyncThunk` | Direct async methods in store |
| **State Updates** | Reducers + `extraReducers` | Direct `set()` calls in actions |
| **DI Access** | Via `extra` in thunk | Via closure in factory function |
| **Selectors** | `useSelector()` with selectors | Direct store hooks or selectors |
| **Store Structure** | Single combined store | Separate stores per domain |
| **Type Safety** | `AppDispatch`, `RootState` | Store type inference |
| **Middleware** | Redux middleware | Zustand middleware (subscribeWithSelector) |

---

## Migration Strategy

### Phase 1: Parallel Implementation
1. Create `core/_zustand_/` alongside `core/_redux_/`
2. Implement one domain store (e.g., `auth.store.ts`)
3. Keep Redux implementation working

### Phase 2: Gradual Migration
1. Migrate one domain at a time
2. Update UI components to use Zustand hooks
3. Keep both systems running in parallel

### Phase 3: Complete Migration
1. Remove Redux dependencies
2. Delete `core/_redux_/` folder
3. Update all imports

---

## Benefits of Zustand Approach

### 1. **Simpler API**
- No action creators, reducers, or thunks
- Direct state updates with `set()`
- Less boilerplate code

### 2. **Better TypeScript Inference**
- Automatic type inference from store definition
- No need for separate type definitions

### 3. **Smaller Bundle Size**
- Zustand is ~1KB vs Redux Toolkit ~15KB
- Less code overall

### 4. **Same DI Benefits**
- Maintains testability
- Keeps separation of concerns
- Preserves Hexagonal Architecture

### 5. **More Flexible**
- Can use separate stores or combined
- Easier to split stores later
- No need for `combineReducers`

---

## Considerations

### 1. **Store Structure**
- **Option A**: Combined store (similar to Redux)
- **Option B**: Separate stores (more Zustand-idiomatic)
- **Recommendation**: Option B for better separation

### 2. **Cross-Store Communication**
- Use Zustand's `subscribe` API
- Or create a shared store for cross-domain state
- Or use events/callbacks

### 3. **DevTools**
- Zustand has Redux DevTools support
- Can use `devtools` middleware

### 4. **Testing**
- Same test doubles approach
- Easier to test individual stores
- No need for Redux test utilities

---

## Example: Complete Store with DI

```typescript
// core/block-session/block-session.store.ts
import { create } from 'zustand'
import { subscribeWithSelector, devtools } from 'zustand/middleware'
import { Dependencies } from '../_zustand_/dependencies'
import { BlockSession, blockSessionAdapter } from './block.session'

export type BlockSessionStore = ReturnType<typeof blockSessionAdapter.getInitialState> & {
  // Actions
  setBlockSessions: (sessions: BlockSession[]) => void
  createBlockSession: (payload: CreatePayload<BlockSession>) => Promise<void>
  updateBlockSession: (payload: UpdatePayload<BlockSession>) => Promise<void>
  // ... other actions
}

export const createBlockSessionStore = (
  dependencies: Dependencies,
  preloadedState?: Partial<ReturnType<typeof blockSessionAdapter.getInitialState>>,
) => {
  return create<BlockSessionStore>()(
    devtools(
      subscribeWithSelector((set, get) => ({
        // Initial state
        ...blockSessionAdapter.getInitialState(),
        ...preloadedState,

        // Actions with DI access via closure
        setBlockSessions: (sessions) => {
          set((state) => {
            const newState = { ...state }
            blockSessionAdapter.setAll(newState, sessions)
            return newState
          })
        },

        createBlockSession: async (payload) => {
          const session = await createBlockSession(dependencies, payload)
          set((state) => {
            const newState = { ...state }
            blockSessionAdapter.addOne(newState, session)
            return newState
          })
        },
        // ... other actions
      })),
      { name: 'BlockSessionStore' },
    ),
  )
}
```

---

## Summary

This guide shows how to maintain the same **Dependency Injection** pattern with Zustand:

✅ **Same DI pattern** - Dependencies injected via factory functions  
✅ **Same architecture** - Hexagonal Architecture preserved  
✅ **Same testability** - Easy to swap implementations  
✅ **Simpler code** - Less boilerplate than Redux  
✅ **Type safety** - Full TypeScript support  
✅ **Better DX** - More intuitive API  

The key is using **factory functions** that accept `Dependencies` and return Zustand stores, maintaining the same clean architecture principles.

