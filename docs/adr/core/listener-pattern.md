# Listener Pattern for Side Effects

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51 has cross-domain side effects that need to be triggered by external events:

**Examples:**
- **User logs in** (Firebase event) → Load user data + Target sirens
- **Block sessions change** (Redux state) → Start/stop siren lookout + sync schedule to native

Challenges:
- Events originate from infrastructure layer (Firebase, native modules)
- Need to dispatch Redux actions in response to external events
- Must bridge gateway ports with Redux store
- Reducers must be pure (can't call external services)
- Must maintain testability with fake gateways

## Decision

Use **Event Listeners** that bridge external events and state changes to Redux actions.

### Implementation

**1. Listener Registration** (`/core/_redux_/registerListeners.ts`)

```typescript
export const registerListeners = (
  store: AppStore,
  dependencies: Dependencies,
) => {
  const { authGateway, logger, sirenLookout, sirenTier } = dependencies

  onUserLoggedInListener({ store, authGateway, logger })
  onUserLoggedOutListener({ store, authGateway, logger })
  onBlockSessionsChangedListener({ store, sirenLookout, sirenTier, logger })
}
```

**2. Gateway Event Listeners** (`/core/{domain}/listeners/`)

```typescript
// /core/auth/listeners/on-user-logged-in.listener.ts
export const onUserLoggedInListener = ({
  store,
  authGateway,
  logger,
}: {
  store: AppStore
  authGateway: AuthGateway
  logger: Logger
}) => {
  authGateway.onUserLoggedIn((user) => {
    try {
      store.dispatch(userAuthenticated(user))
      store.dispatch(loadUser())
    } catch (error) {
      logger.error(`Error in onUserLoggedIn listener: ${error}`)
    }
  })
}
```

**3. Store Subscription Listeners** (for Redux state changes)

```typescript
// /core/siren/listeners/on-block-sessions-changed.listener.ts
export const onBlockSessionsChangedListener = ({
  store,
  sirenLookout,
  logger,
}: {
  store: AppStore
  sirenLookout: SirenLookout
  logger: Logger
}): (() => void) => {
  let previousHadSessions = false

  return store.subscribe(() => {
    const sessions = selectAllBlockSessions(store.getState().blockSession)
    const hasSessions = sessions.length > 0

    if (previousHadSessions && !hasSessions) sirenLookout.stopWatching()
    else if (!previousHadSessions && hasSessions) sirenLookout.startWatching()

    previousHadSessions = hasSessions
  })
}
```

### Two Listener Types

| Type | Event Source | Use Case |
|------|-------------|----------|
| Gateway Listeners | Port callbacks (`gateway.onEvent()`) | External events (auth, native modules) |
| Store Listeners | `store.subscribe()` | React to Redux state changes |

### Unified Listeners (Multi-Slice)

Some listeners need to react to changes across multiple Redux slices. For example, blocking state depends on both:

- **blockSession slice**: When sessions start/end
- **blocklist slice**: When blocklists are edited (apps added/removed)

Rather than having separate listeners for each slice, use a **unified listener** with slice reference tracking:

```typescript
// Single listener watching multiple slices via store.subscribe()
export const onBlockingScheduleChangedListener = ({
  store,
  sirenTier,
  dateProvider,
  logger,
}: {
  store: AppStore
  sirenTier: SirenTier
  dateProvider: DateProvider
  logger: Logger
}): (() => void) => {
  // Track slice references for efficient early exit
  let lastBlockSessionState = store.getState().blockSession
  let lastBlocklistState = store.getState().blocklist
  let lastScheduleKey = ''

  const getScheduleHashKey = (schedule: BlockingSchedule[]): string => {
    return schedule.map((s) => `${s.id}:${s.sirens...}`).sort().join('|')
  }

  return store.subscribe(() => {
    const state = store.getState()

    // Early exit: skip if neither slice changed (reference equality)
    if (
      state.blockSession === lastBlockSessionState &&
      state.blocklist === lastBlocklistState
    )
      return

    lastBlockSessionState = state.blockSession
    lastBlocklistState = state.blocklist

    // Compute derived state from both slices
    const schedule = selectBlockingSchedule(dateProvider, state)
    const scheduleKey = getScheduleHashKey(schedule)

    // Only sync if computed schedule actually changed
    if (scheduleKey === lastScheduleKey) return
    lastScheduleKey = scheduleKey

    void sirenTier.updateBlockingSchedule(schedule)
  })
}
```

**Key principles for unified listeners:**

1. **Slice reference tracking**: Compare slice references first for O(1) early exit
2. **Selector-based**: Use selectors that join data from multiple slices
3. **Derived state comparison**: Compare computed results (hash), not raw slice state
4. **Single responsibility**: One listener per "concern" (e.g., blocking schedule)

### Listener Examples

**Authentication Flow (Gateway):**
```typescript
// Firebase auth state change → Redux store update
authGateway.onUserLoggedIn(user) → dispatch(userAuthenticated(user))
```

**Session Management (Store Subscription):**
```typescript
// Block session added/removed → Start/stop native monitoring
store.subscribe() → sirenLookout.startWatching() or stopWatching()
```

## Consequences

### Positive

- **Bridges layers**: Connects infrastructure events to Redux store
- **Decoupled**: Gateways don't know about Redux; listeners handle bridging
- **Testable**: Fake gateways can trigger events in tests
- **Simple**: Factory functions, no complex middleware
- **Explicit dependencies**: Each listener declares what it needs
- **Error handling**: Try-catch with logging at listener level
- **Type-safe**: Full TypeScript support
- **Flexible**: Two patterns for different event sources

### Negative

- **Manual wiring**: Must register each listener explicitly
- **No cancellation**: Unlike RTK Listener Middleware, no built-in cancellation
- **Callback-based**: Gateway ports must support event callbacks
- **Two patterns**: Gateway listeners vs store subscriptions may confuse

### Neutral

- **Not Redux middleware**: Simpler than RTK Listener Middleware but less integrated
- **Store access**: Direct store access rather than listenerApi

## Alternatives Considered

### 1. Redux Toolkit Listener Middleware
**Not used because**:
- Events originate from gateways, not Redux actions
- Would require dispatching actions just to trigger middleware
- Extra indirection for external events

### 2. Redux Saga
**Rejected because**:
- Overkill for our event bridging needs
- Generator syntax complexity
- Larger bundle size

### 3. Component-level useEffect
**Rejected because**:
- Couples UI to business logic
- Side effects tied to component lifecycle
- Can't trigger from non-UI events

### 4. Direct Gateway → Store in Infrastructure
**Rejected because**:
- Violates hexagonal architecture (infra knowing about core)
- Hard to test
- Tight coupling

## Implementation Notes

### Key Files
- `/core/_redux_/registerListeners.ts` - Central registration
- `/core/auth/listeners/on-user-logged-in.listener.ts` - Auth events
- `/core/auth/listeners/on-user-logged-out.listener.ts` - Logout events
- `/core/siren/listeners/on-block-sessions-changed.listener.ts` - Session state changes

### Listener Structure

**Gateway Listener:**
```typescript
export const onEventListener = ({
  store,
  gateway,
  logger,
}: {
  store: AppStore
  gateway: SomeGateway
  logger: Logger
}) => {
  gateway.onEvent((data) => {
    try {
      store.dispatch(someAction(data))
    } catch (error) {
      logger.error(`Error in listener: ${error}`)
    }
  })
}
```

**Store Subscription Listener:**
```typescript
export const onStateChangeListener = ({
  store,
  service,
  logger,
}: {
  store: AppStore
  service: SomeService
  logger: Logger
}): (() => void) => {
  return store.subscribe(() => {
    const state = store.getState()
    // React to state changes
    service.doSomething(state)
  })
}
```

### Best Practices

1. **One responsibility**: Each listener handles one event type
2. **Naming**: `on-{event}.listener.ts`
3. **Error handling**: Wrap in try-catch with logger
4. **Location**: Listeners live in the domain that *reacts*, not the domain that *emits*
5. **Dependencies**: Explicitly declare all dependencies in parameter object
6. **Return unsubscribe**: Store subscription listeners should return cleanup function

### Testing Listeners

```typescript
it('dispatches userAuthenticated when user logs in', () => {
  const fakeAuthGateway = new FakeAuthGateway()
  const store = createTestStore()

  onUserLoggedInListener({
    store,
    authGateway: fakeAuthGateway,
    logger: new InMemoryLogger(),
  })

  // Trigger the gateway event
  fakeAuthGateway.simulateLogin(testUser)

  expect(store.getState().auth.user).toEqual(testUser)
})
```

### Related ADRs
- [Redux Toolkit for Business Logic](redux-toolkit-for-business-logic.md)
- [Hexagonal Architecture](../hexagonal-architecture.md)
- [Dependency Injection Pattern](dependency-injection-pattern.md)

## References

- `/core/_redux_/registerListeners.ts` - Implementation
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Redux Store Subscriptions](https://redux.js.org/api/store#subscribelistener)
