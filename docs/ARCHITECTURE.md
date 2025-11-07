# TiedSiren51 - Architecture & Dependency Injection Guide

## Project Overview

**TiedSiren51** is a React Native mobile application built with Expo that implements a **Hexagonal Architecture** (also known as Ports & Adapters) pattern. The app manages block sessions, blocklists, and sirens (alerts/notifications) for app blocking functionality.

### Key Technologies
- **React Native** with **Expo** (~51.0)
- **Redux Toolkit** for state management
- **Prisma** for database access
- **Firebase** for authentication
- **TypeScript** for type safety
- **Expo Router** for file-based routing

---

## Folder Structure

```
TiedSiren51/
├── app/                          # UI Layer - Expo Router (file-based routing)
│   ├── (auth)/                   # Authentication screens group
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Tab-based navigation screens
│   │   ├── home/                 # Home screen
│   │   ├── blocklists/           # Blocklist management
│   │   ├── settings/             # Settings screen
│   │   └── strict-mode/          # Strict mode screen
│   ├── _layout.tsx               # Root layout (Redux Provider setup)
│   ├── index.tsx                 # Root redirect
│   └── +not-found.tsx            # 404 page
│
├── ui/                           # UI Layer - Design system & components
│   ├── dependencies.ts          # ⭐ DI CONTAINER - Production dependencies
│   ├── design-system/           # Reusable UI components
│   ├── screens/                 # Screen components
│   ├── hooks/                   # React hooks (e.g., useAppInitialization)
│   ├── navigation/              # Navigation utilities
│   └── auth-schemas/            # Form validation schemas
│
├── core/                         # Business Logic Layer (Domain)
│   ├── _redux_/                 # Redux configuration
│   │   ├── dependencies.ts      # ⭐ DI TYPE DEFINITION
│   │   ├── createStore.ts       # ⭐ Store factory with DI
│   │   ├── create-app-thunk.ts  # ⭐ Typed thunk creator
│   │   └── rootReducer.ts       # Root reducer
│   │
│   ├── ports/                   # ⭐ PORT INTERFACES (Abstractions)
│   │   ├── auth.gateway.ts
│   │   ├── block-session.repository.ts
│   │   ├── blocklist.repository.ts
│   │   ├── database.service.ts
│   │   ├── date-provider.ts
│   │   ├── notification.service.ts
│   │   └── ... (12 total ports)
│   │
│   ├── auth/                    # Authentication domain
│   │   ├── usecases/            # Business use cases (thunks)
│   │   ├── reducer.ts           # Auth slice reducer
│   │   ├── selectors/           # State selectors
│   │   └── listenners/          # Side effect listeners
│   │
│   ├── block-session/           # Block session domain
│   │   ├── usecases/
│   │   ├── block-session.slice.ts
│   │   └── selectors/
│   │
│   ├── blocklist/               # Blocklist domain
│   │   ├── usecases/
│   │   ├── blocklist.slice.ts
│   │   └── selectors/
│   │
│   ├── siren/                   # Siren (alert) domain
│   │   ├── usecases/
│   │   ├── siren.slice.ts
│   │   └── selectors/
│   │
│   └── _tests_/                 # Test utilities
│       ├── createTestStore.ts   # ⭐ Test DI container
│       └── state-builder.ts
│
├── infra/                        # Infrastructure Layer (Adapters)
│   ├── auth-gateway/
│   │   ├── firebase.auth.gateway.ts      # Real implementation
│   │   └── fake.auth.gateway.ts          # Test implementation
│   │
│   ├── block-session-repository/
│   │   ├── prisma.block-session.repository.ts  # Real implementation
│   │   └── fake-data.block-session.repository.ts  # Test implementation
│   │
│   ├── blocklist-repository/
│   │   ├── prisma.blocklist.repository.ts
│   │   └── fake-data.blocklist.repository.ts
│   │
│   ├── database-service/
│   │   ├── prisma.database.service.ts
│   │   └── stub.database.service.ts
│   │
│   ├── date-provider/
│   │   ├── real.date-provider.ts
│   │   └── stub.date-provider.ts
│   │
│   ├── notification-service/
│   │   ├── expo.notification.service.ts
│   │   └── fake.notification.service.ts
│   │
│   └── ... (other infrastructure adapters)
│
├── assets/                       # Static assets (images, fonts, icons)
├── migrations/                   # Prisma database migrations
├── schema.prisma                 # Prisma schema definition
└── package.json
```

---

## Dependency Injection (DI) Pattern

This project uses **Dependency Injection** through Redux Toolkit's `extraArgument` feature. This allows the business logic layer to depend on abstractions (ports) rather than concrete implementations (adapters).

### DI Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer (app/_layout.tsx)                │
│                                                               │
│  import { dependencies } from '@/ui/dependencies'            │
│  const store = createStore(dependencies)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              DI Container (ui/dependencies.ts)               │
│                                                               │
│  const mobileDependencies = {                                │
│    databaseService: new PrismaDatabaseService(),             │
│    authGateway: new FirebaseAuthGateway(),                   │
│    blockSessionRepository: new PrismaBlockSessionRepository()│
│    ...                                                        │
│  }                                                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         Store Factory (core/_redux_/createStore.ts)         │
│                                                               │
│  configureStore({                                            │
│    middleware: {                                             │
│      thunk: { extraArgument: dependencies }                  │
│    }                                                          │
│  })                                                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│      Business Logic (core/*/usecases/*.usecase.ts)           │
│                                                               │
│  export const loadUser = createAppAsyncThunk(                │
│    async (_, { extra: { blocklistRepository } }) => {        │
│      return await blocklistRepository.findAll()              │
│    }                                                          │
│  )                                                            │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. **DI Type Definition** (`core/_redux_/dependencies.ts`)

Defines the contract for all dependencies:

```typescript
export type Dependencies = {
  databaseService: DatabaseService
  authGateway: AuthGateway
  blockSessionRepository: BlockSessionRepository
  blocklistRepository: BlocklistRepository
  dateProvider: DateProvider
  // ... 12 total dependencies
}
```

#### 2. **Production DI Container** (`ui/dependencies.ts`)

Wires up real implementations for production:

```typescript
const mobileDependencies = {
  databaseService: new PrismaDatabaseService(),
  authGateway: process.env.EXPO_PUBLIC_E2E
    ? new FakeAuthGateway()      // E2E testing
    : new FirebaseAuthGateway(), // Production
  blockSessionRepository: new PrismaBlockSessionRepository(),
  // ... all dependencies
}

export const dependencies: Dependencies = mobileDependencies
```

#### 3. **Store Factory** (`core/_redux_/createStore.ts`)

Injects dependencies into Redux store:

```typescript
export const createStore = (
  dependencies: Dependencies,
  preloadedState?: PreloadedState,
) => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: dependencies,  // ⭐ DI injection point
        },
      }),
  })
  return store
}
```

#### 4. **Typed Thunk Creator** (`core/_redux_/create-app-thunk.ts`)

Provides type-safe access to dependencies in thunks:

```typescript
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  extra: Dependencies  // ⭐ Typed dependencies
}>()
```

#### 5. **Usage in Use Cases** (Example: `core/auth/usecases/load-user.usecase.ts`)

Access dependencies via the `extra` parameter:

```typescript
export const loadUser = createAppAsyncThunk<UserData>(
  'auth/loadUser',
  async (
    _,
    {
      extra: { blocklistRepository, blockSessionRepository, sirensRepository },
    },
  ) => {
    // Use injected dependencies
    const [blocklists, blockSessions, sirens] = await Promise.all([
      blocklistRepository.findAll(),
      blockSessionRepository.findAll(),
      sirensRepository.getSelectableSirens(),
    ])
    return { blocklists, blockSessions, sirens }
  },
)
```

#### 6. **Test DI Container** (`core/_tests_/createTestStore.ts`)

Provides test doubles (fakes/stubs) for testing:

```typescript
export const createTestStore = (
  {
    authGateway = new FakeAuthGateway(),
    blockSessionRepository = new FakeDataBlockSessionRepository(),
    // ... defaults to fake implementations
  }: Partial<Dependencies> = {},
  preloadedState?: Partial<RootState>,
) => createStore({ ... }, preloadedState)
```

---

## Dependency Injection Benefits

### 1. **Testability**
- Easy to swap real implementations with test doubles
- No need to mock complex infrastructure in tests
- Isolated unit testing of business logic

### 2. **Flexibility**
- Switch implementations (e.g., Firebase → Auth0) without changing business logic
- Environment-specific configurations (production vs. E2E testing)

### 3. **Separation of Concerns**
- Business logic doesn't know about concrete implementations
- Infrastructure changes don't affect core domain logic
- Clear boundaries between layers

### 4. **Type Safety**
- TypeScript ensures all dependencies are provided
- Compile-time checks prevent missing dependencies

---

## Dependency List

The project uses **12 dependencies**:

| Dependency | Port Interface | Production Implementation | Test Implementation |
|------------|---------------|---------------------------|---------------------|
| `databaseService` | `DatabaseService` | `PrismaDatabaseService` | `StubDatabaseService` |
| `authGateway` | `AuthGateway` | `FirebaseAuthGateway` | `FakeAuthGateway` |
| `blockSessionRepository` | `BlockSessionRepository` | `PrismaBlockSessionRepository` | `FakeDataBlockSessionRepository` |
| `blocklistRepository` | `BlocklistRepository` | `PrismaBlocklistRepository` | `FakeDataBlocklistRepository` |
| `sirensRepository` | `SirensRepository` | `PrismaSirensRepository` | `FakeDataSirensRepository` |
| `deviceRepository` | `RemoteDeviceRepository` | `PrismaRemoteDeviceRepository` | `FakeDataDeviceRepository` |
| `installedAppRepository` | `InstalledAppRepository` | `ExpoListInstalledAppsRepository` | `FakeDataInstalledAppsRepository` |
| `dateProvider` | `DateProvider` | `RealDateProvider` | `StubDateProvider` |
| `notificationService` | `NotificationService` | `ExpoNotificationService` | `FakeNotificationService` |
| `backgroundTaskService` | `BackgroundTaskService` | `RealBackgroundTaskService` | `FakeBackgroundTaskService` |
| `sirenTier` | `SirenTier` | `InMemorySirenTier` | `InMemorySirenTier` |

---

## Architecture Principles

### Hexagonal Architecture (Ports & Adapters)

1. **Core Layer** (`core/`): Contains business logic and domain models
   - **Ports** (`core/ports/`): Interfaces/abstractions
   - **Use Cases** (`core/*/usecases/`): Business operations
   - **Domain Models**: Business entities

2. **Infrastructure Layer** (`infra/`): Implements ports with concrete technologies
   - **Adapters**: Real implementations (Prisma, Firebase, Expo)
   - **Test Doubles**: Fake implementations for testing

3. **UI Layer** (`app/`, `ui/`): Presentation and user interaction
   - **Screens**: React components
   - **DI Container**: Wires dependencies together

### Dependency Rule

```
UI Layer → Core Layer → Ports (interfaces)
   ↓           ↑
Infra Layer ───┘ (implements ports)
```

- **Core** depends only on **Ports** (abstractions)
- **Infra** implements **Ports**
- **UI** depends on both **Core** and **Infra** (for DI wiring)

---

## Example: Adding a New Dependency

### Step 1: Define the Port Interface

```typescript
// core/ports/analytics.service.ts
export interface AnalyticsService {
  trackEvent(event: string, properties?: Record<string, unknown>): Promise<void>
}
```

### Step 2: Add to Dependencies Type

```typescript
// core/_redux_/dependencies.ts
import { AnalyticsService } from '../ports/analytics.service'

export type Dependencies = {
  // ... existing dependencies
  analyticsService: AnalyticsService
}
```

### Step 3: Create Implementation

```typescript
// infra/analytics-service/firebase.analytics.service.ts
import { AnalyticsService } from '@/core/ports/analytics.service'

export class FirebaseAnalyticsService implements AnalyticsService {
  async trackEvent(event: string, properties?: Record<string, unknown>) {
    // Firebase implementation
  }
}
```

### Step 4: Wire in DI Container

```typescript
// ui/dependencies.ts
import { FirebaseAnalyticsService } from '@/infra/analytics-service/firebase.analytics.service'

const mobileDependencies = {
  // ... existing
  analyticsService: new FirebaseAnalyticsService(),
}
```

### Step 5: Use in Use Case

```typescript
// core/auth/usecases/sign-in.usecase.ts
export const signIn = createAppAsyncThunk(
  'auth/signIn',
  async (email: string, { extra: { authGateway, analyticsService } }) => {
    const user = await authGateway.signIn(email)
    await analyticsService.trackEvent('user_signed_in', { email })
    return user
  },
)
```

---

## Summary

This project implements a clean, testable architecture using:

- ✅ **Hexagonal Architecture** for separation of concerns
- ✅ **Dependency Injection** via Redux Toolkit's `extraArgument`
- ✅ **Type-safe** dependency management with TypeScript
- ✅ **Test-friendly** with easy-to-swap test doubles
- ✅ **Maintainable** structure with clear layer boundaries

The DI pattern ensures that business logic remains decoupled from infrastructure, making the codebase easier to test, maintain, and evolve.

