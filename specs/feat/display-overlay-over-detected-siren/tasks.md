# Tasks: Android Blocking Overlay Launcher

**Input**: Design documents from `/specs/feat/display-overlay-over-detected-siren/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, native-api/expo-blocking-overlay.md

**Tests**: Unit tests for AndroidSirenTier are included (explicitly requested in spec.md Constitution Check)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**External Dependencies**:
- ⚠️ **#97**: App Launch Monitoring via AccessibilityService (MUST complete before testing end-to-end flow)
- ⚠️ **#101**: Blocking Decision Logic (MUST complete before testing end-to-end flow)

**Note**: Tasks below can be implemented independently of #97 and #101. Integration testing requires those issues to be complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

This feature spans two repositories:
- **expo-blocking-overlay**: Standalone module repository (`github.com/amehmeto/expo-blocking-overlay`)
- **TiedSiren51**: Main application repository (current repo)

---

## Phase 1: Setup (Module Repository)

**Purpose**: Initialize standalone expo-blocking-overlay module repository

- [ ] T001 Create new GitHub repository: `github.com/amehmeto/expo-blocking-overlay`
- [ ] T002 Initialize Expo module with expo-module.config.json and package.json
- [ ] T003 [P] Configure TypeScript for module in tsconfig.json
- [ ] T004 [P] Setup Android build.gradle and module structure
- [ ] T005 [P] Create README.md with module documentation and usage examples
- [ ] T006 [P] Add MIT license to LICENSE file

---

## Phase 2: User Story 1 - Display Blocking Overlay (Priority: P1) 🎯 MVP

**Goal**: When a blocked app is detected, TiedSiren displays a fullscreen overlay within 200ms that prevents user interaction and provides a "Close" button to redirect to home screen.

**Independent Test**: Call `ExpoBlockingOverlay.showOverlay('com.facebook.katana', 1718880000)` from JavaScript and verify fullscreen blocking activity appears within 200ms with message and Close button.

**Repository**: expo-blocking-overlay (separate repository)

### Native Implementation for User Story 1

- [ ] T007 [P] [US1] Create BlockingOverlayActivity.kt in android/src/main/java/expo/modules/blockingoverlay/
- [ ] T008 [P] [US1] Create activity_blocking_overlay.xml layout in android/src/main/res/layout/
- [ ] T009 [US1] Implement ExpoBlockingOverlayModule.kt with showOverlay() method in android/src/main/java/expo/modules/blockingoverlay/
- [ ] T010 [US1] Configure BlockingOverlayActivity in AndroidManifest.xml with singleTask launchMode
- [ ] T011 [US1] Implement onBackPressed() override in BlockingOverlayActivity to prevent dismissal
- [ ] T012 [US1] Implement Close button click handler that launches home screen Intent in BlockingOverlayActivity
- [ ] T013 [P] [US1] Create TypeScript module wrapper in src/index.ts
- [ ] T014 [P] [US1] Generate TypeScript types in src/ExpoBlockingOverlay.types.ts

**Checkpoint**: Module can launch blocking overlay with Close button redirecting to home

---

## Phase 3: User Story 2 - Graceful Error Handling (Priority: P2)

**Goal**: The overlay system handles invalid inputs and failure scenarios gracefully without crashing, logging errors to Logcat for debugging.

**Independent Test**: Call `ExpoBlockingOverlay.showOverlay('', Date.now())` with empty packageName and verify error is thrown, logged to Logcat, and app does not crash.

**Repository**: expo-blocking-overlay (separate repository)

### Error Handling for User Story 2

- [ ] T015 [P] [US2] Add packageName validation in ExpoBlockingOverlayModule.kt showOverlay() method
- [ ] T016 [P] [US2] Add try-catch error handling for Activity launch failure in ExpoBlockingOverlayModule.kt
- [ ] T017 [US2] Implement ERR_INVALID_PACKAGE error code with rejection in ExpoBlockingOverlayModule.kt
- [ ] T018 [US2] Implement ERR_OVERLAY_LAUNCH error code with rejection in ExpoBlockingOverlayModule.kt
- [ ] T019 [US2] Add Android Logcat logging for all error scenarios in ExpoBlockingOverlayModule.kt
- [ ] T020 [P] [US2] Document error codes and handling in README.md

**Checkpoint**: Module handles all error scenarios gracefully without crashing

---

## Phase 4: TiedSiren Integration - AndroidSirenTier Adapter

**Purpose**: Create Android-specific implementation of SirenTier port interface in TiedSiren51

**Repository**: TiedSiren51 (main application repository)

### Tests for AndroidSirenTier (Unit Tests)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T021 [P] Create AndroidSirenTier.test.ts in infra/siren-tier/
- [ ] T022 [P] Add test: "calls ExpoBlockingOverlay.showOverlay() with correct packageName" in AndroidSirenTier.test.ts
- [ ] T023 [P] Add test: "handles ERR_INVALID_PACKAGE error gracefully" in AndroidSirenTier.test.ts
- [ ] T024 [P] Add test: "handles ERR_OVERLAY_LAUNCH error gracefully" in AndroidSirenTier.test.ts

### Implementation for AndroidSirenTier

- [ ] T025 Create AndroidSirenTier.ts in infra/siren-tier/
- [ ] T026 Implement SirenTier interface with target() method in AndroidSirenTier.ts
- [ ] T027 Implement SirenTier interface with block() method calling ExpoBlockingOverlay.showOverlay() in AndroidSirenTier.ts
- [ ] T028 Add error handling and logging for overlay launch failures in AndroidSirenTier.ts
- [ ] T029 Update dependencies.ts to wire AndroidSirenTier for Platform.OS === 'android' in ui/dependencies.ts
- [ ] T030 Verify InMemorySirenTier is used as fallback for iOS/Web in ui/dependencies.ts

**Checkpoint**: AndroidSirenTier successfully implements SirenTier and launches overlays on Android

---

## Phase 5: Module Publishing & Integration

**Purpose**: Publish expo-blocking-overlay module and integrate into TiedSiren51

**Repository**: Both repositories

- [ ] T031 [P] Add module to TiedSiren51 package.json with git reference or npm package
- [ ] T032 [P] Create example app in expo-blocking-overlay repository for testing
- [ ] T033 [P] Document API in expo-blocking-overlay README with TypeScript examples
- [ ] T034 Run npm install in TiedSiren51 to install expo-blocking-overlay module
- [ ] T035 Verify module imports correctly in AndroidSirenTier.ts
- [ ] T036 Run TypeScript type checking across TiedSiren51 project

**Checkpoint**: Module is published and integrated into TiedSiren51

---

## Phase 6: Manual Testing & Validation

**Purpose**: Validate on physical Android devices (emulators cannot test AccessibilityService integration)

**⚠️ Prerequisites**: Issues #97 (App Launch Monitoring) and #101 (Blocking Decision Logic) MUST be complete

- [ ] T037 Test overlay launch on Samsung device (Android 8.0 API 26)
- [ ] T038 Test overlay launch on Google Pixel device (Android 12 API 31)
- [ ] T039 Test overlay launch on OnePlus device (Android 13 API 33)
- [ ] T040 Verify overlay appears within 200ms using Android Profiler
- [ ] T041 Verify back button does not dismiss overlay on all devices
- [ ] T042 Verify Close button redirects to home screen on all devices
- [ ] T043 Test error handling with invalid packageName on physical device
- [ ] T044 Verify errors are logged to Logcat with tag "ExpoBlockingOverlay"
- [ ] T045 Test rapid multiple calls to showOverlay() verify singleTask behavior

**Checkpoint**: Feature works reliably across multiple Android devices and manufacturers

---

## Phase 7: Polish & Documentation

**Purpose**: Final refinements and documentation updates

- [ ] T046 [P] Update quickstart.md with AndroidSirenTier usage examples in specs/feat/display-overlay-over-detected-siren/
- [ ] T047 [P] Document known limitations (force-stop bypass) in spec.md
- [ ] T048 [P] Add performance benchmarks to native-api/expo-blocking-overlay.md
- [ ] T049 Run ESLint and Prettier on all TypeScript files in TiedSiren51
- [ ] T050 Run Kotlin linter on all native files in expo-blocking-overlay
- [ ] T051 Review and update ADR: standalone-expo-modules.md if needed
- [ ] T052 Validate all acceptance scenarios from spec.md on physical device

**Checkpoint**: Feature is production-ready with complete documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup completion
- **User Story 2 (Phase 3)**: Depends on User Story 1 (adds error handling to existing code)
- **TiedSiren Integration (Phase 4)**: Depends on User Story 1 completion (needs working module)
- **Module Publishing (Phase 5)**: Depends on User Stories 1 & 2 completion
- **Manual Testing (Phase 6)**: Depends on Phase 4 integration + external issues #97 and #101
- **Polish (Phase 7)**: Depends on Manual Testing validation

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup (Phase 1) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 completion - Adds error handling to existing implementation

### Within Each Phase

**Phase 2 (User Story 1):**
- T007-T008 (Activity + Layout) can run in parallel [P]
- T009 depends on T007 (Module needs Activity class)
- T010-T012 must run after T007, T009 (configure existing classes)
- T013-T014 (TypeScript wrapper) can run in parallel [P] after native code exists

**Phase 3 (User Story 2):**
- T015-T016 (validation + error handling) can run in parallel [P]
- T017-T019 must run after T015-T016 (add error codes to existing handlers)
- T020 (documentation) can run in parallel [P]

**Phase 4 (TiedSiren Integration):**
- T021-T024 (tests) MUST be written FIRST and FAIL before implementation
- T021-T024 can all run in parallel [P] (different test cases)
- T025 starts after tests are written
- T026-T028 must run sequentially (same file)
- T029-T030 run after T025-T028 (wire completed adapter)

**Phase 5 (Publishing):**
- T031-T033 can run in parallel [P] (different repos/files)
- T034-T036 must run sequentially (install → verify → type-check)

### Parallel Opportunities

**Setup (Phase 1):**
```bash
# Run in parallel:
T003: "Configure TypeScript for module in tsconfig.json"
T004: "Setup Android build.gradle and module structure"
T005: "Create README.md with module documentation"
T006: "Add MIT license to LICENSE file"
```

**User Story 1 (Phase 2):**
```bash
# Run in parallel:
T007: "Create BlockingOverlayActivity.kt"
T008: "Create activity_blocking_overlay.xml layout"

# Then in parallel:
T013: "Create TypeScript module wrapper in src/index.ts"
T014: "Generate TypeScript types in src/ExpoBlockingOverlay.types.ts"
```

**User Story 2 (Phase 3):**
```bash
# Run in parallel:
T015: "Add packageName validation in ExpoBlockingOverlayModule.kt"
T016: "Add try-catch error handling in ExpoBlockingOverlayModule.kt"
T020: "Document error codes in README.md"
```

**TiedSiren Integration (Phase 4):**
```bash
# Tests first (run in parallel):
T021: "Create AndroidSirenTier.test.ts"
T022: "Add test: calls ExpoBlockingOverlay.showOverlay()"
T023: "Add test: handles ERR_INVALID_PACKAGE"
T024: "Add test: handles ERR_OVERLAY_LAUNCH"
```

**Publishing (Phase 5):**
```bash
# Run in parallel:
T031: "Add module to package.json"
T032: "Create example app in module repo"
T033: "Document API in module README"
```

**Polish (Phase 7):**
```bash
# Run in parallel:
T046: "Update quickstart.md"
T047: "Document known limitations"
T048: "Add performance benchmarks"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete **Phase 1**: Setup (expo-blocking-overlay repository)
2. Complete **Phase 2**: User Story 1 (core overlay functionality)
3. Complete **Phase 4**: TiedSiren Integration (AndroidSirenTier adapter)
4. Complete **Phase 5**: Module Publishing
5. **STOP and VALIDATE**: Test User Story 1 independently with mock calls
6. Deploy/demo if ready (MVP achieved!)

**MVP Scope**: Tasks T001-T014, T021-T030, T031-T036 (37 tasks)

### Incremental Delivery

1. **Foundation** (Phase 1): Module repository ready
2. **MVP** (Phase 2 + 4 + 5): User Story 1 implemented → Test → Demo
3. **Robustness** (Phase 3): User Story 2 added → Test error handling → Demo
4. **Validation** (Phase 6): Manual testing on physical devices → Production-ready
5. **Polish** (Phase 7): Documentation and refinements → Release

### Parallel Team Strategy

With multiple developers:

1. **Team completes Phase 1 together** (module setup)
2. **Phase 2 split:**
   - Developer A: Native Android implementation (T007-T012)
   - Developer B: TypeScript wrapper (T013-T014)
3. **Phase 3:**
   - Developer A: Error handling (T015-T019)
   - Developer B: Documentation (T020)
4. **Phase 4:**
   - Developer A: Write tests (T021-T024)
   - Developer B: Implement AndroidSirenTier (T025-T030)
5. **Phases 5-7**: Team validates together

---

## External Blockers

**Before End-to-End Testing:**

These GitHub issues MUST be complete before full integration testing:

- **#97**: App Launch Monitoring via AccessibilityService
  - Provides app detection events that trigger `SirenTier.block()`
  - Without this: Cannot detect when blocked apps are launched

- **#101**: Blocking Decision Logic
  - Determines when to call `SirenTier.block()` based on Redux state
  - Without this: No logic to decide which apps should be blocked

**Workaround for Independent Testing:**

You CAN test this feature independently by:
1. Manually calling `ExpoBlockingOverlay.showOverlay()` from JavaScript console
2. Creating a test button in the UI that triggers overlay launch
3. Using InMemorySirenTier in tests with mocked behavior

**Full Integration**: Requires #97 and #101 complete → AccessibilityService detects app → Blocking logic decides → AndroidSirenTier displays overlay

---

## Notes

- [P] tasks = different files/repositories, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Module repository is separate from TiedSiren51 (follows standalone module principle)
- Physical devices required for full testing (AccessibilityService limitations)
- Avoid: vague tasks, same file conflicts, blocking dependencies between parallel tasks
