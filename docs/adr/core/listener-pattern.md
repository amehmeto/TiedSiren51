# Listener Pattern for Side Effects

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51 has cross-domain side effects that need to be triggered by state changes:

**Examples:**
- **User logs in** → Load user data + Fetch available sirens
- **Siren detected** → Block launched app + Show notification
- **Block session starts** → Schedule background tasks + Update device status
- **Blocklist updated** → Refresh active session rules + Sync to remote devices

Challenges:
- Side effects span multiple domains (auth, siren, block-session)
- Reducers must be pure (can't dispatch actions or call APIs)
- Thunks can trigger side effects, but they're initiated explicitly, not reactively
- Need decoupled event → reaction pattern
- Must maintain testability

Traditional Redux approaches:
- **Manual chaining**: Call multiple thunks in components (couples UI to business logic)
- **Thunk → Thunk**: One thunk dispatches another (hard to trace, coupling)
- **Middleware**: Custom middleware (complex, hard to maintain)

## Decision

Use **Redux Toolkit Listener Middleware** pattern for declarative side effects.

### Implementation

**1. Listener Registration** (`/core/_redux_/registerListeners.ts`)

```typescript
export const registerListeners = (
  startListening: AppStartListening
) => {
  startListening(onUserLoggedInListener)
  startListening(onSirenDetectedListener)
  startListening(onBlockSessionStartListener)
  // ... other listeners
}
```

**2. Individual Listeners** (`/core/{domain}/listeners/`)

```typescript
// /core/auth/listeners/on-user-logged-in.listener.ts
export const onUserLoggedInListener = {
  actionCreator: userLoggedIn,
  effect: async (action, listenerApi) => {
    const { userId } = action.payload

    // Trigger cross-domain effects
    await listenerApi.dispatch(loadUser(userId))
    await listenerApi.dispatch(fetchAvailableSirens())

    // Access dependencies via getState() or extra argument
    const { notificationService } = listenerApi.extra
    notificationService.scheduleWelcomeNotification()
  },
}
```

**3. Store Setup** (`/core/_redux_/createStore.ts`)

```typescript
const listenerMiddleware = createListenerMiddleware({
  extra: dependencies, // Inject dependencies
})

registerListeners(listenerMiddleware.startListening)

configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: { extraArgument: dependencies },
    }).prepend(listenerMiddleware.middleware),
})
```

### Listener Examples

**Authentication Flow:**
```typescript
// User login triggers data loading
onUserLoggedIn → loadUser() + fetchAvailableSirens()
```

**Siren Detection:**
```typescript
// App launched triggers blocking
onSirenDetected → blockLaunchedApp() + showNotification()
```

**Session Management:**
```typescript
// Session start triggers background tasks
onSessionStart → scheduleBackgroundCheck() + syncToDevices()
```

## Consequences

### Positive

- **Declarative**: Side effects declared next to domain logic
- **Decoupled**: Domains don't directly call each other
- **Event-driven**: Clear cause → effect relationships
- **Testable**: Listeners can be tested independently
- **Centralized**: All listeners registered in one place
- **Type-safe**: Full TypeScript support
- **Cancellable**: Listeners can be cancelled mid-execution
- **Conditional**: Can inspect state before executing effect
- **Async support**: Built-in async/await support
- **No race conditions**: Middleware handles timing
- **Composable**: Multiple listeners can respond to same action

### Negative

- **Indirection**: Following code flow harder (action → listener → effect)
- **Debugging complexity**: Must trace through listener middleware
- **Hidden dependencies**: Cross-domain calls not visible at action dispatch site
- **Learning curve**: Team must understand listener pattern
- **Execution order**: Multiple listeners for same action execute in registration order (must be careful)
- **Potential cascades**: Listeners dispatching actions that trigger other listeners (can be complex)
- **Testing complexity**: Must test listener registration and effects separately

### Neutral

- **Redux-specific**: Pattern tied to Redux Toolkit ecosystem
- **Alternative to Sagas**: Simpler than redux-saga but less powerful
- **Middleware stack**: Adds another middleware layer

## Alternatives Considered

### 1. Redux Saga
**Rejected because**:
- Overkill for our use cases
- Generator syntax has steeper learning curve
- Larger bundle size
- More complex testing
- Listener middleware sufficient for our needs

### 2. Redux Observable (RxJS)
**Rejected because**:
- RxJS is heavy dependency
- Reactive programming learning curve
- Bundle size concerns
- Team not familiar with RxJS

### 3. Manual Thunk Chaining
**Rejected because**:
- Couples thunks to each other
- Hard to trace dependencies
- Creates tight coupling between domains
- Violates separation of concerns

### 4. Component-level Side Effects
**Rejected because**:
- Couples UI to business logic
- Side effects run multiple times (re-renders)
- Harder to test
- Can't trigger from non-UI actions

### 5. Custom Middleware
**Rejected because**:
- More complex to maintain
- Reinvents what listener middleware provides
- Less type-safe
- Non-standard pattern

## Implementation Notes

### Key Files
- `/core/_redux_/registerListeners.ts` - Central registration
- `/core/auth/listeners/on-user-logged-in.listener.ts` - Auth events
- `/core/siren/listeners/on-siren-detected.listener.ts` - Siren detection events
- `/core/block-session/listeners/` - Session lifecycle listeners

### Listener Structure

```typescript
export const onEventListener = {
  actionCreator: eventAction,      // Which action to listen for
  effect: async (action, api) => { // What to do
    const { payload } = action
    const state = api.getState()
    const deps = api.extra

    // Perform side effects
    await api.dispatch(otherAction())
    deps.notificationService.notify()
  },
}
```

### Best Practices

1. **One responsibility**: Each listener handles one concern
2. **Naming**: `on-{event}-{action}.listener.ts`
3. **Location**: Listeners live in the domain that *listens*, not the domain that *emits*
4. **Testing**: Test listeners with fake dependencies
5. **Avoid cascades**: Be careful with listeners dispatching actions that trigger other listeners
6. **Idempotency**: Effects should be safe to run multiple times

### Testing Listeners

```typescript
it('loads user data when user logs in', async () => {
  const store = createTestStore()

  await store.dispatch(userLoggedIn({ userId: '123' }))

  // Wait for listener effects
  await waitFor(() => {
    expect(selectUser(store.getState())).toBeDefined()
  })
})
```

### Related ADRs
- [Redux Toolkit for Business Logic](../state-management/redux-toolkit-for-business-logic.md)
- [Hexagonal Architecture](../hexagonal-architecture.md)
- [Dependency Injection Pattern](dependency-injection-pattern.md)

## References

- [RTK Listener Middleware](https://redux-toolkit.js.org/api/createListenerMiddleware)
- `/core/_redux_/registerListeners.ts` - Implementation
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
