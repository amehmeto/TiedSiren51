import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { AndroidSiren, Sirens, SirenType } from '@/core/siren/sirens'
import { selectBlocklistById } from '@/core/blocklist/selectors/selectBlocklistById'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Blocklist } from '@/core/blocklist/blocklist'
import { fetchAvailableSirens } from '@/core/siren/usecases/fetch-available-sirens.usecase'
import { Route, SceneMap, TabBarProps, TabView } from 'react-native-tab-view'
import { addWebsiteToSirens } from '@/core/siren/usecases/add-website-to-sirens.usecase'
import { addKeywordToSirens } from '@/core/siren/usecases/add-keyword-to-sirens.usecase'
import { Dimensions, StyleSheet, Text } from 'react-native'
import { updateBlocklist } from '@/core/blocklist/usecases/update-blocklist.usecase'
import { createBlocklist } from '@/core/blocklist/usecases/create-blocklist.usecase'
import { T } from '@/ui/design-system/theme'
import { AppsSelectionScene } from '@/ui/screens/Blocklists/AppsSelectionScene'
import { TextInputSelectionScene } from '@/ui/screens/Blocklists/TextInputSelectionScene'
import { ChooseBlockTabBar } from '@/ui/screens/Blocklists/ChooseBlockTabBar'
import { useRouter } from 'expo-router'
import { TiedSBlurView } from '@/ui/design-system/components/shared/TiedSBlurView'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { z } from 'zod'

const blocklistSchema = z.object({
  name: z
    .string()
    .nullable()
    .refine((val) => val !== null && val.trim() !== '', {
      message: 'Blocklist name must be provided',
    }),
  sirens: z
    .object({
      // android: z.array(
      //   z.object({
      //     packageName: z.string(),
      //   }),
      // ),
      // ios: z.array(z.string()),
      // windows: z.array(z.string()),
      // macos: z.array(z.string()),
      // linux: z.array(z.string()),
      android: z.array(z.any()).optional(),
      websites: z.array(z.string()).optional(),
      keywords: z.array(z.string()).optional(),
    })
    .refine(
      (sirens) => {
        const hasSelectedApps = (sirens.android?.length ?? 0) > 0
        const hasSelectedWebsites = (sirens.websites?.length ?? 0) > 0
        const hasSelectedKeywords = (sirens.keywords?.length ?? 0) > 0

        return hasSelectedApps || hasSelectedWebsites || hasSelectedKeywords
      },
      {
        message:
          'You must select at least one of: Apps, Websites, or Keywords.',
      },
    ),
})

export type BlocklistScreenProps = {
  mode: 'create' | 'edit'
  blocklistId?: string
}

export function BlocklistForm({
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

  const router = useRouter()

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

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

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

  const validateForm = (data: typeof blocklist) => {
    try {
      blocklistSchema.parse(data)
      setErrors({})
      return true
    } catch (e) {
      if (e instanceof z.ZodError) {
        const validationErrors: { [key: string]: string } = {}
        e.errors.forEach((error) => {
          const field = error.path.join('.')
          validationErrors[field] = error.message
        })
        setErrors(validationErrors)
      }
      return false
    }
  }

  const handleSubmit = async () => {
    if (!validateForm(blocklist)) {
      return
    }

    // Proceed with form submission
    mode === 'edit'
      ? await dispatch(updateBlocklist(blocklist as Blocklist))
      : await dispatch(
          createBlocklist(blocklist as Omit<Blocklist, 'id' | 'totalBlocks'>),
        )

    router.push('/(tabs)/blocklists')
  }

  return (
    <TiedSLinearBackground>
      <Text style={styles.title}>Name</Text>
      <TiedSBlurView>
        <TiedSTextInput
          placeholder={blocklistFromState?.name ?? 'Blocklist name'}
          onChangeText={(text) => setBlocklist({ ...blocklist, name: text })}
        />
      </TiedSBlurView>
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
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
      {errors['sirens'] && (
        <Text style={styles.errorText}>{errors['sirens']}</Text>
      )}

      <TiedSButton text={'Save Blocklist'} onPress={handleSubmit} />
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
  errorText: {
    color: T.color.red,
    fontSize: T.font.size.small,
    fontWeight: T.font.weight.bold,
    // marginTop: 4,
  },
})
