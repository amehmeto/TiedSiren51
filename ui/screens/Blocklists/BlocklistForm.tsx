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
import { selectLockedBlocklistIds } from '@/core/block-session/selectors/selectLockedBlocklistIds'
import { Blocklist } from '@/core/blocklist/blocklist'
import { selectBlocklistById } from '@/core/blocklist/selectors/selectBlocklistById'
import { createBlocklist } from '@/core/blocklist/usecases/create-blocklist.usecase'
import { updateBlocklist } from '@/core/blocklist/usecases/update-blocklist.usecase'
import { AndroidSiren, Sirens, SirenType } from '@/core/siren/sirens'
import { addKeywordToSirens } from '@/core/siren/usecases/add-keyword-to-sirens.usecase'
import { addWebsiteToSirens } from '@/core/siren/usecases/add-website-to-sirens.usecase'
import { fetchAvailableSirens } from '@/core/siren/usecases/fetch-available-sirens.usecase'
import { selectIsStrictModeActive } from '@/core/strict-mode/selectors/selectIsStrictModeActive'
import { selectStrictModeTimeLeft } from '@/core/strict-mode/selectors/selectStrictModeTimeLeft'
import { showToast } from '@/core/toast/toast.slice'
import { dependencies } from '@/ui/dependencies'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'
import { ErrorMessages } from '@/ui/error-messages.type'
import { AppsSelectionScene } from '@/ui/screens/Blocklists/AppsSelectionScene'
import { ChooseBlockTabBar } from '@/ui/screens/Blocklists/ChooseBlockTabBar'
import { blocklistFormSchema } from '@/ui/screens/Blocklists/schemas/blocklist-form.schema'
import { TextInputSelectionScene } from '@/ui/screens/Blocklists/TextInputSelectionScene'
import { formatDuration } from '@/ui/screens/StrictMode/format-duration.helper'

const LOCKED_SIREN_TOAST_MESSAGE = (timeLeft: string) =>
  `Locked (${timeLeft} left)`

export enum FormMode {
  Create = 'create',
  Edit = 'edit',
}

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

  const selectableSirens: Sirens = useSelector(
    (state: RootState) => state.siren.availableSirens,
  )

  const blocklistFromState = useSelector((state: RootState) =>
    blocklistId ? selectBlocklistById(state, blocklistId) : undefined,
  )

  const isStrictModeActive = useSelector((state: RootState) =>
    selectIsStrictModeActive(state, dependencies.dateProvider),
  )

  const blocklistIdsInSessions = useSelector((state: RootState) =>
    selectLockedBlocklistIds(state, dependencies.dateProvider),
  )

  const isBlocklistInSession =
    mode === FormMode.Edit && blocklistId
      ? blocklistIdsInSessions.includes(blocklistId)
      : false

  const shouldLockSirens = isStrictModeActive && isBlocklistInSession

  const strictModeTimeLeft = useSelector((state: RootState) =>
    selectStrictModeTimeLeft(state, dependencies.dateProvider),
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

  const [errors, setErrors] = useState<ErrorMessages>({})
  const [index, setIndex] = useState(0)

  const routes: { key: BlocklistTabKey; title: string }[] = [
    { key: BlocklistTabKey.Apps, title: 'Apps' },
    { key: BlocklistTabKey.Websites, title: 'Websites' },
    { key: BlocklistTabKey.Keywords, title: 'Keywords' },
  ]

  useEffect(() => {
    dispatch(fetchAvailableSirens())
    if (mode === FormMode.Edit && blocklistFromState)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBlocklist(blocklistFromState)
  }, [mode, blocklistFromState, dispatch])

  const isSirenSelected = useCallback(
    (sirenType: SirenType, sirenId: string) => {
      if (sirenType === SirenType.ANDROID) {
        return blocklist.sirens.android
          .map((app) => app.packageName)
          .includes(sirenId)
      }
      return blocklist.sirens[sirenType].includes(sirenId)
    },
    [blocklist],
  )

  const isSirenLocked = useCallback(
    (sirenType: SirenType, sirenId: string) =>
      shouldLockSirens && isSirenSelected(sirenType, sirenId),
    [shouldLockSirens, isSirenSelected],
  )

  const showLockedSirenToast = useCallback(() => {
    const timeLeftFormatted = formatDuration(strictModeTimeLeft)
    const message = LOCKED_SIREN_TOAST_MESSAGE(timeLeftFormatted)
    dispatch(showToast(message))
  }, [dispatch, strictModeTimeLeft])

  const toggleTextSiren = useCallback(
    (sirenType: SirenType, sirenId: string) => {
      if (isSirenLocked(sirenType, sirenId)) {
        showLockedSirenToast()
        return
      }
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
    [isSirenLocked, showLockedSirenToast, setBlocklist],
  )

  const toggleAppSiren = useCallback(
    (sirenType: SirenType.ANDROID, app: AndroidSiren) => {
      if (isSirenLocked(sirenType, app.packageName)) {
        showLockedSirenToast()
        return
      }
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
    [isSirenLocked, showLockedSirenToast, setBlocklist],
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
            androidApps={selectableSirens.android}
            toggleAppSiren={toggleAppSiren}
            isSirenSelected={isSirenSelected}
            isSirenLocked={isSirenLocked}
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
            isSirenLocked={isSirenLocked}
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
            isSirenLocked={isSirenLocked}
          />
        ),
      }

      return scenes[route.key]()
    },
    [
      dispatch,
      selectableSirens,
      toggleAppSiren,
      toggleTextSiren,
      isSirenSelected,
      isSirenLocked,
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
          placeholder={blocklistFromState?.name ?? 'Blocklist name'}
          onChangeText={(text) => setBlocklist({ ...blocklist, name: text })}
          testID="addBlocklistName"
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
