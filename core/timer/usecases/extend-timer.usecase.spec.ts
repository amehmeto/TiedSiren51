import { beforeEach, describe, it } from 'vitest'
import { TimeUnit } from '@/core/timer/timer.utils'
import { timerFixture } from './timer.fixture'

describe('extendTimer use case', () => {
  let fixture: ReturnType<typeof timerFixture>

  beforeEach(() => {
    fixture = timerFixture()
  })

  it('should extend an active timer', async () => {
    const nowMs = fixture.dateProvider.getNowMs()

    const initialDuration = TimeUnit.HOUR
    const extensionDuration = TimeUnit.MINUTE * 30
    const initialEndAtMs = nowMs + initialDuration

    fixture.given.existingTimer(
      fixture.dateProvider.msToISOString(initialEndAtMs),
    )

    await fixture.when.extendingTimer({
      days: 0,
      hours: 0,
      minutes: 30,
    })

    fixture.then.timerShouldBeStoredAs(
      fixture.dateProvider.msToISOString(initialEndAtMs + extensionDuration),
    )
  })

  it.each([
    {
      description: 'no active timer exists',
      setup: () => {
        fixture.given.noTimer()
      },
    },
    {
      description: 'timer has expired',
      setup: () => {
        const nowMs = fixture.dateProvider.getNowMs()
        fixture.given.existingTimer(
          fixture.dateProvider.msToISOString(nowMs - 1000),
        )
      },
    },
  ])('should reject when $description', async ({ setup }) => {
    setup()

    const action = await fixture.when.extendingTimer({
      days: 0,
      hours: 0,
      minutes: 30,
    })

    fixture.then.actionShouldBeRejectedWith(action, 'No active timer to extend')
  })

  it('should reject when user is not authenticated', async () => {
    const action = await fixture.when.extendingTimer({
      days: 0,
      hours: 0,
      minutes: 30,
    })

    fixture.then.actionShouldBeRejectedWith(action, 'User not authenticated')
  })

  it('should reject when extended duration exceeds 30 days', async () => {
    const nowMs = fixture.dateProvider.getNowMs()
    const nearLimitDuration = 30 * TimeUnit.DAY - TimeUnit.HOUR

    fixture.given.existingTimer(
      fixture.dateProvider.msToISOString(nowMs + nearLimitDuration),
    )

    const action = await fixture.when.extendingTimer({
      days: 0,
      hours: 2,
      minutes: 0,
    })

    fixture.then.actionShouldBeRejectedWith(
      action,
      'Extended timer duration exceeds maximum allowed (30 days)',
    )
  })
})
