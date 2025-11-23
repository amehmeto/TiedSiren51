# Redux Toolkit for Business Logic

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51's core business logic needs a state management solution that can:

- Handle complex state synchronization across block sessions, blocklists, and sirens
- Support normalized data structures (avoid duplication of sirens across blocklists)
- Enable time-travel debugging and state inspection
- Facilitate testing with predictable state transitions
- Work well with React Native and Expo
- Support async operations (API calls, database queries)
- Allow side effects to be triggered by state changes (e.g., notifications when session starts)

The application uses Hexagonal Architecture, but the core layer needs state management. A framework-agnostic core would be ideal, but state management is so central to the application that some coupling is acceptable.

## Decision

Use **Redux Toolkit** as the state management solution within the core business logic layer.

### Implementation Strategy

1. **Domain-based slices** in `/core/{domain}/{domain}.slice.ts`
   - Each domain (auth, block-session, blocklist, siren) has its own Redux slice
   - Slices contain reducers for synchronous state updates

2. **Entity Adapters** for normalized state
   - `createEntityAdapter` for collections (block sessions, blocklists, sirens)
   - Provides CRUD methods (addOne, updateOne, removeOne, upsertMany)
   - Maintains entities by ID with automatic deduplication

3. **Async Thunks** for async operations
   - Custom `createAppAsyncThunk` wrapper for typed dependencies
   - Use cases implemented as thunks in `/core/{domain}/usecases/`
   - Access to infrastructure dependencies via `extraArgument`

4. **Listener Pattern** for side effects
   - Redux listeners in `/core/{domain}/listeners/`
   - Respond to state changes and trigger cross-domain actions
   - Example: User login triggers data loading

5. **Dependency Injection** via thunk extraArgument
   - Dependencies (repositories, services) injected at store creation
   - Core remains testable with fake/stub dependencies
   - Defined in `/core/_redux_/dependencies.ts`

### Store Configuration

```typescript
// /core/_redux_/createStore.ts
export const createStore = (dependencies: Dependencies) => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: dependencies }
      })
  })
}
```

## Consequences

### Positive

- **Predictable state**: Single source of truth, immutable updates
- **DevTools**: Excellent debugging with Redux DevTools
- **Time-travel**: Can replay state changes during development/debugging
- **Normalized state**: Entity adapters prevent data duplication
- **Type safety**: Full TypeScript support with inferred types
- **Less boilerplate**: Redux Toolkit reduces action/reducer boilerplate significantly
- **Testability**: Pure reducer functions easy to test
- **Built-in async**: Thunks handle async operations cleanly
- **Middleware ecosystem**: Access to Redux middleware (listeners, persist, etc.)
- **Selectors**: Memoized selectors with Reselect for performance
- **Proven technology**: Battle-tested in production apps

### Negative

- **Core coupling**: Business logic is coupled to Redux (not framework-agnostic)
- **Learning curve**: Team must understand Redux concepts (slices, thunks, selectors)
- **Verbosity**: Still more verbose than simpler state solutions for simple cases
- **Overhead**: Additional abstraction layer for small features
- **Indirection**: State flow can be hard to trace (action → reducer → listener → thunk)
- **Bundle size**: Redux + Redux Toolkit adds to app bundle
- **React Native constraints**: Some Redux DevTools features limited on mobile

### Neutral

- **State structure**: Enforces specific patterns (normalized, immutable)
- **Async handling**: Thunks are straightforward but not the only option (sagas, observables)
- **Testing approach**: Requires testing at multiple levels (reducers, thunks, selectors)

## Alternatives Considered

### 1. Zustand
**Rejected because**:
- Less structure (harder to enforce patterns across team)
- No built-in normalization support
- Weaker DevTools integration
- Less ecosystem support for middleware

### 2. MobX
**Rejected because**:
- Mutable state contradicts hexagonal architecture principles
- Less predictable state flow
- Harder to debug state transitions
- Smaller React Native community

### 3. Context API + useReducer
**Rejected because**:
- No built-in async handling
- Performance issues with large state trees
- No DevTools
- Manual implementation of normalization
- More boilerplate for complex state

### 4. Recoil
**Rejected because**:
- Less mature (Meta experimental)
- Smaller community and ecosystem
- No normalization patterns
- Primarily designed for React (React Native support unclear)

### 5. Framework-Agnostic Core (Redux as UI concern)
**Rejected because**:
- Business logic state management would need custom implementation
- Would reinvent Redux patterns
- Testing would be harder without standardized patterns
- Value of "framework-agnostic" core questionable when UI is React Native

## Implementation Notes

### Key Files
- `/core/_redux_/createStore.ts` - Store factory with dependency injection
- `/core/_redux_/rootReducer.ts` - Combines domain slices
- `/core/_redux_/create-app-thunk.ts` - Typed async thunk factory
- `/core/_redux_/dependencies.ts` - Dependency type definitions
- `/core/_redux_/registerListeners.ts` - Listener registration

### Domain Structure Example
```
/core/block-session/
  ├── block.session.ts          # Entity adapter
  ├── block.session.slice.ts    # Redux slice
  ├── selectors/                # State selectors
  ├── usecases/                 # Async thunks
  └── listeners/                # Side effect listeners
```

### Related ADRs
- [Hexagonal Architecture](../architecture/hexagonal-architecture.md)
- [Entity Adapter Normalization](entity-adapter-normalization.md)
- [Listener Pattern for Side Effects](../architecture/listener-pattern.md)
- [Dependency Injection Pattern](../architecture/dependency-injection-pattern.md)

## References

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Redux Style Guide](https://redux.js.org/style-guide/)
- `/core/_redux_/` - Implementation files
