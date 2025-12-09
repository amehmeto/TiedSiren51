# Centralized Services Initialization via useAppInitialization Hook

Date: 2025-12-09

## Status

Accepted

## Context

The application requires several services to be initialized before it can function:
- Logger (including error monitoring like Sentry)
- Database (Prisma)
- Notification service
- Background task service
- Initial data loading (sirens, user)

These initializations must happen in a specific order and need to be orchestrated from a single location. The question is where this orchestration should happen.

Forces at play:
- React Native apps have an entry point (`_layout.tsx`) that renders immediately
- Services need to be initialized before the app is usable
- Initialization errors need to be handled gracefully with user feedback
- The initialization flow should be testable and debuggable
- Following hexagonal architecture, infrastructure concerns should be separated from UI

## Decision

All service initialization is orchestrated through the `useAppInitialization` hook located at `/ui/hooks/useAppInitialization.tsx`.

### Initialization Order

```typescript
const initializeServices = async (appStore: AppStore) => {
  const { logger } = dependencies

  logger.initialize()           // 1. Logger first (to capture errors)
  await databaseService.initialize()    // 2. Database
  await notificationService.initialize() // 3. Notifications
  await backgroundTaskService.initialize(appStore) // 4. Background tasks

  await appStore.dispatch(targetSirens()) // 5. Load initial data
  await appStore.dispatch(loadUser())     // 6. Load user state
}
```

### Key Principles

1. **Logger initializes first**: Ensures all subsequent initialization steps can be logged and errors captured
2. **Services are initialized via `dependencies`**: Uses the dependency injection pattern from hexagonal architecture
3. **Async operations are awaited**: Guarantees initialization order
4. **Error handling is centralized**: Single try/catch with user-facing error state
5. **No initialization in `_layout.tsx`**: Entry point only handles rendering, not service setup

## Consequences

### Positive

- **Single source of truth**: All initialization logic in one place
- **Debuggable**: Logger captures each initialization step
- **Error resilience**: Failures are caught and displayed to user
- **Testable**: Hook can be tested with fake dependencies
- **Clean entry point**: `_layout.tsx` remains focused on rendering
- **Follows hexagonal architecture**: Infrastructure initialization uses ports/adapters

### Negative

- **Hook complexity**: The hook has multiple responsibilities (init + auth state)
- **Sequential initialization**: Some services could potentially initialize in parallel

### Neutral

- **Loading state required**: App shows loading screen during initialization
- **Hook must be used at top level**: Only `AppWithInitialization` component uses it

## Alternatives Considered

### 1. Initialize Services in `_layout.tsx` Directly

```typescript
// _layout.tsx
Sentry.init({ ... })  // Direct call at module level
```

**Rejected because**:
- Mixes UI concerns with infrastructure initialization
- Harder to test
- No centralized error handling
- Doesn't follow hexagonal architecture (infrastructure code in UI layer)

### 2. Separate Initialization Service

Create a dedicated `AppInitializationService` in `/infra`.

**Rejected because**:
- Over-engineering for current needs
- The hook already provides the orchestration
- Would require another port/adapter pair

### 3. Initialize in Redux Middleware

Use Redux middleware to trigger initialization on store creation.

**Rejected because**:
- Mixes state management with initialization concerns
- Less explicit control over initialization order
- Harder to show loading/error states

## Implementation Notes

### Key Files

- `/ui/hooks/useAppInitialization.tsx` - Main initialization hook
- `/ui/dependencies.ts` - Production dependency factory
- `/app/_layout.tsx` - Entry point that uses the hook
- `/core/_ports_/logger.ts` - Logger interface with `initialize()` method

### Adding New Services

When adding a new service that requires initialization:

1. Add `initialize()` method to the port interface if needed
2. Implement initialization in the adapter
3. Add the initialization call to `useAppInitialization` in the appropriate order
4. Add logging before/after the initialization step

## References

- [Hexagonal Architecture ADR](./hexagonal-architecture.md)
- Sentry Expo Integration: https://docs.expo.dev/guides/using-sentry/
