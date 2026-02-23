import { beforeEach, describe, expect, it } from 'vitest'
import { TEST_USER_ID } from '@/core/_tests_/test-constants'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { PrismaSirensRepository } from './prisma.sirens-repository'

const testUserId = TEST_USER_ID

describe('PrismaSirensRepository', () => {
  let repository: PrismaSirensRepository

  beforeEach(async () => {
    const logger = new InMemoryLogger()
    repository = new PrismaSirensRepository(logger)
    await repository.initialize()
  })

  it('should init selectable sirens when empty', async () => {
    const expectedSirens = {
      android: [],
      ios: [],
      windows: [],
      macos: [],
      linux: [],
      websites: [],
      keywords: [],
    }

    const sirens = await repository.getSelectableSirens(testUserId)

    expect(sirens).toStrictEqual(expectedSirens)
  })

  it('should add keywords to sirens', async () => {
    const expectedKeywords = ['keyword', 'justin bieber']

    await repository.addKeywordToSirens(testUserId, 'keyword')
    await repository.addKeywordToSirens(testUserId, 'justin bieber')
    const sirens = await repository.getSelectableSirens(testUserId)

    expect(sirens.keywords).toStrictEqual(expectedKeywords)
  })

  it('should add websites to sirens', async () => {
    const expectedWebsites = ['www.google.com', 'www.facebook.com']

    await repository.addWebsiteToSirens(testUserId, 'www.google.com')
    await repository.addWebsiteToSirens(testUserId, 'www.facebook.com')
    const sirens = await repository.getSelectableSirens(testUserId)

    expect(sirens.websites).toStrictEqual(expectedWebsites)
  })

  it('should add android apps to sirens', async () => {
    const youtubeSiren = {
      packageName: 'com.youtube.android',
      appName: 'YouTube',
      icon: 'youtube.png',
    }
    const facebookSiren = {
      packageName: 'com.facebook.android',
      appName: 'Facebook',
      icon: 'facebook.png',
    }
    const expectedAndroidSirens = [youtubeSiren, facebookSiren]

    await repository.addAndroidSirenToSirens(testUserId, youtubeSiren)
    await repository.addAndroidSirenToSirens(testUserId, facebookSiren)
    const sirens = await repository.getSelectableSirens(testUserId)

    expect(sirens.android).toStrictEqual(expectedAndroidSirens)
  })
})
