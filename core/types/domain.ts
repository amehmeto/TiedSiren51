export interface Blocklist {
  id: string
  name: string
  sirens: string[]
}

export interface BlockSession {
  id: string
  blockStartTime: Date
  blockEndTime: Date
  blocklistId: string
}

export interface Sirens {
  availableSirens: string[]
  selectedSiren: string | null
}

export interface InitialData {
  blocklists: Blocklist[]
  blockSessions: BlockSession[]
  sirens: Sirens
}
