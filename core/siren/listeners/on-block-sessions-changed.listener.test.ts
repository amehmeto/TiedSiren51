import { describe, expect, it } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { setBlockSessions } from '@/core/block-session/block-session.slice'
import { BlockSession } from '@/core/block-session/block.session'
import { FakeSirenLookout } from '@/infra/siren-tier/fake.siren-lookout'

describe('onBlockSessionsChanged listener', () => {
  const blockSession: BlockSession = {
    id: 'session-1',
    name: 'Work Focus',
    startedAt: '09:00',
    endedAt: '17:00',
    devices: [],
    startNotificationId: 'notif-start-1',
    endNotificationId: 'notif-end-1',
    blockingConditions: [],
    blocklists: [
      {
        id: 'blocklist-1',
        name: 'Social Media',
        sirens: {
          android: [
            {
              packageName: 'com.facebook.katana',
              appName: 'Facebook',
              icon: 'icon',
            },
          ],
          ios: [],
          windows: [],
          macos: [],
          linux: [],
          websites: [],
          keywords: [],
        },
      },
    ],
  }

  it('should start watching when block sessions are added', () => {
    const sirenLookout = new FakeSirenLookout()
    createTestStore({ sirenLookout })

    expect(sirenLookout.isWatching()).toBe(false)
  })

  it('should start watching when store is created with existing sessions', () => {
    const sirenLookout = new FakeSirenLookout()
    const initialState = stateBuilder()
      .withBlockSessions([blockSession])
      .build()

    createTestStore({ sirenLookout }, initialState)

    expect(sirenLookout.isWatching()).toBe(true)
    expect(sirenLookout.sirens?.android).toHaveLength(1)
    expect(sirenLookout.sirens?.android[0].packageName).toBe(
      'com.facebook.katana',
    )
  })

  it('should start watching when sessions are added to store', () => {
    const sirenLookout = new FakeSirenLookout()
    const store = createTestStore({ sirenLookout })

    expect(sirenLookout.isWatching()).toBe(false)

    store.dispatch(setBlockSessions([blockSession]))

    expect(sirenLookout.isWatching()).toBe(true)
  })

  it('should stop watching when all sessions are removed', () => {
    const sirenLookout = new FakeSirenLookout()
    const initialState = stateBuilder()
      .withBlockSessions([blockSession])
      .build()
    const store = createTestStore({ sirenLookout }, initialState)

    expect(sirenLookout.isWatching()).toBe(true)

    store.dispatch(setBlockSessions([]))

    expect(sirenLookout.isWatching()).toBe(false)
  })

  it('should update watched sirens when sessions change', () => {
    const sirenLookout = new FakeSirenLookout()
    const initialState = stateBuilder()
      .withBlockSessions([blockSession])
      .build()
    const store = createTestStore({ sirenLookout }, initialState)

    const newSession: BlockSession = {
      id: 'session-2',
      name: 'Evening Focus',
      startedAt: '18:00',
      endedAt: '22:00',
      devices: [],
      startNotificationId: 'notif-start-2',
      endNotificationId: 'notif-end-2',
      blockingConditions: [],
      blocklists: [
        {
          id: 'blocklist-2',
          name: 'Games',
          sirens: {
            android: [
              {
                packageName: 'com.supercell.clashofclans',
                appName: 'Clash of Clans',
                icon: 'icon',
              },
            ],
            ios: [],
            windows: [],
            macos: [],
            linux: [],
            websites: [],
            keywords: [],
          },
        },
      ],
    }

    store.dispatch(setBlockSessions([blockSession, newSession]))

    expect(sirenLookout.sirens?.android).toHaveLength(2)
  })
})
