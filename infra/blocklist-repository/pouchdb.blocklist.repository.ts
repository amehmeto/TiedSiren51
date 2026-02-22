import PouchDB from 'pouchdb'
import uuid from 'react-native-uuid'
import { BlocklistRepository } from '@/core/_ports_/blocklist.repository'
import { CreatePayload } from '@/core/_ports_/create.payload'
import { Logger } from '@/core/_ports_/logger'
import { UpdatePayload } from '@/core/_ports_/update.payload'
import { Blocklist } from '@/core/blocklist/blocklist'

export class PouchdbBlocklistRepository implements BlocklistRepository {
  private db: PouchDB.Database<Blocklist>

  constructor(private readonly logger: Logger) {
    this.db = new PouchDB('pdb-blocklists')
  }

  async create(
    _userId: string,
    blocklistPayload: CreatePayload<Blocklist>,
  ): Promise<Blocklist> {
    try {
      const createdId = uuid.v4().toString()
      const createdBlocklist = {
        ...blocklistPayload,
        _id: createdId,
        id: createdId,
      }

      await this.db.put(createdBlocklist)

      const { _id, ...blocklistWithoutInternalId } = createdBlocklist
      return Promise.resolve(blocklistWithoutInternalId)
    } catch (error) {
      this.logger.error(
        `[PouchdbBlocklistRepository] Failed to create: ${error}`,
      )
      throw error
    }
  }

  findAll(_userId: string): Promise<Blocklist[]> {
    return Promise.resolve([])
  }

  async findById(blocklistId: string): Promise<Blocklist> {
    try {
      const retrievedBlocklist = await this.db.get(blocklistId)
      const { _id, _rev, ...blocklistWithoutInternalIds } = retrievedBlocklist
      return Promise.resolve(blocklistWithoutInternalIds)
    } catch (error) {
      this.logger.error(
        `[PouchdbBlocklistRepository] Failed to findById: ${error}`,
      )
      throw error
    }
  }

  async update(updateBlocklist: UpdatePayload<Blocklist>): Promise<void> {
    try {
      await this.db.get(updateBlocklist.id).then(async (doc) => {
        await this.db.put({
          ...doc,
          ...updateBlocklist,
          _id: updateBlocklist.id,
          _rev: doc._rev,
        })
      })
    } catch (error) {
      this.logger.error(
        `[PouchdbBlocklistRepository] Failed to update: ${error}`,
      )
      throw error
    }
  }

  async delete(blocklistId: string): Promise<void> {
    try {
      await this.db.get(blocklistId).then(async (doc) => {
        await this.db.remove(doc._id, doc._rev)
      })
    } catch (error) {
      this.logger.error(
        `[PouchdbBlocklistRepository] Failed to delete: ${error}`,
      )
      throw error
    }
  }

  async deleteAll(_userId: string): Promise<void> {
    try {
      const allDocsResponse = await this.db.allDocs()
      for (const row of allDocsResponse.rows) {
        const doc = await this.db.get(row.id)
        await this.db.remove(doc._id, doc._rev)
      }
    } catch (error) {
      this.logger.error(
        `[PouchdbBlocklistRepository] Failed to delete all: ${error}`,
      )
      throw error
    }
  }
}
