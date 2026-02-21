import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { Blocklist } from '@/core/blocklist/blocklist'
import { selectBlocklistById } from '@/core/blocklist/selectors/selectBlocklistById'
import { AndroidSiren, Sirens } from '@/core/siren/sirens'
import { formatDuration } from '@/core/strict-mode/format-duration'
import {
  EMPTY_LOCKED_SIRENS,
  LockedSirens,
} from '@/core/strict-mode/is-siren-locked'
import { selectLockedSirensForBlocklist } from '@/core/strict-mode/selectors/selectLockedSirensForBlocklist'
import { selectStrictModeTimeLeft } from '@/core/strict-mode/selectors/selectStrictModeTimeLeft'

export enum FormMode {
  Create = 'create',
  Edit = 'edit',
}

export enum BlocklistFormViewState {
  Creating = 'CREATING',
  Editing = 'EDITING',
  EditingWithLockedSirens = 'EDITING_WITH_LOCKED_SIRENS',
}

type SectionedSirenDivider = { type: 'divider'; id: string }
export type SectionedSirenEntry<T> = { type: 'siren'; siren: T }

export type SectionedSiren<T> = SectionedSirenEntry<T> | SectionedSirenDivider

type SortedSirens = {
  sortedAndroidApps: SectionedSiren<AndroidSiren>[]
  sortedWebsites: SectionedSiren<string>[]
  sortedKeywords: SectionedSiren<string>[]
}

type CommonFields = {
  existingBlocklist: Blocklist | null
  lockedSirens: LockedSirens
  lockedToastMessage: string | null
  blocklistNamePlaceholder: string
  isLoadingInstalledApps: boolean
} & SortedSirens

type CreatingViewModel = {
  type: BlocklistFormViewState.Creating
} & CommonFields

type EditingViewModel = {
  type: BlocklistFormViewState.Editing
} & CommonFields

type EditingWithLockedSirensViewModel = {
  type: BlocklistFormViewState.EditingWithLockedSirens
} & CommonFields

export type BlocklistFormViewModel =
  | CreatingViewModel
  | EditingViewModel
  | EditingWithLockedSirensViewModel

function sortSirensSelectedFirst<T>(
  sirens: T[],
  savedSelectedKeys: string[],
  getKey: (siren: T) => string,
  getName: (siren: T) => string,
): SectionedSiren<T>[] {
  const savedSet = new Set(savedSelectedKeys)

  const selectedSirens: T[] = []
  const unselectedSirens: T[] = []

  for (const siren of sirens) {
    const key = getKey(siren)
    if (savedSet.has(key)) selectedSirens.push(siren)
    else unselectedSirens.push(siren)
  }

  const compareName = (a: T, b: T) => {
    const nameA = getName(a)
    const nameB = getName(b)
    return nameA.localeCompare(nameB)
  }
  selectedSirens.sort(compareName)
  unselectedSirens.sort(compareName)

  const sectioned: SectionedSiren<T>[] = []

  if (selectedSirens.length > 0) {
    selectedSirens.forEach((siren) => sectioned.push({ type: 'siren', siren }))
    if (unselectedSirens.length > 0)
      sectioned.push({ type: 'divider', id: 'divider' })
  }

  unselectedSirens.forEach((siren) => sectioned.push({ type: 'siren', siren }))

  return sectioned
}

function sortSirens(available: Sirens, selected: Sirens): SortedSirens {
  const {
    android: selectedAndroid,
    websites: selectedWebsites,
    keywords: selectedKeywords,
  } = selected
  const {
    android: availableAndroid,
    websites: availableWebsites,
    keywords: availableKeywords,
  } = available
  const selectedPackageNames = selectedAndroid.map((app) => app.packageName)

  return {
    sortedAndroidApps: sortSirensSelectedFirst(
      availableAndroid,
      selectedPackageNames,
      (app) => app.packageName,
      (app) => app.appName,
    ),
    sortedWebsites: sortSirensSelectedFirst(
      availableWebsites,
      selectedWebsites,
      (website) => website,
      (website) => website,
    ),
    sortedKeywords: sortSirensSelectedFirst(
      availableKeywords,
      selectedKeywords,
      (keyword) => keyword,
      (keyword) => keyword,
    ),
  }
}

function hasLockedSirens(lockedSirens: LockedSirens): boolean {
  const { android, websites, keywords } = lockedSirens
  return android.size > 0 || websites.size > 0 || keywords.size > 0
}

const EMPTY_SIRENS: Sirens = {
  android: [],
  ios: [],
  windows: [],
  macos: [],
  linux: [],
  websites: [],
  keywords: [],
}

export function selectBlocklistFormViewModel(
  state: RootState,
  dateProvider: DateProvider,
  mode: FormMode,
  blocklistId: string | undefined,
): BlocklistFormViewModel {
  const { Creating, Editing, EditingWithLockedSirens } = BlocklistFormViewState
  const { availableSirens, isLoadingInstalledApps } = state.siren

  const defaultPlaceholder = 'Blocklist name'

  if (mode === FormMode.Create) {
    return {
      type: Creating,
      ...sortSirens(availableSirens, EMPTY_SIRENS),
      existingBlocklist: null,
      lockedSirens: EMPTY_LOCKED_SIRENS,
      lockedToastMessage: null,
      blocklistNamePlaceholder: defaultPlaceholder,
      isLoadingInstalledApps,
    }
  }

  const existingBlocklist = selectBlocklistById(state, blocklistId)

  if (!existingBlocklist) {
    return {
      type: Creating,
      ...sortSirens(availableSirens, EMPTY_SIRENS),
      existingBlocklist: null,
      lockedSirens: EMPTY_LOCKED_SIRENS,
      lockedToastMessage: null,
      blocklistNamePlaceholder: defaultPlaceholder,
      isLoadingInstalledApps,
    }
  }

  const sorted = sortSirens(availableSirens, existingBlocklist.sirens)
  const blocklistNamePlaceholder = existingBlocklist.name || defaultPlaceholder

  const lockedSirens = selectLockedSirensForBlocklist(
    state,
    dateProvider,
    blocklistId,
  )

  if (hasLockedSirens(lockedSirens)) {
    const timeLeft = selectStrictModeTimeLeft(state, dateProvider)
    const timeLeftFormatted = formatDuration(timeLeft)

    return {
      type: EditingWithLockedSirens,
      existingBlocklist,
      ...sorted,
      lockedSirens,
      lockedToastMessage: `Locked (${timeLeftFormatted} left)`,
      blocklistNamePlaceholder,
      isLoadingInstalledApps,
    }
  }

  return {
    type: Editing,
    existingBlocklist,
    ...sorted,
    lockedSirens: EMPTY_LOCKED_SIRENS,
    lockedToastMessage: null,
    blocklistNamePlaceholder,
    isLoadingInstalledApps,
  }
}
