# Domain-Based Slices for State Organization

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51's state management needs clear organization for:

- **Auth**: User authentication and session state
- **Siren**: App/website/keyword definitions to block
- **Blocklist**: Collections of sirens for different contexts
- **BlockSession**: Active and historical block sessions
- **UI**: Application-wide UI state

Challenges:
- **Scalability**: State grows complex as features are added
- **Separation**: Different domains have different concerns
- **Modularity**: Changes to one domain shouldn't affect others
- **Discoverability**: Developers should easily find relevant state
- **Testing**: Should test domain logic independently
- **Coupling**: Minimize coupling between domains

Traditional approaches:
- **Single slice**: All state in one reducer (doesn't scale)
- **Feature-based**: Slices organized by UI features (couples state to UI)
- **Type-based**: Slices by type (users, items, settings) - less semantic

## Decision

Organize Redux state using **Domain-Based Slices** aligned with business domains.

### Structure

```
/core/
  /auth/
    ├── reducer.ts           # Auth slice
    ├── selectors/           # Auth selectors
    ├── usecases/            # Auth async thunks
    └── listeners/           # Auth side effects

  /siren/
    ├── siren.ts             # Entity adapter
    ├── siren.slice.ts       # Siren slice
    ├── selectors/           # Siren selectors
    ├── usecases/            # Siren async thunks
    └── listeners/           # Siren side effects

  /blocklist/
    ├── blocklist.ts         # Entity adapter
    ├── blocklist.slice.ts   # Blocklist slice
    ├── selectors/           # Blocklist selectors
    └── usecases/            # Blocklist async thunks

  /block-session/
    ├── block.session.ts     # Entity adapter
    ├── block.session.slice.ts # Session slice
    ├── selectors/           # Session selectors
    ├── usecases/            # Session async thunks
    └── listeners/           # Session side effects

  /_redux_/
    └── rootReducer.ts       # Combines all slices
```

### Root State Shape

```typescript
type RootState = {
  auth: AuthState
  siren: SirenState
  blocklist: BlocklistState
  blockSession: BlockSessionState
}
```

### Root Reducer

```typescript
// /core/_redux_/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit'
import { authReducer } from '@core/auth/reducer'
import { sirenSlice } from '@core/siren/siren.slice'
import { blocklistSlice } from '@core/blocklist/blocklist.slice'
import { blockSessionSlice } from '@core/block-session/block.session.slice'

export const rootReducer = combineReducers({
  auth: authReducer,
  siren: sirenSlice.reducer,
  blocklist: blocklistSlice.reducer,
  blockSession: blockSessionSlice.reducer,
})

export type RootState = ReturnType<typeof rootReducer>
```

## Consequences

### Positive

- **Clear boundaries**: Each domain has its own state slice
- **Scalability**: New domains added without affecting existing ones
- **Modularity**: Domains can be developed independently
- **Discoverability**: Easy to find where state lives
- **Testing**: Test domain slices in isolation
- **Domain alignment**: State structure matches business domains
- **Separation of concerns**: Auth state separate from session state
- **Type safety**: Each slice has its own typed state
- **Reducer composition**: Easy to combine with `combineReducers`
- **Mental model**: Matches how developers think about the app

### Negative

- **Cross-domain queries**: Need to select from multiple slices
- **Duplication**: Some state might logically belong to multiple domains
- **Granularity decisions**: Must decide domain boundaries
- **Normalization complexity**: Related data spread across slices
- **Learning curve**: Must understand domain model

### Neutral

- **State structure**: Enforces specific organization pattern
- **Convention**: Requires team to follow domain organization

## Alternatives Considered

### 1. Single Monolithic Slice
**Rejected because**:
```typescript
{
  app: {
    users: [],
    sirens: [],
    sessions: [],
    blocklists: [],
    // Everything in one slice
  }
}
```
- Doesn't scale
- Hard to find relevant state
- Reducer becomes massive
- Testing difficult

### 2. Feature-Based Slices (UI-driven)
**Rejected because**:
```typescript
{
  homeScreen: { ... },
  settingsScreen: { ... },
  blocklistScreen: { ... },
}
```
- Couples state to UI structure
- State can't be reused across screens
- UI refactoring requires state refactoring
- Business logic mixed with UI concerns

### 3. Type-Based Slices
**Rejected because**:
```typescript
{
  entities: { users, sirens, blocklists },
  ui: { modals, forms },
  meta: { loading, errors },
}
```
- Less semantic than domain-based
- Harder to understand business logic
- Doesn't match mental model
- Cross-cutting concerns still exist

### 4. Flat Structure (No Slices)
**Rejected because**:
```typescript
{
  users: [],
  sirens: [],
  activeSessions: [],
  // All at root level
}
```
- No namespacing
- Name collisions possible
- Hard to organize as app grows
- No clear boundaries

## Implementation Notes

### Key Files
- `/core/_redux_/rootReducer.ts` - Slice combination
- `/core/auth/reducer.ts` - Auth domain slice
- `/core/siren/siren.slice.ts` - Siren domain slice
- `/core/blocklist/blocklist.slice.ts` - Blocklist domain slice
- `/core/block-session/block.session.slice.ts` - BlockSession domain slice

### Slice Structure Pattern

Each domain follows this structure:

```typescript
// /core/{domain}/{domain}.slice.ts
import { createSlice } from '@reduxjs/toolkit'
import { {domain}Adapter } from './{domain}'

const {domain}Slice = createSlice({
  name: '{domain}',
  initialState: {domain}Adapter.getInitialState({
    // Domain-specific state
    loading: false,
    error: null,
  }),
  reducers: {
    // Synchronous actions
    {domain}Added: {domain}Adapter.addOne,
    {domain}Updated: {domain}Adapter.updateOne,
  },
  extraReducers: (builder) => {
    // Async thunk handlers
    builder.addCase(fetch{Domain}.pending, (state) => {
      state.loading = true
    })
  },
})

export const { {domain}Added, {domain}Updated } = {domain}Slice.actions
export default {domain}Slice.reducer
```

### Cross-Domain Selectors

When you need data from multiple domains:

```typescript
// Selector that joins data from multiple slices
export const selectBlocklistWithSirens = createSelector(
  [selectBlocklistById, selectSirenEntities],
  (blocklist, sirenEntities) => {
    if (!blocklist) return null

    return {
      ...blocklist,
      sirens: blocklist.sirenIds.map(id => sirenEntities[id]),
    }
  }
)
```

### Domain Boundaries

**Auth Domain**:
- User authentication state
- Login/logout status
- User profile data

**Siren Domain**:
- App, website, keyword definitions
- Platform-specific data
- Siren metadata

**Blocklist Domain**:
- Collections of sirens
- Blocklist metadata
- References to sirens (IDs)

**BlockSession Domain**:
- Active sessions
- Historical sessions
- Session timing and state

### State Access Pattern

```typescript
// Component accessing multiple domains
const MyComponent = () => {
  // Each domain accessed separately
  const user = useAppSelector(selectCurrentUser)           // auth
  const sirens = useAppSelector(selectAllSirens)          // siren
  const blocklist = useAppSelector(selectActiveBlocklist) // blocklist
  const session = useAppSelector(selectActiveSession)     // blockSession

  // Or use view model to combine
  const vm = useMyViewModel() // View model handles cross-domain logic
}
```

### Testing Domains Independently

```typescript
// Test auth domain
const authState = authReducer(undefined, userLoggedIn(user))
expect(authState.user).toEqual(user)

// Test siren domain
const sirenState = sirenSlice.reducer(undefined, sirenAdded(siren))
expect(selectAllSirens({ siren: sirenState })).toHaveLength(1)

// Full store test (all domains)
const store = createTestStore()
store.dispatch(startBlockSession({ blocklistId: '1' }))
expect(selectActiveSession(store.getState())).toBeDefined()
```

### Related ADRs
- [Redux Toolkit for Business Logic](redux-toolkit-for-business-logic.md)
- [Entity Adapter Normalization](entity-adapter-normalization.md)
- [Hexagonal Architecture](../architecture/hexagonal-architecture.md)
- [Feature-Based Domains](../code-organization/feature-based-domains.md)

## References

- [Redux State Shape](https://redux.js.org/usage/structuring-reducers/basic-reducer-structure)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- `/core/_redux_/rootReducer.ts` - Implementation
