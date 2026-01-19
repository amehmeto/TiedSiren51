# Expo Notifications

Date: 2025-11-23

## Status

Accepted

## Context

TiedSiren51 needs to schedule notifications to remind users about:
- **Block session start**: Notify when a blocking session begins
- **Block session end**: Notify when blocking session completes
- **Scheduled blocking periods**: Alert users before blocking activates

Requirements:
- **Local notifications**: Schedule notifications without server
- **Cross-platform**: Android, iOS support
- **Scheduled triggers**: Time-based notification scheduling
- **Permission handling**: Request and manage notification permissions
- **Cancellation**: Cancel scheduled notifications when session ends early
- **Testability**: Abstract behind port for unit testing

Constraints:
- Must work with Expo managed workflow
- Need platform-specific permission handling
- iOS requires explicit user consent
- Android grants permissions at install time
- Web has limited notification support

## Decision

Use **Expo Notifications** API for local notification scheduling, implemented through a `NotificationService` port adapter.

### Implementation

**1. Port Definition** (`core/_ports_/notification.service.ts`):

```typescript
export interface NotificationService {
  initialize(): Promise<void>
  requestNotificationPermissions(): Promise<void>
  getNotificationToken(): Promise<string>
  sendPushNotification(message: string): Promise<void>
  scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
  ): Promise<string>
  cancelScheduledNotifications(notificationId: string): Promise<void>
}
```

**2. Expo Adapter** (`infra/notification-service/expo.notification.service.ts`):

```typescript
export class ExpoNotificationService implements NotificationService {
  async initialize(): Promise<void> {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    })
  }

  async requestNotificationPermissions(): Promise<void> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      throw new Error('Failed to get push token for push notification!')
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
  ): Promise<string> {
    if (Platform.OS === 'web') {
      return 'Local notifications are not supported on web'
    }

    await this.requestNotificationPermissions()
    return Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { data: 'goes here' },
      },
      trigger,
    })
  }

  async cancelScheduledNotifications(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
  }
}
```

**3. Usage in Domain Layer**:

```typescript
// In block-session usecase
const startNotificationId = await notificationService.scheduleLocalNotification(
  'Block Session Starting',
  `${session.name} will begin blocking`,
  { seconds: getSecondsUntil(session.startedAt) },
)

const endNotificationId = await notificationService.scheduleLocalNotification(
  'Block Session Ended',
  `${session.name} has completed`,
  { seconds: getSecondsUntil(session.endedAt) },
)

// Store notification IDs to cancel later if needed
```

**4. Notification Handler Setup**:

Controls notification behavior when app is foregrounded:

```typescript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,    // Show alert in foreground
    shouldPlaySound: false,   // No sound
    shouldSetBadge: false,    // No badge update
  }),
})
```

**5. Fake Implementation for Testing**:

```typescript
export class FakeNotificationService implements NotificationService {
  scheduledNotifications: Map<string, { title: string; body: string }> = new Map()

  async scheduleLocalNotification(title: string, body: string): Promise<string> {
    const id = Math.random().toString()
    this.scheduledNotifications.set(id, { title, body })
    return id
  }

  async cancelScheduledNotifications(notificationId: string): Promise<void> {
    this.scheduledNotifications.delete(notificationId)
  }
}
```

## Consequences

### Positive

- **No backend required**: Local notifications work offline
- **Cross-platform**: Single API for Android and iOS
- **Expo integration**: Native module handled by Expo
- **Simple scheduling**: Time-based triggers built-in
- **Permission handling**: Automatic platform-specific permission requests
- **Cancellation support**: Easy to cancel scheduled notifications
- **Port abstraction**: Core domain isolated from Expo specifics
- **Testing**: Fake implementation for unit tests
- **Configuration**: Notification behavior customizable
- **Free**: No service costs

### Negative

- **Limited features**: Basic notification capabilities only
- **No remote push**: Requires Expo's push notification service for remote
- **Platform differences**: Android auto-grants, iOS requires explicit consent
- **Web limitations**: Local notifications not supported on web
- **No grouping**: Limited notification grouping capabilities
- **Sound customization**: Limited custom sound support
- **Rich content**: Limited support for images, actions in notifications
- **Background limits**: iOS background notification limits

### Neutral

- **Expo dependency**: Tied to Expo ecosystem
- **Permission UX**: Different flows for Android vs iOS
- **Token management**: Push tokens managed separately

## Alternatives Considered

### 1. React Native Push Notification

Community library for notifications.

**Rejected because**:
- Requires native configuration (breaking Expo managed workflow)
- More complex setup
- Manual iOS/Android platform code
- Less maintained than Expo's solution

### 2. Firebase Cloud Messaging (FCM)

Google's push notification service.

**Rejected because**:
- Overkill for local notifications
- Requires server infrastructure
- More complex setup
- Only needed for remote push notifications

### 3. OneSignal

Third-party notification service.

**Rejected because**:
- Paid service
- Overkill for local notifications
- External dependency for simple use case
- Adds SDK bloat

### 4. Native APIs Directly

Use platform-specific notification APIs.

**Rejected because**:
- Requires ejecting from Expo managed workflow
- Must write platform-specific code
- Loses Expo's cross-platform abstraction
- Higher maintenance burden

## Implementation Notes

### Notification Triggers

Expo Notifications supports multiple trigger types:

```typescript
// Time-based (seconds from now)
{ seconds: 60 }

// Daily repeating
{
  hour: 9,
  minute: 0,
  repeats: true,
}

// Calendar-based
{
  channelId: 'default',
  date: new Date(2025, 0, 1, 9, 0),
}
```

### Permission Flow

**iOS**:
1. Call `requestPermissionsAsync()`
2. Native dialog prompts user
3. One-time decision (can only change in Settings)

**Android**:
1. Permissions granted at install time
2. No runtime prompt needed
3. User can revoke in system settings

### Push Notification Support

For remote push notifications (future):

```typescript
async getNotificationToken(): Promise<string> {
  await this.requestNotificationPermissions()
  const projectId = Constants.expoConfig?.extra?.eas?.projectId

  const token = await Notifications.getExpoPushTokenAsync({ projectId })
  return token.data
}
```

### Best Practices

1. **Request permissions early**: Ask when feature is first used
2. **Explain why**: Show explanation before permission prompt
3. **Handle rejection**: Gracefully handle denied permissions
4. **Store notification IDs**: Track IDs to cancel later
5. **Clean up**: Cancel notifications when sessions end early
6. **Test on device**: Notifications don't work in simulator

### Platform-Specific Considerations

**Android**:
- Notification channels (required for Android 8+)
- Auto-granted permissions
- Persistent notifications for foreground services

**iOS**:
- User must explicitly grant permission
- Limited background notification delivery
- Critical alerts require special entitlement

**Web**:
- Local notifications not supported
- Must use browser push notifications (different API)

## Related ADRs

- [Hexagonal Architecture](../hexagonal-architecture.md) - Port/adapter pattern
- [Background Task Service](expo-background-fetch.md) - For background notification triggers

## References

- [Expo Notifications API](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [iOS Notification Guidelines](https://developer.apple.com/design/human-interface-guidelines/notifications)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)
- Implementation: `infra/notification-service/expo.notification.service.ts`
