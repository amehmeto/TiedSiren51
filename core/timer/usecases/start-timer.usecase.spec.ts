import { beforeEach, describe, it } from 'vitest'
import { TimeUnit } from '@/core/timer/timer.utils'
import { timerFixture } from './timer.fixture'

describe('startTimer use case', () => {
  let fixture: ReturnType<typeof timerFixture>

  beforeEach(() => {
    fixture = timerFixture()
  })

  it('should start a timer with given duration', async () => {
    fixture.given.authenticatedUser()

    const nowMs = fixture.dateProvider.getNowMs()
    const durationMs = TimeUnit.HOUR + TimeUnit.MINUTE * 30

    await fixture.when.startingTimer({
      days: 0,
      hours: 1,
      minutes: 30,
    })

    fixture.then.timerShouldBeStoredAs(
      fixture.dateProvider.msToISOString(nowMs + durationMs),
    )
  })

  it.each([
    {
      description: 'duration is zero',
      payload: { days: 0, hours: 0, minutes: 0 },
    },
    {
      description: 'duration is negative',
      payload: { days: -1, hours: 0, minutes: 0 },
    },
  ])('should reject when $description', async ({ payload }) => {
    fixture.given.authenticatedUser()

    const action = await fixture.when.startingTimer(payload)

    fixture.then.actionShouldBeRejectedWith(action, 'Invalid timer duration')
  })

  it('should reject when user is not authenticated', async () => {
    const action = await fixture.when.startingTimer({
      days: 0,
      hours: 1,
      minutes: 0,
    })

    fixture.then.actionShouldBeRejectedWith(action, 'User not authenticated')
  })

  it('should reject when duration exceeds 30 days', async () => {
    fixture.given.authenticatedUser()

    const action = await fixture.when.startingTimer({
      days: 31,
      hours: 0,
      minutes: 0,
    })

    fixture.then.actionShouldBeRejectedWith(
      action,
      'Timer duration exceeds maximum allowed (30 days)',
    )
  })

  it('should replace existing timer when starting a new one', async () => {
    fixture.given.authenticatedUser()

    const nowMs = fixture.dateProvider.getNowMs()
    fixture.given.existingTimer(
      fixture.dateProvider.msToISOString(nowMs + TimeUnit.HOUR),
    )

    const durationMs = TimeUnit.MINUTE * 30
    await fixture.when.startingTimer({
      days: 0,
      hours: 0,
      minutes: 30,
    })

    fixture.then.timerShouldBeStoredAs(
      fixture.dateProvider.msToISOString(nowMs + durationMs),
    )
  })
})
