import PouchDB from 'pouchdb'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { PouchdbSirensRepository } from './pouchdb.sirens-repository'

describe('PouchDBSirenRepository', () => {
  let sirenRepository: PouchdbSirensRepository
  const userId = 'test-user-id'

  beforeEach(async () => {
    const db = new PouchDB('pdb-sirens')
    await db.destroy()

    const logger = new InMemoryLogger()
    sirenRepository = new PouchdbSirensRepository(logger)
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

    const sirens = await sirenRepository.getSelectableSirens(userId)

    expect(sirens).toStrictEqual(expectedSirens)
  })

  it('should add keywords to sirens', async () => {
    const expectedKeywords = ['keyword', 'justin bieber']

    await sirenRepository.addKeywordToSirens(userId, 'keyword')
    await sirenRepository.addKeywordToSirens(userId, 'justin bieber')
    const sirens = await sirenRepository.getSelectableSirens(userId)

    expect(sirens.keywords).toStrictEqual(expectedKeywords)
  })

  it('should add websites to sirens', async () => {
    const expectedWebsites = ['www.google.com', 'www.facebook.com']

    await sirenRepository.addWebsiteToSirens(userId, 'www.google.com')
    await sirenRepository.addWebsiteToSirens(userId, 'www.facebook.com')
    const sirens = await sirenRepository.getSelectableSirens(userId)

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

    await sirenRepository.addAndroidSirenToSirens(userId, youtubeSiren)
    await sirenRepository.addAndroidSirenToSirens(userId, facebookSiren)
    const sirens = await sirenRepository.getSelectableSirens(userId)

    expect(sirens.android).toStrictEqual(expectedAndroidSirens)
  })
})
