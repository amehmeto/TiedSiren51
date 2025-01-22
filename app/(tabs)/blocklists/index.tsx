import { useSelector } from 'react-redux'
import React, { ReactNode } from 'react'
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { RootState } from '@/core/_redux_/createStore'
import { selectBlocklistViewModel } from '@/core/blocklist/selectors/blocklist.view-model'
import { BlocklistViewModel } from '@/core/blocklist/selectors/blocklist-view-model.type'
import { BlocklistCard } from '@/ui/screens/Blocklists/BlocklistCard'
import { exhaustiveGuard } from '@/ui/exhaustive-guard'
import { Ionicons } from '@expo/vector-icons'
import { T } from '@/ui/design-system/theme'
import { useRouter } from 'expo-router'

export default function BlocklistScreen() {
  const viewModel = useSelector<
    RootState,
    ReturnType<typeof selectBlocklistViewModel>
  >((rootState) => selectBlocklistViewModel(rootState))

  const router = useRouter()

  const blocklistsNode: ReactNode = (() => {
    switch (viewModel.type) {
      case BlocklistViewModel.NoBlocklist:
        return (
          <View>
            <Text style={styles.text}>{viewModel.message}</Text>
          </View>
        )
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
        shadowOffset: {
          width: T.shadow.offset.width,
          height: T.shadow.offset.height,
        },
        shadowOpacity: T.shadow.opacity,
        shadowRadius: T.shadow.radius,
      },
      android: {
        elevation: 20,
      },
      web: {
        boxShadow: `5px 5px 10px ${T.color.shadow}`,
      },
    }),
  },
  text: { color: 'white' },
})
