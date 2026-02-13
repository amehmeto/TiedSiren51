import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { Blocklist } from '@/core/blocklist/blocklist'
import { selectBlocklistById } from '@/core/blocklist/selectors/selectBlocklistById'
import { Sirens } from '@/core/siren/sirens'
import { formatDuration } from '@/core/strict-mode/format-duration'
import { LockedSirens } from '@/core/strict-mode/is-siren-locked'
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

export type SavedSelection = {
  androidPackageNames: string[]
  websites: string[]
  keywords: string[]
}

const EMPTY_SAVED_SELECTION: SavedSelection = {
  androidPackageNames: [],
  websites: [],
  keywords: [],
}

const EMPTY_LOCKED_SIRENS: LockedSirens = {
  android: new Set(),
  websites: new Set(),
  keywords: new Set(),
}

type CreatingViewModel = {
  type: BlocklistFormViewState.Creating
  availableSirens: Sirens
  savedSelection: SavedSelection
  lockedSirens: LockedSirens
}

type EditingViewModel = {
  type: BlocklistFormViewState.Editing
  availableSirens: Sirens
  existingBlocklist: Blocklist
  savedSelection: SavedSelection
  lockedSirens: LockedSirens
}

type EditingWithLockedSirensViewModel = {
  type: BlocklistFormViewState.EditingWithLockedSirens
  availableSirens: Sirens
  existingBlocklist: Blocklist
  savedSelection: SavedSelection
  lockedSirens: LockedSirens
  lockedToastMessage: string
}

export type BlocklistFormViewModel =
  | CreatingViewModel
  | EditingViewModel
  | EditingWithLockedSirensViewModel

function computeSavedSelection(blocklist: Blocklist): SavedSelection {
  return {
    androidPackageNames: blocklist.sirens.android.map((app) => app.packageName),
    websites: blocklist.sirens.websites,
    keywords: blocklist.sirens.keywords,
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
  const availableSirens = state.siren.availableSirens

  if (mode === FormMode.Create) {
    return {
      type: Creating,
      availableSirens,
      savedSelection: EMPTY_SAVED_SELECTION,
      lockedSirens: EMPTY_LOCKED_SIRENS,
    }
  }

  const existingBlocklist = selectBlocklistById(state, blocklistId)

  if (!existingBlocklist) {
    return {
      type: Creating,
      availableSirens,
      savedSelection: EMPTY_SAVED_SELECTION,
      lockedSirens: EMPTY_LOCKED_SIRENS,
    }
  }

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
      availableSirens,
      existingBlocklist,
      savedSelection: computeSavedSelection(existingBlocklist),
      lockedSirens,
      lockedToastMessage: `Locked (${timeLeftFormatted} left)`,
    }
  }

  return {
    type: Editing,
    availableSirens,
    existingBlocklist,
    savedSelection: computeSavedSelection(existingBlocklist),
    lockedSirens: EMPTY_LOCKED_SIRENS,
  }
}
