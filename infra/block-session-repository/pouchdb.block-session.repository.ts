import { BlockSession } from '@/core/block-session/block.session'
import { BlockSessionRepository } from '@/core/ports/block-session.repository'
import uuid from 'react-native-uuid'
import { UpdatePayload } from '@/core/ports/update.payload'
import { CreatePayload } from '@/core/ports/create.payload'
import PouchDB from 'pouchdb-react-native'
import PouchDBFind from 'pouchdb-find'

export class PouchdbBlockSessionRepository implements BlockSessionRepository {
  private db: PouchDB.Database<BlockSession>

  constructor() {
    AsyncStorage.getAllKeys()
      .then((keys: any) => AsyncStorage.multiGet(keys))
      .then((items: any) => console.log('all pure Items', items))
      .catch((error: any) => console.warn('error get all Items', error))
    PouchDB.plugin(PouchDBFind)
    this.db = new PouchDB('pdb-block-sessions', { adapter: 'asyncstorage' })
  }

  findAll(): Promise<BlockSession[]> {
    return Promise.resolve([])
  }

  async create(
    sessionPayload: CreatePayload<BlockSession>,
  ): Promise<BlockSession> {
    const createdId = uuid.v4().toString()
    const createdBlockSession = {
      ...sessionPayload,
      _id: createdId,
      id: createdId,
    }

    await this.db.put(createdBlockSession).catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err)
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...sessionWithoutInternalId } = createdBlockSession
    return Promise.resolve(sessionWithoutInternalId)
  }

  async delete(blockSessionId: string): Promise<void> {
    await this.db.get(blockSessionId).then(async (doc) => {
      await this.db.remove(doc._id, doc._rev)
    })
  }

  async findById(sessionId: string): Promise<BlockSession> {
    const retrievedSession = await this.db.get(sessionId)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, _rev, ...sessionWithoutInternalIds } = retrievedSession
    return Promise.resolve(sessionWithoutInternalIds)
  }

  async update(updateBlockSession: UpdatePayload<BlockSession>): Promise<void> {
    await this.db.get(updateBlockSession.id).then(async (doc) => {
      await this.db.put({
        ...doc,
        ...updateBlockSession,
        _id: updateBlockSession.id,
        _rev: doc._rev,
      })
    })
  }
}
