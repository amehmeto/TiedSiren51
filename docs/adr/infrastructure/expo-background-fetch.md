# Expo Background Fetch for Background Tasks

Date: 2025-11-23

## Status

Superseded by [Native Blocking Scheduler](native-blocking-scheduler.md)

**Superseded (2025-12-23)**: Background fetch polling cannot guarantee precise session start/end times. iOS throttles to ~15min intervals which is unacceptable for blocking reliability. Native AlarmManager scheduling provides sub-second precision.

## Context

TiedSiren51 needs to perform background tasks even when the app is not actively running:

- **Auto-block sirens**: Activate blocking when scheduled sessions start
- **Check active sessions**: Verify if blocking should be enabled
- **Sync state**: Keep app state current with scheduled times
- **Target sirens**: Apply blocking rules periodically

Requirements:
- **Run in background**: Execute when app is backgrounded or terminated
- **Periodic execution**: Run tasks at regular intervals (e.g., every minute)
- **Cross-platform**: Android and iOS support
- **Redux integration**: Access and update Redux store
- **Reliability**: Tasks must run even after app restart
- **Testability**: Abstract behind port for unit testing

Constraints:
- iOS limits background execution frequency
- Android allows more flexible background tasks
- Must work with Expo managed workflow
- Tasks should be lightweight (battery/performance)
- Cannot rely on app being foregrounded

## Decision

Use **Expo Background Fetch** and **Expo Task Manager** for scheduling and executing background tasks, implemented through a `BackgroundTaskService` port adapter.

### Implementation

**1. Port Definition** (`core/_ports_/background-task.service.ts`):

```typescript
export interface BackgroundTaskService {
  initialize(store: AppStore): Promise<void>
  defineTask(taskName: string, taskFunction: () => Promise<void>): Promise<void>
  scheduleTask(taskName: string, options?: TaskOptions): Promise<void>
  cancelTask(taskName: string): Promise<void>
}

export interface TaskOptions {
  minimumInterval?: number  // Minimum time between task executions (seconds)
  stopOnTerminate?: boolean // Android: stop task when app terminates
  startOnBoot?: boolean     // Android: restart task on device reboot
}
```

**2. Expo Adapter** (`infra/background-task-service/real.background-task.service.ts`):

```typescript
export class RealBackgroundTaskService implements BackgroundTaskService {
  async initialize(store: AppStore): Promise<void> {
    TaskManager.defineTask('sync-data', async () => {
      const now = Date.now()
      store.dispatch(syncData())
      console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`)
    })
  }

  async defineTask(taskName: string, taskFunction: () => Promise<void>): Promise<void> {
    TaskManager.defineTask(taskName, taskFunction)
  }

  async scheduleTask(taskName: string, _options?: TaskOptions): Promise<void> {
    if (Platform.OS === 'web') return

    return BackgroundFetch.registerTaskAsync(taskName, {
      minimumInterval: 60 * 1,  // 1 minute
      stopOnTerminate: false,   // Continue after app closes (Android)
      startOnBoot: true,        // Restart on device boot (Android)
    })
  }

  async cancelTask(taskName: string): Promise<void> {
    return BackgroundFetch.unregisterTaskAsync(taskName)
  }
}
```

**3. Task Registration at App Startup**:

```typescript
// In app initialization
const backgroundTaskService = new RealBackgroundTaskService()
await backgroundTaskService.initialize(store)
await backgroundTaskService.scheduleTask('sync-data')
```

**4. Task Definition with Redux**:

Background tasks can dispatch Redux actions:

```typescript
TaskManager.defineTask('sync-data', async () => {
  // Access Redux store
  store.dispatch(syncData())

  // Optionally return result status
  // return BackgroundFetch.BackgroundFetchResult.NewData
})
```

**5. Fake Implementation for Testing**:

```typescript
export class FakeBackgroundTaskService implements BackgroundTaskService {
  tasks: Map<string, () => Promise<void>> = new Map()

  async defineTask(taskName: string, taskFunction: () => Promise<void>): Promise<void> {
    this.tasks.set(taskName, taskFunction)
  }

  async scheduleTask(taskName: string): Promise<void> {
    // In tests, manually trigger tasks
    const task = this.tasks.get(taskName)
    if (task) await task()
  }
}
```

## Consequences

### Positive

- **Background execution**: Tasks run even when app is backgrounded
- **Periodic scheduling**: Regular execution at defined intervals
- **Redux integration**: Direct access to app state and actions
- **Cross-platform**: Single API for Android and iOS
- **Expo managed**: No native code configuration required
- **Reliability**: Tasks persist across app restarts
- **Android boot support**: Tasks restart on device reboot
- **Port abstraction**: Core domain isolated from Expo specifics
- **Testing**: Fake implementation for unit tests
- **No server required**: Fully client-side background processing

### Negative

- **iOS limitations**: System decides when to run tasks (not guaranteed timing)
- **Execution frequency**: iOS may throttle to ~15 minutes intervals
- **Battery impact**: Frequent background tasks drain battery
- **Not real-time**: Cannot guarantee exact execution times
- **Web unsupported**: Background fetch doesn't work on web
- **Task duration limits**: iOS limits background task duration
- **Debugging difficulty**: Hard to test background behavior in development
- **Android battery optimization**: May be killed by aggressive battery savers

### Neutral

- **Platform differences**: iOS and Android have different background policies
- **Minimum interval**: Actual interval may be longer than specified
- **Task complexity**: Should keep tasks lightweight and fast

## Alternatives Considered

### 1. React Native Background Actions

Community library for background tasks.

**Rejected because**:
- Requires native configuration (breaks Expo managed workflow)
- More complex setup
- Platform-specific code required
- Less maintained than Expo's solution

### 2. Expo Background Fetch + WorkManager (Android)

Use WorkManager for more reliable Android background execution.

**Rejected because**:
- Requires bare workflow (native modules)
- Adds complexity for marginal improvement
- Expo Background Fetch sufficient for use case

### 3. Firebase Cloud Functions + Push Notifications

Server-side cron jobs trigger app via push notifications.

**Rejected because**:
- Requires server infrastructure
- Adds network dependency
- More complex architecture
- Higher cost
- Unnecessary for client-side logic

### 4. Foreground Service (Android)

Use persistent foreground service with notification.

**Rejected because**:
- Shows persistent notification (poor UX)
- iOS doesn't support this pattern
- Drains battery significantly
- Only needed for critical real-time tasks

### 5. No Background Tasks (Manual User Action)

Require users to open app for blocking to activate.

**Rejected because**:
- Poor user experience
- Defeats purpose of scheduled blocking
- Users would forget to activate sessions

## Implementation Notes

### Task Definition Best Practices

1. **Keep tasks lightweight**: Minimize CPU and battery usage
2. **Handle errors**: Tasks should not crash app
3. **Quick execution**: Complete within 30 seconds
4. **Idempotent logic**: Tasks may run multiple times
5. **Logging**: Track task execution for debugging

### Platform-Specific Behavior

**iOS**:
- System determines when to run tasks (background budget)
- May coalesce multiple tasks
- Actual interval typically 15+ minutes regardless of setting
- Tasks may not run if battery is low
- Development mode behavior differs from production

**Android**:
- More predictable execution intervals
- Can run tasks more frequently
- `stopOnTerminate: false` keeps tasks running after app closes
- `startOnBoot: true` restarts tasks on device reboot
- Battery optimization settings can interfere

**Web**:
- Background fetch not supported
- Must use Service Workers (different API)
- More limited capabilities

### Debugging Background Tasks

```typescript
// Enable logging
TaskManager.defineTask('target-sirens', async () => {
  console.log('Background task executed at', new Date().toISOString())
  // Task logic...
})

// Check task status
const isRegistered = await TaskManager.isTaskRegisteredAsync('target-sirens')
const tasks = await TaskManager.getRegisteredTasksAsync()
```

### Task Execution Lifecycle

1. **Register task**: `defineTask()` registers task function
2. **Schedule task**: `scheduleTask()` tells OS to run task periodically
3. **OS triggers**: System wakes app in background
4. **Execute**: Task function runs
5. **Complete**: Task returns, app may be suspended again

### Minimum Intervals

- **Android**: Can be as low as 1 minute (but drains battery)
- **iOS**: System minimum ~15 minutes (can be longer)
- **Recommended**: 15-30 minutes for non-critical tasks

### Error Handling

```typescript
TaskManager.defineTask('sync-data', async () => {
  try {
    store.dispatch(syncData())
  } catch (error) {
    console.error('Background task failed:', error)
    // Don't throw - prevents task from being disabled
  }
})
```

## Related ADRs

- [Hexagonal Architecture](../hexagonal-architecture.md) - Port/adapter pattern
- [Expo Notifications](expo-notifications.md) - For notification triggers
- [Redux Toolkit for Business Logic](../core/redux-toolkit-for-business-logic.md) - State management

## References

- [Expo Background Fetch](https://docs.expo.dev/versions/latest/sdk/background-fetch/)
- [Expo Task Manager](https://docs.expo.dev/versions/latest/sdk/task-manager/)
- [iOS Background Execution](https://developer.apple.com/documentation/uikit/app_and_environment/scenes/preparing_your_ui_to_run_in_the_background/updating_your_app_with_background_app_refresh)
- [Android WorkManager](https://developer.android.com/topic/libraries/architecture/workmanager)
- Implementation: `infra/background-task-service/real.background-task.service.ts`
