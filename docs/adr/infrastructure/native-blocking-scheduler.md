# Native Blocking Scheduler

Date: 2025-12-23

## Status

Accepted

## Context

TiedSiren51 block sessions require precise start and end times. Users expect blocking to activate exactly when scheduled, not with a ~15 minute delay. The previous approach using Expo Background Fetch had critical limitations:

**Problem with JS-side scheduling:**

- Redux listeners only fire on state changes, not on time passing
- If no user action triggers a state change at session start/end time, nothing happens
- A user could have a session scheduled for 14:00-15:00, but if they don't interact with the app, blocking never activates

**Problem with Background Fetch polling:**

- iOS throttles background execution to ~15 minute intervals
- Cannot guarantee execution at exact times
- A session starting at 14:00 might not activate until 14:12
- Unacceptable for a blocking app where reliability is crucial

**Reliability requirement:**

- A user blocked illegitimately (due to timing bugs) is unacceptable
- A user not blocked when they should be (due to timing bugs) is equally unacceptable
- Sub-second precision is needed for session boundaries

## Decision

Implement **native-side scheduling** using Android AlarmManager (and platform equivalents) to achieve precise session start/end times.

### Architecture

The JS layer computes the blocking schedule and sends it to the native layer. The native layer is responsible for:

1. **Scheduling**: Setting alarms for each session start/end time
2. **Execution**: Activating/deactivating blocking at scheduled times
3. **Persistence**: Surviving app kills and device reboots

### Data Model

```typescript
interface BlockingSchedule {
  sessions: ScheduledSession[]
}

interface ScheduledSession {
  id: string
  startTime: string        // HH:mm format
  endTime: string          // HH:mm format
  blockedPackages: string[]
  recurrence: 'daily' | 'weekly' | DaysOfWeek[]
  isOvernight: boolean     // true when endTime < startTime (e.g., 22:00-06:00)
}
```

### Flow

1. **JS computes schedule**: When block sessions or blocklists change, JS computes the complete schedule
2. **JS sends to native**: `sirenTier.updateSchedule(schedule)`
3. **Native sets alarms**: AlarmManager schedules exact alarms for each start/end time
4. **Native executes**: At scheduled time, native activates/deactivates blocking
5. **Native persists**: Schedule survives app process death

### Port Definition

```typescript
// core/_ports_/siren.tier.ts
export interface SirenTier {
  updateSchedule(schedule: BlockingSchedule): Promise<void>
  getCurrentSchedule(): Promise<BlockingSchedule | null>
  clearSchedule(): Promise<void>
}
```

### Native Implementation (Android)

```kotlin
class BlockingScheduler(private val context: Context) {
    private val alarmManager = context.getSystemService(AlarmManager::class.java)

    fun scheduleSession(session: ScheduledSession) {
        val startIntent = PendingIntent.getBroadcast(
            context,
            session.id.hashCode(),
            Intent(context, BlockingReceiver::class.java).apply {
                action = ACTION_START_BLOCKING
                putExtra(EXTRA_PACKAGES, session.blockedPackages.toTypedArray())
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Use setExactAndAllowWhileIdle for precise timing
        alarmManager.setExactAndAllowWhileIdle(
            AlarmManager.RTC_WAKEUP,
            calculateNextTriggerTime(session.startTime),
            startIntent
        )
    }
}
```

### Platform Support Roadmap

| Platform | Scheduling Mechanism | Status |
|----------|---------------------|--------|
| Android | AlarmManager | Planned |
| iOS | UNUserNotificationCenter + BGTaskScheduler | Future |
| macOS | NSWorkspace.shared.notificationCenter | Future |
| Windows | Task Scheduler API | Future |
| Linux | systemd timers | Future |

## Consequences

### Positive

- **Precise timing**: Sub-second accuracy for session boundaries
- **Survives app death**: Alarms persist even when app is killed
- **Battery efficient**: No polling, only wakes at exact times
- **Reliable**: OS guarantees execution at scheduled time
- **Device boot survival**: Alarms can be restored after reboot
- **No iOS throttling**: Each platform uses its native scheduling, not background fetch

### Negative

- **Platform-specific code**: Each platform needs its own implementation
- **Schedule computation in JS**: Business logic split between JS and native
- **Complexity**: More moving parts than simple polling
- **Testing difficulty**: Hard to test time-based native behavior
- **Android Doze mode**: May require special handling for exact alarms

### Neutral

- **Schedule updates**: Need to cancel and reschedule when sessions change
- **Time zone handling**: Must handle DST and time zone changes
- **Overnight sessions**: Require special handling (startTime > endTime)

## Alternatives Considered

### 1. Keep using Expo Background Fetch with shorter polling

**Rejected because:**

- iOS fundamentally throttles to ~15 min intervals
- Cannot work around OS limitations
- Polling wastes battery for no benefit

### 2. Server-side scheduling with push notifications

**Rejected because:**

- Requires internet connectivity
- Adds server dependency
- Push notifications can be delayed
- Offline-first architecture violated

### 3. UI-driven activation (start blocking when user opens app)

**Rejected because:**

- User might not open app at session start time
- Defeats purpose of scheduled blocking
- Poor user experience

### 4. Expo Task Manager with WorkManager (Android only)

**Rejected because:**

- WorkManager is for deferrable work, not exact scheduling
- Still subject to batching and delays
- iOS equivalent doesn't exist

## Implementation Notes

### Key Files

- `core/_ports_/siren.tier.ts` - Port definition
- `infra/siren-tier/android.siren-tier.ts` - Android adapter
- `android/app/src/main/java/.../BlockingScheduler.kt` - Native scheduler
- `android/app/src/main/java/.../BlockingReceiver.kt` - Alarm receiver

### Android Permissions

```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

### Related GitHub Issues

- Native: "Implement BlockingScheduler with AlarmManager" (tied-siren-blocking-overlay)
- Native: "Create BlockingReceiver for alarm callbacks" (tied-siren-blocking-overlay)
- JS: "Create SirenTier port with updateSchedule method" (TiedSiren51)
- JS: "Implement schedule computation from block sessions" (TiedSiren51)

## Related ADRs

- [Expo Background Fetch](expo-background-fetch.md) - Superseded approach
- [Foreground Service](foreground-service.md) - Keeps app alive for detection
- [Listener Pattern](../core/listener-pattern.md) - Redux listeners trigger schedule updates

## References

- [Android AlarmManager](https://developer.android.com/reference/android/app/AlarmManager)
- [Android Doze and App Standby](https://developer.android.com/training/monitoring-device-state/doze-standby)
- [iOS BGTaskScheduler](https://developer.apple.com/documentation/backgroundtasks/bgtaskscheduler)
