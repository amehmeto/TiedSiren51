import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { deleteBlockSession } from '@/core/block-session/usecases/delete-block-session.usecase'
import { duplicateBlockSession } from '@/core/block-session/usecases/duplicate-block-session.usecase'
import { renameBlockSession } from '@/core/block-session/usecases/rename-block-session.usecase'
import { formatDuration } from '@/core/strict-mode/format-duration'
import { selectIsStrictModeActive } from '@/core/strict-mode/selectors/selectIsStrictModeActive'
import { selectStrictModeTimeLeft } from '@/core/strict-mode/selectors/selectStrictModeTimeLeft'
import { dependencies } from '@/ui/dependencies'
import { ThreeDotMenu } from '@/ui/design-system/components/shared/ThreeDotMenu'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'
import { TextInputModal } from '@/ui/screens/Blocklists/TextInputModal'
import { RoundBlueDot } from '@/ui/screens/Home/HomeScreen/RoundBlueDot'
import { SessionType } from '@/ui/screens/Home/HomeScreen/SessionType'

type SessionCardProps = Readonly<{
  session: {
    id: string
    name: string
    minutesLeft: string
    blocklists: number
    devices: number
  }
  type: SessionType
}>

export function SessionCard({ session, type }: SessionCardProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const isStrictModeActive = useSelector((state: RootState) =>
    selectIsStrictModeActive(state, dependencies.dateProvider),
  )
  const timeLeft = useSelector((state: RootState) =>
    selectStrictModeTimeLeft(state, dependencies.dateProvider),
  )

  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false)
  const [isDuplicateModalVisible, setIsDuplicateModalVisible] = useState(false)
  const timeRemainingMessage = isStrictModeActive
    ? `Locked (${formatDuration(timeLeft)} left)`
    : undefined

  const sessionCardMenu = [
    {
      name: 'Rename',
      iconName: 'text-outline' as const,
      action: () => {
        setIsRenameModalVisible(true)
      },
    },
    {
      name: 'Edit',
      iconName: 'create-outline' as const,
      action: () => {
        router.push({
          pathname: '/(tabs)/home/edit-block-session/[sessionId]',
          params: { sessionId: session.id },
        })
      },
      isDisabled: isStrictModeActive,
      disabledMessage: timeRemainingMessage,
    },
    {
      name: 'Duplicate',
      iconName: 'copy-outline' as const,
      action: () => {
        setIsDuplicateModalVisible(true)
      },
    },
    {
      name: 'Delete',
      iconName: 'trash-outline' as const,
      action: () => {
        dispatch(deleteBlockSession(session.id))
      },
      isDisabled: isStrictModeActive,
      disabledMessage: timeRemainingMessage,
    },
  ]

  return (
    <>
      <Pressable
        onPress={() => {
          router.push({
            pathname: '/(tabs)/home/edit-block-session/[sessionId]',
            params: { sessionId: session.id },
          })
        }}
      >
        <TiedSCard>
          {type === SessionType.ACTIVE ? (
            <RoundBlueDot />
          ) : (
            <MaterialCommunityIcons
              name={'clock-outline'}
              size={T.icon.size.xSmall}
              color={T.color.lightBlue}
              style={{
                margin: T.spacing.small,
                marginRight: T.spacing.x_large,
              }}
            />
          )}
          <View>
            <Text style={styles.sessionName}>{session.name}</Text>
            <Text style={styles.minutesLeft}>{session.minutesLeft}</Text>
            <Text style={styles.devices}>
              {session.devices} device, {session.blocklists} blocklist
            </Text>
          </View>
          <ThreeDotMenu menuOptions={sessionCardMenu} style={styles.menu} />
        </TiedSCard>
      </Pressable>

      <TextInputModal
        isVisible={isRenameModalVisible}
        label={'Rename block session'}
        initialText={session.name}
        onRequestClose={() => {
          setIsRenameModalVisible(false)
        }}
        onCancel={() => {
          setIsRenameModalVisible(false)
        }}
        onSave={(inputText: string) => {
          const renameAction = renameBlockSession({
            id: session.id,
            name: inputText,
          })
          dispatch(renameAction)
          setIsRenameModalVisible(false)
        }}
      />
      <TextInputModal
        isVisible={isDuplicateModalVisible}
        label={'Choose the name of the duplicated block session'}
        initialText={`Copy of "${session.name}"`}
        onRequestClose={() => {
          setIsDuplicateModalVisible(false)
        }}
        onCancel={() => {
          setIsDuplicateModalVisible(false)
        }}
        onSave={(inputText: string) => {
          const duplicateAction = duplicateBlockSession({
            id: session.id,
            name: inputText,
          })
          dispatch(duplicateAction)
          setIsDuplicateModalVisible(false)
        }}
      />
    </>
  )
}

const styles = StyleSheet.create({
  sessionName: { color: T.color.text, fontWeight: T.font.weight.bold },
  minutesLeft: { color: T.color.lightBlue, fontWeight: T.font.weight.bold },
  devices: { color: T.color.text },
  menu: { marginLeft: 'auto', alignSelf: 'flex-start' },
})
