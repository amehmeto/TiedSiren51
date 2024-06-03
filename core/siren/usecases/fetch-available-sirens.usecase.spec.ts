import { describe, it, beforeEach } from 'vitest'
import { sirensFixture } from './sirens.fixture'
import { buildInstalledApp } from '@/infra/installed-apps-repository/fake-data.installed-apps.repository'

import { YouTubeAppIcon } from '@/assets/base64AppIcon/youTubeAppIcon'

describe('Feature: Fetching available sirens', () => {
  let fixture: ReturnType<typeof sirensFixture>

  beforeEach(() => {
    fixture = sirensFixture()
  })

  it('should fetch the available sirens', async () => {
    fixture.given.installedApps([
      buildInstalledApp({
        packageName: 'com.instagram.android',
        appName: 'Instagram',
        icon: YouTubeAppIcon,
      }),
      buildInstalledApp({
        packageName: 'com.facebook.katana',
        appName: 'Facebook',
        icon: YouTubeAppIcon,
      }),
    ])
    fixture.given.existingRemoteSirens({
      websites: ['https://www.hulu.com', 'https://www.jeuxvideos.fr'],
      keywords: ['mma', 'ufc', 'boxing'],
    })

    await fixture.when.fetchingAvailableSirens()

    fixture.then.availableSirensShouldBeStoredAs({
      android: [
        {
          packageName: 'com.instagram.android',
          appName: 'Instagram',
          icon: YouTubeAppIcon,
        },
        {
          packageName: 'com.facebook.katana',
          appName: 'Facebook',
          icon: YouTubeAppIcon,
        },
      ],
      ios: [],
      linux: [],
      macos: [],
      windows: [],
      websites: ['https://www.hulu.com', 'https://www.jeuxvideos.fr'],
      keywords: ['mma', 'ufc', 'boxing'],
    })
  })
})
