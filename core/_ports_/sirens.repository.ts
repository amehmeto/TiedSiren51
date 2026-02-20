import { AndroidSiren, Sirens } from '../siren/sirens'

export interface SirensRepository {
  getSelectableSirens(userId: string): Promise<Sirens>
  addKeywordToSirens(userId: string, keyword: string): Promise<void>
  addWebsiteToSirens(userId: string, website: string): Promise<void>
  addAndroidSirenToSirens(
    userId: string,
    androidSiren: AndroidSiren,
  ): Promise<void>
  deleteAllSirens(userId: string): Promise<void>
}
