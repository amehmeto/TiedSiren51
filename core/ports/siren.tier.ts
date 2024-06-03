import { Sirens } from '../siren/sirens'

export interface SirenTier {
  tie(sirens: Sirens): Promise<void>
}
