import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { Blocklist } from '@/core/blocklist/blocklist'
import { selectBlocklistById } from '@/core/blocklist/selectors/selectBlocklistById'
import { AndroidSiren } from '@/core/siren/sirens'
import { formatDuration } from '@/core/strict-mode/format-duration'
import { LockedSirens } from '@/core/strict-mode/is-siren-locked'
import { selectLockedSirensForBlocklist } from '@/core/strict-mode/selectors/selectLockedSirensForBlocklist'
import { selectStrictModeTimeLeft } from '@/core/strict-mode/selectors/selectStrictModeTimeLeft'
import {
  SortedListItem,
  sortWithSelectedFirst,
} from '@/ui/screens/Blocklists/sort-with-selected-first'

export enum FormMode {
  Create = 'create',
  Edit = 'edit',
}

export enum BlocklistFormViewState {
  Creating = 'CREATING',
  Editing = 'EDITING',
  EditingWithLockedSirens = 'EDITING_WITH_LOCKED_SIRENS',
}

const EMPTY_LOCKED_SIRENS: LockedSirens = {
  android: new Set(),
  websites: new Set(),
  keywords: new Set(),
}

type CreatingViewModel = {
  type: BlocklistFormViewState.Creating
  sortedApps: SortedListItem<AndroidSiren>[]
  sortedWebsites: SortedListItem<string>[]
  sortedKeywords: SortedListItem<string>[]
  lockedSirens: LockedSirens
}

type EditingViewModel = {
  type: BlocklistFormViewState.Editing
  existingBlocklist: Blocklist
  sortedApps: SortedListItem<AndroidSiren>[]
  sortedWebsites: SortedListItem<string>[]
  sortedKeywords: SortedListItem<string>[]
  lockedSirens: LockedSirens
}

type EditingWithLockedSirensViewModel = {
  type: BlocklistFormViewState.EditingWithLockedSirens
  existingBlocklist: Blocklist
  sortedApps: SortedListItem<AndroidSiren>[]
  sortedWebsites: SortedListItem<string>[]
  sortedKeywords: SortedListItem<string>[]
  lockedSirens: LockedSirens
  lockedToastMessage: string
}

export type BlocklistFormViewModel =
  | CreatingViewModel
  | EditingViewModel
  | EditingWithLockedSirensViewModel

const identity = (s: string) => s

function computeSortedLists(
  availableAndroid: AndroidSiren[],
  availableWebsites: string[],
  availableKeywords: string[],
  savedPackageNames: string[],
  savedWebsites: string[],
  savedKeywords: string[],
) {
  return {
    sortedApps: sortWithSelectedFirst(
      availableAndroid,
      savedPackageNames,
      (app) => app.packageName,
      (app) => app.appName,
    ),
    sortedWebsites: sortWithSelectedFirst(
      availableWebsites,
      savedWebsites,
      identity,
      identity,
    ),
    sortedKeywords: sortWithSelectedFirst(
      availableKeywords,
      savedKeywords,
      identity,
      identity,
    ),
  }
}

function hasLockedSirens(lockedSirens: LockedSirens): boolean {
  const { android, websites, keywords } = lockedSirens
  return android.size > 0 || websites.size > 0 || keywords.size > 0
}

export function selectBlocklistFormViewModel(
  state: RootState,
  dateProvider: DateProvider,
  mode: FormMode,
  blocklistId: string | undefined,
): BlocklistFormViewModel {
  const { Creating, Editing, EditingWithLockedSirens } = BlocklistFormViewState
  const { android, websites, keywords } = state.siren.availableSirens

  if (mode === FormMode.Create) {
    return {
      type: Creating,
      ...computeSortedLists(android, websites, keywords, [], [], []),
      lockedSirens: EMPTY_LOCKED_SIRENS,
    }
  }

  const existingBlocklist = selectBlocklistById(state, blocklistId)

  if (!existingBlocklist) {
    return {
      type: Creating,
      ...computeSortedLists(android, websites, keywords, [], [], []),
      lockedSirens: EMPTY_LOCKED_SIRENS,
    }
  }

  const savedPackageNames = existingBlocklist.sirens.android.map(
    (app) => app.packageName,
  )

  const sorted = computeSortedLists(
    android,
    websites,
    keywords,
    savedPackageNames,
    existingBlocklist.sirens.websites,
    existingBlocklist.sirens.keywords,
  )

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
