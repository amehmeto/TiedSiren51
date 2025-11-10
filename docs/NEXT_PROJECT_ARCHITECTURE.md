# Next Project Architecture Plan

## Project Overview
- Frontend-only React Native app (Expo) that consumes REST APIs.
- Global state handled with Zustand stores instead of Redux.
- Feature-first directory structure inspired by the existing project naming (hyphenated feature folders inside `core/` and `ui/`).
- Follows a trimmed Hexagonal/Nakayama blend: Presentation → Application → Domain → Infrastructure → Shared.

---

## Layered Structure

```
├── app/                        # Expo Router entry points (screens & layouts)
│   ├── (auth)/                 # Authentication stack
│   ├── (tabs)/                 # Main tabs: progress, journey, updates, profile
│   └── ...
│
├── ui/                         # Presentation layer (feature-specific UI)
│   ├── dependencies.ts        # Wires DI container into UI (Zustand stores)
│   ├── design-system/         # Shared UI components
│   ├── screens/               # Feature screens organized by feature folder
│   │   ├── progress-home/
│   │   ├── learning-journey/
│   │   ├── updates/
│   │   └── profile/
│   ├── hooks/                 # UI hooks (e.g., theming, navigation)
│   └── navigation/            # Tab & stack helpers
│
├── core/                       # Domain + application logic per feature
│   ├── _zustand_/             # Store factories & DI helpers
│   │   ├── dependencies.ts
│   │   ├── createStore.ts
│   │   └── store-context.tsx
│   │
│   ├── auth/
│   │   ├── entities/
│   │   ├── usecases/
│   │   ├── auth.store.ts
│   │   └── selectors/
│   │
│   ├── progress-home/
│   │   ├── entities/
│   │   ├── usecases/
│   │   ├── progress-home.store.ts
│   │   └── selectors/
│   │
│   ├── class-details/
│   │   ├── entities/
│   │   ├── usecases/
│   │   ├── class-details.store.ts
│   │   └── selectors/
│   │
│   ├── learning-journey/
│   │   ├── entities/
│   │   ├── usecases/
│   │   ├── learning-journey.store.ts
│   │   └── selectors/
│   │
│   ├── updates/
│   │   ├── entities/
│   │   ├── usecases/
│   │   ├── updates.store.ts
│   │   └── selectors/
│   │
│   ├── profile/
│   │   ├── entities/
│   │   ├── usecases/
│   │   ├── profile.store.ts
│   │   └── selectors/
│   │
│   └── shared/
│       ├── dto/
│       ├── value-objects/
│       └── validators/
│
├── infra/                      # Infrastructure adapters (API clients, gateways)
│   ├── http/
│   │   ├── api-client.ts
│   │   ├── interceptors.ts
│   │   └── mock-server.ts (optional)
│   ├── repositories/
│   │   ├── progress-home.api.repository.ts
│   │   ├── class-details.api.repository.ts
│   │   ├── learning-journey.api.repository.ts
│   │   ├── updates.api.repository.ts
│   │   └── profile.api.repository.ts
│   └── services/
│       ├── notification.service.ts
│       └── analytics.service.ts
│
├── shared/                     # Cross-cutting concerns
│   ├── config/
│   ├── errors/
│   ├── utils/
│   └── theme/
│
└── docs/
    └── NEXT_PROJECT_ARCHITECTURE.md
```

---

## Feature Mapping from Sitemap

| Sitemap Node | Feature Folder | Key Use Cases | Primary APIs |
|--------------|----------------|---------------|--------------|
| Authentication | `core/auth` | `signIn`, `signOut`, `refreshSession` | Auth service endpoints |
| Progress Home → Overall Insights | `core/progress-home` | `fetchOverallInsights` | `/progress/insights` |
| Progress Home → Current Classes | `core/progress-home` | `fetchCurrentClasses` | `/progress/classes` |
| Class Details | `core/class-details` | `fetchClassDetails`, `fetchClassInsights` | `/classes/:id` |
| Class Details → Menu Tabs (Attendance, Schedule, Assignments, Grades, Materials, Badges) | `core/class-details` | `fetchAttendanceHistory`, `fetchWeeklySchedule`, `fetchAssignments`, `fetchTermGrades`, `fetchCourseMaterials`, `fetchBadges` | Multiple `/classes/:id/*` endpoints |
| Learning Journey → Insights | `core/learning-journey` | `fetchLearningInsights` | `/journey/insights` |
| Learning Journey → Journey Details | `core/learning-journey` | `fetchJourneyTimeline`, `fetchMilestones` | `/journey/details` |
| Updates (Notifications) → Class Updates, Academic, Administrative, Event, Urgent | `core/updates` | `fetchNotificationsByCategory`, `markNotificationRead` | `/notifications` |
| Profile → Profile Information | `core/profile` | `fetchProfileInfo`, `updateProfilePhoto` | `/profile` |
| Profile → Personal Information | `core/profile` | `updatePersonalDetails` | `/profile/personal` |
| Profile → Achievements | `core/profile` | `fetchAchievements` | `/profile/achievements` |
| Profile → Program Information | `core/profile` | `fetchProgramInfo` | `/profile/program` |
| Profile → Settings | `core/profile` | `updatePreferences`, `manageNotifications` | `/profile/settings` |

---

## Dependency Injection & Stores

- **DI Container** lives in `core/_zustand_/dependencies.ts`, exposing instances of repository interfaces.
- **Store Factory** (`core/_zustand_/createStore.ts`) builds per-feature Zustand stores by injecting dependencies into feature store factories (e.g., `createProgressHomeStore(dependencies)`).
- **Feature Store Structure**
  - `entities/` – domain models (`OverallInsights`, `ClassTimelineItem`)
  - `usecases/` – async functions using dependencies (`fetchOverallInsights`)
  - `*.store.ts` – Zustand store factory wiring actions to use cases.
  - `selectors/` – memoized selectors/hooks for UI.
  - `mappers/` (optional) – map API DTOs to domain entities.

Example store factory skeleton:
```typescript
// core/progress-home/progress-home.store.ts
export const createProgressHomeStore = (
  deps: Dependencies,
  preloadedState?: Partial<ProgressHomeState>,
) => create<ProgressHomeStore>()(
  subscribeWithSelector((set, get) => ({
    overallInsights: preloadedState?.overallInsights ?? null,
    currentClasses: preloadedState?.currentClasses ?? [],
    isLoading: false,
    error: null,
    loadDashboard: async () => {
      set({ isLoading: true, error: null })
      try {
        const [insights, classes] = await Promise.all([
          fetchOverallInsights(deps),
          fetchCurrentClasses(deps),
        ])
        set({ overallInsights: insights, currentClasses: classes, isLoading: false })
      } catch (error) {
        set({ error: toDomainError(error), isLoading: false })
      }
    },
  })))
```

---

## Feature Implementation Flow

1. **Define Domain Model** in `core/<feature>/entities/` (e.g., `OverallInsights.ts`).
2. **Create Repository Interface** (if shared) in `core/shared/repository-contracts/` (optional) or directly within feature.
3. **Implement Use Case** in `core/<feature>/usecases/` (e.g., `fetchOverallInsights.ts`) that depends on the repository interface.
4. **Build API Adapter** in `infra/repositories/<feature>.api.repository.ts` implementing the interface.
5. **Wire into DI Container** (`core/_zustand_/dependencies.ts`).
6. **Create Zustand Store** (`core/<feature>/<feature>.store.ts`) that exposes state and actions using the use cases.
7. **Expose UI Hooks/Selectors** for the presentation layer.
8. **Build Screens/Components** in `ui/screens/<FeatureName>/`.

---

## Naming Conventions
- Feature folders use kebab-case to match current project: `progress-home`, `learning-journey`, `class-details`, `updates`, `profile`.
- Store files follow `<feature>.store.ts`.
- Use cases follow `<verb>-<noun>.usecase.ts` (same style as current project).
- API repositories: `<feature>.api.repository.ts`.
- Entities: PascalCase matching domain concept (`OverallInsights.ts`).

---

## Additional Notes
- **State Hydration**: If offline support is needed later, add persistence middleware per store (`zustand/middleware/persist`).
- **Analytics & Notifications**: Keep cross-cutting services under `infra/services/` and inject via the DI container when stores need them.
- **Testing**: Mock repository implementations in feature-level tests; use the same DI contract to inject fakes.
- **Extensibility**: New sitemap nodes translate directly to new feature folders or submodules.
