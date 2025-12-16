# Entity Adapter Pattern for Normalized State

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51 manages collections of entities with relationships:

- **Sirens**: Individual apps/websites/keywords to block
- **Blocklists**: Collections of sirens (many sirens per blocklist)
- **Block Sessions**: Active/past sessions (reference blocklists)
- **Remote Devices**: Connected devices

Challenges:
- **Duplication**: Same siren can be in multiple blocklists
- **Updates**: Updating a siren should reflect everywhere it appears
- **Lookups**: Need fast lookup by ID
- **Ordering**: Need to maintain order (recently used, alphabetical)
- **CRUD operations**: Add, update, remove entities efficiently

Naive approach (array of objects):
```typescript
{
  sirens: [
    { id: '1', name: 'Twitter', type: 'app' },
    { id: '2', name: 'reddit.com', type: 'website' },
  ],
  blocklists: [
    {
      id: 'bl1',
      sirens: [
        { id: '1', name: 'Twitter', type: 'app' }, // Duplication!
      ],
    },
  ],
}
```

Problems:
- Duplication wastes memory
- Updating siren requires finding all copies
- No fast lookup (O(n) search)

## Decision

Use **Redux Toolkit's `createEntityAdapter`** for normalized entity collections.

### Implementation

**1. Create Entity Adapter** (per domain)

```typescript
// /core/siren/siren.ts
export const sirenAdapter = createEntityAdapter<Siren>({
  selectId: (siren) => siren.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})
```

**2. Normalized State Structure**

```typescript
{
  entities: {
    '1': { id: '1', name: 'Twitter', type: 'app' },
    '2': { id: '2', name: 'reddit.com', type: 'website' },
  },
  ids: ['1', '2'], // Maintains sort order
}
```

**3. Reducer Integration**

```typescript
// /core/siren/siren.slice.ts
const sirenSlice = createSlice({
  name: 'siren',
  initialState: sirenAdapter.getInitialState(),
  reducers: {
    sirenAdded: sirenAdapter.addOne,
    sirenUpdated: sirenAdapter.updateOne,
    sirenRemoved: sirenAdapter.removeOne,
    sirensLoaded: sirenAdapter.setAll,
  },
})
```

**4. Selectors**

```typescript
// Auto-generated selectors
const sirenSelectors = sirenAdapter.getSelectors(
  (state: RootState) => state.siren
)

export const {
  selectAll: selectAllSirens,        // All sirens as array
  selectById: selectSirenById,       // Lookup by ID (O(1))
  selectIds: selectSirenIds,         // Just IDs
  selectEntities: selectSirenEntities, // Entities object
  selectTotal: selectTotalSirens,    // Count
} = sirenSelectors
```

**5. Cross-References**

```typescript
// Blocklist stores siren IDs, not full sirens
{
  id: 'bl1',
  name: 'Focus Mode',
  sirenIds: ['1', '2'], // References, not copies
}

// Selector composes to get full sirens
export const selectBlocklistWithSirens = createSelector(
  [selectBlocklistById, selectSirenEntities],
  (blocklist, sirenEntities) => ({
    ...blocklist,
    sirens: blocklist.sirenIds.map(id => sirenEntities[id]),
  })
)
```

## Consequences

### Positive

- **No duplication**: Each entity stored once
- **Fast lookups**: O(1) by ID via entities object
- **Consistent updates**: Update in one place, reflected everywhere
- **CRUD helpers**: `addOne`, `updateOne`, `upsertMany`, etc. built-in
- **Type-safe**: Full TypeScript inference
- **Sorting**: Automatic sorting via `sortComparer`
- **Performance**: Efficient updates (no array scans)
- **Selectors**: Auto-generated selectors for common queries
- **Immutability**: Works with Immer (Redux Toolkit)
- **Testing**: Easy to construct normalized test state
- **Standard pattern**: Well-documented Redux pattern

### Negative

- **Indirection**: Must join IDs to get related entities
- **Selector complexity**: Selectors need to compose/join data
- **Learning curve**: Team must understand normalization
- **Initial setup**: More boilerplate than simple arrays
- **Debugging**: State looks different in Redux DevTools (not intuitive)
- **Migration cost**: Existing code must be refactored
- **Over-engineering**: Simple lists don't need normalization

### Neutral

- **State shape**: Enforces specific structure (entities + ids)
- **Denormalization**: Must denormalize for display (via selectors)

## Alternatives Considered

### 1. Arrays of Objects
**Rejected because**:
- Duplication across collections
- Slow lookups (O(n))
- Update complexity (find all copies)
- Memory inefficient

### 2. Manual Normalization
**Rejected because**:
- Reinvents entity adapter
- More error-prone
- No type safety guarantees
- More boilerplate

### 3. Denormalized with Computed Equality
**Rejected because**:
- Still duplicates data
- React re-renders when references change
- Hard to maintain consistency

### 4. GraphQL Normalized Cache (Apollo)
**Rejected because**:
- Overkill (we don't use GraphQL)
- Bundle size
- Different mental model

## Implementation Notes

### Key Files
- `/core/block-session/block.session.ts` - BlockSession adapter
- `/core/blocklist/blocklist.ts` - Blocklist adapter
- `/core/siren/siren.ts` - Siren adapter

### Domain Examples

**Sirens:**
```typescript
export const sirenAdapter = createEntityAdapter<Siren>({
  selectId: (siren) => siren.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})
```

**Blocklists:**
```typescript
export const blocklistAdapter = createEntityAdapter<Blocklist>({
  selectId: (blocklist) => blocklist.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})
```

**Block Sessions:**
```typescript
export const blockSessionAdapter = createEntityAdapter<BlockSession>({
  selectId: (session) => session.id,
  sortComparer: (a, b) =>
    b.startTime.getTime() - a.startTime.getTime(), // Most recent first
})
```

### CRUD Patterns

**Add:**
```typescript
dispatch(sirenAdded({ id: '1', name: 'Twitter', type: 'app' }))
```

**Update:**
```typescript
dispatch(sirenUpdated({ id: '1', changes: { name: 'X (Twitter)' } }))
```

**Remove:**
```typescript
dispatch(sirenRemoved('1'))
```

**Batch:**
```typescript
dispatch(sirensLoaded([siren1, siren2, siren3]))
```

### Testing

```typescript
// Easy to construct normalized test state
const testState = {
  siren: sirenAdapter.getInitialState({
    entities: {
      '1': { id: '1', name: 'Twitter', type: 'app' },
    },
    ids: ['1'],
  }),
}
```

### Related ADRs
- [Redux Toolkit for Business Logic](redux-toolkit-for-business-logic.md)
- [Hexagonal Architecture](../hexagonal-architecture.md)

## References

- [RTK Entity Adapter](https://redux-toolkit.js.org/api/createEntityAdapter)
- [Normalizing State Shape](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape)
- `/core/siren/siren.ts` - Implementation example
