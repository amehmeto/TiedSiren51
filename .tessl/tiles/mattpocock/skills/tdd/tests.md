# Good and Bad Tests

## Functional Test Naming

Test names describe **WHAT the system does** in business/domain language, never HOW it does it technically.

```typescript
// GOOD: Functional labels — reads like a specification
'should start a block session with the selected blocklists'
'should prevent starting a session when one is already active'
'should retrieve all sirens belonging to a blocklist'

// BAD: Technical/implementation labels
'should dispatch START_SESSION action'
'should call sirenGateway.allByBlocklistId'
'should set isActive to true in the slice state'
```

## Good Tests

**Integration-style through the Redux store**: Test by dispatching usecases (public input) and asserting via selectors (public output). Use the given/when/then fixture pattern with domain language.

```typescript
// GOOD: Tests observable behavior through public interface
// Uses fixture pattern with given/when/then DSL
const given = new BlockSessionFixture()
const whenStartingSession = () =>
  given.store.dispatch(startBlockSession(given.payload))

it('should start a block session', async () => {
  await whenStartingSession()
  given.thenSessionShouldBeActive()
})
```

```typescript
// GOOD: Consolidate related cases with it.each
// This is a REFACTORING step — done after individual tests pass, not upfront
it.each([
  { scenario: 'with one blocklist', blocklists: [blocklist1] },
  { scenario: 'with multiple blocklists', blocklists: [blocklist1, blocklist2] },
])('should block sirens $scenario', async ({ blocklists }) => {
  // ...
})
```

Characteristics:

- **Functional labels** — domain language, not technical
- Uses public API only (dispatch usecase → read selector)
- Survives internal refactors
- Describes WHAT, not HOW
- Uses domain language in fixture methods (`thenSessionShouldBeActive`)
- One logical assertion per test
- Data builders for test objects (`sirenBuilder()`, `blocklistBuilder()`)
- Tests ordered by **Transformation Priority Premise** — simplest behavior first

## Bad Tests

**Implementation-detail tests**: Coupled to internal structure.

```typescript
// BAD: Tests implementation details — asserts on call behavior
test('checkout calls paymentService.process', async () => {
  const mockPayment = jest.mock(paymentService)
  await checkout(cart, payment)
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total)
})
```

Red flags:

- Mocking internal collaborators (within the same layer)
- Testing private methods or slice internals directly
- Asserting on call counts/order
- Test breaks when refactoring without behavior change
- Test name describes HOW not WHAT (technical label)
- Reaching into Redux state directly instead of using selectors
- Writing tests that pass without any production code change (the test is meaningless)

```typescript
// BAD: Bypasses selectors to verify state shape
test('addSiren stores in normalized format', async () => {
  await store.dispatch(addSiren(siren))
  const state = store.getState().siren
  expect(state.entities[siren.id]).toBeDefined() // ← implementation detail
})

// GOOD: Verifies through selector (public interface)
test('added siren is retrievable', async () => {
  await store.dispatch(addSiren(siren))
  const result = selectSirenById(store.getState(), siren.id)
  expect(result.name).toBe(siren.name)
})
```

## TPP-Ordered Test Example

For a feature "filter sirens by type":

```
1. should return empty list when no sirens exist          (nil → constant)
2. should return the siren when one siren matches         (constant → variable)
3. should return only matching sirens from multiple        (scalar → collection)
4. should return empty list when no sirens match the type  (unconditional → conditional)
```

Each test forces exactly ONE transformation in the production code. Never skip ahead.

See `docs/adr/testing/fixture-pattern.md` for the full given/when/then DSL pattern.
See `docs/adr/testing/data-builder-pattern.md` for creating test objects.
