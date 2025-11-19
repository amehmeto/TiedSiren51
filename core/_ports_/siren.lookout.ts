import { Sirens } from '../siren/sirens'

export interface SirenLookout {
  watchSirens(sirens: Sirens): void
}
