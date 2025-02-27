import { beforeEach, describe, expect, it } from 'vitest'
import { PrismaBlocklistRepository } from './prisma.blocklist.repository'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { extendedClient } from '@/infra/directory/myDbModule'

describe('PrismaBlocklistRepository', () => {
  let repository: PrismaBlocklistRepository

  beforeEach(async () => {
    repository = new PrismaBlocklistRepository()
    await extendedClient.blocklist.deleteMany()
  })

  it('should create a blocklist', async () => {
    const blocklistPayload = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id

    const created = await repository.create(blocklistPayload)

    expect(created).toStrictEqual({
      ...blocklistPayload,
      id: expect.any(String),
    })
  })

  it('should find a blocklist by id', async () => {
    const blocklistPayload = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id

    const created = await repository.create(blocklistPayload)
    const found = await repository.findById(created.id)
    expect(found).toStrictEqual(created)
  })

  it('should find all current blocklists', async () => {
    const currentBlocklists = await repository.findAll()
    expect(currentBlocklists).toStrictEqual([])
  })

  it('should update a blocklist', async () => {
    const blocklistPayload = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id

    const created = await repository.create(blocklistPayload)
    const updatePayload = {
      ...created,
      name: 'updated name',
    }

    await repository.update(updatePayload)
    const found = await repository.findById(created.id)
    expect(found).toStrictEqual(updatePayload)
  })

  it('should delete a blocklist', async () => {
    const blocklistPayload = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id

    const created = await repository.create(blocklistPayload)
    await repository.delete(created.id)

    await expect(repository.findById(created.id)).rejects.toThrow()
  })
})
