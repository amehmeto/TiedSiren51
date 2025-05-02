/* eslint-disable no-switch-statements/no-switch */
/* eslint-disable no-console */
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
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectHomeViewModel } from '@/ui/screens/Home/HomeScreen/home.view-model'
import { NoSessionBoard } from '@/ui/screens/Home/HomeScreen/NoSessionBoard'
import { SessionsBoard } from '@/ui/screens/Home/HomeScreen/SessionsBoard'
import { SessionType } from '@/ui/screens/Home/HomeScreen/SessionType'
import { exhaustiveGuard } from '@/ui/exhaustive-guard'
import { T } from '@/ui/design-system/theme'
import { useRouter } from 'expo-router'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { checkAndNotifySessionChanges } from '@/core/block-session/usecases/handle-session-status-change.usecase'
import { selectAllBlockSessions } from '@/core/block-session/selectors/selectAllBlockSessions'

// How often to update the UI clock (in milliseconds)
const UI_UPDATE_INTERVAL = 1000 // Update UI every second

// How often to check for session status changes (in milliseconds)
const SESSION_CHECK_INTERVAL = 3000 // Check session status every 3 seconds

export default function HomeScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { dateProvider } = dependencies
  const [now, setNow] = useState<Date>(dateProvider.getNow())
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Track when the last session check was performed
  const lastSessionCheckRef = useRef<number>(0)

  // Force a refresh of the view model by incrementing the refreshTrigger
  const forceRefresh = () => setRefreshTrigger((prev) => prev + 1)

  const viewModel = useSelector<
    RootState,
    ReturnType<typeof selectHomeViewModel>
  >((rootState) => selectHomeViewModel(rootState, now, dateProvider))

  // Get all block sessions for real-time notification checking
  const blockSessionState = useSelector(
    (state: RootState) => state.blockSession,
  )
  const allBlockSessions = selectAllBlockSessions(blockSessionState)

  const previousActiveSessionsRef = useRef<ViewModelBlockSession[]>([])

  // Update the time regularly to refresh the view and check session status
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update the current time
      setNow(dateProvider.getNow())

      // Check if it's time to check for session changes
      const currentTime = Date.now()
      if (currentTime - lastSessionCheckRef.current >= SESSION_CHECK_INTERVAL) {
        // Update the last check time
        lastSessionCheckRef.current = currentTime

        // Check if any sessions have just started or ended and send notifications
        checkAndNotifySessionChanges(dispatch, dateProvider, allBlockSessions)
          .then(() => {
            // Force refresh after checking for session changes
            forceRefresh()
          })
          .catch((error) => {
            console.error('Error checking session status:', error)
          })
      }
    }, UI_UPDATE_INTERVAL)

    return () => clearInterval(intervalId)
  }, [dateProvider, dispatch, allBlockSessions])

  // Track current active sessions for UI updates
  useEffect(() => {
    const currentActiveSessions =
      viewModel.activeSessions.title === SessionBoardTitle.ACTIVE_SESSIONS
        ? viewModel.activeSessions.blockSessions
        : []
    previousActiveSessionsRef.current = currentActiveSessions
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
