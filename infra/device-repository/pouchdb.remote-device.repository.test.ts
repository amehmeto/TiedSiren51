import PouchDB from 'pouchdb'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { PouchdbRemoteDeviceRepository } from './pouchdb.remote-device.repository'

describe('PouchDBRemoteDeviceRepository', () => {
  let deviceRepository: PouchdbRemoteDeviceRepository

  beforeEach(async () => {
    const db = new PouchDB('pdb-remote-devices')
    await db.destroy()

    const logger = new InMemoryLogger()
    deviceRepository = new PouchdbRemoteDeviceRepository(logger)
  })

  it('should find all remote devices', async () => {
    const devices = await deviceRepository.findAll()
    expect(devices).toStrictEqual([])
  })
})
