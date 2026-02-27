import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { ReactNode } from 'react'
import { FlatList, Platform, Pressable, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import { BlocklistViewModel } from '@/core/blocklist/selectors/blocklist-view-model.type'
import { selectBlocklistViewModel } from '@/core/blocklist/selectors/blocklist.view-model'
import { TiedSTitle } from '@/ui/design-system/components/shared/TiedSTitle'
import { T } from '@/ui/design-system/theme'
import { BlocklistCard } from '@/ui/screens/Blocklists/BlocklistCard'
import { NoBlocklistMessage } from '@/ui/screens/Blocklists/NoBlocklistMessage'

export default function BlocklistScreen() {
  const viewModel = useSelector(selectBlocklistViewModel)

  const router = useRouter()

  const blocklistsNode: ReactNode = (() => {
    if (viewModel.type === BlocklistViewModel.NoBlocklist)
      return <NoBlocklistMessage message={viewModel.message} />

    return (
      <FlatList
        data={viewModel.blocklists}
        keyExtractor={(blocklist) => blocklist.id}
        renderItem={({ item: blocklist }) => (
          <BlocklistCard blocklist={blocklist} />
        )}
      />
    )
  })()

  return (
    <View style={styles.container}>
      <TiedSTitle text="Blocklists" />
      {blocklistsNode}
      <Pressable
        onPress={() => {
          router.push('/(tabs)/blocklists/create-blocklist-screen')
        }}
        style={styles.roundButton}
        testID="addBlocklistButton"
        accessibilityRole="button"
        accessibilityLabel="Add blocklist"
      >
        <Ionicons
          name={'add'}
          size={T.addButtonIconSize}
          color={T.color.darkBlue}
        />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  roundButton: {
    width: T.width.roundButton,
    height: T.width.roundButton,
    justifyContent: 'center',
    alignItems: 'center',
    padding: T.spacing.small,
    borderRadius: T.border.radius.fullRound,
    backgroundColor: T.color.lightBlue,
    position: 'absolute',
    bottom: T.spacing.large,
    right: T.spacing.large,

    ...Platform.select({
      ios: {
        shadowColor: T.color.shadow,
        shadowOffset: T.shadow.offsets.medium,
        shadowOpacity: T.shadow.opacity,
        shadowRadius: T.shadow.radius.large,
      },
      android: {
        elevation: T.elevation.highest,
      },
      web: {
        boxShadow: `5px 5px 10px ${T.color.shadow}`,
      },
    }),
  },
})
