import { useRouter } from 'expo-router'
import React, { ReactNode, useEffect, useState } from 'react'
import { Image, StyleSheet, Text } from 'react-native'
import 'react-native-gesture-handler'
import { useSelector } from 'react-redux'
import { isAndroidSirenLookout } from '@/core/_ports_/siren.lookout'
import { RootState } from '@/core/_redux_/createStore'
import { dependencies } from '@/ui/dependencies'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { T } from '@/ui/design-system/theme'
import { useTick } from '@/ui/hooks/useTick'
import { AccessibilityPermissionCard } from '@/ui/screens/Home/HomeScreen/AccessibilityPermissionCard'
import {
  HomeViewModel,
  HomeViewModelType,
} from '@/ui/screens/Home/HomeScreen/home-view-model.types'
import { selectHomeViewModel } from '@/ui/screens/Home/HomeScreen/home.view-model'
import { NoSessionBoard } from '@/ui/screens/Home/HomeScreen/NoSessionBoard'
import { SessionsBoard } from '@/ui/screens/Home/HomeScreen/SessionsBoard'
import { SessionType } from '@/ui/screens/Home/HomeScreen/SessionType'

type SessionNodes = [ReactNode, ReactNode]

type ViewModelRenderers = {
  [K in HomeViewModel]: (
    vm: Extract<HomeViewModelType, { type: K }>,
  ) => SessionNodes
}

const viewModelRenderers: ViewModelRenderers = {
  [HomeViewModel.WithoutActiveNorScheduledSessions]: (vm) => [
    <NoSessionBoard key="active" sessions={vm.activeSessions} />,
    <NoSessionBoard key="scheduled" sessions={vm.scheduledSessions} />,
  ],
  [HomeViewModel.WithActiveWithoutScheduledSessions]: (vm) => [
    <SessionsBoard
      key="active"
      sessions={vm.activeSessions}
      type={SessionType.ACTIVE}
    />,
    <NoSessionBoard key="scheduled" sessions={vm.scheduledSessions} />,
  ],
  [HomeViewModel.WithoutActiveWithScheduledSessions]: (vm) => [
    <NoSessionBoard key="active" sessions={vm.activeSessions} />,
    <SessionsBoard
      key="scheduled"
      sessions={vm.scheduledSessions}
      type={SessionType.SCHEDULED}
    />,
  ],
  [HomeViewModel.WithActiveAndScheduledSessions]: (vm) => [
    <SessionsBoard
      key="active"
      sessions={vm.activeSessions}
      type={SessionType.ACTIVE}
    />,
    <SessionsBoard
      key="scheduled"
      sessions={vm.scheduledSessions}
      type={SessionType.SCHEDULED}
    />,
  ],
}

function renderViewModel(vm: HomeViewModelType): SessionNodes {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Type-safe at runtime due to exhaustive ViewModelRenderers type
  const renderer = viewModelRenderers[vm.type] as (
    vm: HomeViewModelType,
  ) => SessionNodes
  return renderer(vm)
}

export default function HomeScreen() {
  const router = useRouter()
  const { dateProvider, sirenLookout } = dependencies
  const [hasAccessibilityPermission, setHasAccessibilityPermission] =
    useState(true)

  // Trigger re-renders every second to update time-based displays
  useTick()

  const viewModel = useSelector<
    RootState,
    ReturnType<typeof selectHomeViewModel>
  >((rootState) =>
    selectHomeViewModel(rootState, dateProvider.getNow(), dateProvider),
  )

  useEffect(() => {
    const checkPermission = async () => {
      if (isAndroidSirenLookout(sirenLookout)) {
        const isEnabled = await sirenLookout.isEnabled()
        setHasAccessibilityPermission(isEnabled)
      } else setHasAccessibilityPermission(true)
    }

    void checkPermission()
  }, [sirenLookout])

  const [activeSessionsNode, scheduledSessionsNode] = renderViewModel(viewModel)

  return (
    <>
      <Image
        style={styles.image}
        source={require('@/assets/tiedsirenlogo.png')}
      />
      <Text style={styles.greetings}>{viewModel.greetings}</Text>
      <Text style={styles.text}>{"Let's make it productive"}</Text>

      {!hasAccessibilityPermission && isAndroidSirenLookout(sirenLookout) && (
        <AccessibilityPermissionCard sirenLookout={sirenLookout} />
      )}

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
  greetings: {
    color: T.color.text,
    fontWeight: T.font.weight.bold,
    fontSize: T.font.size.medium,
  },
  text: {
    color: T.color.text,
    marginBottom: T.spacing.large,
  },
  image: {
    width: T.width.tiedSirenLogo,
    height: T.width.tiedSirenLogo,
    marginBottom: T.spacing.large,
  },
})
