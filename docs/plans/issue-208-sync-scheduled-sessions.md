# Issue #208: Sync Scheduled Sessions + Fix Overlay

## Objectifs

1. **Debug:** Comprendre et fixer pourquoi l'overlay ne s'affiche jamais
2. **Feature:** Implémenter le sync des sessions futures au natif

---

## Phase 0: Debug de l'Overlay (Priorité)

### Symptôme

L'overlay ne s'affiche jamais, même quand:

- Session active (dans la fenêtre horaire)
- Foreground service actif (notification visible)
- Accessibility Service activé

### Analyse: Permission SYSTEM_ALERT_WINDOW

**Résultat:** NON NÉCESSAIRE

L'overlay est une **Activity fullscreen** (pas un WindowManager overlay). Les Activities standards ne nécessitent pas `SYSTEM_ALERT_WINDOW`. La doc confirme: "Overlay doesn't require SYSTEM_ALERT_WINDOW permission".

### Cause Probable: Flow de Détection

Le problème est dans la chaîne de détection. Points à vérifier:

1. **BlockingCallback enregistré?**
   - `onServiceStarted()` appelle `AccessibilityService.addEventListener(this)`
   - Est-ce que l'enregistrement réussit?

2. **Events reçus?**
   - `onAppChanged()` est-il appelé quand on ouvre une app?
   - Ajouter logs pour vérifier

3. **Schedule stocké?**
   - `BlockingScheduleStorage.getSchedule()` retourne-t-il des données?
   - Le schedule est-il bien envoyé par JS?

4. **Time check correct?**
   - `isActiveAt(LocalTime.now())` retourne-t-il true?
   - Problème de timezone?

### Plan de Debug

**Étape 1: Ajouter logs dans BlockingCallback.kt**

```kotlin
override fun onAppChanged(packageName: String, className: String, timestamp: Long) {
    Log.d("BlockingCallback", "onAppChanged: $packageName")
    val schedule = BlockingScheduleStorage.getSchedule(context)
    Log.d("BlockingCallback", "Schedule count: ${schedule.size}")
    val now = LocalTime.now()
    Log.d("BlockingCallback", "Current time: $now")

    schedule.forEach { window ->
        val isActive = window.isActiveAt(now)
        val hasPackage = window.packageNames.contains(packageName)
        Log.d("BlockingCallback", "Window ${window.id}: active=$isActive, hasPackage=$hasPackage")
    }

    val shouldBlock = schedule.any { it.isActiveAt(now) && it.packageNames.contains(packageName) }
    Log.d("BlockingCallback", "shouldBlock: $shouldBlock")

    if (shouldBlock) {
        Log.d("BlockingCallback", "Launching overlay for $packageName")
        launchOverlay(context, packageName)
    }
}
```

**Étape 2: Tester et lire logcat**

```bash
adb logcat -s BlockingCallback:D
```

**Étape 3: Identifier le point de défaillance**

| Si ce log manque | Le problème est |
|------------------|-----------------|
| "onAppChanged" | AccessibilityService ne notifie pas BlockingCallback |
| "Schedule count: 0" | JS n'envoie pas le schedule au natif |
| "active=false" | Problème de timezone ou format HH:mm |
| "hasPackage=false" | L'app n'est pas dans la liste |
| "Launching overlay" présent mais rien | Activity ne démarre pas |

### Fichiers à Modifier (dans tied-siren-blocking-overlay)

| Fichier | Action |
|---------|--------|
| `BlockingCallback.kt` | Ajouter logs détaillés |
| `BlockingScheduleStorage.kt` | Log au get/set |
| `BlockingOverlayActivity.kt` | Log au onCreate |

---

## Récap Complet de l'Architecture

### Le Problème

Le sélecteur `selectBlockingSchedule` filtre uniquement les sessions **actives**. Quand un utilisateur édite une blocklist pour une session **future**, les changements ne sont pas synchronisés au natif.

**Scénario bug:**

1. Session planifiée 15:00-16:00 avec blocklist A
2. À 14:30, l'utilisateur ajoute TikTok à blocklist A
3. Le listener se déclenche → `selectBlockingSchedule` retourne `[]` → rien synchronisé
4. À 15:00, la session démarre → le natif n'a pas le schedule → TikTok **NON bloqué**

---

## Architecture Actuelle

### Expo Modules (4 packages @amehmeto)

| Module | Rôle | État |
|--------|------|------|
| `expo-foreground-service` | Keep-alive process avec notification | Fonctionnel |
| `tied-siren-blocking-overlay` | Blocage apps + overlay UI | Fonctionnel |
| `expo-accessibility-service` | Détection apps foreground | Fonctionnel |
| `expo-list-installed-apps` | Liste apps installées | Fonctionnel |

### Découplage par Réflexion

```text
expo-foreground-service (générique)
         │
         │ setCallbackClass("expo.modules.blockingoverlay.BlockingCallback")
         ▼
tied-siren-blocking-overlay
         │
         ├── BlockingCallback.onServiceStarted(context)
         ├── BlockingCallback.onAppChanged(packageName)
         └── BlockingCallback.onServiceStopped()
```

Le foreground service est générique. `BlockingCallback` est injecté par réflexion.

### Foreground Service Behavior

| Aspect | Valeur |
|--------|--------|
| `onStartCommand()` return | `START_STICKY` → auto-restart si tué |
| AlarmManager | Non |
| BOOT_COMPLETED | Non |
| Si app fermée | Service continue (foreground) |
| Si service tué | Auto-restart par Android |

**Implication:** Le foreground service doit être démarré AVANT que l'utilisateur ferme l'app.

### Architecture Kotlin dans tied-siren-blocking-overlay

```text
expo/modules/blockingoverlay/
├── TiedSirenBlockingOverlayModule.kt  ← Bridge Expo (JS ↔ Kotlin)
├── BlockingCallback.kt                 ← Listener du foreground service
├── BlockingScheduler.kt                ← Vérifie si NOW est dans une fenêtre
├── BlockingScheduleStorage.kt          ← Persiste en SharedPreferences
├── BlockedAppsStorage.kt               ← Liste des apps bloquées
├── BlockingOverlayActivity.kt          ← UI fullscreen de blocage
├── BlockingWindow.kt                   ← Data class (id, startTime HH:mm, endTime HH:mm)
│
├── lookout/                            ← Plugin architecture (détection)
│   ├── AppLookout.kt                   ← Interface
│   ├── WebsiteLookout.kt               ← Interface (Noop impl)
│   └── KeywordLookout.kt               ← Interface (Noop impl)
│
└── tier/                               ← Plugin architecture (blocage)
    ├── AppTier.kt                      ← Interface
    ├── WebsiteTier.kt                  ← Interface (Noop impl)
    └── KeywordTier.kt                  ← Interface (Noop impl)
```

### Ce qui fonctionne déjà côté natif

1. **Persistence:** `BlockingScheduleStorage` sauvegarde en SharedPreferences → survit au kill
2. **Time-based blocking:** `BlockingWindow.isActiveAt(LocalTime)` gère les fenêtres overnight
3. **Autonomous enforcement:** `BlockingCallback.onAppChanged()` vérifie le schedule et trigger l'overlay
4. **Debouncing:** 500ms pour éviter les triggers répétés

---

## Flux Actuel (JS-centric)

```text
┌─────────────────────────────────────────────────────────────┐
│  JS Layer                                                    │
│  ├── selectBlockingSchedule filtre sessions ACTIVES seulement│
│  ├── Listener décide quand start/stop foregroundService     │
│  └── Envoie schedule VIDE si pas de session active NOW      │
│                          ↓                                   │
│  Native Layer                                                │
│  ├── BlockingScheduleStorage reçoit le schedule             │
│  ├── BlockingCallback.onAppChanged() vérifie isActiveAt()   │
│  └── Si match → showOverlay()                               │
└─────────────────────────────────────────────────────────────┘
```

**Problème:** Si aucune session active NOW, JS envoie `[]` → natif ne bloque rien.

---

## Solution Proposée

### Approche: Foreground Service Dès Sessions Programmées

1. **Démarrer le foreground service** dès qu'il existe des sessions (actives OU futures)
2. **Envoyer TOUS les schedules** au natif (actifs + futurs)
3. **Le natif vérifie le timing** quand une app est détectée (`isActiveAt(LocalTime.now())`)

### Flux Cible

```text
┌─────────────────────────────────────────────────────────────┐
│  JS Layer (display + sync)                                   │
│  ├── selectBlockingSchedule retourne TOUTES les sessions    │
│  ├── Démarrer foreground service si sessions.length > 0     │
│  └── Envoyer tous les schedules au natif                    │
│                          ↓                                   │
│  Native Layer (autonome)                                     │
│  ├── BlockingScheduleStorage persiste TOUS les schedules    │
│  ├── BlockingCallback.onAppChanged() vérifie isActiveAt()   │
│  └── Si NOW dans fenêtre ET app match → showOverlay()       │
└─────────────────────────────────────────────────────────────┘
```

---

## Options d'Implémentation

### Option A: JS Seulement (Recommandé pour #208)

Changements minimaux côté JS, le natif gère déjà le time-check.

**Fichiers à modifier:**

1. `core/block-session/selectors/selectBlockingSchedule.ts`
   - Retirer le filtre `isActive`
   - Retourner toutes les sessions

2. `core/siren/listeners/on-blocking-schedule-changed.listener.ts`
   - Démarrer foreground service si `schedule.length > 0` (pas seulement si actif NOW)
   - Arrêter foreground service si `schedule.length === 0`

3. Tests à mettre à jour

**Avantages:**

- Changement minimal
- Le natif fait déjà le time-check via `BlockingWindow.isActiveAt()`
- Pas de changement Kotlin

**Limites:**

- `BlockingWindow` utilise `HH:mm` → sessions limitées à une journée
- Pas de support multi-jours

---

### Option B: JS + Kotlin (Support Multi-Jours)

Modifier `BlockingWindow` pour supporter les dates complètes.

**Fichiers JS à modifier:** (même que Option A)

**Fichiers Kotlin à modifier:**

1. `BlockingWindow.kt`
   - Changer `startTime: String` (HH:mm) → `startTime: String` (ISO)
   - Modifier `isActiveAt()` pour comparer des `Instant` au lieu de `LocalTime`

2. `BlockingScheduleStorage.kt`
   - Mettre à jour la sérialisation JSON

3. `TiedSirenBlockingOverlayModule.kt`
   - Mettre à jour la validation

**Avantages:**

- Support sessions multi-jours
- Plus robuste

**Limites:**

- Changement dans tied-siren-blocking-overlay (package séparé)
- Plus de travail

---

### Option C: Refonte Complète (Native-First)

Le natif gère tout: lifecycle foreground service, AlarmManager pour boot, etc.

**Non recommandé pour #208** - trop de scope.

---

## Recommandation

**Option A (JS seulement)** pour le ticket #208:

1. Simple et efficace
2. Le natif fait déjà le time-check
3. Résout le bug immédiat
4. Option B peut être un ticket séparé si le support multi-jours est nécessaire

---

## Plan d'Implémentation (Option A)

### Phase 1: Nouveaux Helpers

**Fichier:** `core/block-session/selectors/hasActiveSessionNow.ts`

```typescript
export function hasActiveSessionNow(
  dateProvider: DateProvider,
  sessions: BlockSession[],
): boolean {
  return sessions.some((session) => isActive(dateProvider, session))
}
```

### Phase 2: Modifier selectBlockingSchedule

**Fichier:** `core/block-session/selectors/selectBlockingSchedule.ts`

```typescript
// AVANT:
const activeSessions = blockSessionAdapter
  .getSelectors()
  .selectAll(blockSessionState)
  .filter((session) => isActive(dateProvider, session))

if (activeSessions.length === 0) return []

// APRÈS:
const allSessions = blockSessionAdapter
  .getSelectors()
  .selectAll(blockSessionState)

if (allSessions.length === 0) return []
```

### Phase 3: Modifier le Listener

**Fichier:** `core/siren/listeners/on-blocking-schedule-changed.listener.ts`

Séparer deux concepts:

- `hasSchedule = schedule.length > 0` → pour foreground service
- `hasActiveSessionNow()` → pour sirenLookout (optionnel)

```typescript
// Foreground service: actif dès qu'il y a des sessions
if (schedule.length > 0 && !foregroundService.isRunning()) {
  await foregroundService.start()
}
if (schedule.length === 0 && foregroundService.isRunning()) {
  await foregroundService.stop()
}

// Sync schedule au natif
await sirenTier.updateBlockingSchedule(schedule)
```

### Phase 4: Tests

**Nouveaux scénarios:**

1. "should sync schedule when blocklist edited for future session"
2. "should start foreground service for future session"
3. "should NOT start sirenLookout for future session" (optionnel)

**Tests à modifier:**

1. "should NOT sync when blocklist edited but no active session" → doit maintenant sync
2. "should not sync blocked apps for sessions outside active time" → distinguer passé vs futur

---

## Vérification

```bash
# Tests unitaires
npm test -- --run

# Lint
npm run lint

# Test manuel sur Android
# 1. Créer session pour dans 5 minutes
# 2. Vérifier que foreground service démarre
# 3. Fermer l'app
# 4. Éditer la blocklist depuis un autre device/API
# 5. Attendre le démarrage de la session
# 6. Ouvrir une app bloquée → doit afficher overlay
```

---

## Questions Ouvertes

1. **Multi-jours:** Les sessions peuvent-elles durer plus de 24h? Si oui, Option B nécessaire.
2. **sirenLookout:** Doit-il être actif seulement pendant les sessions actives, ou tout le temps?
3. **Notification:** Le texte de la notification doit-il changer selon l'état (session active vs programmée)?
