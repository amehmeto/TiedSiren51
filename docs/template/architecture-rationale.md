# Architecture Rationale

Why this codebase is structured the way it is.

## Clean Architecture

**Choice**: `core/` → `infra/` → `ui/` separation

**Why**:
- Business logic (`core/`) has zero framework dependencies
- Can swap React Native for web, CLI, or backend
- Tests run fast (no UI framework overhead)
- Forces explicit dependency boundaries

**Trade-off**: More files, more boilerplate for simple features

---

## Ports & Adapters

**Choice**: Abstract interfaces in `core/_ports_/`, implementations in `infra/`

**Why**:
- Test with fakes, run with real implementations
- Swap implementations without touching business logic
- Clear contract between layers

**Trade-off**: Extra abstraction layer, can feel over-engineered for simple services

---

## Redux Toolkit

**Choice**: Redux with dependency injection via thunk extra argument

**Why**:
- Predictable state updates
- Excellent DevTools
- Middleware for side effects (listeners)
- DI enables testing without mocks

**Trade-off**: Verbose compared to Zustand/Jotai, learning curve

---

## Listener Pattern

**Choice**: Redux listener middleware instead of sagas/thunks for side effects

**Why**:
- Declarative: "when X happens, do Y"
- Colocated with domain logic
- Easier to test than sagas
- No generator syntax

**Trade-off**: Less powerful than sagas for complex flows

---

## Zod Validation

**Choice**: Zod schemas for form validation

**Why**:
- TypeScript-first, infers types from schemas
- Runtime validation + static typing
- Composable schemas
- Good error messages

**Trade-off**: Bundle size, another abstraction over simple validation

---

## Colocated Tests

**Choice**: `*.test.ts` next to source files

**Why**:
- Easy to find tests
- Tests move with code during refactors
- Encourages testing
- Clear coverage visibility

**Trade-off**: Mixed source/test in file explorer

---

## View Models

**Choice**: `*.view-model.ts` files for screen logic

**Why**:
- Separates UI rendering from data transformation
- Testable without React
- Reusable across platforms
- Clear responsibility

**Trade-off**: Extra file per screen
