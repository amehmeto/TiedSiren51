# Effect.ts Migration Analysis — TiedSiren

## Executive Summary

Cette analyse évalue la migration de TiedSiren vers Effect.ts en se concentrant sur la **backpressure** pour optimiser le workflow avec les agents IA. L'architecture hexagonale actuelle est mature et bien structurée, mais présente des opportunités significatives d'amélioration de la type safety.

**Verdict: Migration recommandée — Stratégie progressive via boundaries**

---

## 1. Audit du Code Actuel

### 1.1 Patterns Try/Catch Identifiés

**60+ blocs try/catch** répartis principalement dans :

| Couche | Fichiers | Pattern Dominant |
|--------|----------|------------------|
| `infra/` | 40+ | Log + rethrow ou Log + return fallback |
| `core/listeners/` | 4 | Log + swallow |
| `ui/hooks/` | 3 | Log + setState(error) |
| `ui/schemas/` | 2 | Zod error conversion |

**Exemple typique — Repository Prisma :**
```typescript
// infra/block-session-repository/prisma.block-session.repository.ts:44
async create(sessionPayload: CreatePayload<BlockSession>): Promise<BlockSession> {
  try {
    // ... Prisma operations
    return this.mapToBlockSession(created)
  } catch (error) {
    this.logger.error(`[PrismaBlockSessionRepository] Failed to create: ${error}`)
    throw error  // Type: unknown — perte totale d'information
  }
}
```

**Problèmes identifiés :**
1. Type `error: unknown` — aucune information sur les erreurs possibles
2. Pattern répétitif copy-paste dans chaque méthode
3. Erreurs Prisma, Firebase, expo mélangées sans distinction
4. Impossible de savoir quelles erreurs une fonction peut lever

### 1.2 Usages Zod

**7 fichiers** utilisant Zod pour la validation UI :

| Fichier | Usage |
|---------|-------|
| `ui/auth-schemas/auth.schema.ts` | Validation sign-in/sign-up/forgot-password |
| `ui/screens/Home/schemas/block-session.schema.ts` | Validation formulaire block-session |
| `ui/screens/Blocklists/schemas/blocklist-form.schema.ts` | Validation formulaire blocklist |
| `ui/auth-schemas/validation.helper.ts` | Helper `safeParse` → `ValidationResult<T>` |

**Pattern d'utilisation :**
```typescript
// ui/screens/Home/schemas/validate-block-session-form.ts
try {
  blockSessionSchema.parse(values)
  return {}
} catch (e) {
  if (!(e instanceof z.ZodError)) return {}
  // Conversion manuelle vers ErrorMessages
}
```

### 1.3 Points d'I/O et Effets de Bord

| Service | Localisation | Type d'I/O |
|---------|--------------|------------|
| Firebase Auth | `infra/auth-gateway/firebase.auth.gateway.ts` | Network + State |
| Prisma/SQLite | `infra/**/*-repository/prisma.*.ts` | Database |
| Expo Notifications | `infra/notification-service/expo.notification.service.ts` | System + Network |
| Accessibility Service | `infra/siren-tier/android.siren-*.ts` | Native Bridge |
| Background Tasks | `infra/background-task-service/real.background-task.service.ts` | System |
| Foreground Service | `infra/foreground-service/android.foreground.service.ts` | Native |
| FileSystem | `infra/__abstract__/prisma.repository.ts` | Disk I/O |
| AsyncStorage | `infra/auth-gateway/fake-storage-auth.gateway.ts` | Disk I/O |

### 1.4 Dépendances Injectées

**15 ports** définis dans `core/_redux_/dependencies.ts` :

```typescript
export type Dependencies = {
  authGateway: AuthGateway
  backgroundTaskService: BackgroundTaskService
  blockSessionRepository: BlockSessionRepository
  blocklistRepository: BlocklistRepository
  databaseService: DatabaseService
  dateProvider: DateProvider
  deviceRepository: RemoteDeviceRepository
  foregroundService: ForegroundService
  installedAppRepository: InstalledAppRepository
  logger: Logger
  notificationService: NotificationService
  sirenLookout: SirenLookout
  sirenTier: SirenTier
  sirensRepository: SirensRepository
  timerRepository: TimerRepository
}
```

Chaque port a au moins une implémentation fake/stub pour les tests.

### 1.5 Branded Types Existants

```typescript
// core/_ports_/date-provider.ts
export type ISODateString = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`
export type HHmmString = `${number}:${number}`

export function isHHmmString(value: string): value is HHmmString { ... }
export function assertHHmmString(value: string): asserts value is HHmmString { ... }
```

**Point faible actuel :**
```typescript
// infra/timer-repository/prisma.timer.repository.ts:45
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Prisma stores ISO strings
return timer.endedAt as ISODateString  // Cast dangereux
```

---

## 2. Mapping Effect.ts

### 2.1 Repository Pattern → Effect Services

**Avant (actuel) :**
```typescript
// core/_ports_/block-session.repository.ts
export interface BlockSessionRepository {
  create(payload: CreatePayload<BlockSession>): Promise<BlockSession>
  findAll(): Promise<BlockSession[]>
  findById(id: string): Promise<BlockSession>
  update(session: UpdatePayload<BlockSession>): Promise<void>
  delete(id: string): Promise<void>
}
```

**Après (Effect.ts) :**
```typescript
import { Context, Effect, Layer } from "effect"

// Erreurs explicites et typées
class BlockSessionNotFoundError extends Data.TaggedError("BlockSessionNotFoundError")<{
  readonly id: string
}> {}

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly operation: string
  readonly cause: unknown
}> {}

// Port avec erreurs dans le type
export interface BlockSessionRepository {
  readonly create: (
    payload: CreatePayload<BlockSession>
  ) => Effect.Effect<BlockSession, DatabaseError>

  readonly findAll: () => Effect.Effect<BlockSession[], DatabaseError>

  readonly findById: (
    id: string
  ) => Effect.Effect<BlockSession, BlockSessionNotFoundError | DatabaseError>

  readonly update: (
    session: UpdatePayload<BlockSession>
  ) => Effect.Effect<void, BlockSessionNotFoundError | DatabaseError>

  readonly delete: (
    id: string
  ) => Effect.Effect<void, BlockSessionNotFoundError | DatabaseError>
}

// Tag pour l'injection
export class BlockSessionRepository extends Context.Tag("BlockSessionRepository")<
  BlockSessionRepository,
  BlockSessionRepository
>() {}
```

**Gain en backpressure :**
- `findById` retourne **explicitement** `BlockSessionNotFoundError` — impossible de l'oublier
- Composition d'effets refuse les types incompatibles
- IDE affiche les erreurs possibles au hover

### 2.2 Usecase Pattern → Effect Programs

**Avant (actuel) :**
```typescript
// core/block-session/usecases/create-block-session.usecase.ts
export const createBlockSession = createAppAsyncThunk(
  'blockSession/createBlockSession',
  async (
    payload: CreateBlockSessionPayload,
    { extra: { blockSessionRepository, notificationService, dateProvider } },
  ) => {
    const now = dateProvider.getNow()
    const startedAt = dateProvider.recoverDate(payload.startedAt)
    // ... notification scheduling
    return blockSessionRepository.create({
      ...payload,
      startNotificationId,
      endNotificationId,
    })
  },
)
```

**Après (Effect.ts) :**
```typescript
import { Effect, pipe } from "effect"

class NotificationSchedulingError extends Data.TaggedError("NotificationSchedulingError")<{
  readonly type: "start" | "end"
  readonly cause: unknown
}> {}

export const createBlockSession = (payload: CreateBlockSessionPayload) =>
  Effect.gen(function* () {
    const blockSessionRepo = yield* BlockSessionRepository
    const notificationService = yield* NotificationService
    const dateProvider = yield* DateProvider

    const now = dateProvider.getNow()
    const startedAt = dateProvider.recoverDate(payload.startedAt)
    const endedAt = dateProvider.recoverDate(payload.endedAt)

    const startNotificationId = yield* pipe(
      notificationService.scheduleLocalNotification(
        'Tied Siren',
        `Block session "${payload.name}" has started`,
        { seconds: differenceInSeconds(startedAt, now) }
      ),
      Effect.mapError((e) => new NotificationSchedulingError({ type: "start", cause: e }))
    )

    const endNotificationId = yield* pipe(
      notificationService.scheduleLocalNotification(
        'Tied Siren',
        `Block session "${payload.name}" has ended`,
        { seconds: differenceInSeconds(endedAt, now) }
      ),
      Effect.mapError((e) => new NotificationSchedulingError({ type: "end", cause: e }))
    )

    return yield* blockSessionRepo.create({
      ...payload,
      startNotificationId,
      endNotificationId,
    })
  })

// Type inféré automatiquement:
// Effect<BlockSession, NotificationSchedulingError | DatabaseError,
//        BlockSessionRepository | NotificationService | DateProvider>
```

**Gain en backpressure :**
- Le 3ème type parameter liste **toutes les dépendances requises**
- Le 2ème type parameter liste **toutes les erreurs possibles**
- Compilation échoue si une dépendance manque ou une erreur non gérée

### 2.3 Listener Pattern → Effect Streams

**Avant (actuel) :**
```typescript
// core/siren/listeners/on-blocking-schedule-changed.listener.ts
export const onBlockingScheduleChangedListener = ({
  store, sirenLookout, sirenTier, foregroundService, dateProvider, logger
}) => {
  const syncSchedule = async (schedule, wasActive, isActive) => {
    try {
      await sirenTier.updateBlockingSchedule(schedule)
      if (!wasActive && isActive) {
        sirenLookout.startWatching()
        await foregroundService.start()
      }
      // ...
    } catch (error) {
      logger.error(`[BlockingScheduleListener] ${error}`)  // Error swallowed!
    }
  }

  return store.subscribe(() => { /* ... */ void syncSchedule(schedule, wasActive, isActive) })
}
```

**Après (Effect.ts) :**
```typescript
import { Effect, Stream, Schedule } from "effect"

class ForegroundServiceError extends Data.TaggedError("ForegroundServiceError")<{
  readonly operation: "start" | "stop"
  readonly cause: unknown
}> {}

class SirenTierError extends Data.TaggedError("SirenTierError")<{
  readonly cause: unknown
}> {}

const syncSchedule = (schedule: BlockingSchedule[], wasActive: boolean, isActive: boolean) =>
  Effect.gen(function* () {
    const sirenTier = yield* SirenTier
    const sirenLookout = yield* SirenLookout
    const foregroundService = yield* ForegroundService

    yield* sirenTier.updateBlockingSchedule(schedule)

    if (!wasActive && isActive) {
      sirenLookout.startWatching()
      yield* foregroundService.start()
    }

    if (wasActive && !isActive) {
      sirenLookout.stopWatching()
      yield* foregroundService.stop()
    }
  })

// Le type révèle TOUTES les erreurs possibles:
// Effect<void, SirenTierError | ForegroundServiceError, SirenTier | SirenLookout | ForegroundService>
```

**Gain en backpressure :**
- Les erreurs swallowed deviennent des erreurs de compilation
- Impossible d'ignorer silencieusement une erreur sans `Effect.catchAll`

### 2.4 Auth Gateway Pattern

**Avant (actuel) :**
```typescript
// core/_ports_/auth.gateway.ts
export interface AuthGateway {
  signInWithEmail(email: string, password: string): Promise<AuthUser>
  // Quelles erreurs? On ne sait pas!
}

// infra/auth-gateway/firebase.auth.gateway.ts
async signInWithEmail(email: string, password: string): Promise<AuthUser> {
  try {
    const result = await signInWithEmailAndPassword(this.auth, email, password)
    return { id: result.user.uid, email: result.user.email ?? '' }
  } catch (error) {
    throw new Error(this.translateFirebaseError(error))  // Information perdue
  }
}
```

**Après (Effect.ts) :**
```typescript
// Erreurs Firebase explicites
class InvalidCredentialsError extends Data.TaggedError("InvalidCredentialsError")<{}> {}
class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{ email: string }> {}
class TooManyRequestsError extends Data.TaggedError("TooManyRequestsError")<{}> {}
class NetworkError extends Data.TaggedError("NetworkError")<{ cause: unknown }> {}

type AuthError =
  | InvalidCredentialsError
  | UserNotFoundError
  | TooManyRequestsError
  | NetworkError

export interface AuthGateway {
  readonly signInWithEmail: (
    email: string,
    password: string
  ) => Effect.Effect<AuthUser, AuthError>

  readonly signInWithGoogle: () => Effect.Effect<AuthUser, AuthError | GoogleSignInCancelledError>
}
```

**Gain en backpressure :**
- UI peut pattern-match sur les erreurs pour afficher des messages appropriés
- Impossible d'oublier de gérer `TooManyRequestsError`

---

## 3. Double Emploi Zod vs @effect/schema

### 3.1 Usages Zod Actuels

| Localisation | Type de Validation | Complexité |
|--------------|-------------------|------------|
| Auth schemas | Email regex, password rules | Moyenne |
| Block session form | Time format HH:mm, arrays min(1) | Moyenne |
| Blocklist form | String validation | Simple |

### 3.2 Différences Clés

| Aspect | Zod | @effect/schema |
|--------|-----|----------------|
| Integration Effect | Via `Schema.from(zodSchema)` | Native |
| Bidirectional | Decode only | Encode + Decode |
| Branded types | `.brand()` | `Schema.brand()` avec intégration Effect |
| Error format | `ZodError` | `ParseError` compatible Effect |
| Transformations | `.transform()` | `Schema.transform()` avec erreurs typées |
| Size | ~12KB | Inclus dans Effect core |

### 3.3 Exemple de Migration Schema

**Avant (Zod) :**
```typescript
// ui/auth-schemas/auth.schema.ts
export const signUpSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(CONTAINS_UPPERCASE_LOWERCASE_AND_DIGITS_REGEX_PATTERN, '...'),
})

export type SignUpInput = z.infer<typeof signUpSchema>
```

**Après (@effect/schema) :**
```typescript
import { Schema } from "@effect/schema"

const Email = Schema.String.pipe(
  Schema.nonEmptyString({ message: () => 'Email is required' }),
  Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: () => 'Please enter a valid email' }),
  Schema.brand("Email")
)

const Password = Schema.String.pipe(
  Schema.minLength(6, { message: () => 'Password must be at least 6 characters' }),
  Schema.pattern(REGEX, { message: () => 'Password must contain...' }),
  Schema.brand("Password")
)

export const SignUpInput = Schema.Struct({
  email: Email,
  password: Password,
})

export type SignUpInput = Schema.Schema.Type<typeof SignUpInput>

// Validation retourne Effect<SignUpInput, ParseError>
const validate = Schema.decodeUnknown(SignUpInput)
```

### 3.4 Recommandation

**Phase 1 : Garder Zod et wrapper**
- Migration incrémentale avec `@effect/schema/Zod`
- Réutilise les schemas existants
- Pas de breaking changes

**Phase 2 : Migration vers @effect/schema**
- Une fois Effect.ts établi dans le codebase
- Profiter de l'intégration native Error/Encoding
- Branded types unifiés

---

## 4. Impact sur l'Architecture Hexagonale

### 4.1 Compatibilité Ports/Adapters

L'architecture hexagonale de TiedSiren est **parfaitement compatible** avec Effect.ts :

```
┌─────────────────────────────────────────────────────────────┐
│                         UI LAYER                             │
│   React Components consume Effect programs via hooks        │
│   Effect.runPromise() at the boundary                       │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         CORE LAYER                           │
│   Ports = Effect Service interfaces with Context.Tag        │
│   Usecases = Effect programs (Effect<A, E, R>)              │
│   Pure domain logic remains pure (no Effect)                │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER                    │
│   Adapters = Layer implementations                          │
│   Layer.succeed / Layer.effect for construction             │
│   Layer composition for dependency graph                    │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Usecases Effectful

**Oui, les usecases deviennent "effectful"**, mais c'est une amélioration :

```typescript
// Type signature actuelle (implicite)
createBlockSession: (payload) => Promise<BlockSession>  // Erreurs? Dépendances? 🤷

// Type signature Effect (explicite)
createBlockSession: (payload) => Effect<
  BlockSession,                                          // Success
  DatabaseError | NotificationError,                    // Errors
  BlockSessionRepo | NotificationService | DateProvider // Requirements
>
```

### 4.3 Frontière Domaine Pur / Effets

**Le domaine reste pur :**

```typescript
// core/block-session/selectors/isActive.ts — INCHANGÉ (pur)
export const isActive = (dateProvider: DateProvider, session: BlockSession): boolean => {
  const now = dateProvider.toHHmm(dateProvider.getNow())
  // ... logique pure
}

// core/block-session/block-session.ts — INCHANGÉ (types)
export type BlockSession = {
  id: string
  name: string
  blocklists: Blocklist[]
  // ...
}
```

**Les effets se concentrent aux boundaries :**
- Usecases (orchestration I/O)
- Listeners (bridging events)
- Adapters (I/O réel)

---

## 5. Quantification de la Backpressure

### 5.1 Catégorisation des Améliorations

#### 🔴 Erreur Runtime → Erreur Compile Time

| Pattern Actuel | Avec Effect | Fichiers Impactés |
|----------------|-------------|-------------------|
| `catch (error: unknown)` | `Effect<_, E, _>` où E est typé | 60+ |
| `throw new Error(...)` non typé | `Effect.fail(TypedError)` | 40+ |
| `as ISODateString` cast | `Schema.decode` retourne `Effect` | 2 |
| Dépendance oubliée dans test | `R` manquant = erreur compile | Tous les tests |

#### 🟡 Erreur Silencieuse → Erreur Explicite

| Pattern Actuel | Avec Effect | Fichiers Impactés |
|----------------|-------------|-------------------|
| `logger.error() + swallow` dans listeners | Erreur dans type union | 4 |
| `void asyncFunction()` | Doit être `Effect.runFork` ou similar | 5 |
| `.catch((e) => {})` | `Effect.catchAll` requiert handler | 3 |

#### 🟢 Déjà Bien Typé → Gain Marginal

| Pattern Actuel | Avec Effect | Fichiers Impactés |
|----------------|-------------|-------------------|
| Zod `safeParse` | @effect/schema `decode` | 7 |
| Branded types avec guards | Même pattern, meilleure intégration | 2 |
| Discriminated unions (view models) | Inchangé | 5 |

### 5.2 Tableau Récapitulatif

| Catégorie | Occurrences | Impact Backpressure |
|-----------|-------------|---------------------|
| 🔴 Runtime → Compile | 102+ | **Majeur** |
| 🟡 Silent → Explicit | 12+ | **Significatif** |
| 🟢 Marginal | 14 | Minimal |
| **TOTAL** | **128+** | |

---

## 6. Trade-offs et Risques

### 6.1 Courbe d'Apprentissage

| Audience | Estimation | Mitigation |
|----------|------------|------------|
| Développeur humain | 2-3 semaines | Documentation Effect excellente |
| Agent IA (Claude) | Immédiat | Training data substantiel post-2023 |
| Autres LLMs | Variable | Moins de training data que Zod |

**Training data disponible pour LLMs :**
- Effect.ts créé en 2023, documentation extensive
- Moins répandu que Zod mais exemples de qualité
- Pattern FP (monades, algebras) bien documenté

### 6.2 Taille du Refacto

| Couche | Effort | Peut être Incrémental |
|--------|--------|----------------------|
| `core/_ports_/` | Moyen | ✅ Oui |
| `infra/` adapters | Élevé | ✅ Oui (1 par 1) |
| `core/usecases/` | Moyen | ✅ Oui |
| `core/listeners/` | Faible | ✅ Oui |
| `ui/` forms | Faible | ✅ Oui (garder Zod d'abord) |
| Tests | Significatif | ✅ Parallèle aux adapters |

### 6.3 Impact sur la Lisibilité

**Avant :**
```typescript
const result = await repository.findById(id)
```

**Après :**
```typescript
const result = yield* repository.findById(id)
// ou
const result = yield* Effect.tryPromise(() => repository.findById(id))
```

**Verdict :** Légèrement plus verbeux mais **infiniment plus informatif**.

### 6.4 Dépendance à l'Écosystème Effect

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Abandon du projet | Faible | Élevé | Effect est activement maintenu, backers enterprise |
| Breaking changes | Moyenne | Moyen | Versioning sémantique respecté |
| Lock-in | Moyenne | Moyen | Patterns FP standard, extractibles |

---

## 7. Recommandation Finale

### 7.1 Verdict : Migration Recommandée ✅

**Pourquoi :**

1. **Backpressure maximale** — 102+ erreurs runtime deviennent compile-time
2. **Architecture compatible** — Hexagonal + Ports/Adapters = fit naturel avec Effect Services/Layers
3. **ROI pour agents IA** — Type system rich = meilleur feedback loop
4. **Maturité** — Project stable, documentation excellente, communauté active

### 7.2 Stratégie : Progressive via Boundaries

**NE PAS faire un big bang refacto.** Procéder par couches :

```
Phase 1: Core Ports (2-3 semaines)
├── Définir Error types
├── Convertir interfaces → Effect Service interfaces
└── Garder implémentations Promise (adapter temporaire)

Phase 2: Infrastructure (4-6 semaines)
├── Migrer 1 repository à la fois
├── Commencer par le plus simple (TimerRepository)
├── Tester en isolation
└── Layer composition

Phase 3: Usecases (2-3 semaines)
├── Convertir createAppAsyncThunk → Effect programs
├── Intégration Redux via middleware
└── Garder dispatch existant

Phase 4: Validation (1-2 semaines)
├── Migrer Zod → @effect/schema
└── Unifier branded types
```

### 7.3 Par Quel Module Commencer

**Recommandation : `TimerRepository`**

Pourquoi :
- Interface minimale (2 méthodes: `saveTimer`, `loadTimer`)
- Peu de dépendances
- Test isolé facile
- Erreurs simples (save failed, not found)

```typescript
// Premier port à migrer
// core/_ports_/timer.repository.ts
import { Effect, Context } from "effect"

class TimerNotFoundError extends Data.TaggedError("TimerNotFoundError")<{
  userId: string
}> {}

class TimerPersistenceError extends Data.TaggedError("TimerPersistenceError")<{
  operation: "save" | "load"
  cause: unknown
}> {}

export interface TimerRepository {
  readonly saveTimer: (
    userId: string,
    endedAt: ISODateString
  ) => Effect.Effect<void, TimerPersistenceError>

  readonly loadTimer: (
    userId: string
  ) => Effect.Effect<ISODateString, TimerNotFoundError | TimerPersistenceError>
}

export class TimerRepository extends Context.Tag("TimerRepository")<
  TimerRepository,
  TimerRepository
>() {}
```

### 7.4 Estimation de l'Effort

| Phase | Durée | Parallélisable |
|-------|-------|----------------|
| Phase 1: Ports | 2-3 semaines | Non |
| Phase 2: Infra | 4-6 semaines | Partiellement |
| Phase 3: Usecases | 2-3 semaines | Oui |
| Phase 4: Validation | 1-2 semaines | Oui |
| **TOTAL** | **9-14 semaines** | |

**Note:** Ces estimations supposent un développeur familier avec TypeScript et FP. Un agent IA bien configuré peut accélérer significativement les phases 2-4.

---

## 8. Matrice Effort/Impact

```
                        IMPACT
                   Low    Medium    High
              ┌─────────┬─────────┬─────────┐
         Low  │         │ Zod→    │         │
              │         │ Schema  │         │
              ├─────────┼─────────┼─────────┤
EFFORT Medium │         │ Usecases│ Core    │
              │         │         │ Ports   │
              ├─────────┼─────────┼─────────┤
        High  │         │         │ Infra   │
              │         │         │ Adapters│
              └─────────┴─────────┴─────────┘
```

**Priorisation recommandée :**
1. 🥇 **Core Ports** — Effort moyen, impact élevé, débloque tout le reste
2. 🥈 **Infra Adapters** — Effort élevé mais divisible, impact élevé
3. 🥉 **Usecases** — Effort moyen, suit naturellement
4. 🏅 **Validation** — Effort faible, impact moyen, peut attendre

---

## Annexe A: Exemple Complet de Migration

### A.1 Avant (Code Actuel)

```typescript
// core/_ports_/block-session.repository.ts
export interface BlockSessionRepository {
  create(payload: CreatePayload<BlockSession>): Promise<BlockSession>
  findAll(): Promise<BlockSession[]>
  findById(id: string): Promise<BlockSession>
  update(session: UpdatePayload<BlockSession>): Promise<void>
  delete(id: string): Promise<void>
}

// infra/block-session-repository/prisma.block-session.repository.ts
export class PrismaBlockSessionRepository implements BlockSessionRepository {
  async findById(id: string): Promise<BlockSession> {
    try {
      const session = await this.baseClient.blockSession.findUnique({
        where: { id },
        include: { blocklists: true, devices: true },
      })
      if (!session) throw new Error(`BlockSession ${id} not found`)
      return this.mapToBlockSession(session)
    } catch (error) {
      this.logger.error(`Failed to find: ${error}`)
      throw error
    }
  }
}

// core/block-session/usecases/delete-block-session.usecase.ts
export const deleteBlockSession = createAppAsyncThunk(
  'blockSession/delete',
  async (id: string, { extra: { blockSessionRepository, notificationService } }) => {
    const session = await blockSessionRepository.findById(id)
    await notificationService.cancelScheduledNotifications(session.startNotificationId)
    await notificationService.cancelScheduledNotifications(session.endNotificationId)
    await blockSessionRepository.delete(id)
    return id
  },
)
```

### A.2 Après (Avec Effect.ts)

```typescript
// core/_ports_/errors.ts
import { Data } from "effect"

export class BlockSessionNotFoundError extends Data.TaggedError("BlockSessionNotFoundError")<{
  readonly id: string
}> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly operation: string
  readonly table: string
  readonly cause: unknown
}> {}

export class NotificationError extends Data.TaggedError("NotificationError")<{
  readonly notificationId: string
  readonly operation: "schedule" | "cancel"
  readonly cause: unknown
}> {}

// core/_ports_/block-session.repository.ts
import { Context, Effect } from "effect"
import { BlockSessionNotFoundError, DatabaseError } from "./errors"

export interface BlockSessionRepository {
  readonly create: (
    payload: CreatePayload<BlockSession>
  ) => Effect.Effect<BlockSession, DatabaseError>

  readonly findAll: () => Effect.Effect<BlockSession[], DatabaseError>

  readonly findById: (
    id: string
  ) => Effect.Effect<BlockSession, BlockSessionNotFoundError | DatabaseError>

  readonly update: (
    session: UpdatePayload<BlockSession>
  ) => Effect.Effect<void, BlockSessionNotFoundError | DatabaseError>

  readonly delete: (
    id: string
  ) => Effect.Effect<void, DatabaseError>
}

export class BlockSessionRepository extends Context.Tag("BlockSessionRepository")<
  BlockSessionRepository,
  BlockSessionRepository
>() {}

// infra/block-session-repository/prisma.block-session.repository.ts
import { Effect, Layer } from "effect"

export const PrismaBlockSessionRepositoryLive = Layer.succeed(
  BlockSessionRepository,
  BlockSessionRepository.of({
    findById: (id) =>
      Effect.tryPromise({
        try: async () => {
          const session = await prisma.blockSession.findUnique({
            where: { id },
            include: { blocklists: true, devices: true },
          })
          if (!session) {
            return Effect.fail(new BlockSessionNotFoundError({ id }))
          }
          return mapToBlockSession(session)
        },
        catch: (error) => new DatabaseError({
          operation: "findById",
          table: "BlockSession",
          cause: error,
        }),
      }).pipe(Effect.flatten),

    // ... autres méthodes
  })
)

// core/block-session/usecases/delete-block-session.usecase.ts
import { Effect, pipe } from "effect"

export const deleteBlockSession = (id: string) =>
  Effect.gen(function* () {
    const repo = yield* BlockSessionRepository
    const notifications = yield* NotificationService

    const session = yield* repo.findById(id)

    yield* pipe(
      Effect.all([
        notifications.cancel(session.startNotificationId),
        notifications.cancel(session.endNotificationId),
      ], { concurrency: 2 }),
      Effect.catchAll((e) =>
        Effect.logWarning(`Failed to cancel notifications: ${e}`).pipe(
          Effect.as(undefined)
        )
      )
    )

    yield* repo.delete(id)

    return id
  })

// Type inféré:
// Effect<string, BlockSessionNotFoundError | DatabaseError, BlockSessionRepository | NotificationService>
```

### A.3 Usage dans Redux

```typescript
// core/_redux_/effect-middleware.ts
import { Effect, Runtime } from "effect"

export const runEffect = <A, E>(
  effect: Effect.Effect<A, E, Dependencies>,
  runtime: Runtime.Runtime<Dependencies>
) => Runtime.runPromise(runtime)(effect)

// Usage dans un thunk
export const deleteBlockSessionThunk = createAppAsyncThunk(
  'blockSession/delete',
  async (id: string, { extra }) => {
    return runEffect(
      deleteBlockSession(id),
      extra.effectRuntime // Runtime pré-configuré avec toutes les dépendances
    )
  }
)
```

---

## Annexe B: Checklist de Migration

### B.1 Pré-requis

- [ ] Installer `effect` et `@effect/schema`
- [ ] Configurer ESLint pour Effect patterns
- [ ] Documenter conventions Effect dans ADR
- [ ] Setup base Layer pour tests

### B.2 Par Port

- [ ] Définir Error types dans `core/_ports_/errors.ts`
- [ ] Convertir interface vers Effect signatures
- [ ] Créer Context.Tag
- [ ] Implémenter Layer Live (production)
- [ ] Implémenter Layer Test (fake)
- [ ] Migrer tests existants
- [ ] Documenter breaking changes

### B.3 Validation Finale

- [ ] Tous les `catch (error)` éliminés
- [ ] Aucun `as TypeAssertion` sur branded types
- [ ] Coverage maintenu à 98%
- [ ] Performance comparable (benchmark)
- [ ] Documentation à jour
