# Refactoring

## When to Refactor

**After EVERY green.** Refactoring is not optional and not deferred. The cycle is RED → GREEN → **REFACTOR** → next RED. Skipping refactoring accumulates mess that compounds with each cycle.

**Never refactor while RED.** Get to GREEN first, then clean up.

## Refactor Candidates

After each GREEN, look for:

### In Production Code
- **Duplication** → Extract function/helper (keep tests on public interface)
- **Long methods** → Break into private helpers
- **Shallow modules** → Combine or deepen (see [deep-modules.md](deep-modules.md))
- **Feature envy** → Move logic to where data lives
- **Primitive obsession** → Introduce value objects or branded types
- **Dead code** → Remove anything no longer exercised by tests
- **Existing code** the new code reveals as problematic

### In Test Code
- **Duplicate setup** → Extract into fixture given/when/then methods
- **Similar test cases** → Consolidate with `it.each` (this is valid refactoring, not horizontal slicing)
- **Inline magic values** → Use data builders with named defaults
- **Verbose assertions** → Extract into `then` fixture methods with domain language
- **Repeated store creation** → Factor into fixture constructor

## Rules During Refactoring

1. **Run tests after each refactor step** — stay GREEN at all times
2. Do not change behavior — only restructure
3. Do not add new tests during refactoring — that's the next RED phase
4. Small steps: one extraction/rename at a time, verify tests still pass
5. If a refactor breaks tests, undo and try a smaller step
