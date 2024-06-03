import { BlocklistRepository } from '@/core/ports/blocklist.repository'
import { Blocklist } from '@/core/blocklist/blocklist'
import {
  amazonPrimeAndroidSiren,
  facebookAndroidSiren,
  instagramAndroidSiren,
  whatsappAndroidSiren,
  youtubeAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'

export class FakeDataBlocklistRepository implements BlocklistRepository {
  blocklists: Map<string, Blocklist> = new Map(
    [
      buildBlocklist(),
      {
        id: 'blocklist-id-1',
        name: 'Social medias',
        sirens: {
          android: [instagramAndroidSiren, facebookAndroidSiren],
          ios: [],
          linux: [],
          macos: [],
          windows: [],
          websites: ['twitter.com'],
          keywords: ['cat videos'],
        },
      },
      {
        id: 'blocklist-id-2',
        name: 'Necessary evils',
        sirens: {
          android: [whatsappAndroidSiren],
          ios: [],
          linux: [],
          macos: [],
          windows: [],
          keywords: ['work'],
          websites: ['linkedin.com'],
        },
      },
      {
        id: 'blocklist-id-3',
        name: 'Streaming services',
        sirens: {
          android: [youtubeAndroidSiren, amazonPrimeAndroidSiren],
          ios: [],
          linux: [],
          macos: [],
          windows: [],
          websites: ['hulu.com'],
          keywords: ['movies', 'series'],
        },
      },
    ].map((blocklist) => [blocklist.id, blocklist]),
  )

  findAll(): Promise<Blocklist[]> {
    return Promise.resolve(Array.from(this.blocklists.values()))
  }

  create(payload: Omit<Blocklist, 'id'>): Promise<Blocklist> {
    const blocklistId = String(Math.random() * 100)
    this.blocklists.set(blocklistId, { id: blocklistId, ...payload })
    const createdBlocklist = this.blocklists.get(blocklistId)
    if (!createdBlocklist) throw new Error('Blocklist not found')
    return Promise.resolve(createdBlocklist)
  }

  update(
    payload: Partial<Blocklist> & Required<Pick<Blocklist, 'id'>>,
  ): Promise<void> {
    const blocklist = this.blocklists.get(payload.id)
    if (!blocklist) throw new Error('Blocklist not found')
    this.blocklists.set(payload.id, { ...blocklist, ...payload })
    return Promise.resolve()
  }

  findById(blocklistId: string): Promise<Blocklist> {
    const blocklist = this.blocklists.get(blocklistId)
    if (!blocklist) throw new Error('Blocklist not found')
    return Promise.resolve(blocklist)
  }

  delete(blocklistId: string): Promise<void> {
    this.blocklists.delete(blocklistId)
    return Promise.resolve()
  }
}
