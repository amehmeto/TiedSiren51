import { beforeEach, describe, it } from 'vitest'
import { StartTimerPayload } from './start-timer.usecase'
import { timerFixture } from './timer.fixture'

describe('startTimer use case', () => {
  let fixture: ReturnType<typeof timerFixture>

  beforeEach(() => {
    fixture = timerFixture()
  })

  it('should start a timer with given duration', async () => {
    fixture.given.authenticatedUser()

    await fixture.when.startingTimer({ hours: 1, minutes: 30 })

    fixture.then.timerShouldBeStoredAs('2024-01-01T01:30:00.000Z')
  })

  it('should replace existing timer when starting a new one', async () => {
    fixture.given.authenticatedUser()
    fixture.given.existingTimer('2024-01-01T01:00:00.000Z')

    await fixture.when.startingTimer({ minutes: 30 })

    fixture.then.timerShouldBeStoredAs('2024-01-01T00:30:00.000Z')
  })

  type StartTimerErrorCase = {
    scenario: string
    given: () => void
    payload: StartTimerPayload
    expectedError: string
  }

  it.each<StartTimerErrorCase>([
    {
      scenario: 'duration is zero',
      given: () => fixture.given.authenticatedUser(),
      payload: {},
      expectedError: 'Invalid timer duration',
    },
    {
      scenario: 'duration is negative',
      given: () => fixture.given.authenticatedUser(),
      payload: { days: -1 },
      expectedError: 'Invalid timer duration',
    },
    {
      scenario: 'duration exceeds 30 days',
      given: () => fixture.given.authenticatedUser(),
      payload: { days: 31 },
      expectedError: 'Timer duration exceeds maximum allowed (30 days)',
    },
    {
      scenario: 'user is not authenticated',
      given: () => {},
      payload: { hours: 1 },
      expectedError: 'User not authenticated',
    },
  ])(
    'should reject when $scenario',
    async ({ given, payload, expectedError }) => {
      given()

      const action = await fixture.when.startingTimer(payload)

      fixture.then.actionShouldBeRejectedWith(action, expectedError)
    },
  )
})
