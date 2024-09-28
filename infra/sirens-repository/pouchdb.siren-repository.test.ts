import { beforeEach, describe, expect, it } from 'vitest'
import { PouchdbSirensRepository } from './pouchdb.sirens-repository'
import PouchDB from 'pouchdb'

describe('PouchDBSirenRepository', () => {
  let sirenRepository: PouchdbSirensRepository

  beforeEach(async () => {
    const db = new PouchDB('pdb-sirens')
    await db.destroy()

    sirenRepository = new PouchdbSirensRepository()
  })

  it('should init selectable sirens when empty', async () => {
    const sirens = await sirenRepository.getSelectableSirens()

    expect(sirens).toStrictEqual({
      android: [],
      ios: [],
      windows: [],
      macos: [],
      linux: [],
      websites: [],
      keywords: [],
    })
  })

  it('should add keywords to sirens', async () => {
    await sirenRepository.addKeywordToSirens('keyword')
    await sirenRepository.addKeywordToSirens('justin bieber')

    const sirens = await sirenRepository.getSelectableSirens()

    expect(sirens.keywords).toStrictEqual(['keyword', 'justin bieber'])
  })

  it('should add websites to sirens', async () => {
    await sirenRepository.addWebsiteToSirens('www.google.com')
    await sirenRepository.addWebsiteToSirens('www.facebook.com')

    const sirens = await sirenRepository.getSelectableSirens()

    expect(sirens.websites).toStrictEqual([
      'www.google.com',
      'www.facebook.com',
    ])
  })

  it('should add android apps to sirens', async () => {
    await sirenRepository.addAndroidSirenToSirens({
      packageName: 'com.youtube.android',
      appName: 'YouTube',
      icon: 'youtube.png',
    })
    await sirenRepository.addAndroidSirenToSirens({
      packageName: 'com.facebook.android',
      appName: 'Facebook',
      icon: 'facebook.png',
    })

    const sirens = await sirenRepository.getSelectableSirens()

    expect(sirens.android).toStrictEqual([
      {
        packageName: 'com.youtube.android',
        appName: 'YouTube',
        icon: 'youtube.png',
      },
      {
        packageName: 'com.facebook.android',
        appName: 'Facebook',
        icon: 'facebook.png',
      },
    ])
  })
})
