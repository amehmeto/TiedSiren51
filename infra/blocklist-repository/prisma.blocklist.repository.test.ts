import { beforeEach, describe, expect, it } from 'vitest'
import { PrismaBlocklistRepository } from './prisma.blocklist.repository'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'

class TestPrismaBlocklistRepository extends PrismaBlocklistRepository {
  async reset(): Promise<void> {
    await this.baseClient.blocklist.deleteMany()
  }
}

describe('PrismaBlocklistRepository', () => {
  let repository: TestPrismaBlocklistRepository

  beforeEach(async () => {
    repository = new TestPrismaBlocklistRepository()
    await repository.initialize()
    await repository.reset()
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
      expect(foundBlocklists).toContainEqual(
        expect.objectContaining({
          id: createdBlocklist.id,
          name: createdBlocklist.name,
          sirens: createdBlocklist.sirens,
        }),
      )
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

    await expect(repository.findById(created.id)).rejects.toThrow()
  })
})
