/* eslint-disable no-switch-statements/no-switch */
import React, { ReactNode, useEffect, useState } from 'react'
import { Image, StyleSheet, Text } from 'react-native'
import 'react-native-gesture-handler'
import { dependencies } from '@/ui/dependencies'
import { HomeViewModel } from '@/ui/screens/Home/HomeScreen/home-view-model.types'
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

export default function HomeScreen() {
  const router = useRouter()
  const { dateProvider } = dependencies
  const [now, setNow] = useState<Date>(dateProvider.getNow())
  const viewModel = useSelector<
    RootState,
    ReturnType<typeof selectHomeViewModel>
  >((rootState) => selectHomeViewModel(rootState, now, dateProvider))

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(dateProvider.getNow())
    }, 1_000)
    return () => clearInterval(intervalId)
  }, [dateProvider, now])

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
