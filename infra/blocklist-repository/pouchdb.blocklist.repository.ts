import { BlocklistRepository } from '@/core/ports/blocklist.repository'
import { Blocklist } from '@/core/blocklist/blocklist'
import uuid from 'react-native-uuid'
import PouchDB from 'pouchdb'
import { UpdatePayload } from '@/core/ports/update.payload'
import { CreatePayload } from '@/core/ports/create.payload'

export class PouchdbBlocklistRepository implements BlocklistRepository {
  private db: PouchDB.Database<Blocklist>

  constructor() {
    this.db = new PouchDB('pdb-blocklists')
  }

  async create(blocklistPayload: CreatePayload<Blocklist>): Promise<Blocklist> {
    const createdId = uuid.v4().toString()
    const createdBlocklist = {
      ...blocklistPayload,
      _id: createdId,
      id: createdId,
    }

    await this.db.put(createdBlocklist).catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err)
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...blocklistWithoutInternalId } = createdBlocklist
    return Promise.resolve(blocklistWithoutInternalId)
  }

  findAll(): Promise<Blocklist[]> {
    return Promise.resolve([])
  }

  async findById(blocklistId: string): Promise<Blocklist> {
    const retrievedBlocklist = await this.db.get(blocklistId)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, _rev, ...blocklistWithoutInternalIds } = retrievedBlocklist
    return Promise.resolve(blocklistWithoutInternalIds)
  }

  async update(updateBlocklist: UpdatePayload<Blocklist>): Promise<void> {
    await this.db.get(updateBlocklist.id).then(async (doc) => {
      await this.db.put({
        ...doc,
        ...updateBlocklist,
        _id: updateBlocklist.id,
        _rev: doc._rev,
      })
    })
  }

  async delete(blocklistId: string): Promise<void> {
    await this.db.get(blocklistId).then(async (doc) => {
      await this.db.remove(doc._id, doc._rev)
    })
  }
}
