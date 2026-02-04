import { useRouter } from 'expo-router'
import { useState } from 'react'
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { selectAllBlocklists } from '@/core/blocklist/selectors/selectAllBlocklists'
import { showToast } from '@/core/toast/toast.slice'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { T } from '@/ui/design-system/theme'

type BlocklistsModalProps = Readonly<{
  isVisible: boolean
  currentSelections: string[]
  onRequestClose: () => void
  setFieldValue: (field: string, value: string[]) => void
  lockedBlocklistIds?: string[]
}>

export function BlocklistsModal({
  isVisible,
  currentSelections,
  onRequestClose,
  setFieldValue,
  lockedBlocklistIds = [],
}: BlocklistsModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const items = useSelector((state: RootState) => selectAllBlocklists(state))
  const [wasVisible, setWasVisible] = useState(isVisible)
  const [selectedIds, setSelectedIds] = useState<string[]>(currentSelections)

  if (isVisible && !wasVisible) {
    setWasVisible(true)
    setSelectedIds(currentSelections)
  }
  if (!isVisible && wasVisible) setWasVisible(false)

  const saveList = () => {
    setFieldValue('blocklistIds', selectedIds)
    onRequestClose()
  }

  function toggleItem(itemId: string, isNowSelected: boolean) {
    if (!isNowSelected && lockedBlocklistIds.includes(itemId)) {
      dispatch(showToast('Cannot remove blocklist during strict mode'))
      return
    }
    const newSelections = isNowSelected
      ? [...selectedIds, itemId]
      : selectedIds.filter((id) => id !== itemId)
    setSelectedIds(newSelections)
  }

  return (
    <TiedSModal isVisible={isVisible} onRequestClose={onRequestClose}>
      <View>
        {items.length === 0 && (
          <Text style={styles.itemText}>No blocklists available</Text>
        )}

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isItemSelected = selectedIds.includes(item.id)
            const isLocked =
              isItemSelected && lockedBlocklistIds.includes(item.id)
            return (
              <View style={styles.item}>
                <Text style={styles.itemText}>{item.name}</Text>
                <Switch
                  accessibilityLabel={`Toggle ${item.name}`}
                  style={styles.itemSelector}
                  value={isItemSelected}
                  disabled={isLocked}
                  onValueChange={(isNowSelected) =>
                    toggleItem(item.id, isNowSelected)
                  }
                />
              </View>
            )
          }}
        />
        {items.length === 0 ? (
          <TiedSButton
            style={styles.button}
            onPress={() => {
              router.push('/(tabs)/blocklists/create-blocklist-screen')
              onRequestClose()
            }}
            text={'CREATE BLOCKLIST'}
          />
        ) : (
          <TiedSButton style={styles.button} onPress={saveList} text={'SAVE'} />
        )}
      </View>
    </TiedSModal>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    padding: T.spacing.small,
  },
  itemText: { color: T.color.text },
  button: {
    alignSelf: 'center',
    marginTop: T.spacing.medium,
  },
  itemSelector: { marginLeft: T.spacing.medium },
})
