# Codebase Navigation Guide

Reference for navigating and modifying this codebase.

## Naming Rules

| File Pattern | Export Name | Example |
|--------------|-------------|---------|
| `foo-bar.usecase.ts` | `fooBarUsecase` | `load-user.usecase.ts` → `loadUserUsecase` |
| `selectFoo.ts` | `selectFoo` | `selectAuthUserId.ts` → `selectAuthUserId` |
| `on-foo.listener.ts` | `onFooListener` | `on-user-logged-in.listener.ts` → `onUserLoggedInListener` |
| `foo.view-model.ts` | `selectFooViewModel` | `home.view-model.ts` → `selectHomeViewModel` |
| `foo.builder.ts` | `buildFoo` | `block-session.builder.ts` → `buildBlockSession` |
| `foo.fixture.ts` | `fooFixture` or `createFooFixture` | `auth.fixture.ts` → `authFixture` |
| `foo.schema.ts` | `fooSchema` | `block-session.schema.ts` → `blockSessionSchema` |
| `foo.slice.ts` | `fooSlice` (in folder `foo/`) | `auth/auth.slice.ts` → `authSlice` |
| `prefix.domain.repository.ts` | `PrefixDomainRepository` | `pouchdb.blocklist.repository.ts` → `PouchdbBlocklistRepository` |
| `prefix.domain.gateway.ts` | `PrefixDomainGateway` | `firebase.auth.gateway.ts` → `FirebaseAuthGateway` |

## File Locations

| Concept | Path Pattern |
|---------|--------------|
| Usecases | `core/{domain}/usecases/*.usecase.ts` |
| Selectors | `core/{domain}/selectors/select*.ts` |
| Listeners | `core/{domain}/listeners/*.listener.ts` |
| Slices | `core/{domain}/*.slice.ts` |
| Reducers | `core/{domain}/reducer.ts` |
| Schemas | `**/*.schema.ts` |
| Ports | `core/_ports_/*.ts` |
| Repositories | `infra/*-repository/*.repository.ts` |
| Gateways | `infra/*-gateway/*.gateway.ts` |
| View Models | `ui/screens/**/*.view-model.ts` |
| Tests | `*.spec.ts` (co-located with source) |
| Builders | `core/_tests_/data-builders/*.builder.ts` |
| Fixtures | `**/*.fixture.ts` |

## Example Files

Copy from these when creating new files:

| To Create | Copy From |
|-----------|-----------|
| Usecase | `core/auth/usecases/load-user.usecase.ts` |
| Usecase test | `core/auth/usecases/load-user.usecase.spec.ts` |
| Selector | `core/auth/selectors/selectAuthUserId.ts` |
| Selector test | `core/auth/selectors/selectAuthUserId.test.ts` |
| Listener | `core/auth/listeners/on-user-logged-in.listener.ts` |
| Listener test | `core/auth/listeners/on-user-logged-in.listener.test.ts` |
| View model | `ui/screens/Home/HomeScreen/home.view-model.ts` |
| View model test | `ui/screens/Home/HomeScreen/home.view-model.test.ts` |
| Slice | `core/auth/auth.slice.ts` |
| Builder | `core/_tests_/data-builders/block-session.builder.ts` |
| Fixture | `core/auth/authentification.fixture.ts` |
| Repository (port) | `core/_ports_/block-session.repository.ts` |
| Repository (impl) | `infra/block-session-repository/pouchdb.block-session.repository.ts` |
| Gateway (port) | `core/_ports_/auth.gateway.ts` |
| Gateway (impl) | `infra/auth-gateway/firebase.auth.gateway.ts` |

## Checklists

### Adding a Usecase

1. Create `core/{domain}/usecases/{name}.usecase.ts`
2. Create co-located test `{name}.usecase.spec.ts`
3. Export `{camelCaseName}Usecase` matching filename
4. Use `createAppAsyncThunk` for async operations
5. Run `npm run lint` to verify naming

### Adding a Selector

1. Create `core/{domain}/selectors/select{Name}.ts`
2. Create co-located test `select{Name}.test.ts`
3. Export `select{Name}` matching filename
4. Use `createSelector` from `@reduxjs/toolkit` for derived state
5. Run `npm run lint` to verify

### Adding a Listener

1. Create `core/{domain}/listeners/on-{event}.listener.ts`
2. Create co-located test `on-{event}.listener.test.ts`
3. Export `on{Event}Listener` matching filename
4. Register in `core/_redux_/registerListeners.ts`
5. Run `npm run lint` to verify

### Adding a Port (Interface)

1. Create interface in `core/_ports_/{name}.ts`
2. Use descriptive name without `I` prefix (e.g., `AuthGateway`, not `IAuthGateway`)
3. Create implementation in `infra/{name}-{type}/`

### Adding a Repository/Gateway Implementation

1. Create in `infra/{domain}-{type}/{prefix}.{domain}.{type}.ts`
2. Class name: `{Prefix}{Domain}{Type}` (e.g., `PouchdbBlocklistRepository`)
3. Must `implement` the port interface from `core/_ports_/`
4. Create co-located test file

### Adding a View Model

1. Create `ui/screens/{Screen}/{name}.view-model.ts`
2. Create co-located test `{name}.view-model.test.ts`
3. Export `select{Name}ViewModel`
4. Use `createSelector` to compose from core selectors

## Content Search Patterns

| Find | Search For |
|------|------------|
| Selector usages | `useAppSelector(selectXxx)` or `selectXxx(state)` |
| Usecase dispatches | `dispatch(xxxUsecase(` |
| Port implementations | `implements XxxRepository` or `implements XxxGateway` |
| Slice actions | `xxxSlice.actions` |
| Listener registrations | `startListening` in `core/_redux_/registerListeners.ts` |
| State shape | `xxxSlice.getInitialState()` or type `XxxState` |

## Cross-References

| From | To |
|------|----|
| Port interface | Implementation: search `implements PortName` in `infra/` |
| Selector | Usages: search selector name in `ui/` and `core/` |
| Usecase | Dispatches: search usecase name in `ui/` and listeners |
| Slice action | Reducers: check the slice file's `reducers` and `extraReducers` |
| Domain type | Builders: check `core/_tests_/data-builders/` |

## Verification

After any change:

```bash
npm run lint          # Verify naming conventions and code style
npm test              # Run tests (watch mode)
npm run test:prepush  # Full test suite with coverage
```
