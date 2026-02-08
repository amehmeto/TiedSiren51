# No Selector Prop Drilling

Date: 2026-02-07

## Status

Accepted

## Context

In React-Redux applications, there are two approaches for child components to access Redux state:

1. **Prop drilling**: Parent calls `useSelector`, passes result as prop to child
2. **Direct selection**: Child calls `useSelector` itself

Example of prop drilling (anti-pattern):

```tsx
function Parent() {
  const blocklists = useSelector(selectAllBlocklists)
  return <BlocklistsModal items={blocklists} />
}
```

Example of direct selection (preferred):

```tsx
function Parent() {
  return <BlocklistsModal />
}

function BlocklistsModal() {
  const blocklists = useSelector(selectAllBlocklists)
  // ...
}
```

We needed to decide which pattern to enforce for consistency across the codebase.

## Decision

**Child components should call `useSelector` themselves** rather than receiving pre-selected Redux state as props.

### Enforcement

ESLint rule `local-rules/no-selector-prop-drilling` enforces this pattern:

```javascript
// .eslintrc.cjs
'local-rules/no-selector-prop-drilling': [
  'error',
  {
    ignoredComponents: [
      'FlatList',
      'SectionList',
      'VirtualizedList',
      'TiedSButton',
      'CircularTimerDisplay',
    ],
  },
],
```

### Exceptions

Some components cannot call `useSelector`:

1. **Framework list components** (`FlatList`, `SectionList`): Render item functions are not React components
2. **Presentational primitives** (`TiedSButton`): Pure display components without Redux coupling

These are configured in `ignoredComponents`.

### What to Pass Instead

| Instead of... | Pass... |
|--------------|---------|
| `items={useSelector(selectBlocklists)}` | `blocklistIds={form.values.blocklistIds}` (IDs for filtering) |
| `devices={useSelector(selectDevices)}` | `selectedDevices={form.values.devices}` (current selections) |
| `isActive={useSelector(selectIsActive)}` | Nothing - child selects internally |

## Consequences

### Positive

- **Component reusability**: Components are self-sufficient, can be moved without changing parent
- **Re-render optimization**: Only components whose selected state changes re-render
- **Clearer data ownership**: Obvious where state comes from (Redux, not props)
- **Easier testing**: Components can be tested with mock store, no prop wiring needed
- **Colocation**: Selection logic lives with the component that uses it

### Negative

- **More selectors**: Each component may define its own selector call
- **Less explicit data flow**: Props don't show what Redux data is used
- **Learning curve**: Developers must know when to use selector vs prop

### Neutral

- **Bundle size**: No impact (same hooks regardless of location)
- **Type safety**: Props still typed for non-Redux data

## Alternatives Considered

### 1. Allow Prop Drilling with Memoization

Pass selected values as props but use `React.memo` to prevent re-renders.

**Rejected because**:
- Requires careful memoization at each level
- Props still need to be wired through parent
- Doesn't solve reusability issue

### 2. Context for Shared Selections

Create context providers that hold selected values.

**Rejected because**:
- Adds complexity over direct selection
- We already have Redux; adding Context is redundant
- See [Redux Over Context](./redux-over-context-for-ui-state.md)

### 3. No Enforcement (Developer Choice)

Let developers choose per situation.

**Rejected because**:
- Inconsistent patterns across codebase
- Reviews become subjective
- New developers get conflicting examples

## Implementation Notes

### Key Files

- `eslint-rules/no-selector-prop-drilling.cjs` - Rule implementation
- `eslint-rules/no-selector-prop-drilling.spec.cjs` - Test cases
- `.eslintrc.cjs` - Rule configuration with ignored components

### Migration Example

Before (prop drilling):

```tsx
// Parent
const blocklists = useSelector(selectAllBlocklists)
return <BlocklistsModal items={blocklists} />

// Child
function BlocklistsModal({ items }) {
  return items.map(item => <Item key={item.id} {...item} />)
}
```

After (direct selection):

```tsx
// Parent
return <BlocklistsModal />

// Child
function BlocklistsModal() {
  const blocklists = useSelector(selectAllBlocklists)
  return blocklists.map(blocklist => <Item key={blocklist.id} {...blocklist} />)
}
```

### Related ADRs

- [Redux Over Context](./redux-over-context-for-ui-state.md) - Why we use Redux for all state
- [View Model Pattern](./view-model-pattern.md) - How selectors format data for display

## References

- PR #259 - Implementation and migration of existing violations
- [React-Redux Performance](https://react-redux.js.org/api/hooks#performance)
