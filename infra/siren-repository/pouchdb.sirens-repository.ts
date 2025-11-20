import PouchDB from 'pouchdb'
import { SirensRepository } from '@/core/_ports_/sirens.repository'
import { AndroidSiren, Sirens } from '@/core/siren/sirens'

export class PouchdbSirensRepository implements SirensRepository {
  private db: PouchDB.Database<Sirens>

  constructor() {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, _rev, ...sirens } = await this.db.get('sirens')
    return sirens
  }

  async getSelectableSirens(): Promise<Sirens> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, _rev, ...sirens } = await this.db.get('sirens')
    return sirens
  }

  async addKeywordToSirens(keyword: string): Promise<void> {
    await this.db.get('sirens').then(async (doc) => {
      return this.db.put({
        ...doc,
        _id: 'sirens',
        _rev: doc._rev,
        keywords: [...doc.keywords, keyword],
      })
    })
  }

  async addWebsiteToSirens(website: string): Promise<void> {
    await this.db.get('sirens').then(async (doc) => {
      return this.db.put({
        ...doc,
        _id: 'sirens',
        _rev: doc._rev,
        websites: [...doc.websites, website],
      })
    })
  }

  async addAndroidSirenToSirens(androidSiren: AndroidSiren): Promise<void> {
    await this.db.get('sirens').then(async (doc) => {
      return this.db.put({
        ...doc,
        _id: 'sirens',
        _rev: doc._rev,
        android: [...doc.android, androidSiren],
      })
    })
  }
}
