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
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'

async function notifyActiveSessionsStartAndEnd(
  viewModel: HomeViewModelType,
  previousActiveSessionsRef: React.MutableRefObject<ViewModelBlockSession[]>,
) {
  const { notificationService } = dependencies

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

  for (const session of newActiveSessions) {
    await notificationService.scheduleLocalNotification(
      'Tied Siren',
      `Session ${session.name} has started`,
      { seconds: 1 },
    )
  }
  for (const session of endedSessions) {
    await notificationService.scheduleLocalNotification(
      'Tied Siren',
      `Session ${session.name} has ended`,
      { seconds: 1 },
    )
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(dateProvider.getNow())
    }, 1_000)
    return () => clearInterval(intervalId)
  }, [dateProvider, now])

  useEffect(() => {
    notifyActiveSessionsStartAndEnd(viewModel, previousActiveSessionsRef)
  }, [viewModel])

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
    <TiedSLinearBackground>
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
    </TiedSLinearBackground>
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
