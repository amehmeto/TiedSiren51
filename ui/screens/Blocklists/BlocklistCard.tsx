import { Pressable, StyleSheet, Text, View } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { renameBlocklist } from '@/core/blocklist/usecases/rename-blocklist.usecase'
import { AppDispatch } from '@/core/_redux_/createStore'
import { duplicateBlocklist } from '@/core/blocklist/usecases/duplicate-blocklist.usecase'
import { deleteBlocklist } from '@/core/blocklist/usecases/delete-blocklist.usecase'
import { TextInputModal } from '@/ui/screens/Blocklists/TextInputModal'
import { useRouter } from 'expo-router'
import { TiedSBlurView } from '@/ui/design-system/components/shared/TiedSBlurView'
import { ThreeDotMenu } from '@/ui/design-system/components/shared/ThreeDotMenu'

export function BlocklistCard(
  props: Readonly<{
    blocklist: {
      id: string
      name: string
      totalBlocks: string
    }
  }>,
) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const [isRenameModalVisible, setRenameModalVisible] = useState(false)
  const [isDuplicateModalVisible, setIsDuplicateModalVisible] = useState(false)

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
          params: { blocklistId: props.blocklist.id },
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
        dispatch(deleteBlocklist(props.blocklist.id))
      },
    },
  ]

  return (
    <>
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/(tabs)/blocklists/edit-blocklist-screen/[blocklistId]',
            params: { blocklistId: props.blocklist.id },
          })
        }
      >
        <TiedSBlurView style={styles.container}>
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{props.blocklist.name}</Text>
            <Text style={styles.totalBlocks}>
              {props.blocklist.totalBlocks}
            </Text>
          </View>
          <ThreeDotMenu menuOptions={blocklistCardMenu} />
        </TiedSBlurView>
      </Pressable>

      <TextInputModal
        visible={isRenameModalVisible}
        label={'Rename blocklist'}
        initialText={props.blocklist.name}
        onRequestClose={() => {
          setRenameModalVisible(false)
        }}
        onCancel={() => {
          setRenameModalVisible(false)
        }}
        onSave={(inputText: string) => {
          dispatch(renameBlocklist({ id: props.blocklist.id, name: inputText }))
          setRenameModalVisible(false)
        }}
      />
      <TextInputModal
        visible={isDuplicateModalVisible}
        label={'Choose the name of the duplicated blocklist'}
        initialText={'Copy of "' + props.blocklist.name + '"'}
        onRequestClose={() => {
          setIsDuplicateModalVisible(false)
        }}
        onCancel={() => {
          setIsDuplicateModalVisible(false)
        }}
        onSave={(inputText: string) => {
          dispatch(
            duplicateBlocklist({ id: props.blocklist.id, name: inputText }),
          )
          setIsDuplicateModalVisible(false)
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
    fontSize: T.size.xSmall,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
  },
})
