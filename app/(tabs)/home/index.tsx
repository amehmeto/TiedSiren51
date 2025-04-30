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

enum NotificationConfig {
  COOLDOWN_MS = 5000, // 5 seconds between notifications
  NOTIFICATION_DELAY_SECONDS = 1,
  CLOCK_UPDATE_INTERVAL_MS = 1000,
}

enum AppStrings {
  APP_NAME = 'Tied Siren',
  SESSION_STARTED = 'started',
  SESSION_ENDED = 'ended',
  CTA_TEXT = 'CREATE A BLOCK SESSION',
  MOTIVATIONAL_TEXT = "Let's make it productive",
}

enum NotificationPrefixType {
  START = 'start',
  END = 'end',
}

const sentNotifications = new Set<string>()
let lastNotificationTime = 0

const createNotificationKey = (
  prefix: NotificationPrefixType,
  session: ViewModelBlockSession,
) => {
  return `${prefix}_blockSession_${session.id}_${session.name}`
}

const isSessionInArray = (
  session: ViewModelBlockSession,
  sessionsArray: ViewModelBlockSession[],
) => sessionsArray.some((item) => item.id === session.id)

async function sendSessionNotification(
  session: ViewModelBlockSession,
  action: AppStrings.SESSION_STARTED | AppStrings.SESSION_ENDED,
  notificationService: any,
): Promise<boolean> {
  const prefix =
    action === AppStrings.SESSION_STARTED
      ? NotificationPrefixType.START
      : NotificationPrefixType.END

  const notificationKey = createNotificationKey(prefix, session)

  if (sentNotifications.has(notificationKey)) {
    return false
  }

  await notificationService.scheduleLocalNotification(
    AppStrings.APP_NAME,
    `Session ${session.name} has ${action}`,
    { seconds: NotificationConfig.NOTIFICATION_DELAY_SECONDS },
  )

  sentNotifications.add(notificationKey)
  return true
}

async function manageSessionNotifications(
  viewModel: HomeViewModelType,
  previousActiveSessionsRef: React.MutableRefObject<ViewModelBlockSession[]>,
): Promise<void> {
  const { notificationService } = dependencies
  const now = Date.now()

  if (now - lastNotificationTime < NotificationConfig.COOLDOWN_MS) {
    return
  }

  const currentActiveSessions =
    viewModel.activeSessions.title === SessionBoardTitle.ACTIVE_SESSIONS
      ? viewModel.activeSessions.blockSessions
      : []

  const previousActiveSessions = previousActiveSessionsRef.current

  const newActiveSessions = currentActiveSessions.filter(
    (session) => !isSessionInArray(session, previousActiveSessions),
  )

  const endedSessions = previousActiveSessions.filter(
    (session) => !isSessionInArray(session, currentActiveSessions),
  )

  let notificationWasSent = false

  for (const session of newActiveSessions) {
    const didSend = await sendSessionNotification(
      session,
      AppStrings.SESSION_STARTED,
      notificationService,
    )
    notificationWasSent = notificationWasSent || didSend
  }

  for (const session of endedSessions) {
    const didSend = await sendSessionNotification(
      session,
      AppStrings.SESSION_ENDED,
      notificationService,
    )
    notificationWasSent = notificationWasSent || didSend
  }

  if (notificationWasSent) {
    lastNotificationTime = now
  }

  previousActiveSessionsRef.current = currentActiveSessions
}

function renderSessionBoards(
  viewModel: HomeViewModelType,
): [ReactNode, ReactNode] {
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
}

export default function HomeScreen() {
  const router = useRouter()
  const { dateProvider } = dependencies
  const [currentTime, setCurrentTime] = useState<Date>(dateProvider.getNow())
  const previousActiveSessionsRef = useRef<ViewModelBlockSession[]>([])

  const viewModel = useSelector<
    RootState,
    ReturnType<typeof selectHomeViewModel>
  >((rootState) => selectHomeViewModel(rootState, currentTime, dateProvider))

  const handleSessionNotifications = useCallback(() => {
    manageSessionNotifications(viewModel, previousActiveSessionsRef)
  }, [viewModel])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(dateProvider.getNow())
    }, NotificationConfig.CLOCK_UPDATE_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [dateProvider])

  useEffect(() => {
    handleSessionNotifications()
  }, [handleSessionNotifications])

  const [activeSessionsNode, scheduledSessionsNode] =
    renderSessionBoards(viewModel)

  return (
    <>
      <Image
        style={styles.image}
        source={require('@/assets/tiedsirenlogo.png')}
      />
      <Text style={styles.greetings}>{viewModel.greetings}</Text>
      <Text style={styles.text}>{AppStrings.MOTIVATIONAL_TEXT}</Text>

      {activeSessionsNode}
      {scheduledSessionsNode}

      <TiedSButton
        text={AppStrings.CTA_TEXT}
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
