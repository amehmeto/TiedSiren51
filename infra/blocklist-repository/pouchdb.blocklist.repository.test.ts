import PouchDB from 'pouchdb'
import { beforeEach, describe, expect, it } from 'vitest'
import { CreatePayload } from '@/core/_ports_/create.payload'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { Blocklist } from '@/core/blocklist/blocklist'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { PouchdbBlocklistRepository } from './pouchdb.blocklist.repository'

describe('PouchDBBlocklistRepository', () => {
  let blocklistRepository: PouchdbBlocklistRepository
  const userId = 'test-user-id'

  beforeEach(async () => {
    const db = new PouchDB('pdb-blocklists')
    await db.destroy()

    const logger = new InMemoryLogger()
    blocklistRepository = new PouchdbBlocklistRepository(logger)
  })

  const buildBlocklistPayload = (): CreatePayload<Blocklist> => {
    const { id: _id, ...blocklistPayload } = buildBlocklist()
    return blocklistPayload
  }

  it('should create a blocklist', async () => {
    const blocklistPayload = buildBlocklistPayload()
    const expectedBlocklist = {
      id: expect.any(String),
      ...blocklistPayload,
    }

    const createdBlocklist = await blocklistRepository.create(
      userId,
      blocklistPayload,
    )

    expect(createdBlocklist).toStrictEqual(expectedBlocklist)
  })

  it('should find a blocklist by id', async () => {
    const blocklistPayload = buildBlocklistPayload()

    const createdBlocklist = await blocklistRepository.create(
      userId,
      blocklistPayload,
    )

    const foundBlocklist = await blocklistRepository.findById(
      userId,
      createdBlocklist.id,
    )
    expect(foundBlocklist).toStrictEqual(createdBlocklist)
  })

  it('should find all current blocklists', async () => {
    const createBlocklistPayload = buildBlocklistPayload()

    await blocklistRepository.create(userId, createBlocklistPayload)

    const createBlocklistPayload2 = buildBlocklistPayload()

    await blocklistRepository.create(userId, createBlocklistPayload2)

    const currentBlocklists = await blocklistRepository.findAll(userId)

    expect(currentBlocklists).toStrictEqual([])
  })

  it('should update a blocklist', async () => {
    const blocklistPayload = buildBlocklistPayload()

    const createdBlocklist = await blocklistRepository.create(
      userId,
      blocklistPayload,
    )

    const updatedBlocklist = {
      ...createdBlocklist,
      name: 'updated name',
    }

    await blocklistRepository.update(userId, updatedBlocklist)

    const foundBlocklist = await blocklistRepository.findById(
      userId,
      createdBlocklist.id,
    )

    expect(foundBlocklist).toStrictEqual(updatedBlocklist)
  })

  it('should delete a blocklist', async () => {
    const blocklistPayload = buildBlocklistPayload()

    const createdBlocklist = await blocklistRepository.create(
      userId,
      blocklistPayload,
    )

    await blocklistRepository.delete(userId, createdBlocklist.id)

    const promise = blocklistRepository.findById(userId, createdBlocklist.id)

    await expect(promise).rejects.toThrow()
  })
})
