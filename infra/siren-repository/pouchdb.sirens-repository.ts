import PouchDB from 'pouchdb'
import { Logger } from '@/core/_ports_/logger'
import { SirensRepository } from '@/core/_ports_/sirens.repository'
import { AndroidSiren, Sirens } from '@/core/siren/sirens'

export class PouchdbSirensRepository implements SirensRepository {
  private db: PouchDB.Database<Sirens>

  constructor(private readonly logger: Logger) {
    this.db = new PouchDB('pdb-sirens')
    this.initSirens()
  }

  private async initSirens(): Promise<Sirens> {
    await this.db.put({
      _id: 'sirens',
      android: [],
      ios: [],
      windows: [],
      macos: [],
      linux: [],
      websites: [],
      keywords: [],
    })
    const { _id, _rev, ...sirens } = await this.db.get('sirens')
    return sirens
  }

  async getSelectableSirens(_userId: string): Promise<Sirens> {
    try {
      const { _id, _rev, ...sirens } = await this.db.get('sirens')
      return sirens
    } catch (error) {
      this.logger.error(
        `[PouchdbSirensRepository] Failed to getSelectableSirens: ${error}`,
      )
      throw error
    }
  }

  async addKeywordToSirens(_userId: string, keyword: string): Promise<void> {
    try {
      await this.db.get('sirens').then(async (doc) => {
        return this.db.put({
          ...doc,
          _id: 'sirens',
          _rev: doc._rev,
          keywords: [...doc.keywords, keyword],
        })
      })
    } catch (error) {
      this.logger.error(
        `[PouchdbSirensRepository] Failed to addKeywordToSirens: ${error}`,
      )
      throw error
    }
  }

  async addWebsiteToSirens(_userId: string, website: string): Promise<void> {
    try {
      await this.db.get('sirens').then(async (doc) => {
        return this.db.put({
          ...doc,
          _id: 'sirens',
          _rev: doc._rev,
          websites: [...doc.websites, website],
        })
      })
    } catch (error) {
      this.logger.error(
        `[PouchdbSirensRepository] Failed to addWebsiteToSirens: ${error}`,
      )
      throw error
    }
  }

  async addAndroidSirenToSirens(
    _userId: string,
    androidSiren: AndroidSiren,
  ): Promise<void> {
    try {
      await this.db.get('sirens').then(async (doc) => {
        return this.db.put({
          ...doc,
          _id: 'sirens',
          _rev: doc._rev,
          android: [...doc.android, androidSiren],
        })
      })
    } catch (error) {
      this.logger.error(
        `[PouchdbSirensRepository] Failed to addAndroidSirenToSirens: ${error}`,
      )
      throw error
    }
  }

  async deleteAllSirens(_userId: string): Promise<void> {
    try {
      const doc = await this.db.get('sirens')
      await this.db.put({
        ...doc,
        _id: 'sirens',
        _rev: doc._rev,
        android: [],
        ios: [],
        windows: [],
        macos: [],
        linux: [],
        websites: [],
        keywords: [],
      })
    } catch (error) {
      this.logger.error(
        `[PouchdbSirensRepository] Failed to deleteAllSirens: ${error}`,
      )
      throw error
    }
  }
}
