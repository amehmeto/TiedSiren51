# When to Mock

Mock at **system boundaries** only. In hexagonal architecture, **ports are system boundaries** — faking a gateway or provider is correct, not a code smell.

- External APIs (payment, email, etc.)
- Ports/Gateways (e.g., `SirenGateway`, `AuthGateway`) — these define the boundary between core and infrastructure
- Providers (e.g., `DateProvider`, `UuidProvider`) — wrappers around system services
- Time/randomness

Don't mock:

- Internal collaborators within the same layer (e.g., don't mock one usecase inside another)
- Redux selectors, slices, or reducers — test through the store's public interface
- Anything that lives inside `core/` and isn't a port

**Why this matters for TDD**: If you mock internal collaborators, your GREEN step tests implementation, not behavior. When you refactor, the mock breaks even though behavior is unchanged. This defeats the purpose of TDD — tests should be a safety net for refactoring, not a cage.

## Test Double Terminology

Use precise terminology — not everything is a "mock":

- **Stub**: Minimal implementation returning hard-coded values. Use for stateless dependencies (e.g., `StubDateProvider` always returns the same date). Colocate stubs with real implementations in `/infra/`.
- **Fake**: Functional implementation with simplified logic and in-memory state (e.g., `FakeAuthGateway` stores users in a `Map`). Use when tests need to write-then-read or when behavior depends on accumulated state.

See `docs/adr/testing/stub-vs-fake-implementations.md` for the full decision matrix.

## Designing for Testability

At system boundaries, design interfaces (ports) that are easy to substitute:

**1. Use dependency injection via `createTestStore`**

All dependencies are injected through Redux thunk `extraArgument`. Tests override specific dependencies:

```typescript
// Override only what this test needs — defaults are provided for everything else
const store = createTestStore({
  sirenGateway: new FakeSirenGateway(),
  dateProvider: new StubDateProvider(),
})
```

See `docs/adr/core/dependency-injection-pattern.md` for the full pattern.

**2. Prefer domain-specific port methods over generic ones**

Create specific methods for each operation instead of generic CRUD:

```typescript
// GOOD: Domain-specific, independently fakeable
interface SirenGateway {
  allByBlocklistId(id: BlocklistId): Promise<Siren[]>
  save(siren: Siren): Promise<void>
}

// BAD: Generic CRUD
interface Repository<T> {
  find(query: Query): Promise<T[]>
  save(entity: T): Promise<void>
}
```

See `docs/adr/core/repository-pattern.md` for conventions.

**3. Programming by wishful thinking**

When writing a test, imagine the ideal API exists. Write the test as if calling the perfect interface. Then implement that interface minimally. The test drives the design of the port — not the other way around.

```typescript
// Write the test first, imagining the ideal API
it('should retrieve sirens for a blocklist', async () => {
  // Wishful thinking: assume this usecase exists with this signature
  await store.dispatch(retrieveSirens({ blocklistId }))
  // Wishful thinking: assume this selector returns what we need
  const sirens = selectSirensForBlocklist(store.getState(), blocklistId)
  expect(sirens).toEqual([expectedSiren])
})
// THEN create the usecase, selector, and port to make it pass
```
