/* eslint-disable no-switch-statements/no-switch */
import React, { ReactNode, useEffect, useRef, useState } from 'react'
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

// A map to track notifications sent to avoid duplicates
// We store this outside the component to persist across renders
const notifiedSessionsMap = new Map<string, { start: boolean; end: boolean }>()

/**
 * Sends real-time notifications for session status changes but avoids duplicates
 * by tracking which notifications have already been sent
 */
async function handleSessionStatusChanges(
  viewModel: HomeViewModelType,
  previousActiveSessionsRef: React.MutableRefObject<ViewModelBlockSession[]>,
  forceRefresh: () => void,
) {
  const { notificationService } = dependencies

  // Get current active sessions
  const currentActiveSessions =
    viewModel.activeSessions.title === SessionBoardTitle.ACTIVE_SESSIONS
      ? viewModel.activeSessions.blockSessions
      : []

  // Get previous active sessions
  const previousActiveSessions = previousActiveSessionsRef.current

  // Find sessions that just became active (weren't active before)
  const newlyActiveSessions = currentActiveSessions.filter(
    (currentSession) =>
      !previousActiveSessions.some(
        (prevSession) => prevSession.id === currentSession.id,
      ),
  )

  // Find sessions that just ended (were active before but aren't now)
  const justEndedSessions = previousActiveSessions.filter(
    (prevSession) =>
      !currentActiveSessions.some(
        (currentSession) => currentSession.id === prevSession.id,
      ),
  )

  // Send notifications for newly active sessions
  for (const session of newlyActiveSessions) {
    // Check if we've already sent a start notification for this session
    const sessionStatus = notifiedSessionsMap.get(session.id) || {
      start: false,
      end: false,
    }

    if (!sessionStatus.start) {
      await notificationService.scheduleLocalNotification(
        'Tied Siren',
        `Session "${session.name}" has started`,
        { seconds: 1 },
      )

      // Mark this session as having received a start notification
      notifiedSessionsMap.set(session.id, { ...sessionStatus, start: true })
    }
  }

  // Send notifications for ended sessions
  for (const session of justEndedSessions) {
    // Check if we've already sent an end notification for this session
    const sessionStatus = notifiedSessionsMap.get(session.id) || {
      start: false,
      end: false,
    }

    if (!sessionStatus.end) {
      await notificationService.scheduleLocalNotification(
        'Tied Siren',
        `Session "${session.name}" has ended`,
        { seconds: 1 },
      )

      // Mark this session as having received an end notification
      notifiedSessionsMap.set(session.id, { ...sessionStatus, end: true })
    }
  }

  // Force UI refresh to ensure correct session placement in UI
  if (newlyActiveSessions.length > 0 || justEndedSessions.length > 0) {
    forceRefresh()
  }

  // Update reference to current active sessions for next check
  previousActiveSessionsRef.current = currentActiveSessions
}

export default function HomeScreen() {
  const router = useRouter()
  const { dateProvider } = dependencies
  const [now, setNow] = useState<Date>(dateProvider.getNow())
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Force a refresh of the view model by incrementing the refreshTrigger
  const forceRefresh = () => setRefreshTrigger((prev) => prev + 1)

  const viewModel = useSelector<
    RootState,
    ReturnType<typeof selectHomeViewModel>
  >((rootState) => selectHomeViewModel(rootState, now, dateProvider))

  const previousActiveSessionsRef = useRef<ViewModelBlockSession[]>([])

  // Update the time every second to refresh the view
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(dateProvider.getNow())
    }, 1_000)
    return () => clearInterval(intervalId)
  }, [dateProvider])

  // Check for session status changes and send notifications
  useEffect(() => {
    handleSessionStatusChanges(
      viewModel,
      previousActiveSessionsRef,
      forceRefresh,
    )
  }, [viewModel, refreshTrigger])

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
