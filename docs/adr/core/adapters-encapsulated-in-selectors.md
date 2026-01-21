# Entity Adapters Encapsulated in Selectors

Date: 2025-01-21

## Status

Accepted

## Context

Redux Toolkit's `createEntityAdapter` provides powerful CRUD helpers and selectors for normalized state. These adapters expose methods like `selectById`, `selectAll`, and `selectEntities`.

When components need to access entities, there's a temptation to use the adapter's selectors directly:

```typescript
// In a React component (BAD)
const blocklistEntities = useSelector((state: RootState) =>
  blocklistAdapter.getSelectors().selectEntities(state.blocklist),
)

// Then manually looking up IDs
const blocklists = blocklistIds.flatMap((id) =>
  id in blocklistEntities ? [blocklistEntities[id]] : [],
)
```

Problems with this approach:
- **Leaking implementation details**: UI layer knows about Redux adapters
- **Selection logic in UI**: The flatMap/filter logic is UI-layer responsibility leakage
- **No memoization**: Repeated calls create new selector instances
- **Testing difficulty**: Components are harder to test in isolation
- **Inconsistent patterns**: Different components may implement lookups differently

## Decision

**Entity adapters must only be used within `core/{domain}/selectors/` files.**

The UI layer (components in `app/` and `ui/`) must access entities through dedicated selectors that encapsulate all lookup logic.

### Implementation

**1. Create selectors that wrap adapter methods**

```typescript
// core/blocklist/selectors/selectBlocklistById.ts
import { RootState } from '../../_redux_/createStore'
import { blocklistAdapter } from '../blocklist'

export const selectBlocklistById = (blocklistId: string, state: RootState) =>
  blocklistAdapter.getSelectors().selectById(state.blocklist, blocklistId)
```

**2. Create selectors for batch lookups**

```typescript
// core/blocklist/selectors/selectBlocklistsByIds.ts
import { RootState } from '../../_redux_/createStore'
import { selectBlocklistEntities } from './selectBlocklistEntities'

export const selectBlocklistsByIds = (
  blocklistIds: string[],
  state: RootState,
) => {
  const entities = selectBlocklistEntities(state)
  return blocklistIds.flatMap((id) => (id in entities ? [entities[id]] : []))
}
```

**3. UI layer uses only exported selectors**

```typescript
// app/(tabs)/home/edit-block-session/[sessionId].tsx
const blocklists = useSelector((state: RootState) =>
  selectBlocklistsByIds(blockSession.blocklistIds, state),
)
```

### ESLint Enforcement

The `local-rules/no-adapter-in-ui` rule prevents direct adapter usage in UI files:

```javascript
// eslint-rules/no-adapter-in-ui.cjs
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent direct usage of Redux entity adapters in UI layer files',
    },
  },
  // Catches imports and member expressions containing *Adapter
}
```

## Consequences

### Positive

- **Clear separation**: Adapters stay in core, UI uses clean APIs
- **Encapsulated logic**: All lookup/filtering logic in selectors
- **Memoization**: Selectors can use `createSelector` for performance
- **Testable**: Components test against selector interfaces
- **Consistent patterns**: All components follow same access pattern
- **Discoverable**: Selectors are explicit, searchable exports

### Negative

- **More files**: Need selector file per lookup pattern
- **Indirection**: One more layer between UI and state
- **Learning curve**: Must understand which selector to use

### Neutral

- **Naming conventions**: Selectors follow `select{Entity}By{Criteria}` pattern

## Alternatives Considered

### 1. Allow adapters in components
**Rejected because**:
- Violates hexagonal architecture (UI depends on implementation)
- Lookup logic duplicated across components
- No enforced patterns

### 2. Global adapter selectors object
**Rejected because**:
- Less discoverable than individual exports
- Harder to tree-shake
- Breaks one-selector-per-file convention

## Implementation Notes

### Key Files
- `eslint-rules/no-adapter-in-ui.cjs` - ESLint rule
- `core/blocklist/selectors/selectBlocklistById.ts` - Single lookup
- `core/blocklist/selectors/selectBlocklistsByIds.ts` - Batch lookup
- `core/blocklist/selectors/selectBlocklistEntities.ts` - Entities map

### Related ADRs
- [Entity Adapter Pattern for Normalized State](entity-adapter-normalization.md)
- [Hexagonal Architecture](../hexagonal-architecture.md)

## References

- [RTK Entity Adapter Selectors](https://redux-toolkit.js.org/api/createEntityAdapter#selector-functions)
