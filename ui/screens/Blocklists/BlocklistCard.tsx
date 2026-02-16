import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { BlockSession } from '@/core/block-session/block-session'
import { selectActiveSessionsUsingBlocklist } from '@/core/block-session/selectors/selectActiveSessionsUsingBlocklist'
import { deleteBlocklist } from '@/core/blocklist/usecases/delete-blocklist.usecase'
import { duplicateBlocklist } from '@/core/blocklist/usecases/duplicate-blocklist.usecase'
import { renameBlocklist } from '@/core/blocklist/usecases/rename-blocklist.usecase'
import { formatDuration } from '@/core/strict-mode/format-duration'
import { selectIsStrictModeActive } from '@/core/strict-mode/selectors/selectIsStrictModeActive'
import { selectStrictModeTimeLeft } from '@/core/strict-mode/selectors/selectStrictModeTimeLeft'
import { dependencies } from '@/ui/dependencies'
import { ThreeDotMenu } from '@/ui/design-system/components/shared/ThreeDotMenu'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'
import { BlocklistDeletionConfirmationModal } from '@/ui/screens/Blocklists/BlocklistDeletionConfirmationModal'
import { TextInputModal } from '@/ui/screens/Blocklists/TextInputModal'

type BlocklistCardSummary = {
  id: string
  name: string
  totalBlocks: string
}

type BlocklistCardProps = Readonly<{
  blocklist: BlocklistCardSummary
}>

export function BlocklistCard({ blocklist }: BlocklistCardProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const store = useStore<RootState>()

  const isStrictModeActive = useSelector((state: RootState) =>
    selectIsStrictModeActive(state, dependencies.dateProvider),
  )
  const timeLeft = useSelector((state: RootState) =>
    selectStrictModeTimeLeft(state, dependencies.dateProvider),
  )

  const [isRenameModalVisible, setRenameModalVisible] = useState(false)
  const [isDuplicateModalVisible, setIsDuplicateModalVisible] = useState(false)
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] =
    useState(false)
  const [activeSessionsForDeletion, setActiveSessionsForDeletion] = useState<
    BlockSession[]
  >([])
  const timeRemainingMessage = isStrictModeActive
    ? `Locked (${formatDuration(timeLeft)} left)`
    : undefined

  const blocklistCardMenu = [
    {
      name: 'Rename',
      iconName: 'text-outline' as const,
      action: () => {
        setRenameModalVisible(true)
      },
    },
    {
      name: 'Edit',
      iconName: 'create-outline' as const,
      action: () => {
        router.push({
          pathname: '/(tabs)/blocklists/edit-blocklist-screen/[blocklistId]',
          params: { blocklistId: blocklist.id },
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
        const activeSessions = selectActiveSessionsUsingBlocklist(
          store.getState(),
          dependencies.dateProvider,
          blocklist.id,
        )
        if (activeSessions.length > 0) {
          setActiveSessionsForDeletion(activeSessions)
          setIsDeleteConfirmationVisible(true)
        } else dispatch(deleteBlocklist(blocklist.id))
      },
      isDisabled: isStrictModeActive,
      disabledMessage: timeRemainingMessage,
    },
  ]

  return (
    <>
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/(tabs)/blocklists/edit-blocklist-screen/[blocklistId]',
            params: { blocklistId: blocklist.id },
          })
        }
      >
        <TiedSCard style={styles.container}>
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{blocklist.name}</Text>
            <Text style={styles.totalBlocks}>{blocklist.totalBlocks}</Text>
          </View>
          <ThreeDotMenu menuOptions={blocklistCardMenu} style={styles.menu} />
        </TiedSCard>
      </Pressable>

      <TextInputModal
        isVisible={isRenameModalVisible}
        label={'Rename blocklist'}
        initialText={blocklist.name}
        onRequestClose={() => {
          setRenameModalVisible(false)
        }}
        onCancel={() => {
          setRenameModalVisible(false)
        }}
        onSave={(inputText: string) => {
          dispatch(renameBlocklist({ id: blocklist.id, name: inputText }))
          setRenameModalVisible(false)
        }}
      />
      <TextInputModal
        isVisible={isDuplicateModalVisible}
        label={'Choose the name of the duplicated blocklist'}
        initialText={`Copy of "${blocklist.name}"`}
        onRequestClose={() => {
          setIsDuplicateModalVisible(false)
        }}
        onCancel={() => {
          setIsDuplicateModalVisible(false)
        }}
        onSave={(inputText: string) => {
          dispatch(duplicateBlocklist({ id: blocklist.id, name: inputText }))
          setIsDuplicateModalVisible(false)
        }}
      />
      <BlocklistDeletionConfirmationModal
        isVisible={isDeleteConfirmationVisible}
        blocklistName={blocklist.name}
        activeSessions={activeSessionsForDeletion}
        onRequestClose={() => {
          setIsDeleteConfirmationVisible(false)
        }}
        onCancel={() => {
          setIsDeleteConfirmationVisible(false)
        }}
        onConfirm={() => {
          dispatch(deleteBlocklist(blocklist.id))
          setIsDeleteConfirmationVisible(false)
        }}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: T.color.text,
    fontWeight: T.font.weight.bold,
    paddingBottom: T.spacing.extraSmall,
  },
  totalBlocks: {
    color: T.color.text,
    fontSize: T.font.size.xSmall,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  menu: {
    marginRight: T.spacing.small,
  },
})
