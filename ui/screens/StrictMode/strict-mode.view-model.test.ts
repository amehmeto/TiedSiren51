import { beforeEach, describe, expect, test } from 'vitest'
import { DAY, HOUR, MINUTE, SECOND } from '@/core/__constants__/time'
import { ISODateString } from '@/core/_ports_/date-provider'
import { PreloadedState } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import {
  selectStrictModeViewModel,
  StrictModeViewModel,
  StrictModeViewState,
} from './strict-mode.view-model'

const NOW = new Date(2024, 0, 1, 10, 0, 0, 0)
const NOW_MS = NOW.getTime()

function endedAtFromNow(offsetMs: number): ISODateString {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Date.toISOString() always returns valid ISO format
  return new Date(NOW_MS + offsetMs).toISOString() as ISODateString
}

describe('selectStrictModeViewModel', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    dateProvider.now = NOW
  })

  test.each<[string, PreloadedState, StrictModeViewModel]>([
    [
      'no timer is set',
      stateBuilder().withStrictModeEndedAt(null).build(),
      {
        type: StrictModeViewState.Inactive,
        countdown: '0h 0m 0s',
        statusMessage: 'Set a timer to activate strict mode',
        buttonText: 'Start Timer',
      },
    ],
    [
      'timer with hours, minutes, and seconds',
      (() => {
        const hoursMinutesSeconds = 1 * HOUR + 30 * MINUTE + 45 * SECOND
        return stateBuilder()
          .withStrictModeEndedAt(endedAtFromNow(hoursMinutesSeconds))
          .build()
      })(),
      {
        type: StrictModeViewState.Active,
        countdown: '1h 30m 45s',
        endDateTime: 'Ends 1/1, 11:30 a.m.',
        inlineRemaining: '1h 30m 45s',
        statusMessage: 'Your blockings are locked against any\nbypassing.',
        buttonText: 'Extend Timer',
      },
    ],
    [
      'timer with days, hours, minutes, and seconds',
      (() => {
        const daysHoursMinutesSeconds =
          2 * DAY + 5 * HOUR + 30 * MINUTE + 15 * SECOND
        return stateBuilder()
          .withStrictModeEndedAt(endedAtFromNow(daysHoursMinutesSeconds))
          .build()
      })(),
      {
        type: StrictModeViewState.Active,
        countdown: '2d 5h 30m 15s',
        endDateTime: 'Ends 3/1, 3:30 p.m.',
        inlineRemaining: '2d 5h 30m 15s',
        statusMessage: 'Your blockings are locked against any\nbypassing.',
        buttonText: 'Extend Timer',
      },
    ],
    [
      'timer with only minutes and seconds',
      (() => {
        const minutesSeconds = 45 * MINUTE + 30 * SECOND
        return stateBuilder()
          .withStrictModeEndedAt(endedAtFromNow(minutesSeconds))
          .build()
      })(),
      {
        type: StrictModeViewState.Active,
        countdown: '45m 30s',
        endDateTime: 'Ends 1/1, 10:45 a.m.',
        inlineRemaining: '45m 30s',
        statusMessage: 'Your blockings are locked against any\nbypassing.',
        buttonText: 'Extend Timer',
      },
    ],
    [
      'timer with only seconds remaining',
      stateBuilder()
        .withStrictModeEndedAt(endedAtFromNow(30 * SECOND))
        .build(),
      {
        type: StrictModeViewState.Active,
        countdown: '30s',
        endDateTime: 'Ends 1/1, 10:00 a.m.',
        inlineRemaining: '30s',
        statusMessage: 'Your blockings are locked against any\nbypassing.',
        buttonText: 'Extend Timer',
      },
    ],
    [
      'timer ending at noon (12:00)',
      stateBuilder()
        .withStrictModeEndedAt(endedAtFromNow(2 * HOUR))
        .build(),
      {
        type: StrictModeViewState.Active,
        countdown: '2h 0m 0s',
        endDateTime: 'Ends 1/1, 12:00 p.m.',
        inlineRemaining: '2h 0m 0s',
        statusMessage: 'Your blockings are locked against any\nbypassing.',
        buttonText: 'Extend Timer',
      },
    ],
  ])('Example: %s', (_, preloadedState: PreloadedState, expectedViewModel) => {
    const store = createTestStore({ dateProvider }, preloadedState)

    const viewModel = selectStrictModeViewModel(store.getState(), dateProvider)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })
})
