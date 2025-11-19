import { AndroidSiren, Sirens } from '../siren/sirens'

export interface SirensRepository {
  getSelectableSirens(): Promise<Sirens>
  addKeywordToSirens(keyword: string): Promise<void>
  addWebsiteToSirens(website: string): Promise<void>
  addAndroidSirenToSirens(androidSiren: AndroidSiren): Promise<void>
}
