import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { deleteBlockSession } from '@/core/block-session/usecases/delete-block-session.usecase'
import { duplicateBlockSession } from '@/core/block-session/usecases/duplicate-block-session.usecase'
import { renameBlockSession } from '@/core/block-session/usecases/rename-block-session.usecase'
import { ThreeDotMenu } from '@/ui/design-system/components/shared/ThreeDotMenu'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'
import { TextInputModal } from '@/ui/screens/Blocklists/TextInputModal'
import { RoundBlueDot } from '@/ui/screens/Home/HomeScreen/RoundBlueDot'
import { SessionType } from '@/ui/screens/Home/HomeScreen/SessionType'

export function SessionCard(
  props: Readonly<{
    session: {
      id: string
      name: string
      minutesLeft: string
      blocklists: number
      devices: number
    }
    type: SessionType
  }>,
) {
  const dispatch = useDispatch<AppDispatch>()

  const router = useRouter()

  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false)
  const [isDuplicateModalVisible, setIsDuplicateModalVisible] = useState(false)

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
          params: { sessionId: props.session.id },
        })
      },
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
        dispatch(deleteBlockSession(props.session.id))
      },
    },
  ]

  return (
    <>
      <Pressable
        onPress={() => {
          router.push({
            pathname: '/(tabs)/home/edit-block-session/[sessionId]',
            params: { sessionId: props.session.id },
          })
        }}
      >
        <TiedSCard>
          {props.type === SessionType.ACTIVE ? (
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
            <Text style={styles.sessionName}>{props.session.name}</Text>
            <Text style={styles.minutesLeft}>{props.session.minutesLeft}</Text>
            <Text style={styles.devices}>
              {props.session.devices} device, {props.session.blocklists}{' '}
              blocklist
            </Text>
          </View>
          <ThreeDotMenu menuOptions={sessionCardMenu} style={styles.menu} />
        </TiedSCard>
      </Pressable>

      <TextInputModal
        visible={isRenameModalVisible}
        label={'Rename block session'}
        initialText={props.session.name}
        onRequestClose={() => {
          setIsRenameModalVisible(false)
        }}
        onCancel={() => {
          setIsRenameModalVisible(false)
        }}
        onSave={(inputText: string) => {
          dispatch(
            renameBlockSession({ id: props.session.id, name: inputText }),
          )
          setIsRenameModalVisible(false)
        }}
      />
      <TextInputModal
        visible={isDuplicateModalVisible}
        label={'Choose the name of the duplicated block session'}
        initialText={'Copy of "' + props.session.name + '"'}
        onRequestClose={() => {
          setIsDuplicateModalVisible(false)
        }}
        onCancel={() => {
          setIsDuplicateModalVisible(false)
        }}
        onSave={(inputText: string) => {
          dispatch(
            duplicateBlockSession({ id: props.session.id, name: inputText }),
          )
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
