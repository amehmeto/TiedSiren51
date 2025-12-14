import { beforeEach, describe, it } from 'vitest'
import { ExtendTimerPayload } from './extend-timer.usecase'
import { timerFixture } from './timer.fixture'

describe('extendTimer use case', () => {
  let fixture: ReturnType<typeof timerFixture>

  beforeEach(() => {
    fixture = timerFixture()
  })

  it('should extend an active timer', async () => {
    fixture.given.existingTimer('2024-01-01T01:00:00.000Z')

    await fixture.when.extendingTimerOf({ minutes: 30 })

    fixture.then.timerShouldBeStoredAs('2024-01-01T01:30:00.000Z')
  })

  it.each<{
    scenario: string
    given: () => void
    payload: ExtendTimerPayload
    expectedError: string
  }>([
    {
      scenario: 'no active timer exists',
      given: () => fixture.given.noTimer(),
      payload: { minutes: 30 },
      expectedError: 'No active timer to extend',
    },
    {
      scenario: 'timer has expired',
      given: () => fixture.given.existingTimer('2023-12-31T23:59:59.000Z'),
      payload: { minutes: 30 },
      expectedError: 'No active timer to extend',
    },
    {
      scenario: 'extension duration is zero',
      given: () => fixture.given.existingTimer('2024-01-01T01:00:00.000Z'),
      payload: { minutes: 0 },
      expectedError: 'Invalid extension duration',
    },
    {
      scenario: 'extended duration exceeds 30 days',
      given: () => fixture.given.existingTimer('2024-01-30T23:00:00.000Z'),
      payload: { hours: 2 },
      expectedError:
        'Extended timer duration exceeds maximum allowed (30 days)',
    },
  ])(
    'should reject when $scenario',
    async ({ given, payload, expectedError }) => {
      given()

      const action = await fixture.when.extendingTimerOf(payload)

      fixture.then.actionShouldBeRejectedWith(action, expectedError)
    },
  )

  it('should reject when user is not authenticated', async () => {
    const action = await fixture.when.extendingTimerOf({ minutes: 30 })

    fixture.then.actionShouldBeRejectedWith(action, 'User not authenticated')
  })
})
