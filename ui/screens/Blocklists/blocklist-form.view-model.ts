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

type SectionedSirenDivider = { type: 'divider'; id: string; label: string }

export type SectionedSiren<T> =
  | { type: 'siren'; siren: T }
  | SectionedSirenDivider

type SortedSirens = {
  sortedAndroidApps: SectionedSiren<AndroidSiren>[]
  sortedWebsites: SectionedSiren<string>[]
  sortedKeywords: SectionedSiren<string>[]
}

type CreatingViewModel = {
  type: BlocklistFormViewState.Creating
  lockedSirens: LockedSirens
} & SortedSirens

type EditingViewModel = {
  type: BlocklistFormViewState.Editing
  existingBlocklist: Blocklist
  lockedSirens: LockedSirens
} & SortedSirens

type EditingWithLockedSirensViewModel = {
  type: BlocklistFormViewState.EditingWithLockedSirens
  existingBlocklist: Blocklist
  lockedSirens: LockedSirens
  lockedToastMessage: string
} & SortedSirens

export type BlocklistFormViewModel =
  | CreatingViewModel
  | EditingViewModel
  | EditingWithLockedSirensViewModel

function sortWithSelectedFirst<T>(
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
    sectioned.push({
      type: 'divider',
      id: 'divider-selected',
      label: 'Selected',
    })
    selectedSirens.forEach((siren) => sectioned.push({ type: 'siren', siren }))
  }

  if (unselectedSirens.length > 0) {
    sectioned.push({
      type: 'divider',
      id: 'divider-available',
      label: 'Available',
    })
    unselectedSirens.forEach((siren) =>
      sectioned.push({ type: 'siren', siren }),
    )
  }

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
    sortedAndroidApps: sortWithSelectedFirst(
      availableAndroid,
      selectedPackageNames,
      (app) => app.packageName,
      (app) => app.appName,
    ),
    sortedWebsites: sortWithSelectedFirst(
      availableWebsites,
      selectedWebsites,
      (website) => website,
      (website) => website,
    ),
    sortedKeywords: sortWithSelectedFirst(
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
  const availableSirens = state.siren.availableSirens

  if (mode === FormMode.Create) {
    return {
      type: Creating,
      ...sortSirens(availableSirens, EMPTY_SIRENS),
      lockedSirens: EMPTY_LOCKED_SIRENS,
    }
  }

  const existingBlocklist = selectBlocklistById(state, blocklistId)

  if (!existingBlocklist) {
    return {
      type: Creating,
      ...sortSirens(availableSirens, EMPTY_SIRENS),
      lockedSirens: EMPTY_LOCKED_SIRENS,
    }
  }

  const sorted = sortSirens(availableSirens, existingBlocklist.sirens)

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
    }
  }

  return {
    type: Editing,
    existingBlocklist,
    ...sorted,
    lockedSirens: EMPTY_LOCKED_SIRENS,
  }
}
