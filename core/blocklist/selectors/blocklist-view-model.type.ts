export enum BlocklistViewModel {
  NoBlocklist = 'NO_BLOCKLIST',
  WithBlockLists = 'WITH_BLOCKLISTS',
}

type BlocklistSummary = {
  id: string
  name: string
  totalBlocks: string
}

export type BlocklistViewModelType =
  | {
      type: BlocklistViewModel.NoBlocklist
      message: string
    }
  | {
      type: BlocklistViewModel.WithBlockLists
      blocklists: BlocklistSummary[]
    }
