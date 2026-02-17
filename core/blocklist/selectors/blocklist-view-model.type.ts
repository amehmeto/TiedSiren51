export enum BlocklistViewModel {
  NoBlocklist = 'NO_BLOCKLIST',
  WithBlockLists = 'WITH_BLOCKLISTS',
}

type BlocklistSummary = {
  id: string
  name: string
  totalBlocks: string
}

type NoBlocklistView = {
  type: BlocklistViewModel.NoBlocklist
  message: string
}

type WithBlocklistsView = {
  type: BlocklistViewModel.WithBlockLists
  blocklists: BlocklistSummary[]
}

export type BlocklistViewModelType = NoBlocklistView | WithBlocklistsView
