## Nakayama Architecture Overview

### High-Level Layers

- **Presentation (`src/presentation`)**: React Native UI, navigation, and feature hooks. Wraps TanStack Query hooks (`useQuery`/`useMutation`) around use cases and wires global providers (Redux, React Query, Paper UI, etc.).
- **Application (`src/application`)**: Use cases and DTOs orchestrating domain logic. Each use case depends only on repository interfaces from the domain layer.
- **Domain (`src/domain`)**: Entities, value objects, and repository/service contracts. Completely framework-agnostic business rules.
- **Infrastructure (`src/infrastructure`)**: Adapters that implement domain contracts using concrete tech (REST APIs, AsyncStorage, Firebase, etc.), plus cross-cutting services and the dependency-injection container.
- **Shared (`src/shared`)**: Environment configuration, error handling, constants, i18n, debug utilities.
- **Types (`src/types`)**: Global TypeScript definitions shared across layers.

### Data Flow

1. A screen or component triggers a presentation hook (for example `useUserProfileQuery`).

2. The hook calls a use case (such as `GetUserProfileUseCase`) obtained from the DI container.

3. The use case invokes a domain repository interface.

4. The repository is implemented by an infrastructure adapter (`ApiUserProfileServiceAdapter`, `ChatRepositoryAdapter`, etc.) that uses shared services like `apiService`.

5. `apiService` builds the request (adds tokens via `TokenManager`, constructs URLs via `buildApiUrl`, sets headers, parses responses, funnels errors through `handleApiErrorResponse`).

6. The adapter maps the API response to domain entities; the use case converts them to DTOs; the hook returns data to the component.

### State & Caching

- **TanStack Query**: Configured in `presentation/providers/query-client.ts`, provided via `QueryProvider`. Hooks wrap use case calls, so caching sits at the use-case boundary without leaking React hooks into application/domain layers.
- **Redux**: Limited to presentation concerns (currently the favorites slice) and persisted with AsyncStorage. The store (`presentation/store/index.ts`) is provided in `App.tsx` and is not part of the DI container.

### Dependency Injection

- `infrastructure/di/Container.ts` is the central service locator. It lazily constructs adapters, repositories, and use cases, exposing typed getters (e.g. `getGetUserProfileUseCase`).
- App startup (`App.tsx`) calls `container.initializeAllServices()` to set up token storage, Firebase messaging, system notifications, and Firestore listeners.
- `QueryProvider` ensures `TokenManager` is initialized before hooks run.

### Error Handling

- Centralized in `shared/errors`. `handleApiErrorResponse` logs responses, parses structured errors, and invokes optional cleanup callbacks (e.g., clearing tokens on 401) before throwing a typed `ApiError`.

### Environment & Configuration

- Runtime configuration lives in `shared/config/environment.ts`, sourcing Expo environment variables for API URLs, feature flags, and debug settings. `buildApiUrl` ensures consistent API endpoint construction.

### Testing Considerations

- Domain and application layers can be unit-tested without React Native dependencies by mocking repository interfaces.
- Infrastructure adapters can be tested with API mocks or integration tests, leveraging the shared `apiService`.
- Presentation hooks/components benefit from the existing separation, allowing React Query hooks to be tested with mocked use cases or `QueryClient`.

### Extending the Architecture

- Add new features by defining domain contracts, implementing use cases, creating infrastructure adapters, then exposing hooks/screens in the presentation layer.
- If gateways need cache interaction, inject `QueryClient`-backed adapters rather than using hooks directly, keeping React concerns at the edges.