export enum BlocklistViewModel {
  NoBlocklist = 'NO_BLOCKLIST',
  WithBlockLists = 'WITH_BLOCKLISTS',
}

export type BlocklistViewModelType =
  | {
      type: BlocklistViewModel.NoBlocklist
      message: string
    }
  | {
      type: BlocklistViewModel.WithBlockLists
      blocklists: {
        id: string
        name: string
        totalBlocks: string
      }[]
    }
