import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectBlocklistViewModel } from './blocklist.view-model'
import * as React from 'react'
import { ReactNode } from 'react'
import { BlocklistViewModel } from './blocklist-view-model.type'
import { exhaustiveGuard } from '@/app-view/exhaustive-guard'
import { TiedSLinearBackground } from '@/app-view/design-system/components/components/TiedSLinearBackground'
import { BlocklistCard } from '@/app-view/screens/Blocklists/BlocklistCard'
import { T } from '@/app-view/design-system/theme'
import { ScreenList } from '@/app-view/screen-lists/screenLists'
import { TabScreens } from '@/app-view/screen-lists/TabScreens'
import { BlocklistsStackScreens } from '@/app-view/screen-lists/BlocklistsStackScreens'

type BlockListScreenProps = {
  navigation: NativeStackNavigationProp<ScreenList, TabScreens.BLOCKLIST>
}

export function BlocklistScreen({
  navigation,
}: Readonly<BlockListScreenProps>) {
  const viewModel = useSelector<
    RootState,
    ReturnType<typeof selectBlocklistViewModel>
  >((rootState) => selectBlocklistViewModel(rootState))

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
              <BlocklistCard blocklist={blocklist} navigation={navigation} />
            )}
          />
        )
      default:
        return exhaustiveGuard(viewModel)
    }
  })()

  return (
    <TiedSLinearBackground>
      {blocklistsNode}
      <Pressable
        onPress={() =>
          navigation.navigate(BlocklistsStackScreens.CREATE_BLOCK_LIST)
        }
        style={styles.roundButton}
      >
        <Ionicons
          name={'add'}
          size={T.addButtonIconSize}
          color={T.color.white}
        />
      </Pressable>
    </TiedSLinearBackground>
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
