# Local State for UI Tick/Refresh Triggers

Date: 2024-11-26 (Updated: 2025-11-30)

## Status

Double read by amehmeto


## Context

Several screens need to update their display periodically based on time:
- **Home Screen**: Shows active/scheduled block sessions with "Ends in X minutes" text
- **Timer Screen**: Shows countdown with days, hours, minutes, seconds remaining

Both screens use selectors that compute time-based values using `DateProvider`. The selectors need to be re-evaluated periodically to show updated time information.

The question is: where should the "tick" mechanism live that triggers these re-evaluations?

## Decision

Use **local React state** to trigger periodic re-renders for time-based UI updates. This pattern is encapsulated in the `useTick` custom hook.

### The `useTick` Hook

```typescript
import { useTick } from '@/ui/hooks/useTick'

// Re-render every second (default)
useTick()

// Re-render every 500ms
useTick(500)

// Only tick when timer is active
useTick(1000, isTimerActive)
```

The hook manages the interval lifecycle internally, triggering re-renders at the specified interval. When the component re-renders, selectors are called with the current `dateProvider`, which returns fresh time values.

### Implementation

```typescript
export function useTick(intervalMs: number = 1 * SECOND, enabled = true): number {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!enabled) return

    const intervalId = setInterval(() => {
      setTick((t) => t + 1)
    }, intervalMs)

    return () => clearInterval(intervalId)
  }, [intervalMs, enabled])

  return tick
}
```

## Consequences

### Positive

- **Separation of concerns**: Redux store contains business state only, not UI rendering triggers
- **Performance**: Local state changes don't go through Redux middleware or notify unrelated subscribers
- **Simplicity**: No need for actions/reducers that have no business meaning
- **Consistency**: All time-based UI updates use the same pattern
- **Reusable**: The `useTick` hook encapsulates the pattern for easy reuse
- **Conditional**: The `enabled` parameter allows pausing ticks when not needed

### Negative

- Adds a small dependency for components needing periodic updates

### Neutral

- The pattern is explicit about what triggers re-renders

## Alternatives Considered

### Redux tick action

```typescript
// In slice
tickTimer: (state) => {
  state.tick += 1
}

// In hook
useEffect(() => {
  const intervalId = setInterval(() => {
    dispatch(tickTimer())
  }, UPDATE_INTERVAL_MS)
  return () => clearInterval(intervalId)
}, [isActive, dispatch])
```

**Rejected because:**
- Pollutes Redux store with UI-only state (`tick` counter has no business meaning)
- Every dispatch goes through middleware and notifies all store subscribers
- Mixes rendering concerns with application state

## Implementation Notes

### Key files

- `ui/hooks/useTick.ts` - The reusable tick hook
- `app/(tabs)/home/index.tsx` - Home screen using `useTick()`
- `app/(tabs)/strict-mode/index.tsx` - Strict mode screen using `useTick(1 * SECOND, isActive)`

### Usage patterns

**Always-on ticking** (e.g., Home screen):
```typescript
useTick() // Ticks every second, always enabled
```

**Conditional ticking** (e.g., Timer screen):
```typescript
const isActive = viewModel.type === StrictModeViewState.Active
useTick(1000, isActive) // Only tick when timer is active
```

## References

- [React useState documentation](https://react.dev/reference/react/useState)
- Related ADR: `docs/adr/infrastructure/date-provider-pattern.md`
