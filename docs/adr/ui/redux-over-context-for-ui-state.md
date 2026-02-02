# Redux Over Context for UI State

Date: 2026-02-02

## Status

Accepted

## Context

When implementing UI-level global state (like toasts, modals, or other transient UI elements), we needed to decide between:

1. React Context API with useState/useReducer
2. Redux (already used for business logic)

The specific trigger was implementing a toast notification system that needed to be accessible from any component in the app. Initially implemented with React Context, but reconsidered for consistency.

## Decision

**Use Redux for all global state**, including UI-only concerns like toasts.

Even though toasts are "UI-only" state that don't involve business logic, we favor Redux because:

1. **Consistency**: One state management approach throughout the app
2. **Testability**: Redux state changes are trivially testable with `createTestStore()`
3. **DevTools**: All state visible in Redux DevTools (including UI state)
4. **Existing infrastructure**: No new patterns to learn or maintain

### Implementation

```typescript
// core/toast/toast.slice.ts
export const toastSlice = createSlice({
  name: 'toast',
  initialState: { message: '', isVisible: false },
  reducers: {
    showToast: (state, action: PayloadAction<string>) => {
      state.message = action.payload
      state.isVisible = true
    },
    hideToast: (state) => {
      state.isVisible = false
    },
  },
})

// Usage in components
dispatch(showToast('Action disabled'))
```

## Consequences

### Positive

- **Unified testing**: Test UI state same way as business state
- **Time-travel debugging**: Can replay toast appearances in DevTools
- **No Context boilerplate**: No Provider wrappers or custom hooks needed
- **Predictable**: Same patterns as rest of codebase

### Negative

- **Slight overhead**: Toast slice in core/ even though it's UI-only
- **Architecture purity**: Could argue toast doesn't belong in core/

### Neutral

- **Bundle size**: Negligible since Redux already included

## Alternatives Considered

### React Context API

**Rejected because**:
- Adds another state management pattern
- Not as easily testable (requires Provider wrapper in tests)
- No DevTools visibility
- Context re-renders can cause performance issues

## Implementation Notes

### Key Files
- `/core/toast/toast.slice.ts` - Toast state slice
- `/ui/design-system/components/shared/TiedSToast.tsx` - Toast component using useSelector

### Related ADRs
- [Redux Toolkit for Business Logic](../core/redux-toolkit-for-business-logic.md)

## References

- PR #256 - Implementation that moved from Context to Redux
