import PouchDB from 'pouchdb'
import { beforeEach, describe, expect, it } from 'vitest'
import { PouchdbSirensRepository } from './pouchdb.sirens-repository'

describe('PouchDBSirenRepository', () => {
  let sirenRepository: PouchdbSirensRepository

  beforeEach(async () => {
    const db = new PouchDB('pdb-sirens')
    await db.destroy()

    sirenRepository = new PouchdbSirensRepository()
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

    const sirens = await sirenRepository.getSelectableSirens()

    expect(sirens).toStrictEqual(expectedSirens)
  })

  it('should add keywords to sirens', async () => {
    const expectedKeywords = ['keyword', 'justin bieber']

    await sirenRepository.addKeywordToSirens('keyword')
    await sirenRepository.addKeywordToSirens('justin bieber')
    const sirens = await sirenRepository.getSelectableSirens()

    expect(sirens.keywords).toStrictEqual(expectedKeywords)
  })

  it('should add websites to sirens', async () => {
    const expectedWebsites = ['www.google.com', 'www.facebook.com']

    await sirenRepository.addWebsiteToSirens('www.google.com')
    await sirenRepository.addWebsiteToSirens('www.facebook.com')
    const sirens = await sirenRepository.getSelectableSirens()

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

    await sirenRepository.addAndroidSirenToSirens(youtubeSiren)
    await sirenRepository.addAndroidSirenToSirens(facebookSiren)
    const sirens = await sirenRepository.getSelectableSirens()

    expect(sirens.android).toStrictEqual(expectedAndroidSirens)
  })
})
