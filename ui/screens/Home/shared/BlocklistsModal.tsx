import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { selectAllBlocklists } from '@/core/blocklist/selectors/selectAllBlocklists'
import { selectIsStrictModeActive } from '@/core/strict-mode/selectors/selectIsStrictModeActive'
import { showToast } from '@/core/toast/toast.slice'
import { dependencies } from '@/ui/dependencies'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { T } from '@/ui/design-system/theme'

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
    <TiedSModal isVisible={isVisible} onRequestClose={onRequestClose}>
      <View style={styles.content}>
        {blocklists.length === 0 && (
          <Text style={styles.blocklistText}>No blocklists available</Text>
        )}

        <FlatList
          data={blocklists}
          keyExtractor={(blocklist) => blocklist.id}
          renderItem={({ item: blocklist }) => {
            const isBlocklistSelected = selectedIds.includes(blocklist.id)
            return (
              <View style={styles.blocklist}>
                <Pressable
                  onPress={() => navigateToEditBlocklist(blocklist.id)}
                  style={styles.blocklistNameContainer}
                >
                  <Text style={styles.blocklistLink}>{blocklist.name}</Text>
                </Pressable>
                <Switch
                  accessibilityLabel={`Toggle ${blocklist.name}`}
                  style={styles.blocklistSelector}
                  value={isBlocklistSelected}
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
  content: {
    flexShrink: 1,
  },
  blocklist: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: T.spacing.small,
  },
  blocklistNameContainer: {
    flexShrink: 1,
    flexGrow: 1,
    marginRight: T.spacing.small,
  },
  blocklistText: {
    color: T.color.text,
    fontFamily: T.font.family.primary,
    fontSize: T.font.size.base,
  },
  blocklistLink: {
    color: T.color.lightBlue,
    fontFamily: T.font.family.primary,
    fontSize: T.font.size.base,
    textDecorationLine: 'underline',
  },
  button: {
    alignSelf: 'center',
    marginTop: T.spacing.medium,
  },
  blocklistSelector: { marginLeft: T.spacing.medium },
})
