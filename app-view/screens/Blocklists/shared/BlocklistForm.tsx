import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { AndroidSiren, Sirens, SirenType } from '@/core/siren/sirens'
import { selectBlocklistById } from '@/core/blocklist/selectors/selectBlocklistById'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Blocklist } from '@/core/blocklist/blocklist'
import { fetchAvailableSirens } from '@/core/siren/usecases/fetch-available-sirens.usecase'
import { Route, SceneMap, TabBarProps, TabView } from 'react-native-tab-view'
import { AppsSelectionScene } from './AppsSelectionScene'
import { TextInputSelectionScene } from './TextInputSelectionScene'
import { addWebsiteToSirens } from '@/core/siren/usecases/add-website-to-sirens.usecase'
import { addKeywordToSirens } from '@/core/siren/usecases/add-keyword-to-sirens.usecase'
import { Dimensions, StyleSheet, Text } from 'react-native'
import { ChooseBlockTabBar } from './ChooseBlockTabBar'
import { updateBlocklist } from '@/core/blocklist/usecases/update-blocklist.usecase'
import { createBlocklist } from '@/core/blocklist/usecases/create-blocklist.usecase'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { TiedSBlurView } from '@/app-view/design-system/components/components/TiedSBlurView'
import { TiedSLinearBackground } from '@/app-view/design-system/components/components/TiedSLinearBackground'
import { TiedSTextInput } from '@/app-view/design-system/components/components/TiedSTextInput'
import { TiedSButton } from '@/app-view/design-system/components/components/TiedSButton'
import { T } from '@/app-view/design-system/theme'
import { ScreenList } from '@/app-view/screen-lists/screenLists'
import { TabScreens } from '@/app-view/screen-lists/TabScreens'
import { BlocklistsStackScreens } from '@/app-view/screen-lists/BlocklistsStackScreens'

export type BlocklistScreenProps = {
  navigation: NativeStackNavigationProp<ScreenList, TabScreens.BLOCKLIST>
  mode: 'create' | 'edit'
  blocklistId?: string
}

export function BlocklistForm({
  navigation,
  mode,
  blocklistId,
}: Readonly<BlocklistScreenProps>) {
  const dispatch = useDispatch<AppDispatch>()
  const selectableSirens: Sirens = useSelector(
    (state: RootState) => state.siren.availableSirens,
  )
  const blocklistFromState = useSelector((state: RootState) =>
    blocklistId ? selectBlocklistById(blocklistId, state) : undefined,
  )

  const [blocklist, setBlocklist] = useState<Omit<Blocklist, 'id'> | Blocklist>(
    {
      name: '',
      sirens: {
        android: [],
        ios: [],
        windows: [],
        macos: [],
        linux: [],
        websites: [],
        keywords: [],
      },
    },
  )

  useEffect(() => {
    dispatch(fetchAvailableSirens())
    if (mode === 'edit' && blocklistFromState) setBlocklist(blocklistFromState)
  }, [mode, blocklistFromState, dispatch])

  const [index, setIndex] = useState(0)
  const routes = [
    { key: 'apps', title: 'Apps' },
    { key: 'websites', title: 'Websites' },
    { key: 'keywords', title: 'Keywords' },
  ]

  function toggleTextSiren(sirenType: keyof Sirens, sirenId: string) {
    setBlocklist((prevBlocklist) => {
      const updatedSirens = { ...prevBlocklist.sirens }

      if (
        !(sirenType === SirenType.WEBSITES || sirenType === SirenType.KEYWORDS)
      )
        return prevBlocklist

      updatedSirens[sirenType] = updatedSirens[sirenType].includes(sirenId)
        ? updatedSirens[sirenType].filter(
            (selectedSiren) => selectedSiren !== sirenId,
          )
        : [...updatedSirens[sirenType], sirenId]

      return {
        ...prevBlocklist,
        sirens: updatedSirens,
      }
    })
  }

  function toggleAppSiren(sirenType: SirenType.ANDROID, app: AndroidSiren) {
    setBlocklist((prevBlocklist) => {
      const updatedSirens = { ...prevBlocklist.sirens }

      if (sirenType !== SirenType.ANDROID) return prevBlocklist

      updatedSirens[sirenType] = updatedSirens[sirenType].includes(app)
        ? updatedSirens[sirenType].filter(
            (selectedSiren) => selectedSiren.packageName !== app.packageName,
          )
        : [...updatedSirens[sirenType], app]

      return {
        ...prevBlocklist,
        sirens: updatedSirens,
      }
    })
  }

  function isSirenSelected(sirenType: SirenType, sirenId: string) {
    if (sirenType === SirenType.ANDROID)
      return blocklist.sirens.android
        .map((app) => app.packageName)
        .includes(sirenId)
    return blocklist.sirens[sirenType].includes(sirenId)
  }

  const renderScene = SceneMap({
    apps: () => (
      <AppsSelectionScene
        data={selectableSirens.android}
        toggleAppSiren={toggleAppSiren}
        isSirenSelected={isSirenSelected}
      />
    ),
    websites: () => (
      <TextInputSelectionScene
        onSubmitEditing={(event) =>
          dispatch(addWebsiteToSirens(event.nativeEvent.text))
        }
        sirenType={SirenType.WEBSITES}
        placeholder={'Add websites...'}
        data={selectableSirens.websites}
        toggleSiren={toggleTextSiren}
        isSirenSelected={isSirenSelected}
      />
    ),
    keywords: () => (
      <TextInputSelectionScene
        onSubmitEditing={(event) =>
          dispatch(addKeywordToSirens(event.nativeEvent.text))
        }
        sirenType={SirenType.KEYWORDS}
        placeholder={'Add keywords...'}
        data={selectableSirens.keywords}
        toggleSiren={toggleTextSiren}
        isSirenSelected={isSirenSelected}
      />
    ),
  })

  return (
    <TiedSLinearBackground>
      <Text style={styles.title}>Name</Text>
      <TiedSBlurView>
        <TiedSTextInput
          placeholder={blocklistFromState?.name ?? 'Blocklist name'}
          onChangeText={(text) => setBlocklist({ ...blocklist, name: text })}
        />
      </TiedSBlurView>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        lazy={false}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={(props: TabBarProps<Route>) => (
          <ChooseBlockTabBar {...props} />
        )}
      />

      <TiedSButton
        text={'Save Blocklist'}
        onPress={async () => {
          // eslint-disable-next-line no-unused-expressions
          mode === 'edit'
            ? await dispatch(updateBlocklist(blocklist as Blocklist))
            : await dispatch(
                createBlocklist(
                  blocklist as Omit<Blocklist, 'id' | 'totalBlocks'>,
                ),
              )
          navigation.navigate(BlocklistsStackScreens.MAIN_BLOCKLIST)
        }}
      />
    </TiedSLinearBackground>
  )
}

const styles = StyleSheet.create({
  title: {
    fontWeight: T.font.weight.bold,
    color: T.color.text,
    fontFamily: T.font.family.primary,
    fontSize: T.size.small,
    marginTop: T.spacing.small,
    marginBottom: T.spacing.small,
  },
})