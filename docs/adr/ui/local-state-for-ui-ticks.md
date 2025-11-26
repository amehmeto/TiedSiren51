# Local State for UI Tick/Refresh Triggers

Date: 2024-11-26

## Status

Accepted

## Context

Several screens need to update their display periodically based on time:
- **Home Screen**: Shows active/scheduled block sessions with "Ends in X minutes" text
- **Timer Screen**: Shows countdown with days, hours, minutes, seconds remaining

Both screens use selectors that compute time-based values using `DateProvider`. The selectors need to be re-evaluated periodically to show updated time information.

The question is: where should the "tick" mechanism live that triggers these re-evaluations?

## Decision

Use **local React state** to trigger periodic re-renders for time-based UI updates.

```typescript
// In the component or hook
const [now, setNow] = useState<Date>(dateProvider.getNow())

useEffect(() => {
  const intervalId = setInterval(() => {
    setNow(dateProvider.getNow())
  }, 1_000)
  return () => clearInterval(intervalId)
}, [dateProvider, now])
```

The `now` state value triggers re-renders. When the component re-renders, selectors are called with the current `dateProvider`, which returns fresh time values.

## Consequences

### Positive

- **Separation of concerns**: Redux store contains business state only, not UI rendering triggers
- **Performance**: Local state changes don't go through Redux middleware or notify unrelated subscribers
- **Simplicity**: No need for actions/reducers that have no business meaning
- **Consistency**: All time-based UI updates use the same pattern

### Negative

- Each component/hook that needs ticking must implement its own interval
- The `now` state variable appears unused (it's only there to trigger re-renders)

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

### Key files using this pattern

- `app/(tabs)/home/index.tsx` - Home screen tick
- `ui/hooks/useStrictModeTimer.ts` - Timer screen tick

### Pattern details

1. Store `now` in local state (even if not directly used in render)
2. Set up interval in `useEffect` that updates `now`
3. Include `now` in dependency array to ensure interval is recreated if needed
4. Selectors receive `dateProvider` and call `dateProvider.getNow()` internally

## References

- [React useState documentation](https://react.dev/reference/react/useState)
- Related ADR: `docs/adr/infrastructure/date-provider-pattern.md`
