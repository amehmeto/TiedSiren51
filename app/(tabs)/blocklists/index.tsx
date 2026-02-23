/* eslint-disable no-switch-statements/no-switch */
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { ReactNode } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import { BlocklistViewModel } from '@/core/blocklist/selectors/blocklist-view-model.type'
import { selectBlocklistViewModel } from '@/core/blocklist/selectors/blocklist.view-model'
import { TiedSFab } from '@/ui/design-system/components/shared/TiedSFab'
import { TiedSTitle } from '@/ui/design-system/components/shared/TiedSTitle'
import { T } from '@/ui/design-system/theme'
import { exhaustiveGuard } from '@/ui/exhaustive-guard'
import { BlocklistCard } from '@/ui/screens/Blocklists/BlocklistCard'
import { NoBlocklistMessage } from '@/ui/screens/Blocklists/NoBlocklistMessage'

export default function BlocklistScreen() {
  const viewModel = useSelector(selectBlocklistViewModel)

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
    <View style={styles.container}>
      <TiedSTitle text="Blocklists" />
      {blocklistsNode}
      <TiedSFab
        onPress={() => {
          router.push('/(tabs)/blocklists/create-blocklist-screen')
        }}
        icon={
          <Ionicons
            name="add"
            size={T.addButtonIconSize}
            color={T.color.text}
          />
        }
        testID="addBlocklistButton"
        accessibilityLabel="Add blocklist"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
