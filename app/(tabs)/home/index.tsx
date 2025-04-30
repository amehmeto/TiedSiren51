/* eslint-disable no-switch-statements/no-switch */
import React, {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import { Image, StyleSheet, Text } from 'react-native'
import 'react-native-gesture-handler'
import { dependencies } from '@/ui/dependencies'
import {
  HomeViewModel,
  HomeViewModelType,
  SessionBoardTitle,
  ViewModelBlockSession,
} from '@/ui/screens/Home/HomeScreen/home-view-model.types'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectHomeViewModel } from '@/ui/screens/Home/HomeScreen/home.view-model'
import { NoSessionBoard } from '@/ui/screens/Home/HomeScreen/NoSessionBoard'
import { SessionsBoard } from '@/ui/screens/Home/HomeScreen/SessionsBoard'
import { SessionType } from '@/ui/screens/Home/HomeScreen/SessionType'
import { exhaustiveGuard } from '@/ui/exhaustive-guard'
import { T } from '@/ui/design-system/theme'
import { useRouter } from 'expo-router'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'

// Keep track of which notifications have been sent across app sessions
const sentNotifications = new Set<string>()
// For debouncing notifications
let lastNotificationTime = 0
const NOTIFICATION_COOLDOWN_MS = 5000 // 5 seconds between identical notifications

/**
 * Notifies when sessions start or end while preventing duplicate notifications
 */
async function notifyActiveSessionsStartAndEnd(
  viewModel: HomeViewModelType,
  previousActiveSessionsRef: React.MutableRefObject<ViewModelBlockSession[]>,
) {
  const { notificationService } = dependencies
  const now = Date.now()

  // Skip if notifications were sent too recently
  if (now - lastNotificationTime < NOTIFICATION_COOLDOWN_MS) {
    return
  }

  function notInPreviousActiveSessions(session: ViewModelBlockSession) {
    return !previousActiveSessions.some(
      (prevSession) => prevSession.id === session.id,
    )
  }

  function notInCurrentActivesSessions(
    activeSessions: ViewModelBlockSession[],
    session: ViewModelBlockSession,
  ) {
    return !activeSessions.some(
      (activeSession) => activeSession.id === session.id,
    )
  }

  const currentActiveSessions =
    viewModel.activeSessions.title === SessionBoardTitle.ACTIVE_SESSIONS
      ? viewModel.activeSessions.blockSessions
      : []
  const previousActiveSessions = previousActiveSessionsRef.current
  const newActiveSessions = currentActiveSessions.filter((session) =>
    notInPreviousActiveSessions(session),
  )
  const endedSessions = previousActiveSessions.filter((session) =>
    notInCurrentActivesSessions(currentActiveSessions, session),
  )

  let didSendNotification = false

  // Process new sessions
  for (const session of newActiveSessions) {
    const notificationKey = `start_${session.id}_${session.name}`
    if (!sentNotifications.has(notificationKey)) {
      await notificationService.scheduleLocalNotification(
        'Tied Siren',
        `Session ${session.name} has started`,
        { seconds: 1 },
      )
      sentNotifications.add(notificationKey)
      didSendNotification = true
    }
  }

  // Process ended sessions
  for (const session of endedSessions) {
    const notificationKey = `end_${session.id}_${session.name}`
    if (!sentNotifications.has(notificationKey)) {
      await notificationService.scheduleLocalNotification(
        'Tied Siren',
        `Session ${session.name} has ended`,
        { seconds: 1 },
      )
      sentNotifications.add(notificationKey)
      didSendNotification = true
    }
  }

  // Update timestamp if notifications were sent
  if (didSendNotification) {
    lastNotificationTime = now
  }

  previousActiveSessionsRef.current = currentActiveSessions
}

export default function HomeScreen() {
  const router = useRouter()
  const { dateProvider } = dependencies
  const [now, setNow] = useState<Date>(dateProvider.getNow())
  const viewModel = useSelector<
    RootState,
    ReturnType<typeof selectHomeViewModel>
  >((rootState) => selectHomeViewModel(rootState, now, dateProvider))

  const previousActiveSessionsRef = useRef<ViewModelBlockSession[]>([])

  // Memoize the notification function to prevent unnecessary calls
  const handleSessionNotifications = useCallback(() => {
    notifyActiveSessionsStartAndEnd(viewModel, previousActiveSessionsRef)
  }, [viewModel])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(dateProvider.getNow())
    }, 1_000)
    return () => clearInterval(intervalId)
  }, [dateProvider])

  // Only check for session changes when view model changes
  useEffect(() => {
    handleSessionNotifications()
  }, [handleSessionNotifications])

  const [activeSessionsNode, scheduledSessionsNode]: ReactNode[] = (() => {
    switch (viewModel.type) {
      case HomeViewModel.WithoutActiveNorScheduledSessions:
        return [
          <NoSessionBoard key={0} sessions={viewModel.activeSessions} />,
          <NoSessionBoard key={1} sessions={viewModel.scheduledSessions} />,
        ]
      case HomeViewModel.WithActiveWithoutScheduledSessions:
        return [
          <SessionsBoard
            key={0}
            sessions={viewModel.activeSessions}
            type={SessionType.ACTIVE}
          />,
          <NoSessionBoard key={1} sessions={viewModel.scheduledSessions} />,
        ]
      case HomeViewModel.WithoutActiveWithScheduledSessions:
        return [
          <NoSessionBoard key={0} sessions={viewModel.activeSessions} />,
          <SessionsBoard
            key={1}
            sessions={viewModel.scheduledSessions}
            type={SessionType.SCHEDULED}
          />,
        ]
      case HomeViewModel.WithActiveAndScheduledSessions:
        return [
          <SessionsBoard
            key={0}
            sessions={viewModel.activeSessions}
            type={SessionType.ACTIVE}
          />,
          <SessionsBoard
            key={1}
            sessions={viewModel.scheduledSessions}
            type={SessionType.SCHEDULED}
          />,
        ]
      default:
        return exhaustiveGuard(viewModel)
    }
  })()

  return (
    <>
      <Image
        style={styles.image}
        source={require('@/assets/tiedsirenlogo.png')}
      />
      <Text style={styles.greetings}>{viewModel.greetings}</Text>
      <Text style={styles.text}>{"Let's make it productive"}</Text>

      {activeSessionsNode}
      {scheduledSessionsNode}

      <TiedSButton
        text={'CREATE A BLOCK SESSION'}
        onPress={() => router.push('/(tabs)/home/create-block-session')}
      />
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    fontWeight: T.font.weight.bold,
    color: T.color.text,
    fontSize: T.size.small,
    marginTop: T.spacing.small,
    marginBottom: T.spacing.small,
  },
  greetings: {
    color: T.color.text,
    fontWeight: T.font.weight.bold,
    fontSize: T.size.medium,
  },
  text: { color: T.color.text, marginBottom: T.spacing.large },
  image: {
    width: T.width.tiedSirenLogo,
    height: T.width.tiedSirenLogo,
    marginBottom: T.spacing.large,
  },
})
