import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { ReactNode } from 'react'
import { FlatList, Platform, Pressable, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { BlocklistViewModel } from '@/core/blocklist/selectors/blocklist-view-model.type'
import { selectBlocklistViewModel } from '@/core/blocklist/selectors/blocklist.view-model'
import { T } from '@/ui/design-system/theme'
import { exhaustiveGuard } from '@/ui/exhaustive-guard'
import { BlocklistCard } from '@/ui/screens/Blocklists/BlocklistCard'
import { NoBlocklistMessage } from '@/ui/screens/Blocklists/NoBlocklistMessage'

export default function BlocklistScreen() {
  const viewModel = useSelector<
    RootState,
    ReturnType<typeof selectBlocklistViewModel>
  >((rootState) => selectBlocklistViewModel(rootState))

  const router = useRouter()

  const blocklistsNode: ReactNode = (() => {
    switch (viewModel.type) {
      case BlocklistViewModel.NoBlocklist:
        return <NoBlocklistMessage message={viewModel.message} />
      case BlocklistViewModel.WithBlockLists:
        return (
          <FlatList
            data={viewModel.blocklists}
            keyExtractor={(blocklist) => blocklist.id}
            renderItem={({ item: blocklist }) => (
              <BlocklistCard blocklist={blocklist} />
            )}
          />
        )
      default:
        return exhaustiveGuard(viewModel)
    }
  })()

  return (
    <>
      {blocklistsNode}
      <Pressable
        onPress={() => {
          router.push('/(tabs)/blocklists/create-blocklist-screen')
        }}
        style={styles.roundButton}
        testID="addBlocklistButton"
      >
        <Ionicons
          name={'add'}
          size={T.addButtonIconSize}
          color={T.color.white}
        />
      </Pressable>
    </>
  )
}

const styles = StyleSheet.create({
  roundButton: {
    width: T.width.roundButton,
    height: T.width.roundButton,
    justifyContent: 'center',
    alignItems: 'center',
    padding: T.spacing.small,
    borderRadius: T.border.radius.fullRound,
    backgroundColor: T.color.darkBlue,
    position: 'absolute',
    bottom: T.spacing.large,
    right: T.spacing.large,

    ...Platform.select({
      ios: {
        shadowColor: T.color.shadow,
        shadowOffset: T.shadow.offset,
        shadowOpacity: T.shadow.opacity,
        shadowRadius: T.shadow.radius.large,
      },
      android: {
        elevation: 20,
      },
      web: {
        boxShadow: `5px 5px 10px ${T.color.shadow}`,
      },
    }),
  },
})
