import { beforeEach, describe, expect, it, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { PreloadedState } from '@/core/_redux_/createStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'

import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import {
  Greetings,
  HomeViewModel,
  SessionBoardMessage,
  SessionBoardTitle,
} from '@/ui/screens/Home/HomeScreen/home-view-model.types'
import { selectHomeViewModel } from '@/ui/screens/Home/HomeScreen/home.view-model'

describe('Home View Model', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
  })

  test.each([
    [
      'no session',
      {},
      {
        type: HomeViewModel.WithoutActiveNorScheduledSessions,
        greetings: Greetings.GoodAfternoon,
        activeSessions: {
          title: SessionBoardTitle.NO_ACTIVE_SESSIONS,
          message: SessionBoardMessage.NO_ACTIVE_SESSIONS,
        },
        scheduledSessions: {
          title: SessionBoardTitle.NO_SCHEDULED_SESSIONS,
          message: SessionBoardMessage.NO_SCHEDULED_SESSIONS,
        },
      },
    ],

    [
      'one active session',
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            id: 'block-session-id',
            name: 'Sleeping time',
            startedAt: '03:38',
            endedAt: '13:58',
          }),
        ])
        .build(),
      {
        type: HomeViewModel.WithActiveWithoutScheduledSessions,
        greetings: Greetings.GoodAfternoon,
        activeSessions: {
          title: 'ACTIVE SESSIONS',
          blockSessions: [
            {
              id: 'block-session-id',
              name: 'Sleeping time',
              minutesLeft: 'Ends in 10 minutes',
              blocklists: 1,
              devices: 2,
            },
          ],
        },
        scheduledSessions: {
          title: SessionBoardTitle.NO_SCHEDULED_SESSIONS,
          message: SessionBoardMessage.NO_SCHEDULED_SESSIONS,
        },
      },
    ],

    [
      'one active session',
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            id: 'block-session-id',
            name: 'Sleeping time',
            startedAt: '03:48',
            endedAt: '14:58',
          }),
        ])
        .build(),
      {
        type: HomeViewModel.WithActiveWithoutScheduledSessions,
        greetings: Greetings.GoodAfternoon,
        activeSessions: {
          title: 'ACTIVE SESSIONS',
          blockSessions: [
            {
              id: 'block-session-id',
              name: 'Sleeping time',
              minutesLeft: 'Ends in about 1 hour',
              blocklists: 1,
              devices: 2,
            },
          ],
        },
        scheduledSessions: {
          title: SessionBoardTitle.NO_SCHEDULED_SESSIONS,
          message: SessionBoardMessage.NO_SCHEDULED_SESSIONS,
        },
      },
    ],

    [
      'one active session that has just started',
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            id: 'block-session-id',
            name: 'Sleeping time',
            startedAt: '13:48',
            endedAt: '14:58',
          }),
        ])
        .build(),
      {
        type: HomeViewModel.WithActiveWithoutScheduledSessions,
        greetings: Greetings.GoodAfternoon,
        activeSessions: {
          title: 'ACTIVE SESSIONS',
          blockSessions: [
            {
              id: 'block-session-id',
              name: 'Sleeping time',
              minutesLeft: 'Ends in about 1 hour',
              blocklists: 1,
              devices: 2,
            },
          ],
        },
        scheduledSessions: {
          title: SessionBoardTitle.NO_SCHEDULED_SESSIONS,
          message: SessionBoardMessage.NO_SCHEDULED_SESSIONS,
        },
      },
    ],

    [
      'one active session that has started the day before',
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            id: 'block-session-id',
            name: 'Sleeping time',
            startedAt: '22:00',
            endedAt: '17:00',
          }),
        ])
        .build(),
      {
        type: HomeViewModel.WithActiveWithoutScheduledSessions,
        greetings: Greetings.GoodAfternoon,
        activeSessions: {
          title: 'ACTIVE SESSIONS',
          blockSessions: [
            {
              id: 'block-session-id',
              name: 'Sleeping time',
              minutesLeft: 'Ends in about 3 hours',
              blocklists: 1,
              devices: 2,
            },
          ],
        },
        scheduledSessions: {
          title: SessionBoardTitle.NO_SCHEDULED_SESSIONS,
          message: SessionBoardMessage.NO_SCHEDULED_SESSIONS,
        },
      },
    ],

    [
      'two sessions',
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            id: 'block-session-id-1',
            name: 'Sleeping time',
            startedAt: '10:48',
            endedAt: '13:58',
          }),
          buildBlockSession({
            id: 'block-session-id-2',
            name: 'Working time',
            startedAt: '10:48',
            endedAt: '17:58',
          }),
        ])
        .build(),
      {
        type: HomeViewModel.WithActiveWithoutScheduledSessions,
        greetings: Greetings.GoodAfternoon,
        activeSessions: {
          title: 'ACTIVE SESSIONS',
          blockSessions: [
            {
              id: 'block-session-id-1',
              name: 'Sleeping time',
              minutesLeft: 'Ends in 10 minutes',
              blocklists: 1,
              devices: 2,
            },
            {
              id: 'block-session-id-2',
              name: 'Working time',
              minutesLeft: 'Ends in about 4 hours',
              blocklists: 1,
              devices: 2,
            },
          ],
        },
        scheduledSessions: {
          title: SessionBoardTitle.NO_SCHEDULED_SESSIONS,
          message: SessionBoardMessage.NO_SCHEDULED_SESSIONS,
        },
      },
    ],

    [
      'one scheduled session and 0 active session',
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            id: 'block-session-id-1',
            name: 'Sleeping time',
            startedAt: '13:50',
            endedAt: '13:58',
          }),
        ])
        .build(),
      {
        type: HomeViewModel.WithoutActiveWithScheduledSessions,
        greetings: Greetings.GoodAfternoon,
        activeSessions: {
          title: SessionBoardTitle.NO_ACTIVE_SESSIONS,
          message: SessionBoardMessage.NO_ACTIVE_SESSIONS,
        },
        scheduledSessions: {
          title: SessionBoardTitle.SCHEDULED_SESSIONS,
          blockSessions: [
            {
              id: 'block-session-id-1',
              name: 'Sleeping time',
              minutesLeft: 'Starts at 13:50',
              blocklists: 1,
              devices: 2,
            },
          ],
        },
      },
    ],

    [
      'one scheduled session and 1 active session',
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            id: 'block-session-id-1',
            name: 'Sleeping time',
            startedAt: '13:50',
            endedAt: '13:58',
          }),
          buildBlockSession({
            id: 'block-session-id-2',
            name: 'Working time',
            startedAt: '10:48',
            endedAt: '13:58',
          }),
        ])
        .build(),
      {
        type: HomeViewModel.WithActiveAndScheduledSessions,
        greetings: Greetings.GoodAfternoon,
        activeSessions: {
          title: 'ACTIVE SESSIONS',
          blockSessions: [
            {
              id: 'block-session-id-2',
              name: 'Working time',
              minutesLeft: 'Ends in 10 minutes',
              blocklists: 1,
              devices: 2,
            },
          ],
        },
        scheduledSessions: {
          title: 'SCHEDULED SESSIONS',
          blockSessions: [
            {
              id: 'block-session-id-1',
              name: 'Sleeping time',
              minutesLeft: 'Starts at 13:50',
              blocklists: 1,
              devices: 2,
            },
          ],
        },
      },
    ],
  ])(
    'Example: there is %s',
    (_, preloadedState: PreloadedState, expectedViewModel) => {
      const store = createTestStore({}, preloadedState)
      const now = new Date()
      now.setUTCHours(13, 48, 0, 0)
      dateProvider.now = now

      const homeViewModel = selectHomeViewModel(
        store.getState(),
        now,
        dateProvider,
      )

      expect(homeViewModel).toStrictEqual(expectedViewModel)
    },
  )

  it.each([
    [Greetings.GoodMorning, 'from 06:00 to 11:59', '06:00'],
    [Greetings.GoodMorning, 'from 06 to 11:59', '08:50'],
    [Greetings.GoodMorning, 'from 06 to 11:59', '11:59'],
    [Greetings.GoodAfternoon, 'from 12 to 17:59', '12:00'],
    [Greetings.GoodAfternoon, 'from 12 to 17:59', '13:50'],
    [Greetings.GoodAfternoon, 'from 12 to 17:59', '17:59'],
    [Greetings.GoodEvening, 'from 18 to 21:59', '18:00'],
    [Greetings.GoodEvening, 'from 18 to 21:59', '21:00'],
    [Greetings.GoodEvening, 'from 18 to 21:59', '21:59'],
    [Greetings.GoodNight, 'from 22 to 06', '22:50'],
    [Greetings.GoodNight, 'from 22 to 06', '00:50'],
    [Greetings.GoodNight, 'from 22 to 06', '04:50'],
    [Greetings.GoodNight, 'from 22 to 06', '05:59'],
  ])(
    'should greet the user with %s %s',
    (expectedGreetings: Greetings, _, nowHHmm: string) => {
      const store = createTestStore(
        {
          dateProvider,
        },
        {},
      )
      const [hours, minutes] = nowHHmm.split(':').map(Number)
      const now = new Date()
      now.setHours(hours, minutes)
      dateProvider.now = now

      const homeViewModel = selectHomeViewModel(
        store.getState(),
        now,
        dateProvider,
      )

      expect(homeViewModel.greetings).toStrictEqual(expectedGreetings)
    },
  )
})
