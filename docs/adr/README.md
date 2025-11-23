# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records for TiedSiren51, documenting significant architectural and design decisions made throughout the project.

## What is an ADR?

An Architecture Decision Record captures a significant architectural decision along with its context and consequences. Each ADR describes:
- The context and problem being addressed
- The decision that was made
- The consequences (positive, negative, and neutral)
- Alternatives that were considered

## Navigation

### By Category

#### Architecture
Core architectural patterns and design principles.

- [Hexagonal Architecture](architecture/hexagonal-architecture.md)
- [Dependency Injection Pattern](architecture/dependency-injection-pattern.md)
- [Repository Pattern](architecture/repository-pattern.md)
- [View Model Pattern](architecture/view-model-pattern.md)
- [Listener Pattern for Side Effects](architecture/listener-pattern.md)

#### State Management
How application state is managed and synchronized.

- [Redux Toolkit for Business Logic](state-management/redux-toolkit-for-business-logic.md)
- [Entity Adapter Normalization](state-management/entity-adapter-normalization.md)
- [Typed Async Thunk Factory](state-management/typed-async-thunk-factory.md)
- [Domain-Based Slices](state-management/domain-based-slices.md)

#### Data Persistence
Database and storage decisions.

- [Prisma ORM with SQLite](data-persistence/prisma-orm-sqlite.md)
- [Abandon PouchDB](data-persistence/abandon-pouchdb.md)
- [Platform-Specific Database Paths](data-persistence/platform-specific-db-paths.md)
- [Local-First Architecture](data-persistence/local-first-architecture.md)

#### Testing
Testing strategies, tools, and patterns.

- [Vitest Over Jest](testing/vitest-over-jest.md)
- [Fixture Pattern for Test Data](testing/fixture-pattern.md)
- [Stub vs Fake Implementations](testing/stub-vs-fake-implementations.md)
- [Test Store Factory](testing/test-store-factory.md)
- [Exclude Prisma Integration Tests](testing/exclude-prisma-integration-tests.md)
- [Maestro for E2E Testing](testing/maestro-for-e2e.md)
- [Coverage Tracking and History](testing/coverage-tracking.md)

#### Code Quality
Linting, formatting, and code standards.

- [TypeScript Strict Mode](code-quality/typescript-strict-mode.md)
- [No Switch Statements Rule](code-quality/no-switch-statements.md)
- [Complexity Limits](code-quality/complexity-limits.md)
- [Custom ESLint Rules](code-quality/custom-eslint-rules.md)
- [Path Aliases](code-quality/path-aliases.md)
- [No Console Log in Production](code-quality/no-console-log.md)

#### Infrastructure
External services and infrastructure decisions.

- [Expo Router File-Based Routing](infrastructure/expo-router-file-based.md)
- [EAS Build Profiles](infrastructure/eas-build-profiles.md)
- [Firebase Authentication](infrastructure/firebase-authentication.md)
- [Expo Notifications](infrastructure/expo-notifications.md)
- [Node Version Standardization](infrastructure/node-version-standardization.md)

#### Development Workflow
Tools and processes for development.

- [Husky Git Hooks](development-workflow/husky-git-hooks.md)
- [Branch Protection Rules](development-workflow/branch-protection.md)
- [Prettier Integration](development-workflow/prettier-integration.md)

#### Code Organization
How code is structured and organized.

- [Feature-Based Domains](code-organization/feature-based-domains.md)
- [Domain Structure Convention](code-organization/domain-structure-convention.md)
- [UI-Core-Infra Separation](code-organization/ui-core-infra-separation.md)

## Creating a New ADR

1. Copy `template.md` to the appropriate category directory
2. Name it descriptively (e.g., `use-graphql-for-api.md`)
3. Fill in all sections
4. Link it in this README under the relevant category
5. Commit and create a PR

## ADR Lifecycle

- **Proposed**: Under consideration, not yet implemented
- **Accepted**: Decision made and being/been implemented
- **Deprecated**: No longer recommended, but still in use
- **Superseded**: Replaced by a newer decision (link to the new ADR)

## References

- [Michael Nygard's ADR methodology](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub organization](https://adr.github.io/)
