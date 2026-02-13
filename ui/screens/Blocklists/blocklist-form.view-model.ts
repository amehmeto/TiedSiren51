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

type SortedSirens = {
  sortedAndroidApps: SortedListItem<AndroidSiren>[]
  sortedWebsites: SortedListItem<string>[]
  sortedKeywords: SortedListItem<string>[]
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

function sortSirens(available: Sirens, selected: Sirens): SortedSirens {
  const selectedPackageNames = selected.android.map((app) => app.packageName)

  return {
    sortedAndroidApps: sortWithSelectedFirst(
      available.android,
      selectedPackageNames,
      (app) => app.packageName,
      (app) => app.appName,
    ),
    sortedWebsites: sortWithSelectedFirst(
      available.websites,
      selected.websites,
      (s) => s,
      (s) => s,
    ),
    sortedKeywords: sortWithSelectedFirst(
      available.keywords,
      selected.keywords,
      (s) => s,
      (s) => s,
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
