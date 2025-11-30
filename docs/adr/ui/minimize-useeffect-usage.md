# Minimize useEffect Hook Usage

Date: 2025-11-24

## Status

Double read by amehmeto

## Context

React's `useEffect` hook is a powerful escape hatch for synchronizing components with external systems, but it introduces several challenges:

- **Complexity**: Components become harder to understand when logic is split across render and effect phases
- **Testing difficulty**: Effects run after render, requiring async testing utilities and mocking
- **Dependency array bugs**: Common source of bugs (infinite loops, stale closures, missed dependencies)
- **Mental overhead**: Developers must reason about effect lifecycle, cleanup, and re-execution
- **Component coupling**: Business logic embedded in components is harder to reuse and test
- **Performance**: Effects run after every render by default, potentially causing unnecessary work

In TiedSiren51's hexagonal architecture, business logic belongs in the core layer (Redux), not in UI components. When effects contain significant logic, they violate separation of concerns and make the codebase harder to maintain.

**Example of problematic pattern:**

```typescript
// useStrictModeTimer.ts - Original implementation
useEffect(() => {
  if (!isActive || timeRemaining.total > 0) return

  const checkAndStop = () => {
    if (timeRemaining.total <= 0) dispatch(stopTimer())
  }

  checkAndStop()
}, [isActive, timeRemaining.total, dispatch])

useEffect(() => {
  if (!isActive) return

  const intervalId = setInterval(() => {
    dispatch(tickTimer())
    if (timeRemaining.total <= 0) dispatch(stopTimer())
  }, UPDATE_INTERVAL_MS)

  return () => clearInterval(intervalId)
}, [isActive, timeRemaining.total, dispatch])
```

Issues:
- Duplicate timer expiry logic across two effects
- Business logic (when to stop timer) in UI layer
- Hard to test without mounting component
- Dependency array needs careful maintenance

## Decision

**Minimize `useEffect` usage** by preferring alternatives that keep logic in the core layer or use more appropriate React patterns.

### Acceptable useEffect Uses

Use `useEffect` **only** for these scenarios:

1. **Subscriptions to external systems**
   - Browser APIs (window resize, online/offline, visibility)
   - React Native APIs (AppState, keyboard, permissions)
   - WebSocket connections
   - Third-party library subscriptions

2. **Intervals and timers** (component-specific timing)
   - UI animations requiring setInterval
   - Countdown displays
   - Polling for UI updates

3. **DOM manipulation** (when refs aren't sufficient)
   - Focus management
   - Scroll position
   - Canvas drawing
   - Third-party DOM libraries

4. **One-time initialization** (mount-only effects)
   - Loading initial data on screen mount
   - Registering analytics events
   - Setting up component-local state

### Preferred Alternatives

#### 1. Redux Listeners (for cross-slice side effects)

```typescript
// core/timer/listeners/timer.listeners.ts
export const registerTimerListeners = (startListening: AppStartListening) => {
  startListening({
    matcher: isAnyOf(timerStarted, timerExtended),
    effect: async (action, { dispatch }) => {
      // Side effect logic in core layer
      dispatch(scheduleTimerNotification(action.payload.endTime))
    },
  })
}
```

**Use for**: Cross-domain actions, analytics, notifications

#### 2. Thunk Chains (for sequential async operations)

```typescript
// core/auth/usecases/login.usecase.ts
export const login = createAppAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, extra }) => {
    const user = await extra.authGateway.login(credentials)

    // Chain subsequent actions
    await dispatch(loadUserData(user.id))
    await dispatch(fetchUserSettings())

    return user
  }
)
```

**Use for**: Multi-step operations, dependent async calls

#### 3. Event Handlers (for user interactions)

```typescript
// Instead of useEffect watching state changes
const handleStartTimer = useCallback(async (duration: number) => {
  await dispatch(startTimer({ duration }))
  // Additional logic here
}, [dispatch])

return <Button onPress={() => handleStartTimer(3600)} />
```

**Use for**: User-initiated actions, form submissions

#### 4. Derived State (for computed values)

```typescript
// Instead of useEffect to sync state
const isExpired = useMemo(
  () => timer.endTime < Date.now(),
  [timer.endTime]
)
```

**Use for**: Calculations based on props/state

### Refactoring Example

**Before (useEffect-heavy):**

```typescript
const useTimer = () => {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(interval)
          handleTimerComplete() // Business logic in effect
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return timeLeft
}
```

**After (minimal useEffect, business logic in core):**

```typescript
const useTimer = () => {
  const timeRemaining = useSelector(selectTimeRemaining)
  const dispatch = useDispatch()

  // Only use useEffect for interval (unavoidable)
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(tickTimer()) // Core handles business logic
    }, 1000)

    return () => clearInterval(interval)
  }, [dispatch])

  return timeRemaining
}

// Business logic in core/timer/timer.slice.ts
extraReducers: (builder) => {
  builder.addCase(tickTimer, (state) => {
    const now = Date.now()
    if (state.timer?.endTime <= now) {
      state.timer = null // Core decides when timer stops
    }
  })
}
```

## Consequences

### Positive

- **Testability**: Business logic in Redux is easier to unit test
- **Separation of concerns**: UI only handles rendering, core handles logic
- **Reduced complexity**: Components have fewer moving parts
- **Fewer bugs**: No dependency array issues, no stale closure problems
- **Better performance**: Memoized selectors more efficient than effects
- **Reusability**: Core logic usable across multiple components
- **Debuggability**: Redux DevTools shows state changes, easier to trace
- **Type safety**: Thunks and selectors are fully typed
- **Predictable**: Data flows one direction (dispatch → reducer → selector)

### Negative

- **Learning curve**: Team must learn Redux listeners and thunk patterns
- **Initial setup**: More files (thunks, listeners) vs inline effects
- **Indirection**: Logic not colocated with component
- **Boilerplate**: Redux requires more setup than local effects
- **Not always avoidable**: Some effects are necessary (intervals, subscriptions)

### Neutral

- **Architecture alignment**: Reinforces hexagonal architecture principles
- **Convention requirement**: Team must follow patterns consistently
- **Code location**: Logic in core vs components (trade-off, not inherently good/bad)

## Alternatives Considered

### 1. Allow useEffect Freely

**Rejected because**:
- Leads to business logic scattered across UI components
- Makes testing more difficult
- Violates hexagonal architecture
- Creates maintenance burden as components grow complex

### 2. Ban useEffect Completely

**Rejected because**:
- Some effects are unavoidable (subscriptions, intervals)
- Too rigid, would require workarounds
- React's design includes effects for valid use cases
- Pragmatism over purity

### 3. Custom Hooks to Hide Effects

**Rejected because**:
```typescript
// Hides effect but doesn't solve the problem
const useTimerEffect = (callback) => {
  useEffect(() => {
    callback()
  }, [callback])
}
```
- Still uses effects internally
- Adds indirection without solving core issues
- Business logic still in UI layer

### 4. React Query / SWR for All Data

**Rejected because**:
- TiedSiren51 is local-first (not server-driven)
- Redux already handles state management well
- Would add unnecessary dependency
- Doesn't solve non-data-fetching effect cases

## Implementation Notes

### Code Review Checklist

When reviewing PRs with `useEffect`:

1. ✅ **Is this effect necessary?** Could it use listeners, thunks, or event handlers instead?
2. ✅ **Does it contain business logic?** If yes, move to core layer
3. ✅ **Is the dependency array correct?** Are all dependencies listed?
4. ✅ **Could this cause performance issues?** Does it run too often?
5. ✅ **Is there duplicate logic?** Multiple effects doing similar things?

### Migration Strategy

For existing code with heavy `useEffect` usage:

1. **Identify** effects containing business logic
2. **Extract** logic to thunks or listeners in core layer
3. **Simplify** component to dispatch actions and select state
4. **Test** core logic independently
5. **Document** remaining effects with comments explaining necessity

### Examples from Codebase

**Good** (necessary effect):
```typescript
// ui/hooks/useStrictModeTimer.ts
useEffect(() => {
  const subscription = AppState.addEventListener('change', handleAppStateChange)
  return () => subscription.remove()
}, [dispatch])
```
✅ Subscribing to external system (React Native API)

**Bad** (business logic in effect):
```typescript
useEffect(() => {
  if (timeRemaining.total <= 0) {
    dispatch(stopTimer()) // This logic belongs in core
  }
}, [timeRemaining.total])
```
❌ Business decision (when to stop) should be in reducer

**Refactored** (logic in core):
```typescript
// core/timer/timer.slice.ts
builder.addCase(tickTimer, (state) => {
  state.lastUpdate = Date.now()
  // Core decides when to stop
  if (state.timer && state.timer.endTime <= state.lastUpdate) {
    state.timer = null
  }
})
```
✅ Business logic in appropriate layer

### Related ADRs

- [Redux Toolkit for Business Logic](../core/redux-toolkit-for-business-logic.md)
- [Listener Pattern for Side Effects](../core/listener-pattern.md)
- [Hexagonal Architecture](../hexagonal-architecture.md)
- [View Model Pattern](view-model-pattern.md)

## References

- [PR #121 Discussion](https://github.com/amehmeto/TiedSiren51/pull/121) - Pattern emerged from code review
- [React useEffect Guide](https://react.dev/reference/react/useEffect)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Redux Listeners](https://redux-toolkit.js.org/api/createListenerMiddleware)
- `/core/timer/listeners/` - Listener pattern examples
- `/core/*/usecases/` - Thunk pattern examples
