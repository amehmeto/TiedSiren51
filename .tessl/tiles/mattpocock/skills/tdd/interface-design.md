# Interface Design for Testability

Good interfaces make testing natural. In TDD, tests drive the discovery of interfaces — you don't design them upfront.

## Principles

1. **Accept dependencies, don't create them**

   ```typescript
   // Testable — dependency injected
   function processOrder(order, paymentGateway) {}

   // Hard to test — dependency created internally
   function processOrder(order) {
     const gateway = new StripeGateway();
   }
   ```

2. **Return results, don't produce side effects**

   ```typescript
   // Testable — pure transformation
   function calculateDiscount(cart): Discount {}

   // Hard to test — mutates input
   function applyDiscount(cart): void {
     cart.total -= discount;
   }
   ```

3. **Small surface area**
   - Fewer methods = fewer tests needed
   - Fewer params = simpler test setup
   - Aim for [deep modules](deep-modules.md): small interface, deep implementation

4. **Define ports in core, implement in infra**

   In hexagonal architecture, interfaces (ports) live in `core/_ports_/` and implementations (adapters) live in `infra/`. Core never imports from infra — dependency inversion is mandatory.

   ```typescript
   // core/_ports_/SirenGateway.ts — port (interface)
   interface SirenGateway {
     allByBlocklistId(id: BlocklistId): Promise<Siren[]>
   }

   // infra/powersync-siren-repository/ — production adapter
   // core/_tests_/ — fake adapter for tests
   ```

   See `docs/adr/hexagonal-architecture.md` and `docs/adr/core/repository-pattern.md`.

## Programming by Wishful Thinking

Don't design interfaces upfront. During the RED phase, **write code as if the ideal API already exists**:

1. Write the test using the interface you wish you had
2. The test won't compile — that's fine, you're in RED
3. Create the minimal interface to make the test compilable
4. Implement the minimal production code to make the test pass (GREEN)
5. The interface emerges from what the tests need, not from speculation

This prevents over-engineering. You only create what tests demand.

```typescript
// RED: Write the test first — the usecase doesn't exist yet
it('should add a siren to a blocklist', async () => {
  const siren = sirenBuilder()
  await store.dispatch(addSirenToBlocklist({ siren, blocklistId }))
  const result = selectSirensForBlocklist(store.getState(), blocklistId)
  expect(result).toContainEqual(siren)
})

// GREEN: Now create addSirenToBlocklist usecase + selector + port method
// Only what the test needs — nothing more
```
