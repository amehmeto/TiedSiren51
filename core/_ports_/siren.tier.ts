import { Sirens } from '@core/siren/sirens'

export interface SirenTier {
  target(sirens: Sirens): Promise<void>
  block(packageName: string): Promise<void>
}
