import { createEntityAdapter } from '@reduxjs/toolkit'
import { Sirens } from '@/core/siren/sirens'

export type Blocklist = {
  id: string
  name: string
  sirens: Sirens
}

export const blocklistAdapter = createEntityAdapter<Blocklist>()
