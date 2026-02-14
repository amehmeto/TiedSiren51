import { useRouter } from 'expo-router'
import * as React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Dimensions, StyleSheet, Text } from 'react-native'
import {
  Route,
  SceneRendererProps,
  TabBarProps,
  TabView,
} from 'react-native-tab-view'
import { useDispatch, useSelector } from 'react-redux'
import { z } from 'zod'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { Blocklist } from '@/core/blocklist/blocklist'
import { createBlocklist } from '@/core/blocklist/usecases/create-blocklist.usecase'
import { updateBlocklist } from '@/core/blocklist/usecases/update-blocklist.usecase'
import { AndroidSiren, SirenType } from '@/core/siren/sirens'
import { addKeywordToSirens } from '@/core/siren/usecases/add-keyword-to-sirens.usecase'
import { addWebsiteToSirens } from '@/core/siren/usecases/add-website-to-sirens.usecase'
import { fetchAvailableSirens } from '@/core/siren/usecases/fetch-available-sirens.usecase'
import { isSirenLocked } from '@/core/strict-mode/is-siren-locked'
import { showToast } from '@/core/toast/toast.slice'
import { dependencies } from '@/ui/dependencies'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'
import { ErrorMessages } from '@/ui/error-messages.type'
import { AppsSelectionScene } from '@/ui/screens/Blocklists/AppsSelectionScene'
import {
  FormMode,
  selectBlocklistFormViewModel,
} from '@/ui/screens/Blocklists/blocklist-form.view-model'
import { ChooseBlockTabBar } from '@/ui/screens/Blocklists/ChooseBlockTabBar'
import { blocklistFormSchema } from '@/ui/screens/Blocklists/schemas/blocklist-form.schema'
import { TextInputSelectionScene } from '@/ui/screens/Blocklists/TextInputSelectionScene'

export type BlocklistScreenProps = {
  mode: FormMode
  blocklistId?: string
}

enum BlocklistTabKey {
  Apps = 'apps',
  Websites = 'websites',
  Keywords = 'keywords',
}

export function BlocklistForm({
  mode,
  blocklistId,
}: Readonly<BlocklistScreenProps>) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const viewModel = useSelector((state: RootState) =>
    selectBlocklistFormViewModel(
      state,
      dependencies.dateProvider,
      mode,
      blocklistId,
    ),
  )

  const {
    existingBlocklist,
    lockedSirens,
    lockedToastMessage,
    blocklistNamePlaceholder,
  } = viewModel

  const [blocklist, setBlocklist] = useState<Omit<Blocklist, 'id'> | Blocklist>(
    () =>
      existingBlocklist ?? {
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

  const [errors, setErrors] = useState<ErrorMessages>({})
  const [index, setIndex] = useState(0)

  const routes: { key: BlocklistTabKey; title: string }[] = [
    { key: BlocklistTabKey.Apps, title: 'Apps' },
    { key: BlocklistTabKey.Websites, title: 'Websites' },
    { key: BlocklistTabKey.Keywords, title: 'Keywords' },
  ]

  useEffect(() => {
    dispatch(fetchAvailableSirens())
  }, [dispatch])

  const isSirenSelected = useCallback(
    (sirenType: SirenType, sirenId: string) =>
      sirenType === SirenType.ANDROID
        ? blocklist.sirens.android
            .map((app) => app.packageName)
            .includes(sirenId)
        : blocklist.sirens[sirenType].includes(sirenId),
    [blocklist],
  )

  const guardLockedSiren = useCallback(
    (sirenType: SirenType, sirenId: string): boolean => {
      if (!isSirenLocked(lockedSirens, sirenType, sirenId)) return false
      if (lockedToastMessage) dispatch(showToast(lockedToastMessage))
      return true
    },
    [lockedSirens, lockedToastMessage, dispatch],
  )

  const toggleTextSiren = useCallback(
    (sirenType: SirenType, sirenId: string) => {
      if (guardLockedSiren(sirenType, sirenId)) return
      setBlocklist((prevBlocklist) => {
        const updatedSirens = { ...prevBlocklist.sirens }
        if (
          sirenType !== SirenType.WEBSITES &&
          sirenType !== SirenType.KEYWORDS
        )
          return prevBlocklist

        updatedSirens[sirenType] = updatedSirens[sirenType].includes(sirenId)
          ? updatedSirens[sirenType].filter(
              (selectedSiren) => selectedSiren !== sirenId,
            )
          : [...updatedSirens[sirenType], sirenId]

        return { ...prevBlocklist, sirens: updatedSirens }
      })
    },
    [guardLockedSiren, setBlocklist],
  )

  const toggleAppSiren = useCallback(
    (sirenType: SirenType.ANDROID, app: AndroidSiren) => {
      if (guardLockedSiren(sirenType, app.packageName)) return
      setBlocklist((prevBlocklist) => {
        const updatedSirens = { ...prevBlocklist.sirens }

        updatedSirens[sirenType] = updatedSirens[sirenType].includes(app)
          ? updatedSirens[sirenType].filter(
              (selectedSiren) => selectedSiren.packageName !== app.packageName,
            )
          : [...updatedSirens[sirenType], app]

        return { ...prevBlocklist, sirens: updatedSirens }
      })
    },
    [guardLockedSiren, setBlocklist],
  )

  const renderScene = useCallback(
    ({
      route,
    }: SceneRendererProps & {
      route: {
        key: BlocklistTabKey
        title: string
      }
    }) => {
      const scenes: Record<BlocklistTabKey, () => React.JSX.Element> = {
        apps: () => (
          <AppsSelectionScene
            toggleAppSiren={toggleAppSiren}
            isSirenSelected={isSirenSelected}
            mode={mode}
            blocklistId={blocklistId}
          />
        ),
        websites: () => (
          <TextInputSelectionScene
            onSubmitEditing={(event) =>
              dispatch(addWebsiteToSirens(event.nativeEvent.text))
            }
            sirenType={SirenType.WEBSITES}
            placeholder={'Add websites...'}
            toggleSiren={toggleTextSiren}
            isSirenSelected={isSirenSelected}
            mode={mode}
            blocklistId={blocklistId}
          />
        ),
        keywords: () => (
          <TextInputSelectionScene
            onSubmitEditing={(event) =>
              dispatch(addKeywordToSirens(event.nativeEvent.text))
            }
            sirenType={SirenType.KEYWORDS}
            placeholder={'Add keywords...'}
            toggleSiren={toggleTextSiren}
            isSirenSelected={isSirenSelected}
            mode={mode}
            blocklistId={blocklistId}
          />
        ),
      }

      return scenes[route.key]()
    },
    [
      dispatch,
      mode,
      blocklistId,
      toggleAppSiren,
      toggleTextSiren,
      isSirenSelected,
    ],
  )

  const validateForm = useCallback(
    (submittedBlocklistForm: typeof blocklist) => {
      try {
        blocklistFormSchema.parse(submittedBlocklistForm)
        setErrors({})
        return true
      } catch (e) {
        if (e instanceof z.ZodError) {
          const validationErrors: ErrorMessages = {}
          e.errors.forEach((error) => {
            const field = error.path.join('.')
            validationErrors[field] = error.message
          })
          setErrors(validationErrors)
        }
        return false
      }
    },
    [setErrors],
  )

  const saveBlocklist = useCallback(async () => {
    if (!validateForm(blocklist)) return

    await (mode === FormMode.Edit && 'id' in blocklist
      ? dispatch(updateBlocklist(blocklist))
      : dispatch(createBlocklist(blocklist)))

    router.push('/(tabs)/blocklists')
  }, [blocklist, mode, dispatch, router, validateForm])

  const navigationState = { index, routes }
  const initialLayout = useMemo(
    () => ({ width: Dimensions.get('window').width }),
    [],
  )
  const renderTabBar = useCallback(
    (props: TabBarProps<Route>) => <ChooseBlockTabBar {...props} />,
    [],
  )

  return (
    <>
      <Text style={styles.title}>Name</Text>
      <TiedSCard>
        <TiedSTextInput
          placeholder={blocklistNamePlaceholder}
          onChangeText={(text) => setBlocklist({ ...blocklist, name: text })}
        />
      </TiedSCard>
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      <TabView
        navigationState={navigationState}
        renderScene={renderScene}
        lazy={false}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
      />
      {errors['sirens'] && (
        <Text style={styles.errorText}>{errors['sirens']}</Text>
      )}

      <TiedSButton text={'Save Blocklist'} onPress={saveBlocklist} />
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    fontWeight: T.font.weight.bold,
    color: T.color.text,
    fontFamily: T.font.family.primary,
    fontSize: T.font.size.small,
    marginTop: T.spacing.small,
    marginBottom: T.spacing.small,
  },
  errorText: {
    color: T.color.red,
    fontSize: T.font.size.small,
    fontWeight: T.font.weight.bold,
  },
})
