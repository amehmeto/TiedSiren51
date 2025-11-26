import { beforeEach, describe, it } from 'vitest'
import { buildTimer } from '@/core/_tests_/data-builders/timer.builder'
import { TimeUnit } from '@/core/timer/timer.utils'
import { timerFixture } from './timer.fixture'

describe('extendAtr use case', () => {
  let fixture: ReturnType<typeof timerFixture>

  beforeEach(() => {
    fixture = timerFixture()
  })

  it('should extend an active timer', async () => {
    const now = fixture.dateProvider.getNow().getTime()

    const initialDuration = TimeUnit.HOUR
    const extensionDuration = TimeUnit.MINUTE * 30

    fixture.given.existingTimer(buildTimer({ endAt: now + initialDuration }))

    await fixture.when.extendingTimer({
      days: 0,
      hours: 0,
      minutes: 30,
      now,
    })

    fixture.then.timerShouldBeStoredAs({
      endAt: now + initialDuration + extensionDuration,
    })
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
        const now = fixture.dateProvider.getNow().getTime()
        fixture.given.existingTimer(buildTimer({ endAt: now - 1000 }))
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
    const now = fixture.dateProvider.getNow().getTime()
    const nearLimitDuration = 30 * TimeUnit.DAY - TimeUnit.HOUR

    fixture.given.existingTimer(buildTimer({ endAt: now + nearLimitDuration }))

    const action = await fixture.when.extendingTimer({
      days: 0,
      hours: 2,
      minutes: 0,
      now,
    })

    fixture.then.actionShouldBeRejectedWith(
      action,
      'Extended timer duration exceeds maximum allowed (30 days)',
    )
  })
})
