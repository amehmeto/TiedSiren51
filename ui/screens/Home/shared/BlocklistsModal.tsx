import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { selectAllBlocklists } from '@/core/blocklist/selectors/selectAllBlocklists'
import { selectIsStrictModeActive } from '@/core/strict-mode/selectors/selectIsStrictModeActive'
import { showToast } from '@/core/toast/toast.slice'
import { dependencies } from '@/ui/dependencies'
import {
  TiedSButton,
  TiedSButtonVariant,
} from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { T } from '@/ui/design-system/theme'
import { BlocklistRow } from '@/ui/screens/Home/shared/BlocklistRow'

type BlocklistsModalFields = {
  isVisible: boolean
  currentSelections: string[]
  onRequestClose: () => void
  setFieldValue: (field: string, value: string[]) => void
}

type BlocklistsModalProps = Readonly<BlocklistsModalFields>

export function BlocklistsModal({
  isVisible,
  currentSelections,
  onRequestClose,
  setFieldValue,
}: BlocklistsModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const blocklists = useSelector(selectAllBlocklists)
  const isStrictModeActive = useSelector((state: RootState) =>
    selectIsStrictModeActive(state, dependencies.dateProvider),
  )
  const [wasVisible, setWasVisible] = useState(isVisible)
  const [selectedIds, setSelectedIds] = useState<string[]>(currentSelections)
  const lockedBlocklistIds = isStrictModeActive ? currentSelections : []

  if (isVisible && !wasVisible) {
    setWasVisible(true)
    setSelectedIds(currentSelections)
  }
  if (!isVisible && wasVisible) setWasVisible(false)

  const saveList = () => {
    setFieldValue('blocklistIds', selectedIds)
    onRequestClose()
  }

  function toggleBlocklist(blocklistId: string, isNowSelected: boolean) {
    if (!isNowSelected && lockedBlocklistIds.includes(blocklistId)) {
      const lockedMessage = 'Cannot remove blocklist during strict mode'
      dispatch(showToast(lockedMessage))
      return
    }
    const newSelections = isNowSelected
      ? [...selectedIds, blocklistId]
      : selectedIds.filter((id) => id !== blocklistId)
    setSelectedIds(newSelections)
  }

  function navigateToEditBlocklist(blocklistId: string) {
    onRequestClose()
    router.push({
      pathname: '/(tabs)/blocklists/edit-blocklist-screen/[blocklistId]',
      params: { blocklistId },
    })
  }

  return (
    <TiedSModal
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      style={styles.modal}
    >
      {blocklists.length === 0 && (
        <Text style={styles.emptyText}>No blocklists available</Text>
      )}

      <ScrollView style={styles.list}>
        {blocklists.map((blocklist) => {
          const isSelected = selectedIds.includes(blocklist.id)
          return (
            <BlocklistRow
              key={blocklist.id}
              name={blocklist.name}
              isSelected={isSelected}
              onToggle={(isNowSelected) =>
                toggleBlocklist(blocklist.id, isNowSelected)
              }
              onNavigate={() => navigateToEditBlocklist(blocklist.id)}
            />
          )
        })}
      </ScrollView>
      <TiedSButton
        style={styles.button}
        onPress={() => {
          router.push('/(tabs)/blocklists/create-blocklist-screen')
          onRequestClose()
        }}
        text={'CREATE BLOCKLIST'}
        variant={TiedSButtonVariant.Secondary}
      />
      {blocklists.length > 0 && (
        <TiedSButton style={styles.button} onPress={saveList} text={'SAVE'} />
      )}
    </TiedSModal>
  )
}

const styles = StyleSheet.create({
  modal: {
    flexDirection: 'column',
  },
  list: {
    flexGrow: 0,
  },
  emptyText: {
    color: T.color.text,
    fontFamily: T.font.family.primary,
    fontSize: T.font.size.base,
  },
  button: {
    alignSelf: 'center',
    marginTop: T.spacing.medium,
  },
})
