import PouchDB from 'pouchdb'
import uuid from 'react-native-uuid'
import { BlockSessionRepository } from '@/core/_ports_/block-session.repository'
import { CreatePayload } from '@/core/_ports_/create.payload'
import { Logger } from '@/core/_ports_/logger'
import { UpdatePayload } from '@/core/_ports_/update.payload'
import { BlockSession } from '@/core/block-session/block-session'

export class PouchdbBlockSessionRepository implements BlockSessionRepository {
  private db: PouchDB.Database<BlockSession>

  constructor(private readonly logger: Logger) {
    this.db = new PouchDB('pdb-block-sessions')
  }

  async findAll(_userId: string): Promise<BlockSession[]> {
    try {
      const allDocsResponse = await this.db.allDocs({ include_docs: true })
      return allDocsResponse.rows
        .filter((row) => row.doc)
        .map((row) => {
          const { _id, _rev, ...sessionWithoutInternalIds } = row.doc!
          return sessionWithoutInternalIds
        })
    } catch (error) {
      this.logger.error(
        `[PouchdbBlockSessionRepository] Failed to find all block sessions: ${error}`,
      )
      throw error
    }
  }

  async create(
    _userId: string,
    sessionPayload: CreatePayload<BlockSession>,
  ): Promise<BlockSession> {
    try {
      const createdId = uuid.v4().toString()
      const createdBlockSession = {
        ...sessionPayload,
        _id: createdId,
        id: createdId,
      }

      await this.db.put(createdBlockSession)

      const { _id, ...sessionWithoutInternalId } = createdBlockSession
      return sessionWithoutInternalId
    } catch (error) {
      this.logger.error(
        `[PouchdbBlockSessionRepository] Failed to create block session: ${error}`,
      )
      throw error
    }
  }

  async delete(blockSessionId: string): Promise<void> {
    try {
      const doc = await this.db.get(blockSessionId)
      await this.db.remove(doc._id, doc._rev)
    } catch (error) {
      this.logger.error(
        `[PouchdbBlockSessionRepository] Failed to delete block session ${blockSessionId}: ${error}`,
      )
      throw error
    }
  }

  async findById(sessionId: string): Promise<BlockSession> {
    try {
      const retrievedSession = await this.db.get(sessionId)
      const { _id, _rev, ...sessionWithoutInternalIds } = retrievedSession
      return sessionWithoutInternalIds
    } catch (error) {
      this.logger.error(
        `[PouchdbBlockSessionRepository] Failed to find block session ${sessionId}: ${error}`,
      )
      throw error
    }
  }

  async update(updateBlockSession: UpdatePayload<BlockSession>): Promise<void> {
    try {
      const doc = await this.db.get(updateBlockSession.id)
      await this.db.put({
        ...doc,
        ...updateBlockSession,
        _id: updateBlockSession.id,
        _rev: doc._rev,
      })
    } catch (error) {
      this.logger.error(
        `[PouchdbBlockSessionRepository] Failed to update block session ${updateBlockSession.id}: ${error}`,
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
        `[PouchdbBlockSessionRepository] Failed to delete all block sessions: ${error}`,
      )
      throw error
    }
  }
}
