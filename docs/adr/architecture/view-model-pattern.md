# View Model Pattern for UI State

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51's UI screens need to:

- Display data from Redux store
- Handle user interactions
- Trigger business logic actions
- Manage local UI state (form inputs, loading states)
- Compute derived data for display
- Keep components simple and presentational

Challenges:
- **React components shouldn't contain business logic**: Business logic belongs in core
- **Selector complexity**: Complex data transformations needed for display
- **Reusability**: Same logic needed across multiple components
- **Testing**: Need to test UI logic without rendering components
- **Separation**: UI state vs business state
- **Performance**: Avoid unnecessary re-renders

Traditional approaches:
- **Logic in components**: Couples UI to business logic, hard to test
- **Direct selectors**: Components know too much about store structure
- **Container components**: Extra layer, but still couples component to Redux

## Decision

Use **View Model Pattern** to bridge Redux state and UI components.

### Implementation

**1. View Model Hook** (`/ui/screens/{Screen}/{screen}.view-model.ts`)

```typescript
// /ui/screens/Home/HomeScreen/home.view-model.ts
export const useHomeViewModel = () => {
  const dispatch = useAppDispatch()

  // Select data from store
  const activeSessions = useAppSelector(selectActiveSessions)
  const blocklists = useAppSelector(selectAllBlocklists)
  const sirens = useAppSelector(selectAllSirens)

  // Compute derived data
  const hasActiveSession = activeSessions.length > 0
  const totalBlockedItems = sirens.length

  // Action handlers
  const handleStartSession = useCallback((blocklistId: string) => {
    dispatch(startBlockSession({ blocklistId }))
  }, [dispatch])

  const handleStopSession = useCallback(() => {
    dispatch(stopBlockSession())
  }, [dispatch])

  // Return UI-friendly API
  return {
    // Data
    activeSessions,
    blocklists,
    hasActiveSession,
    totalBlockedItems,

    // Actions
    handleStartSession,
    handleStopSession,
  }
}
```

**2. Presentational Component** (`/ui/screens/{Screen}/index.tsx`)

```typescript
export const HomeScreen = () => {
  const vm = useHomeViewModel()

  return (
    <View>
      <Text>Blocked Items: {vm.totalBlockedItems}</Text>

      {vm.hasActiveSession ? (
        <Button onPress={vm.handleStopSession}>Stop Session</Button>
      ) : (
        <BlocklistSelector
          blocklists={vm.blocklists}
          onSelect={vm.handleStartSession}
        />
      )}
    </View>
  )
}
```

**3. View Model Testing** (`/ui/screens/{Screen}/{screen}.view-model.test.ts`)

```typescript
import { renderHook } from '@testing-library/react-hooks'
import { useHomeViewModel } from './home.view-model'

it('computes derived state correctly', () => {
  const store = createTestStore(/* state with data */)

  const { result } = renderHook(() => useHomeViewModel(), {
    wrapper: ({ children }) => (
      <Provider store={store}>{children}</Provider>
    ),
  })

  expect(result.current.hasActiveSession).toBe(true)
  expect(result.current.totalBlockedItems).toBe(10)
})
```

## Consequences

### Positive

- **Separation of concerns**: Component only handles rendering
- **Testability**: View model logic tested without rendering
- **Reusability**: Same view model can power multiple components
- **Simplicity**: Components are simple, declarative, presentational
- **Performance**: Memoization in view model prevents re-renders
- **Type safety**: View model provides typed interface to components
- **Discoverability**: IDE autocomplete shows available data/actions
- **Maintainability**: Business logic changes don't require component changes
- **Composability**: View models can use other view models
- **Clear contract**: View model is explicit API for screen

### Negative

- **Extra file**: Each screen needs view model file
- **Indirection**: Must look at view model to see what data is used
- **Boilerplate**: Hook wrapper around selectors/dispatch
- **Learning curve**: Team must understand view model pattern
- **Not React**: Pattern from other frameworks (WPF, Android)
- **Overkill for simple screens**: Simple list might not need view model

### Neutral

- **Hook-based**: Modern React pattern (not class-based like original MVVM)
- **Redux coupling**: View models couple to Redux (acceptable trade-off)

## Alternatives Considered

### 1. Logic in Components
**Rejected because**:
- Couples component to Redux store structure
- Hard to test (must render component)
- Business logic mixed with presentation
- Difficult to reuse logic

### 2. Container/Presentational Split
**Rejected because**:
- Extra container component file
- Container still couples to Redux
- More boilerplate than view model
- Doesn't solve testing problem

### 3. Direct Selectors in Components
**Rejected because**:
- Components know too much about store
- Complex selector logic in components
- Hard to reuse across components
- Difficult to test derived data

### 4. Render Props
**Rejected because**:
- Awkward syntax
- Callback hell
- Less composable than hooks
- Outdated pattern

### 5. Higher-Order Components (HOC)
**Rejected because**:
- Less composable than hooks
- Wrapper hell
- Harder to type
- Outdated pattern

## Implementation Notes

### Key Files
- `/ui/screens/Home/HomeScreen/home.view-model.ts` - Home screen view model
- `/ui/screens/Home/HomeScreen/home.view-model.test.ts` - View model tests
- Various screen view models in `/ui/screens/`

### View Model Structure

```typescript
export const use{Screen}ViewModel = () => {
  // 1. Get data from Redux
  const data = useAppSelector(selectData)

  // 2. Compute derived data
  const derived = useMemo(() => computeValue(data), [data])

  // 3. Define action handlers
  const handleAction = useCallback(() => {
    dispatch(action())
  }, [dispatch])

  // 4. Local UI state (if needed)
  const [localState, setLocalState] = useState(false)

  // 5. Return public API
  return {
    data,
    derived,
    handleAction,
    localState,
  }
}
```

### Naming Conventions
- File: `{screen-name}.view-model.ts`
- Hook: `use{ScreenName}ViewModel`
- Test: `{screen-name}.view-model.test.ts`
- Location: Co-located with screen component

### Best Practices

1. **Keep components dumb**: All logic in view model
2. **Memoize expensive computations**: Use `useMemo`
3. **Memoize callbacks**: Use `useCallback`
4. **Return object**: Easier to add properties than array destructuring
5. **Test view model**: Focus tests on view model, not component
6. **Local UI state**: OK to have in view model (modal open, form state)
7. **Composition**: View models can call other view models

### Performance Optimization

```typescript
export const useBlocklistViewModel = () => {
  // Memoized selector
  const blocklists = useAppSelector(selectAllBlocklists)

  // Memoized computation
  const sortedBlocklists = useMemo(
    () => [...blocklists].sort((a, b) => a.name.localeCompare(b.name)),
    [blocklists]
  )

  // Memoized callback
  const handleDelete = useCallback((id: string) => {
    dispatch(deleteBlocklist(id))
  }, [dispatch])

  return { sortedBlocklists, handleDelete }
}
```

### Testing Pattern

```typescript
describe('HomeViewModel', () => {
  it('provides session data', () => {
    const store = createTestStore(
      stateBuilder()
        .withActiveSessions([sessionFixture()])
        .build()
    )

    const { result } = renderHook(() => useHomeViewModel(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    expect(result.current.hasActiveSession).toBe(true)
  })

  it('starts session when requested', () => {
    const store = createTestStore()

    const { result } = renderHook(() => useHomeViewModel(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    act(() => {
      result.current.handleStartSession('blocklist-1')
    })

    const state = store.getState()
    expect(selectActiveSession(state)).toBeDefined()
  })
})
```

### Related ADRs
- [Redux Toolkit for Business Logic](../state-management/redux-toolkit-for-business-logic.md)
- [Hexagonal Architecture](hexagonal-architecture.md)

## References

- [MVVM Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel)
- [Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
- `/ui/screens/` - Implementation examples
