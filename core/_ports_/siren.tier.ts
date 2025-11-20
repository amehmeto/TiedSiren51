import { Sirens } from '@core/siren/sirens'

export interface SirenTier {
  tie(sirens: Sirens): Promise<void>
}
