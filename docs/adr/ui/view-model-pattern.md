# View Model Pattern for UI State

Date: 2025-01-28
Updated: 2025-11-28

## Status

Double read by amehmeto

## Context

TiedSiren51's UI screens need to:

- Display data from Redux store in display-ready format
- Handle multiple UI states (loading, empty, active, etc.)
- Keep formatting/presentation logic out of components
- Remain testable without rendering React components
- Support time-dependent displays that update every second

Challenges:

- **Formatting in components**: Components shouldn't transform raw data to display strings
- **Conditional rendering complexity**: Multiple UI states lead to complex conditional logic
- **Time-dependent data**: Countdown timers and relative times need `DateProvider` injection
- **Type safety**: Different UI states have different available properties
- **Testing**: Need to verify formatting and state logic without React rendering

## Decision

Use **Selector-Based View Models** that return **discriminated unions** representing distinct UI states.

### Core Principles

1. **Selectors, not hooks**: View models are pure selector functions, not React hooks
2. **Discriminated unions**: Use `type` field to distinguish UI states
3. **Pre-formatted strings**: Return display-ready strings, not raw data
4. **DateProvider injection**: Pass `DateProvider` for time-dependent formatting
5. **Exhaustive handling**: TypeScript enforces handling all states in components

### Implementation

**1. View Model Selector** (`/ui/screens/{Screen}/{screen}.view-model.ts`)

```typescript
// StrictMode example - simple binary state
export enum StrictModeViewState {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

type InactiveViewModel = {
  type: StrictModeViewState.Inactive
  countdown: string        // "0h 0m 0s"
  statusMessage: string    // "Set a timer to activate strict mode"
  buttonText: string       // "Start Timer"
}

type ActiveViewModel = {
  type: StrictModeViewState.Active
  countdown: string        // "1h 30m 45s"
  endDateTime: string      // "Ends 28/11, 3:30 p.m."
  inlineRemaining: string  // "1h 30m 45s"
  statusMessage: string    // "Your blockings are locked..."
  buttonText: string       // "Extend Timer"
}

export type StrictModeViewModel = InactiveViewModel | ActiveViewModel

export function selectStrictModeViewModel(
  state: RootState,
  dateProvider: DateProvider,
): StrictModeViewModel {
  const isActive = selectIsTimerActive(state, dateProvider)

  if (!isActive) {
    return {
      type: StrictModeViewState.Inactive,
      countdown: '0h 0m 0s',
      statusMessage: 'Set a timer to activate strict mode',
      buttonText: 'Start Timer',
    }
  }

  const timeLeft = selectTimeLeft(state, dateProvider)

  return {
    type: StrictModeViewState.Active,
    countdown: formatCountdown(timeLeft),
    endDateTime: formatEndDateTime(timeLeft, dateProvider.getNow()),
    inlineRemaining: formatCountdown(timeLeft),
    statusMessage: 'Your blockings are locked against any bypassing.',
    buttonText: 'Extend Timer',
  }
}
```

**2. Complex State Example** (HomeScreen with 4 states)

```typescript
// Home example - multiple combined states
export enum HomeViewModel {
  WithoutActiveNorScheduledSessions = 'WITHOUT_ACTIVE_NOR_SCHEDULED_SESSIONS',
  WithActiveWithoutScheduledSessions = 'WITH_ACTIVE_WITHOUT_SCHEDULED_SESSIONS',
  WithoutActiveWithScheduledSessions = 'WITHOUT_ACTIVE_WITH_SCHEDULED_SESSIONS',
  WithActiveAndScheduledSessions = 'WITH_ACTIVE_AND_SCHEDULED_SESSIONS',
}

// Each state type has different structure
type WithoutActiveNorScheduledSessions = {
  type: HomeViewModel.WithoutActiveNorScheduledSessions
  greetings: Greetings
  activeSessions: { title: string; message: string }      // Empty state
  scheduledSessions: { title: string; message: string }   // Empty state
}

type WithActiveAndScheduledSessions = {
  type: HomeViewModel.WithActiveAndScheduledSessions
  greetings: Greetings
  activeSessions: { title: string; blockSessions: ViewModelBlockSession[] }
  scheduledSessions: { title: string; blockSessions: ViewModelBlockSession[] }
}

// Union of all possible states
export type HomeViewModelType =
  | WithoutActiveNorScheduledSessions
  | WithActiveWithoutScheduledSessions
  | WithoutActiveWithScheduledSessions
  | WithActiveAndScheduledSessions
```

**3. Component Usage with Exhaustive Switch**

```typescript
export default function HomeScreen() {
  const { dateProvider } = dependencies
  const [now, setNow] = useState<Date>(dateProvider.getNow())

  // Select view model with dateProvider for time formatting
  const viewModel = useSelector<RootState, HomeViewModelType>(
    (state) => selectHomeViewModel(state, now, dateProvider)
  )

  // Exhaustive switch ensures all states handled
  const [activeNode, scheduledNode] = (() => {
    switch (viewModel.type) {
      case HomeViewModel.WithoutActiveNorScheduledSessions:
        return [
          <NoSessionBoard sessions={viewModel.activeSessions} />,
          <NoSessionBoard sessions={viewModel.scheduledSessions} />,
        ]
      case HomeViewModel.WithActiveWithoutScheduledSessions:
        return [
          <SessionsBoard sessions={viewModel.activeSessions} />,
          <NoSessionBoard sessions={viewModel.scheduledSessions} />,
        ]
      // ... other cases
      default:
        return exhaustiveGuard(viewModel) // TypeScript compile error if case missed
    }
  })()

  return (
    <>
      <Text>{viewModel.greetings}</Text>  {/* Common to all states */}
      {activeNode}
      {scheduledNode}
    </>
  )
}
```

**4. View Model Testing** (No React rendering needed)

```typescript
describe('selectStrictModeViewModel', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2024-01-01T10:00:00.000Z')
  })

  test('should return inactive view model when no timer is set', () => {
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withTimerEndedAt(null).build(),
    )

    const viewModel = selectStrictModeViewModel(store.getState(), dateProvider)

    expect(viewModel).toEqual({
      type: StrictModeViewState.Inactive,
      countdown: '0h 0m 0s',
      statusMessage: 'Set a timer to activate strict mode',
      buttonText: 'Start Timer',
    })
  })

  test('should return active view model with formatted countdown', () => {
    const endedAt = dateProvider.msToISOString(nowMs + 1 * HOUR + 30 * MINUTE)
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withTimerEndedAt(endedAt).build(),
    )

    const viewModel = selectStrictModeViewModel(store.getState(), dateProvider)

    expect(viewModel).toMatchObject({
      type: StrictModeViewState.Active,
      countdown: '1h 30m 0s',
      buttonText: 'Extend Timer',
    })
  })
})
```

## Consequences

### Positive

- **Pure functions**: Selectors are pure, easy to test without React
- **Type-safe UI states**: Discriminated unions enforce exhaustive handling
- **Pre-formatted output**: Components receive display-ready strings
- **Testable time logic**: DateProvider injection enables deterministic tests
- **No formatting in components**: All string formatting in view model
- **Compile-time safety**: Missing state handling causes TypeScript errors
- **Centralized formatting**: Single source of truth for display strings

### Negative

- **Verbose type definitions**: Each UI state needs explicit type
- **String coupling**: Changes to display text require view model changes
- **No memoization by default**: Must use `createSelector` for expensive computations

### Neutral

- **Selector vs Hook**: Different from hook-based MVVM (but simpler for this use case)
- **Co-location**: View model files co-located with screen components

## Alternatives Considered

### 1. Hook-Based View Models

```typescript
export const useHomeViewModel = () => {
  const data = useSelector(selectData)
  const formatted = useMemo(() => format(data), [data])
  return { formatted }
}
```

**Rejected because**:
- Requires React rendering to test
- Harder to pass DateProvider without context
- Less explicit state transitions

### 2. Formatting in Components

```typescript
const HomeScreen = () => {
  const timeLeft = useSelector(selectTimeLeft)
  return <Text>{`${timeLeft.hours}h ${timeLeft.minutes}m`}</Text>
}
```

**Rejected because**:
- Formatting logic scattered across components
- Hard to test formatting without rendering
- Duplicated formatting logic

### 3. Single Object Return (No Discriminated Union)

```typescript
type ViewModel = {
  isActive: boolean
  countdown: string | null
  message: string | null
}
```

**Rejected because**:
- Nullable fields lead to defensive checks
- No compile-time guarantee of field availability
- Easy to access wrong field for current state

## Implementation Notes

### Key Files

- `ui/screens/Home/HomeScreen/home.view-model.ts` - Complex multi-state example
- `ui/screens/Home/HomeScreen/home-view-model.types.ts` - Type definitions
- `ui/screens/StrictMode/strictMode.view-model.ts` - Simple binary state example

### View Model Structure

```typescript
// 1. Define state enum
export enum ScreenViewState {
  StateA = 'STATE_A',
  StateB = 'STATE_B',
}

// 2. Define type for each state
type StateAViewModel = {
  type: ScreenViewState.StateA
  // properties specific to this state
}

type StateBViewModel = {
  type: ScreenViewState.StateB
  // properties specific to this state
}

// 3. Union type
export type ScreenViewModel = StateAViewModel | StateBViewModel

// 4. Selector function
export function selectScreenViewModel(
  state: RootState,
  dateProvider: DateProvider,
): ScreenViewModel {
  // Determine state and return appropriate view model
}
```

### Formatting Functions

Keep formatting functions private within the view model file:

```typescript
// Private - not exported
function formatCountdown(timeLeft: TimeRemaining): string {
  const parts: string[] = []
  if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`)
  if (timeLeft.hours > 0 || timeLeft.days > 0) parts.push(`${timeLeft.hours}h`)
  parts.push(`${timeLeft.minutes}m`)
  parts.push(`${timeLeft.seconds}s`)
  return parts.join(' ')
}

// Public - exported
export function selectStrictModeViewModel(...) { ... }
```

### Time-Dependent Updates

Combine with local state tick pattern (see `local-state-for-ui-ticks.md`):

```typescript
const [now, setNow] = useState(dateProvider.getNow())

useEffect(() => {
  const id = setInterval(() => setNow(dateProvider.getNow()), 1000)
  return () => clearInterval(id)
}, [dateProvider])

const viewModel = useSelector((state) =>
  selectViewModel(state, dateProvider)
)
```

### Related ADRs

- [Local State for UI Ticks](./local-state-for-ui-ticks.md) - Timer refresh pattern
- [DateProvider Pattern](../infrastructure/date-provider-pattern.md) - Time abstraction
- [Redux Toolkit for Business Logic](../core/redux-toolkit-for-business-logic.md) - State management

## References

- `ui/screens/Home/HomeScreen/home.view-model.ts` - Full implementation
- `ui/screens/StrictMode/strictMode.view-model.ts` - Simple implementation
- [Discriminated Unions in TypeScript](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
