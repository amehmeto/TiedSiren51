import { beforeEach, describe, it } from 'vitest'
import { buildTimer } from '@/core/_tests_/data-builders/timer.builder'
import { TimeUnit } from '@/core/timer/timer.utils'
import { timerFixture } from './timer.fixture'

describe('startTimer use case', () => {
  let fixture: ReturnType<typeof timerFixture>

  beforeEach(() => {
    fixture = timerFixture()
  })

  it('should start a timer with given duration', async () => {
    fixture.given.authenticatedUser()

    const now = fixture.dateProvider.getNow().getTime()

    const expectedDuration = TimeUnit.HOUR + TimeUnit.MINUTE * 30

    await fixture.when.startingTimer({
      days: 0,
      hours: 1,
      minutes: 30,
      now,
    })

    fixture.then.timerShouldBeStoredAs({
      endTime: now + expectedDuration,
      duration: expectedDuration,
      isActive: true,
    })
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

    const now = fixture.dateProvider.getNow().getTime()

    fixture.given.existingTimer(buildTimer({}))

    const newDuration = TimeUnit.MINUTE * 30
    await fixture.when.startingTimer({
      days: 0,
      hours: 0,
      minutes: 30,
      now,
    })

    fixture.then.timerShouldBeStoredAs({
      endTime: now + newDuration,
      duration: newDuration,
      isActive: true,
    })
  })
})
