import { beforeEach, describe, expect, it } from 'vitest'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { PrismaBlocklistRepository } from './prisma.blocklist.repository'

class TestPrismaBlocklistRepository extends PrismaBlocklistRepository {
  async reset(): Promise<void> {
    await this.baseClient.blocklist.deleteMany()
  }
}

describe('PrismaBlocklistRepository', () => {
  let repository: TestPrismaBlocklistRepository

  beforeEach(async () => {
    const logger = new InMemoryLogger()
    repository = new TestPrismaBlocklistRepository(logger)
    await repository.initialize()
    await repository.reset()
  })

  it('should create a blocklist', async () => {
    const blocklistPayload = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id
    const expectedBlocklist = {
      ...blocklistPayload,
      id: expect.any(String),
    }

    const created = await repository.create(blocklistPayload)

    expect(created).toStrictEqual(expectedBlocklist)
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
    const testBlocklists = [
      { name: 'Blocklist 1', sirens: buildBlocklist().sirens },
      { name: 'Blocklist 2', sirens: buildBlocklist().sirens },
      { name: 'Blocklist 3', sirens: buildBlocklist().sirens },
    ]

    const createdBlocklists = []
    for (const blocklist of testBlocklists) {
      const created = await repository.create(blocklist)
      createdBlocklists.push(created)
    }

    const foundBlocklists = await repository.findAll()

    expect(foundBlocklists).toHaveLength(createdBlocklists.length)

    for (const createdBlocklist of createdBlocklists) {
      const expectedBlocklistFields = expect.objectContaining({
        id: createdBlocklist.id,
        name: createdBlocklist.name,
        sirens: createdBlocklist.sirens,
      })
      expect(foundBlocklists).toContainEqual(expectedBlocklistFields)
    }
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

    const promise = repository.findById(created.id)

    await expect(promise).rejects.toThrow()
  })
})
