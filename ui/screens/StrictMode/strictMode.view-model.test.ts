import { describe, expect, test, beforeEach } from 'vitest'
import { DAY, HOUR, MINUTE, SECOND } from '@/core/__constants__/time'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import {
  selectStrictModeViewModel,
  StrictModeViewState,
} from './strictMode.view-model'

describe('selectStrictModeViewModel', () => {
  let dateProvider: StubDateProvider
  let nowMs: number

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2024-01-01T10:00:00.000Z')
    nowMs = dateProvider.getNow().getTime()
  })

  describe('Inactive state', () => {
    test('should return inactive view model when no timer is set', () => {
      const store = createTestStore(
        { dateProvider },
        stateBuilder().withTimerEndAt(null).build(),
      )

      const viewModel = selectStrictModeViewModel(
        store.getState(),
        dateProvider,
      )

      expect(viewModel).toEqual({
        type: StrictModeViewState.Inactive,
        countdown: '0h 0m 0s',
        statusMessage: 'Set a timer to activate strict mode',
        buttonText: 'Start Timer',
      })
    })
  })

  describe('Active state', () => {
    test('should return active view model with formatted countdown', () => {
      const endAt = dateProvider.msToISOString(
        nowMs + 1 * HOUR + 30 * MINUTE + 45 * SECOND,
      )
      const store = createTestStore(
        { dateProvider },
        stateBuilder().withTimerEndAt(endAt).build(),
      )

      const viewModel = selectStrictModeViewModel(
        store.getState(),
        dateProvider,
      )

      expect(viewModel).toEqual({
        type: StrictModeViewState.Active,
        countdown: '1h 30m 45s',
        endDateTime: expect.any(String),
        inlineRemaining: '1h 30m 45s',
        statusMessage: 'Your blockings are locked against any\nbypassing.',
        buttonText: 'Extend Timer',
      })
    })

    test('should include days in countdown when timer has days', () => {
      const endAt = dateProvider.msToISOString(
        nowMs + 2 * DAY + 5 * HOUR + 30 * MINUTE + 15 * SECOND,
      )
      const store = createTestStore(
        { dateProvider },
        stateBuilder().withTimerEndAt(endAt).build(),
      )

      const viewModel = selectStrictModeViewModel(
        store.getState(),
        dateProvider,
      )

      expect(viewModel).toMatchObject({
        type: StrictModeViewState.Active,
        countdown: '2d 5h 30m 15s',
      })
    })

    test('should format endDateTime with Ends prefix', () => {
      const endAt = dateProvider.msToISOString(nowMs + 2 * HOUR + 30 * MINUTE)
      const store = createTestStore(
        { dateProvider },
        stateBuilder().withTimerEndAt(endAt).build(),
      )

      const viewModel = selectStrictModeViewModel(
        store.getState(),
        dateProvider,
      )

      expect(viewModel.type).toBe(StrictModeViewState.Active)
      expect(viewModel).toMatchObject({
        endDateTime: expect.stringMatching(
          /^Ends \d+\/\d+, \d+:\d+ [ap]\.m\.$/,
        ),
      })
    })
  })
})
