import { beforeEach, describe, expect, it } from 'vitest'
import { initialDataFixture } from '@/core/auth/initialData.fixture'
import { AndroidSiren, Sirens } from '@/core/siren/sirens'
import { BlockingConditions } from '@/core/block-session/block.session'

describe.skip('Feature: Load Initial Data', () => {
  let fixture: ReturnType<typeof initialDataFixture>

  beforeEach(() => {
    fixture = initialDataFixture()
  })

  it.skip('should load all initial data successfully', async () => {
    const mockAndroidSiren: AndroidSiren = {
      packageName: 'com.example.app',
      appName: 'Example App',
      icon: 'app_icon',
    }

    const mockSirens: Sirens = {
      android: [mockAndroidSiren],
      windows: ['notepad.exe'],
      macos: ['Safari.app'],
      ios: ['com.apple.mobilesafari'],
      linux: ['firefox'],
      websites: ['facebook.com'],
      keywords: ['social media'],
    }

    // Setup mock data
    fixture.given.blocklists([
      { id: 'blocklist-1', name: 'Blocklist 1', sirens: mockSirens },
      { id: 'blocklist-2', name: 'Blocklist 2', sirens: mockSirens },
    ])

    fixture.given.blockSessions([
      {
        id: 'session-1',
        name: 'Morning Block',
        blocklists: [],
        devices: [],
        startedAt: '2024-03-20T10:00:00Z',
        endedAt: '2024-03-20T11:00:00Z',
        startNotificationId: 'start-1',
        endNotificationId: 'end-1',
        blockingConditions: [BlockingConditions.TIME],
      },
      {
        id: 'session-2',
        name: 'Afternoon Block',
        blocklists: [],
        devices: [],
        startedAt: '2024-03-20T14:00:00Z',
        endedAt: '2024-03-20T15:00:00Z',
        startNotificationId: 'start-2',
        endNotificationId: 'end-2',
        blockingConditions: [BlockingConditions.TIME],
      },
    ])

    fixture.given.sirens(mockSirens)

    // Perform the action
    await fixture.when.loadInitialData()

    // Verify the results
    fixture.then.initialDataShouldBeLoaded({
      blocklists: [
        { id: 'blocklist-1', name: 'Blocklist 1', sirens: mockSirens },
        { id: 'blocklist-2', name: 'Blocklist 2', sirens: mockSirens },
      ],
      blockSessions: [
        {
          id: 'session-1',
          name: 'Morning Block',
          blocklists: [],
          devices: [],
          startedAt: expect.any(String),
          endedAt: expect.any(String),
          startNotificationId: expect.any(String),
          endNotificationId: expect.any(String),
          blockingConditions: [BlockingConditions.TIME],
        },
        {
          id: 'session-2',
          name: 'Afternoon Block',
          blocklists: [],
          devices: [],
          startedAt: expect.any(String),
          endedAt: expect.any(String),
          startNotificationId: expect.any(String),
          endNotificationId: expect.any(String),
          blockingConditions: [BlockingConditions.TIME],
        },
      ],
      sirens: mockSirens,
    })
  })

  it.skip('should handle empty data', async () => {
    const emptySirens: Sirens = {
      android: [],
      windows: [],
      macos: [],
      ios: [],
      linux: [],
      websites: [],
      keywords: [],
    }

    // Setup empty mock data
    fixture.given.blocklists([])
    fixture.given.blockSessions([])
    fixture.given.sirens(emptySirens)

    // Perform the action
    await fixture.when.loadInitialData()

    // Verify empty results
    fixture.then.initialDataShouldBeLoaded({
      blocklists: [],
      blockSessions: [],
      sirens: emptySirens,
    })
  })
})
