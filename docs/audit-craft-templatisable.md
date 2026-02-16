# Audit: Code templatisable dans TiedSiren51

> Objectif : identifier ce qui peut être extrait dans un framework privé **craft** (`npx craft init mon-nouveau-projet`).
>
> Classification :
> - 🟢 TEMPLATE — Réutilisable tel quel
> - 🟡 ADAPTABLE — Réutilisable avec modifications mineures
> - 🔴 SPÉCIFIQUE — Logique métier TiedSiren

---

## 1. Architecture & Scaffolding

| Élément | Chemin | Classification | Notes |
|---------|--------|----------------|-------|
| Structure hexagonale `app/ui/core/infra/tests/` | Racine | 🟢 TEMPLATE | Pattern universel |
| `tsconfig.json` (aliases @core, @ui, @infra, @app) | `/tsconfig.json` | 🟢 TEMPLATE | Aliases à adapter aux layers |
| `babel.config.cjs` (Expo preset + module-resolver) | `/babel.config.cjs` | 🟢 TEMPLATE | Config standard Expo |
| `metro.config.cjs` (CJS source extension) | `/metro.config.cjs` | 🟢 TEMPLATE | Config standard Expo |
| `.prettierrc.json` | `/.prettierrc.json` | 🟢 TEMPLATE | Single quotes, trailing commas, no semi |
| `.nvmrc` (Node 18.18.2) | `/.nvmrc` | 🟢 TEMPLATE | Version à adapter |
| `.npmrc` (engine-strict) | `/.npmrc` | 🟢 TEMPLATE | |
| `package.json` (scripts, lint-staged) | `/package.json` | 🟡 ADAPTABLE | Retirer deps TiedSiren-specific |
| `app.config.js` (Expo) | `/app.config.js` | 🟡 ADAPTABLE | Retirer Firebase, Sentry, plugins natifs |
| `schema.prisma` | `/schema.prisma` | 🔴 SPÉCIFIQUE | Modèles de données TiedSiren |
| `eas.json` | `/eas.json` | 🟡 ADAPTABLE | Garder profiles, changer env vars |
| `CLAUDE.md` | `/CLAUDE.md` | 🟡 ADAPTABLE | Remplacer domaines, modules, commandes |
| `CODEBASE-NAVIGATION.md` | `/CODEBASE-NAVIGATION.md` | 🟡 ADAPTABLE | Remplacer exemples spécifiques |
| Expo native modules (4 repos) | Repos externes | 🔴 SPÉCIFIQUE | Modules Android blocking |
| Expo Router file-based routing | `/app/` | 🟢 TEMPLATE | Pattern standard |

---

## 2. ESLint Config & Custom Rules (64 règles)

### `.eslintrc.cjs` (~660 lignes)

| Aspect | Classification | Notes |
|--------|----------------|-------|
| 192 règles de base | 🟢 TEMPLATE | Import/order, SonarJS, unicorn, React, etc. |
| 12 plugins externes | 🟢 TEMPLATE | expo, prettier, react, sonarjs, unicorn, vitest... |
| 13 blocs d'overrides | 🟡 ADAPTABLE | Retirer overrides domaine-spécifiques |
| `eslint-plugin-local-rules/index.cjs` | 🟢 TEMPLATE | Agrégateur de règles custom |

### Règles Custom par Catégorie

#### Architecture (5 règles) — 🟢 TEMPLATE
| Règle | Fichier |
|-------|---------|
| `no-cross-layer-imports` | `eslint-rules/no-cross-layer-imports.cjs` |
| `no-index-in-core` | `eslint-rules/no-index-in-core.cjs` |
| `no-adapter-in-ui` | `eslint-rules/no-adapter-in-ui.cjs` |
| `one-usecase-per-file` | `eslint-rules/one-usecase-per-file.cjs` |
| `one-listener-per-file` | `eslint-rules/one-listener-per-file.cjs` |

#### Naming Conventions (13 règles) — 🟢 TEMPLATE
| Règle | Fichier |
|-------|---------|
| `file-naming-convention` | `eslint-rules/file-naming-convention.cjs` |
| `core-test-file-naming` | `eslint-rules/core-test-file-naming.cjs` |
| `selector-matches-filename` | `eslint-rules/selector-matches-filename.cjs` |
| `usecase-matches-filename` | `eslint-rules/usecase-matches-filename.cjs` |
| `listener-matches-filename` | `eslint-rules/listener-matches-filename.cjs` |
| `view-model-matches-filename` | `eslint-rules/view-model-matches-filename.cjs` |
| `builder-matches-filename` | `eslint-rules/builder-matches-filename.cjs` |
| `fixture-matches-filename` | `eslint-rules/fixture-matches-filename.cjs` |
| `slice-matches-folder` | `eslint-rules/slice-matches-folder.cjs` |
| `repository-implementation-naming` | `eslint-rules/repository-implementation-naming.cjs` |
| `gateway-implementation-naming` | `eslint-rules/gateway-implementation-naming.cjs` |
| `schema-matches-filename` | `eslint-rules/schema-matches-filename.cjs` |
| `reducer-in-domain-folder` | `eslint-rules/reducer-in-domain-folder.cjs` |

#### SRP & Structure (5 règles) — 🟢 TEMPLATE
| Règle | Fichier |
|-------|---------|
| `one-component-per-file` | `eslint-rules/one-component-per-file.cjs` |
| `one-selector-per-file` | `eslint-rules/one-selector-per-file.cjs` |
| `one-view-model-per-file` | `eslint-rules/one-view-model-per-file.cjs` |
| `no-and-or-in-names` | `eslint-rules/no-and-or-in-names.cjs` |
| `no-module-level-constants` | `eslint-rules/no-module-level-constants.cjs` |

#### Infra Error Handling (5 règles) — 🟢 TEMPLATE
| Règle | Fichier |
|-------|---------|
| `infra-must-rethrow` | `eslint-rules/infra-must-rethrow.cjs` |
| `infra-public-method-try-catch` | `eslint-rules/infra-public-method-try-catch.cjs` |
| `listener-error-handling` | `eslint-rules/listener-error-handling.cjs` |
| `no-try-catch-in-core` | `eslint-rules/no-try-catch-in-core.cjs` |
| `require-logger-in-catch` | `eslint-rules/require-logger-in-catch.cjs` |
| `infra-logger-prefix` | `eslint-rules/infra-logger-prefix.cjs` |
| `try-catch-isolation` | `eslint-rules/try-catch-isolation.cjs` |

#### Redux & State (6 règles) — 🟢 TEMPLATE
| Règle | Fichier |
|-------|---------|
| `no-entire-state-selector` | `eslint-rules/no-entire-state-selector.cjs` |
| `no-usecallback-selector-wrapper` | `eslint-rules/no-usecallback-selector-wrapper.cjs` |
| `prefer-named-selector` | `eslint-rules/prefer-named-selector.cjs` |
| `selector-state-first-param` | `eslint-rules/selector-state-first-param.cjs` |
| `no-selector-prop-drilling` | `eslint-rules/no-selector-prop-drilling.cjs` |
| `no-enum-value-as-string-literal` | `eslint-rules/no-enum-value-as-string-literal.cjs` |

#### React/JSX (5 règles) — 🟢 TEMPLATE
| Règle | Fichier |
|-------|---------|
| `react-props-destructuring` | `eslint-rules/react-props-destructuring.cjs` |
| `no-call-expression-in-jsx-props` | `eslint-rules/no-call-expression-in-jsx-props.cjs` |
| `no-complex-jsx-in-conditionals` | `eslint-rules/no-complex-jsx-in-conditionals.cjs` |
| `prefer-ternary-jsx` | `eslint-rules/prefer-ternary-jsx.cjs` |
| `no-icon-size-magic-numbers` | `eslint-rules/no-icon-size-magic-numbers.cjs` |

#### Testing (7 règles) — 🟢 TEMPLATE
| Règle | Fichier |
|-------|---------|
| `expect-separate-act-assert` | `eslint-rules/expect-separate-act-assert.cjs` |
| `require-colocated-test` | `eslint-rules/require-colocated-test.cjs` |
| `no-data-builders-in-production` | `eslint-rules/no-data-builders-in-production.cjs` |
| `use-data-builders` | `eslint-rules/use-data-builders.cjs` |
| `no-new-in-test-body` | `eslint-rules/no-new-in-test-body.cjs` |
| `no-unused-test-id` | `eslint-rules/no-unused-test-id.cjs` |
| `no-generic-result-variable` | `eslint-rules/no-generic-result-variable.cjs` |

#### Code Style & Readability (18 règles) — 🟢 TEMPLATE
| Règle | Fichier |
|-------|---------|
| `prefer-inline-variable` | `eslint-rules/prefer-inline-variable.cjs` |
| `prefer-array-destructuring` | `eslint-rules/prefer-array-destructuring.cjs` |
| `prefer-object-destructuring` | `eslint-rules/prefer-object-destructuring.cjs` |
| `prefer-ternary-return` | `eslint-rules/prefer-ternary-return.cjs` |
| `prefer-jump-table` | `eslint-rules/prefer-jump-table.cjs` |
| `prefer-enum-over-string-union` | `eslint-rules/prefer-enum-over-string-union.cjs` |
| `inline-single-statement-handlers` | `eslint-rules/inline-single-statement-handlers.cjs` |
| `no-else-if` | `eslint-rules/no-else-if.cjs` |
| `no-nested-call-expressions` | `eslint-rules/no-nested-call-expressions.cjs` |
| `no-redundant-nullish-ternary` | `eslint-rules/no-redundant-nullish-ternary.cjs` |
| `no-consecutive-duplicate-returns` | `eslint-rules/no-consecutive-duplicate-returns.cjs` |
| `no-complex-inline-arguments` | `eslint-rules/no-complex-inline-arguments.cjs` |
| `no-stylesheet-magic-numbers` | `eslint-rules/no-stylesheet-magic-numbers.cjs` |
| `no-i-prefix-in-imports` | `eslint-rules/no-i-prefix-in-imports.cjs` |
| `require-named-regex` | `eslint-rules/require-named-regex.cjs` |
| `time-constant-multiplication` | `eslint-rules/time-constant-multiplication.cjs` |

**Résumé ESLint : 60 🟢, 4 🟡, 0 🔴**

---

## 3. CI/CD — Workflows Mythologiques

| Workflow | Fichier | Classification | Ce qui change |
|----------|---------|----------------|---------------|
| **Cerberus** (PR gates) | `.github/workflows/cerberus.yml` | 🟡 ADAPTABLE | Retirer EAS/APK/Sentry/Prisma, garder lint+test+coverage |
| **Hades** (post-merge) | `.github/workflows/hades.yml` | 🟡 ADAPTABLE | Retirer EAS preview build, garder release+coverage cache |
| **Hecate** (path filters) | `.github/workflows/hecate.yml` | 🟡 ADAPTABLE | Mettre à jour source paths hexagonaux |
| **Hephaestus** (Claude Code VPS) | `.github/workflows/hephaestus.yml` | 🟡 ADAPTABLE | Changer config VPS |
| **Moirai** (dependency graph) | `.github/workflows/moirai.yml` | 🟡 ADAPTABLE | Changer commande graph |
| Path filters config | `.github/path-filters.yml` | 🟡 ADAPTABLE | Adapter paths au projet |
| `ci-watch.sh` | `scripts/ci-watch.sh` | 🟡 ADAPTABLE | Changer noms de jobs exclus |
| `scripts/lib/colors.sh` | `scripts/lib/colors.sh` | 🟢 TEMPLATE | Couleurs + détection CLAUDE_CODE |
| `scripts/lib/branch-config.sh` | `scripts/lib/branch-config.sh` | 🟡 ADAPTABLE | Changer TICKET_PREFIX="TS" |
| `scripts/lint.sh` | `scripts/lint.sh` | 🟢 TEMPLATE | Orchestration lint |
| `scripts/lint-sh.sh` | `scripts/lint-sh.sh` | 🟢 TEMPLATE | Shellcheck |
| `check-package-json-build-impact.sh` | `scripts/check-package-json-build-impact.sh` | 🟢 TEMPLATE | Détection intelligente deps |
| Coverage scripts | `scripts/compare-coverage.cjs`, `track-coverage.js`, `view-coverage-history.js` | 🟡 ADAPTABLE | Changer dossiers coverage |
| `start-issue.sh` | `scripts/start-issue.sh` | 🟡 ADAPTABLE | Changer worktree paths, PR format |
| `update-pr-description.sh` | `scripts/update-pr-description.sh` | 🟡 ADAPTABLE | Changer extraction ticket prefix |
| `create-release-with-apk.sh` | `scripts/create-release-with-apk.sh` | 🔴 SPÉCIFIQUE | APK Android |
| `find-apk.sh` | `scripts/find-apk.sh` | 🔴 SPÉCIFIQUE | EAS build output |

### Husky Hooks

| Hook | Fichier | Classification | Notes |
|------|---------|----------------|-------|
| Pre-commit (tsc + lint-staged) | `.husky/pre-commit` | 🟢 TEMPLATE | |
| Pre-push (branch, tests, conflicts) | `.husky/pre-push` | 🟡 ADAPTABLE | Retirer expo-doctor |
| Post-push (CI watch + PR update) | `.husky/post-push` | 🟢 TEMPLATE | |
| Reference-transaction (post-push detect) | `.husky/reference-transaction` | 🟢 TEMPLATE | Pattern très astucieux |
| `no-commits-on-main-demo.sh` | `.husky/scripts/no-commits-on-main-demo.sh` | 🟢 TEMPLATE | |
| `branch-name-check.sh` | `.husky/scripts/branch-name-check.sh` | 🟡 ADAPTABLE | Changer prefix |
| `check-conflicts-with-main.sh` | `.husky/scripts/check-conflicts-with-main.sh` | 🟢 TEMPLATE | |
| `e2e-test-check.sh` | `.husky/scripts/e2e-test-check.sh` | 🟢 TEMPLATE | |
| `uncommitted-files-check.sh` | `.husky/scripts/uncommitted-files-check.sh` | 🟢 TEMPLATE | |

---

## 4. Claude Code Configuration

### Slash Commands (`.claude/commands/`)

| Commande | Fichier | Classification | Notes |
|----------|---------|----------------|-------|
| `speckit.specify` | `.claude/commands/speckit.specify.md` | 🟢 TEMPLATE | 366 lignes, 98% générique |
| `speckit.clarify` | `.claude/commands/speckit.clarify.md` | 🟢 TEMPLATE | Max 5 questions ciblées |
| `speckit.plan` | `.claude/commands/speckit.plan.md` | 🟢 TEMPLATE | Workflow de planification |
| `speckit.tasks` | `.claude/commands/speckit.tasks.md` | 🟢 TEMPLATE | Génération de tâches ordonnées |
| `speckit.analyze` | `.claude/commands/speckit.analyze.md` | 🟢 TEMPLATE | Analyse de cohérence |
| `speckit.checklist` | `.claude/commands/speckit.checklist.md` | 🟢 TEMPLATE | "Unit Tests for English" |
| `speckit.constitution` | `.claude/commands/speckit.constitution.md` | 🟢 TEMPLATE | Gestion de constitution projet |
| `speckit.implement` | `.claude/commands/speckit.implement.md` | 🟢 TEMPLATE | Exécution des tâches |
| `speckit.taskstoissues` | `.claude/commands/speckit.taskstoissues.md` | 🟢 TEMPLATE | Conversion tâches → issues |
| `commit-push` | `.claude/commands/commit-push.md` | 🟢 TEMPLATE | Commit + push |
| `fix-review` | `.claude/commands/fix-review.md` | 🟢 TEMPLATE | Fix review comments |
| `retro` | `.claude/commands/retro.md` | 🟢 TEMPLATE | Analyse reviews |
| `review-claude-settings` | `.claude/commands/review-claude-settings.md` | 🟢 TEMPLATE | Audit sécurité settings |
| `create-pr` | `.claude/commands/create-pr.md` | 🟡 ADAPTABLE | Changer ticket prefix TS→projet |
| `start-issue` | `.claude/commands/start-issue.md` | 🟡 ADAPTABLE | Changer refs ADR |
| `sync-project` | `.claude/commands/sync-project.md` | 🟡 ADAPTABLE | Changer noms de repos |
| `arch-review` | `.claude/commands/arch-review.md` | 🟡 ADAPTABLE | Changer paths ADR |

### Hooks Claude (`.claude/hooks/`)

| Hook | Fichier | Classification | Notes |
|------|---------|----------------|-------|
| `validate-pr.sh` | `.claude/hooks/validate-pr.sh` | 🟡 ADAPTABLE | Changer format PR hierarchy |
| `validate-ticket.sh` | `.claude/hooks/validate-ticket.sh` | 🟡 ADAPTABLE | Changer remark config |
| `validate-edit.sh` | `.claude/hooks/validate-edit.sh` | 🟡 ADAPTABLE | Retirer validation Prisma |
| `remind-adrs.sh` | `.claude/hooks/remind-adrs.sh` | 🟡 ADAPTABLE | Changer paths ADR |

### Settings (`.claude/settings.local.json`)

| Section | Classification | Notes |
|---------|----------------|-------|
| Deny list (69 entries) | 🟢 TEMPLATE | Sécurité universelle |
| Ask list (19 entries) | 🟢 TEMPLATE | Confirmation pour ops risquées |
| Allow list | 🟡 ADAPTABLE | Retirer perms Android/Expo spécifiques |
| Env vars (`CLAUDE_CODE=1`) | 🟢 TEMPLATE | |

---

## 5. Infra Adapters & Ports

### Ports Génériques (réutilisables dans tout projet)

| Port | Fichier | Classification |
|------|---------|----------------|
| `Logger` (interface + LogLevel) | `core/_ports_/logger.ts` | 🟢 TEMPLATE |
| `DateProvider` (branded types + guards) | `core/_ports_/date-provider.ts` | 🟢 TEMPLATE |
| `DatabaseService` (init interface) | `core/_ports_/database.service.ts` | 🟢 TEMPLATE |
| `CreatePayload<T>` = `Omit<T, 'id'>` | `core/_ports_/create.payload.ts` | 🟢 TEMPLATE |
| `UpdatePayload<T>` = `Partial<T> & Required<Pick<T, 'id'>>` | `core/_ports_/update.payload.ts` | 🟢 TEMPLATE |
| `NotificationService` | `core/_ports_/notification.service.ts` | 🟢 TEMPLATE |

### Ports Spécifiques TiedSiren

| Port | Fichier | Classification |
|------|---------|----------------|
| `AuthGateway` (Google/Apple/Email) | `core/_ports_/auth.gateway.ts` | 🟡 ADAPTABLE |
| `SirenTier` (native blocking) | `core/_ports_/siren.tier.ts` | 🔴 SPÉCIFIQUE |
| `SirenLookout` (app detection) | `core/_ports_/siren.lookout.ts` | 🔴 SPÉCIFIQUE |
| `SirensRepository` | `core/_ports_/sirens.repository.ts` | 🔴 SPÉCIFIQUE |
| `BlockSessionRepository` | `core/_ports_/block-session.repository.ts` | 🔴 SPÉCIFIQUE |
| `BlocklistRepository` | `core/_ports_/blocklist.repository.ts` | 🔴 SPÉCIFIQUE |
| `TimerRepository` | `core/_ports_/timer.repository.ts` | 🔴 SPÉCIFIQUE |
| `RemoteDeviceRepository` | `core/_ports_/remote-device.repository.ts` | 🔴 SPÉCIFIQUE |
| `ForegroundService` | `core/_ports_/foreground.service.ts` | 🔴 SPÉCIFIQUE |
| `InstalledAppRepository` | `core/_ports_/installed-app.repository.ts` | 🔴 SPÉCIFIQUE |
| `BackgroundTaskService` | `core/_ports_/background-task.service.ts` | 🟡 ADAPTABLE |

### Adaptateurs Abstraits

| Classe | Fichier | Classification | Notes |
|--------|---------|----------------|-------|
| `InMemoryRepository<T>` (Map-backed CRUD) | `infra/__abstract__/in-memory.repository.ts` | 🟢 TEMPLATE | Générique complet |
| `PrismaRepository` (base class) | `infra/__abstract__/prisma.repository.ts` | 🟡 ADAPTABLE | Retirer tables TiedSiren de `createAllTables()` |

### Adaptateurs Concrets

| Adaptateur | Fichier | Classification |
|-----------|---------|----------------|
| `SentryLogger` | `infra/logger/sentry.logger.ts` | 🟡 ADAPTABLE |
| `InMemoryLogger` | `infra/logger/in-memory.logger.ts` | 🟢 TEMPLATE |
| `RealDateProvider` | `infra/date-provider/real.date-provider.ts` | 🟢 TEMPLATE |
| `StubDateProvider` | `infra/date-provider/stub.date-provider.ts` | 🟢 TEMPLATE |
| `FirebaseAuthGateway` | `infra/auth-gateway/firebase.auth.gateway.ts` | 🟡 ADAPTABLE |
| `FakeAuthGateway` | `infra/auth-gateway/fake.auth.gateway.ts` | 🟡 ADAPTABLE |
| Tous les Prisma repositories | `infra/*-repository/prisma.*.ts` | 🔴 SPÉCIFIQUE |
| Tous les PouchDB repositories | `infra/*-repository/pouchdb.*.ts` | 🔴 SPÉCIFIQUE |
| Tous les FakeData repositories | `infra/*-repository/fake-data.*.ts` | 🔴 SPÉCIFIQUE |
| `AndroidSirenTier` | `infra/siren-tier/android.siren-tier.ts` | 🔴 SPÉCIFIQUE |
| `AndroidForegroundService` | `infra/foreground-service/android.foreground.service.ts` | 🔴 SPÉCIFIQUE |
| `ExpoNotificationService` | `infra/notification-service/expo.notification.service.ts` | 🟡 ADAPTABLE |

### Composition Root

| Fichier | Classification | Notes |
|---------|----------------|-------|
| `ui/dependencies.ts` (73 lignes) | 🟡 ADAPTABLE | Remplacer implémentations concrètes |

---

## 6. Core Patterns (Redux, Listeners, Selectors)

### Redux Infrastructure

| Pattern | Fichier | Classification | Notes |
|---------|---------|----------------|-------|
| Store factory + DI | `core/_redux_/createStore.ts` | 🟢 TEMPLATE | `thunk.extraArgument = dependencies` |
| `createAppAsyncThunk` (pre-typed) | `core/_redux_/create-app-thunk.ts` | 🟢 TEMPLATE | `.withTypes<{state, dispatch, extra}>()` |
| Root reducer | `core/_redux_/rootReducer.ts` | 🟡 ADAPTABLE | Changer slices |
| Register listeners | `core/_redux_/registerListeners.ts` | 🟡 ADAPTABLE | Changer listeners |
| Dependencies type | `core/_redux_/dependencies.ts` | 🟡 ADAPTABLE | Changer ports |
| `logActionMiddleware` | `core/_redux_/logActionMiddleware.ts` | 🟢 TEMPLATE | Logger middleware |

### Domain Pattern (structure type)

Chaque domaine suit la même structure :
```
core/{domain}/
├── {domain}.ts                  # Entity type + EntityAdapter
├── {domain}.slice.ts            # Redux slice
├── usecases/
│   ├── {action}.usecase.ts      # createAppAsyncThunk
│   └── {action}.usecase.spec.ts
├── listeners/
│   ├── on-{event}.listener.ts
│   └── on-{event}.listener.test.ts
├── selectors/
│   ├── select{Name}.ts
│   └── select{Name}.test.ts
└── {domain}.fixture.ts          # BDD given/when/then
```

| Aspect | Classification |
|--------|----------------|
| Structure de dossiers | 🟢 TEMPLATE |
| Naming conventions | 🟢 TEMPLATE |
| Pattern usecase (thunk) | 🟢 TEMPLATE |
| Pattern listener (gateway + store) | 🟢 TEMPLATE |
| Pattern selector (createSelector) | 🟢 TEMPLATE |
| Pattern slice (EntityAdapter) | 🟢 TEMPLATE |
| Contenu des domaines (auth, siren, blocklist...) | 🔴 SPÉCIFIQUE |
| Types d'entités | 🔴 SPÉCIFIQUE |
| Logique métier des usecases | 🔴 SPÉCIFIQUE |

### Utils Génériques

| Fichier | Classification |
|---------|----------------|
| `core/__constants__/time.ts` | 🟢 TEMPLATE |
| `core/__utils__/array.utils.ts` | 🟢 TEMPLATE |
| `core/__utils__/time.utils.ts` | 🟡 ADAPTABLE |

---

## 7. Scripts & Tooling

| Script | Classification | Notes |
|--------|----------------|-------|
| `scripts/lib/colors.sh` | 🟢 TEMPLATE | Couleurs + `is_claude_code()` |
| `scripts/lint.sh` | 🟢 TEMPLATE | Orchestration lint multi-outils |
| `scripts/lint-sh.sh` | 🟢 TEMPLATE | Shellcheck |
| `scripts/lint-workflow-scripts.sh` | 🟢 TEMPLATE | YAML/workflow linting |
| `scripts/check-package-json-build-impact.sh` | 🟢 TEMPLATE | Détection intelligente |
| `scripts/lib/branch-config.sh` | 🟡 ADAPTABLE | `TICKET_PREFIX="TS"` → nouveau prefix |
| `scripts/ci-watch.sh` | 🟡 ADAPTABLE | Changer noms de jobs exclus |
| `scripts/start-issue.sh` | 🟡 ADAPTABLE | Worktree paths, PR format |
| `scripts/update-pr-description.sh` | 🟡 ADAPTABLE | Extraction ticket prefix |
| `scripts/store-coverage.sh` | 🟡 ADAPTABLE | Paths Vitest |
| `scripts/prepare-base-coverage.sh` | 🟡 ADAPTABLE | Paths cache |
| `scripts/create-release-with-apk.sh` | 🔴 SPÉCIFIQUE | APK Android |
| `scripts/find-apk.sh` | 🔴 SPÉCIFIQUE | EAS build output |

---

## 8. Testing (Fixtures, Builders, State-Builder)

### Infrastructure de Test

| Fichier | Classification | Notes |
|---------|----------------|-------|
| `vitest.config.js` | 🟡 ADAPTABLE | Changer inline deps, paths exclus |
| `core/_tests_/createTestStore.ts` | 🟡 ADAPTABLE | Changer defaults de dépendances |
| `core/_tests_/state-builder.ts` | 🟡 ADAPTABLE | Changer méthodes `with*` par domaine |
| `core/_tests_/fixture.type.ts` | 🟢 TEMPLATE | Type `Fixture` avec given/when/then |
| `core/_tests_/date.fixture.ts` | 🟢 TEMPLATE | Fixture dates déterministes |
| `core/_tests_/initTest.spec.ts` | 🟢 TEMPLATE | Initialisation globale tests |

### Patterns de Test (structure)

| Pattern | Classification | Notes |
|---------|----------------|-------|
| Data Builder (`buildEntity(overrides)`) | 🟢 TEMPLATE | Structure réutilisable |
| State Builder (fluent API avec Redux actions) | 🟢 TEMPLATE | Pattern réutilisable |
| BDD Fixture (given/when/then) | 🟢 TEMPLATE | Pattern réutilisable |
| Test Store Factory (partial dependencies) | 🟢 TEMPLATE | Pattern réutilisable |
| Stub vs Fake strategy | 🟢 TEMPLATE | Documented in ADR |

### Contenu des Builders/Fixtures

| Fichier | Classification |
|---------|----------------|
| `data-builders/block-session.builder.ts` | 🔴 SPÉCIFIQUE |
| `data-builders/blocklist.builder.ts` | 🔴 SPÉCIFIQUE |
| `data-builders/siren.builder.ts` | 🔴 SPÉCIFIQUE |
| `data-builders/android-siren.builder.ts` | 🔴 SPÉCIFIQUE |
| `data-builders/device.builder.ts` | 🔴 SPÉCIFIQUE |
| `data-builders/blocking-schedule.builder.ts` | 🔴 SPÉCIFIQUE |
| `data-builders/locked-sirens.builder.ts` | 🔴 SPÉCIFIQUE |
| Domain fixtures (auth, blocklist, etc.) | 🔴 SPÉCIFIQUE |

---

## 9. ADRs (Architecture Decision Records)

**Location** : `/docs/adr/` — 48 fichiers

### ADRs Génériques (pattern réutilisable)

| ADR | Sous-dossier | Classification |
|-----|-------------|----------------|
| `hexagonal-architecture.md` | core | 🟢 TEMPLATE |
| `dependency-injection-pattern.md` | core | 🟢 TEMPLATE |
| `repository-pattern.md` | core | 🟢 TEMPLATE |
| `listener-pattern.md` | core | 🟢 TEMPLATE |
| `redux-toolkit-for-business-logic.md` | core | 🟢 TEMPLATE |
| `entity-adapter-normalization.md` | core | 🟢 TEMPLATE |
| `typed-async-thunk-factory.md` | core | 🟢 TEMPLATE |
| `adapters-encapsulated-in-selectors.md` | core | 🟢 TEMPLATE |
| `domain-based-slices.md` | core | 🟢 TEMPLATE |
| `port-naming-convention.md` | core | 🟢 TEMPLATE |
| `view-model-pattern.md` | ui | 🟢 TEMPLATE |
| `minimize-useeffect-usage.md` | ui | 🟢 TEMPLATE |
| `redux-over-context-for-ui-state.md` | ui | 🟢 TEMPLATE |
| `no-selector-prop-drilling.md` | ui | 🟢 TEMPLATE |
| `design-system-principles.md` | ui | 🟢 TEMPLATE |
| `expo-router-file-based.md` | ui | 🟢 TEMPLATE |
| `local-state-for-ui-ticks.md` | ui | 🟢 TEMPLATE |
| `vitest-over-jest.md` | testing | 🟢 TEMPLATE |
| `data-builder-pattern.md` | testing | 🟢 TEMPLATE |
| `fixture-pattern.md` | testing | 🟢 TEMPLATE |
| `stub-vs-fake-implementations.md` | testing | 🟢 TEMPLATE |
| `test-store-factory.md` | testing | 🟢 TEMPLATE |
| `type-guards-for-branded-types.md` | conventions | 🟢 TEMPLATE |
| `class-scoped-constants.md` | conventions | 🟢 TEMPLATE |
| `infra-error-handling.md` | conventions | 🟢 TEMPLATE |

### ADRs Adaptables

| ADR | Classification | Ce qui change |
|-----|----------------|---------------|
| `developer-tooling.md` | 🟡 ADAPTABLE | Versions Node, ESLint specifics |
| `coverage-tracking.md` | 🟡 ADAPTABLE | Thresholds, paths |
| `maestro-for-e2e.md` | 🟡 ADAPTABLE | Flows spécifiques |
| `date-provider-pattern.md` | 🟡 ADAPTABLE | Formats HHmm spécifiques |
| `local-first-architecture.md` | 🟡 ADAPTABLE | Stack persistence |

### ADRs Spécifiques TiedSiren

| ADR | Classification |
|-----|----------------|
| `prisma-orm-sqlite.md` | 🔴 SPÉCIFIQUE |
| `abandon-pouchdb.md` | 🔴 SPÉCIFIQUE |
| `firebase-authentication.md` | 🔴 SPÉCIFIQUE |
| `native-blocking-scheduler.md` | 🔴 SPÉCIFIQUE |
| `expo-list-installed-apps.md` | 🔴 SPÉCIFIQUE |
| `foreground-service.md` | 🔴 SPÉCIFIQUE |
| `siren-tier-orchestrator.md` | 🔴 SPÉCIFIQUE |
| `exclude-prisma-integration-tests.md` | 🔴 SPÉCIFIQUE |
| ADR Index (`README.md`) | 🟡 ADAPTABLE |

---

## Résumé Global

| Section | 🟢 TEMPLATE | 🟡 ADAPTABLE | 🔴 SPÉCIFIQUE |
|---------|-------------|--------------|---------------|
| 1. Architecture & scaffolding | 8 | 5 | 2 |
| 2. ESLint (64 rules + config) | 60 | 4 | 0 |
| 3. CI/CD (Cerberus & co.) | 10 | 12 | 2 |
| 4. Claude Code config | 14 | 8 | 0 |
| 5. Infra adapters & ports | 6 | 7 | 10 |
| 6. Core patterns | 8 | 5 | 8 |
| 7. Scripts & tooling | 5 | 5 | 2 |
| 8. Testing | 7 | 3 | 8 |
| 9. ADRs | 25 | 5 | 8 |
| **TOTAL** | **~143 (58%)** | **~54 (22%)** | **~40 (16%)** |

> ~10 éléments supplémentaires sont des fichiers de support (README, configs intermédiaires).

---

## Trois Piliers de Valeur pour `craft`

### Pilier 1 : 64 Règles ESLint Custom
Presque toutes 🟢, directement packagées en `@craft/eslint-plugin`. Enforce l'architecture hexagonale, les naming conventions, le SRP, et les patterns Redux/testing.

### Pilier 2 : Suite Speckit (9 commandes Claude Code)
Système complet spec-driven development : specify → clarify → plan → tasks → analyze → checklist → implement → taskstoissues → constitution. 100% générique.

### Pilier 3 : Patterns Architecturaux Documentés
30+ ADRs génériques + state-builder + fixtures + test store factory + data builders. Infrastructure de test complète avec 142 fichiers de test et 98.83% couverture.

---

## Estimation d'Effort d'Extraction

| Phase | Contenu | Durée estimée |
|-------|---------|---------------|
| **Phase 1** | CLI scaffolding + ESLint rules package | 3-4 jours |
| **Phase 2** | Redux DI, state-builder, test infra templates | 3-4 jours |
| **Phase 3** | CI/CD templates + Claude Code config | 2-4 jours |
| **Phase 4** | ADR templates + documentation craft | 2-4 jours |
| **TOTAL** | | **~10-16 jours** |
