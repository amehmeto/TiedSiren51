import { describe, it, beforeEach, expect } from 'vitest'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { Blocklist } from '@/core/blocklist/blocklist'
import { PouchdbBlocklistRepository } from './pouchdb.blocklist.repository'
import PouchDB from 'pouchdb'
import { CreatePayload } from '@/core/ports/create.payload'

describe('PouchDBBlocklistRepository', () => {
  let blocklistRepository: PouchdbBlocklistRepository

  beforeEach(async () => {
    const db = new PouchDB('blocklists')
    await db.destroy()

    blocklistRepository = new PouchdbBlocklistRepository()
  })

  it('should create a blocklist', async () => {
    const blocklistPayload: CreatePayload<Blocklist> = buildBlocklist()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete blocklistPayload.id

    const createdBlocklist = await blocklistRepository.create(blocklistPayload)

    expect(createdBlocklist).toStrictEqual({
      id: expect.any(String),
      ...blocklistPayload,
    })
  })

  it('should find a blocklist by id', async () => {
    const blocklistPayload: CreatePayload<Blocklist> = buildBlocklist()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete blocklistPayload.id

    const createdBlocklist = await blocklistRepository.create(blocklistPayload)

    const foundBlocklist = await blocklistRepository.findById(
      createdBlocklist.id,
    )
    expect(foundBlocklist).toStrictEqual(createdBlocklist)
  })

  it('should find all current blocklists', async () => {
    const createBlocklistPayload: CreatePayload<Blocklist> = buildBlocklist()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete createBlocklistPayload.id

    await blocklistRepository.create(createBlocklistPayload)

    const createBlocklistPayload2: CreatePayload<Blocklist> = buildBlocklist()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete createBlocklistPayload2.id

    await blocklistRepository.create(createBlocklistPayload2)

    const currentBlocklists = await blocklistRepository.findAll()

    expect(currentBlocklists).toStrictEqual([])
  })

  it('should update a blocklist', async () => {
    const blocklistPayload: CreatePayload<Blocklist> = buildBlocklist()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete blocklistPayload.id

    const createdBlocklist = await blocklistRepository.create(blocklistPayload)

    const updatedBlocklist = {
      ...createdBlocklist,
      name: 'updated name',
    }

    await blocklistRepository.update(updatedBlocklist)

    const foundBlocklist = await blocklistRepository.findById(
      createdBlocklist.id,
    )

    expect(foundBlocklist).toStrictEqual(updatedBlocklist)
  })

  it('should delete a blocklist', async () => {
    const blocklistPayload: CreatePayload<Blocklist> = buildBlocklist()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete blocklistPayload.id

    const createdBlocklist = await blocklistRepository.create(blocklistPayload)

    await blocklistRepository.delete(createdBlocklist.id)

    await expect(
      blocklistRepository.findById(createdBlocklist.id),
    ).rejects.toThrow()
  })
})
