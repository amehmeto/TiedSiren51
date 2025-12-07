import { beforeEach, describe, expect, test } from 'vitest'
import { DAY, HOUR, MINUTE, SECOND } from '@/core/__constants__/time'
import { ISODateString } from '@/core/_ports_/port.date-provider'
import { PreloadedState } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import {
  selectStrictModeViewModel,
  StrictModeViewState,
} from './strict-mode.view-model'

const NOW = new Date('2024-01-01T10:00:00.000Z')
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

  test.each([
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
      stateBuilder()
        .withStrictModeEndedAt(
          endedAtFromNow(1 * HOUR + 30 * MINUTE + 45 * SECOND),
        )
        .build(),
      {
        type: StrictModeViewState.Active,
        countdown: '1h 30m 45s',
        endDateTime: expect.stringMatching(
          /^Ends \d+\/\d+, \d+:\d+ [ap]\.m\.$/,
        ),
        inlineRemaining: '1h 30m 45s',
        statusMessage: 'Your blockings are locked against any\nbypassing.',
        buttonText: 'Extend Timer',
      },
    ],
    [
      'timer with days, hours, minutes, and seconds',
      stateBuilder()
        .withStrictModeEndedAt(
          endedAtFromNow(2 * DAY + 5 * HOUR + 30 * MINUTE + 15 * SECOND),
        )
        .build(),
      {
        type: StrictModeViewState.Active,
        countdown: '2d 5h 30m 15s',
        endDateTime: expect.stringMatching(
          /^Ends \d+\/\d+, \d+:\d+ [ap]\.m\.$/,
        ),
        inlineRemaining: '2d 5h 30m 15s',
        statusMessage: 'Your blockings are locked against any\nbypassing.',
        buttonText: 'Extend Timer',
      },
    ],
    [
      'timer with only minutes and seconds',
      stateBuilder()
        .withStrictModeEndedAt(endedAtFromNow(45 * MINUTE + 30 * SECOND))
        .build(),
      {
        type: StrictModeViewState.Active,
        countdown: '45m 30s',
        endDateTime: expect.stringMatching(
          /^Ends \d+\/\d+, \d+:\d+ [ap]\.m\.$/,
        ),
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
        endDateTime: expect.stringMatching(
          /^Ends \d+\/\d+, \d+:\d+ [ap]\.m\.$/,
        ),
        inlineRemaining: '30s',
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
