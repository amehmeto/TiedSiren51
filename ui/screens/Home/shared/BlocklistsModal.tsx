import { useRouter } from 'expo-router'
import { useState } from 'react'
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { selectAllBlocklists } from '@/core/blocklist/selectors/selectAllBlocklists'
import { selectIsStrictModeActive } from '@/core/strict-mode/selectors/selectIsStrictModeActive'
import { showToast } from '@/core/toast/toast.slice'
import { dependencies } from '@/ui/dependencies'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { T } from '@/ui/design-system/theme'

type BlocklistsModalProps = Readonly<{
  isVisible: boolean
  currentSelections: string[]
  onRequestClose: () => void
  setFieldValue: (field: string, value: string[]) => void
}>

export function BlocklistsModal({
  isVisible,
  currentSelections,
  onRequestClose,
  setFieldValue,
}: BlocklistsModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const blocklists = useSelector((state: RootState) =>
    selectAllBlocklists(state),
  )
  const isStrictModeActive = useSelector((state: RootState) =>
    selectIsStrictModeActive(state, dependencies.dateProvider),
  )
  const [wasVisible, setWasVisible] = useState(isVisible)
  const [selectedIds, setSelectedIds] = useState<string[]>(currentSelections)
  const [lockedBlocklistIds, setLockedBlocklistIds] = useState<string[]>([])

  if (isVisible && !wasVisible) {
    setWasVisible(true)
    setSelectedIds(currentSelections)
    setLockedBlocklistIds(isStrictModeActive ? currentSelections : [])
  }
  if (!isVisible && wasVisible) setWasVisible(false)

  const saveList = () => {
    setFieldValue('blocklistIds', selectedIds)
    onRequestClose()
  }

  function toggleBlocklist(blocklistId: string, isNowSelected: boolean) {
    if (!isNowSelected && lockedBlocklistIds.includes(blocklistId)) {
      dispatch(showToast('Cannot remove blocklist during strict mode'))
      return
    }
    const newSelections = isNowSelected
      ? [...selectedIds, blocklistId]
      : selectedIds.filter((id) => id !== blocklistId)
    setSelectedIds(newSelections)
  }

  return (
    <TiedSModal isVisible={isVisible} onRequestClose={onRequestClose}>
      <View>
        {blocklists.length === 0 && (
          <Text style={styles.blocklistText}>No blocklists available</Text>
        )}

        <FlatList
          data={blocklists}
          keyExtractor={(blocklist) => blocklist.id}
          renderItem={({ item: blocklist }) => {
            const isBlocklistSelected = selectedIds.includes(blocklist.id)
            const isLocked =
              isBlocklistSelected && lockedBlocklistIds.includes(blocklist.id)
            return (
              <View style={styles.blocklist}>
                <Text style={styles.blocklistText}>{blocklist.name}</Text>
                <Switch
                  accessibilityLabel={`Toggle ${blocklist.name}`}
                  style={styles.blocklistSelector}
                  value={isBlocklistSelected}
                  disabled={isLocked}
                  onValueChange={(isNowSelected) =>
                    toggleBlocklist(blocklist.id, isNowSelected)
                  }
                />
              </View>
            )
          }}
        />
        {blocklists.length === 0 ? (
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
  blocklist: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    padding: T.spacing.small,
  },
  blocklistText: { color: T.color.text },
  button: {
    alignSelf: 'center',
    marginTop: T.spacing.medium,
  },
  blocklistSelector: { marginLeft: T.spacing.medium },
})
